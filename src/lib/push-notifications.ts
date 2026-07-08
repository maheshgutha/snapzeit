// @ts-nocheck
// Not currently imported anywhere; the tail of this file targets a
// service worker context (self, ExtendableEvent, clients) which isn't
// type-compatible with the main app's DOM lib.
/**
 * PWA Push Notification Service for SnapZeit
 * Handles subscription management and push notifications
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string; // For notification grouping
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Request user permission for push notifications
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Register service worker and subscribe to push notifications
 */
export async function registerPushNotifications(userId: string): Promise<PushSubscription | null> {
  try {
    // Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    // Request permission
    const hasPermission = await requestPushNotificationPermission();
    if (!hasPermission) {
      console.log('User denied push notification permission');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Get VAPID public key (should come from your backend)
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return null;
    }

    // Convert VAPID key
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Create subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // Save subscription to database
    await savePushSubscriptionToDatabase(userId, subscription);

    console.log('Push notification registered successfully');
    return subscription;
  } catch (error) {
    console.error('Error registering push notifications:', error);
    return null;
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Save push subscription to database
 */
async function savePushSubscriptionToDatabase(userId: string, subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        endpoint: subscription.endpoint,
        auth: subscription.getKey('auth'),
        p256dh: subscription.getKey('p256dh'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
      }
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isPushNotificationSubscribed(): Promise<boolean> {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    }
    return false;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
}

/**
 * Send push notification from frontend (for testing)
 * In production, notifications are sent from backend via push service
 */
export function sendLocalPushNotification(payload: PushNotificationPayload): void {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/snapzeit-192.png',
        badge: payload.badge || '/icons/badge.png',
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
      });
    });
  }
}

/**
 * Notification templates for different events
 */
export const NotificationTemplates = {
  bookingConfirmed: (photographerName: string): PushNotificationPayload => ({
    title: 'Booking Confirmed! 📸',
    body: `Your booking with ${photographerName} has been confirmed.`,
    tag: 'booking-confirmed',
    data: { type: 'booking', action: 'view' },
  }),

  bookingReminder: (hours: number): PushNotificationPayload => ({
    title: 'Upcoming Session 🔔',
    body: `Your photography session is in ${hours} hours. Get ready!`,
    tag: 'booking-reminder',
    data: { type: 'reminder', action: 'view' },
  }),

  newMessage: (senderName: string): PushNotificationPayload => ({
    title: 'New Message 💬',
    body: `${senderName} sent you a message.`,
    tag: 'message',
    data: { type: 'message', action: 'open' },
    actions: [
      { action: 'reply', title: 'Reply' },
      { action: 'view', title: 'View' },
    ],
  }),

  newReview: (rating: number): PushNotificationPayload => ({
    title: 'New Review ⭐',
    body: `You received a ${rating}-star review!`,
    tag: 'review',
    data: { type: 'review', action: 'view' },
  }),

  paymentReceived: (amount: number, currency: string = 'USD'): PushNotificationPayload => ({
    title: 'Payment Received ✅',
    body: `You received $${amount} ${currency}. Check your earnings dashboard.`,
    tag: 'payment',
    data: { type: 'payment', action: 'dashboard' },
  }),

  refundProcessed: (amount: number, currency: string = 'USD'): PushNotificationPayload => ({
    title: 'Refund Processed 💰',
    body: `A refund of $${amount} ${currency} has been processed to your account.`,
    tag: 'refund',
    data: { type: 'refund', action: 'view' },
  }),

  newLead: (eventType: string): PushNotificationPayload => ({
    title: 'New Booking Lead 🎉',
    body: `A client is looking for a ${eventType} photographer near you!`,
    tag: 'lead',
    data: { type: 'lead', action: 'view' },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'accept', title: 'Accept' },
    ],
  }),

  promoOffer: (discount: number): PushNotificationPayload => ({
    title: 'Special Offer 🎁',
    body: `Get ${discount}% off your next booking! Limited time offer.`,
    tag: 'promotion',
    data: { type: 'promo', action: 'view' },
  }),
};

/**
 * Initialize push notifications for authenticated user
 */
export async function initializePushNotifications(userId: string): Promise<void> {
  try {
    // Check if already subscribed
    const isSubscribed = await isPushNotificationSubscribed();
    if (isSubscribed) {
      return;
    }

    // Try to register
    await registerPushNotifications(userId);
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    // Don't fail silently - log but continue app functionality
  }
}

/**
 * Handle push notification click
 * Attach to service worker message listener
 */
export function handlePushNotificationClick(event: ExtendableEvent): void {
  const notification = (event as NotificationEvent).notification;
  const data = notification.data;

  if (data?.type === 'message') {
    // Open messages page
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return (client as any).focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/messages');
      }
    });
  } else if (data?.type === 'booking') {
    if (clients.openWindow) {
      return clients.openWindow('/bookings');
    }
  }
}
