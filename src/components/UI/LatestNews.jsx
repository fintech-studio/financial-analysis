import React from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';

const LatestNews = () => {
  const news = [
    {
      title: '台積電宣布在日本熊本縣建設第二座先進封裝廠',
      date: '2024-02-15',
      source: '經濟日報',
      category: '科技',
    },
    {
      title: '央行維持利率不變，強調通膨壓力仍在',
      date: '2024-02-14',
      source: '中央社',
      category: '總經',
    },
    {
      title: 'AI概念股持續發燒，相關ETF規模突破千億',
      date: '2024-02-13',
      source: '工商時報',
      category: '股市',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <NewspaperIcon className="w-6 h-6 mr-2 text-blue-500" />
        <h2 className="text-xl font-bold">最新新聞</h2>
      </div>
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                {item.category}
              </span>
              <span>{item.date}</span>
              <span className="mx-2">•</span>
              <span>{item.source}</span>
            </div>
            <h3 className="text-lg font-medium hover:text-blue-600 cursor-pointer">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestNews; 