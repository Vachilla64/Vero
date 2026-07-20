import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/PageWrapper";
import { ShieldCheck, Search, ChevronRight, Zap } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dummy data for recent recipients
  const recentRecipients = [
    { initial: "A", name: "Adaeze", score: 92, bg: "bg-surface", color: "text-trust-high", scoreBg: "bg-trust-high/10" },
    { initial: "B", name: "Blessing", score: 54, bg: "bg-surface", color: "text-risk-neutral", scoreBg: "bg-risk-neutral/10" },
    { initial: "C", name: "Chidi", score: 12, bg: "bg-surface", color: "text-risk-critical", scoreBg: "bg-risk-critical/10" }
  ];

  return (
    <PageWrapper className="bg-canvas min-h-screen pt-12 pb-28 px-5 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-slate font-medium text-sm mb-1">Welcome back 👋</div>
          <div className="font-bold text-2xl text-ink">{user?.name?.split(' ')[0] || "User"}</div>
        </div>
        <Link to="/settings" className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-ink shadow-card-xs hover:shadow-card-sm transition-shadow">
          {user?.name?.charAt(0) || "U"}
        </Link>
      </div>

      {/* Vero Shield Card */}
      <div className="bg-ink rounded-[24px] p-6 text-white mb-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-trust-good" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate">Vero shield · active</span>
        </div>
        
        <div className="text-[15px] font-medium text-slate mb-1">You're protected.</div>
        <div className="text-3xl font-extrabold mb-6 flex items-baseline gap-2">
          ₦0 <span className="text-[15px] font-medium text-slate">lost this month.</span>
        </div>
        
        <div className="flex gap-6">
          <div>
            <div className="text-xl font-bold mb-0.5">38</div>
            <div className="text-xs text-slate font-medium">Accounts checked</div>
          </div>
          <div>
            <div className="text-xl font-bold mb-0.5 text-trust-good">3</div>
            <div className="text-xs text-slate font-medium">Scams flagged</div>
          </div>
        </div>
      </div>

      {/* Verify Action */}
      <div 
        onClick={() => navigate('/verify')}
        className="bg-white rounded-[20px] p-4 flex flex-col gap-3 shadow-card-xs cursor-pointer hover:shadow-card-sm transition-shadow mb-8 group"
      >
        <div className="font-bold text-[15px] text-ink">Verify an account</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate font-medium text-[15px]">
            <Search size={18} />
            <span>Account number or @username</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-ink group-hover:bg-trust-high group-hover:text-white transition-colors">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* Recent Recipients */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-bold text-ink">Recent recipients</div>
          <Link to="/history" className="text-[12px] font-bold text-trust-high hover:underline">See all</Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentRecipients.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card-xs cursor-pointer hover:shadow-card-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${rec.bg} flex items-center justify-center font-bold text-base ${rec.color}`}>
                {rec.initial}
              </div>
              <div className="flex-1 font-bold text-[15px] text-ink">{rec.name}</div>
              <div className={`text-[13px] font-bold ${rec.color} ${rec.scoreBg} px-2.5 py-1 rounded-lg`}>
                {rec.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Banner */}
      {!user?.isPremium && (
        <Link to="/upgrade" className="flex items-center justify-between bg-gradient-to-r from-ink to-slate/90 rounded-[20px] p-4 text-white shadow-card-sm hover:shadow-card transition-shadow">
          <div>
            <div className="font-bold text-[15px] mb-1 flex items-center gap-1.5">
              <Zap size={16} className="text-risk-neutral fill-risk-neutral" />
              Unlock Vero Pro
            </div>
            <div className="text-[13px] font-medium text-white/70">Unlimited checks · priority alerts</div>
          </div>
          <ChevronRight size={20} className="text-white/50" />
        </Link>
      )}
    </PageWrapper>
  );
}
