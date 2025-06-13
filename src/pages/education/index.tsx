import React, { useState, useEffect } from "react";
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
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// MVC 架構引入
import { EducationController } from "../../controllers/EducationController";
import { UserController } from "../../controllers/UserController";
import {
  useMvcController,
  useDataLoader,
  usePaginatedData,
} from "../../hooks/useMvcController";
import {
  Course,
  Tool,
  FeaturedContent,
  LearningProgress,
  EducationResource,
} from "../../models/EducationModel";
import { User } from "../../models/UserModel";

// 傳統介面保持向後兼容
interface FeaturedContentLegacy {
  id: number;
  title: string;
  description: string;
  type: string;
  popularity: string;
  image: string;
}

interface CourseLegacy {
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

interface ToolLegacy {
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

// 模擬論壇貼文介面
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  replies: number;
  likes: number;
  isHot: boolean;
}

type TabId = "featured" | "courses" | "tools" | "resources" | "forum";
type DifficultyLevel = "all" | "beginner" | "intermediate" | "advanced";

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("featured");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("all");

  // MVC 架構相關狀態 - 添加缺失的狀態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // MVC 控制器實例
  const educationController = EducationController.getInstance();
  const userController = new UserController();

  // 使用 MVC Hooks 管理各種數據
  const {
    data: user,
    loading: userLoading,
    error: userError,
    execute: executeUser,
  } = useMvcController<User>();

  const {
    data: featuredContent,
    loading: featuredLoading,
    error: featuredError,
  } = useDataLoader(
    () => educationController.getRecommendedResources("初級"),
    [] as EducationResource[],
    {
      onSuccess: (data) => console.log("精選內容載入成功:", data),
      onError: (error) => console.error("精選內容載入失敗:", error),
    }
  );

