import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Delete, ChevronDown, ArrowBigUp, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playKeyPressSound, playClickSound } from "../lib/sounds";

export type KeyboardLayout = "numeric" | "text";

interface OnScreenKeyboardProps {
  isOpen: boolean;
  layout: KeyboardLayout;
  onKey: (char: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  onClose?: () => void;
  allowEnter?: boolean;
}

const ROW1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const ROW2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const ROW3 = ["z", "x", "c", "v", "b", "n", "m"];
const SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "@", ".", "_", "-", "+"];

/** Approx keyboard heights (used by fields to scroll the input above it). */
export const KEYBOARD_HEIGHT: Record<KeyboardLayout, number> = { numeric: 300, text: 320 };

export const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({
  isOpen, layout, onKey, onBackspace, onEnter, onClose, allowEnter,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shift, setShift] = useState(false);
  const [caps, setCaps] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // Escape + mobile back button close the keyboard.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current?.(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const upper = shift || caps;

  const pressChar = (ch: string) => {
    playKeyPressSound(ch);
    onKey(upper ? ch.toUpperCase() : ch);
    if (shift && !caps) setShift(false);
  };

  const Key: React.FC<{ label: React.ReactNode; onPress: () => void; className?: string; wide?: boolean }> = ({
    label, onPress, className = "", wide,
  }) => (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onPress(); }}
      className={`h-12 sm:h-13 rounded-xl flex items-center justify-center text-lg font-semibold select-none active:scale-90 transition-transform ${wide ? "flex-[1.5]" : "flex-1"} ${className || "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
    >
      {label}
    </button>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="keypad-portal fixed bottom-0 inset-x-0 z-[120] flex flex-col justify-end pointer-events-none">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-1.5 pt-2 pb-5 sm:pb-3 shadow-[0_-10px_30px_rgba(0,0,0,0.14)] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-1.5 px-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {layout === "numeric" ? "Numeric" : "Keyboard"}
                </span>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold text-xs px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 rounded-full active:scale-95 transition-all"
                  >
                    Done <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {layout === "numeric" ? (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
                    <Key key={k} label={k} onPress={() => pressChar(k)} className="h-14 sm:h-16 text-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/70 dark:border-slate-700/60" />
                  ))}
                  <div className="h-14 sm:h-16" />
                  <Key label="0" onPress={() => pressChar("0")} className="h-14 sm:h-16 text-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/70 dark:border-slate-700/60" />
                  <Key
                    label={<Delete className="w-6 h-6" />}
                    onPress={() => { playClickSound(); onBackspace(); }}
                    className="h-14 sm:h-16 bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {showSymbols ? (
                    <div className="flex gap-1">{SYMBOLS.map((k) => <Key key={k} label={k} onPress={() => { playKeyPressSound(k); onKey(k); }} />)}</div>
                  ) : (
                    <div className="flex gap-1">{ROW1.map((k) => <Key key={k} label={upper ? k.toUpperCase() : k} onPress={() => pressChar(k)} />)}</div>
                  )}
                  <div className="flex gap-1 px-3">{ROW2.map((k) => <Key key={k} label={upper ? k.toUpperCase() : k} onPress={() => pressChar(k)} />)}</div>
                  <div className="flex gap-1">
                    <Key
                      label={<ArrowBigUp className={`w-5 h-5 ${caps ? "text-sky-500 fill-sky-500" : shift ? "text-sky-500" : ""}`} />}
                      onPress={() => { playClickSound(); if (shift) { setCaps(true); setShift(false); } else if (caps) { setCaps(false); } else { setShift(true); } }}
                      wide
                      className="bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                    />
                    {ROW3.map((k) => <Key key={k} label={upper ? k.toUpperCase() : k} onPress={() => pressChar(k)} />)}
                    <Key
                      label={<Delete className="w-5 h-5" />}
                      onPress={() => { playClickSound(); onBackspace(); }}
                      wide
                      className="bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Key label={showSymbols ? "ABC" : "123"} onPress={() => { playClickSound(); setShowSymbols((s) => !s); }} wide className="bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm" />
                    <Key label="space" onPress={() => { playKeyPressSound(" "); onKey(" "); }} className="flex-[4] text-sm bg-white dark:bg-slate-800 text-slate-500" />
                    {allowEnter
                      ? <Key label={<CornerDownLeft className="w-5 h-5" />} onPress={() => { playClickSound(); onEnter?.(); }} wide className="bg-sky-500 text-white" />
                      : <Key label="." onPress={() => { playKeyPressSound("."); onKey("."); }} />}
                  </div>
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
