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
    // Center FAB will go here visually, but it's not in this list
    { label: "Tags", path: "/tags", icon: Tag },
    { label: "Profile", path: "/settings", icon: User },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[84px] bg-white/85 backdrop-blur-[18px] border-t border-ink/5 z-50 px-5 pt-3.5 pb-safe shadow-[0_-12px_40px_rgba(43,52,69,0.06)] rounded-b-[3rem]">
      <div className="flex justify-between items-start h-full max-w-sm mx-auto relative">
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1.5 flex-1 group">
              <Icon size={24} strokeWidth={2} className={cn("transition-colors", isActive ? "text-trust-high" : "text-slate")} />
              <span className={cn("text-[10px] font-bold transition-colors", isActive ? "text-trust-high" : "text-slate")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center FAB */}
        <div className="flex flex-col items-center justify-start flex-1 -mt-[24px]">
          <Link to="/verify" className="w-[60px] h-[60px] rounded-[22px] bg-gradient-to-br from-trust-high to-trust-good flex items-center justify-center text-white shadow-[0_14px_30px_rgba(0,200,83,0.42)] hover:scale-105 active:scale-95 transition-transform relative z-10">
            <Search size={28} strokeWidth={2.4} />
          </Link>
        </div>

        {/* Right items */}
        {navItems.slice(2, 4).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1.5 flex-1 group">
              <Icon size={24} strokeWidth={2} className={cn("transition-colors", isActive ? "text-trust-high" : "text-slate")} />
              <span className={cn("text-[10px] font-bold transition-colors", isActive ? "text-trust-high" : "text-slate")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
