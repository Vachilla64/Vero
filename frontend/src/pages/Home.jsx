import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import FeedbackModal from "../components/FeedbackModal";
import { Search, ChevronDown, Building2, Bell, ShieldCheck, Zap, X, Check, QrCode, ClipboardCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Brand accents for the banks people actually pick most. /api/banks returns
// 250+ institutions, so anything unmapped falls back to a neutral chip.
const BANK_STYLES = {
  "044": { color: "text-orange-500", bg: "bg-orange-500/10" },
  "058": { color: "text-orange-600", bg: "bg-orange-600/10" },
  "057": { color: "text-red-500", bg: "bg-red-500/10" },
  "033": { color: "text-red-600", bg: "bg-red-600/10" },
  "011": { color: "text-blue-800", bg: "bg-blue-800/10" },
  "032": { color: "text-blue-400", bg: "bg-blue-400/10" },
  "50211": { color: "text-purple-600", bg: "bg-purple-600/10" },
  "100004": { color: "text-green-500", bg: "bg-green-500/10" },
  "50515": { color: "text-blue-600", bg: "bg-blue-600/10" },
  "100033": { color: "text-purple-500", bg: "bg-purple-500/10" },
};
const DEFAULT_BANK_STYLE = { color: "text-slate", bg: "bg-canvas" };
const bankStyle = (code) => BANK_STYLES[code] || DEFAULT_BANK_STYLE;

// Shown until /api/banks responds, and if it never does.
const FALLBACK_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "United Bank For Africa" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "50211", name: "Kuda Bank" },
  { code: "100004", name: "OPay" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "100033", name: "PalmPay" },
];

