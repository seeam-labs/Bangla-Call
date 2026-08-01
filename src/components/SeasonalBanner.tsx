import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

export const SeasonalBanner: React.FC<{ lang: Language }> = ({ lang }) => {
  const [bannerText, setBannerText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        // Simulating getting location (in real-world we could use IP geolocation)
        const location = "Dhaka, Bangladesh"; 
        
        const res = await fetch('/api/seasonal-banner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location, date, language: lang })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.banner) {
            setBannerText(data.banner);
          }
        }
      } catch (error) {
        // Silent fallback when banner API is unavailable
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanner();
  }, [lang]);

  if (loading || !bannerText) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto mt-6 mb-2 overflow-hidden rounded-2xl relative shadow-sm border border-brand-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-sky-400/10 to-amber-500/10 pointer-events-none" />
        
        <div className="relative z-10 px-6 py-3 flex items-center justify-center gap-3 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
          <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
            {bannerText}
          </p>
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
