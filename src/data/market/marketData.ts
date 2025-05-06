// 市場基本資訊
export { marketOverview } from "./overview";
export { marketSentiment } from "./sentiment";
export { chartData } from "./charts";

// 股票相關資訊
export {
  hotStocks,
  activeStocks,
  recommendedStocks,
  sectorPerformance,
} from "../stocks/stockData";

// 新聞相關資訊
export { marketNews, latestNews } from "../news/newsData";

// 市場資料更新設定
export const marketDataConfig = {
  updateInterval: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
};
