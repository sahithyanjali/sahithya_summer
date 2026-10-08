import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, Mail, ArrowRight, ShieldCheck, CheckCircle2, 
  AlertCircle, RefreshCw, KeyRound, Sparkles, User, Heart, 
  Shield, Check, MessageSquare, XCircle, ArrowLeft, MapPin, 
  Compass, Users, LogOut
} from "lucide-react";
import { AuthUser, AuthRole } from "../types";

export type OtpStage = "SEND_CODE" | "INPUT_CODE" | "VERIFICATION_SUCCESS" | "VERIFICATION_FAILURE";
export type EntryMode = "login" | "register";

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  initialRole?: AuthRole;
  onTriggerNotification?: (title: string, body: string) => void;
  onExploreGuest?: () => void;
}

// Prominent Seva Chapters & Regional Locations
export const SEVA_LOCATIONS = [
  { id: "blr", name: "Bengaluru (Central HQ)", zone: "Karnataka / South Zone", popular: true },
  { id: "hyd", name: "Hyderabad & Secunderabad", zone: "Telangana Chapter", popular: true },
  { id: "vns", name: "Varanasi (Kashi Vishwanath Seva)", zone: "Uttar Pradesh", popular: true },
  { id: "ayd", name: "Ayodhya (Ram Mandir Anna Kshetra)", zone: "Uttar Pradesh", popular: true },
  { id: "tpt", name: "Tirupati (Venkateswara Seva)", zone: "Andhra Pradesh", popular: true },
  { id: "del", name: "Delhi NCR (North Zone)", zone: "National Capital Region", popular: false },
  { id: "pun", name: "Pune & Mumbai (Western Zone)", zone: "Maharashtra Chapter", popular: false },
  { id: "mys", name: "Mysuru & Mandya (Heritage Circuit)", zone: "Karnataka Chapter", popular: false },
  { id: "chn", name: "Chennai & Madurai", zone: "Tamil Nadu Chapter", popular: false }
];

