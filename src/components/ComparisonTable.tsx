import React, { useState } from 'react';
import { COMPARISON_DATA } from '../data/banglaCallData';
import { Language } from '../types';
import { Trophy, CheckCircle2, ArrowRight, Sparkles, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface ComparisonTableProps {
  lang: Language;
  onOpenLeadForm: () => void;
  isLoading?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ lang, onOpenLeadForm, isLoading = false }) => {
  const isBn = lang === 'bn';
  const [callingMinutes, setCallingMinutes] = useState<number>(1000);

  // Calculate monthly costs based on real BTRC & operator rates in Bangladesh
  // Rates (inclusive of taxes/bonuses):
  // Bangla Call = 0.30 BDT/min base (effective ~0.27 BDT with 10% instant recharge bonus)
  // Alaap (BTCL) = 0.345 BDT/min (30 Paisa + 15% VAT)
  // Brilliant Connect = 0.40 BDT/min (30 Paisa + VAT + SD)
  // Mobile SIM (GP/Robi/Banglalink) = 1.05 BDT/min (Standard off-net call rate + 33.25% SD/VAT)
  const chartData = [
    {
      name: isBn ? 'বাংলা কল (09649)' : 'Bangla Call (09649)',
      cost: Math.round(callingMinutes * 0.30),
      rate: isBn ? '30 পয়সা/মি. (+10% বোনাস)' : '30p/min (+10% Bonus)',
      color: '#10b981',
      isHighlight: true,
    },
    {
      name: isBn ? 'আলাপ (Alaap)' : 'Alaap (BTCL)',
      cost: Math.round(callingMinutes * 0.345),
      rate: isBn ? '34.5 পয়সা/মি. (+ভ্যাট)' : '34.5p/min (+VAT)',
      color: '#0284c7',
      isHighlight: false,
    },
    {
      name: isBn ? 'ব্রিলিয়ান্ট (Brilliant)' : 'Brilliant Connect',
      cost: Math.round(callingMinutes * 0.40),
      rate: isBn ? '40.0 পয়সা/মি. (+ভ্যাট)' : '40.0p/min (+VAT)',
      color: '#8b5cf6',
      isHighlight: false,
    },
    {
      name: isBn ? 'মোবাইল সিম (GP/Robi)' : 'Mobile SIM (GP/Robi)',
      cost: Math.round(callingMinutes * 1.05),
      rate: isBn ? '1.05 BDT/মি. (+ভ্যাট+এসডি)' : '1.05 BDT/min (+Tax)',
      color: '#f43f5e',
      isHighlight: false,
    },
  ];

  const banglaCallCost = Math.round(callingMinutes * 0.30);
  const mobileCost = Math.round(callingMinutes * 1.05);
  const savingsBdt = mobileCost - banglaCallCost;
  const savingsPercent = Math.round((savingsBdt / mobileCost) * 100);

  return (
    <div id="comparison-section" className="p-3.5 sm:p-6 space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4 shrink-0" />
          <span>{isBn ? 'কেন বাংলা কল সেরা?' : 'Why Bangla Call is Best'}</span>
        </div>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading break-words">
          {isBn
            ? 'বাংলা কল বনাম অন্যান্য আইপিএসপি ও মোবাইল অপারেটর'
            : 'Bangla Call vs Alaap, Brilliant & Regular Mobile Operators'}
        </h2>
        <p className="mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-300 break-words">
          {isBn
            ? 'এক নজরে দেখে নিন কেন 3 লক্ষ+ প্রবাসী ও বাংলাদেশী গ্রাহক অন্যান্য সার্ভিসের চেয়ে বাংলা কল বেছে নিয়েছেন'
            : 'See why over 300,000+ expats and local users choose Bangla Call for unbeatable value and quality.'}
        </p>
      </div>

      {/* Visual Cost Comparison Bar Chart (Recharts) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 space-y-4 sm:space-y-6 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary dark:text-brand-primary-hover uppercase tracking-wide mb-1">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>{isBn ? 'ইন্টারেক্টিভ খরচ তুলনা ও সঞ্চয়' : 'Interactive Cost Savings Visualizer'}</span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading break-words">
              {isBn ? 'প্রতি মাসে আপনার কত BDT সাশ্রয় হবে?' : 'How Much Will You Save Every Month?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
              {isBn ? 'আপনার মাসিক কলিং মিনিট সিলেক্ট করে সরাসরি খরচের পার্থক্য দেখুন:' : 'Select your monthly calling volume to compare costs:'}
            </p>
          </div>

          {/* Minutes Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {[500, 1000, 2500, 5000].map((mins) => (
              <button
                key={mins}
                onClick={() => setCallingMinutes(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  callingMinutes === mins
                    ? 'bg-white text-brand-primary shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mins} {isBn ? 'মি.' : 'min'}
              </button>
            ))}
          </div>
        </div>

        {/* Savings Highlights Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-500/30 text-brand-primary-hover dark:text-brand-light flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-brand-primary dark:text-brand-primary-hover">
                {isBn ? 'বাংলা কল খরচ (' + callingMinutes + ' মি.)' : 'Bangla Call Cost (' + callingMinutes + 'm)'}
              </p>
              <p className="text-lg font-black"> BDT {banglaCallCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                {isBn ? 'সাধারণ সিম খরচ (' + callingMinutes + ' মি.)' : 'Regular SIM Cost (' + callingMinutes + 'm)'}
              </p>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400"> BDT {mobileCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-primary to-teal-600 text-white shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-100">
                {isBn ? 'আপনার মাসিক সাশ্রয়' : 'Your Monthly Savings'}
              </p>
              <p className="text-xl font-black text-white"> BDT {savingsBdt.toLocaleString()} ({savingsPercent}% {isBn ? 'কম' : 'less'})</p>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" BDT " />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-white text-xs space-y-1.5 min-w-[160px] backdrop-blur-md">
                        <p className="font-extrabold text-sky-400 text-sm">{data.name}</p>
                        <p className="text-slate-200 flex justify-between gap-2">
                          <span>{isBn ? 'মোট খরচ:' : 'Total Cost:'}</span>
                          <strong className="text-emerald-400 font-mono text-sm">BDT {data.cost}</strong>
                        </p>
                        <p className="text-slate-300 flex justify-between gap-2 pt-1 border-t border-slate-800">
                          <span>{isBn ? 'কল রেট:' : 'Rate:'}</span>
                          <span className="font-bold text-white">{data.rate}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table Container with responsive scroll */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden min-w-0 w-full">
        {/* Mobile Swipe Notice */}
        <div className="md:hidden px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-brand-primary-hover dark:text-brand-light flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary dark:text-brand-primary-hover shrink-0" />
            {isBn ? 'সম্পূর্ণ দেখতে ডানে-বামে সোয়াইপ করুন' : 'Swipe horizontally to view full matrix'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-primary dark:text-brand-primary-hover animate-pulse shrink-0" />
        </div>

        <div className="overflow-x-auto min-w-0 w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/4">
                  {isBn ? 'ফিচার বা সুবিধা' : 'Feature / Benefit'}
                </th>
                <th className="p-4 sm:p-5 text-center bg-gradient-to-b from-sky-600 via-sky-700 to-indigo-800 text-white border-x-2 border-sky-500 shadow-md w-1/4 relative overflow-hidden">
                  <div className="inline-block bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow-sm mb-1">
                    {isBn ? 'আমাদের সেবা ★ সেরা ভ্যালু' : 'OUR SERVICE ★ BEST VALUE'}
                  </div>
                  <div className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-sm">
                    {isBn ? 'বাংলা কল (09649)' : 'Bangla Call (09649)'}
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[11px] font-bold text-sky-100 bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-0.5 rounded-lg shadow-inner">
                      {isBn ? '৩০ পয়সা / মি. + ১০% বোনাস' : '30p/min + 10% Bonus'}
                    </span>
                  </div>
                </th>
                <th className="p-4 sm:p-5 text-center bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold w-1/6 border-b border-slate-200 dark:border-slate-700">
                  {isBn ? 'আলাপ (Alaap)' : 'Alaap (BTCL)'}
                </th>
                <th className="p-4 sm:p-5 text-center bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold w-1/6 border-b border-slate-200 dark:border-slate-700">
                  {isBn ? 'ব্রিলিয়ান্ট (Brilliant)' : 'Brilliant'}
                </th>
                <th className="p-4 sm:p-5 text-center bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold w-1/6 border-b border-slate-200 dark:border-slate-700">
                  {isBn ? 'কথন (Kothon)' : 'Kothon'}
                </th>
                <th className="p-4 sm:p-5 text-center bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold w-1/6 border-b border-slate-200 dark:border-slate-700">
                  {isBn ? 'মোবাইল সিম (GP/Robi)' : 'Mobile SIM'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4 sm:p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    </td>
                    <td className="p-4 sm:p-5 border-x border-slate-500/20">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : (
                COMPARISON_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    row.isHighlight ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50/40 dark:bg-slate-900/20'
                  }`}
                >
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isBn ? row.featureBn : row.featureEn}</span>
                  </td>

                  {/* Bangla Call (Highlighted Column) */}
                  <td className="p-3 sm:p-4 text-center bg-sky-50/80 dark:bg-sky-950/40 border-x-2 border-sky-400/80 font-extrabold text-sky-950 dark:text-sky-100">
                    <span>{isBn ? row.banglaCallBn : row.banglaCallEn}</span>
                  </td>

                  {/* Alaap */}
                  <td className="p-4 sm:p-5 text-center text-slate-600 dark:text-slate-300">
                    {row.alaapBn}
                  </td>

                  {/* Brilliant */}
                  <td className="p-4 sm:p-5 text-center text-slate-600 dark:text-slate-300">
                    {row.brilliantBn}
                  </td>

                  {/* Kothon */}
                  <td className="p-4 sm:p-5 text-center text-slate-600 dark:text-slate-300">
                    {row.kothonBn}
                  </td>

                  {/* Standard SIM */}
                  <td className="p-4 sm:p-5 text-center text-slate-500 dark:text-slate-400">
                    {row.standardSimBn}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Bottom Call To Action in Matrix */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              {isBn ? 'সরাসরি সেরা আইপিএসপি সার্ভিস বেছে নিন' : 'Ready to switch to the #1 IP TSP in BD?'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? 'এক মিনিটে রেজিস্ট্রেশন সম্পন্ন করুন ও পছন্দের কাস্টম নম্বর এক্টিভ করুন।'
                : 'Complete registration in 1 minute and get your custom VIP number activated.'}
            </p>
          </div>

          <button
            onClick={onOpenLeadForm}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>{isBn ? 'পছন্দের নম্বর এক্টিভ করুন' : 'Activate Choice Number'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

