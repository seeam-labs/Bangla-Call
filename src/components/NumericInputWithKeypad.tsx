import React, { useState, useRef, useEffect } from 'react';
import { CustomNumericKeypad } from './CustomNumericKeypad';

interface NumericInputWithKeypadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (val: string) => void;
  maxLength?: number;
  inputClassName?: string;
  icon?: React.ReactNode;
}

export const NumericInputWithKeypad: React.FC<NumericInputWithKeypadProps> = ({
  value,
  onValueChange,
  maxLength = 20,
  inputClassName = '',
  icon,
  ...inputProps
}) => {
  const [showKeypad, setShowKeypad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.keypad-portal') || target.id === 'keypad-portal') {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowKeypad(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative w-full flex items-center">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
        <input
          {...inputProps}
          type="text"
          inputMode="none"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, maxLength);
            onValueChange(val);
          }}
          onClick={(e) => {
            setShowKeypad(true);
            if (inputProps.onClick) inputProps.onClick(e);
          }}
          onFocus={(e) => {
            setShowKeypad(true);
            if (inputProps.onFocus) inputProps.onFocus(e);
          }}
          maxLength={maxLength}
          className={`${inputClassName} ${icon ? 'pl-10' : ''}`}
        />
      </div>
      
      <CustomNumericKeypad 
        isOpen={showKeypad}
        value={value} 
        onChange={onValueChange} 
        maxLength={maxLength} 
        onClose={() => setShowKeypad(false)} 
      />
    </div>
  );
};
