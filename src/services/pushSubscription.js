import { API_BASE_URL } from '../config';

// Convert base64 VAPID public key string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// 1. Fetch backend VAPID Public Key
export async function getVapidPublicKey() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/notifications/vapid-public-key`);
    const data = await res.json();
    if (data.success && data.publicKey) {
      return data.publicKey;
    }
  } catch (err) {
    console.warn('Failed to fetch VAPID public key:', err);
  }
  return null;
}

// 2. Register Service Worker Push Subscription with Browser Push Service
export async function subscribeUserToPush({ phone, role = 'customer', bookingId = null }) {
  if (typeof window === 'undefined') return null;

  // Verify browser supports Service Worker, PushManager and Notifications
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('Push messaging is not supported in this browser environment.');
    return null;
  }

  // Check permission
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return null;
    }
  }

  try {
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      console.warn('No VAPID public key available to subscribe.');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // If subscription already exists, we ensure backend is updated with latest phone/role
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    if (!subscription) return null;

    const subJson = subscription.toJSON();
    const cleanPhone = phone || localStorage.getItem('shazuone_partner_phone') || localStorage.getItem('shazuone_user_phone') || '';
    const cleanBookingId = bookingId || localStorage.getItem('shazuone_active_booking') || localStorage.getItem('shazuone_partner_active_job') || null;

    // Send to backend
    const res = await fetch(`${API_BASE_URL}/api/v1/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subJson,
        phone: cleanPhone,
        role: role || (cleanPhone ? 'technician' : 'customer'),
        bookingId: cleanBookingId
      })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('shazuone_push_registered', 'true');
      return subscription;
    }
  } catch (err) {
    console.warn('Error subscribing user to push notifications:', err);
  }
  return null;
}

// 3. Unsubscribe user from push notifications
export async function unsubscribeUserFromPush() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch(`${API_BASE_URL}/api/v1/notifications/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint })
      }).catch(() => {});

      localStorage.removeItem('shazuone_push_registered');
    }
  } catch (err) {
    console.warn('Error unsubscribing:', err);
  }
}
