// Custom service worker for push notifications with persistent sound
// This file is used by vite-plugin-pwa as the custom service worker

/// <reference lib="webworker" />

// Play notification sound using service worker audio
const playNotificationChime = () => {
  // Service workers can't use AudioContext, but we can post to clients
  self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.postMessage({ type: "PLAY_NOTIFICATION_SOUND" });
    }
  });
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "MaceyRunners";
    const options = {
      body: data.body || "",
      icon: "/pwa-icon-192.png",
      badge: "/pwa-icon-192.png",
      tag: data.data?.order_id || "general-" + Date.now(),
      data: data.data || {},
      vibrate: [300, 150, 300, 150, 400, 200, 300],
      requireInteraction: true,
      silent: false,
      renotify: true,
      actions: [
        { action: "open", title: "View Now" },
        { action: "dismiss", title: "Dismiss" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options).then(() => {
        // Trigger sound in any open client windows
        playNotificationChime();
      })
    );
  } catch (e) {
    console.error("Push event error:", e);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const orderId = event.notification.data?.order_id;
  const targetUrl = orderId ? `/dashboard` : "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Offline support
self.addEventListener("fetch", (event) => {
  // Let workbox handle caching; this is just a fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html");
      })
    );
  }
});
