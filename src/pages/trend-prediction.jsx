import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import StockChart from '../components/Charts/StockChart';

const TrendPrediction = () => {
  const historicalData = [
    { date: '2024-01', price: 100, volume: 1000 },
    { date: '2024-02', price: 120, volume: 1500 },
    { date: '2024-03', price: 115, volume: 1200 },
    { date: '2024-04', price: 130, volume: 1800 },
    { date: '2024-05', price: 125, volume: 1600 },
  ];

  const predictions = [
    {
      stock: '2330',
      name: '台積電',
      currentPrice: '785',
      prediction: '850',
      confidence: 85,
      timeframe: '3個月',
      factors: ['AI需求成長', '先進製程領先', '全球擴產'],
    },
    {
      stock: '2317',
      name: '鴻海',
      currentPrice: '104.5',
      prediction: '115',
      confidence: 75,
      timeframe: '6個月',
      factors: ['電動車布局', '伺服器業務成長', '供應鏈整合'],
    },
    {
      stock: '2454',
      name: '聯發科',
      currentPrice: '925',
      prediction: '1000',
      confidence: 80,
      timeframe: '3個月',
      factors: ['5G滲透率提升', 'AI晶片布局', '市占率提升'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <LightBulbIcon className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">趨勢預測</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">歷史走勢</h2>
            <StockChart data={historicalData} type="line" />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">AI 預測分析</h2>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.stock} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-lg font-semibold">{prediction.stock}</span>
                      <span className="text-gray-500 ml-2">{prediction.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">目標價</div>
                      <div className="text-lg font-semibold text-blue-500">${prediction.prediction}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>現價：${prediction.currentPrice}</span>
                    <span>預測期間：{prediction.timeframe}</span>
                    <span>信心指數：{prediction.confidence}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.factors.map((factor, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendPrediction; 