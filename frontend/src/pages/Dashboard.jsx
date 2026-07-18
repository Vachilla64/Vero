import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TrustScoreRing from "../components/TrustScoreRing";
import { Search, LogOut, AlertTriangle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [nuban, setNuban] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustData, setTrustData] = useState(null);
  const [error, setError] = useState("");
  
  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const activeRequest = useRef(null);

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

    try {
      // Step 1: Hit API (Sub-2-second latency expected)
      const requestId = Date.now();
      activeRequest.current = requestId;

      const response = await axios.post("http://localhost:8080/api/verify", {
        nuban,
        amount: Number(amount)
      });

      // Prevent race conditions
      if (activeRequest.current !== requestId) return;

      // Step 2: Artificial 5-second cognitive friction delay
      setTimeout(() => {
        if (activeRequest.current === requestId) {
          setTrustData(response.data);
          setIsSubmitting(false);
        }
      }, 5000);

    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.error || "Verification failed. Please try again.");
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setIsReporting(true);
    setError("");

    try {
      await axios.post("http://localhost:8080/api/report", {
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
    <div className="min-h-screen bg-canvas p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Vero</h1>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-gray-600">Signed in as {user?.name}</span>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-ink hover:text-gray-600 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-ink mb-6">Verify Recipient</h2>
          
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
        <div className={`bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] transition-all duration-500 ${trustData?.score < 30 ? 'bg-red-50/30' : ''}`}>
          
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
    </div>
  );
}
