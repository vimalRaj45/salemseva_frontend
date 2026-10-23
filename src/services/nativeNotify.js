import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { RingtoneService } from './RingtoneService';

class NativeNotificationService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.hasPermission = false;
    this.init();
  }

  async init() {
    try {
      if (this.isNative) {
        // 1. Create High-Priority Notification Channels for Android 8.0+
        try {
          await LocalNotifications.createChannel({
            id: 'shazuone_urgent_calls',
            name: 'Shazu One VoIP Calls',
            description: 'Urgent incoming calls from customer and technician',
            importance: 5, // IMPORTANCE_HIGH (Heads-up alert)
            visibility: 1, // VISIBILITY_PUBLIC
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#2563EB'
          });

          await LocalNotifications.createChannel({
            id: 'shazuone_work_assigned',
            name: 'Shazu One Work & Dispatch',
            description: 'New job requests and doorstep service assignments',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#D97706'
          });

          await LocalNotifications.createChannel({
            id: 'shazuone_order_updates',
            name: 'Shazu One Order & Delivery Updates',
            description: 'Real-time order progress and technician arrival status',
            importance: 4,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#0284C7'
          });

          await LocalNotifications.createChannel({
            id: 'shazuone_messages',
            name: 'Shazu One Chat Messages',
            description: 'In-app chat messages for doorstep services',
            importance: 4,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#10B981'
          });
        } catch (chanErr) {
          console.warn('Channel creation note:', chanErr);
        }

        // 2. Request Notification Permissions in Capacitor
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') {
          this.hasPermission = true;
        } else {
          const req = await LocalNotifications.requestPermissions();
          this.hasPermission = req.display === 'granted';
        }
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          this.hasPermission = true;
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          this.hasPermission = perm === 'granted';
        }
      }
    } catch (e) {
      console.warn('Notification init note:', e);
    }
  }

  // Request user permissions explicitly (called via user action / button)
  async requestPermission() {
    try {
      if (this.isNative) {
        const req = await LocalNotifications.requestPermissions();
        this.hasPermission = req.display === 'granted';
        return this.hasPermission;
      }
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        this.hasPermission = perm === 'granted';
        return this.hasPermission;
      }
    } catch (e) {
      console.warn('Permission request error:', e);
    }
    return false;
  }

  // Show System Notification (via ServiceWorker in PWA or LocalNotifications in Capacitor)
  async showSystemNotification({ title, body, tag, icon, badge, data, actions, requireInteraction, vibrate }) {
    // 1. Always emit in-app Heads-Up Notification Banner event so user sees it in foreground
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shazuone_heads_up_notification', {
        detail: {
          title,
          body,
          tag,
          data,
          timestamp: Date.now()
        }
      }));
    }

    // 2. Deliver System Notification
    try {
      if (this.isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 100000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 50) },
              sound: 'default',
              smallIcon: 'ic_launcher',
              iconColor: '#0284C7',
              channelId: data?.type === 'call' ? 'shazuone_urgent_calls' : (data?.type === 'new_job' ? 'shazuone_work_assigned' : 'shazuone_order_updates'),
              extra: data || {}
            }
          ]
        });
        return;
      }

      // PWA Browser: Prefer ServiceWorker Registration (Android/Desktop reliable)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body,
            icon: icon || '/logo.png',
            badge: badge || '/favicon.png',
            tag: tag || `notif-${Date.now()}`,
            renotify: true,
            requireInteraction: Boolean(requireInteraction),
            vibrate: vibrate || [200, 100, 200],
            actions: actions || [],
            data: data || {}
          }
        });
        return;
      }

      // Standard Web Notification fallback
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body,
          icon: icon || '/logo.png',
          badge: badge || '/favicon.png',
          tag: tag || `notif-${Date.now()}`,
          requireInteraction: Boolean(requireInteraction),
          data: data || {}
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
          if (data?.url) {
            window.location.href = data.url;
          }
        };
      }
    } catch (err) {
      console.warn('System notification delivery note:', err);
    }
  }

  // 1. Incoming VoIP Call (Continuous Ringing & Full Alerts)
  async notifyIncomingCall({ callerName, bookingId, role }) {
    RingtoneService.startRinging();

    const targetUrl = (role === 'customer' || role === 'Customer')
      ? `/track?bookingId=${bookingId}&autoAnswer=true`
      : `/partner?bookingId=${bookingId}&autoAnswer=true`;

    await this.showSystemNotification({
      title: `Incoming Call: ${callerName || 'Salem Specialist'}`,
      body: `Incoming audio call for Booking #${bookingId}. Tap to answer.`,
      tag: `call-${bookingId}`,
      requireInteraction: true,
      vibrate: [400, 150, 400, 1800, 400, 150, 400],
      actions: [
        { action: 'answer', title: 'Answer Call' },
        { action: 'decline', title: 'Decline' }
      ],
      data: {
        bookingId,
        role,
        type: 'call',
        url: targetUrl
      }
    });
  }

  // Stop Ringtone Audio
  stopCallRingtone() {
    RingtoneService.stopRinging();
  }

  // 2. Customer Order Status Update (e.g. "Order is on its way!", "Partner Arrived")
  async notifyOrderStatusUpdate({ title, message, bookingId, status, technicianName, eta }) {
    RingtoneService.playOrderStatusChime();

    const headline = title || (status === 'en_route' ? 'Order is on its way!' : (status === 'arrived' ? 'Technician at Doorstep!' : 'Order Status Update'));
    const techPrefix = technicianName ? `${technicianName} (Delivery Partner)` : 'Service Specialist';
    const detailBody = message || (status === 'en_route' ? `${techPrefix} is traveling to your location. ETA: ${eta || '8 mins'}.` : `${techPrefix} has arrived for inspection.`);

    await this.showSystemNotification({
      title: headline,
      body: detailBody,
      tag: `order-${bookingId}-${status || 'update'}`,
      vibrate: [150, 80, 150],
      data: {
        bookingId,
        type: 'order_status',
        status,
        url: `/track?bookingId=${bookingId}`
      }
    });
  }

  // 3. New Work / Job Assigned Notification (for Technician)
  async notifyNewWorkAssigned({ serviceTitle, locality, bookingId, price }) {
    RingtoneService.playJobDispatchChime();

    await this.showSystemNotification({
      title: `New Service Assigned: ${serviceTitle || 'Home Service'}`,
      body: `Customer in ${locality || 'Salem'}. Inspection fee: Rs. ${price || '99'} Escrow paid. Tap to review.`,
      tag: `job-${bookingId}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view_job', title: 'View & Accept' }
      ],
      data: {
        bookingId,
        type: 'new_job',
        url: '/partner'
      }
    });
  }

  // 4. Incoming Chat Message Alert
  async notifyIncomingMessage({ senderName, messageText, bookingId }) {
    RingtoneService.playMessageChime();

    await this.showSystemNotification({
      title: `${senderName || 'Salem Specialist'}`,
      body: messageText || 'New message received',
      tag: `msg-${bookingId}`,
      vibrate: [80],
      data: {
        bookingId,
        type: 'chat',
        url: `/track?bookingId=${bookingId}&openChat=true`
      }
    });
  }
}

export const NativeNotifier = new NativeNotificationService();
