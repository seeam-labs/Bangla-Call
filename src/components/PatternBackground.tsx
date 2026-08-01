import React from 'react';

export const PatternBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic SVG Pattern based on the active color palette variables */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="telephony-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* Telecom Tower */}
            <path d="M50 20 L40 80 L60 80 Z" stroke="currentColor" fill="none" strokeWidth="1" className="text-brand-primary" />
            <path d="M35 80 L65 80" stroke="currentColor" strokeWidth="2" className="text-brand-primary" />
            <path d="M45 50 L55 50" stroke="currentColor" strokeWidth="1" className="text-brand-primary" />
            <path d="M48 35 L52 35" stroke="currentColor" strokeWidth="1" className="text-brand-primary" />
            <circle cx="50" cy="15" r="3" fill="currentColor" className="text-amber-500 animate-pulse" />
            
            {/* Phone Icon */}
            <path d="M20 30 Q30 30 30 40 L30 50 Q30 60 20 60 L15 60 Q10 60 10 50 L10 40 Q10 30 15 30 Z" stroke="currentColor" fill="none" strokeWidth="1.5" className="text-brand-primary" />
            <circle cx="20" cy="40" r="1.5" fill="currentColor" className="text-brand-primary" />
            <circle cx="20" cy="45" r="1.5" fill="currentColor" className="text-brand-primary" />
            <circle cx="20" cy="50" r="1.5" fill="currentColor" className="text-brand-primary" />

            {/* Signal Waves */}
            <path d="M70 30 Q75 25 80 30" stroke="currentColor" fill="none" strokeWidth="1.5" className="text-brand-primary opacity-50" />
            <path d="M68 25 Q75 15 82 25" stroke="currentColor" fill="none" strokeWidth="1.5" className="text-brand-primary opacity-50" />
            
            {/* Dots */}
            <circle cx="85" cy="70" r="1" fill="currentColor" className="text-brand-primary" />
            <circle cx="15" cy="15" r="1" fill="currentColor" className="text-brand-primary" />
            <circle cx="80" cy="85" r="1.5" fill="currentColor" className="text-amber-500" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#telephony-pattern)" />
      </svg>
    </div>
  );
};
