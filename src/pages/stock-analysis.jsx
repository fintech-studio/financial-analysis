import React, { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import StockChart from '../components/Charts/StockChart';

const StockAnalysis = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'market', 'crypto'
  const [screenerFilters, setScreenerFilters] = useState({
    priceRange: { min: '', max: '' },
    marketCap: { min: '', max: '' },
    peRatio: { min: '', max: '' },
    dividendYield: { min: '', max: '' },
  });

  // 模擬股票數據
  const stockData = {
    currentStock: {
      symbol: '2330',
      name: '台積電',
      price: '785',
      change: '+15',
      changePercent: '+1.95%',
      volume: '32,456,789',
      marketCap: '20.3T',
      peRatio: '15.2',
      dividendYield: '2.1%',
      technicalIndicators: {
        ma5: '780',
        ma20: '775',
        rsi: '65',
        macd: '+2.5',
      },
      chartData: {
        dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
        prices: [750, 760, 770, 780, 785],
        volumes: [25000000000, 28000000000, 30000000000, 27000000000, 32456789],
      },
    },
    screenerResults: [
      { symbol: '2330', name: '台積電', price: '785', marketCap: '20.3T', peRatio: '15.2', dividendYield: '2.1%' },
      { symbol: '2317', name: '鴻海', price: '105', marketCap: '1.4T', peRatio: '12.8', dividendYield: '3.5%' },
      { symbol: '2454', name: '聯發科', price: '1085', marketCap: '1.7T', peRatio: '18.5', dividendYield: '1.8%' },
      { symbol: '2412', name: '中華電', price: '115', marketCap: '0.9T', peRatio: '14.2', dividendYield: '4.2%' },
    ],
  };

  // 模擬市場數據
  const marketData = {
    indices: [
      { name: '台股指數', value: '17,935', change: '+125', changePercent: '+0.70%' },
      { name: '道瓊指數', value: '38,790', change: '-45', changePercent: '-0.12%' },
      { name: '納斯達克', value: '16,248', change: '+180', changePercent: '+1.12%' },
      { name: '標普500', value: '5,137', change: '+25', changePercent: '+0.49%' },
    ],
    sectors: [
      { name: '半導體', change: '+2.5%', trend: 'up' },
      { name: '金融', change: '-0.8%', trend: 'down' },
      { name: '航運', change: '+1.2%', trend: 'up' },
      { name: '電子', change: '+1.8%', trend: 'up' },
    ],
    chartData: {
      dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
      prices: [17000, 17100, 17200, 17300, 17935],
      volumes: [25000000000, 28000000000, 30000000000, 27000000000, 32456789],
    },
  };

  // 模擬加密貨幣數據
  const cryptoData = {
    indices: [
      { name: '比特幣', value: '65,000', change: '+1,500', changePercent: '+2.36%' },
      { name: '以太幣', value: '3,500', change: '+75', changePercent: '+2.19%' },
      { name: '幣安幣', value: '580', change: '+12', changePercent: '+2.11%' },
      { name: '索拉納', value: '125', change: '+5', changePercent: '+4.17%' },
    ],
    sectors: [
      { name: 'DeFi', change: '+3.2%', trend: 'up' },
      { name: 'NFT', change: '-1.5%', trend: 'down' },
      { name: 'GameFi', change: '+2.8%', trend: 'up' },
      { name: 'Layer1', change: '+1.9%', trend: 'up' },
    ],
    chartData: {
      dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
      prices: [42000, 45000, 48000, 52000, 65000],
      volumes: [35000000000, 38000000000, 42000000000, 45000000000, 48000000000],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 標題和標籤切換 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">股票分析</h1>
        <div className="flex space-x-4">
          <button
            className={`btn-primary ${activeTab === 'stock' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('stock')}
          >
            個股分析
          </button>
          <button
            className={`btn-primary ${activeTab === 'market' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('market')}
          >
            市場分析
          </button>
          <button
            className={`btn-primary ${activeTab === 'crypto' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('crypto')}
          >
            加密貨幣
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* 股票篩選器 */}
          <section className="mb-12">
            <h2 className="section-title">股票篩選</h2>
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">股價範圍</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最低"
                      value={screenerFilters.priceRange.min}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        priceRange: { ...screenerFilters.priceRange, min: e.target.value }
                      })}
                    />
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最高"
                      value={screenerFilters.priceRange.max}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        priceRange: { ...screenerFilters.priceRange, max: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">市值範圍</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最低"
                      value={screenerFilters.marketCap.min}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        marketCap: { ...screenerFilters.marketCap, min: e.target.value }
                      })}
                    />
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最高"
                      value={screenerFilters.marketCap.max}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        marketCap: { ...screenerFilters.marketCap, max: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">本益比範圍</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最低"
                      value={screenerFilters.peRatio.min}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        peRatio: { ...screenerFilters.peRatio, min: e.target.value }
                      })}
                    />
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最高"
                      value={screenerFilters.peRatio.max}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        peRatio: { ...screenerFilters.peRatio, max: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">股息率範圍</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最低"
                      value={screenerFilters.dividendYield.min}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        dividendYield: { ...screenerFilters.dividendYield, min: e.target.value }
                      })}
                    />
                    <input
                      type="number"
                      className="input-field w-1/2"
                      placeholder="最高"
                      value={screenerFilters.dividendYield.max}
                      onChange={(e) => setScreenerFilters({
                        ...screenerFilters,
                        dividendYield: { ...screenerFilters.dividendYield, max: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  搜尋
                </button>
              </div>
            </div>
          </section>

          {/* 篩選結果 */}
          <section className="mb-12">
            <h2 className="section-title">篩選結果</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>股票代號</th>
                    <th>股票名稱</th>
                    <th>現價</th>
                    <th>市值</th>
                    <th>本益比</th>
                    <th>股息率</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.screenerResults.map((stock) => (
                    <tr key={stock.symbol}>
                      <td>{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>NT$ {stock.price}</td>
                      <td>{stock.marketCap}</td>
                      <td>{stock.peRatio}</td>
                      <td>{stock.dividendYield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 個股分析 */}
          <section className="mb-12">
            <h2 className="section-title">個股分析 - {stockData.currentStock.name} ({stockData.currentStock.symbol})</h2>
            <div className="grid-layout">
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">現價</span>
                    <span className="font-semibold">NT$ {stockData.currentStock.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">漲跌</span>
                    <span className="text-green-500">+NT$ {stockData.currentStock.change} ({stockData.currentStock.changePercent})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">成交量</span>
                    <span>{stockData.currentStock.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">市值</span>
                    <span>{stockData.currentStock.marketCap}</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">技術指標</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MA5</span>
                    <span>{stockData.currentStock.technicalIndicators.ma5}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MA20</span>
                    <span>{stockData.currentStock.technicalIndicators.ma20}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSI</span>
                    <span>{stockData.currentStock.technicalIndicators.rsi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MACD</span>
                    <span className="text-green-500">+{stockData.currentStock.technicalIndicators.macd}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 走勢圖 */}
          <section className="mb-12">
            <h2 className="section-title">價格走勢</h2>
            <div className="chart-container">
              <StockChart data={stockData.currentStock.chartData} />
            </div>
          </section>
        </>
      ) : activeTab === 'market' ? (
        <>
          {/* 市場概覽 */}
          <section className="mb-12">
            <h2 className="section-title">市場概覽</h2>
            <div className="grid-layout">
              {marketData.indices.map((index) => (
                <div key={index.name} className="card">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{index.name}</h3>
                    <span className={`text-lg ${index.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {index.value}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-500">漲跌</span>
                    <span className={`${index.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {index.change} ({index.changePercent})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 市場走勢圖 */}
          <section className="mb-12">
            <h2 className="section-title">市場走勢</h2>
            <div className="chart-container">
              <StockChart data={marketData.chartData} />
            </div>
          </section>

          {/* 板塊分析 */}
          <section className="mb-12">
            <h2 className="section-title">板塊分析</h2>
            <div className="grid-layout">
              {marketData.sectors.map((sector) => (
                <div key={sector.name} className="card">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{sector.name}</h3>
                    <div className="flex items-center">
                      {sector.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-1" />
                      )}
                      <span className={sector.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {sector.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* 加密貨幣概覽 */}
          <section className="mb-12">
            <h2 className="section-title">加密貨幣概覽</h2>
            <div className="grid-layout">
              {cryptoData.indices.map((index) => (
                <div key={index.name} className="card">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{index.name}</h3>
                    <span className={`text-lg ${index.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {index.value}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-500">漲跌</span>
                    <span className={`${index.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {index.change} ({index.changePercent})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 加密貨幣走勢圖 */}
          <section className="mb-12">
            <h2 className="section-title">加密貨幣走勢</h2>
            <div className="chart-container">
              <StockChart data={cryptoData.chartData} />
            </div>
          </section>

          {/* 加密貨幣板塊分析 */}
          <section className="mb-12">
            <h2 className="section-title">加密貨幣板塊分析</h2>
            <div className="grid-layout">
              {cryptoData.sectors.map((sector) => (
                <div key={sector.name} className="card">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{sector.name}</h3>
                    <div className="flex items-center">
                      {sector.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-1" />
                      )}
                      <span className={sector.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {sector.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StockAnalysis; 