  // 使用分頁Hook管理課程數據
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
    currentPage: coursePage,
    totalPages: courseTotalPages,
    loadPage: loadCoursePage,
    nextPage: nextCoursePage,
    prevPage: prevCoursePage,
  } = usePaginatedData(
    (page, limit) =>
      educationController
        .getAllResources({
          page,
          limit,
          type: "course",
          level: difficulty !== "all" ? difficulty : undefined,
          // 移除不支援的search參數，改用title搜尋
        })
        .then((result) => ({
          data: result.resources.filter(
            (resource) =>
              !searchTerm ||
              resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              resource.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          ),
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        })),
    10
  );

  const {
    data: tools,
    loading: toolsLoading,
    execute: executeTools,
  } = useMvcController<EducationResource[]>();

  const {
    data: forumPosts,
    loading: forumLoading,
    execute: executeForumPosts,
  } = useMvcController<ForumPost[]>();

  const {
    data: userProgress,
    loading: progressLoading,
    execute: executeProgress,
  } = useMvcController<LearningProgress[]>();

  // 載入用戶資料
  const loadUserData = async () => {
    const userId = "user_001";
    await executeUser(() => userController.getUserProfile(userId));
  };

  // 載入工具數據
  const loadTools = async () => {
    const result = await educationController.getAllResources({ type: "tool" });
    await executeTools(() => Promise.resolve(result.resources));
  };

  // 載入論壇數據 - 模擬數據
  const loadForumPosts = async () => {
    await executeForumPosts(async () => {
      // 模擬論壇貼文數據
      return [
        {
          id: "1",
          title: "新手投資指南討論",
          content: "分享新手投資心得...",
          author: "投資新手",
          publishDate: "2小時前",
          replies: 23,
          likes: 156,
          isHot: true,
        },
        {
          id: "2",
          title: "技術分析交流",
          content: "技術分析相關討論...",
          author: "分析師",
          publishDate: "4小時前",
          replies: 15,
          likes: 89,
          isHot: true,
        },
      ] as ForumPost[];
    });
  };

  // 載入學習進度
  const loadUserProgress = async () => {
    const userId = "user_001";
    await executeProgress(() => educationController.getUserProgress(userId));
  };

  // 載入教育數據的主函數
  const loadEducationData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadUserData(),
        loadTools(),
        loadForumPosts(),
        loadUserProgress(),
      ]);

      setLastUpdate(new Date().toLocaleString("zh-TW"));
    } catch (error) {
      setError(error instanceof Error ? error.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  };

  // 刷新數據
  const handleRefreshData = async () => {
    await loadEducationData();
  };

  // 開始學習課程
  const handleStartLearning = async (courseId: string) => {
    try {
      await educationController.recordView(courseId);
      console.log("開始學習課程:", courseId);
      // 這裡可以導航到課程詳情頁面
    } catch (error) {
      console.error("開始學習失敗:", error);
    }
  };

  // 收藏課程
  const handleBookmark = async (courseId: string) => {
    try {
      // 這裡可以實現收藏功能
      console.log("收藏課程:", courseId);
    } catch (error) {
      console.error("收藏失敗:", error);
    }
  };

  // 初始化載入
  useEffect(() => {
    loadEducationData();
  }, []);

  // 當搜尋條件改變時重新載入課程
  useEffect(() => {
    if (activeTab === "courses") {
      loadCoursePage(1);
    }
  }, [searchTerm, difficulty, activeTab]);

  // 處理資源評分 - 通過控制器
  const handleRateResource = async (resourceId: string, rating: number) => {
    try {
      await educationController.rateResource(resourceId, rating);
      console.log("評分成功");
      // 可以顯示成功提示
    } catch (error) {
      console.error("評分失敗:", error);
    }
  };

  // 處理學習進度更新 - 通過控制器
  const handleUpdateProgress = async (resourceId: string, progress: number) => {
    try {
      const userId = "user_001";
      await educationController.updateProgress(userId, resourceId, progress);
      // 重新載入進度數據
      loadUserProgress();
    } catch (error) {
      console.error("更新進度失敗:", error);
    }
  };

  // 轉換數據格式以保持向後兼容
  const featuredContentLegacy: FeaturedContentLegacy[] = (
    featuredContent || []
  ).map((item, index) => ({
    id: parseInt(item.id),
    title: item.title,
    description: item.description,
    type: item.type,
    popularity:
      item.level === "初級" ? "推薦" : item.level === "中級" ? "熱門" : "精選",
    image: `https://source.unsplash.com/600x400?finance${index}`,
  }));

  const coursesLegacy: CourseLegacy[] = (courses || []).map(
    (course, index) => ({
      id: parseInt(course.id),
      title: course.title,
      description: course.description,
      duration: course.duration || "1小時",
      level: course.level,
      rating: course.rating,
      students: Math.floor(Math.random() * 1000) + 100, // 移除不存在的course.students屬性
      icon:
        course.category === "技術分析"
          ? ChartBarIcon
          : course.category === "基本面分析"
          ? BookOpenIcon
          : course.category === "投資心理"
          ? UserGroupIcon
          : course.category === "風險管理"
          ? ShieldCheckIcon
          : AcademicCapIcon,
      topics: course.tags || ["投資基礎", "市場分析"],
      progress: course.progress || 0,
    })
  );

  const toolsLegacy: ToolLegacy[] = (tools || []).map((tool, index) => ({
    id: parseInt(tool.id),
    title: tool.title,
    description: tool.description,
    icon:
      tool.category === "計算工具"
        ? CalculatorIcon
        : tool.category === "分析工具"
        ? TrendingUpIcon
        : tool.category === "模擬工具"
        ? BanknotesIcon
        : CalculatorIcon,
    popular: tool.level === "初級" || index < 3,
  }));

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
  const filteredCourses = coursesLegacy.filter((course) => {
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

  // 載入狀態
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入教育資源中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={loadEducationData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 頂部橫幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl text-white md:text-4xl font-bold mb-4">
                  投資理財知識中心
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-6">
                  探索我們精心準備的課程、工具和資源，提升您的投資知識和技能
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefreshData}
                  className="p-2 bg-indigo-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-indigo-400 border-opacity-30 text-blue-200 hover:text-white transition-colors"
                  title="刷新數據"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>

                {lastUpdate && (
                  <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-sm rounded-xl px-3 py-1 border border-indigo-400 border-opacity-30">
                    <div className="text-xs text-blue-200">最後更新</div>
                    <div className="text-sm font-medium text-white">
                      {lastUpdate}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                {featuredContentLegacy.map((item) => (
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
                  {coursesLegacy.slice(0, 3).map((course) => {
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
                        <button
                          onClick={() =>
                            handleStartLearning(course.id.toString())
                          }
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
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
                            <button
                              onClick={() =>
                                handleStartLearning(course.id.toString())
                              }
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                              <PlayCircleIcon className="h-5 w-5 mr-2" />
                              {course.progress > 0 ? "繼續學習" : "開始學習"}
                            </button>
                            <button
                              onClick={() =>
                                handleBookmark(course.id.toString())
                              }
                              className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                            >
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
                {toolsLegacy.map((tool) => {
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
                  {toolsLegacy
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
                  {(forumPosts || [])
                    .filter((post) => post.isHot)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            {post.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {post.publishDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{post.author} 發起</span>
                          <div className="flex items-center space-x-4">
                            <span>💬 {post.replies} 回覆</span>
                            <span>👍 {post.likes} 讚</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
