import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Phone, MessageCircle } from 'lucide-react';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';
import { OFFICIAL_INFO } from '../data/banglaCallData';

interface ExitIntentModalProps {
  lang: Language;
  onOpenLeadForm: () => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ lang, onOpenLeadForm }) => {
  const isBn = lang === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only enable exit intent detection after 15 seconds on the page
    const timer = setTimeout(() => {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !hasShown) {
          setIsOpen(true);
          setHasShown(true);
          trackEvent('pageview', 'Exit Intent Modal Shown');
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      };

      if (sessionStorage.getItem('exitIntentShown') === 'true') {
        setHasShown(true);
      } else {
        document.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, 15000);

    return () => clearTimeout(timer);
  }, [hasShown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-4 relative z-10">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {isBn ? 'যেতে যেতে কিছু কথা...' : 'Before You Go...'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isBn 
                  ? 'আপনার কি একটি উপযুক্ত নম্বর বেছে নিতে সাহায্য প্রয়োজন? নাকি সার্ভিস সম্পর্কে কোনো প্রশ্ন আছে?' 
                  : 'Do you need help choosing the perfect number or have any questions about our service?'}
              </p>
            </div>

            <div className="space-y-3 relative z-10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLeadForm();
                  trackEvent('cta_click', 'Exit Intent: Request Help');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{isBn ? 'হ্যাঁ, আমাকে সাহায্য করুন' : 'Yes, I need help'}</span>
              </button>
              
              <a
                href={`https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(isBn ? 'হ্যালো, আমার সার্ভিসটি সম্পর্কে কিছু জানার ছিল।' : 'Hello, I have some questions about the service.')}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setIsOpen(false);
                  trackEvent('whatsapp_click', 'Exit Intent: WhatsApp Help');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isBn ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Chat on WhatsApp'}</span>
              </a>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors"
              >
                {isBn ? 'না, ধন্যবাদ। আমি দেখছি।' : 'No thanks, I am just browsing.'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
