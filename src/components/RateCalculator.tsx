import React, { useState } from 'react';
import { Calculator, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BANGLA_CALL_RATE, CALCULATOR_DEFAULT_OPERATOR_RATE } from '../data/banglaCallData';
import { Language } from '../types';
import { trackEvent } from '../lib/analytics';

interface RateCalculatorProps {
  lang: Language;
  onClaimSavings: () => void;
}

export const RateCalculator: React.FC<RateCalculatorProps> = ({ lang, onClaimSavings }) => {
  const isBn = lang === 'bn';
  const [monthlyMins, setMonthlyMins] = useState<number>(1000);

  // Calculations
  const currentCost = Math.round(monthlyMins * CALCULATOR_DEFAULT_OPERATOR_RATE);
  const banglaCallCost = Math.round(monthlyMins * BANGLA_CALL_RATE);
  
  const monthlySavings = currentCost - banglaCallCost;
  const yearlySavings = monthlySavings * 12;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    savings: (monthlySavings * (i + 1))
  }));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMonthlyMins(val);
    trackEvent('calc_use', `Calculated Talktime: ${val} mins/mo`, `Savings: BDT ${monthlySavings}/mo`);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-6 w-full min-w-0 max-w-full">
      <div className="max-w-4xl mx-auto bg-slate-50/50 dark:bg-slate-950/40 p-3.5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-w-0 w-full">
        <div className="text-center max-w-2xl mx-auto mb-6 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-brand-primary dark:text-brand-primary-hover border border-slate-500/20 dark:border-slate-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>{isBn ? 'খরচ হিসাব ক্যালকুলেটর' : 'Cost Savings Calculator'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading break-words">
            {isBn
              ? 'মাসে কত BDT বাঁচবে? নিজেই হিসাব করে দেখুন!'
              : 'Calculate How Much You Save Each Month!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 break-words">
            {isBn
              ? 'অন্য অপারেটরের 1.80 BDT রেটের বিপরীতে বাংলা কলের 30 পয়সা রেটে আপনার জমানো BDT!'
              : 'Compare standard ~1.80 BDT/min mobile rates against Bangla Call’s 0.30 BDT/min rate!'}
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-w-0 w-full">
          {/* Slider Column */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 min-w-0 w-full">
            <div className="flex justify-between items-center mb-4 min-w-0">
              <label className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 min-w-0 truncate pr-2">
                {isBn ? 'প্রত্যাশিত মাসিক কথা বলার মিনিট:' : 'Expected monthly talk time:'}
              </label>
              <span className="text-lg sm:text-xl font-extrabold text-brand-primary dark:text-brand-primary-hover font-mono bg-slate-50 dark:bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                {monthlyMins} {isBn ? 'মিনিট' : 'mins'}
              </span>
            </div>
            
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={monthlyMins}
              onChange={handleSliderChange}
              className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary-hover"
            />
            
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mt-2 font-mono">
              <span>100 {isBn ? 'মিনিট' : 'mins'}</span>
              <span>5,000 {isBn ? 'মিনিট' : 'mins'}</span>
              <span>10,000 {isBn ? 'মিনিট' : 'mins'}</span>
            </div>
            
            {/* Quick preset buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              {[500, 1000, 3000, 5000].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setMonthlyMins(mins);
                    trackEvent('calc_use', `Preset Talktime: ${mins} mins`);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    monthlyMins === mins
                      ? 'bg-brand-primary text-white border-brand-primary-hover font-bold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  {mins} {isBn ? 'মি' : 'm'}
                </button>
              ))}
            </div>

            {/* Chart Area */}
            <div className="mt-8 h-48 w-full select-none">
              <p className="text-xs text-slate-500 font-bold mb-2 text-center uppercase tracking-wider">{isBn ? 'বার্ষিক সঞ্চয় গ্রাফ' : 'Annual Savings Growth'}</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${isBn ? 'মাস' : 'M'}${val}`} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `৳${val/1000}k`} />
                  <Tooltip 
                    formatter={(value: any) => [`৳${value}`, isBn ? 'সঞ্চয়' : 'Savings']}
                    labelFormatter={(label: any) => `${isBn ? 'মাস' : 'Month'} ${label}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="savings" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Savings Highlight Display */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-950/90 via-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-500/20 dark:border-slate-500/20 text-center relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <TrendingDown className="w-24 h-24 text-brand-primary dark:text-brand-primary-hover" />
            </div>
            <div className="relative z-10">
              <p className="text-xs uppercase font-bold tracking-wider text-brand-primary dark:text-brand-primary-hover mb-1 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-brand-primary-hover" />
                {isBn ? 'আপনার মাসিক সাশ্রয়' : 'Your Monthly Savings'}
              </p>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight my-1">
                BDT {monthlySavings.toLocaleString()}
              </div>
              
              <p className="text-xs text-brand-primary-hover dark:text-brand-light font-medium mb-4">
                {isBn
                  ? `বছরে মোট সাশ্রয় প্রায় BDT ${yearlySavings.toLocaleString()} BDT!`
                  : `Save ~BDT ${yearlySavings.toLocaleString()} BDT per year!`}
              </p>
              
              {/* Comparison breakdown */}
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 py-3 px-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 mb-5 font-mono text-left">
                <div className="flex justify-between">
                  <span>{isBn ? 'অন্যান্য সিম (1.80BDT/মি):' : 'Other Sim (~1.80 BDT):'}</span>
                  <span className="text-slate-500 dark:text-slate-400 line-through">BDT {currentCost}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-primary dark:text-brand-primary-hover">
                  <span>{isBn ? 'বাংলা কল (0.30BDT/মি):' : 'Bangla Call (0.30 BDT):'}</span>
                  <span>BDT {banglaCallCost}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onClaimSavings();
                  trackEvent('cta_click', 'Claim Calculator Savings Click');
                }}
                className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-slate-950/50 transition-all"
              >
                <span>{isBn ? 'এই সেভিংস উপভোগ করুন' : 'Claim These Savings'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
