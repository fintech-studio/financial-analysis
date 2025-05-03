import React from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  HomeIcon,
  SparklesIcon,
  FireIcon,
  ChartPieIcon,
  BoltIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const MarketAnalysis = () => {
  // 模擬數據
  const marketData = {
    stock: {
      index: '17,935',
      change: '+125',
      changePercent: '+0.70%',
      trend: '上漲',
      volume: '2,835億',
      highlights: '科技股帶動大盤上漲，AI概念股表現強勁'
    },
    crypto: {
      btc: '65,280',
      change: '+1,250',
      changePercent: '+1.95%',
      volume: '485億',
      dominance: '52.3%',
      highlights: '比特幣突破65,000美元，機構投資需求增加'
    },
    global: {
      dow: '38,790',
      change: '-125',
      changePercent: '-0.32%',
      trend: '下跌',
      vix: '15.2',
      highlights: '美股科技股回調，歐洲市場維持穩定'
    },
    sentiment: {
      index: '65',
      status: '樂觀',
      strength: '強',
      change: '+5',
      highlights: '市場情緒維持樂觀，風險偏好提升'
    },
    realEstate: {
      index: '125.8',
      change: '+0.5',
      changePercent: '+0.40%',
      trend: '上漲',
      volume: '1,250億',
      highlights: '房市交易量回升，價格穩步上揚'
    },
    futures: {
      volume: '2.5億口',
      change: '+0.3億口',
      changePercent: '+13.6%',
      trend: '上漲',
      turnover: '3.2兆元',
      highlights: '原油期貨因中東局勢緊張上漲，黃金期貨因避險需求增加',
      commodities: {
        oil: {
          price: '75.5',
          change: '-0.6',
          changePercent: '-0.79%'
        },
        gold: {
          price: '2,035',
          change: '+15',
          changePercent: '+0.74%'
        }
      }
    },
    nft: {
      highlights: 'NFT市場熱度高漲，藝術品和收藏品交易活躍'
    }
  };

  const analysisModules = [
    {
      title: '股票分析',
      description: '股票市場分析',
      icon: ChartBarIcon,
      href: '/market-analysis/stock',
      data: marketData.stock
    },
    {
      title: '加密貨幣',
      description: '加密貨幣市場分析',
      icon: CurrencyDollarIcon,
      href: '/market-analysis/crypto',
      data: marketData.crypto
    },
    {
      title: '全球市場',
      description: '全球市場分析',
      icon: GlobeAltIcon,
      href: '/market-analysis/global',
      data: marketData.global
    },
    {
      title: '市場情緒',
      description: '市場情緒分析',
      icon: HeartIcon,
      href: '/market-analysis/market-sentiment',
      data: marketData.sentiment
    },
    {
      title: '房地產',
      description: '房地產市場分析',
      icon: HomeIcon,
      href: '/market-analysis/real-estate',
      data: marketData.realEstate
    },
    {
      title: 'NFT分析',
      description: 'NFT市場分析',
      icon: PhotoIcon,
      href: '/market-analysis/nft',
      data: marketData.nft
    },
    {
      title: '期貨分析',
      description: '期貨市場分析',
      icon: ChartPieIcon,
      href: '/market-analysis/futures',
      data: marketData.futures
    }
  ];

  const getStatusColor = (status) => {
    if (!status) return 'text-blue-500';
    
    switch (status.toLowerCase()) {
      case '上漲':
      case '樂觀':
      case '強':
        return 'text-green-500';
      case '下跌':
      case '悲觀':
      case '弱':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">市場分析</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span>最後更新：</span>
              <span className="font-medium">{new Date().toLocaleDateString('zh-TW')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 市場概況 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">市場概況</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">台股指數</h3>
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">{marketData.stock.index}</span>
                <span className="text-green-500 font-semibold">{marketData.stock.changePercent}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                成交量：{marketData.stock.volume}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">比特幣</h3>
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">${marketData.crypto.btc}</span>
                <span className="text-green-500 font-semibold">{marketData.crypto.changePercent}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                市值占比：{marketData.crypto.dominance}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">道瓊指數</h3>
                <GlobeAsiaAustraliaIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">{marketData.global.dow}</span>
                <span className="text-red-500 font-semibold">{marketData.global.changePercent}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                VIX指數：{marketData.global.vix}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">市場情緒</h3>
                <HeartIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">{marketData.sentiment.index}</span>
                <span className="text-green-500 font-semibold">+{marketData.sentiment.change}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                狀態：{marketData.sentiment.status}
              </div>
            </div>
          </div>
        </div>

        {/* 分析模組 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">分析工具</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analysisModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${module.bgColor}`}>
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                </div>
                {module.data && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">最新數據</span>
                      <span className={`text-sm font-medium ${getStatusColor(module.data.trend || module.data.status)}`}>
                        {module.data.trend || module.data.status}
                      </span>
                    </div>
                    {module.data.changePercent && (
                      <div className="mt-2 flex items-center">
                        {module.data.changePercent.startsWith('+') ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          module.data.changePercent.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {module.data.changePercent}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* 市場新聞 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">市場新聞</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <BoltIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">台股突破18,000點大關</h3>
                    <p className="mt-1 text-gray-500">台股今日在科技股帶動下，突破18,000點大關，創下近一年新高。分析師指出，全球經濟復甦和國內企業獲利成長是主要推動因素。</p>
                    <div className="mt-2 text-sm text-gray-400">2023年4月24日</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">比特幣突破67,000美元</h3>
                    <p className="mt-1 text-gray-500">比特幣價格今日突破67,000美元，創下近兩年新高。市場分析師認為，機構投資者增加和全球經濟不確定性是推動因素。</p>
                    <div className="mt-2 text-sm text-gray-400">2023年4月23日</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <GlobeAltIcon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">全球央行維持寬鬆政策</h3>
                    <p className="mt-1 text-gray-500">全球主要央行表示將維持寬鬆貨幣政策，以支持經濟復甦。分析師預期，低利率環境將持續，有利於風險資產表現。</p>
                    <div className="mt-2 text-sm text-gray-400">2023年4月22日</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis; 