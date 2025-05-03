import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NFTMarket = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模擬市場數據
  const marketData = {
    overview: {
      totalVolume: '1.2億美元',
      change: '+0.3億美元',
      changePercent: '+33.3%',
      totalSales: '25,432筆',
      averagePrice: '4,721美元',
      uniqueBuyers: '8,562人',
      uniqueSellers: '6,234人',
      highlights: [
        'NFT交易量持續增長，藝術品和遊戲資產需求強勁',
        '元宇宙土地交易活躍，虛擬房地產價格上漲',
        '知名藝術家NFT作品拍賣創新高',
        '遊戲資產NFT交易量大幅增加'
      ]
    },
    categories: [
      {
        name: '藝術品NFT',
        volume: '5,800萬美元',
        change: '+1,200萬美元',
        changePercent: '+26.1%',
        trend: '上漲',
        strength: 85,
        leadingCollections: ['Bored Ape', 'CryptoPunks', 'Art Blocks'],
        marketShare: 48.3
      },
      {
        name: '遊戲資產NFT',
        volume: '4,200萬美元',
        change: '+800萬美元',
        changePercent: '+23.5%',
        trend: '上漲',
        strength: 75,
        leadingCollections: ['Axie Infinity', 'The Sandbox', 'Decentraland'],
        marketShare: 35.0
      },
      {
        name: '收藏品NFT',
        volume: '1,500萬美元',
        change: '+300萬美元',
        changePercent: '+25.0%',
        trend: '上漲',
        strength: 65,
        leadingCollections: ['NBA Top Shot', 'MLB Champions', 'Topps'],
        marketShare: 12.5
      },
      {
        name: '虛擬房地產',
        volume: '500萬美元',
        change: '+100萬美元',
        changePercent: '+25.0%',
        trend: '上漲',
        strength: 55,
        leadingCollections: ['The Sandbox', 'Decentraland', 'Otherside'],
        marketShare: 4.2
      }
    ],
    technicalIndicators: {
      movingAverages: {
        ma5: '4,850美元',
        ma10: '4,720美元',
        ma20: '4,650美元',
        ma60: '4,500美元'
      },
      rsi: 65,
      macd: {
        value: '+125',
        signal: '+85',
        histogram: '+40'
      },
      support: ['4,500美元', '4,300美元', '4,000美元'],
      resistance: ['5,000美元', '5,200美元', '5,500美元']
    },
    priceHistory: [
      { date: '2024-01', price: 4200, volume: 8500 },
      { date: '2024-02', price: 4500, volume: 9200 },
      { date: '2024-03', price: 4721, volume: 10500 },
      { date: '2024-04', price: 4900, volume: 11200 },
      { date: '2024-05', price: 5100, volume: 12000 }
    ],
    strategies: [
      {
        name: '趨勢跟蹤',
        description: '根據市場趨勢進行交易',
        performance: '+15.2%',
        risk: '中等',
        recommendedCollections: ['Bored Ape', 'CryptoPunks', 'Art Blocks']
      },
      {
        name: '價值投資',
        description: '尋找具有長期價值的NFT',
        performance: '+12.8%',
        risk: '低',
        recommendedCollections: ['The Sandbox', 'Decentraland', 'Otherside']
      },
      {
        name: '套利交易',
        description: '利用不同平台間的價格差異',
        performance: '+8.5%',
        risk: '低',
        recommendedCollections: ['NBA Top Shot', 'MLB Champions']
      }
    ],
    riskManagement: {
      marginRequirements: [
        { collection: 'Bored Ape', initial: '20%', maintenance: '15%' },
        { collection: 'CryptoPunks', initial: '25%', maintenance: '20%' },
        { collection: 'Art Blocks', initial: '30%', maintenance: '25%' }
      ],
      riskMetrics: {
        var: '12.5%',
        sharpeRatio: '1.8',
        maxDrawdown: '-15.2%'
      }
    }
  };

  // 圖表配置
  const priceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'NFT價格走勢'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const volumeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '成交量變化'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'NFT分類分布'
      }
    }
  };

  // 圖表數據
  const priceChartData = {
    labels: marketData.priceHistory.map(item => item.date),
    datasets: [
      {
        label: '平均價格',
        data: marketData.priceHistory.map(item => item.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const volumeChartData = {
    labels: marketData.priceHistory.map(item => item.date),
    datasets: [
      {
        label: '成交量',
        data: marketData.priceHistory.map(item => item.volume),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  const categoryChartData = {
    labels: marketData.categories.map(category => category.name),
    datasets: [
      {
        data: marketData.categories.map(category => category.marketShare),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600';
    
    switch (status.toLowerCase()) {
      case '上漲':
      case '強勢':
      case '正面':
        return 'text-green-600';
      case '下跌':
      case '弱勢':
      case '負面':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend.toLowerCase()) {
      case '上漲':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case '下跌':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getFilteredCategories = () => {
    if (selectedCategory === 'all') return marketData.categories;
    return marketData.categories.filter(category => category.name === selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NFT市場分析</h1>
            <p className="mt-2 text-gray-600">即時掌握NFT市場動態與趨勢</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋NFT..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">所有分類</option>
                {marketData.categories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 導航標籤 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'categories', 'technical', 'strategies', 'risk'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '市場概覽'}
                {tab === 'categories' && 'NFT分類'}
                {tab === 'technical' && '技術分析'}
                {tab === 'strategies' && '交易策略'}
                {tab === 'risk' && '風險管理'}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">總成交量</h3>
                  <p className="text-3xl font-bold text-blue-600">{marketData.overview.totalVolume}</p>
                  <p className="text-sm text-blue-700 mt-2">{marketData.overview.change}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">平均價格</h3>
                  <p className="text-3xl font-bold text-green-600">{marketData.overview.averagePrice}</p>
                  <p className="text-sm text-green-700 mt-2">較上月 +5.2%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">活躍用戶</h3>
                  <p className="text-3xl font-bold text-purple-600">{marketData.overview.uniqueBuyers}</p>
                  <p className="text-sm text-purple-700 mt-2">較上月 +12.5%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">價格走勢</h3>
                  <div className="h-64">
                    <Line options={priceChartOptions} data={priceChartData} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">成交量變化</h3>
                  <div className="h-64">
                    <Bar options={volumeChartOptions} data={volumeChartData} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">市場亮點</h3>
                <ul className="space-y-2">
                  {marketData.overview.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                      <span className="ml-2 text-gray-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">分類分布</h3>
                  <div className="h-64">
                    <Doughnut options={categoryChartOptions} data={categoryChartData} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">分類詳情</h3>
                  <div className="space-y-4">
                    {getFilteredCategories().map((category) => (
                      <div key={category.name} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                          <span className={`text-sm font-medium ${getStatusColor(category.trend)}`}>
                            {category.changePercent}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">成交量：</span>
                            <span className="font-medium">{category.volume}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">市佔率：</span>
                            <span className="font-medium">{category.marketShare}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">領先收藏：</span>
                            <span className="font-medium">{category.leadingCollections.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">移動平均線</h3>
                  <div className="space-y-2">
                    {Object.entries(marketData.technicalIndicators.movingAverages).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600">{key.toUpperCase()}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">技術指標</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600">RSI：</span>
                      <span className="font-medium">{marketData.technicalIndicators.rsi}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">MACD：</span>
                      <span className="font-medium">{marketData.technicalIndicators.macd.value}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">支撐位</h3>
                  <ul className="space-y-2">
                    {marketData.technicalIndicators.support.map((level, index) => (
                      <li key={index} className="text-gray-600">{level}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">阻力位</h3>
                  <ul className="space-y-2">
                    {marketData.technicalIndicators.resistance.map((level, index) => (
                      <li key={index} className="text-gray-600">{level}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketData.strategies.map((strategy) => (
                  <div key={strategy.name} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{strategy.name}</h3>
                    <p className="text-gray-600 mb-4">{strategy.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">績效</span>
                        <span className="font-medium text-green-600">{strategy.performance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">風險</span>
                        <span className="font-medium">{strategy.risk}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">推薦收藏</h4>
                      <div className="flex flex-wrap gap-2">
                        {strategy.recommendedCollections.map((collection) => (
                          <span key={collection} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {collection}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">保證金要求</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收藏</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">初始保證金</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">維持保證金</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {marketData.riskManagement.marginRequirements.map((item) => (
                          <tr key={item.collection}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.collection}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.initial}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.maintenance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">風險指標</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VaR (Value at Risk)</span>
                      <span className="font-medium">{marketData.riskManagement.riskMetrics.var}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">夏普比率</span>
                      <span className="font-medium">{marketData.riskManagement.riskMetrics.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">最大回撤</span>
                      <span className="font-medium text-red-600">{marketData.riskManagement.riskMetrics.maxDrawdown}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTMarket; 