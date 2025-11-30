import sql, { ConnectionPool, config as SqlConfig } from "mssql";

interface PoolEntry {
  pool: ConnectionPool;
  lastUsed: number;
  createdAt: number;
}

interface PoolOptions {
  maxEntries: number; // How many distinct pool keys to keep
  idleTimeoutMs: number; // If a pool hasn't been used for this long, evict
  enableAutoCleanup: boolean; // Whether to run cleanup during getPool
  retryAttempts: number; // number of times to retry connecting to DB
  retryDelayMs: number; // initial delay before retry, ms
  retryBackoffFactor: number; // multiplier for exponential backoff
  retryJitter: number; // jitter factor: 0.0 - 1.0; adds randomness
  autoCleanupIntervalMs: number; // how often to run background cleanup when enabled
}

const DEFAULT_POOL_OPTIONS: PoolOptions = {
  maxEntries: 100,
  idleTimeoutMs: 1000 * 60 * 10, // 10 minutes
  enableAutoCleanup: true,
  retryAttempts: 3,
  retryDelayMs: 1000,
  retryBackoffFactor: 2,
  retryJitter: 0.3,
  autoCleanupIntervalMs: 60 * 1000, // run cleanup every 1 minute by default
};

declare global {
  var __DB_POOL_CACHE__:
    | {
        map: Map<string, PoolEntry>;
        options: PoolOptions;
        timer?: NodeJS.Timeout;
      }
    | undefined;
}

if (!global.__DB_POOL_CACHE__) {
  global.__DB_POOL_CACHE__ = {
    map: new Map<string, PoolEntry>(),
    options: { ...DEFAULT_POOL_OPTIONS },
  };
}

const poolCache = global.__DB_POOL_CACHE__!;

function getPoolKey(config: SqlConfig) {
  const server = (config.server as string) || "";
  const port = (config.port as number) || 1433;
  const database = config.database || "";
  const user = config.user || "";
  return `${user}@${server}:${port}/${database}`;
}

