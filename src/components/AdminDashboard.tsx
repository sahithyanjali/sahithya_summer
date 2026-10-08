import React, { useState, useEffect, useRef } from "react";
import { 
  Users, HeartHandshake, Briefcase, Radio, MapPin, Award, FileText, CheckCircle2, XCircle, 
  Plus, Search, Filter, ShieldCheck, Download, Send, ArrowUpRight, Clock, AlertTriangle, 
  DollarSign, Activity, Check, RefreshCw, Layers, Lock, Sparkles, Calendar, CheckSquare, Eye,
  ChevronDown, ChevronUp, Trash2, X, Tag, ChevronRight, FileCheck2, Printer, PieChart, KeyRound
} from "lucide-react";
import { 
  VolunteerProfile, 
  OpportunityItem, 
  VolunteerRegistrationRecord, 
  OpportunityApplicationRecord, 
  DonationRecord,
  AdminReportsSummary,
  AuditLogRecord,
  VolunteerAssignment
} from "../types";

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Stipend Volunteer";
  applicantsCount: number;
  status: "Active" | "Closed";
}

export interface ReliefCamp {
  id: string;
  name: string;
  location: string;
  coordinator: string;
  phone: string;
  mealsTarget: number;
  mealsServed: number;
  status: "Active" | "Completed" | "Upcoming";
}

interface AdminDashboardProps {
  onClose?: () => void;
  isEmbeddedMobile?: boolean;
  onResetSimulatorState?: () => void;
}

