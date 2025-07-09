export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  riskLevel?: string;
  avatar?: string;
  level: string;
  location: string;
  joinDate: string;
  preferences: UserPreferences;
  portfolio: {
    totalValue: number;
    totalReturn: number;
    monthlyReturn: number;
  };
}

export interface UserPreferences {
  theme: "light" | "dark";
  language: "zh-TW" | "en-US";
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newsAlerts: boolean;
  };
  riskTolerance: "conservative" | "moderate" | "aggressive";
}

export interface UserActivity {
  id: string;
  action: string;
  target: string;
  amount?: string;
  time: string;
  type: "buy" | "sell" | "deposit" | "withdraw" | "login";
  bgColor: string;
  color: string;
  icon: string;
}

export class UserModel {
  private static instance: UserModel;
  private users: Map<string, User> = new Map();

  static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel();
      UserModel.instance.initializeDefaultUsers();
    }
    return UserModel.instance;
  }

  private initializeDefaultUsers(): void {
    // 創建預設的模擬用戶
    const defaultUser: User = {
      id: "user_001",
      name: "張小明",
      email: "zhang@example.com",
      phone: "0912-345-678",
      bio: "熱愛投資理財的軟體工程師",
      riskLevel: "中等風險",
      avatar: "https://via.placeholder.com/100",
      level: "進階投資者",
      location: "台北",
      joinDate: "2023年1月加入",
      preferences: {
        theme: "light",
        language: "zh-TW",
        notifications: {
          email: true,
          push: true,
          priceAlerts: true,
          newsAlerts: false,
        },
        riskTolerance: "moderate",
      },
      portfolio: {
        totalValue: 1250000,
        totalReturn: 125000,
        monthlyReturn: 8.5,
      },
    };

    // 添加更多模擬用戶以供測試
    const secondUser: User = {
      id: "user_002",
      name: "李小華",
      email: "li@example.com",
      phone: "0987-654-321",
      bio: "投資新手，正在學習基礎知識",
      riskLevel: "保守型",
      level: "新手投資者",
      location: "台中",
      joinDate: "2024年3月加入",
      preferences: {
        theme: "dark",
        language: "zh-TW",
        notifications: {
          email: true,
          push: false,
          priceAlerts: true,
          newsAlerts: true,
        },
        riskTolerance: "conservative",
      },
      portfolio: {
        totalValue: 350000,
        totalReturn: 15000,
        monthlyReturn: 4.2,
      },
    };

    this.users.set(defaultUser.id, defaultUser);
    this.users.set(secondUser.id, secondUser);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = Date.now().toString();
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return user;
  }

  async getUserActivities(): Promise<UserActivity[]> {
    // 模擬數據，實際應從資料庫獲取
    return [
      {
        id: "1",
        action: "買入",
        target: "台積電",
        amount: "50,000",
        time: "2小時前",
        type: "buy",
        bgColor: "bg-green-50",
        color: "text-green-600",
        icon: "ArrowUpIcon",
      },
    ];
  }
}
