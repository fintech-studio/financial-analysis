import React, { useState } from "react";
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalculatorIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon as SearchIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  PlayCircleIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon as FilterIcon,
} from "@heroicons/react/24/outline";

interface FeaturedContent {
  id: number;
  title: string;
  description: string;
  type: string;
  popularity: string;
  image: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  icon: React.ComponentType<{ className?: string }>;
  topics: string[];
  progress: number;
}

interface Tool {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: string;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

type TabId = "featured" | "courses" | "tools" | "resources" | "forum";
type DifficultyLevel = "all" | "beginner" | "intermediate" | "advanced";

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("featured");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("all");

  // 精選內容
  const featuredContent: FeaturedContent[] = [
    {
      id: 1,
      title: "2025投資新趨勢",
      description: "了解AI、綠能、半導體等新興科技的投資機會",
      type: "專題研究",
      popularity: "熱門",
      image: "/images/education/trends.jpg",
    },
    {
      id: 2,
      title: "資產配置基礎",
      description: "學習如何根據風險承受度和時間範圍配置您的投資組合",
      type: "入門指南",
      popularity: "推薦",
      image: "/images/education/allocation.jpg",
    },
    {
      id: 3,
      title: "通膨環境的投資策略",
      description: "掌握高通膨時期的投資技巧與防禦策略",
      type: "進階策略",
      popularity: "新增",
      image: "/images/education/inflation.jpg",
    },
  ];

  // 課程內容增強
  const courses: Course[] = [
    {
      id: 1,
      title: "投資基礎入門",
      description:
        "學習投資的基本概念、風險管理和投資策略，適合初次接觸投資的朋友",
      duration: "4週",
      level: "初學者",
      rating: 4.9,
      students: 1240,
      icon: AcademicCapIcon,
      topics: ["風險與回報", "基本投資工具", "投資心理學", "組合建構基礎"],
      progress: 0,
    },
    {
      id: 2,
      title: "技術分析進階",
      description: "深入學習各種技術指標和圖表分析方法，掌握市場趨勢判斷技巧",
      duration: "6週",
      level: "進階",
      rating: 4.7,
      students: 856,
      icon: ChartBarIcon,
      topics: ["蠟燭圖分析", "技術指標應用", "市場循環", "交易系統建立"],
      progress: 0,
    },
    {
      id: 3,
      title: "基本面分析",
      description: "學習如何分析公司財務報表和產業趨勢，找出被低估的優質公司",
      duration: "5週",
      level: "中級",
      rating: 4.8,
      students: 932,
      icon: BookOpenIcon,
      topics: ["財務報表解析", "估值模型", "產業分析", "競爭優勢評估"],
      progress: 0,
    },
    {
      id: 4,
      title: "投資心理學",
      description: "了解情緒如何影響投資決策，學習克服心理偏誤的實用方法",
      duration: "4週",
      level: "適合所有人",
      rating: 4.9,
      students: 1105,
      icon: UserGroupIcon,
      topics: ["行為金融學", "認知偏誤", "情緒控制", "紀律交易"],
      progress: 0,
    },
    {
      id: 5,
      title: "退休規劃專題",
      description: "建立長期財務目標，規劃退休投資策略與資產分配",
      duration: "3週",
      level: "中級",
      rating: 4.6,
      students: 789,
      icon: BanknotesIcon,
      topics: ["退休資產計算", "提取策略", "稅務規劃", "遺產安排"],
      progress: 0,
    },
    {
      id: 6,
      title: "風險管理實務",
      description: "學習如何控制投資風險，保護您的投資組合",
      duration: "4週",
      level: "進階",
      rating: 4.7,
      students: 673,
      icon: ShieldCheckIcon,
      topics: ["風險類型識別", "避險策略", "投組優化", "壓力測試"],
      progress: 0,
    },
  ];

  // 互動工具
  const tools: Tool[] = [
    {
      id: 1,
      title: "投資計算器",
      description:
        "計算投資報酬率、複利效果和風險評估，幫助您做出明智的投資決策",
      icon: CalculatorIcon,
      popular: true,
    },
    {
      id: 2,
      title: "投資組合分析工具",
      description: "上傳您的投資組合，分析風險水準、潛在回報與改進建議",
      icon: TrendingUpIcon,
      popular: false,
    },
    {
      id: 3,
      title: "財務目標規劃",
      description: "設定您的財務目標，獲取達成目標的詳細路徑圖與資產配置建議",
      icon: BanknotesIcon,
      popular: true,
    },
  ];

