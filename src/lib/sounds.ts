// Synthesized Sound Effects Utility using Web Audio API (Zero external audio file dependency)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a pleasant ascending chime for success events (copy, lock valuation, search success, favorite)
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual oscillator chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a joyful fanfare when a number search returns AVAILABLE (congratulations sound)
 */
export function playAvailableCongratulationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C6 -> E6 -> G6 -> C7 bright celebration
    const notes = [1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a playful sad / disappointed slide sound when a number is UNAVAILABLE / TAKEN
 */
export function playUnavailableSadSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a celebratory fanfare sound when lead submission completes successfully
 */
export function playSubmissionSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play an alert/warning sound
 */
export function playAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(330, now + 0.2);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play an error sound
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [220, 180].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.22);
    });
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a subtle click sound
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a telephone keypad sound (DTMF style click)
 */
export function playKeyPressSound(digit?: string) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Mapping digits to DTMF dual frequencies or dynamic tones
    let f1 = 697;
    let f2 = 1209;
    if (digit === '1') { f1 = 697; f2 = 1209; }
    else if (digit === '2') { f1 = 697; f2 = 1336; }
    else if (digit === '3') { f1 = 697; f2 = 1477; }
    else if (digit === '4') { f1 = 770; f2 = 1209; }
    else if (digit === '5') { f1 = 770; f2 = 1336; }
    else if (digit === '6') { f1 = 770; f2 = 1477; }
    else if (digit === '7') { f1 = 852; f2 = 1209; }
    else if (digit === '8') { f1 = 852; f2 = 1336; }
    else if (digit === '9') { f1 = 852; f2 = 1477; }
    else if (digit === '0') { f1 = 941; f2 = 1336; }

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(f1, now);
    osc2.frequency.setValueAtTime(f2, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.08);
    osc2.stop(now + 0.08);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a rising swell sound for modal openings
 */
export function playModalOpenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Play a falling swell sound for modal closings
 */
export function playModalCloseSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Subtle hover sound for buttons, cards, and interactive elements
 */
let lastHoverTime = 0;
export function playHoverSound() {
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 80) return; // throttle hover sound
  lastHoverTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.025);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.028);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Soft mechanical tick sound when typing in text fields
 */
export function playTypingSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const randomFreq = 800 + Math.random() * 400;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(randomFreq, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Tab switch / view navigation sound
 */
export function playTabSwitchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

/**
 * Background music disabled as requested
 */
let ambientInterval: NodeJS.Timeout | null = null;

export function startAmbientTune() {
  stopAmbientTune();
}

export function stopAmbientTune() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}

export function toggleAmbientTune(): boolean {
  stopAmbientTune();
  return false;
}

export function isAmbientTuneActive(): boolean {
  return false;
}

/**
 * Subtle tick sound on scroll (throttled)
 */
let lastScrollTickTime = 0;
export function playScrollTickSound() {
  const nowMs = Date.now();
  if (nowMs - lastScrollTickTime < 140) return; // limit scroll tick rate
  lastScrollTickTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.015);

    gain.gain.setValueAtTime(0.012, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}



