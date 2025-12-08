import React from "react";
import Link from "next/link";
import {
  ServerIcon,
  CogIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  CommandLineIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/Layout/PageHeader";
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
      title: "系統狀態",
      description: "系統狀態檢查與監控",
      href: "/status",
      icon: ServerStackIcon,
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

  const Icon = CommandLineIcon;
  const Title = "開發測試專區";
  const Subtitle = "僅供管理員使用的開發與測試工具";
  const Description =
    "此區域包含多種開發與測試工具，僅限授權管理員使用。請謹慎操作，避免影響系統穩定性";
  const panelTitle = "DEV ONLY";
  const panelSubtitle = "開發測試專用";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={panelTitle}
        panelSubtitle={panelSubtitle}
      />

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
                      className={`shrink-0 w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md`}
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
            <div className="shrink-0 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center mr-4">
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
