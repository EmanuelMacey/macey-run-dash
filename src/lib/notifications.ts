/**
 * Notification utilities: sound, vibration, and browser push notifications
 */

// Use an HTML Audio element for better cross-browser compatibility
let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// Create a beep sound as a data URI (short sine wave)
const BEEP_DATA_URI = (() => {
  // Generate a WAV file as base64
  const sampleRate = 8000;
  const duration = 0.3;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  // Generate rising tone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 880 + (t / duration) * 400; // 880Hz to 1280Hz
    const envelope = Math.max(0, 1 - (t / duration) * 1.5); // fade out
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(binary);
})();

// Initialize audio element
const getAudio = (): HTMLAudioElement => {
  if (!notificationAudio) {
    notificationAudio = new Audio(BEEP_DATA_URI);
    notificationAudio.volume = 0.5;
  }
  return notificationAudio;
};

// Call this on a user gesture (click/tap) to unlock audio for iOS/Safari
export const unlockAudio = () => {
  if (audioUnlocked) return;
  const audio = getAudio();
  audio.muted = true;
  audio.play().then(() => {
    audio.pause();
    audio.muted = false;
    audio.currentTime = 0;
    audioUnlocked = true;
    console.log("[Notifications] Audio unlocked via user gesture");
  }).catch(() => {
    console.log("[Notifications] Audio unlock failed (will retry on next gesture)");
  });
};

// Play the notification sound
export const playNotificationSound = () => {
  try {
    const audio = getAudio();
    audio.currentTime = 0;
    audio.play().then(() => {
      console.log("[Notifications] Sound played successfully");
    }).catch((e) => {
      console.warn("[Notifications] Sound play failed:", e.message);
    });
  } catch (e) {
    console.warn("[Notifications] Could not play sound:", e);
  }
};

// Vibrate the device if supported
export const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
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

// Show a browser notification
export const showBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "maceyrunners-notification",
      requireInteraction: false,
    });
  } catch (e) {
    console.warn("[Notifications] Browser notification failed:", e);
  }
};

// Check if the page is currently visible
export const isPageVisible = (): boolean => {
  return document.visibilityState === "visible";
};

// Combined handler: play sound + vibrate + optionally show browser notification
export const triggerNotificationAlert = (title: string, message: string) => {
  console.log("[Notifications] Alert triggered:", title, message);
  playNotificationSound();
  vibrateDevice();
  showBrowserNotification(title, message);
};
