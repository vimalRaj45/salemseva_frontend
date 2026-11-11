import { API_V1_URL, PARTNER_COMMISSION_PERCENT } from '../../config';
import { getCoordsForLocalityName } from '../../utils/geoUtils';
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
  Divider,
  Rating,
  TextField
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Professional Material UI Icons
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MapIcon from '@mui/icons-material/Map';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

import CustomerRescheduleDrawer from './CustomerRescheduleDrawer';
import ServiceReviewSection from '../../components/common/ServiceReviewSection';
import SalemLottie from '../../components/SalemLottie';
import SalemSeamlessLoader from '../../components/SalemSeamlessLoader';
import { NativeNotifier } from '../../services/nativeNotify';
import { reverseGeocodeNominatim } from '../../utils/osmGeoLocation';
import toast from 'react-hot-toast';

export default function TrackingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');
  // The checkout page appends paid=1 once the backend has confirmed the payment, so a
  // customer who has just been charged can be told what is happening instead of landing
  // on a booking page whose data has not arrived yet.
  const arrivedFromPayment = searchParams.get('paid') === '1';
  const storedBookingId = localStorage.getItem('shazuone_active_booking');
  const bookingId = urlBookingId || storedBookingId || '';

  const [chatOpen, setChatOpen] = useState(false);
  // Guard against double settlement release
  const settlementReleasedRef = useRef(false);

  const [incomingMessageToast, setIncomingMessageToast] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);


  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const lastMessageCountRef = useRef(-1);

  const [trackData, setTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [awaitingPaymentConfirmation, setAwaitingPaymentConfirmation] = useState(arrivedFromPayment);

  const [confirmCompletionModalOpen, setConfirmCompletionModalOpen] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
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

  // Live Technician Street Address resolved via OpenStreetMap Nominatim
  const [techAddress, setTechAddress] = useState('');

  useEffect(() => {
    let isMounted = true;
    const resolveTechAddress = async () => {
      const lat = parseFloat(trackData?.technician?.lat);
      const lng = parseFloat(trackData?.technician?.lng);
      if (!lat || !lng) return;
      try {
        const res = await reverseGeocodeNominatim(lat, lng);
        if (isMounted && res && res.shortLabel) {
          setTechAddress(res.shortLabel);
        }
      } catch (e) {
        // Silent fallback
      }
    };
    resolveTechAddress();
    return () => { isMounted = false; };
  }, [trackData?.technician?.lat, trackData?.technician?.lng]);

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

  // Customer Marks Job Completed
  const handleCustomerCompleteJob = async () => {
    try {
      setIsReleasingPayment(true);
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/customer-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: customerRating,
          reviewComment: reviewComment || 'Service completed satisfactorily.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfirmCompletionModalOpen(false);
        setCompletionSuccessToast(true);
        if (trackData && trackData.booking) {
          setTrackData(prev => ({
            ...prev,
            booking: { ...prev.booking, status: 'completed' }
          }));
        }
        localStorage.setItem('shazuone_quote_status_' + bookingId, 'completed');
        window.dispatchEvent(new CustomEvent('shazuone_status_updated', { detail: { bookingId, status: 'completed' } }));
        window.dispatchEvent(new Event('storage'));
      } else {
        alert(data.error || 'Failed to complete job');
      }
    } catch (err) {
      alert('Network error confirming job completion');
    } finally {
      setIsReleasingPayment(false);
    }
  };

  // Poll real database status from backend every 1.2 seconds & listen to instant quote events
  useEffect(() => {
    let isMounted = true;
    if (!bookingId) {
      navigate('/', { replace: true });
      return;
    }
    let isFetching = false;
    const fetchTracking = async () => {
      if (isFetching) return;
      if (document.hidden && Math.random() > 0.25) return;
      isFetching = true;
      try {
        const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/track`);
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.booking?.status === 'cancelled' || data.isCancelled) {
            localStorage.removeItem('shazuone_active_booking');
            localStorage.removeItem('shazuone_booking_id');
            localStorage.removeItem('shazuone_quote_status_' + bookingId);
            setChatOpen(false);
            setQuoteAlertModalOpen(false);
          } else {
            localStorage.setItem('shazuone_active_booking', bookingId);
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
        isFetching = false;
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 2500);

    // Instant cross-tab & custom event triggers
    const handleQuoteEvent = (e) => {
      if (e?.detail?.status === 'quote_presented') {
        quoteDismissedRef.current = false;
        setQuoteAlertModalOpen(true);
      }
      fetchTracking();
    };
    const handleVisibility = () => { if (!document.hidden) fetchTracking(); };

    window.addEventListener('shazuone_quote_updated', handleQuoteEvent);
    window.addEventListener('storage', handleQuoteEvent);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('shazuone_quote_updated', handleQuoteEvent);
      window.removeEventListener('storage', handleQuoteEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [bookingId]);

  // Hold the payment-confirmation screen until the booking actually arrives, with a hard
  // ceiling so a slow or failing request can never trap the customer there. The paid marker
  // is then stripped so a later refresh does not replay the payment screen.
  useEffect(() => {
    if (!awaitingPaymentConfirmation) return undefined;

    const release = () => {
      setAwaitingPaymentConfirmation(false);
      if (arrivedFromPayment) {
        const next = new URLSearchParams(searchParams);
        next.delete('paid');
        setSearchParams(next, { replace: true });
      }
    };

    if (trackData) {
      release();
      return undefined;
    }
    const ceiling = setTimeout(release, 15000);
    return () => clearTimeout(ceiling);
  }, [awaitingPaymentConfirmation, trackData, arrivedFromPayment, searchParams, setSearchParams]);

  // Real-time Chat Notification Poller from Technician (Calls handled globally by GlobalNotificationWatcher)
  useEffect(() => {
    let isMounted = true;

    const pollCommunications = async () => {
      try {
        if (!bookingId) return;

        // Check for incoming chat messages from technician
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
      } catch (err) { }
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
        } catch (_) { }
      };
      fetchBill();
      const interval = setInterval(fetchBill, 2500);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [bookingId, bookingStatus]);

  const isInspectingOrArrived = ['inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus) || techOtpSuccess;
  const techArrived = ['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(bookingStatus);
  const hasQuote = ['quote_presented', 'quote_approved'].includes(bookingStatus);

  const getLiveDistanceAndEta = () => {
    const custFallback = getCoordsForLocalityName(trackData?.booking?.locality || trackData?.booking?.service_address);
    const custLat = parseFloat(trackData?.booking?.customer_lat) || custFallback.lat;
    const custLng = parseFloat(trackData?.booking?.customer_lng) || custFallback.lng;
    const techFallback = getCoordsForLocalityName(tech?.assignedLocalities || trackData?.booking?.locality);
    const techLat = parseFloat(tech?.lat) || techFallback.lat;
    const techLng = parseFloat(tech?.lng) || techFallback.lng;

    const dLat = (custLat - techLat) * (Math.PI / 180);
    const dLon = (custLng - techLng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(techLat * (Math.PI / 180)) * Math.cos(custLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.max(0.3, parseFloat((6371 * c * 1.3).toFixed(1)));
    const etaMins = Math.max(2, Math.round((dist / 25) * 60));

    return {
      distanceText: tech?.distanceKm || `${dist} km`,
      etaText: tech?.eta || `${etaMins} mins`,
      distanceNumber: dist,
      etaMinutes: etaMins
    };
  };

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

  // Arriving from payment: say that the money is being confirmed rather than showing the
  // generic dispatch splash or the booking page itself before its data exists.
  if (awaitingPaymentConfirmation) {
    return (
      <SalemSeamlessLoader
        mode="payment"
        title="Your payment is processing..."
        subtitle="Confirming with the bank. Please keep this screen open."
        badge="Safe Payment"
      />
    );
  }

  if (isLoading && !trackData) {
    return (
      <SalemSeamlessLoader
        mode="tracking"
        title="Loading Live Booking Details..."
        subtitle="Connecting to Salem dispatch network."
      />
    );
  }

  // Unconfirmed / Unpaid Booking Screen Guard
  if (bookingStatus === 'created') {
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
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(234, 179, 8, 0.15)',
                border: '2px solid rgba(234, 179, 8, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: '#FACC15'
              }}
            >
              <ReceiptLongIcon sx={{ fontSize: 32 }} />
            </Box>

            <Chip
              label="PAYMENT PENDING"
              size="small"
              sx={{
                bgcolor: 'rgba(234, 179, 8, 0.2)',
                color: '#FDE047',
                fontWeight: 800,
                fontSize: '10.5px',
                mb: 1.5,
                border: '1px solid rgba(234, 179, 8, 0.4)'
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', mb: 0.8 }}>
              Advance Fee Required
            </Typography>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.5, mb: 3 }}>
              This doorstep visit reservation has not been confirmed because advance fee payment was not completed.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/booking/pay-advance`, { state: { bookingId, payableNow: trackData?.booking?.visit_fee || 99 } })}
              sx={{
                bgcolor: '#1D6FE5',
                color: '#FFFFFF',
                py: 1.3,
                fontWeight: 800,
                borderRadius: '12px',
                mb: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1557B0' }
              }}
            >
              Complete Advance Payment
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                localStorage.removeItem('shazuone_active_booking');
                navigate('/');
              }}
              sx={{
                borderColor: '#475569',
                color: '#94A3B8',
                py: 1,
                fontWeight: 600,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': { borderColor: '#64748B', color: '#F1F5F9' }
              }}
            >
              Cancel & Return Home
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  // Admin or System Cancellation Screen & Customer Release
  if (bookingStatus === 'cancelled') {
    const cancelReason = trackData?.booking?.cancellation_reason || trackData?.booking?.cancellationReason || trackData?.cancellationReason || 'Cancelled';
    const cancelDetails = trackData?.booking?.cancellation_details || trackData?.booking?.cancellationDetails || trackData?.cancellationDetails || 'Your booking was cancelled. Any advance payment has been refunded to your Shazu One Wallet.';
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

            {/* . Refund Status Card */}
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
              <Box sx={{ flex: 1 }}>
                {(() => {
                  const refundAmount = Number(trackData?.booking?.refund_amount || booking?.refund_amount || 0);
                  const grossPaid = Number(trackData?.booking?.final_amount || booking?.final_amount || visitFee);
                  const retainedFees = Number(Number(trackData?.booking?.refund_platform_fee || 0) + Number(trackData?.booking?.refund_gateway_fee || 0));
                  const displayRefund = refundAmount > 0 ? refundAmount : grossPaid;

                  return (
                    <>
                      <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#A7F3D0' }}>
                        ₹{displayRefund.toFixed(2)} Refund Initiated to Source Account
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#6EE7B7', lineHeight: 1.35, mt: 0.2 }}>
                        {retainedFees > 0
                          ? `Initial payment of ₹${grossPaid.toFixed(2)} refunded after ₹${retainedFees.toFixed(2)} platform & gateway processing retention (3-5 business days).`
                          : 'Your advance visit payment has been released back to your original source account.'}
                      </Typography>
                    </>
                  );
                })()}
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
                  ? `${tech.name} is confirmed for your scheduled slot.`
                  : `Booking #${bookingId} confirmed. Finding a certified technician for your slot.`)
                : `Booking #${bookingId} confirmed. Assigning a technician shortly.`
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

                <Box sx={{ bgcolor: '#F0FDF4', p: 1.2, borderRadius: '10px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <NotificationsActiveIcon sx={{ color: '#16A34A', fontSize: 18, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, lineHeight: 1.35 }}>
                    Technician confirmed for your chosen slot.
                  </Typography>
                </Box>

                {/* In-App Chat */}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/chat/${bookingId}`)}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '8px',
                    py: 0.85,
                    fontWeight: 700,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                  }}
                >
                  Chat with Technician
                </Button>
              </Card>
            )}


            {/* Time Window & Cancel Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '16px',
                p: 2,
                mb: 2.5,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
              }}
            >
              {!(trackData?.booking?.booking_type === 'scheduled' || (!trackData?.booking?.is_urgent_dispatch && trackData?.booking?.scheduled_slot && trackData?.booking?.scheduled_slot !== 'instant_now')) && (
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', lineHeight: 1.4 }}>
                    All verified partners are currently busy. A technician will be assigned for your slot soon.
                  </Typography>
                </Paper>
              )}

              {/* Current Scheduled Slot */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F0F9FF', p: 1.5, borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, display: 'block', fontSize: '10.5px' }}>
                    SCHEDULED TIME WINDOW
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
            {bookingStatus === 'completed' ? (
              /* ========================================================================= */
              /* SCENARIO B1: SERVICE COMPLETED & PAID (INLINE REVIEW & RECEIPT SUMMARY)   */
              /* ========================================================================= */
              <Box id="service-review-card">
                {/* 1. Inline Customer Service Review Form (Zero subpage navigation required) */}
                <ServiceReviewSection
                  bookingId={bookingId}
                  technicianName={tech?.name || 'Verified Specialist'}
                  existingReview={trackData?.review}
                  onReviewSubmitted={(savedReview) => {
                    setTrackData((prev) => (prev ? { ...prev, review: savedReview } : prev));
                  }}
                />

                {/* 2. Official Payment Receipt & Breakdown Card */}
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: '16px',
                    p: 2.5,
                    mb: 2,
                    boxShadow: '0 4px 16px rgba(22, 163, 74, 0.08)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 26 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                        Service Completed & Paid! (பணி முடிந்தது)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, fontSize: '12px' }}>
                        Booking #{bookingId} • Serviced by {tech?.name || 'Verified Specialist'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: '#F1F5F9' }} />

                  {/* Itemized Payment Breakdown */}
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase', fontSize: '10.5px', display: 'block', mb: 1 }}>
                    Final Payment Breakdown
                  </Typography>

                  <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '10px', border: '1px solid #E2E8F0', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
                        Part 1 (Doorstep Visit & Inspection Fee):
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
                        ₹{parseFloat(trackData?.booking?.visit_fee || 99).toFixed(2)} • PAID
                      </Typography>
                    </Box>

                    {(parseFloat(trackData?.booking?.quote_subtotal || 0) > 0 || parseFloat(trackData?.booking?.final_amount || 0) > parseFloat(trackData?.booking?.visit_fee || 99)) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
                          Part 2 (Approved Labor Work & Spares):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
                          ₹{parseFloat(trackData?.booking?.part2_amount || trackData?.booking?.quote_subtotal || 250).toFixed(2)} • PAID
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                          Total Paid:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                          Direct UPI QR • 100% Cashless Settled
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#16A34A', fontSize: '18px' }}>
                        ₹{parseFloat(trackData?.booking?.final_amount || (parseFloat(trackData?.booking?.visit_fee || 99) + parseFloat(trackData?.booking?.quote_subtotal || 250))).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
                      onClick={() => navigate('/history')}
                      sx={{
                        bgcolor: '#16A34A',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        py: 1.3,
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                        '&:hover': { bgcolor: '#15803D' }
                      }}
                    >
                      View Service Receipt (ரசீது) →
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/')}
                      sx={{
                        borderColor: '#CBD5E1',
                        color: '#334155',
                        borderRadius: '8px',
                        py: 1,
                        fontWeight: 700,
                        fontSize: '13px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
                      }}
                    >
                      Book Another Service
                    </Button>
                  </Box>
                </Card>
              </Box>
            ) : (
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
                      Quote approved. Technician is completing the repair.
                    </Alert>
                ) : bookingStatus === 'arrived' ? (
                  <Alert
                    severity="info"
                    icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '13px' }}
                  >
                    Technician {tech.name} has arrived. Verify their 4-digit PIN below.
                  </Alert>
                ) : bookingStatus === 'inspecting' ? (
                  <Alert
                    severity="warning"
                    icon={<NotificationsActiveIcon sx={{ fontSize: 18 }} />}
                    sx={{ mb: 2, borderRadius: '8px', fontWeight: 700, bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontSize: '13px' }}
                  >
                    {tech.name} is inspecting your appliance.
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
                      {tech.name} is on the way (ETA: {tech.eta || '8 mins'} • {tech.distanceKm || '1.8 km'}).
                    </Alert>
                  </Box>
                ) : bookingStatus === 'preparing' ? (
                  <Box sx={{ mb: 2 }}>
                    <Alert
                      severity="info"
                      icon={<BuildIcon sx={{ fontSize: 18 }} />}
                      sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontSize: '12.5px' }}
                    >
                      {tech?.name || 'Technician'} is preparing tools to depart.
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
                      {tech.name} accepted your booking. Preparing to depart.
                    </Alert>
                  </Box>
                )}





                {/* Diagnostic Inspection Active Notice (when tech is inspecting) */}
                {bookingStatus === 'inspecting' && (
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: '#FFFBEB',
                      border: '1.5px solid #FCD34D',
                      borderRadius: '12px',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#D97706', animation: 'pulse 1.5s infinite' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '13px' }}>
                        Diagnostic Inspection in Progress
                      </Typography>
                    </Box>
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
                      {tech.name} sent the repair quote. Review items and approve to begin work.
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
                    id="doorstep-otp-card"
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: isInspectingOrArrived
                        ? '#F0FDF4'
                        : (bookingStatus === 'quote_approved' ? '#F0FDF4' : (bookingStatus === 'arrived' ? '#FEFCE8' : '#F8FAFC')),
                      border: isInspectingOrArrived
                        ? '1.5px solid #86EFAC'
                        : (bookingStatus === 'quote_approved' ? '1.5px solid #86EFAC' : (bookingStatus === 'arrived' ? '1.5px solid #FDE047' : '1.5px solid #CBD5E1')),
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
                            ? 'Repair Work in Progress (வேலை நடைபெறுகிறது)'
                            : (isInspectingOrArrived
                              ? 'Technician Verified & Allowed Entry '
                              : 'Doorstep Safety Verification (பாதுகாப்பு சரிபார்ப்பு)')}
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          bookingStatus === 'quote_approved'
                            ? 'Work in Progress'
                            : (isInspectingOrArrived
                              ? 'Verified & In Home'
                              : (bookingStatus === 'arrived' ? 'Tech at Doorstep - Ask PIN' : 'Ask Tech for PIN'))
                        }
                        size="small"
                        sx={{
                          bgcolor: (isInspectingOrArrived || bookingStatus === 'quote_approved') ? '#DCFCE7' : (bookingStatus === 'arrived' ? '#FEF3C7' : '#EFF6FF'),
                          color: (isInspectingOrArrived || bookingStatus === 'quote_approved') ? '#166534' : (bookingStatus === 'arrived' ? '#92400E' : '#1D4ED8'),
                          fontWeight: 800,
                          fontSize: '10.5px'
                        }}
                      />
                    </Box>

                    {bookingStatus === 'arrived' && !isInspectingOrArrived && (
                      <Alert severity="info" sx={{ mb: 1.2, py: 0.6, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                        Ask technician for their 4-digit PIN to confirm arrival.
                      </Alert>
                    )}

                    {(isInspectingOrArrived && bookingStatus !== 'quote_approved') ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.2, borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                        <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#14532D', fontSize: '12.5px', fontWeight: 700 }}>
                          Technician Verified & Inspecting
                        </Typography>
                      </Box>
                    ) : bookingStatus === 'quote_approved' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1.2, borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                        <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#14532D', fontSize: '12.5px', fontWeight: 700 }}>
                          Repair in Progress • Payment Secured
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '12px', mb: 1, lineHeight: 1.35 }}>
                          Enter the technician's 4-digit PIN when they arrive:
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

                  {/* Action Button: Chat */}
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/chat/${bookingId}`)}
                    sx={{
                      borderColor: '#CBD5E1',
                      color: '#334155',
                      borderRadius: '6px',
                      py: 0.85,
                      fontWeight: 600,
                      fontSize: '12.5px',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                    }}
                  >
                    Chat with Technician
                  </Button>
                  {/* 2-Part Payment Status Info */}
                  <Box sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', p: 1.2, mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, fontSize: '11.5px' }}>
                      Visit Fee: <strong>₹99 Paid</strong>
                    </Typography>
                    <Chip label="100% to Tech" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
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
                  ) : bookingStatus === 'arrived' ? (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => {
                        const el = document.getElementById('doorstep-otp-card');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        py: 1.3,
                        fontWeight: 800,
                        fontSize: '13.5px',
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                        '&:hover': { bgcolor: '#1D4ED8' }
                      }}
                    >
                      Tech Arrived • Verify Doorstep PIN Below ↓
                    </Button>
                  ) : bookingStatus === 'inspecting' ? (
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
                      startIcon={<StarIcon sx={{ fontSize: 20 }} />}
                      onClick={() => {
                        const el = document.getElementById('service-review-card');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate('/history');
                        }
                      }}
                      sx={{
                        bgcolor: '#16A34A',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        py: 1.4,
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                        '&:hover': { bgcolor: '#15803D' }
                      }}
                    >
                      Rate Service & View Receipt (ரசீது) →
                    </Button>
                  ) : bookingStatus === 'quote_approved' ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Customer Exclusive Mark Job Complete Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setConfirmCompletionModalOpen(true)}
                        sx={{
                          bgcolor: '#16A34A',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          py: 1.4,
                          fontWeight: 800,
                          fontSize: '14px',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                          '&:hover': { bgcolor: '#15803D' }
                        }}
                      >
                        Mark Job Completed & Confirm Service (வேலை முடிந்தது)
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => navigate(`/checkout?bookingId=${bookingId}`)}
                        sx={{
                          borderColor: '#0F172A',
                          color: '#0F172A',
                          borderRadius: '8px',
                          py: 1.2,
                          fontWeight: 700,
                          fontSize: '13px',
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#F8FAFC' }
                        }}
                      >
                        Pay Final Bill Online (கட்டணம் செலுத்துக) →
                      </Button>
                      <Typography variant="caption" sx={{ color: '#475569', textAlign: 'center', fontWeight: 600, fontSize: '11.5px' }}>
                        Inspect work and confirm completion.
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
                      Technician En Route • Doorstep OTP {trackData?.booking?.customer_otp || trackData?.booking?.customerOtp || '----'}
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
                      Technician Assigned • Preparing Departure
                    </Button>
                  )}

                  {/* Cancellation locked after quote approval */}
                  {bookingStatus === 'quote_approved' ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.2,
                        bgcolor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        borderRadius: '8px'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E', display: 'block', fontSize: '11.5px' }}>
                        Service authorized — cancellation is locked while repair is in progress.
                      </Typography>
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

      {/* Customer Job Completion & Rating Dialog */}
      <Dialog
        open={confirmCompletionModalOpen}
        onClose={() => !isReleasingPayment && setConfirmCompletionModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', pb: 1 }}>
          Confirm Service Completion (பணி நிறைவு)
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px', mb: 2 }}>
            Please confirm that <strong>{tech?.name || 'the specialist'}</strong> has satisfactorily finished the repair and inspected your appliance.
          </Typography>

          <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '10px', border: '1px solid #E2E8F0', mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', mb: 0.5 }}>
              Rate Technician Service:
            </Typography>
            <Rating
              value={customerRating}
              onChange={(e, val) => setCustomerRating(val || 5)}
              precision={0.5}
              size="large"
              sx={{ color: '#F59E0B' }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Feedback / Review comment (optional)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            size="small"
            sx={{ bgcolor: '#FFFFFF' }}
          />

          <Alert severity="info" sx={{ mt: 2, fontSize: '11.5px', py: 0.5 }}>
            Payment settlement to the technician will be verified and disbursed through Central Admin.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmCompletionModalOpen(false)}
            disabled={isReleasingPayment}
            sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}
          >
            Not Yet
          </Button>
          <Button
            variant="contained"
            onClick={handleCustomerCompleteJob}
            disabled={isReleasingPayment}
            sx={{
              bgcolor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#15803D' }
            }}
          >
            {isReleasingPayment ? 'Confirming...' : 'Confirm Work Completed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Success Toast */}
      <Snackbar
        open={completionSuccessToast}
        autoHideDuration={4000}
        onClose={() => setCompletionSuccessToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: '10px', fontWeight: 700 }}>
          Work completed successfully! Thank you for confirming.
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
