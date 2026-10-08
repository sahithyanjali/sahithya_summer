import React, { useState } from "react";
import { 
  Trash2, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, 
  Sparkles, Database, Users, HeartHandshake, Layers, FileText, ArrowRight 
} from "lucide-react";

interface AdminPurgeToolProps {
  onPurgeComplete?: (stats?: any) => void;
  onResetSimulatorState?: () => void;
  compact?: boolean;
  className?: string;
  totalVolunteers?: number;
  totalRegistrations?: number;
  totalApplications?: number;
  totalDonations?: number;
}

export default function AdminPurgeTool({
  onPurgeComplete,
  onResetSimulatorState,
  compact = false,
  className = "",
  totalVolunteers = 0,
  totalRegistrations = 0,
  totalApplications = 0,
  totalDonations = 0
}: AdminPurgeToolProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [purgeMode, setPurgeMode] = useState<"smart" | "hard">("smart");
  const [confirmText, setConfirmText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [lastPurgeResult, setLastPurgeResult] = useState<{
    success: boolean;
    message: string;
    stats?: any;
    timestamp: string;
  } | null>(null);

  const handleExecutePurge = async () => {
    if (purgeMode === "hard" && confirmText.trim().toUpperCase() !== "RESET") {
      return;
    }

    setIsProcessing(true);
    setProgressStep("Connecting to Seva Database Engine...");

    try {
      await new Promise(r => setTimeout(r, 400));
      setProgressStep(purgeMode === "hard" 
        ? "Resetting simulator test state and initial schema..." 
        : "Scanning and clearing simulator cache records..."
      );

      const token = localStorage.getItem("seva_admin_token") || localStorage.getItem("seva_auth_token");
      const res = await fetch("/api/v1/admin/reset-simulator-cache", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ hardReset: purgeMode === "hard" })
      });

      const data = await res.json();
      await new Promise(r => setTimeout(r, 400));
      setProgressStep("Clearing browser local cache & state registers...");

      // Clean local storage
      if (typeof window !== "undefined") {
        if (purgeMode === "hard") {
          localStorage.removeItem("seva_volunteers_cache");
          localStorage.removeItem("seva_donations");
          localStorage.removeItem("seva_temple_pledges");
          localStorage.removeItem("seva_volunteer_form_draft");
        }
      }

      // Reset client simulator state
      if (onResetSimulatorState) {
        onResetSimulatorState();
      }

      await new Promise(r => setTimeout(r, 300));
      setProgressStep("Complete! Production baseline ready.");

      setLastPurgeResult({
        success: data.success,
        message: data.message || "Data purged successfully.",
        stats: data.stats,
        timestamp: new Date().toLocaleTimeString()
      });

      if (onPurgeComplete) {
        onPurgeComplete(data.stats);
      }

      setConfirmText("");
      setTimeout(() => {
        setIsProcessing(false);
        setProgressStep("");
      }, 1200);

    } catch (err: any) {
      setIsProcessing(false);
      setProgressStep("");
      setLastPurgeResult({
        success: false,
        message: err.message || "Failed to execute purge request.",
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Reset to clean production initial state"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Reset Simulator Cache</span>
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Reset Simulator Cache & Clean Dataset</h3>
                    <p className="text-[11px] text-slate-500">Initialize a clean production state for new registrations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isProcessing}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {renderToolBody()}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderToolBody() {
    return (
      <div className="space-y-4">
        {/* State Summary Badges */}
        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Registrations</span>
            <span className="text-sm font-black text-orange-600">{totalRegistrations}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Volunteers</span>
            <span className="text-sm font-black text-amber-600">{totalVolunteers}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Applications</span>
            <span className="text-sm font-black text-blue-600">{totalApplications}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Donations</span>
            <span className="text-sm font-black text-emerald-600">{totalDonations}</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Select Purge Scope:</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPurgeMode("smart")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                purgeMode === "smart"
                  ? "bg-orange-50 border-orange-300 text-slate-900 shadow-xs ring-1 ring-orange-400"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-orange-700">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Smart Keyword Purge</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Removes test, sandbox, and initial state records. Keeps real user submissions.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPurgeMode("hard")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                purgeMode === "hard"
                  ? "bg-rose-50 border-rose-300 text-slate-900 shadow-xs ring-1 ring-rose-400"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Clean Production Reset</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Wipes all mock data and resets simulator state to 0 for fresh real signups.
              </p>
            </button>
          </div>
        </div>

        {/* Hard reset confirmation field */}
        {purgeMode === "hard" && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Full Reset Confirmation Required</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Type <strong className="text-rose-800 font-mono bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded">PURGE</strong> to reset the simulator and database to clean initial state.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type PURGE here"
              className="w-full bg-white border border-rose-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono uppercase tracking-wider focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            />
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleExecutePurge}
            disabled={isProcessing || (purgeMode === "hard" && confirmText.trim().toUpperCase() !== "PURGE")}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
              isProcessing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : purgeMode === "hard"
                ? confirmText.trim().toUpperCase() === "PURGE"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{progressStep || "Executing Purge..."}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {purgeMode === "hard" 
                    ? "Execute Production State Reset" 
                    : "Execute Smart Test Data Purge"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Message */}
        {lastPurgeResult && (
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            lastPurgeResult.success 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {lastPurgeResult.message}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{lastPurgeResult.timestamp}</span>
            </div>
            {lastPurgeResult.stats && (
              <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-1 pt-1.5 border-t border-emerald-100 font-mono">
                <span>Items Purged: {lastPurgeResult.stats.purgedCount}</span>
                <span>Active Remaining: {lastPurgeResult.stats.volunteersRemaining}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Admin Purge Tool: Production State Reset</h3>
            <p className="text-[11px] text-slate-500">Purge mock records and reset simulator for new registrations</p>
          </div>
        </div>
        <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Production Prep
        </span>
      </div>

      {renderToolBody()}
    </div>
  );
}
