import React, { useState } from 'react';
import {
  AcademicCapIcon,
  ChartBarIcon,
  BookOpenIcon,
  CalculatorIcon,
  LightBulbIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const EducationPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const courses = [
    {
      id: 1,
      title: '投資基礎入門',
      description: '學習投資的基本概念、風險管理和投資策略',
      duration: '4週',
      level: '初學者',
      icon: AcademicCapIcon,
    },
    {
      id: 2,
      title: '技術分析進階',
      description: '深入學習各種技術指標和圖表分析方法',
      duration: '6週',
      level: '進階',
      icon: ChartBarIcon,
    },
    {
      id: 3,
      title: '基本面分析',
      description: '學習如何分析公司財務報表和產業趨勢',
      duration: '5週',
      level: '中級',
      icon: BookOpenIcon,
    },
  ];

  const resources = [
    {
      id: 1,
      title: '投資計算器',
      description: '計算投資報酬率、複利效果和風險評估',
      icon: CalculatorIcon,
    },
    {
      id: 2,
      title: '投資詞彙表',
      description: '解釋常用的投資術語和概念',
      icon: DocumentTextIcon,
    },
    {
      id: 3,
      title: '投資策略指南',
      description: '各種投資策略的詳細說明和應用',
      icon: LightBulbIcon,
    },
  ];

  const tabs = [
    { id: 'courses', name: '投資課程', icon: AcademicCapIcon },
    { id: 'resources', name: '學習資源', icon: BookOpenIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">理財知識</h1>

        {/* 標籤導航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 課程內容 */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const Icon = course.icon;
              return (
                <div key={course.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <h2 className="text-lg font-medium text-gray-900">{course.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>課程時長：{course.duration}</span>
                    <span>難度：{course.level}</span>
                  </div>
                  <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    開始學習
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 學習資源 */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <div key={resource.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <h2 className="text-lg font-medium text-gray-900">{resource.title}</h2>
                  </div>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    查看詳情
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationPage; 