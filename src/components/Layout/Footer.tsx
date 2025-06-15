import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { FaGithub } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 pt-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 品牌資訊 */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  FinTech Studio
                </h3>
                <p className="text-gray-400">智慧金融分析平台</p>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              金融走勢智慧分析，讓投資更簡單。透過 AI
              技術，提供即時市場分析、投資組合建議和風險評估，助您做出明智的投資決策。
            </p>

            <div className="flex space-x-4">
              <a
                href="https://github.com/HaoXun97/financial-analysis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors group"
              >
                <FaGithub className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* 快速連結 */}
          <div>
            <h4 className="text-white font-semibold mb-6">功能</h4>
            <ul className="space-y-3">
              {["市場分析", "投資組合", "AI 預測", "風險管理"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 支援 */}
          <div>
            <h4 className="text-white font-semibold mb-6">支援</h4>
            <ul className="space-y-3">
              {["幫助中心", "聯絡我們", "隱私政策", "服務條款"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-center">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} FinTech Studio. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
