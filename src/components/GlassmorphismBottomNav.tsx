import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, MessageCircle, Compass, Zap, X, ChevronRight, Map, Route, CreditCard, BarChart2, Calculator, FileText, HelpCircle, ShieldCheck, Check, ArrowUpRight } from 'lucide-react';
import { Language } from '../types';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { trackEvent } from '../lib/analytics';

interface GlassmorphismBottomNavProps {
  lang: Language;
  onOpenLeadForm: () => void;
}

export const GlassmorphismBottomNav: React.FC<GlassmorphismBottomNavProps> = ({
  lang,
  onOpenLeadForm,
}) => {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'home' | 'finder' | 'book' | 'whatsapp' | 'menu'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  // Auto-highlight active tab based on scroll position (throttled RAF to prevent forced layout reflow)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 300;
          const leadEl = document.getElementById('lead-form-section');
          const finderEl = document.getElementById('ai-valuation');

          if (leadEl && scrollPos >= leadEl.offsetTop) {
            setActiveTab('book');
          } else if (finderEl && scrollPos >= finderEl.offsetTop) {
            setActiveTab('finder');
          } else {
            setActiveTab('home');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tab: 'home' | 'finder' | 'book' | 'whatsapp' | 'menu') => {
    setActiveTab(tab);
    trackEvent('cta_click', `Bottom Nav Click: ${tab}`);

    if (tab === 'home') {
      setIsMenuOpen(false);
      setIsWhatsappOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'finder') {
      setIsMenuOpen(false);
      setIsWhatsappOpen(false);
      const el = document.getElementById('ai-valuation');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'book') {
      setIsMenuOpen(false);
      setIsWhatsappOpen(false);
      onOpenLeadForm();
    } else if (tab === 'whatsapp') {
      setIsMenuOpen(false);
      setIsWhatsappOpen(!isWhatsappOpen);
    } else if (tab === 'menu') {
      setIsWhatsappOpen(false);
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      trackEvent('cta_click', `Quick Access Menu: Jump to ${id}`);
    }
  };

  const handleWhatsAppChat = (msg: string) => {
    trackEvent('whatsapp_click', 'Bottom Nav WhatsApp Chat', msg);
    const url = `https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsWhatsappOpen(false);
  };

  const menuItems = [
    { id: 'hero', icon: <Home className="w-4 h-4" />, labelBn: 'প্রধান সেকশন', labelEn: 'Main View' },
    { id: 'ai-valuation', icon: <Sparkles className="w-4 h-4" />, labelBn: 'স্মার্ট নাম্বার ফাইন্ডার', labelEn: 'Smart Number Finder' },
    { id: 'trust', icon: <ShieldCheck className="w-4 h-4" />, labelBn: 'আস্থা ও নিরাপত্তা', labelEn: 'Trust & Security' },
    { id: 'coverage', icon: <Map className="w-4 h-4" />, labelBn: 'কাভারেজ ম্যাপ', labelEn: 'Coverage Map' },
    { id: 'onboarding', icon: <Route className="w-4 h-4" />, labelBn: 'অনবোর্ডিং রোডম্যাপ', labelEn: 'Onboarding Roadmap' },
    { id: 'pricing', icon: <CreditCard className="w-4 h-4" />, labelBn: 'প্রাইসিং পলিসি', labelEn: 'Pricing Policy' },
    { id: 'comparison', icon: <BarChart2 className="w-4 h-4" />, labelBn: 'তুলনামূলক বিশ্লেষণ', labelEn: 'Comparison Analysis' },
    { id: 'calculator', icon: <Calculator className="w-4 h-4" />, labelBn: 'রেট ক্যালকুলেটর', labelEn: 'Rate Calculator' },
    { id: 'lead-form-section', icon: <FileText className="w-4 h-4" />, labelBn: 'আবেদন ফর্ম', labelEn: 'Application Form' },
    { id: 'faq', icon: <HelpCircle className="w-4 h-4" />, labelBn: 'সাধারণ প্রশ্ন উত্তর', labelEn: 'FAQs' },
  ];

  return (
    <>
      {/* WhatsApp Quick Popover */}
      <AnimatePresence>
        {isWhatsappOpen && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-4 shadow-2xl shadow-emerald-950/20 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                    BC
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1">
                      {OFFICIAL_INFO.brandNameBn}
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isBn ? 'সরাসরি হোয়াটসঅ্যাপ সাপোর্ট' : '24/7 WhatsApp Support'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWhatsappOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <button
                  onClick={() =>
                    handleWhatsAppChat(
                      isBn
                        ? 'হ্যালো বাংলা কল! 👋 আমি নতুন 09649 সংযোগ নিতে চাই।'
                        : 'Hello Bangla Call! 👋 I want to register a new 09649 number.'
                    )
                  }
                  className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200/60 dark:border-emerald-500/30 text-left flex items-center justify-between text-slate-800 dark:text-emerald-300 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isBn ? 'নতুন 09649 সংযোগ নিতে চাই' : 'Get new 09649 number'}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                </button>

                <button
                  onClick={() =>
                    handleWhatsAppChat(
                      isBn
                        ? 'হ্যালো, আমাদের অফিসের জন্য বাংলা কল আইপি-পিবিএক্স ও আইভিআর প্রয়োজন।'
                        : 'Hello, I need info about Corporate IP-PBX & IVR.'
                    )
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-left flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{isBn ? 'কর্পোরেট পিবিএক্স ও আইভিআর' : 'Corporate PBX & IVR'}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Access Slide-over Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isBn ? 'কুইক এক্সেস মেনু' : 'Quick Access Navigation'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScrollToSection(item.id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 text-slate-800 dark:text-slate-200 hover:text-brand-primary dark:hover:text-brand-primary border border-slate-200/50 dark:border-slate-800 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-brand-primary group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span>{isBn ? item.labelBn : item.labelEn}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Glassmorphism Bottom Navigation Bar */}
      <nav className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg pointer-events-auto">
        <div className="relative px-3 py-2 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border border-white/60 dark:border-slate-800/80 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-1 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
          {/* Subtle Glass Light Reflection Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-sky-400/30 to-transparent pointer-events-none" />
          
          {/* Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`flex-1 py-2 px-2.5 rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all relative ${
              activeTab === 'home'
                ? 'text-brand-primary'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="truncate">{isBn ? 'হোম' : 'Home'}</span>
            {activeTab === 'home' && (
              <motion.div
                layoutId="navGlow"
                className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          {/* Finder */}
          <button
            onClick={() => handleNavClick('finder')}
            className={`flex-1 py-2 px-2.5 rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all relative ${
              activeTab === 'finder'
                ? 'text-brand-primary'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="truncate">{isBn ? 'খুঁজুন' : 'Finder'}</span>
            {activeTab === 'finder' && (
              <motion.div
                layoutId="navGlow"
                className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          {/* Main Action Button - Book Free Number */}
          <button
            onClick={() => handleNavClick('book')}
            className="flex-1 max-w-[130px] py-2.5 px-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-black text-[11px] sm:text-xs rounded-full flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/30 active:scale-95 transition-all shrink-0 border border-sky-300/40"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-bounce" />
            <span className="truncate">{isBn ? 'ফ্রি ০৯৬৪৯' : 'Free 09649'}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleNavClick('whatsapp')}
            className={`flex-1 py-2 px-2.5 rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all relative ${
              isWhatsappOpen || activeTab === 'whatsapp'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <span className="truncate">{isBn ? 'চ্যাট' : 'WhatsApp'}</span>
            {isWhatsappOpen && (
              <motion.div
                layoutId="navGlow"
                className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          {/* Quick Access Menu */}
          <button
            onClick={() => handleNavClick('menu')}
            className={`flex-1 py-2 px-2.5 rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all relative ${
              isMenuOpen
                ? 'text-brand-primary'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="truncate">{isBn ? 'মেনু' : 'Menu'}</span>
            {isMenuOpen && (
              <motion.div
                layoutId="navGlow"
                className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </button>

        </div>
      </nav>
    </>
  );
};
