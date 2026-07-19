import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, History, Settings } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      label: "Verify",
      path: "/",
      icon: ShieldCheck,
    },
    {
      label: "History",
      path: "/history",
      icon: History,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-20 bg-surface/90 backdrop-blur-lg border-t border-gray-100 z-50 px-6 pb-safe">
      <div className="flex justify-between items-center h-full max-w-sm mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1 group"
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive
                    ? "bg-ink text-surface scale-110 shadow-lg shadow-ink/20"
                    : "text-gray-400 group-hover:text-ink group-hover:bg-gray-50"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors",
                  isActive ? "text-ink" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
