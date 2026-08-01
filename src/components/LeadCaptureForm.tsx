import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Send, MessageCircle, Shield, CheckCircle2, Phone, User, Sparkles, Building, Lock, Copy, Check, X, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { motion } from 'motion/react';
import { OFFICIAL_INFO } from '../data/banglaCallData';
import { Language, Lead, NumberValuation } from '../types';
import { KeyboardField } from './KeyboardField';
import { CameraCapture } from './CameraCapture';
import { copyToClipboard } from '../lib/clipboard';
import { formatApplication, buildWhatsAppUrl } from '../lib/whatsapp';
import { saveLead, trackEvent } from '../lib/analytics';
import { useToast } from './Toast';
import { playAvailableCongratulationSound, playUnavailableSadSound, playSubmissionSuccessSound, playClickSound } from '../lib/sounds';

const onlyDigits = (s: string) => s.replace(/\D/g, '');

const getLeadSchema = (isBn: boolean) => z.object({
  name: z.string().min(2, { message: isBn ? 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' : 'Name must be at least 2 characters' }),
  phone: z.string().regex(/^(?:\+88)?01[3-9]\d{8}$/, { message: isBn ? 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01700000000)' : 'Enter a valid Bangladeshi phone number' }),
});

interface LeadCaptureFormProps {
  lang: Language;
  selectedNumber?: string;
  lockedValuation?: NumberValuation | null;
  onSuccess?: (lead: Lead) => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  lang,
  selectedNumber = '',
  lockedValuation = null,
  onSuccess,
}) => {
  const isBn = lang === 'bn';
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customNum, setCustomNum] = useState(selectedNumber || '09649');
  const [valuation, setValuation] = useState<NumberValuation | null>(lockedValuation);
  const [serviceType, setServiceType] = useState<Lead['serviceType']>('personal');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [nidKey, setNidKey] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<{name?: string, phone?: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  // Auto availability checker and recharge calculation
  const [isCheckingNum, setIsCheckingNum] = useState(false);
  const [numAvailable, setNumAvailable] = useState<boolean | null>(true);

  // Calculate progress
  const requiredFields = 2;
  const completedFields = [name.length >= 2, phone.match(/^(?:\+88)?01[3-9]\d{8}$/)].filter(Boolean).length;
  const progressPercentage = (completedFields / requiredFields) * 100;

  const calculateRechargeForNum = (numStr: string, currentValuation: NumberValuation | null): number => {
    if (currentValuation?.estimatedRechargeBdt) {
      return currentValuation.estimatedRechargeBdt;
    }
    const clean = numStr.replace(/\D/g, '');
    if (!clean) return 100;
    
    if (/(.)\1{3,}/.test(clean) || /1234|4321|0000|5555|7777|8888|9999/.test(clean)) {
      return 1000;
    } else if (/(.)\1{2,}/.test(clean) || /123|321|777|888|999|000/.test(clean)) {
      return 500;
    }
    return 100;
  };

  const effectiveRecharge = calculateRechargeForNum(customNum, valuation);

  useEffect(() => {
    const clean = customNum.replace(/\D/g, '');
    // Only verify a COMPLETE number (11 digits) — avoids per-keystroke sound spam
    // and false "available" claims while typing (B7). null = not yet checked.
    if (clean.length < 11) {
      setNumAvailable(null);
      setIsCheckingNum(false);
      return;
    }

    setIsCheckingNum(true);
    const timer = setTimeout(async () => {
      try {
        // Route through our own API (server-side proxy) rather than calling the
        // third-party endpoint directly from the browser (B3 / CORS).
        const res = await fetch('/api/number/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: clean }),
        });
        const data = res.ok ? await res.json() : { available: null };
        const avail: boolean | null = data.available ?? null;
        setNumAvailable(avail);
        if (avail === true) playAvailableCongratulationSound();
        else if (avail === false) playUnavailableSadSound();
      } catch {
        setNumAvailable(null); // couldn't verify — don't claim available
      } finally {
        setIsCheckingNum(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customNum]);

  useEffect(() => {
    if (selectedNumber) {
      setCustomNum(selectedNumber.startsWith('09649') ? selectedNumber : `09649${selectedNumber.replace(/^0+/, '')}`);
    } else if (!customNum) {
      setCustomNum('09649');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize field only when an external number is selected
  }, [selectedNumber]);

  useEffect(() => {
    if (lockedValuation) {
      setValuation(lockedValuation);
      if (lockedValuation.number) {
        setCustomNum(lockedValuation.number);
      }
    }
  }, [lockedValuation]);

  const validateRealTime = (field: 'name' | 'phone', value: string) => {
    const schema = getLeadSchema(isBn);
    const result = schema.safeParse({ name: field === 'name' ? value : name, phone: field === 'phone' ? value : phone });
    
    if (result.success) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } else {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field as keyof typeof fieldErrors]?.[0] }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (errors.phone || val.length >= 11) validateRealTime('phone', val);
  };

  const validate = () => {
    const schema = getLeadSchema(isBn);
    const result = schema.safeParse({ name, phone });
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: any = {};
      if (fieldErrors.name) newErrors.name = fieldErrors.name[0];
      if (fieldErrors.phone) newErrors.phone = fieldErrors.phone[0];
      setErrors(newErrors);
      return false;
    }
  };

  const handleCopyNumber = async () => {
    if (!customNum) return;
    await copyToClipboard(customNum);
    setCopied(true);
    showToast(
      isBn ? 'নম্বর কপি হয়েছে!' : 'Number Copied!',
      `${customNum} ${isBn ? 'ক্লিপবোর্ডে কপি করা হয়েছে' : 'copied to clipboard'}`,
      'copied'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newLead = saveLead({
      name,
      phone,
      numberChoice: customNum || undefined,
      aiRechargeAmount: valuation?.estimatedRechargeBdt || effectiveRecharge,
      aiTierName: isBn 
        ? (valuation?.tierNameBn || (effectiveRecharge > 100 ? 'ভিআইপি নম্বর' : 'সাধারণ নম্বর')) 
        : (valuation?.tierNameEn || (effectiveRecharge > 100 ? 'VIP Number' : 'Standard Number')),
      serviceType,
      notes: notes || undefined,
      photoKey: photoKey || undefined,
      nidKey: nidKey || undefined,
    });

    setIsSubmitted(true);
    setSubmittedLead(newLead);

    // Toast Notification on Success
    showToast(
      isBn ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted Successfully!',
      isBn ? 'আমাদের প্রতিনিধি 5 মিনিটে যোগাযোগ করবে।' : 'Our support team will contact you in 5 minutes.',
      'success',
      5000
    );

    // Trigger celebration confetti and sound
    playSubmissionSuccessSound();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    if (onSuccess) onSuccess(newLead);
  };

  const handleWhatsAppDirect = () => {
    if (!validate()) return;

    const finalRecharge = valuation?.estimatedRechargeBdt || effectiveRecharge;

    // Save lead first
    const newLead = saveLead({
      name,
      phone,
      numberChoice: customNum || undefined,
      aiRechargeAmount: finalRecharge,
      aiTierName: isBn 
        ? (valuation?.tierNameBn || (effectiveRecharge > 100 ? 'ভিআইপি নম্বর' : 'সাধারণ নম্বর')) 
        : (valuation?.tierNameEn || (effectiveRecharge > 100 ? 'VIP Number' : 'Standard Number')),
      serviceType,
      notes: notes || undefined,
      photoKey: photoKey || undefined,
      nidKey: nidKey || undefined,
    });

    setIsSubmitted(true);
    setSubmittedLead(newLead);

    showToast(
      isBn ? 'হোয়াটসঅ্যাপে রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting to WhatsApp...',
      isBn ? 'চ্যাট বক্সে বুকিং তথ্য প্রস্তুত আছে' : 'Your booking details are formatted in chat',
      'info'
    );

    // WhatsApp-friendly plain text (minimal correct markdown, richer detail)
    const text = formatApplication(
      { name, phone, numberChoice: customNum, serviceType, notes, recharge: finalRecharge, hasPhoto: !!photoKey, hasNid: !!nidKey },
      lang
    );
    trackEvent('whatsapp_click', 'Lead Form WhatsApp Click', phone);
    window.open(buildWhatsAppUrl(text), '_blank');
  };

  return (
    <div id="lead-form-section" className="scroll-mt-24 max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-500/20 dark:border-slate-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60 relative">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider mb-2 shadow-md shadow-sky-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{isBn ? 'ফ্রি রেজিস্ট্রেশন ও বুকিং' : 'Free Registration & Booking'}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
          {isBn ? 'আজই যুক্ত হন বাংলা কলে!' : 'Get Your Bangla Call Number Today'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
          {isBn
            ? 'ফর্মটি পূরণ করুন, আমাদের প্রতিনিধি আপনাকে 5 মিনিটে কল বা হোয়াটসঅ্যাপে যোগাযোগ করবেন।'
            : 'Fill out the short form, our support executive will contact you in 5 minutes.'}
        </p>
      </div>

      {isSubmitted && submittedLead ? (
        <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-500/20 dark:border-slate-500/20">
          <div className="w-16 h-16 bg-slate-500/20 text-brand-primary dark:text-brand-primary-hover rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-500/20 dark:border-slate-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
            {isBn ? 'অভিনন্দন! আপনার আবেদন সফল হয়েছে 🎉' : 'Congratulations! Application Submitted 🎉'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6">
            {isBn
              ? `ধন্যবাদ ${submittedLead.name}! আমাদের টিম খুব শীঘ্রই ${submittedLead.phone} নম্বরে যোগাযোগ করবে।`
              : `Thank you ${submittedLead.name}! Our team will contact you shortly at ${submittedLead.phone}.`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${OFFICIAL_INFO.whatsappNumberClean}?text=${encodeURIComponent(
                `হ্যালো, আমি ${submittedLead.name}, কেবল ফর্ম জমা দিয়েছি। পছন্দ নম্বর: ${submittedLead.numberChoice || 'নেই'}`
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', 'Success State WhatsApp Chat')}
              className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-slate-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-950/50"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Instant WhatsApp Chat'}</span>
            </a>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setName('');
                setPhone('');
                setCustomNum('');
                setValuation(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              {isBn ? 'আরেকটি আবেদন করুন' : 'Submit Another Request'}
            </button>
          </div>
        </div>
      ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-600 dark:text-slate-300">
                {isBn ? 'রেজিস্ট্রেশন প্রগ্রেস' : 'Registration Progress'}
              </span>
              <span className="text-brand-primary">
                {completedFields}/{requiredFields} {isBn ? 'সম্পূর্ণ' : 'Completed'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Locked AI Valuation Banner if present */}
          {valuation && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-500/40 text-brand-light text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-brand-primary-hover">
                  <Lock className="w-3.5 h-3.5 text-brand-primary-hover" />
                  {isBn ? 'AI ভেরিফাইড এক্টিভেশন রেট' : 'AI Verified Activation Rate'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-500/20 text-white font-bold text-[10px]">
                  {isBn ? valuation.tierNameBn : valuation.tierNameEn}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm bg-slate-950/80 p-2.5 rounded-xl border border-slate-500/20">
                <span>{isBn ? '1ম এক্টিভেশন রিচার্জ:' : '1st Activation Recharge:'}</span>
                <span className="font-black text-brand-primary-hover text-base">BDT {valuation.estimatedRechargeBdt}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                <span>{isBn ? '10% বোনাস সহ মোট ব্যবহারযোগ্য:' : '10% Bonus Total Usable:'} <strong>BDT {valuation.totalUsableBalanceBdt}</strong></span>
                <span className="text-brand-primary-hover font-semibold">{isBn ? '0 BDT এক্টিভেশন ফি' : '0 BDT Fee'}</span>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {isBn ? 'আপনার পুরো নাম *' : 'Full Name *'}
            </label>
            <KeyboardField
              keyboard="text"
              value={name}
              onValueChange={(v) => { setName(v); if (errors.name || v.length > 2) validateRealTime('name', v); }}
              placeholder={isBn ? 'যেমন: মোহাম্মদ আরিফ' : 'e.g. John Doe'}
              icon={<User className={`w-4 h-4 ${errors.name ? 'text-rose-500' : 'text-slate-500'}`} />}
              className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm rounded-xl pr-4 py-2.5 border ${errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-slate-500'} focus:outline-none transition-colors`}
            />
            {errors.name && <span className="text-rose-500 text-[10px] mt-1 block">{errors.name}</span>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {isBn ? 'মোবাইল নম্বর (যোগাযোগের জন্য) *' : 'Contact Mobile Number *'}
            </label>
            <KeyboardField
              keyboard="numeric"
              sanitize={onlyDigits}
              value={phone}
              onValueChange={(v) => handlePhoneChange({ target: { value: v } } as any)}
              placeholder="01712345678"
              maxLength={11}
              icon={<Phone className={`w-4 h-4 ${errors.phone ? 'text-rose-500' : 'text-slate-500'}`} />}
              className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm rounded-xl pr-4 py-2.5 border ${errors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-slate-500'} focus:outline-none transition-colors font-mono`}
            />
            {errors.phone && <span className="text-rose-500 text-[10px] mt-1 block">{errors.phone}</span>}
          </div>

          {/* Preferred 09649 Number with Auto Availability Checker, Numpad & Recharge Show */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isBn ? 'পছন্দের 09649 নম্বর (ঐচ্ছিক)' : 'Preferred 09649 Number (Optional)'}</span>
              <span className="text-[10px] text-sky-500 dark:text-sky-400 font-extrabold font-mono bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                {isBn ? 'কী-প্যাড টাইপিং' : 'Numpad Dialing'}
              </span>
            </label>
            <div className="relative flex items-center">
              <KeyboardField
                keyboard="numeric"
                sanitize={onlyDigits}
                value={customNum}
                onValueChange={(val) => setCustomNum(val)}
                maxLength={11}
                placeholder="09649-XXXXXX"
                icon={<Phone className="w-4 h-4 text-sky-500 shrink-0" />}
                className="w-full bg-slate-50 dark:bg-slate-950 text-brand-primary dark:text-brand-primary-hover text-sm font-mono rounded-xl pr-10 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-slate-500 focus:outline-none transition-colors"
              />
              {customNum && (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    handleCopyNumber();
                  }}
                  className="absolute right-2 z-10 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title={isBn ? 'নম্বর কপি করুন' : 'Copy Number'}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Mini Simple One Line Auto Availability Checker & Recharge Amount Show */}
            <div className="mt-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-all">
              <div className="flex items-center gap-1.5 min-w-0">
                {isCheckingNum ? (
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span className="truncate">{isBn ? 'উপলব্ধতা যাচাই হচ্ছে...' : 'Checking availability...'}</span>
                  </span>
                ) : numAvailable === false ? (
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{isBn ? 'নম্বরটি পূর্বেই বুকড' : 'Unavailable'}</span>
                  </span>
                ) : numAvailable === null ? (
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isBn ? 'সম্পূর্ণ নম্বর দিন' : 'Enter full number'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{isBn ? 'উপলব্ধ (Available)' : 'Available'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 font-mono font-extrabold shrink-0">
                <span className="text-[11px] font-sans font-normal text-slate-500 dark:text-slate-400">
                  {isBn ? '১ম রিচার্জ:' : '1st Recharge:'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  BDT {effectiveRecharge}
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-normal">
                  {isBn ? '(+১০% বোনাস)' : '(+10% Bonus)'}
                </span>
              </div>
            </div>
          </div>

          {/* Service Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {isBn ? 'সেবার ধরন' : 'Service Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('personal')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  serviceType === 'personal'
                    ? 'bg-slate-500/20 border-slate-500 text-brand-primary-hover dark:text-brand-light font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isBn ? 'ব্যক্তিগত ব্যবহারের জন্য' : 'Personal Use'}</span>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('corporate')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  serviceType === 'corporate'
                    ? 'bg-slate-500/20 border-slate-500 text-brand-primary-hover dark:text-brand-light font-bold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{isBn ? 'কর্পোরেট / PBX' : 'Corporate / PBX'}</span>
              </button>
            </div>
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {isBn ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Additional Notes (Optional)'}
            </label>
            <KeyboardField
              keyboard="text"
              multiline
              rows={2}
              value={notes}
              onValueChange={setNotes}
              maxLength={500}
              placeholder={isBn ? 'যেমন: সন্ধ্যায় কল করবেন' : 'e.g. Please call in the evening'}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-slate-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Optional KYC: live photo + NID (stored securely; helps fast activation) */}
          <details className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
            <summary className="cursor-pointer select-none px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              {isBn ? 'দ্রুত অ্যাক্টিভেশনের জন্য ছবি ও NID যুক্ত করুন (ঐচ্ছিক)' : 'Add live photo & NID for faster activation (optional)'}
            </summary>
            <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
              <CameraCapture lang={lang} kind="photo" onCaptured={setPhotoKey} />
              <CameraCapture lang={lang} kind="nid" onCaptured={setNidKey} />
            </div>
          </details>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 border border-sky-400/30"
            >
              <Send className="w-4 h-4" />
              <span>{isBn ? 'অনলাইনে রেজিস্ট্রেশন জমা দিন' : 'Submit Registration Now'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleWhatsAppDirect}
              className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-slate-500/20 dark:border-slate-500/20 text-brand-primary-hover dark:text-brand-light hover:text-slate-900 dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-brand-primary-hover text-slate-900 dark:text-white" />
              <span>
                {isBn ? 'হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন' : 'Register Directly via WhatsApp'}
              </span>
            </motion.button>
          </div>

          {/* Security & Govt Compliance Note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <Shield className="w-3.5 h-3.5 text-brand-primary dark:text-brand-primary-hover" />
            <span>
              {isBn
                ? 'আপনার তথ্য বিটিআরসি (BTRC) নিয়ম মেনে সম্পূর্ণ সুরক্ষিত রাখা হয়।'
                : 'Your info is encrypted and BTRC guidelines compliant.'}
            </span>
          </div>
        </form>
      )}
    </div>
  );
};

