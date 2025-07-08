import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  BoltIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// MVC 架構引入
import { UserController } from "../../controllers/UserController";
import { useMvcController } from "../../hooks/useMvcController";

// 類型定義
interface ForgotPasswordForm {
  email: string;
}

interface ForgotPasswordErrors {
  email?: string;
  general?: string;
}

// 驗證工具函數
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "請輸入電子郵件";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "請輸入有效的電子郵件格式";
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
  autoComplete?: string;
  required?: boolean;
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
    autoComplete,
    required = false,
  }) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative group">
          {Icon && (
            <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2 z-10 transition-colors" />
          )}
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            required={required}
            className={`w-full ${
              Icon ? "pl-11" : "px-4"
            } pr-4 py-4 border-2 rounded-2xl transition-all duration-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              error
                ? "border-red-300 bg-red-50/50 focus:border-red-500"
                : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-gray-300"
            }`}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        </div>
        {error && (
          <p
            id={`${name}-error`}
            className="text-sm text-red-600 flex items-center mt-2"
            role="alert"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
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
  disabled?: boolean;
  className?: string;
}>(
  ({
    isLoading,
    type,
    children,
    loadingText,
    disabled = false,
    className = "",
  }) => (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg ${className}`}
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
  )
);

LoadingButton.displayName = "LoadingButton";

// 子組件：錯誤提示
const ErrorAlert = React.memo<{ message: string; onDismiss?: () => void }>(
  ({ message, onDismiss }) => (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">發送失敗</p>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors rounded-lg p-1 hover:bg-red-100"
            aria-label="關閉錯誤訊息"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
);

ErrorAlert.displayName = "ErrorAlert";

// 子組件：成功訊息
const SuccessMessage = React.memo<{
  email: string;
  onClose: () => void;
  onBackToLogin: () => void;
  onResend: () => void;
}>(({ email, onClose, onBackToLogin, onResend }) => (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 animate-in fade-in zoom-in duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8">
        {/* 成功圖標 */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* 標題 */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            郵件已發送！
          </h3>
          <p className="text-gray-600">重設密碼的說明已發送至您的信箱</p>
        </div>

        {/* 信息卡片 */}
        <div className="space-y-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  郵件發送成功
                </p>
                <p className="text-sm text-green-700">
                  重設連結已發送至{" "}
                  <span className="font-medium break-all">{email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClockIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  時效提醒
                </p>
                <p className="text-sm text-amber-700">
                  重設連結將在 15 分鐘後失效，請儘快完成密碼重設
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  安全提醒
                </p>
                <p className="text-sm text-blue-700">
                  如果您沒有申請重設密碼，請忽略此郵件
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBackToLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              返回登入
            </button>
            <button
              onClick={onResend}
              className="border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
            >
              重新發送
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            稍後再說
          </button>
        </div>
      </div>
    </div>
  </div>
));

SuccessMessage.displayName = "SuccessMessage";

// 主組件
const ForgotPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordForm>({ email: "" });
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // MVC 架构 - 使用控制器和Hook
  const userController = UserController.getInstance();

  const {
    loading: isLoading,
    error: controllerError,
    execute: executeResetPassword,
  } = useMvcController<{ message: string }>();

  // 監聽控制器錯誤
  useEffect(() => {
    if (controllerError) {
      setErrors({ general: controllerError || "發生錯誤" });
    }
  }, [controllerError]);

  // 表單變更處理
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value.trim(),
      }));

      // 清除錯誤訊息
      if (errors[name as keyof ForgotPasswordErrors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
          general: undefined,
        }));
      }
    },
    [errors]
  );

  // 驗證函數
  const validateForm = useCallback((): boolean => {
    const newErrors: ForgotPasswordErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 發送重設郵件 - 使用MVC架構
  const sendResetEmail = useCallback(async () => {
    if (attemptCount >= 3) {
      setErrors({ general: "發送次數過多，請稍後再試" });
      return false;
    }

    try {
      await executeResetPassword(async () => {
        const result = await userController.requestPasswordReset(
          formData.email
        );
        console.log("密碼重設郵件發送成功:", result);
        setAttemptCount((prev) => prev + 1);
        return result;
      });
      return true;
    } catch (error: any) {
      console.error("發送密碼重設郵件失敗:", error);
      const message = error?.message || "發送失敗，請稍後再試";
      setErrors({ general: message });
      return false;
    }
  }, [attemptCount, formData.email, executeResetPassword, userController]);

  // 表單提交處理
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      const success = await sendResetEmail();
      if (success) {
        setShowSuccessMessage(true);
      }
    },
    [validateForm, sendResetEmail]
  );

  // 重新發送郵件
  const handleResend = useCallback(async () => {
    setShowSuccessMessage(false);
    const success = await sendResetEmail();
    if (success) {
      setShowSuccessMessage(true);
    }
  }, [sendResetEmail]);

  // 成功訊息處理
  const handleSuccessClose = useCallback(() => {
    setShowSuccessMessage(false);
  }, []);

  const handleBackToLogin = useCallback(() => {
    setShowSuccessMessage(false);
    router.push("/auth");
  }, [router]);

  // 清除錯誤訊息
  const handleDismissError = useCallback(() => {
    setErrors((prev) => ({ ...prev, general: undefined }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden">
      {/* 成功訊息 Modal */}
      {showSuccessMessage && (
        <SuccessMessage
          email={formData.email}
          onClose={handleSuccessClose}
          onBackToLogin={handleBackToLogin}
          onResend={handleResend}
        />
      )}

      {/* 動態背景裝飾 */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* 返回登入按鈕 */}
      <button
        onClick={() => router.push("/auth")}
        className="fixed top-6 left-6 z-40 flex items-center space-x-2 px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 text-white shadow-lg hover:shadow-xl"
        aria-label="返回登入"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:block">返回登入</span>
      </button>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden relative">
            {/* 頁面標題區域 */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-purple-600/90"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                  <KeyIcon className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">重設密碼</h1>
                <p className="text-blue-100 text-sm leading-relaxed">
                  輸入您的電子郵件，我們將發送重設連結
                </p>
              </div>
            </div>

            <div className="p-8">
              {/* 錯誤提示 */}
              {errors.general && (
                <ErrorAlert
                  message={errors.general}
                  onDismiss={handleDismissError}
                />
              )}

              {/* 表單 */}
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <InputField
                  label="電子郵件地址"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="輸入您的電子郵件"
                  icon={EnvelopeIcon}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                <LoadingButton
                  isLoading={isLoading}
                  type="submit"
                  loadingText="發送中..."
                  disabled={attemptCount >= 3}
                >
                  <BoltIcon className="h-5 w-5" />
                  <span>發送重設連結</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </LoadingButton>

                {/* 嘗試次數提示 */}
                {attemptCount > 0 && attemptCount < 3 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-700 text-center">
                      已發送 {attemptCount} 次，剩餘 {3 - attemptCount} 次機會
                    </p>
                  </div>
                )}
              </form>

              {/* 幫助資訊 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-2 text-gray-600" />
                    收不到郵件？
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span>檢查垃圾郵件或促銷資料夾</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span>確認電子郵件地址正確無誤</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span>
                        需要協助？聯絡{" "}
                        <Link
                          href="mailto:support@fintech.com"
                          className="text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          support@fintech.com
                        </Link>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(15px) rotate(-1deg);
          }
          66% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(0.5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// 設定隱藏導航列
ForgotPasswordPage.hideNavigation = true;

export default ForgotPasswordPage;
