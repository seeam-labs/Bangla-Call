import React, { useRef, useState, useEffect, useCallback } from "react";
import { OnScreenKeyboard, KEYBOARD_HEIGHT, KeyboardLayout } from "./OnScreenKeyboard";

interface BaseProps {
  value: string;
  onValueChange: (val: string) => void;
  keyboard?: KeyboardLayout;         // 'numeric' | 'text'
  multiline?: boolean;
  maxLength?: number;
  sanitize?: (raw: string) => string; // e.g. digits-only
  className?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  id?: string;
  name?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  rows?: number;
  ["aria-label"]?: string;
}

type ElRef = HTMLInputElement | HTMLTextAreaElement;

export const KeyboardField: React.FC<BaseProps> = ({
  value, onValueChange, keyboard = "text", multiline = false, maxLength,
  sanitize, className = "", icon, placeholder, id, name, rows = 3, ...rest
}) => {
  const ref = useRef<ElRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const layout: KeyboardLayout = keyboard;

  // Keep the focused field scrolled above the keyboard.
  useEffect(() => {
    if (!open) { document.body.style.paddingBottom = ""; return; }
    const kbH = KEYBOARD_HEIGHT[layout];
    document.body.style.paddingBottom = `${kbH}px`;
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visibleBottom = window.innerHeight - kbH;
      if (rect.bottom > visibleBottom - 12) {
        window.scrollBy({ top: rect.bottom - visibleBottom + 28, behavior: "smooth" });
      }
    });
    return () => { cancelAnimationFrame(raf); document.body.style.paddingBottom = ""; };
  }, [open, layout]);

  // Close on outside interaction (ignore taps on the keyboard portal).
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".keypad-portal")) return;
      if (containerRef.current && !containerRef.current.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler as EventListener);
    };
  }, [open]);

  const apply = useCallback((next: string, caret: number) => {
    let out = next;
    if (sanitize) out = sanitize(out);
    if (maxLength) out = out.slice(0, maxLength);
    onValueChange(out);
    const el = ref.current;
    requestAnimationFrame(() => {
      if (el) { const c = Math.min(caret, out.length); el.selectionStart = el.selectionEnd = c; el.focus(); }
    });
  }, [maxLength, onValueChange, sanitize]);

  const insert = (ch: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    apply(value.slice(0, start) + ch + value.slice(end), start + ch.length);
  };

  const backspace = () => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    if (start !== end) apply(value.slice(0, start) + value.slice(end), start);
    else if (start > 0) apply(value.slice(0, start - 1) + value.slice(start), start - 1);
  };

  const commonProps = {
    ref: ref as any,
    id, name, placeholder,
    value,
    // inputMode="none" suppresses the OS keyboard; physical keyboards still work via onChange.
    inputMode: "none" as const,
    onChange: (e: React.ChangeEvent<ElRef>) => {
      let v = e.target.value;
      if (sanitize) v = sanitize(v);
      if (maxLength) v = v.slice(0, maxLength);
      onValueChange(v);
    },
    onFocus: () => setOpen(true),
    onClick: () => setOpen(true),
    className: `${className} ${icon ? "pl-10" : ""}`,
    ...rest,
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative w-full flex items-center">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">{icon}</div>}
        {multiline
          ? <textarea {...(commonProps as any)} rows={rows} />
          : <input {...(commonProps as any)} type="text" />}
      </div>
      <OnScreenKeyboard
        isOpen={open}
        layout={layout}
        allowEnter={multiline}
        onKey={insert}
        onBackspace={backspace}
        onEnter={() => (multiline ? insert("\n") : setOpen(false))}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};
