import React, { useState } from "react";
import { 
  Globe, Languages, FileCode, CheckCircle, Copy, Check, 
  HelpCircle, BookOpen, Settings, Play, ArrowRight, Sparkles, Smile
} from "lucide-react";

interface LocalizationModuleProps {
  appLanguage: "en" | "hi";
  setAppLanguage: (lang: "en" | "hi") => void;
}

export default function LocalizationModule({ appLanguage, setAppLanguage }: LocalizationModuleProps) {
  const [activeConfigTab, setActiveConfigTab] = useState<"pubspec" | "l10n" | "main">("pubspec");
  const [activeArbTab, setActiveArbTab] = useState<"en" | "hi">("en");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable translations database state so users can actually modify keys on-the-fly and see simulation updates!
  const [enTranslations, setEnTranslations] = useState({
    appTitle: "SevaSphoorthi",
    welcomeHeader: "Welcome to SevaSphoorthi",
    programSection: "Active Welfare Campaigns",
    sponsorButton: "Sponsor Meal/Kit Now",
    volunteerButton: "Join as Active Volunteer",
    successMessage: "Registration complete. Dhanyavad!"
  });

  const [hiTranslations, setHiTranslations] = useState({
    appTitle: "सेवा स्फूर्ति",
    welcomeHeader: "सेवा स्फूर्ति में आपका स्वागत है",
    programSection: "सक्रिय कल्याणकारी अभियान",
    sponsorButton: "अभी भोजन/किट प्रायोजित करें",
    volunteerButton: "सक्रिय स्वयंसेवक के रूप में शामिल हों",
    successMessage: "पंजीकरण सफल रहा। धन्यवाद!"
  });

  const handleCopyText = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Pubspec code string
  const pubspecCode = `dependencies:
  flutter:
    sdk: flutter
  flutter_localizations: # Add this line
    sdk: flutter        # Add this line
  intl: ^0.18.1         # Add this line

flutter:
  generate: true        # Required to auto-generate AppLocalizations files`;

  // l10n.yaml code string
  const l10nYamlCode = `arb-dir: lib/l10n
template-arb-file: app_en.arb
output-class: AppLocalizations
nullable-locale: false`;

  // main.dart localization config
  const mainDartL10nCode = `import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart'; // generated import

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SevaSphoorthi',
      // Register localizations delegates
      localizationsDelegates: const [
        AppLocalizations.delegate, // Generated delegate
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // Define supported languages
      supportedLocales: const [
        Locale('en'), // English
        Locale('hi'), // Hindi (हिन्दी)
      ],
      home: const HomeScreen(),
    );
  }
}`;

  // Helper code to map ARB files live
  const getArbJson = (lang: "en" | "hi") => {
    const dataset = lang === "en" ? enTranslations : hiTranslations;
    const descriptions = {
      appTitle: "The official name of the application displayed in launchers and headers.",
      welcomeHeader: "Headline text celebrating and welcoming user interaction on home feed.",
      programSection: "Header of secondary program lists tracking active child/meal support initiatives.",
      sponsorButton: "Call to action label triggering secure Razorpay transaction overlays.",
      volunteerButton: "Submission trigger pushing user contact variables to database proxy APIs.",
      successMessage: "Confirmation toast displaying gratitude after database transacts successfully."
    };

    const obj: Record<string, any> = {};
    Object.entries(dataset).forEach(([key, val]) => {
      obj[key] = val;
      obj[`@${key}`] = {
        description: descriptions[key as keyof typeof descriptions] || "No description provided."
      };
    });

    return JSON.stringify(obj, null, 2);
  };

  const handleTranslationChange = (key: string, lang: "en" | "hi", val: string) => {
    if (lang === "en") {
      setEnTranslations(prev => ({ ...prev, [key]: val }));
    } else {
      setHiTranslations(prev => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div className="flex-1 bg-white rounded-3xl border border-orange-100 p-5 flex flex-col gap-4 overflow-y-auto shadow-sm">
      
      {/* 1. Header Hero Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-orange-100 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-orange-500 animate-spin" style={{ animationDuration: '6s' }} /> Flutter Localization Studio
          </span>
          <h4 className="text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
            🌍 i18n Accessibility: <span className="text-orange-600 font-bold">English & Hindi support</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Understand how to broaden the NGO's app coverage using Dart Application Resource Bundles (<code>.arb</code>) with structured Hindi & English variables.
          </p>
        </div>

        {/* Dynamic Sandbox Sync indicator */}
        <div className="bg-orange-50 border border-orange-100 px-3 py-2 rounded-2xl flex items-center gap-2">
          <Languages className="w-4 h-4 text-orange-500" />
          <div className="text-left leading-none">
            <span className="text-[9px] text-slate-400 font-semibold block uppercase">Active Simulator Language</span>
            <div className="flex items-center gap-1.5 mt-1 font-black text-xs text-slate-800">
              <button 
                onClick={() => setAppLanguage("en")}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${appLanguage === "en" ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
              >
                EN
              </button>
              <button 
                onClick={() => setAppLanguage("hi")}
                className={`px-2 py-0.5 rounded cursor-pointer transition ${appLanguage === "hi" ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Educational Pipeline Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-left">
          <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold rounded-full px-2 py-0.5 inline-block">Step 1</span>
          <h5 className="font-extrabold text-[11.5px] text-slate-800 leading-none">Assemble ARB Files</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
            Declare localization keys in JSON-like Application Resource Bundles inside <code>lib/l10n/app_en.arb</code> and <code>app_hi.arb</code>.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-left">
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold rounded-full px-2 py-0.5 inline-block">Step 2</span>
          <h5 className="font-extrabold text-[11.5px] text-slate-800 leading-none">Configure Compiler Settings</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
            Declare the <code>l10n.yaml</code> config file and enable output generator hooks under `pubspec.yaml` dependencies.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-left">
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold rounded-full px-2 py-0.5 inline-block">Step 3</span>
          <h5 className="font-extrabold text-[11.5px] text-slate-800 leading-none">Declare MaterialApp Delegates</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
            Mount the auto-generated <code>AppLocalizations.delegate</code> parameters in the main flutter widget tree.
          </p>
        </div>
      </div>

      {/* 3. Side-by-Side Dual panel: Interactive ARB Editor & Flutter Code configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PANEL A: LIVE ACTIVE DICTIONARY ARB TRANSLATOR */}
        <div className="border border-orange-100 rounded-2xl p-4 space-y-3 flex flex-col justify-between text-left bg-orange-50/10">
          <div>
            <div className="flex justify-between items-center bg-orange-50 p-1 rounded-xl mb-2.5">
              <span className="font-extrabold text-[11px] text-orange-700 uppercase tracking-wider pl-2 flex items-center gap-1.5 font-sans">
                📖 Interactive ARB Translation Dictionary
              </span>
              <div className="flex gap-1 text-[9.5px] font-black">
                <button
                  type="button"
                  onClick={() => setActiveArbTab("en")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${activeArbTab === "en" ? "bg-orange-500 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                >
                  English (app_en.arb)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArbTab("hi")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${activeArbTab === "hi" ? "bg-orange-505 bg-orange-500 text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                >
                  हिन्दी (app_hi.arb)
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
              Test on-the-fly variations below! Editing any value changes the runtime text variables bound dynamically within our live mock smartphone device.
            </p>
          </div>

          {/* Dictionary translation rows with textareas to live edit */}
          <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
            {Object.keys(enTranslations).map((itemKey) => {
              const itemVal = activeArbTab === "en" ? enTranslations[itemKey as keyof typeof enTranslations] : hiTranslations[itemKey as keyof typeof hiTranslations];
              return (
                <div key={itemKey} className="bg-white border rounded-xl p-2.5 space-y-1 hover:border-orange-200 transition">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-orange-600 font-extrabold">"{itemKey}"</span>
                    <span className="text-slate-400 font-semibold italic text-[9px]">String key</span>
                  </div>
                  <input
                    type="text"
                    value={itemVal}
                    onChange={(e) => handleTranslationChange(itemKey, activeArbTab, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                  />
                  <span className="text-[8.5px] text-slate-400 block italic leading-tight pt-0.5">
                    {itemKey === "appTitle" && "Application header branding across app views"}
                    {itemKey === "welcomeHeader" && "Central welcome prompt on mobile dashboard screen"}
                    {itemKey === "programSection" && "Title of the active charity programs list"}
                    {itemKey === "sponsorButton" && "Call-to-action sponsor campaign checkout buttons"}
                    {itemKey === "volunteerButton" && "Form submit helper on signup features screen"}
                    {itemKey === "successMessage" && "Alert toast displaying after sending volunteer coordinates"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Compiled ARB JSON block view */}
          <div className="mt-1">
            <div className="flex justify-between items-center border-b pb-1 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Compiled Translation Manifest</span>
              <button
                onClick={() => handleCopyText(getArbJson(activeArbTab), `arb_${activeArbTab}`)}
                className="text-[10px] text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === `arb_${activeArbTab}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON manifest</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-indigo-300 font-mono text-[9px] rounded-xl overflow-x-auto max-h-[140px] leading-snug">
              {getArbJson(activeArbTab)}
            </pre>
          </div>
        </div>

        {/* PANEL B: COMPILE OPTIONS & SOURCE ENVIRONMENT CODES */}
        <div className="border border-slate-100 rounded-2xl p-4 space-y-3.5 flex flex-col justify-between text-left bg-slate-50/20">
          <div>
            <div className="flex items-center gap-1.5 border-b pb-3.5">
              <Settings className="w-4 h-4 text-indigo-500" />
              <div className="leading-none">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wide font-sans">Localization Build Settings</h5>
                <span className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Flutter Native SDK Variables</span>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-500 leading-normal mt-2">
              Select one of the configurations below to inspect the actual Dart setup code required inside your Flutter workspace layout.
            </p>
          </div>

          {/* Tab buttons to switch codes */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveConfigTab("pubspec")}
              className={`flex-1 py-2 rounded-xl text-center font-extrabold text-[10px] transition border cursor-pointer ${activeConfigTab === "pubspec" ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm" : "bg-white text-slate-500 border-transparent hover:bg-slate-50"}`}
            >
              1. pubspec.yaml
            </button>
            <button
              onClick={() => setActiveConfigTab("l10n")}
              className={`flex-1 py-2 rounded-xl text-center font-extrabold text-[10px] transition border cursor-pointer ${activeConfigTab === "l10n" ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm" : "bg-white text-slate-500 border-transparent hover:bg-slate-50"}`}
            >
              2. l10n.yaml
            </button>
            <button
              onClick={() => setActiveConfigTab("main")}
              className={`flex-1 py-2 rounded-xl text-center font-extrabold text-[10px] transition border cursor-pointer ${activeConfigTab === "main" ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm" : "bg-white text-slate-500 border-transparent hover:bg-slate-50"}`}
            >
              3. lib/main.dart
            </button>
          </div>

          {/* Dynamic editor render area */}
          <div className="flex-grow flex flex-col bg-[#1a1a1a] rounded-2xl p-3.5 relative shadow-inner">
            <div className="flex justify-between items-center text-[9.5px] border-b border-white/5 pb-1.5 mb-2.5">
              <span className="font-mono text-slate-400 font-semibold tracking-wider">
                {activeConfigTab === "pubspec" && "/pubspec.yaml"}
                {activeConfigTab === "l10n" && "/l10n.yaml"}
                {activeConfigTab === "main" && "/lib/main.dart"}
              </span>
              <button
                onClick={() => {
                  let str = "";
                  if (activeConfigTab === "pubspec") str = pubspecCode;
                  else if (activeConfigTab === "l10n") str = l10nYamlCode;
                  else str = mainDartL10nCode;
                  handleCopyText(str, activeConfigTab);
                }}
                className="text-slate-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer font-sans"
              >
                {copiedKey === activeConfigTab ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-left font-mono text-[10px] text-slate-300 max-h-[190px] overflow-y-auto whitespace-pre scrollbar-thin leading-normal">
              {activeConfigTab === "pubspec" && pubspecCode}
              {activeConfigTab === "l10n" && l10nYamlCode}
              {activeConfigTab === "main" && mainDartL10nCode}
            </pre>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-2.5 border border-indigo-100 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[10px] text-indigo-900 leading-snug">
              <strong>Interactive Guide hint:</strong> Once configured, run <code>flutter gen-l10n</code> (or trigger code generation automatically). Retrieve localized string values inside widgets using: <code>AppLocalizations.of(context)!.welcomeHeader</code>.
            </div>
          </div>
        </div>

      </div>

      {/* 4. Practical Translation Output Card */}
      <div className="border border-indigo-100 rounded-[22px] p-4 bg-indigo-50/20 text-left flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 text-white p-2.5 rounded-2xl shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h5 className="font-extrabold text-[11.5px] text-indigo-950 uppercase tracking-wide font-sans">Interactive Translation Testbench Output</h5>
            <p className="text-[10px] text-indigo-700 leading-relaxed font-sans">
              Currently compiling and testing translations: <strong>{appLanguage === "en" ? "English (EN)" : "Hindi (HI - हिन्दी)"}</strong>
            </p>
            <div className="flex gap-2.5 mt-2.5 flex-wrap">
              <div className="bg-white border rounded px-2.5 py-1 text-[10.5px]">
                <span className="text-slate-400 block font-mono text-[8px] tracking-tight">App Interface Header</span>
                <span className="font-extrabold text-slate-800">
                  {appLanguage === "en" ? enTranslations.appTitle : hiTranslations.appTitle}
                </span>
              </div>
              <div className="bg-white border rounded px-2.5 py-1 text-[10.5px]">
                <span className="text-slate-400 block font-mono text-[8px] tracking-tight">Main Welcome Prompt</span>
                <span className="font-extrabold text-slate-800">
                  {appLanguage === "en" ? enTranslations.welcomeHeader : hiTranslations.welcomeHeader}
                </span>
              </div>
              <div className="bg-white border rounded px-2.5 py-1 text-[10.5px]">
                <span className="text-slate-400 block font-mono text-[8px] tracking-tight">Donate CTA Title</span>
                <span className="font-extrabold text-slate-800 font-sans">
                  {appLanguage === "en" ? enTranslations.sponsorButton : hiTranslations.sponsorButton}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center">
          <button
            onClick={() => setAppLanguage(appLanguage === "en" ? "hi" : "en")}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs px-4 py-2.5 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer animate-pulse-slow"
          >
            <Languages className="w-4 h-4" />
            <span>Switch UI Lang ({appLanguage === "en" ? "हिन्दी" : "English"})</span>
          </button>
        </div>
      </div>

    </div>
  );
}
