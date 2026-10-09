import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, NotificationType } from '@capacitor/haptics';

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
            id: 'salemseva_urgent_calls',
            name: 'SalemSeva VoIP Calls',
            description: 'Urgent incoming calls from customer and technician',
            importance: 5, // IMPORTANCE_HIGH (Heads-up alert)
            visibility: 1, // VISIBILITY_PUBLIC
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#2563EB'
          });

          await LocalNotifications.createChannel({
            id: 'salemseva_work_assigned',
            name: 'SalemSeva Work & Dispatch',
            description: 'New job requests and doorstep service assignments',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#D97706'
          });

          await LocalNotifications.createChannel({
            id: 'salemseva_messages',
            name: 'SalemSeva Chat Messages',
            description: 'In-app chat messages for doorstep services',
            importance: 4,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#10B981'
          });
        } catch (chanErr) {
          console.warn('Channel creation error:', chanErr);
        }

        // 2. Request Notification Permissions
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

  // Vibrate Phone (Haptics)
  async vibrateCall() {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 200, 600]);
      }
    } catch (e) {}
  }

  // Trigger Incoming Call Alert (High Priority Heads-Up Banner & Continuous Vibration)
  async notifyIncomingCall({ callerName, bookingId, role }) {
    this.vibrateCall();

    try {
      if (this.isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 100000),
              title: `Incoming Call: ${callerName}`,
              body: `Tap to answer incoming VoIP call for Booking #${bookingId}`,
              schedule: { at: new Date(Date.now() + 50) },
              sound: 'default',
              smallIcon: 'ic_launcher',
              iconColor: '#2563EB',
              channelId: 'salemseva_urgent_calls',
              actionTypeId: 'OPEN_CALL',
              extra: { bookingId, role, type: 'call' }
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming Call: ${callerName}`, {
          body: `Tap to answer incoming VoIP call for Booking #${bookingId}`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `call-${bookingId}`
        });
      }
    } catch (e) {
      console.warn('Call notification error:', e);
    }
  }

  // Trigger New Work / Job Assigned Notification
  async notifyNewWorkAssigned({ serviceTitle, locality, bookingId, price }) {
    this.vibrateCall();

    try {
      if (this.isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 100000),
              title: `New Service Assigned: ${serviceTitle || 'Home Service'}`,
              body: `Customer waiting in ${locality || 'Salem'}. Estimated: ₹${price || '299'}. Tap to review & accept.`,
              schedule: { at: new Date(Date.now() + 50) },
              sound: 'default',
              smallIcon: 'ic_launcher',
              iconColor: '#D97706',
              channelId: 'salemseva_work_assigned',
              actionTypeId: 'OPEN_JOB',
              extra: { bookingId, type: 'new_job' }
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`New Service Assigned: ${serviceTitle || 'Home Service'}`, {
          body: `Customer waiting in ${locality || 'Salem'}. Estimated: ₹${price || '299'}. Tap to review & accept.`,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `job-${bookingId}`
        });
      }
    } catch (e) {
      console.warn('Job assigned notification error:', e);
    }
  }

  // Trigger Incoming Chat Message Alert
  async notifyIncomingMessage({ senderName, messageText, bookingId }) {
    try {
      if (this.isNative) {
        await Haptics.notification({ type: NotificationType.Success });
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 100000),
              title: `Message from ${senderName}`,
              body: messageText,
              schedule: { at: new Date(Date.now() + 50) },
              sound: 'default',
              smallIcon: 'ic_launcher',
              iconColor: '#10B981',
              channelId: 'salemseva_messages',
              extra: { bookingId, type: 'chat' }
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${senderName}`, {
          body: messageText,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `msg-${bookingId}`
        });
      }
    } catch (e) {
      console.warn('Message notification error:', e);
    }
  }
}

export const NativeNotifier = new NativeNotificationService();
