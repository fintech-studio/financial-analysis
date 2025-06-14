import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
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
import { Line, Bar, Doughnut } from "react-chartjs-2";

// MVC 架構引入
import { MarketController } from "../../controllers/MarketController";
import { UserController } from "../../controllers/UserController";
import { useMvcController, useDataLoader } from "../../hooks/useMvcController";
import { MarketOverview, MarketSentiment } from "../../types/market";
import { User } from "../../models/UserModel";
import Footer from "@/components/Layout/Footer";

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

interface MarketIndex {
  name: string;
  value: string;
  change: string;
  region: string;
  trend: string;
}

interface Commodity {
  name: string;
  value: string;
  change: string;
  unit: string;
  trend: string;
}

interface EconomicIndicator {
  name: string;
  value: string;
  change: string;
  trend: string;
}

interface Region {
  name: string;
  performance: string;
  strength: string;
  leadingMarkets: string[];
  description: string;
  weight: number;
  gdpGrowth: string;
  inflation: string;
  interest: string;
}

interface CentralBank {
  name: string;
  rate: string;
  stance: string;
  nextMeeting: string;
}

interface MarketData {
  overview: {
    indices: MarketIndex[];
    commodities: Commodity[];
    economic: EconomicIndicator[];
    globalGDP: string;
    gdpGrowth: string;
    globalInflation: string;
    unemploymentRate: string;
  };
  regions: Region[];
  priceHistory: {
    labels: string[];
    indices: number[];
    commodities: number[];
    economic: number[];
  };
  centralBanks: CentralBank[];
  economicIndicators: {
    gdp: number[];
    inflation: number[];
    unemployment: number[];
  };
}

type ActiveTab = "overview" | "regions" | "commodities" | "economy";

