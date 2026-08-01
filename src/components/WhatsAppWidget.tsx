import React, { useState } from 'react';
import { MessageCircle, X, Check, Phone, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface WhatsAppWidgetProps {
  lang: Language;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChat = (topic: string, msg: string) => {
    trackEvent('whatsapp_click', `WhatsApp Chat: ${topic}`, msg);
    const url = `https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Expanded Floating Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-950/80 overflow-hidden text-slate-900 dark:text-white transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-lg shadow-inner">
                  BC
                </div>
                <span className="w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full absolute bottom-0 right-0 animate-ping" />
                <span className="w-3 h-3 bg-emerald-300 border-2 border-emerald-700 rounded-full absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1 font-heading">
                  <span>{OFFICIAL_INFO.brandNameBn}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                  {isBn ? 'অনলাইন সাপোর্ট সাপোর্ট সার্ভিস' : '24/7 WhatsApp Support'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-emerald-800/60 text-slate-900 dark:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-950/90 text-xs">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
              👋 {isBn
                ? 'স্বাগতম বাংলা কলে! নতুন 09649 সংযোগ, রিচার্জ বোনাস বা যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন।'
                : 'Welcome to Bangla Call! Chat with us directly on WhatsApp for new 09649 connections or inquiries.'}
            </div>

            <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              {isBn ? 'সরাসরি প্রশ্ন নির্বাচন করুন:' : 'Select an option to start chat:'}
            </p>

            {/* Pre-filled Buttons */}
            <button
              onClick={() =>
                handleOpenChat(
                  'VIP Number Request',
                  isBn
                    ? 'হ্যালো, আমি বাংলা কলের নতুন 09649 নম্বর রেজিস্ট্রেশন করতে চাই।'
                    : 'Hello, I want to register a new 09649 Bangla Call VIP number.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:bg-emerald-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 dark:border-emerald-500/20 text-left flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{isBn ? 'নতুন 09649 সংযোগ নিতে চাই' : 'Get new 09649 number'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={() =>
                handleOpenChat(
                  'Corporate PBX Solution',
                  isBn
                    ? 'হ্যালো, আমাদের অফিসের জন্য বাংলা কল কর্পোরেট IP-PBX ও IVR সল্যুশন প্রয়োজন।'
                    : 'Hello, I need info about Bangla Call Corporate IP-PBX solution.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:bg-emerald-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 dark:border-emerald-500/20 text-left flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{isBn ? 'কর্পোরেট / অফিস PBX সল্যুশন' : 'Corporate / PBX Solution'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={() =>
                handleOpenChat(
                  'Recharge & Bonus Help',
                  isBn
                    ? 'হ্যালো, 10% রিচার্জ বোনাস ও ওয়েব কলিং নিয়ে বিস্তারিত জানতে চাই।'
                    : 'Hello, I want to know about 10% recharge bonus and Web Calling.'
                )
              }
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:bg-emerald-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 dark:border-emerald-500/20 text-left flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{isBn ? '10% বোনাস ও রিচার্জ সহায়তা' : 'Recharge & Bonus query'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Helpline phone link fallback */}
            <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
              {isBn ? 'সরাসরি হেল্পলাইনে ফোন দিতে চান?' : 'Prefer direct phone call?'}{' '}
              <a
                href={`tel:${OFFICIAL_INFO.helpline1}`}
                onClick={() => trackEvent('call_click', 'WhatsApp Widget Call Helpline')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{OFFICIAL_INFO.helpline1}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          trackEvent('cta_click', isOpen ? 'Close WhatsApp Widget' : 'Open WhatsApp Widget');
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-xl shadow-emerald-950/70 transition-all hover:scale-105 group"
      >
        <MessageCircle className="w-6 h-6 fill-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-xs font-bold tracking-tight">
          {isBn ? 'হোয়াটসঅ্যাপ সহায়তা' : 'WhatsApp Us'}
        </span>
      </button>
    </div>
  );
};
