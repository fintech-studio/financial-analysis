import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  HomeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const Navigation = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 新增通知狀態
  const [notifications, setNotifications] = useState([
    { id: 1, text: "台股大盤上漲 1.2%", read: false },
    { id: 2, text: "您關注的台積電今日漲幅超過 3%", read: false },
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // 關閉所有彈出選單的函數
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // 點擊頁面其他區域時關閉選單
    const handleClickOutside = () => {
      closeAllMenus();
    };
    document.addEventListener("click", handleClickOutside);

    // 頁面切換時關閉選單
    router.events.on("routeChangeComplete", closeAllMenus);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
      router.events.off("routeChangeComplete", closeAllMenus);
    };
  }, [router.events]);

  const navigationItems = [
    { name: "首頁", href: "/", icon: HomeIcon },
    {
      name: "市場分析",
      href: "/market-analysis",
      icon: ChartBarIcon,
      children: [
        { name: "股票分析", href: "/market-analysis/stock" },
        { name: "加密貨幣", href: "/market-analysis/crypto" },
        { name: "全球市場", href: "/market-analysis/global" },
        { name: "市場情緒", href: "/market-analysis/market-sentiment" },
        { name: "房地產", href: "/market-analysis/real-estate" },
        { name: "NFT分析", href: "/market-analysis/nft" },
        { name: "期貨分析", href: "/market-analysis/futures" },
      ],
    },
    { name: "投資組合", href: "/portfolio", icon: BriefcaseIcon },
    { name: "理財知識", href: "/education", icon: AcademicCapIcon },
    { name: "社群討論", href: "/community", icon: ChatBubbleLeftRightIcon },
    { name: "設定", href: "/settings", icon: Cog6ToothIcon },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return router.pathname === path;
    }
    return router.pathname.startsWith(path);
  };

  // 處理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // 處理點擊事件，防止事件冒泡
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  // 處理通知點擊
  const handleNotificationClick = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsUserMenuOpen(false);
  };

  // 標記所有通知為已讀
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-blue-600">投資</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  助手
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* 搜索欄 */}
              <form onSubmit={handleSearchSubmit} className="mr-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋市場、股票..."
                    className="w-48 pl-9 pr-3 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </form>

              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onClick={handleMenuClick}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 mr-1.5 transition-colors duration-200 ${
                        isActive(item.href)
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-blue-500"
                      }`}
                    />
                    <span>{item.name}</span>
                    {item.children && (
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                          isActive(item.href)
                            ? "text-blue-500 group-hover:rotate-180"
                            : "text-gray-400 group-hover:text-blue-500 group-hover:rotate-180"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute left-0 mt-1 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                      <div className="py-1">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-4 py-2.5 text-sm transition-colors duration-200 ${
                              isActive(subItem.href)
                                ? "text-blue-600 bg-blue-50 font-medium"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Menu & Notifications */}
            <div className="hidden lg:flex items-center pl-4 space-x-4">
              {/* 通知按鈕 */}
              <div className="relative" onClick={handleMenuClick}>
                <button
                  onClick={handleNotificationClick}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <div className="relative">
                    <BellIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </div>
                </button>

                {/* 通知下拉選單 */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform origin-top-right z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          通知
                        </h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          標記全部已讀
                        </button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 hover:bg-gray-50 ${
                              notification.read ? "" : "bg-blue-50"
                            }`}
                          >
                            <p className="text-sm text-gray-700">
                              {notification.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-sm text-gray-500">
                          沒有新通知
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <Link
                        href="/notifications"
                        className="block text-center text-xs text-blue-600 hover:text-blue-800 p-1"
                      >
                        查看所有通知
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 用戶選單 */}
              <div className="relative" onClick={handleMenuClick}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <div className="rounded-full bg-gray-100 p-0.5 hover:bg-gray-200">
                    <UserCircleIcon className="h-7 w-7 text-gray-600" />
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform origin-top-right z-50">
                    <div className="py-1 border-b border-gray-100">
                      <div className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          使用者
                        </div>
                        <div className="text-xs text-gray-500">
                          user@example.com
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors duration-200 ${
                          isActive("/profile")
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        個人資料
                      </Link>
                      <Link
                        href="/settings"
                        className={`flex items-center px-4 py-2.5 text-sm transition-colors duration-200 ${
                          isActive("/settings")
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        設定
                      </Link>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* 移動版搜尋按鈕 */}
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* 移動版通知按鈕 */}
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="sr-only">開啟主選單</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 shadow-lg animate-fadeIn">
            {/* 移動版搜索欄 */}
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋市場、股票..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </form>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pb-5">
              <div className="pt-2 pb-3 space-y-1 px-3">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 mr-3 ${
                          isActive(item.href)
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                    {item.children && (
                      <div className="pl-11 mt-1 space-y-1 border-l border-gray-100 ml-1.5">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive(subItem.href)
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      使用者
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      user@example.com
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-3">
                  <Link
                    href="/profile"
                    className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive("/profile")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    個人資料
                  </Link>
                  <Link
                    href="/settings"
                    className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive("/settings")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    設定
                  </Link>
                  <button className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                    登出
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
