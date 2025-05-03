import React, { useState } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import StockChart from '../components/Charts/StockChart';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' 或 'screener'
  const [screenerFilters, setScreenerFilters] = useState({
    priceRange: { min: '', max: '' },
    marketCap: { min: '', max: '' },
    peRatio: { min: '', max: '' },
    dividendYield: { min: '', max: '' },
  });

  // 模擬投資組合數據
  const portfolioData = {
    summary: {
      totalValue: '1,250,000',
      totalReturn: '+125,000',
      returnPercentage: '+11.11%',
      dailyChange: '+12,500',
      dailyChangePercentage: '+1.01%',
    },
    holdings: [
      { symbol: '2330', name: '台積電', shares: 1000, avgPrice: '650', currentPrice: '785', value: '785,000', return: '+135,000', returnPercentage: '+20.77%' },
      { symbol: '2317', name: '鴻海', shares: 2000, avgPrice: '98', currentPrice: '105', value: '210,000', return: '+14,000', returnPercentage: '+7.14%' },
      { symbol: '2454', name: '聯發科', shares: 500, avgPrice: '950', currentPrice: '1085', value: '542,500', return: '+67,500', returnPercentage: '+14.21%' },
      { symbol: '2412', name: '中華電', shares: 1000, avgPrice: '110', currentPrice: '115', value: '115,000', return: '+5,000', returnPercentage: '+4.55%' },
    ],
    chartData: {
      dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
      values: [1125000, 1140000, 1160000, 1180000, 1250000],
    },
  };

  // 模擬股票篩選結果
  const screenerResults = [
    { symbol: '2330', name: '台積電', price: '785', marketCap: '20.3T', peRatio: '15.2', dividendYield: '2.1%' },
    { symbol: '2317', name: '鴻海', price: '105', marketCap: '1.4T', peRatio: '12.8', dividendYield: '3.5%' },
    { symbol: '2454', name: '聯發科', price: '1085', marketCap: '1.7T', peRatio: '18.5', dividendYield: '1.8%' },
    { symbol: '2412', name: '中華電', price: '115', marketCap: '0.9T', peRatio: '14.2', dividendYield: '4.2%' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 標題和標籤切換 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">投資組合與股票篩選</h1>
        <div className="flex space-x-4">
          <button
            className={`btn-primary ${activeTab === 'portfolio' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('portfolio')}
          >
            投資組合
          </button>
          <button
            className={`btn-primary ${activeTab === 'screener' ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('screener')}
          >
            股票篩選
          </button>
        </div>
      </div>

      {activeTab === 'portfolio' ? (
        <>
          {/* 投資組合摘要 */}
          <section className="mb-12">
            <h2 className="section-title">投資組合摘要</h2>
            <div className="grid-layout">
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">總資產價值</h3>
                <p className="text-2xl font-bold">NT$ {portfolioData.summary.totalValue}</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">總投資報酬</h3>
                <p className="text-2xl font-bold text-green-500">
                  +NT$ {portfolioData.summary.totalReturn} ({portfolioData.summary.returnPercentage})
                </p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">今日變動</h3>
                <p className="text-2xl font-bold text-green-500">
                  +NT$ {portfolioData.summary.dailyChange} ({portfolioData.summary.dailyChangePercentage})
                </p>
              </div>
            </div>
          </section>

          {/* 投資組合走勢圖 */}
          <section className="mb-12">
            <h2 className="section-title">投資組合走勢</h2>
            <div className="chart-container">
              <StockChart data={portfolioData.chartData} />
            </div>
          </section>

          {/* 持股明細 */}
          <section className="mb-12">
            <h2 className="section-title">持股明細</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>股票代號</th>
                    <th>股票名稱</th>
                    <th>持股數量</th>
                    <th>平均成本</th>
                    <th>現價</th>
                    <th>市值</th>
                    <th>投資報酬</th>
                    <th>報酬率</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.holdings.map((holding) => (
                    <tr key={holding.symbol}>
                      <td>{holding.symbol}</td>
                      <td>{holding.name}</td>
                      <td>{holding.shares.toLocaleString()}</td>
                      <td>NT$ {holding.avgPrice}</td>
                      <td>NT$ {holding.currentPrice}</td>
                      <td>NT$ {holding.value}</td>
                      <td className="text-green-500">+NT$ {holding.return}</td>
                      <td className="text-green-500">{holding.returnPercentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* 股票篩選器 */}
          <section className="mb-12">
            <h2 className="section-title">股票篩選條件</h2>
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
                  {screenerResults.map((stock) => (
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
        </>
      )}
    </div>
  );
};

export default Portfolio; 