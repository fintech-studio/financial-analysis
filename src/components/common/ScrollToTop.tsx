import React, { useState, useEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

interface ScrollToTopProps {
  /**
   * 顯示按鈕的滾動閾值（像素）
   * @default 300
   */
  threshold?: number;
  /**
   * 是否顯示滾動進度
   * @default false
   */
  showProgress?: boolean;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  showProgress = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 監聽滾動事件
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > threshold);

      if (showProgress) {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const totalDocScrollLength = docHeight - winHeight;
        const scrollPosition = Math.floor(
          (scrollTop / totalDocScrollLength) * 100
        );
        setScrollProgress(scrollPosition);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility(); // 初始檢查

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold, showProgress]);

  // 滾動到頂部函數
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      data-fixed-element
      className={`
        fixed bottom-5 right-5 z-[10000] transition-opacity duration-500 ease-in-out
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      style={{
        position: "fixed" as any,
        bottom: "20px",
        right: "20px",
        zIndex: 10000,
        backfaceVisibility: "initial",
        perspective: "none",
      }}
    >
      <button
        onClick={scrollToTop}
        className={`
          w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 
          hover:from-blue-600 hover:to-blue-700 text-white rounded-full 
          shadow-lg hover:shadow-xl transition-all duration-300 
          hover:scale-110 flex items-center justify-center
          active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300
          ${isVisible ? "" : ""}
        `}
        title="回到頂部"
        aria-label="回到頂部"
      >
        {showProgress && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 transition-opacity duration-300"
            viewBox="0 0 36 36"
          >
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={`${scrollProgress}, 100`}
              className="transition-all duration-300"
            />
          </svg>
        )}
        <ArrowUpIcon
          className={`
            w-6 h-6 relative z-10 transition-transform duration-300
            ${isVisible ? "animate-fade-in-up" : ""}
          `}
        />
      </button>
    </div>
  );
};

export default ScrollToTop;
