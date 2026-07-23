let registration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Registered');
    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!registration) return null;
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    });
    return subscription;
  } catch (err) {
    console.warn('[Push] Subscription failed:', err);
    return null;
  }
}
