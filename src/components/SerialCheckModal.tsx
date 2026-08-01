import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Loader2, CheckCircle2, XCircle, Heart, Download, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { OFFICIAL_INFO } from '../data/banglaCallData';

interface SerialCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialInput?: string;
  favorites: string[];
  onToggleFavorite: (num: string) => void;
  onSelectNumber: (num: string) => void;
}

interface SerialItem {
  fullNumber: string;
  isAvailable: boolean | null;
  isLoading: boolean;
}

export const SerialCheckModal: React.FC<SerialCheckModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialInput = '',
  favorites,
  onToggleFavorite,
  onSelectNumber,
}) => {
  const [mounted, setMounted] = useState(false);
  // Default prefix e.g. "096499" or "09649" + initialInput
  const [serialPrefix, setSerialPrefix] = useState('');
  const [itemCount, setItemCount] = useState<number>(20);
  const [results, setResults] = useState<SerialItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');

  const isBn = lang === 'bn';

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      // Determine default serial prefix
      const pref = initialInput.replace(/\D/g, '');
      if (!pref) {
        setSerialPrefix('096499');
      } else if (pref.startsWith('09649')) {
        setSerialPrefix(pref);
      } else {
        setSerialPrefix(`${OFFICIAL_INFO.prefix}${pref}`);
      }
      setResults([]);
    }
  }, [isOpen, initialInput]);

  if (!mounted) return null;

  // Generate sequence of numbers based on serialPrefix
  const generateSerialBatch = (prefixStr: string, count: number) => {
    const cleanPrefix = prefixStr.replace(/\D/g, '');
    const list: string[] = [];

    if (cleanPrefix.length >= 11) {
      // Already 11 digits, derive base number and increment
      const baseNum = parseInt(cleanPrefix, 10);
      for (let i = 0; i < count; i++) {
        const numStr = (baseNum + i).toString().padStart(11, '0');
        if (numStr.startsWith('09649')) {
          list.push(numStr);
        }
      }
    } else {
      // It's a partial prefix e.g. "096499" or "0964990"
      // Fill the remaining digits to make 11 digits
      const remainingDigits = 11 - cleanPrefix.length;
      if (remainingDigits > 0) {
        for (let i = 0; i < count; i++) {
          const suffix = i.toString().padStart(remainingDigits, '0');
          list.push(`${cleanPrefix}${suffix}`);
        }
      } else {
        list.push(cleanPrefix);
      }
    }

    return list;
  };

  const handleStartSerialCheck = async () => {
    if (!serialPrefix.trim()) return;
    setIsChecking(true);

    const batchNumbers = generateSerialBatch(serialPrefix, itemCount);
    const initialItems: SerialItem[] = batchNumbers.map((num) => ({
      fullNumber: num,
      isAvailable: null,
      isLoading: true,
    }));

    setResults(initialItems);

    // Process in batches of 5 concurrent requests
    for (let i = 0; i < batchNumbers.length; i += 5) {
      const currentBatch = batchNumbers.slice(i, i + 5);

      await Promise.all(
        currentBatch.map(async (num) => {
          try {
            const res = await fetch(`/api/number/check?q=${num}`);
            let avail: boolean | null = null;
            if (res.ok) {
              const data = await res.json();
              // Trust ONLY a real boolean; unknown stays null (not "available").
              avail = typeof data.available === 'boolean' ? data.available : null;
            }
            setResults((prev) =>
              prev.map((item) =>
                item.fullNumber === num ? { ...item, isAvailable: avail, isLoading: false } : item
              )
            );
          } catch (e) {
            setResults((prev) =>
              prev.map((item) =>
                item.fullNumber === num ? { ...item, isAvailable: null, isLoading: false } : item
              )
            );
          }
        })
      );
    }

    setIsChecking(false);
  };

  const handleSaveAllAvailable = () => {
    const availableItems = results.filter((r) => r.isAvailable === true);
    availableItems.forEach((item) => {
      if (!favorites.includes(item.fullNumber)) {
        onToggleFavorite(item.fullNumber);
      }
    });
  };

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Serial Number,Status\n";
    results.forEach((res) => {
      const status = res.isAvailable === true ? "Available" : res.isAvailable === false ? "Sold" : "Unknown";
      csvContent += `${res.fullNumber},${status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `serial_check_${serialPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter((r) => {
    if (filter === 'available') return r.isAvailable === true;
    if (filter === 'sold') return r.isAvailable === false;
    return true;
  });

  const availableCount = results.filter((r) => r.isAvailable === true).length;
  const soldCount = results.filter((r) => r.isAvailable === false).length;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isBn ? 'সিরিয়াল চেক (Serial Check)' : 'Serial Check'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isBn ? 'সম্পূর্ণ সিরিয়ালের নম্বরসমূহ চেক করুন' : 'Check consecutive numbers in a serial sequence'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Controls Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'সিরিয়াল প্রিফিক্স / স্টার্টিং নম্বর' : 'Serial Prefix / Starting Number'}
                    </label>
                    <input
                      type="text"
                      value={serialPrefix}
                      onChange={(e) => setSerialPrefix(e.target.value)}
                      placeholder="e.g. 096499 or 0964990000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'চেকের পরিমাণ' : 'Serial Length'}
                    </label>
                    <select
                      value={itemCount}
                      onChange={(e) => setItemCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value={10}>10 {isBn ? 'টি নম্বর' : 'Numbers'}</option>
                      <option value={20}>20 {isBn ? 'টি নম্বর' : 'Numbers'}</option>
                      <option value={30}>30 {isBn ? 'টি নম্বর' : 'Numbers'}</option>
                      <option value={50}>50 {isBn ? 'টি নম্বর' : 'Numbers'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-500">
                    {isBn ? 'উদাহরণ: 096499 দিলে 0964990000 থেকে পর পর চেকিং হবে' : 'Example: "096499" checks 0964990000 onwards'}
                  </p>

                  <button
                    onClick={handleStartSerialCheck}
                    disabled={isChecking || !serialPrefix.trim()}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isBn ? 'চেক করা হচ্ছে...' : 'Checking Serial...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>{isBn ? 'সিরিয়াল চেক শুরু করুন' : 'Start Serial Check'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Stats & Filters */}
              {results.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        filter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isBn ? 'সব' : 'All'} ({results.length})
                    </button>
                    <button
                      onClick={() => setFilter('available')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        filter === 'available'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}
                    >
                      {isBn ? 'এভেইলেবল' : 'Available'} ({availableCount})
                    </button>
                    <button
                      onClick={() => setFilter('sold')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        filter === 'sold'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}
                    >
                      {isBn ? 'সোলেড' : 'Sold'} ({soldCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {availableCount > 0 && (
                      <button
                        onClick={handleSaveAllAvailable}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{isBn ? 'সব এভেইলেবল সেভ করুন' : 'Save All Available'}</span>
                      </button>
                    )}
                    <button
                      onClick={handleDownloadCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredResults.map((item, idx) => {
                    const isFav = favorites.includes(item.fullNumber);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                          ) : item.isAvailable === true ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                            {item.fullNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.isAvailable === true && (
                            <>
                              <button
                                onClick={() => onToggleFavorite(item.fullNumber)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isFav
                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                    : 'bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-500 dark:bg-slate-700 dark:text-slate-400'
                                }`}
                                title={isBn ? 'ফেভারিট সেভ' : 'Save Favorite'}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectNumber(item.fullNumber);
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
                              >
                                {isBn ? 'সিলেক্ট' : 'Select'}
                              </button>
                            </>
                          )}
                          {item.isAvailable === false && (
                            <span className="text-xs font-bold text-rose-500 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10">
                              {isBn ? 'বিক্রি' : 'Sold'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
