import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Footer from "@/components/Layout/Footer";

// MVC 架構引入
import { MarketController } from "../../controllers/MarketController";
import { UserController } from "../../controllers/UserController";
import { useMvcController, useDataLoader } from "../../hooks/useMvcController";
import { MarketOverview, MarketSentiment } from "../../types/market";
import { User } from "../../models/UserModel";

// 引入元件
import Header from "@/components/features/CryptoPage/Header";
import Overview from "@/components/features/CryptoPage/Overview";
import CoinAnalysis from "@/components/features/CryptoPage/CoinAnalysis";
import FactorsAnalysis from "@/components/features/CryptoPage/FactorsAnalysis";
import MarketForecast from "@/components/features/CryptoPage/MarketForecast";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Indicator {
  name: string;
  value: string;
  change: string;
  trend: string;
  description: string;
}

interface TechnicalIndicator {
  name: string;
  value: string;
  signal: string;
  description: string;
}

interface Coin {
  name: string;
  symbol: string;
  price: string;
  change: string;
  volume: string;
  volumeChange: string;
  strength: string;
  description: string;
  marketCap: string;
  dominance: string;
}

interface Factor {
  name: string;
  impact: string;
  strength: number;
  description: string;
  details: string[];
}

interface Forecast {
  period: string;
  outlook: string;
  confidence: number;
  keyFactors: string[];
}

interface MarketData {
  overview: {
    market: {
      overall: string;
      price: string;
      change: string;
      description: string;
    };
    indicators: Indicator[];
    technical: TechnicalIndicator[];
  };
  coins: Coin[];
  factors: Factor[];
  forecast: Forecast[];
  history: {
    labels: string[];
    btcPrice: number[];
    ethPrice: number[];
    volume: number[];
    rsi: number[];
    intraday: {
      labels: string[];
      btcPrice: number[];
      volume: number[];
      priceChange: number[];
    };
  };
}