const GlobalMarket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // MVC 架構 - 控制器和狀態管理
  const marketController = MarketController.getInstance();
  const userController = UserController.getInstance();

  const {
    data: user,
    loading: userLoading,
    error: userError,
    execute: executeUser,
  } = useMvcController<User>();

  const {
    data: globalMarketData,
    loading: marketLoading,
    error: marketError,
  } = useDataLoader(() => marketController.getGlobalMarketOverview(), null, {
    onSuccess: (data) => {
      console.log("全球市場數據載入成功:", data);
      setLastUpdated(new Date());
    },
    onError: (error) => {
      console.error("載入全球市場數據失敗:", error);
    },
  });

  const {
    data: economicIndicators,
    loading: economicLoading,
    execute: executeEconomicRefresh,
  } = useMvcController<any>();

  const {
    data: commodityPrices,
    loading: commodityLoading,
    execute: executeCommodityRefresh,
  } = useMvcController<any>();

  // 載入初始數據
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const userId = "user_001"; // 模擬用戶ID

    try {
      // 並行載入用戶數據和經濟指標
      await Promise.all([
        executeUser(() => userController.getUserProfile(userId)),
        executeEconomicRefresh(() => marketController.getEconomicIndicators()),
        executeCommodityRefresh(() => marketController.getCommodityPrices()),
      ]);
    } catch (error) {
      console.error("載入初始數據失敗:", error);
    }
  };

  // 刷新所有市場數據
  const handleRefreshData = async () => {
    try {
      setLastUpdated(new Date());

      // 並行刷新所有數據
      await Promise.all([
        executeEconomicRefresh(() => marketController.getEconomicIndicators()),
        executeCommodityRefresh(() => marketController.getCommodityPrices()),
      ]);

      console.log("全球市場數據刷新完成");
    } catch (error) {
      console.error("刷新全球市場數據失敗:", error);
    }
  };

  // 模擬數據 (在沒有實際數據時使用)
  const fallbackMarketData: MarketData = {
    overview: {
      indices: [
        {
          name: "道瓊工業",
          value: "38,654",
          change: "+0.8%",
          region: "美國",
          trend: "up",
        },
        {
          name: "標普500",
          value: "4,927",
          change: "+1.2%",
          region: "美國",
          trend: "up",
        },
        {
          name: "納斯達克",
          value: "15,628",
          change: "+1.5%",
          region: "美國",
          trend: "up",
        },
        {
          name: "日經225",
          value: "36,897",
          change: "-0.3%",
          region: "日本",
          trend: "down",
        },
        {
          name: "恆生指數",
          value: "15,738",
          change: "-1.2%",
          region: "香港",
          trend: "down",
        },
      ],
      commodities: [
        {
          name: "黃金",
          value: "2,035",
          change: "+0.5%",
          unit: "美元/盎司",
          trend: "up",
        },
        {
          name: "原油",
          value: "75.2",
          change: "-1.2%",
          unit: "美元/桶",
          trend: "down",
        },
        {
          name: "銅",
          value: "3.85",
          change: "+0.8%",
          unit: "美元/磅",
          trend: "up",
        },
      ],
      economic: [
        {
          name: "美國GDP",
          value: "3.3%",
          change: "+0.2%",
          trend: "up",
        },
        {
          name: "通膨率",
          value: "3.1%",
          change: "-0.1%",
          trend: "down",
        },
        {
          name: "失業率",
          value: "3.7%",
          change: "0.0%",
          trend: "neutral",
        },
      ],
      globalGDP: "$94.9T",
      gdpGrowth: "+3.1%",
      globalInflation: "3.8%",
      unemploymentRate: "5.9%",
    },
    regions: [
      {
        name: "北美",
        performance: "+1.2%",
        strength: "強",
        leadingMarkets: ["道瓊工業", "標普500", "納斯達克"],
        description: "科技股帶動市場上漲",
        weight: 45,
        gdpGrowth: "+2.8%",
        inflation: "3.5%",
        interest: "5.25%",
      },
      {
        name: "歐洲",
        performance: "+0.8%",
        strength: "中",
        leadingMarkets: ["德國DAX", "法國CAC", "英國富時"],
        description: "經濟數據改善支撐市場",
        weight: 30,
        gdpGrowth: "+1.9%",
        inflation: "4.2%",
        interest: "4.50%",
      },
      {
        name: "亞洲",
        performance: "-0.5%",
        strength: "弱",
        leadingMarkets: ["日經225", "恆生指數", "上證指數"],
        description: "中國經濟放緩影響區域市場",
        weight: 25,
        gdpGrowth: "+4.2%",
        inflation: "2.8%",
        interest: "3.75%",
      },
    ],
    priceHistory: {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      indices: [37000, 37500, 38000, 38500, 38600, 38654],
      commodities: [2000, 2010, 2020, 2030, 2035, 2035],
      economic: [3.1, 3.2, 3.3, 3.3, 3.3, 3.3],
    },
    centralBanks: [
      {
        name: "美聯儲",
        rate: "5.25-5.50%",
        stance: "偏鷹派",
        nextMeeting: "2024/03/20",
      },
      {
        name: "歐洲央行",
        rate: "4.50%",
        stance: "中性",
        nextMeeting: "2024/03/07",
      },
      {
        name: "日本央行",
        rate: "-0.10%",
        stance: "偏鴿派",
        nextMeeting: "2024/03/19",
      },
    ],
    economicIndicators: {
      gdp: [2.8, 3.1, 3.4, 3.2, 3.0, 2.9],
      inflation: [4.2, 4.0, 3.8, 3.6, 3.5, 3.8],
      unemployment: [6.1, 6.0, 5.9, 5.8, 5.7, 5.9],
    },
  };

  // 使用從控制器獲取的數據，如果沒有則使用模擬數據
  const marketData = globalMarketData || fallbackMarketData;

  // 載入狀態
  if (marketLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入全球市場數據中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (marketError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{String(marketError)}</p>
            <button
              onClick={handleRefreshData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 圖表配置
  const priceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "全球指數走勢",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const commodityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "商品價格走勢",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const regionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "區域分布",
      },
    },
  };

  const economicChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "經濟指標趨勢",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // 圖表數據
  const priceChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: "道瓊工業",
        data: marketData.priceHistory.indices,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const commodityChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: "黃金",
        data: marketData.priceHistory.commodities,
        borderColor: "rgb(255, 215, 0)",
        tension: 0.1,
      },
    ],
  };

  const regionChartData = {
    labels: marketData.regions.map((region: Region) => region.name),
    datasets: [
      {
        data: marketData.regions.map((region: Region) => region.weight),
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const economicChartData = {
    labels: ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"],
    datasets: [
      {
        label: "GDP成長率",
        data: marketData.economicIndicators.gdp,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "通膨率",
        data: marketData.economicIndicators.inflation,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const ratesChartData = {
    labels: marketData.centralBanks.map((bank: CentralBank) => bank.name),
    datasets: [
      {
        label: "政策利率",
        data: marketData.centralBanks.map((bank: CentralBank) =>
          parseFloat(bank.rate.split("-")[0])
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const getStatusColor = (status: string): string => {
    if (!status) return "text-blue-500";

    switch (status.toLowerCase()) {
      case "up":
      case "強":
        return "text-green-500";
      case "down":
      case "弱":
        return "text-red-500";
      case "neutral":
      case "中":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  const tabMap = {
    overview: "市場概況",
    regions: "區域分析",
    commodities: "商品市場",
    economy: "經濟指標",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">全球市場分析</h1>
            </div>
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋市場或指標..."
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
            {(Object.keys(tabMap) as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tabMap[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.overview.indices.map((index: MarketIndex) => (
                <div
                  key={index.name}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index.name}
                    </h3>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        index.trend
                      )}`}
                    >
                      {index.change}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {index.value}
                    </span>
                    <span className="text-sm text-gray-500">
                      {index.region}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 價格走勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={priceChartOptions} data={priceChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "regions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.regions.map((region: Region) => (
                <div
                  key={region.name}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {region.name}
                    </h3>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        region.strength
                      )}`}
                    >
                      {region.strength}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {region.performance}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">
                      {region.description}
                    </p>
                    <div className="text-sm">
                      <span className="text-gray-500">主要市場：</span>
                      <span className="text-gray-900">
                        {region.leadingMarkets.join("、")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 區域分布圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Doughnut options={regionChartOptions} data={regionChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "commodities" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.overview.commodities.map((commodity: Commodity) => (
                <div
                  key={commodity.name}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {commodity.name}
                    </h3>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        commodity.trend
                      )}`}
                    >
                      {commodity.change}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {commodity.value}
                    </span>
                    <span className="text-sm text-gray-500">
                      {commodity.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 商品價格走勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line
                  options={commodityChartOptions}
                  data={commodityChartData}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "economy" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.overview.economic.map(
                (indicator: EconomicIndicator) => (
                  <div
                    key={indicator.name}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {indicator.name}
                      </h3>
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          indicator.trend
                        )}`}
                      >
                        {indicator.change}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {indicator.value}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 經濟指標趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={economicChartOptions} data={economicChartData} />
              </div>
            </div>
          </div>
        )}

        {/* 新增：全球經濟指標儀表板 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              全球經濟指標儀表板
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[300px]">
                <Line data={economicChartData} options={economicChartOptions} />
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  區域經濟概況
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          地區
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GDP成長
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          通膨率
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketData.regions.map((region: Region) => (
                        <tr key={region.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {region.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {region.gdpGrowth}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {region.inflation}
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

        {/* 新增：央行政策追蹤器 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 mr-2 text-blue-500" />
              央行政策追蹤器
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[300px]">
                <Bar data={ratesChartData} options={economicChartOptions} />
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  主要央行動態
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          央行
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          政策立場
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          下次會議
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketData.centralBanks.map((bank: CentralBank) => (
                        <tr key={bank.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bank.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bank.stance}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bank.nextMeeting}
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
      </div>
      <Footer />
    </div>
  );
};

export default GlobalMarket;
