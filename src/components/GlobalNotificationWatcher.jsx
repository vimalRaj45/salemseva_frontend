import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NativeNotifier } from '../services/nativeNotify';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '../config';

export default function GlobalNotificationWatcher() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lastNotifiedJobRef = useRef(null);
  const lastNotifiedCallRef = useRef(null);
  const lastSeenMsgCountRef = useRef({});

  // 1. Listen for Notification Tap Events (Opens app to the exact screen)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const extra = event.notification?.extra || {};
        if (extra.type === 'call' || extra.type === 'chat') {
          if (extra.role === 'Customer' || extra.role === 'customer') {
            navigate(`/track?bookingId=${extra.bookingId}`);
          } else {
            navigate('/partner');
          }
        } else if (extra.type === 'new_job') {
          navigate('/partner');
        }
      });
    }
  }, [navigate]);

  // 2. Global Background Poller for Technician (Online Jobs & Calls) & Customer
  useEffect(() => {
    let isMounted = true;

    const pollGlobalEvents = async () => {
      try {
        const isPartnerOnline = localStorage.getItem('salemseva_partner_is_online') === 'true';
        const partnerPhone = user?.phone || localStorage.getItem('salemseva_partner_phone') || '+919443288901';
        const activeBookingId = localStorage.getItem('salemseva_active_booking') || localStorage.getItem('salemseva_partner_active_job');
        const userRole = user?.role === 'technician' ? 'technician' : 'customer';

        // A. Technician: Check for New Assigned Job if Online
        if (isPartnerOnline) {
          try {
            const cleanPhone = partnerPhone.replace(/[\s\-\(\)]/g, '');
            const syncRes = await fetch(`${API_BASE_URL}/api/v1/partner/duty/sync?phone=${encodeURIComponent(cleanPhone)}`);
            const syncData = await syncRes.json();

            if (syncData.success && syncData.activeJob && isMounted) {
              const job = syncData.activeJob;
              const jId = job.id || job.bookingId;

              if (job.status === 'matching' && lastNotifiedJobRef.current !== jId) {
                lastNotifiedJobRef.current = jId;
                NativeNotifier.notifyNewWorkAssigned({
                  serviceTitle: job.serviceName || 'Home Repair Service',
                  locality: job.locality || 'Fairlands, Salem',
                  bookingId: jId,
                  price: job.visitFee || 99
                });
              }
            }
          } catch (e) {}
        }

        // B. Active Booking: Check for VoIP Calls & Chat Messages
        if (activeBookingId) {
          // Check VoIP Calls
          try {
            const callRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/status?bookingId=${activeBookingId}`);
            const callData = await callRes.json();

            if (callData.success && callData.call && isMounted) {
              const call = callData.call;
              const isPartner = userRole === 'technician';
              const isIncomingForMe = isPartner ? call.caller === 'customer' : call.caller === 'technician';

              if (call.active && call.status === 'RINGING' && isIncomingForMe) {
                const callKey = `${activeBookingId}-${call.startedAt}`;
                if (lastNotifiedCallRef.current !== callKey) {
                  lastNotifiedCallRef.current = callKey;
                  NativeNotifier.notifyIncomingCall({
                    callerName: call.callerName || (isPartner ? 'Customer' : 'SalemSeva Specialist'),
                    bookingId: activeBookingId,
                    role: isPartner ? 'Technician' : 'Customer'
                  });
                }
              }
            }
          } catch (e) {}

          // Check Chat Messages
          try {
            const msgRes = await fetch(`${API_BASE_URL}/api/v1/bookings/${activeBookingId}/messages`);
            const msgData = await msgRes.json();

            if (msgData.success && Array.isArray(msgData.messages) && isMounted) {
              const msgs = msgData.messages;
              const prevCount = lastSeenMsgCountRef.current[activeBookingId] ?? msgs.length;

              if (msgs.length > prevCount) {
                const newMsgs = msgs.slice(prevCount);
                const incomingMsg = newMsgs.find(m => m.sender !== userRole);

                if (incomingMsg) {
                  NativeNotifier.notifyIncomingMessage({
                    senderName: incomingMsg.senderName || (userRole === 'customer' ? 'Salem Specialist' : 'Customer'),
                    messageText: incomingMsg.text,
                    bookingId: activeBookingId
                  });
                }
              }
              lastSeenMsgCountRef.current[activeBookingId] = msgs.length;
            }
          } catch (e) {}
        }
      } catch (err) {}
    };

    pollGlobalEvents();
    const interval = setInterval(pollGlobalEvents, 1800);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return null;
}