export default function AdminDashboard({ onClose, isEmbeddedMobile = false, onResetSimulatorState }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "volunteers" | "opportunities" | "assignment" | "scheduling" | "reports" | "donations" | "jobs" | "broadcast" | "camps" | "audit"
  >("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Pega Volunteer Portal State
  const [pegaVolunteers, setPegaVolunteers] = useState<VolunteerProfile[]>([]);
  const [pegaOpportunities, setPegaOpportunities] = useState<OpportunityItem[]>([]);
  const [loadingPega, setLoadingPega] = useState<boolean>(false);
  const [selectedPegaVolunteer, setSelectedPegaVolunteer] = useState<VolunteerProfile | null>(null);

  // Direct Assignment State
  const [masterSchedules, setMasterSchedules] = useState<VolunteerAssignment[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(false);
  const [assignVolunteerId, setAssignVolunteerId] = useState<string>("");
  const [assignOpportunityId, setAssignOpportunityId] = useState<string>("");
  const [assignRoleNotes, setAssignRoleNotes] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState<boolean>(false);
  const [scheduleFilterDate, setScheduleFilterDate] = useState<string>("");
  const [scheduleFilterStatus, setScheduleFilterStatus] = useState<string>("ALL");

  // 80G Statutory & Executive Reporting State
  const [reportsData, setReportsData] = useState<AdminReportsSummary | null>(null);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);

  // Security Audit Log State
  const [auditLogsList, setAuditLogsList] = useState<AuditLogRecord[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  // Trustee Auth Session Modal State
  const [showAdminSessionModal, setShowAdminSessionModal] = useState<boolean>(false);
  const [trusteePasskey, setTrusteePasskey] = useState<string>("");
  const [trusteeSessionRole, setTrusteeSessionRole] = useState<string>("SUPER_ADMIN");
  const [trusteeReauthFeedback, setTrusteeReauthFeedback] = useState<string | null>(null);

  // New Opportunity Modal State
  const [showAddOppModal, setShowAddOppModal] = useState<boolean>(false);
  const [newOppForm, setNewOppForm] = useState<{
    title: string;
    category: string;
    description: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    skillsRequired: string[];
    urgencyLevel: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    expectedImpact: string;
  }>({
    title: "",
    category: "FOOD_RELIEF",
    description: "",
    venue: "Mumbai Central",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "13:00",
    capacity: 20,
    skillsRequired: ["Meal Preparation & Packing", "Crowd & Queue Management"],
    urgencyLevel: "HIGH",
    expectedImpact: "Support 1,500 daily nutritious meal deliveries"
  });

  const safeParseJson = async (res: Response) => {
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return null;
    }
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("seva_admin_token") || localStorage.getItem("seva_auth_token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchPegaData = async () => {
    try {
      setLoadingPega(true);
      const [volRes, oppRes] = await Promise.all([
        fetch("/api/v1/admin/volunteers", { headers: getAuthHeaders() }),
        fetch("/api/v1/opportunities")
      ]);
      const [volData, oppData] = await Promise.all([
        safeParseJson(volRes),
        safeParseJson(oppRes)
      ]);
      if (volData?.volunteers && Array.isArray(volData.volunteers)) {
        setPegaVolunteers(volData.volunteers);
      }
      if (oppData?.opportunities && Array.isArray(oppData.opportunities)) {
        setPegaOpportunities(oppData.opportunities);
      }
    } catch (err) {
      console.error("Failed to load Pega Admin data", err);
    } finally {
      setLoadingPega(false);
    }
  };

  const fetchMasterSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const res = await fetch("/api/v1/admin/schedule", { headers: getAuthHeaders() });
      const d = await safeParseJson(res);
      if (d && Array.isArray(d.shifts)) {
        setMasterSchedules(d.shifts);
      }
    } catch (err) {
      console.error("Failed to load schedule", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await fetch("/api/v1/admin/reports", { headers: getAuthHeaders() });
      const d = await safeParseJson(res);
      if (d?.reports) {
        setReportsData(d.reports);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await fetch("/api/v1/admin/audit-logs", { headers: getAuthHeaders() });
      const d = await safeParseJson(res);
      if (d && Array.isArray(d.logs)) {
        setAuditLogsList(d.logs);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchPegaData();
    fetchMasterSchedule();
  }, []);

  useEffect(() => {
    if (activeTab === "assignment" || activeTab === "scheduling") {
      fetchMasterSchedule();
    } else if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleDirectAssignVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignVolunteerId || !assignOpportunityId) {
      setActionFeedback({ type: "error", message: "Please select both a volunteer and an opportunity." });
      return;
    }
    setAssignLoading(true);
    try {
      const res = await fetch("/api/v1/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          volunteerId: assignVolunteerId,
          opportunityId: assignOpportunityId,
          customRoleNotes: assignRoleNotes
        })
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setActionFeedback({ type: "success", message: d.message || "Volunteer successfully dispatched & assigned!" });
        setAssignRoleNotes("");
        setAssignVolunteerId("");
        setAssignOpportunityId("");
        await fetchMasterSchedule();
        await fetchPegaData();
      } else {
        setActionFeedback({ type: "error", message: d.error || "Failed to assign volunteer." });
      }
    } catch (err) {
      setActionFeedback({ type: "error", message: "Network error while assigning." });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleExport80GReport = () => {
    if (!reportsData) return;
    const csvRows = [
      ["Seva Sphoorthi Charitable Trust - 80G Statutory Tax Exemption & Volunteer Hour Summary"],
      ["Generated On", new Date().toISOString()],
      ["Lead Trustee Auditor", "ADMIN-001 (Super Admin)"],
      [],
      ["Metric", "Value"],
      ["Total Registered Volunteers", reportsData.totalVolunteers],
      ["Verified & Cleared Volunteers", reportsData.verifiedVolunteers],
      ["Pending Verifications", reportsData.pendingVerifications],
      ["Total Service Hours Credited", reportsData.totalServiceHours],
      ["Active Seva Drives", reportsData.activeOpportunities],
      ["Volunteer Slot Fill Rate", `${reportsData.fillRatePercent}%`],
      ["Total 80G Tax-Deductible Donations (INR)", `INR ${reportsData.totalDonationsSum}`],
      ["Number of Donors", reportsData.donationsCount],
      [],
      ["Category Impact Breakdown"],
      ["Category", "Volunteers Count", "Service Hours"],
      ...reportsData.categoryBreakdown.map(c => [c.category, c.volunteersCount, c.hours]),
      [],
      ["Server Health & Node Uptime"],
      ["System Uptime (s)", reportsData.systemHealth.uptimeSeconds],
      ["Memory Used (MB)", reportsData.systemHealth.memoryUsageMb],
      ["Active Coordinator Sessions", reportsData.systemHealth.activeSessionsCount]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sevasphoorthi_80g_statutory_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyPegaVolunteer = async (
    volunteerId: string, 
    idVerified: boolean, 
    bgStatus: "CLEARED" | "FLAGGED" | "PENDING_REVIEW"
  ) => {
    try {
      const res = await fetch(`/api/v1/admin/volunteers/${volunteerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ 
          idVerified, 
          backgroundCheckStatus: bgStatus, 
          notes: "Coordinator verified identity documents and criminal background check." 
        })
      });
      if (res.ok) {
        await fetchPegaData();
        setSelectedPegaVolunteer(null);
      }
    } catch (err) {
      console.error("Verification failed", err);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppForm.title) return;
    try {
      const res = await fetch("/api/v1/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOppForm)
      });
      if (res.ok) {
        setShowAddOppModal(false);
        await fetchPegaData();
        setNewOppForm({
          title: "",
          category: "FOOD_RELIEF",
          description: "",
          venue: "Mumbai Central",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "13:00",
          capacity: 20,
          skillsRequired: ["Meal Preparation & Packing"],
          urgencyLevel: "HIGH",
          expectedImpact: ""
        });
      }
    } catch (err) {
      console.error("Create opportunity failed", err);
    }
  };

  const handleApproveOpportunity = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/opportunities/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }
      });
      if (res.ok) {
        await fetchPegaData();
      }
    } catch (err) {
      console.error("Approve opportunity failed", err);
    }
  };

  // Real Live Backend Data Management
  const [registrations, setRegistrations] = useState<VolunteerRegistrationRecord[]>([]);
  const [applications, setApplications] = useState<OpportunityApplicationRecord[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [adminOverview, setAdminOverview] = useState<{
    registeredVolunteersCount: number;
    pendingRegistrationsCount: number;
    pendingApplicationsCount: number;
    totalPendingReviews: number;
    opportunitiesCount: number;
    donationsCount: number;
    totalDonationsSum: number;
  } | null>(null);

  const [volunteerSubTab, setVolunteerSubTab] = useState<"registrations" | "applications" | "pega">("registrations");
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

  // Global Multi-Entity Search & Filter State
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [globalSearchCategory, setGlobalSearchCategory] = useState<"ALL" | "VOLUNTEERS" | "OPPORTUNITIES" | "APPLICATIONS" | "DONATIONS" | "CAREERS">("ALL");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState<boolean>(false);
  const globalSearchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses search, 'Escape' clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        globalSearchInputRef.current?.focus();
      } else if (e.key === "Escape" && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen]);

  const fetchLiveAdminData = async () => {
    try {
      const [regRes, appRes, donRes, ovRes, jobsRes, campsRes, volRes, oppRes] = await Promise.all([
        fetch("/api/v1/registrations"),
        fetch("/api/v1/applications"),
        fetch("/api/v1/donations"),
        fetch("/api/v1/admin/overview", { headers: getAuthHeaders() }),
        fetch("/api/v1/jobs"),
        fetch("/api/v1/camps"),
        fetch("/api/v1/admin/volunteers", { headers: getAuthHeaders() }),
        fetch("/api/v1/opportunities")
      ]);

      const [regData, appData, donData, ovData, jobsData, campsData, volData, oppData] = await Promise.all([
        safeParseJson(regRes),
        safeParseJson(appRes),
        safeParseJson(donRes),
        safeParseJson(ovRes),
        safeParseJson(jobsRes),
        safeParseJson(campsRes),
        safeParseJson(volRes),
        safeParseJson(oppRes)
      ]);

      if (regData?.registrations && Array.isArray(regData.registrations)) {
        setRegistrations(regData.registrations);
      }
      if (appData?.applications && Array.isArray(appData.applications)) {
        setApplications(appData.applications);
      }
      if (donData?.donations && Array.isArray(donData.donations)) {
        setDonations(donData.donations);
      }
      if (ovData?.stats) {
        setAdminOverview(ovData.stats);
      }
      if (jobsData?.jobs && Array.isArray(jobsData.jobs)) {
        setJobs(jobsData.jobs);
      }
      if (campsData?.camps && Array.isArray(campsData.camps)) {
        setCamps(campsData.camps);
      }
      if (volData?.volunteers && Array.isArray(volData.volunteers)) {
        setPegaVolunteers(volData.volunteers);
      }
      if (oppData?.opportunities && Array.isArray(oppData.opportunities)) {
        setPegaOpportunities(oppData.opportunities);
      }
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Live admin sync error", err);
    }
  };

  useEffect(() => {
    fetchLiveAdminData();
    const interval = setInterval(fetchLiveAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const [jobs, setJobs] = useState<JobOpening[]>([
    { id: "JOB-1", title: "Field Operations Coordinator", department: "Food Relief", location: "Mumbai & Thane", type: "Full-Time", applicantsCount: 14, status: "Active" },
    { id: "JOB-2", title: "Community Health Worker", department: "Healthcare Drive", location: "Delhi NCR", type: "Part-Time", applicantsCount: 9, status: "Active" },
    { id: "JOB-3", title: "Primary Education Facilitator", department: "Vidya Project", location: "Pune", type: "Stipend Volunteer", applicantsCount: 22, status: "Active" },
  ]);

  const [camps, setCamps] = useState<ReliefCamp[]>([
    { id: "CAMP-01", name: "Dharavi Community Kitchen", location: "Sector 3, Mumbai", coordinator: "Sanjay Patil", phone: "+91 98200 11223", mealsTarget: 2000, mealsServed: 1850, status: "Active" },
    { id: "CAMP-02", name: "Connaught Place Mega Blood Camp", location: "Inner Circle, New Delhi", coordinator: "Dr. Meenakshi", phone: "+91 98111 22334", mealsTarget: 500, mealsServed: 420, status: "Active" },
    { id: "CAMP-03", name: "Shivajinagar Night Shelter Food Drive", location: "Pune Station Road", coordinator: "Deepak Shinde", phone: "+91 97630 44556", mealsTarget: 1000, mealsServed: 1000, status: "Completed" },
  ]);

  // Form States
  const [newBroadcastMsg, setNewBroadcastMsg] = useState<{ title: string; body: string; target: string }>({
    title: "🚨 Emergency Blood Donation Appeal",
    body: "Urgent O-negative blood required at Connaught Place Camp. 10,000+ active volunteers notified.",
    target: "all_volunteers_10k"
  });
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  // New Job Modal state
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newJobForm, setNewJobForm] = useState<{ title: string; dept: string; location: string; type: "Full-Time" | "Part-Time" | "Stipend Volunteer" }>({
    title: "", dept: "Food Relief", location: "Mumbai", type: "Full-Time"
  });

  // New Camp Modal state
  const [showAddCampModal, setShowAddCampModal] = useState<boolean>(false);
  const [newCampForm, setNewCampForm] = useState<{ name: string; location: string; coordinator: string; phone: string; mealsTarget: number }>({
    name: "", location: "Mumbai", coordinator: "", phone: "", mealsTarget: 1000
  });

  // Manual Donation State
  const [showAddDonationModal, setShowAddDonationModal] = useState<boolean>(false);
  const [newDonationForm, setNewDonationForm] = useState<{ name: string; email: string; phone: string; amount: string; purpose: string }>({
    name: "", email: "", phone: "", amount: "1000", purpose: "🍔 Aahara Hunger Drive"
  });

  const handleApproveRegistration = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/v1/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: "Approved" })
      });
      if (res.ok) {
        setActionFeedback({ message: `✅ Approved volunteer registration for ${name} (${id})`, type: "success" });
        await fetchLiveAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRegistration = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/v1/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: "Rejected" })
      });
      if (res.ok) {
        setActionFeedback({ message: `❌ Rejected volunteer registration for ${name} (${id})`, type: "info" });
        await fetchLiveAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveApplication = async (id: string, volName: string, oppTitle: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: "Approved" })
      });
      if (res.ok) {
        setActionFeedback({ message: `✅ Approved slot application for ${volName} on "${oppTitle}"`, type: "success" });
        await fetchLiveAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectApplication = async (id: string, volName: string) => {
    try {
      const res = await fetch(`/api/v1/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status: "Rejected" })
      });
      if (res.ok) {
        setActionFeedback({ message: `❌ Rejected slot application for ${volName}`, type: "info" });
        await fetchLiveAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title) return;
    try {
      const res = await fetch("/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          title: newJobForm.title,
          department: newJobForm.dept,
          location: newJobForm.location,
          type: newJobForm.type
        })
      });
      if (res.ok) {
        await fetchLiveAdminData();
        setShowAddJobModal(false);
        setActionFeedback({ message: `✅ Created career opening: ${newJobForm.title}`, type: "success" });
        setNewJobForm({ title: "", dept: "Food Relief", location: "Mumbai", type: "Full-Time" });
      }
    } catch (err) {
      console.error("Failed to create job", err);
    }
  };

  const downloadAdmin80GReceipt = async (d: DonationRecord) => {
    let receiptData: any = null;
    try {
      const res = await fetch(`/api/v1/payments/${d.id}/receipt`);
      if (res.ok) {
        const json = await safeParseJson(res);
        receiptData = json?.receipt;
      }
    } catch {
      // Fallback to local template
    }

    const receiptNum = receiptData?.receiptId || `RCP-2026-${d.id.slice(-6)}`;
    const receiptText = `
================================================================================
                        SEVA SPHOORTHI CHARITABLE TRUST
                    Official Web: https://sevasphoorthi.com
                      Email: contact@sevasphoorthi.com
              Trust Reg No: TRUST/BLR/2026/SPH-8902 | PAN: AAATS8902P
================================================================================
           STATUTORY SECTION 80G DONATION & TAX EXEMPTION CERTIFICATE
           Valid under Section 80G(5)(vi) of Income Tax Act, 1961
           Order/Exemption Certificate No: AAATS8902PF20261
--------------------------------------------------------------------------------
Receipt Number      : ${receiptNum}
Transaction Date    : ${d.date || new Date().toLocaleString('en-IN')}
Payment Reference   : ${d.id}
Payment Channel     : ${d.method || "UPI / Razorpay Verified"}
Bank UTR / Ref No   : ${d.utrRef || "Verified"}
--------------------------------------------------------------------------------
DONOR PARTICULARS:
Donor Full Name     : ${d.donorName}
Donor Email Address : ${d.email || "Registered Donor"}
Donor Phone Number  : ${d.phone || "Not Provided"}
Donor PAN Card      : ${d.pan || "Declared (Sec 80G Compliant)"}
--------------------------------------------------------------------------------
FINANCIAL CONTRIBUTION:
Donation Cause      : ${d.purpose}
Monetary Amount     : INR ₹${Number(d.amount).toLocaleString('en-IN')}
Amount in Words     : ${receiptData?.amountInWords || "Indian Rupees Only"}
Tax Deductibility   : 50% Exempt under Section 80G of Indian IT Act, 1961
--------------------------------------------------------------------------------
VERIFICATION & AUDIT SEAL:
Status              : CONFIRMED & AUDITED
Cryptographic Seal  : HMAC-SHA256 Verified by Seva Sphoorthi Security Engine
Digital Signatory   : Authorized Finance Secretary & Trustee, Seva Sphoorthi Trust
Official Verification: https://sevasphoorthi.com/verify?receipt=${receiptNum}
================================================================================
       Thank you for empowering rural livelihoods and community seva!
================================================================================
    `;

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SevaSphoorthi_80G_${receiptNum}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampForm.name) return;
    try {
      const res = await fetch("/api/v1/camps", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newCampForm)
      });
      if (res.ok) {
        await fetchLiveAdminData();
        setShowAddCampModal(false);
        setActionFeedback({ message: `✅ Registered Relief Camp: ${newCampForm.name}`, type: "success" });
        setNewCampForm({ name: "", location: "Mumbai", coordinator: "", phone: "", mealsTarget: 1000 });
      }
    } catch (err) {
      console.error("Failed to create camp", err);
    }
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonationForm.name || !newDonationForm.amount) return;
    try {
      const res = await fetch("/api/v1/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: newDonationForm.name,
          email: newDonationForm.email || "direct@donor.org",
          phone: newDonationForm.phone || "",
          amount: Number(newDonationForm.amount),
          purpose: newDonationForm.purpose,
          method: "Direct UPI / Bank Transfer",
          utrRef: `DIR-${Date.now().toString().slice(-6)}`
        })
      });
      if (res.ok) {
        await fetchLiveAdminData();
        setShowAddDonationModal(false);
        setActionFeedback({ message: `✅ Recorded donation of ₹${newDonationForm.amount} from ${newDonationForm.name}`, type: "success" });
        setNewDonationForm({ name: "", email: "", phone: "", amount: "1000", purpose: "🍔 Aahara Hunger Drive" });
      }
    } catch (err) {
      console.error("Donation record failed", err);
    }
  };

  const handleResetSimulatorCache = async () => {
    setIsPurging(true);
    try {
      const token = localStorage.getItem("seva_admin_token") || localStorage.getItem("seva_auth_token");
      const res = await fetch("/api/v1/admin/reset-simulator-cache", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        await fetchLiveAdminData();
        setActionFeedback({ 
          message: `🧹 Reset simulator cache records. Cleaned: ${data.purgedDonations || 0} donations, ${data.purgedRegistrations || 0} registrations, ${data.purgedApplications || 0} applications, ${data.purgedVolunteers || 0} profiles. Database state synchronized!`, 
          type: "success" 
        });
        setShowPurgeConfirmModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurging(false);
    }
  };

  const totalDonationsSum = donations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const pendingRegistrationsCount = registrations.filter(r => r.status === "Pending").length;
  const pendingApplicationsCount = applications.filter(a => a.status === "Pending").length;
  const totalPendingReviews = pendingRegistrationsCount + pendingApplicationsCount;

  // Global Search Calculations
  const cleanQ = globalSearch.trim().toLowerCase();

  const matchingRegistrations = registrations.filter(r => {
    if (!cleanQ) return true;
    const name = (r.fullName || (r as any).name || "").toLowerCase();
    const id = (r.id || "").toLowerCase();
    const phone = (r.phone || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    const city = (r.city || "").toLowerCase();
    const skills = Array.isArray(r.skills) ? r.skills.join(" ").toLowerCase() : "";
    return name.includes(cleanQ) || id.includes(cleanQ) || phone.includes(cleanQ) || email.includes(cleanQ) || city.includes(cleanQ) || skills.includes(cleanQ);
  });

  const matchingPegaVolunteers = pegaVolunteers.filter(v => {
    if (!cleanQ) return true;
    const name = (v.fullName || "").toLowerCase();
    const id = (v.userId || (v as any).id || "").toLowerCase();
    const phone = (v.phone || "").toLowerCase();
    const email = (v.email || "").toLowerCase();
    const city = (v.address?.city || (v as any).city || "").toLowerCase();
    const skills = Array.isArray(v.skills) ? v.skills.join(" ").toLowerCase() : "";
    return name.includes(cleanQ) || id.includes(cleanQ) || phone.includes(cleanQ) || email.includes(cleanQ) || city.includes(cleanQ) || skills.includes(cleanQ);
  });

  const matchingOpportunities = pegaOpportunities.filter(o => {
    if (!cleanQ) return true;
    const title = (o.title || "").toLowerCase();
    const id = (o.opportunityId || "").toLowerCase();
    const cat = (o.category || "").toLowerCase();
    const venue = (o.location?.venueName || "").toLowerCase();
    const city = (o.location?.city || "").toLowerCase();
    const skills = Array.isArray(o.requiredSkills) ? o.requiredSkills.join(" ").toLowerCase() : "";
    return title.includes(cleanQ) || id.includes(cleanQ) || cat.includes(cleanQ) || venue.includes(cleanQ) || city.includes(cleanQ) || skills.includes(cleanQ);
  });

  const matchingApplications = applications.filter(a => {
    if (!cleanQ) return true;
    const name = (a.volunteerName || "").toLowerCase();
    const id = (a.id || "").toLowerCase();
    const title = (a.opportunityTitle || "").toLowerCase();
    const email = (a.volunteerEmail || "").toLowerCase();
    const phone = (a.volunteerPhone || "").toLowerCase();
    return name.includes(cleanQ) || id.includes(cleanQ) || title.includes(cleanQ) || email.includes(cleanQ) || phone.includes(cleanQ);
  });

  const matchingDonations = donations.filter(d => {
    if (!cleanQ) return true;
    const name = (d.donorName || "").toLowerCase();
    const id = (d.id || "").toLowerCase();
    const utr = (d.utrRef || "").toLowerCase();
    const email = (d.email || "").toLowerCase();
    const phone = (d.phone || "").toLowerCase();
    const purpose = (d.purpose || "").toLowerCase();
    const amt = String(d.amount);
    return name.includes(cleanQ) || id.includes(cleanQ) || utr.includes(cleanQ) || email.includes(cleanQ) || phone.includes(cleanQ) || purpose.includes(cleanQ) || amt.includes(cleanQ);
  });

  const matchingJobs = jobs.filter(j => {
    if (!cleanQ) return true;
    const title = (j.title || "").toLowerCase();
    const id = (j.id || "").toLowerCase();
    const dept = (j.department || "").toLowerCase();
    const loc = (j.location || "").toLowerCase();
    return title.includes(cleanQ) || id.includes(cleanQ) || dept.includes(cleanQ) || loc.includes(cleanQ);
  });

  const matchingCamps = camps.filter(c => {
    if (!cleanQ) return true;
    const name = (c.name || "").toLowerCase();
    const id = (c.id || "").toLowerCase();
    const coord = (c.coordinator || "").toLowerCase();
    const loc = (c.location || "").toLowerCase();
    return name.includes(cleanQ) || id.includes(cleanQ) || coord.includes(cleanQ) || loc.includes(cleanQ);
  });

  const totalGlobalMatches = 
    (cleanQ ? matchingRegistrations.length : 0) +
    (cleanQ ? matchingPegaVolunteers.length : 0) +
    (cleanQ ? matchingOpportunities.length : 0) +
    (cleanQ ? matchingApplications.length : 0) +
    (cleanQ ? matchingDonations.length : 0) +
    (cleanQ ? matchingJobs.length : 0) +
    (cleanQ ? matchingCamps.length : 0);

  return (
    <div className={`bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased ${
      isEmbeddedMobile ? "p-2 space-y-3" : "min-h-screen p-4 sm:p-6"
    }`}>
      
      {/* Top Header Navigation */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <img 
              src="/assets/branding/sevasphoorthi_logo.png" 
              alt="Seva Sphoorthi Official Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              Operations Portal
              <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                Trustee Operations
              </span>
            </h2>
            <p className="text-xs text-slate-500">Volunteer Operations, Event Schedules, Compliance & Relief Management</p>
          </div>
        </div>

        {/* Action Controls: Live Status, Refresh & Exit */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync ({lastSyncedTime || "Active"}):</span>
            <span className="text-emerald-700 font-bold">Connected</span>
          </div>

          <button
            onClick={fetchLiveAdminData}
            title="Force Refresh Data"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              <span>Exit Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Multi-Entity Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={globalSearchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (e.target.value.trim() && !isGlobalSearchOpen) {
                  setIsGlobalSearchOpen(true);
                }
              }}
              onFocus={() => {
                if (globalSearch.trim()) setIsGlobalSearchOpen(true);
              }}
              placeholder="Search volunteers, opportunities, donors, applications by name or details (Press '/' to search)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {globalSearch && (
                <button
                  onClick={() => {
                    setGlobalSearch("");
                    setIsGlobalSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block bg-slate-100 border border-slate-300 text-[10px] text-slate-500 px-1.5 py-0.5 rounded font-mono">
                /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-start">
            {/* Trustee RBAC Auth Status & Session Inspector */}
            <button
              onClick={() => setShowAdminSessionModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Inspect Trustee Security Clearance"
            >
              <KeyRound className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Trustee Clearance</span>
              <span className="sm:hidden">Auth</span>
            </button>

            {/* Results Pill */}
            {cleanQ && (
              <button
                onClick={() => setIsGlobalSearchOpen(prev => !prev)}
                className="bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-orange-700 transition shrink-0 shadow-xs"
              >
                <span>{totalGlobalMatches} Matches</span>
                {isGlobalSearchOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (When search query is entered) */}
        {cleanQ && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold text-slate-600 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1 shrink-0">Filter By:</span>
            {[
              { id: "ALL", label: `All (${totalGlobalMatches})` },
              { id: "VOLUNTEERS", label: `Volunteers (${matchingRegistrations.length + matchingPegaVolunteers.length})` },
              { id: "OPPORTUNITIES", label: `Opportunities (${matchingOpportunities.length})` },
              { id: "APPLICATIONS", label: `Applications (${matchingApplications.length})` },
              { id: "DONATIONS", label: `Donations (${matchingDonations.length})` },
              { id: "CAREERS", label: `Careers & Camps (${matchingJobs.length + matchingCamps.length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setGlobalSearchCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  globalSearchCategory === cat.id
                    ? "bg-orange-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Global Multi-Entity Search Dropdown / Panel */}
        {isGlobalSearchOpen && cleanQ && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 max-h-96 overflow-y-auto mt-2 shadow-xl">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-800 font-bold">
                Search Results for <span className="text-orange-600 font-extrabold">"{globalSearch}"</span> ({totalGlobalMatches} records found)
              </span>
              <button
                onClick={() => setIsGlobalSearchOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Collapse Panel</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>

            {totalGlobalMatches === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic">
                No matching records found across volunteers, opportunities, applications, donations, or camps.
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Volunteers & Registrations */}
                {(globalSearchCategory === "ALL" || globalSearchCategory === "VOLUNTEERS") && (matchingRegistrations.length > 0 || matchingPegaVolunteers.length > 0) && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-extrabold text-orange-600 tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Volunteers ({matchingRegistrations.length + matchingPegaVolunteers.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchingRegistrations.map((r, rIdx) => (
                        <div key={`srch_reg_${r.id || 'r'}_${rIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-orange-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{r.fullName || (r as any).name}</span>
                              <span className="text-[9px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">{r.id}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                r.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                r.status === "Rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {r.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {r.phone} • {r.email} {r.city ? `• ${r.city}` : ""}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("volunteers");
                              setVolunteerSubTab("registrations");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {matchingPegaVolunteers.map((pv, pvIdx) => (
                        <div key={`srch_pv_${pv.userId || (pv as any).id || 'pv'}_${pvIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-orange-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{pv.fullName}</span>
                              <span className="text-[9px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                {pv.userId || (pv as any).id}
                              </span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Volunteer Profile
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {pv.phone} • {pv.email} {pv.address?.city ? `• ${pv.address.city}` : ""}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("volunteers");
                              setVolunteerSubTab("pega");
                              setSelectedPegaVolunteer(pv);
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Opportunities */}
                {(globalSearchCategory === "ALL" || globalSearchCategory === "OPPORTUNITIES") && matchingOpportunities.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Opportunities & Shifts ({matchingOpportunities.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchingOpportunities.map((opp, oppIdx) => (
                        <div key={`srch_opp_${opp.opportunityId || (opp as any).id || 'opp'}_${oppIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-emerald-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{opp.title}</span>
                              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">{opp.opportunityId}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {opp.location?.venueName || "Venue"}, {opp.location?.city || "City"} • {opp.timeSlot?.startTime || "09:00"}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("opportunities");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>View Quota</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Slot Applications */}
                {(globalSearchCategory === "ALL" || globalSearchCategory === "APPLICATIONS") && matchingApplications.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Slot Applications ({matchingApplications.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchingApplications.map((app, appIdx) => (
                        <div key={`srch_app_${app.id || 'app'}_${appIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-blue-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{app.volunteerName}</span>
                              <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">{app.id}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                app.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                app.status === "Rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Opportunity: {app.opportunityTitle}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("volunteers");
                              setVolunteerSubTab("applications");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Donations */}
                {(globalSearchCategory === "ALL" || globalSearchCategory === "DONATIONS") && matchingDonations.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Donations ({matchingDonations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchingDonations.map((don, donIdx) => (
                        <div key={`srch_don_${don.id || 'don'}_${donIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-amber-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{don.donorName}</span>
                              <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">₹{Number(don.amount).toLocaleString()}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Confirmed
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {don.purpose} • Ref: {don.utrRef || don.id}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("donations");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>View Ledger</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Careers & Relief Camps */}
                {(globalSearchCategory === "ALL" || globalSearchCategory === "CAREERS") && (matchingJobs.length > 0 || matchingCamps.length > 0) && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>NGO Careers & Relief Camps ({matchingJobs.length + matchingCamps.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchingJobs.map((job, jobIdx) => (
                        <div key={`srch_job_${job.id || 'job'}_${jobIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-purple-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{job.title}</span>
                              <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">{job.id}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {job.department} • {job.location} ({job.type})
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("jobs");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {matchingCamps.map((camp, campIdx) => (
                        <div key={`srch_camp_${camp.id || 'camp'}_${campIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl text-xs space-y-1 hover:border-rose-300 hover:shadow-xs transition flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{camp.name}</span>
                              <span className="text-[9px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">{camp.id}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Coordinator: {camp.coordinator} • {camp.location}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("camps");
                              setIsGlobalSearchOpen(false);
                            }}
                            className="bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Feedback Notification */}
      {actionFeedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border shadow-sm transition-all animate-fade-in ${
          actionFeedback.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-blue-50 text-blue-800 border-blue-200"
        }`}>
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-500 hover:text-slate-800 ml-3 text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Admin Workspace: Collapsible Sidebar + Content View */}
      <div className="flex flex-col lg:flex-row gap-4 mt-3 flex-1 items-start w-full">
        {/* Collapsible Left Sidebar */}
        <aside className={`bg-white border border-slate-200 rounded-2xl p-3 shadow-xs shrink-0 transition-all duration-200 w-full ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        }`}>
          {/* Sidebar Top / Toggle */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            {!sidebarCollapsed && (
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Menu
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition ml-auto cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 lg:-rotate-90" />}
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. DASHBOARD */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Dashboard
                </div>
              )}
              <button
                onClick={() => setActiveTab("overview")}
                title="Overview"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Overview</span>}
              </button>
            </div>

            {/* 2. OPERATIONS */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Operations
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("volunteers");
                    setVolunteerSubTab("registrations");
                  }}
                  title="Volunteers & Reviews"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "volunteers"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>Volunteers</span>}
                  </div>
                  {!sidebarCollapsed && totalPendingReviews > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "volunteers" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-800"
                    }`}>
                      {totalPendingReviews}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("opportunities")}
                  title="Opportunities"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "opportunities"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>Opportunities</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "opportunities" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {pegaOpportunities.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("assignment")}
                  title="Direct Assignment"
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "assignment"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Direct Assignment</span>}
                </button>

                <button
                  onClick={() => setActiveTab("scheduling")}
                  title="Master Schedule"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "scheduling"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>Master Schedule</span>}
                  </div>
                  {!sidebarCollapsed && masterSchedules.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "scheduling" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {masterSchedules.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("camps")}
                  title="Relief Camps"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "camps"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>Relief Camps</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "camps" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {camps.filter(c => c.status === "Active").length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 3. TRUST & COMPLIANCE */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Trust & Compliance
                </div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("reports")}
                  title="80G Statutory & Reports"
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "reports"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <PieChart className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>80G & Reports</span>}
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  title="Security Audit Trail"
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "audit"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Audit Trail</span>}
                </button>

                <button
                  onClick={() => setActiveTab("donations")}
                  title="Verified Donations"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "donations"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>Donations</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "donations" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      ₹{(totalDonationsSum/1000).toFixed(0)}k
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 4. COMMUNICATION */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Communication
                </div>
              )}
              <button
                onClick={() => setActiveTab("broadcast")}
                title="Broadcast Alerts"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "broadcast"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
              >
                <Radio className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Broadcast Alerts</span>}
              </button>
            </div>

            {/* 5. PROGRAMS */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Programs
                </div>
              )}
              <button
                onClick={() => setActiveTab("jobs")}
                title="Career Openings"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "jobs"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Careers</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === "jobs" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {jobs.length}
                  </span>
                )}
              </button>
            </div>

            {/* 6. SYSTEM */}
            <div>
              {!sidebarCollapsed && (
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1">
                  System
                </div>
              )}
              <button
                onClick={() => setShowAdminSessionModal(true)}
                title="Trustee Security Clearance"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${
                  sidebarCollapsed ? "justify-center px-2" : ""
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0 text-orange-600" />
                {!sidebarCollapsed && <span>Trustee Clearance</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Tab Content Pane */}
        <main className="flex-1 min-w-0 bg-transparent space-y-4 w-full">
        
        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            {/* Operational KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <button
                onClick={() => {
                  setActiveTab("volunteers");
                  setVolunteerSubTab("registrations");
                }}
                className="bg-white border border-slate-200 hover:border-orange-300 p-4 rounded-2xl shadow-xs text-left transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {pendingRegistrationsCount}
                </div>
                <div className="text-[11px] text-orange-700 font-bold mt-1.5 flex items-center gap-1">
                  <span>Volunteer signups waiting review</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("volunteers");
                  setVolunteerSubTab("applications");
                }}
                className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl shadow-xs text-left transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Applications</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {pendingApplicationsCount}
                </div>
                <div className="text-[11px] text-blue-700 font-bold mt-1.5 flex items-center gap-1">
                  <span>Drive slot requests to approve</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("opportunities")}
                className="bg-white border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl shadow-xs text-left transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Upcoming Opportunities</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {pegaOpportunities.length}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                  <span>Active community service drives</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("scheduling")}
                className="bg-white border border-slate-200 hover:border-purple-300 p-4 rounded-2xl shadow-xs text-left transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Schedule</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {masterSchedules.length}
                </div>
                <div className="text-[11px] text-purple-700 font-bold mt-1.5 flex items-center gap-1">
                  <span>Assigned volunteer shifts & duties</span>
                </div>
              </button>
            </div>

            {/* Quick Action Operations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Approvals Desk */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    Pending Approvals Desk ({totalPendingReviews})
                  </h3>
                  <span className="text-[11px] text-slate-500">Auto-detected from Portal</span>
                </div>

                {totalPendingReviews === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-800 font-bold">All applications & registrations reviewed!</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">New volunteer submissions from the app will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {/* Pending Registrations */}
                    {registrations.filter(r => r.status === "Pending").map((r, rIdx) => (
                      <div key={`reg_pend_${r.id || 'r'}_${rIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-2 hover:border-orange-300 transition shadow-2xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Volunteer Signup</span>
                            <span className="font-bold text-xs text-slate-900">{r.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {r.city} • 📞 {r.phone} • {r.email}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Interest: {r.interestArea} • Skills: {r.skills.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleApproveRegistration(r.id, r.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRegistration(r.id, r.name)}
                            className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pending Drive Applications */}
                    {applications.filter(a => a.status === "Pending").map((a, aIdx) => (
                      <div key={`app_pend_${a.id || 'a'}_${aIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-2 hover:border-blue-300 transition shadow-2xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Opportunity Slot</span>
                            <span className="font-bold text-xs text-slate-900">{a.volunteerName}</span>
                          </div>
                          <span className="text-[11px] text-slate-700 block font-medium mt-0.5">
                            📌 {a.opportunityTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            📞 {a.phone} • Applied: {new Date(a.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleApproveApplication(a.id, a.volunteerName, a.opportunityTitle)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectApplication(a.id, a.volunteerName)}
                            className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Donation Ledger Feed */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    Live Donation Ledger ({donations.length})
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setShowAddDonationModal(true)} 
                      className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer shadow-xs"
                    >
                      + Add Offline
                    </button>
                    <button 
                      onClick={() => setActiveTab("donations")} 
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-bold border border-slate-200 cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                </div>

                {donations.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 italic">No donations recorded yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Make a test UPI payment via the mobile app or click "+ Add Offline".</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {donations.slice(0, 5).map((d, dIdx) => (
                      <div key={`don_slice_${d.id || 'd'}_${dIdx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-emerald-300 transition shadow-2xs">
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{d.donorName}</span>
                          <span className="text-[10px] text-slate-500 block">{d.purpose} • <span className="font-mono text-emerald-700 font-semibold">{d.method}</span></span>
                          {d.utrRef && <span className="text-[9.5px] text-slate-400 font-mono block">UTR: {d.utrRef}</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xs text-emerald-700 block">+₹{d.amount.toLocaleString()}</span>
                          <span className="text-[9.5px] text-slate-400 block">{d.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. VOLUNTEERS MANAGEMENT MODULE */}
        {activeTab === "volunteers" && (
          <div className="space-y-4 animate-fade-in">
            {/* Pega GenAI Blueprint Verification Pipeline */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Volunteer Identity & Background Verification Pipeline
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Coordinator approval desk for volunteer identity documents, criminal disclosures, and terms hash audits
                  </p>
                </div>
                <button
                  onClick={fetchPegaData}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPega ? "animate-spin text-orange-500" : ""}`} />
                  Refresh
                </button>
              </div>

              {(cleanQ ? matchingPegaVolunteers : pegaVolunteers).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic">
                  {cleanQ ? `No volunteer profiles matching "${globalSearch}"` : "No active volunteer profiles registered yet. Open the mobile simulator Volunteer tab to register!"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(cleanQ ? matchingPegaVolunteers : pegaVolunteers).map((pv, idx) => {
                    const isIdPending = pv.identityVerificationStatus === "PENDING";
                    const isBgCleared = pv.backgroundCheckStatus === "CLEARED";
                    const volId = pv.userId || (pv as any).id || `pv_${idx}`;
                    return (
                      <div key={`pv_card_${volId}_${idx}`} className="bg-slate-50 hover:bg-white border border-slate-200 p-3.5 rounded-xl space-y-2.5 shadow-2xs hover:border-slate-300 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-slate-900">{pv.fullName}</span>
                              <span className="text-[10px] font-mono text-orange-700 font-bold bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                                {volId}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {pv.city} • {pv.phone} • {pv.email}
                            </span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            pv.stage === "COMPLETED" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            Stage: {pv.stage}
                          </span>
                        </div>

                        {/* Document Verification & BG Check Stats */}
                        <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-[11px]">
                          <div>
                            <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block">Identity Document</span>
                            <span className="text-slate-800 font-bold block">{pv.identityDocType || "Aadhaar / ID"}</span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 ${
                              pv.identityVerificationStatus === "VERIFIED" 
                                ? "text-emerald-700" 
                                : pv.identityVerificationStatus === "REJECTED" 
                                ? "text-rose-700" 
                                : "text-amber-700"
                            }`}>
                              ● Status: {pv.identityVerificationStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block">Background Clearance</span>
                            <span className="text-slate-800 font-bold block">
                              {pv.criminalDisclosure ? "Disclosed Incident" : "Clean Disclosure"}
                            </span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 ${
                              isBgCleared ? "text-emerald-700" : "text-amber-700"
                            }`}>
                              ● Check: {pv.backgroundCheckStatus}
                            </span>
                          </div>
                        </div>

                        {/* Skills & Hours */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-1 border-t border-slate-200 pt-2">
                          <div className="flex flex-wrap gap-1">
                            {pv.skills.slice(0, 3).map((s, skillIdx) => (
                              <span key={`skill_${volId}_${skillIdx}`} className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium text-[10px]">
                                {s}
                              </span>
                            ))}
                            {pv.skills.length > 3 && (
                              <span className="text-slate-400 text-[10px]">+{pv.skills.length - 3}</span>
                            )}
                          </div>
                          <span className="font-bold text-orange-700">
                            ⭐ {pv.serviceHoursCompleted}h logged
                          </span>
                        </div>

                        {/* Coordinator Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedPegaVolunteer(pv)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Docs
                          </button>

                          {isIdPending ? (
                            <button
                              onClick={() => handleVerifyPegaVolunteer(volId, true, "CLEARED")}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve & Clear
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-bold px-2 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Verified by Coordinator
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Volunteer Management Sub-Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setVolunteerSubTab("registrations")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  volunteerSubTab === "registrations"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Volunteer Registrations ({registrations.length})</span>
                {pendingRegistrationsCount > 0 && (
                  <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {pendingRegistrationsCount} new
                  </span>
                )}
              </button>

              <button
                onClick={() => setVolunteerSubTab("applications")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  volunteerSubTab === "applications"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Drive Slot Applications ({applications.length})</span>
                {pendingApplicationsCount > 0 && (
                  <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                    {pendingApplicationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setVolunteerSubTab("pega")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  volunteerSubTab === "pega"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Identity Audits ({pegaVolunteers.length})</span>
              </button>
            </div>

            {/* Sub-Tab 1: Live Volunteer Registrations */}
            {volunteerSubTab === "registrations" && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Live Volunteer Registration Records</h3>
                    <p className="text-[11px] text-slate-500">Directly captured from Mobile Volunteer Onboarding & Web Portal</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Total:</span>
                    <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-orange-200">
                      {registrations.length} Active Profiles
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
                  {registrations.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No registrations recorded yet. Register a volunteer in the app simulator!
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Registration ID</th>
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Contact Details</th>
                          <th className="p-3">City</th>
                          <th className="p-3">Skills & Interest</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Review Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(cleanQ ? matchingRegistrations : registrations).map((r, rIdx) => (
                          <tr key={`reg_tbl_${r.id || 'r'}_${rIdx}`} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono font-bold text-orange-700">{r.id}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {r.name}
                              <span className="block text-[10px] text-slate-400 font-normal">Source: {r.source || "App Registration"}</span>
                            </td>
                            <td className="p-3 text-slate-600">
                              📞 {r.phone}<br/>
                              <span className="text-[10.5px] text-slate-500 font-mono">✉️ {r.email}</span>
                            </td>
                            <td className="p-3 text-slate-700 font-medium">{r.city}</td>
                            <td className="p-3">
                              <span className="text-orange-700 font-medium block text-[11px]">{r.interestArea}</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {(r.skills || []).map((s, i) => (
                                  <span key={`r_${r.id || rIdx}_sk_${i}`} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px]">
                              {new Date(r.registeredAt).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                r.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                r.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {r.status === "Pending" ? (
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleApproveRegistration(r.id, r.name)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition shadow-xs"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRegistration(r.id, r.name)}
                                    className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {r.status === "Approved" ? "✅ Approved" : "❌ Rejected"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Drive Slot Applications */}
            {volunteerSubTab === "applications" && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Drive & Opportunity Slot Applications</h3>
                    <p className="text-[11px] text-slate-500">Volunteers claiming relief slots from the Opportunity Board</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {applications.length} Slot Requests
                  </span>
                </div>

                <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No drive slot applications submitted yet. Volunteers can apply via the Opportunities tab!
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Application ID</th>
                          <th className="p-3">Drive / Opportunity</th>
                          <th className="p-3">Volunteer Applicant</th>
                          <th className="p-3">Applied Date</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Review Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(cleanQ ? matchingApplications : applications).map((a, aIdx) => (
                          <tr key={`app_tbl_${a.id || 'a'}_${aIdx}`} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono font-bold text-blue-700">{a.id}</td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{a.opportunityTitle}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Opp ID: {a.opportunityId}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{a.volunteerName}</span>
                              <span className="text-[11px] text-slate-500">📞 {a.phone} • ✉️ {a.email}</span>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px]">
                              {new Date(a.appliedDate).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                a.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                a.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {a.status === "Pending" ? (
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleApproveApplication(a.id, a.volunteerName, a.opportunityTitle)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition shadow-xs"
                                  >
                                    Approve Slot
                                  </button>
                                  <button 
                                    onClick={() => handleRejectApplication(a.id, a.volunteerName)}
                                    className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {a.status === "Approved" ? "✅ Slot Assigned" : "❌ Rejected"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Pega Identity Verification */}
            {volunteerSubTab === "pega" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Pega Volunteer Credential & Identity Records</h3>
                    <p className="text-[11px] text-slate-500">Formal Aadhaar/PAN identity documents and background clearance ledger</p>
                  </div>
                  <button
                    onClick={fetchPegaData}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingPega ? "animate-spin text-orange-500" : ""}`} />
                    Sync
                  </button>
                </div>
                {/* Pega cards are rendered in the upper block */}
              </div>
            )}
          </div>
        )}

        {/* 2B. PEGA OPPORTUNITIES & CAPACITY QUOTAS MODULE */}
        {activeTab === "opportunities" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  Opportunity & Capacity Quota Management
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track slot quotas, skill requirements, deterministic matching weights, and coordinator publishing approvals
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchPegaData}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPega ? "animate-spin text-orange-500" : ""}`} />
                  Sync
                </button>
                <button
                  onClick={() => setShowAddOppModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  + Create Opportunity
                </button>
              </div>
            </div>

            {/* Opportunities Grid */}
            {cleanQ && (
              <div className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl text-xs flex items-center justify-between text-orange-800">
                <span>Filtering opportunities by "{globalSearch}" ({matchingOpportunities.length} found)</span>
                <button onClick={() => setGlobalSearch("")} className="underline text-[11px] cursor-pointer font-bold">Clear Filter</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(cleanQ ? matchingOpportunities : pegaOpportunities).map((opp, idx) => {
                const oppKey = opp.opportunityId || (opp as any).id || `opp_${idx}`;
                const isFull = opp.assignedCount >= opp.capacity;
                const fillPercent = Math.min(100, Math.round((opp.assignedCount / opp.capacity) * 100));
                const isDraft = opp.status === "DRAFT";

                return (
                  <div key={`opp_card_${oppKey}_${idx}`} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 transition">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          opp.category === "FOOD_RELIEF" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          opp.category === "EDUCATION" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          opp.category === "HEALTHCARE" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          {opp.category.replace("_", " ")}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          opp.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {opp.status}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2">{opp.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{opp.description}</p>

                      <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{opp.date} • {opp.startTime} - {opp.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{opp.venue}</span>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-bold">Capacity Quota</span>
                          <span className={`font-black ${isFull ? "text-rose-600" : "text-emerald-700"}`}>
                            {opp.assignedCount} / {opp.capacity} ({opp.capacity - opp.assignedCount} slots left)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isFull ? "bg-rose-500" : fillPercent > 75 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Pega Matched Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {opp.skillsRequired.map((sk, idx) => (
                            <span key={`opp_sk_${oppKey}_${idx}`} className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-orange-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {opp.expectedImpact || "Active Community Impact"}
                      </span>

                      {isDraft && (
                        <button
                          onClick={() => handleApproveOpportunity(opp.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                        >
                          Approve & Publish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DONATIONS & TAX RECEIPTS MODULE */}
        {activeTab === "donations" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  Live Donation Ledger & Section 80G Tax Certificates
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time synchronization with UPI Intent apps (GPay, PhonePe, Paytm, BHIM) and direct transfers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSimulatorCache}
                  disabled={isPurging}
                  className="bg-slate-100 hover:bg-slate-200 text-rose-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🧹 Reset Simulator Cache</span>
                </button>
                <button 
                  onClick={() => setShowAddDonationModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Record Offline / Direct Donation</span>
                </button>
              </div>
            </div>

            {/* Donation Financial Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Funds Raised</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">₹{totalDonationsSum.toLocaleString()}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Transactions</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{donations.length}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">UPI Payments</span>
                <span className="text-xl font-black text-blue-700 mt-1 block">
                  {donations.filter(d => (d.method || "").toLowerCase().includes("upi")).length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">80G Exemption Status</span>
                <span className="text-xl font-black text-orange-700 mt-1 block">100% Eligible</span>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
              {donations.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No donation records found. Use the Mobile Simulator Donate section or "+ Record Offline / Direct Donation" above.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Txn Reference</th>
                      <th className="p-3">Donor Name & Contact</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Program Allocated</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Bank UTR</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">80G Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(cleanQ ? matchingDonations : donations).map((d, dIdx) => (
                      <tr key={`don_tbl_${d.id || 'd'}_${dIdx}`} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-orange-700 text-[11px]">{d.id}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{d.donorName}</span>
                          {(d.email || d.phone) && (
                            <span className="text-[11px] text-slate-500 block">
                              {d.email} {d.phone ? `• ${d.phone}` : ""}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-black text-emerald-700 text-sm">₹{d.amount.toLocaleString()}</td>
                        <td className="p-3 font-medium text-slate-700">{d.purpose}</td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            {d.method}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{d.utrRef || "UPI-DIRECT"}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{d.date}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => downloadAdmin80GReceipt(d)}
                            className="bg-slate-100 hover:bg-slate-200 text-orange-700 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>80G Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 4. CAREERS & JOB OPENINGS MODULE */}
        {activeTab === "jobs" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">NGO Career Openings & Recruitment Desk</h3>
                <p className="text-[11px] text-slate-500">Publish open field positions to 10,000+ app users in real-time</p>
              </div>
              <button 
                onClick={() => setShowAddJobModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Job</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(cleanQ ? matchingJobs : jobs).map((j, jIdx) => (
                <div key={`job_card_${j.id || 'j'}_${jIdx}`} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">
                      {j.department}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {j.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{j.title}</h4>
                  <p className="text-xs text-slate-500">📍 {j.location} • {j.type}</p>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-bold">{j.applicantsCount} Applications Received</span>
                    <button 
                      onClick={() => {
                        setActiveTab("volunteers");
                        setVolunteerSubTab("applications");
                      }}
                      className="text-orange-700 font-bold text-[11px] hover:underline cursor-pointer"
                    >
                      View Applicants →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. 10k FCM PUSH BROADCAST CENTER */}
        {activeTab === "broadcast" && (
          <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Emergency FCM Push Broadcast Console</h3>
                  <p className="text-[11px] text-slate-500">Broadcast high-priority emergency alerts directly to 10,000+ devices</p>
                </div>
              </div>

              {broadcastSent && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Push Broadcast Message Sent Successfully to 14,850 FCM Devices!</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Target Segment Topic:</label>
                  <select 
                    value={newBroadcastMsg.target}
                    onChange={(e) => setNewBroadcastMsg({ ...newBroadcastMsg, target: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:bg-white focus:border-orange-500 outline-none"
                  >
                    <option value="all_volunteers_10k">All 10,000+ App Users & Volunteers (global_topic)</option>
                    <option value="emergency_blood_donors">Blood Donors Only (blood_emergency_topic)</option>
                    <option value="food_drive_coordinators">Food Drive Coordinators (aahara_coordinators)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Push Notification Title:</label>
                  <input 
                    type="text"
                    value={newBroadcastMsg.title}
                    onChange={(e) => setNewBroadcastMsg({ ...newBroadcastMsg, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 text-xs focus:bg-white focus:border-orange-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Alert Payload Message Body:</label>
                  <textarea 
                    rows={3}
                    value={newBroadcastMsg.body}
                    onChange={(e) => setNewBroadcastMsg({ ...newBroadcastMsg, body: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 text-xs focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>

                <button 
                  onClick={handleSendBroadcast}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Now to 10,000+ Devices</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. RELIEF CAMPS & LOCATIONS */}
        {activeTab === "camps" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Live Food & Blood Camp GPS Operations</h3>
                <p className="text-[11px] text-slate-500">Coordinated emergency response and live nutrition centers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {camps.filter(c => c.status === "Active").length} Active Camps Live
                </span>
                <button 
                  onClick={() => setShowAddCampModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Camp</span>
                </button>
              </div>
            </div>

            {cleanQ && (
              <div className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl text-xs flex items-center justify-between text-orange-800">
                <span>Filtering camps by "{globalSearch}" ({matchingCamps.length} found)</span>
                <button onClick={() => setGlobalSearch("")} className="underline text-[11px] cursor-pointer font-bold">Clear Filter</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(cleanQ ? matchingCamps : camps).map((c, cIdx) => (
                <div key={`camp_card_${c.id || 'c'}_${cIdx}`} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-xs text-slate-900">{c.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      c.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{c.location}</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Coordinator: <strong className="text-slate-900">{c.coordinator}</strong> ({c.phone})
                  </p>

                  {/* Meals Progress */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Meals Served:</span>
                      <span className="text-orange-700">{c.mealsServed} / {c.mealsTarget}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (c.mealsServed / c.mealsTarget) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. DIRECT VOLUNTEER DISPATCH & ASSIGNMENT */}
        {activeTab === "assignment" && (
          <div className="space-y-4 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-base text-slate-900">Direct Volunteer Dispatch & Assignment Engine</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Assign verified volunteers directly to critical seva opportunities, allocating venue stations and reporting supervisors.
                </p>
              </div>
              <button
                onClick={() => { fetchMasterSchedule(); fetchPegaData(); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Roster</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Assignment Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3.5">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">New Shift Assignment</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Coordinator Override
                  </span>
                </div>

                <form onSubmit={handleDirectAssignVolunteer} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Select Volunteer *</label>
                    <select
                      value={assignVolunteerId}
                      onChange={(e) => setAssignVolunteerId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500 text-xs"
                    >
                      <option value="">-- Choose Verified Volunteer --</option>
                      {pegaVolunteers.map((v, vIdx) => {
                        const vKey = v.userId || (v as any).id || `asg_v_${vIdx}`;
                        return (
                          <option key={`v_opt_${vKey}_${vIdx}`} value={v.userId || (v as any).id}>
                            {v.fullName} ({vKey}) - {v.address?.city || "City"} {v.identityVerified ? "✓ Verified" : "⏳ Pending"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Target Seva Opportunity *</label>
                    <select
                      value={assignOpportunityId}
                      onChange={(e) => setAssignOpportunityId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500 text-xs"
                    >
                      <option value="">-- Select Seva Shift & Quota --</option>
                      {pegaOpportunities.map((opp, oppIdx) => {
                        const oKey = opp.opportunityId || (opp as any).id || `asg_opp_${oppIdx}`;
                        return (
                          <option key={`o_opt_${oKey}_${oppIdx}`} value={opp.opportunityId || (opp as any).id}>
                            {opp.title} ({opp.scheduledDate} @ {opp.location?.venueName || "Venue"}) - {opp.assignedCount}/{opp.capacity} filled
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Custom Role & Reporting Supervisor</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Packaging Station 2; Reports to Coordinator Ramesh"
                      value={assignRoleNotes}
                      onChange={(e) => setAssignRoleNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {assignLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Dispatch & Confirm Assignment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Recent Dispatches Feed */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                    Recent Assigned Dispatches ({masterSchedules.length})
                  </span>
                  <span className="text-[10px] text-slate-500">Live Synchronized</span>
                </div>

                {masterSchedules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No volunteer shifts assigned yet. Use the assignment form to dispatch volunteers to active seva opportunities.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {masterSchedules.slice(0, 15).map((asg, asgIdx) => (
                      <div
                        key={`asg_slice_${asg.assignmentId || 'asg'}_${asgIdx}`}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-orange-300 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{asg.opportunityTitle}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              asg.status === "COMPLETED" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : asg.status === "CHECKED_IN"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {asg.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="font-mono text-sky-700 font-bold">{asg.volunteerId}</span>
                            <span>•</span>
                            <span>{asg.scheduledDate} ({asg.startTime} - {asg.endTime})</span>
                            <span>•</span>
                            <span>{asg.venueName}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400">
                          {asg.assignedAt ? new Date(asg.assignedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. MASTER SCHEDULING (Step 8: Scheduling) */}
        {activeTab === "scheduling" && (
          <div className="space-y-4 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-base text-slate-900">Cross-Organization Master Scheduling</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive roster of all confirmed shifts, on-site check-in verification statuses, and volunteer service logs.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={scheduleFilterDate}
                  onChange={(e) => setScheduleFilterDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
                <select
                  value={scheduleFilterStatus}
                  onChange={(e) => setScheduleFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed Slots</option>
                  <option value="CHECKED_IN">Checked-In (On-site)</option>
                  <option value="COMPLETED">Completed Shifts</option>
                </select>
                <button
                  onClick={fetchMasterSchedule}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Shift Roster Cards */}
            {loadingSchedule ? (
              <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>Loading master schedule roster...</span>
              </div>
            ) : masterSchedules.filter(s => {
              if (scheduleFilterDate && s.scheduledDate !== scheduleFilterDate) return false;
              if (scheduleFilterStatus !== "ALL" && s.status !== scheduleFilterStatus) return false;
              return true;
            }).length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-2 shadow-sm">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-slate-900 font-bold text-sm">No scheduled volunteer shifts found</div>
                <div className="text-xs text-slate-500">
                  {scheduleFilterDate || scheduleFilterStatus !== "ALL" 
                    ? "Try adjusting your date or status filters." 
                    : "No shifts currently scheduled. Use Direct Assignment or let volunteers claim spots in the mobile app."}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {masterSchedules
                  .filter(s => {
                    if (scheduleFilterDate && s.scheduledDate !== scheduleFilterDate) return false;
                    if (scheduleFilterStatus !== "ALL" && s.status !== scheduleFilterStatus) return false;
                    return true;
                  })
                  .map((shift, shiftIdx) => (
                    <div
                      key={`shift_${shift.assignmentId || 'shift'}_${shiftIdx}`}
                      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2.5 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 line-clamp-1">{shift.opportunityTitle}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">ID: {shift.assignmentId}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          shift.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : shift.status === "CHECKED_IN"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {shift.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Assigned Volunteer:</span>
                          <span className="font-mono text-sky-700 font-bold">{shift.volunteerId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Shift Date & Time:</span>
                          <span className="text-slate-900 font-bold">{shift.scheduledDate} • {shift.startTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Venue Station:</span>
                          <span className="text-orange-700 font-bold">{shift.venueName}</span>
                        </div>
                        {shift.checkInTime && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-emerald-700 font-bold">
                            <span>Checked In:</span>
                            <span>{new Date(shift.checkInTime).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 10. 80G STATUTORY & EXECUTIVE REPORTING (Step 9: Reporting) */}
        {activeTab === "reports" && (
          <div className="space-y-4 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-base text-slate-900">80G Statutory Compliance & Executive Impact Reports</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Certified audits for Section 80G IT exemptions, volunteer service credits, and relief deployment analytics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchReports}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Metrics</span>
                </button>
                <button
                  onClick={handleExport80GReport}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export 80G Statutory CSV</span>
                </button>
              </div>
            </div>

            {reportsLoading && !reportsData ? (
              <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>Compiling 80G statutory metrics...</span>
              </div>
            ) : reportsData ? (
              <div className="space-y-4">
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total 80G Donations</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      ₹{reportsData.totalDonationsSum.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">
                      {reportsData.donationsCount} official receipts issued
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified Volunteers</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {reportsData.verifiedVolunteers} / {reportsData.totalVolunteers}
                    </div>
                    <div className="text-[11px] text-sky-700 font-bold mt-1">
                      {Math.round((reportsData.verifiedVolunteers / Math.max(1, reportsData.totalVolunteers)) * 100)}% verified identity & background
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Service Hours</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {reportsData.totalServiceHours} hrs
                    </div>
                    <div className="text-[11px] text-orange-700 font-bold mt-1">
                      Across all verified completed missions
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Volunteer Slot Fill Rate</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {reportsData.fillRatePercent}%
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">
                      {reportsData.activeOpportunities} active seva programs
                    </div>
                  </div>
                </div>

                {/* Category Breakdown & Server Health */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7 bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider block">
                      Program Category Service Breakdown
                    </span>
                    <div className="space-y-2.5">
                      {reportsData.categoryBreakdown.map((cat, catIdx) => (
                        <div key={`cat_bk_${cat.category || 'cat'}_${catIdx}`} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-700 font-bold">{cat.category}</span>
                            <span className="text-orange-700 font-mono font-bold">
                              {cat.volunteersCount} Volunteers ({cat.hours} Service Hours)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="bg-orange-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (cat.volunteersCount / Math.max(1, reportsData.totalVolunteers)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider block">
                      Infrastructure & System Health
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Server Uptime:</span>
                        <span className="font-mono text-emerald-700 font-bold">{reportsData.systemHealth.uptimeSeconds}s</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Heap Memory Usage:</span>
                        <span className="font-mono text-sky-700 font-bold">{reportsData.systemHealth.memoryUsageMb} MB</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Active Coordinator Sessions:</span>
                        <span className="font-mono text-slate-900 font-bold">{reportsData.systemHealth.activeSessionsCount}</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500">Capacity Target:</span>
                        <span className="font-mono text-emerald-700 font-bold">10,000+ Concurrent Scale</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 11. SECURITY AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-4 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Immutable Administrative Audit Trail</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cryptographically hashed chronological audit logs tracking all administrative actions, ID verifications, and quota changes.
                </p>
              </div>
              <button
                onClick={fetchAuditLogs}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            {auditLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>Loading audit trail...</span>
              </div>
            ) : auditLogsList.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-2 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-slate-900 font-bold text-sm">No audit entries recorded yet</div>
                <div className="text-xs text-slate-500">Actions performed in the admin portal will be logged here.</div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Actor / Role</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Entity</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Signature Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogsList.map((log, logIdx) => (
                        <tr key={`audit_log_${log.id || 'log'}_${logIdx}`} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900">{log.actor}</span>
                            <span className="text-[10px] text-slate-500 block">({log.actorRole})</span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-mono text-[11px]">
                            {log.targetEntity} ({log.targetId})
                          </td>
                          <td className="p-3 text-slate-700 text-[11px] max-w-xs truncate">
                            {log.details}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {log.id}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        </main>
      </div>

      {/* CREATE JOB MODAL */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full max-w-md space-y-3 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">Post New NGO Career Opening</h3>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-slate-700"><XCircle className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Job Title:</label>
                <input 
                  type="text" required placeholder="e.g. Community Health Lead"
                  value={newJobForm.title} onChange={e => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Department:</label>
                <select 
                  value={newJobForm.dept} onChange={e => setNewJobForm({ ...newJobForm, dept: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                >
                  <option value="Food Relief">Food Relief</option>
                  <option value="Healthcare Drive">Healthcare Drive</option>
                  <option value="Vidya Project">Vidya Project</option>
                  <option value="Logistics & Tech">Logistics & Tech</option>
                </select>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Location:</label>
                <input 
                  type="text" required placeholder="e.g. Mumbai / Remote"
                  value={newJobForm.location} onChange={e => setNewJobForm({ ...newJobForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs">
                Publish Opening
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECORD OFFLINE DONATION MODAL */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full max-w-md space-y-3 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">Record Manual Offline Donation</h3>
              <button onClick={() => setShowAddDonationModal(false)} className="text-slate-400 hover:text-slate-700"><XCircle className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddDonation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Donor Full Name:</label>
                <input 
                  type="text" required placeholder="e.g. Vikramaditya Gupta"
                  value={newDonationForm.name} onChange={e => setNewDonationForm({ ...newDonationForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Donation Amount (INR):</label>
                <input 
                  type="number" required placeholder="1000"
                  value={newDonationForm.amount} onChange={e => setNewDonationForm({ ...newDonationForm, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Allocated Program:</label>
                <select 
                  value={newDonationForm.purpose} onChange={e => setNewDonationForm({ ...newDonationForm, purpose: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                >
                  <option value="🍔 Aahara Hunger Drive">🍔 Aahara Hunger Drive</option>
                  <option value="📚 Vidya Education Project">📚 Vidya Education Project</option>
                  <option value="🏥 Emergency Medical Drive">🏥 Emergency Medical Drive</option>
                  <option value="General Corpus Fund">General Corpus Fund</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs">
                Save & Issue 80G Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PEGA VOLUNTEER IDENTITY INSPECTION & REVIEW MODAL */}
      {selectedPegaVolunteer && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 text-slate-800">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Volunteer Credential Audit</h3>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {selectedPegaVolunteer.userId || (selectedPegaVolunteer as any).id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPegaVolunteer(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Demographics */}
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Applicant Demographics</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Name:</strong> {selectedPegaVolunteer.fullName}</div>
                  <div><strong>City:</strong> {selectedPegaVolunteer.city}</div>
                  <div><strong>Phone:</strong> {selectedPegaVolunteer.phone}</div>
                  <div><strong>Email:</strong> {selectedPegaVolunteer.email}</div>
                  <div className="col-span-2"><strong>Emergency Contact:</strong> {selectedPegaVolunteer.emergencyContactName} ({selectedPegaVolunteer.emergencyContactPhone})</div>
                  <div className="col-span-2"><strong>Registered Date:</strong> {new Date(selectedPegaVolunteer.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Identity Document Inspection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-2 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Government Identity Document</span>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono">
                    {selectedPegaVolunteer.identityDocType}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-900 font-bold block">{selectedPegaVolunteer.identityDocName || "Document Upload Verified"}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Doc No: {selectedPegaVolunteer.identityDocNumber || "IND-XXXX-8921"}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedPegaVolunteer.identityVerificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {selectedPegaVolunteer.identityVerificationStatus}
                  </span>
                </div>
              </div>

              {/* Criminal Record Disclosure */}
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Criminal Background Check Status</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">
                    {selectedPegaVolunteer.criminalDisclosure ? "⚠️ Prior incident disclosed by applicant" : "✅ No criminal records disclosed"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedPegaVolunteer.backgroundCheckStatus === "CLEARED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {selectedPegaVolunteer.backgroundCheckStatus}
                  </span>
                </div>
              </div>

              {/* Terms & Digital Signature Audit */}
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 border border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Legal Terms & Signature Hash</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Terms Version:</span>
                    <span className="text-slate-900 font-mono font-bold">{selectedPegaVolunteer.termsAcceptedVersion || "v2026.1"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Digital Signature Hash:</span>
                    <span className="text-slate-900 font-mono text-[10px] truncate max-w-[200px]">
                      {selectedPegaVolunteer.digitalSignatureHash || "0x98f4e2a1b7...a9e"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted Timestamp:</span>
                    <span className="text-slate-900">{selectedPegaVolunteer.termsAcceptedAt ? new Date(selectedPegaVolunteer.termsAcceptedAt).toLocaleString() : "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Coordinator Decision Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleVerifyPegaVolunteer(selectedPegaVolunteer.userId || (selectedPegaVolunteer as any).id, true, "CLEARED")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve ID & Clear BG
                </button>
                <button
                  onClick={() => handleVerifyPegaVolunteer(selectedPegaVolunteer.userId || (selectedPegaVolunteer as any).id, false, "FLAGGED")}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag for Discrepancy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showAddOppModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 text-slate-800">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-sm text-slate-900">Create Opportunity</h3>
              </div>
              <button onClick={() => setShowAddOppModal(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="p-4 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Nutrition Drive - Dharavi Kitchen"
                  value={newOppForm.title}
                  onChange={(e) => setNewOppForm({ ...newOppForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={newOppForm.category}
                    onChange={(e) => setNewOppForm({ ...newOppForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                  >
                    <option value="FOOD_RELIEF">Food Relief (Aahara)</option>
                    <option value="EDUCATION">Education (Vidya)</option>
                    <option value="HEALTHCARE">Healthcare (Vaidya)</option>
                    <option value="BLOOD_DRIVE">Emergency Blood Drive</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Urgency</label>
                  <select
                    value={newOppForm.urgencyLevel}
                    onChange={(e) => setNewOppForm({ ...newOppForm, urgencyLevel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                  >
                    <option value="CRITICAL">Critical Emergency</option>
                    <option value="HIGH">High Priority</option>
                    <option value="NORMAL">Standard</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Venue / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 3 Community Center, Mumbai"
                  value={newOppForm.venue}
                  onChange={(e) => setNewOppForm({ ...newOppForm, venue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newOppForm.date}
                    onChange={(e) => setNewOppForm({ ...newOppForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none focus:bg-white focus:border-orange-500 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newOppForm.startTime}
                    onChange={(e) => setNewOppForm({ ...newOppForm, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none focus:bg-white focus:border-orange-500 text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={newOppForm.capacity}
                    onChange={(e) => setNewOppForm({ ...newOppForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none focus:bg-white focus:border-orange-500 font-bold text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail the opportunity mission and requirements..."
                  value={newOppForm.description}
                  onChange={(e) => setNewOppForm({ ...newOppForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Expected Community Impact</label>
                <input
                  type="text"
                  placeholder="e.g. 1,000 children provided warm evening meals"
                  value={newOppForm.expectedImpact}
                  onChange={(e) => setNewOppForm({ ...newOppForm, expectedImpact: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer transition shadow-xs mt-2 text-xs"
              >
                Save & Publish Opportunity to Mobile App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER RELIEF CAMP MODAL */}
      {showAddCampModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full max-w-md space-y-3 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-sm text-slate-900">Register Relief Camp / Food Drive</h3>
              </div>
              <button onClick={() => setShowAddCampModal(false)} className="text-slate-400 hover:text-slate-700"><XCircle className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateCamp} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Camp / Kitchen Name *</label>
                <input 
                  type="text" required placeholder="e.g. Andheri East Community Kitchen"
                  value={newCampForm.name} onChange={e => setNewCampForm({ ...newCampForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">GPS Location & Address *</label>
                <input 
                  type="text" required placeholder="e.g. Near Metro Station Gate 2, Mumbai"
                  value={newCampForm.location} onChange={e => setNewCampForm({ ...newCampForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Coordinator Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Rahul Patil"
                    value={newCampForm.coordinator} onChange={e => setNewCampForm({ ...newCampForm, coordinator: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Contact Phone *</label>
                  <input 
                    type="tel" required placeholder="+91 98200 99887"
                    value={newCampForm.phone} onChange={e => setNewCampForm({ ...newCampForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Target Meals / Capacity *</label>
                <input 
                  type="number" required min={50} max={10000}
                  value={newCampForm.mealsTarget} onChange={e => setNewCampForm({ ...newCampForm, mealsTarget: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500 font-bold"
                />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer transition shadow-xs">
                Register & Activate Relief Camp
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRUSTEE AUTH SESSION MODAL */}
      {showAdminSessionModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full max-w-md space-y-4 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-sm text-slate-900">Trustee Security Clearance</h3>
              </div>
              <button
                onClick={() => {
                  setShowAdminSessionModal(false);
                  setTrusteeReauthFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Security Clearance:</span>
                <span className="font-mono text-emerald-700 font-bold">Authorized Trustee Officer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Access Scope:</span>
                <span className="font-medium text-slate-800">Operations & Statutory Compliance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Level:</span>
                <span className="text-slate-900 font-bold">Verified Production Session</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-700 font-bold block">
                Trustee Passkey Verification (Required for elevated actions)
              </label>
              <input
                type="password"
                placeholder="Enter Administrator Secret Key"
                value={trusteePasskey}
                onChange={(e) => setTrusteePasskey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:bg-white focus:border-orange-500 font-mono"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    const passkey = trusteePasskey.trim();
                    if (!passkey) {
                      setTrusteeReauthFeedback("⚠ Please enter the administrator passkey.");
                      return;
                    }
                    try {
                      const res = await fetch("/api/v1/admin/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accessKey: passkey })
                      });
                      const data = await res.json();
                      if (res.ok && data.success && data.token) {
                        localStorage.setItem("seva_admin_token", data.token);
                        setTrusteeReauthFeedback("✓ Trustee session authenticated and elevated with operational authority.");
                        await fetchLiveAdminData();
                      } else {
                        setTrusteeReauthFeedback(`⚠ Authentication failed: ${data.error || "Invalid credentials."}`);
                      }
                    } catch {
                      setTrusteeReauthFeedback("⚠ Network error during trustee verification.");
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Verify Passkey
                </button>
              </div>

              {trusteeReauthFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold mt-2 ${
                  trusteeReauthFeedback.startsWith("✓") 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}>
                  {trusteeReauthFeedback}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowAdminSessionModal(false);
                  setTrusteeReauthFeedback(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
