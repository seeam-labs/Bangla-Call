import React from 'react';
import {
  PhoneCall,
  Users,
  Gift,
  Clock,
  Globe,
  Sparkles,
  Music,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { OFFERS_LIST } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface OffersGridProps {
  lang: Language;
  onSelectOffer: (title: string) => void;
  isLoading?: boolean;
}

export const OffersGrid: React.FC<OffersGridProps> = ({ lang, onSelectOffer, isLoading = false }) => {
  const isBn = lang === 'bn';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PhoneCall':
        return <PhoneCall className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Users':
        return <Users className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Gift':
        return <Gift className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Music':
        return <Music className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
      default:
        return <PhoneCall className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover" />;
    }
  };

  return (
    <div id="offers" className="p-3.5 sm:p-6 space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 min-w-0">
        <span className="px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
          {isBn ? 'অফিশিয়াল অফার ও সুবিধাসমূহ' : 'Official Features & Offers'}
        </span>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading break-words">
          {isBn ? 'কেন বেছে নেবেন বাংলা কল?' : 'Why Choose Bangla Call IP Telephony?'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base mt-2 break-words">
          {isBn
            ? 'সবচেয়ে সাশ্রয়ী ভয়েস কল, উন্নত এইচডি ভয়েস কোয়ালিটি এবং নিরবচ্ছিন্ন সংযোগ নিশ্চিত করতে আধুনিক আইপি টেলিকম সেবা।'
            : 'Modern IP telephony with lowest call rates, HD voice clarity, and smart digital conveniences across Bangladesh.'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-w-0 w-full">
        {isLoading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="relative rounded-2xl p-4 sm:p-6 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-pulse min-w-0 w-full">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 mb-4"></div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="w-full h-10 rounded-xl bg-slate-200 dark:bg-slate-800 mt-auto"></div>
              </div>
            ))
          : OFFERS_LIST.map((offer) => {
          const title = isBn ? offer.titleBn : offer.titleEn;
          const desc = isBn ? offer.descriptionBn : offer.descriptionEn;
          const badge = isBn ? offer.badgeBn : offer.badgeEn;

          return (
            <div
              key={offer.id}
              className={`relative rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between group min-w-0 w-full ${
                offer.highlight
                  ? 'bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950/40 dark:to-slate-900 border-2 border-slate-500/20 dark:border-slate-500/20 shadow-xl shadow-slate-950/30 hover:scale-[1.02]'
                  : 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                {/* Badge */}
                {badge && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        offer.highlight
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-brand-primary-hover dark:text-brand-light border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {getIcon(offer.iconName)}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug font-heading">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {desc}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  onSelectOffer(title);
                  trackEvent('cta_click', `Offer Card Click: ${offer.id}`);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-slate-500/20 dark:border-slate-500/20 text-brand-primary dark:text-brand-primary-hover font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary dark:text-brand-primary-hover" />
                <span>{isBn ? 'এই সুবিধাটি বুক করুন' : 'Claim This Offer'}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
