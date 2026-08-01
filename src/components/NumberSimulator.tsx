import React from 'react';
import { Phone, User, Video, Mic, Grid, Volume2, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface NumberSimulatorProps {
  number: string;
  isVisible: boolean;
  lang: Language;
}

export const NumberSimulator: React.FC<NumberSimulatorProps> = ({ number, isVisible, lang }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-slate-700 shadow-2xl hidden lg:flex flex-col rounded-r-3xl overflow-hidden pointer-events-none z-20"
        >
          {/* iOS-like status bar */}
          <div className="h-6 w-full flex justify-between items-center px-4 pt-1">
            <span className="text-[10px] text-white font-medium">9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 flex items-end gap-[1px]">
                <div className="w-1 bg-white h-1 rounded-sm"></div>
                <div className="w-1 bg-white h-1.5 rounded-sm"></div>
                <div className="w-1 bg-white h-2 rounded-sm"></div>
                <div className="w-1 bg-white h-2.5 rounded-sm"></div>
              </div>
              <div className="w-3.5 h-2.5 bg-white rounded-sm"></div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-start pt-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-3 text-slate-300 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <p className="text-white text-xl font-medium tracking-wide">Unknown</p>
            <p className="text-slate-400 text-sm mt-1">{lang === 'bn' ? 'বাংলাদেশ' : 'Bangladesh'}</p>
            <p className="text-sky-400 text-2xl font-mono mt-3">{number}</p>
            <p className="text-slate-500 text-xs mt-1 animate-pulse">00:12</p>

            <div className="w-full px-6 mt-10 grid grid-cols-3 gap-y-6 gap-x-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white"><Mic className="w-5 h-5" /></div>
                <span className="text-[10px] text-white">mute</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white"><Grid className="w-5 h-5" /></div>
                <span className="text-[10px] text-white">keypad</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white"><Volume2 className="w-5 h-5" /></div>
                <span className="text-[10px] text-white">audio</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white opacity-50"><Phone className="w-5 h-5" /></div>
                <span className="text-[10px] text-white opacity-50">add call</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white"><Video className="w-5 h-5 opacity-50" /></div>
                <span className="text-[10px] text-white opacity-50">FaceTime</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
                <span className="text-[10px] text-white">contacts</span>
              </div>
            </div>

            <div className="mt-10 flex justify-center w-full">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <PhoneOff className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="h-1 w-1/3 bg-slate-500 mx-auto rounded-full mb-2"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
