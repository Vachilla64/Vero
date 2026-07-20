import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="h-full bg-trust-green flex flex-col items-center justify-center font-sans relative overflow-hidden animate-[fade-in_0.3s_ease-out]">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[150%] h-[80%] bg-gradient-to-b from-white/20 to-transparent rounded-[100%] blur-3xl opacity-40 pointer-events-none" />

      {/* Logo Container */}
      <div className="z-10 flex flex-col items-center animate-[bounce-soft_2s_infinite]">
        <div className="w-24 h-24 bg-white p-4 rounded-3xl shadow-app mb-6">
          <img src="/vero-logo.png" alt="Vero Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-white font-black text-4xl tracking-widest">VERO</h1>
        <p className="text-trust-greenLight font-bold text-sm tracking-widest uppercase mt-3 opacity-80">
          Trust Network
        </p>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-16 z-10">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
