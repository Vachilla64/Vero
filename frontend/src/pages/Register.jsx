import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await register(email, password, name);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface font-sans overflow-y-auto no-scrollbar">
      <div className="flex-1 flex flex-col px-[26px] pb-[26px] pt-12 max-w-md mx-auto w-full overflow-hidden">
        <div className="text-center font-extrabold text-[17px] text-ink tracking-[.04em] mb-[28px]">VERO</div>
        
        <div className="flex bg-hairline rounded-[14px] p-1 mb-[26px]">
          <div className="flex-1 text-center p-[10px] rounded-[11px] bg-white shadow-[0_4px_10px_rgba(43,52,69,.06)] text-[14px] font-bold text-ink">Create account</div>
          <Link to="/login" className="flex-1 text-center p-[10px] rounded-[11px] text-[14px] font-semibold text-slate hover:text-ink transition-colors">Log in</Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-risk-critical/10 border border-risk-critical/20 text-risk-critical text-sm rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs">
              <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Full name</div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                placeholder="Adaeze Okafor"
              />
            </div>
            <div className="bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs">
              <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                placeholder="adaeze@gmail.com"
              />
            </div>
            <div className="bg-white rounded-[14px] px-4 py-[13px] shadow-card-xs">
              <div className="font-bold text-[11px] tracking-[.06em] uppercase text-slate mb-1">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-[15px] font-semibold text-ink bg-transparent focus:outline-none placeholder-gray-300"
                placeholder="••••••••••"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-trust-high text-white font-bold text-[16px] p-[17px] rounded-full shadow-card border-none cursor-pointer hover:bg-opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-[10px] my-[18px]">
          <div className="flex-1 h-px bg-hairline"></div>
          <span className="text-[12px] text-slate font-semibold">or</span>
          <div className="flex-1 h-px bg-hairline"></div>
        </div>

        <button type="button" className="w-full bg-white text-ink border-[1.5px] border-hairline font-semibold text-[16px] p-[17px] rounded-full cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]">
          Continue with Google
        </button>

        <div className="text-center mt-auto pt-5 text-slate text-[13px] font-medium">
          Already have an account? <Link to="/login" className="text-trust-high font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
