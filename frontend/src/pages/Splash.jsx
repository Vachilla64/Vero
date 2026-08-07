import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function Splash({ onFinish }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Artificial delay for the premium splash screen effect
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (onFinish) onFinish();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, isLoading, onFinish]);

  return (
    <div className="h-full bg-[linear-gradient(160deg,#00C853,#00A847)] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[150%] h-[80%] bg-gradient-to-b from-white/20 to-transparent rounded-[100%] blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[120%] h-[60%] bg-gradient-to-t from-black/10 to-transparent rounded-[100%] blur-3xl opacity-30 pointer-events-none" />

      {/* Faint floating shield motifs for texture */}
      <ShieldCheck className="absolute top-[14%] left-[12%] w-8 h-8 text-white/10 rotate-[-12deg]" strokeWidth={1.5} />
      <ShieldCheck className="absolute bottom-[22%] right-[14%] w-10 h-10 text-white/10 rotate-[10deg]" strokeWidth={1.5} />

      {/* Logo Container */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="w-24 h-24 bg-white p-4 rounded-3xl shadow-app mb-6"
        >
          <img src="/vero-logo.png" alt="Vero Logo" className="w-full h-full object-contain" />
        </motion.div>
        <h1 className="text-white font-black text-4xl tracking-widest">VERO</h1>
        <p className="text-white font-bold text-sm tracking-widest uppercase mt-3 opacity-80">
          Verify before you send
        </p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute bottom-16 z-10 flex flex-col items-center gap-3"
      >
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-white/70 text-[11px] font-semibold tracking-wide">Protecting Nigerian transfers</p>
      </motion.div>
    </div>
  );
}
