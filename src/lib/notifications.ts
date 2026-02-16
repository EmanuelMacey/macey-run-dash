/**
 * Notification utilities: sound, vibration, and browser push notifications
 */

// Play a short notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // rising tone
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
};

// Vibrate the device if supported
export const vibrateDevice = () => {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]); // short-short pattern
    }
  } catch (e) {
    console.warn("Vibration not supported:", e);
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

// Show a browser notification (works when tab is in background)
export const showBrowserNotification = (title: string, body: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "maceyrunners-notification", // replaces previous notification
      requireInteraction: false,
    });
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
  playNotificationSound();
  vibrateDevice();

  // Show browser notification if page is not visible
  if (!isPageVisible()) {
    showBrowserNotification(title, message);
  }
};
