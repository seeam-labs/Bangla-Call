import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, PhoneCall } from 'lucide-react';
import { Language } from '../types';

export const LiveStatsBanner = ({ lang }: { lang: Language }) => {
  const [stats, setStats] = useState<{ enabled?: boolean; activeUsers: number; callsToday: number } | null>(null);
  const [isVisible] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/live-stats');
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await res.json();
            if (data && typeof data.activeUsers === 'number') {
              setStats(data);
            }
          }
        }
      } catch (err) {
        // Silent: keep the banner hidden if stats can't be loaded.
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hidden until real data loads, and when the owner has disabled the banner.
  if (!stats || stats.enabled === false || !stats.activeUsers) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-brand-primary text-white text-xs sm:text-sm font-medium py-2 px-4 relative z-50 shadow-md"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              <Users className="w-4 h-4 opacity-80" />
              <span>
                {stats.activeUsers.toLocaleString()} {lang === 'bn' ? 'সক্রিয় ব্যবহারকারী' : 'Active Users'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 opacity-80" />
              <span>
                {stats.callsToday.toLocaleString()} {lang === 'bn' ? 'আজকের মোট কল' : 'Calls Today'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
