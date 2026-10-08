import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Landmark, Utensils, Clock, MapPin, Calendar, Heart, Award, 
  Check, Search, X, Navigation, Share2, ShieldCheck, ChevronDown, 
  ChevronUp, ExternalLink, Sparkles, Filter, Users, Leaf
} from "lucide-react";
import { TempleItem, TempleSevaSlot, TempleSponsorship } from "../types";

interface TemplesScreenProps {
  temples: TempleItem[];
  joinedSevaSlotIds: string[];
  onJoinSevaSlot: (slot: TempleSevaSlot, temple: TempleItem) => void;
  onSponsorSeva: (sponsorship: TempleSponsorship, temple: TempleItem) => void;
  templePledges: string[];
  onTogglePledge: (templeId: string, templeName: string) => void;
  triggerHaptic: (style: "light" | "medium" | "heavy" | "success" | "warning") => void;
  navigateTo: (screen: string) => void;
}

export default function TemplesScreen({
  temples,
  joinedSevaSlotIds,
  onJoinSevaSlot,
  onSponsorSeva,
  templePledges,
  onTogglePledge,
  triggerHaptic,
  navigateTo
}: TemplesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedTempleId, setExpandedTempleId] = useState<string | null>(temples[0]?.id || null);
  const [activeTabByTemple, setActiveTabByTemple] = useState<Record<string, "seva" | "sponsor" | "about">>({});
  const [directionModalTemple, setDirectionModalTemple] = useState<TempleItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categories = [
    { id: "All", label: "All Temples", icon: "🛕" },
    { id: "Annadana", label: "Annadana Seva", icon: "🍲" },
    { id: "Swachh Seva", label: "Swachh Mandir", icon: "🧹" },
    { id: "Heritage", label: "Heritage Care", icon: "🏛️" },
    { id: "Goshaala", label: "Goshaala", icon: "🐄" },
  ];

  // Filter temples
  const filteredTemples = temples.filter((temple) => {
    const matchesCategory =
      selectedCategory === "All" ||
      temple.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === "Annadana" && temple.sponsorships.some(s => s.title.toLowerCase().includes("annadana") || s.description.toLowerCase().includes("meal"))) ||
      (selectedCategory === "Swachh Seva" && temple.sevaSlots.some(s => s.category.includes("Swachh") || s.category.includes("Cleaning"))) ||
      (selectedCategory === "Goshaala" && temple.trustInitiatives.some(i => i.toLowerCase().includes("cow") || i.toLowerCase().includes("goshaala") || i.toLowerCase().includes("bio")));

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      temple.name.toLowerCase().includes(query) ||
      temple.kannadaName.toLowerCase().includes(query) ||
      temple.deity.toLowerCase().includes(query) ||
      temple.location.toLowerCase().includes(query) ||
      temple.district.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const getActiveTab = (templeId: string): "seva" | "sponsor" | "about" => {
    return activeTabByTemple[templeId] || "seva";
  };

  const setActiveTab = (templeId: string, tab: "seva" | "sponsor" | "about") => {
    setActiveTabByTemple(prev => ({ ...prev, [templeId]: tab }));
  };

  return (
    <div className="flex-1 flex flex-col text-slate-900 bg-slate-50 overflow-y-auto">
      
      {/* 1. CLEAN SPIRITUAL HERO HEADER */}
      <div className="p-3.5 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white rounded-b-2xl shadow-md space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs text-white font-black text-base flex items-center justify-center border border-white/30">
              🛕
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block leading-none">
                Sacred Temples & Dharma Seva
              </span>
              <span className="text-[8.5px] text-amber-100 font-semibold uppercase tracking-wider">
                Karnataka Heritage • Annadana • Swachh Mandir
              </span>
            </div>
          </div>
          <span className="bg-amber-400/25 border border-amber-300/40 text-white font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Verified Shrines
          </span>
        </div>

        <p className="text-[10px] text-amber-50/90 leading-relaxed pt-0.5">
          Join hand-in-hand with Seva Sphoorthi Trust to serve visiting pilgrims, sponsor daily Annadana prasadam, and preserve centuries of sacred temple sanctity.
        </p>

        {/* Dynamic Impact Counters */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-1.5 border border-white/20">
            <span className="text-xs font-black block">12,000+</span>
            <span className="text-[7.5px] text-amber-100 uppercase tracking-tight">Daily Meals</span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-1.5 border border-white/20">
            <span className="text-xs font-black block">140+</span>
            <span className="text-[7.5px] text-amber-100 uppercase tracking-tight">Seva Volunteers</span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-xl p-1.5 border border-white/20">
            <span className="text-xs font-black block">100%</span>
            <span className="text-[7.5px] text-amber-100 uppercase tracking-tight">80G Tax Exempt</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="p-3 space-y-2 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
        {/* Search Input with Clear Button */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search temple name, deity, district (e.g. Subramanya, Shiva)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-[10.5px] text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery("");
                triggerHaptic("light");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  triggerHaptic("light");
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-orange-600 text-white shadow-xs border border-orange-600" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TEMPLES LIST CONTAINER */}
      <div className="p-3 space-y-3.5">
        {filteredTemples.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center space-y-2 border border-slate-200">
            <span className="text-3xl">🔍</span>
            <h4 className="font-bold text-xs text-slate-700">No Temples Found</h4>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              No matching temple for "{searchQuery}". Try searching for "Subramanya", "Shiva", or "Nandi".
            </p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                triggerHaptic("light");
              }}
              className="bg-orange-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTemples.map((temple) => {
            const isExpanded = expandedTempleId === temple.id;
            const currentTab = getActiveTab(temple.id);
            const isPledged = templePledges.includes(temple.id);

            return (
              <div 
                key={temple.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-orange-300"
              >
                {/* Temple Card Top Media */}
                <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
                  <img 
                    src={temple.img} 
                    alt={temple.name}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <span className="bg-orange-600/90 backdrop-blur-xs text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {temple.category}
                    </span>
                    <button 
                      onClick={() => {
                        setDirectionModalTemple(temple);
                        triggerHaptic("light");
                      }}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 transition cursor-pointer"
                    >
                      <Navigation className="w-2.5 h-2.5 text-orange-400" />
                      <span>{temple.distanceFromBangalore.split("from")[0]}</span>
                    </button>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <span className="text-[9px] text-amber-300 font-medium block">
                      {temple.kannadaName}
                    </span>
                    <h3 className="font-extrabold text-sm leading-tight drop-shadow-sm text-white">
                      {temple.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-300 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                      <span className="truncate">{temple.location}, {temple.district}</span>
                    </div>
                  </div>
                </div>

                {/* Card Sub-Info Bar */}
                <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[9px] text-slate-600">
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="text-amber-600">🔱</span>
                    <span className="truncate max-w-[170px]">{temple.deity}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[8.5px] text-slate-500">
                    <span>⏳ {temple.heritageEra.split("(")[0]}</span>
                  </div>
                </div>

                {/* Timings Strip */}
                <div className="p-2.5 bg-amber-50/40 border-b border-amber-100/60 grid grid-cols-2 gap-2 text-[9px]">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block text-[8px] uppercase">Darshan Timings</span>
                      <span className="text-slate-600 font-medium">{temple.darshanTimings}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Utensils className="w-3 h-3 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block text-[8px] uppercase">Annadana Prasada</span>
                      <span className="text-slate-600 font-medium">{temple.annadanaTimings}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Inner Tabs (Seva Slots / Sponsorships / About & Initiatives) */}
                <div className="p-3 space-y-3">
                  <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold text-slate-600 border border-slate-200">
                    <button
                      onClick={() => {
                        setActiveTab(temple.id, "seva");
                        triggerHaptic("light");
                      }}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        currentTab === "seva" 
                          ? "bg-white text-orange-600 shadow-xs font-black" 
                          : "hover:text-slate-900"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>Volunteer Seva ({temple.sevaSlots.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab(temple.id, "sponsor");
                        triggerHaptic("light");
                      }}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        currentTab === "sponsor" 
                          ? "bg-white text-orange-600 shadow-xs font-black" 
                          : "hover:text-slate-900"
                      }`}
                    >
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>Sponsor Seva ({temple.sponsorships.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab(temple.id, "about");
                        triggerHaptic("light");
                      }}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        currentTab === "about" 
                          ? "bg-white text-orange-600 shadow-xs font-black" 
                          : "hover:text-slate-900"
                      }`}
                    >
                      <span>📜</span>
                      <span>Trust Impact</span>
                    </button>
                  </div>

                  {/* TAB 1: VOLUNTEER SEVA SLOTS */}
                  {currentTab === "seva" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold px-0.5">
                        <span>Active Volunteer Brigades</span>
                        <span className="text-emerald-600 font-bold">1-Tap Registration</span>
                      </div>

                      {temple.sevaSlots.map((slot) => {
                        const isJoined = joinedSevaSlotIds.includes(slot.id);
                        const joinedCount = slot.volunteersJoined + (isJoined ? 1 : 0);
                        const capacityPct = Math.min(100, Math.round((joinedCount / slot.volunteersNeeded) * 100));

                        return (
                          <div 
                            key={slot.id}
                            className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                              isJoined 
                                ? "bg-emerald-50/70 border-emerald-300" 
                                : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h5 className="font-bold text-[10.5px] text-slate-900 leading-tight">
                                  {slot.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[8.5px] text-slate-500 font-medium mt-0.5">
                                  <span>📅 {slot.date}</span>
                                  <span>⏰ {slot.time}</span>
                                </div>
                              </div>
                              <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                                slot.category.includes("Annadana") ? "bg-orange-50 text-orange-600 border-orange-200" :
                                slot.category.includes("Swachh") ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                "bg-indigo-50 text-indigo-600 border-indigo-200"
                              }`}>
                                {slot.category}
                              </span>
                            </div>

                            <p className="text-[9px] text-slate-600 leading-relaxed">
                              {slot.description}
                            </p>

                            {/* Capacity bar & Action button */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <div className="flex-1 max-w-[140px] space-y-0.5">
                                <div className="flex justify-between text-[7.5px] font-bold text-slate-500">
                                  <span>Capacity: {joinedCount}/{slot.volunteersNeeded}</span>
                                  <span>{capacityPct}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${isJoined ? "bg-emerald-500" : "bg-orange-500"}`} 
                                    style={{ width: `${capacityPct}%` }}
                                  ></div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  onJoinSevaSlot(slot, temple);
                                  showToast(isJoined ? `Joined: ${slot.title}` : `Confirmed: ${slot.title} at ${temple.name}!`);
                                }}
                                className={`px-3 py-1 rounded-lg text-[9.5px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                                  isJoined
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                                }`}
                              >
                                {isJoined ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Joined</span>
                                  </>
                                ) : (
                                  <>
                                    <Award className="w-3 h-3" />
                                    <span>Join Seva</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: SPONSOR SEVA / ANNADANA */}
                  {currentTab === "sponsor" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold px-0.5">
                        <span>Direct Prasadam & Annadana Funding</span>
                        <span className="text-orange-600 font-bold">UPI GPay • PhonePe</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {temple.sponsorships.map((sp) => (
                          <div 
                            key={sp.id}
                            className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:bg-orange-50 transition shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[10.5px] text-slate-900 leading-tight truncate">
                                  {sp.title}
                                </span>
                                {sp.eligible80G && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[7px] font-black px-1 rounded uppercase shrink-0">
                                    80G
                                  </span>
                                )}
                              </div>
                              <p className="text-[8.5px] text-slate-500 mt-0.5 line-clamp-1">
                                {sp.description}
                              </p>
                              <span className="font-mono font-black text-orange-600 text-xs mt-1 block">
                                ₹{sp.amount.toLocaleString()}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                onSponsorSeva(sp, temple);
                                triggerHaptic("medium");
                              }}
                              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg shadow-xs shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                            >
                              <Heart className="w-3 h-3 text-red-200 fill-red-200" />
                              <span>Sponsor</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TRUST IMPACT & ABOUT */}
                  {currentTab === "about" && (
                    <div className="space-y-2.5 text-left text-slate-700">
                      <p className="text-[10px] leading-relaxed text-slate-600">
                        {temple.description}
                      </p>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[8.5px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Trust Operations on Ground:
                        </span>
                        {temple.trustInitiatives.map((init, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[9px] text-slate-700">
                            <span className="text-orange-500 font-bold">•</span>
                            <span className="leading-snug">{init}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CARD ACTION BUTTONS FOOTER */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[9px]">
                    {/* Eco Pilgrim Pledge Toggle */}
                    <button
                      onClick={() => {
                        onTogglePledge(temple.id, temple.name);
                        showToast(isPledged ? "Eco Pledge revoked" : `🌿 Swachh Mandir Pledge taken for ${temple.name}!`);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                        isPledged 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold" 
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <Leaf className={`w-3 h-3 ${isPledged ? "text-emerald-600 fill-emerald-600" : "text-slate-400"}`} />
                      <span>{isPledged ? "✓ Eco-Pledged" : "Take Eco Pledge"}</span>
                    </button>

                    {/* View Map & Route Coordinates */}
                    <button
                      onClick={() => {
                        setDirectionModalTemple(temple);
                        triggerHaptic("light");
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-orange-500" />
                      <span>Route & Maps</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. DIRECTION & GPS MODAL SHEET */}
      <AnimatePresence>
        {directionModalTemple && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center p-2 animate-fade-in">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
                    📍
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs leading-tight">
                      {directionModalTemple.name}
                    </h4>
                    <span className="text-[8.5px] text-amber-100">
                      {directionModalTemple.district} • {directionModalTemple.distanceFromBangalore}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setDirectionModalTemple(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-3 overflow-y-auto text-slate-800 text-xs">
                {/* Coordinates Box */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                    Exact GPS Geographic Pin
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-800">
                      {directionModalTemple.geoCoords.lat.toFixed(4)}° N, {directionModalTemple.geoCoords.lng.toFixed(4)}° E
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${directionModalTemple.geoCoords.lat}, ${directionModalTemple.geoCoords.lng}`);
                        triggerHaptic("success");
                        showToast("GPS coordinates copied to clipboard!");
                      }}
                      className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded cursor-pointer hover:bg-orange-100"
                    >
                      Copy GPS
                    </button>
                  </div>
                </div>

                {/* Travel & Route Information */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Public Transport & Driving Route
                  </span>
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-[9.5px] text-slate-700 leading-relaxed space-y-1">
                    <p>
                      <strong>🚌 KSRTC / BMTC Buses:</strong> Direct buses depart from Majestic (Kempegowda Bus Station) and Yeshwanthpur every 30-45 minutes.
                    </p>
                    <p>
                      <strong>🚗 Highway Access:</strong> Well-paved 4-lane state highway with parking available at Trust pilgrim grounds.
                    </p>
                    <p>
                      <strong>🕒 Pilgrimage Tip:</strong> Morning darshan (07:00 AM - 10:00 AM) and Nitya Annadana (11:30 AM onwards) have optimal volunteer support.
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionModalTemple.geoCoords.mapsQuery)}`, "_blank");
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-[11px] py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Google Maps / Navigation</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic("light");
                      setDirectionModalTemple(null);
                      setSearchQuery(directionModalTemple.name);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer"
                  >
                    View Temple Seva Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-14 inset-x-4 max-w-sm mx-auto z-50 bg-slate-950/95 text-white text-[10px] font-semibold px-3 py-2 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="flex-1 leading-snug">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
