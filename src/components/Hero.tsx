import React from 'react';
import { ShieldCheck, PhoneCall, Gift, Sparkles, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';
import { NumberValuation } from '../types';

interface HeroProps {
  lang: Language;
  onLockValuation: (val: NumberValuation) => void;
  onOpenLeadForm: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onOpenLeadForm }) => {
  const isBn = lang === 'bn';

  return (
    <div className="relative p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-hidden min-w-0 w-full">
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none transform-gpu" />
      <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />

      {/* Decorative SVG Pattern Element */}
      <div className="absolute inset-0 opacity-10 dark:opacity-[0.03] pointer-events-none bg-dot-pattern" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column Text & CTAs */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-12 space-y-6 text-left max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          {/* Top Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/15 via-blue-600/15 to-indigo-600/15 text-sky-700 dark:text-sky-300 border border-sky-400/30 text-xs font-black uppercase tracking-wider shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{OFFICIAL_INFO.licenseNo}</span>
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm"
            >
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? '10% ইন্সট্যান্ট রিচার্জ বোনাস' : '10% Instant Bonus'}</span>
            </motion.span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-heading">
            {isBn ? (
              <>
                দিনে কিংবা রাতে কথা হবে মন খুলে <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 relative inline-block mt-2">
                  মাত্র 30 পয়সা / মিনিট!
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 7C49.5 2 110.5 1 198 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </>
            ) : (
              <>
                Speak Unlimited Day or Night at <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 relative inline-block mt-2">
                  Just 30 Paisa / Min!
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 7C49.5 2 110.5 1 198 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </>
            )}
          </h1>

          {/* Subheadline & Bullet Highlights */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal text-center mx-auto">
            {isBn
              ? 'বাংলাদেশের যে কোনো মোবাইল বা ল্যান্ডলাইন নম্বরে সর্বনিম্ন কল রেট! কোনো অ্যাপ ইনস্টল ছাড়াই ব্রাউজার থেকে সরাসরি কল করুন।'
              : 'Lowest call rate to any Bangladeshi mobile or landline network. Place crisp HD voice calls directly from web browser without app installation.'}
          </p>

          {/* High Impact Key Features Pill List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-700 dark:text-slate-200">
            <motion.div whileHover={{ y: -2 }} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform text-left">
              <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="font-medium">{isBn ? 'আইপি টু আইপি 100% ফ্রি' : 'Free IP to IP Calling'}</span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform text-left">
              <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="font-medium">{isBn ? 'ব্যালেন্সের মেয়াদ আনলিমিটেড' : 'Unlimited Validity'}</span>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-transform text-left">
              <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="font-medium">{isBn ? 'ফ্রি কলার ও ওয়েলকাম টিউন' : 'Free Caller Tunes'}</span>
            </motion.div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4 w-full max-w-lg mx-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onOpenLeadForm();
                trackEvent('cta_click', 'Hero Primary Claim Button');
              }}
              className="py-4 px-7 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all w-full sm:w-auto border border-sky-400/30"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{isBn ? 'বিনামূল্যে 09649 নম্বর বুকিং করুন' : 'Claim Free 09649 Number'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(
                isBn
                  ? 'হ্যালো বাংলা কল! 👋\nআমি নতুন 09649 সংযোগ নিতে চাই। এ বিষয়ে বিস্তারিত জানতে চাই।'
                  : 'Hello Bangla Call! 👋\nI want to inquire about a new 09649 connection. I would like to know more details.'
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', 'Hero WhatsApp Chat')}
              className="py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-400/20 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'হোয়াটসঅ্যাপ সহায়তা' : 'WhatsApp Instant Chat'}</span>
            </motion.a>
          </div>

          {/* Direct Helpline Text */}
          <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 flex items-center justify-center gap-2 font-medium">
            <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>
              {isBn ? 'সরাসরি কল হেল্পলাইন:' : 'Direct Helpline:'}{' '}
              <a
                href={`tel:${OFFICIAL_INFO.helpline1}`}
                onClick={() => trackEvent('call_click', 'Hero Helpline Phone Link')}
                className="text-slate-900 dark:text-white font-mono font-bold hover:text-brand-primary transition-colors underline underline-offset-4"
              >
                {OFFICIAL_INFO.helpline1}
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