export default function Home() {
  const { user, refreshProfile } = useAuth();
  
  // Form state
  const [nuban, setNuban] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState(FALLBACK_BANKS[0]);
  const [banks, setBanks] = useState(FALLBACK_BANKS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustData, setTrustData] = useState(null);
  const [error, setError] = useState("");
  const [isLimitReached, setIsLimitReached] = useState(false);
  
  // UI States
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  
  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [sent, setSent] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const activeRequest = useRef(null);

  useEffect(() => {
    refreshProfile();
  }, []);

  // Live bank list from Paystack (proxied by the backend so the secret key
  // stays server-side). Keeps FALLBACK_BANKS on any failure.
  useEffect(() => {
    let cancelled = false;

    api.get("/api/banks")
      .then((res) => {
        const fetched = res.data?.banks;
        if (cancelled || !Array.isArray(fetched) || fetched.length === 0) return;
        setBanks(fetched);
        setSelectedBank((current) =>
          fetched.find((b) => b.code === current.code) || current
        );
      })
      .catch(() => {
        // FALLBACK_BANKS is already in state.
      });

    return () => { cancelled = true; };
  }, []);

  const filteredBanks = bankQuery.trim()
    ? banks.filter((b) => b.name.toLowerCase().includes(bankQuery.trim().toLowerCase()))
    : banks;

  const closeLookup = () => {
    setShowLookup(false);
    setError("");
  };

  // Pull the first 10-digit run out of whatever the user copied — bank
  // details usually arrive as a blob of text with the NUBAN buried in it.
  const handlePasteDetails = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const match = text.replace(/[\s-]/g, "").match(/\d{10}/);
      if (match) {
        setNuban(match[0]);
        setError("");
      } else {
        setError("No 10-digit account number found in your clipboard.");
      }
    } catch {
      setError("Clipboard access was blocked. Type the number instead.");
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!nuban || nuban.length !== 10) {
      setError("Please enter a valid 10-digit account number.");
      return;
    }
    const transferAmount = amount ? Number(amount) : 0;

    setIsSubmitting(true);
    setError("");
    setTrustData(null);
    setReportSuccess(false);
    setIsLimitReached(false);

    const requestId = Date.now();
    activeRequest.current = requestId;

    try {
      const response = await api.post("/api/verify", {
        nuban,
        bankCode: selectedBank.code,
        amount: transferAmount
      });

      if (activeRequest.current !== requestId) return;

      const frictionMs = response.data.score < 30 ? 3000 : 600;
      setTimeout(() => {
        if (activeRequest.current === requestId) {
          setTrustData(response.data);
          setIsSubmitting(false);
          refreshProfile(); 
        }
      }, frictionMs);

    } catch (err) {
      if (activeRequest.current === requestId) {
        if (err.response?.status === 403 && err.response?.data?.error === 'LIMIT_REACHED') {
          setIsLimitReached(true);
        } else {
          setError(err.response?.data?.error || "Failed to verify account.");
        }
        setIsSubmitting(false);
      }
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setIsReporting(true);
    setError("");

    try {
      await api.post("/api/report", {
        nuban,
        reason: reportReason
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason("");
      }, 2000);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("You have already reported this account.");
      } else {
        setError("Failed to submit report.");
      }
    } finally {
      setIsReporting(false);
    }
  };

  const clearVerdict = () => {
    setTrustData(null);
    setNuban("");
    setAmount("");
    // Back from a verdict lands on Home, not the still-open lookup sheet.
    setShowLookup(false);
  };

  const handleProceed = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setShowFeedbackModal(true);
    }, 1600);
  };
  
  const handleFeedbackSubmit = (feedback) => {
    setShowFeedbackModal(false);
    clearVerdict();
  };

  // ----------------------------------------------------
  // Default Home State (Design 7a + inline form)
  // ----------------------------------------------------
  if (!trustData) {
    return (
      <PageWrapper className="bg-canvas overflow-hidden pt-2 pb-24 relative">
        
        <div className="flex flex-col h-full px-6 relative z-0 overflow-y-auto no-scrollbar">
          
          {/* Top Header */}
          <div className="flex items-center justify-between mt-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[46px] h-[46px] rounded-[15px] bg-gradient-to-br from-[#2B3445] to-[#4A5568] flex items-center justify-center font-bold text-white text-[17px] relative">
                {user?.name?.charAt(0) || "U"}
                <div className="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] rounded-full bg-trust-high border-[2.5px] border-canvas"></div>
              </div>
              <div>
                <div className="text-[12.5px] color-slate font-semibold text-[#A0AAB2]">Welcome back 👋</div>
                <div className="text-[18px] font-bold text-ink leading-[1.1]">{user?.name?.split(' ')[0] || "User"}</div>
              </div>
            </div>
            <div className="relative w-[44px] h-[44px] rounded-[14px] bg-white flex items-center justify-center shadow-card-xs">
              <Bell className="text-ink w-[21px] h-[21px]" strokeWidth={2} />
              <div className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-risk-critical border-2 border-white"></div>
            </div>
          </div>

          {/* Vero Shield Card */}
          <div className="bg-gradient-to-br from-trust-high to-trust-good rounded-[28px] p-6 relative overflow-hidden shadow-[0_22px_44px_rgba(0,200,83,0.32)]">
            <div className="absolute -top-[50px] -right-[40px] w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),transparent_70%)]"></div>
            
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-[9px]">
                <ShieldCheck className="text-white w-[18px] h-[18px]" strokeWidth={2.2} />
                <span className="font-bold text-[11px] tracking-[0.1em] uppercase text-white/85">Vero shield · active</span>
              </div>
              <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_6px_16px_rgba(0,80,30,0.18)]">
                <img src="/vero-logo.png" alt="Vero" className="w-[26px] h-[26px] object-contain" />
              </div>
            </div>
            
            <div className="text-[26px] font-bold text-white leading-[1.3] mt-4 relative">
              You're protected. <span className="text-[#0A3D1E]">₦0</span> lost this month.
            </div>
            
            <div className="flex gap-[11px] mt-5 relative">
              <div className="flex-1 bg-white/18 rounded-[16px] p-[13px_15px]">
                <div className="text-[22px] font-extrabold text-white">38</div>
                <div className="text-[11.5px] text-white/80 font-semibold mt-px">Accounts checked</div>
              </div>
              <div className="flex-1 bg-white/18 rounded-[16px] p-[13px_15px]">
                <div className="text-[22px] font-extrabold text-white">3</div>
                <div className="text-[11.5px] text-white/80 font-semibold mt-px">Scams flagged</div>
              </div>
            </div>
          </div>

          {/* Primary action — one obvious affordance instead of an inline form */}
          <button
            type="button"
            onClick={() => setShowLookup(true)}
            className="mt-6 w-full flex items-center gap-4 bg-white rounded-[24px] p-5 text-left shadow-[0_20px_50px_rgba(43,52,69,0.06),0_4px_12px_rgba(43,52,69,0.04)] active:scale-[0.99] transition-transform"
          >
            <div className="w-12 h-12 rounded-[16px] bg-trust-high/10 flex items-center justify-center shrink-0">
              <Search size={22} className="text-trust-high" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16.5px] font-bold text-ink leading-tight">Check an account</div>
              <div className="text-[12.5px] text-slate font-semibold mt-[3px]">Enter a NUBAN before you send</div>
            </div>
            <span className="text-slate text-[20px] font-bold shrink-0">›</span>
          </button>

          {/* Recent Recipients */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-slate uppercase tracking-[0.06em]">Recent recipients</div>
              <Link to="/history" className="text-[12px] font-bold text-trust-high hover:underline">See all</Link>
            </div>

            <div className="flex gap-[11px]">
              <div className="flex-1 flex flex-col items-center gap-2 bg-white rounded-[18px] p-[15px_6px] shadow-card-xs cursor-pointer hover:shadow-card-sm transition-shadow" onClick={() => { setNuban("1000000007"); setSelectedBank(banks.find(b => b.code === "032") || selectedBank); setShowLookup(true); }}>
                <div className="w-[46px] h-[46px] rounded-[14px] bg-canvas flex items-center justify-center font-bold text-trust-high text-[17px] border-[2.5px] border-trust-high">A</div>
                <div className="text-[12px] font-bold text-ink">Adaeze</div>
                <div className="text-[11px] font-extrabold text-trust-high">92</div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2 bg-white rounded-[18px] p-[15px_6px] shadow-card-xs cursor-pointer hover:shadow-card-sm transition-shadow" onClick={() => { setNuban("9876543210"); setSelectedBank(banks.find(b => b.code === "058") || selectedBank); setShowLookup(true); }}>
                <div className="w-[46px] h-[46px] rounded-[14px] bg-canvas flex items-center justify-center font-bold text-risk-neutral text-[17px] border-[2.5px] border-risk-neutral">B</div>
                <div className="text-[12px] font-bold text-ink">Blessing</div>
                <div className="text-[11px] font-extrabold text-risk-neutral">54</div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2 bg-white rounded-[18px] p-[15px_6px] shadow-card-xs cursor-pointer hover:shadow-card-sm transition-shadow" onClick={() => { setNuban("0987654321"); setShowLookup(true); }}>
                <div className="w-[46px] h-[46px] rounded-[14px] bg-canvas flex items-center justify-center font-bold text-risk-critical text-[17px] border-[2.5px] border-risk-critical">C</div>
                <div className="text-[12px] font-bold text-ink">Chidi</div>
                <div className="text-[11px] font-extrabold text-risk-critical">12</div>
              </div>
            </div>

            {/* Pro Banner */}
            {!user?.isPremium && (
              <Link to="/upgrade" className="flex items-center gap-[12px] bg-[linear-gradient(120deg,rgba(255,195,0,0.1),rgba(255,138,0,0.06))] border border-[rgba(255,195,0,0.25)] rounded-[18px] p-[14px_16px] mt-[14px]">
                <div className="w-[38px] h-[38px] rounded-[12px] bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(255,195,0,0.2)]">
                  <Zap size={19} className="text-risk-high fill-risk-high" />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold text-ink">Unlock Vero Pro</div>
                  <div className="text-[11.5px] text-[#8A6D00] font-semibold">Unlimited checks · priority alerts</div>
                </div>
                <span className="text-risk-high text-[16px] font-extrabold">›</span>
              </Link>
            )}
          </div>
        </div>

        {/* Lookup sheet — slides up over Home (design 7b) */}
        <AnimatePresence>
          {showLookup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLookup}
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 34, stiffness: 340 }}
                className="absolute inset-0 z-50 bg-canvas rounded-t-[32px] flex flex-col overflow-y-auto no-scrollbar"
              >
                <div className="flex items-center justify-between px-6 pt-4 pb-1 shrink-0">
                  <div className="w-9" />
                  <div className="w-10 h-1 rounded-full bg-slate/25" />
                  <button
                    type="button"
                    onClick={closeLookup}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate shadow-card-xs"
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="px-6 pb-10">
                  <div className="mt-3 mb-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-trust-high">Verify before you send</div>
                    <div className="text-[23px] font-bold text-ink leading-[1.25] mt-2">Who are you paying?</div>
                  </div>

          <form
            onSubmit={handleVerify}
            className="flex flex-col gap-3 relative z-0"
          >
            <div className="flex flex-col gap-3 bg-white rounded-[26px] p-[22px] shadow-[0_20px_50px_rgba(43,52,69,0.06),0_4px_12px_rgba(43,52,69,0.04)]">

              <div className="flex flex-col gap-3">
                  
                  {/* Bank Selector Button */}
                  <div 
                    onClick={() => setShowBankSelector(true)}
                    className="flex items-center justify-between bg-canvas rounded-2xl p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${bankStyle(selectedBank.code).bg} ${bankStyle(selectedBank.code).color}`}>
                        <Building2 size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate uppercase tracking-wider mb-[2px]">Bank</span>
                        <span className="text-ink font-bold text-[15px] leading-none">{selectedBank.name}</span>
                      </div>
                    </div>
                    <ChevronDown size={20} className="text-slate" />
                  </div>

                  {/* NUBAN Input */}
                  <div className="flex items-center gap-3 bg-canvas rounded-2xl p-3">
                    <Search size={18} className="text-slate shrink-0" />
                    <div className="flex flex-col flex-1">
                      <span className="text-[11px] font-bold text-slate uppercase tracking-wider mb-[2px]">NUBAN</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength="10"
                        value={nuban}
                        onChange={(e) => setNuban(e.target.value.replace(/\D/g, ''))}
                        placeholder="0123456789"
                        className="w-full bg-transparent outline-none text-ink font-bold text-[15.5px] placeholder-slate/70 leading-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="flex items-center gap-3 bg-canvas rounded-2xl p-3">
                    <span className="text-slate text-lg font-medium pl-1">₦</span>
                    <div className="flex flex-col flex-1">
                      <span className="text-[11px] font-bold text-slate uppercase tracking-wider mb-[2px]">Amount (optional)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="45,000"
                        className="w-full bg-transparent outline-none text-ink font-bold text-[15.5px] placeholder-slate/70 leading-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-risk-critical/10 border border-risk-critical/20 text-risk-critical text-sm rounded-xl font-medium animate-fade-in mt-1">
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  {isSubmitting ? (
                    <button disabled className="w-full bg-ink text-white font-semibold py-4 rounded-full mt-2 opacity-70 flex items-center justify-center gap-2.5 shadow-app">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      Analyzing Risk...
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={nuban.length !== 10}
                      className={`w-full font-semibold py-[17px] rounded-full mt-2 transition-all duration-300 ${
                        nuban.length === 10 
                        ? 'bg-trust-high text-white shadow-[0_12px_28px_rgba(0,200,83,0.28)]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
                      }`}
                    >
                      Verify Account
                    </button>
                  )}
                  
                </div>
            </div>
          </form>

                  {/* Faster ways (design 7b) */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-hairline" />
                    <span className="text-[11px] font-bold tracking-[0.04em] text-slate">FASTER WAYS</span>
                    <div className="flex-1 h-px bg-hairline" />
                  </div>

                  <div className="flex gap-3">
                    {/* No scanner implemented yet — labelled rather than dead */}
                    <div className="flex-1 flex flex-col gap-2 bg-white rounded-[18px] p-4 shadow-card-xs opacity-55">
                      <QrCode size={22} className="text-ink" strokeWidth={2.1} />
                      <div className="text-[13.5px] font-bold text-ink">Scan QR</div>
                      <div className="text-[11.5px] text-slate font-semibold leading-snug">Coming soon</div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePasteDetails}
                      className="flex-1 flex flex-col gap-2 bg-white rounded-[18px] p-4 shadow-card-xs text-left active:scale-[0.99] transition-transform"
                    >
                      <ClipboardCheck size={22} className="text-ink" strokeWidth={2.1} />
                      <div className="text-[13.5px] font-bold text-ink">Paste details</div>
                      <div className="text-[11.5px] text-slate font-semibold leading-snug">From your clipboard</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bank Selector Bottom Sheet */}
        {showBankSelector && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowBankSelector(false)} />
            <div className="bg-surface w-full max-w-md h-[70vh] sm:h-auto sm:max-h-[70vh] sm:rounded-[24px] rounded-t-[32px] flex flex-col p-0 shadow-app relative animate-fade-in z-10 overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                <div className="font-bold text-[16px] text-ink">Select Bank</div>
                <button onClick={() => { setShowBankSelector(false); setBankQuery(""); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate hover:bg-gray-200">
                  <X size={18} />
                </button>
              </div>

              {/* 250+ institutions come back from /api/banks — searching is not optional */}
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2.5 bg-canvas rounded-2xl px-3.5 py-3">
                  <Search size={17} className="text-slate shrink-0" />
                  <input
                    type="text"
                    value={bankQuery}
                    onChange={(e) => setBankQuery(e.target.value)}
                    placeholder="Search banks"
                    autoFocus
                    className="w-full bg-transparent outline-none text-ink font-semibold text-[14.5px] placeholder-slate/70"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-4 flex flex-col gap-2 no-scrollbar">
                {filteredBanks.length === 0 && (
                  <div className="text-center text-slate font-semibold text-[13.5px] py-8">
                    No bank matches “{bankQuery}”.
                  </div>
                )}
                {filteredBanks.map(bank => (
                  <div 
                    key={bank.code}
                    onClick={() => {
                      setSelectedBank(bank);
                      setShowBankSelector(false);
                      setBankQuery("");
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${selectedBank.code === bank.code ? 'bg-white shadow-card-xs border border-gray-100' : 'hover:bg-white/50 border border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${bankStyle(bank.code).bg} ${bankStyle(bank.code).color}`}>
                      <Building2 size={18} />
                    </div>
                    <span className={`font-bold text-[15px] ${selectedBank.code === bank.code ? 'text-ink' : 'text-slate'}`}>
                      {bank.name}
                    </span>
                    {selectedBank.code === bank.code && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-trust-high text-white flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Limit Reached Modal */}
        {isLimitReached && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-surface max-w-sm w-full rounded-[24px] shadow-app p-6 text-center">
              <div className="w-12 h-12 bg-risk-neutral/10 text-risk-neutral rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={24} className="fill-risk-neutral" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Daily Limit Reached</h3>
              <p className="text-slate text-sm mb-6 font-medium">
                You have used all your free daily checks. Upgrade to Vero Pro now to unlock unlimited instant verifications!
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/upgrade" className="w-full bg-trust-high text-white font-semibold py-4 rounded-full shadow-[0_12px_28px_rgba(0,200,83,0.28)]">
                  Upgrade to Pro
                </Link>
                <button onClick={() => setIsLimitReached(false)} className="w-full text-slate font-semibold py-3 mt-1">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    );
  }

  // ----------------------------------------------------
  // Verdict Screens (2a, 6a, 6b, 6c) -> Needs update to Card styles (8a, 8b, 8c) or Hero?
  // Let's use the Hero styles as designed in 6a, 6b, 6c for now. (Or update to match 8a, 8b, 8c if requested, but Hero is good).
  // ----------------------------------------------------
  let heroGradient = "bg-[linear-gradient(160deg,#00C853,#00E676)]";
  let statusText = "Trusted";
  let statusColor = "text-white";
  let fgColor = "text-white";
  let btnStyle = "bg-white text-trust-high shadow-[0_12px_28px_rgba(255,255,255,0.3)]";
  let avatarBg = "bg-canvas";
  let avatarColor = "text-trust-high";
  
  const score = trustData.score;
  const isUnverified = trustData.flags.includes("unknown_account");
  
  if (isUnverified) {
    heroGradient = "bg-[linear-gradient(160deg,#2B3445,#4A5568)]";
    statusText = "Unverified";
    fgColor = "text-white";
    btnStyle = "bg-[#2B3445] text-white";
    avatarColor = "text-slate";
    statusColor = "text-white";
  } else if (score < 30) {
    heroGradient = "bg-[linear-gradient(160deg,#FF4B4B,#FF7A7A)]";
    statusText = "High risk";
    fgColor = "text-white";
    btnStyle = "bg-risk-critical text-white shadow-[0_12px_28px_rgba(255,75,75,0.3)]";
    avatarColor = "text-risk-critical";
    statusColor = "text-white";
  } else if (score < 70) {
    heroGradient = "bg-[linear-gradient(160deg,#FFC300,#FFD84D)]";
    statusText = "Caution";
    fgColor = "text-[#7A5D00]";
    statusColor = "text-[#7A5D00]";
    btnStyle = "bg-risk-neutral text-[#7A5D00] shadow-[0_12px_28px_rgba(255,195,0,0.3)]";
    avatarColor = "text-risk-neutral";
  }

  return (
    <PageWrapper className="bg-white overflow-hidden p-0 !pt-0">
      <style>{`#bottom-nav { display: none !important; }`}</style>
      
      {sent && (
        <div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-[24px] px-8 py-7 flex flex-col items-center gap-3 shadow-app mx-6">
            <div className="w-14 h-14 rounded-full bg-trust-high text-white flex items-center justify-center">
              <Check size={28} strokeWidth={3} />
            </div>
            <div className="font-bold text-[16px] text-ink">Transfer confirmed</div>
            <div className="text-slate text-[13px] font-medium">Saved to your history</div>
          </div>
        </div>
      )}
      
      <div className={`relative ${heroGradient} px-[30px] pb-[40px] rounded-b-[40px] overflow-hidden`}>
        {/* Decorative Circles */}
        <div className={`absolute -top-[60px] -right-[40px] w-[200px] h-[200px] rounded-full bg-white/10`}></div>
        <div className={`absolute -bottom-[70px] -left-[30px] w-[160px] h-[160px] rounded-full bg-white/5`}></div>
        
        {/* Nav */}
        <div className="flex items-center justify-between relative pt-12">
          <button onClick={clearVerdict} className={`font-semibold text-[15px] ${fgColor} opacity-85`}>‹ Back</button>
          <div className="flex items-center gap-2">
            <div className={`font-extrabold text-[15px] tracking-[0.04em] ${fgColor}`}>VERO</div>
          </div>
          <div className={`font-bold text-[22px] ${fgColor} opacity-85`}>⋯</div>
        </div>

        {/* Hero Score */}
        <div className="flex flex-col items-center mt-5 relative">
          <div className={`font-bold text-[12px] tracking-[0.14em] uppercase ${statusColor} opacity-90`}>{statusText}</div>
          <div className={`font-extrabold leading-[1] tracking-[-0.03em] ${statusColor} mt-[6px] ${isUnverified ? 'text-[64px] py-9' : 'text-[120px]'}`}>
            {isUnverified ? "No data" : score}
          </div>
          
          {/* Mock progress bar segments */}
          {!isUnverified && (
            <div className="flex gap-1 mt-[6px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`w-[26px] h-[5px] rounded-[3px] bg-current ${i <= Math.ceil(score/20) ? 'opacity-100' : 'opacity-30'} ${statusColor}`}></span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-[28px_30px_30px]">
        <div className="flex items-center gap-[12px] mb-[22px]">
          <div className={`w-[52px] h-[52px] rounded-[16px] ${avatarBg} border-[2.5px] border-current flex items-center justify-center font-bold text-[20px] ${avatarColor}`}>
            {trustData.accountName ? trustData.accountName.charAt(0) : "?"}
          </div>
          <div>
            <div className="font-bold text-[19px] text-ink">{trustData.accountName || "Name not on file"}</div>
            <div className="text-[14px] text-slate font-medium">{selectedBank.name} · ••••{nuban.slice(-4)}</div>
          </div>
        </div>

        <div className="text-[16px] font-medium text-ink leading-[1.5] mb-[20px]">
          {trustData.explanation}
        </div>

        {/* Breakdown Tags */}
        <div className="flex flex-wrap gap-[8px] mb-auto">
          {trustData.breakdown && trustData.breakdown.filter(b => b.points !== 0 && b.points !== 100 && b.signal !== 'score_clamped').map((b, i) => {
            let tagClass = "bg-surface border-hairline text-ink";
            if (b.points < -20) tagClass = "bg-[rgba(255,75,75,0.1)] border-[rgba(255,75,75,0.25)] text-[#B02A2A]";
            else if (b.points < 0) tagClass = "bg-[rgba(255,195,0,0.1)] border-[rgba(255,195,0,0.25)] text-[#8A6D00]";
            
            return (
              <span key={i} className={`font-medium text-[13px] px-[14px] py-[8px] rounded-[12px] border ${tagClass}`}>
                {b.reason}
              </span>
            );
          })}
          {isUnverified && <span className="font-medium text-[13px] px-[14px] py-[8px] rounded-[12px] border bg-surface border-hairline text-ink">New to Vero</span>}
        </div>

        <div className="mt-[24px]">
          {score < 30 ? (
            <button onClick={() => setShowReportModal(true)} className={`w-full font-semibold py-[17px] rounded-full text-[16px] border-none ${btnStyle}`}>
              Report this account
            </button>
          ) : (
            <button onClick={handleProceed} className={`w-full font-semibold py-[17px] rounded-full text-[16px] border-none ${btnStyle} flex items-center justify-center gap-3`}>
              {score >= 70 ? (
                <>Slide to send</> // Note: UI simplified for now to match 6a/b/c exactly which just has text
              ) : isUnverified ? "Proceed carefully" : "Proceed with caution"}
            </button>
          )}

          <button
            onClick={score < 30 ? handleProceed : () => setShowReportModal(true)}
            className="w-full text-center mt-[14px] text-slate font-semibold text-[13px]"
          >
            {score < 30 ? "Send anyway" : "Report this account"}
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4">
          <div className="bg-surface w-full max-w-md h-[85vh] sm:h-auto sm:rounded-[24px] rounded-t-[32px] flex flex-col p-6 shadow-app">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setShowReportModal(false)} className="text-slate font-semibold text-[15px]">‹ Back</button>
              <div className="font-bold text-[15px] text-ink">Report account</div>
              <div className="w-8"></div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-2xl p-3.5 mb-5 shadow-card-xs">
              <div className={`w-[42px] h-[42px] rounded-[16px] ${avatarBg} border-[2.5px] border-current flex items-center justify-center font-bold text-[20px] ${avatarColor}`}>{trustData.accountName ? trustData.accountName.charAt(0) : "?"}</div>
              <div>
                <div className="font-bold text-[15px] text-ink">{trustData.accountName || "Name not on file"}</div>
                <div className="text-[12.5px] text-slate font-medium">{selectedBank.name} · ••••{nuban.slice(-4)}</div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate uppercase tracking-widest mb-3 mt-2">What happened?</div>
            <div className="flex flex-col gap-2 mb-5">
              {[
                { id: "scam", label: "Fake vendor / paid, never delivered" },
                { id: "impersonation", label: "Impersonating a business" },
                { id: "phishing", label: "Phishing / fake payment link" },
                { id: "other", label: "Something else" }
              ].map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => setReportReason(opt.id)}
                  className={`flex items-center justify-between rounded-xl p-3.5 cursor-pointer border-[1.5px] bg-white ${
                    reportReason === opt.id ? 'border-risk-critical' : 'border-gray-200'
                  }`}
                >
                  <span className="font-semibold text-[14.5px] text-ink">{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    reportReason === opt.id ? 'bg-risk-critical text-white' : 'border-[1.5px] border-gray-200'
                  }`}>
                    {reportReason === opt.id && <span className="text-xs">✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-bold text-slate uppercase tracking-widest mb-3 mt-auto">Proof (optional but helps)</div>
            <div className="border-[1.5px] border-dashed border-gray-300 rounded-2xl p-5 text-center text-slate font-semibold text-[13px] bg-white cursor-pointer hover:bg-gray-50">
              + Add screenshot or receipt
            </div>

            {error && <div className="text-risk-critical text-sm text-center font-medium mt-4">{error}</div>}
            
            <div className="mt-5">
              <button 
                onClick={handleReport}
                disabled={!reportReason || isReporting}
                className="w-full bg-ink text-white font-semibold py-4 rounded-full text-[16px] disabled:opacity-50"
              >
                {isReporting ? "Submitting..." : reportSuccess ? "Submitted!" : "Submit report"}
              </button>
              <div className="text-center mt-3 text-slate text-[12px] font-medium leading-relaxed px-4">
                Reports are reviewed and shared across the network to protect others.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <FeedbackModal 
            isOpen={showFeedbackModal} 
            onClose={() => handleFeedbackSubmit(null)} 
            onSubmit={handleFeedbackSubmit} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
