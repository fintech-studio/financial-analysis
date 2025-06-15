import React, { JSX } from "react";
import {
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { getStatusColor } from "@/utils/stockUtils";

// TypeScript 型別定義
interface MarketData {
  stock?: {
    index?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
  global?: {
    dow?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
  forex?: {
    usdtwd?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
}

interface ModuleData {
  status?: string;
}

interface AnalysisModule {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // 改為 React 組件類型
  bgColor?: string;
  color?: string;
  data?: ModuleData;
}

interface OverviewProps {
  marketData: MarketData;
  analysisModules: AnalysisModule[];
}

interface ModuleCardProps {
  module: AnalysisModule;
}

const Overview: React.FC<OverviewProps> = ({ marketData, analysisModules }) => {
  return (
    <>
      {/* 市場概況 */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
          今日市場重點
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 台股指數卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">台股加權指數</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {marketData.stock?.index || "17,935"}
                </h3>
                <div className="flex items-center mt-1">
                  <span
                    className={`text-sm font-medium ${
                      marketData.stock?.change?.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {marketData.stock?.change || "+125"} (
                    {marketData.stock?.changePercent || "+0.70%"})
                  </span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>成交量</span>
                <span>{marketData.stock?.volume || "2,835億"}</span>
              </div>
              <div className="text-xs text-gray-600 mt-2 border-t pt-2 border-gray-100">
                {marketData.stock?.highlights ||
                  "科技股帶動大盤上漲，AI概念股表現強勁"}
              </div>
            </div>
          </div>

          {/* 道瓊指數卡片 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">道瓊指數 DJIA</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ${marketData.global?.dow || "38,425"}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium text-green-600">
                    {marketData.global?.change || "+186"} (
                    {marketData.global?.changePercent || "+0.49%"})
                  </span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <GlobeAltIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>成交量</span>
                <span>{marketData.global?.volume || "5.4億"}</span>
              </div>
              <div className="text-xs text-gray-600 mt-2 border-t pt-2 border-gray-100">
                {marketData.global?.highlights ||
                  "科技與金融股表現強勁，市場情緒樂觀"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">美元/新台幣</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {marketData.forex?.usdtwd || "31.42"}
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium text-red-600">
                    {marketData.forex?.change || "-0.15"} (
                    {marketData.forex?.changePercent || "-0.48%"})
                  </span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <GlobeAsiaAustraliaIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>成交量</span>
                <span>{marketData.forex?.volume || "12.6億美元"}</span>
              </div>
              <div className="text-xs text-gray-600 mt-2 border-t pt-2 border-gray-100">
                {marketData.forex?.highlights || "美元走弱，台幣升值創近期新高"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">熱門股票</p>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  台積電 (2330)
                </h3>
                <div className="flex items-center mt-1">
                  <span className="text-sm font-medium text-green-600">
                    580.00 (+1.8%)
                  </span>
                </div>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <HeartIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>成交量</span>
                <span>35,862張</span>
              </div>
              <div className="text-xs text-gray-600 mt-2 border-t pt-2 border-gray-100">
                台積電AI晶片需求強勁，外資持續買超
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分析工具 */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
          分析工具
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {(analysisModules || []).map((module) => (
            <ModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>

      {/* AI 市場見解 */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-purple-500 mr-2">✨</span>
          AI 市場見解
        </h2>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  本週市場摘要
                </h3>
                <p className="text-sm text-gray-500">基於最新數據與趨勢分析</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  本週市場呈現震盪格局，科技股表現較強，金融股表現平淡。通膨數據好於預期，
                  可能支持央行降息預期，適合加碼布局成長股與科技龍頭。加密貨幣市場出現回升跡象，
                  比特幣站穩65,000美元。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">關注焦點</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 台積電海外擴產進度</li>
                    <li>• 美國非農就業數據</li>
                    <li>• 歐洲央行利率決議</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">投資機會</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AI相關應用產業</li>
                    <li>• 低估值高股息標的</li>
                    <li>• 長線布局能源轉型</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">風險提示</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 地緣政治緊張加劇</li>
                    <li>• 高估值科技股修正</li>
                    <li>• 通膨預期反轉風險</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 子組件：模組卡片
const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  // 直接使用 React 組件而不是字串
  const IconComponent = module.icon;

  return (
    <Link
      href={module.href}
      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
          <div className={`p-2 rounded-lg ${module.bgColor || "bg-blue-100"}`}>
            <div className={module.color || "text-blue-500"}>
              <IconComponent className="h-6 w-6" />
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">{module.description}</p>
      </div>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span
              className={`text-sm font-medium ${getStatusColor(
                module.data?.status
              )}`}
            >
              {module.data?.status || "狀態未知"}
            </span>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-blue-600 group-hover:underline flex items-center">
            前往分析
            <svg
              className="h-4 w-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Overview;
