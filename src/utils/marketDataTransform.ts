interface MarketData {
  [key: string]: {
    value?: string;
    price?: string;
    changePercent?: string;
  };
}

export const transformMarketData = (data: MarketData) => {
  const marketTypes = ["stock", "sentiment"];

  return marketTypes.reduce((acc: { [key: string]: any }, type) => {
    if (data[type]) {
      acc[type] = {
        ...data[type],
        formattedValue: data[type].value || data[type].price || "0",
        trend: data[type].changePercent?.startsWith("+") ? "up" : "down",
      };
    }
    return acc;
  }, {});
};
