import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const HotStocks = () => {
  const stocks = [
    { symbol: '2330', name: '台積電', price: '785', change: '+2.5%', isUp: true },
    { symbol: '2317', name: '鴻海', price: '104.5', change: '-1.2%', isUp: false },
    { symbol: '2412', name: '中華電', price: '116', change: '+0.5%', isUp: true },
    { symbol: '2454', name: '聯發科', price: '925', change: '+1.8%', isUp: true },
    { symbol: '2881', name: '富邦金', price: '65.3', change: '-0.8%', isUp: false },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">熱門股票</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">代號</th>
              <th className="text-left py-2">名稱</th>
              <th className="text-right py-2">價格</th>
              <th className="text-right py-2">漲跌幅</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                <td className="py-2">{stock.symbol}</td>
                <td className="py-2">{stock.name}</td>
                <td className="py-2 text-right">{stock.price}</td>
                <td className={`py-2 text-right flex items-center justify-end ${stock.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.isUp ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {stock.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotStocks; 