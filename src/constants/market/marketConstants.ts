export const MARKET_STATUS = {
  POSITIVE: ["貪婪", "擴張", "多頭", "強勢", "正面"],
  NEGATIVE: ["恐慌", "收縮", "空頭", "弱勢", "負面"],
} as const;

export const TREND_INDICATORS = {
  UP: ["上漲", "增加", "+"],
  DOWN: ["下跌", "減少", "-"],
} as const;

export const STRENGTH_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

export const TIME_RANGES = ["1d", "1w", "1m", "3m", "6m"] as const;
