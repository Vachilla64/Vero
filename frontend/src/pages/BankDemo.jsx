import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import SlideButton from "../components/SlideButton";

import unionBankTransferHtml from "../mockups/unionbank_transfer_details.html?raw";
import unionBankPinHtml from "../mockups/unionbank_confirm_transaction_pin.html?raw";
import opayRecipientHtml from "../mockups/opay_recipient_account_input.html?raw";
import opayAmountHtml from "../mockups/opay_amount_remark_input.html?raw";
import opayWarningHtml from "../mockups/opay_large_transfer_warning.html?raw";
import opayConfirmHtml from "../mockups/opay_payment_confirmation_method.html?raw";
import ubaStep1Html from "../mockups/uba_local_transfer_step1.html?raw";
import ubaStep2Html from "../mockups/uba_local_transfer_step2.html?raw";

/* ══════════════════════════════════════════════════════════════
   /bank-demo · click-through prototype showing the REAL Vero
   verdict screen (same markup/tokens as pages/Home.jsx's trusted
   verdict, same SlideButton) dropped into 3 real bank transfer
   flows. The bank screens are static HTML/CSS mockups (originally
   in VeroSlides/"Bank App Mockups", copied to public/mockups here)
   injected straight into the DOM via dangerouslySetInnerHTML — no
   iframe — so the Vero step can share layout/animation context
   with whatever bank screen it's interrupting. Public route, no
   auth, doesn't touch Home/History/HowItWorks or any other
   in-progress page.
══════════════════════════════════════════════════════════════ */

const THEMES = {
  unionbank: {
    id: "unionbank",
    label: "Union Bank",
    gradient: "linear-gradient(135deg, #00A2E8 0%, #006b99 100%)",
    width: 375,
    presentation: "sheet",
    logo: "/banks/unionbankng.png",
    recipient: { name: "Valentine Chinedu", bank: "UBA", last4: "0000", amount: "₦50,000.00" },
  },
  opay: {
    id: "opay",
    label: "OPay",
    gradient: "linear-gradient(135deg, #00D09E 0%, #00A37A 100%)",
    width: 414,
    presentation: "sheet",
    logo: "/banks/opayweb.png",
    recipient: { name: "Valentine Chinedu Alfred", bank: "UBA", last4: "2300", amount: "₦50,000.00" },
  },
  uba: {
    id: "uba",
    label: "UBA",
    gradient: "linear-gradient(135deg, #E51920 0%, #A31015 100%)",
    width: 400,
    presentation: "page",
    logo: "/banks/ubagroup.png",
    recipient: { name: "Valentine Chinedu Alfred", bank: "OPay", last4: "9358", amount: "₦50,000.00" },
  },
};

const FLOWS = {
  unionbank: [
    { kind: "mock", html: unionBankTransferHtml },
    { kind: "vero" },
    { kind: "mock", html: unionBankPinHtml },
    { kind: "success" },
  ],
  opay: [
    { kind: "mock", html: opayRecipientHtml },
    { kind: "mock", html: opayAmountHtml },
    { kind: "mock", html: opayWarningHtml },
    { kind: "vero" },
    { kind: "mock", html: opayConfirmHtml },
    { kind: "success" },
  ],
  uba: [
    { kind: "mock", html: ubaStep1Html },
    { kind: "mock", html: ubaStep2Html },
    { kind: "vero" },
    { kind: "success" },
  ],
};

const SCORE = 94;
const EXPLANATION = "Repeat recipient. 3 prior transfers to this account, name matches NUBAN records, and no fraud reports on file.";
const TAGS = ["Verified name match", "Repeat recipient", "0 reports"];

/* ───────────────────────────── Nav chrome ───────────────────────────── */