  // 學習資源
  const resources: Resource[] = [
    {
      id: 1,
      title: "投資詞彙表",
      description: "解釋200+常用的投資術語和概念，隨時查閱",
      icon: DocumentTextIcon,
      type: "參考資料",
    },
    {
      id: 2,
      title: "投資策略指南",
      description: "各種投資策略的詳細說明和應用，包含實例分析",
      icon: LightBulbIcon,
      type: "研究報告",
    },
    {
      id: 3,
      title: "市場週報",
      description: "每週市場回顧與展望，掌握最新投資趨勢",
      icon: ChartBarIcon,
      type: "定期報告",
    },
    {
      id: 4,
      title: "經典投資書籍摘要",
      description: "20本投資經典著作的核心概念與重點摘要",
      icon: BookOpenIcon,
      type: "學習指南",
    },
  ];

  const tabs: Tab[] = [
    { id: "featured", name: "精選內容", icon: StarIcon },
    { id: "courses", name: "投資課程", icon: AcademicCapIcon },
    { id: "tools", name: "互動工具", icon: CalculatorIcon },
    { id: "resources", name: "學習資源", icon: BookOpenIcon },
    { id: "forum", name: "討論區", icon: ChatBubbleLeftRightIcon },
  ];

  // 根據難度和搜索詞過濾課程
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchTerm === "" ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficulty === "all" ||
      (difficulty === "beginner" && course.level === "初學者") ||
      (difficulty === "intermediate" && course.level === "中級") ||
      (difficulty === "advanced" && course.level === "進階");

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 頂部橫幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl text-white md:text-4xl font-bold mb-4">
              投資理財知識中心
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              探索我們精心準備的課程、工具和資源，提升您的投資知識和技能
            </p>
            <div className="relative max-w-lg">
              <input
                type="text"
                placeholder="搜尋課程、工具或資源..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-white opacity-70" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 標籤導航 */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-2 sm:px-6">
              <nav className="flex overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabId)}
                      className={`flex items-center py-5 px-3 sm:px-4 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 精選內容 */}
          {activeTab === "featured" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">精選內容</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredContent.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://source.unsplash.com/random/800x600?${encodeURIComponent(
                          item.title
                        )})`,
                        backgroundColor: "#e2e8f0",
                      }}
                    ></div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {item.type}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.popularity === "熱門"
                              ? "bg-red-100 text-red-800"
                              : item.popularity === "推薦"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.popularity}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <button className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-800">
                        立即查看
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      新手投資人專區
                    </h3>
                    <p className="text-gray-600 max-w-2xl">
                      不確定從何開始？我們為新手投資者精心策劃了一系列指南，幫助您踏上投資之旅。
                    </p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
                    探索新手指南
                  </button>
                </div>
              </div>

              {/* 熱門課程 */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">熱門課程</h2>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center"
                  >
                    查看全部課程
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {courses.slice(0, 3).map((course) => {
                    const Icon = course.icon;
                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {course.rating}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>{course.students} 名學員</span>
                          </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                          <PlayCircleIcon className="h-5 w-5 mr-2" />
                          開始學習
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 常見問題 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  常見問題
                </h2>
                <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                  <div className="p-6">
                    <h3 className="flex items-start">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-lg font-medium text-gray-900">
                        如何選擇適合我的投資課程？
                      </span>
                    </h3>
                    <p className="text-gray-600 mt-2 pl-8">
                      根據您的經驗水平、投資目標和感興趣的市場來選擇課程。我們的課程頁面提供詳細的難度和主題分類，讓您能夠找到最適合的學習資源。
                    </p>
                  </div>
                  <div className="p-6">
                    <h3 className="flex items-start">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-lg font-medium text-gray-900">
                        理財知識中心的內容如何更新？
                      </span>
                    </h3>
                    <p className="text-gray-600 mt-2 pl-8">
                      我們定期更新課程和學習資源，以反映最新的市場趨勢和投資策略。您可以訂閱我們的電子郵件通訊，獲取關於新內容的通知。
                    </p>
                  </div>
                  <div className="p-6">
                    <h3 className="flex items-start">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-lg font-medium text-gray-900">
                        如何追蹤我的學習進度？
                      </span>
                    </h3>
                    <p className="text-gray-600 mt-2 pl-8">
                      登入您的帳戶後，系統會自動追蹤您的學習進度。您可以在「我的學習」頁面查看已完成和進行中的課程，以及您的成就和證書。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 課程內容 */}
          {activeTab === "courses" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">投資課程</h2>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-white rounded-md px-3 py-1.5 shadow-sm border border-gray-200">
                    <FilterIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <select
                      className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 pr-6 appearance-none cursor-pointer"
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(e.target.value as DifficultyLevel)
                      }
                    >
                      <option value="all">所有難度</option>
                      <option value="beginner">初學者</option>
                      <option value="intermediate">中級</option>
                      <option value="advanced">進階</option>
                    </select>
                  </div>

                  <div className="relative flex-grow max-w-xs">
                    <input
                      type="text"
                      placeholder="搜尋課程..."
                      className="w-full pl-9 pr-4 py-1.5 rounded-md border border-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchIcon className="absolute left-3 top-2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const Icon = course.icon;
                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex justify-between">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-700 ml-1">
                                {course.rating}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {course.topics.slice(0, 3).map((topic, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                            {course.topics.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{course.topics.length - 3} 更多
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              <span>{course.students} 名學員</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">課程進度</span>
                              <span className="text-gray-600">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                              <PlayCircleIcon className="h-5 w-5 mr-2" />
                              {course.progress > 0 ? "繼續學習" : "開始學習"}
                            </button>
                            <button className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                              <BookmarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    沒有找到符合條件的課程
                  </h3>
                  <p className="text-gray-500">
                    請嘗試調整搜尋條件或瀏覽其他類別的課程
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setDifficulty("all");
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    清除所有篩選條件
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 互動工具 */}
          {activeTab === "tools" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">互動工具</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
                    >
                      {tool.popular && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                            熱門
                          </span>
                        </div>
                      )}
                      <div className="p-3 bg-blue-100 rounded-lg w-fit">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        開始使用
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 工具使用統計 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  本週最受歡迎的工具
                </h3>
                <div className="space-y-4">
                  {tools
                    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
                    .map((tool, index) => {
                      const Icon = tool.icon;
                      const usagePercentage = [85, 72, 58][index] || 45;
                      return (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {tool.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${usagePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {usagePercentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* 學習資源 */}
          {activeTab === "resources" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">學習資源</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <div
                      key={resource.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {resource.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {resource.description}
                      </p>
                      <button className="flex items-center text-green-600 font-medium text-sm hover:text-green-800">
                        查看詳細內容
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 最新更新 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  最新更新的資源
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          2025年投資市場展望報告
                        </h4>
                        <p className="text-sm text-gray-600">
                          分析來年投資趨勢與機會
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2天前</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <ChartBarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          ESG投資策略指南更新
                        </h4>
                        <p className="text-sm text-gray-600">
                          可持續投資的最新發展
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">5天前</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <BookOpenIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          新增詞彙：DeFi與加密貨幣術語
                        </h4>
                        <p className="text-sm text-gray-600">
                          50+新術語加入投資詞彙表
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1週前</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 討論區 */}
          {activeTab === "forum" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">投資討論區</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  發起新討論
                </button>
              </div>

              {/* 熱門討論話題 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔥 熱門討論話題
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        2025年該如何調整投資組合？
                      </h4>
                      <span className="text-xs text-gray-500">2小時前</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      面對通膨壓力和利率變化，大家都是如何調整自己的投資策略的？想聽聽各位的經驗分享...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>投資者小明 發起</span>
                      <div className="flex items-center space-x-4">
                        <span>💬 23 回覆</span>
                        <span>👍 15 讚</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        AI概念股還值得投資嗎？
                      </h4>
                      <span className="text-xs text-gray-500">5小時前</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      看到AI股票漲了一年多，現在還適合進場嗎？有沒有具體的標的推薦？
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>科技控 發起</span>
                      <div className="flex items-center space-x-4">
                        <span>💬 31 回覆</span>
                        <span>👍 22 讚</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        新手請教：該如何開始定期定額投資？
                      </h4>
                      <span className="text-xs text-gray-500">1天前</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      剛開始工作，想要開始投資但不知道從何入手。聽說定期定額是不錯的選擇...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>投資新手 發起</span>
                      <div className="flex items-center space-x-4">
                        <span>💬 18 回覆</span>
                        <span>👍 12 讚</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 分類討論 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📊 股票投資
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        台股分析與討論
                      </div>
                      <div className="text-gray-500">156 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        美股投資心得
                      </div>
                      <div className="text-gray-500">89 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        技術分析討論
                      </div>
                      <div className="text-gray-500">67 主題</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🏠 基金與ETF
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        ETF投資策略
                      </div>
                      <div className="text-gray-500">92 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        基金選擇心得
                      </div>
                      <div className="text-gray-500">74 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        資產配置討論
                      </div>
                      <div className="text-gray-500">58 主題</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💰 理財規劃
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        退休規劃討論
                      </div>
                      <div className="text-gray-500">43 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        保險規劃心得
                      </div>
                      <div className="text-gray-500">36 主題</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        理財新手區
                      </div>
                      <div className="text-gray-500">128 主題</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
