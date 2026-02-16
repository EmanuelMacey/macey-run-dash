/**
 * Notification utilities: sound, vibration, and browser push notifications
 */

// Singleton AudioContext - created once, unlocked on first user gesture
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch (e) {
    console.warn("Could not create AudioContext:", e);
    return null;
  }
};

// Call this on a user gesture (click/tap) to unlock audio
export const unlockAudio = () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(() => {
      console.log("[Notifications] AudioContext unlocked");
    });
  }
};

// Play a short notification sound using Web Audio API
export const playNotificationSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (belt-and-suspenders)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
    console.log("[Notifications] Sound played");
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
};

// Vibrate the device if supported
export const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (e) {
    console.warn("Vibration not supported:", e);
  }
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("[Notifications] Browser does not support notifications");
    return false;
  }
  if (Notification.permission === "granted") {
    console.log("[Notifications] Permission already granted");
    return true;
  }
  if (Notification.permission === "denied") {
    console.log("[Notifications] Permission denied");
    return false;
  }

  const result = await Notification.requestPermission();
  console.log("[Notifications] Permission result:", result);
  return result === "granted";
};

// Show a browser notification (works when tab is in background)
export const showBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.log("[Notifications] Cannot show browser notification, permission:", 
      "Notification" in window ? Notification.permission : "not supported");
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "maceyrunners-notification",
      requireInteraction: false,
    });
    console.log("[Notifications] Browser notification shown");
  } catch (e) {
    console.warn("Could not show browser notification:", e);
  }
};

// Check if the page is currently visible
export const isPageVisible = (): boolean => {
  return document.visibilityState === "visible";
};

// Combined handler: play sound + vibrate + optionally show browser notification
export const triggerNotificationAlert = (title: string, message: string) => {
  console.log("[Notifications] triggerNotificationAlert called:", title, message);
  playNotificationSound();
  vibrateDevice();

  // Show browser notification even when page is visible for now (for testing)
  showBrowserNotification(title, message);
};
