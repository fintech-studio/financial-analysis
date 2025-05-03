import React, { useState } from 'react';
import {
  ChartBarIcon,
  HeartIcon,
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
  LightBulbIcon
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

const MarketSentiment = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // 模擬數據
  const marketData = {
    overview: {
      sentiment: {
        overall: '樂觀',
        score: 65,
        change: '+5',
        description: '市場整體情緒偏向樂觀，投資者信心增強'
      },
      indicators: [
        {
          name: 'VIX恐懼指數',
          value: '15.2',
          change: '-0.8',
          trend: 'down',
          description: '市場波動性降低，風險偏好上升'
        },
        {
          name: '貪婪恐懼指數',
          value: '65',
          change: '+5',
          trend: 'up',
          description: '投資者情緒偏向貪婪，需注意回調風險'
        },
        {
          name: '市場廣度',
          value: '58%',
          change: '+3%',
          trend: 'up',
          description: '上漲股票比例增加，市場動能改善'
        }
      ],
      sectors: [
        {
          name: '科技',
          sentiment: '強勢',
          strength: 85,
          change: '+5',
          leadingStocks: ['台積電', '聯發科', '聯電'],
          description: 'AI需求帶動科技股走強'
        },
        {
          name: '金融',
          sentiment: '中性',
          strength: 55,
          change: '0',
          leadingStocks: ['國泰金', '富邦金', '兆豐金'],
          description: '利率環境改善支撐金融股'
        },
        {
          name: '傳產',
          sentiment: '弱勢',
          strength: 35,
          change: '-5',
          leadingStocks: ['台塑', '南亞', '中鋼'],
          description: '原物料價格波動影響表現'
        }
      ]
    },
    factors: [
      {
        name: '總體經濟',
        impact: '正面',
        strength: 75,
        description: '經濟數據優於預期，支撐市場信心',
        details: [
          'GDP成長率優於預期',
          '就業市場維持強勁',
          '通膨壓力緩解'
        ]
      },
      {
        name: '政策環境',
        impact: '中性',
        strength: 50,
        description: '政策方向明確，但執行效果待觀察',
        details: [
          '貨幣政策維持寬鬆',
          '財政刺激措施持續',
          '監管政策趨於穩定'
        ]
      },
      {
        name: '市場動能',
        impact: '正面',
        strength: 80,
        description: '資金面充裕，技術面轉強',
        details: [
          '成交量持續放大',
          '技術指標轉多',
          '外資持續買超'
        ]
      },
      {
        name: '國際情勢',
        impact: '負面',
        strength: 40,
        description: '地緣政治風險增加，影響市場信心',
        details: [
          '國際衝突升溫',
          '貿易摩擦加劇',
          '匯率波動加大'
        ]
      }
    ],
    forecast: [
      {
        period: '短期',
        outlook: '偏多',
        confidence: 75,
        keyFactors: [
          '技術面轉強',
          '資金面充裕',
          '政策面支持'
        ]
      },
      {
        period: '中期',
        outlook: '中性偏多',
        confidence: 65,
        keyFactors: [
          '經濟數據改善',
          '企業獲利成長',
          '國際風險增加'
        ]
      },
      {
        period: '長期',
        outlook: '中性',
        confidence: 55,
        keyFactors: [
          '結構性改革',
          '產業轉型升級',
          '全球經濟變化'
        ]
      }
    ],
    history: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      sentiment: [50, 55, 58, 60, 62, 65],
      vix: [18, 17, 16, 16, 15, 15],
      breadth: [45, 48, 52, 55, 56, 58]
    }
  };

  // 圖表配置
  const sentimentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '市場情緒趨勢'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  const vixChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'VIX恐懼指數趨勢'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const sectorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: '產業情緒分布'
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
  const sentimentChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '市場情緒指數',
        data: marketData.history.sentiment,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const vixChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: 'VIX指數',
        data: marketData.history.vix,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const sectorChartData = {
    labels: marketData.overview.sectors.map(sector => sector.name),
    datasets: [
      {
        data: marketData.overview.sectors.map(sector => sector.strength),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
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
        return 'text-green-500';
      case 'down':
      case '弱勢':
      case '負面':
      case '偏空':
        return 'text-red-500';
      case 'neutral':
      case '中性':
        return 'text-yellow-500';
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
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">市場情緒分析</h1>
            </div>
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋情緒指標..."
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
            {['overview', 'sectors', 'factors', 'forecast'].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'overview' && '整體情緒'}
                {tab === 'sectors' && '產業情緒'}
                {tab === 'factors' && '影響因素'}
                {tab === 'forecast' && '情緒預測'}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">整體市場情緒</h3>
                <span className={`text-sm font-medium ${getStatusColor(marketData.overview.sentiment.overall)}`}>
                  {marketData.overview.sentiment.overall}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">{marketData.overview.sentiment.score}</span>
                <span className={`text-sm font-medium ${getStatusColor(marketData.overview.sentiment.change > 0 ? 'up' : 'down')}`}>
                  {marketData.overview.sentiment.change > 0 ? '+' : ''}{marketData.overview.sentiment.change}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{marketData.overview.sentiment.description}</p>
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

            {/* 情緒趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={sentimentChartOptions} data={sentimentChartData} />
              </div>
            </div>

            {/* VIX趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={vixChartOptions} data={vixChartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sectors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.overview.sectors.map((sector) => (
                <div key={sector.name} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(sector.sentiment)}`}>
                      {sector.sentiment}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{sector.strength}</span>
                    <span className={`text-sm font-medium ${getStatusColor(sector.change > 0 ? 'up' : 'down')}`}>
                      {sector.change > 0 ? '+' : ''}{sector.change}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">{sector.description}</p>
                    <div className="text-sm">
                      <span className="text-gray-500">領漲個股：</span>
                      <span className="text-gray-900">{sector.leadingStocks.join('、')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 產業情緒分布圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Doughnut options={sectorChartOptions} data={sectorChartData} />
              </div>
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
      </div>
    </div>
  );
};

export default MarketSentiment; 