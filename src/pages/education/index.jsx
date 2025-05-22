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

const EducationPage = () => {
  const [activeTab, setActiveTab] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  // 精選內容
  const featuredContent = [
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
  const courses = [
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
  const tools = [
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
  const resources = [
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

  const tabs = [
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
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
                      onClick={() => setActiveTab(tab.id)}
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
                      onChange={(e) => setDifficulty(e.target.value)}
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
                                +{course.topics.length - 3}
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

                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <span className="mr-2">難度:</span>
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                course.level === "初學者"
                                  ? "bg-green-100 text-green-800"
                                  : course.level === "中級"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : course.level === "進階"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {course.level}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center">
                              <PlayCircleIcon className="h-4 w-4 mr-1" />
                              開始學習
                            </button>
                            <button className="px-3 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
                              <BookmarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-10 text-center">
                  <p className="text-lg text-gray-600 mb-4">
                    沒有找到符合條件的課程
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setDifficulty("all");
                    }}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    清除所有過濾條件
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 互動工具 */}
          {activeTab === "tools" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">互動工具</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <tool.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      {tool.popular && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          熱門工具
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{tool.description}</p>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      使用工具
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      需要自訂分析工具？
                    </h3>
                    <p className="text-gray-600 max-w-2xl">
                      我們的專業團隊可以協助您打造符合特定需求的投資分析工具和儀表板。
                    </p>
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    聯絡我們
                  </button>
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
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                          <Icon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {resource.title}
                            </h3>
                            <span className="ml-3 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                              {resource.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pl-12">
                        <button className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                          查看詳情
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  熱門電子書
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      投資者心理學指南
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">免費下載</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      指數投資策略
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">免費下載</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      退休理財規劃
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">免費下載</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="aspect-[3/4] bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <BookOpenIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      風險管理實務
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">免費下載</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 討論區 */}
          {activeTab === "forum" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">社群討論區</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
                  發起新話題
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">熱門討論</h3>
                  <div className="flex space-x-2">
                    <button className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      最新
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                      熱門
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  <div className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        關於美國利率政策對台股的影響分析
                      </h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full h-fit">
                        市場分析
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      最近美國聯準會的利率政策變化，對台股可能產生什麼影響？有哪些產業會特別受益或受害？
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <span>由 投資達人 發起</span>
                        <span className="mx-2">•</span>
                        <span>2天前</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>24 回覆</span>
                        <span className="mx-2">•</span>
                        <span>318 瀏覽</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        對新手來說，哪種投資方式風險較低且易入門？
                      </h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full h-fit">
                        新手提問
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      剛接觸投資，想找風險較低的入門方式。ETF、定存還是基金比較適合？預算約10萬，希望能獲得穩定成長。
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <span>由 新手投資者 發起</span>
                        <span className="mx-2">•</span>
                        <span>5天前</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>37 回覆</span>
                        <span className="mx-2">•</span>
                        <span>452 瀏覽</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        如何分析一家公司的財務報表？有什麼關鍵指標？
                      </h4>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full h-fit">
                        經驗分享
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      想學習如何透過財報分析公司基本面，有哪些重要的財務指標需要關注？如何判斷一家公司的財務健康狀況？
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <span>由 價值投資者 發起</span>
                        <span className="mx-2">•</span>
                        <span>1週前</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>18 回覆</span>
                        <span className="mx-2">•</span>
                        <span>276 瀏覽</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
                  <button className="text-blue-600 font-medium hover:text-blue-800">
                    查看更多討論
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 訂閱區塊 */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              訂閱最新投資教育內容
            </h2>
            <p className="text-lg opacity-90 mb-8">
              獲取每週精選的投資見解、最新的課程更新和市場分析
            </p>
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
              <input
                type="email"
                placeholder="您的電子郵件"
                className="px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 flex-grow"
              />
              <button className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-opacity-90 transition-colors whitespace-nowrap">
                立即訂閱
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
