import React from 'react';
import { Search, FileCheck, PhoneForwarded, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';

export const OnboardingRoadmap = ({ lang }: { lang: Language }) => {
  const isBn = lang === 'bn';

  const steps = [
    {
      id: 1,
      icon: <Search className="w-7 h-7 text-white" />,
      stepNum: '01',
      titleBn: '১. পছন্দমতো 09649 নম্বর খুঁজুন',
      titleEn: '1. Select Your VIP 09649 Number',
      descBn: 'স্মার্ট সার্চ ইঞ্জিনের মাধ্যমে পছন্দের ডিজিট মিলিয়ে যেকোনো প্রিমিয়াম বা সাধারণ 09649 নম্বর ফ্রিতে বা বোনাসসহ সিলেক্ট করুন।',
      descEn: 'Search and choose your favorite 09649 digit pattern with instant valuation and recharge bonus.',
      timeBn: '⏱️ সময়: ৩০ সেকেন্ড',
      timeEn: '⏱️ Time: 30 Secs',
      badgeBn: 'ফ্রি নির্বাচন',
      badgeEn: 'Free Selection',
      gradient: 'from-sky-500 via-blue-600 to-indigo-600',
      shadow: 'shadow-sky-500/30',
      bgGlow: 'bg-sky-500/10',
      borderColor: 'border-sky-500/40',
      textColor: 'text-sky-400',
    },
    {
      id: 2,
      icon: <FileCheck className="w-7 h-7 text-white" />,
      stepNum: '02',
      titleBn: '২. বুকিং তথ্য জমা দিন',
      titleEn: '2. Submit Booking Info',
      descBn: 'আপনার নাম ও বর্তমান মোবাইল নম্বরটি দিন। হোয়াটসঅ্যাপের মাধ্যমে অতি দ্রুত বুকিং কনফার্ম করে এক্টিভেশন সহায়তা পান।',
      descEn: 'Enter your basic details and instantly confirm booking via WhatsApp for priority account processing.',
      timeBn: '⏱️ সময়: ১ মিনিট',
      timeEn: '⏱️ Time: 1 Min',
      badgeBn: 'সহজ এক্টিভেশন',
      badgeEn: 'Easy Setup',
      gradient: 'from-emerald-500 via-teal-600 to-green-600',
      shadow: 'shadow-emerald-500/30',
      bgGlow: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
    },
    {
      id: 3,
      icon: <PhoneForwarded className="w-7 h-7 text-white" />,
      stepNum: '03',
      titleBn: '৩. এক্টিভেশন ও কথা বলা শুরু',
      titleEn: '3. Instant Line Activation',
      descBn: 'এক্টিভেশন সম্পন্ন হলেই যেকোনো অ্যান্ড্রয়েড/আইফোন অ্যাপ বা ওয়েব পেজ থেকেই সর্বোচ্চ সাশ্রয়ী রেটে কল করা ও ধরা শুরু করুন।',
      descEn: 'Once active, use any SIP app or Web dialer to make HD voice calls across Bangladesh at just 40p/min.',
      timeBn: '⚡ সময়: ৫ মিনিটে রেডি',
      timeEn: '⚡ Time: Ready in 5 Mins',
      badgeBn: 'ইনস্ট্যান্ট সংযোগ',
      badgeEn: 'Instant Live',
      gradient: 'from-purple-500 via-fuchsia-600 to-pink-600',
      shadow: 'shadow-fuchsia-500/30',
      bgGlow: 'bg-fuchsia-500/10',
      borderColor: 'border-fuchsia-500/40',
      textColor: 'text-fuchsia-400',
    }
  ];

  return (
    <section className="py-8 px-2 sm:px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Colorful Glows */}
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-emerald-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-300 text-xs font-black tracking-wide uppercase mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{isBn ? 'সুপার ফাস্ট অনবোর্ডিং' : 'Super Fast Onboarding'}</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {isBn ? 'মাত্র ৩ ধাপে সংযোগ নিন' : 'Get Connected in 3 Simple Steps'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          {isBn
            ? 'কোনো জটিল কাগজপত্র ছাড়াই ৫ মিনিটে আপনার স্মার্টফোন বা পিসিতে বাংলা কল 09649 নাম্বার চালু করুন।'
            : 'Get your official 09649 IPTSP line activated on your phone or PC in under 5 minutes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900/90 border-2 ${step.borderColor} shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between group backdrop-blur-xl`}
          >
            {/* Top Step Number Accent */}
            <div className="flex items-center justify-between mb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.shadow} group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter opacity-80 ${step.textColor}`}>
                  {step.stepNum}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${step.bgGlow} ${step.textColor} border ${step.borderColor}`}>
                  {isBn ? step.badgeBn : step.badgeEn}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2.5 mb-6">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {isBn ? step.titleBn : step.titleEn}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                {isBn ? step.descBn : step.descEn}
              </p>
            </div>

            {/* Bottom Time Pill */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {isBn ? step.timeBn : step.timeEn}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