function now() {
  return Date.now();
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function closePoolEntry(key: string, entry: PoolEntry) {
  try {
    entry.pool.removeAllListeners();
  } catch (e) {
    console.warn("dbPool: remove listeners failed", e);
  }
  try {
    await entry.pool.close();
  } catch (e) {
    console.warn("dbPool: close failed", e);
  }
  if (poolCache.map.get(key) === entry) {
    poolCache.map.delete(key);
  }
}

function evictLRUIfNeeded() {
  const max = poolCache.options.maxEntries;
  while (poolCache.map.size > max) {
    // Map preserves insertion order, first key is LRU
    const firstKey = poolCache.map.keys().next().value as string | undefined;
    if (!firstKey) break;
    const entry = poolCache.map.get(firstKey);
    if (!entry) {
      poolCache.map.delete(firstKey);
      continue;
    }
    // Close and delete
    // Fire-and-forget
    closePoolEntry(firstKey, entry).catch((err) =>
      console.warn("dbPool: evict close failed", err)
    );
  }
}

function evictIdleEntries() {
  const idleTimeout = poolCache.options.idleTimeoutMs;
  if (!idleTimeout || idleTimeout <= 0) return;
  const cutoff = now() - idleTimeout;
  for (const [key, entry] of poolCache.map.entries()) {
    if (entry.lastUsed < cutoff) {
      // Fire-and-forget closing
      closePoolEntry(key, entry).catch((err) =>
        console.warn("dbPool: idle evict close failed", err)
      );
    }
  }
}

function cleanupIfNeeded() {
  if (!poolCache.options.enableAutoCleanup) return;
  evictIdleEntries();
  evictLRUIfNeeded();
}

export function setPoolOptions(options: Partial<PoolOptions>) {
  poolCache.options = { ...poolCache.options, ...options };
  // ensure sane values
  if (poolCache.options.maxEntries < 1) poolCache.options.maxEntries = 1;
  if (poolCache.options.idleTimeoutMs < 0)
    poolCache.options.idleTimeoutMs = DEFAULT_POOL_OPTIONS.idleTimeoutMs;
  if (poolCache.options.retryAttempts < 1)
    poolCache.options.retryAttempts = DEFAULT_POOL_OPTIONS.retryAttempts;
  if (poolCache.options.retryDelayMs < 1)
    poolCache.options.retryDelayMs = DEFAULT_POOL_OPTIONS.retryDelayMs;
  if (poolCache.options.retryBackoffFactor < 1)
    poolCache.options.retryBackoffFactor =
      DEFAULT_POOL_OPTIONS.retryBackoffFactor;
  if (poolCache.options.retryJitter < 0 || poolCache.options.retryJitter > 1)
    poolCache.options.retryJitter = DEFAULT_POOL_OPTIONS.retryJitter;
  if (options.autoCleanupIntervalMs !== undefined) {
    if (poolCache.timer) {
      // restart timer with new interval
      clearInterval(poolCache.timer);
      poolCache.timer = setInterval(
        () => cleanupIfNeeded(),
        poolCache.options.autoCleanupIntervalMs
      );
    }
  }
}

/**
 * Start a background cleanup loop (evict idle/LRU entries periodically)
 * If a loop is already running, it will be restarted with the new interval.
 */
export function startAutoCleanup(intervalMs?: number) {
  const ms = intervalMs ?? poolCache.options.autoCleanupIntervalMs;
  if (poolCache.timer) clearInterval(poolCache.timer);
  poolCache.timer = setInterval(() => cleanupIfNeeded(), ms);
  poolCache.options.enableAutoCleanup = true;
}

/**
 * Stop the background cleanup loop if running. Auto cleanup can still occur
 * during explicit `getPool()` calls when `enableAutoCleanup` is true.
 */
export function stopAutoCleanup() {
  if (poolCache.timer) {
    clearInterval(poolCache.timer);
    delete poolCache.timer;
  }
  poolCache.options.enableAutoCleanup = false;
}

export function getPoolOptions(): PoolOptions {
  return { ...poolCache.options };
}

export async function getPool(sqlConfig: SqlConfig): Promise<ConnectionPool> {
  const key = getPoolKey(sqlConfig);

  // cleanup first
  cleanupIfNeeded();

  const existingEntry = poolCache.map.get(key);
  if (existingEntry) {
    if (existingEntry.pool.connected) {
      // update LRU by moving to end
      existingEntry.lastUsed = now();
      poolCache.map.delete(key);
      poolCache.map.set(key, existingEntry);
      return existingEntry.pool;
    }

    // offline pool: close and remove
    try {
      await existingEntry.pool.close();
    } catch (e) {
      console.warn("dbPool: error closing non-connected pool", e);
    }
    poolCache.map.delete(key);
  }

  // create and connect a new pool with retry logic
  let lastErr: unknown = undefined;
  const attempts = Math.max(1, Math.floor(poolCache.options.retryAttempts));
  const baseDelay = Math.max(1, Math.floor(poolCache.options.retryDelayMs));
  const backoff = Math.max(1, Number(poolCache.options.retryBackoffFactor));
  const jitterFactor = Math.max(
    0,
    Math.min(1, Number(poolCache.options.retryJitter))
  );

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // create a fresh pool instance each attempt to avoid reusing a broken one
    const pool = new sql.ConnectionPool(sqlConfig);
    try {
      await pool.connect();
      const entry: PoolEntry = {
        pool,
        lastUsed: now(),
        createdAt: now(),
      };
      poolCache.map.set(key, entry);
      // listen for unexpected errors
      pool.on("error", (err) => {
        console.error("DB Pool error:", err);
        // if this pool is still registered, remove & close
        const current = poolCache.map.get(key);
        if (current && current.pool === pool) {
          closePoolEntry(key, current).catch((e) =>
            console.warn("dbPool: error close on pool error event", e)
          );
        }
      });

      // Post-create cleanup
      cleanupIfNeeded();

      return pool;
    } catch (err) {
      // failed to connect
      lastErr = err;
      try {
        pool.removeAllListeners();
        await pool.close();
      } catch (err) {
        console.warn("dbPool: cleanup failed during retry close", err);
      }

      if (attempt < attempts) {
        // compute delay with exponential backoff + jitter
        let delay = Math.floor(baseDelay * Math.pow(backoff, attempt - 1));
        const jitter = Math.floor(delay * (Math.random() * jitterFactor));
        delay += jitter;
        console.warn(
          `dbPool: connect attempt ${attempt} failed, retrying after ${delay}ms`,
          err
        );
        await sleep(delay);
        // continue loop to retry
        continue;
      }
      // no more retries; rethrow
      throw lastErr;
    }
  }
  // If we get here, the for loop threw or returned; safety net: throw lastErr if set
  if (lastErr) throw lastErr;
  // fallback
  throw new Error("dbPool: failed to create or connect to pool");
}

export async function closeAllPools() {
  const entries = Array.from(poolCache.map.entries());
  for (const [k, entry] of entries) {
    await closePoolEntry(k, entry).catch((e) =>
      console.warn("dbPool.closeAllPools error", e)
    );
  }
}

export async function closePoolByKey(key: string) {
  const entry = poolCache.map.get(key);
  if (!entry) return; // nothing
  await closePoolEntry(key, entry);
}

export function listPoolKeys() {
  return Array.from(poolCache.map.keys());
}
