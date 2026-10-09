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
        navigator.vibrate([300, 200, 300, 200, 500]);
      }
    } catch (e) {}
  }

  // Trigger Incoming Call Alert (Native Banner & Sound/Vibration)
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
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
              actionTypeId: 'OPEN_CALL',
              extra: { bookingId, role }
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming Call: ${callerName}`, {
          body: `Tap to answer incoming VoIP call for Booking #${bookingId}`,
          icon: '/favicon.ico',
          tag: `call-${bookingId}`
        });
      }
    } catch (e) {
      console.warn('Call notification error:', e);
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
              title: `New message from ${senderName}`,
              body: messageText,
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
              extra: { bookingId }
            }
          ]
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${senderName}`, {
          body: messageText,
          icon: '/favicon.ico',
          tag: `msg-${bookingId}`
        });
      }
    } catch (e) {
      console.warn('Message notification error:', e);
    }
  }
}

export const NativeNotifier = new NativeNotificationService();
