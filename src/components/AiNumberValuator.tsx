import { createPortal } from "react-dom";
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  Dices,
  Crown,
  Loader2,
  CheckCircle2,
  XCircle,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { OFFICIAL_INFO } from "../data/banglaCallData";
import { Language, NumberValuation } from "../types";
import { trackEvent } from "../lib/analytics";
import { useToast } from "./Toast";
import { NumberSimulator } from "./NumberSimulator";
import { CustomNumericKeypad } from "./CustomNumericKeypad";
import { ValuationResultModal } from "./ValuationResultModal";
import { FavoritesModal } from "./FavoritesModal";

import { BulkCheckModal } from "./BulkCheckModal";
import { HistoryModal } from "./HistoryModal";
import { GeneratorModal } from "./GeneratorModal";
import { SerialCheckModal } from "./SerialCheckModal";

import { History, ListChecks, Layers } from "lucide-react";
import { Heart } from "lucide-react";
import { AlertCircle } from "lucide-react";
import {
  playAvailableCongratulationSound,
  playUnavailableSadSound,
  playModalOpenSound,
} from "../lib/sounds";

interface AiNumberValuatorProps {
  lang: Language;
  onLockValuation: (valuation: NumberValuation) => void;
  initialNumber?: string;
}

export const AiNumberValuator: React.FC<AiNumberValuatorProps> = ({
  lang,
  onLockValuation,
  initialNumber = "",
}) => {
  const isBn = lang === "bn";
  const { showToast } = useToast();

  const [inputDigits, setInputDigits] = useState<string>(
    initialNumber ? initialNumber.replace(/\D/g, "").slice(-6) : "888999",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean | null | 'unknown'>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    if (inputDigits.length === 6) {
      checkAvailability();
    } else {
      setAvailabilityStatus(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when the typed digits change
  }, [inputDigits]);

  const checkAvailability = async () => {
    if (inputDigits.length !== 6) return;
    setIsCheckingAvailability(true);
    setAvailabilityStatus(null);
    let result: boolean | 'unknown' = 'unknown';
    try {
      const fullNumClean = `${OFFICIAL_INFO.prefix.replace(/\D/g, "")}${inputDigits}`;
      const res = await fetch('/api/number/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: fullNumClean }),
      });
      if (res.ok) {
        const data = await res.json();
        // Trust ONLY a real boolean from the Bangla Call API; otherwise "unknown".
        result = typeof data.available === 'boolean' ? data.available : 'unknown';
      }
    } catch (err) {
      result = 'unknown';
    } finally {
      setAvailabilityStatus(result);
      setIsCheckingAvailability(false);
      if (result === true) {
        playAvailableCongratulationSound();
      } else if (result === false) {
        playUnavailableSadSound();
      }
    }
  };
  const [valuation, setValuation] = useState<NumberValuation | null>(null);
  const [isSimulatorVisible, setIsSimulatorVisible] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [valuationModalOpen, setValuationModalOpen] = useState(false);
  
  
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHeartPulsing, setIsHeartPulsing] = useState(false);
  const [bulkCheckModalOpen, setBulkCheckModalOpen] = useState(false);
  const [serialCheckModalOpen, setSerialCheckModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<'random' | 'vip'>('random');


  useEffect(() => {
    try {
      const saved = localStorage.getItem("bangla_call_search_history");
      if (saved) setSearchHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("bangla_call_favs");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (numberToToggle: string) => {
    let updated;
    if (favorites.includes(numberToToggle)) {
      updated = favorites.filter((n) => n !== numberToToggle);
    } else {
      updated = [numberToToggle, ...favorites];
      setIsHeartPulsing(true);
      setTimeout(() => setIsHeartPulsing(false), 1500);
    }
    setFavorites(updated);
    localStorage.setItem("bangla_call_favs", JSON.stringify(updated));
  };

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(".keypad-portal") || target.id === "keypad-portal") {
        return;
      }
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowKeypad(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { number: string; type: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate categorized predictive suggestions based on input
    const generateSuggestions = async () => {
      if (inputDigits.length >= 1 && inputDigits.length < 6) {
        const patterns = {
          'VIP': ['777777', '888888', '999999', '111111', '000000', '789789', '987654'],
          'Business': ['102030', '505050', '909090', '100100', '200200', '000111', '112233'],
          'Easy to Remember': ['123456', '654321', '121212', '343434', '555666', '222444']
        };
        
        let suggested: { number: string; type: string }[] = [];
        
        Object.entries(patterns).forEach(([category, nums]) => {
          const matches = nums.filter(n => n.startsWith(inputDigits));
          if (matches.length > 0) {
            if (!suggested.find(s => s.number === matches[0])) {
               suggested.push({ number: matches[0], type: category });
            }
          }
        });
        
        if (suggested.length < 3) {
           const repeatChar = inputDigits[inputDigits.length - 1] || '0';
           const easyPattern1 = inputDigits.padEnd(6, repeatChar);
           if (!suggested.find(s => s.number === easyPattern1)) {
              suggested.push({ number: easyPattern1, type: 'Easy to Remember' });
           }
        }
        
        if (suggested.length < 3) {
           const remainingSlots = 6 - inputDigits.length;
           const repeatStr = inputDigits.substring(0, remainingSlots);
           const easyPattern2 = (inputDigits + repeatStr + repeatStr).substring(0, 6);
           if (!suggested.find(s => s.number === easyPattern2)) {
               suggested.push({ number: easyPattern2, type: 'Business' });
           }
        }
        
        suggested = suggested.slice(0, 3);
        
        try {
            const availableSuggestions = await Promise.all(
                suggested.map(async (s) => {
                    try {
                        const res = await fetch(`/api/number/check?q=${OFFICIAL_INFO.prefix.replace(/\D/g, "")}${s.number}`);
                        if (res.ok) {
                            const data = await res.json();
                            // Only surface numbers the API confirms are available.
                            return data.available === true ? s : null;
                        }
                        return null;
                    } catch(e) {
                        return null;
                    }
                })
            );
            
            const finalSuggestions = availableSuggestions.filter(Boolean) as { number: string; type: string }[];
            setSuggestions(finalSuggestions);
            setShowSuggestions(finalSuggestions.length > 0);
        } catch(e) {
            setSuggestions(suggested);
            setShowSuggestions(true);
        }

      } else {
        setShowSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
        generateSuggestions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [inputDigits]);

  const fullNumber = `${OFFICIAL_INFO.prefix}${inputDigits.padStart(6, "0")}`;

  const handleEvaluate = async (targetNum?: string) => {
    const numToEvaluate = targetNum || fullNumber;
    setIsLoading(true);
    setValuationModalOpen(true); // Open modal early to show checking state

    try {
      trackEvent("calc_use", "AI Number Valuation Requested", numToEvaluate);

      const aiRes = await fetch("/api/ai/evaluate-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: numToEvaluate, lang }),
      });

      if (aiRes.ok) {
        const contentType = aiRes.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data: NumberValuation = await aiRes.json();
          setValuation(data);

          setSearchHistory((prev) => {
            const newHistory = [numToEvaluate, ...prev.filter(n => n !== numToEvaluate)].slice(0, 50);
            localStorage.setItem("bangla_call_search_history", JSON.stringify(newHistory));
            return newHistory;
          });
          return;
        }
      }
      throw new Error("Received invalid or non-200 response from AI valuation");
    } catch (err) {
      console.warn("Using smart client-side valuation fallback:", err);
      const cleanNum = numToEvaluate.replace(/\D/g, "");
      const digits = cleanNum.slice(-6);
      const uniqueCount = new Set(digits.split("")).size;
      const isSequential = "0123456789876543210".includes(digits);
      const isAllSame = uniqueCount === 1;
      const isQuadSame = /(.)\1\1\1/.test(digits);

      let tierBn = "র্যান্ডম স্ট্যান্ডার্ড";
      let tierEn = "Random Standard";
      let recharge = 100;
      let score = 5;

      if (isAllSame || cleanNum.endsWith("777777") || cleanNum.endsWith("888888") || cleanNum.endsWith("999999")) {
        score = 10;
        tierBn = "VIP ডায়মوند রয়্যাল";
        tierEn = "VIP Diamond Royal";
        recharge = 500;
      } else if (isQuadSame || isSequential) {
        score = 8;
        tierBn = "ভিআইপি প্রিমিয়াম প্যাটার্ন";
        tierEn = "VIP Premium Pattern";
        recharge = 500;
      } else if (uniqueCount <= 3) {
        score = 7;
        tierBn = "ভিআইপি প্যাটার্ন";
        tierEn = "VIP Pattern";
        recharge = 500;
      }

      const bonus = recharge * 0.10;
      const totalBalance = recharge + bonus;

      const fallbackValuation: NumberValuation = {
        number: numToEvaluate,
        tierNameBn: tierBn,
        tierNameEn: tierEn,
        qualityScore: score,
        estimatedRechargeBdt: recharge,
        bonusBdt: bonus,
        totalUsableBalanceBdt: totalBalance,
        explanationBn: `বাংলা কল এআই প্যাটার্ন বিশ্লেষণ অনুযায়ী নম্বরটির মান ${tierBn}। কোনো অতিরিক্ত রেজিস্ট্রেশন ফি নেই (0 BDT)। 1ম রিচার্জ মাত্র ${recharge} BDT করলেই আজীবন একাউন্ট সক্রিয় এবং 10% বোনাস সহ মোট ${totalBalance} BDT ব্যালেন্স পাবেন।`,
        explanationEn: `Bangla Call AI evaluates this pattern as ${tierEn}. Zero connection fee (0 BDT). Activate your lifetime account with 1st recharge of ${recharge} BDT and get 10% bonus (${totalBalance} BDT total balance).`,
        isAiGenerated: false,
      };

      setValuation(fallbackValuation);

      setSearchHistory((prev) => {
        const newHistory = [numToEvaluate, ...prev.filter(n => n !== numToEvaluate)].slice(0, 50);
        localStorage.setItem("bangla_call_search_history", JSON.stringify(newHistory));
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isRegeneratingVip, setIsRegeneratingVip] = useState(false);

  const handleRegenerateVipNumber = async () => {
    if (isRegeneratingVip) return;
    setIsRegeneratingVip(true);

    const baseVipPool = [
      "777777", "888888", "999999", "111111", "000000", "222222", "333333", "444444", "555555", "666666",
      "123456", "654321", "789789", "123123", "456456", "000111", "112233", "555666", "786786", "007007",
      "101010", "121212", "505050", "990099", "222444", "900900", "800800", "700700", "100100", "200200",
      "300300", "500500", "000777", "000888", "000999", "111222", "333444", "555777", "777999", "888999",
      "999000", "111000", "000123", "000786", "000001", "000007", "000009", "222000", "333000", "555000"
    ];

    const extraPatterns: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d1 = Math.floor(Math.random() * 10);
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      extraPatterns.push(`${d1}${d1}${d1}${d2}${d2}${d2}`);
      extraPatterns.push(`${d1}${d2}${d1}${d2}${d1}${d2}`);
      extraPatterns.push(`${d1}${d2}${d3}${d1}${d2}${d3}`);
    }

    const pool = Array.from(new Set([...baseVipPool, ...extraPatterns])).sort(() => 0.5 - Math.random());
    let foundNumber: string | null = null;
    const prefix = OFFICIAL_INFO.prefix.replace(/\D/g, "");

    for (let i = 0; i < pool.length; i += 5) {
      const batch = pool.slice(i, i + 5);
      const results = await Promise.all(
        batch.map(async (num) => {
          try {
            // Always go through the Worker proxy (never amarip.net directly from the
            // browser: CSP/CORS blocks it). Accept ONLY a verified true.
            const res = await fetch(`/api/number/check?q=${prefix}${num}`);
            if (res.ok) {
              const data = await res.json();
              if (data.available === true) return num;
            }
          } catch (e) {
            // ignore
          }
          return null;
        })
      );

      foundNumber = results.find((n) => n !== null) || null;
      if (foundNumber) break;
    }

    if (foundNumber) {
      setInputDigits(foundNumber);
      setAvailabilityStatus(true);
      handleEvaluate(`${OFFICIAL_INFO.prefix}${foundNumber}`);
      showToast(
        isBn ? "এভেইলেবল VIP নম্বর পাওয়া গেছে!" : "Available VIP number generated!",
        `09649${foundNumber}`,
        "success"
      );
    } else {
      // Do NOT present an unverified number as available. Be honest instead.
      showToast(
        isBn ? "এই মুহূর্তে এভেইলেবল VIP নম্বর পাওয়া যায়নি" : "No available VIP number found right now",
        isBn ? "একটু পরে আবার চেষ্টা করুন" : "Please try again in a moment",
        "warning"
      );
    }

    setIsRegeneratingVip(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden text-slate-900 dark:text-white space-y-6">
      <NumberSimulator
        number={fullNumber}
        isVisible={isSimulatorVisible}
        lang={lang}
      />
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-500/20 to-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-brand-primary/20 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white border border-sky-300/40 text-xs font-black uppercase tracking-wider mb-2 shadow-md shadow-sky-500/25">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>
              {isBn
                ? "বাংলা কল এআই ভ্যালুয়েশন ইঞ্জিন"
                : "Bangla Call Smart Number Finder"}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
            {isBn
              ? "আপনার কাস্টম নম্বরের মান ও 1st রিচার্জ জানুন"
              : "Bangla Call AI Number Quality & First Recharge Estimator"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? "নম্বর কেনার কোনো ফি নেই (0 BDT)। বাংলা কল এআই প্যাটার্ন বিশ্লেষণ করে আপনার 1st রিচার্জ নির্ধারণ করবে (100 BDT অথবা 500 BDT)।"
              : "Zero activation fee. Bangla Call AI evaluates your pattern to set fair first recharge (100 or 500 BDT)."}
          </p>
        </div>
      </div>

      {/* Input Box Redesign */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative z-20">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isBn
              ? "পছন্দের 6 ডিজিট অথবা পূর্ণ নম্বর দিন"
              : "Enter 6 Custom Digits or Full Number"}
          </label>
          <button
            onClick={() => setFavoritesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors text-xs font-bold"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            {isBn ? "সংরক্ষিত নম্বর" : "Saved"} ({favorites.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
          <div
            className="relative w-full flex-1 flex flex-col"
            ref={containerRef}
          >
            <div className="relative w-full flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-200 dark:border-slate-800 px-4 py-4 sm:py-5 font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-sky-400 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all shadow-inner">
              <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none pr-1">
                {OFFICIAL_INFO.prefix}
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="none"
                value={inputDigits}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setInputDigits(val);
                  setValuation(null);
                }}
                onFocus={() => {
                  if (inputDigits.length >= 1 && inputDigits.length < 6)
                    setShowSuggestions(true);
                  setIsSimulatorVisible(true);
                  setShowKeypad(true);
                }}
                onClick={() => {
                  setIsSimulatorVisible(true);
                  setShowKeypad(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="888999"
                maxLength={6}
                className="w-full bg-transparent focus:outline-none text-slate-900 dark:text-white tracking-[0.2em]"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerateVipNumber();
                }}
                disabled={isRegeneratingVip}
                title={isBn ? "এভেইলেবল VIP নম্বর জেনারেট করুন" : "Generate Available VIP Number"}
                className="ml-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center gap-1.5 shrink-0 text-xs font-bold active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-amber-500 ${isRegeneratingVip ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">
                  {isRegeneratingVip ? (isBn ? "খোঁজা হচ্ছে..." : "Searching...") : (isBn ? "ভিআইপি জেনারেট" : "Regenerate VIP")}
                </span>
              </button>
            </div>

            {/* Predictive Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                >
                  <div className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    {isBn ? "সম্ভাব্য অপশন" : "Predictive Suggestions"}
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => {
                            setInputDigits(s.number);
                            setShowSuggestions(false);
                            handleEvaluate(
                              `${OFFICIAL_INFO.prefix}${s.number}`,
                            );
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-sky-900/20 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group"
                        >
                          <span className="font-mono text-lg text-slate-700 dark:text-slate-300 group-hover:text-brand-primary">
                            <span className="text-slate-400">
                              {OFFICIAL_INFO.prefix}
                            </span>
                            <span className="font-bold">{s.number}</span>
                          </span>
                          <span
                            className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md ${
                              s.type === "VIP"
                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : s.type === "Business"
                                ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400"
                                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {s.type}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Availability Status */}
            {inputDigits.length === 6 && (
              <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700/60 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  {isCheckingAvailability ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500">{isBn ? 'চেক করা হচ্ছে...' : 'Checking...'}</span>
                    </>
                  ) : availabilityStatus === true ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{isBn ? 'এভেইলেবল' : 'Available'}</span>
                    </>
                  ) : availabilityStatus === false ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{isBn ? 'বিক্রি হয়ে গেছে' : 'Sold Out'}</span>
                    </>
                  ) : availabilityStatus === 'unknown' ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{isBn ? 'যাচাই করা যায়নি — রিচেক করুন' : "Couldn't verify — recheck"}</span>
                    </>
                  ) : null}
                </div>
                {!isCheckingAvailability && (
                  <button
                    onClick={checkAvailability}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {isBn ? 'রিচেক' : 'Recheck'}
                  </button>
                )}
              </div>
            )}
            <CustomNumericKeypad
              isOpen={showKeypad}
              value={inputDigits}
              onChange={(val) => {
                setInputDigits(val);
                setValuation(null);
              }}
              maxLength={6}
              onClose={() => setShowKeypad(false)}
            />
          </div>

          <button
            onClick={() => handleEvaluate()}
            disabled={isLoading || inputDigits.length !== 6}
            className={`w-full sm:w-auto h-[76px] sm:h-[88px] px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shrink-0 ${
              isLoading || inputDigits.length !== 6
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shadow-none cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_14px_38px_rgba(37,99,235,0.5)] border border-sky-400/40 active:scale-[0.98] cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-current" />
                <span>
                  {isBn ? "চেক হচ্ছে..." : "Checking..."}
                </span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6 stroke-[2.5] text-current" />
                <span className="text-current">{isBn ? "চেক করুন" : "Check"}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-row flex-wrap items-center gap-3 w-full mt-4">
          <button
            onClick={() => {
              playModalOpenSound();
              setGeneratorMode('random');
              setGeneratorModalOpen(true);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-semibold text-sm border border-indigo-200 dark:border-indigo-500/30 transition-colors shadow-sm"
          >
            <Dices className="w-4 h-4 text-indigo-500" />
            <span className="truncate">
              {isBn ? "Random নম্বরসমূহ" : "Random Numbers"}
            </span>
          </button>
          
          <button
            onClick={() => {
              playModalOpenSound();
              setGeneratorMode('vip');
              setGeneratorModalOpen(true);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-sm border border-amber-200 dark:border-amber-500/30 transition-colors shadow-sm"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="truncate">
              {isBn ? "ভিআইপি নম্বরসমূহ" : "VIP Numbers"}
            </span>
          </button>

          <button
            onClick={() => {
              playModalOpenSound();
              setBulkCheckModalOpen(true);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 font-semibold text-sm border border-sky-200 dark:border-sky-500/30 transition-colors shadow-sm"
          >
            <ListChecks className="w-4 h-4 text-sky-500" />
            <span className="truncate">
              {isBn ? "বাল্ক চেক" : "Bulk Check"}
            </span>
          </button>

          <button
            onClick={() => {
              playModalOpenSound();
              setSerialCheckModalOpen(true);
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-semibold text-sm border border-purple-200 dark:border-purple-500/30 transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span className="truncate">
              {isBn ? "সিরিয়াল চেক" : "Serial Check"}
            </span>
          </button>
        </div>
        
        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="w-full mt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <History className="w-4 h-4" />
                {isBn ? "সার্চ হিস্ট্রি" : "Recent Searches"}
              </div>
              <button 
                onClick={() => setHistoryModalOpen(true)}
                className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:text-sky-400"
              >
                {isBn ? "সব দেখুন" : "View All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((num, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputDigits(num.replace(/[^0-9]/g, "").slice(-6));
                    handleEvaluate(num);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-mono font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      
      <BulkCheckModal
        isOpen={bulkCheckModalOpen}
        onClose={() => setBulkCheckModalOpen(false)}
        lang={lang}
        onSelectNumber={(num) => {
          setInputDigits(num.replace(/\D/g, "").slice(-6));
          handleEvaluate(num);
          setBulkCheckModalOpen(false);
        }}
      />
      
      <SerialCheckModal
        isOpen={serialCheckModalOpen}
        onClose={() => setSerialCheckModalOpen(false)}
        lang={lang}
        initialInput={inputDigits}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelectNumber={(num) => {
          setInputDigits(num.replace(/\D/g, "").slice(-6));
          handleEvaluate(num);
          setSerialCheckModalOpen(false);
        }}
      />
      
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={searchHistory}
        lang={lang}
        onSelect={(num) => {
          setInputDigits(num.replace(/\D/g, "").slice(-6));
          handleEvaluate(num);
        }}
      />
      
      <GeneratorModal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        mode={generatorMode}
        lang={lang}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelect={(num) => {
          // `num` is now the full number (e.g. 09649XXXXXX) — do not re-add prefix.
          setInputDigits(num.replace(/\D/g, "").slice(-6));
          handleEvaluate(num);
        }}
      />

      <ValuationResultModal

        isOpen={valuationModalOpen}
        onClose={() => setValuationModalOpen(false)}
        valuation={valuation}
        lang={lang}
        onLockValuation={(val) => {
          setIsHeartPulsing(true);
          setTimeout(() => setIsHeartPulsing(false), 1500);
          onLockValuation(val);
        }}
        isFavorite={valuation ? favorites.includes(valuation.number) : false}
        onToggleFavorite={() => valuation && toggleFavorite(valuation.number)}
        onRegenerate={() => handleEvaluate(`${OFFICIAL_INFO.prefix}${inputDigits}`)}
      />

      <FavoritesModal
        isOpen={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        favorites={favorites}
        onRemove={toggleFavorite}
        onSelect={(num) => {
          setInputDigits(num.replace(/\D/g, "").slice(-6));
          handleEvaluate(num);
        }}
        lang={lang}
      />

      {/* Floating Favorites Button */}
      {createPortal(
        <button
          onClick={() => setFavoritesModalOpen(true)}
          className={`fixed right-4 sm:right-6 bottom-40 sm:bottom-24 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-extrabold shadow-xl shadow-rose-500/30 transition-all hover:scale-105 group ${isHeartPulsing ? "animate-pulse scale-110" : ""}`}
          title={isBn ? "সংরক্ষিত নম্বরসমূহ" : "Saved Numbers"}
          aria-label={isBn ? "সংরক্ষিত নম্বরসমূহ" : "Saved Numbers"}
        >
          <Heart className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-xs font-bold tracking-tight">
            {isBn ? "সংরক্ষিত নম্বর" : "Saved Numbers"}
          </span>
          {favorites.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
              {favorites.length}
            </span>
          )}
        </button>,
        document.body,
      )}
    </div>
  );
};
