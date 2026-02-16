/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Extend ServiceWorkerRegistration with PushManager types
interface PushSubscriptionJSON {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: Record<string, string>;
}

interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(options: { userVisibleOnly: boolean; applicationServerKey?: Uint8Array }): Promise<PushSubscription>;
}

interface ServiceWorkerRegistration {
  pushManager: PushManager;
}
