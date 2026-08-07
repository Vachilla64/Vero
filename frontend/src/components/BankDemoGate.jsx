import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   BankDemoGate · self-contained banner + one-time HackX prompt
   for the "Vero inside a bank app" click-through demo (see
   pages/BankDemo.jsx). Drop <BankDemoGate /> once into Home —
   it owns its own state, so the host page's diff stays tiny.

   Behavior: most people opening Vero right now are at ECX HackX,
   so we ask once, the first time the app is ever opened (any
   user, onboarded or not, new or returning) — not tied to the
   onboarding flow, since returning users skip that entirely.
   After that first ask (either answer), the banner stays as a
   permanent, low-friction way back into the demo.
══════════════════════════════════════════════════════════════ */

const BANK_OPTIONS = [
  { id: "unionbank", name: "Union Bank", logo: "/banks/unionbankng.png", gradient: "linear-gradient(135deg, #00A2E8 0%, #006b99 100%)" },
  { id: "opay", name: "OPay", logo: "/banks/opayweb.png", gradient: "linear-gradient(135deg, #00D09E 0%, #00A37A 100%)" },
  { id: "uba", name: "UBA", logo: "/banks/ubagroup.png", gradient: "linear-gradient(135deg, #E51920 0%, #A31015 100%)" },
];

const ASKED_KEY = "vero_hackx_prompted";

export default function BankDemoGate() {
  const navigate = useNavigate();
  const [showHackx, setShowHackx] = useState(false);
  const [showBankPick, setShowBankPick] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ASKED_KEY)) {
      setShowHackx(true);
    }
  }, []);

  const dismissHackx = () => {
    localStorage.setItem(ASKED_KEY, "true");
    setShowHackx(false);
  };

  const acceptHackx = () => {
    localStorage.setItem(ASKED_KEY, "true");
    setShowHackx(false);
    setShowBankPick(true);
  };

  const goToBankDemo = (bankId) => {
    setShowBankPick(false);
    navigate(`/bank-demo/${bankId}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowBankPick(true)}
        className="w-full flex items-center gap-3 bg-ink rounded-[20px] px-4 py-3.5 mt-3 text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[17px]">🏦</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-[13.5px] leading-tight">See Vero live in your bank app</div>
          <div className="text-white/50 text-[11.5px] font-semibold mt-[2px]">ECX HackX demo · tap to try it</div>
        </div>
        <span className="text-white/60 text-[18px] font-bold shrink-0">›</span>
      </button>

      {showHackx && (
        <div className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[24px] p-7 flex flex-col items-center text-center shadow-app"
          >
            <div className="bg-ink rounded-2xl px-6 py-5 mb-6">
              <img src="/ecx-logo.svg" alt="ECX HackX" className="h-6" />
            </div>
            <h2 className="font-black text-[20px] text-ink mb-2">Live at ECX HackX right now?</h2>
            <p className="text-slate text-[14px] font-medium leading-relaxed mb-7">
              If you're at the hackathon, we'll show you something extra — exactly how Vero looks running inside your own bank's app.
            </p>
            <button
              onClick={acceptHackx}
              className="w-full bg-trust-high text-white font-bold text-[15px] py-4 rounded-full shadow-btn-green mb-3"
            >
              Yes, I'm at HackX
            </button>
            <button onClick={dismissHackx} className="w-full text-slate font-semibold text-[13px] py-2">
              Not right now
            </button>
          </motion.div>
        </div>
      )}

      {showBankPick && (
        <div className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[24px] p-7 shadow-app"
          >
            <h2 className="font-black text-[20px] text-ink mb-2 text-center">Which bank do you use most?</h2>
            <p className="text-slate text-[14px] font-medium leading-relaxed mb-6 text-center">
              You're about to see exactly how it looks to have Vero right there with you, inside your bank's app.
            </p>
            <div className="flex flex-col gap-3">
              {BANK_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => goToBankDemo(b.id)}
                  className="flex items-center gap-4 rounded-2xl p-3 border border-hairline hover:border-trust-high transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                    style={{ background: b.gradient }}
                  >
                    <img src={b.logo} alt={b.name} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="font-bold text-ink text-[15px]">{b.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBankPick(false)}
              className="w-full text-slate font-semibold text-[13px] py-3 mt-4 text-center"
            >
              Maybe later
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
