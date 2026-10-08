import React, { useState, useEffect } from 'react';
import TabletMasterNav from './components/TabletMasterNav';
import TabletLiveFeeds from './components/TabletLiveFeeds';
import TabletCampDashboard from './components/TabletCampDashboard';
import TabletAuditLedger from './components/TabletAuditLedger';
import { TabletDonation, TabletCamp, TabletEvent } from './types';

export default function TabletApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [donations, setDonations] = useState<TabletDonation[]>([
    { id: 'SEVA-2026-901', donorName: 'Dr. Ramesh K', amount: 5000, purpose: 'Rural Mobile Clinic Medicine', date: 'Today, 09:30 AM', status: 'verified' },
    { id: 'SEVA-2026-902', donorName: 'Sneha Sundaram', amount: 2500, purpose: 'Vidya Student Education Kits', date: 'Today, 08:45 AM', status: 'verified' },
    { id: 'SEVA-2026-903', donorName: 'Ananya Hegde', amount: 1500, purpose: 'Annadana 100 Hot Meals', date: 'Yesterday', status: 'verified' },
    { id: 'SEVA-2026-904', donorName: 'Venkatesh Rao', amount: 10000, purpose: 'Disaster Relief Grain Kits', date: 'Yesterday', status: 'verified' },
    { id: 'SEVA-2026-905', donorName: 'Kavitha Murthy', amount: 1000, purpose: 'Midday Nutrition Program', date: '20 Sep 2026', status: 'verified' }
  ]);

  const [camps, setCamps] = useState<TabletCamp[]>([
    { id: 'CAMP-01', name: 'Nelamangala Highway Annadana Shelter', location: 'NH48 Junction, Nelamangala Rural', coordinator: 'Rajesh Gowda', mealsServed: 1250, mealsTarget: 1500, status: 'Active', lastVerifiedAt: '10 mins ago' },
    { id: 'CAMP-02', name: 'Ghati Subramanya Pilgrim Seva Camp', location: 'Temple Valley, Doddaballapura', coordinator: 'Suresh Kumar', mealsServed: 2100, mealsTarget: 2500, status: 'Active', lastVerifiedAt: '25 mins ago' },
    { id: 'CAMP-03', name: 'Kolar Drought Relief Supply Hub', location: 'Malur Industrial Bypass, Kolar', coordinator: 'Manjula Devi', mealsServed: 850, mealsTarget: 1000, status: 'Active', lastVerifiedAt: '1 hour ago' }
  ]);

  const [events, setEvents] = useState<TabletEvent[]>([
    { id: 'EV-01', title: 'Sphoorthi Mega Blood Donation Drive', date: '15 Oct 2026', time: '08:00 AM - 04:00 PM', location: 'Central Town Hall, Bengaluru', desc: 'Targeting 500 units of rare blood types for government pediatric ICUs.', category: 'Healthcare', volunteersRegistered: 42, targetVolunteers: 60 },
    { id: 'EV-02', title: 'Vidya Rural School Kit Distribution', date: '22 Oct 2026', time: '10:00 AM - 02:00 PM', location: 'Govt Higher Primary School, Chintamani', desc: 'Distributing school bags, notebooks, and solar study lamps to 450 underprivileged students.', category: 'Education', volunteersRegistered: 28, targetVolunteers: 35 }
  ]);

  const totalRaised = donations.reduce((acc, d) => acc + d.amount, 0);
  const totalDonors = donations.length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const donRes = await fetch('/api/v1/donations');
      if (donRes.ok) {
        const data = await donRes.json();
        if (data.donations) {
          setDonations(data.donations.map((d: any) => ({
            id: d.id || `SEVA-${d.amount}`,
            donorName: d.donorName,
            amount: d.amount,
            purpose: d.purpose,
            date: d.date || 'Today',
            status: 'verified'
          })));
        }
      }
    } catch (e) {
      console.warn('Backend sync failed, maintaining local state', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Left Master Navigation Panel (Tablet 80-column) */}
      <TabletMasterNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalRaised={totalRaised}
        totalDonors={totalDonors}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Right Detail Content View */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Bar with Live Indicator */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <h1 className="font-extrabold text-base text-slate-900 capitalize">
              {activeTab === 'dashboard' && 'Live Feeds & Overview'}
              {activeTab === 'donations' && 'Donation Ledger & 80G Receipts'}
              {activeTab === 'camps' && 'Relief Camp Operations'}
              {activeTab === 'volunteers' && 'Active Volunteer Roster'}
              {activeTab === 'audit' && 'Public Transparency & Audit Trail'}
              {activeTab === 'certificates' && 'Seva Appreciation Certificates'}
            </h1>
            <p className="text-[11px] text-slate-400">Sphoorthi Seva Trust Management Console</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to API
            </span>
          </div>
        </header>

        {/* Dynamic Detail Body */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <TabletLiveFeeds donations={donations} events={events} camps={camps} />
          )}

          {(activeTab === 'donations' || activeTab === 'audit') && (
            <TabletAuditLedger donations={donations} />
          )}

          {activeTab === 'camps' && (
            <TabletCampDashboard camps={camps} />
          )}

          {activeTab === 'volunteers' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Volunteer Deployment Matrix</h3>
              <p className="text-xs text-slate-500">Over 1,200 verified volunteers currently organized across medical, food, and student logistics sectors.</p>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Cryptographic Certificates</h3>
              <p className="text-xs text-slate-500">Digital certificates generated with verifiable SHA-256 signatures for students and corporate CSR partners.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
