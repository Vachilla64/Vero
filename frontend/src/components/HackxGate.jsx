import { createPortal } from "react-dom";
import { motion } from "framer-motion";

/* Shared "are you at ECX HackX right now?" ask + bank picker, used by
   BankDemoGate's passive first-visit nag (Home) and Login's explicit
   "Log in" gate. Both mount into document.body via portal — see
   BankDemoGate.jsx for why (framer-motion transform ancestors trap
   position:fixed descendants under BottomNav's z-50 otherwise). */

export const BANK_OPTIONS = [
  { id: "unionbank", name: "Union Bank", logo: "/banks/unionbankng.png", gradient: "linear-gradient(135deg, #00A2E8 0%, #006b99 100%)" },
  { id: "opay", name: "OPay", logo: "/banks/opayweb.png", gradient: "linear-gradient(135deg, #00D09E 0%, #00A37A 100%)" },
  { id: "uba", name: "UBA", logo: "/banks/ubagroup.png", gradient: "linear-gradient(135deg, #E51920 0%, #A31015 100%)" },
];

export function HackxPrompt({ open, onYes, onNo }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-ink/60 backdrop-blur-sm flex items-end justify-center p-0">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="bg-white w-full max-w-md rounded-t-[32px] p-7 flex flex-col items-center text-center shadow-app"
      >
        <div className="bg-ink rounded-2xl px-6 py-5 mb-6">
          <img src="/ecx-logo.svg" alt="ECX HackX" className="h-6" />
        </div>
        <h2 className="font-black text-[20px] text-ink mb-2">Live at ECX HackX right now?</h2>
        <p className="text-slate text-[14px] font-medium leading-relaxed mb-7">
          If you're at the hackathon, we'll show you something extra: exactly how Vero looks running inside your own bank's app.
        </p>
        <button
          onClick={onYes}
          className="w-full bg-trust-high text-white font-bold text-[15px] py-4 rounded-full shadow-btn-green mb-3"
        >
          Yes, I'm at HackX
        </button>
        <button onClick={onNo} className="w-full text-slate font-semibold text-[13px] py-2">
          Not right now
        </button>
      </motion.div>
    </div>,
    document.body
  );
}

export function BankPickerSheet({ open, onClose, onPick }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-ink/60 backdrop-blur-sm flex items-end justify-center p-0">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="bg-white w-full max-w-md rounded-t-[32px] p-7 shadow-app"
      >
        <h2 className="font-black text-[20px] text-ink mb-2 text-center">Which bank do you use most?</h2>
        <p className="text-slate text-[14px] font-medium leading-relaxed mb-6 text-center">
          You're about to see exactly how it looks to have Vero right there with you, inside your bank's app.
        </p>
        <div className="flex flex-col gap-3">
          {BANK_OPTIONS.map((b) => (
            <button
              key={b.id}
              onClick={() => onPick(b.id)}
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
          onClick={onClose}
          className="w-full text-slate font-semibold text-[13px] py-3 mt-4 text-center"
        >
          Maybe later
        </button>
      </motion.div>
    </div>,
    document.body
  );
}
