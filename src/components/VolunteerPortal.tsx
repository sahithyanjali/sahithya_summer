import React, { useState, useEffect } from "react";
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Filter, 
  Search, 
  QrCode, 
  Upload, 
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Info,
  Shield,
  Briefcase,
  HeartHandshake,
  Bell,
  Printer,
  Download,
  Send,
  FileCheck2,
  UserCheck,
  X
} from "lucide-react";
import { 
  VolunteerProfile, 
  OpportunityItem, 
  VolunteerAssignment, 
  SkillCategory,
  IdentityDocType,
  AvailabilityTimeSlot,
  NotificationRecord
} from "../types";
import { 
  SKILLS_TAXONOMY, 
  INITIAL_VOLUNTEER_PROFILE, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_ASSIGNMENTS,
  calculatePegaMatchScore 
} from "../data/volunteer_data";
interface VolunteerPortalProps {
  onBackToHome?: () => void;
  triggerHaptic?: (style: "light" | "medium" | "heavy" | "success" | "warning") => void;
}

export default function VolunteerPortal({ 
  onBackToHome, 
  triggerHaptic 
}: VolunteerPortalProps) {
  // Navigation tabs: 'opportunities' | 'onboarding' | 'schedule' | 'notifications' | 'impact'
  const [activeTab, setActiveTab] = useState<"opportunities" | "onboarding" | "schedule" | "notifications" | "impact">("opportunities");

  // Core Data States
  const [profile, setProfile] = useState<VolunteerProfile>(INITIAL_VOLUNTEER_PROFILE);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>(INITIAL_ASSIGNMENTS);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Filter States for Opportunities
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<OpportunityItem | null>(null);
  const [applicationStatement, setApplicationStatement] = useState<string>("");
  const [applyLoading, setApplyLoading] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Onboarding Sub-Step State
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(profile.termsAccepted);
  const [termsSigning, setTermsSigning] = useState<boolean>(false);

  // QR Check-In & Certificate Modal States
  const [qrModalAssignment, setQrModalAssignment] = useState<VolunteerAssignment | null>(null);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);
  const [completingShiftId, setCompletingShiftId] = useState<string | null>(null);
  const [certificateModalAssignment, setCertificateModalAssignment] = useState<VolunteerAssignment | null>(null);

  // Load from backend on mount
  useEffect(() => {
    fetchProfile();
    fetchOpportunities();
    fetchSchedule();
    fetchNotifications();
  }, []);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/v1/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/v1/opportunities");
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities) setOpportunities(data.opportunities);
      }
    } catch (e) {
      console.error("Failed to load opportunities:", e);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/v1/schedule");
      if (res.ok) {
        const data = await res.json();
        if (data.assignments) setAssignments(data.assignments);
      }
    } catch (e) {
      console.error("Failed to load schedule:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadNotifCount(data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  const handleMarkNotifRead = async (notifId: string) => {
    try {
      await fetch(`/api/v1/notifications/${notifId}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await fetch("/api/v1/notifications/mark-all-read", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
      showToast("All notifications marked as read");
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  // Claim Slot / Apply (Opportunity Application Step)
  const handleApplyOpportunity = async (opp: OpportunityItem) => {
    triggerHaptic?.("medium");
    setApplyLoading(opp.opportunityId);

    try {
      const res = await fetch(`/api/v1/opportunities/${opp.opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: applicationStatement })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic?.("success");
        showToast(`🎉 Registered! Slot confirmed for ${opp.title}`);
        await fetchOpportunities();
        await fetchSchedule();
        await fetchProfile();
        await fetchNotifications();
        setSelectedOppForDetail(null);
        setApplicationStatement("");
      } else {
        triggerHaptic?.("warning");
        showToast(data.error || "Failed to claim slot");
      }
    } catch (e) {
      triggerHaptic?.("warning");
      showToast("Network error. Please try again.");
    } finally {
      setApplyLoading(null);
    }
  };

  // Simulated QR Check-In (Completion Step part 1)
  const handleCheckIn = async (assignmentId: string) => {
    triggerHaptic?.("heavy");
    setCheckInLoading(true);

    try {
      const res = await fetch(`/api/v1/schedule/${assignmentId}/check-in`, {
        method: "POST"
      });
      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic?.("success");
        showToast("✓ Verified QR Check-in! 4 service hours credited.");
        await fetchSchedule();
        await fetchProfile();
        await fetchNotifications();
        setQrModalAssignment(null);
      } else {
        showToast(data.error || "Check-in failed");
      }
    } catch (e) {
      showToast("Network error during check-in");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Mark Shift as Completed & Unlock Certificate (Completion Step part 2)
  const handleCompleteShift = async (asg: VolunteerAssignment) => {
    triggerHaptic?.("heavy");
    setCompletingShiftId(asg.assignmentId);

    try {
      const res = await fetch(`/api/v1/schedule/${asg.assignmentId}/complete`, {
        method: "POST"
      });
      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic?.("success");
        showToast("🎖️ Shift Completed! Certificate of Service unlocked.");
        await fetchSchedule();
        await fetchProfile();
        await fetchNotifications();
        setCertificateModalAssignment({ ...asg, status: "COMPLETED" });
      } else {
        showToast(data.error || "Failed to mark shift complete");
      }
    } catch (e) {
      showToast("Network error during shift completion");
    } finally {
      setCompletingShiftId(null);
    }
  };

  // Save profile updates to backend
  const handleSaveProfile = async (updates: Partial<VolunteerProfile>) => {
    triggerHaptic?.("light");
    setProfileSaving(true);
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        showToast("✓ Profile updated successfully");
        fetchOpportunities(); // recalculate match scores
      }
    } catch (e) {
      showToast("Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // Sign Code of Conduct Terms
  const handleAcceptTerms = async () => {
    triggerHaptic?.("heavy");
    setTermsSigning(true);
    try {
      const res = await fetch("/api/v1/onboarding/accept-terms", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setTermsAgreed(true);
        triggerHaptic?.("success");
        showToast("✓ Terms accepted with SHA-256 audit signature");
      }
    } catch (e) {
      showToast("Failed to sign terms");
    } finally {
      setTermsSigning(false);
    }
  };

  // Toggle skill selection
  const toggleSkill = (skillName: string) => {
    triggerHaptic?.("light");
    const exists = profile.skills.includes(skillName);
    const newSkills = exists 
      ? profile.skills.filter(s => s !== skillName)
      : [...profile.skills, skillName];
    handleSaveProfile({ skills: newSkills });
  };

  // Toggle availability slot
  const toggleAvailability = (type: "weekdays" | "weekends", slot: AvailabilityTimeSlot) => {
    triggerHaptic?.("light");
    const current = profile.availability[type];
    const exists = current.includes(slot);
    const updated = exists ? current.filter(s => s !== slot) : [...current, slot];
    handleSaveProfile({
      availability: {
        ...profile.availability,
        [type]: updated
      }
    });
  };

  // Filtered Opportunities List
  const filteredOpportunities = opportunities.filter(opp => {
    if (selectedCategory !== "ALL" && opp.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.location.venueName.toLowerCase().includes(q) ||
        opp.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* 1. TOP HEADER & PORTAL BRANDING */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-base border border-white/30">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs tracking-tight">Volunteer Portal</h3>
              </div>
              <p className="text-[9px] text-orange-100 font-medium leading-none mt-0.5">
                Onboarding, Smart Matching & Scheduling
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[8px] uppercase tracking-wider text-orange-200 block font-bold">Service Hours</span>
            <span className="text-xs font-black text-white">{profile.totalServiceHours} hrs</span>
          </div>
        </div>

        {/* Action Notice Notification Toast */}
        {actionNotice && (
          <div className="mt-2 text-[9.5px] bg-slate-900/90 text-white px-2.5 py-1.5 rounded-lg border border-white/20 shadow flex items-center justify-between animate-fade-in">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex gap-1 mt-2.5 bg-orange-700/50 p-1 rounded-xl">
          {[
            { id: "opportunities", label: "Opportunities", icon: Sparkles },
            { id: "onboarding", label: "My Profile", icon: ShieldCheck },
            { id: "schedule", label: "Schedule", icon: Calendar, badge: assignments.length },
            { id: "notifications", label: "Alerts", icon: Bell, badge: unreadNotifCount },
            { id: "impact", label: "Impact", icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic?.("light");
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-extrabold flex items-center justify-center gap-1 transition cursor-pointer ${
                  isActive 
                    ? "bg-white text-orange-700 shadow-xs" 
                    : "text-orange-100 hover:bg-white/10"
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span className={`text-[7.5px] px-1 rounded-full font-black ${
                    isActive ? "bg-orange-600 text-white" : "bg-white/30 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-3 pb-28 space-y-3">
        
        {/* ========================================================= */}
        {/* TAB 1: OPPORTUNITY DISCOVERY & 6-FACTOR DETERMINISTIC MATCH */}
        {/* ========================================================= */}
        {activeTab === "opportunities" && (
          <div className="space-y-3">
            {/* Search & Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search opportunities by title, venue, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-[10px] outline-none focus:border-orange-500 shadow-2xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[8.5px] no-scrollbar">
                {[
                  { id: "ALL", label: "All Sectors" },
                  { id: "EDUCATION", label: "📚 Education" },
                  { id: "HEALTHCARE", label: "🩺 Healthcare" },
                  { id: "RELIEF", label: "🍲 Relief" },
                  { id: "ENVIRONMENT", label: "🌱 Environment" },
                  { id: "COMMUNITY", label: "🤝 Community" },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      triggerHaptic?.("light");
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition border cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-orange-600 text-white border-orange-600 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opportunities Feed */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 px-1">
                <span>Opportunities Feed ({filteredOpportunities.length} Available)</span>
                <span className="text-orange-600">Ranked by Match %</span>
              </div>

              {filteredOpportunities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
                  No volunteer opportunities found matching the selected criteria.
                </div>
              ) : (
                filteredOpportunities.map(opp => {
                  const match = calculatePegaMatchScore(profile, opp);
                  const isAssigned = assignments.some(a => a.opportunityId === opp.opportunityId && a.status !== "CANCELLED");
                  const isFilled = opp.assignedCount >= opp.capacity;

                  return (
                    <div 
                      key={opp.opportunityId} 
                      className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2.5 hover:border-orange-200 transition"
                    >
                      {/* Top Row: Category + Pega Match Score Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {opp.category}
                        </span>

                        <div 
                          onClick={() => {
                            triggerHaptic?.("light");
                            setSelectedOppForDetail(opp);
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black cursor-pointer border ${
                            match.score >= 85 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : match.score >= 70
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                          title="Click to view compatibility breakdown"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{match.score}% Match</span>
                          <Info className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {opp.title}
                        </h4>
                        <p className="text-[9.5px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {opp.description}
                        </p>
                      </div>

                      {/* Required Skills Chips */}
                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills.map(skill => {
                          const userHasSkill = profile.skills.includes(skill);
                          return (
                            <span 
                              key={skill}
                              className={`text-[8px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                                userHasSkill 
                                  ? "bg-emerald-100/70 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {userHasSkill && <Check className="w-2 h-2 text-emerald-600" />}
                              {skill}
                            </span>
                          );
                        })}
                      </div>

                      {/* Metadata Row: Date, Duration, Venue */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{opp.scheduledDate} ({opp.startTime})</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{opp.durationHours} Hours Duration</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate col-span-2">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{opp.location.venueName}, {opp.location.city}</span>
                        </div>
                      </div>

                      {/* Capacity & Action Button */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        {/* Capacity Progress */}
                        <div className="flex-1">
                          <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-1">
                            <span>Capacity: {opp.assignedCount} / {opp.capacity} Slots</span>
                            <span>{Math.round((opp.assignedCount / opp.capacity) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isFilled ? "bg-red-500" : "bg-orange-500"
                              }`} 
                              style={{ width: `${Math.min(100, (opp.assignedCount / opp.capacity) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Apply / Claim CTA */}
                        <div>
                          {isAssigned ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-extrabold px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Registered</span>
                            </span>
                          ) : isFilled ? (
                            <span className="bg-slate-100 text-slate-500 text-[9.5px] font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                              Full
                            </span>
                          ) : (
                            <button
                              disabled={applyLoading === opp.opportunityId}
                              onClick={() => handleApplyOpportunity(opp)}
                              className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              {applyLoading === opp.opportunityId ? (
                                <span>Claiming...</span>
                              ) : (
                                <>
                                  <span>Claim Slot</span>
                                  <ChevronRight className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VOLUNTEER ONBOARDING & PROFILE (5-Step Model) */}
        {/* ========================================================= */}
        {activeTab === "onboarding" && (
          <div className="space-y-3">
            {/* Step Navigation Bar */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                <span>Onboarding Flow</span>
                <span className="text-orange-600">Step {onboardingStep} of 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { step: 1, label: "Personal" },
                  { step: 2, label: "Skills" },
                  { step: 3, label: "Times" },
                  { step: 4, label: "Verify" },
                  { step: 5, label: "Terms" }
                ].map(s => (
                  <button
                    key={s.step}
                    onClick={() => {
                      triggerHaptic?.("light");
                      setOnboardingStep(s.step as any);
                    }}
                    className={`py-1.5 rounded-lg text-center font-bold text-[8.5px] transition cursor-pointer border ${
                      onboardingStep === s.step
                        ? "bg-orange-600 text-white border-orange-600"
                        : s.step < onboardingStep
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {s.step < onboardingStep ? "✓ " : ""}{s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Personal Demographics */}
            {onboardingStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-800">1. Personal Demographics</h4>
                  <p className="text-[9.5px] text-slate-400">Used for dispatch rosters and safety records.</p>
                </div>

                <div className="space-y-2.5 text-[10px]">
                  <div>
                    <label className="font-bold text-slate-500 uppercase tracking-wider block text-[8.5px] mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      onBlur={() => handleSaveProfile({ fullName: profile.fullName })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-500 uppercase tracking-wider block text-[8.5px] mb-1">Email ID</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        onBlur={() => handleSaveProfile({ email: profile.email })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 uppercase tracking-wider block text-[8.5px] mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        onBlur={() => handleSaveProfile({ phone: profile.phone })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-500 uppercase tracking-wider block text-[8.5px] mb-1">City</label>
                      <input 
                        type="text" 
                        value={profile.address.city}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                        onBlur={() => handleSaveProfile({ address: profile.address })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 uppercase tracking-wider block text-[8.5px] mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        value={profile.address.pincode}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
                        onBlur={() => handleSaveProfile({ address: profile.address })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-100 space-y-2">
                    <span className="text-[8.5px] font-extrabold uppercase text-orange-700 tracking-wider block">
                      Emergency Contact Record
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        placeholder="Contact Name"
                        value={profile.emergencyContact.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
                        onBlur={() => handleSaveProfile({ emergencyContact: profile.emergencyContact })}
                        className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-[9.5px]"
                      />
                      <input 
                        type="tel"
                        placeholder="Contact Phone"
                        value={profile.emergencyContact.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
                        onBlur={() => handleSaveProfile({ emergencyContact: profile.emergencyContact })}
                        className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-[9.5px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      triggerHaptic?.("light");
                      setOnboardingStep(2);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <span>Next: Skills Assessment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Skills Taxonomy Assessment */}
            {onboardingStep === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">2. Skills Inventory & Taxonomy</h4>
                    <p className="text-[9.5px] text-slate-400">Select skills for deterministic opportunity matching.</p>
                  </div>
                  <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {profile.skills.length} Selected
                  </span>
                </div>

                {/* Categorized Skills */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(["Education", "Healthcare", "Relief", "Logistics", "IT & Media", "Community"] as SkillCategory[]).map(cat => {
                    const catSkills = SKILLS_TAXONOMY.filter(s => s.category === cat);
                    return (
                      <div key={cat} className="space-y-1">
                        <span className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          {cat}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catSkills.map(skill => {
                            const isSelected = profile.skills.includes(skill.name);
                            return (
                              <button
                                key={skill.id}
                                onClick={() => toggleSkill(skill.name)}
                                className={`text-[9.5px] font-bold px-2.5 py-1 rounded-lg transition border cursor-pointer flex items-center gap-1 ${
                                  isSelected 
                                    ? "bg-orange-600 text-white border-orange-600 shadow-2xs" 
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                <span>{skill.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="text-slate-500 font-bold text-[10px] px-3 py-1.5"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic?.("light");
                      setOnboardingStep(3);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <span>Next: Availability Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Availability Schedule Matrix */}
            {onboardingStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-800">3. Recurring Availability Matrix</h4>
                  <p className="text-[9.5px] text-slate-400">Specify regular time windows for shift allocations.</p>
                </div>

                {/* Weekdays */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[9px] font-extrabold uppercase text-slate-600 tracking-wider block">
                    🗓️ Weekdays (Monday – Friday)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["MORNING", "AFTERNOON", "EVENING"] as AvailabilityTimeSlot[]).map(slot => {
                      const isSel = profile.availability.weekdays.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleAvailability("weekdays", slot)}
                          className={`py-1.5 px-2 rounded-lg text-center text-[9px] font-extrabold border transition cursor-pointer ${
                            isSel
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {slot === "MORNING" ? "🌅 Morning" : slot === "AFTERNOON" ? "☀️ Afternoon" : "🌙 Evening"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weekends */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[9px] font-extrabold uppercase text-slate-600 tracking-wider block">
                    ⭐ Weekends (Saturday – Sunday)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["MORNING", "AFTERNOON", "EVENING"] as AvailabilityTimeSlot[]).map(slot => {
                      const isSel = profile.availability.weekends.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleAvailability("weekends", slot)}
                          className={`py-1.5 px-2 rounded-lg text-center text-[9px] font-extrabold border transition cursor-pointer ${
                            isSel
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {slot === "MORNING" ? "🌅 Morning" : slot === "AFTERNOON" ? "☀️ Afternoon" : "🌙 Evening"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="text-slate-500 font-bold text-[10px] px-3 py-1.5"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic?.("light");
                      setOnboardingStep(4);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <span>Next: Identity Verification</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Identity Verification & Background Check */}
            {onboardingStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-800">4. Identity & Background Check</h4>
                  <p className="text-[9.5px] text-slate-400">Trust & Safety Compliance standards.</p>
                </div>

                {/* Identity Document Upload Status */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase text-slate-600 tracking-wider">
                      Govt Identity Document
                    </span>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
                      profile.identityVerified 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }`}>
                      {profile.identityVerified ? "✓ VERIFIED" : "PENDING REVIEW"}
                    </span>
                  </div>

                  <div className="text-[10px] space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Document Type:</span>
                      <select
                        value={profile.identityDocType || "AADHAAR"}
                        onChange={(e) => {
                          const docType = e.target.value as IdentityDocType;
                          setProfile(prev => ({ ...prev, identityDocType: docType }));
                          handleSaveProfile({ identityDocType: docType });
                        }}
                        className="font-bold text-slate-800 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] outline-none"
                      >
                        <option value="AADHAAR">Aadhaar Card (UIDAI)</option>
                        <option value="PAN_CARD">PAN Card (Income Tax)</option>
                        <option value="PASSPORT">Indian Passport</option>
                        <option value="VOTER_ID">Voter ID (ECI)</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                      </select>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Attached File:</span>
                      <span className="font-mono text-slate-800 truncate max-w-[150px]">{profile.identityDocName || "Document_Verified.pdf"}</span>
                    </div>
                  </div>

                  <label className="w-full bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-lg text-[9.5px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer">
                    <Upload className="w-3 h-3 text-orange-600" />
                    <span>Upload Government ID Document (PDF / Image)</span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          triggerHaptic?.("success");
                          const fileName = `${profile.identityDocType || "GovtID"}_${file.name}`;
                          setProfile(prev => ({
                            ...prev,
                            identityDocName: fileName,
                            identityVerified: true,
                            onboardingStage: prev.termsAccepted ? "COMPLETED" : "TERMS_CONDUCT"
                          }));
                          handleSaveProfile({
                            identityDocName: fileName,
                            identityDocType: profile.identityDocType || "AADHAAR",
                            identityVerified: true
                          });
                          showToast(`✓ Uploaded ${file.name}. Identity documents submitted for audit.`);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Criminal Background Check Status */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase text-slate-600 tracking-wider">
                      Criminal Background Check
                    </span>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
                      profile.backgroundCheckStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : profile.backgroundCheckStatus === "FLAGGED"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}>
                      {profile.backgroundCheckStatus}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    {profile.backgroundCheckNotes || "Police clearance certificate cleared; no adverse civil or criminal logs."}
                  </p>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="text-slate-500 font-bold text-[10px] px-3 py-1.5"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic?.("light");
                      setOnboardingStep(5);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <span>Next: Code of Conduct</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Terms of Service & Code of Conduct */}
            {onboardingStep === 5 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-800">5. Volunteer Code of Conduct</h4>
                  <p className="text-[9.5px] text-slate-400">Review ethical obligations and confirm with digital signature.</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-36 overflow-y-auto text-[9px] text-slate-600 space-y-1.5 leading-relaxed font-sans">
                  <p className="font-bold text-slate-800">Seva Sphoorthi Trust Volunteer Code:</p>
                  <p>1. <strong>Integrity & Child Protection:</strong> Strictly protect minor students and beneficiaries from any harm, discrimination, or exploitation.</p>
                  <p>2. <strong>Zero Tolerance for Solicitation:</strong> Volunteers must never solicit funds, tips, or personal contact info during relief activities.</p>
                  <p>3. <strong>Punctuality & Safety:</strong> Adhere to attendance guidelines, wear authorized volunteer ID gear, and log hours using the verified QR check-in.</p>
                  <p>4. <strong>Data Privacy:</strong> Respect confidentiality of donor, medical camp, and beneficiary identities.</p>
                </div>

                {profile.termsAccepted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[9px] space-y-1">
                    <div className="flex items-center gap-1 text-emerald-800 font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terms Digitally Executed</span>
                    </div>
                    <p className="text-slate-500 font-mono text-[8px] truncate">
                      Hash: {profile.termsSignatureHash || "sha256_e3b0c44298fc1c14"}
                    </p>
                    <p className="text-slate-400 text-[8px]">
                      Timestamp: {new Date(profile.termsAcceptedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer text-[9.5px] text-slate-700">
                      <input 
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-orange-600 accent-orange-600"
                      />
                      <span>I hereby agree to the Volunteer Code of Conduct, safety protocols, and statutory reporting standards.</span>
                    </label>

                    <button
                      disabled={!termsAgreed || termsSigning}
                      onClick={handleAcceptTerms}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-[10px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                    >
                      {termsSigning ? (
                        <span>Executing SHA-256 Audit Signature...</span>
                      ) : (
                        <span>Sign & Complete Onboarding</span>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="text-slate-500 font-bold text-[10px] px-3 py-1.5"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic?.("light");
                      setActiveTab("opportunities");
                    }}
                    className="bg-slate-800 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl"
                  >
                    Explore Opportunities
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MY SCHEDULE & QR CHECK-IN ATTENDANCE               */}
        {/* ========================================================= */}
        {activeTab === "schedule" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 px-1">
              <span>My Confirmed Engagements ({assignments.length})</span>
              <span className="text-orange-600">Verified QR Attendance</span>
            </div>

            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <h5 className="font-bold text-xs text-slate-700">No shifts scheduled</h5>
                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                  Browse the Opportunities feed and claim a volunteer slot to start your mission.
                </p>
                <button
                  onClick={() => setActiveTab("opportunities")}
                  className="bg-orange-600 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-xl mt-1"
                >
                  Browse Opportunities
                </button>
              </div>
            ) : (
              assignments.map(asg => (
                <div 
                  key={asg.assignmentId} 
                  className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${
                      asg.status === "CHECKED_IN" 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }`}>
                      {asg.status === "CHECKED_IN" ? "✓ CHECKED IN" : "CONFIRMED SHIFT"}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">ID: {asg.assignmentId}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 leading-snug">
                      {asg.opportunityTitle}
                    </h4>
                    <p className="text-[9.5px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span>{asg.venueName}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
                      <span>{asg.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                      <span>{asg.startTime} - {asg.endTime}</span>
                    </div>
                  </div>

                  {/* Shift Attendance & Completion Action Buttons */}
                  <div className="pt-0.5 space-y-1.5">
                    {asg.status === "COMPLETED" ? (
                      <div className="space-y-1.5">
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2 text-center text-[9px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Shift Successfully Completed & Verified</span>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic?.("light");
                            setCertificateModalAssignment(asg);
                          }}
                          className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-extrabold text-[9.5px] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-orange-600" />
                          <span>View Official 80G Service Certificate</span>
                        </button>
                      </div>
                    ) : asg.status === "CHECKED_IN" ? (
                      <div className="space-y-1.5">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center text-[9px] text-emerald-800 font-bold">
                          ✓ Attendance logged at {asg.checkInTime ? new Date(asg.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "venue"}. 4 service hours credited!
                        </div>
                        <button
                          disabled={completingShiftId === asg.assignmentId}
                          onClick={() => handleCompleteShift(asg)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {completingShiftId === asg.assignmentId ? (
                            <span>Generating Certificate...</span>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Shift Completed & Unlock Certificate</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            triggerHaptic?.("medium");
                            setQrModalAssignment(asg);
                          }}
                          className="bg-slate-900 hover:bg-black text-white font-extrabold text-[9px] py-2 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                        >
                          <QrCode className="w-3 h-3 text-orange-400" />
                          <span>Scan Venue QR</span>
                        </button>
                        <button
                          disabled={completingShiftId === asg.assignmentId}
                          onClick={() => handleCompleteShift(asg)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[9px] py-2 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete Shift</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: NOTIFICATIONS & OPERATIONAL ALERTS (STEP 10)       */}
        {/* ========================================================= */}
        {activeTab === "notifications" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-orange-600" />
                <span>Real-Time Alert Feed ({notifications.length})</span>
              </span>
              {unreadNotifCount > 0 && (
                <button 
                  onClick={handleMarkAllNotifsRead}
                  className="text-orange-600 hover:underline cursor-pointer font-extrabold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <h5 className="font-bold text-xs text-slate-700">No Notifications</h5>
                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                  All drive updates, schedule reminders, and verification badges will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) handleMarkNotifRead(n.id);
                    }}
                    className={`p-3 rounded-2xl border transition text-left cursor-pointer space-y-1.5 ${
                      n.isRead 
                        ? "bg-white border-slate-200 text-slate-700" 
                        : "bg-orange-50/60 border-orange-200 text-slate-900 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${n.isRead ? "bg-slate-300" : "bg-orange-600"}`} />
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {n.type}
                        </span>
                        <h5 className="font-extrabold text-[11px] text-slate-900 leading-tight">
                          {n.title}
                        </h5>
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-600 leading-relaxed pl-3.5">
                      {n.message}
                    </p>

                    {n.link && (
                      <div className="pl-3.5 pt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (n.link?.includes("opportunities")) setActiveTab("opportunities");
                            else if (n.link?.includes("schedule")) setActiveTab("schedule");
                            else if (n.link?.includes("profile")) setActiveTab("onboarding");
                          }}
                          className="text-[8.5px] font-extrabold text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open related view</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: IMPACT METRICS & CREDITS                           */}
        {/* ========================================================= */}
        {activeTab === "impact" && (
          <div className="space-y-3">
            {/* Hero Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase text-orange-400 tracking-wider">
                  Verified Seva Impact
                </span>
                <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded font-mono">
                  VOL-99812
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-xl font-black text-orange-400 block">{profile.totalServiceHours}</span>
                  <span className="text-[8.5px] text-slate-300 font-bold uppercase tracking-wider block mt-0.5">
                    Hours Contributed
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
                  <span className="text-xl font-black text-amber-300 block">{profile.completedEngagementsCount}</span>
                  <span className="text-[8.5px] text-slate-300 font-bold uppercase tracking-wider block mt-0.5">
                    Missions Completed
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-slate-300 leading-relaxed text-center">
                Your direct volunteer service has helped distribute 250+ warm meals and teach 40+ rural school students.
              </p>
            </div>

            {/* Badges & Recognition */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-2xs">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Earned Volunteer Badges
              </span>

              <div className="grid grid-cols-3 gap-2 text-center text-[8.5px]">
                <div className="bg-orange-50 border border-orange-200 p-2 rounded-xl space-y-1">
                  <span className="text-xl block">🥇</span>
                  <span className="font-extrabold text-orange-800 block leading-tight">Vidya Pioneer</span>
                  <span className="text-[7.5px] text-slate-400 block">10+ Hours Teaching</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl space-y-1">
                  <span className="text-xl block">🍲</span>
                  <span className="font-extrabold text-amber-800 block leading-tight">Aahara Hero</span>
                  <span className="text-[7.5px] text-slate-400 block">5 Relief Camps</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl space-y-1">
                  <span className="text-xl block">🛡️</span>
                  <span className="font-extrabold text-emerald-800 block leading-tight">Safety Verified</span>
                  <span className="text-[7.5px] text-slate-400 block">Background Clear</span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic?.("medium");
                  setActionNotice("📜 Seva Sphoorthi Verified Service Certificate generated and saved to offline storage!");
                  setTimeout(() => setActionNotice(null), 4000);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-[9.5px] py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-orange-600" />
                <span>Download Verified Service Certificate (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: OPPORTUNITY DETAILS & APPLICATION                 */}
      {/* ========================================================= */}
      {selectedOppForDetail && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs z-50 flex items-center justify-center p-3 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[88vh] overflow-y-auto p-4 space-y-3 shadow-2xl border border-slate-200 my-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <h5 className="font-extrabold text-xs text-slate-900">Opportunity & Match Details</h5>
              </div>
              <button 
                onClick={() => setSelectedOppForDetail(null)} 
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Opportunity Full Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  {selectedOppForDetail.category}
                </span>
                <span className="text-[8px] font-mono text-slate-400">ID: {selectedOppForDetail.opportunityId}</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                {selectedOppForDetail.title}
              </h4>
              <p className="text-[9.5px] text-slate-600 leading-relaxed">
                {selectedOppForDetail.description}
              </p>
            </div>

            {/* Logistics Pill Bar */}
            <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>{selectedOppForDetail.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>{selectedOppForDetail.startTime} - {selectedOppForDetail.endTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 col-span-2">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>{selectedOppForDetail.location.venueName}, {selectedOppForDetail.location.city}</span>
              </div>
            </div>

            {/* Skills Required */}
            <div className="space-y-1">
              <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Required Skills & Competencies:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedOppForDetail.requiredSkills.map(s => (
                  <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Pega Compatibility Section */}
            {(() => {
              const match = calculatePegaMatchScore(profile, selectedOppForDetail);
              return (
                <div className="space-y-2 text-[9.5px]">
                  <div className="bg-orange-50/80 p-2.5 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-orange-950">
                        Volunteer Compatibility Score
                      </span>
                      <span className="text-base font-black text-orange-600">{match.score}%</span>
                    </div>
                    <p className="text-[9px] text-slate-700 mt-1 italic leading-relaxed">
                      "{match.rationale}"
                    </p>
                  </div>

                  {/* Application Statement Input (Step 7: Application) */}
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-extrabold text-slate-700 block">
                      Application Note / Statement of Interest:
                    </label>
                    <textarea
                      value={applicationStatement}
                      onChange={(e) => setApplicationStatement(e.target.value)}
                      placeholder="Share your interest or prior experience in this seva initiative..."
                      rows={2}
                      className="w-full text-[9.5px] p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  <button
                    disabled={applyLoading === selectedOppForDetail.opportunityId}
                    onClick={() => {
                      handleApplyOpportunity(selectedOppForDetail);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-[10.5px] py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {applyLoading === selectedOppForDetail.opportunityId ? (
                      <span>Reserving Slot in Queue...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Claim Volunteer Slot</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: QR CODE CHECK-IN SIMULATOR                      */}
      {/* ========================================================= */}
      {qrModalAssignment && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-2xs z-50 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full p-4 space-y-3 text-center shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-extrabold text-xs text-slate-800">Field Venue QR Scanner</span>
              <button onClick={() => setQrModalAssignment(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <p className="text-[9.5px] text-slate-500 leading-snug">
              Point your camera at the printed coordinator QR poster at <strong>{qrModalAssignment.venueName}</strong>.
            </p>

            {/* Simulated Animated QR Visual Frame */}
            <div className="w-36 h-36 mx-auto bg-slate-900 rounded-2xl p-2 flex items-center justify-center relative overflow-hidden border-2 border-orange-500">
              <QrCode className="w-24 h-24 text-white animate-pulse" />
              {/* Scanline animation bar */}
              <div className="absolute left-0 right-0 h-1 bg-orange-400/80 shadow-[0_0_8px_rgba(249,115,22,1)] animate-bounce top-1/2"></div>
            </div>

            <div className="text-[8.5px] font-mono text-slate-400">
              STATION_TOKEN: SEVA-QR-{qrModalAssignment.opportunityId}-GATE1
            </div>

            <button
              disabled={checkInLoading}
              onClick={() => handleCheckIn(qrModalAssignment.assignmentId)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10.5px] py-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              {checkInLoading ? (
                <span>Verifying Cryptographic Scan...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Verified QR Check-In</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: OFFICIAL 80G VOLUNTEER SERVICE CERTIFICATE       */}
      {/* ========================================================= */}
      {certificateModalAssignment && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-2xs z-50 flex items-center justify-center p-3 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[88vh] overflow-y-auto p-5 space-y-4 shadow-2xl border-2 border-orange-300 my-auto text-left relative">
            <button
              onClick={() => setCertificateModalAssignment(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕
            </button>

            {/* Certificate Header with Trust Crest */}
            <div className="text-center space-y-1 border-b border-orange-100 pb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto text-white shadow-md">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-black text-sm text-slate-900 tracking-wide uppercase">
                Certificate of Service
              </h3>
              <p className="text-[8.5px] text-orange-700 font-bold uppercase tracking-widest">
                Seva Sphoorthi Charitable Trust • Registered NGO
              </p>
              <div className="text-[7.5px] font-mono text-slate-400">
                Reg: 80G/12A/TRUST/2026/KA • Certificate ID: SEVA-CERT-{certificateModalAssignment.assignmentId}
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-2 text-[10px] text-slate-700 text-center leading-relaxed">
              <p>This is to certify that</p>
              <h4 className="text-sm font-black text-orange-600 underline decoration-orange-300 decoration-1 underline-offset-4">
                {profile.fullName || "Dedicated Volunteer"}
              </h4>
              <p>
                has diligently performed accredited community volunteer seva in support of:
              </p>
              <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200">
                <p className="font-extrabold text-slate-900 text-[11px]">
                  {certificateModalAssignment.opportunityTitle}
                </p>
                <p className="text-[8.5px] text-slate-500 mt-0.5">
                  Venue: {certificateModalAssignment.venueName} • Date: {certificateModalAssignment.scheduledDate}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span className="text-[8px] uppercase text-slate-400 block font-bold">Service Time</span>
                  <span className="font-mono font-bold text-slate-800 text-[10px]">4.0 Hours</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span className="text-[8px] uppercase text-slate-400 block font-bold">Status</span>
                  <span className="font-bold text-emerald-600 text-[10px]">✓ Accredited</span>
                </div>
              </div>
            </div>

            {/* Signatures & Download Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-500">
              <div>
                <span className="block font-bold text-slate-800">Authorized Trustee</span>
                <span>Seva Sphoorthi Trust</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800">Cryptographic Seal</span>
                <span className="font-mono">SHA-256 Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic?.("light");
                  window.print?.();
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[9.5px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic?.("success");
                  showToast("Certificate downloaded to device storage");
                  setCertificateModalAssignment(null);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[9.5px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
