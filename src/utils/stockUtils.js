// 根據漲跌幅返回顏色
export const getPriceChangeColor = (change) => {
  if (
    parseFloat(change) > 0 ||
    (typeof change === "string" && change.includes("+"))
  ) {
    return "text-green-600";
  } else if (
    parseFloat(change) < 0 ||
    (typeof change === "string" && change.includes("-"))
  ) {
    return "text-red-600";
  } else {
    return "text-gray-600";
  }
};

// 根據分析評級返回顏色
export const getRatingColor = (rating) => {
  if (rating.includes("買進") || rating.includes("強力")) {
    return "bg-green-100 text-green-800";
  } else if (rating.includes("賣出") || rating.includes("減持")) {
    return "bg-red-100 text-red-800";
  } else {
    return "bg-blue-100 text-blue-800";
  }
};

// 根據情緒返回顏色
export const getSentimentColor = (sentiment) => {
  if (sentiment === "正面") {
    return "text-green-600";
  } else if (sentiment === "負面") {
    return "text-red-600";
  } else {
    return "text-yellow-600";
  }
};

// 根據狀態返回顏色
export const getStatusColor = (status) => {
  if (
    status &&
    (status.includes("多頭") ||
      status.includes("上漲") ||
      status.includes("高成長"))
  ) {
    return "text-green-600";
  } else if (status && (status.includes("下跌") || status.includes("空頭"))) {
    return "text-red-600";
  } else if (status && status.includes("中性")) {
    return "text-blue-600";
  } else {
    return "text-gray-600";
  }
};
