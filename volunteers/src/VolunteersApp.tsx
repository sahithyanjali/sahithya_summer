import React, { useState } from 'react';
import { 
  CURRENT_VOLUNTEER, 
  INITIAL_SHIFTS, 
  MOCK_ATTENDANCE_LOGS, 
  INITIAL_CERTIFICATE 
} from './data/mockVolunteerData';
import VolunteerBadgeCard from './components/VolunteerBadgeCard';
import VolunteerDutyRoster from './components/VolunteerDutyRoster';
import VolunteerHoursLogger from './components/VolunteerHoursLogger';
import VolunteerCertificateView from './components/VolunteerCertificateView';
import VolunteerRegistrationModal from './components/VolunteerRegistrationModal';
import { SevaShift, AttendanceRecord, VolunteerProfile } from './types';
import { 
  IdCard, 
  CalendarDays, 
  Clock, 
  Award, 
  UserPlus, 
  CheckCircle2, 
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function VolunteersApp() {
  const [profile, setProfile] = useState<VolunteerProfile>(CURRENT_VOLUNTEER);
  const [shifts, setShifts] = useState<SevaShift[]>(INITIAL_SHIFTS);
  const [logs, setLogs] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_LOGS);
  const [activeTab, setActiveTab] = useState<'badge' | 'shifts' | 'logs' | 'certificate'>('badge');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleToggleClaim = (shiftId: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          const nextClaimed = !s.isClaimedByUser;
          return {
            ...s,
            isClaimedByUser: nextClaimed,
            slotsFilled: nextClaimed ? s.slotsFilled + 1 : Math.max(0, s.slotsFilled - 1)
          };
        }
        return s;
      })
    );
  };

  const handleAddLog = (newLog: AttendanceRecord) => {
    setLogs((prev) => [newLog, ...prev]);
    setProfile((prev) => ({
      ...prev,
      totalHours: Number((prev.totalHours + newLog.hoursEarned).toFixed(1)),
      completedMissions: prev.completedMissions + 1
    }));
  };

  const handleRegisterSuccess = (vol: any) => {
    console.log('Registered volunteer:', vol);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Universal Trust Banner */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-950">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wide text-white">Sphoorthi Seva Trust</h1>
                <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-500/20 px-1.5 py-0.2 rounded">
                  Reg: 402/2021
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Accredited Volunteer & Civic Seva Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join Volunteer Roster</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('badge')}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'badge'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>Volunteer ID Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('shifts')}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'shifts'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Duty Shifts & Rosters</span>
            <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full text-slate-300">
              {shifts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance & Hours Log</span>
            <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded-full text-slate-300">
              {profile.totalHours} hrs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Seva Certificate</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'badge' && (
          <div className="space-y-6">
            <VolunteerBadgeCard profile={profile} />

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
                  <ShieldCheck className="w-4 h-4" /> Section 80G Certified Seva
                </div>
                <p className="text-xs text-slate-400">
                  Volunteers actively verify transparent grain and meal disbursement at rural Annadana checkpoints.
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase mb-1">
                  <CalendarDays className="w-4 h-4" /> Next Assigned Duty
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Nelamangala Highway Annadana Food Distribution • Saturday 09:00 AM
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1">
                  <Heart className="w-4 h-4" /> Community Impact
                </div>
                <p className="text-xs text-slate-400">
                  Your volunteer participation has supported over 1,250 warm meals and 45 rural student kits.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <VolunteerDutyRoster shifts={shifts} onToggleClaim={handleToggleClaim} />
        )}

        {activeTab === 'logs' && (
          <VolunteerHoursLogger logs={logs} onAddLog={handleAddLog} />
        )}

        {activeTab === 'certificate' && (
          <VolunteerCertificateView certificate={INITIAL_CERTIFICATE} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500">
        <p>Sphoorthi Seva Trust • Public Charitable Trust Reg. No. 402/2021</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Accredited Volunteer Management Infrastructure • 100% Tax-Exempt Under Section 80G & 12A
        </p>
      </footer>

      {/* Registration Modal */}
      <VolunteerRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
