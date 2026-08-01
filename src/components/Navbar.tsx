import React, { useState, useRef, useEffect } from 'react';
import { Phone, ShieldCheck, BarChart3, Globe, Sun, Moon, Search, Zap, Headphones, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Theme } from '../lib/theme';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language, ColorPaletteId } from '../types';
import { trackEvent } from '../lib/analytics';
import { PaletteSelector } from './PaletteSelector';
import { playClickSound, playModalOpenSound } from '../lib/sounds';

interface NavbarProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currentPalette: ColorPaletteId;
  onSelectPalette: (paletteId: ColorPaletteId) => void;
  onOpenAnalytics: () => void;
  onOpenAdmin: () => void;
  onOpenLeadForm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  setTheme,
  lang,
  setLang,
  currentPalette,
  onSelectPalette,
  onOpenAnalytics,
  onOpenAdmin,
}) => {
  const isBn = lang === 'bn';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<{ id: string; labelBn: string; labelEn: string; icon: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveRecentSearch = (opt: any) => {
    const updated = [opt, ...recentSearches.filter(r => r.id !== opt.id)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchOptions = [
    { id: 'ai-valuation', labelBn: 'স্মার্ট নাম্বার ফাইন্ডার', labelEn: 'Smart Number Finder', icon: '✨' },
    { id: 'pricing', labelBn: 'অ্যাক্টিভেশন ও প্রাইসিং', labelEn: 'Activation & Pricing', icon: '💰' },
    { id: 'coverage', labelBn: 'কাভারেজ ম্যাপ', labelEn: 'Coverage Map', icon: '🗺️' },
    { id: 'calculator', labelBn: 'রেট ক্যালকুলেটর', labelEn: 'Rate Calculator', icon: '🧮' },
    { id: 'onboarding', labelBn: 'অনবোর্ডিং রোডম্যাপ', labelEn: 'Onboarding Roadmap', icon: '🚀' },
  ];

  const filteredOptions = searchOptions.filter(opt => 
    opt.labelBn.toLowerCase().includes(searchQuery.toLowerCase()) || 
    opt.labelEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayOptions = searchQuery.trim() === '' ? recentSearches : filteredOptions;

  return (
    <header className="sticky top-0 z-50 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-white shadow-xs transition-all">
      {/* Top Professional Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800/80 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3 h-3 fill-amber-400" />
              {isBn ? 'BTRC অনুমোদিত IPTSP লাইসেন্স' : 'BTRC Approved IPTSP License'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-medium">
              {isBn ? 'কল চার্জ: ৩০ পয়সা/মিনিট + ১৫% ভ্যাট' : 'Call Rate: 30 Paisa/Min + 15% VAT'}
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <a 
              href={`tel:${OFFICIAL_INFO.helpline1}`}
              className="hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <Headphones className="w-3 h-3 text-sky-400" />
              <span>{isBn ? '২৪/৭ হেল্পলাইন:' : '24/7 Helpline:'} {OFFICIAL_INFO.helpline1}</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isBn ? '০৯৬৪৯ সিরিজ সক্রিয়' : '09649 Series Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand Logo & License Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none"
            onClick={() => trackEvent('cta_click', 'Nav Logo Click')}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-0.5 rounded-[12px] sm:rounded-[16px] bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 shadow-md shadow-sky-500/20 shrink-0"
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center p-0.5 border border-white/10">
                <img src="/bangla-call-icon.svg" alt="Bangla Call Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-xl md:text-2xl tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-sky-600 to-indigo-700 dark:from-white dark:via-sky-400 dark:to-indigo-300">
                  {OFFICIAL_INFO.brandNameBn}
                </span>
                <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs shadow-blue-500/20 whitespace-nowrap">
                  IPTSP
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="hidden sm:flex text-[11px] text-slate-500 dark:text-slate-400 font-semibold items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>{OFFICIAL_INFO.licenseNo}</span>
                </p>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  {isBn ? 'লাইভ' : 'LIVE'}
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Global Navigation Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-col relative mx-4 flex-1 max-w-sm z-50">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            </div>
            <input 
              ref={inputRef}
              type="text"
              className="w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all hover:bg-slate-200/60 dark:hover:bg-slate-800/80 shadow-inner"
              placeholder={isBn ? 'সেকশন বা সুবিধা খুঁজুন...' : 'Search features or sections...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded-md shadow-xs">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </div>
          </div>
          
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/20 overflow-hidden"
              >
                {displayOptions.length > 0 ? (
                  <ul className="py-2">
                    {searchQuery.trim() === '' && recentSearches.length > 0 && (
                      <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        {isBn ? 'সাম্প্রতিক অনুসন্ধান' : 'Recent Searches'}
                      </div>
                    )}
                    {displayOptions.map((opt) => (
                      <li key={opt.id}>
                        <button
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 transition-colors text-slate-700 dark:text-slate-200"
                          onClick={() => {
                            saveRecentSearch(opt);
                            const el = document.getElementById(opt.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            trackEvent('cta_click', `Jump to ${opt.id}`);
                          }}
                        >
                          <span className="text-base p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{opt.icon}</span>
                          <span className="font-semibold">{isBn ? opt.labelBn : opt.labelEn}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    {isBn ? 'কোনো সেকশন পাওয়া যায়নি' : 'No sections found'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons & Language / Palette Switchers */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Direct Helpline Call */}
          <a
            href={`tel:${OFFICIAL_INFO.helpline1}`}
            onClick={() => trackEvent('call_click', 'Header Helpline Click', OFFICIAL_INFO.helpline1)}
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-800 text-xs font-bold transition-all shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span>{OFFICIAL_INFO.helpline1}</span>
          </a>

          {/* Palette Selector */}
          <div className="hidden lg:block">
            <PaletteSelector
              currentPalette={currentPalette}
              onSelectPalette={onSelectPalette}
              lang={lang}
              compact={true}
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              playClickSound();
              const nextTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(nextTheme);
              trackEvent('cta_click', `Switched Theme to ${nextTheme}`);
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all shadow-xs shrink-0"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              playClickSound();
              const nextLang = isBn ? 'en' : 'bn';
              setLang(nextLang);
              trackEvent('cta_click', `Switched Language to ${nextLang.toUpperCase()}`);
            }}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] sm:text-xs font-bold border border-slate-200/80 dark:border-slate-800 transition-all shadow-xs shrink-0"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
            <span className="font-extrabold">{isBn ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Owner Analytics Tracker */}
          <button
            onClick={() => {
              playModalOpenSound();
              onOpenAnalytics();
              trackEvent('cta_click', 'Opened Owner Analytics');
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0"
            title={isBn ? 'অ্যানালিটিক্স ড্যাশবোর্ড' : 'Analytics Tracker'}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden xl:inline">
              {isBn ? 'ট্র্যাকার' : 'Analytics'}
            </span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={() => {
              playModalOpenSound();
              onOpenAdmin();
              trackEvent('cta_click', 'Opened Admin CMS Modal');
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0"
            title={isBn ? 'এডমিন প্যানেল' : 'Admin Panel'}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
            <span className="hidden md:inline ml-1.5">
              {isBn ? 'এডমিন' : 'Admin'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

