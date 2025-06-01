import { ChartOptions, ChartData } from "chart.js";

// 定義歷史數據的介面
interface HistoryData {
  labels: string[];
  btcPrice: number[];
  ethPrice: number[];
  volume: number[];
  rsi: number[];
}

// 定義幣種數據的介面
interface CoinData {
  name: string;
  dominance: string;
}

// 定義影響因素數據的介面
interface FactorData {
  name: string;
  strength: number;
}

// 價格圖表配置
export const priceChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "加密貨幣價格趨勢",
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
};

// 成交量圖表配置
export const volumeChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "24小時成交量趨勢",
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
};

// RSI指標圖表配置
export const rsiChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "RSI指標趨勢",
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
    },
  },
};

// 市值分布圖表配置
export const marketCapChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "市值分布",
    },
  },
};

// 影響因素圖表配置
export const factorChartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "影響因素強度",
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
    },
  },
};

// 價格和成交量組合圖表配置
export const combinedChartOptions: ChartOptions<"bar" | "line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
    },
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "價格與成交量",
      font: {
        size: 16,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: {
        display: true,
        text: "成交量 (K)",
      },
      grid: {
        color: "rgba(200, 200, 200, 0.15)",
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      title: {
        display: true,
        text: "價格 (USD)",
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

// 產生價格圖表數據
export const generatePriceChartData = (
  historyData: HistoryData
): ChartData<"line"> => {
  return {
    labels: historyData.labels,
    datasets: [
      {
        label: "比特幣",
        data: historyData.btcPrice,
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "以太幣",
        data: historyData.ethPrice,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
};

// 產生成交量圖表數據
export const generateVolumeChartData = (
  historyData: HistoryData
): ChartData<"line"> => {
  return {
    labels: historyData.labels,
    datasets: [
      {
        label: "24h成交量",
        data: historyData.volume,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
};

// 產生RSI圖表數據
export const generateRsiChartData = (
  historyData: HistoryData
): ChartData<"line"> => {
  return {
    labels: historyData.labels,
    datasets: [
      {
        label: "RSI",
        data: historyData.rsi,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
};

// 產生市值圖表數據
export const generateMarketCapChartData = (
  coins: CoinData[]
): ChartData<"doughnut"> => {
  return {
    labels: coins.map((coin) => coin.name),
    datasets: [
      {
        data: coins.map((coin) => parseFloat(coin.dominance)),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

// 產生影響因素圖表數據
export const generateFactorChartData = (
  factors: FactorData[]
): ChartData<"bar"> => {
  return {
    labels: factors.map((factor) => factor.name),
    datasets: [
      {
        label: "影響強度",
        data: factors.map((factor) => factor.strength),
        backgroundColor: [
          "rgba(75, 192, 192, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
};

// 產生價格和成交量組合圖表數據
export const generateCombinedChartData = (
  historyData: HistoryData,
  coin: string = "BTC"
): ChartData<"bar" | "line"> => {
  // 從historyData中取得需要的數據
  const { labels, btcPrice, volume } = historyData;

  // 計算成交量的顏色 (綠色表示價格上漲，紅色表示下跌)
  const volumeColors: string[] = [];
  for (let i = 1; i < btcPrice.length; i++) {
    volumeColors.push(
      btcPrice[i] >= btcPrice[i - 1]
        ? "rgba(75, 192, 112, 0.8)"
        : "rgba(255, 99, 132, 0.8)"
    );
  }
  // 第一個數據點的顏色
  volumeColors.unshift(
    btcPrice[0] >= btcPrice[1]
      ? "rgba(75, 192, 112, 0.8)"
      : "rgba(255, 99, 132, 0.8)"
  );

  return {
    labels,
    datasets: [
      {
        type: "bar",
        label: "成交量",
        data: volume,
        backgroundColor: volumeColors,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line",
        label: "價格",
        data: coin === "BTC" ? btcPrice : historyData.ethPrice,
        borderColor: "rgb(255, 159, 64)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };
};
