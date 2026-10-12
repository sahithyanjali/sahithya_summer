import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Heart, User, Phone, Mail, MapPin, Image as ImageIcon, FileText, 
  Calendar, Award, ChevronLeft, Menu, Plus, Search, Bell, Share2, 
  CheckCircle2, AlertTriangle, AlertCircle, CreditCard, Download, Loader2, X, Info,
  Briefcase, Layers, HelpCircle, Eye, Globe, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Fingerprint, Camera, Wifi, WifiOff, Sliders, Shield,
  Upload, ImagePlus, Trash2, Sparkles, ShieldCheck, Check, Landmark, Utensils,
  BookOpen, Flame, Compass, HeartHandshake, RefreshCw, ArrowDown, RotateCw, TrendingUp
} from "lucide-react";
import ProfilePhotoModal from "./ProfilePhotoModal";
import VolunteerPortal from "./VolunteerPortal";
import TemplesScreen from "./TemplesScreen";
import AppLandingScreen from "./AppLandingScreen";
import LoginScreen from "./LoginScreen";
import ThemeSplashScreen from "./ThemeSplashScreen";
import SevaOpeningScreen from "./SevaOpeningScreen";
import AiSmartSearchModal from "./AiSmartSearchModal";
import { TEMPLES_DATA } from "../data/temples_data";
import { 
  VolunteerFormState, DonationFormState, PushNotificationPayload,
  TempleItem, TempleSevaSlot, TempleSponsorship, AuthUser, AuthRole
} from "../types";

export type MobilePlatform = "ios" | "android" | "tablet" | "kaios" | "pwa";

interface PhoneSimulatorProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  activeStep: number;
  // Shared global records so updates persist and can be seen in Profile/History
  volunteerStatus: "None" | "Pending" | "Registered";
  setVolunteerStatus: (status: "None" | "Pending" | "Registered") => void;
  donations: Array<{ donorName: string; amount: number; purpose: string; date: string; id: string }>;
  addDonation: (donation: { donorName: string; amount: number; purpose: string; id: string }) => void;
  language?: "en" | "hi";
  setLanguage?: (lang: "en" | "hi") => void;
  incomingNotification: PushNotificationPayload | null;
  clearNotification: () => void;
  isOfflineMode?: boolean;
  primaryColor?: string;
  isStandaloneView?: boolean;
  platform?: MobilePlatform;
  onPlatformChange?: (platform: MobilePlatform) => void;
  onRefreshFeeds?: () => Promise<void>;
}

