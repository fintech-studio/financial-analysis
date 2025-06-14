import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChatBubbleLeftIcon,
  FireIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Footer from "../components/Layout/Footer";

// 優化後的 MVC 架構引入
import { CommunityController } from "../controllers/CommunityController";
import { UserController } from "../controllers/UserController";
import {
  usePreloadData,
  useControllerWithRetry,
  useFormController,
  useSmartSearch,
} from "../hooks/useMvcController";
import { useAppInitialization } from "../utils/appInitializer";

interface Post {
  title: string;
  author: string;
  timestamp: string;
  url: string;
  category: string;
  likes?: number;
  views?: number;
}

interface Forum {
  id: number;
  name: string;
  description: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  posts: Post[];
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface TimeRange {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("discussions");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedForum, setSelectedForum] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  // 應用程式初始化
  const {
    isLoading: appLoading,
    isInitialized,
    error: appError,
  } = useAppInitialization({
    enableCache: true,
    enableMockData: true,
  });

  // MVC 控制器實例
  const communityController = CommunityController.getInstance();
  const userController = UserController.getInstance();

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
      forums: () => communityController.getForums(),
      savedPosts: () => communityController.getSavedPosts("user_001"),
      trendingPosts: () => communityController.getTrendingPosts(10),
      popularPosts: () => communityController.getPopularPosts(10),
      categories: () => communityController.getCategories(),
    },
    {
      priority: [
        "user",
        "forums",
        "categories",
        "savedPosts",
        "trendingPosts",
        "popularPosts",
      ],
      concurrent: false,
      onProgress: (loaded, total) => {
        console.log(`社群數據預加載進度: ${loaded}/${total}`);
      },
    }
  );

  // 智能搜尋 Hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    performSearch,
    clearResults,
  } = useSmartSearch(
    async (query: string) => {
      return await communityController.searchForumPosts({
        query,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        forum: selectedForum !== "all" ? selectedForum : undefined,
        timeRange: timeRange !== "all" ? timeRange : undefined,
        sortBy,
      });
    },
    { debounceMs: 300, minQueryLength: 2 }
  );

  // 使用重試機制的資料更新
  const {
    data: realtimeData,
    loading: realtimeLoading,
    error: realtimeError,
    retry: retryRealtime,
  } = useControllerWithRetry(() => communityController.getForums(), {
    maxRetries: 3,
    retryDelay: 2000,
    retryCondition: (error) => error.message.includes("網路"),
    onRetry: (attempt, error) => {
      console.log(`重試第 ${attempt} 次，錯誤:`, error.message);
    },
    cacheKey: "community_forums",
    cacheTTL: 60000, // 1分鐘緩存
  });

  // 從預加載數據中提取各種資料
  const {
    user,
    forums,
    savedPosts: initialSavedPosts,
    categories: categoriesFromData,
  } = pageData;

  // 初始化收藏文章
  useEffect(() => {
    if (initialSavedPosts) {
      setSavedPosts(initialSavedPosts);
    }
  }, [initialSavedPosts]);

  // 輔助函數 - 移到 useMemo 之前
  const filterPosts = useCallback(
    (posts: any[], activeTab: string, savedPosts: string[]) => {
      if (activeTab === "hot") {
        return posts.filter((post: any) => (post.likes ?? 0) > 100);
      } else if (activeTab === "saved") {
        return posts.filter((post: any) => savedPosts.includes(post.url));
      }
      return posts;
    },
    []
  );

  const sortPosts = useCallback((posts: any[], sortBy: string) => {
    return [...posts].sort((a: any, b: any) => {
      switch (sortBy) {
        case "time":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "likes":
          return (b.likes ?? 0) - (a.likes ?? 0);
        case "views":
          return (b.views ?? 0) - (a.views ?? 0);
        default:
          return 0;
      }
    });
  }, []);

  const filterByTimeRange = useCallback((posts: any[], timeRange: string) => {
    if (timeRange === "all") return posts;

    const now = new Date();
    return posts.filter((post: any) => {
      const postTime = new Date(post.timestamp);
      switch (timeRange) {
        case "today":
          return postTime.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return postTime >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return postTime >= monthAgo;
        default:
          return true;
      }
    });
  }, []);

  // 優化：使用 useCallback 避免重複創建函數
  const handleSavePost = useCallback(
    async (postUrl: string) => {
      try {
        const userId = "user_001";
        if (savedPosts.includes(postUrl)) {
          await communityController.unsavePost(userId, postUrl);
          setSavedPosts((prev) => prev.filter((url) => url !== postUrl));
        } else {
          await communityController.savePost(userId, postUrl);
          setSavedPosts((prev) => [...prev, postUrl]);
        }
      } catch (error) {
        console.error("收藏操作失敗:", error);
      }
    },
    [savedPosts, communityController]
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // 優化：使用 useMemo 緩存過濾和排序結果
  const processedForums = useMemo(() => {
    if (!forums || forums.length === 0) return [];

    // 避免在每次渲染時創建新的陣列
    const result = forums
      .filter(
        (forum: any) => selectedForum === "all" || forum.name === selectedForum
      )
      .map((forum: any) => {
        if (!forum.posts || forum.posts.length === 0) {
          return { ...forum, posts: [] };
        }

        // 基本過濾
        let filteredPosts = forum.posts.filter((post: any) => {
          const matchesSearch =
            !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory =
            selectedCategory === "all" || post.category === selectedCategory;

          return matchesSearch && matchesCategory;
        });

        // 時間過濾
        filteredPosts = filterByTimeRange(filteredPosts, timeRange);

        // 根據標籤過濾
        filteredPosts = filterPosts(filteredPosts, activeTab, savedPosts);

        // 排序
        filteredPosts = sortPosts(filteredPosts, sortBy);

        return { ...forum, posts: filteredPosts };
      })
      .filter((forum: any) => forum.posts.length > 0);

    return result;
  }, [
    forums,
    searchQuery,
    selectedCategory,
    selectedForum,
    timeRange,
    sortBy,
    activeTab,
    savedPosts,
    filterPosts,
    sortPosts,
    filterByTimeRange,
  ]);

  // 優化：減少重複計算
  const categoriesList = useMemo(() => {
    if (!forums) return ["all"];

    const categorySet = new Set<string>();
    forums.forEach((forum: any) => {
      if (forum.posts) {
        forum.posts.forEach((post: any) => {
          if (post.category) {
            categorySet.add(post.category);
          }
        });
      }
    });
    return ["all", ...Array.from(categorySet)];
  }, [forums]);

  const forumNames = useMemo(() => {
    if (!forums) return ["all"];
    return ["all", ...forums.map((forum: any) => forum.name)];
  }, [forums]);

  // 常數定義
  const timeRanges: TimeRange[] = [
    { value: "all", label: "全部時間" },
    { value: "today", label: "今天" },
    { value: "week", label: "本週" },
    { value: "month", label: "本月" },
  ];

  const sortOptions: SortOption[] = [
    { value: "time", label: "最新發布" },
    { value: "likes", label: "最多讚" },
    { value: "views", label: "最多瀏覽" },
  ];

  const tabs: Tab[] = [
    { id: "discussions", name: "討論區", icon: ChatBubbleLeftIcon },
    { id: "hot", name: "熱門話題", icon: FireIcon },
    { id: "saved", name: "收藏文章", icon: BookmarkIcon },
  ];

  // 如果應用程式未初始化，顯示載入畫面
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-gray-600">
            正在載入社群數據... ({progress.loaded}/{progress.total})
          </p>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(pageErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">社群討論</h1>
          </div>

          {/* 搜尋和過濾器 */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="搜尋文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoriesList.map((category: string) => (
                    <option key={category} value={category}>
                      {category === "all" ? "所有分類" : category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedForum}
                  onChange={(e) => setSelectedForum(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {forumNames.map((forum: string) => (
                    <option key={forum} value={forum}>
                      {forum === "all" ? "所有論壇" : forum}
                    </option>
                  ))}
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 標籤導航 */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 論壇列表 */}
          {processedForums.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">沒有找到相關討論</h3>
                <p>請嘗試調整搜尋條件或瀏覽其他分類</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processedForums.map((forum: any) => {
                const Icon = forum.icon;
                return (
                  <div
                    key={forum.id}
                    className="bg-white rounded-lg shadow p-6 transition-shadow hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            {forum.name}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {forum.category}
                          </p>
                        </div>
                      </div>
                      <a
                        href={forum.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {forum.description}
                    </p>

                    {/* 熱門文章列表 */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        熱門討論 ({forum.posts.length})
                      </h3>
                      {forum.posts
                        .slice(0, 5)
                        .map((post: any, index: number) => (
                          <div
                            key={`${forum.id}-${index}`}
                            className="block p-3 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                                {post.title}
                              </h4>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {post.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500 truncate">
                                {post.author}
                              </p>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                  {post.category}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSavePost(post.url);
                                  }}
                                  className={`text-xs transition-colors ${
                                    savedPosts.includes(post.url)
                                      ? "text-yellow-600"
                                      : "text-gray-400"
                                  } hover:text-yellow-600`}
                                >
                                  <BookmarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <ChartBarIcon className="h-4 w-4 mr-1" />
                                {post.views ?? 0} 瀏覽
                              </span>
                              <span className="flex items-center">
                                <FireIcon className="h-4 w-4 mr-1" />
                                {post.likes ?? 0} 讚
                              </span>
                            </div>
                          </div>
                        ))}
                      {forum.posts.length > 5 && (
                        <div className="text-center">
                          <span className="text-xs text-gray-500">
                            還有 {forum.posts.length - 5} 篇文章...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* 文章預覽模態框 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 pr-4">
                  {selectedPost.title}
                </h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-500 flex-shrink-0"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>{selectedPost.author}</span>
                <span>{selectedPost.timestamp}</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {selectedPost.category}
                </span>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  這是一篇來自 {selectedPost.url.split("/")[2]} 的文章預覽。
                  點擊下方按鈕可以在新視窗中查看完整內容。
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => handleSavePost(selectedPost.url)}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    savedPosts.includes(selectedPost.url)
                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                  {savedPosts.includes(selectedPost.url)
                    ? "取消收藏"
                    : "收藏文章"}
                </button>
                <a
                  href={selectedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
                  查看原文
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunityPage;
