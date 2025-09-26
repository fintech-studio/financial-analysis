import React, { useEffect } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const NotFoundPage = () => {
  useEffect(() => {
    // Google Analytics 404 事件追蹤（需全站已安裝 gtag）
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_404", {
        page_path: window.location.pathname,
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* 背景裝飾圓圈 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-30 z-0 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-100 rounded-full opacity-20 z-0 animate-pulse" />
      <div className="z-10 flex flex-col items-center">
        <span className="text-[6rem] mb-2 select-none">😕</span>
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">
          萬隆的頁面不見了
        </h1>
        <p className="text-lg text-slate-600 mb-8 text-center max-w-md">
          很抱歉，您要找的頁面不存在，或已被移除。
          <br />
          您可以返回首頁，或聯絡我們協助您找到需要的內容。
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow hover:text-white transition-colors duration-200"
          >
            返回首頁
          </Link>
          <Link
            href="/community/contact"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-700 rounded-full font-semibold shadow hover:bg-blue-50 transition-colors duration-200"
          >
            聯絡我們
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
