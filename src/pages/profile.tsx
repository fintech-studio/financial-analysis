import React, { useState } from "react";
import {
  ChartBarIcon,
  BriefcaseIcon,
  ClockIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, PlusIcon } from "@heroicons/react/24/solid";

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  bio: string;
  avatar: string;
  location: string;
  riskLevel: string;
  level: string;
}

interface InvestmentStats {
  totalValue: number;
  totalReturn: number;
  returnRate: number;
  portfolioCount: number;
  watchlistCount: number;
  articlesRead: number;
  coursesCompleted: number;
  monthlyReturn: number;
  bestStock: string;
  winRate: number;
}

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
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "王小明",
    email: "wang.xiaoming@example.com",
    phone: "0912-345-678",
    joinDate: "2023年3月15日",
    bio: "專注於價值投資與長期持有策略的投資者，致力於研究基本面分析與市場趨勢。",
    avatar: "/images/default-avatar.png",
    location: "台北市",
    riskLevel: "穩健型",
    level: "進階投資者",
  });

  // 投資數據統計
  const investmentStats: InvestmentStats = {
    totalValue: 1250000,
    totalReturn: 125000,
    returnRate: 11.2,
    portfolioCount: 3,
    watchlistCount: 15,
    articlesRead: 87,
    coursesCompleted: 5,
    monthlyReturn: 8.5,
    bestStock: "台積電",
    winRate: 72.5,
  };

  // 成就系統
  const achievements: Achievement[] = [
    {
      id: 1,
      name: "第一筆投資",
      description: "完成首次股票投資",
      icon: TrophyIcon,
      unlocked: true,
      color: "text-yellow-500",
    },
    {
      id: 2,
      name: "學習達人",
      description: "完成10堂投資課程",
      icon: AcademicCapIcon,
      unlocked: true,
      color: "text-blue-500",
    },
    {
      id: 3,
      name: "連續獲利",
      description: "連續3個月獲利",
      icon: FireIcon,
      unlocked: true,
      color: "text-red-500",
    },
    {
      id: 4,
      name: "分析高手",
      description: "閱讀100篇分析文章",
      icon: BookmarkIcon,
      unlocked: false,
      color: "text-purple-500",
    },
  ];

  // 最近活動
  const recentActivities: Activity[] = [
    {
      id: 1,
      type: "trade",
      action: "買入",
      target: "台積電 (2330)",
      amount: "50,000",
      time: "2小時前",
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 2,
      type: "watchlist",
      action: "關注",
      target: "聯發科 (2454)",
      time: "5小時前",
      icon: EyeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 3,
      type: "article",
      action: "閱讀",
      target: "半導體產業分析報告",
      time: "1天前",
      icon: BookmarkIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 4,
      type: "course",
      action: "完成",
      target: "技術分析基礎課程",
      time: "3天前",
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  // 收藏的股票
  const favoriteStocks: Stock[] = [
    {
      symbol: "2330",
      name: "台積電",
      price: 562,
      change: 8,
      changePercent: 1.44,
      volume: "12.5M",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: 758,
      change: -12,
      changePercent: -1.56,
      volume: "3.2M",
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: 108.5,
      change: 2.5,
      changePercent: 2.36,
      volume: "8.7M",
    },
    {
      symbol: "3008",
      name: "大立光",
      price: 2890,
      change: -45,
      changePercent: -1.53,
      volume: "1.1M",
    },
  ];

  // 投資組合分佈
  const portfolioAllocation: PortfolioAllocation[] = [
    {
      category: "科技股",
      percentage: 45,
      amount: 562500,
      color: "bg-blue-500",
    },
    {
      category: "金融股",
      percentage: 25,
      amount: 312500,
      color: "bg-green-500",
    },
    {
      category: "傳產股",
      percentage: 20,
      amount: 250000,
      color: "bg-yellow-500",
    },
    {
      category: "現金",
      percentage: 10,
      amount: 125000,
      color: "bg-gray-500",
    },
  ];

  const tabs: Tab[] = [
    { id: "overview", name: "總覽", icon: ChartBarIcon },
    { id: "portfolio", name: "投資組合", icon: BriefcaseIcon },
    { id: "activities", name: "活動記錄", icon: ClockIcon },
    { id: "achievements", name: "成就", icon: TrophyIcon },
    { id: "settings", name: "設定", icon: CogIcon },
  ];

  const handleSaveProfile = (): void => {
    setIsEditing(false);
    // 這裡可以添加保存邏輯
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 頂部橫幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                  {userInfo.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userInfo.name}
                </h1>
                <p className="text-blue-100 text-lg">{userInfo.level}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-blue-100">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {userInfo.location}
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    {userInfo.joinDate}
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
                        NT$ {(investmentStats.totalValue / 10000).toFixed(0)}萬
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">
                      +{investmentStats.returnRate}%
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
                        {investmentStats.monthlyReturn}%
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
                        {investmentStats.winRate}%
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
                      <span className="text-gray-900">{item.percentage}%</span>
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

              {/* ...existing code... (其餘的標籤內容部分保持不變) */}
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
                                {(investmentStats.totalValue / 10000).toFixed(
                                  0
                                )}
                                萬
                              </p>
                              <p className="text-blue-100 text-sm mt-1">
                                較上月 +{investmentStats.monthlyReturn}%
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
                                {(investmentStats.totalReturn / 10000).toFixed(
                                  0
                                )}
                                萬
                              </p>
                              <p className="text-green-100 text-sm mt-1">
                                報酬率 {investmentStats.returnRate}%
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
                                {investmentStats.bestStock}
                              </p>
                              <p className="text-purple-100 text-sm mt-1">
                                勝率 {investmentStats.winRate}%
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
                                <Icon className={`h-6 w-6 ${activity.color}`} />
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
                                <Icon className={`h-5 w-5 ${activity.color}`} />
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
                      {achievements.map((achievement) => {
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
                            value={userInfo.name}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setUserInfo({ ...userInfo, name: e.target.value })
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
                            value={userInfo.email}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                email: e.target.value,
                              })
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
                            value={userInfo.phone}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            風險偏好
                          </label>
                          <select
                            value={userInfo.riskLevel}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setUserInfo({
                                ...userInfo,
                                riskLevel: e.target.value,
                              })
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
                          value={userInfo.bio}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setUserInfo({ ...userInfo, bio: e.target.value })
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
  );
};

export default ProfilePage;
