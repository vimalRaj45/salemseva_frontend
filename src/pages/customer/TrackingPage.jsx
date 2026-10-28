import { API_V1_URL } from '../../config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
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
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Professional Material UI Icons
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import HeadsetIcon from '@mui/icons-material/Headset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MicIcon from '@mui/icons-material/Mic';
import BuildIcon from '@mui/icons-material/Build';
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
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

import CustomerRescheduleDrawer from './CustomerRescheduleDrawer';
import SalemLottie from '../../components/SalemLottie';
import SalemSeamlessLoader from '../../components/SalemSeamlessLoader';
import { NativeNotifier } from '../../services/nativeNotify';
import toast from 'react-hot-toast';

export default function TrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');
  const storedBookingId = localStorage.getItem('shazuone_active_booking');
  const bookingId = urlBookingId || storedBookingId || '';

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  // Incoming call flag for VoIP modal
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  // Guard against double escrow release
  const escrowReleasedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoAnswer') === 'true') {
      navigate(`/call/${bookingId}?incoming=true&autoAnswer=true`);
    }
    const handleOpenActiveCall = () => {
      navigate(`/call/${bookingId}?incoming=true`);
    };
    window.addEventListener('shazuone_open_active_call', handleOpenActiveCall);
    return () => window.removeEventListener('shazuone_open_active_call', handleOpenActiveCall);
  }, []);

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
  const [billDetails, setBillDetails] = useState(null);
  const [viewBillModalOpen, setViewBillModalOpen] = useState(false);

  // Quote Arrival Interactive Modal State
  const [quoteAlertModalOpen, setQuoteAlertModalOpen] = useState(false);
  const quoteDismissedRef = useRef(false);

  // Reschedule Slot Modal State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [slotUpdating, setSlotUpdating] = useState(false);
  const [selectedRescheduleDayIndex, setSelectedRescheduleDayIndex] = useState(0);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState('10:00 AM - 12:00 PM');
  const [selectedRescheduleReason, setSelectedRescheduleReason] = useState('Personal schedule conflict');

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
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/verify-otp`, {
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
      localStorage.setItem('shazuone_partner_step', '3');
      localStorage.setItem('shazuone_quote_status_' + bookingId, 'inspecting');
      window.dispatchEvent(new CustomEvent('shazuone_status_updated', { detail: { bookingId, status: 'inspecting' } }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setTechOtpError('Network error. Please try again.');
    } finally {
      setIsVerifyingTechOtp(false);
    }
  };

  // Poll real database status from backend every 1.2 seconds & listen to instant quote events
  useEffect(() => {
    if (!bookingId) {
      navigate('/', { replace: true });
      return;
    }
    localStorage.setItem('shazuone_active_booking', bookingId);
    let isMounted = true;

    const fetchTracking = async () => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/track`);
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.booking?.status === 'cancelled' || data.isCancelled) {
            localStorage.removeItem('shazuone_active_booking');
            localStorage.removeItem('shazuone_booking_id');
            localStorage.removeItem('shazuone_quote_status_' + bookingId);
            setCallOpen(false);
            setChatOpen(false);
            setQuoteAlertModalOpen(false);
          }

          // If local storage has quote_presented flag, ensure status reflects it immediately
          const localQuoteStatus = localStorage.getItem('shazuone_quote_status_' + bookingId);
          if (localQuoteStatus === 'quote_presented' && data.booking && data.booking.status !== 'quote_approved' && data.booking.status !== 'completed') {
            data.booking.status = 'quote_presented';
          }

          if (data.booking?.status === 'quote_presented' && !quoteDismissedRef.current) {
            setQuoteAlertModalOpen(true);
          }

          setTrackData(data);
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

    window.addEventListener('shazuone_quote_updated', handleQuoteEvent);
    window.addEventListener('storage', handleQuoteEvent);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('shazuone_quote_updated', handleQuoteEvent);
      window.removeEventListener('storage', handleQuoteEvent);
    };
  }, [bookingId]);

  // Real-time VoIP Call & Chat Notification Poller
  useEffect(() => {
    let isMounted = true;

    const pollCommunications = async () => {
      try {
        // 1. Check for incoming VoIP calls from technician
        const callRes = await fetch(`${API_V1_URL}/webrtc/call/status?bookingId=${bookingId}`);
        const callData = await callRes.json();
        if (callData.success && callData.call && isMounted) {
          if (callData.call.active && callData.call.caller === 'technician' && callData.call.status === 'RINGING') {
            if (!callOpen) {
              NativeNotifier.notifyIncomingCall({
                callerName: tech?.name || 'Technician',
                bookingId,
                role: 'Customer'
              });
            }
            navigate(`/call/${bookingId}?incoming=true`);
          }
        }

        // 2. Check for incoming chat messages from technician
        const msgRes = await fetch(`${API_V1_URL}/bookings/${bookingId}/messages`);
        const msgData = await msgRes.json();
        if (msgData.success && msgData.messages && isMounted) {
          const msgs = msgData.messages;
          if (lastMessageCountRef.current === -1) {
            lastMessageCountRef.current = msgs.length;
          } else if (msgs.length > lastMessageCountRef.current) {
            const latest = msgs[msgs.length - 1];
            if (latest.sender === 'technician' && !chatOpenRef.current) {
              setIncomingMessageToast(latest.text);
              NativeNotifier.notifyIncomingMessage({
                senderName: tech?.name || 'Technician',
                messageText: latest.text,
                bookingId
              });
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

  const RESCHEDULE_TIME_SLOTS = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  const RESCHEDULE_REASONS = [
    'Personal schedule conflict',
    'Not available at home',
    'Prefer earlier time slot',
    'Emergency travel',
    'Weather or heavy rain'
  ];

  const rescheduleDates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayName = isToday ? 'TODAY' : isTomorrow ? 'TOM' : d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
      const fullDateText = isToday
        ? `Today, ${dayNumber} ${monthName}`
        : isTomorrow
        ? `Tomorrow, ${dayNumber} ${monthName}`
        : `${d.toLocaleDateString('en-IN', { weekday: 'short' })}, ${dayNumber} ${monthName}`;
      return { offset: i, iso, dayName, dayNumber, monthName, fullDateText };
    });
  }, []);

  const handleConfirmCustomerReschedule = async () => {
    const activeDateObj = rescheduleDates[selectedRescheduleDayIndex] || rescheduleDates[0];
    const finalFormattedSlot = `${activeDateObj.fullDateText} • ${selectedRescheduleTime}`;
    setSlotUpdating(true);
    try {
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledSlot: finalFormattedSlot,
          reason: selectedRescheduleReason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Appointment rescheduled successfully. ₹0 fee incurred.');
        setRescheduleOpen(false);
        const trackRes = await fetch(`${API_V1_URL}/bookings/${bookingId}/track`);
        const trackJson = await trackRes.json();
        if (trackJson.success) setTrackData(trackJson);
      } else {
        toast.error(data.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      toast.error('Network error while rescheduling');
    } finally {
      setSlotUpdating(false);
    }
  };

  const handleResolveTechProposal = async (actionType) => {
    try {
      let bodyData = { action: 'accept' };
      if (actionType === 'reject_handover') {
        bodyData = {
          action: 'reject',
          requestHandover: true,
          reason: 'Customer requested another technician'
        };
      } else if (actionType === 'decline_keep_original') {
        bodyData = {
          action: 'decline_keep_original'
        };
      }
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/resolve-tech-reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Updated appointment schedule');
        const trackRes = await fetch(`${API_V1_URL}/bookings/${bookingId}/track`);
        const trackJson = await trackRes.json();
        if (trackJson.success) setTrackData(trackJson);
      } else {
        toast.error(data.error || 'Failed to update schedule');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    }
  };

  const bookingStatus = trackData?.booking?.status || 'matching';
  const booking = trackData?.booking || null;
  const isScheduledBooking = trackData?.booking?.booking_type === 'scheduled' || 
    (Boolean(trackData?.booking?.scheduled_slot) && trackData?.booking?.scheduled_slot !== 'instant_now') || 
    Boolean(trackData?.isScheduled);

  const isRideActive = ['assigned', 'technician_assigned', 'partner_assigned', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus);
  const tech = trackData?.technician;
  // Once a technician is assigned to the booking, enable live communication (call & chat) at all stages
  const hasOnlineTech = Boolean(tech);

  // Poll uploaded store bill & dynamic settlement when quote is approved or completed
  useEffect(() => {
    let isMounted = true;
    if (bookingId && ['quote_approved', 'completed'].includes(bookingStatus)) {
      const fetchBill = async () => {
        try {
          const res = await fetch(`${API_V1_URL}/partner/bookings/${bookingId}/bill`);
          const data = await res.json();
          if (data.success && isMounted) {
            setBillDetails(data);
          }
        } catch (_) {}
      };
      fetchBill();
      const interval = setInterval(fetchBill, 2500);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [bookingId, bookingStatus]);

  const isInspectingOrArrived = ['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus) || techOtpSuccess;
  const techArrived = ['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus);
  const hasQuote = ['quote_presented', 'quote_approved'].includes(bookingStatus);

  const getSlotLabel = (slot) => {
    if (!slot) return 'Standard Scheduled Window';
    if (slot.includes('•') || slot.includes(',') || slot.includes(':') || slot.includes('-')) {
      return slot;
    }
    switch (slot) {
      case 'morning_9_11':
        return 'Tomorrow Morning (09:00 AM - 11:00 AM)';
      case 'afternoon_2_4':
        return 'Tomorrow Afternoon (02:00 PM - 04:00 PM)';
      case 'evening_5_7':
        return 'Tomorrow Evening (05:00 PM - 07:00 PM)';
      default:
        return slot;
    }
  };

  if (isLoading && !trackData) {
    return <SalemSeamlessLoader mode="dispatch" />;
  }

  // Admin or System Cancellation Screen & Customer Release
  if (bookingStatus === 'cancelled') {
    const cancelReason = trackData?.booking?.cancellation_reason || trackData?.booking?.cancellationReason || trackData?.cancellationReason || 'Cancelled by Shazu One Central Operations';
    const cancelDetails = trackData?.booking?.cancellation_details || trackData?.booking?.cancellationDetails || trackData?.cancellationDetails || 'The service request has been closed. Any advance payment held in escrow has been automatically refunded to your Shazu One Wallet.';
    const cancelledBy = trackData?.booking?.cancelled_by || trackData?.booking?.cancelledBy || 'admin';
    const visitFee = trackData?.booking?.visit_fee || trackData?.booking?.visitFee || 49;

    return (
      <Box sx={{ bgcolor: '#0F172A', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3 } }}>
        <Container maxWidth="xs" sx={{ p: 0 }}>
          <Card
            elevation={0}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: '20px',
              p: { xs: 2.5, sm: 3.5 },
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center'
            }}
          >
            {/* Warning Icon Badge */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: '#F87171'
              }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Chip
              label={String(cancelledBy).includes('admin') ? 'DISPATCH OPERATIONS NOTICE' : 'BOOKING CANCELLED'}
              size="small"
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                fontWeight: 800,
                fontSize: '10.5px',
                mb: 1.5,
                border: '1px solid rgba(239, 68, 68, 0.4)'
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', mb: 0.8, fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
              Booking #{bookingId} Cancelled
            </Typography>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12.5px', lineHeight: 1.5, mb: 2.2 }}>
              This service order has been released and closed by {String(cancelledBy).includes('admin') ? 'Shazu One Central Operations' : 'the system'}.
            </Typography>

            {/* Cancellation Reason Box */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '12px',
                textAlign: 'left',
                mb: 2.2
              }}
            >
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.4 }}>
                Reason for Cancellation:
              </Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', mb: 0.6 }}>
                {cancelReason}
              </Typography>
              {cancelDetails && (
                <Typography sx={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
                  {cancelDetails}
                </Typography>
              )}
            </Paper>

            {/* Escrow Refund Status Card */}
            <Box
              sx={{
                p: 1.6,
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.4,
                textAlign: 'left',
                mb: 2.8
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#A7F3D0' }}>
                  ₹{visitFee}.00 Escrow Refunded to Wallet
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#6EE7B7', lineHeight: 1.3 }}>
                  Your advance visit payment has been released back to your account.
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  localStorage.removeItem('shazuone_active_booking');
                  localStorage.removeItem('shazuone_booking_id');
                  navigate('/', { replace: true });
                }}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  py: 1.1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                Return to Home & Book Again
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  localStorage.removeItem('shazuone_active_booking');
                  navigate('/wallet');
                }}
                sx={{
                  borderColor: '#334155',
                  color: '#CBD5E1',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  py: 0.9,
                  borderRadius: '10px',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#64748B', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                View Shazu One Wallet
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Technician Reschedule Proposal Alert Banner */}
        {trackData?.booking?.reschedule_status === 'pending_customer_approval' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: '14px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <NotificationsActiveIcon sx={{ color: '#D97706', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '14px' }}>
                Technician Requested Revised Appointment Slot
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#78350F', fontSize: '13px', lineHeight: 1.5, mb: 1 }}>
              Your assigned specialist <strong>{tech?.name || 'Technician'}</strong> requested to adjust the service time:
            </Typography>
            <Box sx={{ p: 1.2, bgcolor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#B45309', fontSize: '13.5px' }}>
                Proposed: {trackData?.booking?.proposed_rescheduled_slot}
              </Typography>
              {trackData?.booking?.reschedule_reason && (
                <Typography variant="caption" sx={{ color: '#92400E', display: 'block', mt: 0.3, fontStyle: 'italic' }}>
                  Reason: {trackData?.booking?.reschedule_reason}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleResolveTechProposal('accept')}
                sx={{
                  bgcolor: '#059669',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#047857' }
                }}
              >
                Accept New Time
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleResolveTechProposal('decline_keep_original')}
                sx={{
                  borderColor: '#64748B',
                  color: '#334155',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#475569' }
                }}
              >
                Keep Original Time
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleResolveTechProposal('reject_handover')}
                sx={{
                  borderColor: '#D97706',
                  color: '#B45309',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#FEF3C7' }
                }}
              >
                Reassign Specialist (Salem Ops)
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(`/booking/${bookingId}/reschedule`)}
                sx={{
                  color: '#0284C7',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'none'
                }}
              >
                Choose Custom Slot
              </Button>
            </Box>
          </Paper>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO A: NO TECHNICIAN ACTIVE RIGHT NOW OR SCHEDULED RIDE NOT STARTED */}
        {/* ========================================================================= */}
        {!hasOnlineTech ? (
          <>
            {/* Top Status Alert */}
            <Alert 
              severity={isScheduledBooking ? (tech ? "success" : "info") : "info"} 
              icon={isScheduledBooking ? (tech ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : <ScheduleIcon sx={{ fontSize: 22 }} />) : <ScheduleIcon sx={{ fontSize: 22 }} />}
              sx={{
                mb: 2,
                borderRadius: '16px',
                fontWeight: 800,
                bgcolor: (isScheduledBooking && tech) ? '#F0FDF4' : '#E0F2FE',
                color: (isScheduledBooking && tech) ? '#166534' : '#0369A1',
                border: (isScheduledBooking && tech) ? '1px solid #BBF7D0' : '1px solid #7DD3FC'
              }}
            >
              {isScheduledBooking
                ? (tech
                    ? `Technician Assigned: ${tech.name} is confirmed for your appointment. You will be notified with live GPS tracking when your technician starts traveling.`
                    : `Booking #${bookingId} Confirmed: Your booking was sent to Shazu One Central Ops. They are looking for a certified technician for your scheduled window.`)
                : `Booking #${bookingId} is confirmed and placed in Shazu One Central Ops queue.`
              }
            </Alert>

            {/* If Scheduled Booking & Technician Assigned: Standby Card */}
            {isScheduledBooking && tech && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '16px',
                  p: 2,
                  mb: 2.5,
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#0284C7',
                        width: 44,
                        height: 44,
                        fontWeight: 900,
                        fontSize: '18px'
                      }}
                    >
                      {tech.name ? tech.name[0] : 'T'}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                          {tech.name}
                        </Typography>
                        <Chip
                          icon={<ShieldIcon sx={{ fontSize: 13, color: '#0284C7 !important' }} />}
                          label="KYC VERIFIED"
                          size="small"
                          sx={{ height: 18, fontSize: '9px', fontWeight: 800, bgcolor: '#E0F2FE', color: '#0369A1' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                        {tech.primaryTrade?.toUpperCase() || 'EXPERT'} • {tech.rating || 5.0} Rating ({tech.jobsCompleted || 0}+ Doorsteps)
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="STANDBY"
                    size="small"
                    sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '10px', height: 22 }}
                  />
                </Box>

                <Box sx={{ bgcolor: '#F0FDF4', p: 1.5, borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                  <NotificationsActiveIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, lineHeight: 1.45 }}>
                    Technician assigned and scheduled. You will receive an instant notification with live GPS tracking when the technician starts the ride to your doorstep (~30-45 mins before your chosen window).
                  </Typography>
                </Box>

                {/* Direct Call & Chat Action Buttons in Standby */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/chat/${bookingId}`)}
                    sx={{
                      borderColor: '#CBD5E1',
                      color: '#334155',
                      borderRadius: '8px',
                      py: 0.8,
                      fontWeight: 700,
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
                    onClick={() => navigate(`/call/${bookingId}`)}
                    sx={{
                      bgcolor: '#2563EB',
                      borderRadius: '8px',
                      py: 0.8,
                      fontWeight: 700,
                      fontSize: '12.5px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#1D4ED8' }
                    }}
                  >
                    Call technician
                  </Button>
                </Box>
              </Card>
            )}

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
                  title="Shazu One Central Ops Google Maps"
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
                    Shazu One Central Ops • Priority Allocation Active
                  </Typography>
                </Paper>
              </Box>
            </Card>

            {/* Central Ops Assurance & Allocation Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '16px',
                p: 2.5,
                mb: 2.5,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HubIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                      Shazu One Central Operations Desk
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>
                      சேலம் தலைமை செயல்பாட்டு மையம் • Fairlands Zone
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={(trackData?.booking?.booking_type === 'scheduled' || (!trackData?.booking?.is_urgent_dispatch && trackData?.booking?.scheduled_slot && trackData?.booking?.scheduled_slot !== 'instant_now')) ? 'SCHEDULED PROTOCOL' : 'DISPATCH QUEUE'}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800, fontSize: '10px', height: 22 }}
                />
              </Box>

              {(trackData?.booking?.booking_type === 'scheduled' || (!trackData?.booking?.is_urgent_dispatch && trackData?.booking?.scheduled_slot && trackData?.booking?.scheduled_slot !== 'instant_now')) ? (
                /* 5-STAGE PROGRESSIVE CENTRAL OPS TRANSPARENCY PIPELINE */
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px', display: 'block', mb: 1.5 }}>
                    LIVE OPERATIONS AUDIT TRAIL • நிகழ்நேர செயல்பாட்டு படிகள்
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Stage 1: Request & Escrow */}
                    <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            1. Pre-Booking & Escrow Verified
                          </Typography>
                        </Box>
                        <Chip label="COMPLETED" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3.2, fontSize: '11px', lineHeight: 1.4 }}>
                        கோரிக்கை பதிவு செய்யப்பட்டது. வாடிக்கையாளர் ₹99.00 கட்டணம் Razorpay Escrow முறையில் பாதுகாப்பாக வைக்கப்பட்டுள்ளது.
                      </Typography>
                    </Paper>

                    {/* Stage 2: Locality Feasibility & Spares Check */}
                    <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            2. Locality Feasibility & Diagnostic Assessment
                          </Typography>
                        </Box>
                        <Chip label="PASSED" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3.2, fontSize: '11px', lineHeight: 1.4 }}>
                        சேலம் கட்டுப்பாட்டு மையம் உங்கள் பகுதிக்கான ({trackData?.booking?.locality || 'Fairlands, Salem'}) தொழில்நுட்ப சாத்தியக்கூறுகள் மற்றும் கருவிகளை உறுதி செய்துள்ளது.
                      </Typography>
                    </Paper>

                    {/* Stage 3: Specialist Allocation */}
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1.6, 
                        bgcolor: tech ? '#F0FDF4' : '#FFFBEB', 
                        border: tech ? '1.5px solid #86EFAC' : '1.5px solid #FDE68A', 
                        borderRadius: '12px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {tech ? (
                            <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                          ) : (
                            <HourglassTopIcon sx={{ color: '#D97706', fontSize: 18 }} />
                          )}
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            3. Specialist Allocation & Matching
                          </Typography>
                        </Box>
                        <Chip 
                          label={tech ? "ALLOCATED • COMPLETED" : "IN PROGRESS"} 
                          size="small" 
                          sx={{ 
                            bgcolor: tech ? '#DCFCE7' : '#FEF3C7', 
                            color: tech ? '#15803D' : '#92400E', 
                            fontWeight: 800, 
                            fontSize: '9.5px', 
                            height: 18 
                          }} 
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', pl: 3.2, fontSize: '11px', lineHeight: 1.4 }}>
                        {tech ? (
                          <>நிபுணர் நியமிக்கப்பட்டுள்ளார்: <strong>{tech.name}</strong> ({tech.rating} ரேட்டிங் • {tech.primaryTrade?.toUpperCase() || 'SERVICE'}). வாடிக்கையாளர் மற்றும் நிபுணர் இடையேயான நேரடி அழைப்பு (Call) மற்றும் அரட்டை (Chat) சேவை இப்போது திறக்கப்பட்டுள்ளது.</>
                        ) : (
                          <>சேலம் தலைமை கட்டுப்பாட்டு அறை உங்கள் பகுதிக்கான சிறந்த ரேட்டிங் பெற்ற சான்றளிக்கப்பட்ட தொழில்நுட்ப நிபுணரை ஒதுக்கி வருகிறது.</>
                        )}
                      </Typography>

                      {/* When Stage 3 is Done: Direct Customer-to-Technician Communication Panel */}
                      {tech && (
                        <Box sx={{ mt: 1.5, pl: 3.2 }}>
                          <Box sx={{ 
                            bgcolor: '#FFFFFF', 
                            border: '1px solid #BBF7D0', 
                            borderRadius: '10px', 
                            p: 1.5,
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    bgcolor: '#2563EB', 
                                    fontSize: '13px', 
                                    fontWeight: 800 
                                  }}
                                >
                                  {tech.name ? tech.name.substring(0, 2).toUpperCase() : 'SP'}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A', lineHeight: 1.2 }}>
                                    {tech.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                                    Certified Expert • Rating {tech.rating || 5.0} / 5 ({tech.jobsCompleted || 0} jobs completed)
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: 12, color: '#16A34A !important' }} />}
                                label="Govt KYC"
                                size="small"
                                sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '9.5px', height: 20 }}
                              />
                            </Box>

                            {/* Masked Communication Notice */}
                            <Typography variant="caption" sx={{ display: 'block', color: '#166534', fontWeight: 600, fontSize: '10.5px', mb: 1.2, bgcolor: '#F0FDF4', p: 0.6, borderRadius: '6px' }}>
                              Masked privacy relay active • Call & Chat directly with your technician
                            </Typography>

                            {/* Direct Communication Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />}
                                onClick={() => navigate(`/chat/${bookingId}`)}
                                sx={{
                                  borderColor: '#CBD5E1',
                                  color: '#334155',
                                  borderRadius: '6px',
                                  py: 0.8,
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  textTransform: 'none',
                                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                                }}
                              >
                                Masked chat
                              </Button>

                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<PhoneIcon sx={{ fontSize: 15 }} />}
                                onClick={() => navigate(`/call/${bookingId}`)}
                                sx={{
                                  bgcolor: '#2563EB',
                                  borderRadius: '6px',
                                  py: 0.8,
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: '#1D4ED8' }
                                }}
                              >
                                Call technician
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Paper>

                    {/* Stage 4: Slot Confirmation & Staging */}
                    <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <ScheduleIcon sx={{ color: '#0284C7', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            4. Slot Confirmed & Equipment Staging
                          </Typography>
                        </Box>
                        <Chip label="CONFIRMED" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3.2, fontSize: '11px', lineHeight: 1.4 }}>
                        தேர்வு செய்யப்பட்ட நேரம்: <strong>{getSlotLabel(trackData?.booking?.scheduled_slot)}</strong>. சேவைக்கான அத்தியாவசிய உபகரணங்கள் தயார் செய்யப்பட்டுள்ளன.
                      </Typography>
                    </Paper>

                    {/* Stage 5: Pre-Dispatch & Live Tracking */}
                    <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '10px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <TwoWheelerIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            5. Pre-Dispatch Departure & Live GPS Radar
                          </Typography>
                        </Box>
                        <Chip label="QUEUED" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3.2, fontSize: '11px', lineHeight: 1.4 }}>
                        பணி நேரத்திற்கு 30 நிமிடங்களுக்கு முன்பு நேரலை GPS கண்காணிப்பு மற்றும் டெக்னீசியன் புறப்பாடு அறிவிப்பு தானாகவே திறக்கப்படும்.
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ) : (
                /* Instant Booking Offline Notice */
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                    Notice: All verified technicians are currently offline or busy.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, display: 'block' }}>
                    Your service request is actively monitored by Central Ops. A certified partner will be assigned within our 12-hour guarantee window or at your chosen scheduled slot.
                  </Typography>
                </Paper>
              )}

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
                  onClick={() => navigate(`/booking/${bookingId}/reschedule`)}
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

              {/* Direct Partner or Salem Central Hotline Desk */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#FFFFFF',
                  border: tech ? '1.5px solid #BBF7D0' : '1px dashed #CBD5E1',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: tech ? '0 2px 8px rgba(22, 163, 74, 0.06)' : 'none'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tech ? (
                    <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontSize: '13px', fontWeight: 800 }}>
                      {tech.name ? tech.name[0] : 'T'}
                    </Avatar>
                  ) : (
                    <HeadsetIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                  )}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block' }}>
                      {tech ? `Assigned Specialist: ${tech.name}` : 'Shazu One Central Ops Desk: Anand'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tech ? '#166534' : '#64748B', fontWeight: tech ? 700 : 500 }}>
                      {tech ? 'Masked VoIP Call & Real-time Chat Active' : 'Direct Phone: 0427-2448888'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  {tech && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />}
                      onClick={() => navigate(`/chat/${bookingId}`)}
                      sx={{
                        borderColor: '#CBD5E1',
                        color: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                      }}
                    >
                      Chat
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate(`/call/${bookingId}`)}
                    sx={{
                      bgcolor: tech ? '#2563EB' : '#0F172A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'none',
                      '&:hover': { bgcolor: tech ? '#1D4ED8' : '#1E293B' }
                    }}
                  >
                    {tech ? 'Call Tech' : 'Call Desk'}
                  </Button>
                </Box>
              </Paper>

              {/* Cancel Option for Queued Booking */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/booking/${bookingId}/cancel`)}
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
                Technician {tech.name} has prepared your digital estimate. Review line items and approve to authorize service.
              </Alert>
            ) : bookingStatus === 'quote_approved' ? (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '13px' }}
              >
                Quote approved & payment secured in Cashless Escrow! Technician is performing the repair.
              </Alert>
            ) : (bookingStatus === 'inspecting' || bookingStatus === 'arrived') ? (
              <Alert 
                severity="warning" 
                icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontSize: '13px' }}
              >
                Technician {tech.name} has arrived and is conducting diagnostic inspection at your doorstep.
              </Alert>
            ) : bookingStatus === 'en_route' ? (
              <Box sx={{ mb: 2 }}>
                {/* LottieFiles Technician En Route Motorbike Animation */}
                <SalemLottie
                  name="bike"
                  width={180}
                  height={100}
                  ariaLabel="Technician traveling to your doorstep in Salem"
                  style={{ mb: 1 }}
                />
                <Alert 
                  severity="info" 
                  icon={<TwoWheelerIcon sx={{ fontSize: 18 }} />}
                  sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', fontSize: '12.5px' }}
                >
                  Technician {tech.name} has started journey and is on the way to your home (ETA: {tech.eta || '8 mins'} • {tech.distanceKm || '1.8 km'}).
                </Alert>
              </Box>
            ) : bookingStatus === 'preparing' ? (
              <Box sx={{ mb: 2 }}>
                <Alert 
                  severity="info" 
                  icon={<BuildIcon sx={{ fontSize: 18 }} />}
                  sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '12.5px' }}
                >
                  Technician {tech?.name || 'Specialist'} is gathering diagnostic tools and spare parts. Preparing to depart for your location.
                </Alert>
              </Box>
            ) : (
              /* When bookingStatus is 'accepted' or 'assigned': Tech has accepted, getting ready */
              <Box sx={{ mb: 2 }}>
                <Alert 
                  severity="success" 
                  icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
                  sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '13px' }}
                >
                  Technician {tech.name} has accepted your booking and is preparing equipment for departure. Call and chat are now active.
                </Alert>
              </Box>
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
                    bgcolor: (bookingStatus === 'inspecting' || bookingStatus === 'arrived') 
                      ? '#D97706' 
                      : (bookingStatus === 'quote_presented' || bookingStatus === 'quote_approved' 
                          ? '#16A34A' 
                          : (bookingStatus === 'en_route' ? '#0284C7' : '#0F172A')),
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
                  {bookingStatus === 'en_route' ? (
                    <TwoWheelerIcon sx={{ color: '#FFFFFF', fontSize: 16 }} />
                  ) : (
                    <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 16 }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11.5px' }}>
                    {(bookingStatus === 'inspecting' || bookingStatus === 'arrived') 
                      ? 'Technician at doorstep • Diagnostic inspection' 
                      : (bookingStatus === 'quote_presented' 
                          ? 'Digital quote ready for customer review' 
                          : (bookingStatus === 'en_route'
                              ? `${tech.name} • On the way (${tech.eta || '8 mins'} • ${tech.distanceKm || '1.8 km'})`
                              : `${tech.name} • Accepted & Preparing Departure`))}
                  </Typography>
                </Paper>
              </Box>

              {/* One-Tap Open in Google Maps App Button */}
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
                  Open Tech Location in Google Maps
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
                            ? 'Technician Verified & Allowed Entry '
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
                        Genuine Shazu One Technician Verified & Permitted Inside
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
                        100% protected under Shazu One Escrow. Technician will test the appliance before completing the job.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '12px', mb: 1.2, lineHeight: 1.4 }}>
                      <strong>For your family's safety:</strong> When the technician arrives at your door, ask them: <em>"What is your Shazu One Verification PIN?"</em> Enter their 4-digit reply below before opening the door or letting them in.
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
                        {isVerifyingTechOtp ? 'Verifying...' : 'Verify & Let In (அனுமதி) '}
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
                      {Number(tech.jobsCompleted) > 0 && Number(tech.rating) > 0 ? (
                        <>
                          <StarIcon sx={{ color: '#D97706', fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>
                            {tech.rating}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 500, fontSize: '11px' }}>
                            ({tech.jobsCompleted} jobs)
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
                          New Partner • {Number(tech.jobsCompleted) || 0} jobs completed
                        </Typography>
                      )}
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
                  onClick={() => navigate(`/chat/${bookingId}`)}
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
                  onClick={() => navigate(`/call/${bookingId}`)}
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

            {/* Transparent Work Charge & Settlement Breakdown Card */}
            {['quote_approved', 'completed'].includes(bookingStatus) && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  p: 2,
                  mb: 2,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <ReceiptLongIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                      வேலைக் கட்டண விபரம் (Technician Work Charge)
                    </Typography>
                  </Box>
                  <Chip
                    label="Labor Escrow"
                    size="small"
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#166534',
                      fontWeight: 800,
                      fontSize: '10px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>

                <Box sx={{ bgcolor: '#F0FDF4', p: 1.2, borderRadius: '6px', border: '1px solid #BBF7D0', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <ShieldIcon sx={{ fontSize: 16, color: '#166534', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block' }}>
                    சேலம்சேவா தளம் உதிரிபாகங்களை விற்பனை செய்வதில்லை. 5% தள கட்டணம் தொழிலாளர் <strong>வேலைக் கட்டணத்திற்கு மட்டுமே</strong>.
                  </Typography>
                </Box>

                <Box sx={{ bgcolor: '#F8FAFC', p: 1.4, borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
                      1. தொழிலாளர் வேலைக் கட்டணம் (Labour Charge):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
                      ₹{parseFloat(billDetails?.laborCost || 250).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ShieldIcon sx={{ color: '#2563EB', fontSize: 14 }} />
                      <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>
                        2. சேலம்சேவா தள கட்டணம் (Platform Fee 5% on Labor):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '12.5px' }}>
                      +₹{parseFloat(billDetails?.platformFee || (parseFloat(billDetails?.laborCost || 250) * 0.05)).toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                      மொத்த கட்டணம் (Total Payable):
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#16A34A', fontSize: '17px' }}>
                      ₹{parseFloat(billDetails?.totalAmount || (parseFloat(billDetails?.laborCost || 250) * 1.05)).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

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
                  Diagnosis in Progress • Quote arriving shortly...
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
                  Work Completed! View Receipt & Warranty Slip (ரசீது) →
                </Button>
              ) : bookingStatus === 'quote_approved' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
                    onClick={() => navigate(`/rate?bookingId=${bookingId}`, { replace: true })}
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
                    Confirm Work Finished & Release Escrow (வேலை முடிந்தது) 
                  </Button>
                  <Typography variant="caption" sx={{ color: '#166534', textAlign: 'center', fontWeight: 600, fontSize: '11.5px' }}>
                    Click above to inspect & approve completed work and release escrow payout to technician.
                  </Typography>
                </Box>
              ) : bookingStatus === 'en_route' ? (
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
                  Technician En Route • Share OTP {trackData?.booking?.customer_otp || trackData?.booking?.customerOtp || '----'} at Doorstep
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled
                  sx={{
                    bgcolor: '#F0FDF4 !important',
                    color: '#166534 !important',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    py: 1.3,
                    fontWeight: 700,
                    fontSize: '13.5px',
                    textTransform: 'none'
                  }}
                >
                  Technician Accepted • Preparing Departure (Call or Chat active)
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
                      OEM Parts Purchased & Service Authorized
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B45309', fontSize: '10.5px' }}>
                      Self-cancellation is locked to protect technician parts procurement. For emergency assistance:
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate(`/call/${bookingId}`)}
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
                  onClick={() => navigate(`/booking/${bookingId}/cancel`)}
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
                navigate(`/chat/${bookingId}`);
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
          <strong>{tech?.name || 'Assigned Partner'}:</strong> {incomingMessageToast}
        </Alert>
      </Snackbar>

      {/* Customer Interactive Reschedule Drawer (Mobile Bottom Sheet / Desktop Slide-Over) */}
      <CustomerRescheduleDrawer
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        rescheduleDates={rescheduleDates}
        selectedDayIndex={selectedRescheduleDayIndex}
        onSelectDayIndex={setSelectedRescheduleDayIndex}
        timeSlots={RESCHEDULE_TIME_SLOTS}
        selectedTimeSlot={selectedRescheduleTime}
        onSelectTimeSlot={setSelectedRescheduleTime}
        reasons={RESCHEDULE_REASONS}
        selectedReason={selectedRescheduleReason}
        onSelectReason={setSelectedRescheduleReason}
        onConfirm={handleConfirmCustomerReschedule}
        loading={slotUpdating}
        currentBooking={trackData?.booking}
      />

      {/* Navigation lives in the global CustomerTabBar rendered by App.jsx. */}

    </Box>
  );
}
