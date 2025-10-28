/* eslint-disable react/prop-types */
import React, { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// MVC 架構 - 導入控制器和Hooks
import { UserController } from "@/controllers/UserController";
import { useMvcController } from "@/hooks/useMvcController";
import { User } from "@/models/UserModel";

// 類型定義
interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface AuthErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

// 常量
const INITIAL_LOGIN_DATA: LoginForm = {
  email: "",
  password: "",
  remember: false,
};

const INITIAL_REGISTER_DATA: RegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

const FEATURES = [
  {
    icon: ArrowTrendingUpIcon,
    title: "AI 智能分析",
    desc: "深度市場洞察",
  },
  {
    icon: ShieldCheckIcon,
    title: "安全可靠",
    desc: "銀行級安全保護",
  },
  {
    icon: SparklesIcon,
    title: "個人化建議",
    desc: "量身定制投資策略",
  },
] as const;

// 驗證工具函數
const validateEmail = (email: string): string | undefined => {
  if (!email) return "請輸入電子郵件";
  if (!/\S+@\S+\.\S+/.test(email)) return "請輸入有效的電子郵件格式";
  return undefined;
};

const validatePassword = (
  password: string,
  isRegister = false
): string | undefined => {
  if (!password) return "請輸入密碼";
  if (isRegister) {
    if (password.length < 8) return "密碼長度至少需要8個字元";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "密碼必須包含大小寫字母和數字";
    }
  } else {
    if (password.length < 6) return "密碼長度至少需要6個字元";
  }
  return undefined;
};

