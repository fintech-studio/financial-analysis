export interface User {
  id: string;
  name: string;
  email: string;
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
    }
    return UserModel.instance;
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

  async getUserActivities(userId: string): Promise<UserActivity[]> {
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
