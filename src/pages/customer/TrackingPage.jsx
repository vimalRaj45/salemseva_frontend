import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Avatar,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  IconButton
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Professional Material UI Icons
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import HeadsetIcon from '@mui/icons-material/Headset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import EngineeringIcon from '@mui/icons-material/Engineering';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BoltIcon from '@mui/icons-material/Bolt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import ShieldIcon from '@mui/icons-material/Shield';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HubIcon from '@mui/icons-material/Hub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MapIcon from '@mui/icons-material/Map';
import NavigationIcon from '@mui/icons-material/Navigation';

import MaskedChatModal from '../../components/MaskedChatModal';
import VoipCallModal from '../../components/VoipCallModal';
import CancelBookingModal from '../../components/CancelBookingModal';

export default function TrackingPage({ onOpenVoiceAgent }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');
  const storedBookingId = localStorage.getItem('salemseva_active_booking');
  const bookingId = urlBookingId || storedBookingId || 'SLM-84920';

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);


  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const lastMessageCountRef = useRef(-1);

  const [trackData, setTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [confirmCompletionModalOpen, setConfirmCompletionModalOpen] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false);
  const [completionSuccessToast, setCompletionSuccessToast] = useState(false);

  // Quote Arrival Interactive Modal State
  const [quoteAlertModalOpen, setQuoteAlertModalOpen] = useState(false);
  const quoteDismissedRef = useRef(false);

  // Reschedule Slot Modal State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newSlot, setNewSlot] = useState('priority_12h');
  const [slotUpdating, setSlotUpdating] = useState(false);

  // Doorstep Security Verification State (Customer verifies Technician PIN)
  const [enteredTechOtp, setEnteredTechOtp] = useState('');
  const [techOtpError, setTechOtpError] = useState('');
  const [isVerifyingTechOtp, setIsVerifyingTechOtp] = useState(false);
  const [techOtpSuccess, setTechOtpSuccess] = useState(false);

  const handleVerifyTechnicianOtp = async () => {
    if (!enteredTechOtp || enteredTechOtp.trim().length !== 4) {
      setTechOtpError('Please enter the 4-digit PIN told by the technician');
      return;
    }
    setTechOtpError('');
    setIsVerifyingTechOtp(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: enteredTechOtp.trim(),
          type: 'arrival',
          actor: 'customer'
        })
      });
      const data = await res.json();
      if (!data.success) {
        setTechOtpError(data.error || 'Incorrect PIN. For your family safety, do not allow entry.');
        setIsVerifyingTechOtp(false);
        return;
      }

      setTechOtpSuccess(true);
      if (trackData && trackData.booking) {
        setTrackData(prev => ({
          ...prev,
          booking: { ...prev.booking, status: 'inspecting' }
        }));
      }
      localStorage.setItem('salemseva_partner_step', '3');
      localStorage.setItem('salemseva_quote_status_' + bookingId, 'inspecting');
      window.dispatchEvent(new CustomEvent('salemseva_status_updated', { detail: { bookingId, status: 'inspecting' } }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setTechOtpError('Network error. Please try again.');
    } finally {
      setIsVerifyingTechOtp(false);
    }
  };

  // Poll real database status from backend every 1.2 seconds & listen to instant quote events
  useEffect(() => {
    if (bookingId) {
      localStorage.setItem('salemseva_active_booking', bookingId);
    }
    let isMounted = true;

    const fetchTracking = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/track`);
        const data = await res.json();
        if (data.success && isMounted) {
          // If local storage has quote_presented flag, ensure status reflects it immediately
          const localQuoteStatus = localStorage.getItem('salemseva_quote_status_' + bookingId);
          if (localQuoteStatus === 'quote_presented' && data.booking && data.booking.status !== 'quote_approved' && data.booking.status !== 'completed') {
            data.booking.status = 'quote_presented';
          }

          if (data.booking?.status === 'quote_presented' && !quoteDismissedRef.current) {
            setQuoteAlertModalOpen(true);
          }

          setTrackData(data);
          if (data.booking?.scheduled_slot) {
            setNewSlot(data.booking.scheduled_slot);
          }
        }
      } catch (err) {
        console.warn('Real-time tracking poll:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 1200);

    // Instant cross-tab & custom event triggers
    const handleQuoteEvent = (e) => {
      if (e?.detail?.status === 'quote_presented') {
        quoteDismissedRef.current = false;
        setQuoteAlertModalOpen(true);
      }
      fetchTracking();
    };

    window.addEventListener('salemseva_quote_updated', handleQuoteEvent);
    window.addEventListener('storage', handleQuoteEvent);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('salemseva_quote_updated', handleQuoteEvent);
      window.removeEventListener('storage', handleQuoteEvent);
    };
  }, [bookingId]);

  // Real-time VoIP Call & Chat Notification Poller
  useEffect(() => {
    let isMounted = true;

    const pollCommunications = async () => {
      try {
        // 1. Check for incoming VoIP calls from technician
        const callRes = await fetch(`http://localhost:8080/api/v1/webrtc/call/status?bookingId=${bookingId}`);
        const callData = await callRes.json();
        if (callData.success && callData.call && isMounted) {
          if (callData.call.active && callData.call.caller === 'technician' && callData.call.status === 'RINGING') {
            setIsIncomingCall(true);
            setCallOpen(true);
          }
        }

        // 2. Check for incoming chat messages from technician
        const msgRes = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/messages`);
        const msgData = await msgRes.json();
        if (msgData.success && msgData.messages && isMounted) {
          const msgs = msgData.messages;
          if (lastMessageCountRef.current === -1) {
            lastMessageCountRef.current = msgs.length;
          } else if (msgs.length > lastMessageCountRef.current) {
            const latest = msgs[msgs.length - 1];
            if (latest.sender === 'technician' && !chatOpenRef.current) {
              setIncomingMessageToast(latest.text);
            }
            lastMessageCountRef.current = msgs.length;
          }
        }
      } catch (err) {}
    };

    pollCommunications();
    const commInterval = setInterval(pollCommunications, 1000);
    return () => {
      isMounted = false;
      clearInterval(commInterval);
    };
  }, [bookingId]);

  const handleUpdateSlot = async () => {
    setSlotUpdating(true);
    try {
      await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledSlot: newSlot })
      });
      setRescheduleOpen(false);
      // Re-fetch
      const res = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/track`);
      const data = await res.json();
      if (data.success) setTrackData(data);
    } catch (e) {
      console.warn('Failed to reschedule:', e);
    } finally {
      setSlotUpdating(false);
    }
  };

  const bookingStatus = trackData?.booking?.status || 'matching';
  const hasOnlineTech = trackData?.hasOnlineTech && trackData?.technician;
  const tech = trackData?.technician;

  const isInspectingOrArrived = ['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus) || techOtpSuccess;
  const techArrived = ['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus);
  const hasQuote = ['quote_presented', 'quote_approved'].includes(bookingStatus);

  const getSlotLabel = (slot) => {
    switch (slot) {
      case 'morning_9_11':
        return 'Tomorrow Morning (09:00 AM - 11:00 AM)';
      case 'afternoon_2_4':
        return 'Tomorrow Afternoon (02:00 PM - 04:00 PM)';
      case 'evening_5_7':
        return 'Tomorrow Evening (05:00 PM - 07:00 PM)';
      default:
        return 'Priority 12-Hour Window (Assign Next Online Partner)';
    }
  };

  if (isLoading && !trackData) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', p: 3 }}>
        <Container maxWidth="sm">
          <Skeleton variant="rounded" height={270} sx={{ borderRadius: '20px', mb: 2 }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px', mb: 2 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* ========================================================================= */}
        {/* SCENARIO A: NO TECHNICIAN ACTIVE RIGHT NOW -> CENTRAL OPS 12H QUEUE */}
        {/* ========================================================================= */}
        {!hasOnlineTech ? (
          <>
            {/* Top Status Alert */}
            <Alert 
              severity="info" 
              icon={<HourglassTopIcon sx={{ fontSize: 22 }} />}
              sx={{ mb: 2, borderRadius: '16px', fontWeight: 800, bgcolor: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC' }}
            >
              ⏳ Booking #{bookingId} is confirmed and placed in Salem Central Ops queue.
            </Alert>

            {/* Central Dispatch Radar Map */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                overflow: 'hidden',
                mb: 2.5,
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
              }}
            >
              <Box sx={{ position: 'relative', height: 230 }}>
                <iframe
                  title="Salem Central Ops Google Maps"
                  width="100%"
                  height="230"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://maps.google.com/maps?q=11.6643,78.1460&hl=en&z=14&output=embed"
                  allowFullScreen
                />
                <Paper
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    px: 2,
                    py: 0.8,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    zIndex: 800,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                >
                  <HubIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '12px' }}>
                    Salem Central Ops • Priority Radar Active
                  </Typography>
                </Paper>
              </Box>
            </Card>

            {/* Central Ops Assurance & 12h Guarantee Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '20px',
                p: 2.5,
                mb: 2.5,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <ShieldIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                    Central Ops Assignment Guarantee
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Fairlands & Salem City Jurisdiction
                  </Typography>
                </Box>
              </Box>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  Notice: All verified technicians are currently offline or busy.
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, display: 'block' }}>
                  Your service request is actively monitored by Central Ops. A certified partner will be assigned within our <strong>12-hour guarantee window</strong> or at your chosen scheduled slot.
                </Typography>
              </Paper>

              {/* Current Scheduled Slot */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F0F9FF', p: 1.5, borderRadius: '12px', border: '1px solid #BAE6FD', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, display: 'block' }}>
                    CURRENT SELECTED TIME WINDOW:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0C4A6E' }}>
                    {getSlotLabel(trackData?.booking?.scheduled_slot)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditCalendarIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setRescheduleOpen(true)}
                  sx={{
                    borderRadius: '10px',
                    borderColor: '#0284C7',
                    color: '#0284C7',
                    fontWeight: 800,
                    fontSize: '11px',
                    textTransform: 'none'
                  }}
                >
                  Change Slot
                </Button>
              </Box>

              {/* Salem Central Hotline Desk */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#FFFFFF',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HeadsetIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block' }}>
                      Salem Central Ops Desk: Anand
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Direct Phone: 0427-2448888
                    </Typography>
                  </Box>
                </Box>

                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                  onClick={() => alert('Dialing Salem Central Ops: 0427-2448888')}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B' }
                  }}
                >
                  Call Desk
                </Button>
              </Paper>

              {/* Cancel Option for Queued Booking */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setCancelModalOpen(true)}
                  sx={{
                    color: '#DC2626',
                    bgcolor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    borderRadius: '10px',
                    py: 1,
                    fontWeight: 700,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FECACA' }
                  }}
                >
                  Cancel booking request
                </Button>
              </Box>
            </Card>
          </>
        ) : (
          /* ========================================================================= */
          /* SCENARIO B: ACTIVE ONLINE TECHNICIAN IS ASSIGNED & TRACKABLE */
          /* ========================================================================= */
          <>
            {/* Real-time Status Alert based on Lifecycle */}
            {bookingStatus === 'quote_presented' ? (
              <Alert 
                severity="info" 
                icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '13px' }}
              >
                📋 Technician {tech.name} has prepared your digital estimate. Review line items and approve to authorize service.
              </Alert>
            ) : bookingStatus === 'quote_approved' ? (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '13px' }}
              >
                ⚡ Quote approved & payment secured in Cashless Escrow! Technician is performing the repair.
              </Alert>
            ) : (bookingStatus === 'inspecting' || bookingStatus === 'arrived') ? (
              <Alert 
                severity="warning" 
                icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontSize: '13px' }}
              >
                🔍 Technician {tech.name} has arrived and is conducting diagnostic inspection at your doorstep.
              </Alert>
            ) : (
              <Alert 
                severity="info" 
                icon={<TwoWheelerIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 600, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', fontSize: '12.5px' }}
              >
                🛵 Technician {tech.name} is en route to your doorstep (ETA: {tech.eta || '8 mins'} • {tech.distanceKm || '1.8 km'}).
              </Alert>
            )}

            {/* 1. Map Card with Live Route, Google Maps Integration & Dynamic ETA */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                overflow: 'hidden',
                mb: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ position: 'relative', height: 260 }}>
                {/* Google Maps Live Real-Time Embed (100% Free, Zero API Key) */}
                <iframe
                  title="Google Maps Live Location"
                  width="100%"
                  height="260"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${tech?.lat || 11.6780},${tech?.lng || 78.1580}&hl=en&z=16&output=embed`}
                  allowFullScreen
                />

                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: (bookingStatus === 'inspecting' || bookingStatus === 'arrived') ? '#D97706' : (bookingStatus === 'quote_presented' || bookingStatus === 'quote_approved' ? '#16A34A' : '#0F172A'),
                    color: '#FFFFFF',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    zIndex: 800,
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  <TwoWheelerIcon sx={{ color: '#FFFFFF', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11.5px' }}>
                    {(bookingStatus === 'inspecting' || bookingStatus === 'arrived') 
                      ? 'Technician at doorstep • Diagnostic inspection' 
                      : (bookingStatus === 'quote_presented' 
                          ? 'Digital quote ready for customer review' 
                          : `${tech.name} • Live Location (${tech.eta || '8 mins'} • ${tech.distanceKm || '1.8 km'})`)}
                  </Typography>
                </Paper>
              </Box>

              {/* 📍 One-Tap Open in Google Maps App Button */}
              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12px' }}>
                      Google Maps Live GPS Tracking
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block' }}>
                    Tech Coordinates: {tech?.lat || 11.6780}, {tech?.lng || 78.1580} (Salem City)
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LocationOnIcon sx={{ fontSize: 18, color: '#EF4444' }} />}
                  onClick={() => {
                    const techLat = tech?.lat || 11.6780;
                    const techLng = tech?.lng || 78.1580;
                    const custLat = parseFloat(trackData?.booking?.customer_lat) || 11.6643;
                    const custLng = parseFloat(trackData?.booking?.customer_lng) || 78.1460;
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${techLat},${techLng}&destination=${custLat},${custLng}&travelmode=two_wheeler`;
                    window.open(googleMapsUrl, '_blank');
                  }}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#0F172A',
                    border: '1.5px solid #2563EB',
                    borderRadius: '8px',
                    py: 0.8,
                    px: 1.6,
                    fontWeight: 800,
                    fontSize: '12px',
                    textTransform: 'none',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)',
                    '&:hover': { bgcolor: '#EFF6FF', borderColor: '#1D4ED8' }
                  }}
                >
                  📍 Open Tech Location in Google Maps
                </Button>
              </Box>
            </Card>

            {/* Diagnostic Inspection Active Notice (when tech is inspecting) */}
            {(bookingStatus === 'inspecting' || bookingStatus === 'arrived') && (
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '12px',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#D97706', animation: 'pulse 1.5s infinite' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '13px' }}>
                    Live Diagnostic Inspection in Progress
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#78350F', fontSize: '11.5px', display: 'block', lineHeight: 1.5 }}>
                  {tech.name} is currently inspecting your appliance at your doorstep. Once diagnosis is complete, you will receive an itemized digital job card and price estimate right here.
                </Typography>
              </Card>
            )}

            {/* Quote Presented Notification & Direct Review Card */}
            {bookingStatus === 'quote_presented' && (
              <Card
                elevation={2}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '2px solid #0284C7',
                  borderRadius: '10px',
                  p: 2,
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <ReceiptLongIcon sx={{ color: '#0284C7', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                      Diagnostic Estimate Ready
                    </Typography>
                  </Box>
                  <Chip 
                    label={`₹${trackData?.booking?.quote_subtotal ? parseFloat(trackData.booking.quote_subtotal).toFixed(2) : '900.00'}`} 
                    size="small" 
                    sx={{ bgcolor: '#0284C7', color: '#FFF', fontWeight: 800, fontSize: '12px' }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '12px', mb: 1.5, lineHeight: 1.4 }}>
                  Technician {tech.name} has submitted the diagnosis and itemized OEM parts quote. Review parts and approve with cashless escrow protection.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/quote?bookingId=${bookingId}`)}
                  sx={{ bgcolor: '#0284C7', color: '#FFF', borderRadius: '8px', py: 1.1, fontWeight: 800, fontSize: '13px', textTransform: 'none', '&:hover': { bgcolor: '#0369A1' } }}
                >
                  Review Digital Estimate & Job Card →
                </Button>
              </Card>
            )}

            {/* Doorstep Start / Completion Confirmation OTP Card */}
            {bookingStatus !== 'completed' && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: isInspectingOrArrived
                    ? '#F0FDF4' 
                    : (bookingStatus === 'quote_approved' ? '#F0FDF4' : '#F8FAFC'),
                  border: isInspectingOrArrived
                    ? '1.5px solid #86EFAC' 
                    : (bookingStatus === 'quote_approved' ? '1.5px solid #86EFAC' : '1.5px solid #CBD5E1'),
                  borderRadius: '10px',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <ShieldIcon sx={{ color: (isInspectingOrArrived || bookingStatus === 'quote_approved') ? '#16A34A' : '#2563EB', fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                      {bookingStatus === 'quote_approved'
                        ? 'Job Completion & Escrow Release OTP'
                        : (isInspectingOrArrived
                            ? 'Technician Verified & Allowed Entry ✓'
                            : 'Doorstep Safety Verification (பாதுகாப்பு சரிபார்ப்பு)')}
                    </Typography>
                  </Box>

                  <Chip 
                    label={
                      bookingStatus === 'quote_approved' 
                        ? 'Escrow Protected' 
                        : (isInspectingOrArrived
                            ? 'Verified & In Home' 
                            : 'Ask Tech for PIN')
                    }
                    size="small"
                    sx={{
                      bgcolor: (isInspectingOrArrived || bookingStatus === 'quote_approved') ? '#DCFCE7' : '#EFF6FF',
                      color: (isInspectingOrArrived || bookingStatus === 'quote_approved') ? '#166534' : '#1D4ED8',
                      fontWeight: 800,
                      fontSize: '10.5px'
                    }}
                  />
                </Box>

                {(isInspectingOrArrived && bookingStatus !== 'quote_approved') ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.4, borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 22 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#14532D', fontSize: '12.5px', fontWeight: 700 }}>
                        Genuine SalemSeva Technician Verified & Permitted Inside
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#166534', fontSize: '11px' }}>
                        Diagnostic inspection and assessment of your appliance is in progress.
                      </Typography>
                    </Box>
                  </Box>
                ) : bookingStatus === 'quote_approved' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.4, borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 22 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#14532D', fontSize: '12.5px', fontWeight: 700 }}>
                        Repair Work in Progress • Escrow Payment Secured
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#166534', fontSize: '11px' }}>
                        100% protected under SalemSeva Escrow. Technician will test the appliance before completing the job.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '12px', mb: 1.2, lineHeight: 1.4 }}>
                      🔒 <strong>For your family's safety:</strong> When the technician arrives at your door, ask them: <em>"What is your SalemSeva Verification PIN?"</em> Enter their 4-digit reply below before opening the door or letting them in.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <input
                        type="text"
                        maxLength="4"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Type Tech's 4-digit PIN"
                        value={enteredTechOtp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          setEnteredTechOtp(val);
                          if (techOtpError) setTechOtpError('');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '16px',
                          fontWeight: '800',
                          letterSpacing: '3px',
                          textAlign: 'center',
                          borderRadius: '6px',
                          border: techOtpError ? '1.5px solid #EF4444' : '1.5px solid #2563EB',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A'
                        }}
                      />
                      <Button
                        variant="contained"
                        disabled={isVerifyingTechOtp || enteredTechOtp.length !== 4}
                        onClick={handleVerifyTechnicianOtp}
                        sx={{
                          bgcolor: '#2563EB',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '12px',
                          textTransform: 'none',
                          borderRadius: '6px',
                          py: 1,
                          px: 2,
                          '&:hover': { bgcolor: '#1D4ED8' }
                        }}
                      >
                        {isVerifyingTechOtp ? 'Verifying...' : 'Verify & Let In (அனுமதி) ✓'}
                      </Button>
                    </Box>

                    {techOtpError && (
                      <Alert severity="error" sx={{ mt: 1, py: 0.2, fontSize: '11.5px', borderRadius: '6px' }}>
                        {techOtpError}
                      </Alert>
                    )}
                  </Box>
                )}
              </Paper>
            )}

            {/* 2. Technician Profile Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                p: 2,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <EngineeringIcon sx={{ fontSize: 24 }} />
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', lineHeight: 1.2 }}>
                      {tech.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                      Certified Partner • {tech.primaryTrade?.toUpperCase() || 'TECHNICIAN'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                      <StarIcon sx={{ color: '#D97706', fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>
                        {tech.rating || 4.92}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 500, fontSize: '11px' }}>
                        ({tech.jobsCompleted || 428} jobs • Salem verified)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#16A34A !important', fontSize: 13 }} />}
                  label="Govt KYC"
                  size="small"
                  sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 600, fontSize: '10px', height: 20, borderRadius: '4px' }}
                />
              </Box>

              {/* Action Buttons: Chat & Call */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setChatOpen(true)}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '6px',
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                  }}
                >
                  Masked chat
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setCallOpen(true)}
                  sx={{
                    bgcolor: '#2563EB',
                    borderRadius: '6px',
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1D4ED8' }
                  }}
                >
                  Call technician
                </Button>
              </Box>
              {/* 2-Part Payment Status Info */}
              <Box sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', p: 1.2, mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, fontSize: '11.5px' }}>
                    Part 1 (Visit & Travel Fee): <strong>₹99 Paid</strong>
                  </Typography>
                  <Chip label="100% to Tech" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: '10.5px', display: 'block', mt: 0.3 }}>
                  Part 2 (Repair quote) will be itemized only after physical inspection.
                </Typography>
              </Box>
            </Card>

            {/* 3. Dynamic Action Button based on Lifecycle Stage */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {bookingStatus === 'quote_presented' ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                  onClick={() => navigate(`/quote?bookingId=${bookingId}`)}
                  sx={{
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    py: 1.4,
                    fontWeight: 800,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    '&:hover': { bgcolor: '#0369A1' }
                  }}
                >
                  Review Digital Estimate & Job Card (₹900.00) →
                </Button>
              ) : (bookingStatus === 'inspecting' || bookingStatus === 'arrived') ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled
                  sx={{
                    bgcolor: '#FFFBEB !important',
                    color: '#92400E !important',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '8px',
                    py: 1.3,
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textTransform: 'none'
                  }}
                >
                  🔍 Diagnosis in Progress • Quote arriving shortly...
                </Button>
              ) : bookingStatus === 'completed' ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ReceiptLongIcon sx={{ fontSize: 20 }} />}
                  onClick={() => navigate('/history')}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    py: 1.4,
                    fontWeight: 800,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
                    '&:hover': { bgcolor: '#1E293B' }
                  }}
                >
                  🎉 Work Completed! View Receipt & Warranty Slip (ரசீது) →
                </Button>
              ) : bookingStatus === 'quote_approved' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
                    onClick={() => setConfirmCompletionModalOpen(true)}
                    sx={{
                      bgcolor: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      py: 1.4,
                      fontWeight: 800,
                      fontSize: '14px',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                      '&:hover': { bgcolor: '#15803D' }
                    }}
                  >
                    Confirm Work Finished & Release Escrow (வேலை முடிந்தது) ✓
                  </Button>
                  <Typography variant="caption" sx={{ color: '#166534', textAlign: 'center', fontWeight: 600, fontSize: '11.5px' }}>
                    Click above to inspect & approve completed work and release escrow payout to technician.
                  </Typography>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled
                  sx={{
                    bgcolor: '#F1F5F9 !important',
                    color: '#64748B !important',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    py: 1.3,
                    fontWeight: 600,
                    fontSize: '13.5px',
                    textTransform: 'none'
                  }}
                >
                  🛵 Technician En Route • Share OTP {trackData?.booking?.customer_otp || '4892'} at Doorstep
                </Button>
              )}

              {/* Cancellation Policy Safeguard: Once Quote is Approved and Parts Purchased, Self-Cancel is Disabled */}
              {bookingStatus === 'quote_approved' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: '#FEF3C7',
                    border: '1px dashed #D97706',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', display: 'block', fontSize: '11.5px' }}>
                      🔒 OEM Parts Purchased & Service Authorized
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B45309', fontSize: '10.5px' }}>
                      Self-cancellation is locked to protect technician parts procurement. For emergency assistance:
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                    onClick={() => alert('Dialing Salem Central Ops: 0427-2448888')}
                    sx={{
                      borderColor: '#D97706',
                      color: '#92400E',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#FDE68A' }
                    }}
                  >
                    Call Ops Desk
                  </Button>
                </Paper>
              ) : bookingStatus !== 'completed' ? (
                /* Cancel Button in Active Tracking (Available before quote approval) */
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setCancelModalOpen(true)}
                  sx={{
                    borderColor: '#FECACA',
                    color: '#DC2626',
                    borderRadius: '8px',
                    py: 1,
                    fontWeight: 600,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    bgcolor: '#FFF',
                    '&:hover': { bgcolor: '#FEF2F2', borderColor: '#F87171' }
                  }}
                >
                  Cancel booking request
                </Button>
              ) : null}
            </Box>
          </>
        )}

      </Container>

      {/* Universal Cancel Booking Modal */}
      <CancelBookingModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        bookingId={bookingId}
        currentStatus={bookingStatus}
      />


      {/* 📅 RESCHEDULE SLOT MODAL */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A' }}>
          Update Preferred Inspection Time
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Salem Central Ops will assign a verified partner according to your selected time slot:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              { id: 'priority_12h', title: 'Priority 12-Hour Window', subtitle: 'First available technician' },
              { id: 'morning_9_11', title: 'Tomorrow Morning', subtitle: '09:00 AM - 11:00 AM' },
              { id: 'afternoon_2_4', title: 'Tomorrow Afternoon', subtitle: '02:00 PM - 04:00 PM' },
              { id: 'evening_5_7', title: 'Tomorrow Evening', subtitle: '05:00 PM - 07:00 PM' }
            ].map(slot => (
              <Paper
                key={slot.id}
                elevation={0}
                onClick={() => setNewSlot(slot.id)}
                sx={{
                  p: 1.4,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: newSlot === slot.id ? '#0284C7' : '#E2E8F0',
                  bgcolor: newSlot === slot.id ? '#F0F9FF' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Radio checked={newSlot === slot.id} size="small" sx={{ p: 0, color: '#0284C7' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                    {slot.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{slot.subtitle}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRescheduleOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateSlot}
            disabled={slotUpdating}
            sx={{ bgcolor: '#0284C7', color: '#FFF', fontWeight: 800, borderRadius: '10px' }}
          >
            {slotUpdating ? 'Saving...' : 'Confirm Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Voice Mic Button */}
      <Fab
        onClick={onOpenVoiceAgent}
        sx={{
          position: 'fixed',
          bottom: 72,
          right: { xs: 20, sm: 'calc(50% - 260px)' },
          width: 54,
          height: 54,
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
          zIndex: 1050
        }}
      >
        <MicIcon sx={{ fontSize: 26 }} />
      </Fab>

      {/* Masked Chat Modal */}
      <MaskedChatModal 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        bookingId={bookingId}
        userRole="customer"
        peerName={tech?.name || 'K. Ramesh'} 
      />

      {/* Secure Masked VoIP Calling Modal */}
      <VoipCallModal 
        open={callOpen} 
        onClose={() => {
          setCallOpen(false);
          setIsIncomingCall(false);
        }} 
        bookingId={bookingId}
        calleeName={tech?.name || 'K. Ramesh (Technician)'} 
        role="Customer" 
        isIncoming={isIncomingCall}
      />

      {/* Instant Incoming Message Notification Banner */}
      <Snackbar
        open={Boolean(incomingMessageToast)}
        autoHideDuration={6000}
        onClose={() => setIncomingMessageToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 20, color: '#2563EB' }} />}
          action={
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setIncomingMessageToast(null);
                setChatOpen(true);
              }}
              sx={{ bgcolor: '#2563EB', color: '#FFF', fontSize: '11px', textTransform: 'none', py: 0.2 }}
            >
              Reply
            </Button>
          }
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #334155',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            alignItems: 'center'
          }}
        >
          <strong>{tech?.name || 'K. Ramesh'}:</strong> {incomingMessageToast}
        </Alert>
      </Snackbar>

      {/* Customer Work Finished Confirmation & Escrow Release Dialog (Without Duplicate Review Form) */}
      <Dialog
        open={confirmCompletionModalOpen}
        onClose={() => setConfirmCompletionModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
            Confirm Work Finished (வேலை முடிந்தது)
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '13px', lineHeight: 1.5 }}>
            Did technician <strong>{tech?.name || 'K. Ramesh'}</strong> complete the service and demonstrate the working unit properly?
          </Typography>

          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800 }}>
                Instant Escrow Payout:
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 900 }}>
                ₹{trackData?.booking?.quote_subtotal ? parseFloat(trackData.booking.quote_subtotal).toFixed(2) : '900.00'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#15803D', display: 'block', fontSize: '11px' }}>
              Releases funds to technician's UPI and activates your <strong>30-day warranty</strong>.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setConfirmCompletionModalOpen(false)}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
          >
            Not Yet Finished
          </Button>
          <Button
            variant="contained"
            disabled={isReleasingEscrow}
            onClick={async () => {
              setIsReleasingEscrow(true);
              try {
                // 1. Release escrow payment on backend
                await fetch('http://localhost:8080/api/v1/payments/escrow/release', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookingId: bookingId,
                    customerOtp: '4892'
                  })
                }).catch(() => {});

                // 2. Set status to completed
                await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'completed' })
                }).catch(() => {});

                setConfirmCompletionModalOpen(false);
                if (trackData?.booking) {
                  setTrackData(prev => ({
                    ...prev,
                    booking: { ...prev.booking, status: 'completed' }
                  }));
                }
                localStorage.setItem('salemseva_quote_status_' + bookingId, 'completed');
                window.dispatchEvent(new CustomEvent('salemseva_quote_updated', { detail: { bookingId, status: 'completed' } }));
                window.dispatchEvent(new Event('storage'));
                
                // 3. Immediately route to the full /rate review page
                navigate(`/rate?bookingId=${bookingId}`, { replace: true });
              } catch (e) {
                console.warn('Escrow release note:', e);
                navigate(`/rate?bookingId=${bookingId}`, { replace: true });
              } finally {
                setIsReleasingEscrow(false);
              }
            }}
            sx={{
              bgcolor: '#16A34A',
              color: '#FFF',
              fontWeight: 800,
              borderRadius: '8px',
              textTransform: 'none',
              py: 1.1,
              px: 2,
              '&:hover': { bgcolor: '#15803D' }
            }}
          >
            {isReleasingEscrow ? 'Releasing Escrow...' : 'Yes, Finished • Release & Rate →'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Digital Quote Arrival Instant Popup Modal */}
      <Dialog
        open={quoteAlertModalOpen && bookingStatus === 'quote_presented'}
        onClose={() => {
          quoteDismissedRef.current = true;
          setQuoteAlertModalOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            border: '2px solid #0284C7',
            boxShadow: '0 12px 36px rgba(2, 132, 199, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <ReceiptLongIcon sx={{ color: '#0284C7', fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
              Digital Estimate & Job Card Ready
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>
              மதிப்பீடு தயாராக உள்ளது
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800 }}>
                DIAGNOSED SUB-TOTAL:
              </Typography>
              <Typography variant="h6" sx={{ color: '#0C4A6E', fontWeight: 900 }}>
                ₹{trackData?.booking?.quote_subtotal ? parseFloat(trackData.booking.quote_subtotal).toFixed(2) : '900.00'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.4 }}>
              Technician <strong>{tech?.name || 'K. Ramesh'}</strong> has completed doorstep diagnosis and prepared an itemized breakdown with genuine warranty parts.
            </Typography>
          </Paper>

          <Typography variant="caption" sx={{ color: '#166534', bgcolor: '#F0FDF4', p: 1, borderRadius: '6px', border: '1px solid #BBF7D0', display: 'block', fontSize: '11px', mb: 1 }}>
            🛡️ <strong>Cashless Escrow Protected:</strong> Funds are held safely and only disbursed to technician after you confirm work completion.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1, flexDirection: 'column' }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              setQuoteAlertModalOpen(false);
              navigate(`/quote?bookingId=${bookingId}`);
            }}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '13.5px',
              borderRadius: '8px',
              py: 1.2,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Review Line Items & Approve Escrow →
          </Button>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              quoteDismissedRef.current = true;
              setQuoteAlertModalOpen(false);
            }}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', fontSize: '12px' }}
          >
            Review on Tracking Screen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation */}
      <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 60, '& .Mui-selected': { color: '#0284C7', fontWeight: 800 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 22 }} />} sx={{ color: '#0284C7' }} onClick={() => navigate('/')} />
          <BottomNavigationAction label="AI Voice" icon={<GraphicEqIcon sx={{ fontSize: 22, color: '#0284C7' }} />} sx={{ color: '#0284C7' }} onClick={onOpenVoiceAgent} />
          <BottomNavigationAction label="History" icon={<ReceiptLongIcon sx={{ fontSize: 22 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet & Hub" icon={<AccountCircleIcon sx={{ fontSize: 22 }} />} onClick={() => navigate('/wallet')} />
        </BottomNavigation>
      </Paper>

    </Box>
  );
}
