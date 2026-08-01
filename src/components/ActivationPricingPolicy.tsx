import React from 'react';
import { ACTIVATION_POLICY_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { ShieldCheck, Gift, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivationPricingPolicyProps {
  lang: Language;
  onOpenLeadForm: () => void;
}

export const ActivationPricingPolicy: React.FC<ActivationPricingPolicyProps> = ({
  lang,
  onOpenLeadForm,
}) => {
  const isBn = lang === 'bn';

  return (
    <div className="p-3 sm:p-6 space-y-6 w-full min-w-0 max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800 w-full min-w-0">
        <div className="max-w-3xl min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{isBn ? 'স্বচ্ছ প্রাইসিং প্রতিশ্রুতি' : 'Transparent Pricing Guarantee'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading break-words">
            {isBn ? ACTIVATION_POLICY_INFO.headlineBn : ACTIVATION_POLICY_INFO.headlineEn}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {isBn ? ACTIVATION_POLICY_INFO.subHeadlineBn : ACTIVATION_POLICY_INFO.subHeadlineEn}
          </p>
        </div>

        {/* Highlight Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-center shadow-sm flex-1 sm:flex-initial min-w-[130px]">
            <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'নম্বর কেনার ফি' : 'Number Charge'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">BDT 0 (ফ্রি)</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-center shadow-sm flex-1 sm:flex-initial min-w-[130px]">
            <span className="block text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              {isBn ? 'ইনস্ট্যান্ট বোনাস' : 'Recharge Bonus'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">+10% বোনাস</span>
          </div>
        </div>
      </div>

      {/* 2 Official Activation Packages */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
              <Gift className="w-5 h-5 text-brand-primary dark:text-brand-primary-hover" />
              <span>
                {isBn ? 'অফিশিয়াল এক্টিভেশন প্যাকেজ' : 'Official Activation Packages'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? 'নম্বর বিনামূল্যে বুক করুন। শুধুমাত্র আপনার ব্যবহারের টকটাইমের প্রাথমিক রিচার্জ প্রয়োজন।'
                : 'Free number allocation. Initial recharge goes 100% directly to your talktime balance.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0 w-full">
          {ACTIVATION_POLICY_INFO.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl p-4 sm:p-6 border flex flex-col justify-between transition-all duration-300 min-w-0 w-full ${
                pkg.popular
                  ? 'bg-white border-2 border-emerald-500/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                  : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badge */}
              {pkg.badgeBn && (
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      pkg.popular
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isBn ? pkg.badgeBn : pkg.badgeEn}
                  </span>
                </div>
              )}

              <div>
                <h4 className="text-xl font-bold font-heading mb-1 text-slate-900">
                  {isBn ? pkg.nameBn : pkg.nameEn}
                </h4>

                <div className={`mt-4 mb-6 p-4 rounded-xl space-y-2 border ${
                  pkg.popular ? 'bg-emerald-50/70 border-emerald-200/90' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">
                      {isBn ? 'নম্বর মূল্য:' : 'Number Price:'}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {isBn ? pkg.numberPriceBn : pkg.numberPriceEn}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-200/80">
                    <span className="font-semibold text-slate-700">
                      {isBn ? 'এক্টিভেশন রিচার্জ:' : 'Activation Recharge:'}
                    </span>
                    <span className="text-lg font-extrabold font-mono text-slate-900">
                      {isBn ? pkg.rechargeBn : pkg.rechargeEn}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      {isBn ? 'ইনস্ট্যান্ট ১০% বোনাস:' : 'Instant 10% Bonus:'}
                    </span>
                    <span className="font-bold text-emerald-600">
                      {isBn ? pkg.bonusBn : pkg.bonusEn}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-6">
                  {(isBn ? pkg.featuresBn : pkg.featuresEn).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span className="text-slate-700 font-medium">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usable Callout & Action */}
              <div className="pt-2 border-t border-slate-200">
                <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl mb-4 border ${
                  pkg.popular
                    ? 'bg-emerald-100/80 text-emerald-900 border-emerald-200/90'
                    : 'bg-sky-50 text-sky-900 border-sky-200/80'
                }`}>
                  <Sparkles className={`w-4 h-4 shrink-0 ${pkg.popular ? 'text-emerald-700' : 'text-sky-700'}`} />
                  <span>{isBn ? pkg.usableBn : pkg.usableEn}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={onOpenLeadForm}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  }`}
                >
                  <span>{isBn ? (pkg.id === 'vip' ? 'পছন্দের VIP নম্বর অর্ডার করুন' : 'এই নম্বর বুক করুন') : (pkg.id === 'vip' ? 'Order Custom VIP Number' : 'Claim This Free Number')}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Policy Guarantee Pillars */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 font-heading">
          {isBn ? 'আমাদের স্বচ্ছ প্রাইসিং নীতিমালা' : 'Transparent Policy Highlights'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(isBn ? ACTIVATION_POLICY_INFO.keyPointsBn : ACTIVATION_POLICY_INFO.keyPointsEn).map(
            (point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug">{point}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* BTRC KYC Notice Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed min-w-0 w-full">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 break-words">
          <span className="font-bold text-amber-950 dark:text-amber-300 mr-1">
            {isBn ? 'অফিশিয়াল BTRC কাস্টমার গাইডলাইন:' : 'Official BTRC Customer Compliance:'}
          </span>
          {isBn
            ? 'সরকারি বিটিআরসি (BTRC) নিয়ম অনুযায়ী এনআইডি ও বায়োমেট্রিক KYC সম্পূর্ণ হলেই আপনার ০৯৬৪৯ নম্বরটি তাৎক্ষণিক সক্রিয় করা হয়। অর্ডার করার পর আমাদের কাস্টমার সাকসেস এজেন্ট সরাসরি আপনাকে হোয়াটসঅ্যাপ/কলে সাপোর্ট দেবেন।'
            : 'As per BTRC regulatory guidelines, instant line activation occurs upon biometric KYC verification. Our support agent will assist you immediately after form submission.'}
        </div>
      </div>
    </div>
  );
};
