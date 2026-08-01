import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X } from 'lucide-react';
import { Language } from '../types';

export function SocialProofPopup({ lang }: { lang: Language }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const isBn = lang === 'bn';

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (hasShown) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight;
          const winHeight = window.innerHeight;
          const scrollPercent = scrollY / (docHeight - winHeight || 1);

          if (scrollPercent > 0.5) {
            setHasShown(true);
            setTimeout(() => {
              setIsVisible(true);
            }, 1000);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShown]);

  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => setIsVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 sm:bottom-28 left-4 sm:left-6 z-40 w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 flex gap-3 overflow-hidden"
        >
          {/* Accent border */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

          <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full h-fit mt-1">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <div className="flex-1 pr-4">
            <p className="text-sm text-slate-900 dark:text-white font-medium leading-snug">
              {isBn 
                ? 'একজন নতুন ইউজার এইমাত্র একটি কর্পোরেট প্যাকেজ কিনেছেন'
                : 'Someone just purchased a Corporate Package'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn ? '১০ মিনিট আগে' : 'Last 10 minutes'}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
