import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await register(email, password, name);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface font-sans overflow-y-auto no-scrollbar relative">
      {/* Brand glow */}
      <div className="absolute top-[-12%] left-1/2 -translate-x-1/2 w-[140%] h-[260px] bg-gradient-to-b from-trust-high/12 to-transparent rounded-[100%] blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col px-[26px] pb-[26px] pt-12 max-w-md mx-auto w-full relative">
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <img src="/vero-logo.png" alt="Vero" className="w-16 h-16 object-contain mb-2 drop-shadow-[0_6px_14px_rgba(0,200,83,0.25)]" />
          <div className="font-extrabold text-[17px] text-ink tracking-[.04em]">VERO</div>
          <div className="text-[12.5px] text-slate font-semibold mt-1">Verify before you send</div>
        </motion.div>

        <div className="flex bg-hairline rounded-[14px] p-1 mb-[26px]">
          <div className="flex-1 text-center p-[10px] rounded-[11px] bg-white shadow-[0_4px_10px_rgba(43,52,69,.06)] text-[14px] font-bold text-ink">Create account</div>
          <Link to="/login" className="flex-1 text-center p-[10px] rounded-[11px] text-[14px] font-semibold text-slate hover:text-ink transition-colors">Log in</Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-risk-critical/10 border border-risk-critical/20 text-risk-critical text-sm rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs border border-transparent focus-within:border-trust-high/30 transition-colors">
              <User size={17} className="text-slate shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Full name</div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                  placeholder="Adaeze Okafor"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs border border-transparent focus-within:border-trust-high/30 transition-colors">
              <Mail size={17} className="text-slate shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                  placeholder="adaeze@gmail.com"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs border border-transparent focus-within:border-trust-high/30 transition-colors">
              <Lock size={17} className="text-slate shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                  placeholder="••••••••••"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-trust-high text-white font-bold text-[16px] p-[17px] rounded-full shadow-card border-none cursor-pointer hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        <div className="text-center mt-auto pt-5 text-slate text-[13px] font-medium">
          Already have an account? <Link to="/login" className="text-trust-high font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
