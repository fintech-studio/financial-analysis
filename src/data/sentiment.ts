import { MarketSentiment } from "@/types/market";

export const marketSentiment: MarketSentiment = {
  vix: {
    value: "14.21",
    change: "-5.2%",
    status: "低波動",
    description: "市場波動性維持在低檔，投資人信心穩定",
  },
  fearGreed: {
    value: "72",
    change: "+5",
    status: "貪婪",
    description: "市場情緒偏向樂觀，風險偏好提升",
  },
  marketBreadth: {
    value: "65%",
    change: "+2.3%",
    status: "擴張",
    description: "市場廣度持續改善，上漲家數增加",
  },
};
