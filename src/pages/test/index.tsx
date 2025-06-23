import React from "react";
import Link from "next/link";
import {
  ServerIcon,
  ChartBarIcon,
  CogIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

const TestPage: React.FC = () => {
  const testItems = [
    {
      title: "資料庫測試",
      description: "SQL Server 連接與查詢測試",
      href: "/test/database",
      icon: ServerIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-300",
    },
    {
      title: "金融市場查詢測試",
      description: "輸入金融代號查詢資料庫數據",
      href: "/test/stock-query",
      icon: ArrowTrendingUpIcon,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      hoverColor: "hover:border-pink-300",
    },
    {
      title: "Python 測試",
      description: "Python 腳本執行與測試",
      href: "/test/run-python",
      icon: CodeBracketIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      hoverColor: "hover:border-yellow-300",
    },
    {
      title: "圖表測試",
      description: "各種圖表組件測試",
      href: "/test/charts",
      icon: ChartBarIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-300",
    },
    {
      title: "系統設定",
      description: "應用程式設定與配置",
      href: "/test/settings",
      icon: CogIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:border-purple-300",
    },
    {
      title: "API 測試",
      description: "API 端點測試與調試",
      href: "/test/api",
      icon: BeakerIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:border-orange-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 頁面容器 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 頁面標題區域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            開發測試工具
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            僅供管理員使用，非管理員請勿使用
          </p>
        </div>

        {/* 測試項目網格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {testItems.map((item, index) => (
            <Link key={item.title} href={item.href} className="group block">
              <div
                className={`relative bg-white rounded-2xl border-2 ${item.borderColor} ${item.hoverColor} p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                {/* 背景裝飾 */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${item.bgColor} rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:scale-150 transition-transform duration-700`}
                ></div>

                {/* 內容區域 */}
                <div className="relative z-10">
                  <div className="flex items-start space-x-6 mb-6">
                    <div
                      className={`flex-shrink-0 w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md`}
                    >
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 底部行動區域 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span
                      className={`text-sm font-semibold ${item.color} bg-white px-3 py-2 rounded-lg border ${item.borderColor}`}
                    >
                      點擊進入測試
                    </span>

                    <div
                      className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center group-hover:translate-x-2 transition-all duration-300 shadow-md`}
                    >
                      <svg
                        className={`w-5 h-5 ${item.color}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 開發資訊提示 */}
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-amber-800 mb-1">
                開發模式
              </p>
              <p className="text-sm text-amber-700">
                此區域僅供開發與測試使用，請謹慎操作
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
