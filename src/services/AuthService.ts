export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "analyst";
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private token: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    this.loadAuthFromStorage();
  }

  async login(credentials: LoginCredentials): Promise<{
    user: AuthUser;
    token: AuthToken;
  }> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 簡單的模擬驗證
      if (
        credentials.email === "demo@example.com" &&
        credentials.password === "demo123"
      ) {
        const mockUser: AuthUser = {
          id: "user_001",
          name: "示範用戶",
          email: credentials.email,
          avatar: "https://example.com/avatar.jpg",
          role: "user",
          isVerified: true,
          createdAt: "2024-01-01T00:00:00Z",
          lastLoginAt: new Date().toISOString(),
        };

        const mockToken: AuthToken = {
          accessToken: `mock_token_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
          expiresIn: 3600,
          tokenType: "Bearer",
        };

        this.currentUser = mockUser;
        this.token = mockToken.accessToken;
        this.saveAuthToStorage(mockUser, mockToken.accessToken);

        return { user: mockUser, token: mockToken };
      } else {
        throw new Error("帳號或密碼錯誤");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{
    user: AuthUser;
    token: AuthToken;
  }> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 驗證密碼確認
      if (data.password !== data.confirmPassword) {
        throw new Error("密碼確認不相符");
      }

      // 檢查是否同意條款
      if (!data.agreeToTerms) {
        throw new Error("請同意服務條款");
      }

      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: "user",
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      const mockToken: AuthToken = {
        accessToken: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresIn: 3600,
        tokenType: "Bearer",
      };

      this.currentUser = mockUser;
      this.token = mockToken.accessToken;
      this.saveAuthToStorage(mockUser, mockToken.accessToken);

      return { user: mockUser, token: mockToken };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.currentUser = null;
      this.token = null;
      this.clearAuthFromStorage();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthToken> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockToken: AuthToken = {
        accessToken: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresIn: 3600,
        tokenType: "Bearer",
      };

      this.token = mockToken.accessToken;
      if (this.currentUser) {
        this.saveAuthToStorage(this.currentUser, mockToken.accessToken);
      }

      return mockToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Password reset email sent to: ${data.email}`);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (data.newPassword !== data.confirmPassword) {
        throw new Error("新密碼確認不相符");
      }

      console.log("Password changed successfully");
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  async verifyEmail(): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (this.currentUser) {
        this.currentUser.isVerified = true;
        this.saveAuthToStorage(this.currentUser, this.token!);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  async resendVerificationEmail(): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log("Verification email sent");
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === "admin";
  }

  isAnalyst(): boolean {
    return (
      this.currentUser?.role === "analyst" || this.currentUser?.role === "admin"
    );
  }

  private saveAuthToStorage(user: AuthUser, token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
      }
    } catch (error) {
      console.error("Error saving auth to storage:", error);
    }
  }

  private loadAuthFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("auth_user");
        const storedToken = localStorage.getItem("auth_token");

        if (storedUser && storedToken) {
          this.currentUser = JSON.parse(storedUser);
          this.token = storedToken;
        }
      }
    } catch (error) {
      console.error("Error loading auth from storage:", error);
      this.clearAuthFromStorage();
    }
  }

  private clearAuthFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Error clearing auth from storage:", error);
    }
  }

  // 為請求添加授權標頭
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }
}

export default AuthService;
