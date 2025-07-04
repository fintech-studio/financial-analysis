// 集中導出所有資料
export * from "./stocks/stockData";
export * from "./news/newsData";

export const dataConfig = {
  baseUrl: "https://api.example.com",
  endpoints: {
    market: "/market",
    stocks: "/stocks",
    news: "/news",
  },
};
