import React from "react";
import { AuthUser } from "../types";

interface AppLandingScreenProps {
  onNavigate: (screen: string) => void;
  onOpenLogin?: (preferredRole?: "volunteer" | "donor" | "admin") => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export default function AppLandingScreen({
  onNavigate
}: AppLandingScreenProps) {
  return (
    <div 
      onClick={() => onNavigate("home")}
      className="flex-1 min-h-full w-full bg-white flex flex-col items-center justify-center p-6 select-none cursor-pointer"
      title="Tap anywhere to continue"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
        {/* OFFICIAL SEVA SPHOORTHI LOGO */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <img
            src="/assets/branding/sevasphoorthi_logo.png"
            alt="Seva Sphoorthi"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* OFFICIAL SLOGAN */}
        <div className="space-y-1.5 px-2">
          <p className="text-base sm:text-lg font-serif font-bold text-slate-800 tracking-wider">
            ॥ सेवा परमो धर्मः ॥
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-wide">
            Selfless Service is the Supreme Virtue
          </p>
        </div>
      </div>
    </div>
  );
}
