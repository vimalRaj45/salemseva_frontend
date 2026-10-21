import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NativeNotifier } from '../services/nativeNotify';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '../config';
import FocusCallOverlay from './FocusCallOverlay';

export default function GlobalNotificationWatcher() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
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
            navigate(`/track?bookingId=${extra.bookingId}&autoAnswer=true`);
          } else {
            navigate(`/partner?bookingId=${extra.bookingId}&autoAnswer=true`);
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
        const isPartnerOnline = localStorage.getItem('shazuone_partner_is_online') === 'true';
        const partnerPhone = user?.phone || localStorage.getItem('shazuone_partner_phone') || '';
        const activeBookingId = localStorage.getItem('shazuone_active_booking') || localStorage.getItem('shazuone_partner_active_job');
        const userRole = user?.role === 'technician' ? 'technician' : 'customer';

        // A. Technician: Check for New Assigned Job if Online
        if (isPartnerOnline && partnerPhone) {
          try {
            // Real partner phone: normalized digits
            let digits = partnerPhone.replace(/[^\d]/g, '');
            let cleanPhone = digits ? (digits.length === 10 ? digits : digits.slice(-10)) : '';
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
                    callerName: call.callerName || (isPartner ? 'Customer' : 'Shazu One Specialist'),
                    bookingId: activeBookingId,
                    role: isPartner ? 'Technician' : 'Customer'
                  });
                }
                setIncomingCall({
                  bookingId: activeBookingId,
                  callerName: call.callerName || (isPartner ? 'Customer' : 'Shazu One Specialist'),
                  role: isPartner ? 'Technician' : 'Customer',
                  locality: 'Doorstep Service, Salem'
                });
              } else if (!call.active || call.status !== 'RINGING') {
                if (incomingCall) {
                  setIncomingCall(null);
                  NativeNotifier.stopCallRingtone();
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
      NativeNotifier.stopCallRingtone();
    };
  }, [user, incomingCall]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    NativeNotifier.stopCallRingtone();
    const targetBookingId = incomingCall.bookingId;
    const targetRole = incomingCall.role;
    setIncomingCall(null);

    // Notify any active page listener to open WebRTC modal
    window.dispatchEvent(new CustomEvent('shazuone_open_active_call', {
      detail: { bookingId: targetBookingId, autoAnswer: true }
    }));

    if (targetRole === 'Customer' || targetRole === 'customer') {
      navigate(`/track?bookingId=${targetBookingId}&autoAnswer=true`);
    } else {
      navigate(`/partner?bookingId=${targetBookingId}&autoAnswer=true`);
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;
    NativeNotifier.stopCallRingtone();
    const targetBookingId = incomingCall.bookingId;
    const targetRole = incomingCall.role;
    setIncomingCall(null);

    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: targetBookingId, role: targetRole })
      });
    } catch (e) {}
  };

  return (
    <FocusCallOverlay
      incomingCall={incomingCall}
      onAccept={handleAcceptCall}
      onDecline={handleDeclineCall}
    />
  );
}
