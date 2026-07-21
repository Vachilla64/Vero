import { Link, useLocation } from "react-router-dom";
import { Home, History, Tag, User, Search } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Activity", path: "/history", icon: History },
    { label: "Tags", path: "/tags", icon: Tag },
    { label: "Profile", path: "/settings", icon: User },
  ];

  return (
    <nav id="bottom-nav" className="absolute bottom-0 left-0 right-0 h-[84px] bg-[rgba(255,255,255,0.86)] backdrop-blur-[18px] border-t border-[rgba(43,52,69,0.06)] z-50 flex items-start justify-around px-[22px] pt-[14px] shadow-[0_-12px_40px_rgba(43,52,69,0.06)]">
      {/* Left items */}
      {navItems.slice(0, 2).map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center gap-[5px] flex-1 group">
            <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-trust-high" : "text-[#B4BCC6]")} strokeWidth={2} />
            <span className={cn("text-[10px] font-bold transition-colors", isActive ? "text-trust-high" : "text-[#B4BCC6]")}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Center FAB */}
      <div className="flex flex-col items-center justify-start flex-1 -mt-[24px]">
        <Link to="/" className="w-[60px] h-[60px] rounded-[22px] bg-[linear-gradient(155deg,#00C853,#00E676)] flex items-center justify-center text-white shadow-[0_14px_30px_rgba(0,200,83,0.42)] hover:scale-105 active:scale-95 transition-transform">
          <Search className="w-7 h-7" strokeWidth={2.4} />
        </Link>
      </div>

      {/* Right items */}
      {navItems.slice(2, 4).map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center gap-[5px] flex-1 group">
            <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-trust-high" : "text-[#B4BCC6]")} strokeWidth={2} />
            <span className={cn("text-[10px] font-bold transition-colors", isActive ? "text-trust-high" : "text-[#B4BCC6]")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
