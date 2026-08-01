import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Delete, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playKeyPressSound, playClickSound } from '../lib/sounds';

interface CustomNumericKeypadProps {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  onClose?: () => void;
  isOpen?: boolean;
}

export const CustomNumericKeypad: React.FC<CustomNumericKeypadProps> = ({
  value,
  onChange,
  maxLength = 20,
  onClose,
  isOpen = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  const pushedHistoryRef = useRef(false);

  // Keep onCloseRef current without triggering effect re-runs
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle Mobile Back Button / Back Gesture (popstate) & Keyboard Escape
  useEffect(() => {
    if (!isOpen) {
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
      }
      return;
    }

    let isPoppedByHardware = false;
    const keypadStateKey = 'keypad_' + Math.random().toString(36).substring(2, 7);

    try {
      window.history.pushState({ keypadOpen: true, key: keypadStateKey }, '');
      pushedHistoryRef.current = true;
    } catch (e) {
      console.warn('History pushState failed:', e);
    }

    const handlePopState = () => {
      isPoppedByHardware = true;
      pushedHistoryRef.current = false;
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      // Clean up the history state if closed by UI button rather than device back button
      if (pushedHistoryRef.current && !isPoppedByHardware) {
        pushedHistoryRef.current = false;
        if (window.history.state?.keypadOpen) {
          try {
            window.history.back();
          } catch (e) {}
        }
      }
    };
  }, [isOpen]);

  const handleKeyClick = (key: string) => {
    if (key === 'backspace') {
      playClickSound();
      onChange(value.slice(0, -1));
    } else {
      playKeyPressSound(key);
      if (value.length < maxLength) {
        onChange(value + key);
      }
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'backspace'],
  ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          id="keypad-portal" 
          className="keypad-portal fixed bottom-0 inset-x-0 z-[100] flex flex-col justify-end pointer-events-none"
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 p-4 pb-7 sm:pb-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.12)] pointer-events-auto relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-end items-center mb-3 px-1">
                {onClose && (
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-xs sm:text-sm px-4 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 active:bg-sky-500/30 rounded-full active:scale-95 transition-all shadow-xs"
                  >
                    <span>Done</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {keys.map((row, rowIndex) =>
                  row.map((key, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (key) handleKeyClick(key);
                      }}
                      className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90 ${
                        key === '' 
                          ? 'bg-transparent pointer-events-none' 
                          : key === 'backspace'
                          ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60'
                      }`}
                    >
                      {key === 'backspace' ? <Delete className="w-6 h-6 sm:w-7 sm:h-7" /> : key}
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};


