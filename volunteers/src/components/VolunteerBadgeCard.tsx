import React from 'react';
import { VolunteerProfile } from '../types';
import { ShieldCheck, Phone, Heart, Award, QrCode, MapPin, Printer } from 'lucide-react';

interface VolunteerBadgeCardProps {
  profile: VolunteerProfile;
}

export default function VolunteerBadgeCard({ profile }: VolunteerBadgeCardProps) {
  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 shadow-xl relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />

      {/* Header with Trust Details */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-base">
            SS
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Sphoorthi Seva Trust</h2>
            <p className="text-[10px] text-slate-400 font-mono">Reg. No: 402/2021 • Civic Volunteer Roster</p>
          </div>
        </div>

        <button
          onClick={handlePrintBadge}
          className="inline-flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition cursor-pointer"
          title="Print Official Badge"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Print Badge</span>
        </button>
      </div>

      {/* Main Badge Layout */}
      <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Photo + Status */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
            />
            <span className="absolute -bottom-2 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-emerald-300 tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
              {profile.status}
            </span>
          </div>
          <span className="mt-4 text-[10px] font-mono text-slate-400 font-bold">
            {profile.badgeNumber}
          </span>
        </div>

        {/* Identity Information */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/20">
              {profile.clearanceLevel}
            </span>
            <h1 className="text-xl font-black text-white mt-1.5">{profile.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {profile.city}
              </span>
              <span className="flex items-center gap-1 font-bold text-red-400">
                <Heart className="w-3 h-3 fill-red-400" />
                Blood: {profile.bloodGroup}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60 text-center sm:text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Logged Hours</span>
              <span className="text-base font-black text-emerald-400">{profile.totalHours} hrs</span>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60 text-center sm:text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Completed Missions</span>
              <span className="text-base font-black text-orange-400">{profile.completedMissions}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60 text-center sm:text-left">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Service Standing</span>
              <span className="text-xs font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5" /> Gold Seva Karta
              </span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>SOS: {profile.emergencyContact.name} ({profile.emergencyContact.relationship})</span>
            </div>
            <span className="font-mono text-red-300 font-bold">{profile.emergencyContact.phone}</span>
          </div>
        </div>

        {/* Verifiable QR Pass */}
        <div className="flex flex-col items-center bg-white p-3 rounded-2xl border-2 border-slate-700 shrink-0 shadow-inner">
          <QrCode className="w-20 h-20 text-slate-900" />
          <span className="text-[9px] font-mono text-slate-700 font-black mt-1">SCAN FOR FIELD CHECK-IN</span>
          <span className="text-[8px] font-mono text-slate-500">ID: {profile.id}</span>
        </div>
      </div>

      {/* Verified Skills Tags */}
      <div className="mt-5 pt-4 border-t border-slate-700/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Verified Field Competencies:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill, i) => (
            <span
              key={i}
              className="text-[10px] font-bold bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
