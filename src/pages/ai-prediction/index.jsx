import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockAnalysis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState("IHSG");
  const [modelSettings, setModelSettings] = useState({
    autoTrading: true,
    linebotNotification: true,
  });
  const [timeRange, setTimeRange] = useState("1W");
  const [activeTab, setActiveTab] = useState("settings");
  const [portfolioItems, setPortfolioItems] = useState([
    {
      symbol: "IHSG",
      stockCode: "12345",
      amount: 100.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
    {
      symbol: "TSLA",
      stockCode: "12345",
      amount: 250.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
    {
      symbol: "NVDA",
      stockCode: "12345",
      amount: 120.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
  ]);

  // 使用狀態管理圖表數據，初始為空
  const [chartHistoryData, setChartHistoryData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [trendDirection, setTrendDirection] = useState("上漲");
  const [trendPercent, setTrendPercent] = useState("0.00");
  const [yAxisMin, setYAxisMin] = useState(null);
  const [yAxisMax, setYAxisMax] = useState(null);

  // 基本股票數據 (不包含隨機生成的部分)
  const stockData = {
    IHSG: {
      price: "7,056.04",
      open: "7,091.76",
      high: "7,100.81",
      low: "7,016.70",
      lot: "186.26 M",
      value: "9.88 T",
      freq: "110 M",
      chartLabels: Array.from({ length: 30 }, (_, i) => i + 1),
    },
  };

  // 處理時間範圍變更
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  // 根據時間範圍獲取預測點數量
  const getPredictionPointsForTimeRange = (range) => {
    switch (range) {
      case "1D":
        return 4; // 預測未來4小時
      case "1W":
        return 3; // 預測未來3天
      case "1M":
        return 7; // 預測未來7天
      case "3M":
        return 14; // 預測未來14天
      case "1Y":
        return 8; // 預測未來8週
      default:
        return 3; // 默認為3天
    }
  };

  // 根據時間範圍獲取數據點數量 - 修改為預測點數量的2倍
  const getDataPointsForTimeRange = (range) => {
    // 獲取預測點數量
    const predictionPoints = getPredictionPointsForTimeRange(range);

    // 歷史數據點設為預測點的2倍
    return predictionPoints * 2;
  };

  // 使用 useEffect 在客戶端生成圖表數據
  useEffect(() => {
    // 根據時間範圍確定數據點數量
    const historyLength = getDataPointsForTimeRange(timeRange);
    const predictionLength = getPredictionPointsForTimeRange(timeRange);

    // 生成歷史數據 - 根據時間範圍調整波動範圍
    let volatilityFactor = 1;
    let baseValue = 7000;

    switch (timeRange) {
      case "1D":
        volatilityFactor = 0.2; // 日內較小波動
        break;
      case "1W":
        volatilityFactor = 0.5; // 一週中等波動
        break;
      case "1M":
        volatilityFactor = 1.0; // 一月標準波動
        break;
      case "3M":
        volatilityFactor = 1.5; // 三月較大波動
        break;
      case "1Y":
        volatilityFactor = 2.5; // 一年大波動
        break;
    }

    // 生成歷史數據
    const historyData = [];
    for (let i = 0; i < historyLength; i++) {
      const randomChange = (Math.random() - 0.5) * 100 * volatilityFactor;
      if (i === 0) {
        historyData.push(baseValue + randomChange);
      } else {
        // 讓每個數據點基於前一個點變動，創造更自然的走勢
        const prevValue = historyData[i - 1];
        const change = (Math.random() - 0.45) * 30 * volatilityFactor; // 稍微偏向上漲
        historyData.push(prevValue + change);
      }
    }
    setChartHistoryData(historyData);

    // 生成預測數據
    const lastValue = historyData[historyData.length - 1];
    const predictions = [];

    for (let i = 0; i < predictionLength; i++) {
      const trend = Math.random() > 0.4;
      const change =
        lastValue * (0.002 + Math.random() * 0.01) * volatilityFactor;
      predictions.push(lastValue + (i + 1) * (trend ? change : -change));
    }

    setPredictionData(predictions);

    // 設置標籤 - 根據時間範圍調整格式
    let labels = [];
    const today = new Date();

    switch (timeRange) {
      case "1D":
        // 日內按小時顯示 - 調整為2:1比例
        for (let i = 0; i < historyLength; i++) {
          // 計算起始小時，確保從合理的時間開始
          const hour = (9 - historyLength + i) % 24; // 從更早的時間開始
          labels.push(`${hour >= 0 ? hour : hour + 24}:00`);
        }
        for (let i = 0; i < predictionLength; i++) {
          const hour = (9 + i) % 24;
          labels.push(`${hour}:00`);
        }
        break;

      case "1W":
        // 一週顯示星期幾 - 調整為2:1比例
        const days = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
        const currentDay = today.getDay();
        const startDayOffset = historyLength % 7; // 確保不會超過一週

        for (let i = 0; i < historyLength; i++) {
          const dayIndex = (currentDay - startDayOffset + i + 7) % 7;
          labels.push(days[dayIndex]);
        }
        for (let i = 0; i < predictionLength; i++) {
          const dayIndex = (currentDay + i) % 7;
          labels.push(days[dayIndex]);
        }
        break;

      default:
        // 月、季度、年使用日期 - 調整為2:1比例
        for (let i = 0; i < historyLength; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (historyLength - i));
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        for (let i = 0; i < predictionLength; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i + 1);
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
    }

    setAllLabels(labels);

    // 計算趨勢方向和百分比
    const direction =
      predictions[predictions.length - 1] > lastValue ? "上漲" : "下跌";
    setTrendDirection(direction);

    const percent = Math.abs(
      (
        ((predictions[predictions.length - 1] - lastValue) / lastValue) *
        100
      ).toFixed(2)
    );
    setTrendPercent(percent);

    // 計算Y軸範圍 - 根據數據波動設置合適的最小最大值
    const allData = [...historyData, ...predictions];
    const minValue = Math.min(...allData);
    const maxValue = Math.max(...allData);

    // 設置Y軸範圍，留出上下10%的空間
    const range = maxValue - minValue;
    const paddingFactor = 0.1; // 10%的上下留白
    setYAxisMin(Math.floor(minValue - range * paddingFactor));
    setYAxisMax(Math.ceil(maxValue + range * paddingFactor));
  }, [selectedStock, timeRange]); // 當選擇的股票或時間範圍變更時重新生成數據

  // 預測數據集（虛線）- 用null填充歷史部分
  const predictionDataset = {
    label: "AI預測",
    data:
      chartHistoryData.length > 0
        ? [
            ...Array(chartHistoryData.length - 1).fill(null),
            chartHistoryData[chartHistoryData.length - 1],
            ...predictionData,
          ]
        : [],
    borderColor: "rgb(59, 130, 246)",
    backgroundColor: "rgba(59, 130, 246, 0.2)", // 稍微增加透明度使預測區域更明顯
    borderDash: [5, 5],
    fill: true,
    tension: 0.3,
  };

  // 歷史數據集（實線）
  const historyDataset = {
    label: "歷史價格",
    data: chartHistoryData,
    borderColor: "rgb(239, 68, 68)",
    backgroundColor: "rgba(239, 68, 68, 0.08)", // 降低歷史區域的透明度
    fill: true,
    tension: 0.3,
  };

  // 圖表數據 - 包含歷史和預測
  const chartData = {
    labels: allLabels,
    datasets: [historyDataset, predictionDataset],
  };

  // 圖表配置 - 包含動態Y軸設置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: { display: false },
        grid: { display: false },
      },
      y: {
        display: true,
        title: { display: false },
        min: yAxisMin, // 動態設置最小值
        max: yAxisMax, // 動態設置最大值
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  // 模型設定變更處理
  const handleSettingChange = (setting) => {
    setModelSettings({
      ...modelSettings,
      [setting]: !modelSettings[setting],
    });
  };

  // 技術指標資料
  const technicalIndicators = [
    {
      name: "RSI (14)",
      value: "68.5",
      status: "接近超買",
      statusColor: "text-yellow-600",
    },
    {
      name: "MACD",
      value: "+12.5",
      status: "看漲信號",
      statusColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      name: "KD指標",
      value: "K:65 D:45",
      status: "黃金交叉",
      statusColor: "text-green-600",
    },
    {
      name: "移動平均線 (20日)",
      value: "7,032.50",
      status: "站上均線",
      statusColor: "text-green-600",
      valueColor: "text-red-600",
    },
    {
      name: "布林通道",
      value: "上軌: 7,150",
      status: "中軌: 7,050 | 下軌: 6,950",
      statusColor: "text-gray-600",
    },
    {
      name: "成交量",
      value: "+15%",
      status: "高於平均",
      statusColor: "text-blue-600",
      valueColor: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 頂部標題區 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
            AI 投資趨勢預測
          </h1>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側面板 - 股票資訊與圖表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 搜尋與股票資訊卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 搜尋框 */}
              <div className="p-5 pb-0">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋加密貨幣、股票等等..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-3 pr-10 py-2"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-r-md h-full">
                      分析
                    </button>
                  </div>
                </div>
              </div>

              {/* 股票數據頭部 */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedStock}
                    </h2>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {stockData[selectedStock].price}
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">
                    +32.80 (+0.47%)
                  </div>
                </div>

                {/* 圖表控制選項 - 添加點擊事件 */}
                <div className="mb-3 mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTimeRangeChange("1D")}
                    className={`px-3 py-1 ${
                      timeRange === "1D"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-md text-sm font-medium`}
                  >
                    1D
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange("1W")}
                    className={`px-3 py-1 ${
                      timeRange === "1W"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-md text-sm font-medium`}
                  >
                    1W
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange("1M")}
                    className={`px-3 py-1 ${
                      timeRange === "1M"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-md text-sm font-medium`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange("3M")}
                    className={`px-3 py-1 ${
                      timeRange === "3M"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-md text-sm font-medium`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange("1Y")}
                    className={`px-3 py-1 ${
                      timeRange === "1Y"
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } rounded-md text-sm font-medium`}
                  >
                    1Y
                  </button>
                </div>

                {/* 股票圖表 */}
                <div className="h-64 relative">
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center z-10">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    AI預測區間
                  </div>
                  {chartHistoryData.length > 0 && (
                    <Line data={chartData} options={chartOptions} />
                  )}
                </div>

                {/* AI預測說明 */}
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-blue-800">AI預測分析</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    根據{timeRange}歷史數據分析，AI模型預測
                    {predictionData.length}個時間單位後{trendDirection}趨勢，
                    預期價格變動幅度約為{trendPercent}%。
                  </p>
                </div>

                {/* 股票詳細信息 */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">開盤價</div>
                    <div className="font-medium text-gray-900">
                      {stockData[selectedStock].open}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">最高價</div>
                    <div className="font-medium text-pink-600">
                      {stockData[selectedStock].high}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">最低價</div>
                    <div className="font-medium text-gray-900">
                      {stockData[selectedStock].low}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">Lot</div>
                    <div className="font-medium text-gray-900">
                      {stockData[selectedStock].lot}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">Value</div>
                    <div className="font-medium text-gray-900">
                      {stockData[selectedStock].value}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">Freq</div>
                    <div className="font-medium text-gray-900">
                      {stockData[selectedStock].freq}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 技術指標分析卡片 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartPieIcon className="h-5 w-5 text-blue-500 mr-2" />
                  技術指標分析
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {technicalIndicators.map((indicator, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">
                        {indicator.name}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          indicator.valueColor || "text-gray-900"
                        }`}
                      >
                        {indicator.value}
                      </div>
                      <div className={`text-xs ${indicator.statusColor}`}>
                        {indicator.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右側面板 - 標籤頁導航 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 標籤頁切換 */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                    activeTab === "settings"
                      ? "text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  交易設定
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                    activeTab === "portfolio"
                      ? "text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  投資組合
                </button>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
                    activeTab === "analysis"
                      ? "text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  風險分析
                </button>
              </div>

              {/* 交易設定內容 */}
              {activeTab === "settings" && (
                <div className="p-5">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      選擇操作天數
                    </label>
                    <div className="relative">
                      <select className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
                        <option>選擇操作天數</option>
                        <option>5天</option>
                        <option>10天</option>
                        <option>15天</option>
                        <option>30天</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="auto-trading"
                          name="auto-trading"
                          type="checkbox"
                          checked={modelSettings.autoTrading}
                          onChange={() => handleSettingChange("autoTrading")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="auto-trading"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          自動拋單
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="linebot-notification"
                          name="linebot-notification"
                          type="checkbox"
                          checked={modelSettings.linebotNotification}
                          onChange={() =>
                            handleSettingChange("linebotNotification")
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="linebot-notification"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          LineBot 通知
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 價格提醒設定 */}
                  <h4 className="font-medium text-gray-900 mb-3">
                    價格提醒設定
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="price-alert-up"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="price-alert-up"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        價格上漲至
                      </label>
                      <input
                        type="text"
                        placeholder="7,100.00"
                        className="ml-3 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="price-alert-down"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="price-alert-down"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        價格下跌至
                      </label>
                      <input
                        type="text"
                        placeholder="7,000.00"
                        className="ml-3 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="price-change"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="price-change"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        價格變動超過
                      </label>
                      <input
                        type="text"
                        placeholder="2%"
                        className="ml-3 block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                      儲存提醒設定
                    </button>
                  </div>

                  {/* 交易策略建議 */}
                  <div className="mt-5">
                    <h4 className="font-medium text-gray-900 mb-3">
                      交易策略建議
                    </h4>
                    <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-600"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          ></svg>
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-base font-medium text-green-800">
                            買入建議
                          </h4>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-green-700 pl-8">
                        <ul className="list-disc space-y-1">
                          <li>技術指標顯示突破阻力位</li>
                          <li>成交量增加支持上漲趨勢</li>
                          <li>基本面數據支持持續成長</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 投資組合內容 */}
              {activeTab === "portfolio" && (
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    已投資標的持倉成本
                  </h3>
                  <div className="space-y-4">
                    {portfolioItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900">
                            {item.symbol}
                          </p>
                          <p className="text-sm text-gray-500">
                            股票代號: {item.stockCode}
                          </p>
                          <p className="text-xs text-gray-500">
                            交易日期: {item.date}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-base font-medium text-gray-900">
                            $ {item.amount.toFixed(2)}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                    新增投資標的
                  </button>
                </div>
              )}

              {/* 風險分析內容 */}
              {activeTab === "analysis" && (
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    風險評估
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          波動風險
                        </span>
                        <span className="text-sm font-medium text-amber-600">
                          中等
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          流動性風險
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          低
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          市場風險
                        </span>
                        <span className="text-sm font-medium text-amber-600">
                          中等
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: "50%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          系統性風險
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          高
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    綜合風險評估：本投資標的目前適合具有中等風險承受能力的投資者
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      交易建議
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          建議操作價格區間
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-base text-green-600">
                            買入: $7,030 - $7,050
                          </div>
                          <div className="text-base text-red-600">
                            賣出: $7,150 - $7,200
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          止損位置
                        </div>
                        <div className="text-base text-gray-900">
                          $6,950 (止損幅度: -1.5%)
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          預期目標
                        </div>
                        <div className="text-base text-green-600">
                          $7,200 (獲利幅度: +2.0%)
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        建議持有時間:{" "}
                        <span className="font-medium">5-10 個交易日</span>
                      </p>
                      <p className="mt-1">
                        風險等級:{" "}
                        <span className="font-medium text-amber-600">中等</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;