// 子組件：輸入欄位
const InputField = React.memo<{
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
}>(
  ({
    label,
    name,
    type,
    value,
    onChange,
    placeholder,
    icon: Icon,
    error,
    showPassword,
    onTogglePassword,
    autoComplete,
  }) => {
    const isPasswordField =
      type === "password" || (type === "text" && onTogglePassword);

    return (
      <div>
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          )}
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            className={`w-full ${Icon ? "pl-11" : "px-4"} ${
              isPasswordField ? "pr-12" : "pr-4"
            } py-3.5 border-2 ${
              error
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-blue-500"
            } rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500`}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          {isPasswordField && onTogglePassword && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onTogglePassword}
              aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${name}-error`}
            className="mt-2 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <span className="mr-1" aria-hidden="true">
              ⚠️
            </span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

// 子組件：載入按鈕
const LoadingButton = React.memo<{
  isLoading: boolean;
  type: "submit";
  children: React.ReactNode;
  loadingText: string;
  className?: string;
}>(({ isLoading, type, children, loadingText, className = "" }) => (
  <button
    type={type}
    disabled={isLoading}
    className={`w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:transform-none flex items-center justify-center space-x-2 ${className}`}
    aria-label={isLoading ? loadingText : undefined}
  >
    {isLoading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
));

LoadingButton.displayName = "LoadingButton";

// 子組件：成功訊息
const SuccessMessage = React.memo<{
  email: string;
  onClose: () => void;
  onGoToLogin: () => void;
}>(({ email, onClose, onGoToLogin }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">註冊成功！</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="關閉"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  驗證郵件已發送
                </p>
                <p className="text-sm text-green-700 mt-1">
                  我們已將驗證郵件發送至{" "}
                  <span className="font-medium">{email}</span>
                  ，請檢查您的收件箱。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <ArrowRightIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">下一步</p>
                <p className="text-sm text-blue-700 mt-1">
                  請查看您的電子郵件並點擊驗證鏈接啟動帳戶
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onGoToLogin}
            className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            前往登入
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  </div>
));

SuccessMessage.displayName = "SuccessMessage";

// 主組件
const AuthPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loginData, setLoginData] = useState<LoginForm>(INITIAL_LOGIN_DATA);
  const [registerData, setRegisterData] = useState<RegisterForm>(
    INITIAL_REGISTER_DATA
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});

  // MVC 架構 - 使用控制器和Hook
  const userController = UserController.getInstance();

  const {
    loading: isLoading,
    error: controllerError,
    execute: executeUserAction,
  } = useMvcController<{ user: User; token: string }>();

  // 載入記住的郵箱
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setLoginData((prev) => ({
        ...prev,
        email: rememberedEmail,
        remember: true,
      }));
    }
  }, []);

  // 監聽控制器錯誤
  useEffect(() => {
    if (controllerError) {
      setErrors({ email: controllerError || "發生錯誤" });
    }
  }, [controllerError]);

  // 記憶化的處理函數
  const handleLoginChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setLoginData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (errors[name as keyof AuthErrors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleRegisterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setRegisterData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (errors[name as keyof AuthErrors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  // 驗證函數
  const validateLogin = useCallback((): boolean => {
    const newErrors: AuthErrors = {};

    const emailError = validateEmail(loginData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(loginData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loginData]);

  const validateRegister = useCallback((): boolean => {
    const newErrors: AuthErrors = {};

    if (!registerData.firstName.trim()) {
      newErrors.firstName = "請輸入名字";
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = "請輸入姓氏";
    }

    const emailError = validateEmail(registerData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(registerData.password, true);
    if (passwordError) newErrors.password = passwordError;

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "請確認密碼";
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "密碼確認不一致";
    }

    if (!registerData.agreeToTerms) {
      newErrors.agreeToTerms = "請同意服務條款";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [registerData]);

  // 表單提交處理 - 使用MVC架構
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateLogin()) return;

      try {
        await executeUserAction(async () => {
          const authResult = await userController.login({
            email: loginData.email,
            password: loginData.password,
          });

          console.log("登入成功:", authResult);

          // 處理記住我功能
          if (loginData.remember) {
            localStorage.setItem("rememberedEmail", loginData.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          // 登入成功後導向上一頁或首頁
          router.back();

          return authResult;
        });
      } catch (error: unknown) {
        console.error("登入失敗:", error);
        setErrors({ email: "電子郵件或密碼錯誤" });
      }
    },
    [loginData, validateLogin, executeUserAction, userController, router]
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateRegister()) return;

      try {
        await executeUserAction(async () => {
          const authResult = await userController.register({
            name: `${registerData.firstName} ${registerData.lastName}`,
            email: registerData.email,
            password: registerData.password,
            location: "台灣",
            firstName: registerData.firstName,
            lastName: registerData.lastName,
          });

          console.log("註冊成功:", authResult);

          // 保存註冊的 email 並顯示成功訊息
          setRegisteredEmail(registerData.email);
          setRegisterData(INITIAL_REGISTER_DATA);
          setShowSuccessMessage(true);

          return authResult;
        });
      } catch (error: unknown) {
        console.error("註冊失敗:", error);
        setErrors({ email: "註冊失敗，該電子郵件可能已被使用" });
      }
    },
    [registerData, validateRegister, executeUserAction, userController]
  );

  // 成功訊息處理
  const handleSuccessClose = useCallback(() => {
    setShowSuccessMessage(false);
    setRegisteredEmail("");
  }, []);

  const handleGoToLogin = useCallback(() => {
    setShowSuccessMessage(false);
    setActiveTab("login");
    setLoginData((prev) => ({
      ...prev,
      email: registeredEmail,
    }));
    setRegisteredEmail("");
  }, [registeredEmail]);

  // 標籤切換
  const handleTabChange = useCallback((tab: "login" | "register") => {
    setActiveTab(tab);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowSuccessMessage(false);
  }, []);

  // 記憶化的內容
  const brandContent = useMemo(
    () => ({
      title: activeTab === "login" ? "歡迎回來" : "開啟您的",
      subtitle: activeTab === "login" ? "智慧投資之旅" : "投資新篇章",
      description:
        activeTab === "login"
          ? "運用 AI 分析，為您提供專業的投資決策支援"
          : "加入千萬投資者的選擇，享受AI個人化投資建議",
    }),
    [activeTab]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* 成功訊息 Modal */}
      {showSuccessMessage && (
        <SuccessMessage
          email={registeredEmail} // 使用保存的 email 而不是 registerData.email
          onClose={handleSuccessClose}
          onGoToLogin={handleGoToLogin}
        />
      )}

      {/* 動態背景裝飾 */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* 返回首頁按鈕 */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-40 flex items-center space-x-2 px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 text-white shadow-lg hover:shadow-xl"
        aria-label="返回首頁"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:block">返回首頁</span>
      </button>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* 左側 - 品牌展示區 */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-4 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <ArrowTrendingUpIcon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <SparklesIcon className="h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">FinTech</h2>
                  <p className="text-blue-300 text-sm">智慧投資平台</p>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight text-white">
                  {brandContent.title}
                  <br />
                  <span className="bg-linear-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    {brandContent.subtitle}
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-md">
                  {brandContent.description}
                </p>
              </div>
            </div>

            {/* 特色功能 */}
            <div className="space-y-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="p-2 bg-white/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{feature.title}</p>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右側 - 認證表單 */}
          <div className="flex flex-col justify-center">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* 移動端品牌 */}
              <div className="lg:hidden bg-linear-to-r from-blue-600 to-purple-600 p-6 text-center">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                  <span className="text-2xl font-bold text-white">FinTech</span>
                </div>
                <p className="text-blue-100 text-sm">智慧投資，從這裡開始</p>
              </div>

              <div className="p-8">
                {/* 標籤切換 */}
                <div
                  className="relative bg-gray-50 rounded-2xl p-1.5 mb-8"
                  role="tablist"
                >
                  <div
                    className={`absolute top-1.5 h-[calc(100%-12px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${
                      activeTab === "login"
                        ? "left-1.5 right-1/2 mr-0.75"
                        : "right-1.5 left-1/2 ml-0.75"
                    }`}
                  />
                  <div className="relative grid grid-cols-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "login"}
                      className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === "login"
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => handleTabChange("login")}
                    >
                      登入帳戶
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "register"}
                      className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === "register"
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => handleTabChange("register")}
                    >
                      建立帳戶
                    </button>
                  </div>
                </div>

                {/* 表單內容 */}
                <div className="space-y-6">
                  {activeTab === "login" ? (
                    /* 登入表單 */
                    <form
                      className="space-y-5"
                      onSubmit={handleLogin}
                      noValidate
                    >
                      <InputField
                        label="電子郵件"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="輸入您的電子郵件"
                        icon={UserCircleIcon}
                        error={errors.email}
                        autoComplete="email"
                      />

                      <InputField
                        label="密碼"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="輸入您的密碼"
                        icon={LockClosedIcon}
                        error={errors.password}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        autoComplete="current-password"
                      />

                      {/* 記住我和忘記密碼 */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            name="remember"
                            type="checkbox"
                            checked={loginData.remember}
                            onChange={handleLoginChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            記住我
                          </span>
                        </label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          忘記密碼？
                        </Link>
                      </div>

                      <LoadingButton
                        isLoading={isLoading}
                        type="submit"
                        loadingText="登入中..."
                      >
                        <span>登入帳戶</span>
                        <ArrowRightIcon className="h-5 w-5" />
                      </LoadingButton>

                      {/* 測試帳號 */}
                      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center space-x-2 mb-3">
                          <UserCircleIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-800">
                            測試帳號
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="text-blue-700">
                            <span className="font-medium">帳號:</span>{" "}
                            admin@fintech.com
                          </div>
                          <div className="text-blue-700">
                            <span className="font-medium">密碼:</span>{" "}
                            password123
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* 註冊表單 */
                    <form
                      className="space-y-5"
                      onSubmit={handleRegister}
                      noValidate
                    >
                      {/* 姓名 */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="姓氏"
                          name="lastName"
                          type="text"
                          value={registerData.lastName}
                          onChange={handleRegisterChange}
                          placeholder="王"
                          error={errors.lastName}
                          autoComplete="family-name"
                        />
                        <InputField
                          label="名字"
                          name="firstName"
                          type="text"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          placeholder="小明"
                          error={errors.firstName}
                          autoComplete="given-name"
                        />
                      </div>

                      <InputField
                        label="電子郵件"
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="example@email.com"
                        icon={EnvelopeIcon}
                        error={errors.email}
                        autoComplete="email"
                      />

                      <InputField
                        label="密碼"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="至少8位，包含大小寫字母和數字"
                        icon={LockClosedIcon}
                        error={errors.password}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        autoComplete="new-password"
                      />

                      <InputField
                        label="確認密碼"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="請再次輸入密碼"
                        icon={LockClosedIcon}
                        error={errors.confirmPassword}
                        showPassword={showConfirmPassword}
                        onTogglePassword={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        autoComplete="new-password"
                      />

                      {/* 同意條款 */}
                      <div>
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            name="agreeToTerms"
                            type="checkbox"
                            checked={registerData.agreeToTerms}
                            onChange={handleRegisterChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                            aria-describedby={
                              errors.agreeToTerms ? "terms-error" : undefined
                            }
                          />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            我同意{" "}
                            <Link
                              href="/terms"
                              className="text-blue-600 hover:text-blue-700 font-medium underline"
                            >
                              服務條款
                            </Link>{" "}
                            和{" "}
                            <Link
                              href="/privacy"
                              className="text-blue-600 hover:text-blue-700 font-medium underline"
                            >
                              隱私政策
                            </Link>
                          </span>
                        </label>
                        {errors.agreeToTerms && (
                          <p
                            id="terms-error"
                            className="mt-2 text-sm text-red-600 flex items-center"
                            role="alert"
                          >
                            <span className="mr-1" aria-hidden="true">
                              ⚠️
                            </span>
                            {errors.agreeToTerms}
                          </p>
                        )}
                      </div>

                      <LoadingButton
                        isLoading={isLoading}
                        type="submit"
                        loadingText="建立中..."
                      >
                        <span>建立帳戶</span>
                        <ArrowRightIcon className="h-5 w-5" />
                      </LoadingButton>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 設定隱藏導航列
AuthPage.hideNavigation = true;

export default AuthPage;