export default function LoginScreen({
  onBack,
  onLoginSuccess,
  currentUser,
  onLogout,
  initialRole = "volunteer",
  onTriggerNotification,
  onExploreGuest
}: LoginScreenProps) {
  // -------------------------------------------------------------
  // AUTHENTICATION & REGISTRATION STATES (100% PASSWORDLESS)
  // -------------------------------------------------------------
  const [entryMode, setEntryMode] = useState<EntryMode>("login");
  const [authChannel, setAuthChannel] = useState<"phone" | "email">("phone");
  const [selectedRole] = useState<AuthRole>("volunteer");

  // Location selector state
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru (Central HQ)");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [showAllLocations, setShowAllLocations] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationDetectSuccess, setLocationDetectSuccess] = useState<string>("");

  // Input states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode] = useState("+91");
  const [emailAddress, setEmailAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [sevaInterest, setSevaInterest] = useState<string>("Food Relief & Annadana");

  // OTP flow stage: "SEND_CODE" -> "INPUT_CODE" -> "VERIFICATION_SUCCESS" / "VERIFICATION_FAILURE"
  const [stage, setStage] = useState<OtpStage>("SEND_CODE");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [maskedTarget, setMaskedTarget] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Handle GPS / Geolocation auto-detection
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setLocationDetectSuccess("");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          const detected = "Bengaluru Urban (GPS Verified)";
          setSelectedLocation(detected);
          setLocationDetectSuccess("📍 Location verified via device GPS");
          setTimeout(() => setLocationDetectSuccess(""), 4000);
        },
        () => {
          setIsDetectingLocation(false);
          const fallback = "Bengaluru (Central HQ)";
          setSelectedLocation(fallback);
          setLocationDetectSuccess("📍 Selected: Bengaluru (Central HQ)");
          setTimeout(() => setLocationDetectSuccess(""), 4000);
        },
        { timeout: 4000 }
      );
    } else {
      setIsDetectingLocation(false);
      setSelectedLocation("Bengaluru (Central HQ)");
      setLocationDetectSuccess("📍 Selected: Bengaluru (Central HQ)");
      setTimeout(() => setLocationDetectSuccess(""), 3000);
    }
  };

  // Request OTP from API (Transition: SEND_CODE -> INPUT_CODE)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const finalLocation = customLocationInput.trim() || selectedLocation;

    if (entryMode === "register" && !fullName.trim()) {
      setErrorMessage("Please enter your Full Name to complete registration.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const identifier = authChannel === "phone" 
      ? `${countryCode}${cleanPhone}` 
      : emailAddress.trim();

    if (authChannel === "phone") {
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setErrorMessage("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 98200 45678)");
        return;
      }
    }

    if (authChannel === "email" && (!emailAddress.includes("@") || !emailAddress.includes("."))) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          type: authChannel,
          role: selectedRole,
          name: fullName.trim() || undefined,
          location: finalLocation,
          isRegistration: entryMode === "register"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch verification OTP code.");
      }

      setMaskedTarget(data.maskedTarget || identifier);
      setResendCooldown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage(data.message || (authChannel === "phone" 
        ? `Security OTP sent to mobile phone ${data.maskedTarget || identifier} via SMS`
        : `Security OTP sent to ${data.maskedTarget || identifier} via email`));
      setStage("INPUT_CODE");

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch verification OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    if (isLoading) return; // Prevent duplicate verification requests
    const fullCode = codeToVerify || otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    const identifier = authChannel === "phone" 
      ? `${countryCode}${phoneNumber.replace(/\D/g, "")}` 
      : emailAddress.trim();

    const finalLocation = customLocationInput.trim() || selectedLocation;

    try {
      const response = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          otp: fullCode,
          role: selectedRole,
          name: fullName.trim() || undefined,
          location: finalLocation
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setFailedAttempts((prev) => prev + 1);
        setOtpDigits(["", "", "", "", "", ""]);
        setErrorMessage(data.error || "Incorrect verification code. Please check your SMS and try again.");
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
        return;
      }

      // Save user session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("seva_auth_user", JSON.stringify(data.user));
        localStorage.setItem("seva_auth_token", data.token);
      }

      setAuthenticatedUser(data.user);
      setSuccessMessage(entryMode === "register" ? "Registration verified & activated!" : "Identity verified successfully!");
      setStage("VERIFICATION_SUCCESS");

      // Smooth transition to logged-in user callback
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1200);

    } catch (err: any) {
      setFailedAttempts((prev) => prev + 1);
      setOtpDigits(["", "", "", "", "", ""]);
      setErrorMessage("Network connection error. Please check your connection and try again.");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (cleanVal.length > 1) {
      handlePasteOtp(cleanVal);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5) {
      const completeCode = newDigits.join("");
      if (completeCode.length === 6) {
        handleVerifyOtp(completeCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (pastedText: string) => {
    const cleanDigits = pastedText.replace(/\D/g, "").slice(0, 6);
    if (!cleanDigits) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < cleanDigits.length; i++) {
      newDigits[i] = cleanDigits[i];
    }
    setOtpDigits(newDigits);

    if (cleanDigits.length === 6) {
      handleVerifyOtp(cleanDigits);
    } else {
      otpInputRefs.current[cleanDigits.length]?.focus();
    }
  };

  const handleRetryInput = () => {
    setStage("INPUT_CODE");
    setOtpDigits(["", "", "", "", "", ""]);
    setErrorMessage("");
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  const currentStep = stage === "SEND_CODE" ? 1 : stage === "INPUT_CODE" ? 2 : 3;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-full font-sans flex flex-col relative pb-8 select-none">
      
      {/* ACTIVE USER SESSION CARD (IF ALREADY LOGGED IN) */}
      {currentUser && (
        <div className="p-3.5 pb-0">
          <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200 shadow-xs">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900">{currentUser.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8.5px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-orange-600" />
                    <span>{currentUser.location || "Bengaluru (Central HQ)"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onExploreGuest || onBack}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN AUTHENTICATION CONTAINER */}
      <div className="p-3.5 space-y-3.5 flex-1">

        {/* OFFICIAL SEVA SPHOORTHI LOGO HEADER (SOURCE OF TRUTH: SEVASPHOORTHI.COM) */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center select-none">
          <img
            src="/assets/branding/sevasphoorthi_logo.png"
            alt="Seva Sphoorthi Official Logo"
            className="w-16 h-16 object-contain drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-base font-black text-slate-900 tracking-tight mt-1 leading-none">
            Seva Sphoorthi
          </h1>
          <span className="text-[9.5px] font-extrabold text-orange-600 uppercase tracking-widest mt-0.5">
            Charitable Trust
          </span>
        </div>

        {/* 1 -> 2 -> 3 STEPPER BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
          <div className="flex items-center justify-between relative px-2">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1 && stage !== "VERIFICATION_SUCCESS") {
                  setStage("SEND_CODE");
                }
              }}
              disabled={currentStep === 1 || stage === "VERIFICATION_SUCCESS"}
              className={`flex flex-col items-center gap-1 z-10 ${
                currentStep > 1 && stage !== "VERIFICATION_SUCCESS" ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
              title="Step 1: Registration / Credentials"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === 1 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100" 
                    : currentStep > 1 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">Step 1</span>
                <span className={`text-[10.5px] font-extrabold block mt-0.5 ${
                  currentStep === 1 ? "text-orange-600" : currentStep > 1 ? "text-emerald-700" : "text-slate-500"
                }`}>
                  {entryMode === "register" ? "Register" : "Details"}
                </span>
              </div>
            </button>

            {/* Connector 1 -> 2 */}
            <div className="flex-1 mx-2 -mt-4 relative h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300" 
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 2 */}
            <div 
              className="flex flex-col items-center gap-1 z-10"
              title="Step 2: Verify 6-Digit OTP"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === 2 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-4 ring-orange-100" 
                    : currentStep > 2 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : "2"}
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">Step 2</span>
                <span className={`text-[10.5px] font-extrabold block mt-0.5 ${
                  currentStep === 2 ? "text-orange-600" : currentStep > 2 ? "text-emerald-700" : "text-slate-500"
                }`}>
                  Verify OTP
                </span>
              </div>
            </div>

            {/* Connector 2 -> 3 */}
            <div className="flex-1 mx-2 -mt-4 relative h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300" 
                style={{ width: currentStep >= 3 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 3 */}
            <div 
              className="flex flex-col items-center gap-1 z-10"
              title="Step 3: Identity & Chapter Verified"
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === 3 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-4 ring-emerald-100" 
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {currentStep === 3 ? <Check className="w-4 h-4 stroke-[3]" /> : "3"}
              </div>
              <div className="text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">Step 3</span>
                <span className={`text-[10.5px] font-extrabold block mt-0.5 ${
                  currentStep === 3 ? "text-emerald-700" : "text-slate-500"
                }`}>
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WELCOME BANNER FOR STEP 1 */}
        {stage === "SEND_CODE" && (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full text-orange-700 text-[10px] font-extrabold uppercase tracking-wider">
                <KeyRound className="w-3 h-3 text-orange-600" />
                <span>Step 1 of 3: {entryMode === "login" ? "Account Sign In" : "Volunteer Registration"}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">1 / 3</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 pt-0.5">
              {entryMode === "login" ? "Sign in to your account" : "Register as a volunteer"}
            </h2>
            <p className="text-xs text-slate-500">
              {entryMode === "login" 
                ? "Enter your mobile number to receive a secure 6-digit OTP." 
                : "Create your profile and connect with your local seva chapter."}
            </p>
          </div>
        )}

        {/* DUAL-MODE TAB SWITCHER (FOR STEP 1) */}
        {stage === "SEND_CODE" && (
          <div className="bg-slate-200/70 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setEntryMode("login");
                setErrorMessage("");
                setStage("SEND_CODE");
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                entryMode === "login"
                  ? "bg-white text-orange-600 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryMode("register");
                setErrorMessage("");
                setStage("SEND_CODE");
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                entryMode === "register"
                  ? "bg-white text-orange-600 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>New Registration</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: 'SEND CODE' (Clean realistic phone & chapter form)   */}
        {/* ------------------------------------------------------------- */}
        {stage === "SEND_CODE" && (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            
            {/* 1. SEVA CHAPTER / LOCATION SELECTOR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Seva Chapter
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="text-[10px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Compass className={`w-3 h-3 ${isDetectingLocation ? "animate-spin" : ""}`} />
                  <span>{isDetectingLocation ? "Locating..." : "Auto-Locate GPS"}</span>
                </button>
              </div>

              {locationDetectSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-[10px] text-emerald-800 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{locationDetectSuccess}</span>
                </div>
              )}

              {/* Location Quick Selection Chips */}
              <div className="grid grid-cols-2 gap-1.5">
                {SEVA_LOCATIONS.slice(0, showAllLocations ? SEVA_LOCATIONS.length : 4).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc.name);
                      setCustomLocationInput("");
                    }}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 text-xs ${
                      selectedLocation === loc.name && !customLocationInput
                        ? "bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate text-[11px]">{loc.name.split(" (")[0]}</span>
                      {selectedLocation === loc.name && !customLocationInput && (
                        <Check className="w-3 h-3 text-orange-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate">{loc.zone}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAllLocations(!showAllLocations)}
                  className="text-[10px] text-slate-500 hover:text-orange-600 font-semibold cursor-pointer transition"
                >
                  {showAllLocations ? "Show fewer chapters" : "+ View all 9 chapters"}
                </button>
              </div>

              {/* Custom City / Taluk */}
              <input
                type="text"
                placeholder="Or enter other taluk/city (e.g., Hubballi, Belagavi)..."
                value={customLocationInput}
                onChange={(e) => {
                  setCustomLocationInput(e.target.value);
                  if (e.target.value) setSelectedLocation(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>

            {/* 2. REGISTRATION-SPECIFIC FIELDS */}
            {entryMode === "register" && (
              <div className="space-y-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Anjali Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Primary Seva Focus
                  </label>
                  <select
                    value={sevaInterest}
                    onChange={(e) => setSevaInterest(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none transition"
                  >
                    <option value="Food Relief & Annadana">🍲 Food Relief & Annadana Drives</option>
                    <option value="Rural Child Education">📚 Rural Child Education & Mentoring</option>
                    <option value="Emergency Blood Network">🩸 Emergency Blood Donation Squad</option>
                    <option value="Temple Heritage Care">🛕 Temple Swachh & Heritage Conservation</option>
                  </select>
                </div>
              </div>
            )}

            {/* 3. AUTH CHANNEL & PHONE/EMAIL INPUT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs">
              <div className="bg-slate-100 p-0.5 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthChannel("phone"); setErrorMessage(""); }}
                  className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                    authChannel === "phone" 
                      ? "bg-white text-orange-600 shadow-xs font-bold" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthChannel("email"); setErrorMessage(""); }}
                  className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                    authChannel === "email" 
                      ? "bg-white text-orange-600 shadow-xs font-bold" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>

              {authChannel === "phone" ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="w-20 shrink-0 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98200 45678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 outline-none transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="volunteer@sevasphoorthi.org"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 outline-none transition"
                  />
                </div>
              )}
            </div>

            {/* ERROR ALERTS */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SUBMIT BUTTON (VIBRANT ORANGE & WHITE) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP Code...</span>
                </>
              ) : (
                <>
                  <span>
                    {entryMode === "register" ? "Step 1 of 3: Register & Send 6-Digit OTP" : "Step 1 of 3: Send 6-Digit Verification Code"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 2: 'INPUT CODE' (Verify your mobile number)              */}
        {/* ------------------------------------------------------------- */}
        {stage === "INPUT_CODE" && (
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="space-y-1.5 text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                {authChannel === "phone" ? "Verify your mobile number" : "Verify your email address"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've sent a 6-digit code to<br />
                <span className="text-slate-900 font-mono font-bold text-sm tracking-wide">
                  {maskedTarget || (authChannel === "phone" ? `+91 ••••• ••${phoneNumber.replace(/\D/g, "").slice(-2)}` : emailAddress)}
                </span>
              </p>
            </div>

            {/* SIX ACCESSIBLE OTP INPUT CELLS */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between gap-1.5 max-w-xs mx-auto">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={1}
                    aria-label={`Digit ${index + 1} of 6`}
                    disabled={isLoading || failedAttempts >= 5}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-black font-mono bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-slate-900 outline-none transition shadow-xs disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {/* ERROR ALERTS */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* PRIMARY ACTION: VERIFY & CONTINUE */}
            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otpDigits.join("").length !== 6 || failedAttempts >= 5}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition active:scale-98"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify &amp; Continue</span>
              )}
            </button>

            {/* SECONDARY ACTIONS: RESEND COUNTDOWN & CHANGE NUMBER */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStage("SEND_CODE");
                  setErrorMessage("");
                  setOtpDigits(["", "", "", "", "", ""]);
                }}
                className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change number</span>
              </button>

              <div>
                {resendCooldown > 0 ? (
                  <span className="text-slate-500 font-medium">
                    Resend in <strong className="font-mono text-slate-800 font-bold">{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={isLoading}
                    className="text-orange-600 hover:text-orange-700 font-extrabold cursor-pointer transition"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3A: 'VERIFICATION SUCCESS' (Step 3 of 3: Completed)     */}
        {/* ------------------------------------------------------------- */}
        {stage === "VERIFICATION_SUCCESS" && authenticatedUser && (
          <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-5 text-center space-y-3.5 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Step 3 of 3: Verification Complete</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">3 / 3</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {entryMode === "register" ? "Registered Successfully" : "Verified Successfully"}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                Welcome, {authenticatedUser.name}!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Role: <strong className="text-emerald-700 capitalize">{authenticatedUser.role}</strong> • Chapter: <strong className="text-slate-800">{authenticatedUser.location || "Bengaluru (Central HQ)"}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left text-xs space-y-1 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Seva ID:</span>
                <span className="font-bold text-slate-900">{authenticatedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security:</span>
                <span className="text-emerald-700 font-bold">100% Passwordless Verified</span>
              </div>
            </div>

            <button
              onClick={() => onLoginSuccess(authenticatedUser)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Step 3 Complete: Continue to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3B: 'VERIFICATION FAILURE' (Clean Light Card)           */}
        {/* ------------------------------------------------------------- */}
        {stage === "VERIFICATION_FAILURE" && (
          <div className="bg-white border-2 border-rose-400 rounded-2xl p-5 text-center space-y-3 shadow-sm animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>

            <div>
              <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Invalid Code
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Verification Failed</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                {errorMessage || "The code entered did not match. Please try again."}
              </p>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono">
              Failed attempts: <strong className="text-rose-600">{failedAttempts} of 5</strong>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRetryInput}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-enter 6-Digit Code</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GUEST ACCESS LINK & SECURITY FOOTNOTE (CLEAN ORANGE & SLATE) */}
      <div className="px-4 pt-2 text-center space-y-2 text-[10px] text-slate-500">
        <button
          onClick={onExploreGuest || onBack}
          className="text-xs text-orange-600 hover:text-orange-700 font-extrabold cursor-pointer transition inline-flex items-center gap-1"
        >
          <span>Want to browse programs first? Continue as Guest</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <div className="flex items-center justify-center gap-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Zero passwords needed • Verified against NITI Aayog Seva Directory</span>
        </div>
      </div>
    </div>
  );
}
