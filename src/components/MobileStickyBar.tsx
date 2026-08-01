import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface MobileStickyBarProps {
  lang: Language;
  onOpenLeadForm: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ lang, onOpenLeadForm }) => {
  const isBn = lang === 'bn';

  return (
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="p-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl flex items-center gap-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
        <button
          onClick={() => {
            onOpenLeadForm();
            trackEvent('cta_click', 'Mobile Sticky Get Number');
          }}
          className="flex-1 py-3 px-3 rounded-xl bg-brand-primary active:scale-95 text-on-primary font-black text-[13px] flex items-center justify-center gap-1.5 shadow-md shadow-brand-primary/20 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isBn ? 'ফ্রি 09649 নম্বর বুক করুন' : 'Get Free 09649 Number'}</span>
        </button>

        <a
          href={`https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(
            isBn
              ? 'হ্যালো বাংলা কল! 👋\nআমি নতুন 09649 সংযোগ নিতে চাই। এ বিষয়ে বিস্তারিত জানতে চাই।'
              : 'Hello Bangla Call! 👋\nI want to register a new 09649 Bangla Call number. I would like to know more details.'
          )}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent('whatsapp_click', 'Mobile Sticky WhatsApp Click')}
          className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 active:bg-slate-200 dark:active:bg-slate-700 font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <MessageCircle className="w-5 h-5 text-brand-primary fill-brand-primary/20" />
        </a>
      </div>
    </div>
  );
};
