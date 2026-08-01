import React, { useState } from 'react';
import { ShieldCheck, Lock, Headphones, X, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { Language } from '../types';

export function TrustIndicators({ lang }: { lang: Language }) {
  const isBn = lang === 'bn';
  const [selectedItem, setSelectedItem] = useState<typeof trustItems[0] | null>(null);

  const trustItems = [
    {
      id: 'btrc',
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800/50',
      badgeBn: 'লাইসেন্সপ্রাপ্ত',
      badgeEn: 'Licensed',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      titleBn: 'বিটিআরসি অনুমোদিত',
      titleEn: 'BTRC Approved',
      subtitleBn: 'অনুমোদিত IPTSP অপারেটর',
      subtitleEn: 'Authorized IPTSP Service',
      descBn: 'বাংলাদেশ সরকারের বিটিআরসি (BTRC) অনুমোদিত অফিসিয়াল IPTSP সেবা প্রদানকারী।',
      descEn: 'Official BTRC authorized & licensed IPTSP service provider in Bangladesh.',
      footerBn: 'লাইসেন্স: IPTSP-09649',
      footerEn: 'License: IPTSP-09649',
      detailsBn: [
        'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC) স্বীকৃত লাইসেন্সপ্রাপ্ত অপারেটর (নম্বর সিরিজ: 09649)।',
        'দেশের সকল মোবাইল (GP, Robi, Banglalink, Teletalk) ও ল্যান্ডলাইনের সাথে ইনটারকানেক্টেড ভয়েস সুবিধা।',
        'BTRC-এর জাতীয় স্পেকট্রাম ও নম্বর নীতিমালা মেনে অত্যন্ত সুশৃঙ্খল ও উচ্চ কোয়ালিটি সার্ভিস।',
        'এনআইডি (NID) ও জাতীয় বায়োমেট্রিক সেন্ট্রাল ডাটাবেজের মাধ্যমে নিরাপদ ও বৈধ এক্টিভেশন।'
      ],
      detailsEn: [
        'Officially licensed IPTSP operator recognized by BTRC (Number Series: 09649).',
        'Direct interconnection with all mobile operators (GP, Robi, Banglalink, Teletalk) and landlines.',
        'Operates in strict compliance with national spectrum and numbering guidelines.',
        'Secure legal activation via official NID and central biometric database.'
      ],
      actionTextBn: 'লাইসেন্স নম্বর যাচাই করুন',
      actionTextEn: 'Verify License Info'
    },
    {
      id: 'security',
      icon: <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400" />,
      bgIcon: 'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-800/50',
      badgeBn: '১০০% এনক্রিপ্টেড',
      badgeEn: '100% Encrypted',
      badgeStyle: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      titleBn: '১০০% তথ্য সুরক্ষা',
      titleEn: '100% Data Privacy',
      subtitleBn: 'ব্যাংক-গ্রেড সিকিউরিটি',
      subtitleEn: 'Bank-Grade Security',
      descBn: 'উচ্চমানের ব্যাকএন্ড এনক্রিপশন ও ব্যাংক-গ্রেড সিকিউরিটি দিয়ে আপনার তথ্য সুরক্ষিত।',
      descEn: 'Bank-grade security and advanced voice encryption protecting your identity.',
      footerBn: 'নিরাপদ ভয়েস নেটওয়ার্ক',
      footerEn: 'Secure Voice Network',
      detailsBn: [
        'প্রতিটি ভয়েস সিগন্যালিং ও রিয়েলটাইম অডিও স্ট্রিম 256-bit TLS/SRTP ব্যাকএন্ড এনক্রিপশনে সুরক্ষিত।',
        'গ্রাহকের কল হিস্ট্রি বা ব্যক্তিগত ডেটা সম্পূর্ণ গোপন রাখা হয় এবং কোনো তৃতীয় পক্ষের কাছে শেয়ার করা হয় না।',
        'এন্টারপ্রাইজ-গ্রেড সাইবার সিকিউরিটি ফায়ারওয়াল এবং রিয়েলটাইম ফ্রড প্রিভেনশন অ্যালগরিদম।',
        'ওটিপি (OTP) ও টু-ফ্যাক্টর অথেনটিকেশনের মাধ্যমে একাউন্ট অ্যাক্সেস নিশ্চিতকরণ।'
      ],
      detailsEn: [
        'All voice signaling and real-time audio streams are secured with 256-bit TLS/SRTP encryption.',
        'Customer call records and personal KYC data are strictly confidential and never shared.',
        'Enterprise-grade cyber security firewall with real-time fraud prevention algorithm.',
        'Two-factor authentication and OTP secured portal access for maximum protection.'
      ],
      actionTextBn: 'সিকিউরিটি পলিসি দেখুন',
      actionTextEn: 'View Privacy Policy'
    },
    {
      id: 'support',
      icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />,
      bgIcon: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/50',
      badgeBn: '২৪/৭ অ্যাক্টিভ',
      badgeEn: '24/7 Active',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      titleBn: '২৪/৭ সাপোর্ট',
      titleEn: '24/7 Support',
      subtitleBn: 'সার্বক্ষণিক হটলাইন ও চ্যাট',
      subtitleEn: 'Hotline & Live Chat',
      descBn: 'ফোন কল, হোয়াটসঅ্যাপ এবং অনলাইন চ্যাটের মাধ্যমে সার্বক্ষণিক বিশেষজ্ঞ সাপোর্ট।',
      descEn: 'Round-the-clock live expert help via hotline, WhatsApp, and instant chat.',
      footerBn: 'তাৎক্ষণিক সমাধান',
      footerEn: 'Instant Assistance',
      detailsBn: [
        'হটলাইন ০৯৬৪৯-০০০০০০ এর মাধ্যমে ২৪ ঘণ্টা সরাসরি গ্রাহক সেবা হেল্পডেস্ক।',
        'অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্ট চ্যানেলে যোগাযোগ করে গড়ে ২ মিনিটের কম সময়ে লাইভ সাহায্য।',
        'মোবাইল অ্যাপস (Zoiper/PortSIP/Acrobits) কনফিগারেশন ও আইপি ফোন সেটআপের জন্য ফ্রি রিমোট সাপোর্ট।',
        'কর্পোরেট আইপিবিএক্স গ্রাহকদের জন্য ডেডিকেটেড সাপোর্ট অ্যাকাউন্ট ম্যানেজার।'
      ],
      detailsEn: [
        '24/7 direct customer helpdesk hotline via 09649-000000.',
        'Live WhatsApp assistance with average response time under 2 minutes.',
        'Free remote assistance for mobile app (Zoiper/PortSIP/Acrobits) setup & IP phone config.',
        'Dedicated account management for corporate IP-PBX and trunk customers.'
      ],
      actionTextBn: 'হোয়াটসঅ্যাপে চ্যাট করুন',
      actionTextEn: 'Chat on WhatsApp'
    },
  ];

  return (
    <div className="w-full py-1">
      {/* 2-Column Grid Layout: Row 1 has Card 1 & Card 2, Row 2 has Card 3 */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
        {trustItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`bg-slate-50/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 hover:border-sky-500/50 dark:hover:border-sky-500/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
              idx === 2 ? 'col-span-2' : ''
            }`}
          >
            {/* Ambient hover glow */}
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-sky-500/10 rounded-full blur-lg group-hover:scale-125 transition-transform duration-300 pointer-events-none" />

            <div>
              {/* Top row: Icon + Badge */}
              <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border ${item.bgIcon} group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${item.badgeStyle} truncate max-w-[85px] sm:max-w-none`}>
                  {isBn ? item.badgeBn : item.badgeEn}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {isBn ? item.titleBn : item.titleEn}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                {isBn ? item.subtitleBn : item.subtitleEn}
              </p>
            </div>

            {/* Click to expand indicator */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
              <span>{isBn ? 'বিস্তারিত' : 'Details'}</span>
              <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Modal Popup with Detailed Information */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Section */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3.5 rounded-2xl border ${selectedItem.bgIcon} shrink-0`}>
                {selectedItem.icon}
              </div>
              <div className="pr-6">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border mb-1.5 ${selectedItem.badgeStyle}`}>
                  {isBn ? selectedItem.badgeBn : selectedItem.badgeEn}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {isBn ? selectedItem.titleBn : selectedItem.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isBn ? selectedItem.footerBn : selectedItem.footerEn}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70">
              {isBn ? selectedItem.descBn : selectedItem.descEn}
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                {isBn ? 'প্রধান বৈশিষ্ট্য ও তথ্যাদি' : 'Key Specifications'}
              </h4>
              {(isBn ? selectedItem.detailsBn : selectedItem.detailsEn).map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{detail}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
              
              {selectedItem.id === 'support' ? (
                <a
                  href="https://wa.me/8809649000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all"
                >
                  <span>{isBn ? selectedItem.actionTextBn : selectedItem.actionTextEn}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-md transition-all"
                >
                  <span>{isBn ? 'ঠিক আছে' : 'Got it'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


