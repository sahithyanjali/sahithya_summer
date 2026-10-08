import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { Play, Square, CheckCircle, Clock, ShieldCheck, MapPin, Hash } from 'lucide-react';

interface VolunteerHoursLoggerProps {
  logs: AttendanceRecord[];
  onAddLog: (log: AttendanceRecord) => void;
}

export default function VolunteerHoursLogger({ logs, onAddLog }: VolunteerHoursLoggerProps) {
  const [isOnDuty, setIsOnDuty] = useState<boolean>(false);
  const [dutyStartTime, setDutyStartTime] = useState<Date | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string>('Nelamangala Highway Annadana Shelter');

  const handleStartDuty = () => {
    setIsOnDuty(true);
    setDutyStartTime(new Date());
  };

  const handleEndDuty = () => {
    if (!dutyStartTime) return;
    const now = new Date();
    const durationHours = Math.max(0.5, Number(((now.getTime() - dutyStartTime.getTime()) / (1000 * 60 * 60)).toFixed(1)));

    const newLog: AttendanceRecord = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      shiftTitle: 'Active Field Seva Dispatch',
      location: selectedCamp,
      date: 'Today',
      checkInTime: dutyStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hoursEarned: durationHours,
      verifiedBy: 'Field Coordinator Verified',
      blockHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      status: 'VERIFIED'
    };

    onAddLog(newLog);
    setIsOnDuty(false);
    setDutyStartTime(null);
  };

  return (
    <div className="space-y-6">
      {/* Live Check-In / Check-Out Station */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                {isOnDuty ? 'Active Seva Session in Progress' : 'Field Attendance Station'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">Real-time Check-In & Hour Logging</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Check in upon arrival at the relief camp. Coordinates and duty duration are digitally recorded for your accredited certificate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isOnDuty ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedCamp}
                  onChange={(e) => setSelectedCamp(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="Nelamangala Highway Annadana Shelter">Nelamangala Highway Annadana</option>
                  <option value="Central Town Hall Mega Blood Drive">Central Town Hall Blood Drive</option>
                  <option value="Ghati Subramanya Pilgrim Seva Camp">Ghati Subramanya Pilgrim Seva</option>
                  <option value="Govt Primary School Chintamani">Chintamani Vidya School</option>
                </select>
                <button
                  onClick={handleStartDuty}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Check In for Duty</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700 text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Started At</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {dutyStartTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={handleEndDuty}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Check Out & Log</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Hours Ledger Table */}
      <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Verified Duty Attendance Ledger</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Records: {logs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-700/60 text-slate-400 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Mission / Shift</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Verified By</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-orange-400 font-bold">
                    {log.id}
                  </td>
                  <td className="py-3 px-4 text-white font-bold">
                    {log.shiftTitle}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.location}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.date}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-black">
                    {log.hoursEarned} hrs
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.verifiedBy}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" /> Accredited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
