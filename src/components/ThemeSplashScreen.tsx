import React, { useEffect, useState } from "react";
import { Flame, Sparkles, ArrowRight, Heart, BookOpen, ShieldCheck } from "lucide-react";

interface ThemeSplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export default function ThemeSplashScreen({
  onFinish,
  durationMs = 2000
}: ThemeSplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onFinish();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  return (
    <div 
      onClick={onFinish}
      className="relative flex-1 bg-gradient-to-b from-orange-50/90 via-white to-amber-50/50 text-slate-900 flex flex-col justify-between p-6 select-none cursor-pointer overflow-hidden font-sans"
    >
      {/* Top Bar with Skip Action */}
      <div className="flex items-center justify-between z-10 pt-1">
        <div className="inline-flex items-center gap-1.5 bg-orange-100/70 border border-orange-200/80 px-2.5 py-1 rounded-full text-orange-800 text-[10px] font-extrabold uppercase tracking-wider">
          <Heart className="w-3 h-3 text-orange-600" />
          <span>Charitable Trust</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFinish();
          }}
          className="inline-flex items-center gap-1 bg-white hover:bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs transition active:scale-95 cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Central Sacred Emblem & Identity */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6 z-10 space-y-4">
        {/* Emblem */}
        <div className="relative">
          <div className="absolute -inset-3 bg-orange-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 border-2 border-white">
            <Flame className="w-11 h-11" />
          </div>
        </div>

        {/* Sacred Mantra */}
        <div className="space-y-1">
          <div className="inline-block bg-orange-100/90 border border-orange-300/80 px-3.5 py-1 rounded-full text-orange-900 font-serif font-black text-sm tracking-widest shadow-2xs">
            ॥ सेवा परमो धर्मः ॥
          </div>
          <p className="text-[10px] text-orange-700/90 font-medium italic">
            Selfless Service is the Supreme Virtue
          </p>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Seva Sphoorthi
          </h1>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Charitable Trust • Karnataka
          </p>
        </div>

        {/* Core Pillars */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs pt-1">
          <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
            <BookOpen className="w-3 h-3 text-orange-600" /> Education Support
          </span>
          <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
            <Heart className="w-3 h-3 text-rose-600" /> Elder Care
          </span>
          <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Rural Health
          </span>
        </div>
      </div>

      {/* Bottom Progress & Auto-Advance Indicator (2 seconds) */}
      <div className="z-10 space-y-2 pt-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Entering Home Dashboard...
          </span>
          <span className="font-mono font-bold text-orange-700">
            {((durationMs * (100 - progress)) / 100000).toFixed(1)}s
          </span>
        </div>

        {/* 2-Second Progress Bar */}
        <div className="w-full h-1.5 bg-orange-100/90 rounded-full overflow-hidden p-[1px] border border-orange-200/50">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-[9.5px] text-slate-400">
          Tap anywhere to enter immediately
        </p>
      </div>
    </div>
  );
}
