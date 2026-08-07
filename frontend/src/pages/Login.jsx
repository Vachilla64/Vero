import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, X } from "lucide-react";
import { SLIDES, THEME } from "../data/onboardingSlides";

const slideVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

export default function Login() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const slide = SLIDES[step];
  const t = THEME[slide.theme];

  useEffect(() => {
    if (showForm) return;
    const id = setInterval(() => setStep((s) => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      await login("demo@vero.net", "password123");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Demo login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans relative overflow-hidden transition-colors duration-500 ${t.bg}`}>
      <div className="flex flex-col items-center pt-12 pb-4 shrink-0 relative z-10">
        <img src="/vero-logo.png" alt="Vero" className="w-14 h-14 object-contain mb-2 drop-shadow-[0_6px_14px_rgba(0,200,83,0.25)]" />
        <div className={`font-extrabold text-[16px] tracking-[.04em] ${t.headline}`}>VERO</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="initial"
          animate="in"
          exit="out"
          variants={slideVariants}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center px-8 relative z-10"
        >
          <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 font-mono font-bold text-[15px] ${t.badgeBg} ${t.badgeText}`}>
            {slide.num}
          </div>

          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-3 ${t.eyebrow}`}>
            {slide.eyebrow}
          </p>

          <h1 className={`text-[28px] font-black leading-[1.1] tracking-tight mb-3 ${t.headline}`}>
            {slide.headlinePlain}
            <br />
            <span className={t.accent}>{slide.headlineAccent}</span>
          </h1>

          <p className={`text-[14px] font-medium leading-relaxed max-w-[280px] ${t.body}`}>
            {slide.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="px-8 pb-10 shrink-0 relative z-10">
        <div className="flex gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-[6px] rounded-full transition-all duration-300 ${
                i === step ? `w-8 ${t.dotActive}` : `w-[6px] ${t.dotInactive}`
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className={`w-full font-bold text-[16px] py-[18px] rounded-full active:scale-[0.98] transition-all ${t.button}`}
        >
          Log in
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className={`w-full font-bold text-[13.5px] py-3 mt-2 disabled:opacity-60 ${t.accent}`}
        >
          {isSubmitting ? "Logging in…" : "Try the demo →"}
        </button>

        <div className={`text-center mt-3 text-[13px] font-medium ${t.body}`}>
          Don't have an account?{" "}
          <Link to="/register" className={`font-bold hover:underline ${t.accent}`}>Create one</Link>
        </div>
      </div>

      {/* Log-in bottom sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm z-50"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[32px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[85vh] overflow-y-auto no-scrollbar shadow-app"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-bold text-[17px] text-ink">Log in</div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3 bg-risk-critical/10 border border-risk-critical/20 text-risk-critical text-sm rounded-lg text-center font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-canvas rounded-2xl px-4 py-[13px]">
                  <Mail size={17} className="text-slate shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Email</div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-canvas rounded-2xl px-4 py-[13px]">
                  <Lock size={17} className="text-slate shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Password</div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-trust-high text-white font-bold text-[16px] p-[17px] rounded-full shadow-card border-none cursor-pointer hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait mt-2"
                >
                  {isSubmitting ? "Logging in…" : "Log in"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
