import React, { useState } from "react";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StockMarket = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("value");
  const [selectedSector, setSelectedSector] = useState("all");

  // 模擬數據
  const marketData = {
    overview: {
      index: "17,935",
      change: "+125",
      changePercent: "+0.70%",
      volume: "2,835億",
      upDown: "上漲: 789 / 下跌: 412",
      highlights: ["台積電領漲半導體類股", "金融股普遍走揚", "航運股表現強勁"],
    },
    sectors: [
      {
        name: "半導體",
        performance: "+2.5%",
        strength: "強",
        leadingStocks: ["台積電", "聯發科", "聯電"],
        description: "受惠於AI需求成長，半導體類股普遍走揚",
        weight: 35,
      },
      {
        name: "金融",
        performance: "+1.2%",
        strength: "中",
        leadingStocks: ["國泰金", "富邦金", "兆豐金"],
        description: "利率環境改善，金融股獲利展望轉佳",
        weight: 25,
      },
      {
        name: "航運",
        performance: "+3.1%",
        strength: "強",
        leadingStocks: ["長榮", "陽明", "萬海"],
        description: "運價上漲帶動航運股走強",
        weight: 15,
      },
      {
        name: "其他",
        performance: "+0.8%",
        strength: "中",
        leadingStocks: ["其他個股"],
        description: "其他產業表現",
        weight: 25,
      },
    ],
    technical: {
      ma5: "17,850",
      ma10: "17,780",
      ma20: "17,650",
      rsi: "65",
      macd: "多頭",
      support: "17,500",
      resistance: "18,000",
    },
    priceHistory: {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      prices: [16800, 16900, 17100, 17300, 17500, 17935],
      volumes: [2500, 2600, 2700, 2800, 2900, 2835],
    },
    strategies: {
      value: [
        { symbol: "2330", name: "台積電", pe: 15.2, pb: 2.1, score: 85 },
        { symbol: "2412", name: "中華電", pe: 12.8, pb: 1.8, score: 82 },
      ],
      growth: [
        {
          symbol: "2454",
          name: "聯發科",
          growth: 25.3,
          momentum: "strong",
          score: 88,
        },
        {
          symbol: "3008",
          name: "大立光",
          growth: 18.7,
          momentum: "strong",
          score: 84,
        },
      ],
      momentum: [
        { symbol: "2603", name: "長榮", rsi: 68, trend: "up", score: 90 },
        { symbol: "2609", name: "陽明", rsi: 65, trend: "up", score: 87 },
      ],
    },
  };

  // 圖表配置
  const priceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "台股指數走勢",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "成交量變化",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const sectorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "產業分布",
      },
    },
  };

  const rsiChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "RSI 指標",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  // 圖表數據
  const priceChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: "指數",
        data: marketData.priceHistory.prices,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const volumeChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: "成交量(億)",
        data: marketData.priceHistory.volumes,
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const sectorChartData = {
    labels: marketData.sectors.map((sector) => sector.name),
    datasets: [
      {
        data: marketData.sectors.map((sector) => sector.weight),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const rsiChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: "RSI",
        data: [45, 52, 58, 63, 68, 65],
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  // 產業輪動圖表數據
  const sectorRotationData = {
    labels: ["半導體", "金融", "航運", "其他"],
    datasets: [
      {
        label: "產業強度",
        data: [35, 25, 15, 25],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  const getStatusColor = (status) => {
    if (!status) return "text-blue-500";

    switch (status.toLowerCase()) {
      case "上漲":
      case "強":
      case "多頭":
        return "text-green-500";
      case "下跌":
      case "弱":
      case "空頭":
        return "text-red-500";
      case "中":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  // 選股策略篩選結果
  const getFilteredStocks = () => {
    return marketData.strategies[selectedStrategy] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">股票分析</h1>
            </div>
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋股票代號或名稱..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 導航標籤 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "sectors", "technical"].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" && "市場概況"}
                {tab === "sectors" && "產業分析"}
                {tab === "technical" && "技術分析"}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  台股指數
                </h3>
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {marketData.overview.index}
                </span>
                <span className="text-green-500 font-semibold">
                  {marketData.overview.changePercent}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                成交量：{marketData.overview.volume}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {marketData.overview.upDown}
                </div>
                <ul className="mt-2 space-y-2">
                  {marketData.overview.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 價格走勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={priceChartOptions} data={priceChartData} />
              </div>
            </div>

            {/* 成交量圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Bar options={volumeChartOptions} data={volumeChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sectors" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.sectors.map((sector) => (
                <div
                  key={sector.name}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sector.name}
                    </h3>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        sector.strength
                      )}`}
                    >
                      {sector.strength}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {sector.performance}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">
                      {sector.description}
                    </p>
                    <div className="text-sm">
                      <span className="text-gray-500">領漲個股：</span>
                      <span className="text-gray-900">
                        {sector.leadingStocks.join("、")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 產業分布圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <Doughnut
                    options={sectorChartOptions}
                    data={sectorChartData}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    產業權重
                  </h3>
                  <div className="space-y-4">
                    {marketData.sectors.map((sector) => (
                      <div
                        key={sector.name}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-500">
                          {sector.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {sector.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 新增：產業輪動分析 */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-blue-500" />
                  產業輪動分析
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <Pie
                      data={sectorRotationData}
                      options={sectorChartOptions}
                    />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      產業表現
                    </h3>
                    <div className="space-y-4">
                      {marketData.sectors.map((sector) => (
                        <div
                          key={sector.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {sector.name}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              sector.performance.startsWith("+")
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {sector.performance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "technical" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  移動平均線
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">MA5</span>
                    <span className="text-sm font-medium text-gray-900">
                      {marketData.technical.ma5}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">MA10</span>
                    <span className="text-sm font-medium text-gray-900">
                      {marketData.technical.ma10}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">MA20</span>
                    <span className="text-sm font-medium text-gray-900">
                      {marketData.technical.ma20}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  技術指標
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">RSI</span>
                    <span className="text-sm font-medium text-gray-900">
                      {marketData.technical.rsi}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">MACD</span>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        marketData.technical.macd
                      )}`}
                    >
                      {marketData.technical.macd}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">支撐/壓力</span>
                    <span className="text-sm font-medium text-gray-900">
                      {marketData.technical.support} /{" "}
                      {marketData.technical.resistance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RSI 走勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={rsiChartOptions} data={rsiChartData} />
              </div>
            </div>
          </div>
        )}

        {/* 新增：選股策略篩選器 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-blue-500" />
              選股策略篩選器
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="value">價值型選股</option>
                <option value="growth">成長型選股</option>
                <option value="momentum">動能型選股</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      代號
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      評分
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細資訊
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredStocks().map((stock) => (
                    <tr key={stock.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {selectedStrategy === "value" &&
                          `P/E: ${stock.pe}, P/B: ${stock.pb}`}
                        {selectedStrategy === "growth" &&
                          `成長率: ${stock.growth}%, 動能: ${stock.momentum}`}
                        {selectedStrategy === "momentum" &&
                          `RSI: ${stock.rsi}, 趨勢: ${stock.trend}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMarket;
