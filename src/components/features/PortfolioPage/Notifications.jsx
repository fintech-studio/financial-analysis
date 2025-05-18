import React, { useState } from "react";
import {
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  NewspaperIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const Notifications = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "全部通知", icon: BellAlertIcon },
    { id: "price", name: "價格異動", icon: ArrowTrendingUpIcon },
    { id: "news", name: "重大新聞", icon: NewspaperIcon },
    { id: "dividend", name: "除權息", icon: BanknotesIcon },
    { id: "report", name: "財報公告", icon: DocumentTextIcon },
  ];

  const notifications = [
    {
      id: 1,
      category: "price",
      type: "warning",
      title: "價格異常波動",
      stock: "台積電 (2330)",
      message: "股價在15分鐘內下跌超過3%，請注意風險",
      time: "3分鐘前",
      detail: "目前股價: 565元 (-3.5%)",
      importance: "high",
    },
    {
      id: 2,
      category: "news",
      type: "info",
      title: "重大新聞公告",
      stock: "鴻海 (2317)",
      message: "宣布新一代電動車產業布局計畫",
      time: "30分鐘前",
      detail: "預計投資500億元發展電動車產業鏈",
      importance: "medium",
    },
    {
      id: 3,
      category: "dividend",
      type: "reminder",
      title: "除息提醒",
      stock: "中華電 (2412)",
      message: "將於下週三 (3/15) 除息",
      time: "2小時前",
      detail: "現金股利: 4.5元",
      importance: "medium",
    },
    {
      id: 4,
      category: "report",
      type: "info",
      title: "財報公告",
      stock: "聯發科 (2454)",
      message: "2024年第一季財報即將發布",
      time: "4小時前",
      detail: "預定發布時間: 2024/5/10",
      importance: "medium",
    },
  ];

  const getTypeStyles = (type) => {
    switch (type) {
      case "warning":
        return "bg-red-50 border-red-200 text-red-700";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "reminder":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const filteredNotifications =
    activeCategory === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* 分類標籤列 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full ${
                activeCategory === category.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <category.icon className="h-5 w-5 mr-2" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 通知列表 */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-lg p-4 ${getTypeStyles(
              notification.type
            )}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  {notification.type === "warning" && (
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  )}
                  <h3 className="font-medium">{notification.title}</h3>
                </div>
                <p className="mt-1 text-sm">{notification.stock}</p>
                <p className="mt-2">{notification.message}</p>
                <p className="mt-1 text-sm opacity-75">{notification.detail}</p>
              </div>
              <div className="text-sm opacity-75">{notification.time}</div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button className="text-sm font-medium hover:underline">
                查看詳情
              </button>
              <button className="text-sm font-medium hover:underline">
                標記已讀
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 設定按鈕 */}
      <div className="flex justify-end">
        <button className="text-sm text-indigo-600 hover:text-indigo-800">
          通知設定
        </button>
      </div>
    </div>
  );
};

export default Notifications;
