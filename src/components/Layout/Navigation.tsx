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
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// TypeScript 接口定義
interface Notification {
  id: number;
  text: string;
  read: boolean;
}

interface SubItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  color?: string;
  bgColor?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  hasDropdown?: boolean;
  children?: SubItem[];
}

const Navigation: React.FC = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 通知狀態
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "台股大盤上漲 1.2%", read: false },
    { id: 2, text: "您關注的台積電今日漲幅超過 3%", read: false },
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState<boolean>(false);

  // 導覽項目配置
  const navigationItems: NavigationItem[] = [
    {
      name: "市場分析",
      href: "/market-analysis",
      icon: ChartBarIcon,
      description: "即時市場動態與技術分析",
      hasDropdown: true,
      children: [
        {
          name: "股票分析",
          href: "/market-analysis/stock",
          icon: ChartBarIcon,
          description: "台股、美股即時分析",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          name: "加密貨幣",
          href: "/market-analysis/crypto",
          icon: CurrencyDollarIcon,
          description: "數位資產市場動態",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        },
        {
          name: "全球市場",
          href: "/market-analysis/global",
          icon: GlobeAltIcon,
          description: "國際指數與外匯",
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          name: "AI 智能預測",
          href: "/ai-prediction",
          icon: SparklesIcon,
          description: "機器學習市場預測",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
      ],
    },
    {
      name: "投資組合",
      href: "/portfolio",
      icon: BriefcaseIcon,
      description: "智能投資組合管理",
    },
    {
      name: "財經新聞",
      href: "/news",
      icon: NewspaperIcon,
      description: "AI 精選全球財經資訊",
    },
    {
      name: "社群討論",
      href: "/community",
      icon: ChatBubbleLeftRightIcon,
      description: "投資者交流平台",
    },
  ];

  // 關閉所有選單
  const closeAllMenus = (): void => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    setOpenDropdown(null);
  };

  // 效果監聽
  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (): void => {
      closeAllMenus();
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    router.events.on("routeChangeComplete", closeAllMenus);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
      router.events.off("routeChangeComplete", closeAllMenus);
    };
  }, [router.events]);

  // 檢查路由是否活躍
  const isActive = (path: string): boolean => {
    if (path === "/") {
      return router.pathname === path;
    }
    return router.pathname.startsWith(path);
  };

  // 處理搜尋提交
  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // 處理選單點擊（防止事件冒泡）
  const handleMenuClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  // 處理通知點擊
  const handleNotificationClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsUserMenuOpen(false);
    setOpenDropdown(null);
  };

  // 處理用戶選單點擊
  const handleUserMenuClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationsOpen(false);
    setOpenDropdown(null);
  };

  // 標記所有通知為已讀
  const markAllAsRead = (): void => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      {/* 重新設計的導覽列 - 固定白色背景 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white shadow-xl border-b border-gray-200/50"
            : "bg-white shadow-lg border-b border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* 左側 - 品牌Logo區域 */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    FinTech
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    智慧投資平台
                  </span>
                </div>
              </Link>
            </div>

            {/* 中間 - 導覽連結區域 (桌面版) */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() =>
                    item.hasDropdown && setOpenDropdown(item.name)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`group flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 ${
                      isActive(item.href) ? "text-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5 transition-transform group-hover:scale-110 duration-200" />
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}

                    {/* 懸停效果背景 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  {/* 下拉選單 */}
                  {item.hasDropdown && openDropdown === item.name && (
                    <>
                      {/* 隱形的連接橋樑 */}
                      <div className="absolute top-full left-0 w-full h-1 bg-transparent"></div>

                      {/* 下拉選單主體 */}
                      <div className="absolute top-full left-0 pt-1 w-60 z-50">
                        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-0 animate-fade-in-down">
                          <div className="px-3 py-2">
                            {item.children?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="group flex items-start p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 mb-1"
                              >
                                {/* 圖標區域 */}
                                <div
                                  className={`w-10 h-10 ${subItem.bgColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className={`h-5 w-5 ${subItem.color}`}
                                    />
                                  )}
                                </div>

                                {/* 內容區域 */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4
                                      className={`font-semibold text-sm text-gray-900 group-hover:${subItem.color} transition-colors`}
                                    >
                                      {subItem.name}
                                    </h4>
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-700 transition-colors">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 右側 - 操作區域 */}
            <div className="flex items-center space-x-3">
              {/* 搜尋按鈕 (桌面版) */}
              <div className="hidden md:block">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜尋市場、股票..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2.5 rounded-xl border bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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

              {/* 通知按鈕 */}
              <div className="relative" onClick={handleMenuClick}>
                <button
                  onClick={handleNotificationClick}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <div className="relative">
                    <BellIcon className="h-5 w-5" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </button>

                {/* 通知下拉選單 */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-0 animate-fade-in-down">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-900">通知</span>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        標記全部已讀
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="text-sm text-gray-900">
                              {notification.text}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          沒有新通知
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-3">
                      <Link
                        href="/notifications"
                        className="block text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        查看所有通知
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 個人選單 */}
              <div className="relative" onClick={handleMenuClick}>
                <button
                  onClick={handleUserMenuClick}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-xl transition-all duration-300 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm font-medium hidden md:block">
                    使用者
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 個人選單下拉內容 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-0 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        使用者
                      </p>
                      <p className="text-sm text-gray-500">user@example.com</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        個人資料
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        設定
                      </Link>
                      <Link
                        href="/auth"
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      >
                        登出
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 手機版選單按鈕 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="lg:hidden p-2.5 rounded-xl transition-all duration-300 text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* 手機版下拉選單 - 重新設計 */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200/50 shadow-2xl">
              <div className="px-4 py-6 space-y-1">
                {/* 手機版搜尋框 */}
                <div className="mb-6">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜尋股票、新聞、討論..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </form>
                </div>

                {/* 導覽項目 */}
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <item.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-base">
                          {item.name}
                        </span>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>

                    {/* 手機版子選單 */}
                    {item.children && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          >
                            {subItem.icon && (
                              <subItem.icon className="h-4 w-4" />
                            )}
                            <span className="text-sm">{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* 手機版操作按鈕 */}
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-white font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    登入帳戶
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 動畫樣式 */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navigation;
