import React from "react";
import Link from "next/link";
import {
  ServerIcon,
  ChartBarIcon,
  CogIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CodeBracketIcon,
  DocumentMagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/Layout/Footer";

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
      title: "金融市場查詢",
      description: "輸入金融代號查詢資料庫數據",
      href: "/market-analysis/stock-query",
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
      title: "金融代號查詢",
      description: "查詢金融代號相關資訊",
      href: "/market-analysis/financial-code",
      icon: DocumentMagnifyingGlassIcon,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      hoverColor: "hover:border-teal-300",
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
    {
      title: "未公開頁面",
      description: "尚未完成的未公開內容",
      href: "/test/hidden",
      icon: DevicePhoneMobileIcon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      hoverColor: "hover:border-gray-300",
    },
  ];

  return (
    <>
      {/* 頁面標題區域 */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* subtle grid background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <CommandLineIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    開發測試工具
                  </h1>
                  <p className="text-blue-100 mt-3 text-lg font-medium">
                    僅供管理員使用，非管理員請勿使用
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">DEV ONLY</div>
                  <div className="text-blue-200 text-sm font-medium">
                    開發測試專用
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 頁面容器 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 測試項目網格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {testItems.map((item) => (
            <Link key={item.title} href={item.href} className="group block">
              <div
                className={`relative bg-white rounded-2xl border-2 ${item.borderColor} ${item.hoverColor} p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
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

      <Footer />
    </>
  );
};

export default TestPage;
