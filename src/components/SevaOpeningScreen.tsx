import React, { useEffect, useRef } from "react";

interface SevaOpeningScreenProps {
  onEnterApp: () => void;
  onNavigateQuick?: (screen: string) => void;
  autoAdvanceSeconds?: number;
  triggerHaptic?: (type: "light" | "medium" | "heavy" | "success") => void;
}

export default function SevaOpeningScreen({
  onEnterApp,
  autoAdvanceSeconds = 2.5,
  triggerHaptic
}: SevaOpeningScreenProps) {
  const onEnterAppRef = useRef(onEnterApp);
  const triggerHapticRef = useRef(triggerHaptic);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    onEnterAppRef.current = onEnterApp;
  }, [onEnterApp]);

  useEffect(() => {
    triggerHapticRef.current = triggerHaptic;
  }, [triggerHaptic]);

  // Smooth auto-advance splash transition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        triggerHapticRef.current?.("light");
        onEnterAppRef.current();
      }
    }, autoAdvanceSeconds * 1000);

    return () => clearTimeout(timer);
  }, [autoAdvanceSeconds]);

  const handleManualEnter = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    triggerHapticRef.current?.("light");
    onEnterApp();
  };

  return (
    <div 
      onClick={handleManualEnter}
      className="flex-1 min-h-full w-full bg-white flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-colors"
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
