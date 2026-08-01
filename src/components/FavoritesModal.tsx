import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Trash2, ChevronRight } from "lucide-react";
import { Language } from "../types";
import { useToast } from "./Toast";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onRemove: (num: string) => void;
  onSelect: (num: string) => void;
  lang: Language;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemove,
  onSelect,
  lang,
}) => {
  const isBn = lang === "bn";
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? "সংরক্ষিত নম্বরসমূহ" : "Saved Numbers"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {favorites.length === 0 ? (
                <div className="text-center py-10 opacity-60 flex flex-col items-center">
                  <Heart className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isBn
                      ? "আপনার কোনো সংরক্ষিত নম্বর নেই"
                      : "You have no saved numbers"}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {favorites.map((num) => (
                    <li
                      key={num}
                      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between group transition-colors hover:border-brand-primary/50"
                    >
                      <button
                        onClick={() => {
                          onSelect(num);
                          onClose();
                        }}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm text-brand-primary font-bold">
                          #
                        </div>
                        <div>
                          <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                            {num}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            onSelect(num);
                            onClose();
                          }}
                          className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            onRemove(num);
                            showToast(
                              isBn ? "নম্বর মুছে ফেলা হয়েছে" : "Number Removed",
                              isBn ? "নম্বরটি আপনার সংরক্ষিত তালিকা থেকে মুছে ফেলা হয়েছে" : "The number has been removed from your saved list",
                              "success"
                            );
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
