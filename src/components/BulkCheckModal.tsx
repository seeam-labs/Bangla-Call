import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CheckCircle2, XCircle, Trash2, ArrowUpDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { OFFICIAL_INFO } from '../data/banglaCallData';

interface BulkCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectNumber: (num: string) => void;
}

interface NumberStatus {
  number: string;
  isAvailable: boolean | null;
  isLoading: boolean;
}

export const BulkCheckModal: React.FC<BulkCheckModalProps> = ({ isOpen, onClose, lang, onSelectNumber }) => {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<NumberStatus[]>([]);
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'available_first'>('default');
  
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const isBn = lang === 'bn';

  const extractNumbers = (text: string) => {
    // Extract 11 digit numbers starting with 09649
    const matches = text.replace(/\D/g, '').match(/09649\d{6}/g) || text.match(/09649\d{6}/g) || [];
    // Or just grab 6 digits if they just paste the last 6
    const sixDigitRegex = /\b\d{6}\b/g;
    const sixDigitMatches = text.match(sixDigitRegex) || [];
    
    const combined = new Set<string>();
    matches.forEach(m => combined.add(m));
    sixDigitMatches.forEach(m => combined.add(`${OFFICIAL_INFO.prefix}${m}`));
    
    // Also try to find any sequence of digits and if it contains 09649 or is 6 digits
    const allDigits = text.split(/[\s,;\n]+/);
    allDigits.forEach(word => {
        const clean = word.replace(/\D/g, '');
        if (clean.length === 11 && clean.startsWith('09649')) {
            combined.add(clean);
        } else if (clean.length === 6) {
            combined.add(`${OFFICIAL_INFO.prefix}${clean}`);
        }
    });

    return Array.from(combined).slice(0, 50); // limit to 50
  };

  const checkAvailability = async (number: string) => {
    try {
      const q = number.replace(/\D/g, '');
      const res = await fetch(`/api/number/check?q=${q}`);
      if (res.ok) {
        const data = await res.json();
        // Trust ONLY a real boolean; unknown stays null (never fake-available).
        return typeof data.available === 'boolean' ? data.available : null;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Number,Status\n";
    results.forEach(res => {
        const status = res.isAvailable === true ? "Available" : res.isAvailable === false ? "Sold" : "Unknown";
        csvContent += `${res.number},${status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bangla_call_bulk_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcess = () => {
    const numbers = extractNumbers(inputText);
    setResults(numbers.map(n => ({ number: n, isAvailable: null, isLoading: false })));
  };

  const handleCheckAll = async () => {
    setIsCheckingAll(true);
    const currentResults = [...results];
    
    // Process in batches of 5
    for (let i = 0; i < currentResults.length; i += 5) {
      const batch = currentResults.slice(i, i + 5);
      
      // Set loading state for batch
      batch.forEach(item => {
        const idx = currentResults.findIndex(r => r.number === item.number);
        if (idx !== -1) currentResults[idx].isLoading = true;
      });
      setResults([...currentResults]);
      
      await Promise.all(batch.map(async (item) => {
        const status = await checkAvailability(item.number);
        const idx = currentResults.findIndex(r => r.number === item.number);
        if (idx !== -1) {
            currentResults[idx].isLoading = false;
            currentResults[idx].isAvailable = status;
        }
      }));
      setResults([...currentResults]);
    }
    
    setIsCheckingAll(false);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortOrder === 'available_first') {
      if (a.isAvailable === true && b.isAvailable !== true) return -1;
      if (a.isAvailable !== true && b.isAvailable === true) return 1;
    }
    return 0;
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isBn ? 'বাল্ক চেক (Bulk Check)' : 'Bulk Check Numbers'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isBn ? 'নম্বরগুলো পেস্ট করুন' : 'Paste your numbers'}
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={isBn ? "যেমন: 09649123456, 09649112233 অথবা শুধু 123456 (কমা বা স্পেস দিয়ে আলাদা করুন)" : "e.g., 09649123456, 09649112233 or just 123456 (separated by comma or space)"}
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                        onClick={handleProcess}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-primary-hover active:scale-95 transition-transform"
                    >
                        {isBn ? 'নম্বরগুলো এক্সট্রাক্ট করুন' : 'Extract Numbers'}
                    </button>
                    {results.length > 0 && (
                        <button
                            onClick={() => { setInputText(''); setResults([]); }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-2 active:scale-95 transition-transform"
                        >
                            <Trash2 className="w-4 h-4" /> {isBn ? 'ক্লিয়ার' : 'Clear'}
                        </button>
                    )}
                  </div>
                </div>

                {results.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                {results.length} {isBn ? 'টি নম্বর পাওয়া গেছে' : 'numbers found'} (Max 50)
                            </span>
                            <div className="flex gap-2">
                                                                <button
                                    onClick={handleDownloadCSV}
                                    className="p-2 border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    title="Download as CSV"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'default' ? 'available_first' : 'default')}
                                    className={`p-2 border rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${sortOrder === 'available_first' ? 'border-brand-primary text-brand-primary bg-brand-primary/10' : 'border-slate-200 dark:border-slate-700'}`}
                                    title="Sort by availability"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCheckAll}
                                    disabled={isCheckingAll}
                                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isCheckingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isBn ? 'সব চেক করুন' : 'Check All'}
                                </button>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {sortedResults.map((res, i) => (
                                <li key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{res.number}</span>
                                    <div className="flex items-center gap-3">
                                        {res.isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                        ) : res.isAvailable === true ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                <CheckCircle2 className="w-4 h-4" /> {isBn ? 'এভেইলেবল' : 'Available'}
                                            </span>
                                        ) : res.isAvailable === false ? (
                                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                                                <XCircle className="w-4 h-4" /> {isBn ? 'বিক্রি' : 'Sold'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                {isBn ? 'যাচাই হয়নি' : 'Unverified'}
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => {
                                                onSelectNumber(res.number);
                                                onClose();
                                            }}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-xs font-bold text-brand-primary"
                                        >
                                            {isBn ? 'ভ্যালুয়েশন' : 'Valuate'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
