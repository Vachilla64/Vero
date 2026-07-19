import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

import PageWrapper from "../components/PageWrapper";

export default function Settings() {
  const { user, refreshProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setUpdating(true);

    try {
      const updatePayload = { name };
      if (password) {
        updatePayload.password = password;
      }

      await api.post("/api/user/settings", updatePayload);
      
      setSuccess("Profile settings updated successfully!");
      setPassword("");
      setConfirmPassword("");
      await refreshProfile(); // Sync new profile state (name)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update settings.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <PageWrapper className="bg-canvas min-h-screen font-poppins">
      <div className="flex flex-col flex-1 px-[26px] pb-[26px] pt-4 max-w-md mx-auto w-full min-h-[calc(100vh-60px)]">
        
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-[22px]">
          <Link to="/" className="text-secondary text-[15px] font-semibold no-underline">‹ Back</Link>
          <div className="font-bold text-[15px] text-ink">Settings</div>
          <div className="w-[22px]"></div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-[14px] bg-surface rounded-[20px] p-[18px] shadow-card mb-[22px]">
          <div className="w-[52px] h-[52px] rounded-2xl bg-canvas flex items-center justify-center text-[20px] font-bold text-ink uppercase">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-bold text-ink">{user?.name || "User"}</div>
            <div className="text-[12.5px] font-medium text-secondary">{user?.email || "No email"}</div>
          </div>
          <span className="bg-canvas text-ink border border-gray-100 rounded-xl px-3 py-1.5 text-[12px] font-medium">Edit</span>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-trust-good text-[13px] rounded-xl font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-trust-critical text-[13px] rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Account Section */}
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-secondary mb-2.5">Account</div>
        <form onSubmit={handleUpdateProfile} className="flex flex-col bg-surface rounded-[18px] overflow-hidden mb-[22px] shadow-sm border border-gray-50">
          <div className="flex items-center justify-between p-[15px] px-[16px] border-b border-canvas">
            <label className="text-[14.5px] font-semibold text-ink">Display name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="text-secondary text-[14px] text-right bg-transparent outline-none focus:text-ink w-[160px]" 
            />
          </div>
          <div className="flex items-center justify-between p-[15px] px-[16px] border-b border-canvas">
            <span className="text-[14.5px] font-semibold text-ink">Email</span>
            <span className="text-secondary text-[14px]">{user?.email || "Email"}</span>
          </div>
          <div className="flex items-center justify-between p-[15px] px-[16px] border-b border-canvas">
            <label className="text-[14.5px] font-semibold text-ink">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="text-secondary text-[14px] text-right bg-transparent outline-none focus:text-ink w-[120px]" 
            />
          </div>
          {password && (
            <div className="flex items-center justify-between p-[15px] px-[16px]">
              <label className="text-[14.5px] font-semibold text-ink">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="text-secondary text-[14px] text-right bg-transparent outline-none focus:text-ink w-[120px]" 
              />
            </div>
          )}
          
          {(name !== user?.name || password) && (
            <div className="p-3 bg-canvas/30">
              <button 
                type="submit" 
                disabled={updating} 
                className="w-full bg-[#00C853] text-white font-bold py-3 rounded-xl text-[14px] shadow-[0_8px_20px_rgba(0,200,83,0.25)] hover:bg-[#00b047] transition-all"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        {/* Plan Section */}
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-secondary mb-2.5">Plan</div>
        <Link to="/upgrade" className="flex items-center gap-[14px] bg-surface rounded-[18px] p-4 shadow-card no-underline mb-6">
          <div className="w-11 h-11 rounded-[14px] bg-[rgba(255,195,0,0.14)] flex items-center justify-center text-[18px]">⚡</div>
          <div className="flex-1">
            <div className="text-[14.5px] font-bold text-ink">{user?.isPremium ? "Vero Pro" : "Free plan"}</div>
            <div className="text-[12px] font-medium text-secondary">{user?.isPremium ? "Unlimited lookups" : "15 lookups / day"}</div>
          </div>
          {!user?.isPremium && (
            <span className="bg-ink text-white font-bold text-[12px] py-1.5 px-3 rounded-xl">Upgrade</span>
          )}
        </Link>

        <div 
          onClick={logout}
          className="text-center mt-auto pt-4 text-trust-critical text-[14px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
        >
          Log out
        </div>
      </div>
    </PageWrapper>
  );
}
