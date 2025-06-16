import React from "react";
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BanknotesIcon,
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
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3">
          <CogIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI模型設定</h3>
          <p className="text-sm text-gray-500">自動化交易與通知設定</p>
        </div>
      </div>

      {/* 自動交易設定 */}
      <div className="space-y-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">自動交易</h4>
                <p className="text-sm text-gray-600">啟用AI自動執行交易建議</p>
                <div className="mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full inline-block">
                  {modelSettings?.autoTrading ? "已啟用" : "已停用"}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={modelSettings?.autoTrading || false}
                onChange={() => handleToggle("autoTrading")}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Line Bot 通知設定 */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mr-4">
                <BellIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Line Bot 通知
                </h4>
                <p className="text-sm text-gray-600">接收交易信號和市場提醒</p>
                <div className="mt-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full inline-block">
                  {modelSettings?.linebotNotification ? "已啟用" : "已停用"}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={modelSettings?.linebotNotification || false}
                onChange={() => handleToggle("linebotNotification")}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 風險管理設定 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3">
            <BanknotesIcon className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">風險管理參數</h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              最大單筆投資金額 (USD)
            </label>
            <input
              type="number"
              defaultValue="1000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              placeholder="輸入金額"
            />
            <div className="mt-2 text-xs text-gray-600">
              建議範圍：$100 - $5,000
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              停損百分比 (%)
            </label>
            <input
              type="number"
              defaultValue="5"
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              placeholder="輸入百分比"
            />
            <div className="mt-2 text-xs text-gray-600">建議範圍：1% - 20%</div>
          </div>

          <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              獲利了結百分比 (%)
            </label>
            <input
              type="number"
              defaultValue="15"
              min="5"
              max="50"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              placeholder="輸入百分比"
            />
            <div className="mt-2 text-xs text-gray-600">建議範圍：5% - 50%</div>
          </div>
        </div>
      </div>

      {/* AI模型選擇 */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 mb-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mr-3">
            <CpuChipIcon className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">AI模型選擇</h4>
        </div>

        <select className="w-full px-4 py-3 border border-purple-200 rounded-xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200">
          <option value="lstm">LSTM 長短期記憶網路</option>
          <option value="transformer">Transformer 模型</option>
          <option value="ensemble">混合模型 (推薦)</option>
        </select>

        <div className="mt-3 p-3 bg-white/60 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-800 space-y-1">
            <div className="flex justify-between">
              <span>準確率：</span>
              <span className="font-semibold">87.3%</span>
            </div>
            <div className="flex justify-between">
              <span>回測收益：</span>
              <span className="font-semibold text-green-600">+24.6%</span>
            </div>
            <div className="flex justify-between">
              <span>最大回撤：</span>
              <span className="font-semibold text-red-600">-8.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 保存按鈕 */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        <div className="flex items-center justify-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          保存設定
        </div>
      </button>
    </div>
  );
};

export default TradingSettings;