const CryptoMarket: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStrength, setFilterStrength] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // MVC 架構 - 控制器和狀態管理
  const marketController = MarketController.getInstance();
  const userController = UserController.getInstance();

  const {
    data: user,
    loading: userLoading,
    error: userError,
    execute: executeUser,
  } = useMvcController<User>();

  const {
    data: marketOverview,
    loading: marketLoading,
    error: marketError,
  } = useDataLoader(
    () => marketController.getCryptoMarketOverview(),
    {
      overview: {
        market: {
          overall: "載入中...",
          price: "0",
          change: "0%",
          description: "載入市場數據中...",
        },
        indicators: [],
        technical: [],
      },
      coins: [],
      factors: [],
      forecast: [],
      history: {
        labels: [],
        btcPrice: [],
        ethPrice: [],
        volume: [],
        rsi: [],
        intraday: {
          labels: [],
          btcPrice: [],
          volume: [],
          priceChange: [],
        },
      },
    } as MarketData,
    {
      onSuccess: (data) => {
        console.log("加密貨幣市場數據載入成功:", data);
        setLastUpdated(new Date());
      },
      onError: (error) => {
        console.error("載入加密貨幣市場數據失敗:", error);
      },
    }
  );

  const {
    data: cryptoPrices,
    loading: pricesLoading,
    execute: executePricesRefresh,
  } = useMvcController<any>();

  // 載入用戶數據
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userId = "user_001"; // 模擬用戶ID
    try {
      await executeUser(() => userController.getUserProfile(userId));
    } catch (error: any) {
      console.error("載入用戶數據失敗:", error);
    }
  };

  // 刷新市場數據
  const handleRefresh = async (): Promise<void> => {
    try {
      setLastUpdated(new Date());

      // 刷新加密貨幣價格
      await executePricesRefresh(() => marketController.refreshCryptoPrices());

      // 重新載入市場概覽
      await marketController.refreshMarketData();
    } catch (error: any) {
      console.error("刷新數據失敗:", error);
    }
  };

  // 模擬數據 (在沒有實際數據時使用)
  const fallbackMarketData: MarketData = {
    overview: {
      market: {
        overall: "盤整",
        price: "45,250",
        change: "-2.5%",
        description: "加密貨幣市場維持盤整，成交量略減",
      },
      indicators: [
        {
          name: "24h成交量",
          value: "85.2B",
          change: "-5.2B",
          trend: "down",
          description: "成交量較昨日減少",
        },
        {
          name: "市值",
          value: "1.2T",
          change: "-0.05T",
          trend: "down",
          description: "市值小幅下跌",
        },
        {
          name: "恐懼指數",
          value: "45",
          change: "-5",
          trend: "down",
          description: "市場恐懼情緒增加",
        },
      ],
      technical: [
        {
          name: "RSI(14)",
          value: "45",
          signal: "中性",
          description: "相對強弱指標顯示中性",
        },
        {
          name: "MACD",
          value: "-125",
          signal: "空頭",
          description: "MACD維持空頭趨勢",
        },
        {
          name: "布林通道",
          value: "中軌",
          signal: "中性",
          description: "價格位於中軌，顯示盤整",
        },
      ],
    },
    coins: [
      {
        name: "比特幣",
        symbol: "BTC",
        price: "45,250",
        change: "-2.5%",
        volume: "35.2B",
        volumeChange: "-2.1B",
        strength: "弱勢",
        description: "比特幣維持盤整",
        marketCap: "850B",
        dominance: "45%",
      },
      {
        name: "以太幣",
        symbol: "ETH",
        price: "2,350",
        change: "-1.8%",
        volume: "15.8B",
        volumeChange: "-1.2B",
        strength: "弱勢",
        description: "以太幣跟隨大盤走勢",
        marketCap: "280B",
        dominance: "25%",
      },
      {
        name: "幣安幣",
        symbol: "BNB",
        price: "320",
        change: "-1.2%",
        volume: "1.2B",
        volumeChange: "-0.2B",
        strength: "中性",
        description: "幣安幣表現相對穩定",
        marketCap: "45B",
        dominance: "5%",
      },
      {
        name: "索拉納",
        symbol: "SOL",
        price: "95",
        change: "+2.5%",
        volume: "2.8B",
        volumeChange: "+0.5B",
        strength: "強勢",
        description: "索拉納逆勢上漲",
        marketCap: "35B",
        dominance: "3%",
      },
    ],
    factors: [
      {
        name: "宏觀經濟",
        impact: "負面",
        strength: 75,
        description: "經濟數據影響市場信心",
        details: ["通膨數據高於預期", "就業市場強勁", "利率維持高檔"],
      },
      {
        name: "監管環境",
        impact: "負面",
        strength: 65,
        description: "監管壓力持續",
        details: ["SEC審批延遲", "全球監管趨嚴", "合規要求增加"],
      },
      {
        name: "市場情緒",
        impact: "負面",
        strength: 60,
        description: "市場情緒偏向謹慎",
        details: ["恐懼指數上升", "槓桿率下降", "資金流入減少"],
      },
    ],
    forecast: [
      {
        period: "短期",
        outlook: "偏空",
        confidence: 70,
        keyFactors: ["宏觀經濟數據", "監管消息", "市場情緒"],
      },
      {
        period: "中期",
        outlook: "中性",
        confidence: 65,
        keyFactors: ["技術發展進度", "機構採用情況", "市場結構變化"],
      },
      {
        period: "長期",
        outlook: "偏多",
        confidence: 75,
        keyFactors: ["基礎設施完善", "應用場景擴展", "監管框架明確"],
      },
    ],
    history: {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      btcPrice: [42000, 43000, 44000, 45000, 46000, 45250],
      ethPrice: [2200, 2250, 2300, 2350, 2400, 2350],
      volume: [90, 88, 86, 85, 87, 85.2],
      rsi: [45, 48, 46, 47, 45, 45],
      intraday: {
        labels: [
          "1:00",
          "2:00",
          "3:00",
          "4:00",
          "5:00",
          "6:00",
          "7:00",
          "8:00",
          "9:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
          "20:00",
          "21:00",
          "22:00",
          "23:00",
          "0:00",
        ],
        btcPrice: [
          45100, 45250, 45400, 45150, 45300, 45275, 45325, 45400, 45200, 45150,
          45050, 45000, 45350, 45550, 45650, 45700, 45600, 45500, 45350, 45400,
          45600, 45750, 45800, 45850,
        ],
        volume: [
          580, 600, 620, 720, 610, 600, 430, 630, 550, 270, 265, 720, 560, 540,
          510, 300, 360, 490, 350, 450, 520, 630, 470, 320,
        ],
        priceChange: [
          1, 1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, 1, 1, -1, -1, -1, 1, 1,
          1, 1, 1, 1,
        ],
      },
    },
  };

  // 使用從控制器獲取的數據，如果沒有則使用模擬數據
  const marketData = marketOverview || fallbackMarketData;

  // 按強度過濾幣種
  const filteredCoins: Coin[] = marketData.coins
    .filter((coin: Coin) => {
      if (filterStrength === "all") return true;
      return coin.strength === filterStrength;
    })
    .filter((coin: Coin) => {
      if (!searchQuery) return true;
      return (
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  // 載入狀態
  if (marketLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入加密貨幣市場數據中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (marketError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{String(marketError)}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        marketData={marketData}
      />

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && <Overview marketData={marketData} />}

        {activeTab === "coins" && (
          <CoinAnalysis
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStrength={filterStrength}
            setFilterStrength={setFilterStrength}
            filteredCoins={filteredCoins}
          />
        )}

        {activeTab === "factors" && <FactorsAnalysis marketData={marketData} />}

        {activeTab === "forecast" && <MarketForecast marketData={marketData} />}
      </div>
      <Footer />
    </div>
  );
};

export default CryptoMarket;
