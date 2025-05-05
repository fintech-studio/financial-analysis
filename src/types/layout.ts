import {
  MARKET_CARDS_CONFIG,
  PAGE_SECTIONS,
} from "@/constants/marketLayoutConfig";

export type MarketCardId = (typeof MARKET_CARDS_CONFIG)[number]["id"];

export interface PageSection {
  title: string;
  description: string;
}

export interface MarketCardConfig {
  id: MarketCardId;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  href: string;
}

export interface PageConfig {
  sections: typeof PAGE_SECTIONS;
  marketCards: typeof MARKET_CARDS_CONFIG;
}
