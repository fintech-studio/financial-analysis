import React, { useState, useEffect } from 'react';
import { ChartBarIcon, CurrencyDollarIcon, ChartPieIcon, ArrowTrendingUpIcon, FireIcon, BoltIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import StockChart from '../components/Charts/StockChart';

const CryptoAnalysis = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(false);

  // 模擬加密貨幣數據
  const cryptoData = {
    'BTC': {
      name: '比特幣',
      symbol: 'BTC',
      currentPrice: 65000,
      change: '+1500',
      changePercent: '+2.36%',
      volume: '32.5B',
      marketCap: '1.2T',
      dominance: '42%',
      rank: 1,
      technicalIndicators: {
        ma5: 64500,
        ma20: 64000,
        rsi: 58,
        macd: 250,
        support: 63000,
        resistance: 67000,
      },
      marketData: {
        totalSupply: '21M',
        circulatingSupply: '19.5M',
        maxSupply: '21M',
        allTimeHigh: '69000',
        allTimeLow: '3000',
        marketCapRank: 1,
        fullyDilutedMarketCap: '1.36T',
      },
      sentiment: {
        fearGreedIndex: 65,
        socialScore: 78,
        newsScore: 72,
        overall: 'Bullish',
      },
      networkStats: {
        hashRate: '350 EH/s',
        difficulty: '48.7T',
        activeAddresses: '1.2M',
        transactions: '350K',
      }
    },
    'ETH': {
      name: '以太幣',
      symbol: 'ETH',
      currentPrice: 3500,
      change: '+75',
      changePercent: '+2.19%',
      volume: '15.2B',
      marketCap: '420B',
      dominance: '18%',
      rank: 2,
      technicalIndicators: {
        ma5: 3480,
        ma20: 3450,
        rsi: 55,
        macd: 15,
        support: 3400,
        resistance: 3600,
      },
      marketData: {
        totalSupply: '120M',
        circulatingSupply: '119.5M',
        maxSupply: '∞',
        allTimeHigh: '4800',
        allTimeLow: '100',
        marketCapRank: 2,
        fullyDilutedMarketCap: '420B',
      },
      sentiment: {
        fearGreedIndex: 60,
        socialScore: 75,
        newsScore: 68,
        overall: 'Moderately Bullish',
      },
      networkStats: {
        hashRate: '1.2 TH/s',
        difficulty: '15.5P',
        activeAddresses: '800K',
        transactions: '1.2M',
      }
    }
  };

  // 歷史數據
  const historicalData = {
    '1D': {
      dates: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      prices: [64000, 64500, 64800, 65200, 65000, 65000],
      volumes: [25000000000, 28000000000, 30000000000, 27000000000, 32500000000, 32000000000]
    },
    '1W': {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      prices: [63000, 63500, 64000, 64500, 64800, 65000, 65000],
      volumes: [28000000000, 29000000000, 30000000000, 31000000000, 32000000000, 31500000000, 32500000000]
    },
    '1M': {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      prices: [62000, 63000, 64000, 65000],
      volumes: [27000000000, 29000000000, 31000000000, 32500000000]
    }
  };

  // 模擬載入數據
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [selectedCrypto, timeframe]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">加密貨幣分析</h1>
        <div className="flex gap-4">
          <select 
            className="input-field w-64"
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
          >
            <option value="BTC">比特幣 (BTC)</option>
            <option value="ETH">以太幣 (ETH)</option>
          </select>
          <div className="flex gap-2">
            {['1D', '1W', '1M'].map((tf) => (
              <button
                key={tf}
                className={`px-4 py-2 rounded ${
                  timeframe === tf ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* 基本資訊卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{cryptoData[selectedCrypto].name}</h3>
                  <p className="text-sm text-gray-500">排名 #{cryptoData[selectedCrypto].rank}</p>
                </div>
                <span className={`text-lg ${cryptoData[selectedCrypto].change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  ${cryptoData[selectedCrypto].currentPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">漲跌</span>
                <span className={`${cryptoData[selectedCrypto].change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {cryptoData[selectedCrypto].change} ({cryptoData[selectedCrypto].changePercent})
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">24h 成交量</h3>
                <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">${cryptoData[selectedCrypto].volume}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">市值</h3>
                <ChartPieIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">${cryptoData[selectedCrypto].marketCap}</div>
              <div className="text-sm text-gray-500">排名 #{cryptoData[selectedCrypto].marketData.marketCapRank}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">市場主導率</h3>
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{cryptoData[selectedCrypto].dominance}</div>
            </div>
          </div>

          {/* 圖表區域 */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">價格走勢</h2>
            <StockChart data={historicalData[timeframe]} />
          </div>

          {/* 技術分析 */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">技術分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">MA5</h3>
                <p className="text-lg">${cryptoData[selectedCrypto].technicalIndicators.ma5.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">MA20</h3>
                <p className="text-lg">${cryptoData[selectedCrypto].technicalIndicators.ma20.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">RSI</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].technicalIndicators.rsi}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">MACD</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].technicalIndicators.macd}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">支撐位</h3>
                <p className="text-lg">${cryptoData[selectedCrypto].technicalIndicators.support.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">阻力位</h3>
                <p className="text-lg">${cryptoData[selectedCrypto].technicalIndicators.resistance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 市場數據 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">市場數據</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">總供應量</h3>
                  <p className="text-lg">{cryptoData[selectedCrypto].marketData.totalSupply}</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">流通供應量</h3>
                  <p className="text-lg">{cryptoData[selectedCrypto].marketData.circulatingSupply}</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">最大供應量</h3>
                  <p className="text-lg">{cryptoData[selectedCrypto].marketData.maxSupply}</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">完全稀釋市值</h3>
                  <p className="text-lg">${cryptoData[selectedCrypto].marketData.fullyDilutedMarketCap}</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">歷史最高價</h3>
                  <p className="text-lg">${cryptoData[selectedCrypto].marketData.allTimeHigh.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-2">歷史最低價</h3>
                  <p className="text-lg">${cryptoData[selectedCrypto].marketData.allTimeLow.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 市場情緒 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">市場情緒</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">恐懼貪婪指數</h3>
                    <FireIcon className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-lg">{cryptoData[selectedCrypto].sentiment.fearGreedIndex}</p>
                </div>
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">社交媒體評分</h3>
                    <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-lg">{cryptoData[selectedCrypto].sentiment.socialScore}</p>
                </div>
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">新聞情緒評分</h3>
                    <BoltIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-lg">{cryptoData[selectedCrypto].sentiment.newsScore}</p>
                </div>
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">整體情緒</h3>
                    <ChartBarIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-lg">{cryptoData[selectedCrypto].sentiment.overall}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 網路統計 */}
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-bold mb-4">網路統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">算力</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].networkStats.hashRate}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">難度</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].networkStats.difficulty}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">活躍地址</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].networkStats.activeAddresses}</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">24h 交易數</h3>
                <p className="text-lg">{cryptoData[selectedCrypto].networkStats.transactions}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoAnalysis; 