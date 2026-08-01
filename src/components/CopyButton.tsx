import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "../lib/clipboard";
import { useToast } from "./Toast";
import { playSuccessSound } from "../lib/sounds";
import { trackEvent } from "../lib/analytics";
import { Language } from "../types";

interface CopyButtonProps {
  value: string;
  lang?: Language;
  label?: string;               // optional text label beside the icon
  toastTitle?: string;
  className?: string;
  iconClassName?: string;
  onCopied?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value, lang = "bn", label, toastTitle, className = "", iconClassName = "w-4 h-4", onCopied,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const isBn = lang === "bn";

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      playSuccessSound();
      trackEvent("copy_click", "Copy", value.slice(0, 40));
      showToast(
        toastTitle || (isBn ? "কপি হয়েছে!" : "Copied!"),
        (value.length <= 60 ? value : value.slice(0, 57) + "…"),
        "copied"
      );
      setTimeout(() => setCopied(false), 1800);
      onCopied?.();
    } else {
      showToast(isBn ? "কপি করা যায়নি" : "Copy failed", "", "warning");
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={isBn ? "কপি করুন" : "Copy"}
      className={className || "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"}
    >
      {copied ? <Check className={`${iconClassName} text-emerald-500`} /> : <Copy className={iconClassName} />}
      {label && <span>{copied ? (isBn ? "কপি হয়েছে" : "Copied") : label}</span>}
    </button>
  );
};
