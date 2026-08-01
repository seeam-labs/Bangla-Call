import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Map, ChevronRight, Compass, Home, Calculator, PhoneCall, GitMerge, HelpCircle, FileText, ShieldCheck, Route, CreditCard, BarChart2, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface QuickAccessMenuProps {
  lang: Language;
}

export const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'hero', icon: <Home className="w-5 h-5" />, labelBn: 'প্রধান সেকশন', labelEn: 'Main View' },
    { id: 'ai-valuation', icon: <Sparkles className="w-5 h-5" />, labelBn: 'স্মার্ট নাম্বার ফাইন্ডার', labelEn: 'Smart Number Finder' },
    { id: 'trust', icon: <ShieldCheck className="w-5 h-5" />, labelBn: 'আস্থা ও নিরাপত্তা', labelEn: 'Trust & Security' },
    { id: 'coverage', icon: <Map className="w-5 h-5" />, labelBn: 'কাভারেজ ম্যাপ', labelEn: 'Coverage Map' },
    { id: 'onboarding', icon: <Route className="w-5 h-5" />, labelBn: 'অনবোর্ডিং রোডম্যাপ', labelEn: 'Onboarding Roadmap' },
    { id: 'pricing', icon: <CreditCard className="w-5 h-5" />, labelBn: 'প্রাইসিং পলিসি', labelEn: 'Pricing Policy' },
    { id: 'comparison', icon: <BarChart2 className="w-5 h-5" />, labelBn: 'তুলনামূলক বিশ্লেষণ', labelEn: 'Comparison Analysis' },
    { id: 'calculator', icon: <Calculator className="w-5 h-5" />, labelBn: 'রেট ক্যালকুলেটর', labelEn: 'Rate Calculator' },
    { id: 'call-simulator', icon: <PhoneCall className="w-5 h-5" />, labelBn: 'কল সিমুলেটর', labelEn: 'Call Simulator' },
    { id: 'ivr-builder', icon: <GitMerge className="w-5 h-5" />, labelBn: 'স্মার্ট আইভিআর বিল্ডার', labelEn: 'Smart IVR Builder' },
    { id: 'lead-form-section', icon: <FileText className="w-5 h-5" />, labelBn: 'আবেদন ফর্ম', labelEn: 'Application Form' },
    { id: 'faq', icon: <HelpCircle className="w-5 h-5" />, labelBn: 'সাধারণ প্রশ্ন উত্তর', labelEn: 'FAQs' },
  ];

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
      trackEvent('cta_click', `Quick Access: Jump to ${id}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 bottom-24 sm:bottom-6 z-50 p-3 sm:p-4 bg-brand-primary text-white rounded-full shadow-xl hover:bg-brand-primary/90 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-primary/30 group"
        aria-label={isBn ? 'কুইক এক্সেস মেনু' : 'Quick Access Menu'}
      >
        <Compass className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-primary" />
                  {isBn ? 'কুইক এক্সেস' : 'Quick Access'}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScroll(item.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl text-left bg-slate-50 hover:bg-brand-primary/10 dark:bg-slate-800/50 dark:hover:bg-brand-primary/20 text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform text-brand-primary">
                        {item.icon}
                      </div>
                      <span className="font-semibold">{isBn ? item.labelBn : item.labelEn}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
