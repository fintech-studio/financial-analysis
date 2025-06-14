import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import React from "react";

// TypeScript 型別定義
interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1], // cubic-bezier for smoother easing
            opacity: { duration: 0.3 },
            y: { duration: 0.4 },
            scale: { duration: 0.4 },
          },
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 1.02,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.6, 1],
            opacity: { duration: 0.2 },
            y: { duration: 0.3 },
            scale: { duration: 0.3 },
          },
        }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
