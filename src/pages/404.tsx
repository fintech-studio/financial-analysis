import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "@/components/Layout/Footer";
import Wave from "@/components/Layout/Wave";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFoundPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const digitRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const floatingElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animations: any[] = [];

    // 簡化的動畫效果
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (!mounted) return;

        // 主要進場動畫
        const tl = gsap.timeline();

        tl.from(containerRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out",
        })
          .from(
            digitRefs.current,
            {
              scale: 0.8,
              opacity: 0,
              y: -20,
              stagger: 0.1,
              duration: 0.6,
              ease: "back.out(1.2)",
            },
            0.2
          )
          .from(
            ".fade-in-element",
            {
              opacity: 0,
              y: 20,
              stagger: 0.1,
              duration: 0.5,
              ease: "power2.out",
            },
            0.6
          );

        // 浮動動畫
        floatingElementsRef.current.forEach((el, index) => {
          if (el) {
            const floatAnim = gsap.to(el, {
              y: -10,
              rotation: 5,
              repeat: -1,
              yoyo: true,
              duration: 2 + index * 0.3,
              ease: "sine.inOut",
              delay: index * 0.2,
            });
            animations.push(floatAnim);
          }
        });

        animations.push(tl);
      } catch (error) {
        console.warn("Animation failed to load:", error);
      }
    })();

    return () => {
      mounted = false;
      animations.forEach((anim) => {
        try {
          if (anim?.kill) anim.kill();
        } catch (error) {
          // 忽略清理錯誤
          console.warn("Animation cleanup error:", error);
        }
      });
    };
  }, []);

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        {/* 背景裝飾元素 */}
        <div className="absolute inset-0 z-0">
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
        </div>

        {/* 主要內容 */}
        <div
          ref={containerRef}
          className="z-10 flex flex-col items-center px-6 text-center max-w-4xl mb-20"
        >
          {/* 404 數字 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["4", "0", "4"].map((digit, index) => (
              <span
                key={index}
                ref={(el) => {
                  digitRefs.current[index] = el;
                }}
                data-text={digit}
                className="glitch text-8xl md:text-9xl lg:text-[10rem] font-black text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-cyan-400 to-sky-500 drop-shadow-2xl select-none"
              >
                {/* glow 背景層（受 blur）*/}
                <span className="glow aria-hidden">{digit}</span>
                <span className="glyph">{digit}</span>
              </span>
            ))}
          </div>

          {/* 標題和描述 */}
          <div className="space-y-6 mb-12">
            <h1 className="fade-in-element text-3xl md:text-5xl font-bold text-white select-none">
              Oops！您似乎迷路了
            </h1>
            <div className="fade-in-element space-y-4 text-slate-300">
              <p className="text-lg md:text-2xl max-w-2xl select-none">
                就像市場波動一樣，有時候會偏離預期的路徑
              </p>
              <p className="text-lg max-w-2xl opacity-80 select-none mt-12">
                <ExclamationTriangleIcon className="inline-block w-6 h-6 mr-1 mb-0.5" />
                您要找的頁面可能已經移動、刪除，或是暫時無法使用
              </p>
            </div>
          </div>

          {/* 導航選項 */}
          <div className="fade-in-element grid">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="返回上一頁"
                onClick={() => router.back()}
                className="group relative px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-2 select-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>返回</span>
                </div>
              </button>

              <Link
                href="/"
                className="group relative px-6 py-4 bg-white rounded-xl font-semibold text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-2 select-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>返回首頁</span>
                </div>
              </Link>
            </div>
          </div>

          {/* 額外連結 */}
          <div className="fade-in-element mt-8 flex flex-wrap justify-center gap-6 text-sm select-none">
            <Link
              href="/market-analysis"
              className=" text-white hover:text-slate-400 transition-colors duration-200"
            >
              市場分析
            </Link>
            <Link
              href="/news"
              className="text-white hover:text-slate-400 transition-colors duration-200"
            >
              財經新聞
            </Link>
            <Link
              href="/chat"
              className="text-white hover:text-slate-400 transition-colors duration-200"
            >
              AI 助理
            </Link>
            <Link
              href="/predict"
              className="text-white hover:text-slate-400 transition-colors duration-200"
            >
              AI 預測
            </Link>
          </div>
        </div>
        <Wave color="bg-gray-900" />
      </main>

      <Footer />
    </>
  );
};

export default NotFoundPage;
