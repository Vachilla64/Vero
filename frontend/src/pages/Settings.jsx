import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { User, Mail, Lock, ChevronRight, LogOut, Zap, ShieldCheck } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PageWrapper className="bg-canvas min-h-screen pt-12 pb-28 px-5 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <div className="font-bold text-[26px] text-ink">Profile</div>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-white rounded-[24px] p-5 mb-8 shadow-card-xs">
        <div className="w-[60px] h-[60px] rounded-[18px] bg-canvas flex items-center justify-center font-bold text-[22px] text-ink shadow-sm">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <div className="font-bold text-[18px] text-ink">{user?.name || "User"}</div>
          <div className="text-[13px] text-slate font-medium">{user?.email || "user@example.com"}</div>
        </div>
        <button className="text-[13px] font-bold text-trust-high bg-trust-high/10 px-3.5 py-1.5 rounded-full hover:bg-trust-high/20 transition-colors">
          Edit
        </button>
      </div>

      {/* Account Settings */}
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate uppercase tracking-widest mb-3 px-2">Account</div>
        <div className="bg-white rounded-[24px] overflow-hidden shadow-card-xs">
          <div className="flex items-center justify-between p-4 border-b border-hairline hover:bg-canvas/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 text-ink">
              <User size={18} className="text-slate" />
              <span className="font-semibold text-[15px]">Display name</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate font-medium">{user?.name || "User"}</span>
              <ChevronRight size={16} className="text-slate" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border-b border-hairline hover:bg-canvas/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 text-ink">
              <Mail size={18} className="text-slate" />
              <span className="font-semibold text-[15px]">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate font-medium">{user?.email || "user@example.com"}</span>
              <ChevronRight size={16} className="text-slate" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 hover:bg-canvas/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 text-ink">
              <Lock size={18} className="text-slate" />
              <span className="font-semibold text-[15px]">Password</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate font-medium">••••••••</span>
              <ChevronRight size={16} className="text-slate" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate uppercase tracking-widest mb-3 px-2">Plan</div>
        <div className="bg-white rounded-[24px] p-5 shadow-card-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {user?.isPremium ? (
                <ShieldCheck size={18} className="text-trust-high" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate/20 flex items-center justify-center text-[10px] font-bold text-slate">Free</div>
              )}
              <span className="font-bold text-[16px] text-ink">{user?.isPremium ? "Vero Pro" : "Free plan"}</span>
            </div>
            <div className="text-[13px] text-slate font-medium">
              {user?.isPremium ? "Unlimited lookups & priority alerts" : "15 lookups / day"}
            </div>
          </div>
          
          {!user?.isPremium && (
            <Link to="/upgrade" className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-card-sm">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 font-bold text-[15px] text-risk-critical bg-white py-4 rounded-[20px] shadow-card-xs hover:bg-risk-critical/5 transition-colors"
      >
        <LogOut size={18} />
        Log out
      </button>
    </PageWrapper>
  );
}
