import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  CheckSquare, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  Bell, 
  FileBarChart, 
  UserCog 
} from 'lucide-react';

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'volunteers'
    | 'opportunities'
    | 'approvals'
    | 'verification'
    | 'scheduling'
    | 'assignment'
    | 'notifications'
    | 'reports'
    | 'users'
  >('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'volunteers', label: 'Volunteer Management', icon: Users },
    { id: 'opportunities', label: 'Opportunity Management', icon: Layers },
    { id: 'approvals', label: 'Approvals Queue', icon: CheckSquare },
    { id: 'verification', label: 'Background Verification', icon: ShieldCheck },
    { id: 'scheduling', label: 'Scheduling & Calendar', icon: Calendar },
    { id: 'assignment', label: 'Volunteer Assignment', icon: UserCheck },
    { id: 'notifications', label: 'Broadcast Notifications', icon: Bell },
    { id: 'reports', label: 'Reports & Audit', icon: FileBarChart },
    { id: 'users', label: 'User Roles & Access', icon: UserCog },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-base">
              S
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white">Seva Sphoorthi</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          Scale: ~10,000 Registered Users<br />
          Role: System SuperAdmin
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-6">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white capitalize">{activeTab.replace('_', ' ')}</h2>
            <p className="text-xs text-slate-400">Pega GenAI Blueprint Administrative Management Console</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
              System Online (Cloud Run)
            </span>
          </div>
        </header>

        {/* Tab Content Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-300 text-sm">
            Active Module: <strong className="text-orange-400">{activeTab.toUpperCase()}</strong>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Integrated directly with the live Express/Firebase backend endpoints on port 3000.
          </p>
        </div>
      </main>
    </div>
  );
}
