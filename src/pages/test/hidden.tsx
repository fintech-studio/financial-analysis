import React from "react";
import Link from "next/link";
import {
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/Layout/PageHeader";
import Footer from "@/components/Layout/Footer";

const HiddenPage: React.FC = () => {
  const Icon = DevicePhoneMobileIcon;
  const Title = "未公開頁面";
  const Subtitle = "尚未完成的未公開內容";
  const Description = "我們正在努力為您準備更多精彩的內容和功能，敬請期待！";
  const panelTitle = "4";
  const panelSubtitle = "已隱藏頁面";
  const panelTitle2 = "TBD";
  const panelSubtitle2 = "即將推出";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={panelTitle}
        panelSubtitle={panelSubtitle}
        panelTitle2={panelTitle2}
        panelSubtitle2={panelSubtitle2}
      />

      <div className="min-h-screen bg-slate-50">
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
                        <span className="text-xs text-gray-400">
                          /community
                        </span>
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
                        <span className="text-xs text-gray-400">
                          /education
                        </span>
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
                        <span className="text-xs text-gray-400">
                          /portfolio
                        </span>
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
      </div>

      <Footer />
    </>
  );
};

export default HiddenPage;
