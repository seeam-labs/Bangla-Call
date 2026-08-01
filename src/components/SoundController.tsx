import { useEffect } from 'react';
import {
  playClickSound,
  playHoverSound,
  playTypingSound,
} from '../lib/sounds';

export const GlobalSoundHandler = () => {
  useEffect(() => {
    // 1. Global click sound for interactive elements
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or parent is interactive
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], [tabindex]');
      if (interactiveEl && !interactiveEl.classList.contains('no-sound')) {
        playClickSound();
      }
    };

    // 2. Global mouseover/hover sound for buttons & cards
    const handleGlobalMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const hoverable = target.closest('button, a, [role="button"], .group, .hover-sound');
      if (hoverable) {
        playHoverSound();
      }
    };

    // 3. Global typing sound on input/textarea
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
          playTypingSound();
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    window.addEventListener('mouseover', handleGlobalMouseOver, { capture: true });
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      window.removeEventListener('mouseover', handleGlobalMouseOver, { capture: true });
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
    };
  }, []);

  return null;
};

