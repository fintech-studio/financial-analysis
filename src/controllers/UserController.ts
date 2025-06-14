import {
  UserModel,
  User,
  UserActivity,
  UserPreferences,
} from "../models/UserModel";

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  location: string;
  firstName?: string;
  lastName?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  riskLevel?: string;
  preferences?: UserPreferences;
}

export class UserController {
  private static instance: UserController;
  private userModel: UserModel;

  private constructor() {
    this.userModel = UserModel.getInstance();
  }

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  async login(
    request: UserLoginRequest
  ): Promise<{ user: User; token: string }> {
    try {
      // 模擬登入驗證
      const mockUser: User = {
        id: "user_001",
        name: "張小明",
        email: request.email,
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

      // 模擬 JWT token
      const token = `jwt_token_${Date.now()}`;

      return { user: mockUser, token };
    } catch (error) {
      throw new Error("登入失敗：用戶名或密碼錯誤");
    }
  }

  async register(
    request: UserRegisterRequest
  ): Promise<{ user: User; token: string }> {
    try {
      const newUser = await this.userModel.createUser({
        name: request.name,
        email: request.email,
        level: "新手投資者",
        location: request.location,
        joinDate: new Date().toLocaleDateString("zh-TW"),
        preferences: {
          theme: "light",
          language: "zh-TW",
          notifications: {
            email: true,
            push: true,
            priceAlerts: true,
            newsAlerts: true,
          },
          riskTolerance: "conservative",
        },
        portfolio: {
          totalValue: 0,
          totalReturn: 0,
          monthlyReturn: 0,
        },
      });

      const token = `jwt_token_${Date.now()}`;
      return { user: newUser, token };
    } catch (error) {
      throw new Error("註冊失敗：請檢查輸入資料");
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new Error("用戶不存在");
    }
    return user;
  }

  async updateUserProfile(
    userId: string,
    updates: UserUpdateRequest
  ): Promise<User> {
    try {
      return await this.userModel.updateUser(userId, updates);
    } catch (error) {
      throw new Error("更新用戶資料失敗");
    }
  }

  async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      return await this.userModel.getUserActivities(userId);
    } catch (error) {
      throw new Error("獲取用戶活動記錄失敗");
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<User> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new Error("用戶不存在");
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    };

    return await this.userModel.updateUser(userId, {
      preferences: updatedPreferences,
    });
  }

  async logout(userId: string): Promise<boolean> {
    // 模擬登出邏輯（清除 session、token 等）
    return true;
  }

  async getInvestmentStats(userId: string): Promise<any> {
    try {
      // 模擬投資統計數據
      const mockStats = {
        totalValue: 1250000,
        totalReturn: 125000,
        returnRate: 12.5,
        portfolioCount: 3,
        watchlistCount: 15,
        articlesRead: 42,
        coursesCompleted: 8,
        monthlyReturn: 8.5,
        bestStock: "台積電",
        winRate: 68.5,
      };

      return mockStats;
    } catch (error) {
      throw new Error("獲取投資統計失敗");
    }
  }

  async getAchievements(userId: string): Promise<any[]> {
    try {
      // 模擬成就數據
      const mockAchievements = [
        {
          id: 1,
          name: "首次投資",
          description: "完成第一筆投資交易",
          icon: "🚀",
          unlocked: true,
          color: "text-blue-600",
        },
        {
          id: 2,
          name: "學習達人",
          description: "完成10堂投資課程",
          icon: "📚",
          unlocked: true,
          color: "text-green-600",
        },
        {
          id: 3,
          name: "風險管理師",
          description: "建立多元化投資組合",
          icon: "🛡️",
          unlocked: false,
          color: "text-purple-600",
        },
      ];

      return mockAchievements;
    } catch (error) {
      throw new Error("獲取成就失敗");
    }
  }

  async getRecentActivities(userId: string): Promise<any[]> {
    try {
      // 模擬最近活動數據
      const mockActivities = [
        {
          id: 1,
          type: "investment",
          action: "買入",
          target: "台積電",
          amount: "50,000",
          time: "2小時前",
          icon: "📈",
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          id: 2,
          type: "analysis",
          action: "分析",
          target: "半導體產業",
          time: "4小時前",
          icon: "🔍",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          id: 3,
          type: "learning",
          action: "完成課程",
          target: "技術分析基礎",
          time: "1天前",
          icon: "🎓",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
      ];

      return mockActivities;
    } catch (error) {
      throw new Error("獲取活動記錄失敗");
    }
  }

  async updateNotificationSettings(
    userId: string,
    settings: any
  ): Promise<void> {
    try {
      // 模擬更新通知設定
      console.log(
        `Updated notification settings for user ${userId}:`,
        settings
      );
    } catch (error) {
      throw new Error("更新通知設定失敗");
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      // 模擬密碼重設請求
      console.log(`Password reset requested for email: ${email}`);

      // 這裡可以添加實際的郵件發送邏輯
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模擬延遲

      return {
        message: `密碼重設郵件已發送至 ${email}`,
      };
    } catch (error) {
      throw new Error("發送密碼重設郵件失敗");
    }
  }
}
