import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NativeNotifier } from '../services/nativeNotify';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '../config';
import FocusCallOverlay from './FocusCallOverlay';
import { subscribeUserToPush } from '../services/pushSubscription';

export default function GlobalNotificationWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const lastNotifiedJobRef = useRef(null);
  const lastNotifiedCallRef = useRef(null);
  const lastSeenMsgCountRef = useRef({});
  const lastSeenBookingStatusRef = useRef({});

  // Suppress overlay if the user is already on the dedicated full-screen VoIP calling page
  const isOnCallScreen = location.pathname.startsWith('/call');

  // Auto-subscribe to Web Push for background/cleared app wake-up if permissions are granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const phone = user?.phone || localStorage.getItem('shazuone_partner_phone') || localStorage.getItem('shazuone_user_phone') || '';
      const role = user?.role === 'technician' ? 'technician' : 'customer';
      const bookingId = localStorage.getItem('shazuone_active_booking') || localStorage.getItem('shazuone_partner_active_job') || null;

      subscribeUserToPush({ phone, role, bookingId }).catch(() => {});
    }
  }, [user]);

  // 1. Listen for Notification Tap Events (Opens app to the exact screen)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const extra = event.notification?.extra || {};
        if (extra.type === 'call') {
          navigate(`/call/${extra.bookingId}?incoming=true&autoAnswer=true`);
        } else if (extra.type === 'chat') {
          if (extra.role === 'Customer' || extra.role === 'customer') {
            navigate(`/track?bookingId=${extra.bookingId}`);
          } else {
            navigate(`/partner?bookingId=${extra.bookingId}`);
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
          if (isOnCallScreen) {
            // Already on dedicated calling screen; clear any overlay state
            if (incomingCall) {
              setIncomingCall(null);
              NativeNotifier.stopCallRingtone();
            }
          } else {
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
          }

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

          // C. Customer / Technician: Track Live Order Status transitions
          try {
            const trackRes = await fetch(`${API_BASE_URL}/api/v1/bookings/${activeBookingId}/track`);
            const trackData = await trackRes.json();
            if (trackData.success && trackData.booking && isMounted) {
              const currentStatus = trackData.booking.status;
              const prevStatus = lastSeenBookingStatusRef.current[activeBookingId];

              // Only trigger notification banner & audio chime when status transitioned from an earlier state
              if (prevStatus && prevStatus !== currentStatus) {
                const techName = trackData.technician?.name || 'Service Specialist';
                const eta = trackData.technician?.eta || '10 mins';

                if (currentStatus === 'accepted') {
                  NativeNotifier.notifyOrderStatusUpdate({
                    title: 'Specialist Assigned',
                    message: `${techName} has been assigned to your service request.`,
                    bookingId: activeBookingId,
                    status: currentStatus,
                    technicianName: techName,
                    eta
                  });
                } else if (currentStatus === 'en_route') {
                  NativeNotifier.notifyOrderStatusUpdate({
                    title: 'Order is on its way!',
                    message: `Our delivery partner ${techName} has picked up your order and is heading your way.`,
                    bookingId: activeBookingId,
                    status: currentStatus,
                    technicianName: techName,
                    eta
                  });
                } else if (currentStatus === 'arrived') {
                  NativeNotifier.notifyOrderStatusUpdate({
                    title: 'Partner Arrived at Doorstep!',
                    message: `${techName} has arrived at your address for doorstep inspection.`,
                    bookingId: activeBookingId,
                    status: currentStatus,
                    technicianName: techName
                  });
                } else if (currentStatus === 'quote_presented') {
                  NativeNotifier.notifyOrderStatusUpdate({
                    title: 'Digital Estimate Ready',
                    message: `${techName} has uploaded the digital diagnostic quote for your approval.`,
                    bookingId: activeBookingId,
                    status: currentStatus,
                    technicianName: techName
                  });
                } else if (currentStatus === 'completed') {
                  NativeNotifier.notifyOrderStatusUpdate({
                    title: 'Service Completed Successfully',
                    message: 'Your service job has been finished. Thank you for choosing Shazu One.',
                    bookingId: activeBookingId,
                    status: currentStatus,
                    technicianName: techName
                  });
                }
              }
              lastSeenBookingStatusRef.current[activeBookingId] = currentStatus;
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
    setIncomingCall(null);

    // Direct navigation to dedicated VoIP call screen with autoAnswer flag
    navigate(`/call/${targetBookingId}?incoming=true&autoAnswer=true`);
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

  // If user is already on the dedicated VoIP call screen, never render an overlay modal
  if (isOnCallScreen) {
    return null;
  }

  return (
    <FocusCallOverlay
      incomingCall={incomingCall}
      onAccept={handleAcceptCall}
      onDecline={handleDeclineCall}
    />
  );
}
