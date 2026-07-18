import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-ink text-surface rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">Sign in to Vero</h2>
          <p className="text-gray-500 text-sm mt-1">Verify accounts before you send.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-trust-critical text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-ink text-surface font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-ink font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
