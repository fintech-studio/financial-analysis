import React from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import PageHeader from "@/components/Layout/PageHeader";
import Footer from "@/components/Layout/Footer";

const EducationPage: React.FC = () => {
  const Icon = AcademicCapIcon;
  const Title = "理財知識";
  const Subtitle = "理財知識與教育平台頁面";
  const Description = "我們正在努力為您準備更多精彩的內容和功能，敬請期待！";
  const panelTitle = "TBD";
  const panelSubtitle = "即將推出";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={panelTitle}
        panelSubtitle={panelSubtitle}
      />

      <div className="min-h-screen bg-slate-50">
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
      </div>

      <Footer />
    </>
  );
};

export default EducationPage;
