import { motion, AnimatePresence, easeOut, easeInOut } from "framer-motion";
import { useRouter } from "next/router";
import React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

// 動畫 variants 抽出，減少 render 產生新物件
const pageVariants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: easeInOut },
  },
};

const indicatorVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: {
    scaleX: [0, 1, 1, 0],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.2, 0.8, 1],
      ease: easeInOut,
    },
  },
  exit: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => window.scrollTo(0, 0)}
    >
      <motion.div
        key={router.asPath}
        className="relative min-h-screen"
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {/* 主要內容 */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10"
        >
          {children}
        </motion.div>

        {/* 頂部指示器動畫 */}
        <motion.div
          key={`indicator-${router.asPath}`}
          variants={indicatorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-0 left-0 h-0.5 bg-blue-500 pointer-events-none z-50"
          data-fixed-element
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

PageTransition.displayName = "PageTransition";
// 使用 React.memo 避免不必要的重新渲染
export default React.memo(PageTransition);
