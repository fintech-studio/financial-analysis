import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  BoltIcon,
  CurrencyYenIcon,
  NewspaperIcon,
  ChartBarSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  GlobeAsiaAustraliaIcon,
  CircleStackIcon,
  PhotoIcon,
  CubeTransparentIcon,
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

const CryptoMarket = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('all');
  const [selectedNFTCategory, setSelectedNFTCategory] = useState('all');

  // 模擬數據
  const marketData = {
    overview: {
      market: {
        overall: '盤整',
        price: '45,250',
        change: '-2.5%',
        description: '加密貨幣市場維持盤整，成交量略減'
      },
      indicators: [
        {
          name: '24h成交量',
          value: '85.2B',
          change: '-5.2B',
          trend: 'down',
          description: '成交量較昨日減少'
        },
        {
          name: '市值',
          value: '1.2T',
          change: '-0.05T',
          trend: 'down',
          description: '市值小幅下跌'
        },
        {
          name: '恐懼指數',
          value: '45',
          change: '-5',
          trend: 'down',
          description: '市場恐懼情緒增加'
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
          value: '-125',
          signal: '空頭',
          description: 'MACD維持空頭趨勢'
        },
        {
          name: '布林通道',
          value: '中軌',
          signal: '中性',
          description: '價格位於中軌，顯示盤整'
        }
      ]
    },
    coins: [
      {
        name: '比特幣',
        symbol: 'BTC',
        price: '45,250',
        change: '-2.5%',
        volume: '35.2B',
        volumeChange: '-2.1B',
        strength: '弱勢',
        description: '比特幣維持盤整',
        marketCap: '850B',
        dominance: '45%'
      },
      {
        name: '以太幣',
        symbol: 'ETH',
        price: '2,350',
        change: '-1.8%',
        volume: '15.8B',
        volumeChange: '-1.2B',
        strength: '弱勢',
        description: '以太幣跟隨大盤走勢',
        marketCap: '280B',
        dominance: '25%'
      },
      {
        name: '幣安幣',
        symbol: 'BNB',
        price: '320',
        change: '-1.2%',
        volume: '1.2B',
        volumeChange: '-0.2B',
        strength: '中性',
        description: '幣安幣表現相對穩定',
        marketCap: '45B',
        dominance: '5%'
      },
      {
        name: '索拉納',
        symbol: 'SOL',
        price: '95',
        change: '+2.5%',
        volume: '2.8B',
        volumeChange: '+0.5B',
        strength: '強勢',
        description: '索拉納逆勢上漲',
        marketCap: '35B',
        dominance: '3%'
      }
    ],
    factors: [
      {
        name: '宏觀經濟',
        impact: '負面',
        strength: 75,
        description: '經濟數據影響市場信心',
        details: [
          '通膨數據高於預期',
          '就業市場強勁',
          '利率維持高檔'
        ]
      },
      {
        name: '監管環境',
        impact: '負面',
        strength: 65,
        description: '監管壓力持續',
        details: [
          'SEC審批延遲',
          '全球監管趨嚴',
          '合規要求增加'
        ]
      },
      {
        name: '技術發展',
        impact: '正面',
        strength: 70,
        description: '技術創新持續',
        details: [
          'Layer 2發展加速',
          '跨鏈技術進步',
          'DeFi生態擴展'
        ]
      },
      {
        name: '市場情緒',
        impact: '負面',
        strength: 60,
        description: '市場情緒偏向謹慎',
        details: [
          '恐懼指數上升',
          '槓桿率下降',
          '資金流入減少'
        ]
      }
    ],
    forecast: [
      {
        period: '短期',
        outlook: '偏空',
        confidence: 70,
        keyFactors: [
          '宏觀經濟數據',
          '監管消息',
          '市場情緒'
        ]
      },
      {
        period: '中期',
        outlook: '中性',
        confidence: 65,
        keyFactors: [
          '技術發展進度',
          '機構採用情況',
          '市場結構變化'
        ]
      },
      {
        period: '長期',
        outlook: '偏多',
        confidence: 75,
        keyFactors: [
          '基礎設施完善',
          '應用場景擴展',
          '監管框架明確'
        ]
      }
    ],
    history: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      btcPrice: [42000, 43000, 44000, 45000, 46000, 45250],
      ethPrice: [2200, 2250, 2300, 2350, 2400, 2350],
      volume: [90, 88, 86, 85, 87, 85.2],
      rsi: [45, 48, 46, 47, 45, 45]
    },
    defi: {
      totalValueLocked: '$48.5B',
      protocols: [
        { name: 'Uniswap', tvl: '$5.8B', volume24h: '$2.1B', apy: '12.5%' },
        { name: 'Aave', tvl: '$4.2B', volume24h: '$890M', apy: '3.8%' },
        { name: 'Curve', tvl: '$3.9B', volume24h: '$750M', apy: '8.2%' },
      ],
    },
    nft: {
      totalVolume24h: '25,890 ETH',
      collections: [
        { name: 'Bored Ape YC', floorPrice: '68.5 ETH', volume24h: '892 ETH', items: 10000 },
        { name: 'CryptoPunks', floorPrice: '58.2 ETH', volume24h: '654 ETH', items: 9999 },
        { name: 'Azuki', floorPrice: '12.8 ETH', volume24h: '445 ETH', items: 10000 },
      ],
    },
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
        text: '加密貨幣價格趨勢'
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
        text: '24小時成交量趨勢'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const marketCapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '市值分布'
      }
    }
  };

  const rsiChartOptions = {
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

  // 圖表數據
  const priceChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '比特幣',
        data: marketData.history.btcPrice,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: '以太幣',
        data: marketData.history.ethPrice,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const volumeChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '24h成交量',
        data: marketData.history.volume,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const marketCapChartData = {
    labels: marketData.coins.map(coin => coin.name),
    datasets: [
      {
        data: marketData.coins.map(coin => parseFloat(coin.dominance)),
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

  const rsiChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: 'RSI',
        data: marketData.history.rsi,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      }
    ]
  };

  const factorChartData = {
    labels: marketData.factors.map(factor => factor.name),
    datasets: [
      {
        label: '影響強度',
        data: marketData.factors.map(factor => factor.strength),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-blue-500';
    
    switch (status.toLowerCase()) {
      case 'up':
      case '強勢':
      case '正面':
      case '偏多':
      case '多頭':
        return 'text-green-500';
      case 'down':
      case '弱勢':
      case '負面':
      case '偏空':
      case '空頭':
        return 'text-red-500';
      case 'neutral':
      case '中性':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  // DeFi協議分析圖表數據
  const defiChartData = {
    labels: marketData.defi.protocols.map(p => p.name),
    datasets: [
      {
        label: '總鎖倉量 (TVL)',
        data: marketData.defi.protocols.map(p => parseFloat(p.tvl.slice(1).split('B')[0])),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // NFT市場數據圖表
  const nftChartData = {
    labels: marketData.nft.collections.map(c => c.name),
    datasets: [
      {
        label: '24小時交易量 (ETH)',
        data: marketData.nft.collections.map(c => parseFloat(c.volume24h.split(' ')[0])),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BoltIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">加密貨幣市場分析</h1>
            </div>
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋幣種或指標..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 導航標籤 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'coins', 'factors', 'forecast', 'defi', 'nft'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '市場概況'}
                {tab === 'coins' && '幣種分析'}
                {tab === 'factors' && '影響因素'}
                {tab === 'forecast' && '市場預測'}
                {tab === 'defi' && 'DeFi協議分析'}
                {tab === 'nft' && 'NFT市場追蹤器'}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">市場概況</h3>
                <span className={`text-sm font-medium ${getStatusColor(marketData.overview.market.overall)}`}>
                  {marketData.overview.market.overall}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">${marketData.overview.market.price}</span>
                <span className={`text-sm font-medium ${getStatusColor(marketData.overview.market.change.startsWith('+') ? 'up' : 'down')}`}>
                  {marketData.overview.market.change}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{marketData.overview.market.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.overview.indicators.map((indicator) => (
                <div key={indicator.name} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(indicator.trend)}`}>
                      {indicator.change > 0 ? '+' : ''}{indicator.change}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{indicator.value}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{indicator.description}</p>
                </div>
              ))}
            </div>

            {/* 價格趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={priceChartOptions} data={priceChartData} />
              </div>
            </div>

            {/* 成交量趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={volumeChartOptions} data={volumeChartData} />
              </div>
            </div>

            {/* 市值分布圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Doughnut options={marketCapChartOptions} data={marketCapChartData} />
              </div>
            </div>

            {/* 技術指標 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.overview.technical.map((indicator) => (
                <div key={indicator.name} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(indicator.signal)}`}>
                      {indicator.signal}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{indicator.value}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{indicator.description}</p>
                </div>
              ))}
            </div>

            {/* RSI趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={rsiChartOptions} data={rsiChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coins' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketData.coins.map((coin) => (
                <div key={coin.symbol} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{coin.name} ({coin.symbol})</h3>
                    <span className={`text-sm font-medium ${getStatusColor(coin.strength)}`}>
                      {coin.strength}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">${coin.price}</span>
                    <span className={`text-sm font-medium ${getStatusColor(coin.change.startsWith('+') ? 'up' : 'down')}`}>
                      {coin.change}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{coin.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">24h成交量</p>
                        <p className="text-sm font-medium text-gray-900">{coin.volume}</p>
                        <p className={`text-xs ${getStatusColor(coin.volumeChange.startsWith('+') ? 'up' : 'down')}`}>
                          {coin.volumeChange}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">市值</p>
                        <p className="text-sm font-medium text-gray-900">{coin.marketCap}</p>
                        <p className="text-xs text-gray-500">市占率: {coin.dominance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketData.factors.map((factor) => (
                <div key={factor.name} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{factor.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(factor.impact)}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{factor.strength}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{factor.description}</p>
                  <ul className="mt-4 space-y-2">
                    {factor.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600">• {detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 影響因素強度圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Bar options={factorChartOptions} data={factorChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.forecast.map((forecast) => (
                <div key={forecast.period} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{forecast.period}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(forecast.outlook)}`}>
                      {forecast.outlook}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{forecast.confidence}%</span>
                    <span className="text-sm text-gray-500">信心指數</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">關鍵因素：</p>
                    <ul className="space-y-1">
                      {forecast.keyFactors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-600">• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'defi' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-500" />
                  DeFi協議分析
                </h2>
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">總鎖倉量 (TVL)</div>
                  <div className="text-2xl font-semibold text-gray-900">{marketData.defi.totalValueLocked}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <Bar data={defiChartData} options={chartOptions} />
                  </div>
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">協議</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVL</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APY</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {marketData.defi.protocols.map((protocol) => (
                          <tr key={protocol.name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{protocol.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{protocol.tvl}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{protocol.apy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nft' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-blue-500" />
                  NFT市場追蹤器
                </h2>
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">24小時總交易量</div>
                  <div className="text-2xl font-semibold text-gray-900">{marketData.nft.totalVolume24h}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <Bar data={nftChartData} options={chartOptions} />
                  </div>
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">系列</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地板價</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易量</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {marketData.nft.collections.map((collection) => (
                          <tr key={collection.name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.floorPrice}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.volume24h}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default CryptoMarket; 