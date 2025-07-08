import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ClockIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  AcademicCapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import Footer from "../components/Layout/Footer";

// 優化後的 MVC 架構引入
import { UserController } from "../controllers/UserController";
import { PortfolioController } from "../controllers/PortfolioController";
import { StockController } from "../controllers/StockController";
import { User } from "../models/UserModel";

// 優化後的Hook引入
import {
  usePreloadData,
  useControllerWithRetry,
  useFormController,
} from "../hooks/useMvcController";
import { useAppInitialization } from "../utils/appInitializer";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  unlocked: boolean;
  color: string;
}

interface Activity {
  id: number;
  type: string;
  action: string;
  target: string;
  amount?: string;
  time: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface PortfolioAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // 模擬數據定義
  const favoriteStocks: Stock[] = [
    {
      symbol: "2330",
      name: "台積電",
      price: 485.5,
      change: 12.5,
      changePercent: 2.65,
      volume: "45,231",
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: 125.5,
      change: -2.0,
      changePercent: -1.57,
      volume: "89,456",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: 765.0,
      change: 8.5,
      changePercent: 1.12,
      volume: "23,789",
    },
  ];

  const portfolioAllocation: PortfolioAllocation[] = [
    {
      category: "台灣股票",
      percentage: 45,
      amount: 450000,
      color: "bg-blue-500",
    },
    {
      category: "美國股票",
      percentage: 30,
      amount: 300000,
      color: "bg-green-500",
    },
    {
      category: "債券基金",
      percentage: 15,
      amount: 150000,
      color: "bg-yellow-500",
    },
    {
      category: "現金",
      percentage: 10,
      amount: 100000,
      color: "bg-gray-500",
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: 1,
      type: "buy",
      action: "買入",
      target: "台積電 (2330)",
      amount: "48,500",
      time: "2小時前",
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "sell",
      action: "賣出",
      target: "鴻海 (2317)",
      amount: "25,100",
      time: "1天前",
      icon: CurrencyDollarIcon,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      id: 3,
      type: "dividend",
      action: "收到股息",
      target: "中華電信 (2412)",
      amount: "3,200",
      time: "3天前",
      icon: TrophyIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 4,
      type: "education",
      action: "完成課程",
      target: "技術分析基礎",
      time: "1週前",
      icon: AcademicCapIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // 應用程式初始化
  const { isLoading: isInitialized, error: appError } = useAppInitialization({
    enableCache: true,
    enableMockData: true,
  });

  // MVC 控制器實例
  const userController = UserController.getInstance();
  const portfolioController = PortfolioController.getInstance();
  const stockController = StockController.getInstance();

  // 使用優化後的預加載 Hook
  const {
    data: pageData,
    loading: pageLoading,
    errors: pageErrors,
    progress,
    isComplete,
    reload: reloadPageData,
  } = usePreloadData(
    {
      user: () => userController.getUserProfile("user_001"),
      investmentStats: () => userController.getInvestmentStats(),
      achievements: () => userController.getAchievements(),
      activities: () => userController.getRecentActivities(),
      watchlist: () => stockController.getWatchlist(),
      allocation: () => portfolioController.getAllocation("user_001"),
      portfolios: () => portfolioController.getUserPortfolios("user_001"),
    },
    {
      priority: [
        "user",
        "investmentStats",
        "allocation",
        "watchlist",
        "activities",
        "achievements",
        "portfolios",
      ],
      concurrent: false,
      onProgress: (loaded, total) => {
        console.log(`用戶資料預加載進度: ${loaded}/${total}`);
      },
    }
  );

  // 個人資料表單Hook
  const {
    values: profileValues,
    setValue: setProfileValue,
    handleSubmit: handleProfileSubmit,
  } = useFormController(
    {
      name: pageData.user?.name || "",
      email: pageData.user?.email || "",
      phone: pageData.user?.phone || "",
      bio: pageData.user?.bio || "",
      riskLevel: pageData.user?.riskLevel || "穩健型",
    },
    async (values) => {
      if (!pageData.user) return;

      await userController.updateUserProfile(pageData.user.id, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
        riskLevel: values.riskLevel,
      });

      setIsEditing(false);
      // 重新載入用戶資料
      await reloadPageData();
    },
    (values) => ({
      name: !values.name.trim() ? "姓名不能為空" : null,
      email: !values.email.includes("@") ? "請輸入有效的電子郵件" : null,
      phone:
        values.phone && !/^\d{10}$/.test(values.phone.replace(/\D/g, ""))
          ? "請輸入有效的電話號碼"
          : null,
      bio: null,
      riskLevel: null,
    })
  );

  // 實時數據更新
  const {} = useControllerWithRetry(() => userController.getInvestmentStats(), {
    maxRetries: 3,
    retryDelay: 2000,
    retryCondition: (error) => error.message.includes("網路"),
    onRetry: (attempt, error) => {
      console.log(`重試獲取投資統計第 ${attempt} 次，錯誤:`, error.message);
    },
    cacheKey: "user_investment_stats",
    cacheTTL: 60000, // 1分鐘緩存
  });

  // 模擬成就數據
  const defaultAchievements: Achievement[] = [
    {
      id: 1,
      name: "投資新手",
      description: "完成第一筆投資交易",
      icon: TrophyIcon,
      unlocked: true,
      color: "text-yellow-600",
    },
    {
      id: 2,
      name: "學習達人",
      description: "完成5個投資課程",
      icon: AcademicCapIcon,
      unlocked: true,
      color: "text-blue-600",
    },
    {
      id: 3,
      name: "穩健投資者",
      description: "連續3個月獲得正報酬",
      icon: ArrowTrendingUpIcon,
      unlocked: false,
      color: "text-green-600",
    },
    {
      id: 4,
      name: "多元化專家",
      description: "投資組合包含5種不同資產類別",
      icon: ChartBarIcon,
      unlocked: false,
      color: "text-purple-600",
    },
  ];

  // 從預加載數據中提取，並提供默認值
  const { user: investmentStats, achievements = defaultAchievements } =
    pageData;

  // 當用戶數據載入後，更新表單值和本地用戶狀態
  useEffect(() => {
    if (pageData.user && !isEditing) {
      setUser(pageData.user);
      setProfileValue("name", pageData.user.name);
      setProfileValue("email", pageData.user.email);
      setProfileValue("phone", pageData.user.phone || "");
      setProfileValue("bio", pageData.user.bio || "");
      setProfileValue("riskLevel", pageData.user.riskLevel || "穩健型");
    }
  }, [pageData.user, isEditing, setProfileValue]);

  // 輔助函數
  const handleSaveProfile = async () => {
    try {
      await handleProfileSubmit();
    } catch (error) {
      console.error("保存個人資料失敗:", error);
    }
  };

  // 標籤定義
  const tabs: Tab[] = [
    { id: "overview", name: "總覽", icon: ChartBarIcon },
    { id: "portfolio", name: "投資組合", icon: BriefcaseIcon },
    { id: "activities", name: "活動記錄", icon: ClockIcon },
    { id: "achievements", name: "成就", icon: TrophyIcon },
    { id: "settings", name: "設定", icon: CogIcon },
  ];

  // 應用程式載入檢查
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">正在初始化應用程式...</p>
          {appError && <p className="text-red-500 text-sm mt-2">{appError}</p>}
        </div>
      </div>
    );
  }

  // 數據載入中
  if (pageLoading && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-gray-600">
            載入個人資料中... ({progress.loaded}/{progress.total})
          </p>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(pageErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              載入失敗
            </h2>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(pageErrors).map(([key, error]) => (
                <li key={key}>
                  {key}: {error}
                </li>
              ))}
            </ul>
            <button
              onClick={reloadPageData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 沒有用戶數據
  if (!user && !pageData.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              找不到用戶資料
            </h3>
            <p className="text-gray-600 mb-4">請先登入您的帳戶</p>
            <button
              onClick={() => (window.location.href = "/auth")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              前往登入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 使用實時數據或預載數據
  const currentUser = user || pageData.user;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* 頂部橫幅 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {currentUser?.name}
                  </h1>
                  <p className="text-blue-100 text-lg">{currentUser?.level}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-blue-100">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {currentUser?.location}
                    </div>
                    <div className="flex items-center text-blue-100">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {currentUser?.joinDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左側快速統計 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 核心數據卡片 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  核心數據
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">總資產</p>
                        <p className="font-bold text-gray-900">
                          NT${" "}
                          {investmentStats
                            ? (investmentStats.totalValue / 10000).toFixed(0)
                            : "0"}
                          萬
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">
                        +{investmentStats?.returnRate || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">月報酬率</p>
                        <p className="font-bold text-gray-900">
                          {investmentStats?.monthlyReturn || 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <TrophyIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">勝率</p>
                        <p className="font-bold text-gray-900">
                          {investmentStats?.winRate || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 收藏股票 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    關注股票
                  </h3>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {favoriteStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {stock.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            成交量: {stock.volume}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {stock.price}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              stock.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.change >= 0 ? "+" : ""}
                            {stock.change} ({stock.changePercent}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 投資組合分佈 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  資產配置
                </h3>
                <div className="space-y-4">
                  {portfolioAllocation.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {item.category}
                        </span>
                        <span className="text-gray-900">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        NT$ {item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側主要內容 */}
            <div className="lg:col-span-3">
              {/* 標籤導航 */}
              <div className="bg-white rounded-2xl shadow-xl mb-8 border border-gray-100">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-1 px-6">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center py-4 px-6 font-medium text-sm transition-all duration-200 border-b-3 ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600 bg-blue-50"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-2" />
                          {tab.name}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-8">
                  {activeTab === "overview" && (
                    <div className="space-y-8">
                      {/* 績效概覽 */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          績效概覽
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-100 text-sm font-medium">
                                  總資產價值
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                  NT${" "}
                                  {investmentStats
                                    ? (
                                        investmentStats.totalValue / 10000
                                      ).toFixed(0)
                                    : "0"}
                                  萬
                                </p>
                                <p className="text-blue-100 text-sm mt-1">
                                  較上月 +{investmentStats?.monthlyReturn || 0}%
                                </p>
                              </div>
                              <CurrencyDollarIcon className="h-12 w-12 text-blue-200" />
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-100 text-sm font-medium">
                                  總收益
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                  NT${" "}
                                  {investmentStats
                                    ? (
                                        investmentStats.totalReturn / 10000
                                      ).toFixed(0)
                                    : "0"}
                                  萬
                                </p>
                                <p className="text-green-100 text-sm mt-1">
                                  報酬率 {investmentStats?.returnRate || 0}%
                                </p>
                              </div>
                              <ArrowTrendingUpIcon className="h-12 w-12 text-green-200" />
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-100 text-sm font-medium">
                                  最佳持股
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                  {investmentStats?.bestStock || "暫無數據"}
                                </p>
                                <p className="text-purple-100 text-sm mt-1">
                                  勝率 {investmentStats?.winRate || 0}%
                                </p>
                              </div>
                              <TrophyIcon className="h-12 w-12 text-purple-200" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 最近活動 */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            最近活動
                          </h3>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            查看全部
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                              <div
                                key={activity.id}
                                className="flex items-center p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-200"
                              >
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.bgColor}`}
                                >
                                  <Icon
                                    className={`h-6 w-6 ${activity.color}`}
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {activity.action} {activity.target}
                                  </p>
                                  {activity.amount && (
                                    <p className="text-gray-500 text-sm mt-1">
                                      金額：NT$ {activity.amount}
                                    </p>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 font-medium">
                                  {activity.time}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "portfolio" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                          我的投資組合
                        </h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          新增投資
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">
                                投資組合 {index + 1}
                              </h4>
                              <span className="text-green-600 text-sm font-medium">
                                +12.5%
                              </span>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">總價值</span>
                                <span className="font-medium">NT$ 45.6萬</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">持股數量</span>
                                <span className="font-medium">8檔</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">最佳表現</span>
                                <span className="font-medium text-green-600">
                                  台積電 +15.2%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "activities" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        活動記錄
                      </h3>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div
                              key={activity.id}
                              className="flex items-center justify-between p-6 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.bgColor}`}
                                >
                                  <Icon
                                    className={`h-5 w-5 ${activity.color}`}
                                  />
                                </div>
                                <div className="ml-4">
                                  <p className="font-semibold text-gray-900">
                                    {activity.action} {activity.target}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {activity.time}
                                  </p>
                                </div>
                              </div>
                              {activity.amount && (
                                <span className="text-sm font-semibold text-gray-900">
                                  NT$ {activity.amount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "achievements" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        我的成就
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {achievements.map((achievement: Achievement) => {
                          const Icon = achievement.icon;
                          return (
                            <div
                              key={achievement.id}
                              className={`p-6 border-2 rounded-2xl transition-all ${
                                achievement.unlocked
                                  ? "border-yellow-200 bg-yellow-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    achievement.unlocked
                                      ? "bg-yellow-100"
                                      : "bg-gray-200"
                                  }`}
                                >
                                  <Icon
                                    className={`h-6 w-6 ${
                                      achievement.unlocked
                                        ? achievement.color
                                        : "text-gray-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <h4
                                    className={`font-semibold ${
                                      achievement.unlocked
                                        ? "text-gray-900"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {achievement.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>
                              {achievement.unlocked && (
                                <div className="mt-3 flex items-center text-sm text-yellow-600">
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  已解鎖
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div className="space-y-8">
                      <h3 className="text-xl font-bold text-gray-900">
                        個人設定
                      </h3>

                      {/* 個人資料設定 */}
                      <div className="bg-gray-50 p-8 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-semibold text-gray-900">
                            個人資料
                          </h4>
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            {isEditing ? "取消編輯" : "編輯資料"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              姓名
                            </label>
                            <input
                              type="text"
                              value={profileValues.name}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setProfileValue("name", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              電子信箱
                            </label>
                            <input
                              type="email"
                              value={profileValues.email}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setProfileValue("email", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              電話號碼
                            </label>
                            <input
                              type="tel"
                              value={profileValues.phone}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setProfileValue("phone", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              風險偏好
                            </label>
                            <select
                              value={profileValues.riskLevel}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setProfileValue("riskLevel", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                            >
                              <option value="保守型">保守型</option>
                              <option value="穩健型">穩健型</option>
                              <option value="積極型">積極型</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            個人簡介
                          </label>
                          <textarea
                            value={profileValues.bio}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setProfileValue("bio", e.target.value)
                            }
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                            placeholder="請介紹您的投資理念和經驗..."
                          />
                        </div>

                        {isEditing && (
                          <div className="mt-6 flex space-x-4">
                            <button
                              onClick={handleSaveProfile}
                              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                              保存變更
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 通知設定 */}
                      <div className="bg-gray-50 p-8 rounded-2xl">
                        <h4 className="text-lg font-semibold text-gray-900 mb-6">
                          通知設定
                        </h4>
                        <div className="space-y-6">
                          {[
                            {
                              title: "電子郵件通知",
                              desc: "接收投資組合變動和市場動態通知",
                              checked: true,
                            },
                            {
                              title: "價格提醒",
                              desc: "當關注股票價格達到設定條件時通知",
                              checked: true,
                            },
                            {
                              title: "學習提醒",
                              desc: "新課程和文章發布通知",
                              checked: false,
                            },
                            {
                              title: "成就通知",
                              desc: "解鎖新成就時的通知",
                              checked: true,
                            },
                          ].map((setting, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-white rounded-xl"
                            >
                              <div>
                                <label className="text-sm font-medium text-gray-900">
                                  {setting.title}
                                </label>
                                <p className="text-sm text-gray-500 mt-1">
                                  {setting.desc}
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                defaultChecked={setting.checked}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProfilePage;
