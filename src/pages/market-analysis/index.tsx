import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentMagnifyingGlassIcon,
  SignalIcon,
  SparklesIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
  BackwardIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/Layout/Footer";
import AIFinanceTrivia from "@/components/AIFinanceTrivia";
import PageHeader from "@/components/Layout/PageHeader";

const TestPage: React.FC = () => {
  const features = [
    {
      title: "技術分析",
      description: "股價走勢、技術指標與圖表分析",
      link: "/market-analysis/stock-query",
      icon: ArrowTrendingUpIcon,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "基本面分析",
      description: "財務報表、營收獲利與基本面數據分析",
      link: "/market-analysis/fundamental",
      icon: BuildingOffice2Icon,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      title: "交易訊號分析",
      description: "智能交易建議與買賣點提示",
      link: "/market-analysis/trade-signals",
      icon: SignalIcon,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      title: "回測系統",
      description: "策略回測與績效評估工具",
      link: "/market-analysis/backtesting",
      icon: BackwardIcon,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
    },
    {
      title: "金融代號查詢",
      description: "查詢金融代號相關資訊",
      link: "/market-analysis/financial-code",
      icon: DocumentMagnifyingGlassIcon,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
  ];

  const Icon = ChartBarIcon;
  const Title = "市場分析";
  const Subtitle = "專業的金融市場分析工具平台";
  const Description =
    "提供完整的技術分析與基本面分析工具，助您洞察市場趨勢，做出明智的投資決策";
  const panelTitle = features.length.toString();
  const panelSubtitle = "分析工具";

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

      <div className="min-h-screen">
        {/* Main Content Area */}
        <div className="relative bg-slate-50">
          <div className="mx-auto px-8 sm:px-8 lg:px-12 py-8">
            {/* Section Header */}
            <div className="container mx-auto">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  核心分析工具
                </div>
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    探索我們的市場分析工具
                  </h2>
                  <p className="text-xl text-gray-600">
                    多種專業分析工具，滿足不同投資策略需求
                  </p>
                </div>
              </div>

              {/* Feature Items Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 px-8">
                {features.map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.link}
                    className={`group bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl relative flex flex-col `}
                  >
                    <div>
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <feature.icon
                          className={`h-7 w-7 ${feature.iconColor}`}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-auto inline-flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                      探索功能
                      <ChevronRightIcon className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Enhanced Feature Highlights Section */}
            <div className="my-16 px-22">
              <h2 className="text-3xl font-bold text-center text-gray-900 my-4">
                平台特色
              </h2>
              <p className="text-center text-gray-600 mb-12 text-lg">
                為投資者提供全方位的市場分析支援
              </p>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-linear-to-br from-blue-50 via-white to-indigo-100 rounded-3xl p-8 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                      <ArrowTrendingUpIcon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">
                      即時數據
                    </h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    獲取最新的市場數據和即時價格更新，確保分析結果的準確性與時效性
                  </p>
                  <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                </div>

                <div className="bg-linear-to-br from-green-50 via-white to-emerald-100 rounded-3xl p-8 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                      <ChartBarIcon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">
                      深度分析
                    </h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    專業的技術指標和基本面分析工具，提供多維度的市場洞察與投資建議
                  </p>
                  <div
                    className="absolute bottom-4 right-4 w-3 h-3 bg-green-500 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </div>

                <div className="bg-linear-to-br from-purple-50 via-white to-pink-100 rounded-3xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                      <DocumentMagnifyingGlassIcon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">
                      AI 分析與見解
                    </h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    利用先進的 AI
                    技術，自動生成市場分析報告與投資見解，提升決策效率
                  </p>
                  <div
                    className="absolute bottom-4 right-4 w-3 h-3 bg-purple-500 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Add Line Friend */}
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                加入我們的 Line 好友
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                獲取最新市場分析資訊與專屬投資建議
              </p>
              <div className="inline-flex relative flex-col items-center space-y-6">
                <div className="absolute -inset-4 bg-linear-to-br from-green-400/20 via-green-500/20 to-green-600/20 rounded-3xl blur-xl animate-pulse"></div>
                <Image
                  src={
                    "https://raw.githubusercontent.com/fintech-studio/financial-analysis/refs/heads/main/public/linebot-qrcode.png"
                  }
                  alt="LineBot QR Code"
                  width={256}
                  height={256}
                  className="mb-8 relative z-10 rounded-2xl shadow-lg"
                />
                <a
                  href="https://lin.ee/IWbTOCx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center px-8 py-4 bg-linear-to-br from-green-50 via-green-100 to-green-200 border-2 border-green-300 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-100 via-green-200 to-green-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-lg font-bold text-green-800 relative z-10">
                    加入 Line 好友
                  </span>
                </a>
              </div>
            </div>

            {/* AI Finance Trivia Component */}
            <AIFinanceTrivia />

            {/* Enhanced Call-to-Action Section */}
            <div className="text-center relative mb-8">
              {/* Enhanced decorative elements */}
              <div className="inline-block relative">
                <div className="absolute -inset-4 bg-linear-to-br from-blue-500/20 via-indigo-500/20 to-slate-500/20 rounded-3xl blur-xl animate-pulse"></div>

                <div className="relative inline-flex items-center px-12 py-8 bg-linear-to-br from-blue-50 via-indigo-50 to-slate-50 border-3 border-blue-200 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group cursor-pointer">
                  {/* Enhanced icon effects */}
                  <div className="shrink-0 w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 relative shadow-xl group-hover:scale-110 transition-transform">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <svg
                      className="w-7 h-7 text-white relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <div className="text-left relative z-10">
                    <p className="text-2xl font-bold bg-linear-to-br from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 relative">
                      開始您的市場分析之旅
                    </p>
                    <p className="text-lg text-blue-700 font-semibold">
                      選擇合適的分析工具，發現投資機會
                    </p>
                  </div>

                  {/* Enhanced corner decorations */}
                  <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-blue-300 opacity-40 group-hover:opacity-70 transition-opacity group-hover:scale-110"></div>
                  <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-blue-300 opacity-40 group-hover:opacity-70 transition-opacity group-hover:scale-110"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default TestPage;
