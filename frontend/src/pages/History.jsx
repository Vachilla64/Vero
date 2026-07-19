import { useState, useEffect } from "react";
import api from "../lib/api";
import { AlertCircle, Calendar, ShieldCheck, Search } from "lucide-react";
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

  const getScoreColor = (score) => {
    if (score < 30) return "bg-red-50 text-trust-critical border-red-200";
    if (score < 50) return "bg-orange-50 text-trust-highRisk border-orange-200";
    if (score < 70) return "bg-yellow-50 text-trust-mediumRisk border-yellow-200";
    if (score < 90) return "bg-blue-50 text-trust-lowRisk border-blue-200";
    return "bg-green-50 text-trust-good border-green-200";
  };

  const getScoreLabel = (score) => {
    if (score < 30) return "Critical";
    if (score < 50) return "High Risk";
    if (score < 70) return "Medium Risk";
    if (score < 90) return "Low Risk";
    return "Verified Safe";
  };

  // Filter history
  const filteredHistory = history.filter((item) =>
    item.nuban.includes(searchTerm)
  );

  // Compute stats
  const totalChecks = history.length;
  const avgScore = totalChecks
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalChecks)
    : 0;
  const criticalCount = history.filter((item) => item.score < 30).length;

  return (
    <PageWrapper className="px-4">
      {/* Metrics Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Checks</p>
          <p className="text-2xl font-bold text-ink">{totalChecks}</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Trust Score</p>
          <p className={`text-2xl font-bold ${avgScore < 50 ? 'text-trust-critical' : 'text-trust-good'}`}>{avgScore}%</p>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Risks Intercepted</p>
          <p className="text-2xl font-bold text-trust-critical">{criticalCount}</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-ink tracking-tight">Lookup History</h2>
          
          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by NUBAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-trust-critical text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
            <ShieldCheck size={48} className="opacity-15" />
            <p className="text-sm">
              {searchTerm ? "No lookups found matching that NUBAN." : "You haven't run any lookups yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-5 border border-gray-100 rounded-xl hover:shadow-sm hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-ink tracking-wider text-base">{item.nuban}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{item.explanation}</p>
                  <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <span>Transfer Amount:</span>
                    <span className="font-mono text-ink">₦{item.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex flex-col items-center ${getScoreColor(item.score)} min-w-[100px] text-center`}>
                    <span className="text-lg font-black tracking-tight">{item.score}</span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider">{getScoreLabel(item.score)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
