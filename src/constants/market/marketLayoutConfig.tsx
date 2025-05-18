import { ChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export const MARKET_CARDS_CONFIG = [
  {
    id: "stock",
    icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    href: "/market-analysis/stock",
  },
  {
    id: "crypto",
    icon: <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    href: "/market-analysis/crypto",
  },
  // ... 其他市場卡片配置
] as const;

export const PAGE_SECTIONS = {
  marketOverview: {
    title: "市場概況",
    description: "即時掌握全球金融市場動態",
  },
  marketSentiment: {
    title: "市場情緒",
    description: "掌握市場投資氛圍與情緒指標",
  },
  // ... 其他區段配置
} as const;
