import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, AlertTriangle } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();

  const handleFinish = () => {
    localStorage.setItem("vero_onboarding_seen", "true");
    navigate("/");
  };

  return (
    <div className="h-full bg-trust-green flex flex-col font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] blur-xl opacity-30 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-end p-8 pb-12 z-10 animate-[fade-in_0.5s_ease-out]">
        <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-center w-16 h-16 bg-trust-green/10 text-trust-green rounded-2xl mb-6">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-[28px] font-extrabold text-ink leading-tight mb-4 tracking-tight">
            Never lose money to scams again.
          </h1>
          
          <p className="text-[15px] font-semibold text-secondary leading-relaxed mb-8">
            Vero intercepts fraudulent bank transfers before they clear, using a zero-trust network powered by AI.
          </p>

          <div className="space-y-5 mb-10">
            <div className="flex gap-4 items-start">
              <div className="mt-0.5 bg-trust-green/10 text-trust-green p-2 rounded-xl">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-ink text-[15px]">Instant Lookup</h3>
                <p className="text-[13px] font-medium text-secondary">Check any account number (NUBAN) in seconds.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-0.5 bg-trust-amber/10 text-trust-amber p-2 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-ink text-[15px]">AI Risk Explanation</h3>
                <p className="text-[13px] font-medium text-secondary">Understand exactly why an account is dangerous.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full bg-ink text-white font-bold text-[16px] py-[18px] rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Start Verifying
          </button>
        </div>
      </div>
    </div>
  );
}
