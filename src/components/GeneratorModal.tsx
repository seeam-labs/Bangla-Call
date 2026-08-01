import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Dices, Crown, Loader2, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { CopyButton } from './CopyButton';
import { buildWhatsAppUrl, formatNumberEnquiry } from '../lib/whatsapp';
import { trackEvent } from '../lib/analytics';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'random' | 'vip';
  lang: Language;
  favorites: string[];
  onToggleFavorite: (num: string) => void;
  onSelect: (num: string) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({ isOpen, onClose, mode, lang, favorites, onToggleFavorite, onSelect }) => {
  const [mounted, setMounted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const isBn = lang === 'bn';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      generateAndCheck();
    } else {
      setAvailableNumbers([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate only when opened or mode changes
  }, [isOpen, mode]);

  const generateAndCheck = async () => {
    setGenerating(true);
    setAvailableNumbers([]);
    
    // Generate pool of numbers
    let pool: string[] = [];
    if (mode === 'vip') {
        const vipPatterns = ["777777", "888888", "123456", "789789", "000111", "555666", "112233", "990099", "505050", "222444", "000000", "111111", "999999", "654321", "121212", "102030", "100100", "200200"];
        // Shuffle and take 15
        pool = vipPatterns.sort(() => 0.5 - Math.random()).slice(0, 15);
    } else {
        while(pool.length < 15) {
            const rnd = Math.floor(100000 + Math.random() * 900000).toString();
            if (new Set(rnd).size >= 4 && !pool.includes(rnd)) {
                pool.push(rnd);
            }
        }
    }

    // Check availability
    const available = [];
    // We check in batches so we don't spam too hard, or just Promise.all
    try {
        const checks = await Promise.all(
            pool.map(async (num) => {
                try {
                    const res = await fetch(`/api/number/check?q=${OFFICIAL_INFO.prefix.replace(/\D/g, "")}${num}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Keep ONLY numbers the API confirms are available.
                        return data.available === true ? num : null;
                    }
                    return null;
                } catch(e) {
                    return null;
                }
            })
        );
        checks.forEach(n => { if (n) available.push(n); });
        setAvailableNumbers(available);
    } catch(e) {
        console.error(e);
    } finally {
        setGenerating(false);
    }
  };

  const handleSaveAll = () => {
      availableNumbers.forEach(num => {
          const fullNum = `${OFFICIAL_INFO.prefix}${num}`;
          if (!favorites.includes(fullNum)) {
              onToggleFavorite(fullNum);
          }
      });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'vip' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600'}`}>
                  {mode === 'vip' ? <Crown className="w-5 h-5" /> : <Dices className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {mode === 'vip' ? (isBn ? 'ভিআইপি নম্বরসমূহ' : 'VIP Numbers') : (isBn ? 'Random নম্বরসমূহ' : 'Random Numbers')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isBn ? 'শুধুমাত্র এভেইলেবল নম্বর দেখানো হচ্ছে' : 'Showing only available numbers'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-primary" />
                  <p className="font-semibold">{isBn ? 'নম্বর চেক করা হচ্ছে...' : 'Checking availability...'}</p>
                </div>
              ) : availableNumbers.length === 0 ? (
                <div className="text-center py-12">
                   <p className="text-slate-500 font-medium">{isBn ? 'কোনো এভেইলেবল নম্বর পাওয়া যায়নি' : 'No available numbers found'}</p>
                   <button onClick={generateAndCheck} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold text-sm">
                       {isBn ? 'আবার চেষ্টা করুন' : 'Try Again'}
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableNumbers.map((num, i) => {
                    const fullNum = `${OFFICIAL_INFO.prefix}${num}`;
                    const isFav = favorites.includes(fullNum);
                    return (
                      <div key={i} className="flex flex-col p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-brand-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-200 tracking-tight">{fullNum}</span>
                            <div className="flex items-center gap-1.5">
                              <CopyButton value={fullNum} lang={lang} className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500 transition-colors" iconClassName="w-4 h-4" />
                              <button
                                  onClick={() => onToggleFavorite(fullNum)}
                                  aria-label="favorite"
                                  className={`p-1.5 rounded-lg transition-colors ${isFav ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-400'}`}
                              >
                                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => { trackEvent('cta_click', 'Generator Select', fullNum); onSelect(fullNum); onClose(); }}
                            className="py-2 rounded-lg bg-brand-primary text-white font-bold text-xs hover:opacity-90 transition-all inline-flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />{isBn ? 'ফর্মে নিন' : 'Use'}
                          </button>
                          <a
                            href={buildWhatsAppUrl(formatNumberEnquiry(fullNum, null, lang))}
                            target="_blank" rel="noreferrer"
                            onClick={() => trackEvent('whatsapp_click', 'Generator Buy Now', fullNum)}
                            className="py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />{isBn ? 'বুক করুন' : 'Buy Now'}
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {!generating && availableNumbers.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between gap-3">
                    <button 
                        onClick={generateAndCheck}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {isBn ? 'আরও জেনারেট করুন' : 'Generate More'}
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Heart className="w-4 h-4 fill-white" />
                        {isBn ? 'সব সেভ করুন' : 'Save All'}
                    </button>
                </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
