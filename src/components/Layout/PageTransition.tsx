import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

// TypeScript 型別定義
interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();

  // 使用 useMemo 快取動畫配置，避免重複計算
  const animations = useMemo(
    () => ({
      pageVariants: {
        initial: {
          opacity: 0,
          y: 8,
          scale: 0.995,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1], // 使用更流暢的 ease-out 曲線
          },
        },
        exit: {
          opacity: 0,
          y: -8,
          transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1], // 更快的退出動畫
          },
        },
      },
      indicatorVariants: {
        initial: {
          scaleX: 0,
          opacity: 0,
        },
        animate: {
          scaleX: [0, 1, 1, 0], // 修改為陣列動畫，讓指示器自動消失
          opacity: [0, 1, 1, 0],
          transition: {
            duration: 0.8, // 延長持續時間讓動畫完整播放
            times: [0, 0.2, 0.8, 1], // 控制每個階段的時間
            ease: "easeInOut",
          },
        },
        exit: {
          scaleX: 0,
          opacity: 0,
          transition: {
            duration: 0.1,
          },
        },
      },
    }),
    []
  );

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => window.scrollTo(0, 0)} // 轉場完成後回到頂部
    >
      <motion.div
        key={router.asPath}
        className="relative min-h-screen"
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden", // 避免 3D 變換時的閃爍
        }}
      >
        {/* 主要內容 */}
        <motion.div
          variants={animations.pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10"
          style={{
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
          }}
        >
          {children}
        </motion.div>

        {/* 修正的頂部指示器 - 現在會自動消失 */}
        <motion.div
          key={`indicator-${router.asPath}`} // 添加唯一 key 確保正確卸載
          variants={animations.indicatorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-0 left-0 h-0.5 bg-blue-500 pointer-events-none z-50"
          style={{
            width: "100%",
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// 使用 React.memo 避免不必要的重新渲染
export default React.memo(PageTransition);
