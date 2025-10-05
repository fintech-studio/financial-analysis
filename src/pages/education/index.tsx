import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import Footer from "../../components/Layout/Footer";

const EducationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題區域 */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
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
                    <AcademicCapIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    理財知識
                  </h1>
                  <p className="text-blue-100 mt-3 text-lg font-medium">
                    理財知識與教育平台頁面。
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                我們正在努力為您準備更多精彩的內容和功能，敬請期待！
              </p>
            </div>

            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              頁面建構中
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我們正在為您準備更好的投資理財教育功能，
              包含專業課程、學習工具、教學資源等豐富內容。
            </p>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">預計完成時間：即將推出</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EducationPage;
