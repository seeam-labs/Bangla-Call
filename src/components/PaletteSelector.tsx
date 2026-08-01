import React from 'react';
import { Palette } from 'lucide-react';
import { ColorPaletteId, COLOR_PALETTES, Language } from '../types';

interface PaletteSelectorProps {
  currentPalette: ColorPaletteId;
  onSelectPalette: (paletteId: ColorPaletteId) => void;
  lang: Language;
  compact?: boolean;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPalette,
  onSelectPalette,
  lang,
  compact = true,
}) => {
  const isBn = lang === 'bn';
  const activeObj = COLOR_PALETTES.find((p) => p.id === currentPalette) || COLOR_PALETTES[0];

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        title={isBn ? 'থিম প্যালেট পরিবর্তন করুন' : 'Change Color Palette'}
      >
        <Palette className="w-3.5 h-3.5 text-brand-primary" />
        <div className="flex items-center gap-1">
          {activeObj.previewColors.slice(0, 3).map((hex, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {!compact && (
          <span className="ml-1 hidden sm:inline">
            {isBn ? activeObj.nameBn : activeObj.nameEn}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-72 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 hidden group-hover:block group-focus-within:block z-50">
        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">
            {isBn ? 'ওয়েবসাইট কালার প্যালেট সিলেক্টর' : 'Select Theme Color Palette'}
          </p>
        </div>

        <div className="space-y-1">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = pal.id === currentPalette;
            return (
              <button
                key={pal.id}
                onClick={() => onSelectPalette(pal.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 font-extrabold border border-slate-300 dark:border-slate-700'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{isBn ? pal.nameBn : pal.nameEn}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal line-clamp-1">
                    {isBn ? pal.descriptionBn : pal.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {pal.previewColors.map((hex, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
