import { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Check, Zap, Sparkles, Award } from "lucide-react";

import PageWrapper from "../components/PageWrapper";

export default function Upgrade() {
  const { user, refreshProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setError("");
    setUpgrading(true);

    try {
      await api.post("/api/user/upgrade");
      setSuccess(true);
      await refreshProfile(); // Refresh profile state locally
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete the upgrade.");
    } finally {
      setUpgrading(false);
    }
  };

  const proFeatures = [
    "Unlimited NUBAN verifications",
    "Priority Gemini AI explanation models",
    "Real-time crowdsourced reporting lookups",
    "Access to API keys for B2B integrations",
    "Priority email and developer support"
  ];

  return (
    <PageWrapper className="px-4 py-4 md:py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-ink tracking-tight">Vero Pro</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Ensure transaction safety at scale. Never worry about daily search limits again.
        </p>
      </div>

      {success || user?.isPremium ? (
        /* Success / Active State */
        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce">
            <Award size={36} />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-2">Vero Pro Active</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Congratulations! Your account has been upgraded to the Pro tier. You now have unlimited daily NUBAN verification checks.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm font-semibold flex items-center justify-center gap-2">
            <Sparkles size={16} /> Unlimited lookups unlocked
          </div>
        </div>
      ) : (
        /* Tier Pricing Table */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-2xl mx-auto">
          {/* Free Tier */}
          <div className="bg-surface rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Free Plan</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-ink">₦0</span>
                  <span className="text-gray-400 text-xs">/ month</span>
                </div>
              </div>
              <ul className="space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-gray-400 shrink-0" />
                  <span>3 checks per day limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-gray-400 shrink-0" />
                  <span>Mod-10 Checksum validations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-gray-400 shrink-0" />
                  <span>Basic Risk explanations</span>
                </li>
              </ul>
            </div>
            <button
              disabled
              className="w-full mt-8 bg-gray-100 text-gray-400 font-semibold py-3 rounded-lg text-sm cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-surface rounded-2xl border-2 border-ink p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-ink text-surface px-4 py-1 rounded-bl-xl text-xs font-bold tracking-widest uppercase flex items-center gap-1">
              <Zap size={10} className="fill-surface animate-pulse" /> Recommended
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  Pro Plan
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-ink">₦4,999</span>
                  <span className="text-gray-400 text-xs">/ month</span>
                </div>
              </div>

              <ul className="space-y-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
                {proFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              {error && (
                <p className="text-xs text-trust-critical text-center font-medium">{error}</p>
              )}
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-ink text-surface font-semibold py-3.5 rounded-lg hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Zap size={16} className="fill-surface" />
                {upgrading ? "Upgrading..." : "1-Click Demo Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
