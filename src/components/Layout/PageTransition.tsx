import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

// TypeScript 型別定義
interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();

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
        {/* 主要內容  */}
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10"
        >
          {children}
        </motion.div>

        {/* 修正的頂部指示器 - 現在會自動消失 */}
        <motion.div
          key={`indicator-${router.asPath}`} // 添加唯一 key 確保正確卸載
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-0 left-0 h-0.5 bg-blue-500 pointer-events-none z-50"
          data-fixed-element // 添加標記避免受全局 CSS 影響
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
