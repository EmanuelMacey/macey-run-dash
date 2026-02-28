/**
 * Notification utilities: Uber-style loud notification sound, vibration, and browser notifications.
 * Uses AudioContext for reliable, loud playback.
 */

let audioUnlocked = false;
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * Unlock audio on user gesture.
 */
export const unlockAudio = () => {
  if (audioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    // Play a silent buffer to unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    audioUnlocked = true;
    console.log("[Notifications] Audio unlocked via user gesture");
  } catch (e) {
    console.log("[Notifications] Audio unlock error:", e);
  }
};

/**
 * Play a loud Uber-style notification sound using AudioContext.
 * Two-tone ascending "ding-dong" that's unmistakable.
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    
    // Master gain - LOUD
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.9, now);
    masterGain.connect(ctx.destination);

    // Tone 1: Strong "ding" - E5
    const playTone = (freq: number, startTime: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + startTime);
      
      // Sharp attack, sustained, then decay
      gain.gain.setValueAtTime(0, now + startTime);
      gain.gain.linearRampToValueAtTime(volume, now + startTime + 0.01);
      gain.gain.setValueAtTime(volume, now + startTime + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + startTime);
      osc.stop(now + startTime + duration);
      
      // Add harmonic for richness
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, now + startTime);
      gain2.gain.setValueAtTime(0, now + startTime);
      gain2.gain.linearRampToValueAtTime(volume * 0.3, now + startTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration * 0.7);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now + startTime);
      osc2.stop(now + startTime + duration);
    };

    // Uber-style two-tone ascending pattern, played twice for urgency
    // First pair
    playTone(659.25, 0, 0.25, 0.8);      // E5
    playTone(880.00, 0.2, 0.35, 0.9);     // A5
    // Second pair (repeat for emphasis) 
    playTone(659.25, 0.7, 0.25, 0.8);     // E5
    playTone(880.00, 0.9, 0.35, 0.9);     // A5

    console.log("[Notifications] Uber-style sound played");
  } catch (e) {
    console.warn("[Notifications] Could not play sound:", e);
  }
};

// Vibrate the device if supported - strong pattern like Uber
export const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 150, 300, 150, 400]);
    }
  } catch (e) {
    // silent
  }
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

// Show a browser notification (OS-level popup)
export const showBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.log("[Notifications] Permission not granted, skipping OS notification");
    return;
  }
  try {
    const notification = new Notification(title, {
      body,
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      tag: `maceyrunners-${Date.now()}`,
      requireInteraction: true,
      silent: false,
    });
    setTimeout(() => notification.close(), 15000);
    console.log("[Notifications] OS notification shown:", title);
  } catch (e) {
    console.warn("[Notifications] Browser notification failed:", e);
  }
};

export const isPageVisible = (): boolean => document.visibilityState === "visible";

// Combined handler: play sound + vibrate + show OS notification
export const triggerNotificationAlert = (title: string, message: string) => {
  console.log("[Notifications] Alert triggered:", title, message);
  playNotificationSound();
  vibrateDevice();
  showBrowserNotification(title, message);
};
