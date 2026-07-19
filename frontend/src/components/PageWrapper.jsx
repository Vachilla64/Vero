import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

export default function PageWrapper({ children, className = "" }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`absolute inset-0 overflow-y-auto overflow-x-hidden pt-16 pb-24 no-scrollbar ${className}`}
    >
      {children}
    </motion.div>
  );
}
