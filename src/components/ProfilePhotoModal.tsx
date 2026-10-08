import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, 
  Check, X, RefreshCw, ZoomIn, ZoomOut, RotateCw, Sparkles, 
  AlertCircle, CheckCircle2, User, Sliders
} from "lucide-react";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onSaveAvatar: (avatarUrl: string | null) => void;
  onTriggerHaptic?: (style: "light" | "medium" | "heavy" | "success" | "warning") => void;
}

const PRESET_AVATARS = [
  {
    id: "preset-1",
    name: "Aarav (Volunteer Lead)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
  },
  {
    id: "preset-2",
    name: "Pooja (Vidya Educator)",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400"
  },
  {
    id: "preset-3",
    name: "Dr. Rohan (Vaidya Doctor)",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400"
  },
  {
    id: "preset-4",
    name: "Ananya (Community Seva)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
  },
  {
    id: "preset-5",
    name: "Vikram (Eco Coordinator)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400"
  },
  {
    id: "preset-6",
    name: "Meera (Youth Volunteer)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"
  },
  {
    id: "preset-7",
    name: "Rajesh (Camp Coordinator)",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
  },
  {
    id: "preset-8",
    name: "Kavita (Nutrition Aide)",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400"
  }
];

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  onTriggerHaptic = () => {}
}: ProfilePhotoModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "presets" | "url">("upload");
  const [previewImage, setPreviewImage] = useState<string | null>(currentAvatar);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [filter, setFilter] = useState<"none" | "warm" | "vibrant" | "mono">("none");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Camera stream refs & states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraStreaming, setCameraStreaming] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewImage(currentAvatar);
      setZoom(1);
      setRotation(0);
      setFilter("none");
      setErrorMessage(null);
      setSuccessMessage(null);
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatar]);

  // Start real browser webcam when switching to camera tab
  useEffect(() => {
    if (activeTab === "camera" && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraStreaming(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in this browser environment.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user"
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStreaming(true);
      }
    } catch (err: any) {
      console.warn("Real webcam stream failed, fallback available:", err);
      setCameraError("Unable to access local camera (permission or hardware). You can use device upload or choose a preset.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStreaming(false);
  };

  const captureCameraSnapshot = () => {
    if (videoRef.current && cameraStreaming) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Handle mirror effect for selfie camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewImage(dataUrl);
        stopCamera();
        setActiveTab("upload");
        onTriggerHaptic("success");
        setSuccessMessage("Photo captured! Click 'Save Profile Photo' to apply.");
      }
    } else {
      // Fallback simulated camera photo
      const randomPreset = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      setPreviewImage(randomPreset.url);
      setActiveTab("upload");
      onTriggerHaptic("medium");
      setSuccessMessage("Sample volunteer selfie loaded!");
    }
  };

  // Helper to read and compress image file to standard base64 data URL
  const processImageFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, WebP, GIF).");
      onTriggerHaptic("warning");
      return;
    }

    // Limit check (e.g. 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Image file is too large (max 15MB). Please choose a smaller image.");
      onTriggerHaptic("warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Compress and resize via offscreen HTML5 canvas to optimize storage
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
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewImage(compressedDataUrl);
          onTriggerHaptic("success");
          setSuccessMessage("Image loaded successfully! Ready to apply.");
        } else {
          setPreviewImage(result);
        }
      };
      img.onerror = () => {
        setErrorMessage("Failed to process image file.");
      };
      img.src = result;
    };
    reader.onerror = () => {
      setErrorMessage("Could not read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) {
      setErrorMessage("Please enter an image URL.");
      return;
    }
    if (!customUrl.startsWith("http://") && !customUrl.startsWith("https://") && !customUrl.startsWith("data:image/")) {
      setErrorMessage("Image URL must start with https:// or http://");
      return;
    }

    setPreviewImage(customUrl.trim());
    setActiveTab("upload");
    onTriggerHaptic("success");
    setSuccessMessage("Image link loaded! Click Save to apply.");
  };

  const handleSave = () => {
    onTriggerHaptic("heavy");
    onSaveAvatar(previewImage);
    onClose();
  };

  const handleRemove = () => {
    onTriggerHaptic("medium");
    setPreviewImage(null);
    onSaveAvatar(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg text-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Volunteer Profile Picture
              </h3>
              <p className="text-xs text-slate-400">
                Upload custom photo, snap with camera, or pick an avatar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 shrink-0 overflow-x-auto text-xs">
          {[
            { id: "upload", label: "Upload File", icon: Upload },
            { id: "camera", label: "Live Camera", icon: Camera },
            { id: "presets", label: "Avatars", icon: User },
            { id: "url", label: "Image Link", icon: LinkIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrorMessage(null);
                  onTriggerHaptic("light");
                }}
                className={`px-3.5 py-2 rounded-t-xl transition flex items-center gap-2 cursor-pointer font-bold whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-orange-400 border-t-2 border-orange-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* NOTIFICATIONS / ERROR MESSAGES */}
        {errorMessage && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 px-4 py-2 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 px-4 py-2 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          
          {/* TAB 1: UPLOAD LOCAL FILE / PREVIEW */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              
              {/* Profile Avatar Live Circle Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="relative group">
                  <div 
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl bg-slate-800 flex items-center justify-center transition-all ${
                      filter === "warm" ? "sepia-[0.35] saturate-[1.2]" :
                      filter === "vibrant" ? "contrast-[1.15] saturate-[1.3]" :
                      filter === "mono" ? "grayscale" : ""
                    }`}
                    style={{
                      transform: `rotate(${rotation}deg)`
                    }}
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Avatar Preview" 
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{ transform: `scale(${zoom})` }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-3xl font-black text-slate-400">SV</span>
                    )}
                  </div>

                  {previewImage && (
                    <button
                      onClick={() => setPreviewImage(null)}
                      title="Clear photo"
                      className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-full shadow-lg transition cursor-pointer border border-slate-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-bold text-slate-400 mt-2">
                  {previewImage ? "Profile Avatar Preview" : "No Photo Selected (Default Initials)"}
                </span>

                {/* Adjustments toolbar if an image is loaded */}
                {previewImage && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800 w-full justify-center flex-wrap text-xs">
                    <button
                      onClick={() => setZoom(prev => Math.max(0.8, prev - 0.1))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

                    <button
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold flex items-center gap-1"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

                    {/* Filter Presets */}
                    <div className="flex gap-1">
                      {(["none", "warm", "vibrant", "mono"] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`text-[9px] px-2 py-1 rounded-md uppercase font-bold border transition ${
                            filter === f 
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/40" 
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drag & Drop / Click Upload Box */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml" 
                className="hidden" 
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
                    : "border-slate-700 hover:border-orange-500/60 bg-slate-900/40 hover:bg-slate-900/80"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/25 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    Click to browse or Drag & Drop Image
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports PNG, JPG, JPEG, WebP, GIF (up to 15MB)
                  </p>
                </div>

                <span className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition shadow-md mt-1 inline-flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE WEBCAM CAMERA CAPTURE */}
          {activeTab === "camera" && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-xs mx-auto border-2 border-orange-500/40 flex items-center justify-center shadow-xl">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    cameraStreaming ? "block" : "hidden"
                  }`}
                />

                {/* Centering Face Grid */}
                {cameraStreaming && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full border-2 border-dashed border-orange-400/60 animate-pulse"></div>
                    <div className="absolute top-3 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-bold text-orange-400">
                      Align Face in Circle
                    </div>
                  </div>
                )}

                {/* Fallback View when camera streaming is unavailable */}
                {!cameraStreaming && (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center mx-auto text-2xl border border-slate-700">
                      📷
                    </div>
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      {cameraError || "Initializing web camera stream..."}
                    </p>
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={startCamera}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Shutter & Actions */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={captureCameraSnapshot}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{cameraStreaming ? "Capture Live Photo" : "Use Sample Volunteer Photo"}</span>
                </button>
                <span className="text-[10px] text-slate-400">
                  Instant snapshot synced to local Seva profile ledger
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: CURATED PRESET AVATARS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 font-semibold block">
                Choose an official volunteer role avatar:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPreviewImage(preset.url);
                        onTriggerHaptic("light");
                        setSuccessMessage(`Selected ${preset.name}! Click Save to apply.`);
                      }}
                      className={`p-2 rounded-2xl border transition text-center flex flex-col items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-orange-500/20 border-orange-500 shadow-md ring-2 ring-orange-500/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 shadow-inner relative">
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/40 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <span className="text-[10.5px] font-bold text-slate-200 line-clamp-1 leading-tight">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT IMAGE URL */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Paste Online Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                  >
                    Load URL
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Tip: Supports any public direct image URL (HTTPS)
                </p>
              </div>

              {previewImage && (
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <img 
                    src={previewImage} 
                    alt="URL Preview" 
                    className="w-12 h-12 rounded-full object-cover border border-orange-500 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block">Loaded Image</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">Ready to save</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {currentAvatar && (
              <button
                onClick={handleRemove}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile Photo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
