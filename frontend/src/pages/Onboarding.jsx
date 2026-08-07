import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Same color-blocked-panel language as the pamphlet/deck: dark hook →
// light mechanism → green payoff, each with a numbered badge instead of
// a generic centered icon.
const SLIDES = [
  {
    theme: "dark",
    num: "01",
    eyebrow: "Welcome to Vero",
    headlinePlain: "Stop guessing.",
    headlineAccent: "Start verifying.",
    body: "Vero checks any Nigerian bank account before you transfer — see the real risk before your money moves.",
  },
  {
    theme: "light",
    num: "02",
    eyebrow: "How it works",
    headlinePlain: "Enter a NUBAN.",
    headlineAccent: "Get a score.",
    body: "Any 10-digit account number returns a 0–100 trust score in seconds. No waiting, no guesswork.",
  },
  {
    theme: "green",
    num: "03",
    eyebrow: "Why it's different",
    headlinePlain: "Not just a number.",
    headlineAccent: "A plain-English why.",
    body: "Every score comes with an explanation you can act on — not just digits you have to trust blindly.",
  },
];

const THEME = {
  dark: {
    bg: "bg-ink",
    eyebrow: "text-trust-good",
    headline: "text-white",
    accent: "text-trust-good",
    body: "text-white/60",
    badgeBg: "bg-white/10",
    badgeText: "text-trust-good",
    dotActive: "bg-trust-good",
    dotInactive: "bg-white/20",
    skip: "text-white/50 hover:text-white",
    button: "bg-trust-high text-white shadow-btn-green",
  },
  light: {
    bg: "bg-surface",
    eyebrow: "text-trust-high",
    headline: "text-ink",
    accent: "text-trust-high",
    body: "text-slate",
    badgeBg: "bg-trust-high/10",
    badgeText: "text-trust-high",
    dotActive: "bg-trust-high",
    dotInactive: "bg-slate/25",
    skip: "text-slate hover:text-ink",
    button: "bg-ink text-white shadow-card",
  },
  green: {
    bg: "bg-trust-high",
    eyebrow: "text-ink/70",
    headline: "text-ink",
    accent: "text-white",
    body: "text-ink/70",
    badgeBg: "bg-ink",
    badgeText: "text-trust-good",
    dotActive: "bg-ink",
    dotInactive: "bg-ink/20",
    skip: "text-ink/50 hover:text-ink",
    button: "bg-ink text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)]",
  },
};

const slideVariants = {
  initial: { opacity: 0, x: 40 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -40 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];
  const t = THEME[slide.theme];

  const handleFinish = () => {
    localStorage.setItem("vero_onboarding_seen", "true");
    navigate("/");
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans relative overflow-hidden transition-colors duration-300 ${t.bg}`}>
      {/* Skip */}
      <div className="flex justify-between items-center px-7 pt-6 h-[52px] shrink-0 relative z-10">
        <span className={`font-mono text-[11px] font-bold tracking-[0.1em] ${t.eyebrow}`}>{slide.num} / 0{SLIDES.length}</span>
        {!isLast && (
          <button
            onClick={handleFinish}
            className={`font-bold text-[12px] uppercase tracking-wider transition-colors ${t.skip}`}
          >
            Skip
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="initial"
          animate="in"
          exit="out"
          variants={slideVariants}
          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          className="flex-1 flex flex-col justify-center px-8 relative z-10"
        >
          <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center mb-7 font-mono font-bold text-[17px] ${t.badgeBg} ${t.badgeText}`}>
            {slide.num}
          </div>

          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-3 ${t.eyebrow}`}>
            {slide.eyebrow}
          </p>

          <h1 className={`text-[32px] font-black leading-[1.08] tracking-tight mb-4 ${t.headline}`}>
            {slide.headlinePlain}
            <br />
            <span className={t.accent}>{slide.headlineAccent}</span>
          </h1>

          <p className={`text-[15px] font-medium leading-relaxed max-w-[290px] ${t.body}`}>
            {slide.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="px-8 pb-10 shrink-0 relative z-10">
        {/* Progress dots */}
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
          onClick={handleNext}
          className={`w-full font-bold text-[16px] py-[18px] rounded-full active:scale-[0.98] transition-all ${t.button}`}
        >
          {isLast ? "Start Verifying" : "Next"}
        </button>
      </div>
    </div>
  );
}
