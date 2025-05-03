import React, { useState, useMemo } from 'react';
import {
  ChatBubbleLeftIcon,
  FireIcon,
  BookmarkIcon,
  ShareIcon,
  UserCircleIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedForum, setSelectedForum] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);

  const externalForums = [
    {
      id: 1,
      name: 'PTT 股票版',
      description: '台灣最大的股票討論社群',
      url: 'https://www.ptt.cc/bbs/Stock/index.html',
      icon: GlobeAltIcon,
      category: '股票討論',
      posts: [
        {
          title: '[標的] 台積電(2330) 多',
          author: 'stockmaster',
          timestamp: '10分鐘前',
          url: 'https://www.ptt.cc/bbs/Stock/M.1234567890.A.123.html',
          category: '個股分析',
        },
        {
          title: '[新聞] 聯發科法說會重點整理',
          author: 'technews',
          timestamp: '30分鐘前',
          url: 'https://www.ptt.cc/bbs/Stock/M.1234567891.A.456.html',
          category: '新聞資訊',
        },
      ],
    },
    {
      id: 2,
      name: 'Mobile01 投資理財',
      description: '綜合性投資理財討論區',
      url: 'https://www.mobile01.com/topiclist.php?f=291',
      icon: GlobeAltIcon,
      category: '綜合討論',
      posts: [
        {
          title: '2024年投資展望與策略分享',
          author: '投資達人',
          timestamp: '1小時前',
          url: 'https://www.mobile01.com/topicdetail.php?f=291&t=1234567',
          category: '投資策略',
        },
        {
          title: '定期定額vs單筆投資比較',
          author: '理財顧問',
          timestamp: '2小時前',
          url: 'https://www.mobile01.com/topicdetail.php?f=291&t=1234568',
          category: '投資策略',
        },
      ],
    },
    {
      id: 3,
      name: 'Reddit r/investing',
      description: '國際投資討論社群',
      url: 'https://www.reddit.com/r/investing/',
      icon: GlobeAltIcon,
      category: '國際投資',
      posts: [
        {
          title: 'What are your investment strategies for 2024?',
          author: 'u/investor123',
          timestamp: '3小時前',
          url: 'https://www.reddit.com/r/investing/comments/1234567',
          category: '投資策略',
        },
        {
          title: 'Analysis: Tech sector outlook',
          author: 'u/techanalyst',
          timestamp: '4小時前',
          url: 'https://www.reddit.com/r/investing/comments/1234568',
          category: '產業分析',
        },
      ],
    },
    {
      id: 4,
      name: 'Seeking Alpha',
      description: '專業投資分析平台',
      url: 'https://seekingalpha.com/',
      icon: GlobeAltIcon,
      category: '投資分析',
      posts: [
        {
          title: 'TSM: Semiconductor Industry Analysis',
          author: 'Tech Analyst',
          timestamp: '5小時前',
          url: 'https://seekingalpha.com/article/1234567',
          category: '產業分析',
        },
        {
          title: 'Market Outlook: 2024 Predictions',
          author: 'Market Expert',
          timestamp: '6小時前',
          url: 'https://seekingalpha.com/article/1234568',
          category: '市場展望',
        },
      ],
    },
    {
      id: 5,
      name: 'Cmoney 理財寶',
      description: '台股投資討論區',
      url: 'https://www.cmoney.tw/forum/',
      icon: GlobeAltIcon,
      category: '股票討論',
      posts: [
        {
          title: '半導體產業鏈分析',
          author: '產業研究員',
          timestamp: '7小時前',
          url: 'https://www.cmoney.tw/forum/topic/1234567',
          category: '產業分析',
        },
        {
          title: '台股大盤技術分析',
          author: '技術分析師',
          timestamp: '8小時前',
          url: 'https://www.cmoney.tw/forum/topic/1234568',
          category: '技術分析',
        },
      ],
    },
    {
      id: 6,
      name: 'StockFeel 股感',
      description: '投資理財知識分享平台',
      url: 'https://www.stockfeel.com.tw/',
      icon: GlobeAltIcon,
      category: '投資教育',
      posts: [
        {
          title: '如何看懂財務報表',
          author: '財務分析師',
          timestamp: '9小時前',
          url: 'https://www.stockfeel.com.tw/article/1234567',
          category: '投資教育',
        },
        {
          title: '價值投資入門指南',
          author: '投資顧問',
          timestamp: '10小時前',
          url: 'https://www.stockfeel.com.tw/article/1234568',
          category: '投資教育',
        },
      ],
    },
    {
      id: 7,
      name: '財報狗',
      description: '基本面分析與財報解讀平台',
      url: 'https://statementdog.com/',
      icon: GlobeAltIcon,
      category: '基本面分析',
      posts: [
        {
          title: '台積電2024年第一季財報分析',
          author: '財報分析師',
          timestamp: '11小時前',
          url: 'https://statementdog.com/analysis/2330',
          category: '財報分析',
          likes: 156,
          views: 2345,
        },
        {
          title: '如何解讀現金流量表',
          author: '財務顧問',
          timestamp: '12小時前',
          url: 'https://statementdog.com/education/cash-flow',
          category: '投資教育',
          likes: 89,
          views: 1234,
        },
      ],
    },
    {
      id: 8,
      name: '股癌',
      description: '台股投資討論與分析',
      url: 'https://gooaye.com/',
      icon: GlobeAltIcon,
      category: '股票討論',
      posts: [
        {
          title: '半導體產業週報',
          author: '產業分析師',
          timestamp: '13小時前',
          url: 'https://www.gooaye.com/article/1234567',
          category: '產業分析',
          likes: 234,
          views: 3456,
        },
        {
          title: '台股大盤技術面分析',
          author: '技術分析師',
          timestamp: '14小時前',
          url: 'https://www.gooaye.com/article/1234568',
          category: '技術分析',
          likes: 167,
          views: 2345,
        },
      ],
    },
  ];

  // 獲取所有可用的分類
  const categories = useMemo(() => {
    const categorySet = new Set();
    externalForums.forEach(forum => {
      forum.posts.forEach(post => {
        categorySet.add(post.category);
      });
    });
    return ['all', ...Array.from(categorySet)];
  }, []);

  // 獲取所有論壇
  const forums = useMemo(() => {
    return ['all', ...externalForums.map(forum => forum.name)];
  }, []);

  // 時間範圍選項
  const timeRanges = [
    { value: 'all', label: '全部時間' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '本週' },
    { value: 'month', label: '本月' },
  ];

  // 排序選項
  const sortOptions = [
    { value: 'time', label: '最新發布' },
    { value: 'likes', label: '最多讚' },
    { value: 'views', label: '最多瀏覽' },
  ];

  // 過濾和排序文章
  const filteredForums = useMemo(() => {
    let result = externalForums.map(forum => ({
      ...forum,
      posts: forum.posts.filter(post => {
        const matchesSearch = searchQuery === '' || 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        
        // 時間過濾
        let matchesTime = true;
        if (timeRange !== 'all') {
          const postTime = new Date(post.timestamp);
          const now = new Date();
          switch (timeRange) {
            case 'today':
              matchesTime = postTime.toDateString() === now.toDateString();
              break;
            case 'week':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              matchesTime = postTime >= weekAgo;
              break;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              matchesTime = postTime >= monthAgo;
              break;
          }
        }

        return matchesSearch && matchesCategory && matchesTime;
      }),
    })).filter(forum => 
      (selectedForum === 'all' || forum.name === selectedForum) &&
      forum.posts.length > 0
    );

    // 根據標籤過濾
    if (activeTab === 'hot') {
      result = result.map(forum => ({
        ...forum,
        posts: forum.posts.filter(post => post.likes > 100),
      }));
    } else if (activeTab === 'saved') {
      result = result.map(forum => ({
        ...forum,
        posts: forum.posts.filter(post => savedPosts.includes(post.url)),
      }));
    }

    // 排序
    result = result.map(forum => ({
      ...forum,
      posts: [...forum.posts].sort((a, b) => {
        switch (sortBy) {
          case 'time':
            return new Date(b.timestamp) - new Date(a.timestamp);
          case 'likes':
            return b.likes - a.likes;
          case 'views':
            return b.views - a.views;
          default:
            return 0;
        }
      }),
    }));

    return result;
  }, [searchQuery, selectedCategory, selectedForum, timeRange, sortBy, activeTab, savedPosts]);

  const handleSavePost = (postUrl) => {
    setSavedPosts(prev => 
      prev.includes(postUrl) 
        ? prev.filter(url => url !== postUrl)
        : [...prev, postUrl]
    );
  };

  const tabs = [
    { id: 'discussions', name: '討論區', icon: ChatBubbleLeftIcon },
    { id: 'hot', name: '熱門話題', icon: FireIcon },
    { id: 'saved', name: '收藏文章', icon: BookmarkIcon },
  ];

  return (
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '所有分類' : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedForum}
                onChange={(e) => setSelectedForum(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {forums.map(forum => (
                  <option key={forum} value={forum}>
                    {forum === 'all' ? '所有論壇' : forum}
                  </option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
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
                {sortOptions.map(option => (
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredForums.map((forum) => {
            const Icon = forum.icon;
            return (
              <div key={forum.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{forum.name}</h2>
                      <p className="text-sm text-gray-500">{forum.category}</p>
                    </div>
                  </div>
                  <a
                    href={forum.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </a>
                </div>
                <p className="text-gray-600 mb-4">{forum.description}</p>
                
                {/* 熱門文章列表 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">熱門討論</h3>
                  {forum.posts.map((post, index) => (
                    <div
                      key={index}
                      className="block p-3 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                        <span className="text-xs text-gray-500">{post.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{post.author}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSavePost(post.url);
                            }}
                            className={`text-xs ${
                              savedPosts.includes(post.url)
                                ? 'text-yellow-600'
                                : 'text-gray-400'
                            } hover:text-yellow-600`}
                          >
                            <BookmarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          {post.views} 瀏覽
                        </span>
                        <span className="flex items-center">
                          <FireIcon className="h-4 w-4 mr-1" />
                          {post.likes} 讚
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 文章預覽模態框 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedPost.title}</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-500"
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
                  這是一篇來自 {selectedPost.url.split('/')[2]} 的文章預覽。
                  點擊下方按鈕可以在新視窗中查看完整內容。
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => handleSavePost(selectedPost.url)}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    savedPosts.includes(selectedPost.url)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600'
                  } hover:bg-yellow-200`}
                >
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                  {savedPosts.includes(selectedPost.url) ? '取消收藏' : '收藏文章'}
                </button>
                <a
                  href={selectedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
                  查看原文
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage; 