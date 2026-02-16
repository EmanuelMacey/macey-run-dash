/**
 * Notification utilities: Messenger-style sound, vibration, and browser notifications
 */

let audioCtx: AudioContext | null = null;
let audioUnlocked = false;

// Get or create AudioContext
const getAudioContext = (): AudioContext => {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

// Call this on a user gesture (click/tap) to unlock AudioContext for iOS/Safari
export const unlockAudio = () => {
  if (audioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    // Create a silent buffer to unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    audioUnlocked = true;
    console.log("[Notifications] Audio unlocked via user gesture");
  } catch (e) {
    console.log("[Notifications] Audio unlock failed (will retry on next gesture)");
  }
};

/**
 * Play a loud Messenger-style notification sound using Web Audio API.
 * Two-tone ascending chime, repeated twice — unmistakable and attention-grabbing.
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now); // Full volume
    masterGain.connect(ctx.destination);

    // Messenger-style: two quick ascending tones, repeated
    const tones = [
      // First chime
      { freq: 784, start: 0, duration: 0.15 },    // G5
      { freq: 1047, start: 0.15, duration: 0.2 },  // C6
      // Second chime (repeat)
      { freq: 784, start: 0.5, duration: 0.15 },   // G5
      { freq: 1047, start: 0.65, duration: 0.2 },   // C6
    ];

    tones.forEach(({ freq, start, duration }) => {
      // Primary oscillator
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      // Harmonic for richness
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, now + start);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.8, now + start + 0.02); // Fast attack
      gain.gain.setValueAtTime(0.8, now + start + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, now + start);
      gain2.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
      gain2.gain.setValueAtTime(0.3, now + start + duration * 0.6);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
      osc2.start(now + start);
      osc2.stop(now + start + duration + 0.05);
    });

    console.log("[Notifications] Messenger-style sound played");
  } catch (e) {
    console.warn("[Notifications] Could not play sound:", e);
  }
};

// Vibrate the device if supported
export const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
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
      tag: `maceyrunners-${Date.now()}`, // Unique tag so each notification shows separately
      requireInteraction: true, // Stay visible until user dismisses
      silent: false, // Allow OS sound too
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    console.log("[Notifications] OS notification shown:", title);
  } catch (e) {
    console.warn("[Notifications] Browser notification failed:", e);
  }
};

// Check if the page is currently visible
export const isPageVisible = (): boolean => {
  return document.visibilityState === "visible";
};

// Combined handler: play sound + vibrate + show OS notification
export const triggerNotificationAlert = (title: string, message: string) => {
  console.log("[Notifications] Alert triggered:", title, message);
  playNotificationSound();
  vibrateDevice();
  showBrowserNotification(title, message);
};
