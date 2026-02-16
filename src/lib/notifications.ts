/**
 * Notification utilities: Messenger-style sound, vibration, and browser notifications.
 * Uses HTMLAudioElement with a pre-generated WAV for reliable playback outside user gestures.
 */

let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// Generate a Messenger-style two-tone chime as a WAV data URI
const MESSENGER_CHIME_URI = (() => {
  const sampleRate = 44100;
  const totalDuration = 1.0; // seconds
  const numSamples = Math.floor(sampleRate * totalDuration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  // Messenger-style chime: two ascending tones, repeated twice
  const tones = [
    { freq: 784, start: 0, dur: 0.12 },     // G5
    { freq: 1047, start: 0.12, dur: 0.18 },  // C6
    { freq: 784, start: 0.45, dur: 0.12 },   // G5
    { freq: 1047, start: 0.57, dur: 0.18 },  // C6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const tone of tones) {
      const tLocal = t - tone.start;
      if (tLocal >= 0 && tLocal < tone.dur) {
        // Envelope: fast attack, sustain, quick release
        const attackEnd = 0.01;
        const releaseStart = tone.dur * 0.7;
        let env = 1.0;
        if (tLocal < attackEnd) {
          env = tLocal / attackEnd;
        } else if (tLocal > releaseStart) {
          env = Math.max(0, 1.0 - (tLocal - releaseStart) / (tone.dur - releaseStart));
        }

        // Primary tone + octave harmonic for brightness
        const primary = Math.sin(2 * Math.PI * tone.freq * tLocal) * 0.7;
        const harmonic = Math.sin(2 * Math.PI * tone.freq * 2 * tLocal) * 0.25;
        const third = Math.sin(2 * Math.PI * tone.freq * 3 * tLocal) * 0.1;
        sample += (primary + harmonic + third) * env;
      }
    }

    // Clamp and write
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(binary);
})();

// Get or create the Audio element
const getAudio = (): HTMLAudioElement => {
  if (!notificationAudio) {
    notificationAudio = new Audio(MESSENGER_CHIME_URI);
    notificationAudio.volume = 1.0; // Max volume
    notificationAudio.preload = "auto";
  }
  return notificationAudio;
};

// Call on user gesture to unlock audio for iOS/Safari
export const unlockAudio = () => {
  if (audioUnlocked) return;
  const audio = getAudio();
  // Play and immediately pause to unlock
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

// Play the Messenger-style notification chime
export const playNotificationSound = () => {
  try {
    const audio = getAudio();
    audio.currentTime = 0;
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log("[Notifications] Messenger chime played successfully");
      }).catch((e) => {
        console.warn("[Notifications] Sound play failed:", e.message);
      });
    }
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
      tag: `maceyrunners-${Date.now()}`,
      requireInteraction: true,
      silent: false,
    });
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
