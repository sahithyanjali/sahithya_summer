import React from 'react';
import { TabletDonation, TabletEvent, TabletCamp } from '../types';
import { Heart, Calendar, MapPin, CheckCircle, TrendingUp } from 'lucide-react';

interface TabletLiveFeedsProps {
  donations: TabletDonation[];
  events: TabletEvent[];
  camps: TabletCamp[];
}

export default function TabletLiveFeeds({ donations, events, camps }: TabletLiveFeedsProps) {
  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Split for Live Feeds on Tablet */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Live 80G Donation Stream */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Real-Time Seva Ledger</h3>
                <p className="text-[11px] text-slate-500">Live verified contributions with 80G tax exemptions</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Live Stream
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
            {donations.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{d.donorName}</span>
                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {d.purpose}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{d.date}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> 80G Verified
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-orange-600">₹{d.amount.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">{d.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Relief & Civic Events */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Civic Relief Operations</h3>
                <p className="text-[11px] text-slate-500">Upcoming community drives and volunteer deployments</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {events.length} Active
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {events.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-orange-200 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    {ev.date}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{ev.category}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{ev.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{ev.desc}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    {ev.location}
                  </span>
                  <span className="font-bold text-orange-600 shrink-0">
                    {ev.volunteersRegistered}/{ev.targetVolunteers} Volunteers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
