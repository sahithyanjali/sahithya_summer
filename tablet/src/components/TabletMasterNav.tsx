import React from 'react';
import { 
  Heart, 
  MapPin, 
  Users, 
  FileText, 
  ShieldCheck, 
  TrendingUp,
  RefreshCw,
  Award
} from 'lucide-react';

interface TabletMasterNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  totalRaised: number;
  totalDonors: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function TabletMasterNav({
  activeTab,
  onSelectTab,
  totalRaised,
  totalDonors,
  isRefreshing,
  onRefresh
}: TabletMasterNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Overview & Feeds', icon: TrendingUp, badge: 'Live' },
    { id: 'donations', label: 'Donations & 80G', icon: Heart, badge: `₹${(totalRaised / 1000).toFixed(0)}k` },
    { id: 'camps', label: 'Relief Camps', icon: MapPin, badge: 'Active' },
    { id: 'volunteers', label: 'Volunteer Roster', icon: Users, badge: `${totalDonors}+` },
    { id: 'audit', label: 'Audit & Transparency', icon: ShieldCheck, badge: '100%' },
    { id: 'certificates', label: 'Seva Certificates', icon: Award }
  ];

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Trust Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white text-lg shadow-md">
              S
            </div>
            <div>
              <h2 className="font-black text-sm text-white leading-tight">Sphoorthi Seva</h2>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Tablet Workstation</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh backend data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>

        {/* Live Metrics Pill */}
        <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">Total Seva Raised</span>
            <span className="text-emerald-400 font-black">₹{totalRaised.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '74%' }} />
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400">
            <span>Target: ₹3,50,000</span>
            <span className="text-orange-300 font-semibold">81% Goal</span>
          </div>
        </div>

        {/* Master Navigation Links */}
        <nav className="p-2 space-y-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Trust Verification */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Govt Reg: 402/2021 (80G Active)</span>
        </div>
        <p className="text-[9px] text-slate-500">Optimized for iPad Pro, Air & Android Tablets</p>
      </div>
    </aside>
  );
}
