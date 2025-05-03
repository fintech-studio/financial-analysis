import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  BoltIcon,
  FireIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FuturesMarket = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');

  // 模擬數據
  const marketData = {
    overview: {
      totalVolume: '2.5億口',
      openInterest: '1.8億口',
      turnover: '3.2兆元',
      upDown: '上漲: 45% / 下跌: 55%',
      highlights: [
        '原油期貨因中東局勢緊張上漲',
        '黃金期貨避險需求增加',
        '農產品期貨受天氣影響波動加大'
      ]
    },
    categories: [
      {
        name: '商品期貨',
        performance: '+2.1%',
        strength: '強',
        leadingContracts: ['原油', '黃金', '銅'],
        description: '受地緣政治影響，商品期貨普遍走強',
        weight: 35
      },
      {
        name: '金融期貨',
        performance: '-0.8%',
        strength: '弱',
        leadingContracts: ['股指期貨', '利率期貨', '匯率期貨'],
        description: '市場觀望情緒濃厚，金融期貨表現疲軟',
        weight: 30
      },
      {
        name: '農產品期貨',
        performance: '+1.5%',
        strength: '中',
        leadingContracts: ['大豆', '玉米', '小麥'],
        description: '天氣因素影響農產品期貨走勢',
        weight: 20
      },
      {
        name: '其他期貨',
        performance: '+0.5%',
        strength: '中',
        leadingContracts: ['其他合約'],
        description: '其他期貨品種表現',
        weight: 15
      }
    ],
    commodities: {
      oil: {
        name: '原油期貨',
        symbol: 'CL',
        price: '75.5',
        change: '-0.8%',
        volume: '880萬口',
        openInterest: '650萬口',
        description: '原油價格維持盤整，供需平衡',
        indicators: [
          {
            name: 'OPEC產量',
            value: '28.5M',
            change: '-0.2M',
            trend: 'down',
            description: 'OPEC維持減產協議'
          },
          {
            name: '美國庫存',
            value: '450M',
            change: '+5M',
            trend: 'up',
            description: '庫存小幅增加'
          },
          {
            name: '全球需求',
            value: '100M',
            change: '+0.5M',
            trend: 'up',
            description: '需求穩定成長'
          }
        ],
        technical: [
          {
            name: 'RSI(14)',
            value: '45',
            signal: '中性',
            description: '相對強弱指標顯示中性'
          },
          {
            name: 'MACD',
            value: '-0.5',
            signal: '空頭',
            description: 'MACD維持空頭趨勢'
          },
          {
            name: '布林通道',
            value: '中軌',
            signal: '中性',
            description: '價格位於中軌，顯示盤整'
          }
        ],
        supply: {
          opec: {
            production: '28.5M',
            change: '-0.2M',
            quota: '29.0M',
            compliance: '98%'
          },
          nonOpec: {
            production: '65.5M',
            change: '+0.3M',
            forecast: '66.0M'
          },
          total: {
            production: '94.0M',
            change: '+0.1M',
            capacity: '96.0M'
          }
        },
        demand: {
          global: {
            current: '100M',
            change: '+0.5M',
            forecast: '101M'
          },
          regions: [
            {
              name: '亞洲',
              demand: '35M',
              share: '35%',
              growth: '+2.5%'
            },
            {
              name: '北美',
              demand: '25M',
              share: '25%',
              growth: '+1.5%'
            },
            {
              name: '歐洲',
              demand: '20M',
              share: '20%',
              growth: '+1.0%'
            },
            {
              name: '其他',
              demand: '20M',
              share: '20%',
              growth: '+1.8%'
            }
          ]
        },
        history: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          price: [72, 74, 73, 75, 76, 75.5],
          volume: [850, 880, 860, 870, 890, 880],
          rsi: [45, 48, 46, 47, 45, 45]
        }
      },
      gold: {
        name: '黃金期貨',
        symbol: 'GC',
        price: '2,035',
        change: '+1.2%',
        volume: '960萬口',
        openInterest: '720萬口',
        description: '黃金價格維持強勢，避險需求支撐',
        indicators: [
          {
            name: '美元指數',
            value: '103.5',
            change: '-0.5',
            trend: 'down',
            description: '美元走弱，支撐黃金價格'
          },
          {
            name: '通膨率',
            value: '3.1%',
            change: '-0.1%',
            trend: 'down',
            description: '通膨壓力緩解，但仍高於目標'
          },
          {
            name: '實質利率',
            value: '1.8%',
            change: '-0.2%',
            trend: 'down',
            description: '實質利率下降，有利黃金'
          }
        ],
        technical: [
          {
            name: 'RSI(14)',
            value: '65',
            signal: '強勢',
            description: '相對強弱指標顯示超買'
          },
          {
            name: 'MACD',
            value: '+2.5',
            signal: '多頭',
            description: 'MACD維持多頭趨勢'
          },
          {
            name: '布林通道',
            value: '上軌',
            signal: '強勢',
            description: '價格位於上軌，顯示強勢'
          }
        ],
        history: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          price: [1950, 1980, 2000, 2010, 2020, 2035],
          volume: [850, 880, 900, 920, 940, 960],
          rsi: [55, 58, 60, 62, 64, 65]
        }
      }
    },
    technical: {
      ma5: '17,850',
      ma10: '17,780',
      ma20: '17,650',
      rsi: '58',
      macd: '多頭',
      support: '17,500',
      resistance: '18,000'
    },
    priceHistory: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      prices: [16800, 16900, 17100, 17300, 17500, 17850],
      volumes: [2500, 2600, 2700, 2800, 2900, 2850]
    },
    strategies: {
      trend: [
        { symbol: 'CL', name: '原油期貨', trend: '上升', strength: '強', score: 85 },
        { symbol: 'GC', name: '黃金期貨', trend: '上升', strength: '中', score: 75 },
      ],
      momentum: [
        { symbol: 'SI', name: '白銀期貨', momentum: '強', volatility: '高', score: 80 },
        { symbol: 'HG', name: '銅期貨', momentum: '中', volatility: '中', score: 70 },
      ],
      arbitrage: [
        { symbol: 'ZB', name: '美國債券期貨', spread: '0.25%', opportunity: '高', score: 90 },
        { symbol: 'ZN', name: '歐洲債券期貨', spread: '0.15%', opportunity: '中', score: 75 },
      ],
    },
    riskManagement: {
      marginRequirements: {
        'CL': '5,000',
        'GC': '4,500',
        'SI': '3,500',
        'HG': '4,000'
      },
      positionLimits: {
        'CL': '10,000',
        'GC': '8,000',
        'SI': '6,000',
        'HG': '7,000'
      },
      riskMetrics: {
        var: '2.5%',
        sharpeRatio: '1.8',
        maxDrawdown: '8.5%'
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
        text: '期貨價格走勢'
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
        text: '期貨品種分布'
      }
    }
  };

  const technicalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'RSI指標趨勢'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  const factorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '影響因素強度'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  const demandChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: '需求分布'
      }
    }
  };

  // 圖表數據
  const priceChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: '價格',
        data: marketData.priceHistory.prices,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const volumeChartData = {
    labels: marketData.priceHistory.labels,
    datasets: [
      {
        label: '成交量(萬口)',
        data: marketData.priceHistory.volumes,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };

  const categoryChartData = {
    labels: marketData.categories.map(category => category.name),
    datasets: [
      {
        data: marketData.categories.map(category => category.weight),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const oilPriceChartData = {
    labels: marketData.commodities.oil.history.labels,
    datasets: [
      {
        label: '原油價格',
        data: marketData.commodities.oil.history.price,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const oilVolumeChartData = {
    labels: marketData.commodities.oil.history.labels,
    datasets: [
      {
        label: '成交量(萬口)',
        data: marketData.commodities.oil.history.volume,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const oilRsiChartData = {
    labels: marketData.commodities.oil.history.labels,
    datasets: [
      {
        label: 'RSI',
        data: marketData.commodities.oil.history.rsi,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      }
    ]
  };

  const goldPriceChartData = {
    labels: marketData.commodities.gold.history.labels,
    datasets: [
      {
        label: '黃金價格',
        data: marketData.commodities.gold.history.price,
        borderColor: 'rgb(255, 205, 86)',
        tension: 0.1
      }
    ]
  };

  const goldVolumeChartData = {
    labels: marketData.commodities.gold.history.labels,
    datasets: [
      {
        label: '成交量(萬口)',
        data: marketData.commodities.gold.history.volume,
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
      }
    ]
  };

  const goldRsiChartData = {
    labels: marketData.commodities.gold.history.labels,
    datasets: [
      {
        label: 'RSI',
        data: marketData.commodities.gold.history.rsi,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const oilDemandChartData = {
    labels: marketData.commodities.oil.demand.regions.map(region => region.name),
    datasets: [
      {
        data: marketData.commodities.oil.demand.regions.map(region => parseInt(region.share)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-blue-500';
    
    switch (status.toLowerCase()) {
      case '上漲':
      case '強':
      case '多頭':
      case '強勢':
        return 'text-green-500';
      case '下跌':
      case '弱':
      case '空頭':
        return 'text-red-500';
      case '中':
      case '中性':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    
    switch (trend.toLowerCase()) {
      case 'up':
      case '上升':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
      case '下降':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getFilteredFutures = () => {
    return marketData.strategies[selectedCategory] || [];
  };

  const getSelectedCommodityData = () => {
    if (selectedCommodity === 'oil') {
      return marketData.commodities.oil;
    } else if (selectedCommodity === 'gold') {
      return marketData.commodities.gold;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartPieIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">期貨市場分析</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋期貨商品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">所有商品</option>
                <option value="oil">原油期貨</option>
                <option value="gold">黃金期貨</option>
              </select>
            </div>
          </div>

          {/* 分頁標籤 */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                市場概況
              </button>
              <button
                onClick={() => setActiveTab('commodities')}
                className={`${
                  activeTab === 'commodities'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                商品分析
              </button>
              <button
                onClick={() => setActiveTab('technical')}
                className={`${
                  activeTab === 'technical'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                技術分析
              </button>
              <button
                onClick={() => setActiveTab('strategies')}
                className={`${
                  activeTab === 'strategies'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
              >
                交易策略
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 市場概況卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">總成交量</h3>
                  <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{marketData.overview.totalVolume}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">未平倉量</h3>
                  <ChartPieIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{marketData.overview.openInterest}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">成交金額</h3>
                  <BanknotesIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{marketData.overview.turnover}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">漲跌家數</h3>
                  <ArrowPathIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-lg font-medium text-gray-900">{marketData.overview.upDown}</div>
              </div>
            </div>

            {/* 重點商品走勢 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">重點商品走勢</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">原油期貨 (CL)</h4>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">${marketData.commodities.oil.price}</span>
                    <span className={`text-sm font-medium ${getStatusColor(marketData.commodities.oil.change.startsWith('+') ? '上漲' : '下跌')}`}>
                      {marketData.commodities.oil.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Line
                      data={{
                        labels: marketData.commodities.oil.history.labels,
                        datasets: [
                          {
                            label: '價格',
                            data: marketData.commodities.oil.history.price,
                            borderColor: 'rgb(79, 70, 229)',
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                      height={200}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">黃金期貨 (GC)</h4>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">${marketData.commodities.gold.price}</span>
                    <span className={`text-sm font-medium ${getStatusColor(marketData.commodities.gold.change.startsWith('+') ? '上漲' : '下跌')}`}>
                      {marketData.commodities.gold.change}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Line
                      data={{
                        labels: marketData.commodities.gold.history.labels,
                        datasets: [
                          {
                            label: '價格',
                            data: marketData.commodities.gold.history.price,
                            borderColor: 'rgb(234, 179, 8)',
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                      height={200}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 市場亮點 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">市場亮點</h3>
              <div className="space-y-4">
                {marketData.overview.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    <p className="text-gray-700">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commodities' && (
          <div className="space-y-6">
            {/* 商品選擇器 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原油分析 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'oil' ? 'hidden' : ''}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">原油期貨分析</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">價格</p>
                        <p className="text-lg font-medium text-gray-900">${marketData.commodities.oil.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">漲跌幅</p>
                        <p className={`text-lg font-medium ${getStatusColor(marketData.commodities.oil.change.startsWith('+') ? '上漲' : '下跌')}`}>
                          {marketData.commodities.oil.change}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">成交量</p>
                        <p className="text-lg font-medium text-gray-900">{marketData.commodities.oil.volume}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">未平倉量</p>
                        <p className="text-lg font-medium text-gray-900">{marketData.commodities.oil.openInterest}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">市場指標</h4>
                      <div className="space-y-3">
                        {marketData.commodities.oil.indicators.map((indicator, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{indicator.name}</p>
                              <p className="text-sm text-gray-500">{indicator.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{indicator.value}</p>
                              <p className={`text-sm ${getStatusColor(indicator.trend === 'up' ? '上漲' : '下跌')}`}>
                                {indicator.change}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 黃金分析 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'gold' ? 'hidden' : ''}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">黃金期貨分析</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">價格</p>
                        <p className="text-lg font-medium text-gray-900">${marketData.commodities.gold.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">漲跌幅</p>
                        <p className={`text-lg font-medium ${getStatusColor(marketData.commodities.gold.change.startsWith('+') ? '上漲' : '下跌')}`}>
                          {marketData.commodities.gold.change}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">成交量</p>
                        <p className="text-lg font-medium text-gray-900">{marketData.commodities.gold.volume}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">未平倉量</p>
                        <p className="text-lg font-medium text-gray-900">{marketData.commodities.gold.openInterest}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">市場指標</h4>
                      <div className="space-y-3">
                        {marketData.commodities.gold.indicators.map((indicator, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{indicator.name}</p>
                              <p className="text-sm text-gray-500">{indicator.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{indicator.value}</p>
                              <p className={`text-sm ${getStatusColor(indicator.trend === 'up' ? '上漲' : '下跌')}`}>
                                {indicator.change}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            {/* 技術指標 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">技術指標分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原油技術分析 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'oil' ? 'hidden' : ''}`}>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">原油期貨技術指標</h4>
                  <div className="space-y-4">
                    {marketData.commodities.oil.technical.map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{indicator.name}</p>
                          <p className="text-sm text-gray-500">{indicator.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{indicator.value}</p>
                          <p className={`text-sm ${getStatusColor(indicator.signal)}`}>{indicator.signal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 黃金技術分析 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'gold' ? 'hidden' : ''}`}>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">黃金期貨技術指標</h4>
                  <div className="space-y-4">
                    {marketData.commodities.gold.technical.map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{indicator.name}</p>
                          <p className="text-sm text-gray-500">{indicator.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{indicator.value}</p>
                          <p className={`text-sm ${getStatusColor(indicator.signal)}`}>{indicator.signal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-6">
            {/* 交易策略 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">交易策略建議</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原油交易策略 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'oil' ? 'hidden' : ''}`}>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">原油期貨交易策略</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">趨勢策略</p>
                      <p className="text-sm text-gray-500 mt-1">
                        目前處於盤整階段，建議等待明確突破方向。支撐位：$73.5，壓力位：$77.8
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">動能策略</p>
                      <p className="text-sm text-gray-500 mt-1">
                        RSI處於中性區域，MACD呈現空頭趨勢，建議觀望為主
                      </p>
                    </div>
                  </div>
                </div>

                {/* 黃金交易策略 */}
                <div className={`${selectedCommodity !== 'all' && selectedCommodity !== 'gold' ? 'hidden' : ''}`}>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">黃金期貨交易策略</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">趨勢策略</p>
                      <p className="text-sm text-gray-500 mt-1">
                        維持多頭趨勢，建議逢回調買進。支撐位：$2,015，壓力位：$2,050
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">動能策略</p>
                      <p className="text-sm text-gray-500 mt-1">
                        RSI處於強勢區域，但已接近超買，建議設置止損保護獲利
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturesMarket; 