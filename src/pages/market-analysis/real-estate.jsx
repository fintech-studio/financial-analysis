import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  BoltIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  BuildingOfficeIcon
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

const RealEstateMarket = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // 模擬數據
  const marketData = {
    overview: {
      market: {
        overall: '盤整',
        price: '35.2',
        change: '-0.5%',
        description: '房市維持盤整，成交量略減'
      },
      indicators: [
        {
          name: '成交量',
          value: '2,850',
          change: '-150',
          trend: 'down',
          description: '成交量較上月減少'
        },
        {
          name: '平均單價',
          value: '35.2萬',
          change: '-0.5萬',
          trend: 'down',
          description: '平均單價小幅下跌'
        },
        {
          name: '待售量',
          value: '12,500',
          change: '+500',
          trend: 'up',
          description: '待售量持續增加'
        }
      ],
      technical: [
        {
          name: '價格指數',
          value: '105.2',
          signal: '中性',
          description: '價格指數維持穩定'
        },
        {
          name: '成交量指數',
          value: '95.5',
          signal: '弱勢',
          description: '成交量指數低於平均'
        },
        {
          name: '市場熱度',
          value: '45',
          signal: '中性',
          description: '市場熱度維持中性'
        }
      ]
    },
    regions: [
      {
        name: '台北市',
        price: '65.8萬',
        change: '-0.8%',
        volume: '850',
        volumeChange: '-50',
        strength: '弱勢',
        description: '高總價產品去化較慢',
        leadingAreas: ['信義區', '大安區', '松山區']
      },
      {
        name: '新北市',
        price: '42.5萬',
        change: '-0.3%',
        volume: '1,200',
        volumeChange: '-100',
        strength: '中性',
        description: '首購需求穩定',
        leadingAreas: ['板橋區', '中和區', '新莊區']
      },
      {
        name: '桃園市',
        price: '28.5萬',
        change: '+0.2%',
        volume: '950',
        volumeChange: '+50',
        strength: '強勢',
        description: '科技業帶動需求',
        leadingAreas: ['桃園區', '中壢區', '龜山區']
      },
      {
        name: '台中市',
        price: '32.8萬',
        change: '+0.5%',
        volume: '1,100',
        volumeChange: '+100',
        strength: '強勢',
        description: '產業發展帶動房市',
        leadingAreas: ['西屯區', '南屯區', '北屯區']
      }
    ],
    factors: [
      {
        name: '利率環境',
        impact: '負面',
        strength: 80,
        description: '利率維持高檔',
        details: [
          '央行維持高利率',
          '房貸利率居高不下',
          '購屋成本增加'
        ]
      },
      {
        name: '經濟成長',
        impact: '中性',
        strength: 60,
        description: '經濟成長放緩',
        details: [
          'GDP成長預期下調',
          '就業市場穩定',
          '通膨壓力持續'
        ]
      },
      {
        name: '政策環境',
        impact: '負面',
        strength: 70,
        description: '打炒房政策持續',
        details: [
          '限貸令持續',
          '囤房稅2.0上路',
          '預售屋實登2.0'
        ]
      },
      {
        name: '供需結構',
        impact: '負面',
        strength: 65,
        description: '供給增加需求減少',
        details: [
          '新建案持續推出',
          '待售量增加',
          '首購需求減少'
        ]
      }
    ],
    forecast: [
      {
        period: '短期',
        outlook: '偏空',
        confidence: 75,
        keyFactors: [
          '利率維持高檔',
          '政策持續緊縮',
          '成交量持續低迷'
        ]
      },
      {
        period: '中期',
        outlook: '中性',
        confidence: 70,
        keyFactors: [
          '利率可能開始下降',
          '經濟逐步復甦',
          '供需結構調整'
        ]
      },
      {
        period: '長期',
        outlook: '偏多',
        confidence: 65,
        keyFactors: [
          '產業發展帶動需求',
          '人口結構變化',
          '都市更新加速'
        ]
      }
    ],
    history: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      price: [35.5, 35.4, 35.3, 35.2, 35.2, 35.2],
      volume: [3200, 3100, 3000, 2950, 2900, 2850],
      index: [105, 104.8, 104.5, 104.2, 104.0, 103.8]
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
        text: '房價趨勢'
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
        text: '成交量趨勢'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const indexChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '房價指數趨勢'
      }
    },
    scales: {
      y: {
        beginAtZero: false
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

  const regionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '區域房價分布'
      }
    }
  };

  // 圖表數據
  const priceChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '平均單價',
        data: marketData.history.price,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const volumeChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '成交量',
        data: marketData.history.volume,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const indexChartData = {
    labels: marketData.history.labels,
    datasets: [
      {
        label: '房價指數',
        data: marketData.history.index,
        borderColor: 'rgb(255, 99, 132)',
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

  const regionChartData = {
    labels: marketData.regions.map(region => region.name),
    datasets: [
      {
        data: marketData.regions.map(region => parseFloat(region.price)),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">房地產市場分析</h1>
            </div>
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋指標或分析..."
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
            {['overview', 'regions', 'factors', 'forecast'].map((tab) => (
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
                {tab === 'regions' && '區域分析'}
                {tab === 'factors' && '影響因素'}
                {tab === 'forecast' && '市場預測'}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">房市概況</h3>
                <span className={`text-sm font-medium ${getStatusColor(marketData.overview.market.overall)}`}>
                  {marketData.overview.market.overall}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">{marketData.overview.market.price}萬/坪</span>
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

            {/* 房價指數趨勢圖 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-[300px]">
                <Line options={indexChartOptions} data={indexChartData} />
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
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">區域房價分布</h3>
                <div className="h-[300px]">
                  <Doughnut options={regionChartOptions} data={regionChartData} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">區域市場概況</h3>
                <div className="space-y-4">
                  {marketData.regions.map((region) => (
                    <div key={region.name} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{region.name}</h4>
                        <p className="text-sm text-gray-500">{region.price}/坪</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(region.change.startsWith('+') ? 'up' : 'down')}`}>
                          {region.change}
                        </p>
                        <p className="text-sm text-gray-500">成交量: {region.volume}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketData.regions.map((region) => (
                <div key={region.name} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(region.strength)}`}>
                      {region.strength}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{region.price}/坪</span>
                    <span className={`text-sm font-medium ${getStatusColor(region.change.startsWith('+') ? 'up' : 'down')}`}>
                      {region.change}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{region.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">成交量: {region.volume} ({region.volumeChange > 0 ? '+' : ''}{region.volumeChange})</p>
                    <p className="text-sm text-gray-500 mb-2">熱門區域:</p>
                    <div className="flex flex-wrap gap-2">
                      {region.leadingAreas.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {area}
                        </span>
                      ))}
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
      </div>
    </div>
  );
};

export default RealEstateMarket; 