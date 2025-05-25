import React from "react";
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import type { ModelSettings } from "@/types/prediction";

interface TradingSettingsProps {
  modelSettings: ModelSettings;
  onSettingChange: (setting: keyof ModelSettings) => void;
}

const TradingSettings: React.FC<TradingSettingsProps> = ({
  modelSettings,
  onSettingChange,
}) => {
  const handleToggle = (setting: keyof ModelSettings) => {
    onSettingChange(setting);
  };

  return (
    <div className="p-5">
      <div className="flex items-center mb-4">
        <CogIcon className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">AI模型設定</h3>
      </div>

      {/* 自動交易設定 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">自動交易</h4>
              <p className="text-sm text-gray-500">啟用AI自動執行交易建議</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={modelSettings.autoTrading}
              onChange={() => handleToggle("autoTrading")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Line Bot 通知設定 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Line Bot 通知</h4>
              <p className="text-sm text-gray-500">接收交易信號和市場提醒</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={modelSettings.linebotNotification}
              onChange={() => handleToggle("linebotNotification")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* 風險管理設定 */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">風險管理</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大單筆投資金額 (USD)
            </label>
            <input
              type="number"
              defaultValue="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="輸入金額"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              停損百分比 (%)
            </label>
            <input
              type="number"
              defaultValue="5"
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="輸入百分比"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              獲利了結百分比 (%)
            </label>
            <input
              type="number"
              defaultValue="15"
              min="5"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="輸入百分比"
            />
          </div>
        </div>
      </div>

      {/* AI模型選擇 */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">AI模型選擇</h4>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="lstm">LSTM 長短期記憶網路</option>
          <option value="transformer">Transformer 模型</option>
          <option value="ensemble">混合模型</option>
        </select>
      </div>

      {/* 保存按鈕 */}
      <div className="mt-6">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
          保存設定
        </button>
      </div>
    </div>
  );
};

export default TradingSettings;
