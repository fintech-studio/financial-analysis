import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import Wave from "@/components/Wave";

interface PageHeaderProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  description?: string;
  panelTitle?: string;
  panelSubtitle?: string;
  panelTitle2?: string;
  panelSubtitle2?: string;
  form?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  description,
  panelTitle,
  panelSubtitle,
  panelTitle2,
  panelSubtitle2,
  form,
}) => {
  const Icon = icon ?? ChartBarIcon;
  return (
    <section className="relative bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center overflow-hidden pb-12">
      {/* 動態網格背景 */}
      <div className="absolute inset-0 opacity-20 animate-pulse">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Enhanced Decorative Background - replaced with animated blurred SVG blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="blob1" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blob2" cx="70%" cy="40%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blob3" cx="50%" cy="70%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="60" />
            </filter>
          </defs>

          <g filter="url(#blur)">
            <circle cx="200" cy="160" r="180" fill="url(#blob1)">
              <animate
                attributeName="cx"
                dur="12s"
                values="200;1000;600;200"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                dur="10s"
                values="160;120;600;160"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="900" cy="220" r="220" fill="url(#blob2)">
              <animate
                attributeName="cx"
                dur="14s"
                values="900;100;500;900"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                dur="11s"
                values="220;500;100;220"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="620" cy="600" r="260" fill="url(#blob3)">
              <animate
                attributeName="cx"
                dur="16s"
                values="620;300;1000;620"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                dur="13s"
                values="600;200;400;600"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* subtle star dots */}
          <g fill="#ffffff" opacity="0.12">
            <circle cx="80" cy="80" r="2">
              <animate
                attributeName="opacity"
                dur="4s"
                values="0.05;0.25;0.05"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="1100" cy="100" r="2.5">
              <animate
                attributeName="opacity"
                dur="6s"
                values="0.02;0.18;0.02"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="300" cy="700" r="1.8">
              <animate
                attributeName="opacity"
                dur="5s"
                values="0.01;0.12;0.01"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div>
                {/* Header Title */}
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {title}
                </h1>
                {/* Subtitle */}
                <h2 className="text-blue-200 mt-3 text-xl font-medium">
                  {subtitle}
                </h2>
                {/* Description */}
                <p className="text-blue-200 text-lg max-w-3xl leading-relaxed italic">
                  {description}
                </p>
              </div>
            </div>
            {form && <div className="mt-8">{form}</div>}
          </div>

          {/* Enhanced Statistics Panel */}
          <div className="flex flex-col lg:items-end space-y-4">
            <div
              className={`grid ${
                panelTitle2 && panelSubtitle2 ? "grid-cols-2" : "grid-cols-1"
              } gap-6 lg:gap-8`}
            >
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                {/* Panel Title */}
                <div className="text-3xl font-bold text-white">
                  {panelTitle}
                </div>
                {/* Panel Subtitle */}
                <div className="text-blue-200 text-sm font-medium">
                  {panelSubtitle}
                </div>
              </div>

              {/* Additional Panel 2 (optional) - only render when both props provided */}
              {panelTitle2 && panelSubtitle2 && (
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  {/* Panel Title */}
                  <div className="text-3xl font-bold text-white">
                    {panelTitle2}
                  </div>
                  {/* Panel Subtitle */}
                  <div className="text-blue-200 text-sm font-medium">
                    {panelSubtitle2}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Wave />
    </section>
  );
};

export default PageHeader;
