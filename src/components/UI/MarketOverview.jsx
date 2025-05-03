import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const MarketOverview = () => {
  const marketData = [
    { name: '台股指數', value: '17,935.28', change: '+1.2%', isUp: true },
    { name: '道瓊指數', value: '38,654.42', change: '-0.3%', isUp: false },
    { name: '納斯達克', value: '15,628.95', change: '+0.8%', isUp: true },
    { name: '標普500', value: '4,927.93', change: '+0.5%', isUp: true },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">市場概覽</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketData.map((item) => (
          <div key={item.name} className="p-4 border rounded-lg">
            <h3 className="text-gray-600 text-sm">{item.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-semibold">{item.value}</span>
              <span className={`flex items-center ${item.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {item.isUp ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview; 