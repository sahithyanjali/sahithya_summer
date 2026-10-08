import React, { useState, useEffect } from "react";
import { 
  Search, Sparkles, X, ArrowRight, HeartHandshake, Landmark, 
  BookOpen, Heart, Calendar, MapPin, Loader2, RefreshCw, Zap
} from "lucide-react";

export interface SmartSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: "volunteer" | "temple" | "program" | "donation";
  actionLabel: string;
  actionScreen: string;
  actionPayload?: any;
  badge?: string;
}

export interface SmartSearchResponse {
  success: boolean;
  source: string;
  query: string;
  aiSummary: string;
  category: string;
  results: SmartSearchResultItem[];
  suggestedQueries: string[];
}

interface AiSmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string, payload?: any) => void;
  triggerHaptic?: (type: "light" | "medium" | "heavy" | "success" | "warning" | "error") => void;
  initialQuery?: string;
}

const PRESET_QUERIES = [
  { label: "🍛 Weekend Annadana Food Seva", query: "Weekend Annadana food distribution in Bengaluru" },
  { label: "🛕 Temples with Darshan Booking", query: "Temples with Darshan booking and Annadana" },
  { label: "📚 Teach Underprivileged Children", query: "Volunteer to teach students and child education" },
  { label: "🩺 Mobile Health Clinics", query: "Rural health camp volunteer diagnostic drive" },
  { label: "👴 Elder Care Companionship", query: "Assisting elderly citizens and destitute elders" },
  { label: "🌱 Tree Plantation & Clean-up", query: "River clean-up and environmental sapling planting" }
];

export default function AiSmartSearchModal({
  isOpen,
  onClose,
  onNavigate,
  triggerHaptic,
  initialQuery = ""
}: AiSmartSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SmartSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery, categoryFilter);
      } else if (!data) {
        // Run initial seed search
        executeSearch("Volunteer opportunities and temples", "ALL");
      }
    }
  }, [isOpen, initialQuery]);

  const executeSearch = async (searchQuery: string, catFilter = categoryFilter) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    triggerHaptic?.("light");

    try {
      const res = await fetch("/api/ai/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), categoryFilter: catFilter })
      });

      if (!res.ok) {
        throw new Error(`Search error: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json);
      triggerHaptic?.("success");
    } catch (err: any) {
      console.error("AI search failed:", err);
      setError("Unable to connect to AI Search. Showing default recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    executeSearch(query || "volunteer opportunities", cat);
  };

  const handleAction = (item: SmartSearchResultItem) => {
    triggerHaptic?.("medium");
    onClose();
    onNavigate(item.actionScreen, item.actionPayload);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-50 w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-3.5 shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs tracking-tight">Smart Seva Search</h3>
                </div>
                <p className="text-[9px] text-orange-100 font-medium">
                  Semantic discovery across volunteers, temples & causes
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic?.("light");
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-xs font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* SEARCH INPUT BOX */}
          <form onSubmit={handleFormSubmit} className="mt-2.5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'teach children on weekends', 'temple annadana')..."
              className="w-full bg-white text-slate-900 rounded-xl pl-9 pr-20 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-amber-300 shadow-inner"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-14 top-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <span>Search</span>
                  <Zap className="w-2.5 h-2.5 text-amber-300" />
                </>
              )}
            </button>
          </form>

          {/* FILTER PILLS */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5 text-[8.5px]">
            {[
              { id: "ALL", label: "All Initiatives" },
              { id: "VOLUNTEER", label: "🤝 Volunteers" },
              { id: "TEMPLES", label: "🛕 Temples" },
              { id: "PROGRAMS", label: "📚 Programs" },
              { id: "DONATIONS", label: "❤️ Donations" }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => handleCategoryChange(pill.id)}
                className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === pill.id
                    ? "bg-white text-orange-700 shadow-xs"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE RESULTS BODY */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 pb-24">
          
          {/* QUICK PROMPT SUGGESTIONS (IF NOT SEARCHED OR AS CHIPS) */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
              Suggested AI Inquiries:
            </span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset.query);
                    executeSearch(preset.query);
                  }}
                  className="bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 text-[9px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 shadow-2xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="bg-white rounded-2xl border border-orange-200 p-6 text-center space-y-2 shadow-xs">
              <div className="w-8 h-8 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center animate-spin">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-xs text-slate-800">
                Searching Seva Sphoorthi initiatives...
              </h4>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Synthesizing volunteer matching scores, temple darshan dates, and grassroots programs.
              </p>
            </div>
          )}

          {/* AI SUMMARY INSIGHT CARD */}
          {!loading && data && data.aiSummary && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[10px]">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                  <span>Seva Match Insight</span>
                </div>
                <span className="text-[8px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  {data.source}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-800 leading-relaxed font-medium">
                {data.aiSummary}
              </p>
            </div>
          )}

          {/* ERROR NOTICE */}
          {error && (
            <div className="bg-amber-50 text-amber-800 text-[10px] p-2.5 rounded-xl border border-amber-200">
              {error}
            </div>
          )}

          {/* RESULTS FEED */}
          {!loading && data && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-500 px-1">
                <span>Direct Matched Results ({data.results.length})</span>
                <span className="text-orange-600 font-black">Ranked by Relevance</span>
              </div>

              {data.results.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                  No direct initiatives matched your exact terms. Try tapping one of the suggested prompts above.
                </div>
              ) : (
                data.results.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs hover:border-orange-300 transition space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                          {item.type === "volunteer" && <HeartHandshake className="w-3.5 h-3.5" />}
                          {item.type === "temple" && <Landmark className="w-3.5 h-3.5" />}
                          {item.type === "program" && <BookOpen className="w-3.5 h-3.5" />}
                          {item.type === "donation" && <Heart className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          <span className="text-[9px] text-slate-500 block">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[8px] font-mono text-slate-400 uppercase">
                        Route: {item.actionScreen}
                      </span>
                      <button
                        onClick={() => handleAction(item)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FOLLOW-UP QUESTIONS */}
          {!loading && data && data.suggestedQueries && data.suggestedQueries.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">
                Related Queries to Explore:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.suggestedQueries.map((qText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(qText);
                      executeSearch(qText);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer"
                  >
                    💬 {qText}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
