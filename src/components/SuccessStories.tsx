import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, Building2, Briefcase, Coffee, Code2 } from 'lucide-react';
import { Language } from '../types';

const TESTIMONIALS = [
  {
    id: 1,
    nameBn: 'মাহমুদ হাসান',
    nameEn: 'Mahmud Hasan',
    companyBn: 'প্রো টেক সল্যুশনস',
    companyEn: 'Pro Tech Solutions',
    logo: <Building2 className="w-8 h-8" />,
    contentBn: 'কর্পোরেট সিম নেওয়ার পর থেকে আমাদের টিমের কল খরচ প্রায় ৪০% কমেছে। তাদের নেটওয়ার্ক কোয়ালিটি এবং কাস্টমার সাপোর্ট এক কথায় চমৎকার।',
    contentEn: 'Since taking the corporate SIM, our team\'s call costs have dropped by almost 40%. Their network quality and customer support are simply excellent.',
    rating: 5,
  },
  {
    id: 2,
    nameBn: 'সাদিয়া ইসলাম',
    nameEn: 'Sadia Islam',
    companyBn: 'ক্রিয়েটিভ ডিজাইন এজেন্সি',
    companyEn: 'Creative Design Agency',
    logo: <Briefcase className="w-8 h-8" />,
    contentBn: 'অফিসের সবার জন্য একই রেটে কথা বলার সুবিধাটা দারুণ। স্পেশাল টোল-ফ্রি নম্বরটি আমাদের কাস্টমারদের আরও বেশি এনগেজ করছে।',
    contentEn: 'The flat flat rate facility for everyone in the office is great. The special toll-free number is engaging our customers even more.',
    rating: 5,
  },
  {
    id: 3,
    nameBn: 'কামরুল রশীদ',
    nameEn: 'Kamrul Rashid',
    companyBn: 'ফ্রেশ ক্যাফে রেইন',
    companyEn: 'Fresh Cafe Rain',
    logo: <Coffee className="w-8 h-8" />,
    contentBn: 'ছোট ব্যবসা হলেও তারা আমাদের যে গুরুত্ব দিয়েছে, তা সত্যিই প্রশংসনীয়। ২৪/৭ সাপোর্ট আমাদের ব্যবসায় দারুণ সাহায্য করেছে।',
    contentEn: 'Even though we are a small business, the importance they gave us is truly commendable. The 24/7 support has been a great help to our business.',
    rating: 4,
  },
  {
    id: 4,
    nameBn: 'তারেক রহমান',
    nameEn: 'Tarek Rahman',
    companyBn: 'ডেভনেক্সট',
    companyEn: 'DevNext',
    logo: <Code2 className="w-8 h-8" />,
    contentBn: 'তাদের এপিআই ইন্টিগ্রেশন অনেক সহজ। আমরা খুব সহজেই আমাদের সিআরএম-এর সাথে কর্পোরেট প্যাকেজ ম্যানেজ করতে পারছি।',
    contentEn: 'Their API integration is very easy. We can easily manage corporate packages with our CRM.',
    rating: 5,
  }
];

export const SuccessStories = ({ lang }: { lang: Language }) => {
  const isBn = lang === 'bn';
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            {isBn ? 'গ্রাহকদের সফলতার গল্প' : 'Client Success Stories'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            {isBn
              ? 'আমাদের কর্পোরেট সেবা দিয়ে হাজারো ব্যবসা কীভাবে উপকৃত হচ্ছে, তা তাদের মুখেই শুনুন।'
              : 'Hear directly from thousands of businesses on how our corporate services are benefiting them.'}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 z-10 p-2 sm:p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-primary hover:scale-110 transition-all focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 z-10 p-2 sm:p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-primary hover:scale-110 transition-all focus:outline-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="overflow-hidden px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center relative"
              >
                <Quote className="absolute top-6 left-6 sm:top-10 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 text-slate-100 dark:text-slate-700/50" />
                
                <div className="flex gap-1 text-amber-400 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < currentTestimonial.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  ))}
                </div>

                <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed mb-8 relative z-10">
                  "{isBn ? currentTestimonial.contentBn : currentTestimonial.contentEn}"
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                    {currentTestimonial.logo}
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isBn ? currentTestimonial.nameBn : currentTestimonial.nameEn}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {isBn ? currentTestimonial.companyBn : currentTestimonial.companyEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-brand-primary w-8' 
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
