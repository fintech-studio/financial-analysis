import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const StockScreener = () => {
  const [filters, setFilters] = useState({
    priceRange: 'all',
    marketCap: 'all',
    sector: 'all',
  });

  const stocks = [
    { symbol: '2330', name: '台積電', price: '785', marketCap: '20.3T', sector: '半導體' },
    { symbol: '2317', name: '鴻海', price: '104.5', marketCap: '1.4T', sector: '電子' },
    { symbol: '2412', name: '中華電', price: '116', marketCap: '0.9T', sector: '電信' },
    { symbol: '2454', name: '聯發科', price: '925', marketCap: '1.5T', sector: '半導體' },
    { symbol: '2881', name: '富邦金', price: '65.3', marketCap: '0.8T', sector: '金融' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">股票篩選</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格區間</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              >
                <option value="all">全部</option>
                <option value="0-50">0-50元</option>
                <option value="50-100">50-100元</option>
                <option value="100-500">100-500元</option>
                <option value="500+">500元以上</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">市值</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.marketCap}
                onChange={(e) => setFilters({ ...filters, marketCap: e.target.value })}
              >
                <option value="all">全部</option>
                <option value="small">小型股</option>
                <option value="medium">中型股</option>
                <option value="large">大型股</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">產業</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              >
                <option value="all">全部</option>
                <option value="semiconductor">半導體</option>
                <option value="electronics">電子</option>
                <option value="finance">金融</option>
                <option value="telecom">電信</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名稱</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">價格</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">市值</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">產業</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{stock.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{stock.marketCap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockScreener; 