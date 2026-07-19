import { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { User, Lock, CheckCircle, AlertCircle, Calendar, Shield } from "lucide-react";

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
    <PageWrapper className="px-4">
      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

        {/* Member Status Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>Member since: <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Shield size={16} className="text-gray-400" />
            <span>
              Lookup Tier:{" "}
              <strong className={user?.isPremium ? "text-amber-600" : "text-gray-600"}>
                {user?.isPremium ? "Vero Pro (Unlimited)" : "Free (3 per day)"}
              </strong>
            </span>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-trust-good text-sm rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-trust-critical text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-gray-400" /> Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={updating}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
            />
          </div>

          {/* Change Password Block */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-sm font-semibold text-ink">Change Password</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Lock size={12} className="text-gray-400" /> New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Lock size={12} className="text-gray-400" /> Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ink disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating || (name === user?.name && !password)}
            className="w-full bg-ink text-surface font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full bg-red-50 text-trust-critical font-semibold py-3 rounded-lg hover:bg-red-100 transition-all text-sm"
          >
            Log Out
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
