import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

const PageTransition = ({ children }) => {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.asPath} // 使用 asPath 而不是 pathname，這樣包含查詢參數
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.25,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
