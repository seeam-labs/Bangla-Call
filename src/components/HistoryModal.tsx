import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, History, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onSelect: (num: string) => void;
  lang: Language;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect, lang }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const isBn = lang === 'bn';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isBn ? 'সার্চ হিস্ট্রি' : 'Search History'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {history.length} {isBn ? 'টি নম্বর সংরক্ষিত আছে' : 'numbers in history'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    {isBn ? 'কোনো সার্চ হিস্ট্রি পাওয়া যায়নি' : 'No search history found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((num, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500/30 transition-colors group">
                      <span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {num}
                      </span>
                      <button
                        onClick={() => {
                          onSelect(num);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all shadow-sm group-hover:shadow-md"
                      >
                        {isBn ? 'দেখুন' : 'View'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
