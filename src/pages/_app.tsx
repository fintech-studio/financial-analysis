import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import PageTransition from "../components/Layout/PageTransition";
import Navigation from "../components/Layout/Navigation";
import ScrollToTop from "../components/common/ScrollToTop";
import "../styles/globals.css";
import Head from "next/head";
import React from "react";
import { useAppInitialization } from "@/utils/appInitializer";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  hideNavigation?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// 創建應用程式包裝器組件
function AppWrapper({ Component, pageProps }: AppPropsWithLayout) {
  // 應用程式初始化
  const { isLoading, isInitialized, error, config } = useAppInitialization({
    enableCache: true,
    enableMockData: process.env.NODE_ENV === "development",
    retryAttempts: 3,
    retryDelay: 1000,
  });

  // 檢查頁面是否需要隱藏導航列
  const hideNavigation = Component.hideNavigation || false;

  // 全域載入狀態
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            正在初始化應用程式...
          </h2>
          <p className="text-gray-500 text-sm">
            {config?.environment === "development" ? "開發模式" : "生產模式"}
          </p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  // 全域錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              初始化失敗
            </h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              重新載入頁面
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 使用頁面級別的 getLayout，如果沒有則使用默認佈局
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <>
        <Head>
          <title>FinTech 智慧投資</title>
        </Head>
        {!hideNavigation && <Navigation />}
        <main className={hideNavigation ? "" : "main-content"}>{page}</main>
      </>
    ));

  // 將整個應用包裹在 PageTransition 中
  return (
    <>
      <PageTransition>{getLayout(<Component {...pageProps} />)}</PageTransition>
      {/* 將 ScrollToTop 移到 PageTransition 外面，避免定位問題 */}
      <ScrollToTop />
    </>
  );
}

export default AppWrapper;