function NavChrome({ onBack, onExit, stepIndex, stepCount }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
      <button
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        className="pointer-events-auto w-9 h-9 rounded-full bg-ink/50 backdrop-blur text-white flex items-center justify-center text-sm font-bold"
      >
        ←
      </button>
      <div className="flex gap-1.5">
        {Array.from({ length: stepCount }).map((_, i) => (
          <span key={i} className={`w-6 h-1 rounded-full ${i <= stepIndex ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onExit(); }}
        className="pointer-events-auto w-9 h-9 rounded-full bg-ink/50 backdrop-blur text-white flex items-center justify-center text-sm font-bold"
      >
        ✕
      </button>
    </div>
  );
}

/* ───────────────────────────── Mock (bank) screen ───────────────────────────── */

function MockScreen({ html, onAdvance }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F0F4F8] cursor-pointer"
      onClickCapture={(e) => { e.preventDefault(); onAdvance(); }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ───────────────────────── Vero verdict (real app markup) ───────────────────────── */

function VeroVerdictCard({ theme, onAdvance }) {
  const r = theme.recipient;
  const filled = Math.ceil(SCORE / 20);

  return (
    <div className="bg-white flex flex-col">
      <div className="relative bg-[linear-gradient(160deg,#00C853,#00E676)] px-[26px] pt-8 pb-8 rounded-b-[32px] overflow-hidden">
        <div className="absolute -top-[50px] -right-[35px] w-[170px] h-[170px] rounded-full bg-white/10" />
        <div className="absolute -bottom-[60px] -left-[25px] w-[140px] h-[140px] rounded-full bg-white/5" />

        <div className="flex items-center justify-between relative">
          <span className="font-extrabold text-[13px] text-white tracking-[0.04em]">VERO</span>
          <span className="text-white/80 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15">Trust Check</span>
        </div>

        <div className="flex flex-col items-center mt-4 relative">
          <div className="font-bold text-[11px] tracking-[0.14em] uppercase text-white/90">Trusted</div>
          <div className="font-extrabold leading-none tracking-tight text-white mt-1.5 text-[84px]">{SCORE}</div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`w-[22px] h-[4px] rounded-[3px] bg-white ${i <= filled ? "opacity-100" : "opacity-30"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-canvas border-2 border-trust-high text-trust-high flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden">
            <img src={theme.logo} alt={r.bank} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-[15px] text-ink leading-tight">{r.name}</p>
            <p className="text-[12px] text-slate font-medium">{r.bank} · ••••{r.last4} · {r.amount}</p>
          </div>
        </div>

        <p className="text-[14px] text-ink font-medium leading-snug mb-4">{EXPLANATION}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {TAGS.map((t) => (
            <span key={t} className="text-[12px] font-medium px-3 py-1.5 rounded-xl border bg-[rgba(0,200,83,0.08)] border-[rgba(0,200,83,0.25)] text-[#008938]">
              {t}
            </span>
          ))}
        </div>

        <SlideButton label="Slide to send" onComplete={onAdvance} />
        <p className="text-center text-[12px] text-slate font-semibold mt-3 opacity-70">Report this account</p>
        <p className="text-center text-[10px] text-slate font-semibold mt-4">
          Trust check by <span className="font-bold text-ink">Vero</span> · integrated into {theme.label}
        </p>
      </div>
    </div>
  );
}

function ScanningBody() {
  return (
    <div className="p-10 bg-white flex flex-col items-center justify-center gap-4" style={{ minHeight: 280 }}>
      <span className="font-extrabold text-[15px] text-ink tracking-[0.04em]">VERO</span>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(0,200,83,0.25)" }} />
        <span className="relative w-10 h-10 rounded-full flex items-center justify-center text-white bg-trust-high">
          <Check size={20} strokeWidth={3} />
        </span>
      </div>
      <p className="text-[13px] text-slate font-semibold text-center">Vero is checking this account…</p>
    </div>
  );
}

function VeroCheckScreen({ theme, onAdvance }) {
  const [phase, setPhase] = useState("scanning");

  useEffect(() => {
    const t = setTimeout(() => setPhase("result"), 1100);
    return () => clearTimeout(t);
  }, []);

  const skip = () => phase === "scanning" && setPhase("result");

  if (theme.presentation === "sheet") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F4F8]" onClick={skip}>
        <div
          className="relative overflow-hidden rounded-[40px] border-8 border-white shadow-app"
          style={{ width: theme.width, height: 812, background: "#f8fafc" }}
        >
          <div className="absolute top-0 inset-x-0 h-[90px] rounded-b-3xl" style={{ background: theme.gradient }} />
          <div className="absolute inset-0" style={{ background: "#f8fafc", opacity: 0.55 }} />
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="absolute bottom-0 inset-x-0 rounded-t-[32px] shadow-app bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="w-10 h-1.5 rounded-full bg-hairline mx-auto mt-3 mb-1" />
            <AnimatePresence mode="wait">
              {phase === "scanning" ? (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanningBody />
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VeroVerdictCard theme={theme} onAdvance={onAdvance} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // "page" presentation — UBA-style full page with its own header chrome + progress bar
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F4F8]" onClick={skip}>
      <div className="bg-white flex flex-col shadow-app" style={{ width: theme.width, minHeight: 812, fontFamily: "'Inter', sans-serif" }}>
        <div className="px-6 py-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="w-8 h-8 flex items-center justify-center text-slate">←</div>
          <div className="text-center">
            <div className="text-[18px] font-bold text-ink">Vero Trust Check</div>
            <div className="text-[13px] text-slate font-medium mt-0.5">Step 3 of 3</div>
          </div>
          <div className="w-8 h-8" />
        </div>
        <div className="h-[3px] bg-hairline">
          <div className="h-full" style={{ width: "100%", background: theme.gradient }} />
        </div>

        <AnimatePresence mode="wait">
          {phase === "scanning" ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanningBody />
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <VeroVerdictCard theme={theme} onAdvance={onAdvance} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────────── Success screen ───────────────────────────── */

function SuccessScreen({ theme, onDone }) {
  const r = theme.recipient;
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F4F8] cursor-pointer" onClick={onDone}>
      <div
        className="overflow-hidden rounded-[40px] border-8 border-white shadow-app flex flex-col items-center"
        style={{ width: theme.width, minHeight: 812, background: "#fff" }}
      >
        <div className="w-full flex flex-col items-center justify-center pt-20 pb-10 px-6" style={{ background: theme.gradient }}>
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-5"
          >
            <Check size={36} strokeWidth={3} className="text-ink" />
          </motion.div>
          <p className="text-white font-black text-[22px]">Transfer Successful</p>
          <p className="text-white/85 font-semibold text-[14px] mt-1">{r.amount} sent</p>
        </div>
        <div className="flex-1 w-full flex flex-col items-center px-8 pt-8">
          <p className="text-[12px] text-slate font-semibold uppercase tracking-wide mb-1">Recipient</p>
          <p className="text-[16px] text-ink font-bold">{r.name}</p>
          <p className="text-[13px] text-slate font-medium mb-6">{r.bank} · ••••{r.last4}</p>
          <div className="flex items-center gap-2 bg-[rgba(0,200,83,0.1)] text-[#008938] text-[12px] font-semibold px-3 py-2 rounded-full mb-8">
            <span>🛡</span> Trust-checked by Vero before this transfer went out
          </div>
        </div>
        <div className="w-full px-6 pb-8">
          <button
            onClick={(e) => { e.stopPropagation(); onDone(); }}
            className="w-full rounded-2xl font-bold text-[15px] py-4 text-white"
            style={{ background: theme.gradient }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Picker (landing) ───────────────────────────── */

function Picker({ onPick }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-ink px-6 py-16 gap-10">
      <span className="text-white font-extrabold text-2xl tracking-[0.04em]">VERO</span>
      <div className="text-center max-w-lg">
        <p className="text-white/50 text-xs font-bold tracking-[0.2em] uppercase mb-3">In-app experience</p>
        <h1 className="text-white font-black text-3xl leading-tight">Pick a bank to see Vero, live in the transfer flow.</h1>
        <p className="text-white/50 text-sm mt-3">Tap anywhere to move through each screen. These are the bank's real mockups, with Vero's actual verdict screen dropped in right before the money moves.</p>
      </div>
      <div className="flex gap-5 flex-wrap justify-center">
        {Object.values(THEMES).map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className="w-56 rounded-3xl overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
          >
            <div className="h-24 flex items-center justify-center" style={{ background: t.gradient }}>
              <img src={t.logo} alt={t.label} className="h-9 object-contain" />
            </div>
            <div className="p-4">
              <p className="text-white font-bold text-[15px]">{t.label}</p>
              <p className="text-white/50 text-[12px] mt-1">{FLOWS[t.id].length} screens · tap to start</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function BankDemo() {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const initialBank = bankId && THEMES[bankId] ? bankId : null;
  const [bank, setBank] = useState(initialBank);
  const [stepIndex, setStepIndex] = useState(0);

  const theme = bank ? THEMES[bank] : null;

  // Arrived with a bank pre-picked (from the onboarding gate) → every exit
  // goes back to the real app, not this page's own standalone picker.
  const reset = () => {
    if (bankId) {
      navigate("/");
    } else {
      setBank(null);
      setStepIndex(0);
    }
  };

  const advance = () => {
    if (!bank) return;
    setStepIndex((i) => Math.min(i + 1, FLOWS[bank].length - 1));
  };

  const back = () => {
    if (stepIndex === 0) reset();
    else setStepIndex((i) => Math.max(i - 1, 0));
  };

  useEffect(() => {
    if (!bank) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") advance();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, stepIndex]);

  if (!bank || !theme) {
    return <Picker onPick={(id) => { setBank(id); setStepIndex(0); }} />;
  }

  const steps = FLOWS[bank];
  const step = steps[stepIndex];

  return (
    <div>
      <NavChrome onBack={back} onExit={reset} stepIndex={stepIndex} stepCount={steps.length} />
      <div key={`${bank}-${stepIndex}`} className="animate-fade-in">
        {step.kind === "mock" && <MockScreen html={step.html} onAdvance={advance} />}
        {step.kind === "vero" && <VeroCheckScreen theme={theme} onAdvance={advance} />}
        {step.kind === "success" && <SuccessScreen theme={theme} onDone={reset} />}
      </div>
    </div>
  );
}
