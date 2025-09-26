import React from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentMagnifyingGlassIcon,
  ChartPieIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/Layout/Footer";

const TestPage: React.FC = () => {
  const testItems = [
    {
      title: "技術分析",
      description: "股價走勢、技術指標與圖表分析",
      href: "/market-analysis/stock-query",
      icon: ArrowTrendingUpIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-300",
    },
    {
      title: "基本面分析",
      description: "財務報表、營收獲利與基本面數據分析",
      href: "/market-analysis/fundamental",
      icon: ChartBarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:border-orange-300",
    },
    {
      title: "金融代號查詢",
      description: "查詢金融代號相關資訊",
      href: "/market-analysis/financial-code",
      icon: DocumentMagnifyingGlassIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:border-purple-300",
    },
    {
      title: "交易訊號",
      description: "智能交易建議與買賣點提示",
      href: "/market-analysis/trade-signals",
      icon: SignalIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-300",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* 動態網格背景 */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Enhanced Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>

          {/* Enhanced floating elements */}
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <ChartPieIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                    市場分析
                  </h1>
                  <p className="text-blue-200 mt-3 text-xl font-medium">
                    專業的金融市場分析工具平台
                  </p>
                </div>
              </div>
              <p className="text-blue-200 text-xl max-w-3xl leading-relaxed">
                提供完整的技術分析與基本面分析工具，助您洞察市場趨勢，做出明智的投資決策
              </p>
            </div>

            {/* Enhanced Statistics Panel */}
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">{testItems.length}</div>
                  <div className="text-blue-200 text-sm font-medium">分析工具</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
              選擇分析工具
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              多種專業分析工具，滿足不同投資策略需求
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Enhanced Test Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 mb-20">
            {testItems.map((item, index) => (
              <Link key={item.title} href={item.href} className="group block">
                <div className={`relative bg-white/95 backdrop-blur-sm rounded-3xl border-2 ${item.borderColor} ${item.hoverColor} p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden shadow-xl`}>
                  
                  {/* Enhanced background decorations */}
                  <div className={`absolute top-0 right-0 w-40 h-40 ${item.bgColor} rounded-full -translate-y-20 translate-x-20 opacity-20 group-hover:scale-150 transition-transform duration-700`}></div>
                  <div className={`absolute bottom-0 left-0 w-24 h-24 ${item.bgColor} rounded-full translate-y-12 -translate-x-12 opacity-15 group-hover:scale-125 transition-transform duration-500`}></div>
                  <div className={`absolute top-1/2 right-1/4 w-16 h-16 ${item.bgColor} rounded-full opacity-10 group-hover:scale-110 transition-transform duration-600`}></div>

                  {/* Gradient overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>

                  {/* Enhanced corner decorations */}
                  <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-gray-200 opacity-30 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-gray-200 opacity-30 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"></div>

                  {/* Content Area */}
                  <div className="relative z-10">
                    <div className="flex items-start space-x-8 mb-8">
                      <div className={`relative flex-shrink-0 w-20 h-20 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl`}>
                        {/* Enhanced icon background effects */}
                        <div className={`absolute inset-0 ${item.bgColor} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse`}></div>
                        <item.icon className={`h-10 w-10 ${item.color} relative z-10 group-hover:scale-110 transition-transform`} />
                        
                        {/* Enhanced icon decorations */}
                        <div className={`absolute -top-2 -right-2 w-3 h-3 ${item.color.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                        <div className={`absolute -bottom-1 -left-1 w-2 h-2 ${item.color.replace('text-', 'bg-')} rounded-full opacity-60 animate-pulse`} style={{ animationDelay: "0.5s" }}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors relative leading-tight">
                          {item.title}
                          {/* Enhanced title underline */}
                          <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${item.color.replace('text-', 'from-')} to-transparent w-0 group-hover:w-full transition-all duration-500 rounded-full`}></div>
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-800 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced bottom action area */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 relative">
                      {/* Enhanced separator decoration */}
                      <div className={`absolute top-0 left-0 h-px w-0 bg-gradient-to-r ${item.color.replace('text-', 'from-')} to-transparent group-hover:w-full transition-all duration-700`}></div>

                      <span className={`text-sm font-bold ${item.color} bg-white/90 px-6 py-3 rounded-xl border-2 ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn backdrop-blur-sm`}>
                        {/* Enhanced button background animation */}
                        <span className={`absolute inset-0 ${item.bgColor} translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300`}></span>
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>開始分析</span>
                          <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                        </span>
                      </span>

                      <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:translate-x-3 group-hover:rotate-12 transition-all duration-300 shadow-xl relative`}>
                        {/* Enhanced arrow background effects */}
                        <div className={`absolute inset-0 ${item.bgColor} rounded-2xl blur-md opacity-50 animate-pulse`}></div>
                        <svg className={`w-6 h-6 ${item.color} relative z-10 group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced card number decoration */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity border border-gray-200/50">
                    <span className="text-sm text-gray-600 font-bold">{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  {/* Progress indicator */}
                  <div className="absolute bottom-4 right-4 flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? item.color.replace('text-', 'bg-') : 'bg-gray-300'} opacity-50`}></div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Enhanced Feature Highlights Section */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">平台特色</h3>
            <p className="text-center text-gray-600 mb-12 text-lg">為投資者提供全方位的市場分析支援</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-3xl p-8 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                    <ArrowTrendingUpIcon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">即時數據</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  獲取最新的市場數據和即時價格更新，確保分析結果的準確性與時效性
                </p>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              </div>

              <div className="bg-gradient-to-br from-green-50 via-white to-emerald-100 rounded-3xl p-8 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">深度分析</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  專業的技術指標和基本面分析工具，提供多維度的市場洞察與投資建議
                </p>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 via-white to-pink-100 rounded-3xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                    <DocumentMagnifyingGlassIcon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">智能搜尋</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  快速查詢和篩選相關金融商品資訊，智能化的搜尋體驗提升分析效率
                </p>
                <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
              </div>
            </div>
          </div>

          {/* Enhanced Call-to-Action Section */}
          <div className="text-center relative">
            {/* Enhanced decorative elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 w-20 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            
            <div className="inline-block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-slate-500/20 rounded-3xl blur-xl animate-pulse"></div>
              
              <div className="relative inline-flex items-center px-12 py-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-3 border-blue-200 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group cursor-pointer">
                {/* Enhanced background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-indigo-100 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-slate-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>

                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 relative shadow-xl group-hover:scale-110 transition-transform">
                  {/* Enhanced icon effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="text-left relative z-10">
                  <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 relative">
                    開始您的市場分析之旅
                    <span className="absolute -right-10 top-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-ping"></span>
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

      <Footer />
    </div>
  );
};
export default TestPage;
