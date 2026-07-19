import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import { Search, AlertTriangle, AlertCircle, ShieldCheck, Zap, X } from "lucide-react";

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [nuban, setNuban] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustData, setTrustData] = useState(null);
  const [error, setError] = useState("");
  const [isLimitReached, setIsLimitReached] = useState(false);
  
  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const activeRequest = useRef(null);

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!nuban || nuban.length !== 10) {
      setError("Please enter a valid 10-digit NUBAN.");
      return;
    }
    // Amount is optional in the new design (4a), but we might still need it for the backend API. We can default it to 0 if not provided.
    const transferAmount = amount ? Number(amount) : 0;

    setIsSubmitting(true);
    setError("");
    setTrustData(null);
    setReportSuccess(false);
    setIsLimitReached(false);

    try {
      const requestId = Date.now();
      activeRequest.current = requestId;

      const response = await api.post("/api/verify", {
        nuban,
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
  };

  // 4a: Home / Search state
  if (!trustData) {
    return (
      <PageWrapper className="bg-surface overflow-hidden pt-12 pb-20">
        <div className="flex flex-col h-full px-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-extrabold text-[17px] text-ink tracking-wider">VERO</div>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-ink text-sm shadow-card-xs">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
          
          <div className="text-[22px] font-bold text-ink leading-tight mb-5">
            Check an account<br/>before you send.
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card-sm">
              <span className="text-secondary text-lg font-medium">⌕</span>
              <input 
                type="text" 
                maxLength="10"
                value={nuban}
                onChange={(e) => setNuban(e.target.value.replace(/\D/g, ''))}
                placeholder="Account number or @username"
                className="flex-1 bg-transparent outline-none text-ink font-medium text-[15px] placeholder-secondary"
                disabled={isSubmitting}
              />
            </div>
            {/* Amount Input (Optional) */}
            {nuban.length === 10 && (
              <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card-sm animate-fade-in">
                <span className="text-secondary text-lg font-medium">₦</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (Optional)"
                  className="flex-1 bg-transparent outline-none text-ink font-medium text-[15px] placeholder-secondary"
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-trust-red/10 border border-trust-red/20 text-trust-red text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            {isSubmitting ? (
              <button disabled className="w-full bg-ink text-white font-semibold py-4 rounded-full mt-4 opacity-70">
                Analyzing Risk...
              </button>
            ) : (
              nuban.length === 10 && (
                <button type="submit" className="w-full bg-trust-green text-white font-semibold py-4 rounded-full mt-4 shadow-btn-green animate-fade-in">
                  Verify Account
                </button>
              )
            )}
          </form>

          <div className="text-[11px] font-bold text-secondary uppercase tracking-widest mt-7 mb-3">Recent</div>
          <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Fake recent data to match 4a design */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card-xs cursor-pointer" onClick={() => { setNuban("0123456789"); }}>
              <div className="w-[42px] h-[42px] rounded-xl bg-surface flex items-center justify-center font-bold text-trust-green text-base relative">
                A
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-trust-green border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-ink">Adaeze Okafor</div>
                <div className="text-[12.5px] text-secondary font-medium">GTBank · ••••4821</div>
              </div>
              <div className="text-[13px] font-bold text-trust-green">92</div>
            </div>
            
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card-xs cursor-pointer" onClick={() => { setNuban("0987654321"); }}>
              <div className="w-[42px] h-[42px] rounded-xl bg-surface flex items-center justify-center font-bold text-trust-amber text-base relative">
                B
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-trust-amber border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-ink">Blessing Eze</div>
                <div className="text-[12.5px] text-secondary font-medium">Kuda · ••••1902</div>
              </div>
              <div className="text-[13px] font-bold text-trust-amber">54</div>
            </div>
          </div>
        </div>

        {/* Limit Reached Modal */}
        {isLimitReached && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-surface max-w-sm w-full rounded-[24px] shadow-app p-6 text-center">
              <div className="w-12 h-12 bg-trust-amber/10 text-trust-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={24} className="fill-trust-amber" />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-2">Daily Limit Reached</h3>
              <p className="text-secondary text-sm mb-6 font-medium">
                You have used all your free daily checks. Upgrade to Vero Pro now to unlock unlimited instant verifications!
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/upgrade" className="w-full bg-trust-green text-white font-semibold py-4 rounded-full shadow-btn-green">
                  Upgrade to Pro
                </Link>
                <button onClick={() => setIsLimitReached(false)} className="w-full text-secondary font-semibold py-3 mt-1">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    );
  }

  // Verdict Screens (2a, 6a, 6b, 6c)
  let heroGradient = "bg-gradient-to-br from-trust-green to-trust-greenLight";
  let statusText = "Trusted";
  let statusColor = "text-white";
  let fgColor = "text-white";
  let btnStyle = "bg-trust-green shadow-btn-green text-white";
  let avatarBg = "bg-surface";
  let avatarColor = "text-trust-green";
  
  const score = trustData.score;
  const isUnverified = trustData.flags.includes("unknown_account");
  
  if (isUnverified) {
    heroGradient = "bg-gradient-to-br from-ink to-gray-600";
    statusText = "Unverified";
    fgColor = "text-white";
    btnStyle = "bg-ink text-white shadow-app";
    avatarColor = "text-secondary";
  } else if (score < 30) {
    heroGradient = "bg-gradient-to-br from-trust-red to-red-400";
    statusText = "High risk";
    fgColor = "text-white";
    btnStyle = "bg-trust-red text-white shadow-btn-red";
    avatarColor = "text-trust-red";
  } else if (score < 70) {
    heroGradient = "bg-gradient-to-br from-trust-amber to-yellow-300";
    statusText = "Caution";
    fgColor = "text-amber-900";
    statusColor = "text-amber-900";
    btnStyle = "bg-trust-amber text-amber-900 shadow-btn-amber";
    avatarColor = "text-trust-amber";
  }

  return (
    <PageWrapper className="bg-white overflow-hidden p-0 !pt-0">
      <div className={`relative ${heroGradient} px-7 pb-10 rounded-b-[40px] overflow-hidden`}>
        {/* Decorative Circles */}
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/10"></div>
        
        {/* Nav */}
        <div className="flex items-center justify-between relative pt-12">
          <button onClick={clearVerdict} className={`font-semibold text-[15px] ${fgColor} opacity-80`}>‹ Back</button>
          <div className={`font-extrabold text-[15px] tracking-wider ${fgColor}`}>VERO</div>
          <div className={`font-bold text-[22px] ${fgColor} opacity-80`}>⋯</div>
        </div>

        {/* Hero Score */}
        <div className="flex flex-col items-center mt-5 relative">
          <div className={`font-bold text-[12px] tracking-[0.14em] uppercase ${statusColor} opacity-90`}>{statusText}</div>
          <div className={`font-extrabold text-[120px] leading-none tracking-tight ${statusColor} mt-2`}>
            {isUnverified ? "No data" : score}
          </div>
          
          {/* Mock progress bar segments */}
          {!isUnverified && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`w-[26px] h-[5px] rounded-[3px] ${fgColor} ${i <= Math.ceil(score/20) ? 'opacity-100' : 'opacity-30'}`}></span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-7 pt-7 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-[52px] h-[52px] rounded-2xl ${avatarBg} flex items-center justify-center font-bold text-[20px] ${avatarColor}`}>
            {isUnverified ? "?" : (trustData.accountName ? trustData.accountName.charAt(0) : "U")}
          </div>
          <div>
            <div className="font-bold text-[19px] text-ink">{trustData.accountName || "Unknown User"}</div>
            <div className="text-[14px] text-secondary font-medium">Bank · ••••{nuban.slice(-4)}</div>
          </div>
        </div>

        <div className="text-[16px] font-medium text-ink leading-relaxed mb-5">
          {trustData.explanation}
        </div>

        {/* Breakdown Tags */}
        <div className="flex flex-wrap gap-2 mb-auto">
          {trustData.breakdown && trustData.breakdown.filter(b => b.points !== 0 && b.points !== 100 && b.signal !== 'score_clamped').map((b, i) => (
            <span key={i} className={`font-semibold text-[13px] px-3.5 py-2 rounded-xl ${
              b.points < -20 ? 'bg-trust-red/10 text-trust-red border border-trust-red/20' :
              b.points < 0 ? 'bg-trust-amber/10 text-amber-700 border border-trust-amber/20' :
              'bg-surface border border-gray-200 text-ink'
            }`}>
              {b.reason}
            </span>
          ))}
          {isUnverified && <span className="font-semibold text-[13px] px-3.5 py-2 rounded-xl bg-surface border border-gray-200 text-ink">New to Vero</span>}
        </div>

        <div className="mt-8">
          {score < 30 ? (
            <button onClick={() => setShowReportModal(true)} className={`w-full font-semibold py-4 rounded-full text-[16px] ${btnStyle}`}>
              Report this account
            </button>
          ) : (
            <button className={`w-full font-semibold py-4 rounded-full text-[16px] ${btnStyle} flex items-center justify-center gap-3`}>
              {score >= 70 ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-white text-trust-green flex items-center justify-center text-xl pb-0.5">›</div>
                  Slide to send
                </>
              ) : isUnverified ? "Proceed carefully" : "Proceed with caution"}
            </button>
          )}
          
          <button onClick={() => setShowReportModal(true)} className="w-full text-center mt-4 text-secondary font-semibold text-[13px]">
            {score < 30 ? "Send anyway" : "Report this account"}
          </button>
        </div>
      </div>

      {/* 4b: Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4">
          <div className="bg-surface w-full max-w-md h-[85vh] sm:h-auto sm:rounded-[24px] rounded-t-[32px] flex flex-col p-6 shadow-app">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setShowReportModal(false)} className="text-secondary font-semibold text-[15px]">‹ Back</button>
              <div className="font-bold text-[15px] text-ink">Report account</div>
              <div className="w-8"></div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-2xl p-3.5 mb-5 shadow-card-xs">
              <div className="w-[42px] h-[42px] rounded-xl bg-surface flex items-center justify-center font-bold text-trust-red text-[16px]">C</div>
              <div>
                <div className="font-bold text-[15px] text-ink">Unknown User</div>
                <div className="text-[12.5px] text-secondary font-medium">Bank · ••••{nuban.slice(-4)}</div>
              </div>
            </div>

            <div className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-3 mt-2">What happened?</div>
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
                    reportReason === opt.id ? 'border-trust-red' : 'border-gray-200'
                  }`}
                >
                  <span className="font-semibold text-[14.5px] text-ink">{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    reportReason === opt.id ? 'bg-trust-red text-white' : 'border-[1.5px] border-gray-200'
                  }`}>
                    {reportReason === opt.id && <span className="text-xs">✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-3 mt-auto">Proof (optional but helps)</div>
            <div className="border-[1.5px] border-dashed border-gray-300 rounded-2xl p-5 text-center text-secondary font-semibold text-[13px] bg-white cursor-pointer hover:bg-gray-50">
              + Add screenshot or receipt
            </div>

            {error && <div className="text-trust-red text-sm text-center font-medium mt-4">{error}</div>}
            
            <div className="mt-5">
              <button 
                onClick={handleReport}
                disabled={!reportReason || isReporting}
                className="w-full bg-ink text-white font-semibold py-4 rounded-full text-[16px] disabled:opacity-50"
              >
                {isReporting ? "Submitting..." : reportSuccess ? "Submitted!" : "Submit report"}
              </button>
              <div className="text-center mt-3 text-secondary text-[12px] font-medium leading-relaxed px-4">
                Reports are reviewed and shared across the network to protect others.
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
