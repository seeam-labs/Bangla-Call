import React from 'react';
import { UserCheck, ShieldCheck, ExternalLink } from 'lucide-react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface KycGuideProps {
  lang: Language;
}

export const KycGuide: React.FC<KycGuideProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const steps = [
    {
      num: '01',
      titleBn: 'ফর্ম পূরণ ও নম্বর সিলেকশন',
      titleEn: 'Fill Form & Choose Number',
      descBn: 'আমাদের ওয়েবসাইটে আপনার নাম, ফোন নম্বর ও পছন্দের 09649 নম্বরটি বেছে নিন।',
      descEn: 'Submit your contact info and select your custom 09649 VIP number.',
    },
    {
      num: '02',
      titleBn: 'KYC ডকুমেন্টস সাবমিট (kyc.amarip.net)',
      titleEn: 'KYC Upload (kyc.amarip.net)',
      descBn: 'এনআইডি (NID) কার্ডের উভয় পিঠের ছবি ও একটি সেলফি আপলোড করুন। (কর্পোরেটের ক্ষেত্রে ট্রেড লাইসেন্স)।',
      descEn: 'Upload clear photos of NID front/back and a quick selfie (Trade License for corporate).',
    },
    {
      num: '03',
      titleBn: 'ইনস্ট্যান্ট অ্যাক্টিভেশন ও কল শুরু',
      titleEn: 'Instant Line Activation',
      descBn: 'তথ্য যাচাই শেষে 5 মিনিটে সংযোগ সক্রিয় হয়ে যাবে! ব্রাউজার বা অ্যাপ থেকে ফ্রি কলিং শুরু করুন।',
      descEn: 'Account verified in 5 minutes! Start calling via browser or official Android APK.',
    },
  ];

  return (
    <section id="kyc" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isBn ? 'সহজ 3-স্টেপ রেজিস্ট্রেশন' : 'Easy 3-Step KYC Activation'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            {isBn ? 'কীভাবে অনলাইনে 09649 নম্বরটি চালু করবেন?' : 'How to Activate Your 09649 Line Online?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
            {isBn
              ? 'বিটিআরসি (BTRC) নিয়ম অনুযায়ী ঘরে বসেই মাত্র 5 মিনিটে KYC সম্পন্ন করতে পারবেন।'
              : 'Complete compliant KYC in 5 minutes from the comfort of your home.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative hover:border-slate-500/20 dark:border-slate-500/20 transition-colors"
            >
              <span className="text-3xl font-black font-mono text-slate-500/30 absolute top-4 right-5">
                {step.num}
              </span>

              <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 dark:border-slate-500/20 text-brand-primary dark:text-brand-primary-hover flex items-center justify-center font-bold text-sm mb-4">
                {idx + 1}
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 font-heading">
                {isBn ? step.titleBn : step.titleEn}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn ? step.descBn : step.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Direct Link Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-500/20 dark:border-slate-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-primary dark:text-brand-primary-hover shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {isBn
                ? 'অনলাইন KYC পোর্টাল: https://kyc.amarip.net (সম্পূর্ণ নিরাপদ ও বিটিআরসি অনুমোদিত)'
                : 'Direct KYC Portal: https://kyc.amarip.net (Secure & BTRC Compliant)'}
            </p>
          </div>

          <a
            href={OFFICIAL_INFO.kycUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('cta_click', 'KYC Portal Link Click')}
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-slate-950/50 transition-colors"
          >
            <span>{isBn ? 'KYC পোর্টালে যান' : 'Go to KYC Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
