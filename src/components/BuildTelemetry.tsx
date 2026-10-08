import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area, ComposedChart, ReferenceLine 
} from "recharts";
import { 
  Cpu, TrendingDown, Zap, BarChart3, RotateCcw, AlertTriangle, 
  Sparkles, CheckCircle, RefreshCcw, Gauge, Server, Activity, ShieldCheck,
  Smartphone, BarChart2, CheckCircle2, ShieldAlert, WifiOff
} from "lucide-react";
import { AppStep } from "../types";

interface BuildTelemetryProps {
  compiledStep: number;
  activeStep: number;
  onRefreshCache?: () => void;
  appSteps: AppStep[];
  phoneScreen?: string;
  isOfflineMode?: boolean;
  setIsOfflineMode?: (val: boolean) => void;
}

interface StepBuildMetric {
  stepId: number;
  shortName: string;
  durationFresh: number; // Duration without cache (seconds)
  durationCached: number; // Duration with cache (seconds)
  currentDuration: number; // Current recorded build time
  bundleSize: number; // Compiled bundle segment size in KB
  cacheHit: boolean; // Whether the last build hit the cache
  complStatus: "Compiled" | "Cached" | "Active" | "Pending";
}

const screenMetricsMap: Record<string, { cpu: number; ram: number; bottleneck: string; fix: string; level: "Good" | "Warning" | "Critical"; color: string }> = {
  home: { 
    cpu: 14, 
    ram: 142, 
    bottleneck: "Optimized drawing bounds. Low overhead.", 
    fix: "No action required.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  "sector-explorer": { 
    cpu: 45, 
    ram: 198, 
    bottleneck: "Dynamic calculations & heavy layout nodes.", 
    fix: "Offload math calculations to background threads.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    level: "Warning"
  },
  about: { 
    cpu: 16, 
    ram: 135, 
    bottleneck: "Static text layouts. Idle system state.", 
    fix: "Render complete.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  programs: { 
    cpu: 32, 
    ram: 168, 
    bottleneck: "Unoptimized coverage covers decoding overhead.", 
    fix: "Set cacheWidth/cacheHeight parameters on CachedNetworkImages.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    level: "Warning"
  },
  services: { 
    cpu: 22, 
    ram: 155, 
    bottleneck: "Static service directory view.", 
    fix: "Compile elements as const widget definitions.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  jobs: { 
    cpu: 18, 
    ram: 148, 
    bottleneck: "Idle careers list views.", 
    fix: "No action required.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  events: { 
    cpu: 26, 
    ram: 152, 
    bottleneck: "Parsing large calendar arrays.", 
    fix: "Memoize calendar filters where applicable.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  volunteer: { 
    cpu: 40, 
    ram: 182, 
    bottleneck: "Form inputs state reconciliation loop.", 
    fix: "Debounce interactive form validator rules.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    level: "Warning"
  },
  donations: { 
    cpu: 58, 
    ram: 224, 
    bottleneck: "Secure platform bindings, Razorpay overlay setup.", 
    fix: "Dispose of Native Payment instances on screen transitions.",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse",
    level: "Critical"
  },
  gallery: { 
    cpu: 74, 
    ram: 282, 
    bottleneck: "Unoptimized photos grid garbage collector stress.", 
    fix: "Wrap cells in HTML/Flutter RepaintBoundary and optimize resolution.",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse",
    level: "Critical"
  },
  contact: { 
    cpu: 42, 
    ram: 194, 
    bottleneck: "Native Map iframe view rendering & geolocation loop.", 
    fix: "Increase GPS poll delay, pause GPS when in backdrop.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    level: "Warning"
  },
  faq: { 
    cpu: 15, 
    ram: 132, 
    bottleneck: "Accordion expansion layout redrawing calculations.", 
    fix: "No action required.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  },
  profile: { 
    cpu: 22, 
    ram: 144, 
    bottleneck: "Local auth credentials caching.", 
    fix: "No action required.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    level: "Good"
  }
};

export default function BuildTelemetry({ 
  compiledStep, 
  activeStep, 
  appSteps, 
  phoneScreen = "home",
  isOfflineMode = false,
  setIsOfflineMode 
}: BuildTelemetryProps) {
  // Hardcoded historical baseline/estimated profile for each of the 10 steps
  const initialBaseMetrics: StepBuildMetric[] = [
    { stepId: 1, shortName: "Bootstrap", durationFresh: 5.2, durationCached: 0.4, currentDuration: 0.4, bundleSize: 850, cacheHit: true, complStatus: "Cached" },
    { stepId: 2, shortName: "Home Feed", durationFresh: 4.1, durationCached: 0.3, currentDuration: 0.3, bundleSize: 340, cacheHit: true, complStatus: "Cached" },
    { stepId: 3, shortName: "Programs", durationFresh: 3.8, durationCached: 0.3, currentDuration: 0.3, bundleSize: 420, cacheHit: true, complStatus: "Cached" },
    { stepId: 4, shortName: "Gallery Grid", durationFresh: 2.9, durationCached: 0.2, currentDuration: 0.2, bundleSize: 310, cacheHit: true, complStatus: "Cached" },
    { stepId: 5, shortName: "Volunteer", durationFresh: 4.5, durationCached: 0.4, currentDuration: 0.4, bundleSize: 580, cacheHit: true, complStatus: "Cached" },
    { stepId: 6, shortName: "Donations", durationFresh: 4.9, durationCached: 0.5, currentDuration: 0.5, bundleSize: 920, cacheHit: true, complStatus: "Cached" },
    { stepId: 7, shortName: "Contact Map", durationFresh: 3.4, durationCached: 0.3, currentDuration: 0.3, bundleSize: 450, cacheHit: true, complStatus: "Cached" },
    { stepId: 8, shortName: "Profiles/Cloud", durationFresh: 5.8, durationCached: 0.6, currentDuration: 0.6, bundleSize: 1120, cacheHit: true, complStatus: "Cached" },
    { stepId: 9, shortName: "Careers Hub", durationFresh: 4.0, durationCached: 0.3, currentDuration: 0, bundleSize: 480, cacheHit: false, complStatus: "Pending" },
    { stepId: 10, shortName: "Services Dir", durationFresh: 3.1, durationCached: 0.2, currentDuration: 0, bundleSize: 360, cacheHit: false, complStatus: "Pending" },
  ];

  const [metrics, setMetrics] = useState<StepBuildMetric[]>(initialBaseMetrics);
  const [cacheBusted, setCacheBusted] = useState<boolean>(false);
  const [isProfiling, setIsProfiling] = useState<boolean>(false);
  const [profileResult, setProfileResult] = useState<string | null>(null);
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");

  // Flutter DevTools performance simulator hooks
  const [renderingEngine, setRenderingEngine] = useState<"Skia" | "Impeller">("Impeller");
  const [isRecordingDevTools, setIsRecordingDevTools] = useState<boolean>(false);
  const [devToolsRecordCount, setDevToolsRecordCount] = useState<number>(1);

  // Live CPU and RAM calculations linked with Simulator Navigation state
  const currentScreenKey = phoneScreen || "home";
  const metricsConfig = screenMetricsMap[currentScreenKey] || screenMetricsMap.home;

  const [liveCpu, setLiveCpu] = useState<number>(metricsConfig.cpu);
  const [liveRam, setLiveRam] = useState<number>(metricsConfig.ram);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);

  // Update telemetry history loop linked to the active screen
  useEffect(() => {
    setLiveCpu(metricsConfig.cpu);
    setLiveRam(metricsConfig.ram);

    // Bootstrap initial history block relative to selected screen base metric
    const now = new Date();
    const initialHistory = Array.from({ length: 15 }).map((_, i) => {
      const pastTime = new Date(now.getTime() - (15 - i) * 1500);
      const randomOffsetCpu = (Math.random() - 0.5) * 4;
      const randomOffsetRam = (Math.random() - 0.5) * 3;
      return {
        time: pastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.max(5, Math.min(100, Math.round(metricsConfig.cpu + randomOffsetCpu))),
        ram: Math.max(50, Math.min(512, Math.round(metricsConfig.ram + randomOffsetRam))),
      };
    });
    setTelemetryHistory(initialHistory);

    const interval = setInterval(() => {
      // Jitter updates for natural movement feel
      setLiveCpu(prev => {
        const jitter = (Math.random() - 0.5) * 5;
        return Math.max(5, Math.min(98, Math.round(metricsConfig.cpu + jitter)));
      });

      setLiveRam(prev => {
        const jitter = (Math.random() - 0.5) * 4;
        return Math.max(50, Math.min(512, Math.round(metricsConfig.ram + jitter)));
      });

      setTelemetryHistory(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const randomOffsetCpu = (Math.random() - 0.5) * 5;
        const randomOffsetRam = (Math.random() - 0.5) * 4;
        const newPoint = {
          time: nextTime,
          cpu: Math.max(5, Math.min(100, Math.round(metricsConfig.cpu + randomOffsetCpu))),
          ram: Math.max(50, Math.min(512, Math.round(metricsConfig.ram + randomOffsetRam))),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [currentScreenKey, metricsConfig.cpu, metricsConfig.ram]);

  // Rich diagnostic logging database for each compilation step to filter
  const getFullBuildLogs = (): string[] => {
    const logs: string[] = [
      "[INFO] [System] Initiating compilation daemon with key ID: 83c9290e",
      "[INFO] [Compiler] Resolving flutter package dependencies...",
      "[SUCCESS] package:flutter/material.dart resolved successfully in 21ms",
      "[SUCCESS] package:google_fonts/google_fonts.dart cached",
      "[SUCCESS] package:recharts/recharts.dart mapped and linked to HTML overlay",
      "[INFO] [Gradle] Launching build task ':app:compileReleaseJavaWithJavac'...",
      "[INFO] [D8] Processing class files into DEX byte code configuration...",
      "[INFO] [Optimizer] Tree-shaking unused widgets and layout fragments...",
    ];

    // Append logs depending on compiled step
    if (compiledStep >= 1) {
      logs.push(
        "[INFO] [Step 1] Bootstrapping ngo app core architecture: pubspec.yaml & main.dart.",
        "[INFO] [Step 1] Target platforms configured successfully: Android API 34, iOS 17.2.",
        "[SUCCESS] Step 1 build verification complete. Created 2 assets, compiled bundle footprint: 850 KB."
      );
    }
    if (compiledStep >= 2) {
      logs.push(
        "[INFO] [Step 2] Processing local mock feed schema inside NGO home dashboard module.",
        "[INFO] [Step 2] Binding state hooks and scroll acceleration mechanisms.",
        "[SUCCESS] Step 2 compiled with optimal draw time frame latency: 4.8ms."
      );
    }
    if (compiledStep >= 3) {
      logs.push(
        "[INFO] [Step 3] Importing program definitions. Validating images load referrerPolicy.",
        "[INFO] [Step 3] Static lists optimizations triggered via functional component memoization.",
        "[SUCCESS] Step 3 static cards loaded successfully."
      );
    }
    if (compiledStep >= 4) {
      logs.push(
        "[INFO] [Step 4] Configuring Flutter Grid elements and full screen detail pages.",
        "[SUCCESS] Step 4 assets tree-shaken. Compact dynamic sizes matching verified resolution parameters."
      );
    }
    if (compiledStep >= 5) {
      logs.push(
        "[INFO] [Step 5] Mapping volunteer database layout components.",
        "[SUCCESS] Step 5 form controls validated successfully with no unhandled null safety exceptions."
      );
    }
    if (compiledStep >= 6) {
      logs.push(
        "[INFO] [Step 6] Compiling secure checkout screens, donation inputs and integration proxies.",
        "[SUCCESS] Step 6 secure key variables verified and loaded server-side only."
      );
    }
    if (compiledStep >= 7) {
      logs.push(
        "[INFO] [Step 7] Adding maps platform support and container resizers.",
        "[SUCCESS] Step 7 geographic address resolution verified."
      );
    }
    if (compiledStep >= 8) {
      logs.push(
        "[INFO] [Step 8] Resolving auth context and deep cloud profiles schema integration.",
        "[SUCCESS] Step 8 integration complete. All target files matching workspace configurations are healthy."
      );
    }

    if (cacheBusted) {
      logs.unshift(
        "[WARNING] [Cache] Dependency cache has been explicitly purged. Performing exhaustive cold build compilation.",
        "[INFO] [Cache] Warning: Build times will increase temporarily without warm daemon caches."
      );
    }

    if (profileResult) {
      logs.push(
        "[INFO] [Profiler] Benchmark triggered. Compiling analysis metrics...",
        `[SUCCESS] [Profiler] ${profileResult.split("\n")[0]}`,
        ...profileResult.split("\n").slice(1).map(line => `[METRIC] ${line}`)
      );
    }

    if (renderingEngine === "Impeller") {
      logs.push(
        "[INFO] [DevTools] Impeller rendering pipeline active. Vector shader compile caches are pre-warmed.",
        "[SUCCESS] [DevTools] Zero frame rendering jank spikes captured (average startup draw latency: 6.2ms / 144 FPS limit)."
      );
    } else {
      logs.push(
        "[WARNING] [DevTools] Laggy Skia pipeline detected. Run-time OpenGL/Vulkan shader compiles triggered on UI thread.",
        "[WARNING] [DevTools] Frame compilation jank detected during startup (Frame 2 spiked to 38.2ms, breaking 16.6ms frame budget!)."
      );
    }

    return logs;
  };

  const filteredLogs = getFullBuildLogs().filter(log => 
    log.toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  // Sync state with global compilation updates
  useEffect(() => {
    setMetrics(prev => {
      return prev.map(m => {
        let status: "Compiled" | "Cached" | "Active" | "Pending" = "Pending";
        let isCached = !cacheBusted;
        let duration = 0;

        if (m.stepId < compiledStep) {
          status = isCached ? "Cached" : "Compiled";
          duration = isCached ? m.durationCached : m.durationFresh;
        } else if (m.stepId === compiledStep) {
          status = "Compiled"; // Newly Compiled step!
          // Give it a slightly dynamic touch
          duration = isCached ? m.durationCached + 0.1 : m.durationFresh;
        } else if (m.stepId === activeStep) {
          status = "Active";
          duration = 0;
        }

        return {
          ...m,
          complStatus: status,
          cacheHit: isCached && m.stepId <= compiledStep,
          currentDuration: duration
        };
      });
    });
  }, [compiledStep, activeStep, cacheBusted]);

  // Handle Cache purging
  const handlePurgeCache = () => {
    setCacheBusted(true);
    // Automatically restore cache mechanism after 8 seconds (recompile simulation)
    setTimeout(() => {
      setCacheBusted(false);
    }, 7000);
  };

  const handleWarmRestore = () => {
    setCacheBusted(false);
  };

  // Run profiling benchmarking
  const triggerBenchmarkSuite = () => {
    setIsProfiling(true);
    setProfileResult(null);
    setTimeout(() => {
      setIsProfiling(false);
      const activeStats = metrics.filter(m => m.stepId <= compiledStep);
      const totalFreshTime = activeStats.reduce((acc, current) => acc + current.durationFresh, 0).toFixed(1);
      const totalCachedTime = activeStats.reduce((acc, current) => acc + current.currentDuration, 0).toFixed(1);
      const spaceSaved = activeStats.reduce((acc, c) => acc + c.bundleSize, 0);

      setProfileResult(
        `SUCCESS: Flutter APK / iOS compilation verified.\n` +
        `• Active footprint: ${(spaceSaved / 1024).toFixed(2)} MB\n` +
        `• Baseline cold compile: ${totalFreshTime}s\n` +
        `• Optimized cached run: ${totalCachedTime}s (${((1 - (Number(totalCachedTime) / Number(totalFreshTime))) * 100).toFixed(0)}% acceleration)\n` +
        `• Gradle / Xcode target: Build is pristine. 0 compilation errors detected.`
      );
    }, 1500);
  };

  // Prepopulate stats calculations
  const compiledSegments = metrics.filter(m => m.stepId <= compiledStep);
  const totalBundleSize = compiledSegments.reduce((acc, m) => acc + m.bundleSize, 0);
  const avgBuildTime = compiledSegments.length > 0 
    ? (compiledSegments.reduce((acc, m) => acc + m.currentDuration, 0) / compiledSegments.length).toFixed(2)
    : "0.00";
  const overallCacheRatio = compiledStep > 0
    ? ((compiledSegments.filter(m => m.cacheHit).length / compiledSegments.length) * 100).toFixed(0)
    : "100";

  // Recharts custom tooltips
  const formatDurationTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload as StepBuildMetric;
      return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-[10.5px] space-y-1 shadow-lg font-sans">
          <p className="font-extrabold text-[11px] text-amber-400">Step {data.stepId}: {data.shortName}</p>
          <p className="font-semibold text-slate-300">Compilation Duration: <span className="text-white font-mono">{data.currentDuration > 0 ? `${data.currentDuration}s` : "Uncompiled"}</span></p>
          <p className="text-slate-400">Fresh Baseline time: <span className="font-mono">{data.durationFresh}s</span></p>
          <p className="text-slate-400">Status: <span className={`font-bold ${data.complStatus === "Cached" ? "text-teal-400" : data.complStatus === "Compiled" ? "text-sky-400" : "text-amber-400"}`}>{data.complStatus}</span></p>
        </div>
      );
    }
    return null;
  };

  const formatBundleTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload as StepBuildMetric;
      return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-[10.5px] space-y-1 shadow-lg font-sans">
          <p className="font-extrabold text-[11px] text-teal-400">Step {data.stepId}: {data.shortName}</p>
          <p className="font-semibold text-slate-300">Bundle Size impact: <span className="text-white font-mono">{data.bundleSize} KB</span></p>
          <p className="text-slate-400">Percentage weight: <span className="font-mono">{((data.bundleSize / (totalBundleSize || 1)) * 100).toFixed(1)}%</span></p>
        </div>
      );
    }
    return null;
  };

  const formatBenchmarkTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload as StepBuildMetric;
      return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-[10.5px] space-y-1.5 shadow-lg font-sans">
          <p className="font-extrabold text-[11px] text-pink-400">Step {data.stepId}: {data.shortName}</p>
          <div className="space-y-0.5 text-slate-300">
            <p>Active Build: <span className="text-white font-mono font-bold">{data.currentDuration > 0 ? `${data.currentDuration}s` : "Uncompiled"}</span></p>
            <p>Cold Benchmark: <span className="text-rose-400 font-mono font-bold">{data.durationFresh}s</span></p>
            <p>Cached Benchmark: <span className="text-teal-400 font-mono font-bold">{data.durationCached}s</span></p>
          </div>
          <p className="text-[9px] text-slate-500 italic mt-1 border-t border-white/5 pt-1">
            Status: {data.complStatus}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col gap-4 text-slate-300 bg-[#161616] p-4.5 rounded-[24px] overflow-y-auto select-none min-h-0">
      
      {/* Simulation & Controls Bar */}
      <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[12px] text-white uppercase tracking-wider">DevTools Network Simulator</h4>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5 leading-none">
              Inject intentional network degradation to test offline fallbacks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-3.5 py-1.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
            Offline Simulation
          </span>
          <button
            type="button"
            onClick={() => {
              if (setIsOfflineMode) {
                setIsOfflineMode(!isOfflineMode);
              }
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOfflineMode ? "bg-red-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                isOfflineMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-[10px] font-mono font-black uppercase ${isOfflineMode ? "text-red-400 animate-pulse" : "text-zinc-500"}`}>
            {isOfflineMode ? "ACTIVE (Offline)" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Top Banner Dashboard metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0">
        <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-xl text-orange-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500">Avg Build Duration</span>
            <p className="font-mono font-extrabold text-[15px] text-slate-100 leading-tight">
              {avgBuildTime}s
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
          <div className="bg-teal-500/10 p-2 rounded-xl text-teal-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500">Cache Hit Ratio</span>
            <p className="font-mono font-extrabold text-[15px] text-white leading-tight">
              {overallCacheRatio}%
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500">Active APK Size</span>
            <p className="font-mono font-extrabold text-[15px] text-indigo-300 leading-tight">
              {(totalBundleSize / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-white/5 p-3 rounded-2xl flex items-center gap-3">
          <div className="bg-sky-500/10 p-2 rounded-xl text-sky-400">
            <Activity className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500">Current Phase</span>
            <p className="font-extrabold text-xs text-sky-300 leading-tight truncate max-w-[95px]">
              {compiledStep < appSteps.length ? `Phase ${compiledStep + 1} Prep` : "Deployment Ready"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        
        {/* CHART 1: Build compilation tracking */}
        <div className="bg-[#1e1e1e] p-3.5 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <BarChart3 className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="leading-none">
                <h5 className="font-bold text-[11px] text-slate-200 uppercase tracking-wide">Segment compiles Duration</h5>
                <span className="text-[9px] text-slate-500 font-semibold uppercase font-mono tracking-wider">Dynamic compiler feedback loop</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mr-1.5">Build (s)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Baseline</span>
            </div>
          </div>

          <div className="w-full h-[180px] bg-[#161616]/40 p-1.5 rounded-xl border border-white/[0.04]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#333333" strokeDasharray="2 2" vertical={false} />
                <XAxis dataKey="shortName" stroke="#666666" fontSize={8.5} tickLine={false} />
                <YAxis stroke="#666666" fontSize={8} tickLine={false} unit="s" />
                <Tooltip content={formatDurationTooltip} cursor={{ fill: '#ffffff06' }} />
                <Bar dataKey="currentDuration" fill="#f97316" radius={[4, 4, 0, 0]} barSize={10} />
                <Line type="monotone" dataKey="durationFresh" stroke="#4b5563" strokeWidth={1} dot={{ r: 1.5 }} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="durationCached" fill="#14b8a610" stroke="#14b8a6" strokeWidth={1} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Build bundle sizes tracker */}
        <div className="bg-[#1e1e1e] p-3.5 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <TrendingDown className="w-4 h-4 text-teal-400 shrink-0" />
              <div className="leading-none">
                <h5 className="font-bold text-[11px] text-slate-200 uppercase tracking-wide">Bundle Footprint tracking</h5>
                <span className="text-[9px] text-slate-500 font-semibold uppercase font-mono tracking-wider">Feature compilation allocation size</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Growth (KB)</span>
            </div>
          </div>

          <div className="w-full h-[180px] bg-[#161616]/40 p-1.5 rounded-xl border border-white/[0.04]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#333333" strokeDasharray="2 2" vertical={false} />
                <XAxis dataKey="shortName" stroke="#666666" fontSize={8.5} tickLine={false} />
                <YAxis stroke="#666666" fontSize={8} tickLine={false} />
                <Tooltip content={formatBundleTooltip} />
                <Area type="monotone" dataKey="bundleSize" stroke="#14b8a6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSize)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHART 3: Benchmark Performance Comparison */}
      <div className="bg-[#1e1e1e] p-4 border border-white/5 rounded-2xl space-y-3.5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Cpu className="w-4 h-4 text-pink-400 shrink-0" />
            <div className="leading-none">
              <h5 className="font-bold text-[11px] text-slate-200 uppercase tracking-wide">Historical Benchmark Comparison</h5>
              <span className="text-[9px] text-slate-500 font-semibold uppercase font-mono tracking-wider">Comparing active compilation durations with standard cold & cached baselines</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[8.5px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
              <span>Current Compile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
              <span>Cold Benchmark</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-500"></span>
              <span>Cached Benchmark</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[190px] bg-[#161616]/40 p-1.5 rounded-xl border border-white/[0.04]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#333333" strokeDasharray="2 2" vertical={false} />
              <XAxis dataKey="shortName" stroke="#666666" fontSize={8} tickLine={false} />
              <YAxis stroke="#666666" fontSize={8} tickLine={false} unit="s" />
              <Tooltip content={formatBenchmarkTooltip} cursor={{ fill: '#ffffff04' }} />
              <Bar dataKey="currentDuration" fill="#f97316" radius={[2, 2, 0, 0]} />
              <Bar dataKey="durationFresh" fill="#f43f5e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="durationCached" fill="#14b8a6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= REAL-TIME DEVICE TELEMETRY: SIMULATED RAM & CPU DASHBOARD ================= */}
      <div className="bg-[#1e1e1e] p-4.5 border border-white/5 rounded-2xl space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 uppercase tracking-widest flex items-center gap-2">
                Live Simulator Device Telemetry
                <span className="flex items-center gap-1 text-[8.5px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/20 font-extrabold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                  Active Synced
                </span>
              </h5>
              <p className="text-[10px] text-slate-500 font-medium font-sans mt-0.5">
                Real-time memory heap allocations and thread draw speed linked with active simulator page transitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#161616] px-2.5 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto shrink-0">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Active Screen:</span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-tight">
              /{currentScreenKey}
            </span>
          </div>
        </div>

        {/* Dynamic CPU & Memory Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* CPU Stats */}
          <div className="bg-[#161616] p-3 rounded-xl border border-white/[0.03] space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-pink-500" /> Simulated CPU Overhead
              </span>
              <span className="font-mono text-slate-200 font-black text-xs">
                {liveCpu}%
              </span>
            </div>
            
            {/* Custom styled progress rail */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  liveCpu > 70 ? "bg-red-500" : liveCpu > 35 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${liveCpu}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[8px] text-slate-500 font-extrabold uppercase">
              <span>0% Main Idle</span>
              <span>100% Core Blocked</span>
            </div>
          </div>

          {/* RAM Stats */}
          <div className="bg-[#161616] p-3 rounded-xl border border-white/[0.03] space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-indigo-400" /> Simulated RAM Allocated
              </span>
              <span className="font-mono text-slate-200 font-black text-xs">
                {liveRam} MB <span className="text-slate-500 text-[10px] font-normal">/ 512MB RAM</span>
              </span>
            </div>

            {/* Custom styled progress rail */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  liveRam > 220 ? "bg-red-500" : liveRam > 160 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${(liveRam / 512) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[8px] text-slate-500 font-extrabold uppercase">
              <span>0 MB VM</span>
              <span>512 MB Heap Limit</span>
            </div>
          </div>
        </div>

        {/* Live Sparkline History Area graph */}
        <div className="bg-[#161616]/40 p-3 rounded-xl border border-white/[0.03] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-400 animate-pulse" /> Live Metrics History Sparkline
            </span>
            <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-wide">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                <span>CPU (%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Memory (MB)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[150px] scrollbar-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="liveCpuColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="liveRamColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#262626" strokeDasharray="1 3" vertical={false} />
                <XAxis dataKey="time" stroke="#444444" fontSize={7} tickLine={false} />
                <YAxis stroke="#444444" fontSize={7} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1c1c", border: "1px solid #333", color: "#fff", fontSize: "10px", borderRadius: "8px" }}
                  itemStyle={{ paddingBottom: "1px" }}
                />
                <Area type="monotone" name="CPU Core Overhead" dataKey="cpu" stroke="#ec4899" fillOpacity={1} fill="url(#liveCpuColor)" strokeWidth={1.5} />
                <Area type="monotone" name="Memory Footprint" dataKey="ram" stroke="#818cf8" fillOpacity={1} fill="url(#liveRamColor)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time bottleneck diagnostics critical analysis alert */}
        <div className={`p-3.5 rounded-xl border text-[10.5px] font-sans flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${metricsConfig.color}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border ${
                metricsConfig.level === "Critical" ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                metricsConfig.level === "Warning" ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : 
                "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}>
                {metricsConfig.level} Severity Bottleneck
              </span>
              <span className="font-bold text-slate-200">
                Diagnostic Critique:
              </span>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed font-sans mt-0.5 max-w-[500px]">
              {metricsConfig.bottleneck}
            </p>
          </div>

          <div className="shrink-0 bg-black/20 p-2.5 rounded-xl border border-white/5 space-y-0.5 w-full md:w-auto md:max-w-[280px]">
            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider block">Suggested Fix Recommendation</span>
            <p className="text-slate-400 italic font-mono text-[9px] leading-snug">
              {metricsConfig.fix}
            </p>
          </div>
        </div>
      </div>

      {/* ================= EXTRA: FLUTTER DEVTOOLS PERFORMANCE TIMELINE GRAPH ================= */}
      <div className="bg-[#1e1e1e] p-4 border border-white/5 rounded-2xl space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-sm">
              🛠️
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                Flutter DevTools: Performance Core <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Connected</span>
              </h5>
              <p className="text-[10px] text-slate-500 font-medium font-sans">
                Visualize startup sequence frame render times & CPU overhead in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Engine:</span>
            <div className="bg-[#161616] p-1 rounded-xl border border-white/5 flex gap-1 text-[9.5px] font-black">
              <button
                type="button"
                onClick={() => setRenderingEngine("Impeller")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${renderingEngine === "Impeller" ? "bg-emerald-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"}`}
              >
                Impeller (Precompiled)
              </button>
              <button
                type="button"
                onClick={() => setRenderingEngine("Skia")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${renderingEngine === "Skia" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"}`}
              >
                Skia (Legacy JIT)
              </button>
            </div>
            <button
              onClick={() => {
                setIsRecordingDevTools(true);
                setTimeout(() => {
                  setIsRecordingDevTools(false);
                  setDevToolsRecordCount(prev => prev + 1);
                }, 1000);
              }}
              disabled={isRecordingDevTools}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 font-extrabold text-white text-[10px] px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              {isRecordingDevTools ? (
                <>
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  <span>Profiling...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3" />
                  <span>Trigger Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-[#161616] p-2.5 rounded-xl border border-white/[0.03]">
            <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Avg Frame Time</span>
            <span className={`font-mono text-xs font-black block mt-0.5 ${renderingEngine === "Impeller" ? "text-emerald-400" : "text-amber-400"}`}>
              {renderingEngine === "Impeller" ? "6.2 ms" : "18.5 ms"}
            </span>
            <span className="text-[7.5px] text-slate-500 font-semibold block leading-tight mt-0.5 font-sans">
              {renderingEngine === "Impeller" ? "✔ Fluid 144 FPS limit" : "⚠️ Frame budget overrun"}
            </span>
          </div>
          <div className="bg-[#161616] p-2.5 rounded-xl border border-white/[0.03]">
            <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Peak Startup Jank</span>
            <span className={`font-mono text-xs font-black block mt-0.5 ${renderingEngine === "Impeller" ? "text-slate-100" : "text-rose-400 animate-pulse"}`}>
              {renderingEngine === "Impeller" ? "9.5 ms" : "38.2 ms"}
            </span>
            <span className="text-[7.5px] text-slate-500 font-semibold block leading-tight mt-0.5 font-sans">
              {renderingEngine === "Impeller" ? "✔ 0 jank spikes" : "❌ Shader compile spike"}
            </span>
          </div>
          <div className="bg-[#161616] p-2.5 rounded-xl border border-white/[0.03]">
            <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Peak CPU Load</span>
            <span className="font-mono text-xs font-black text-slate-100 block mt-0.5">
              {renderingEngine === "Impeller" ? "65 %" : "96 %"}
            </span>
            <span className="text-[7.5px] text-slate-500 font-semibold block leading-tight mt-0.5 font-sans">
              During engine bootstrap
            </span>
          </div>
          <div className="bg-[#161616] p-2.5 rounded-xl border border-white/[0.03]">
            <span className="text-[8.5px] uppercase text-slate-500 font-bold block">Pipeline Optimization</span>
            <span className="font-mono text-xs font-black text-slate-100 block mt-0.5">
              {renderingEngine === "Impeller" ? "Pre-Compiled AOT" : "OpenGL JIT"}
            </span>
            <span className="text-[7.5px] text-teal-400 font-bold block leading-tight uppercase mt-0.5 font-sans">
              {renderingEngine === "Impeller" ? "Metal/Vulkan pipeline" : "Runtime Shader compiles"}
            </span>
          </div>
        </div>

        {/* DevTools Timeline Recharts Chart */}
        <div className="w-full h-[220px] bg-[#161616]/40 p-2.5 rounded-xl border border-white/[0.04] scrollbar-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={
                renderingEngine === "Impeller"
                  ? [
                      { name: "F1: Engine Init", uiFrame: 8.2, raster: 4.1, cpu: 60 },
                      { name: "F2: MaterialApp", uiFrame: 9.5, raster: 4.8, cpu: 65 },
                      { name: "F3: Auth Bind", uiFrame: 7.1, raster: 3.2, cpu: 40 },
                      { name: "F4: Home Screen", uiFrame: 6.8, raster: 2.9, cpu: 32 },
                      { name: "F5: Image Cache", uiFrame: 8.2, raster: 4.0, cpu: 45 },
                      { name: "F6: Font Render", uiFrame: 5.5, raster: 2.1, cpu: 22 },
                      { name: "F7: Ready State", uiFrame: 4.2, raster: 1.8, cpu: 15 },
                      { name: "F8: Fluid Draw", uiFrame: 3.8, raster: 1.5, cpu: 10 },
                    ]
                  : [
                      { name: "F1: Engine Init", uiFrame: 12.4, raster: 8.2, cpu: 75 },
                      { name: "F2: Shaders Compile", uiFrame: 38.2, raster: 28.5, cpu: 96 },
                      { name: "F3: MaterialApp", uiFrame: 18.5, raster: 11.2, cpu: 82 },
                      { name: "F4: Auth Bind", uiFrame: 14.8, raster: 6.5, cpu: 65 },
                      { name: "F5: Home Screen", uiFrame: 11.2, raster: 4.8, cpu: 48 },
                      { name: "F6: Image Cache", uiFrame: 16.9, raster: 12.4, cpu: 74 },
                      { name: "F7: Font Render", uiFrame: 8.4, raster: 3.5, cpu: 35 },
                      { name: "F8: Ready State", uiFrame: 6.1, raster: 2.2, cpu: 18 },
                    ]
              }
              margin={{ top: 15, right: -15, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUiFrame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={renderingEngine === "Impeller" ? "#10b981" : "#f59e0b"} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={renderingEngine === "Impeller" ? "#10b981" : "#f59e0b"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#333333" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" stroke="#777777" fontSize={8} tickLine={false} />
              <YAxis yAxisId="left" stroke="#777777" fontSize={8} tickLine={false} unit="ms" />
              <YAxis yAxisId="right" orientation="right" stroke="#777777" fontSize={8} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", color: "#fff", fontSize: "10.5px", fontFamily: "sans-serif", borderRadius: "10px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "8.5px", textTransform: "uppercase", paddingBottom: "10px" }} />
              
              {/* Jank indicator limit line at 16.6ms */}
              <ReferenceLine yAxisId="left" y={16.6} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "60FPS Jank Limit (16.6ms)", fill: "#ef4444", fontSize: 7, position: "top" }} />

              {/* Charts */}
              <Area yAxisId="left" type="monotone" name="UI Render Time (ms)" dataKey="uiFrame" fill="url(#colorUiFrame)" stroke={renderingEngine === "Impeller" ? "#10b981" : "#f59e0b"} strokeWidth={2} />
              <Line yAxisId="left" type="monotone" name="Raster Thread (ms)" dataKey="raster" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line yAxisId="right" type="monotone" name="CPU Core Overhead (%)" dataKey="cpu" stroke="#ec4899" strokeWidth={1.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[9.5px] text-slate-500 font-medium flex-wrap flex items-center justify-between bg-[#161616]/40 px-3 py-1.5 rounded-xl border border-white/[0.03] gap-2">
          <span className="font-sans">💡 UI Thread handles Dart code layouts. Raster Thread handles Impeller drawing commands.</span>
          <span className="text-[8.5px] text-indigo-400 font-bold uppercase font-sans">DevTools SDK 3.2.0</span>
        </div>
      </div>

      {/* Control Actions & Optimizer Log Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 min-h-0">
        
        {/* Actions panel */}
        <div className="bg-[#1e1e1e] p-4 border border-white/5 rounded-2xl flex flex-col justify-between gap-3 min-h-[160px]">
          <div>
            <h5 className="font-bold text-[11.5px] text-slate-100 flex items-center gap-1 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-orange-500" /> Profiler Suite Control
            </h5>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Directly interact with compiler flags to simulate cache busts or evaluate optimization constraints under warm versus cold parameters.
            </p>
          </div>

          <div className="flex gap-2 text-xs flex-wrap">
            {cacheBusted ? (
              <button 
                onClick={handleWarmRestore}
                className="flex-1 min-w-[120px] bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-400 font-extrabold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Enable Caching Loop
              </button>
            ) : (
              <button 
                onClick={handlePurgeCache}
                className="flex-1 min-w-[120px] bg-[#242424] hover:bg-[#323232] border border-white/5 text-rose-400 font-extrabold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Purge Cache (Cold Build)
              </button>
            )}

            <button 
              onClick={triggerBenchmarkSuite}
              disabled={isProfiling}
              className="flex-1 min-w-[120px] bg-orange-500 hover:bg-orange-600 font-extrabold text-white px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-40"
            >
              {isProfiling ? (
                <>
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing SDKs...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Run Profiler Benchmark</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[9.5px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Target Build System: Gradle 8.4 Daemon Cache hits are automated on successive runs.</span>
          </div>
        </div>

        {/* Dynamic Telemetry Log Console (Fills based on Profiler Suite) */}
        <div className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[160px] font-mono shadow-inner text-[10px] leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 mb-2 gap-2">
            <span className="text-[8.5px] font-extrabold text-slate-500 tracking-wider flex items-center gap-1 uppercase">
              <Server className="w-3 h-3 text-orange-400" /> Build Profiling Console
            </span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Filter build logs..."
                  className="bg-white/5 border border-white/10 text-white rounded px-2 py-0.5 text-[9px] w-32 focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-slate-500 font-sans"
                />
                {logSearchQuery && (
                  <button 
                    onClick={() => setLogSearchQuery("")}
                    className="absolute right-1 text-slate-400 hover:text-white font-sans text-xs"
                    style={{ top: "1px" }}
                  >
                    ×
                  </button>
                )}
              </div>
              <span className="text-[7.5px] font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[140px] space-y-0.5 pr-1 text-slate-300 font-mono text-[9px] min-h-[90px]">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => {
                let logColor = "text-slate-300";
                if (log.includes("[SUCCESS]")) logColor = "text-teal-400 font-semibold";
                else if (log.includes("[WARNING]")) logColor = "text-amber-400 font-semibold";
                else if (log.includes("[METRIC]")) logColor = "text-indigo-300";
                else if (log.includes("[INFO]")) logColor = "text-slate-400";

                return (
                  <div key={idx} className={`${logColor} py-0.5 hover:bg-white/[0.02] rounded px-1 transition duration-150`}>
                    {log}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 py-4 italic font-sans text-[10px]">
                No logs matching your filter "{logSearchQuery}"
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-1.5 mt-1.5 text-[8.5px] text-slate-600 flex justify-between uppercase font-bold">
            <span>Env: Dart 3.2.0 stable / Flutter 3.16</span>
            <span>Diagnostics status: Ready</span>
          </div>
        </div>

      </div>

    </div>
  );
}
