import React from 'react';
import { TabletCamp } from '../types';
import { MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface TabletCampDashboardProps {
  camps: TabletCamp[];
}

export default function TabletCampDashboard({ camps }: TabletCampDashboardProps) {
  const totalMeals = camps.reduce((acc, c) => acc + c.mealsServed, 0);
  const targetMeals = camps.reduce((acc, c) => acc + c.mealsTarget, 0);

  return (
    <div className="space-y-6">
      {/* Tablet Overview Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">Field Operations</span>
            <h2 className="text-xl font-black mt-0.5">Rural Annadana Relief Camps</h2>
            <p className="text-xs text-orange-100 max-w-xl mt-1">
              Live tracking of hot nutritious meals served directly to rural pilgrims, hospital attendants, and vulnerable children.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[140px]">
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider block">Meals Delivered</span>
            <span className="text-2xl font-black text-white">{totalMeals.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-orange-100 block">of {targetMeals.toLocaleString('en-IN')} target</span>
          </div>
        </div>
      </div>

      {/* Responsive Grid of Camp Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {camps.map((camp) => {
          const pct = Math.min(100, Math.round((camp.mealsServed / Math.max(camp.mealsTarget, 1)) * 100));
          return (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      camp.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {camp.id}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{camp.name}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{camp.location}</span>
                </div>
              </div>

              {/* Progress Bar & Metrics */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Meals Served</span>
                  <span className="font-black text-slate-900">{camp.mealsServed} / {camp.mealsTarget}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{pct}% Fulfilled</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Audit Verified
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {camp.coordinator}
                </span>
                <span className="text-[9px] text-slate-400">{camp.lastVerifiedAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
