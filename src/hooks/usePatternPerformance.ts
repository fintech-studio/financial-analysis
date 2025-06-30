import { useState, useEffect, useRef } from "react";

interface PerformanceStats {
  patternCheckTime: number;
  historicalProcessingTime: number;
  totalPatterns: number;
  cacheHitRate: number;
}

export const usePatternPerformance = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    patternCheckTime: 0,
    historicalProcessingTime: 0,
    totalPatterns: 0,
    cacheHitRate: 0,
  });

  const startTimeRef = useRef<number>(0);
  const cacheHitsRef = useRef<number>(0);
  const cacheMissesRef = useRef<number>(0);

  const startTiming = () => {
    startTimeRef.current = performance.now();
  };

  const endTiming = (type: "pattern" | "historical") => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    setStats((prev) => ({
      ...prev,
      [type === "pattern" ? "patternCheckTime" : "historicalProcessingTime"]:
        duration,
    }));

    return duration;
  };

  const recordCacheHit = () => {
    cacheHitsRef.current++;
    updateCacheHitRate();
  };

  const recordCacheMiss = () => {
    cacheMissesRef.current++;
    updateCacheHitRate();
  };

  const updateCacheHitRate = () => {
    const total = cacheHitsRef.current + cacheMissesRef.current;
    const hitRate = total > 0 ? (cacheHitsRef.current / total) * 100 : 0;

    setStats((prev) => ({
      ...prev,
      cacheHitRate: hitRate,
    }));
  };

  const updatePatternStats = (totalPatterns: number) => {
    setStats((prev) => ({
      ...prev,
      totalPatterns,
    }));
  };

  const resetStats = () => {
    setStats({
      patternCheckTime: 0,
      historicalProcessingTime: 0,
      totalPatterns: 0,
      cacheHitRate: 0,
    });
    cacheHitsRef.current = 0;
    cacheMissesRef.current = 0;
  };

  return {
    stats,
    startTiming,
    endTiming,
    recordCacheHit,
    recordCacheMiss,
    updatePatternStats,
    resetStats,
  };
};

// 性能監控 Hook
export const usePerformanceMonitor = (enabled: boolean = false) => {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    memoryUsage?: number;
    componentUpdates: number;
  }>({
    renderTime: 0,
    memoryUsage: 0,
    componentUpdates: 0,
  });

  const renderStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();
    updateCountRef.current++;

    const measureRender = () => {
      const renderTime = performance.now() - renderStartRef.current;

      setMetrics((prev) => ({
        ...prev,
        renderTime,
        componentUpdates: updateCountRef.current,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      }));
    };

    // 使用 requestAnimationFrame 確保在渲染後測量
    const rafId = requestAnimationFrame(measureRender);

    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  return metrics;
};
