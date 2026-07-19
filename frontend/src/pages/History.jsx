import { useState, useEffect } from "react";
import api from "../lib/api";
import { AlertCircle, Search, ShieldCheck } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/history");
        setHistory(res.data);
      } catch (err) {
        setError("Failed to retrieve lookup history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScoreVisuals = (score) => {
    if (score < 30) return { color: "text-[#FF4B4B]", bg: "bg-[#FF4B4B]/10" };
    if (score < 50) return { color: "text-[#FF4B4B]", bg: "bg-[#FF4B4B]/10" };
    if (score < 70) return { color: "text-[#FFC300]", bg: "bg-[#FFC300]/12" };
    return { color: "text-[#00C853]", bg: "bg-[#00C853]/10" };
  };

  const filteredHistory = history.filter((item) =>
    item.nuban.includes(searchTerm)
  );

  const groupHistory = (items) => {
    const groups = { Today: [], Yesterday: [], Older: [] };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    items.forEach(item => {
      const d = new Date(item.createdAt);
      if (d.toDateString() === today.toDateString()) {
        groups.Today.push(item);
      } else if (d.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(item);
      } else {
        groups.Older.push(item);
      }
    });
    return groups;
  };

  const grouped = groupHistory(filteredHistory);

  return (
    <PageWrapper className="bg-canvas min-h-screen" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <div className="flex flex-col h-full px-6 pt-4 pb-6 max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-secondary text-[15px] font-semibold flex items-center cursor-pointer hover:text-ink transition-colors">
            ‹ Back
          </div>
          <div className="font-bold text-[15px] text-ink">Lookup history</div>
          <div className="w-[50px]"></div>
        </div>

        {/* Search (Preserved for functionality) */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 text-secondary" size={16} />
          <input
            type="text"
            placeholder="Search by NUBAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border-none shadow-sm hover:shadow-card rounded-xl text-sm text-ink placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-ink transition-shadow"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-[#FF4B4B]/10 text-[#FF4B4B] text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-secondary flex flex-col items-center gap-3">
            <ShieldCheck size={48} className="opacity-20" />
            <p className="text-sm font-medium">
              {searchTerm ? "No lookups found matching that NUBAN." : "You haven't run any lookups yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([label, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={label}>
                  <div className="text-[11px] font-bold text-secondary uppercase tracking-[0.06em] mb-2.5">
                    {label}
                  </div>
                  <div className="flex flex-col gap-[9px]">
                    {items.map((item) => {
                      const { color, bg } = getScoreVisuals(item.score);
                      const timeStr = new Date(item.createdAt)
                        .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        .toLowerCase();
                      const initial = (item.name || item.nuban || "U").charAt(0).toUpperCase();
                      const displayName = item.name || "Unknown Account";
                      const displayBank = item.bank || "Bank";
                      const displayNuban = item.nuban ? `••••${item.nuban.slice(-4)}` : "••••0000";

                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-3 bg-surface rounded-2xl p-[12px_14px] shadow-sm hover:shadow-card transition-shadow cursor-pointer"
                        >
                          <div className={`w-[38px] h-[38px] shrink-0 rounded-[12px] bg-canvas flex items-center justify-center font-bold text-[14px] ${color}`}>
                            {initial}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-[14.5px] font-bold text-ink truncate leading-tight mb-0.5">
                              {displayName}
                            </div>
                            <div className="text-[12px] text-secondary font-medium truncate">
                              {displayBank} · {displayNuban} · {timeStr}
                            </div>
                          </div>
                          <div className={`text-[13px] font-bold ${color} ${bg} px-2.5 py-1 rounded-full shrink-0`}>
                            {item.score}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
