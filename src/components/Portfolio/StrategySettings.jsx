import React, { useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const StrategySettings = () => {
  const [settings, setSettings] = useState({
    riskControl: {
      stopLoss: 10,
      takeProfit: 20,
      maxPositionSize: 30,
    },
    alerts: {
      priceAlert: true,
      volumeAlert: true,
      newsAlert: true,
    },
    rebalancing: {
      frequency: "monthly",
      threshold: 5,
    },
  });

  return (
    <div className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="border-b pb-4">
        <h2 className="text-lg font-medium">投資策略設定</h2>
      </div>

      {/* 風險控制設定 */}
      <div className="space-y-4">
        <h3 className="flex items-center text-md font-medium">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
          風險控制
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              停損設定 (%)
            </label>
            <input
              type="number"
              value={settings.riskControl.stopLoss}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  riskControl: {
                    ...settings.riskControl,
                    stopLoss: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              停利設定 (%)
            </label>
            <input
              type="number"
              value={settings.riskControl.takeProfit}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              單一持股上限 (%)
            </label>
            <input
              type="number"
              value={settings.riskControl.maxPositionSize}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 提醒設定 */}
      <div className="space-y-4">
        <h3 className="flex items-center text-md font-medium">
          <BellAlertIcon className="h-5 w-5 mr-2 text-yellow-500" />
          通知設定
        </h3>
        <div className="space-y-2">
          {Object.entries(settings.alerts).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    alerts: { ...settings.alerts, [key]: e.target.checked },
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {key === "priceAlert"
                  ? "價格波動提醒"
                  : key === "volumeAlert"
                  ? "成交量異常提醒"
                  : "重大新聞提醒"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 再平衡設定 */}
      <div className="space-y-4">
        <h3 className="flex items-center text-md font-medium">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-green-500" />
          投資組合再平衡
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              再平衡頻率
            </label>
            <select
              value={settings.rebalancing.frequency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  rebalancing: {
                    ...settings.rebalancing,
                    frequency: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="monthly">每月</option>
              <option value="quarterly">每季</option>
              <option value="yearly">每年</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              觸發閾值 (%)
            </label>
            <input
              type="number"
              value={settings.rebalancing.threshold}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
          取消
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          儲存設定
        </button>
      </div>
    </div>
  );
};

export default StrategySettings;
