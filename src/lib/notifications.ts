/**
 * Notification utilities: Messenger-style sound, vibration, and browser notifications.
 * Uses HTMLAudioElement with a pre-generated WAV for reliable playback.
 */

let audioUnlocked = false;

// Generate a Messenger-style two-tone chime as a WAV data URI
const MESSENGER_CHIME_URI = (() => {
  const sampleRate = 44100;
  const totalDuration = 1.0;
  const numSamples = Math.floor(sampleRate * totalDuration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const tones = [
    { freq: 784, start: 0, dur: 0.12 },
    { freq: 1047, start: 0.12, dur: 0.18 },
    { freq: 784, start: 0.45, dur: 0.12 },
    { freq: 1047, start: 0.57, dur: 0.18 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const tone of tones) {
      const tLocal = t - tone.start;
      if (tLocal >= 0 && tLocal < tone.dur) {
        const attackEnd = 0.01;
        const releaseStart = tone.dur * 0.7;
        let env = 1.0;
        if (tLocal < attackEnd) env = tLocal / attackEnd;
        else if (tLocal > releaseStart) env = Math.max(0, 1.0 - (tLocal - releaseStart) / (tone.dur - releaseStart));
        sample += (Math.sin(2 * Math.PI * tone.freq * tLocal) * 0.7
          + Math.sin(2 * Math.PI * tone.freq * 2 * tLocal) * 0.25
          + Math.sin(2 * Math.PI * tone.freq * 3 * tLocal) * 0.1) * env;
      }
    }
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(binary);
})();

/**
 * Unlock audio on user gesture. Creates a fresh Audio element each time
 * and plays it at near-zero volume to satisfy the browser's autoplay policy.
 * After this, subsequent new Audio() + play() calls will work.
 */
export const unlockAudio = () => {
  if (audioUnlocked) return;
  try {
    const a = new Audio(MESSENGER_CHIME_URI);
    a.volume = 0.01; // Near-silent but not muted (muted doesn't count as "play")
    const p = a.play();
    if (p) {
      p.then(() => {
        // Stop after a tiny moment
        setTimeout(() => {
          a.pause();
          a.currentTime = 0;
        }, 50);
        audioUnlocked = true;
        console.log("[Notifications] Audio unlocked via user gesture");
      }).catch(() => {
        console.log("[Notifications] Audio unlock attempt failed");
      });
    }
  } catch (e) {
    console.log("[Notifications] Audio unlock error:", e);
  }
};

/**
 * Play the Messenger-style notification chime at full volume.
 * Creates a new Audio element each time for reliability.
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio(MESSENGER_CHIME_URI);
    audio.volume = 1.0;
    const p = audio.play();
    if (p) {
      p.then(() => {
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

export const isPageVisible = (): boolean => document.visibilityState === "visible";

// Combined handler: play sound + vibrate + show OS notification
export const triggerNotificationAlert = (title: string, message: string) => {
  console.log("[Notifications] Alert triggered:", title, message);
  playNotificationSound();
  vibrateDevice();
  showBrowserNotification(title, message);
};
