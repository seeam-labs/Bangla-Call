import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Share2, Copy, Lock, Search, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { NumberValuation, Language } from '../types';
import { useToast } from './Toast';
import { trackEvent } from '../lib/analytics';
import { copyToClipboard } from '../lib/clipboard';

interface ValuationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  valuation: NumberValuation | null;
  lang: Language;
  onLockValuation: (val: NumberValuation) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRegenerate: () => void;
}

export const ValuationResultModal: React.FC<ValuationResultModalProps> = ({
  isOpen,
  onClose,
  valuation,
  lang,
  onLockValuation,
  isFavorite,
  onToggleFavorite,
  onRegenerate
}) => {
  const [mounted, setMounted] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);
  const [, setIsCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (valuation?.number) {
      setAvailabilityStatus(null);
      checkAvailability();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check only when the valued number changes
  }, [valuation?.number]);

  const isBn = lang === 'bn';
  const { showToast } = useToast();

  if (!mounted || !valuation) return null;

  const handleCopy = () => {
    if (!valuation) return;
    trackEvent('cta_click', 'Copy Number Valuation', valuation.number);
    
    const textToCopy = isBn ? 
      `**Bangla Call AI Valuation**\n\n` +
      `- **Number:** ${valuation.number}\n` +
      `- **Availability:** ${availabilityStatus === true ? 'এভেইলেবল (Available)' : availabilityStatus === false ? 'বিক্রি হয়ে গেছে (Sold)' : 'অজানা (Unknown)'}\n` +
      `- **Category:** ${valuation.tierNameBn}\n` +
      `- **1st Recharge:** ${valuation.estimatedRechargeBdt} BDT (Total Usable: ${valuation.totalUsableBalanceBdt} BDT)\n\n` +
      `**AI Analysis:**\n${valuation.explanationBn}\n\n` +
      `**Registration Link:** ${window.location.href}`
      :
      `**Bangla Call AI Valuation**\n\n` +
      `- **Number:** ${valuation.number}\n` +
      `- **Availability:** ${availabilityStatus === true ? 'Available' : availabilityStatus === false ? 'Sold Out' : 'Unknown'}\n` +
      `- **Category:** ${valuation.tierNameEn}\n` +
      `- **1st Recharge:** ${valuation.estimatedRechargeBdt} BDT (Total Usable: ${valuation.totalUsableBalanceBdt} BDT)\n\n` +
      `**AI Analysis:**\n${valuation.explanationEn}\n\n` +
      `**Registration Link:** ${window.location.href}`;

    copyToClipboard(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    trackEvent('cta_click', 'Share Number Valuation', valuation.number);
    const title = isBn ? 'বাংলা কল নম্বর ভ্যালুয়েশন' : 'Bangla Call Number Valuation';
    
    const textToShare = isBn ? 
      `**Bangla Call AI Valuation**\n\n` +
      `- **Number:** ${valuation.number}\n` +
      `- **Availability:** ${availabilityStatus === true ? 'এভেইলেবল (Available)' : availabilityStatus === false ? 'বিক্রি হয়ে গেছে (Sold)' : 'অজানা (Unknown)'}\n` +
      `- **Category:** ${valuation.tierNameBn}\n` +
      `- **1st Recharge:** ${valuation.estimatedRechargeBdt} BDT (Total Usable: ${valuation.totalUsableBalanceBdt} BDT)\n\n` +
      `**AI Analysis:**\n${valuation.explanationBn}\n\n` +
      `**Registration Link:** ${window.location.href}`
      :
      `**Bangla Call AI Valuation**\n\n` +
      `- **Number:** ${valuation.number}\n` +
      `- **Availability:** ${availabilityStatus === true ? 'Available' : availabilityStatus === false ? 'Sold Out' : 'Unknown'}\n` +
      `- **Category:** ${valuation.tierNameEn}\n` +
      `- **1st Recharge:** ${valuation.estimatedRechargeBdt} BDT (Total Usable: ${valuation.totalUsableBalanceBdt} BDT)\n\n` +
      `**AI Analysis:**\n${valuation.explanationEn}\n\n` +
      `**Registration Link:** ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: textToShare,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const checkAvailability = async () => {
    if (!valuation) return;
    setIsCheckingAvailability(true);
    setAvailabilityStatus(null);
    try {
      // Route through the Worker proxy (never amarip.net directly: CSP/CORS).
      const res = await fetch(`/api/number/check?q=${valuation.number.replace(/\D/g, '')}`);
      if (res.ok) {
        const data = await res.json();
        setAvailabilityStatus(typeof data.available === 'boolean' ? data.available : null);
      } else {
        setAvailabilityStatus(null);
      }
    } catch (err) {
      setAvailabilityStatus(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const getSavedFavorites = () => {
    try {
      const saved = localStorage.getItem('bangla_call_favs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const favoritesList = getSavedFavorites();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Left Column */}
            <div className="md:w-1/2 relative p-8 md:p-12 bg-gradient-to-b from-sky-50 dark:from-sky-900/20 to-white dark:to-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm z-20 border border-slate-200/50 dark:border-slate-700/50"
                title={isBn ? 'পিছনে যান' : 'Go Back'}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isBn ? 'পিছনে' : 'Back'}</span>
              </button>

              <button 
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 z-20"
                title={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-bold uppercase tracking-widest shadow-sm">
                {isBn ? valuation.tierNameBn : valuation.tierNameEn}
              </div>
              
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black font-mono text-slate-900 dark:text-white tracking-tight mb-8 drop-shadow-sm">
                {valuation.number}
              </h2>

              <div className="flex flex-col gap-3 w-full max-w-xs mb-16 md:mb-20">
                {availabilityStatus === null && !isCheckingAvailability && (
                   <button onClick={checkAvailability} className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700">
                     <Search className="w-4 h-4" />
                     {isBn ? 'এভেইলেবিলিটি চেক করুন' : 'Check Availability'}
                   </button>
                )}
                {isCheckingAvailability && (
                  <span className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isBn ? 'চেক করা হচ্ছে...' : 'Checking...'}
                  </span>
                )}
                {availabilityStatus === true && (
                  <span className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 w-full">
                    <CheckCircle2 className="w-5 h-5" />
                    {isBn ? 'নম্বরটি এভেইলেবল!' : 'Available!'}
                  </span>
                )}
                {availabilityStatus === false && (
                  <span className="flex items-center justify-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800 w-full">
                    <XCircle className="w-5 h-5" />
                    {isBn ? 'ইতোমধ্যে বিক্রি হয়ে গেছে' : 'Not Available'}
                  </span>
                )}
              </div>

              {/* Quick Actions overlayed */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3">
                <button 
                  onClick={onRegenerate}
                  className="p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title={isBn ? 'নতুন নম্বর জেনারেট করুন' : 'Regenerate'}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                </button>

                <button 
                  onClick={() => {
                    onToggleFavorite();
                    if (!isFavorite) {
                      showToast(
                        isBn ? 'কালেকশনে সেভ করা হয়েছে' : 'Saved to Collection',
                        isBn ? 'নম্বরটি আপনার ফেভারিট লিস্টে যোগ করা হয়েছে' : 'Number added to your saved list',
                        'success'
                      );
                    }
                  }}
                  className={`p-3.5 rounded-full shadow-lg border transition-all hover:scale-110 active:scale-95 ${
                    isFavorite 
                      ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-500/20 dark:border-rose-500/30' 
                      : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 hover:text-rose-500 hover:border-rose-200'
                  }`}
                  title={isBn ? 'সংরক্ষণ করুন' : 'Save to Collection'}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-500 shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title={isBn ? 'কপি করুন' : 'Quick Copy'}
                >
                  <Copy className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500 shadow-lg hover:scale-110 active:scale-95 transition-all"
                  title={isBn ? 'শেয়ার করুন' : 'Share'}
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:w-1/2 flex flex-col bg-white dark:bg-slate-900 relative shrink-0 md:shrink-0 md:h-[90vh]">
              <button 
                onClick={onClose}
                className="hidden md:flex absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex border-b border-slate-100 dark:border-slate-800 mt-2 px-6">
                <button 
                  onClick={() => setShowSavedList(false)}
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors ${!showSavedList ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {isBn ? 'বিস্তারিত বিশ্লেষণ' : 'Detailed Analysis'}
                </button>
                <button 
                  onClick={() => setShowSavedList(true)}
                  className={`px-4 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${showSavedList ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Heart className={`w-4 h-4 ${showSavedList ? 'fill-brand-primary' : ''}`} />
                  {isBn ? 'সংরক্ষিত নম্বর' : 'Saved Numbers'}
                </button>
              </div>

              <div className="flex-1 overflow-y-visible md:overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                
                {!showSavedList ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {/* Financials */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm">
                      <div className="flex justify-between items-end pb-5 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {isBn ? '১ম রিচার্জ প্রয়োজন' : 'Required 1st Recharge'}
                        </span>
                        <span className="text-3xl font-black text-brand-primary tracking-tight">
                          {valuation.estimatedRechargeBdt} <span className="text-lg">BDT</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm pt-5">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium mb-1">{isBn ? 'নম্বর মূল্য' : 'Number Fee'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">0 BDT (Free)</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs text-slate-500 font-medium mb-1">{isBn ? 'মোট ব্যবহারযোগ্য' : 'Total Usable'}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{valuation.totalUsableBalanceBdt} BDT</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Explanation */}
                    <div>
                      <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        {isBn ? 'এআই বিশ্লেষণ' : 'AI Explanation'}
                      </h3>
                      <p className="text-[15px] text-slate-700 dark:text-slate-300 bg-sky-50/50 dark:bg-sky-900/10 p-6 rounded-[1.5rem] border border-sky-100 dark:border-sky-800/30 leading-relaxed">
                        {isBn ? valuation.explanationBn : valuation.explanationEn}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
                      {isBn ? 'আপনার সংরক্ষিত কালেকশন' : 'Your Saved Collection'}
                    </h3>
                    {favoritesList.length === 0 ? (
                       <div className="text-center py-10 opacity-60 flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                         <Heart className="w-10 h-10 text-slate-300 mb-3" />
                         <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                           {isBn ? 'আপনার কোনো সংরক্ষিত নম্বর নেই' : 'You have no saved numbers'}
                         </p>
                       </div>
                    ) : (
                       <ul className="space-y-3">
                        {favoritesList.map((num: string) => (
                           <li key={num} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                              <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">{num}</span>
                              <Heart className="w-5 h-5 text-rose-500 fill-current" />
                           </li>
                        ))}
                       </ul>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="p-6 md:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isBn ? 'পিছনে যান' : 'Back'}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onLockValuation(valuation);
                  }}
                  disabled={availabilityStatus === false}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-brand-primary hover:bg-brand-primary-hover disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white font-bold text-[15px] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(14,165,233,0.3)] disabled:shadow-none hover:shadow-[0_8px_30px_rgb(14,165,233,0.5)] transition-all active:scale-[0.98]"
                >
                  <Lock className="w-5 h-5" />
                  <span>
                    {isBn
                      ? `নম্বরটি লক করুন (${valuation.estimatedRechargeBdt} BDT)`
                      : `Lock Number (${valuation.estimatedRechargeBdt} BDT)`}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
