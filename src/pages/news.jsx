import React from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';

const News = () => {
  const news = [
    {
      title: '台積電宣布在日本熊本縣建設第二座先進封裝廠',
      date: '2024-02-15',
      source: '經濟日報',
      category: '科技',
      summary: '台積電今日宣布將在日本熊本縣建設第二座先進封裝廠，預計2027年底完工，將為客戶提供先進封裝服務。',
    },
    {
      title: '央行維持利率不變，強調通膨壓力仍在',
      date: '2024-02-14',
      source: '中央社',
      category: '總經',
      summary: '中央銀行今日召開理監事會議，決議維持政策利率不變，但強調通膨壓力仍在，將持續關注物價走勢。',
    },
    {
      title: 'AI概念股持續發燒，相關ETF規模突破千億',
      date: '2024-02-13',
      source: '工商時報',
      category: '股市',
      summary: '隨著AI應用持續擴大，相關概念股表現強勁，帶動相關ETF規模快速成長，已突破千億元大關。',
    },
    {
      title: '全球半導體產業復甦，台廠接單暢旺',
      date: '2024-02-12',
      source: '經濟日報',
      category: '產業',
      summary: '全球半導體產業景氣回溫，台灣廠商接單暢旺，多家廠商產能利用率維持高檔。',
    },
    {
      title: '金融股獲利亮眼，股利政策受關注',
      date: '2024-02-11',
      source: '工商時報',
      category: '金融',
      summary: '金融股去年獲利表現亮眼，市場關注各金控股利政策，預期現金股利將維持高檔。',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <NewspaperIcon className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">最新新聞</h1>
        </div>
        
        <div className="grid gap-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">
                  {item.category}
                </span>
                <span>{item.date}</span>
                <span className="mx-2">•</span>
                <span>{item.source}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                {item.title}
              </h2>
              <p className="text-gray-600">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News; 