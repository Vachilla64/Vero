import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HackxPrompt, BankPickerSheet } from "./HackxGate";

/* ══════════════════════════════════════════════════════════════
   BankDemoGate · self-contained banner + one-time HackX prompt
   for the "Vero inside a bank app" click-through demo (see
   pages/BankDemo.jsx). Drop <BankDemoGate /> once into Home,
   it owns its own state, so the host page's diff stays tiny.

   Behavior: most people opening Vero right now are at ECX HackX,
   so we ask once, the first time the app is ever opened (any
   user, onboarded or not, new or returning), not tied to the
   onboarding flow, since returning users skip that entirely.
   After that first ask (either answer), the banner stays as a
   permanent, low-friction way back into the demo.

   The prompt/picker themselves live in HackxGate.jsx (shared with
   the same gate on Login.jsx) and render via portal — see that
   file for why (framer-motion transform ancestors trap
   position:fixed descendants under BottomNav's z-50 otherwise).
══════════════════════════════════════════════════════════════ */

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
        className="w-full flex flex-col gap-3.5 bg-ink rounded-[20px] px-4 pt-4 pb-3.5 mt-3 text-left active:scale-[0.99] transition-transform"
      >
        <img src="/ecx-logo.svg" alt="ECX HackX" className="h-8 w-auto object-contain" />
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-white font-bold text-[13.5px] leading-tight">See Vero live in your bank app</div>
            <div className="text-white/50 text-[11.5px] font-semibold mt-[2px]">HackX demo · tap to try it</div>
          </div>
          <span className="text-white/60 text-[18px] font-bold shrink-0">›</span>
        </div>
      </button>

      <HackxPrompt open={showHackx} onYes={acceptHackx} onNo={dismissHackx} />
      <BankPickerSheet open={showBankPick} onClose={() => setShowBankPick(false)} onPick={goToBankDemo} />
    </>
  );
}