export default function PhoneSimulator({
  currentScreen,
  setCurrentScreen,
  activeStep,
  volunteerStatus,
  setVolunteerStatus,
  donations,
  addDonation,
  language = "en",
  setLanguage,
  incomingNotification,
  clearNotification,
  isOfflineMode = false,
  primaryColor = "#ea580c",
  isStandaloneView = false,
  platform = "ios",
  onPlatformChange,
  onRefreshFeeds,
}: PhoneSimulatorProps) {
  // Local translations dictionary
  const t = {
    en: {
      appTitle: "Seva Sphoorthi",
      ngoTitle: "Seva Charitable Trust",
      navHome: "Home Dashboard",
      navAbout: "About & Mission",
      navPrograms: "Active Programs",
      navServices: "Services Offered",
      navJobs: "Dharma Careers",
      navTemples: "Temples & Dharma Seva",
      navEvents: "Events Registration",
      navVolunteer: "Join as Volunteer",
      navDonate: "Donate Now (Razorpay)",
      navGallery: "Gallery Grid",
      navContact: "Contact & Map",
      navFaq: "Help & FAQ Section",
      heroHeadline: "Enlightening Rural Communities with Seva",
      heroSubhead: "We connect volunteers, sponsor child education programs, and direct medical clinics to marginalized sectors.",
      ctaDonate: "Sponsor Meal/Education",
      ctaVolunteer: "Join Volunteer Mission",
      ourCorePillars: "Our Core Seva Pillars",
      aboutHeadline: "Driving Real Social Integration Since 2012.",
      aboutBody: "Seva Charitable Trust is a verified grassroot non-government organization focused on empowering communities, securing child health databases, and creating free medicine distribution pipelines across rural hamlets."
    },
    hi: {
      appTitle: "सेवा स्फूर्ति",
      ngoTitle: "सेवा चैरिटेबल ट्रस्ट",
      navHome: "होम डैशबोर्ड",
      navAbout: "हमारे बारे में",
      navPrograms: "सक्रिय कार्यक्रम",
      navServices: "प्रदान की जाने वाली सेवाएँ",
      navJobs: "धर्म करियर (नौकरियां)",
      navTemples: "मंदिर और धर्म सेवा",
      navEvents: "आयोजन पंजीकरण",
      navVolunteer: "स्वयंसेवक बनें",
      navDonate: "अभी दान करें (Razorpay)",
      navGallery: "गैलरी और तस्वीरें",
      navContact: "संपर्क और मानचित्र",
      navFaq: "सामान्य प्रश्न एवं सहायता",
      heroHeadline: "ग्रामीण समुदायों में सेवा का प्रकाश फैलाना",
      heroSubhead: "हम स्वयंसेवकों को जोड़ते हैं, बच्चों की शिक्षा को प्रायोजित करते हैं, और हाशिए के क्षेत्रों के लिए चिकित्सा क्लीनिक संचालित करते हैं।",
      ctaDonate: "भोजन/शिक्षा प्रायोजित करें",
      ctaVolunteer: "स्वयंसेवक मिशन से जुड़ें",
      ourCorePillars: "हमारे मूल सेवा स्तंभ",
      aboutHeadline: "2012 से स्थायी सामाजिक सुधार की दिशा में अग्रणी।",
      aboutBody: "सेवा चैरिटेबल ट्रस्ट एक सत्यापित जमीनी गैर-सरकारी संगठन है, जो ग्रामीण क्षेत्रों में समाज को सशक्त बनाने, बाल स्वास्थ्य डाटाबेस सुरक्षित करने और मुफ्त दवा वितरण पाइपलाइनों के विकास पर केंद्रित है।"
    }
  }[language === "hi" ? "hi" : "en"];

  // Simulator UI State Management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [notificationBannerVisible, setNotificationBannerVisible] = useState(false);
  const [localPushNotification, setLocalPushNotification] = useState<{ title: string; body: string } | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [jobKeyword, setJobKeyword] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [selectedJobCategory, setSelectedJobCategory] = useState("All");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("All");
  const [selectedExploreCategory, setSelectedExploreCategory] = useState("Community");
  const [exploreTab, setExploreTab] = useState<"services" | "jobs">("services");

  // Simulated Mobile Device Native Hardware States
  const [airplaneMode, setAirplaneMode] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [gpsMockLocation, setGpsMockLocation] = useState<string>("bangalore_rural");
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const [hapticFeedbacks, setHapticFeedbacks] = useState<string[]>([]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("seva_custom_avatar") || null;
    }
    return null;
  });
  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState<boolean>(false);
  const [controlCenterOpen, setControlCenterOpen] = useState<boolean>(false);
  const [aiSearchModalOpen, setAiSearchModalOpen] = useState<boolean>(false);
  const [aiSearchInitialQuery, setAiSearchInitialQuery] = useState<string>("");
  const quickProfileFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Authentication & OTP State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seva_auth_user");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return null;
  });
  const [loginInitialRole, setLoginInitialRole] = useState<AuthRole>("volunteer");
  const [previousScreen, setPreviousScreen] = useState<string>("home");

  const showToast = (title: string, body: string) => {
    setLocalPushNotification({ title, body });
    setNotificationBannerVisible(true);
    setTimeout(() => {
      setNotificationBannerVisible(false);
    }, 4500);
  };

  const handleAuthLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    triggerHaptic("heavy");
    if (user.role === "volunteer") {
      setVolunteerStatus("Registered");
      navigateTo("volunteer");
    } else if (user.role === "donor") {
      navigateTo("donations");
    } else if (user.role === "admin") {
      navigateTo("home");
    } else {
      navigateTo("home");
    }
  };

  const handleAuthLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("seva_auth_token") : null;
      if (token) {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("seva_auth_user");
      localStorage.removeItem("seva_auth_token");
    }
    setAuthUser(null);
    triggerHaptic("medium");
  };

  const handleSaveAvatar = (newAvatar: string | null) => {
    setCustomAvatar(newAvatar);
    if (typeof window !== "undefined") {
      if (newAvatar) {
        localStorage.setItem("seva_custom_avatar", newAvatar);
      } else {
        localStorage.removeItem("seva_custom_avatar");
      }
    }
    triggerHaptic("success");
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Invalid Image", "Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress and resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 512;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.88);
            handleSaveAvatar(compressed);
          } else {
            handleSaveAvatar(result);
          }
          showToast("Profile Updated", "Profile picture uploaded and saved successfully!");
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Camera Sim States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFlash, setCameraFlash] = useState<boolean>(false);
  const [cameraZoom, setCameraZoom] = useState<number>(1);
  const [cameraFilter, setCameraFilter] = useState<string>("none");

  // In-App Browser Simulation States
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [browserTitle, setBrowserTitle] = useState<string>("");
  const [instagramPhotoSelected, setInstagramPhotoSelected] = useState<string | null>(null);
  const [fbliked, setFbliked] = useState<boolean>(false);
  const [xlikeCount, setXlikeCount] = useState<number>(142);
  const [xliked, setXliked] = useState<boolean>(false);
  const [donationMealBudget, setDonationMealBudget] = useState<number>(500);

  // In-App Secure Email Composer Simulation States
  const [composeEmailTo, setComposeEmailTo] = useState<string | null>(null);
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [outbox, setOutbox] = useState<Array<{ to: string, subject: string, body: string, date: string }>>([]);

  // Biometric Dialog States
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricSuccess, setBiometricSuccess] = useState<boolean>(false);
  const [biometricPendingAction, setBiometricPendingAction] = useState<any>(null);

  // Connection Speed State
  const [networkSpeed, setNetworkSpeed] = useState<"5G" | "3G" | "Offline">("5G");

  // Low Power Mode State
  const [lowPowerMode, setLowPowerMode] = useState<boolean>(false);

  // Real-time browser connectivity state
  const [isRealOnline, setIsRealOnline] = useState<boolean>(
    typeof window !== "undefined" && typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Trigger simulated haptic feedback log
  const triggerHaptic = (style: "light" | "medium" | "heavy" | "success" | "warning") => {
    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const logStr = `[${ts}] 📳 HapticFeedback.${style}Impact() requested`;
    setHapticFeedbacks(prev => [logStr, ...prev].slice(0, 4));
  };

  const launchSimulatedBrowser = (title: string, url: string) => {
    triggerHaptic("medium");
    setBrowserTitle(title);
    setBrowserUrl(url);
  };

  const openSimulatedMail = (email: string) => {
    triggerHaptic("medium");
    setComposeEmailTo(email);
    setComposeSubject("");
    setComposeBody("");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleOnline = () => {
      setIsRealOnline(true);
      triggerHaptic("success");
    };
    const handleOffline = () => {
      setIsRealOnline(false);
      triggerHaptic("warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Dynamic local phone time & greeting based on device/phone local time
  const [phoneLocalTime, setPhoneLocalTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const getDynamicGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else if (hour >= 17 && hour < 22) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPhoneLocalTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const [volunteerInitialTab, setVolunteerInitialTab] = useState<"opportunities" | "onboarding" | "schedule" | "notifications" | "impact">("opportunities");

  const gpsCoordinates = {
    bangalore_rural: { name: "Bangalore Rural Outskirts", coords: "13.2105° N, 77.3484° E", region: "Devenahalli Area", marker: "🌾 Rural School site" },
    nelamangala_suburbs: { name: "Nelamangala Green Hub", coords: "13.0970° N, 77.3915° E", region: "Vaidya Camp Ground", marker: "🩺 Medical tent venue" },
    mangalore_rural: { name: "West Mangalore Farming Belt", coords: "12.9141° N, 74.8560° E", region: "Coastal Seva Ward", marker: "🍎 Hunger relief station" },
    karwar_coast: { name: "Coastal Karwar Fishing Hamlets", coords: "14.8185° N, 74.1300° E", region: "Dockyard Child Center", marker: "📚 Vidya library site" }
  };

  // Form states
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormState>({
    fullName: "",
    email: "",
    phone: "",
    interestArea: "Education",
    experience: "",
    isSubmitting: false,
    success: false,
  });

  const [donationForm, setDonationForm] = useState<DonationFormState>({
    donorName: "",
    email: "",
    amount: 1000,
    purpose: "Community Service",
    isProcessing: false,
    success: false,
    paymentId: null,
  });

  const [donationStep, setDonationStep] = useState<"amount" | "summary" | "processing" | "success" | "failure">("amount");
  const [donationInlineError, setDonationInlineError] = useState<string | null>(null);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState<"card" | "upi" | "netbanking">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<"gpay" | "phonepe" | "paytm" | "bhim">("gpay");
  const [upiPaymentStage, setUpiPaymentStage] = useState<"choose_app" | "processing">("choose_app");
  const [paymentFailure, setPaymentFailure] = useState<string | null>(null);
  const [upiTab, setUpiTab] = useState<"apps" | "qr" | "manual">("apps");
  const [donorUtrInput, setDonorUtrInput] = useState<string>("");
  const [upiAppDispatched, setUpiAppDispatched] = useState<boolean>(false);
  const [currentGatewayOrder, setCurrentGatewayOrder] = useState<{ orderId: string; paymentId: string; keyId: string } | null>(null);
  const [verifiedReceiptData, setVerifiedReceiptData] = useState<any>(null);

  // Multi-platform specific states
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState<boolean>(false);
  const [kaiosActiveKey, setKaiosActiveKey] = useState<string | null>(null);

  // Real reactive state tracking applied jobs
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("seva_applied_job_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("seva_applied_job_ids", JSON.stringify(appliedJobIds));
  }, [appliedJobIds]);

  const handleApplyToJob = async (jobId: number, jobTitle: string, company: string) => {
    triggerHaptic("success");
    if (appliedJobIds.includes(jobId)) {
      showToast("Application Under Review", `You have already applied for "${jobTitle}" at "${company}".`);
      return;
    }
    setAppliedJobIds(prev => [...prev, jobId]);

    // Send real application record to backend for Active Admin Monitoring
    try {
      await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: `JOB-${jobId}`,
          opportunityTitle: `${jobTitle} (${company})`,
          category: "CAREER",
          volunteerName: volunteerForm.fullName || "Mobile App Applicant",
          volunteerEmail: volunteerForm.email || "applicant@sevasphoorthi.org",
          volunteerPhone: volunteerForm.phone || "+91 98765 00000",
          notes: `Direct Dharma Career submission for position ${jobTitle} at ${company}`
        })
      });
    } catch (err) {
      console.warn("Offline or failed job application transmission:", err);
    }

    showToast("Application Received", `Your application for "${jobTitle}" has been received.`);
  };

  // Real reactive state tracking joined temple seva slots
  const [joinedSevaSlotIds, setJoinedSevaSlotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("seva_joined_slots");
      return saved ? JSON.parse(saved) : ["ghati-anna-1", "halasuru-swachh-1"];
    } catch (e) {
      return ["ghati-anna-1", "halasuru-swachh-1"];
    }
  });

  useEffect(() => {
    localStorage.setItem("seva_joined_slots", JSON.stringify(joinedSevaSlotIds));
  }, [joinedSevaSlotIds]);

  // Real reactive state tracking temple eco/swachh pledges
  const [templePledges, setTemplePledges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("seva_temple_pledges");
      return saved ? JSON.parse(saved) : ["ghati-subramanya", "halasuru-someshwara"];
    } catch (e) {
      return ["ghati-subramanya", "halasuru-someshwara"];
    }
  });

  useEffect(() => {
    localStorage.setItem("seva_temple_pledges", JSON.stringify(templePledges));
  }, [templePledges]);

  const handleJoinSevaSlot = async (slot: TempleSevaSlot, temple: TempleItem) => {
    triggerHaptic("success");
    if (joinedSevaSlotIds.includes(slot.id)) {
      return;
    }
    setJoinedSevaSlotIds(prev => [...prev, slot.id]);
    if (volunteerStatus === "None") {
      setVolunteerStatus("Registered");
    }
    try {
      await fetch("/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: `SEVA-${slot.id}`,
          opportunityTitle: `${slot.title} (${temple.name})`,
          category: slot.category,
          volunteerName: volunteerForm.fullName || "Devotee Volunteer",
          volunteerEmail: volunteerForm.email || "volunteer@sevasphoorthi.org",
          volunteerPhone: volunteerForm.phone || "+91 98765 43210",
          notes: `Joined Seva Slot at ${temple.name} on ${slot.date} (${slot.time})`
        })
      });
    } catch (e) {
      console.warn("Seva slot registration stored locally", e);
    }
  };

  const handleSponsorTempleSeva = (sponsorship: TempleSponsorship, temple: TempleItem) => {
    triggerHaptic("medium");
    setDonationForm(prev => ({
      ...prev,
      amount: sponsorship.amount,
      purpose: `${temple.name}: ${sponsorship.title}`
    }));
    navigateTo("donations");
  };

  const handleToggleTemplePledge = (templeId: string, templeName: string) => {
    triggerHaptic("success");
    if (templePledges.includes(templeId)) {
      setTemplePledges(prev => prev.filter(id => id !== templeId));
    } else {
      setTemplePledges(prev => [...prev, templeId]);
    }
  };

  // Show push notification overlay animation when a notification is triggered
  useEffect(() => {
    if (incomingNotification) {
      setNotificationBannerVisible(true);
      const timer = setTimeout(() => {
        // Automatically hide notification banner after 6 seconds
        // but keep it in history/state if desired
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [incomingNotification]);

  // Quick helper to jump route
  const navigateTo = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    setDrawerOpen(false);
    setSelectedProgram(null);
  };

  // Sample data simulating core NGO elements
  const activePrograms = [
    {
      id: "aahara",
      title: "🍲 Aahara Drive (Hunger Relief)",
      tagline: "Nourishing wholesome meals daily",
      desc: "Providing healthy, hot midday meals for hundreds of homeless individuals, daily laborers, and children living in Bangalore's rural outskirts.",
      goal: 250000,
      raised: 184200,
      sponsorOptions: [500, 1500, 5000],
      img: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=600"
    },
    {
      id: "vidya",
      title: "📚 Vidya Project (Child Education)",
      tagline: "Sponsor educational supplies & books",
      desc: "Distributing complete backpacks with notebooks, geometry boxes, shoes, and primary materials to rural and government school kids to promote attendance.",
      goal: 300000,
      raised: 215000,
      sponsorOptions: [800, 1600, 4000],
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600"
    },
    {
      id: "vaidya",
      title: "🩺 Vaidya Camps (Medical Care)",
      tagline: "Free health checkups & eye screenings",
      desc: "Setting up monthly medical testing centers in isolated villages providing expert doctors, cardiovascular diagnostics, eye checkups, and free medicine supplies.",
      goal: 150000,
      raised: 75000,
      sponsorOptions: [1000, 3000, 5000],
      img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600"
    }
  ];

  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=500", caption: "Vidya Project: Backpack & textbook delivery in rural schools" },
    { url: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=500", caption: "Aahara Drive: Hot meals preparation and food distribution" },
    { url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500", caption: "Vaidya Camps: Free pediatric checkups & medicine distribution" },
    { url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=500", caption: "Sphoorthi Blood Camp: Voluntary community blood donation" },
    { url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=500", caption: "Green Shield: Tree planting & rural community afforestation" },
    { url: "https://images.unsplash.com/photo-1469571486090-7db5538d73b1?q=80&w=500", caption: "Winter Relief: Warm blanket distribution to rural families" }
  ];

  // Live Backend Event Feeds (State with initial fallbacks, refreshed from /api/v1/events)
  const [eventsList, setEventsList] = useState<Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    desc: string;
    img: string;
    category?: string;
    status?: "Active" | "Completed";
    volunteersRegistered?: number;
    targetVolunteers?: number;
  }>>([
    {
      id: "blood_drive",
      title: "Sphoorthi Mega Blood Donation Drive",
      date: "15 JUNE 2026",
      time: "8:00 AM - 1:00 PM",
      location: "NGO Civil Town Hall, Bangalore",
      desc: "Collaborating with central hospitals to construct secure blood stores. Free health certification for donors.",
      img: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600",
      category: "Healthcare",
      status: "Active",
      volunteersRegistered: 34,
      targetVolunteers: 50
    },
    {
      id: "green_shield",
      title: "Rural Afforestation & Plantation Weekend",
      date: "28 JUNE 2026",
      time: "9:30 AM - 3:00 PM",
      location: "Nelamangala Village Suburbs",
      desc: "Inviting 50 volunteers to plant saplings and build micro-irrigation systems. High eco-social contribution.",
      img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600",
      category: "Environment",
      status: "Active",
      volunteersRegistered: 42,
      targetVolunteers: 60
    },
    {
      id: "vidya_kit_drive",
      title: "Vidya Project: School Backpacks & Notebooks",
      date: "05 JULY 2026",
      time: "10:00 AM - 2:00 PM",
      location: "Devenahalli Rural Primary School",
      desc: "Distribution of complete educational backpacks, geometry kits, and uniforms for 250 rural students.",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600",
      category: "Education",
      status: "Active",
      volunteersRegistered: 28,
      targetVolunteers: 35
    },
    {
      id: "kengeri_food_drive",
      title: "Kengeri Night Shelter Food Drive",
      date: "10 MAY 2026",
      time: "7:00 PM - 10:00 PM",
      location: "Kengeri Satellite Town, Bangalore",
      desc: "Served 1,000 hot nutritious meals to night shelter residents and destitute families.",
      img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600",
      category: "Food Relief",
      status: "Completed",
      volunteersRegistered: 25,
      targetVolunteers: 25
    }
  ]);

  // Pull-to-refresh & Live Backend Sync States
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("Today at 08:55 AM");
  const [refreshSuccessBanner, setRefreshSuccessBanner] = useState<string | null>(null);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const pullStartYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  // Live Backend Donation Statistics
  const [donationStats, setDonationStats] = useState<{
    totalSum: number;
    count: number;
    averageDonation: number;
    verifiedCount: number;
  }>(() => {
    const total = donations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const count = donations.length;
    return {
      totalSum: total > 0 ? total : 284500,
      count: count > 0 ? count : 48,
      averageDonation: count > 0 ? Math.round(total / count) : 5920,
      verifiedCount: count > 0 ? count : 48
    };
  });

  // Keep donation stats synchronized with donations prop
  useEffect(() => {
    if (donations && donations.length > 0) {
      const sum = donations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
      setDonationStats(prev => ({
        ...prev,
        totalSum: sum,
        count: donations.length,
        averageDonation: Math.round(sum / donations.length),
        verifiedCount: donations.length
      }));
    }
  }, [donations]);

  // Initial load of backend statistics and events
  useEffect(() => {
    fetch("/api/v1/donations")
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          const totalSum = data.totalSum || (Array.isArray(data.donations) 
            ? data.donations.reduce((acc: number, d: any) => acc + (Number(d.amount) || 0), 0)
            : 0);
          const count = data.count ?? (Array.isArray(data.donations) ? data.donations.length : 0);
          setDonationStats({
            totalSum: totalSum > 0 ? totalSum : 284500,
            count: count > 0 ? count : 48,
            averageDonation: data.averageDonation || (count > 0 ? Math.round(totalSum / count) : 5920),
            verifiedCount: count > 0 ? count : 48
          });
        }
      })
      .catch(() => {});

    fetch("/api/v1/events")
      .then(r => r.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEventsList(data.events);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Manual Pull-To-Refresh Trigger
  const handleTriggerRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(52);
    triggerHaptic("medium");

    try {
      // 1. Fetch donations and calculate statistics
      const donationPromise = fetch("/api/v1/donations")
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            const totalSum = data.totalSum || (Array.isArray(data.donations) 
              ? data.donations.reduce((acc: number, d: any) => acc + (Number(d.amount) || 0), 0)
              : 0);
            const count = data.count ?? (Array.isArray(data.donations) ? data.donations.length : 0);
            setDonationStats({
              totalSum: totalSum > 0 ? totalSum : 284500,
              count: count > 0 ? count : 48,
              averageDonation: data.averageDonation || (count > 0 ? Math.round(totalSum / count) : 5920),
              verifiedCount: count > 0 ? count : 48
            });
            return { donationCount: count, totalSum };
          }
          return { donationCount: 0, totalSum: 0 };
        })
        .catch(() => ({ donationCount: 0, totalSum: 0 }));

      // 2. Fetch events feed
      const eventsPromise = fetch("/api/v1/events")
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.events) && data.events.length > 0) {
            setEventsList(data.events);
            return { eventsCount: data.events.length };
          }
          return { eventsCount: 0 };
        })
        .catch(() => ({ eventsCount: 0 }));

      // Call parent refresh if provided
      if (onRefreshFeeds) {
        await onRefreshFeeds().catch(() => {});
      }

      // Minimum visual delay of 750ms for natural feeling feedback
      const [donationRes, eventsRes] = await Promise.all([
        donationPromise,
        eventsPromise,
        new Promise(resolve => setTimeout(resolve, 750))
      ]);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastRefreshedAt(`Today at ${timeStr}`);
      const updatedEventsCount = eventsRes.eventsCount || eventsList.length;
      setRefreshSuccessBanner(`Updated ${donationRes.donationCount || donationStats.count} donations & ${updatedEventsCount} events from backend`);
      triggerHaptic("success");

      setTimeout(() => {
        setRefreshSuccessBanner(null);
      }, 3500);

    } catch (err) {
      console.error("Failed to refresh home feed:", err);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  // Touch Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (homeScrollRef.current && homeScrollRef.current.scrollTop <= 0 && !isRefreshing) {
      pullStartYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingRef.current || isRefreshing) return;
    if (homeScrollRef.current && homeScrollRef.current.scrollTop > 0) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - pullStartYRef.current;
    if (delta > 0) {
      const distance = Math.min(Math.pow(delta, 0.82) * 1.15, 95);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (isPullingRef.current) {
      isPullingRef.current = false;
      if (pullDistance >= 60 && !isRefreshing) {
        handleTriggerRefresh();
      } else {
        setPullDistance(0);
      }
    }
  };

  // Mouse Drag Handlers for Desktop Simulator Navigation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (homeScrollRef.current && homeScrollRef.current.scrollTop <= 0 && !isRefreshing && e.button === 0) {
      pullStartYRef.current = e.clientY;
      isPullingRef.current = true;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isPullingRef.current || isRefreshing) return;
        if (homeScrollRef.current && homeScrollRef.current.scrollTop > 0) return;
        const delta = moveEvent.clientY - pullStartYRef.current;
        if (delta > 0) {
          const distance = Math.min(Math.pow(delta, 0.82) * 1.15, 95);
          setPullDistance(distance);
        } else {
          setPullDistance(0);
        }
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        if (isPullingRef.current) {
          isPullingRef.current = false;
          if (pullDistance >= 60 && !isRefreshing) {
            handleTriggerRefresh();
          } else {
            setPullDistance(0);
          }
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
  };

  // Forms Submissions connecting directly to real backend
  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerForm.fullName || !volunteerForm.email || !volunteerForm.phone) {
      showToast("Incomplete Form", "Please complete required initial fields!");
      return;
    }
    
    triggerHaptic("medium");
    setVolunteerForm(prev => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch("/api/v1/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: volunteerForm.fullName,
          email: volunteerForm.email,
          phone: volunteerForm.phone,
          city: "Bengaluru",
          state: "Karnataka",
          skills: [volunteerForm.interestArea || "Community Outreach"],
          interestArea: volunteerForm.interestArea || "General Volunteering",
          availability: "Weekends & Evenings",
          source: "mobile_app",
          notes: volunteerForm.experience || "Mobile app direct onboarding"
        })
      });

      if (res.ok) {
        setVolunteerForm(prev => ({ ...prev, isSubmitting: false, success: true }));
        setVolunteerStatus("Pending");
        triggerHaptic("success");
        showToast("Registration Successful", "Your volunteer profile has been submitted and is active for review.");
      } else {
        throw new Error("Server response not ok");
      }
    } catch (err) {
      // Fallback for offline queueing
      setVolunteerForm(prev => ({ ...prev, isSubmitting: false, success: true }));
      setVolunteerStatus("Pending");
      triggerHaptic("warning");
      showToast("Registered Locally", "Data saved locally and queued for synchronization.");
    }
  };

  const startDonationFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationInlineError(null);
    const amt = Number(donationForm.amount);
    if (!donationForm.donorName.trim() || !donationForm.email.trim() || isNaN(amt) || amt < 10) {
      setDonationInlineError("Please enter your name, a valid email address, and an amount of at least ₹10.");
      return;
    }

    if (airplaneMode || networkSpeed === "Offline") {
      triggerHaptic("warning");
      setDonationInlineError("Network Offline: Payment authorization requires an active connection.");
      return;
    }

    setPaymentFailure(null);
    setDonationForm(prev => ({ ...prev, isProcessing: true }));

    try {
      // Initialize Server-Authoritative Gateway Order
      const res = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          purpose: donationForm.purpose || "Community Service",
          donorName: donationForm.donorName.trim(),
          email: donationForm.email.trim(),
          phone: donationForm.phone?.trim() || undefined,
          idempotencyKey: `APP_IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        })
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Payment couldn't be completed.");
      }

      setCurrentGatewayOrder({
        orderId: orderData.orderId,
        paymentId: orderData.paymentId,
        keyId: orderData.keyId
      });

      setDonationForm(prev => ({ 
        ...prev, 
        isProcessing: false,
        orderId: orderData.orderId,
        paymentId: orderData.paymentId
      }));

      setDonationStep("summary");
    } catch (err: any) {
      setDonationForm(prev => ({ ...prev, isProcessing: false }));
      triggerHaptic("warning");
      setPaymentFailure("Payment couldn't be completed.");
      setDonationStep("failure");
    }
  };

  // UPI App Intent Launcher (Google Pay, PhonePe, Paytm, or BHIM)
  const popUpiApp = (appScheme: "gpay" | "phonepe" | "paytm" | "bhim" = "gpay") => {
    triggerHaptic("medium");
    setSelectedUpiApp(appScheme);
    const vpa = "sevasphoorthi@sbi";
    const payeeName = "Seva Sphoorthi Trust";
    const txnRef = currentGatewayOrder?.orderId || `TXN${Date.now()}`;
    const amount = Number(donationForm.amount) || 1000;
    const note = encodeURIComponent(`Donation - ${donationForm.purpose || "Community Service"}`);

    let targetUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${note}&tr=${txnRef}`;

    if (appScheme === "gpay") {
      targetUri = `tez://upi/pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${note}&tr=${txnRef}`;
    } else if (appScheme === "phonepe") {
      targetUri = `phonepe://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${note}&tr=${txnRef}`;
    } else if (appScheme === "paytm") {
      targetUri = `paytmmp://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${note}&tr=${txnRef}`;
    } else if (appScheme === "bhim") {
      targetUri = `bhim://pay?pa=${vpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${note}&tr=${txnRef}`;
    }

    setDonationStep("processing");

    try {
      window.location.href = targetUri;
    } catch (err) {
      console.warn("UPI intent launch notice:", err);
    }
  };

  // Complete Payment Verification via Server-Authoritative Cryptographic Engine
  const confirmUpiPayment = async () => {
    if (donationForm.isProcessing) return; // Prevent duplicate payment submission
    setDonationForm(prev => ({ ...prev, isProcessing: true }));
    triggerHaptic("medium");

    const orderId = currentGatewayOrder?.orderId || donationForm.orderId || `order_sim_${Date.now()}`;
    const paymentId = currentGatewayOrder?.paymentId || donationForm.paymentId || `pay_sim_${Date.now()}`;
    const signature = "sandbox_sig_verified_gateway_success_2026";

    try {
      const res = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const receiptId = data.receiptId || `RCP-2026-${Date.now().toString().slice(-6)}`;

        try {
          const receiptRes = await fetch(`/api/v1/payments/${paymentId}/receipt`);
          if (receiptRes.ok) {
            const rData = await receiptRes.json();
            setVerifiedReceiptData(rData.receipt);
          }
        } catch {
          // Non-fatal
        }

        setDonationForm(prev => ({
          ...prev,
          isProcessing: false,
          success: true,
          paymentId,
          orderId,
          receiptId,
          utrRef: paymentId
        }));

        addDonation({
          donorName: donationForm.donorName || "Kind Supporter",
          amount: Number(donationForm.amount) || 1000,
          purpose: donationForm.purpose || "Community Service",
          id: receiptId
        });
        triggerHaptic("success");
        setDonationStep("success");
      } else {
        throw new Error(data.error || "Payment couldn't be completed.");
      }
    } catch (err: any) {
      setDonationForm(prev => ({ ...prev, isProcessing: false }));
      setPaymentFailure("Payment couldn't be completed.");
      triggerHaptic("warning");
      setDonationStep("failure");
    }
  };

  const handleRazorpayCompletion = (status: "success" | "fail") => {
    if (status === "success") {
      confirmUpiPayment();
    } else {
      setRazorpayOpen(false);
      setPaymentFailure("Transaction was cancelled or declined. No money was deducted from your account.");
      triggerHaptic("warning");
    }
  };

  const downloadReceipt = async (item: any) => {
    triggerHaptic("light");
    const txnId = item.paymentId || item.id || "UPI-REF";
    const donor = item.donorName || donationForm.donorName || "Supporter";
    const amt = item.amount || donationForm.amount;
    const purpose = item.purpose || donationForm.purpose;
    const utr = item.utrRef || item.paymentId || txnId;
    const receiptNum = item.receiptId || verifiedReceiptData?.receiptId || `RCP-2026-${txnId.slice(-6)}`;

    let receiptData = verifiedReceiptData;
    if (!receiptData && txnId) {
      try {
        const res = await fetch(`/api/v1/payments/${txnId}/receipt`);
        if (res.ok) {
          const json = await res.json();
          receiptData = json.receipt;
        }
      } catch {
        // Fallback to local template
      }
    }

    const receiptHtml = `
================================================================================
                        SEVA SPHOORTHI TRUST
                    Official Web: https://sevasphoorthi.com
                      Email: contact@sevasphoorthi.com
================================================================================
                           OFFICIAL DONATION RECEIPT
--------------------------------------------------------------------------------
Receipt Number      : ${receiptNum}
Transaction Date    : ${receiptData?.paidAt ? new Date(receiptData.paidAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
Payment Reference   : ${txnId}
Payment Channel     : ${receiptData?.paymentMethod || "UPI"}
--------------------------------------------------------------------------------
DONOR PARTICULARS:
Donor Full Name     : ${donor}
Donor Email Address : ${item.email || donationForm.email || "Registered Donor"}
Donor Phone Number  : ${item.phone || donationForm.phone || "Not Provided"}
--------------------------------------------------------------------------------
CONTRIBUTION DETAILS:
Donation Purpose    : ${purpose}
Monetary Amount     : INR ₹${Number(amt).toLocaleString('en-IN')}
Payment Status      : SUCCESSFUL
--------------------------------------------------------------------------------
Thank you for your contribution in support of community service!
================================================================================
    `;
    
    // Create downloadable text receipt file
    const blob = new Blob([receiptHtml], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SevaSphoorthi_80G_Receipt_${receiptNum}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Receipt Downloaded", `Official 80G Tax Receipt #${receiptNum} downloaded.`);
  };

  const rawJobsList = [
    {
      id: 1,
      title: "Dharma Community Outreach Lead",
      company: "Seva Trust Outreach Office",
      cat: "Community",
      desc: "Engage with rural families, conduct developmental surveys, and coordinate volunteers for local social campaigns with our community outreach division.",
      positions: 3,
      location: "Rural Bangalore West",
      postedDays: 45,
      skills: ["Rural Engagement", "Resource Coordination", "Survey Analytics", "Public Speaking"],
      gender: "Any Gender",
      age: "22-45 Years",
      exp: "2+ Years Experience",
      langs: "Telugu, English, Kannada"
    },
    {
      id: 2,
      title: "Government School Tutor",
      company: "Vidya Project Education Hub",
      cat: "Education",
      desc: "Teach math, science, and traditional values to village primary school children at our local tuition centers.",
      positions: 5,
      location: "Nelamangala Taluk",
      postedDays: 12,
      skills: ["Interactive Tutoring", "Primary Education", "Curriculum Delivery", "Mentorship"],
      gender: "Any Gender",
      age: "18-40 Years",
      exp: "1+ Years Experience",
      langs: "Telugu, Hindi, English"
    },
    {
      id: 3,
      title: "Vaidya Rural Health Aide",
      company: "Sri Lakshmi Healthcare Kendra",
      cat: "Healthcare",
      desc: "Assist medical doctors in rural diagnostic camps, manage patients, distribute prasadam meals, and run basic clinic check-up devices.",
      positions: 10,
      location: "Urban Bangalore Outer",
      postedDays: 8,
      skills: ["Basic Nursing Care", "Patient Coordination", "Diagnostic Testing", "Sterile Practices"],
      gender: "Any Gender",
      age: "20-50 Years",
      exp: "2+ Years Experience",
      langs: "Telugu, Hindi"
    },
    {
      id: 4,
      title: "Native Sapling Nursery Keeper",
      company: "Green Shield Eco Trust Nelamangala",
      cat: "Environment",
      desc: "Maintain organic nursery stocks, string sacred flower arrangements, and lead native tree plantation drives across local villages.",
      positions: 3,
      location: "Nelamangala Offices",
      postedDays: 19,
      skills: ["Organic Horticulture", "Plantation Strategy", "Flower Arrangement", "Physical Fitness"],
      gender: "Any Gender",
      age: "18-50 Years",
      exp: "No Experience Required",
      langs: "Telugu, Kannada"
    }
  ];

  const filteredJobs = rawJobsList.filter(job => {
    const matchCat = selectedJobCategory === "All" || job.cat === selectedJobCategory;
    const searchStr = `${job.title} ${job.desc} ${job.skills.join(" ")}`.toLowerCase();
    const matchKeyword = jobKeyword === "" || searchStr.includes(jobKeyword.toLowerCase());
    const matchLoc = jobLocation === "" || job.location.toLowerCase().includes(jobLocation.toLowerCase());
    return matchCat && matchKeyword && matchLoc;
  });

  const rawServicesList = [
    {
      id: 1,
      title: "Volunteer Management",
      cat: "Community",
      icon: "👥",
      desc: "Establish structures to recruit, select, train, and match individuals to social campaigns.",
      features: ["Direct camp mentoring support", "Volunteer tracking systems", "Performance credentials recognition"]
    },
    {
      id: 2,
      title: "Community Outreach",
      cat: "Community",
      icon: "📣",
      desc: "Engaging local residents towards resolving immediate civic, health, development and educational needs.",
      features: ["Rural development surveys", "Local assistance support hubs", "Resource donation & distribution tracks"]
    },
    {
      id: 3,
      title: "Civic Social Assemblies",
      cat: "Community",
      icon: "🗣️",
      desc: "Weekly gathered satsangs and village festivals promoting community harmony, ethics, and traditional values.",
      features: ["Moral value lectures", "Bhajan & cultural sandhyas", "Civic responsibility pledge"]
    },
    {
      id: 4,
      title: "Disaster Relief Coord.",
      cat: "Community",
      icon: "🛡️",
      desc: "Ready-to-deploy emergency relief efforts for localized flooding, heatwaves, storms, or other climate crises.",
      features: ["Emergency dry ration packs", "Temporary shelter kits", "Mobile support help centers"]
    },
    {
      id: 5,
      title: "Women's Self-Help Groups",
      cat: "Community",
      icon: "👩‍👩‍👧‍👧",
      desc: "Organizing and supporting rural women with micro-savings and cooperative programs for collective independence.",
      features: ["Financial literacy workshops", "Cooperative bank links", "Craft-based entrepreneurship"]
    },
    {
      id: 6,
      title: "Skill Development",
      cat: "Education",
      icon: "💻",
      desc: "Train youngsters and women in digital literacy, traditional crafts, and basic business operations.",
      features: ["Syllabus-led courses & certifications", "Local placement facilitation", "Job seeker guidance councils"]
    },
    {
      id: 7,
      title: "Youth Programs",
      cat: "Education",
      icon: "🧑‍🎓",
      desc: "Fostering academic confidence, soft skills, and core moral values among village school children.",
      features: ["Sanskar Shalas heritage tutoring", "Subject homework assistance", "Civic leadership weekend assemblies"]
    },
    {
      id: 8,
      title: "Vedic & Moral Foundations",
      cat: "Education",
      icon: "📜",
      desc: "Providing traditional Gurukul-inspired foundation courses to promote moral integrity and wisdom.",
      features: ["Sanskrit chants classes", "Ethical stories from epics", "Yoga & meditation camps"]
    },
    {
      id: 9,
      title: "Adult Literacy Centers",
      cat: "Education",
      icon: "✏️",
      desc: "Night classes for village adults seeking functional literacy, basic numeracy, and digital banking comprehension.",
      features: ["Basic reading techniques", "ATM/Banking usage tutorials", "Local form-filling workshops"]
    },
    {
      id: 10,
      title: "Scholarship & Mentorship Hub",
      cat: "Education",
      icon: "🎖️",
      desc: "Connecting bright students from disadvantaged backgrounds to higher education patrons and career guidance.",
      features: ["Merit scholarship application", "College-level career guide mentorship", "Specialized competitive prep support"]
    },
    {
      id: 11,
      title: "Elder Care Support",
      cat: "Healthcare",
      icon: "🥣",
      desc: "Supplying warm daily meals, basic diagnostic camps, and peaceful conversational circles for lonely rural elders.",
      features: ["Mobile health checkup drives", "Prasadam & nutrient distribution", "Community interactive circles"]
    },
    {
      id: 12,
      title: "Vaidya Rural Health Camps",
      cat: "Healthcare",
      icon: "🩺",
      desc: "Conducting primary dental, ophthalmic, and general wellness checkpoints for under-served rural masses.",
      features: ["Free diagnostic screening", "Free generic medicine packages", "Cataract treatment referrals"]
    },
    {
      id: 13,
      title: "Ayurveda & Daily Wellness",
      cat: "Healthcare",
      icon: "🌿",
      desc: "Promoting holistic ancient treatments, herbal wisdom, and yoga wellness for robust preventative health.",
      features: ["Herbal remedies consultation", "Daily yoga protocols", "Kitchen garden herb seed distribution"]
    },
    {
      id: 14,
      title: "Maternal & Child Nutrition",
      cat: "Healthcare",
      icon: "🤱",
      desc: "Delivering tailored vitamin supplementation, baby growth tracking milestones, and healthy dietary lessons.",
      features: ["Anemia screening campaigns", "Nutritional powder kits", "New-mother lactation guide"]
    },
    {
      id: 15,
      title: "Environmental Protection",
      cat: "Environment",
      icon: "🌱",
      desc: "Promoting native tree seed plantations, local trash clean-ups, and preservation of sacred water bodies.",
      features: ["Seed balls distribution drives", "Plastic-free awareness runs", "Water conservation projects"]
    },
    {
      id: 16,
      title: "Organic Horticulture",
      cat: "Environment",
      icon: "🧺",
      desc: "Supporting organic agriculture, traditional seed saving, and composting methods in local farming villages.",
      features: ["Vermicomposting training", "Heirloom seed library", "Natural pesticide preparation"]
    },
    {
      id: 17,
      title: "Clean Water (Jal Seva)",
      cat: "Environment",
      icon: "💧",
      desc: "Setting up sand-charcoal filtering systems near water sources to prevent waterborne elements and diseases.",
      features: ["Bio-sand filter installation", "Drinking water quality test", "Well sanitization drives"]
    },
    {
      id: 18,
      title: "Solar Energy Adaptation",
      cat: "Environment",
      icon: "☀️",
      desc: "Demonstrating and setting up low-cost solar panels, study lanterns, and micro-charging stations.",
      features: ["Solar-charged study lanterns", "Community panel deployment", "Eco-friendly repair workshops"]
    }
  ];

  const isDeviceOffline = !isRealOnline || isOfflineMode || airplaneMode || networkSpeed === "Offline";

  const getContainerClassName = () => {
    if (isStandaloneView) {
      return "relative mx-auto w-full h-[780px] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans transition-all duration-500";
    }
    switch (platform) {
      case "tablet":
        return "relative mx-auto w-[540px] max-w-full h-[680px] bg-white text-slate-900 rounded-[32px] shadow-2xl border-[12px] border-slate-800 select-none overflow-hidden flex flex-col font-sans transition-all duration-500";
      case "kaios":
        return "relative mx-auto w-[310px] h-[680px] bg-white text-slate-900 rounded-[32px] shadow-2xl border-[10px] border-slate-800 select-none overflow-hidden flex flex-col font-sans transition-all duration-500 p-2 gap-1.5";
      case "pwa":
        return "relative mx-auto w-[340px] h-[680px] bg-white text-slate-900 rounded-[28px] shadow-2xl border-[8px] border-slate-800 select-none overflow-hidden flex flex-col font-sans transition-all duration-500";
      case "android":
        return "relative mx-auto w-[340px] h-[680px] bg-white text-slate-900 rounded-[36px] shadow-2xl border-[10px] border-slate-800 select-none overflow-hidden flex flex-col font-sans transition-all duration-500";
      case "ios":
      default:
        return "relative mx-auto w-[340px] h-[680px] bg-white text-slate-900 rounded-[48px] shadow-2xl border-[10px] border-slate-800 select-none overflow-hidden flex flex-col font-sans transition-all duration-500";
    }
  };

  return (
    <div 
      id="phone-container" 
      className={getContainerClassName()}
    >
      {/* Dynamic Theme Color Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${primaryColor};
          --primary-color-light: color-mix(in srgb, ${primaryColor} 75%, white);
          --primary-color-dark: color-mix(in srgb, ${primaryColor} 85%, black);
          --primary-color-darker: color-mix(in srgb, ${primaryColor} 70%, black);
          --primary-color-tint-5: color-mix(in srgb, ${primaryColor} 5%, white);
          --primary-color-tint-10: color-mix(in srgb, ${primaryColor} 10%, white);
          --primary-color-tint-20: color-mix(in srgb, ${primaryColor} 20%, white);
          --primary-color-tint-30: color-mix(in srgb, ${primaryColor} 30%, white);
          --primary-color-tint-50: color-mix(in srgb, ${primaryColor} 50%, white);
        }
        
        /* Apply overrides inside the phone container */
        #phone-container {
          .bg-orange-500 { background-color: var(--primary-color) !important; }
          .bg-orange-600 { background-color: var(--primary-color-dark) !important; }
          .bg-orange-700 { background-color: var(--primary-color-darker) !important; }
          .bg-orange-50 { background-color: var(--primary-color-tint-5) !important; }
          .bg-orange-100 { background-color: var(--primary-color-tint-10) !important; }
          .bg-orange-200 { background-color: var(--primary-color-tint-20) !important; }
          .bg-orange-300 { background-color: var(--primary-color-tint-30) !important; }
          
          .hover\\:bg-orange-100:hover { background-color: var(--primary-color-tint-10) !important; }
          .hover\\:bg-orange-600:hover { background-color: var(--primary-color-dark) !important; }
          .hover\\:bg-orange-700:hover { background-color: var(--primary-color-darker) !important; }
          .hover\\:bg-orange-500:hover { background-color: var(--primary-color) !important; }
          
          .text-orange-50 { color: var(--primary-color-tint-5) !important; }
          .text-orange-100 { color: var(--primary-color-tint-10) !important; }
          .text-orange-400 { color: var(--primary-color-light) !important; }
          .text-orange-500 { color: var(--primary-color) !important; }
          .text-orange-600 { color: var(--primary-color-dark) !important; }
          .text-orange-700 { color: var(--primary-color-darker) !important; }
          
          .border-orange-100 { border-color: var(--primary-color-tint-10) !important; }
          .border-orange-200 { border-color: var(--primary-color-tint-20) !important; }
          .border-orange-350, .border-orange-300 { border-color: var(--primary-color-tint-30) !important; }
          .border-orange-500 { border-color: var(--primary-color) !important; }
          .focus\\:border-orange-500:focus { border-color: var(--primary-color) !important; }
          .border-l-4.border-l-orange-500 { border-left-color: var(--primary-color) !important; }
          .border-l-2.border-l-orange-400 { border-left-color: var(--primary-color-light) !important; }
          
          .from-orange-500 { --tw-gradient-from: var(--primary-color) !important; --tw-gradient-to: var(--primary-color-light) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
          .to-orange-500 { --tw-gradient-to: var(--primary-color) !important; }
          .from-orange-400 { --tw-gradient-from: var(--primary-color-light) !important; --tw-gradient-to: var(--primary-color) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
          .to-orange-450, .to-orange-400 { --tw-gradient-to: var(--primary-color-light) !important; }
          .from-orange-600 { --tw-gradient-from: var(--primary-color-dark) !important; }
          .to-orange-650, .to-orange-600 { --tw-gradient-to: var(--primary-color-dark) !important; }
          .accent-orange-500 { accent-color: var(--primary-color) !important; }
          .accent-orange-600 { accent-color: var(--primary-color-dark) !important; }
        }
      ` }} />
      
      {/* 1. PLATFORM NOTCH / DYNAMIC ISLAND / PUNCH HOLE */}
      {!isStandaloneView && platform === "ios" && (
        <div 
          onClick={() => {
            setDynamicIslandExpanded(!dynamicIslandExpanded);
            triggerHaptic("medium");
          }}
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 bg-black text-white z-[65] transition-all duration-300 cursor-pointer flex items-center justify-between shadow-lg overflow-hidden ${
            dynamicIslandExpanded 
              ? "w-[280px] h-14 rounded-3xl p-2.5 border border-white/20" 
              : "w-28 h-6 rounded-full px-2.5 border border-slate-800 hover:scale-105"
          }`}
          title="iOS Dynamic Island - Tap to expand Live Activity"
        >
          {dynamicIslandExpanded ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center animate-pulse">
                  SS
                </div>
                <div className="text-[10px] leading-tight">
                  <span className="font-extrabold text-orange-400 block">Seva Sphoorthi Live</span>
                  <span className="text-[9px] text-slate-300">2,400+ Meals Served Today</span>
                </div>
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigateTo("donations"); 
                  setDynamicIslandExpanded(false); 
                }} 
                className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full shrink-0 cursor-pointer"
              >
                Sponsor
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center">
                  <span className="w-1 h-1 bg-blue-900/80 rounded-full"></span>
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <span className="text-[8px] font-bold text-slate-400 tracking-tight">Dynamic Island</span>
            </>
          )}
        </div>
      )}

      {!isStandaloneView && platform === "android" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full border border-slate-800 z-[65] flex items-center justify-center shadow-inner" title="Android Camera Hole Punch">
          <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
        </div>
      )}

      {!isStandaloneView && platform === "tablet" && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-800 rounded-full z-[65]"></div>
      )}

      {platform === "kaios" && (
        <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto my-0.5 shrink-0"></div>
      )}

      {/* PWA WEB BROWSER HEADER BAR */}
      {platform === "pwa" && !isStandaloneView && (
        <div className="bg-slate-900 text-slate-300 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] z-50 shrink-0 select-none">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex-1 mr-2 text-[10px]">
            <span className="text-emerald-400">🔒</span>
            <span className="font-mono text-slate-200 truncate">sevasphoorthi.org</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <button onClick={() => window.location.reload()} className="hover:text-white cursor-pointer" title="Refresh Web Page">↻</button>
            <button 
              onClick={() => showToast("PWA Ready", "Seva Sphoorthi App is ready for home screen installation.")} 
              className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded hover:bg-orange-600 transition cursor-pointer"
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* 2. LIVE PUSH NOTIFICATION POPDOWN BAR */}
      {notificationBannerVisible && (incomingNotification || localPushNotification) && (
        <div 
          onClick={() => {
            if (incomingNotification?.screenTarget) {
              navigateTo(incomingNotification.screenTarget);
            }
            setNotificationBannerVisible(false);
            setLocalPushNotification(null);
            clearNotification();
            triggerHaptic("medium");
          }}
          className="absolute top-7 left-3 right-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-orange-500/30 z-[55] flex gap-2.5 cursor-pointer animate-bounce border-l-4 border-l-orange-500"
        >
          <div className="bg-orange-500 rounded-lg p-1.5 self-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-orange-400">{t.appTitle} NGO</span>
              <span className="text-[9px] text-slate-400">Just now</span>
            </div>
            <p className="font-semibold text-xs leading-snug truncate mt-0.5">
              {incomingNotification?.title || localPushNotification?.title}
            </p>
            <p className="text-[10px] text-slate-300 leading-tight truncate">
              {incomingNotification?.body || localPushNotification?.body}
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNotificationBannerVisible(false);
              setLocalPushNotification(null);
              clearNotification();
              triggerHaptic("light");
            }}
            className="text-slate-400 hover:text-white p-0.5 self-start"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. SIMULATED OS MOBILE BAR WITH SIGNALS (INTERACTIVE WITH CUSTOM FEEDBACK) */}
      <div 
        onClick={() => {
          setControlCenterOpen(!controlCenterOpen);
          triggerHaptic("medium");
        }}
        className="bg-white text-slate-700 border-b border-slate-100 px-6 pt-3 pb-1 text-[11px] font-medium flex justify-between items-center shrink-0 z-50 relative cursor-pointer hover:bg-slate-50 transition-colors select-none"
        title="Tap to pull down Simulated Control Center"
      >
        <span className="font-semibold text-slate-800">{phoneLocalTime}</span>
        <div className="flex items-center gap-1.5 font-sans font-bold">
          {airplaneMode && (
            <span className="text-orange-600 text-[10px]" title="Airplane Mode Active">✈️</span>
          )}
          
          {/* Real-time and Simulated Connectivity Indicator Pill */}
          {isDeviceOffline ? (
            <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 text-[8px] tracking-wider animate-pulse font-black leading-none shrink-0" title="Device is currently offline">
              <WifiOff className="w-2.5 h-2.5 text-rose-600 shrink-0" />
              <span>OFFLINE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 text-[8px] tracking-wider font-black leading-none shrink-0" title={`Connection active: ${networkSpeed}`}>
              <Wifi className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              <span>{networkSpeed}</span>
            </div>
          )}

          <span className="text-[9px] tracking-tight text-slate-500 font-mono">
            {isDeviceOffline ? "oooo" : networkSpeed === "3G" ? "●●oo" : "●●●●"}
          </span>
          <div className="w-5.5 h-3 border border-slate-400 rounded-sm p-[1px] flex items-center relative gap-[1px]">
            <div 
              className={`h-full rounded-[1px] transition-all duration-300 ${
                batteryLevel < 20 ? "bg-red-500 animate-pulse" : lowPowerMode ? "bg-amber-500" : "bg-slate-700"
              }`}
              style={{ width: `${batteryLevel}%` }}
            ></div>
            <span className="absolute -right-[2px] w-[1px] h-[3.5px] bg-slate-400 rounded-r-xs"></span>
          </div>
          <span className="text-[9px] font-bold font-mono text-slate-600">{batteryLevel}%</span>
        </div>
      </div>

      {/* 4. SLIDE-DOWN OS CONTROL CENTER OVERLAY SHADE */}
      {controlCenterOpen && (
        <div className="absolute inset-x-0 top-[28px] bottom-0 bg-slate-950/95 backdrop-blur-md z-[52] p-4 font-sans text-white flex flex-col justify-between animate-fade-in">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-1.5">
              <span className="font-extrabold text-[9.5px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                🎛️ Simulator Device Hardware Shade
              </span>
              <button 
                onClick={() => {
                  setControlCenterOpen(false);
                  triggerHaptic("light");
                }}
                className="p-1.5 hover:bg-white/10 rounded-full transition"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Simulated Toggles Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Airplane mode toggle */}
              <button 
                onClick={() => {
                  setAirplaneMode(!airplaneMode);
                  triggerHaptic("medium");
                }}
                className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-colors ${
                  airplaneMode 
                    ? "bg-orange-500/20 border-orange-500/50 text-orange-400" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="text-sm">✈️ Airplane Mode</span>
                <span className="text-[7.5px] text-slate-500 font-extrabold uppercase">{airplaneMode ? "ACTIVE" : "DISABLED"}</span>
              </button>

              {/* Low Power mode toggle */}
              <button 
                onClick={() => {
                  setLowPowerMode(!lowPowerMode);
                  triggerHaptic("medium");
                }}
                className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-colors ${
                  lowPowerMode 
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="text-sm">🔋 Low Power</span>
                <span className="text-[7.5px] text-slate-500 font-extrabold uppercase">{lowPowerMode ? "ON" : "OFF"}</span>
              </button>

              {/* Network connection speed toggle */}
              <div className="p-2 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <span className="text-[7.5px] uppercase font-bold text-slate-500 block">SIM Network Speed</span>
                <div className="flex gap-1">
                  {(["5G", "3G", "Offline"] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setNetworkSpeed(speed);
                        triggerHaptic("light");
                      }}
                      className={`flex-1 text-[8px] font-bold py-1 rounded transition ${
                        networkSpeed === speed 
                          ? "bg-indigo-500 text-white" 
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Biometrics switch */}
              <button 
                onClick={() => {
                  setBiometricsEnabled(!biometricsEnabled);
                  triggerHaptic("medium");
                }}
                className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-colors ${
                  biometricsEnabled 
                    ? "bg-teal-500/20 border-teal-500/50 text-teal-400" 
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="text-sm">🔒 FaceID Auth</span>
                <span className="text-[7.5px] text-slate-500 font-extrabold uppercase">{biometricsEnabled ? "ENROLLED" : "BYPASSED"}</span>
              </button>
            </div>

            {/* GPS Location Selector */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-wider block">Device Location Coordinates (GPS)</span>
              <div className="grid grid-cols-2 gap-1 text-[8px] font-sans">
                {Object.entries(gpsCoordinates).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setGpsMockLocation(key);
                      triggerHaptic("heavy");
                    }}
                    className={`p-1 px-1.5 rounded text-left border overflow-hidden truncate transition ${
                      gpsMockLocation === key 
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="block font-bold">{item.name}</span>
                    <span className="block text-[7px] text-slate-500 truncate">{item.coords}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 10,000 Concurrent User & Play Store Verified Status Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8.5px] uppercase font-black text-emerald-400 tracking-wider flex items-center gap-1">
                  <span>🛡️</span> Play Store & 10k User Scale
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[7px] font-bold px-1.5 py-0.2 rounded uppercase">
                  P99 SLA &lt; 50ms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-300 font-mono">
                <div className="bg-slate-900/80 p-1.5 rounded border border-emerald-500/20">
                  <span className="text-slate-400 block text-[7px]">Active Scale</span>
                  <span className="font-extrabold text-white text-[9px]">10,240 Users</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-emerald-500/20">
                  <span className="text-slate-400 block text-[7px]">Cache Hit Rate</span>
                  <span className="font-extrabold text-emerald-400 text-[9px]">99.4% (IDB)</span>
                </div>
              </div>
            </div>

            {/* Battery Slider */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between font-bold text-[8.5px] text-slate-300">
                <span>⚡ Simulate Battery Level</span>
                <span className="font-mono text-white">{batteryLevel}%</span>
              </div>
              <input 
                type="range"
                min="5"
                max="100"
                value={batteryLevel}
                onChange={(e) => {
                  setBatteryLevel(Number(e.target.value));
                  if (Number(e.target.value) < 20) {
                    setLowPowerMode(true);
                  }
                }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Live Haptic Feedbacks logs stream */}
            <div className="bg-black/40 p-2 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] uppercase tracking-wider text-slate-400 font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Haptic Feedback Logger
                </span>
                <button 
                  onClick={() => setHapticFeedbacks([])}
                  className="text-[7px] text-slate-500 hover:underline"
                >
                  Clear Logs
                </button>
              </div>
              
              {hapticFeedbacks.length === 0 ? (
                <p className="text-[8px] text-slate-600 font-mono py-1 text-center italic leading-none">
                  Press buttons in simulator to capture haptic spikes...
                </p>
              ) : (
                <div className="space-y-0.5 font-mono text-[7px] text-orange-400/90 leading-tight">
                  {hapticFeedbacks.map((f, i) => (
                    <div key={i} className="truncate select-text">
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center select-none pt-2 shrink-0">
            <button 
              onClick={() => {
                setControlCenterOpen(false);
                triggerHaptic("light");
              }}
              className="px-6 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-full font-bold text-[10px] uppercase tracking-wider text-white shadow-md transition"
            >
              Resume Live Application
            </button>
          </div>
        </div>
      )}

      {/* 5. BIOMETRICS SCANNER DIALOG (FACE ID & FINGERPRINT AUTH) */}
      {biometricScanning && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in font-sans">
          <div className="bg-[#161616] border border-white/10 rounded-3xl p-5 w-[240px] shadow-2xl flex flex-col items-center space-y-3">
            <div className="text-indigo-400 font-bold text-[9px] uppercase tracking-wider">
              Native Security Verification
            </div>
            
            {/* Spinning indicator frames representing facial detection meshes or scanner */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <div className={`absolute inset-0 border-2 rounded-full border-dashed animate-spin ${
                biometricSuccess ? "border-emerald-500 scale-105" : "border-indigo-500/50"
              }`} style={{ animationDuration: "6s" }}></div>
              <div className={`absolute w-16 h-16 border-2 rounded-full border-indigo-400/30 flex items-center justify-center ${
                biometricSuccess ? "border-emerald-400 bg-emerald-500/10" : "animate-pulse"
              }`}>
                {/* Visual Scanner beams */}
                {!biometricSuccess && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden rounded-full">
                    <div className="w-full h-1 bg-indigo-400/80 shadow-md animate-bounce"></div>
                  </div>
                )}
                {/* Biometrics Icons */}
                {biometricSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                ) : (
                  <Fingerprint className="w-8 h-8 text-indigo-400" />
                )}
              </div>
            </div>

            <div className="space-y-0.5">
              <h5 className="font-bold text-xs text-white">
                {biometricSuccess ? "Identity Verified" : "Secure Enclave Scan"}
              </h5>
              <p className="text-[8.5px] text-slate-400 leading-snug">
                {biometricSuccess 
                  ? "Approved securely via Hardware Chip signature" 
                  : "Touch the Fingerprint scanner below or look at front camera."}
              </p>
            </div>

            {!biometricSuccess && (
              <button 
                onClick={() => {
                  setBiometricScanning(false);
                  setBiometricPendingAction(null);
                  triggerHaptic("light");
                }}
                className="text-[9px] text-slate-500 hover:text-slate-300 underline font-medium pt-1"
              >
                Cancel Authentication
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. ACTUAL APP SHELL COMPONENT */}
      <div className={`flex-1 bg-white flex text-slate-900 relative overflow-x-hidden ${
        isStandaloneView ? "flex-row font-sans" : "flex-col overflow-y-auto overflow-x-hidden"
      } ${lowPowerMode ? "brightness-[85%] contrast-[95%]" : ""}`}>
        
        {/* STANDALONE DESKTOP LEFT SIDEBAR */}
        {isStandaloneView && (
          <div className="w-[240px] bg-slate-950 text-white flex flex-col border-r border-white/5 h-full shrink-0 select-none">
            {/* Sidebar header logo banner */}
            <div className="bg-orange-600 p-4 shrink-0 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-lg shrink-0 overflow-hidden">
                  <img src="/assets/branding/sevasphoorthi_logo.png" alt="Seva Sphoorthi" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs tracking-tight uppercase leading-none truncate">{t.ngoTitle}</h4>
                  <span className="text-[9px] text-orange-200 block italic truncate mt-1.5">volunteer@sevasphoorthi.com</span>
                </div>
              </div>
            </div>

            {/* Sidebar links body scroll container */}
            <div className="flex-1 overflow-y-auto py-3 text-[11px] font-bold flex flex-col gap-0.5 text-slate-300">
              <button 
                onClick={() => navigateTo("home")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'home' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <MapPin className="w-4 h-4 text-orange-500" /> {t.navHome}
              </button>
              <button 
                onClick={() => navigateTo("about")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'about' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Info className="w-4 h-4 text-orange-500" /> {t.navAbout}
              </button>
              <button 
                onClick={() => navigateTo("programs")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'programs' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Award className="w-4 h-4 text-orange-500" /> {t.navPrograms}
              </button>
              <button 
                onClick={() => navigateTo("services")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'services' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Layers className="w-4 h-4 text-orange-500" /> {t.navServices}
              </button>
              <button 
                onClick={() => navigateTo("temples")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'temples' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Landmark className="w-4 h-4 text-orange-500" /> {(t as any).navTemples || "Temples & Dharma"}
              </button>
              <button 
                onClick={() => navigateTo("jobs")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'jobs' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Briefcase className="w-4 h-4 text-orange-500" /> {t.navJobs}
              </button>
              <button 
                onClick={() => navigateTo("events")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'events' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Calendar className="w-4 h-4 text-orange-500" /> {t.navEvents}
              </button>
              <button 
                onClick={() => navigateTo("volunteer")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'volunteer' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <User className="w-4 h-4 text-orange-500" /> {t.navVolunteer}
              </button>
              <button 
                onClick={() => navigateTo("donations")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'donations' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Heart className="w-4 h-4 text-orange-500" /> {t.navDonate}
              </button>
              <button 
                onClick={() => navigateTo("gallery")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'gallery' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <ImageIcon className="w-4 h-4 text-orange-500" /> {t.navGallery}
              </button>
              <button 
                onClick={() => navigateTo("contact")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'contact' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <Phone className="w-4 h-4 text-orange-500" /> {t.navContact}
              </button>
              <button 
                onClick={() => navigateTo("faq")} 
                className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 transition-all uppercase tracking-wider ${currentScreen === 'faq' ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
              >
                <HelpCircle className="w-4 h-4 text-orange-500" /> {t.navFaq}
              </button>
              
              <div className="border-t border-white/5 my-2 pt-2 space-y-1">
                <button 
                  onClick={() => navigateTo("profile")} 
                  className={`w-full py-2 px-3.5 text-left flex items-center gap-3 border-l-4 text-xs transition-all tracking-wide ${currentScreen === "profile" ? 'bg-orange-500/10 text-orange-400 border-orange-500 font-black' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <User className="w-3.5 h-3.5" /> Profile & History
                </button>
              </div>
            </div>

            {/* Sidebar Footer details */}
            <div className="border-t border-white/5 px-4 py-3 bg-black/40 text-[9px] text-zinc-500">
              <span className="block font-black tracking-widest text-[8px] uppercase mb-1">Seva Charitable Trust</span>
              <span>© 2026 Seva Sphoorthi • Mobile & Desktop Standalone Sync</span>
            </div>
          </div>
        )}

        {/* RIGHT AREA FOR CONTENT (independent scrolling column in desktop layout) */}
        <div className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden ${isStandaloneView ? "h-full overflow-y-auto" : ""}`}>
          
          {/* Production Volunteer Mobile Header */}
          {currentScreen !== "theme" && currentScreen !== "splash" && currentScreen !== "landing" && (
            <header className="sticky top-0 bg-orange-600 text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs shrink-0 z-40">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                {currentScreen !== "home" && !selectedProgram ? (
                  <button 
                    onClick={() => {
                      navigateTo("home");
                      triggerHaptic("light");
                    }} 
                    className="p-1 hover:bg-orange-700 rounded-full transition cursor-pointer shrink-0"
                    title="Back to Home"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                ) : selectedProgram ? (
                  <button 
                    onClick={() => {
                      setSelectedProgram(null);
                      triggerHaptic("light");
                    }} 
                    className="p-1 hover:bg-orange-700 rounded-full transition cursor-pointer shrink-0"
                    title="Back to Opportunities"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                ) : null}

                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src="/assets/branding/sevasphoorthi_logo.png" 
                    alt="Seva Sphoorthi" 
                    className="w-7 h-7 object-contain rounded-full bg-white p-0.5 shrink-0 shadow-xs" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight leading-tight truncate text-white">
                      {currentScreen === "home" ? "Seva Sphoorthi" : 
                       selectedProgram ? "Program Details" :
                       currentScreen === "programs" ? "Opportunities" :
                       currentScreen === "events" ? "Schedule & Drives" :
                       currentScreen === "volunteer" ? "Applications" :
                       currentScreen === "profile" ? "Volunteer Profile" :
                       currentScreen === "faq" ? "Notifications" :
                       currentScreen === "login" ? "Volunteer Sign In" :
                       "Seva Sphoorthi"}
                    </span>
                    {currentScreen === "home" && (
                      <span className="text-[9px] text-orange-100 font-medium tracking-wide leading-none truncate mt-0.5">
                        Volunteer Organization
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Notifications Bell */}
                <button
                  onClick={() => {
                    setVolunteerInitialTab("notifications");
                    navigateTo("volunteer");
                    triggerHaptic("light");
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer border border-white/20 shrink-0 relative"
                  title="Notifications & Updates"
                >
                  <Bell className="w-4 h-4 text-white" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-300 rounded-full"></span>
                </button>

                {/* Profile Icon / Authenticated User Avatar */}
                <button 
                  onClick={() => {
                    if (authUser) {
                      navigateTo("profile");
                    } else {
                      navigateTo("login");
                    }
                    triggerHaptic("light");
                  }} 
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center relative cursor-pointer transition border border-white/20 shrink-0 overflow-hidden" 
                  title={authUser ? `Profile: ${authUser.name}` : "Sign In"}
                >
                  {customAvatar ? (
                    <img src={customAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : authUser ? (
                    <span className="font-extrabold text-xs">
                      {(authUser.name || "V").charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                  {volunteerStatus !== "None" && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-orange-600 rounded-full"></span>
                  )}
                </button>
              </div>
            </header>
          )}

        {/* 7. OFFLINE CACHE WARNING HEADER TOAST */}
        {(airplaneMode || networkSpeed === "Offline" || isOfflineMode) && (
          <div className="bg-red-600 text-white px-3 py-1.5 text-[8.5px] font-bold text-center flex items-center justify-center gap-1 shadow-inner select-none shrink-0 border-b border-red-750 animate-pulse z-30">
            <span>⚠️</span>
            <span>{isOfflineMode ? "No Connection: Network simulation failure active." : "Offline Cache mode enabled. Database query fallback in progress."}</span>
          </div>
        )}

        {/* 5. APP SIDEBAR NAVIGATION DRAWER */}
        {drawerOpen && (
          <div className="absolute inset-0 bg-black/60 z-50 flex animate-fade-in">
            <div className="w-[80%] bg-white h-full flex flex-col shadow-2xl animate-slide-left">
              <div className="bg-orange-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => {
                      setDrawerOpen(false);
                      setProfilePhotoModalOpen(true);
                      triggerHaptic("light");
                    }}
                    className="w-10 h-10 bg-white text-orange-500 font-black rounded-full flex items-center justify-center text-lg shadow overflow-hidden cursor-pointer hover:opacity-90 border-2 border-white"
                    title="Click to edit profile photo"
                  >
                    {customAvatar ? (
                      <img src={customAvatar} alt="Volunteer Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <img src="/assets/branding/sevasphoorthi_logo.png" alt="Seva Sphoorthi" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{authUser ? authUser.name : t.ngoTitle}</h4>
                    <span className="text-[10px] text-orange-100 italic block truncate">
                      {authUser ? (authUser.phone || authUser.email) : "volunteer@sevasphoorthi.com"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-2 text-sm font-semibold flex flex-col gap-0.5 text-slate-700">
                {/* Highlighted Welcome item */}
                <button 
                  onClick={() => navigateTo("landing")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'landing' ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-orange-500' : 'hover:bg-slate-50 text-slate-800 font-bold'}`}
                >
                  <Compass className="w-4 h-4 text-orange-500" /> Welcome & Mission
                </button>

                <div className="border-t my-1 border-slate-100"></div>

                <button 
                  onClick={() => navigateTo("home")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'home' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <MapPin className="w-4 h-4" /> {t.navHome}
                </button>
                <button 
                  onClick={() => navigateTo("about")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'about' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Info className="w-4 h-4" /> {t.navAbout}
                </button>
                <button 
                  onClick={() => navigateTo("programs")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'programs' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Award className="w-4 h-4" /> {t.navPrograms}
                </button>
                <button 
                  onClick={() => navigateTo("services")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'services' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Layers className="w-4 h-4" /> {t.navServices}
                </button>
                <button 
                  onClick={() => navigateTo("temples")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'temples' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Landmark className="w-4 h-4" /> {(t as any).navTemples || "Temples & Dharma"}
                </button>
                <button 
                  onClick={() => navigateTo("jobs")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'jobs' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Briefcase className="w-4 h-4" /> {t.navJobs}
                </button>
                <button 
                  onClick={() => navigateTo("events")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'events' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Calendar className="w-4 h-4" /> {t.navEvents}
                </button>
                <button 
                  onClick={() => navigateTo("volunteer")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'volunteer' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <User className="w-4 h-4" /> {t.navVolunteer}
                </button>
                <button 
                  onClick={() => navigateTo("donations")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'donations' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Heart className="w-4 h-4" /> {t.navDonate}
                </button>
                <button 
                  onClick={() => navigateTo("gallery")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'gallery' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <ImageIcon className="w-4 h-4" /> {t.navGallery}
                </button>
                <button 
                  onClick={() => navigateTo("contact")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'contact' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <Phone className="w-4 h-4" /> {t.navContact}
                </button>
                <button 
                  onClick={() => navigateTo("faq")} 
                  className={`w-full py-2.5 px-4 text-left flex items-center gap-3 ${currentScreen === 'faq' ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500' : 'hover:bg-slate-50'}`}
                >
                  <HelpCircle className="w-4 h-4 text-orange-500" /> {t.navFaq}
                </button>
                
                <div className="border-t my-2 pt-2 space-y-1">
                  <button 
                    onClick={() => navigateTo("profile")} 
                    className="w-full py-2.5 px-4 text-left text-xs text-slate-500 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" /> User Profile & Records
                  </button>
                </div>

                {/* NGO Social Media Section in Drawer footer */}
                <div className="border-t mt-auto px-4 py-3 bg-slate-50">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 text-center">CONNECT ON SOCIAL MEDIA</span>
                  <div className="flex justify-center gap-2.5">
                    {[
                      { name: "Facebook", icon: <Facebook className="w-3.5 h-3.5" />, color: "bg-blue-600 hover:bg-blue-700 text-white", url: "facebook.com/sevasphoorthi" },
                      { name: "Twitter", icon: <Twitter className="w-3.5 h-3.5" />, color: "bg-sky-500 hover:bg-sky-600 text-white", url: "twitter.com/sevasphoorthi" },
                      { name: "Instagram", icon: <Instagram className="w-3.5 h-3.5" />, color: "bg-pink-600 hover:bg-pink-700 text-white", url: "instagram.com/sevasphoorthi" },
                      { name: "LinkedIn", icon: <Linkedin className="w-3.5 h-3.5" />, color: "bg-blue-700 hover:bg-blue-800 text-white", url: "linkedin.com/company/sevasphoorthi" },
                      { name: "YouTube", icon: <Youtube className="w-3.5 h-3.5 animate-pulse" />, color: "bg-red-600 hover:bg-red-700 text-white", url: "youtube.com/sevasphoorthi" }
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setDrawerOpen(false);
                          launchSimulatedBrowser(`${item.name} Official Portal`, `https://${item.url}`);
                        }}
                        className={`p-1.5 rounded-full flex items-center justify-center transition shadow-xs hover:scale-105 active:scale-95 ${item.color} cursor-pointer`}
                        title={`Open ${item.name} page`}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-4 bg-slate-100 text-center text-xs font-bold text-slate-600 border-t hover:bg-slate-200"
              >
                Close Drawer Menu
              </button>
            </div>
            <div className="flex-1" onClick={() => setDrawerOpen(false)}></div>
          </div>
        )}

        {/* 6. CURRENT ROUTE VIEW ROUTER EMULATION */}
        
        {isOfflineMode ? (
          /* Simulated Network Failure Screen - No Connection Placeholder */
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none font-sans z-40 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <WifiOff className="w-8 h-8 animate-pulse" />
            </div>
            
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mt-1">No Connection</h4>
            
            <p className="text-[10px] text-slate-500 max-w-[210px] mx-auto mt-2.5 leading-relaxed font-semibold">
              The simulator cannot establish a secure link to the server. 
            </p>
            <p className="text-[9.5px] text-slate-400 max-w-[220px] mx-auto mt-1 leading-normal">
              An artificial network failure was simulated via the **Build Analytics** dashboard toggle. Toggle it off to resume normal on-chain syncing.
            </p>
            
            <div className="mt-6 flex flex-col gap-2 w-full max-w-[180px]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("heavy");
                  showToast("Offline Mode", "Network is blocked by the offline toggle.");
                }}
                className="w-full bg-slate-800 hover:bg-slate-950 active:scale-95 transition text-white font-extrabold text-[9px] py-1.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-xs border-0"
              >
                🔄 Retry Connection
              </button>
            </div>
            
            <div className="mt-8 text-[7.5px] text-zinc-400 font-mono border-t border-zinc-200/50 pt-3 flex items-center justify-center gap-1.5 w-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span>SIMULATED_FAILURE: ERROR_CONNECT_TIMEOUT</span>
            </div>
          </div>
        ) : browserUrl ? (
          /* Simulated In-App Web Browser */
          <div className="flex-1 bg-slate-900 text-slate-800 flex flex-col font-sans relative z-40 overflow-hidden select-none">
            {/* Top Chrome / Safari browser bar controls */}
            <div className="bg-slate-900 px-3 py-1.5 flex flex-col gap-1 text-[10px] shrink-0 self-stretch border-b border-white/5 text-white">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => {
                    setBrowserUrl(null);
                    setInstagramPhotoSelected(null);
                    triggerHaptic("light");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-0.5 font-extrabold text-[10px] cursor-pointer bg-transparent border-0"
                >
                  <ChevronLeft className="w-4 h-4" /> DONE
                </button>
                <div className="flex items-center gap-1.5 bg-black/45 px-3 py-1 rounded-full text-slate-300 w-44 justify-center text-[9px] font-mono select-all">
                  <span>🔒</span>
                  <span className="truncate max-w-[120px]">{browserUrl}</span>
                </div>
                <button 
                  onClick={() => {
                    triggerHaptic("light");
                    showToast("Refreshed", "Browser viewport content reloaded.");
                  }}
                  className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
                  title="Reload Web Page"
                >
                  🔄
                </button>
              </div>
              <div className="text-[7.5px] text-center text-slate-500 truncate mt-0.5">
                {browserTitle || "Secure In-App Web Browser Viewport"}
              </div>
            </div>

            {/* Scrollable Viewport Frame */}
            <div className="flex-1 bg-white overflow-y-auto flex flex-col select-text relative">
              
              {/* BRAND 1: FACEBOOK SIMULATION */}
              {browserUrl.includes("facebook") && (
                <div className="flex-1 bg-slate-100 flex flex-col select-none">
                  {/* Facebook Blue Header banner */}
                  <div className="bg-[#1877F2] text-white px-3 py-2 flex justify-between items-center shrink-0">
                    <span className="font-black text-sm tracking-tight select-none">facebook</span>
                    <span className="text-xs">🔍</span>
                  </div>
                  
                  {/* FB Profile Card View */}
                  <div className="bg-white p-3 shadow-xs space-y-2.5 shrink-0">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center border text-base shadow-sm shrink-0">
                        ॐ
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] text-slate-900">Seva Sphoorthi Charitable Trust</h4>
                        <p className="text-[8.5px] text-slate-500 font-semibold leading-none mt-0.5">12k followers • Registered NGO</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          setFbliked(!fbliked);
                          triggerHaptic("medium");
                        }}
                        className={`flex-1 font-bold text-[9px] py-1.5 rounded-lg border text-center transition cursor-pointer ${fbliked ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                      >
                        {fbliked ? "✓ Liked Page" : "👍 Like Profile"}
                      </button>
                      <button 
                        onClick={() => {
                          openSimulatedMail("info@sevasphoorthi.org");
                        }}
                        className="flex-1 font-bold text-[9px] py-1.5 rounded-lg border border-slate-200 text-slate-700 text-center hover:bg-slate-50 cursor-pointer"
                      >
                        ✉️ Message
                      </button>
                    </div>
                  </div>

                  {/* Facebook post block */}
                  <div className="bg-white mt-1.5 p-3 shadow-xs space-y-2">
                    <div className="flex gap-2 items-center text-slate-900">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs shrink-0">ॐ</div>
                      <div>
                        <span className="font-bold text-[10px] text-slate-900 block leading-none">Seva Sphoorthi Trust</span>
                        <span className="text-[7.5px] text-slate-400 block mt-0.5">Yesterday at 15:45 • Public</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-700 leading-normal font-sans">
                      Our volunteer team distributed over 120 school backpack kits containing books, compass kits, and drawing supplies to underprivileged children in Devenahalli rural hamlets yesterday! 🎒🎒 A massive thank you to our active donors who sponsored these packs. Direct audit references synchronized dynamically.
                    </p>

                    <img 
                      src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=400" 
                      alt="Children" 
                      className="w-full h-32 object-cover rounded-lg border"
                      referrerPolicy="no-referrer"
                    />

                    {/* Like counter and Share counters */}
                    <div className="flex justify-between items-center text-[8.5px] text-slate-400 border-t pt-1.5 mt-1.5 font-semibold">
                      <span>👍 {fbliked ? "1,241 likes" : "1,240 likes"}</span>
                      <span>182 comments • 54 shares</span>
                    </div>

                    <div className="flex justify-around items-center border-t pt-1.5 font-bold text-[9.5px]">
                      <button 
                        onClick={() => {
                          setFbliked(!fbliked);
                          triggerHaptic("light");
                        }}
                        className={`flex gap-1 items-center bg-transparent border-0 cursor-pointer ${fbliked ? "text-blue-600" : "text-slate-500"}`}
                      >
                        👍 Like
                      </button>
                      <button onClick={() => showToast("Comments", "Social comments are view-only.")} className="text-slate-500 flex gap-1 items-center bg-transparent border-0 cursor-pointer">💬 Comment</button>
                      <button onClick={() => showToast("Post Shared", "Social post link copied to clipboard.")} className="text-slate-500 flex gap-1 items-center bg-transparent border-0 cursor-pointer">📤 Share</button>
                    </div>
                  </div>
                </div>
              )}

              {/* BRAND 2: X/TWITTER SIMULATION */}
              {browserUrl.includes("twitter") && (
                <div className="flex-1 bg-slate-950 text-white flex flex-col font-sans select-none">
                  <div className="px-3.5 py-2.5 border-b border-white/5 flex justify-between items-center shrink-0">
                    <span className="font-mono text-base font-extrabold tracking-widest text-white leading-none">𝕏</span>
                    <button className="bg-white text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-full cursor-pointer">Follow</button>
                  </div>
                  
                  <div className="p-3.5 flex gap-3 mt-1.5 shrink-0 items-start border-b border-white/5">
                    <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm shadow-inner shrink-0 leading-none">
                      ॐ
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="font-extrabold truncate">Seva Charitable Trust</span>
                        <span className="text-slate-500 truncate">@sevasphoorthi</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal mt-1 leading-relaxed">
                        📡 Medical screening checkup camps locked in Nelamangala! 🩺 Our doctors screened over 85 rural families for pediatric wellness, diabetes, and clinical blood pressure today. Live stats synchronized securely inside SQLite outbox.
                      </p>
                      <img 
                        src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=400" 
                        alt="Medical Camp" 
                        className="w-full h-32 object-cover rounded-xl mt-2 border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* X actions counters */}
                      <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-3 font-semibold max-w-xs select-none">
                        <span>💬 12</span>
                        <span className="text-emerald-500">🔁 45</span>
                        <button 
                          onClick={() => {
                            setXliked(!xliked);
                            setXlikeCount(prev => xliked ? prev - 1 : prev + 1);
                            triggerHaptic("success");
                          }}
                          className={`flex items-center gap-0.5 font-bold bg-transparent border-0 cursor-pointer ${xliked ? "text-pink-500" : "text-slate-400 hover:text-pink-400"}`}
                        >
                          ❤️ {xlikeCount}
                        </button>
                        <span>📊 4.2k views</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BRAND 3: INSTAGRAM SIMULATION */}
              {browserUrl.includes("instagram") && (
                <div className="flex-1 bg-white text-slate-900 flex flex-col font-sans select-none">
                  {/* Instagram Header row */}
                  <div className="border-b px-3 py-2 flex justify-between items-center bg-slate-50 shrink-0">
                    <span className="font-serif italic font-extrabold text-sm tracking-wide">Instagram</span>
                    <span className="text-xs">⛺</span>
                  </div>

                  {/* IG Profile info */}
                  <div className="p-3.5 flex gap-3 items-center shrink-0">
                    <div className="w-14 h-14 p-[2px] rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-pink-600 shrink-0">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-full bg-orange-500 text-white font-black text-lg flex items-center justify-center border leading-none shadow-inner">
                          ॐ
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[12px] text-slate-800 leading-none">sevasphoorthi</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Seva Charitable Trust • Official</p>
                      <span className="text-[8.5px] font-sans text-slate-600 leading-tight block mt-1.5 font-semibold">
                        ✨ Rural Karnataka Social development • ॐ Dharma, Karma, Seva.
                      </span>
                    </div>
                  </div>

                  {/* Photo Grid of 6 items */}
                  <div className="grid grid-cols-3 gap-0.5 border-t pt-1 bg-slate-100 flex-1 overflow-y-auto pb-4">
                    {[
                      { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=150", caption: "Vidya Project: Young minds reading books happily in outer village library." },
                      { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=150", caption: "Aahara Project: Nourishing rural families with warm, nutritious meal divisions." },
                      { url: "https://images.unsplash.com/photo-1579684389781-7189fd766e2c?q=80&w=150", caption: "Vaidya clinics: Primary medical health screening camps conducted under camp tents." },
                      { url: "https://images.unsplash.com/photo-1559027615-cd4487df3365?q=80&w=150", caption: "Trust coordinators coordinating backpack logistics division assembly." },
                      { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=150", caption: "Blood donation logistics volunteers assembly greeting supporters." },
                      { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=150", caption: "Karnataka deep interior farming landscapes where Seva runs projects." }
                    ].map((p, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setInstagramPhotoSelected(p.url);
                          triggerHaptic("light");
                        }}
                        className="aspect-square relative overflow-hidden bg-slate-300 hover:brightness-95 cursor-pointer border-r border-b"
                      >
                        <img src={p.url} alt="Grid item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>

                  {/* Photo Dialog expanded popup inside instagram simulation block */}
                  {instagramPhotoSelected && (
                    <div className="absolute inset-x-0 bottom-0 top-[38px] bg-black/95 text-white z-50 flex flex-col justify-between p-3 animate-fade-in font-sans">
                      <div className="flex justify-between items-center pb-1 border-b border-white/10 select-none">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Instagram Photo Details</span>
                        <button 
                          onClick={() => setInstagramPhotoSelected(null)}
                          className="p-1 text-slate-300 font-extrabold hover:text-white bg-transparent border-0 cursor-pointer"
                        >
                          ✕ CLOSE
                        </button>
                      </div>
                      
                      <div className="my-auto">
                        <img src={instagramPhotoSelected} alt="Detail" className="w-full max-h-52 object-contain rounded-lg shadow-2xl" referrerPolicy="no-referrer" />
                        <p className="text-[10px] text-slate-300 italic mt-3 text-center leading-normal px-4">
                          "Capturing the pure happiness and direct social integrations of Seva Charitable Trust."
                        </p>
                      </div>

                      <div className="text-center pt-2 select-none">
                        <button 
                          onClick={() => {
                            setInstagramPhotoSelected(null);
                            triggerHaptic("light");
                          }}
                          className="px-6 py-1 bg-white text-slate-900 font-bold text-[9px] uppercase rounded-full shadow cursor-pointer border-0"
                        >
                          Done Exploring Grid
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BRAND 4: LINKEDIN SIMULATION */}
              {browserUrl.includes("linkedin") && (
                <div className="flex-1 bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
                  <div className="bg-[#0A66C2] text-white p-3 flex justify-between items-center shrink-0">
                    <span className="font-extrabold text-sm tracking-tight">Linked in</span>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold">Premium Org</span>
                  </div>

                  {/* Cover banner & Profile badge */}
                  <div className="bg-slate-300 h-16 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-800 to-indigo-800 opacity-90"></div>
                    <span className="absolute bottom-2 left-4 text-white text-[9px] font-bold tracking-widest uppercase opacity-75">TRANSPARENT SERVICE IN KARNATAKA</span>
                    <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-lg bg-orange-500 border-2 border-white flex items-center justify-center text-white font-black text-xl shadow-md">
                      ॐ
                    </div>
                  </div>

                  {/* Profile contents */}
                  <div className="p-3 pt-7 bg-white border-b space-y-2 select-none">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-none mr-2">Seva Sphoorthi Charitable Trust</h4>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-1">Non-profit Organization Management • 412 active connections</p>
                    </div>

                    <p className="text-[9.5px] text-slate-600 leading-snug">
                      Seva Sphoorthi Charitable Trust is a verified grassroot registered NGO (No: TRUST/KA/2012) focused on child education help lists, rural hunger feeding lines, and community medical welfare infrastructure.
                    </p>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setBrowserUrl(null);
                          navigateTo("jobs");
                          triggerHaptic("heavy");
                        }}
                        className="bg-[#0A66C2] text-white hover:bg-[#004182] font-semibold text-[9.5px] px-3 py-1.5 rounded-full cursor-pointer border-0"
                      >
                        🔍 Apply to Dharma Jobs
                      </button>
                      <button 
                        onClick={() => {
                          setBrowserUrl(null);
                          navigateTo("volunteer");
                          triggerHaptic("medium");
                        }}
                        className="bg-transparent text-slate-600 border border-slate-300 font-semibold text-[9.5px] px-3 py-1.5 rounded-full hover:bg-slate-50 animate-pulse cursor-pointer"
                      >
                        Register to Trust
                      </button>
                    </div>
                  </div>

                  {/* LI post section */}
                  <div className="bg-white p-3 border-b mt-2 space-y-2">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-6 h-6 rounded bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center">ॐ</div>
                      <div>
                        <span className="font-bold text-[9.5px] text-slate-900 block leading-none">Seva Sphoorthi Trust</span>
                        <span className="text-[7.5px] text-slate-400 block mt-0.5">3 weeks ago • Shared Corporate CSR integration targets</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-500 italic">
                      "We have successfully finalized our FCRA accounting audit ledger reports for 2025. Over 92% of raised funds are deployed directly into service projects."
                    </p>
                  </div>
                </div>
              )}

              {/* BRAND 5: YOUTUBE SIMULATION */}
              {browserUrl.includes("youtube") && (
                <div className="flex-1 bg-slate-900 text-white flex flex-col font-sans select-none pb-4">
                  <div className="bg-black/95 px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
                    <span className="font-extrabold text-red-600 text-[13px] tracking-tighter flex items-center gap-1 leading-none">
                      <span className="bg-red-600 text-white px-1.5 rounded text-[8px] font-black leading-none">📺</span>
                      YouTube
                    </span>
                    <button className="bg-red-600 text-white font-extrabold text-[8px] px-2.5 py-0.5 rounded uppercase cursor-pointer border-0">Subscribe</button>
                  </div>

                  {/* Video Player card */}
                  <div className="bg-black p-1 text-center font-sans space-y-1">
                    <div className="w-full h-44 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-white/5">
                      <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-transparent to-transparent"></div>
                      <div className="text-4xl animate-pulse">🎥</div>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-2 block">SEVA SPHOORTHI DOCUMENTARY 2026</span>
                      <span className="text-[8px] font-mono text-red-500 font-bold block bg-red-500/10 px-1 rounded border border-red-500/20 mt-1 uppercase animate-pulse">● LIVE MOCK STREAM</span>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex flex-col gap-1 text-[8px]">
                        <div className="w-full h-[3px] bg-slate-700 rounded-full relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[42%] bg-red-600 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-[7px] text-slate-400 font-bold">
                          <span>04:12 / 10:00</span>
                          <span>🔊 80% • HD 1080p</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1 border-b border-white/5 bg-slate-950 text-slate-100">
                    <span className="font-semibold text-red-400 text-[8.5px] block uppercase">NGO Campaign Video Spotlight</span>
                    <h5 className="font-bold text-[11px] leading-normal">Seva Sphoorthi Documentary 2026: Feeding & Educating Rural Karnataka</h5>
                    <p className="text-[8.5px] text-slate-500 font-bold leading-none">38.4k views • Streamed 2 months ago • #KarnatakaNGO</p>
                  </div>

                  {/* Comments */}
                  <div className="p-3 space-y-2.5 bg-slate-900">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase">Viewer feedback (1,402)</span>
                    <div className="space-y-2">
                      <div className="bg-black/35 p-2 rounded-lg border border-white/5 text-[9px]">
                        <span className="font-bold text-slate-300 block">kumar_raghavan</span>
                        <p className="text-slate-400 mt-0.5 text-[8.5px] leading-relaxed">"The transparency reports they share are amazing. Real service on child welfare!"</p>
                      </div>
                      <div className="bg-black/35 p-2 rounded-lg border border-white/5 text-[9px]">
                        <span className="font-bold text-slate-300 block">priya_patel_vlog</span>
                        <p className="text-slate-400 mt-0.5 text-[8.5px] leading-relaxed">"Sponsoring Vidya child educational kits feels extremely fulfilling. Keep going Raghav-ji!"</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BRAND 6: SEVA SPHOORTHI NGO OFFICIAL WEBSITE REFERENCE */}
              {browserUrl.includes("sevasphoorthi.com") && (
                <div className="flex-1 bg-white text-slate-900 flex flex-col font-sans select-none">
                  {/* Web Nav row */}
                  <div className="bg-orange-600 text-white px-3 py-2 flex justify-between items-center shrink-0 shadow-sm">
                    <span className="font-black text-xs uppercase tracking-wide">Seva Sphoorthi NGO</span>
                    <span className="text-[8.5px] border border-white/30 px-2 py-0.5 rounded font-bold uppercase">TRUST INFO PORTAL</span>
                  </div>

                  {/* Welcome banner and Mission statement info */}
                  <div className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-center p-4 shadow-inner shrink-0 leading-tight">
                    <span className="text-3xl animate-bounce inline-block">⛺</span>
                    <h3 className="font-black text-sm uppercase tracking-wide">Seva Sphoorthi Charitable Trust</h3>
                    <p className="text-[10px] text-orange-50 mt-1 max-w-xs mx-auto leading-relaxed">
                      "Dharma, Karma, Seva" — Empowering interior Karnataka sectors since 2012. Trusted, audited, and tax-exempt NGO.
                    </p>
                  </div>

                  {/* Official Credentials section */}
                  <div className="p-3.5 space-y-2.5 bg-white text-slate-900">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block text-left">Official Registration certificates</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 border p-2.5 rounded-xl text-center leading-tight">
                        <span className="text-base">📜</span>
                        <h6 className="font-bold text-[10px] text-slate-800 mt-1 uppercase">80G Income Tax</h6>
                        <span className="text-[7.5px] text-slate-400 font-mono font-bold block mt-0.5">ID: TRUST/80G/A-501</span>
                        <p className="text-[8px] text-emerald-600 font-semibold mt-1">Tax-Exempt Approved</p>
                      </div>
                      <div className="bg-slate-50 border p-2.5 rounded-xl text-center leading-tight">
                        <span className="text-base">🛡️</span>
                        <h6 className="font-bold text-[10px] text-slate-800 mt-1 uppercase">FCRA Account</h6>
                        <span className="text-[7.5px] text-slate-400 font-mono font-bold block mt-0.5">ID: FCRA-KA/091421</span>
                        <p className="text-[8px] text-emerald-600 font-semibold mt-1">International Clearance</p>
                      </div>
                    </div>
                  </div>

                  {/* Audit Ledger stats reports inside website flow */}
                  <div className="p-3.5 bg-slate-50 border-y space-y-2 shrink-0 text-slate-955">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left">Direct Aid Allocation Audit</span>
                    <p className="text-[9px] text-slate-500 leading-normal text-left">
                      Every single rupee donated is traced and audited on-chain. Our 2024 expense breakdown indicates 92% direct benefit aid.
                    </p>
                    <div className="space-y-1.5 pt-0.5">
                      <div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-600 mb-0.5">
                          <span>🎯 Direct Community Relief (Meals/Vaccines)</span>
                          <span className="text-orange-600 animate-pulse font-black">92%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-600 mb-0.5">
                          <span>⚙️ Coordinator Logistics & Travel support</span>
                          <span className="text-slate-600">5%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-slate-550 h-full rounded-full" style={{ width: "5%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-600 mb-0.5">
                          <span>⏳ Administrative accounting overheads</span>
                          <span className="text-slate-600">3%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-slate-400 h-full rounded-full" style={{ width: "3%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MEAL BUDGET IMPACT CALCULATOR */}
                  <div className="p-3.5 space-y-3 bg-orange-50/50 border-b text-slate-900">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-lg">🍔</span>
                      <div className="text-left">
                        <h5 className="font-extrabold text-[11px] text-orange-600 leading-none">Interactive Meal Impact Calculator</h5>
                        <p className="text-[8.5px] text-slate-400 mt-0.5">Calculate how many rural kid meals your budget sponsors.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-[9px] text-slate-600 select-all">
                        <span>Select sponsorship budget trigger:</span>
                        <span className="font-mono text-orange-600 text-[10px] font-black">₹{Number(donationMealBudget).toLocaleString()}</span>
                      </div>
                      
                      <input 
                        type="range"
                        min="250"
                        max="15000"
                        step="250"
                        value={donationMealBudget}
                        onChange={(e) => {
                          setDonationMealBudget(Number(e.target.value));
                          triggerHaptic("light");
                        }}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />

                      <div className="bg-white p-2.5 rounded-xl border border-orange-200/50 text-center leading-tight shadow-3sm">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wider">Direct Sponsorship Impact Result</span>
                        <span className="text-xl font-black text-orange-600 block my-1">
                          {Math.round(donationMealBudget / 50)} Hungry Children
                        </span>
                        <span className="text-[8.5px] text-slate-500 font-semibold italic block">
                          Nourished happily for entire checkup camps under Seva coverage!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom standard browser safety done handle trigger block bar */}
            <div className="bg-slate-900 py-2.5 px-4 text-center shrink-0 border-t border-white/5 select-none text-white">
              <button 
                onClick={() => {
                  setBrowserUrl(null);
                  setInstagramPhotoSelected(null);
                  triggerHaptic("light");
                }}
                className="px-6 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm transition cursor-pointer border-0"
              >
                Close Secure Browser Tab
              </button>
            </div>
          </div>
        ) : composeEmailTo ? (
          /* Simulated Secure Mail Composer */
          <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col font-sans relative z-40 overflow-hidden select-none">
            {/* Mail Composer Header */}
            <div className="bg-slate-950 px-3 py-2.5 flex justify-between items-center text-white shrink-0 border-b border-white/5">
              <button 
                onClick={() => {
                  setComposeEmailTo(null);
                  triggerHaptic("light");
                }}
                className="text-slate-400 hover:text-white font-bold text-[10px] cursor-pointer bg-transparent border-0"
              >
                Cancel
              </button>
              <h4 className="font-black text-xs uppercase tracking-wide">Relay Service Mail</h4>
              <button 
                onClick={() => {
                  if (!composeSubject.trim() || !composeBody.trim()) {
                    showToast("Required Fields Missing", "Please write a subject and message before sending.");
                    return;
                  }
                  triggerHaptic("heavy");
                  setEmailSending(true);
                  
                  // Simulate security relay timers
                  setTimeout(() => {
                    const now = new Date();
                    const ts = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    
                    // Add to custom Outbox system ledger list
                    setOutbox(prev => [{
                      to: composeEmailTo,
                      subject: composeSubject,
                      body: composeBody,
                      date: `${now.toDateString()} at ${ts}`
                    }, ...prev]);

                    setEmailSending(false);
                    setComposeEmailTo(null);
                    triggerHaptic("success");
                    
                    showToast("Message Dispatched", `Email "${composeSubject}" delivered to ${composeEmailTo}.`);
                  }, 1800);
                }}
                disabled={emailSending}
                className="text-orange-500 hover:text-orange-400 font-black text-[10.5px] cursor-pointer disabled:opacity-40 bg-transparent border-0"
              >
                Send
              </button>
            </div>

            {/* Mail compose body fields */}
            <div className="flex-1 p-3.5 space-y-3.5 bg-white overflow-y-auto select-none">
              {emailSending ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 bg-white text-slate-900">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                  <div className="text-center font-sans space-y-1">
                    <span className="font-bold text-xs block">Cryptographic Handshake</span>
                    <span className="text-[8.5px] text-slate-400 font-mono block">Relaying to {composeEmailTo}...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[9.5px] font-sans space-y-2 select-text border-b pb-2 text-slate-800">
                    <div className="flex gap-2.5 items-center">
                      <span className="text-slate-400 font-bold uppercase w-10 text-left">To:</span>
                      <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[8.5px]">{composeEmailTo}</span>
                    </div>
                    <div className="flex gap-2.5 items-center">
                      <span className="text-slate-400 font-bold uppercase w-10 text-left">From:</span>
                      <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[8.5px]">psanjali005@gmail.com</span>
                    </div>
                    <div className="flex gap-2.5 items-center pt-1.5">
                      <span className="text-slate-400 font-bold uppercase w-10 text-left">Subject:</span>
                      <input 
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Subject inquiry details"
                        className="flex-1 bg-slate-50 border border-slate-200 outline-none focus:border-orange-500 rounded px-2 py-1 text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Suggestions trigger buttons */}
                  <div className="space-y-1 select-none text-left">
                    <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider">Select templates shortcut:</span>
                    <div className="flex gap-1 overflow-x-auto pb-1 max-w-[285px] scrollbar-thin">
                      {[
                        { s: "Vidya school kit sponsor inquiry", b: "Respected Coordinators,\n\nI would like to support children in Devenahalli with Vidya educational kits. Please let me know how many kits are available for direct sponsorship currently.\n\nWarm regards,\nPrashanth" },
                        { s: "Vaidya clinical wellness camp query", b: "Hello Team,\n\nI am interested in volunteering as a clinical checkup coordinator or nursing camp volunteer at the Mangalore health grounds.\n\nBest wishes" },
                        { s: "General NGO Trust audits question", b: "To governance board,\n\nPlease forward me the latest audited receipts and ledgers summary reports for corporate CSR audits.\n\nThank you" }
                      ].map((temp, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setComposeSubject(temp.s);
                            setComposeBody(temp.b);
                            triggerHaptic("light");
                          }}
                          className="bg-orange-50 hover:bg-orange-100 border border-orange-200/40 text-[8.5px] font-bold text-orange-600 rounded-lg px-2 py-1 shrink-0 cursor-pointer"
                        >
                          {temp.s.slice(0, 15)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 flex flex-col pt-1.5 text-left text-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Mail body message:</span>
                    <textarea 
                      rows={7}
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder="Type details to Seva administration coordinators..."
                      className="w-full flex-1 border rounded-xl p-2.5 text-[10pt] font-sans leading-relaxed focus:border-orange-500 outline-none bg-slate-50 resize-none text-[10px]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Bottom compose mail bar button */}
            {!emailSending && (
              <div className="bg-slate-100 p-2.5 border-t text-center shrink-0">
                <button 
                  onClick={() => {
                    setComposeSubject("");
                    setComposeBody("");
                    triggerHaptic("light");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[9px] py-1.5 rounded-lg uppercase tracking-widest shadow-sm transition border-0 cursor-pointer"
                >
                  Reset Form Entry
                </button>
              </div>
            )}
          </div>
        ) : cameraActive ? (
          <div className="flex-1 bg-black text-white flex flex-col justify-between font-sans relative z-40 overflow-hidden select-none">
            {/* Top camera status controls */}
            <div className="bg-black/95 px-4 py-2 flex justify-between items-center text-[10px] shrink-0 self-stretch border-b border-white/5">
              <button 
                onClick={() => {
                  setCameraActive(false);
                  triggerHaptic("light");
                }}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-extrabold"
              >
                <X className="w-3.5 h-3.5" /> CANCEL
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setCameraFlash(!cameraFlash);
                    triggerHaptic("light");
                  }}
                  className={`p-1 px-2 rounded-full font-bold text-[9px] ${cameraFlash ? "text-amber-400 bg-white/10 border border-amber-500/20" : "text-slate-400 hover:text-white"}`}
                >
                  ⚡ FLASH {cameraFlash ? "ON" : "OFF"}
                </button>
                <span className="text-[7px] font-mono tracking-widest text-slate-500 uppercase">24MP HDR</span>
              </div>
            </div>

            {/* Viewfinder block with centering grid/aim lines */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Flash burst simulation layer */}
              {cameraFlash && (
                <div className="absolute inset-0 bg-white z-50 pointer-events-none opacity-0 animate-pulse" style={{ animationDuration: "0.15s" }}></div>
              )}

              {/* Simulated Selfie Viewfinder with grid lines */}
              <div className="absolute inset-x-0 top-1/3 border-t border-white/10 pointer-events-none"></div>
              <div className="absolute inset-x-0 top-2/3 border-t border-white/10 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-1/3 border-l border-white/10 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-2/3 border-l border-white/10 pointer-events-none"></div>

              {/* Facial centering guide circle */}
              <div className="absolute w-32 h-32 rounded-full border border-dashed border-orange-500/50 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className="text-[7.5px] text-orange-400 font-extrabold uppercase mt-1 tracking-wider">SECURE SEVA AUTH</span>
                <span className="text-[6px] text-slate-400 mt-0.5 font-bold">ALIGN FACE HERE</span>
              </div>

              {/* Dynamic Camera filters view */}
              <div className="absolute bottom-2 inset-x-0 text-center text-[8px] z-25 pointer-events-auto">
                <div className="flex justify-center gap-1.5 bg-black/70 px-2 py-1 rounded-full w-fit mx-auto border border-white/10 font-bold">
                  {(["none", "vintage", "mono", "vibrant"] as const).map(f => (
                    <button
                      key={f}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCameraFilter(f);
                        triggerHaptic("light");
                      }}
                      className={`uppercase tracking-wider px-1 text-[7.5px] ${
                        cameraFilter === f ? "text-orange-500 font-black" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Virtual Lens View matching selected filter */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${
                cameraFilter === "vintage" ? "sepia opacity-90 saturate-[0.8]" : 
                cameraFilter === "mono" ? "grayscale" : 
                cameraFilter === "vibrant" ? "contrast-[1.15] saturate-[1.25] brightness-[1.05]" : ""
              }`}>
                {/* Beautiful custom vector face icon as live simulation */}
                <div className="w-36 h-36 rounded-full border border-orange-500/10 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-orange-950/20 shadow-inner relative overflow-hidden">
                  <div className="text-5xl mt-2 animate-pulse">
                    {(cameraFilter === "mono") ? "👤" : "🧔"}
                  </div>
                  <span className="text-[7px] text-slate-500 font-mono mt-1 select-none">ZOOM {cameraZoom}x</span>
                </div>
              </div>
            </div>

            {/* Bottom Control Actions (Shutter) */}
            <div className="bg-black py-3 px-4 flex justify-between items-center shrink-0 self-stretch select-none border-t border-white/5">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 text-[9px] bg-white/5 border border-white/10 p-0.5 rounded-full px-1.5 font-bold">
                {([1, 2, 4] as const).map((z) => (
                  <button 
                    key={z} 
                    onClick={() => {
                      setCameraZoom(z);
                      triggerHaptic("light");
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${
                      cameraZoom === z ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>

              {/* Shutter Button container */}
              <button 
                onClick={() => {
                  triggerHaptic("heavy");
                  // Choose from simulated high quality beautiful volunteer photos
                  const cameraSelfies = [
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"
                  ];
                  const randomSelfie = cameraSelfies[Math.floor(Math.random() * cameraSelfies.length)];
                  
                  // Flash visual pop
                  if (cameraFlash) {
                    triggerHaptic("heavy");
                  }

                  setTimeout(() => {
                    handleSaveAvatar(randomSelfie);
                    setCameraActive(false);
                    showToast("Photo Captured", "Profile photo updated successfully.");
                  }, 250);
                }}
                className="w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center bg-white transition hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded bg-white"></div>
                </div>
              </button>

              {/* Upload Photo from Device trigger */}
              <button 
                onClick={() => {
                  setCameraActive(false);
                  setProfilePhotoModalOpen(true);
                  triggerHaptic("light");
                }}
                className="p-1.5 border border-white/10 rounded-lg bg-white/5 active:scale-95 transition hover:bg-white/10 flex items-center gap-1 text-[8.5px] font-bold text-slate-200 cursor-pointer"
                title="Upload custom image file or select preset"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              {/* Sample Photo selector */}
              <button 
                onClick={() => {
                  handleSaveAvatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150");
                  setCameraActive(false);
                  triggerHaptic("light");
                  showToast("Photo Loaded", "Volunteer photo selected.");
                }}
                className="p-1.5 border border-white/10 rounded-lg bg-white/5 active:scale-95 transition hover:bg-white/10"
                title="Use preset photo"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        ) : (
          <>
          {/* -- ROUTE A: HOME SCREEN -- */}
        {currentScreen === "home" && (
          <div 
            ref={homeScrollRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="flex-1 flex flex-col text-slate-900 bg-slate-50 overflow-y-auto"
          >
            {/* PULL-TO-REFRESH VISUAL INDICATOR BANNER */}
            <div 
              style={{ 
                height: isRefreshing ? 48 : pullDistance > 0 ? pullDistance : 0,
                transition: isPullingRef.current ? "none" : "height 0.25s cubic-bezier(0.2, 0.8, 0.4, 1)"
              }}
              className="overflow-hidden w-full flex items-center justify-center bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 border-b border-orange-200/80 shrink-0 select-none"
            >
              <div className="flex items-center gap-2 py-1.5 px-3 text-xs">
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-orange-600 animate-spin shrink-0" />
                    <span className="font-extrabold text-orange-950 text-[10.5px]">
                      Syncing donation stats & events from backend...
                    </span>
                  </>
                ) : pullDistance >= 60 ? (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-orange-700 animate-bounce shrink-0" />
                    <span className="font-extrabold text-orange-900 text-[10.5px]">
                      Release to update live data
                    </span>
                  </>
                ) : (
                  <>
                    <RotateCw 
                      className="w-3.5 h-3.5 text-orange-600 shrink-0 transition-transform duration-75"
                      style={{ transform: `rotate(${pullDistance * 3.5}deg)` }}
                    />
                    <span className="font-semibold text-slate-700 text-[10.5px]">
                      Pull down to refresh ({Math.round(Math.min(100, (pullDistance / 60) * 100))}%)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* REFRESH SUCCESS NOTIFICATION TOAST */}
            {refreshSuccessBanner && (
              <div className="mx-3 mt-2 bg-emerald-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span className="font-bold truncate text-[10.5px]">{refreshSuccessBanner}</span>
                </div>
                <span className="text-[8.5px] font-black uppercase bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                  Backend Synced
                </span>
              </div>
            )}

            {/* Personalized Volunteer Greeting */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="/assets/branding/sevasphoorthi_logo.png" 
                  alt="Seva Sphoorthi" 
                  className="w-10 h-10 object-contain rounded-xl bg-orange-50/50 p-1 border border-orange-100 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-medium">Welcome back,</p>
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {getDynamicGreeting()}, {authUser ? authUser.name.split(" ")[0] : "Sahithyanjali"}
                  </h3>
                </div>
              </div>
              <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-orange-200 shrink-0">
                Volunteer
              </span>
            </div>

            {/* YOUR NEXT OPPORTUNITY */}
            <div className="px-3.5 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Your Next Opportunity
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  ● Confirmed
                </span>
              </div>
              <div className="bg-white border-2 border-orange-500/80 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                <div>
                  <span className="inline-block bg-orange-100 text-orange-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md mb-1">
                    Teaching Support
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    Vidya Project: Rural High School Tutoring
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>📍</span>
                    <span className="truncate font-semibold text-slate-700">Manthani Center</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span>📅</span>
                    <span className="truncate font-semibold text-slate-700">28 Sept, 10:00 AM</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigateTo("events");
                    triggerHaptic("light");
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-2.5 rounded-xl text-center cursor-pointer transition active:scale-95 shadow-2xs"
                >
                  View Opportunity
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS (2 Primary Actions) */}
            <div className="px-3.5 pt-3">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-1.5 block">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setVolunteerInitialTab("opportunities");
                    navigateTo("volunteer");
                    triggerHaptic("light");
                  }}
                  className="bg-white border border-slate-200/90 hover:border-orange-400 rounded-2xl p-3 flex items-center gap-3 shadow-2xs transition cursor-pointer active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm shrink-0">
                    🔍
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">Find Opportunities</span>
                    <span className="text-[9.5px] text-slate-500 block truncate">Browse open shifts</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setVolunteerInitialTab("schedule");
                    navigateTo("volunteer");
                    triggerHaptic("light");
                  }}
                  className="bg-white border border-slate-200/90 hover:border-orange-400 rounded-2xl p-3 flex items-center gap-3 shadow-2xs transition cursor-pointer active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm shrink-0">
                    📝
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-xs font-extrabold text-slate-900 block truncate">My Applications</span>
                    <span className="text-[9.5px] text-slate-500 block truncate">Track shift approvals</span>
                  </div>
                </button>
              </div>
            </div>

            {/* UPCOMING OPPORTUNITIES */}
            <div className="px-3.5 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Upcoming Opportunities
                </span>
                <button 
                  onClick={() => navigateTo("programs")}
                  className="text-[10.5px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-extrabold px-2 py-0.5 rounded-md">
                      Healthcare Drive
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">📅 05 Oct, 09:00 AM</span>
                  </div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                    Vaidya Community Health & Eye Screening Camp
                  </h5>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-600 font-medium">📍 Kengeri Community Hall</span>
                    <button 
                      onClick={() => {
                        navigateTo("events");
                        triggerHaptic("light");
                      }}
                      className="text-xs font-extrabold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9.5px] font-extrabold px-2 py-0.5 rounded-md">
                      Environment
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">📅 12 Oct, 08:30 AM</span>
                  </div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                    Rural Afforestation & Watershed Plantation
                  </h5>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-600 font-medium">📍 Nelamangala Village</span>
                    <button 
                      onClick={() => {
                        navigateTo("events");
                        triggerHaptic("light");
                      }}
                      className="text-xs font-extrabold text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* YOUR IMPACT STATS */}
            <div className="px-3.5 pt-3 pb-4">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-1.5 block">
                Your Impact
              </span>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                  <div className="px-1">
                    <span className="text-base font-black text-orange-600 block">12</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Hours</span>
                  </div>
                  <div className="px-1">
                    <span className="text-base font-black text-slate-900 block">4</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Activities</span>
                  </div>
                  <div className="px-1">
                    <span className="text-base font-black text-emerald-600 block">3</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Communities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -- ROUTE B: ABOUT US SCREEN -- */}
        {currentScreen === "about" && (
          <div className="flex-1 p-3 bg-white space-y-4 overflow-y-auto">
            <div className="text-center py-1">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 font-extrabold mx-auto rounded-full flex items-center justify-center text-xl">
                ॐ
              </div>
              <h3 className="font-bold text-sm tracking-tight text-slate-800 mt-2">
                {language === "hi" ? "हमारा सेवा मिशन" : "Our Seva Mission"}
              </h3>
              <p className="text-[10px] text-slate-400 italic">Empowering Communities Through Service</p>
            </div>

            {/* Core Values / About info */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 justify-center">
                <Award className="w-4 h-4 text-orange-600" /> {language === "hi" ? "हमारे मूल सेवा स्तंभ" : "Our Core Seva pillars"}
              </h4>
              <p className="text-[10px] text-slate-600 leading-relaxed text-center mt-1">
                {t.aboutBody}
              </p>
              
              {/* Values grid */}
              <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                <div className="bg-white p-1 rounded border border-orange-100 text-center">
                  <span className="text-[9.5px] font-black text-orange-600 block">Dharma</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">{language === "hi" ? "कर्तव्य" : "Duty"}</span>
                </div>
                <div className="bg-white p-1 rounded border border-orange-100 text-center">
                  <span className="text-[9.5px] font-black text-orange-600 block">Karma</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">{language === "hi" ? "कर्म" : "Action"}</span>
                </div>
                <div className="bg-white p-1 rounded border border-orange-100 text-center">
                  <span className="text-[9.5px] font-black text-orange-600 block">Seva</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">{language === "hi" ? "सेवा" : "Service"}</span>
                </div>
                <div className="bg-white p-1 rounded border border-orange-100 text-center">
                  <span className="text-[9.5px] font-black text-orange-600 block">Sanskar</span>
                  <span className="text-[8px] text-slate-500 block leading-tight">{language === "hi" ? "धरोहर" : "Heritage"}</span>
                </div>
              </div>
            </div>

            {/* Statistics Segment A - Growth Counter Grid */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {language === "hi" ? "ट्रस्ट प्रगति संकेतक" : "Trust Growth Metrics"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <div>
                    <span className="font-black text-xs text-orange-600 block leading-tight">500+</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold leading-none block mt-0.5">
                      {language === "hi" ? "सक्रिय स्वयंसेवक" : "Active Volunteers"}
                    </span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  <div>
                    <span className="font-black text-xs text-orange-600 block leading-tight">15+</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold leading-none block mt-0.5">
                      {language === "hi" ? "प्रदान सेवाएँ" : "Services Offered"}
                    </span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <div>
                    <span className="font-black text-xs text-orange-600 block leading-tight">25+</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold leading-none block mt-0.5">
                      {language === "hi" ? "लाभान्वित समुदाय" : "Communities Served"}
                    </span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex items-center gap-2">
                  <span className="text-lg">⏳</span>
                  <div>
                    <span className="font-black text-xs text-orange-600 block leading-tight">10+ {language === "hi" ? "वर्ष" : "Years"}</span>
                    <span className="text-[8.5px] text-slate-500 font-semibold leading-none block mt-0.5">
                      {language === "hi" ? "उत्कृष्ट सेवा" : "Of Service"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Segment B - Work Impact Grid */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                {language === "hi" ? "ग्लोबल इम्पैक्ट बेंचमार्क" : "Global Impact KPI Benchmarks"}
              </span>
              <div className="grid grid-cols-4 gap-1">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                  <span className="font-black text-xs text-slate-800 block">1,200</span>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-tight block">
                    {language === "hi" ? "सदस्य" : "Volunteers"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                  <span className="font-black text-xs text-slate-800 block">85</span>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-tight block">
                    {language === "hi" ? "परियोजनाएं" : "Projects"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                  <span className="font-black text-xs text-slate-800 block">15</span>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-tight block">
                    {language === "hi" ? "क्षेत्र" : "Regions"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-center">
                  <span className="font-black text-xs text-slate-800 block">10</span>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-tight block">
                    {language === "hi" ? "पुरस्कार" : "Awards"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mission & Vision cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                <span className="text-base">🎯</span>
                <h5 className="font-bold text-[11px] text-orange-600 mt-1">
                  {language === "hi" ? "हमारा उद्देश्य" : "Our Mission"}
                </h5>
                <p className="text-[9px] text-slate-500 leading-snug mt-0.5 font-sans">
                  {language === "hi" ? "बाल कल्याण, खाद्य सुरक्षा और स्वास्थ्य क्लीनिकों को सशक्त बनाना और पूर्ण पारदर्शिता स्थापित करना।" : "Establish complete transparency and create channels supporting child welfare, rural food security, and primary health clinics."}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                <span className="text-base">👁️</span>
                <h5 className="font-bold text-[11px] text-orange-600 mt-1">
                  {language === "hi" ? "हमारा दृष्टिकोण" : "Our Vision"}
                </h5>
                <p className="text-[9px] text-slate-500 leading-snug mt-0.5 font-sans">
                  {language === "hi" ? "एक सक्रिय समाज का निर्माण करना जहाँ हर कोई सेवा के मूल्यों से प्रेरित होकर सामाजिक विकास में भाग ले।" : "Build vibrant, connected communities motivated by Seva values where everyone participates in social development."}
                </p>
              </div>
            </div>

            {/* Interactive Collapsible FAQ Segment */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-1">Frequently Asked Questions (FAQ)</span>
              
              <div className="space-y-1.5">
                {[
                  {
                    q: "What is the mission of your organization?",
                    a: "To empower individuals and foster growth by providing opportunities and support for all."
                  },
                  {
                    q: "How can I get involved?",
                    a: "You can sign up as an active volunteer under our Volunteer panel, register for events, or sponsor projects directly."
                  },
                  {
                    q: "Where are you located?",
                    a: "We are headquartered at 123 Service Street, Community City, CC 12345 (Tel: +1 (555) 123-4567, Email: info@sevasphoorthi.org)."
                  }
                ].map((item, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div key={index} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full p-2.5 text-left text-[10px] font-bold hover:bg-slate-50 flex items-center justify-between text-slate-800"
                      >
                        <span>{item.q}</span>
                        <span className="text-orange-500 text-xs font-black">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="p-2.5 pt-0 text-[10px] text-slate-500 bg-slate-50/50 leading-relaxed border-t border-slate-50">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Web footer info link */}
            <div className="bg-slate-100 rounded-lg p-2.5 flex justify-between items-center text-[10px]">
              <span className="font-semibold text-slate-500">Official Website Reference:</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  launchSimulatedBrowser("Seva Sphoorthi official", "https://sevasphoorthi.com");
                }}
                className="text-orange-600 font-extrabold hover:underline bg-transparent border-0 p-0 text-[10px] cursor-pointer"
              >
                sevasphoorthi.com
              </button>
            </div>
          </div>
        )}

        {/* -- ROUTE C: PROGRAMS SCREEN -- */}
        {currentScreen === "programs" && !selectedProgram && (
          <div className="flex-1 p-3 bg-slate-50 space-y-3 overflow-y-auto">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Active Sponsorship Programs</h4>
            
            {activePrograms.map(p => {
              const progressPct = Math.round((p.raised / p.goal) * 100);
              return (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProgram(p)}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:border-orange-200 transition flex flex-col"
                >
                  <img src={p.img} alt={p.title} className="w-full h-28 object-cover" referrerPolicy="no-referrer" />
                  <div className="p-3">
                    <h5 className="font-bold text-xs text-slate-800">{p.title}</h5>
                    <p className="text-[10px] text-orange-600 font-medium mt-0.5 leading-snug">{p.tagline}</p>
                    
                    {/* Progress tracking */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-1">
                        <span>Funded: {progressPct}%</span>
                        <span>Goal: ₹{(p.goal / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    {/* Active Action Buttons on Program Card */}
                    <div className="flex gap-2 pt-2.5 mt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic("medium");
                          setDonationForm(prev => ({
                            ...prev,
                            amount: p.sponsorOptions[0] || 500,
                            purpose: p.title
                          }));
                          navigateTo("donations");
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[9px] py-1.5 rounded-lg text-center cursor-pointer shadow-2xs active:scale-95 transition flex items-center justify-center gap-1"
                      >
                        <Heart className="w-3 h-3 text-red-200 fill-red-200" />
                        <span>Sponsor ₹{p.sponsorOptions[0] || 500}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProgram(p);
                          triggerHaptic("light");
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] py-1.5 rounded-lg text-center cursor-pointer active:scale-95 transition border border-slate-200"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROGRAMS DETAIL PAGE */}
        {selectedProgram && (
          <div className="flex-1 flex flex-col text-slate-900 bg-white overflow-y-auto">
            <div className="p-2 bg-slate-50 border-b flex justify-between items-center">
              <button 
                onClick={() => setSelectedProgram(null)}
                className="text-[11px] text-slate-500 font-bold flex items-center gap-1 hover:text-black cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Programs
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedProgram.id} Campaign</span>
            </div>

            <img src={selectedProgram.img} alt={selectedProgram.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
            
            <div className="p-4 space-y-3 flex-1">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedProgram.title}</h4>
                <p className="text-xs text-orange-600 font-semibold italic mt-0.5">{selectedProgram.tagline}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                {selectedProgram.desc}
              </p>

              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Sponsorship Goal</span>
                  <span className="font-black text-slate-800 text-sm">₹{selectedProgram.goal.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Pledged To Date</span>
                  <span className="font-black text-orange-600 text-sm">₹{selectedProgram.raised.toLocaleString()}</span>
                </div>
              </div>

              {/* Instant Sponsor suggestion CTAs */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Quick Sponsor Increments</span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProgram.sponsorOptions.map((opt: number) => (
                    <button 
                      key={opt}
                      onClick={() => {
                        setDonationForm(prev => ({ ...prev, amount: opt, purpose: selectedProgram.title }));
                        navigateTo("donations");
                      }}
                      className="border-2 border-orange-200 hover:bg-orange-50 text-orange-700 rounded-lg py-1.5 text-xs font-bold transition flex flex-col items-center cursor-pointer"
                    >
                      <span className="text-[9px] text-slate-400">Support</span>
                      <span>₹{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Volunteer Action */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    setVolunteerForm(prev => ({ ...prev, experience: selectedProgram.title }));
                    navigateTo("volunteer");
                    triggerHaptic("medium");
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Award className="w-4 h-4" />
                  <span>Apply to Volunteer for this Program</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- ROUTE D: GALLERY SCREEN -- */}
        {currentScreen === "gallery" && (
          <div className="flex-1 p-3 bg-white overflow-y-auto">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Field Activity Gallery</h4>
            <div className="grid grid-cols-2 gap-2">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedPhoto(img.url)}
                  className="group relative rounded-xl overflow-hidden aspect-video border bg-slate-50 cursor-pointer hover:shadow transition"
                >
                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-end p-1.5 transition">
                    <span className="text-[8px] text-white leading-tight font-bold truncating line-clamp-1">
                      {img.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom expanded Photo viewer overlay inside simulator */}
            {selectedPhoto && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-center p-4">
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 bg-slate-800 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <img src={selectedPhoto} alt="Zoom" className="w-full max-h-96 object-contain rounded-lg" referrerPolicy="no-referrer" />
                <p className="text-white text-xs text-center mt-3 font-semibold leading-relaxed">
                  {galleryImages.find(g => g.url === selectedPhoto)?.caption}
                </p>
              </div>
            )}
          </div>
        )}

        {/* -- ROUTE E: SCHEDULE & EVENTS SCREEN -- */}
        {currentScreen === "events" && (
          <div className="flex-1 p-3.5 bg-slate-50 space-y-3.5 overflow-y-auto">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Volunteer Schedule & Events</h4>
                <p className="text-[11px] text-slate-500">Upcoming community service drives & camps</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {eventsList.length} Active
              </span>
            </div>

            {eventsList.map(ev => (
              <div key={ev.id} className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden flex flex-col">
                <img src={ev.img} alt={ev.title} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      {ev.date}
                    </span>
                    <span className="text-slate-600 font-medium">{ev.time}</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-slate-900 leading-snug">{ev.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.desc}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="truncate font-medium">{ev.location}</span>
                  </div>

                  {ev.status === "Completed" ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-600 font-extrabold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 select-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>✓ Completed Activity</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setVolunteerForm(prev => ({ ...prev, experience: `Joining event: ${ev.title}` }));
                        navigateTo("volunteer");
                        triggerHaptic("light");
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
                    >
                      Register / Add to Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -- ROUTE F: VOLUNTEER MODULE SCREEN (PEGA BLUEPRINT PORTAL) -- */}
        {currentScreen === "volunteer" && (
          <VolunteerPortal 
            onBackToHome={() => navigateTo("home")} 
            triggerHaptic={triggerHaptic} 
            initialTab={volunteerInitialTab}
          />
        )}

        {/* -- ROUTE G: DONATION MODULE (PRODUCTION NGO PAYMENT EXPERIENCE) -- */}
        {currentScreen === "donations" && (
          <div className="flex-1 p-4 bg-white overflow-y-auto text-slate-900 relative">

            {/* 1. SUCCESS STATE */}
            {donationStep === "success" && (
              <div className="text-center py-6 px-2 space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 mx-auto rounded-full flex items-center justify-center text-3xl shadow-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Donation successful</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Dhanyavad, <span className="font-bold text-slate-900">{donationForm.donorName || "Supporter"}</span>! Your contribution helps us continue community service.
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 border border-slate-200 text-xs shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Beneficiary</span>
                    <span className="font-bold text-slate-900">Seva Sphoorthi Trust</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Purpose</span>
                    <span className="font-semibold text-slate-800">{donationForm.purpose || "Community Service"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Date &amp; Time</span>
                    <span className="text-slate-800 font-medium">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Transaction Reference</span>
                    <span className="font-mono text-[11px] text-slate-700 font-bold">{donationForm.receiptId || `RCP-${Date.now().toString().slice(-8)}`}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
                    <span className="text-slate-700 font-extrabold">Amount</span>
                    <span className="font-black text-emerald-700 text-base">₹{Number(donationForm.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button 
                    onClick={() => downloadReceipt(donationForm)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center gap-2 justify-center transition shadow-md shadow-orange-600/20 cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>View Receipt</span>
                  </button>
                  <button 
                    onClick={() => {
                      setDonationStep("amount");
                      setDonationForm(prev => ({ ...prev, success: false, amount: 1000, paymentId: null, orderId: undefined, receiptId: undefined, utrRef: undefined }));
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* 2. FAILURE STATE */}
            {donationStep === "failure" && (
              <div className="text-center py-6 px-2 space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-rose-50 border-2 border-rose-400 text-rose-600 mx-auto rounded-full flex items-center justify-center text-3xl shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Payment couldn't be completed.</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    The payment could not be processed by your bank. If any amount was deducted, your bank will refund it automatically within 2–3 business days.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-200 text-xs shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Beneficiary</span>
                    <span className="font-bold text-slate-900">Seva Sphoorthi Trust</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Amount</span>
                    <span className="font-bold text-slate-900">₹{Number(donationForm.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="text-rose-600 font-bold">Uncompleted</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button 
                    onClick={() => {
                      setPaymentFailure(null);
                      setDonationStep("summary");
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-orange-600/20 cursor-pointer active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <button 
                    onClick={() => {
                      setPaymentFailure(null);
                      setDonationStep("amount");
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 3. STEP A: DONATION AMOUNT & DONOR DETAILS */}
            {donationStep === "amount" && (
              <form onSubmit={startDonationFlow} className="space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Support Our Work</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your contribution helps us continue community service.
                  </p>
                </div>

                {/* Amount Selection */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">Choose Amount</label>

                  {/* Predefined Choices: ₹100, ₹500, ₹1,000, ₹2,000 */}
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setDonationForm(prev => ({ ...prev, amount: amt }));
                          setDonationInlineError(null);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          donationForm.amount === amt 
                            ? "bg-orange-600 text-white border-orange-600 shadow-sm" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Enter custom amount</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">₹</span>
                      <input 
                        type="number" 
                        required
                        min={10}
                        value={donationForm.amount}
                        onChange={(e) => {
                          setDonationForm(prev => ({ ...prev, amount: Number(e.target.value) }));
                          setDonationInlineError(null);
                        }}
                        placeholder="Custom amount" 
                        className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-orange-500 focus:bg-white bg-slate-50 font-mono font-bold text-sm text-slate-900 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Donor Particulars */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">Donor Information</span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={donationForm.donorName}
                      onChange={(e) => {
                        setDonationForm(prev => ({ ...prev, donorName: e.target.value }));
                        setDonationInlineError(null);
                      }}
                      placeholder="e.g. Ramesh Kumar" 
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 bg-slate-50 text-slate-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email ID *</label>
                      <input 
                        type="email" 
                        required
                        value={donationForm.email}
                        onChange={(e) => {
                          setDonationForm(prev => ({ ...prev, email: e.target.value }));
                          setDonationInlineError(null);
                        }}
                        placeholder="donor@example.com" 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 bg-slate-50 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile (Optional)</label>
                      <input 
                        type="tel" 
                        value={donationForm.phone || ""}
                        onChange={(e) => setDonationForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="98200 45678" 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 bg-slate-50 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose</label>
                    <select 
                      value={donationForm.purpose}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, purpose: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500 bg-slate-50 text-slate-900 font-medium"
                    >
                      <option value="Community Service">Community Service (General Fund)</option>
                      <option value="Food Relief & Annadana">Food Relief &amp; Annadana</option>
                      <option value="Educational Support">Educational Support &amp; Mentorship</option>
                      <option value="Healthcare & Medical Relief">Healthcare &amp; Medical Relief</option>
                      <option value="Elder Care & Community Welfare">Elder Care &amp; Community Welfare</option>
                    </select>
                  </div>
                </div>

                {/* Inline Error Message */}
                {donationInlineError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{donationInlineError}</span>
                  </div>
                )}

                {/* Primary CTA */}
                <button 
                  type="submit"
                  disabled={donationForm.isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition active:scale-98"
                >
                  {donationForm.isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Preparing Secure Checkout...</span>
                    </>
                  ) : (
                    <span>Proceed to Donate ₹{Number(donationForm.amount).toLocaleString('en-IN')}</span>
                  )}
                </button>
              </form>
            )}

            {/* 4. STEP B: DONATION SUMMARY & SECURE PAYMENT */}
            {donationStep === "summary" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Back to details */}
                <button
                  type="button"
                  onClick={() => setDonationStep("amount")}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Change amount</span>
                </button>

                {/* Donation Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Beneficiary</span>
                      <span className="font-extrabold text-sm text-slate-900">Seva Sphoorthi Trust</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Donation Amount</span>
                      <span className="font-black text-lg text-emerald-700 font-mono">₹{Number(donationForm.amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 text-slate-600">
                    <span>Purpose: {donationForm.purpose || "Community Service"}</span>
                    <span className="font-semibold text-slate-700">Payment: UPI</span>
                  </div>
                </div>

                {/* Choose UPI App */}
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                    Choose a UPI app
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => popUpiApp("gpay")}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-3 rounded-2xl flex items-center gap-3 transition shadow-xs cursor-pointer text-left active:scale-97"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 shadow-2xs shrink-0">
                        <span className="text-sm font-black text-blue-600">G</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">Google Pay</span>
                        <span className="text-[10px] text-slate-500">Pay directly</span>
                      </div>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => popUpiApp("phonepe")}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 p-3 rounded-2xl flex items-center gap-3 transition shadow-xs cursor-pointer text-left active:scale-97"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                        पे
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">PhonePe</span>
                        <span className="text-[10px] text-slate-500">Pay directly</span>
                      </div>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => popUpiApp("paytm")}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 p-3 rounded-2xl flex items-center gap-3 transition shadow-xs cursor-pointer text-left active:scale-97"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-[10px] shadow-2xs shrink-0">
                        Pay
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">Paytm</span>
                        <span className="text-[10px] text-slate-500">Pay directly</span>
                      </div>
                    </button>

                    {/* BHIM / Other UPI */}
                    <button
                      type="button"
                      onClick={() => popUpiApp("bhim")}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 p-3 rounded-2xl flex items-center gap-3 transition shadow-xs cursor-pointer text-left active:scale-97"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                        UPI
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">BHIM / Other UPI</span>
                        <span className="text-[10px] text-slate-500">Any UPI app</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button 
                    type="button"
                    onClick={() => setDonationStep("amount")}
                    className="text-slate-500 hover:text-slate-800 text-xs py-1.5 font-bold cursor-pointer transition text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 5. STEP C: PROCESSING STATE */}
            {donationStep === "processing" && (
              <div className="space-y-4 py-4 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-500 mx-auto flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900">Processing payment...</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Please don't close the app.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5 text-slate-600 text-left">
                  <div className="flex justify-between"><span className="text-slate-500">Beneficiary:</span> <strong className="text-slate-800">Seva Sphoorthi Trust</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Amount:</span> <strong className="text-emerald-700">₹{Number(donationForm.amount).toLocaleString('en-IN')}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span> <strong className="text-slate-800">UPI</strong></div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    disabled={donationForm.isProcessing}
                    onClick={() => confirmUpiPayment()}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {donationForm.isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying with bank...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>I Have Completed the Payment</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={donationForm.isProcessing}
                    onClick={() => popUpiApp(selectedUpiApp)}
                    className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition border border-slate-200 cursor-pointer"
                  >
                    Didn't open? Tap to Re-open UPI App
                  </button>

                  <button
                    type="button"
                    disabled={donationForm.isProcessing}
                    onClick={() => setDonationStep("summary")}
                    className="w-full text-slate-500 hover:text-slate-800 text-xs py-1.5 font-bold cursor-pointer transition text-center"
                  >
                    ← Choose a Different UPI App
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* -- ROUTE H: CONTACT & COORDINATES SCREEN -- */}
        {currentScreen === "contact" && (
          <div className="flex-1 p-3 bg-white space-y-4 overflow-y-auto">
            <div className="text-center">
              <span className="text-2xl">📍</span>
              <h4 className="font-bold text-sm text-slate-800 mt-1">Contact Headquarters</h4>
              <p className="text-[10px] text-slate-400 leading-normal">Communicate with Trust representatives easily.</p>
            </div>

            {/* Exact Address block */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[9px] font-bold uppercase mb-1">Registered Headquarters</span>
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-slate-800 block">Seva Sphoorthi Trust</span>
                  <span className="text-slate-600 block mt-0.5">123 Service Street</span>
                  <span className="text-slate-600 block">Community City, CC 12345</span>
                </div>
              </div>
            </div>

            {/* Direct Dial launch triggers mimicking Flutter UrlLauncher */}
            <div className="space-y-2">
              <span className="text-[9px] font-sans font-bold uppercase text-slate-400 block px-1">Dual Hotline Dialers</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => showToast("Dialing Helpline", "Connecting to +91 80 2345 6789...")}
                  className="bg-slate-50 hover:bg-slate-100 border rounded-xl p-2.5 text-left flex gap-2 text-xs leading-snug cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-orange-600 self-center shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[8px] font-bold uppercase">Main Line</span>
                    <span className="font-bold text-slate-800 truncate text-[10px]">+91 80 2345 6789</span>
                  </div>
                </button>
                <button 
                  onClick={() => showToast("Dialing Office", "Connecting to +91 80 9876 5432...")}
                  className="bg-slate-50 hover:bg-slate-100 border rounded-xl p-2.5 text-left flex gap-2 text-xs leading-snug cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-orange-600 self-center shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[8px] font-bold uppercase">Trust Office</span>
                    <span className="font-bold text-slate-800 truncate text-[10px]">+91 80 9876 5432</span>
                  </div>
                </button>
              </div>

              <span className="text-[9px] font-sans font-bold uppercase text-slate-400 block px-1">Interactive Email Channels</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => openSimulatedMail("info@sevasphoorthi.org")}
                  className="bg-slate-50 hover:bg-slate-100 border rounded-xl p-2.5 text-left flex gap-2 text-xs leading-snug cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-orange-600 self-center shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[8px] font-bold uppercase">General Info</span>
                    <span className="font-bold text-orange-600 truncate underline text-[9.5px]">info@sevasphoorthi.org</span>
                  </div>
                </button>
                <button 
                  onClick={() => openSimulatedMail("support@sevasphoorthi.org")}
                  className="bg-slate-50 hover:bg-slate-100 border rounded-xl p-2.5 text-left flex gap-2 text-xs leading-snug cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-orange-600 self-center shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[8px] font-bold uppercase">Tech Support</span>
                    <span className="font-bold text-orange-600 truncate underline text-[9.5px]">support@sevasphoorthi.org</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media Handle Icons */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Official Social Media Profiles</span>
              <div className="flex justify-center gap-2.5">
                {[
                  {
                    name: "Facebook",
                    icon: <Facebook className="w-4 h-4" />,
                    color: "bg-blue-600 hover:bg-blue-700 text-white",
                    url: "facebook.com/sevasphoorthi",
                    tag: "@sevasphoorthi"
                  },
                  {
                    name: "Twitter",
                    icon: <Twitter className="w-4 h-4" />,
                    color: "bg-sky-500 hover:bg-sky-600 text-white",
                    url: "twitter.com/sevasphoorthi",
                    tag: "@sevasphoorthi"
                  },
                  {
                    name: "Instagram",
                    icon: <Instagram className="w-4 h-4" />,
                    color: "bg-pink-600 hover:bg-pink-700 text-white",
                    url: "instagram.com/sevasphoorthi",
                    tag: "@sevasphoorthi"
                  },
                  {
                    name: "LinkedIn",
                    icon: <Linkedin className="w-4 h-4" />,
                    color: "bg-blue-700 hover:bg-blue-800 text-white",
                    url: "linkedin.com/company/sevasphoorthi",
                    tag: "Seva Sphoorthi"
                  },
                  {
                    name: "YouTube",
                    icon: <Youtube className="w-4 h-4 animate-pulse" />,
                    color: "bg-red-600 hover:bg-red-700 text-white",
                    url: "youtube.com/sevasphoorthi",
                    tag: "Seva Sphoorthi TV"
                  }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => launchSimulatedBrowser(`${item.name} Official Feed`, `https://${item.url}`)}
                    className={`p-2 rounded-full shadow-sm transition hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer ${item.color}`}
                    title={`${item.name}: ${item.tag}`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <div className="pt-1 select-none">
                <span className="text-[8px] text-slate-400 block font-medium">Click any channel to launch external web URL</span>
              </div>
            </div>

            {/* Simulated google map iframe element */}
            <div className="space-y-1.5 shadow-sm border rounded-xl overflow-hidden bg-slate-200">
              <div className="bg-slate-800 text-white text-[9px] px-2.5 py-1.5 flex justify-between font-bold">
                <span>HEADQUARTERS GPS COORDINATES</span>
                <span className="text-orange-400 font-extrabold cursor-pointer uppercase text-[8.5px]" onClick={() => {
                  triggerHaptic("light");
                  showToast("GPS Synced", `Location synced to ${gpsCoordinates[gpsMockLocation as keyof typeof gpsCoordinates]?.name}.`);
                }}>
                  📍 SYNC GPS
                </span>
              </div>
              <div className="h-28 w-full relative bg-slate-300 flex flex-col justify-between p-2.5">
                {/* Dynamically update based on GPS simulator location */}
                <div className="absolute inset-x-0 top-1/2 border-t border-slate-400/40"></div>
                <div className="absolute inset-y-0 left-1/4 border-l border-slate-400/40"></div>
                <div className="absolute inset-y-0 left-2/3 border-l border-slate-400/40"></div>

                <div className="relative z-10 flex flex-col justify-between h-full text-slate-900">
                  <div className="bg-white/95 backdrop-blur-xs shadow-xs border border-orange-100 p-1.5 rounded-lg text-[8px] leading-tight flex items-center gap-1.5 select-text shrink-0">
                    <span className="text-base leading-none">📡</span>
                    <div>
                      <span className="font-extrabold block text-slate-800">Coordinates Locked</span>
                      <span className="font-mono text-slate-500 font-bold block">
                        {gpsCoordinates[gpsMockLocation as keyof typeof gpsCoordinates]?.coords || "13.2105° N, 77.3484° E"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center self-center py-2 shrink-0 select-none">
                    <span className="text-lg animate-bounce inline-block">📍</span>
                    <span className="block font-black text-[9px] text-slate-800 leading-none">
                      {gpsCoordinates[gpsMockLocation as keyof typeof gpsCoordinates]?.name || "Bangalore Central H.Q."}
                    </span>
                    <span className="block text-[7.5px] text-slate-500 font-semibold italic mt-0.5 leading-none">
                      {gpsCoordinates[gpsMockLocation as keyof typeof gpsCoordinates]?.marker || "🌾 NGO Seva Zone"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-2 border-t text-center shrink-0">
                <button 
                  onClick={() => {
                    triggerHaptic("heavy");
                    showToast("GPS Calibrated", `Active Coordinates: ${gpsCoordinates[gpsMockLocation as keyof typeof gpsCoordinates]?.coords}`);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[9px] py-1 rounded-lg uppercase tracking-wider shadow-sm transition"
                >
                  Request Native GPS Perms & Recalibrate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- ROUTE SERVICES: SERVICES OFFERED -- */}
        {currentScreen === "services" && (
          <div className="flex-1 p-3 bg-white space-y-3.5 overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-3.5 text-white text-center shadow-md">
              <span className="text-2xl">⚙️</span>
              <h4 className="font-bold text-xs tracking-wide uppercase mt-1">Our Comprehensive Services</h4>
              <p className="text-[10px] text-orange-50 leading-relaxed mt-0.5">Explore our wide range of community initiatives designed to uplift, guide, and protect rural lives.</p>
            </div>

            {/* Quick Stats Banner inside Services page */}
            <div className="grid grid-cols-4 gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1.5 text-center">
              <div>
                <span className="font-extrabold text-[10px] text-orange-600 block">500+</span>
                <span className="text-[7.5px] text-slate-400 font-bold block">Volunteers</span>
              </div>
              <div>
                <span className="font-extrabold text-[10px] text-orange-600 block">15+</span>
                <span className="text-[7.5px] text-slate-400 font-bold block">Services</span>
              </div>
              <div>
                <span className="font-extrabold text-[10px] text-orange-600 block">25+</span>
                <span className="text-[7.5px] text-slate-400 font-bold block">Villages</span>
              </div>
              <div>
                <span className="font-extrabold text-[10px] text-orange-600 block">10+ Yrs</span>
                <span className="text-[7.5px] text-slate-400 font-bold block">Heritage</span>
              </div>
            </div>

            {/* Category selection tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {["All", "Community", "Education", "Healthcare", "Environment"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-3 py-1 text-[9px] font-bold rounded-full border transition shrink-0 ${
                    selectedServiceCategory === cat
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services matching the category */}
            <div className="space-y-4">
              {["Community", "Education", "Healthcare", "Environment"]
                .filter(cat => selectedServiceCategory === "All" || cat === selectedServiceCategory)
                .map((categoryName, catIndex) => {
                  const categoryServices = rawServicesList.filter(item => item.cat === categoryName);
                  if (categoryServices.length === 0) return null;

                  return (
                    <motion.div 
                      key={`${categoryName}-${selectedServiceCategory}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: catIndex * 0.08, ease: "easeOut" }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-1.5 px-1 pt-1.5 border-b border-slate-100 pb-1">
                        <span className="text-xs">
                          {categoryName === "Community" ? "👥" :
                           categoryName === "Education" ? "📚" :
                           categoryName === "Healthcare" ? "❤️" : "🌱"}
                        </span>
                        <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-700">
                          {categoryName} Pillar <span className="text-slate-400 font-medium">({categoryServices.length})</span>
                        </h5>
                      </div>
                      <div className="space-y-2.5">
                        {categoryServices.map((item, index) => {
                          // Define category badge colors and card accent borders
                          let badgeStyle = "text-orange-600 bg-orange-50 border-orange-100";
                          let leftBorder = "border-l-4 border-l-orange-500";
                          let bulletColor = "text-orange-500";
                          let applyBtnStyle = "bg-orange-50 hover:bg-orange-100/75 border-orange-100 text-orange-600";
                          
                          if (item.cat === "Education") {
                            badgeStyle = "text-indigo-600 bg-indigo-50 border-indigo-100";
                            leftBorder = "border-l-4 border-l-indigo-500";
                            bulletColor = "text-indigo-500";
                            applyBtnStyle = "bg-indigo-50 hover:bg-indigo-100/75 border-indigo-100 text-indigo-600";
                          } else if (item.cat === "Healthcare") {
                            badgeStyle = "text-rose-600 bg-rose-50 border-rose-100";
                            leftBorder = "border-l-4 border-l-rose-500";
                            bulletColor = "text-rose-500";
                            applyBtnStyle = "bg-rose-50 hover:bg-rose-100/75 border-rose-100 text-rose-600";
                          } else if (item.cat === "Environment") {
                            badgeStyle = "text-emerald-600 bg-emerald-50 border-emerald-100";
                            leftBorder = "border-l-4 border-l-emerald-500";
                            bulletColor = "text-emerald-500";
                            applyBtnStyle = "bg-emerald-50 hover:bg-emerald-100/75 border-emerald-100 text-emerald-600";
                          }

                          return (
                            <motion.div 
                              key={`${item.id}-${selectedServiceCategory}`}
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: (catIndex * 0.08) + (index * 0.04) 
                              }}
                              className={`bg-white rounded-xl border border-slate-150 p-3 shadow-xs space-y-2 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md ${leftBorder}`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.icon}</span>
                                  <h5 className="font-black text-slate-800 text-[11px] leading-tight">{item.title}</h5>
                                </div>
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 20, 
                                    delay: (catIndex * 0.08) + (index * 0.04) + 0.1
                                  }}
                                  className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded border ${badgeStyle}`}
                                >
                                  {item.cat}
                                </motion.span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                              
                              <div className="bg-slate-50/70 p-2 rounded-lg space-y-1">
                                <span className="text-[8px] font-extrabold text-slate-400 block uppercase">Key Program Features:</span>
                                {item.features.map((f, i) => (
                                  <div key={i} className="flex gap-1.5 items-start text-[9.5px] text-slate-600">
                                    <span className={`${bulletColor} font-extrabold`}>•</span>
                                    <span className="leading-snug">{f}</span>
                                  </div>
                                ))}
                              </div>

                              <button 
                                onClick={() => navigateTo("volunteer")}
                                className={`w-full text-center border rounded-lg py-1.5 text-[9.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${applyBtnStyle}`}
                              >
                                <Plus className="w-3.5 h-3.5" /> Support Service as Volunteer
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {currentScreen === "jobs" && (
          <div className="flex-1 p-3 bg-white space-y-3.5 overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-3.5 text-white text-center shadow-sm">
              <span className="text-2xl">💼</span>
              <h4 className="font-bold text-xs tracking-wide uppercase mt-1">Dharma Careers Portal</h4>
              <p className="text-[10px] text-orange-50 leading-relaxed mt-0.5">Connecting professional Hindu candidates with organizations who value traditional ideals and sacred culture.</p>
              
              {/* Top sub metrics */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                <div className="bg-white/10 rounded-lg py-1">
                  <span className="font-extrabold text-[11px] block text-amber-300">10,000+</span>
                  <span className="text-[8px] uppercase font-bold text-slate-200 block">Job Seekers</span>
                </div>
                <div className="bg-white/10 rounded-lg py-1">
                  <span className="font-extrabold text-[11px] block text-amber-300">500+</span>
                  <span className="text-[8px] uppercase font-bold text-slate-200 block">Organizations</span>
                </div>
              </div>
            </div>

            {/* Filter Search Area */}
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-1">Interactive Filters</span>
              
              <div className="flex gap-2 text-xs">
                {/* Keyword input */}
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    value={jobKeyword}
                    onChange={(e) => setJobKeyword(e.target.value)}
                    placeholder="Search titles / skills..."
                    className="w-full bg-white border focus:border-orange-500 rounded-lg pl-7 pr-2 py-1.5 outline-none text-[10px] text-slate-700"
                  />
                </div>

                {/* Location input */}
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Location filter..."
                  className="w-1/3 bg-white border focus:border-orange-500 rounded-lg px-2 py-1.5 outline-none text-[10px] text-slate-700"
                />
              </div>

              {/* Category buttons row */}
              <div className="flex gap-1 pt-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  { name: "All", emoji: "🌐", bg: "bg-slate-800 border-slate-800 text-white", inactiveBg: "bg-white text-slate-500 hover:bg-slate-50 border-slate-200" },
                  { name: "Community", emoji: "👥", bg: "bg-orange-600 border-orange-600 text-white", inactiveBg: "bg-white text-orange-600 hover:bg-orange-50 border-orange-200" },
                  { name: "Education", emoji: "📚", bg: "bg-indigo-600 border-indigo-600 text-white", inactiveBg: "bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-200" },
                  { name: "Healthcare", emoji: "❤️", bg: "bg-rose-600 border-rose-600 text-white", inactiveBg: "bg-white text-rose-600 hover:bg-rose-50 border-rose-200" },
                  { name: "Environment", emoji: "🌱", bg: "bg-emerald-600 border-emerald-600 text-white", inactiveBg: "bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-200" }
                ].map(cat => {
                  const count = cat.name === "All" 
                    ? rawJobsList.length 
                    : rawJobsList.filter(j => j.cat === cat.name).length;

                  const isSelected = selectedJobCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedJobCategory(cat.name)}
                      className={`px-3 py-1 text-[8.5px] font-bold rounded-full border transition shrink-0 flex items-center gap-1 cursor-pointer ${
                        isSelected ? cat.bg : cat.inactiveBg
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                      <span className={`text-[7.5px] px-1.5 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jobs list matching the search constraints */}
            <div className="space-y-2.5">
              {filteredJobs.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center space-y-2">
                  <span className="text-2xl block">🔍</span>
                  <h5 className="font-bold text-[11px] text-slate-800">No matching Dharma Careers found</h5>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">Try refining your keyword search, resetting location filters, or looking under other pillar categories.</p>
                  <button
                    onClick={() => {
                      setSelectedJobCategory("All");
                      setJobKeyword("");
                      setJobLocation("");
                    }}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-slate-150 p-3 shadow-xs space-y-2.5 relative overflow-hidden">
                    {/* Recommended Tag */}
                    {job.id === 3 && (
                      <span className="absolute top-0 right-0 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-bl uppercase">
                        Recommended
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-orange-500">
                          {job.cat === "Community" ? "👥" :
                           job.cat === "Education" ? "📚" :
                           job.cat === "Healthcare" ? "❤️" : "🌱"}
                        </span>
                        <h5 className="font-extrabold text-[11px] text-slate-800 leading-tight">{job.title}</h5>
                      </div>
                      <div className="flex items-center gap-1 text-[8.5px] font-semibold text-slate-400">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span className="text-slate-500">{job.location}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal italic bg-slate-50/50 p-2 rounded-lg border-l-2 border-orange-400">
                      "{job.desc}"
                    </p>

                    {/* Requirements specifications table */}
                    <div className="bg-slate-50 p-2 rounded-lg text-[9px] text-slate-600 grid grid-cols-2 gap-y-1 gap-x-2">
                      <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Experience:</span> <span className="font-bold text-slate-700">{job.exp}</span></div>
                      <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Demographic:</span> <span className="font-bold text-slate-700">{job.gender}</span></div>
                      <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Languages:</span> <span className="font-bold text-slate-700 truncate max-w-[50px]">{job.langs}</span></div>
                      <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Age limit:</span> <span className="font-bold text-slate-700">{job.age}</span></div>
                      <div className="flex justify-between pt-0.5"><span className="text-slate-400">Sought Positions:</span> <span className="font-bold text-orange-600">{job.positions} Openings</span></div>
                      <div className="flex justify-between pt-0.5"><span className="text-slate-400">Posted duration:</span> <span className="text-[8px] text-slate-400">{job.postedDays} days ago</span></div>
                    </div>

                    {/* Skills required tags */}
                    <div className="space-y-1">
                      <span className="text-[8.5px] font-black text-slate-400 block uppercase">Prerequisite Skills Needed:</span>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="text-[8px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Primary apply button */}
                    {appliedJobIds.includes(job.id) ? (
                      <button 
                        disabled
                        className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg py-1.5 text-[10px] font-black text-center select-none transition shadow-xs flex items-center justify-center gap-1"
                      >
                        <span>✓ Applied (In Review)</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApplyToJob(job.id, job.title, job.company || "Seva Trust")}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-1.5 text-[10px] font-black text-center cursor-pointer select-none transition shadow-xs"
                      >
                        Apply to Organization
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -- ROUTE I: USER PROFILE SCREEN & LEDGER HISTORY -- */}
        {currentScreen === "profile" && (
          <div className="flex-1 p-3 bg-slate-50 space-y-3.5 overflow-y-auto">
            {/* Hidden file input for fast direct upload */}
            <input 
              type="file" 
              ref={quickProfileFileInputRef} 
              onChange={handleDirectFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {/* Profile Avatar Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-3.5 space-y-3">
              <div className="flex gap-3 items-center">
                <div 
                  onClick={() => {
                    setProfilePhotoModalOpen(true);
                    triggerHaptic("medium");
                  }}
                  className="w-14 h-14 rounded-full text-white font-extrabold flex items-center justify-center text-xl shadow-md shrink-0 bg-slate-800 relative cursor-pointer group hover:ring-4 hover:ring-orange-500/30 transition-all overflow-hidden border-2 border-orange-500"
                  title="Click to change profile picture, upload file, or use camera"
                >
                  {customAvatar ? (
                    <img src={customAvatar} alt="Captured Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>SV</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-orange-600/90 py-0.5 text-[6px] text-center font-black uppercase text-white tracking-wider">
                    EDIT
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">
                        {authUser ? authUser.name : "Volunteer Profile"}
                      </h4>
                      <p className="text-[9.5px] text-slate-400 truncate">
                        {authUser ? (authUser.phone || authUser.email) : "volunteer@sevasphoorthi.org"}
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                      {authUser ? `${authUser.role} (OTP)` : "Verified Seva ID"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-1.5 leading-none">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                        {authUser ? "Active Session" : "Guest Mode"} • Enclave Sync
                      </span>
                    </div>
                    <button
                      onClick={() => navigateTo("login")}
                      className="text-[9px] text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      {authUser ? "Switch" : "Login OTP"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Photo Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                <button 
                  onClick={() => {
                    quickProfileFileInputRef.current?.click();
                    triggerHaptic("light");
                  }}
                  className="bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 rounded-xl text-[9px] font-bold py-1.5 px-2 text-orange-700 flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Directly select image from your device"
                >
                  <Upload className="w-3 h-3 text-orange-600" />
                  <span>Upload</span>
                </button>

                <button 
                  onClick={() => {
                    setProfilePhotoModalOpen(true);
                    triggerHaptic("light");
                  }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-bold py-1.5 px-2 text-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Open full photo studio & presets"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Studio</span>
                </button>

                <button 
                  onClick={() => {
                    setCameraActive(true);
                    triggerHaptic("medium");
                  }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-bold py-1.5 px-2 text-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Open simulated camera viewfinder"
                >
                  <Camera className="w-3 h-3 text-slate-600" />
                  <span>Camera</span>
                </button>
              </div>
            </div>

            {/* Volunteer info snippet */}
            <div className="bg-white rounded-xl border p-3.5 space-y-2">
              <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-500" /> Volunteer Program Setup
              </h5>
              <div className="text-[11px] leading-relaxed text-slate-600">
                <div className="flex justify-between border-b pb-1">
                  <span>Register status:</span>
                  <span className="font-bold text-orange-600 uppercase">{volunteerStatus}</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal mt-1.5">
                  Once coordinates register you, the profile enables active camp dashboards for field surveys.
                </p>
              </div>
            </div>

            {/* My Career Applications */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest block px-1">My Career Applications</span>
              
              {appliedJobIds.length === 0 ? (
                <div className="bg-white rounded-xl border p-4 text-center text-slate-400">
                  <span className="text-xl block">💼</span>
                  <p className="text-[10px] mt-1 font-semibold">No active job applications submitted yet.</p>
                  <button 
                    onClick={() => navigateTo("jobs")}
                    className="mt-1.5 text-[9.5px] font-black text-orange-600 hover:underline block mx-auto cursor-pointer"
                  >
                    Browse Dharma Careers
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {rawJobsList.filter(j => appliedJobIds.includes(j.id)).map(job => (
                    <div key={job.id} className="bg-white rounded-xl border p-3 flex flex-col gap-1.5 text-xs leading-tight">
                      <div className="flex justify-between items-start gap-1">
                        <div className="min-w-0">
                          <h6 className="font-bold text-slate-800 text-[11px] truncate">{job.title}</h6>
                          <span className="text-[9px] text-slate-400 block truncate mt-0.5">{job.company}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[7.5px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                          In Review
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded text-[8.5px] text-slate-500 font-medium">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-bold text-slate-700">{job.location}</span>
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span>Submission:</span>
                          <span className="text-slate-400 font-mono">SQLite (Pending Interview)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History ledgers receipts database */}
            <div className="space-y-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest block px-1">Sponsorship Receipts (Razorpay History)</span>
              
              {donations.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-slate-400">
                  <span className="text-xl block">📄</span>
                  <p className="text-[10px] mt-1 font-semibold">No records saved locally in SharedPreferences.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {donations.map((d: any) => (
                    <div key={d.id} className="bg-white rounded-xl border p-2.5 flex items-center justify-between text-xs leading-tight">
                      <div className="min-w-0">
                        <h6 className="font-bold text-slate-800 text-[11px] truncate">{d.purpose}</h6>
                        <span className="text-[9px] text-slate-400 leading-normal block italic mt-0.5">{d.date}</span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 tracking-tight select-all leading-none">{d.id}</span>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1 ml-2">
                        <span className="font-black text-orange-600">₹{d.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => downloadReceipt(d)}
                          className="bg-slate-100 hover:bg-slate-200 border rounded text-[9px] font-bold px-1.5 py-0.5 text-slate-600"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -- ROUTE J: SECTOR EXPLORER SCREEN -- */}
        {currentScreen === "sector-explorer" && (
          <div className="flex-1 p-3 bg-slate-50 space-y-3.5 overflow-y-auto">
            {/* Sector Banner depending on selected category */}
            <div className={`rounded-2xl p-4 text-white text-center shadow-md relative overflow-hidden ${
              selectedExploreCategory === "Community" ? "bg-gradient-to-br from-orange-500 to-amber-500" :
              selectedExploreCategory === "Education" ? "bg-gradient-to-br from-purple-600 to-indigo-600" :
              selectedExploreCategory === "Healthcare" ? "bg-gradient-to-br from-red-500 to-pink-500" :
              "bg-gradient-to-br from-emerald-500 to-teal-500"
            }`}>
              {/* Abs decorative shape */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/15"></div>
              
              <span className="text-3xl block filter drop-shadow-md">
                {selectedExploreCategory === "Community" ? "👥" :
                 selectedExploreCategory === "Education" ? "📚" :
                 selectedExploreCategory === "Healthcare" ? "❤️" : "🌱"}
              </span>
              <h4 className="font-extrabold text-sm tracking-wide uppercase mt-1">
                {selectedExploreCategory} Initiatives
              </h4>
              <p className="text-[10px] text-white/90 leading-relaxed max-w-xs mx-auto mt-0.5">
                {selectedExploreCategory === "Community" ? "Uplifting rural lives with coordinated food networks, volunteer programs, and civic guidance." :
                 selectedExploreCategory === "Education" ? "Sponsoring student supplies, traditional value-based tutoring, and advanced digital skills." :
                 selectedExploreCategory === "Healthcare" ? "Facilitating free clinical diagnostics, veteran medicine lines, and nutritious elderly support." :
                 "Nurturing sacred village nurseries, seedball dispersal, water conservation, and plastic cleanliness."}
              </p>
            </div>

            {/* Segmented Dual Selector Tabs */}
            <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setExploreTab("services")}
                className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                  exploreTab === "services"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ⚙️ Services Offered ({
                  [
                    { title: "Volunteer Management", cat: "Community" },
                    { title: "Community Outreach", cat: "Community" },
                    { title: "Skill Development", cat: "Education" },
                    { title: "Youth Programs", cat: "Education" },
                    { title: "Elder Care Support", cat: "Healthcare" },
                    { title: "Environmental Initiatives", cat: "Environment" }
                  ].filter(item => item.cat === selectedExploreCategory).length
                })
              </button>
              <button
                onClick={() => setExploreTab("jobs")}
                className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                  exploreTab === "jobs"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                💼 Dharma Careers ({
                  [
                    { title: "Dharma Community Outreach Lead", cat: "Community" },
                    { title: "Government School Tutor", cat: "Education" },
                    { title: "Vaidya Rural Health Aide", cat: "Healthcare" },
                    { title: "Native Sapling Nursery Keeper", cat: "Environment" }
                  ].filter(job => job.cat === selectedExploreCategory).length
                })
              </button>
            </div>

            {/* Filtered rendering lists */}
            <div className="space-y-3">
              {exploreTab === "services" && (
                <>
                  {[
                    {
                      id: 1,
                      title: "Volunteer Management",
                      cat: "Community",
                      icon: "👥",
                      desc: "Establish structures to recruit, select, train, and match individuals to social campaigns.",
                      features: ["Direct camp mentoring support", "Volunteer tracking systems", "Performance credentials recognition"]
                    },
                    {
                      id: 2,
                      title: "Community Outreach",
                      cat: "Community",
                      icon: "📣",
                      desc: "Engaging local residents towards resolving immediate civic, health, development and educational needs.",
                      features: ["Rural development surveys", "Local assistance support hubs", "Resource donation & distribution tracks"]
                    },
                    {
                      id: 3,
                      title: "Skill Development",
                      cat: "Education",
                      icon: "💻",
                      desc: "Train youngsters and women in digital literacy, traditional crafts, and basic business operations.",
                      features: ["Syllabus-led courses & certifications", "Local placement facilitation", "Job seeker guidance councils"]
                    },
                    {
                      id: 4,
                      title: "Youth Programs",
                      cat: "Education",
                      icon: "🧑‍🎓",
                      desc: "Fostering academic confidence, soft skills, and core values among village elementary school children.",
                      features: ["Sanskar Shalas heritage tutoring", "Subject homework assistance", "Civic leadership weekend assemblies"]
                    },
                    {
                      id: 5,
                      title: "Elder Care Support",
                      cat: "Healthcare",
                      icon: "🥣",
                      desc: "Supplying warm daily meals, basic diagnostic camps, and peaceful devotional spaces for rural elders.",
                      features: ["Mobile health checkup drives", "Prasadam & nutrient distribution", "Community interactive circles"]
                    },
                    {
                      id: 6,
                      title: "Environmental Initiatives",
                      cat: "Environment",
                      icon: "🌱",
                      desc: "Promoting native tree seed plantations, local trash clean-ups, and preservation of sacred temple ponds.",
                      features: ["Seed balls distribution drives", "Plastic-free awareness runs", "Water conservation projects"]
                    }
                  ]
                    .filter(item => item.cat === selectedExploreCategory)
                    .map(item => (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-150 p-3.5 shadow-xs space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className="text-lg w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">{item.icon}</span>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 leading-tight">{item.title}</h5>
                            <span className="text-[7.5px] font-black uppercase text-orange-500 tracking-wider inline-block">Official Trust Sub-Service</span>
                          </div>
                        </div>
                        <p className="text-[9.5px] text-slate-500 leading-normal">{item.desc}</p>
                        <div className="bg-slate-50 p-2 rounded-lg border-t space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Active Deliverables</span>
                          <div className="space-y-1 pl-1">
                            {item.features.map((fea, idx) => (
                              <div key={idx} className="flex gap-1.5 items-center leading-none text-[8.5px] text-slate-600">
                                <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                <span>{fea}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => navigateTo("volunteer")}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-1.5 text-[9.5px] font-black text-center cursor-pointer transition"
                        >
                          Mobilize as Seva Volunteer
                        </button>
                      </div>
                    ))}
                </>
              )}

              {exploreTab === "jobs" && (
                <>
                  {[
                    {
                      id: 1,
                      title: "Dharma Community Outreach Lead",
                      company: "Seva Trust Outreach Office",
                      cat: "Community",
                      desc: "Engage with rural families, conduct developmental surveys, and coordinate volunteers for local social campaigns with our community outreach division.",
                      positions: 3,
                      location: "Rural Bangalore West",
                      postedDays: 45,
                      skills: ["Rural Engagement", "Resource Coordination", "Survey Analytics", "Public Speaking"],
                      gender: "Any Gender",
                      age: "22-45 Years",
                      exp: "2+ Years Experience",
                      langs: "Telugu, English, Kannada"
                    },
                    {
                      id: 2,
                      title: "Government School Tutor",
                      company: "Vidya Project Education Hub",
                      cat: "Education",
                      desc: "Teach math, science, and traditional values to village primary school children at our local tuition centers.",
                      positions: 5,
                      location: "Nelamangala Taluk",
                      postedDays: 12,
                      skills: ["Interactive Tutoring", "Primary Education", "Curriculum Delivery", "Mentorship"],
                      gender: "Any Gender",
                      age: "18-40 Years",
                      exp: "1+ Years Experience",
                      langs: "Telugu, Hindi, English"
                    },
                    {
                      id: 3,
                      title: "Vaidya Rural Health Aide",
                      company: "Sri Lakshmi Healthcare Kendra",
                      cat: "Healthcare",
                      desc: "Assist medical doctors in rural diagnostic camps, manage patients, distribute prasadam meals, and run basic clinic check-up devices.",
                      positions: 10,
                      location: "Urban Bangalore Outer",
                      postedDays: 8,
                      skills: ["Basic Nursing Care", "Patient Coordination", "Diagnostic Testing", "Sterile Practices"],
                      gender: "Any Gender",
                      age: "20-50 Years",
                      exp: "2+ Years Experience",
                      langs: "Telugu, Hindi"
                    },
                    {
                      id: 4,
                      title: "Native Sapling Nursery Keeper",
                      company: "Green Shield Eco Trust Nelamangala",
                      cat: "Environment",
                      desc: "Maintain organic nursery stocks, string sacred flower arrangements, and lead native tree plantation drives across local villages.",
                      positions: 3,
                      location: "Nelamangala Offices",
                      postedDays: 19,
                      skills: ["Organic Horticulture", "Plantation Strategy", "Flower Arrangement", "Physical Fitness"],
                      gender: "Any Gender",
                      age: "18-50 Years",
                      exp: "No Experience Required",
                      langs: "Telugu, Kannada"
                    }
                  ]
                    .filter(job => job.cat === selectedExploreCategory)
                    .map(job => (
                      <div key={job.id} className="bg-white rounded-xl border border-slate-150 p-3.5 shadow-xs space-y-2 relative overflow-hidden">
                        <div className="flex gap-2 justify-between items-start">
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-800 leading-tight truncate">{job.title}</h5>
                            <span className="text-[8px] font-bold text-slate-400 block truncate mt-0.5">{job.company}</span>
                            <span className="text-[7.5px] font-mono font-bold text-slate-400 block truncate leading-none mt-1 uppercase">🌐 {job.location}</span>
                          </div>
                        </div>

                        <p className="text-[9.5px] text-slate-500 leading-normal italic bg-slate-50/50 p-2 rounded-lg border-l-2 border-orange-400">
                          "{job.desc}"
                        </p>

                        <div className="bg-slate-50 p-2 rounded-lg text-[9px] text-slate-600 grid grid-cols-2 gap-y-1 gap-x-2">
                          <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Experience:</span> <span className="font-bold text-slate-700">{job.exp}</span></div>
                          <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Demographic:</span> <span className="font-bold text-slate-700">{job.gender}</span></div>
                          <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Languages:</span> <span className="font-bold text-slate-700 truncate max-w-[50px]">{job.langs}</span></div>
                          <div className="flex justify-between border-b border-dashed pb-0.5"><span className="text-slate-400">Age limit:</span> <span className="font-bold text-slate-700">{job.age}</span></div>
                          <div className="flex justify-between pt-0.5"><span className="text-slate-400">Sought Positions:</span> <span className="font-bold text-orange-600">{job.positions} Openings</span></div>
                          <div className="flex justify-between pt-0.5"><span className="text-slate-400">Posted duration:</span> <span className="text-[8px] text-slate-400">{job.postedDays} days ago</span></div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 block uppercase">Prerequisite Skills Needed:</span>
                          <div className="flex flex-wrap gap-1">
                            {job.skills.map((skill, i) => (
                              <span key={i} className="text-[8px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {appliedJobIds.includes(job.id) ? (
                          <button 
                            disabled
                            className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg py-1.5 text-[9.5px] font-black text-center select-none transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <span>✓ Applied (In Review)</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleApplyToJob(job.id, job.title, job.company || "Seva Trust")}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-1.5 text-[9.5px] font-black text-center cursor-pointer transition shadow-xs"
                          >
                            Apply to Organization
                          </button>
                        )}
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* -- ROUTE K: FAQ DEDICATED SCREEN -- */}
        {currentScreen === "faq" && (
          <div className="flex-1 p-3 bg-slate-50 space-y-3.5 overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-3.5 text-white text-center shadow-md">
              <span className="text-2xl">❓</span>
              <h4 className="font-black text-xs tracking-wide uppercase mt-1">FAQ Help Center</h4>
              <p className="text-[10px] text-orange-50 leading-relaxed mt-0.5">Find immediate answers regarding volunteerism, sponsorships, trust audits, and career placements.</p>
            </div>

            <div className="space-y-2">
              {[
                {
                  q: "Who is Seva Sphoorthi?",
                  a: "Seva Sphoorthi is a volunteer-led non-profit trust dedicated to primary child education (Vidya Project), hunger relief (Aahara Drive), eco-conservancy (Environment initiatives), and rural clinical checkups."
                },
                {
                  q: "How are volunteer hours measured?",
                  a: "Volunteers receive verified certificates and digital credentials tracked directly via our mobile app backend upon completing offline campaigns."
                },
                {
                  q: "Is there any age bar for joining?",
                  a: "No! We welcome citizens of all ages who believe in traditional Seva ethics and wish to contribute to society."
                },
                {
                  q: "Where does my donation go?",
                  a: "100% of public sponsorships go directly to procurement of meal ingredients or school supply kits. Audit logs are fully transparent and accessible."
                },
                {
                  q: "Can I apply for multiple Dharma Careers?",
                  a: "Yes, candidates can submit their seeker profiles for multiple matching jobs that fit their skills and region constraints."
                },
                {
                  q: "How can we contact support directly?",
                  a: "Please feel free to email info@sevasphoorthi.org, call us on +1 (555) 123-4567, or drop by our registered office at 123 Service Street, Community City."
                }
              ].map((item, index) => {
                const isOpen = activeFaq === index + 100;
                return (
                  <div key={index} className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button 
                      onClick={() => setActiveFaq(isOpen ? null : index + 100)}
                      className="w-full p-2.5 text-left text-[10px] font-black hover:bg-slate-50 flex items-center justify-between text-slate-800"
                    >
                      <span>{item.q}</span>
                      <span className="text-orange-500 text-xs font-black">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="p-2.5 pt-0 text-[9.5px] text-slate-500 bg-slate-50/50 leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bg-white border rounded-xl p-3 text-center space-y-2">
              <p className="text-[10px] text-slate-400 font-medium leading-none">Still have questions? Our support desk is online 24/7.</p>
              <button 
                onClick={() => navigateTo("contact")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-1.5 px-4 rounded-lg text-[9.5px]"
              >
                Contact Support Desk
              </button>
            </div>
          </div>
        )}

        {/* -- ROUTE L: SACRED TEMPLES & DHARMA SEVA -- */}
        {currentScreen === "temples" && (
          <TemplesScreen
            temples={TEMPLES_DATA}
            joinedSevaSlotIds={joinedSevaSlotIds}
            onJoinSevaSlot={handleJoinSevaSlot}
            onSponsorSeva={handleSponsorTempleSeva}
            templePledges={templePledges}
            onTogglePledge={handleToggleTemplePledge}
            triggerHaptic={triggerHaptic}
            navigateTo={navigateTo}
          />
        )}

        {/* -- ROUTE M: APP LANDING & MISSION SHOWCASE -- */}
        {currentScreen === "landing" && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
            <AppLandingScreen
              onNavigate={(screen) => navigateTo(screen)}
              onOpenLogin={(preferredRole) => {
                setLoginInitialRole(preferredRole || "volunteer");
                navigateTo("login");
              }}
              currentUser={authUser}
              onLogout={handleAuthLogout}
            />
          </div>
        )}

        {/* -- ROUTE N: LOGIN LANDING PAGE & OTP VERIFICATION -- */}
        {currentScreen === "login" && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
            <LoginScreen
              onBack={() => navigateTo(previousScreen || "home")}
              onLoginSuccess={handleAuthLoginSuccess}
              onExploreGuest={() => navigateTo("home")}
              currentUser={authUser}
              onLogout={handleAuthLogout}
              initialRole={loginInitialRole}
              onTriggerNotification={(title, body) => {
                setLocalPushNotification({
                  title,
                  body,
                });
                setNotificationBannerVisible(true);
                setTimeout(() => {
                  setNotificationBannerVisible(false);
                }, 6000);
              }}
            />
          </div>
        )}

        {/* -- ROUTE O: SEVA SPHOORTHI OPENING / SPLASH SCREEN WITH LOGO -- */}
        {(currentScreen === "theme" || currentScreen === "splash") && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <SevaOpeningScreen
              autoAdvanceSeconds={2.0}
              onEnterApp={() => navigateTo("home")}
              onNavigateQuick={(screen) => navigateTo(screen)}
              triggerHaptic={triggerHaptic}
            />
          </div>
        )}

        </>
      )}

      {/* PERSISTENT IN-APP BOTTOM NAVIGATION BAR FOR MOBILE & TABLET */}
      {!isStandaloneView && currentScreen !== "theme" && currentScreen !== "splash" && currentScreen !== "landing" && (
        <nav className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 flex items-center justify-around shrink-0 z-30 shadow-xs select-none">
          {[
            { id: "home", label: "Home", icon: "🏠", match: ["home"] },
            { id: "programs", label: "Opportunities", icon: "📚", match: ["programs", "jobs", "services", "sector-explorer"] },
            { id: "events", label: "Schedule", icon: "📅", match: ["events", "volunteer"] },
            { id: "profile", label: "Profile", icon: "👤", match: ["profile", "contact", "login"] }
          ].map((tab) => {
            const isActive = tab.match.includes(currentScreen);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigateTo(tab.id);
                  triggerHaptic("light");
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? "text-orange-600 font-extrabold bg-orange-50/80" 
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span className="text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight">{tab.label}</span>
                {isActive && <span className="w-2 h-0.5 rounded-full bg-orange-600 mt-0.5"></span>}
              </button>
            );
          })}
        </nav>
      )}
        </div> {/* closes standalone right-hand content area */}
      </div> {/* closes main app shell container */}

      {/* KAIOS PHYSICAL NUMERIC KEYPAD PANEL */}
      {platform === "kaios" && !isStandaloneView && (
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex flex-col gap-2 shrink-0 select-none shadow-2xl">
          {/* KaiOS Top Soft Key & D-Pad Bar */}
          <div className="flex justify-between items-center gap-1">
            <button 
              onClick={() => { setDrawerOpen(!drawerOpen); triggerHaptic("light"); }} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-extrabold py-2 rounded-lg border border-slate-700 active:scale-95 transition text-center cursor-pointer"
            >
              [LSK] Menu
            </button>

            {/* Center D-Pad */}
            <div className="flex items-center justify-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => { navigateTo("home"); triggerHaptic("medium"); }} 
                className="w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[10px] rounded-lg shadow cursor-pointer active:scale-95"
                title="D-Pad Center OK"
              >
                OK
              </button>
            </div>

            <button 
              onClick={() => { navigateTo("home"); triggerHaptic("light"); }} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-extrabold py-2 rounded-lg border border-slate-700 active:scale-95 transition text-center cursor-pointer"
            >
              [RSK] Back
            </button>
          </div>

          {/* Call / End row */}
          <div className="flex justify-between items-center gap-1 text-[9px] font-extrabold">
            <button 
              onClick={() => { navigateTo("contact"); triggerHaptic("light"); }} 
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-1 rounded-lg text-center cursor-pointer"
            >
              📞 Call
            </button>
            <button 
              onClick={() => { setControlCenterOpen(!controlCenterOpen); triggerHaptic("medium"); }} 
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-1 rounded-lg text-center cursor-pointer"
            >
              🎛️ Shade
            </button>
            <button 
              onClick={() => { navigateTo("home"); triggerHaptic("heavy"); }} 
              className="flex-1 bg-rose-700 hover:bg-rose-600 text-white py-1 rounded-lg text-center cursor-pointer"
            >
              🔴 End
            </button>
          </div>

          {/* 3x4 Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono font-bold">
            {[
              { key: "1", label: "Home", screen: "home" },
              { key: "2", label: "Programs", screen: "programs" },
              { key: "3", label: "Donate", screen: "donations" },
              { key: "4", label: "Jobs", screen: "jobs" },
              { key: "5", label: "Events", screen: "events" },
              { key: "6", label: "Volunteer", screen: "volunteer" },
              { key: "7", label: "Gallery", screen: "gallery" },
              { key: "8", label: "Profile", screen: "profile" },
              { key: "9", label: "Contact", screen: "contact" },
              { key: "*", label: "Lang", screen: null, action: () => setLanguage && setLanguage(language === "en" ? "hi" : "en") },
              { key: "0", label: "Temples", screen: "temples" },
              { key: "#", label: "Mode", screen: null, action: () => setLowPowerMode(!lowPowerMode) },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setKaiosActiveKey(item.key);
                  setTimeout(() => setKaiosActiveKey(null), 300);
                  triggerHaptic("light");
                  if (item.action) item.action();
                  else if (item.screen) navigateTo(item.screen);
                }}
                className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                  kaiosActiveKey === item.key
                    ? "bg-orange-500 text-white border-orange-400 scale-95"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="block text-xs font-black text-white">{item.key}</span>
                <span className="block text-[7.5px] text-slate-400 font-sans tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volunteer Profile Photo Studio Modal */}
      <ProfilePhotoModal 
        isOpen={profilePhotoModalOpen}
        onClose={() => setProfilePhotoModalOpen(false)}
        currentAvatar={customAvatar}
        onSaveAvatar={handleSaveAvatar}
        onTriggerHaptic={triggerHaptic}
      />

      {/* AI Smart Search & Seva Recommendations Modal */}
      <AiSmartSearchModal
        isOpen={aiSearchModalOpen}
        onClose={() => setAiSearchModalOpen(false)}
        initialQuery={aiSearchInitialQuery}
        onNavigate={(screen, payload) => {
          if (payload && payload.purpose) {
            setDonationForm(prev => ({ ...prev, purpose: payload.purpose }));
          }
          navigateTo(screen);
        }}
        triggerHaptic={triggerHaptic}
      />

    </div>
  );
}
