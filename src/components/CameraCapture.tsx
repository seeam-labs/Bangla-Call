import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Check, Upload, ShieldCheck, Loader2, IdCard, UserRound } from "lucide-react";
import { Language } from "../types";
import { uploadImage } from "../lib/api";
import { useToast } from "./Toast";
import { playClickSound, playSuccessSound } from "../lib/sounds";

interface CameraCaptureProps {
  lang: Language;
  kind: "photo" | "nid";
  required?: boolean;
  onCaptured: (key: string | null) => void;
}

/** Live camera (selfie) + NID capture/upload → uploads to R2, returns the key. */
export const CameraCapture: React.FC<CameraCaptureProps> = ({ lang, kind, required, onCaptured }) => {
  const isBn = lang === "bn";
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [consent, setConsent] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSelfie = kind === "photo";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setError(null);
    playClickSound();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isSelfie ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      // attach after render
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); } });
    } catch (e) {
      setError(isBn ? "ক্যামেরা চালু করা যায়নি। অনুগ্রহ করে অনুমতি দিন বা আপলোড ব্যবহার করুন।" : "Could not access camera. Grant permission or use upload.");
    }
  };

  const capture = () => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 720, h = video.videoHeight || 960;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (isSelfie) { ctx.translate(w, 0); ctx.scale(-1, 1); } // un-mirror selfie
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (blob) { setPreview(URL.createObjectURL(blob)); doUpload(blob); }
    }, "image/jpeg", 0.85);
    stopCamera();
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { showToast(isBn ? "শুধু ছবি আপলোড করুন" : "Images only", "", "warning"); return; }
    setPreview(URL.createObjectURL(file));
    doUpload(file);
  };

  const doUpload = async (blob: Blob) => {
    setUploading(true);
    setError(null);
    try {
      const key = await uploadImage(kind, blob);
      setSavedKey(key);
      onCaptured(key);
      playSuccessSound();
      showToast(isBn ? "আপলোড সফল" : "Uploaded", isBn ? "ছবি নিরাপদে সংরক্ষিত হয়েছে" : "Saved securely", "success");
    } catch (e) {
      setError(isBn ? "আপলোড ব্যর্থ হয়েছে, আবার চেষ্টা করুন।" : "Upload failed, please retry.");
      onCaptured(null);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null); setSavedKey(null); setError(null); onCaptured(null); stopCamera();
  };

  const title = isSelfie
    ? (isBn ? "লাইভ ছবি (সেলফি)" : "Live Photo (Selfie)")
    : (isBn ? "জাতীয় পরিচয়পত্র (NID)" : "National ID (NID)");
  const Icon = isSelfie ? UserRound : IdCard;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelfie ? "bg-sky-100 text-sky-600 dark:bg-sky-500/20" : "bg-violet-100 text-violet-600 dark:bg-violet-500/20"}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{title}{required && <span className="text-rose-500"> *</span>}</span>
        </div>
        {savedKey && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><Check className="w-3.5 h-3.5" />{isBn ? "সংরক্ষিত" : "Saved"}</span>}
      </div>

      {!consent ? (
        <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-sky-600" />
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            {isBn
              ? "আমি সম্মতি দিচ্ছি যে যাচাইয়ের জন্য আমার ছবি/NID নিরাপদে সংরক্ষণ করা হবে।"
              : "I consent to my photo/NID being stored securely for verification."}
          </span>
        </label>
      ) : (
        <>
          <div className="relative rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 aspect-[4/3] flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="capture preview" className="w-full h-full object-cover" />
            ) : cameraOn ? (
              <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${isSelfie ? "-scale-x-100" : ""}`} />
            ) : (
              <div className="text-center text-slate-400 text-xs px-4">
                {isBn ? "ক্যামেরা চালু করুন অথবা ছবি আপলোড করুন" : "Start the camera or upload an image"}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}

          <div className="flex flex-wrap gap-2 mt-3">
            {!preview && !cameraOn && (
              <button type="button" onClick={startCamera} className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm active:scale-95 transition-all">
                <Camera className="w-4 h-4" />{isBn ? "ক্যামেরা" : "Camera"}
              </button>
            )}
            {cameraOn && (
              <button type="button" onClick={capture} className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm active:scale-95 transition-all">
                <Check className="w-4 h-4" />{isBn ? "ছবি তুলুন" : "Capture"}
              </button>
            )}
            {!preview && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm active:scale-95 transition-all">
                <Upload className="w-4 h-4" />{isBn ? "আপলোড" : "Upload"}
              </button>
            )}
            {preview && (
              <button type="button" onClick={reset} className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm active:scale-95 transition-all">
                <RefreshCw className="w-4 h-4" />{isBn ? "আবার" : "Retake"}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture={isSelfie ? "user" : "environment"} onChange={onPickFile} className="hidden" />
          </div>
        </>
      )}
    </div>
  );
};
