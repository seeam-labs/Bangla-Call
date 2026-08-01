import React from 'react';
import { Phone, Mail, MapPin, Globe, MessageCircle } from 'lucide-react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12 relative z-10">
        {/* Company Info & Logo */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black border border-slate-800 p-0.5 shadow-xl shrink-0">
              <img src="/bangla-call-icon.svg" alt="Bangla Call Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                {OFFICIAL_INFO.brandNameBn}
                <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  IPTSP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {OFFICIAL_INFO.licenseNo}
              </p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-xs">
            {isBn
              ? 'বাংলা কল হলো সরকার কমিউনিকেশন (Sarker Communication)-এর একটি বিটিআরসি অনুমোদিত আইপি টেলিফোন (IPTSP) পরিষেবা। অতি সাশ্রয়ী মূল্যে বিডিজুড়ে ক্রিস্টাল ক্লিয়ার এইচডি ভয়েস পরিষেবা প্রদানে অঙ্গীকারবদ্ধ।'
              : 'Bangla Call is a BTRC licensed IP Telephony Service Provider (IPTSP) operated by Sarker Communication. Providing reliable, crystal-clear voice communication at the lowest rates across Bangladesh.'}
          </p>

          <div className="pt-2">
            <img src="/bangla-call-logo.svg" alt="Bangla Call Logo Banner" className="h-16 rounded-2xl border border-slate-800/80 shadow-md object-contain bg-black/60 p-1" />
          </div>

          <div className="flex items-start gap-2 text-slate-300 pt-1 text-xs">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>{isBn ? OFFICIAL_INFO.addressBn : OFFICIAL_INFO.addressEn}</span>
          </div>
        </div>

        {/* Helplines & Support */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-3 font-heading flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-400" />
            <span>{isBn ? 'যোগাযোগ ও হেল্পলাইন' : 'Helpline & Support'}</span>
          </h4>

          <div className="space-y-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{isBn ? '২৪/৭ সাপোর্ট লাইন:' : '24/7 Helpline:'}</span>
              <div className="flex items-center gap-3 font-mono font-extrabold text-sm text-white">
                <a
                  href={`tel:${OFFICIAL_INFO.helpline1}`}
                  onClick={() => trackEvent('call_click', 'Footer Helpline 1')}
                  className="hover:text-sky-400 transition-colors"
                >
                  {OFFICIAL_INFO.helpline1}
                </a>
                <span className="text-slate-600">|</span>
                <a
                  href={`tel:${OFFICIAL_INFO.helpline2}`}
                  onClick={() => trackEvent('call_click', 'Footer Helpline 2')}
                  className="hover:text-sky-400 transition-colors"
                >
                  {OFFICIAL_INFO.helpline2}
                </a>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </span>
              <a
                href={`https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('whatsapp_click', 'Footer WhatsApp Link')}
                className="text-emerald-300 font-mono font-bold text-sm hover:underline block"
              >
                {OFFICIAL_INFO.whatsappNumber}
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-slate-400">{isBn ? 'অফিসিয়াল পোর্টালে:' : 'Official Portal:'}</span>
              <a
                href={`https://${OFFICIAL_INFO.officialWebsite}`}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-sky-400 font-mono font-semibold"
              >
                {OFFICIAL_INFO.officialWebsite}
              </a>
            </div>
          </div>
        </div>

        {/* Department Emails & Legal Info */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-3 font-heading flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            <span>{isBn ? 'ইমেইল ও দপ্তর' : 'Department Emails'}</span>
          </h4>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{isBn ? 'সেলস বিভাগ:' : 'Sales:'}</span>
              <a href={`mailto:${OFFICIAL_INFO.emails.sales}`} className="text-slate-200 hover:text-sky-400">
                {OFFICIAL_INFO.emails.sales}
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{isBn ? 'টেকনিক্যাল সাপোর্ট:' : 'Technical:'}</span>
              <a href={`mailto:${OFFICIAL_INFO.emails.technical}`} className="text-slate-200 hover:text-sky-400">
                {OFFICIAL_INFO.emails.technical}
              </a>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">{isBn ? 'বিলিং বিষয়াদি:' : 'Billing:'}</span>
              <a href={`mailto:${OFFICIAL_INFO.emails.billing}`} className="text-slate-200 hover:text-sky-400">
                {OFFICIAL_INFO.emails.billing}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Credit */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col items-center justify-center text-center gap-2 text-slate-400 relative z-10">
        <div className="text-base sm:text-lg text-slate-300 font-medium flex items-center justify-center gap-1.5 flex-wrap">
          <span>Crafted with</span>
          <span className="text-rose-500 inline-block">❤️</span>
          <span>by</span>
          <a
            href="https://seeam.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-white hover:text-sky-400 transition-colors"
          >
            Seeam Rahman
          </a>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 tracking-wide font-normal">
          © {new Date().getFullYear()} {isBn ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved'}
        </p>
      </div>
    </footer>
  );
};
