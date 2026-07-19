import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

import PageWrapper from "../components/PageWrapper";

export default function Upgrade() {
  const { user, refreshProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    "Unlimited daily lookups",
    "Priority fraud alerts",
    "Full lookup history & export",
    "Ad-free, priority support"
  ];

  return (
    <PageWrapper className="bg-canvas min-h-screen font-poppins">
      <div className="flex flex-col flex-1 px-[26px] pb-[26px] pt-4 max-w-md mx-auto w-full min-h-[calc(100vh-60px)]">
        
        <div className="flex items-center justify-start mb-[18px]">
          <Link to="/settings" className="text-secondary text-[15px] font-semibold no-underline">‹ Back</Link>
        </div>

        {success || user?.isPremium ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-12 animate-fade-in">
            <div className="w-[80px] h-[80px] rounded-full bg-[rgba(255,195,0,0.15)] flex items-center justify-center text-[40px] mb-6">⚡</div>
            <h3 className="text-[24px] font-bold text-ink mb-2">Vero Pro Active</h3>
            <p className="text-secondary text-[14px] font-medium leading-relaxed max-w-[260px]">
              You now have unlimited daily verifications and priority alerts.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-10 bg-surface border border-gray-200 text-ink font-bold py-3 px-8 rounded-[14px] shadow-sm text-[14px]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="text-center">
              <span className="bg-[rgba(255,195,0,0.14)] text-[#8A6D00] font-extrabold tracking-[0.04em] text-[11px] uppercase py-1.5 px-3.5 rounded-xl">
                Vero Pro
              </span>
              <div className="text-[25px] font-extrabold text-ink leading-[1.25] mt-[14px]">Never guess again.</div>
              <div className="text-[14px] text-secondary font-medium leading-[1.5] mt-1.5 px-2">
                Unlimited verifications, priority alerts, zero interruptions.
              </div>
            </div>

            <div className="flex flex-col gap-[10px] my-[24px]">
              {proFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-[12px] bg-surface rounded-[14px] p-[13px] px-[15px] shadow-[0_4px_10px_rgba(43,52,69,0.02)]">
                  <span className="text-[#00C853] font-extrabold">✓</span>
                  <span className="text-[14px] font-semibold text-ink">{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex bg-[#EEF1F5] rounded-[14px] p-1 mb-[18px]">
              <div className="flex-1 text-center py-[9px] rounded-[11px] bg-surface shadow-[0_4px_10px_rgba(43,52,69,0.06)] text-[13px] font-bold text-ink">
                Monthly · ₦2,500
              </div>
              <div className="flex-1 text-center py-[9px] rounded-[11px] text-[13px] font-semibold text-secondary">
                Annual · ₦24,000
              </div>
            </div>

            {error && (
              <div className="mb-4 text-center text-trust-critical text-[13px] font-medium">
                {error}
              </div>
            )}

            <div className="mt-auto pt-4">
              <button 
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-[#00C853] text-white font-bold py-[17px] rounded-full text-[16px] shadow-[0_12px_28px_rgba(0,200,83,0.28)] transition-transform active:scale-[0.98]"
              >
                {upgrading ? "Upgrading..." : "Upgrade to Pro"}
              </button>
              <div 
                onClick={() => navigate('/settings')}
                className="text-center mt-3 text-secondary text-[13px] font-semibold cursor-pointer py-2 hover:text-ink transition-colors"
              >
                Maybe later
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
