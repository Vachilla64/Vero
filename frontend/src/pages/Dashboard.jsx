import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import TrustScoreRing from "../components/TrustScoreRing";
import PageWrapper from "../components/PageWrapper";
import { Search, AlertTriangle, AlertCircle, ShieldCheck, Zap } from "lucide-react";

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [nuban, setNuban] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustData, setTrustData] = useState(null);
  const [error, setError] = useState("");
  const [isLimitReached, setIsLimitReached] = useState(false);
  
  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const activeRequest = useRef(null);

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!nuban || nuban.length !== 10) {
      setError("Please enter a valid 10-digit NUBAN.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setTrustData(null);
    setReportSuccess(false);
    setIsLimitReached(false);

    try {
      // Step 1: Hit API (Sub-2-second latency expected)
      const requestId = Date.now();
      activeRequest.current = requestId;

      const response = await api.post("/api/verify", {
        nuban,
        amount: Number(amount)
      });

      // Prevent race conditions
      if (activeRequest.current !== requestId) return;

      // Wait for delay or proceed instantly
      const frictionMs = response.data.score < 30 ? 5000 : 5000; // Will be fixed in T7
      setTimeout(() => {
        if (activeRequest.current === requestId) {
          setTrustData(response.data);
          setIsSubmitting(false);
          refreshProfile(); // Sync new lookup count
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
      // Let the Trust Engine handle the math dynamically on the next lookup
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

  return (
    <PageWrapper className="px-4">
      <main className="flex flex-col gap-8 pb-8">
        
        {/* Left Column: Input Form */}
        <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-ink">Verify Recipient</h2>
            {user && !user.isPremium && (
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md font-medium border border-amber-100">
                {user.lookupsRemaining} of 3 free lookups left today
              </span>
            )}
          </div>
          
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Account Number (NUBAN)</label>
              <input
                type="text"
                maxLength="10"
                value={nuban}
                onChange={(e) => {
                  setNuban(e.target.value.replace(/\D/g, ''));
                  setTrustData(null); // Clear previous results on edit
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all font-mono tracking-widest disabled:opacity-50"
                placeholder="0000000000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Transfer Amount (NGN)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all disabled:opacity-50"
                placeholder="50000"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-trust-critical text-sm rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || nuban.length !== 10 || !amount}
              className="w-full flex items-center justify-center gap-2 bg-ink text-surface font-semibold py-3.5 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={18} />
              {isSubmitting ? "Analyzing Risk..." : "Verify & Send"}
            </button>
          </form>
        </div>

        {/* Right Column: Results & Trust Ring */}
        <div className={`bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[250px] md:min-h-[400px] transition-all duration-500 ${trustData?.score < 30 ? 'bg-red-50/30' : ''}`}>
          
          {(isSubmitting || trustData) ? (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <TrustScoreRing score={trustData?.score || 0} isLoading={isSubmitting} />
              
              {trustData && !isSubmitting && (
                <div className="mt-8 text-center w-full max-w-sm">
                  {/* AI Explanation */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 relative">
                    <p className="text-sm font-medium text-ink leading-relaxed">
                      {trustData.explanation}
                    </p>
                  </div>

                  {/* High Risk Interventions */}
                  {trustData.score < 30 ? (
                    <div className="space-y-4 w-full">
                      <div className="flex items-center gap-2 text-trust-critical justify-center font-bold mb-2">
                        <AlertTriangle size={20} />
                        <span>High risk of permanent loss.</span>
                      </div>
                      <button className="w-full bg-trust-critical text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors">
                        Cancel Transfer
                      </button>
                      <button className="w-full text-xs font-medium text-gray-400 hover:text-gray-600 underline underline-offset-4 mt-2 transition-colors">
                        I accept the risk. Proceed anyway.
                      </button>
                    </div>
                  ) : (
                    <button className="w-full bg-trust-highTrust text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                      Complete Transfer
                    </button>
                  )}

                  {/* Crowdsourced Reporting Loop */}
                  <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                    {reportSuccess ? (
                      <p className="text-sm font-medium text-trust-good">Report submitted successfully.</p>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Spot something wrong?</p>
                        <select 
                          className="w-full text-sm border-gray-200 rounded-lg p-2 focus:ring-ink"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                        >
                          <option value="">Select reason...</option>
                          <option value="scam">Known Scammer</option>
                          <option value="impersonation">Impersonation</option>
                          <option value="did_not_deliver">Paid but did not deliver</option>
                          <option value="other">Other</option>
                        </select>
                        <button 
                          onClick={handleReport}
                          disabled={!reportReason || isReporting}
                          className="text-xs font-semibold text-trust-critical disabled:opacity-50 underline"
                        >
                          {isReporting ? "Submitting..." : "Flag this account"}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 flex flex-col items-center gap-4">
              <ShieldCheck size={48} className="opacity-20" />
              <p className="text-sm">Enter a NUBAN to verify its Trust Score.</p>
            </div>
          )}
        </div>
      </main>

      {/* Limit Reached Modal */}
      {isLimitReached && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface max-w-sm w-full rounded-2xl shadow-xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <Zap size={24} className="fill-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Daily Limit Reached</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You have used all 3 of your free daily checks. Upgrade to Vero Pro now to unlock unlimited instant verifications!
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/upgrade"
                onClick={() => setIsLimitReached(false)}
                className="w-full bg-ink text-surface font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all text-center text-sm"
              >
                Upgrade to Pro
              </Link>
              <button
                onClick={() => setIsLimitReached(false)}
                className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
