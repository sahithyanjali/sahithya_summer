import React from "react";

export const OFFICIAL_LOGO_PATH = "/assets/branding/sevasphoorthi_logo.png";
export const OFFICIAL_LOGO_WHITE_PATH = "/assets/branding/sevasphoorthi_logo_white.png";

export interface SevaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  animated?: boolean;
  variant?: "full" | "icon" | "circle" | "white" | "dark";
  alt?: string;
}

export default function SevaLogo({
  size = 80,
  className = "",
  showText = false,
  showTagline = false,
  variant = "circle",
  alt = "Seva Sphoorthi Official Logo"
}: SevaLogoProps) {
  const isWhite = variant === "white";
  const logoSrc = isWhite ? OFFICIAL_LOGO_WHITE_PATH : OFFICIAL_LOGO_PATH;

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Official Website Logo Asset with Pristine Aspect Ratio */}
        <img
          src={logoSrc}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Optional Typography */}
      {showText && (
        <div className="text-center mt-2 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
            Seva Sphoorthi
          </h2>
          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">
            Charitable Trust
          </span>
          {showTagline && (
            <p className="text-[9.5px] text-slate-500 italic font-medium pt-0.5">
              ॥ सेवा परमो धर्मः ॥ Selfless Service is Supreme Virtue
            </p>
          )}
        </div>
      )}
    </div>
  );
}
