import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Search, Tag as TagIcon, Plus } from "lucide-react";

export default function Tags() {
  const [nuban, setNuban] = useState("1234567890"); // Default for demo
  const [newTag, setNewTag] = useState("");
  
  // Dummy data for demo purposes
  const tags = [
    { label: "Legit thrift store", count: 34, isPositive: true },
    { label: "Fast delivery", count: 12, isPositive: true },
    { label: "Delayed once", count: 3, isPositive: false },
  ];

  const suggestedTags = [
    "Legit", "Slow to respond", "Verified business", "Great communication"
  ];

  return (
    <PageWrapper className="bg-canvas min-h-screen pt-12 pb-28 px-5 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <div className="font-bold text-[26px] text-ink">Tags</div>
      </div>

      {/* Account Context */}
      <div className="flex items-center gap-3 bg-white rounded-[20px] p-4 mb-6 shadow-card-xs">
        <div className="w-[48px] h-[48px] rounded-[14px] bg-canvas flex items-center justify-center font-bold text-[18px] text-risk-neutral">
          B
        </div>
        <div>
          <div className="font-bold text-[16px] text-ink">Blessing Eze</div>
          <div className="text-[13px] text-slate font-medium">Kuda · ••••1902</div>
        </div>
      </div>

      {/* What others say */}
      <div className="mb-8">
        <div className="text-[12px] font-bold text-slate uppercase tracking-widest mb-3 px-2 flex justify-between">
          <span>What others say</span>
          <span>46 senders</span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {tags.map((tag, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-3.5 px-4 rounded-[16px] shadow-sm">
              <span className="font-bold text-[15px] text-ink">{tag.label}</span>
              <div className={`text-[12px] font-bold px-2 py-1 rounded-lg ${tag.isPositive ? 'bg-trust-high/10 text-trust-high' : 'bg-risk-neutral/10 text-risk-neutral'}`}>
                {tag.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add your own */}
      <div>
        <div className="text-[12px] font-bold text-slate uppercase tracking-widest mb-3 px-2">
          Add your own
        </div>
        
        <div className="relative mb-4">
          <TagIcon className="absolute left-3 top-3.5 text-slate" size={18} />
          <input
            type="text"
            placeholder='e.g. "Great customer service"'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border-none shadow-card-xs hover:shadow-card-sm rounded-[16px] text-[15px] font-bold text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-ink/10 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {suggestedTags.map((tag, i) => (
            <button 
              key={i}
              onClick={() => setNewTag(tag)}
              className="flex items-center gap-1 bg-white border border-hairline px-3 py-2 rounded-xl text-[13px] font-semibold text-slate hover:text-ink hover:border-slate/30 transition-colors shadow-sm"
            >
              <Plus size={14} />
              {tag}
            </button>
          ))}
        </div>
        
        <button 
          disabled={!newTag}
          className="w-full bg-ink text-white font-bold py-4 rounded-full text-[16px] shadow-card disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Save tag
        </button>
      </div>

    </PageWrapper>
  );
}
