import React from 'react';
import { SevaShift } from '../types';
import { Calendar, Clock, MapPin, Users, CheckCircle2, Phone, AlertCircle } from 'lucide-react';

interface VolunteerDutyRosterProps {
  shifts: SevaShift[];
  onToggleClaim: (shiftId: string) => void;
}

export default function VolunteerDutyRoster({ shifts, onToggleClaim }: VolunteerDutyRosterProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-lg font-black text-white">Upcoming Field Seva Shifts</h2>
          <p className="text-xs text-slate-400">
            Claim an active relief or Annadana duty slot. Hours are logged upon QR check-in by the camp coordinator.
          </p>
        </div>
        <span className="text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full w-fit">
          {shifts.filter(s => s.isClaimedByUser).length} Shifts Claimed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => {
          const isFull = shift.slotsFilled >= shift.slotsTotal;
          const pct = Math.min(100, Math.round((shift.slotsFilled / shift.slotsTotal) * 100));

          return (
            <div
              key={shift.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                shift.isClaimedByUser
                  ? 'bg-slate-800/90 border-orange-500 shadow-md ring-1 ring-orange-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                    {shift.category}
                  </span>
                  {shift.isClaimedByUser ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Slot Confirmed
                    </span>
                  ) : isFull ? (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      Shift Full
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {shift.id}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-white leading-snug">{shift.title}</h3>

                <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>{shift.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{shift.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">{shift.location}</span>
                  </div>
                </div>

                {/* Reporting Venue */}
                <div className="mt-3 bg-slate-900/70 rounded-xl p-2.5 border border-slate-700/50 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">Reporting Desk:</span>
                  {shift.reportingVenue}
                </div>

                {/* Capacity Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Volunteers Joined
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {shift.slotsFilled} / {shift.slotsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  <span>Coordinator: </span>
                  <span className="text-slate-200 font-bold">{shift.coordinatorName}</span>
                </div>

                <button
                  onClick={() => onToggleClaim(shift.id)}
                  disabled={isFull && !shift.isClaimedByUser}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 ${
                    shift.isClaimedByUser
                      ? 'bg-slate-700 hover:bg-red-900/60 text-slate-200 border border-slate-600'
                      : isFull
                      ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm'
                  }`}
                >
                  {shift.isClaimedByUser ? 'Withdraw Slot' : isFull ? 'Full' : 'Claim Shift Slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
