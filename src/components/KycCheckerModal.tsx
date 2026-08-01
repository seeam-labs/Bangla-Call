import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { NumericInputWithKeypad } from './NumericInputWithKeypad';
import { trackEvent } from '../lib/analytics';
import { useToast } from './Toast';

interface KycCheckerModalProps {
  lang: Language;
  onOpenLeadForm: () => void;
}

export const KycCheckerModal: React.FC<KycCheckerModalProps> = ({ lang, onOpenLeadForm }) => {
  const isBn = lang === 'bn';
  const { showToast } = useToast();

  const [nidInput, setNidInput] = useState<string>('');
  const [nidType, setNidType] = useState<'smart' | 'old13' | 'old17' | 'invalid' | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleValidateNid = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setNidInput(clean);
    setIsChecked(false);

    if (clean.length === 10) {
      setNidType('smart');
    } else if (clean.length === 13) {
      setNidType('old13');
    } else if (clean.length === 17) {
      setNidType('old17');
    } else {
      setNidType(clean.length > 0 ? 'invalid' : null);
    }
  };

  const handleCheckNow = () => {
    if (!nidType || nidType === 'invalid') {
      showToast(
        isBn ? 'ভুল এনআইডি ফরম্যাট' : 'Invalid NID Format',
        isBn ? 'এনআইডি 10, 13 অথবা 17 ডিজিটের হতে হবে' : 'NID must be 10, 13 or 17 digits',
        'warning'
      );
      return;
    }

    setIsChecked(true);
    trackEvent('calc_use', `NID Format Check: ${nidType}`);
    showToast(
      isBn ? 'এনআইডি ফরম্যাট যাচাই সম্পন্ন!' : 'NID Format Verified!',
      isBn ? 'বিটিআরসি নিয়মাবলী অনুযায়ী আপনার এনআইডি ফরম্যাট বৈধ' : 'Format complies with BTRC IPTSP registration standards',
      'success'
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-500/20 dark:border-slate-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>{isBn ? 'BTRC KYC ফরম্যাট ভ্যালিডেটর' : 'BTRC NID KYC Compliance Checker'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            {isBn ? 'আপনার NID ও বিটিআরসি কেওয়াইসি রেডি কিনা পরীক্ষা করুন' : 'Instant BTRC NID Eligibility & Document Readiness Verification'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isBn ? 'বিটিআরসি নীতিমালা অনুযায়ী 10/13/17 ডিজিট স্মার্ট কার্ড চেক করে নিবন্ধনে সময় বাঁচান।' : 'Validate NID digit length and check document requirements before submitting your booking.'}
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            {isBn ? 'জাতীয় পরিচয়পত্র নম্বর (NID Number):' : 'National ID (NID) Number:'}
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <NumericInputWithKeypad
              value={nidInput}
              onValueChange={handleValidateNid}
              placeholder={isBn ? 'যেমন: 19876543210 (10, 13 বা 17 ডিজিট)' : 'e.g., 19876543210 (10, 13, or 17 digits)'}
              maxLength={17}
              inputClassName="w-full bg-slate-50 dark:bg-slate-950 font-mono text-base font-black text-slate-900 dark:text-brand-light rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-800 focus:border-slate-500 focus:outline-none tracking-widest"
            />
            <button
              onClick={handleCheckNow}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20 shrink-0 transition-all active:scale-95"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              <span>{isBn ? 'যাচাই করুন' : 'Verify NID'}</span>
            </button>
          </div>
        </div>

        {/* Verification Result Badge */}
        {isChecked && nidType && nidType !== 'invalid' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-500/40 text-brand-primary-hover dark:text-brand-light text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                {isBn ? 'বৈধ এনআইডি ফরম্যাট পাওয়া গেছে!' : 'Valid NID Format Detected!'}
              </h5>
            </div>
            <p className="leading-relaxed">
              {nidType === 'smart' && (isBn ? '10 ডিজিটের স্মার্ট এনআইডি কার্ড ফরম্যাট চিহ্নিত করা হয়েছে।' : '10-digit Smart NID format verified.')}
              {nidType === 'old13' && (isBn ? '13 ডিজিটের এনআইডি কার্ড ফরম্যাট চিহ্নিত করা হয়েছে।' : '13-digit legacy NID format verified.')}
              {nidType === 'old17' && (isBn ? '17 ডিজিটের জন্মশালযুক্ত এনআইডি ফরম্যাট চিহ্নিত করা হয়েছে।' : '17-digit full NID format verified.')}
            </p>
          </div>
        )}

        {/* Required Documents Checklist */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider font-heading">
            {isBn ? 'বিটিআরসি নিবন্ধনের জন্য প্রয়োজনীয় ডকুমেন্ট:' : 'Documents Required for BTRC Registration:'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">{isBn ? 'এনআইডি কার্ডের উভয় পিঠ' : 'NID Both Sides'}</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{isBn ? 'স্পষ্ট ছবি বা কপি' : 'Clear photo or PDF'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">{isBn ? 'পাসপোর্ট সাইজ ছবি' : 'Passport Photo'}</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{isBn ? '1 কপি রঙিন ছবি' : '1 copy digital photo'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">{isBn ? 'ট্রেড লাইসেন্স (কর্পোরেট)' : 'Trade License (Corp)'}</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{isBn ? 'শুধু কর্পোরেট সংযোগের জন্য' : 'For corporate PBX only'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isBn ? 'ডকুমেন্ট প্রস্তুত? সরাসরি ফর্ম পূরণ করে 1 মিনিটে নম্বর বুক করুন।' : 'Ready with documents? Fill the form to lock your connection.'}
        </p>
        <button
          onClick={onOpenLeadForm}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-brand-primary/20 transition-all shrink-0"
        >
          <span>{isBn ? 'রেজিস্ট্রেশন শুরু করুন' : 'Proceed to Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
