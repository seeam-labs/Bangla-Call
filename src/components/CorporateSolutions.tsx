import React from 'react';
import { Building2, CheckCircle2, ArrowUpRight, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface CorporateSolutionsProps {
  lang: Language;
  onRequestQuote: () => void;
}

export const CorporateSolutions: React.FC<CorporateSolutionsProps> = ({ lang, onRequestQuote }) => {
  const isBn = lang === 'bn';

  const corpFeatures = [
    {
      titleBn: 'IVR অটোমেটেড ভয়েস রেসপন্স',
      titleEn: 'IVR Automated Welcome Voice',
      descBn: 'গ্রাহক কল করলে ব্র্যান্ডের স্বাগতম মেসেজ এবং বিভাগভিত্তিক কল ট্রাফিকের ব্যবস্থাপনা।',
      descEn: 'Professional IVR greeting menu routing callers to sales, support, or billing.',
    },
    {
      titleBn: 'একাদিক লাইন ও এক্সটেনশন',
      titleEn: 'Multiple Lines & Extensions',
      descBn: 'অফিসের সব কর্মকর্তা/কর্মচারীর জন্য আলাদা এক্সটেনশন নম্বর (e.g. 101, 102) ব্যবহারের সুযোগ।',
      descEn: 'Internal extension dialing across departments with unlimited internal free calling.',
    },
    {
      titleBn: 'লাইভ কল মনিটরিং ও রিপোর্টিং',
      titleEn: 'Live Call Analytics & CDR Logs',
      descBn: 'সকল ইনবাউন্ড ও আউটবাউন্ড কলের লাইভ ট্র্যাকিং, রেকর্ড ও ড্যাশবোর্ড রিপোর্ট।',
      descEn: 'Real-time call tracking, call detail records (CDR), and agent performance reports.',
    },
    {
      titleBn: 'টোল-ফ্রি ও পার্কিং সার্ভিস',
      titleEn: 'Toll-Free & Call Parking',
      descBn: 'ভবিষ্যতের জন্য 16এক্সএক্সএক্সএক্স বা 88এক্সএক্সএক্সএক্স টোল ফ্রি নম্বর পার্কিং সুবিধা।',
      descEn: 'Toll-free 16XXXXXX number integration and multi-line call parking capabilities.',
    },
  ];

  return (
    <div id="corporate" className="p-3.5 sm:p-6 space-y-6 w-full min-w-0 max-w-full">
      <div className="bg-gradient-to-br from-white via-slate-50 to-slate-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm overflow-hidden relative min-w-0 w-full">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10 min-w-0 w-full">
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{isBn ? 'AmarIP & PBX সল্যুশন' : 'Corporate IP-PBX Solution'}</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading break-words">
              {isBn
                ? 'উন্নত আইপি টেলিফোন ও স্মার্ট কল সেন্টার সল্যুশন'
                : 'Enterprise IP Telephony & Smart Call Center for Business'}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed break-words">
              {isBn
                ? 'আপনার ব্যবসার নির্ভরযোগ্য যোগাযোগের জন্য আমরা দিচ্ছি আধুনিক IP-PBX, IVR অটোমেশন, একাধিক লাইন এবং এইচ ডি ভয়েস কোয়ালিটি সমন্বিত ফুল সার্ভিস।'
                : 'Upgrade your corporate communication with state-of-the-art IP-PBX, IVR greetings, multiple extensions, and HD voice clarity.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onRequestQuote();
                  trackEvent('cta_click', 'Corporate Quote Request Click');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-brand-primary/20 transition-all"
              >
                <span>{isBn ? 'কর্পোরেট কোটেশন গ্রহণ করুন' : 'Get Corporate Quote'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={OFFICIAL_INFO.orderUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('cta_click', 'AmarIP Order Link Click')}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <Cpu className="w-4 h-4 text-brand-primary dark:text-brand-primary-hover" />
                <span>{isBn ? 'AmarIP অর্ডার পোর্টাল' : 'AmarIP Order Portal'}</span>
              </motion.a>
            </div>
          </div>

          {/* Right Column Features */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full">
            {corpFeatures.map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors min-w-0 w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover flex items-center justify-center mb-2.5 border border-slate-500/20 dark:border-slate-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-1 font-heading break-words">
                  {isBn ? f.titleBn : f.titleEn}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                  {isBn ? f.descBn : f.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
