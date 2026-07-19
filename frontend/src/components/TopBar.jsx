import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap } from "lucide-react";

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Verify";
      case "/history":
        return "History";
      case "/settings":
        return "Settings";
      case "/upgrade":
        return "Upgrade";
      default:
        return "Vero";
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-lg border-b border-gray-100 z-50 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-ink">
        {getPageTitle()}
      </h1>
      
      {user?.isPremium ? (
        <span className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full shadow-sm animate-pulse">
          <Zap size={12} className="fill-white" /> Pro
        </span>
      ) : (
        <Link
          to="/upgrade"
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors border border-amber-200"
        >
          Upgrade
        </Link>
      )}
    </header>
  );
}
