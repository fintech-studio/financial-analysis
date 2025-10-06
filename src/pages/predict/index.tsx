import React, { useState, useCallback, useMemo } from "react";
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ServerIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import Footer from "../../components/Layout/Footer";
import PredictionLineChart from "../../components/Charts/PredictChart";
import {
  DatabaseService,
  DatabaseConfig,
} from "../../services/DatabaseService";

interface PredictionData {
  mean: number[];
}

interface EvaluationData {
  true_value: number[];
  predict: number[];
  sim: number;
}

interface LineChartData {
  date: string;
  value: number;
  predictValue?: number; // 新增預測值字段
}

interface StockRecord {
  close_price: number;
}

interface PredictionRequest {
  data_numpy: number[];
  context_length: number;
  prediction_length: number;
}

const PredictPage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 股票選擇相關狀態
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [stockSymbol, setStockSymbol] = useState<string>("AAPL");

  // 預測參數
  const [contextLength, setContextLength] = useState<number>(192);
  const [predictionLength, setPredictionLength] = useState<number>(12);

  // 國家和市場配置
  const countryOptions = [
    { value: "US", label: "美國", flag: "🇺🇸", db: "market_stock_us" },
    { value: "TW", label: "台灣", flag: "🇹🇼", db: "market_stock_tw" },
    { value: "CRYPTO", label: "加密貨幣", flag: "₿", db: "market_crypto" },
  ];

  // 常用股票代碼建議
  const popularStocks = {
    US: ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD"],
    TW: ["2330", "2317", "2454", "2881", "6505", "3008", "2382", "2303"],
    CRYPTO: ["BTC-USD", "SOL-USD", "ETH-USD"],
  };

  // 初始 dbConfig 為空，避免在前端暴露或依賴敏感 env
  // 實際連線/查詢由 server-side API 處理；前端僅可選擇傳入 database 名稱
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    server: "",
    user: "",
    password: "",
    database: "",
    port: undefined,
    options: {},
  });
  const [dbConnected, setDbConnected] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [stockData, setStockData] = useState<number[]>([]);

  // memoize DatabaseService instance to avoid repeated lookups
  const databaseService = useMemo(() => DatabaseService.getInstance(), []);

  // 測試資料庫連接
  const testDbConnection = useCallback(async () => {
    setDbLoading(true);
    setError("");

    try {
      // 呼叫 server-side 的測試連線 API（使用 server env DB_*）
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resp = await fetch(`${baseUrl}/api/database/test-connection`, {
        method: "GET",
      });
      const result = await resp.json();
      if (result.success) {
        setDbConnected(true);
        setError("");
        console.log("資料庫連接成功:", result.message);
      } else {
        setDbConnected(false);
        setError(result.message);
      }
    } catch (err) {
      setDbConnected(false);
      setError(err instanceof Error ? err.message : "連接失敗");
    } finally {
      setDbLoading(false);
    }
  }, [dbConfig]);

  // 查詢股票資料
  const queryStockData = useCallback(async () => {
    if (!dbConnected) {
      setError("請先連接資料庫");
      return;
    }

    if (!stockSymbol.trim()) {
      setError("請輸入股票代碼");
      return;
    }

    setDbLoading(true);
    setError("");

    try {
      const tableName = `stock_data_1h`;

      // 使用參數化查詢，限制筆數
      const query = `
        SELECT TOP 10000
          close_price
        FROM ${tableName}
        WHERE symbol = @symbol
        ORDER BY datetime DESC
      `;

      const result = await databaseService.executeQuery(dbConfig, query, {
        symbol: stockSymbol.toUpperCase(),
      });

      if (result.success && result.data) {
        const stocks = result.data as StockRecord[];
        const values = stocks.map((item) => item.close_price);
        setStockData(values);
      } else {
        setError(result.error || `找不到 ${stockSymbol} 的資料`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "查詢失敗");
    } finally {
      setDbLoading(false);
    }
  }, [dbConnected, stockSymbol, dbConfig, databaseService]);

  // 快速選擇熱門股票
  const selectPopularStock = useCallback((symbol: string) => {
    setStockSymbol(symbol);
  }, []);

  const callStockPrediction = useCallback(
    async (stockData: PredictionRequest) => {
      setLoading(true);
      setError("");
      setPrediction(null);
      setEvaluation(null); // 清除之前的評估結果

      try {
        const response = await fetch("/api/py/stock_prediction/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockData),
        });

        const result = await response.json();

        // 檢查是否有錯誤 (後端返回 500 狀態碼時，FastAPI 會包裝成 detail 字段)
        if (!response.ok || result.detail) {
          throw new Error(
            result.detail || `HTTP error! status: ${response.status}`
          );
        }

        setPrediction(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "預測失敗");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const callEvaluation = useCallback(async (stockData: PredictionRequest) => {
    setLoading(true);
    setError("");
    setEvaluation(null);
    setPrediction(null); // 清除之前的預測結果

    try {
      const response = await fetch("/api/py/stock_prediction/long_term_eval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stockData),
      });

      const result = await response.json();

      // 檢查是否有錯誤 (後端返回 500 狀態碼時，FastAPI 會包裝成 detail 字段)
      if (!response.ok || result.detail) {
        throw new Error(
          result.detail || `HTTP error! status: ${response.status}`
        );
      }

      setEvaluation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "評估失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrediction = useCallback(() => {
    const testData = {
      data_numpy: stockData,
      context_length: contextLength,
      prediction_length: predictionLength,
    };

    callStockPrediction(testData);
  }, [stockData, contextLength, predictionLength, callStockPrediction]);

  const handleEvaluation = useCallback(() => {
    const testData = {
      data_numpy: stockData,
      context_length: contextLength,
      prediction_length: predictionLength,
    };

    callEvaluation(testData);
  }, [stockData, contextLength, predictionLength, callEvaluation]);

  // 轉換預測數據為折線圖格式
  const convertPredictionToLineData = useCallback(
    (predictionData: PredictionData): LineChartData[] => {
      const baseDate = new Date();
      const chartData: LineChartData[] = [];

      // 後端返回的是 mean: [數值1, 數值2, ...] 格式 (一維數組)
      const meanArray = predictionData.mean;
      if (!Array.isArray(meanArray) || meanArray.length === 0) {
        return [];
      }

      // 使用小時級距（和 evaluation 保持一致）
      for (let i = 0; i < meanArray.length; i++) {
        const date = new Date(baseDate);
        date.setHours(date.getHours() + (i + 1));

        const meanValue = meanArray[i];

        chartData.push({
          date: date.toISOString(),
          value: Number(meanValue) || 0,
        });
      }

      return chartData;
    },
    []
  );

  // 轉換評估數據為折線圖格式
  const convertEvaluationToLineData = useCallback(
    (evaluationData: EvaluationData): LineChartData[] => {
      const baseDate = new Date();
      const chartData: LineChartData[] = [];

      if (
        !evaluationData.true_value?.length ||
        !evaluationData.predict?.length
      ) {
        return [];
      }

      const maxLength = Math.max(
        evaluationData.true_value.length,
        evaluationData.predict.length
      );

      for (let i = 0; i < maxLength; i++) {
        const date = new Date(baseDate);
        date.setHours(date.getHours() + (i + 1));

        const trueValue =
          i < evaluationData.true_value.length
            ? evaluationData.true_value[i]
            : 0;

        const predictValue =
          i < evaluationData.predict.length ? evaluationData.predict[i] : 0;

        chartData.push({
          date: date.toISOString(),
          value: Number(trueValue) || 0,
          predictValue: Number(predictValue) || 0,
        });
      }

      return chartData;
    },
    []
  );

  // memoized converted data for charts
  const predictionChartData = useMemo(
    () => (prediction ? convertPredictionToLineData(prediction) : []),
    [prediction, convertPredictionToLineData]
  );

  const evaluationChartData = useMemo(
    () => (evaluation ? convertEvaluationToLineData(evaluation) : []),
    [evaluation, convertEvaluationToLineData]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題區域（改為與 news 頁面一致的裝飾風格） */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* subtle grid background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    股票預測分析
                  </h1>
                  <p className="text-blue-100 mt-3 text-lg font-medium">
                    基於機器學習的股票價格預測模型
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                使用真實歷史價格資料與 AI
                模型，產生短期/中期價格走勢預測，並提供模型評估視覺化結果。
              </p>
            </div>

            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">即時</div>
                  <div className="text-blue-200 text-sm font-medium">
                    模型回饋
                  </div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">可視化</div>
                  <div className="text-blue-200 text-sm font-medium">
                    趨勢圖表
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 股票選擇區域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">股票選擇</h2>
          </div>

          {/* 國家/市場選擇 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              選擇市場
            </label>
            <div className="grid grid-cols-3 gap-4">
              {countryOptions.map((country) => (
                <button
                  key={country.value}
                  onClick={() => {
                    setSelectedCountry(country.value);
                    setDbConfig({ ...dbConfig, database: country.db });
                  }}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    selectedCountry === country.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <span className="font-medium">{country.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 股票代碼輸入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              股票代碼
              {selectedCountry === "TW" && (
                <span className="text-gray-500 ml-1">(例: 2330)</span>
              )}
              {selectedCountry === "US" && (
                <span className="text-gray-500 ml-1">(例: AAPL)</span>
              )}
              {selectedCountry === "CRYPTO" && (
                <span className="text-gray-500 ml-1">(例: BTC)</span>
              )}
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`輸入${
                  countryOptions.find((c) => c.value === selectedCountry)?.label
                }股票代碼`}
                onKeyDown={(e) => e.key === "Enter" && queryStockData()}
              />
              <button
                onClick={queryStockData}
                disabled={!dbConnected || dbLoading || !stockSymbol.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>{dbLoading ? "查詢中..." : "查詢"}</span>
              </button>
            </div>
          </div>

          {/* 熱門股票快選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              熱門
              {countryOptions.find((c) => c.value === selectedCountry)?.label}
              股票
            </label>
            <div className="flex flex-wrap gap-2">
              {popularStocks[
                selectedCountry as keyof typeof popularStocks
              ]?.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => selectPopularStock(symbol)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    stockSymbol === symbol
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 預測參數設定 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">預測參數</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context Length
              </label>
              <input
                type="number"
                value={contextLength}
                onChange={(e) =>
                  setContextLength(parseInt(e.target.value) || 192)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="192"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prediction Length
              </label>
              <input
                type="number"
                value={predictionLength}
                onChange={(e) =>
                  setPredictionLength(parseInt(e.target.value) || 12)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12"
              />
            </div>
          </div>
        </div>

        {/* 資料庫配置區域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                資料庫連接
              </h2>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dbConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {dbConnected ? "已連接" : "未連接"}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={testDbConnection}
              disabled={dbLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {dbLoading ? "連接中..." : "測試連接"}
            </button>

            <button
              onClick={queryStockData}
              disabled={!dbConnected || dbLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {dbLoading ? "查詢中..." : "查詢股票資料"}
            </button>
          </div>

          {/* 選擇結果顯示 */}
          {stockSymbol && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                已選擇:{" "}
                <span className="font-medium">
                  {
                    countryOptions.find((c) => c.value === selectedCountry)
                      ?.flag
                  }{" "}
                  {stockSymbol}
                </span>
                {stockData.length > 0 && (
                  <span className="ml-3">
                    • 已載入 {stockData.length} 筆資料，最新價格:{" "}
                    {stockData[0]?.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* 預測區域 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              股票預測模型
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {stockData.length > 0
                ? `使用 ${stockSymbol} 的真實資料進行預測，查看未來的價格預測。`
                : "請先選擇股票並查詢資料，然後進行預測分析。"}
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePrediction}
                disabled={loading || stockData.length < contextLength}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors text-lg font-medium"
              >
                {loading ? "預測中..." : `預測 ${stockSymbol || "股票"} 價格`}
              </button>

              <button
                onClick={handleEvaluation}
                disabled={
                  loading || stockData.length < contextLength + predictionLength
                }
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors text-lg font-medium"
              >
                {loading ? "評估中..." : `評估模型準確度`}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">錯誤：</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {error.includes("shapes") && (
                  <p className="text-red-500 text-xs mt-2">
                    這是後端模型維度問題，請檢查 Python 代碼中的矩陣計算邏輯
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 統一的結果顯示區域 */}
          {(prediction || evaluation) && (
            <div className="mt-8">
              {/* 圖表顯示 */}
              {prediction && !evaluation && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    AI 預測結果
                  </h3>
                  <PredictionLineChart
                    data={predictionChartData}
                    title="股票價格預測趨勢"
                    height={600}
                  />
                </div>
              )}

              {evaluation && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    模型評估結果
                  </h3>
                  <PredictionLineChart
                    data={evaluationChartData}
                    title="預測準確度評估 - 真實值 vs 預測值"
                    height={600}
                    showBothLines={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 諮詢資訊區塊 */}
      <div className="bg-gray-50 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* 系統資訊 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <ServerIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    系統資訊
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CpuChipIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">預測模型：</span>
                    <span className="ml-1 font-medium text-gray-900">
                      Chronos Forecasting
                    </span>
                  </div>
                  <span className="block mt-2 text-xs text-gray-500">
                    使用 LSTM、Transformer 等深度學習架構進行時間序列預測
                  </span>
                </div>
              </div>

              {/* 數據來源 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <DocumentDuplicateIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    數據來源
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">歷史真實市場數據</span>
                  </div>
                  <span className="block mt-2 text-xs text-gray-500">
                    資料來自 Yahoo Finance，包含股票與加密貨幣的歷史價格
                  </span>
                </div>
              </div>

              {/* 免責聲明 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    免責聲明
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  本系統提供的分析僅供參考，投資決策請自行評估風險。
                  <span className="block mt-2 text-xs text-gray-500">
                    AI預測結果基於歷史數據分析，不保證未來表現。
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PredictPage;
