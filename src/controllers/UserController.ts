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
}

export interface UserUpdateRequest {
  name?: string;
  preferences?: UserPreferences;
}

export class UserController {
  private userModel: UserModel;

  constructor() {
    this.userModel = UserModel.getInstance();
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
}
