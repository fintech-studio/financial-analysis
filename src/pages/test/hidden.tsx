import React from "react";
import Link from "next/link";
import {
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import Footer from "../../components/Layout/Footer";

const HiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題區域 */}
      <section className="relative bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* subtle grid background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    未公開頁面
                  </h1>
                  <p className="text-blue-100 mt-3 text-lg font-medium">
                    尚未完成的未公開內容
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                我們正在努力為您準備更多精彩的內容和功能，敬請期待！
              </p>
            </div>

            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">4</div>
                  <div className="text-blue-200 text-sm font-medium">
                    已隱藏頁面
                  </div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">待公開</div>
                  <div className="text-blue-200 text-sm font-medium">
                    即將推出
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要內容區域 */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="bg-white rounded-2xl shadow p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左側 */}
            <aside className="w-full lg:w-1/3 space-y-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                  開發中的頁面
                </h2>
                <p className="text-gray-600 mt-2">
                  這些頁面目前正在開發中，尚未公開。
                </p>
              </div>
            </aside>

            {/* 右側：卡片預覽區（改良版：整張卡片可點擊、icon 左、內容中、路徑與動作右） */}
            <section className="w-full lg:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Card: Auth */}
                <Link
                  href="/auth"
                  className="group block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <article className="flex items-center gap-4 p-4">
                    <div className="shrink-0 w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <FingerPrintIcon className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        註冊 / 登入
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        使用者註冊與認證流程示範。
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">/auth</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm">
                        前往
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Card: Community */}
                <Link
                  href="/community"
                  className="group block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <article className="flex items-center gap-4 p-4">
                    <div className="shrink-0 w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <DevicePhoneMobileIcon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        社群討論區
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        社群討論與交流平台。
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">/community</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm">
                        前往
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Card: Education */}
                <Link
                  href="/education"
                  className="group block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <article className="flex items-center gap-4 p-4">
                    <div className="shrink-0 w-14 h-14 rounded-lg bg-rose-50 flex items-center justify-center">
                      <DevicePhoneMobileIcon className="w-7 h-7 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        理財知識
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        教育資源與文章展示。
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">/education</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm">
                        前往
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Card: Portfolio */}
                <Link
                  href="/portfolio"
                  className="group block bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <article className="flex items-center gap-4 p-4">
                    <div className="shrink-0 w-14 h-14 rounded-lg bg-violet-50 flex items-center justify-center">
                      <DevicePhoneMobileIcon className="w-7 h-7 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        投資組合
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        投組展示與管理工具。
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">/portfolio</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm">
                        前往
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </article>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HiddenPage;
