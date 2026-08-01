import React, { useState } from 'react';
import { Gift, Copy, Check, Share2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';
import { copyToClipboard } from '../lib/clipboard';

export const ReferAFriend = ({ lang }: { lang: Language }) => {
  const isBn = lang === 'bn';
  const [copied, setCopied] = useState(false);
  const referralLink = "https://banglacall.com.bd/ref/user_1002";
  const friendsInvited = 3;
  const targetFriends = 5;

  const handleCopy = () => {
    const textToCopy = isBn
      ? `🌟 *বাংলা কল (Bangla Call)*-এ যোগ দিন! 🌟\n\n` +
        `আমার রেফারেল লিংক ব্যবহার করে আজই দেশের সর্বনিম্ন রেট (30 পয়সা/মিনিট)-এ আনলিমিটেড কথা বলা শুরু করুন।\n\n` +
        `🔗 *লিংক:* ${referralLink}`
      : `🌟 Join *Bangla Call* Today! 🌟\n\n` +
        `Use my referral link to start calling at the lowest rate in the country (30 Paisa/Min).\n\n` +
        `🔗 *Link:* ${referralLink}`;
    
    copyToClipboard(textToCopy);
    setCopied(true);
    trackEvent('copy_click', 'Referral Link Copied');
    setTimeout(() => setCopied(false), 2000);
  };

    const handleShare = async () => {
    const textToShare = isBn
      ? `🌟 *বাংলা কল (Bangla Call)*-এ যোগ দিন! 🌟\n\n` +
        `আমার রেফারেল লিংক ব্যবহার করে আজই দেশের সর্বনিম্ন রেট (30 পয়সা/মিনিট)-এ আনলিমিটেড কথা বলা শুরু করুন।`
      : `🌟 Join *Bangla Call* Today! 🌟\n\n` +
        `Use my referral link to start calling at the lowest rate in the country (30 Paisa/Min).`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isBn ? 'বাংলা কল রেফারেল' : 'Bangla Call Referral',
          text: textToShare,
          url: referralLink,
        });
        trackEvent('cta_click', 'Referral Link Shared');
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const progress = (friendsInvited / targetFriends) * 100;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-brand-primary/10 via-white to-brand-primary/5 dark:from-slate-800 dark:via-slate-900 dark:to-brand-primary/10 border border-brand-primary/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm mb-6">
              <Gift className="w-4 h-4" />
              <span>{isBn ? 'রেফার করুন, বোনাস জিতুন!' : 'Refer & Earn Bonus!'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {isBn 
                ? 'বন্ধুদের ইনভাইট করে জিতে নিন ৫০০ টাকা বোনাস' 
                : 'Invite friends and win 500 BDT bonus'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {isBn 
                ? 'আপনার রেফারেল লিংক দিয়ে ৫ জন বন্ধু অ্যাকাউন্ট খুললে আপনি পেয়ে যাবেন ৫০০ টাকা সরাসরি আপনার মেইন ব্যালেন্সে।'
                : 'Get 500 BDT directly in your main balance when 5 friends open an account using your referral link.'}
            </p>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex items-center shadow-inner gap-2">
              <input 
                type="text" 
                value={referralLink} 
                readOnly 
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-400 text-sm px-3 outline-none"
              />
              <button 
                onClick={handleCopy}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                title={isBn ? 'কপি লিংক' : 'Copy Link'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি লিংক' : 'Copy')}</span>
              </button>
              <button 
                onClick={handleShare}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                title={isBn ? 'শেয়ার করুন' : 'Share'}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isBn ? 'শেয়ার' : 'Share'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isBn ? 'আপনার অগ্রগতি' : 'Your Progress'}
            </h3>
            
            <div className="w-full mt-6 mb-2">
              <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>{friendsInvited} {isBn ? 'ইনভাইট' : 'Invited'}</span>
                <span>{targetFriends} {isBn ? 'লক্ষ্য' : 'Target'}</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 to-brand-primary rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              {isBn 
                ? `আর মাত্র ${targetFriends - friendsInvited} জন বন্ধু ইনভাইট করে ৫০০ টাকা বোনাস বুঝে নিন!` 
                : `Invite ${targetFriends - friendsInvited} more friends to claim your 500 BDT bonus!`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
