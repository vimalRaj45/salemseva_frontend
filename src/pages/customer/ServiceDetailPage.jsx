import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { openRazorpay } from '../../services/razorpayService';
import {
  Container,
  Box,
  Typography,
  Card,
  Radio,
  Button,
  Chip,
  Paper,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Skeleton,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  MenuItem,
  CardActionArea
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ApiService } from '../../services/api';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import VoiceNoteRecorder from '../../components/VoiceNoteRecorder';
import SalemLottie from '../../components/SalemLottie';
import { useAuth } from '../../context/AuthContext';
import { useCriticalWork } from '../../context/CriticalWorkContext';
import toast from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function ServiceDetailPage({ onStartBooking }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginAsCustomer, loginWithCredentials, registerAccount, walletBalance, debitWallet } = useAuth();
  const { setCriticalWork } = useCriticalWork();
  const { serviceId = 'ac' } = useParams();
  const requestedTechnician = location.state?.requestedTechnician || null;
  const [selectedIssue, setSelectedIssue] = useState('not_cooling');
  const [customDescription, setCustomDescription] = useState('');
  const [voiceNoteAudio, setVoiceNoteAudio] = useState(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [serviceInfo, setServiceInfo] = useState(() => location.state?.service || null);
  const [issuesList, setIssuesList] = useState([]);

  // Inspection Fee strictly derived from DB serviceInfo, with service-specific initial fallback
  const inspectionFeeNumber = Number(
    serviceInfo?.visitFee ??
    serviceInfo?.visit_fee ??
    (serviceId === 'ac' || serviceId === 'electrician' ? 149 : 99)
  );
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Domain Technician Availability & Date Capacity Status
  const [domainAvailability, setDomainAvailability] = useState({
    loaded: false,
    hasTechniciansInDomain: true,
    totalTechnicians: 0,
    onlineTechnicians: 0,
    isTemporarilyClosed: false,
    notice: null,
    dates: {}
  });

  // Booking Mode: Standardized on Scheduled Appointments with Shazu One Central Ops Slot Allocation
  const todayISO = new Date().toISOString().split('T')[0];
  const bookingMode = 'scheduled';
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const [customTime, setCustomTime] = useState('');
  const [isCustomTimeActive, setIsCustomTimeActive] = useState(false);
  const [scheduledPaymentModalOpen, setScheduledPaymentModalOpen] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState('upi');
  const [isPayingScheduled, setIsPayingScheduled] = useState(false);
  const [scheduledSuccessModalOpen, setScheduledSuccessModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const dateInputRef = React.useRef(null);

  // Critical Operation Anti-Refresh Protection
  useEffect(() => {
    if (isPayingScheduled || scheduledPaymentModalOpen) {
      setCriticalWork(true, 'Payment and slot reservation in progress. Please do not refresh or close this window.');
    } else {
      setCriticalWork(false);
    }
    return () => {
      setCriticalWork(false);
    };
  }, [isPayingScheduled, scheduledPaymentModalOpen, setCriticalWork]);

  // Generate 14-day consecutive date window
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const dayName = isToday ? 'TODAY' : isTomorrow ? 'TOM' : date.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
    const fullDateText = isToday
      ? `Today, ${dayNumber} ${monthName}`
      : isTomorrow
      ? `Tomorrow, ${dayNumber} ${monthName}`
      : `${date.toLocaleDateString('en-IN', { weekday: 'short' })}, ${dayNumber} ${monthName}`;

    return {
      offset: i,
      iso,
      dayName,
      dayNumber,
      monthName,
      fullDateText
    };
  });

  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('shazuone_user_location');
    return saved ? JSON.parse(saved) : {
      locality: 'Fairlands',
      pincode: '636016',
      address: 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
      lat: 11.6738,
      lng: 78.1460
    };
  });

  useEffect(() => {
    const handleLocUpdate = () => {
      try {
        const saved = localStorage.getItem('shazuone_user_location');
        if (saved) setUserLocation(JSON.parse(saved));
      } catch (_) {}
    };
    window.addEventListener('shazuone_location_updated', handleLocUpdate);
    return () => window.removeEventListener('shazuone_location_updated', handleLocUpdate);
  }, []);

  useEffect(() => {
    async function loadServiceData() {
      setIsLoadingIssues(true);
      try {
        let dynamicFee = inspectionFeeNumber;
        // Fetch Service Info from DB
        const svcRes = await fetch(`${API_V1_URL}/services/${serviceId || 'ac'}`);
        const svcData = await svcRes.json();
        if (svcData.success && svcData.service) {
          setServiceInfo(svcData.service);
          if (svcData.service.visitFee !== undefined && !isNaN(Number(svcData.service.visitFee))) {
            dynamicFee = Number(svcData.service.visitFee);
          } else if (svcData.service.visit_fee !== undefined && !isNaN(Number(svcData.service.visit_fee))) {
            dynamicFee = Number(svcData.service.visit_fee);
          }
        }

        // Fetch Domain Technician Availability & Capacity
        try {
          const availRes = await fetch(`${API_V1_URL}/services/${serviceId || 'ac'}/availability`);
          const availData = await availRes.json();
          if (availData.success) {
            setDomainAvailability({
              loaded: true,
              hasTechniciansInDomain: Boolean(availData.hasTechniciansInDomain),
              totalTechnicians: availData.totalTechnicians || 0,
              onlineTechnicians: availData.onlineTechnicians || 0,
              isTemporarilyClosed: Boolean(availData.isTemporarilyClosed),
              notice: availData.notice || null,
              dates: availData.dates || {}
            });
          }
        } catch (avErr) {
          console.warn('Could not check domain availability:', avErr);
        }

        // Fetch Issues from DB
        const issues = await ApiService.fetchIssues(serviceId || 'ac', 'en');
        if (issues && issues.length > 0) {
          const list = issues.map(i => ({
            id: i.id || 'issue_default',
            title: i.name || i.issue_name || 'Inspection & Repair',
            estRange: i.estRange || 'Quote on Inspection',
            visitFee: `₹${dynamicFee}`
          }));
          setIssuesList(list);
          setSelectedIssue(list[0].id);
        }
      } catch (e) {
        console.warn('Failed to load service data from DB:', e);
      } finally {
        setIsLoadingIssues(false);
      }
    }
    loadServiceData();
  }, [serviceId]);

  const displayIssues = issuesList;

  const getServiceIcon = () => {
    switch (serviceId) {
      case 'ac':
        return <AcUnitIcon sx={{ fontSize: 24 }} />;
      case 'electrician':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      case 'plumber':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      case 'cleaning':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      default:
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
    }
  };

  useEffect(() => {
    fetch(`${API_V1_URL}/coupons/active`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.coupons)) {
          setAvailableCoupons(data.coupons);
          if (data.coupons.length > 0) {
            const first = data.coupons[0];
            setCouponCode(first.code);
            setCouponDiscount(first.discountValue);
            setCouponApplied(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async (overrideCode) => {
    setCouponError('');
    const code = (overrideCode || couponInput || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a valid promo code');
      return;
    }
    setCouponLoading(true);
    try {
      const currentBookingAmount = inspectionFeeNumber;
      const res = await fetch(`${API_V1_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, bookingAmount: currentBookingAmount })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponCode(data.code);
        setCouponDiscount(data.discountAmount);
        setCouponApplied(true);
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid or expired coupon code');
        setCouponApplied(false);
        setCouponDiscount(0);
      }
    } catch (err) {
      setCouponError('Could not validate coupon. Please check connection.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  };

  const getFormattedDateString = () => {
    if (!selectedDateISO) return 'Selected Date';
    const found = availableDates.find(d => d.iso === selectedDateISO);
    if (found) return found.fullDateText;
    const d = new Date(selectedDateISO);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getEffectiveSlot = () => {
    if (isCustomTimeActive && customTime) {
      const [h, m] = customTime.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${String(formattedHour).padStart(2, '0')}:${m} ${ampm} (Custom Time)`;
    }
    return selectedSlot;
  };

  const timeSlots = [
    { id: 'emergency_urgent', label: 'Earliest Today (Emergency • Central Ops Fast Dispatch)', period: 'Ops Urgent Dispatch', popular: true, isEmergency: true },
    { id: '08_10', label: '08:00 AM - 10:00 AM', period: 'Morning Window' },
    { id: '10_12', label: '10:00 AM - 12:00 PM', period: 'Mid-Morning' },
    { id: '12_02', label: '12:00 PM - 02:00 PM', period: 'Afternoon' },
    { id: '02_04', label: '02:00 PM - 04:00 PM', period: 'Post-Lunch' },
    { id: '04_06', label: '04:00 PM - 06:00 PM', period: 'Evening Window' },
    { id: '06_08', label: '06:00 PM - 08:00 PM', period: 'Night Window' }
  ];

  const currentDateStatus = domainAvailability.dates?.[selectedDateISO] || null;
  const isSelectedDateFull = Boolean(currentDateStatus?.isFullyBooked);
  const isDomainTemporarilyClosed = domainAvailability.loaded && !domainAvailability.hasTechniciansInDomain;

  const checkSalemPincode = () => {
    const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
    const pin = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
    if (pin && !pin.startsWith('636')) {
      toast.error(`Service Unavailable Outside Salem: PIN code ${pin} is outside our active technician region (636xxx only).`);
      return false;
    }
    return true;
  };

  // Razorpay-style audio confirmation chime on success modal trigger
  useEffect(() => {
    if (scheduledSuccessModalOpen) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          const now = ctx.currentTime;
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        }
      } catch (e) {
        // Silent audio fallback
      }
    }
  }, [scheduledSuccessModalOpen]);

  const handleProceed = async (overrideUser = null) => {
    if (isDomainTemporarilyClosed) {
      toast.error('Service is temporarily closed in Salem. No technicians currently available.');
      return;
    }

    if (isSelectedDateFull) {
      toast.error('All technicians are booked on this date. Please choose another date.');
      return;
    }

    if (!checkSalemPincode()) return;

    const activeUser = overrideUser || user;
    if (!activeUser) {
      toast.error('Please sign in to proceed with your booking.');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    handlePayAndConfirmScheduled();
  };

  const handlePayAndConfirmScheduled = async () => {
    if (isDomainTemporarilyClosed) {
      toast.error('Service is temporarily closed in Salem. No technicians currently available.');
      return;
    }

    if (isSelectedDateFull) {
      toast.error('All technicians are booked on this date. Please choose another date.');
      return;
    }

    if (!checkSalemPincode()) return;

    if (!user) {
      toast.error('Please sign in to proceed with your booking.');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    setIsPayingScheduled(true);
    const finalSlot = `${selectedDateISO} • ${getFormattedDateString()} • ${getEffectiveSlot()}`;
    const visitFeeAmount = inspectionFeeNumber;
    const discount = couponApplied ? couponDiscount : 0;
    const payableNow = Math.max(0, visitFeeAmount - discount);

    const completeScheduledBookingCreation = async (paymentDetails = {}) => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: serviceId || 'ac',
            issueId: selectedIssue,
            customNotes: customDescription,
            customerId: user?.id || null,
            customerName: user?.name || user?.full_name || 'Customer',
            customerPhone: user?.phone || '',
            lat: userLocation.lat || 11.6643,
            lng: userLocation.lng || 78.1460,
            locality: userLocation.locality || 'Fairlands',
            address: userLocation.address || `${userLocation.locality || 'Fairlands'}, Salem`,
            pincode: userLocation.pincode || '636016',
            couponCode: couponApplied ? couponCode : null,
            discountAmount: discount,
            isUrgentDispatch: Boolean(finalSlot.toLowerCase().includes('emergency') || selectedSlot === 'emergency_urgent'),
            scheduledSlot: finalSlot,
            bookingType: 'scheduled',
            requestedTechnicianId: requestedTechnician?.id || null,
            requestedTechnicianName: requestedTechnician?.name || null,
            paymentStatus: 'paid',
            paymentMethod: paymentDetails.paymentMethod || selectedPayMethod || 'razorpay',
            razorpayPaymentId: paymentDetails.razorpayPaymentId || null,
            visitFeePaid: payableNow,
            voiceNoteAudio: voiceNoteAudio
          })
        });
        const data = await res.json();
        if (!data.success || !data.booking?.id) {
          throw new Error(data.error || 'Failed to register scheduled booking');
        }
        const bId = data.booking.id;
        const bObj = data.booking;

        localStorage.setItem('shazuone_active_booking', bId);
        window.dispatchEvent(new CustomEvent('shazuone_new_booking_created', { detail: { bookingId: bId, booking: bObj } }));
        window.dispatchEvent(new Event('storage'));
        if (onStartBooking) onStartBooking(bObj);
        setIsPayingScheduled(false);
        setConfirmedBooking({ ...bObj, id: bId, scheduled_slot: finalSlot });
        toast.success('Scheduled booking successfully reserved!');
        navigate(`/track?bookingId=${bId}`);
      } catch (e) {
        console.error('Scheduled booking creation error:', e);
        setIsPayingScheduled(false);
        toast.error('Unable to reserve scheduled visit: ' + (e.message || 'Please retry.'));
      }
    };

    // If 100% covered by coupon discount
    if (payableNow <= 0) {
      await completeScheduledBookingCreation({ paymentMethod: 'coupon_free' });
      return;
    }

    // If Wallet payment method selected (Standard 10 credits = 1 rs)
    if (selectedPayMethod === 'wallet') {
      const currentCredits = walletBalance ?? user?.walletBalance ?? 150;
      const requiredCredits = Math.round(payableNow * 10);
      if (currentCredits < requiredCredits) {
        setIsPayingScheduled(false);
        toast.error(`Insufficient Seva Credits. Required: ${requiredCredits} credits (₹${payableNow}), Available: ${currentCredits} credits (₹${(currentCredits / 10).toFixed(2)})`);
        return;
      }
      try {
        if (debitWallet) {
          await debitWallet(requiredCredits, `SCHED-${Date.now()}`);
        }
        await completeScheduledBookingCreation({
          paymentMethod: 'wallet',
          creditsBurned: requiredCredits
        });
        toast.success(`Booking confirmed! Paid ₹${payableNow} using ${requiredCredits} Seva Credits.`);
        return;
      } catch (wallErr) {
        console.error('Wallet deduction error:', wallErr);
        setIsPayingScheduled(false);
        toast.error('Wallet payment failed: ' + (wallErr.message || 'Please retry.'));
        return;
      }
    }

    try {
      // 1. Ensure Razorpay checkout script is loaded
      await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      let orderId = undefined;
      let keyId = 'rzp_test_Tjo8HdYyapYlnO';

      try {
        const orderRes = await fetch(`${API_V1_URL}/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: payableNow,
            currency: 'INR',
            isDiagnosticOnly: true,
            bookingId: `SCHED-${Date.now()}`
          })
        });
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          orderId = orderData.order.id;
          if (orderData.keyId) keyId = orderData.keyId;
        }
      } catch (err) {
        console.warn('Razorpay order backend creation note:', err);
      }

      // 3. Open Razorpay Checkout (Native Android SDK BottomSheet on Mobile, Web SDK on Browser)
      try {
        const rzpResult = await openRazorpay({
          key: keyId,
          amount: Math.round(payableNow * 100),
          currency: 'INR',
          name: 'Shazu One Scheduled Booking',
          description: `Advance Visit Fee Reservation (${currentServiceName})`,
          image: 'https://salemseva-backend.onrender.com/favicon.png',
          order_id: orderId,
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@shazuone.in',
            contact: (user?.phone || '').replace(/\s+/g, '')
          },
          theme: {
            color: '#0066CC'
          }
        });

        if (rzpResult && rzpResult.success) {
          try {
            await fetch(`${API_V1_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: payableNow,
                razorpay_payment_id: rzpResult.razorpay_payment_id,
                razorpay_order_id: rzpResult.razorpay_order_id || orderId,
                razorpay_signature: rzpResult.razorpay_signature,
                bookingId: `SCHED-${Date.now()}`
              })
            });
          } catch (verErr) {
            console.warn('Payment verify note:', verErr);
          }

          await completeScheduledBookingCreation({
            paymentMethod: 'razorpay_gateway',
            razorpayPaymentId: rzpResult.razorpay_payment_id
          });
          return;
        }
      } catch (payErr) {
        console.warn('Razorpay payment cancelled or failed:', payErr);
        setIsPayingScheduled(false);
        toast.error(payErr.message || 'Payment was cancelled or could not be processed.');
        return;
      }
    } catch (err) {
      console.error('Payment gateway error:', err);
      setIsPayingScheduled(false);
      toast.error('Payment processing error: ' + (err.message || 'Please check your connection and retry.'));
    }
  };

  const currentServiceName = serviceInfo?.name || (
    serviceId === 'ac' ? 'AC Repair & Service' :
    serviceId === 'electrician' ? 'Electrician & Wiring Service' :
    serviceId === 'plumber' ? 'Plumber & Sanitary Service' :
    serviceId === 'cleaning' ? 'Home & Deep Cleaning' : 'Doorstep Home Service'
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: { xs: 16, md: 10 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, md: 3 } }}>
        
        {/* Location selector bar */}
        {(() => {
          const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
          const p = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
          const isBadPin = Boolean(p && !p.startsWith('636'));
          return (
            <Paper
              elevation={0}
              onClick={() => navigate('/booking/address', { state: { returnTo: location.pathname + location.search } })}
              sx={{
                p: 1.2,
                mb: 1.5,
                borderRadius: '8px',
                bgcolor: isBadPin ? '#FEF2F2' : '#FFFFFF',
                border: isBadPin ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { borderColor: isBadPin ? '#DC2626' : '#CBD5E1' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                <LocationOnIcon sx={{ fontSize: 22, color: isBadPin ? '#DC2626' : '#2563EB', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isBadPin ? '#991B1B' : '#0F172A', fontSize: { xs: '14px', sm: '15px' } }}>
                      {userLocation.locality || 'Fairlands, Salem'}
                    </Typography>
                    {isBadPin && (
                      <Chip label="Outside Salem (Not Accepted)" size="small" sx={{ height: 20, fontSize: '11px', fontWeight: 800, bgcolor: '#EF4444', color: '#FFF' }} />
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isBadPin ? '#B91C1C' : '#64748B',
                      fontSize: { xs: '12.5px', sm: '13.5px' },
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {userLocation.address || 'Service address in Salem'}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: isBadPin ? '#DC2626' : '#2563EB',
                  fontWeight: 700,
                  fontSize: { xs: '13px', sm: '14px' },
                  textTransform: 'none',
                  flexShrink: 0
                }}
              >
                Change
              </Button>
            </Paper>
          );
        })()}

        {/* Dedicated Direct Specialist Reservation Banner if chosen from Homepage */}
        {requestedTechnician && (
          <Paper
            elevation={0}
            sx={{
              p: 1.6,
              mb: 1.8,
              borderRadius: '10px',
              bgcolor: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#0284C7', fontWeight: 800 }}>
                  {(requestedTechnician.name || 'T').charAt(0)}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#10B981',
                    border: '2px solid #FFFFFF'
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                    {requestedTechnician.name}
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '11px !important', color: '#166534 !important' }} />}
                    label="Requested Specialist"
                    size="small"
                    sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10px', height: 20 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, fontSize: '11px', display: 'block' }}>
                  {requestedTechnician.tradeName || 'Certified Specialist'} • {requestedTechnician.serviceArea || 'Salem'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 13, color: '#D97706' }} />
                  {requestedTechnician.ratingAvg || 4.9} Rating • Aadhaar & Police Verified • Central Ops direct slot confirmation
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Active On Duty"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '10.5px' }}
            />
          </Paper>
        )}

        {/* Service Hero Header Card (Dynamic from DB) */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: { xs: 1.5, sm: 2 },
            mb: 1.5
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                bgcolor: '#EFF6FF',
                color: serviceInfo?.colorHex || '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getServiceIcon()}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '16px', sm: '18.5px' }, lineHeight: 1.25 }}>
                {currentServiceName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <StarIcon sx={{ color: '#D97706', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
                    4.9
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
                  • Verified Salem Technicians • 15-25 min ETA
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Domain Availability Warning Banner when no tech is in system */}
        {isDomainTemporarilyClosed && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 2,
              bgcolor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <WarningAmberIcon sx={{ color: '#DC2626', fontSize: 28, mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#991B1B', fontSize: { xs: '15px', sm: '16.5px' } }}>
                    {domainAvailability.notice?.title || `${currentServiceName} Temporarily Closed in Salem`}
                  </Typography>
                  <Chip
                    label="Temporarily Closed"
                    size="small"
                    sx={{
                      bgcolor: '#FEE2E2',
                      color: '#991B1B',
                      fontWeight: 800,
                      fontSize: '11px',
                      height: 22,
                      border: '1px solid #FCA5A5'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#7F1D1D', fontSize: { xs: '13px', sm: '14px' }, lineHeight: 1.55 }}>
                  {domainAvailability.notice?.description || `No certified ${currentServiceName} technicians are currently available in Salem & surroundings. We are actively looking for certified technicians for this domain.`}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #FECACA', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 600, fontSize: { xs: '12px', sm: '12.5px' } }}>
                Looking for other doorstep home services in Salem?
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/')}
                sx={{
                  color: '#991B1B',
                  borderColor: '#F87171',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  textTransform: 'none',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' }
                }}
              >
                Browse Active Services in Salem
              </Button>
            </Box>
          </Paper>
        )}

        {/* Booking Process Mini Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px'
          }}
        >
          <Stepper activeStep={selectedIssue ? 1 : 0} alternativeLabel>
            {['1. Select Fault', '2. Pick Time Window', '3. Verified Arrival'].map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '12.5px', sm: '13.5px' },
                      fontWeight: 700,
                      color: '#475569',
                      '&.Mui-active': { color: '#0066CC', fontWeight: 800 },
                      '&.Mui-completed': { color: '#16A34A', fontWeight: 700 }
                    },
                    '& .MuiStepIcon-root': {
                      fontSize: { xs: '22px', sm: '24px' },
                      '&.Mui-active': { color: '#0066CC' },
                      '&.Mui-completed': { color: '#16A34A' }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Coupon Discount Section */}
        {couponApplied ? (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOfferIcon sx={{ color: '#16A34A', fontSize: 18 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', fontSize: { xs: '13.5px', sm: '14.5px' } }}>
                  ₹{couponDiscount} discount applied ({couponCode})
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: { xs: '12px', sm: '13px' } }}>
                  Promotional credit applied to inspection & repair bill
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
              onClick={handleRemoveCoupon}
              sx={{ color: '#475569', fontWeight: 600, fontSize: { xs: '12.5px', sm: '13.5px' }, textTransform: 'none', py: 0.4, '&:hover': { color: '#EF4444' } }}
            >
              Remove
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <LocalOfferIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '13.5px', sm: '14.5px' } }}>
                Have a coupon or referral code?
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Enter code (e.g. SALEM100, SALEM50)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '13.5px', sm: '14.5px' },
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
              <Button
                variant="contained"
                disabled={couponLoading}
                onClick={() => handleApplyCoupon()}
                sx={{
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: { xs: '13px', sm: '14px' },
                  px: 2.5,
                  textTransform: 'none',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </Button>
            </Box>
            {couponError && (
              <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '12.5px', mt: 0.5, display: 'block' }}>
                {couponError}
              </Typography>
            )}

            {/* Available Coupon Quick Selectors */}
            {availableCoupons.length > 0 && (
              <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '12px', sm: '13px' }, fontWeight: 600 }}>
                  Available Coupons:
                </Typography>
                {availableCoupons.map((ac) => (
                  <Chip
                    key={ac.id}
                    label={`${ac.code} (${ac.discountType === 'percent' ? `${ac.discountValue}%` : `₹${ac.discountValue}`} OFF)`}
                    size="small"
                    onClick={() => handleApplyCoupon(ac.code)}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      height: 26,
                      bgcolor: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      '&:hover': { bgcolor: '#DBEAFE' }
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        )}

        {/* Issue Selector Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '14.5px', sm: '16px' } }}>
            Select issue or problem
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
            Estimated cost in Salem
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2.5 }}>
          {isLoadingIssues ? (
            [1, 2, 3, 4].map((n) => (
              <Card key={n} elevation={0} sx={{ p: 1.5, borderRadius: '8px' }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Card>
            ))
          ) : (
            displayIssues.map((item) => {
              const isSelected = selectedIssue === item.id;
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  onClick={() => setSelectedIssue(item.id)}
                  sx={{
                    p: { xs: 1.4, sm: 1.6 },
                    bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedIssue(item.id)}
                      size="small"
                      sx={{ p: 0.2, '&.Mui-checked': { color: '#2563EB' } }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500, color: '#0F172A', fontSize: { xs: '14px', sm: '15px' } }}>
                      {item.title}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
                      {item.estRange}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontSize: { xs: '11.5px', sm: '12.5px' }, fontWeight: 600 }}>
                      Visit fee: ₹{inspectionFeeNumber}
                    </Typography>
                  </Box>
                </Card>
              );
            })
          )}
        </Box>

        {/* Optional Problem Details Textarea */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: { xs: 1.5, sm: 2 },
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <EditNoteIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '14px', sm: '15px' } }}>
              Describe problem details (optional)
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="e.g. AC unit is on 2nd floor, making buzzing noise since yesterday, error code E4..."
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '13.5px', sm: '14.5px' },
                borderRadius: '8px',
                bgcolor: '#F8FAFC'
              }
            }}
          />
          
          {/* Audio Voice Note for Technician */}
          <VoiceNoteRecorder
            onAudioChange={(audio) => setVoiceNoteAudio(audio)}
          />

          <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '12px', sm: '13px' }, mt: 0.8, display: 'block' }}>
            Our technician will listen to your voice note and review these details before arriving with the right tools.
          </Typography>
        </Card>

        {/* APPOINTMENT DATE & TIME SELECTION */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1.5px solid #BAE6FD',
            borderRadius: '12px',
            p: { xs: 1.8, sm: 2.2 },
            mb: 2.5,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalendarMonthIcon sx={{ color: '#0284C7', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '15.5px', sm: '17.5px' } }}>
              Choose Appointment Date & Time Window
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.8, fontSize: { xs: '12.5px', sm: '13.5px' } }}>
            Shazu One Central Operations allocates verified specialists across Salem. For urgent needs, select <strong>"Earliest Today (Emergency • Central Ops Fast Dispatch)"</strong> for immediate priority assignment.
          </Typography>

          {/* Scheduled Slot Picker UI */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
              {/* Step 1: 14-Day Horizontal Scroller + Calendar Picker */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
                  1. Select Service Date:
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                  onClick={() => dateInputRef.current && (dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click())}
                  sx={{
                    color: '#0284C7',
                    fontWeight: 800,
                    fontSize: { xs: '12.5px', sm: '13.5px' },
                    textTransform: 'none',
                    p: 0,
                    minWidth: 0
                  }}
                >
                  Pick from Calendar
                </Button>
                <input
                  type="date"
                  ref={dateInputRef}
                  min={todayISO}
                  value={selectedDateISO}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDateISO(e.target.value);
                  }}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                />
              </Box>

              {/* Horizontal Scrollable 14-Day Date Strip */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.2,
                  overflowX: 'auto',
                  pb: 1.2,
                  mb: 1.5,
                  '::-webkit-scrollbar': { height: '5px' },
                  '::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                }}
              >
                {availableDates.map((d) => {
                  const isSelected = selectedDateISO === d.iso;
                  const dateInfo = domainAvailability.dates?.[d.iso];
                  const isDateFull = Boolean(dateInfo?.isFullyBooked);

                  return (
                    <Paper
                      key={d.iso}
                      elevation={0}
                      onClick={() => setSelectedDateISO(d.iso)}
                      sx={{
                        minWidth: '74px',
                        p: '10px 8px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        border: isSelected 
                          ? (isDateFull ? '2px solid #DC2626' : '2px solid #0284C7')
                          : (isDateFull ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0'),
                        bgcolor: isSelected 
                          ? (isDateFull ? '#DC2626' : '#0284C7') 
                          : (isDateFull ? '#FEF2F2' : '#FFFFFF'),
                        color: isSelected ? '#FFFFFF' : (isDateFull ? '#991B1B' : '#0F172A'),
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
                        '&:hover': {
                          borderColor: isDateFull ? '#DC2626' : '#0284C7',
                          bgcolor: isSelected 
                            ? (isDateFull ? '#DC2626' : '#0284C7') 
                            : (isDateFull ? '#FEE2E2' : '#F0F9FF')
                        }
                      }}
                    >
                      {isDateFull && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -4,
                            bgcolor: '#DC2626',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: 900,
                            px: 0.6,
                            py: 0.1,
                            borderRadius: '4px',
                            letterSpacing: '0.3px',
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                          }}
                        >
                          FULL
                        </Box>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          color: isSelected ? '#E0F2FE' : (isDateFull ? '#B91C1C' : '#64748B')
                        }}
                      >
                        {d.dayName}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '19px', sm: '21px' },
                          lineHeight: 1.2,
                          my: 0.3,
                          color: isSelected ? '#FFFFFF' : (isDateFull ? '#991B1B' : '#0F172A')
                        }}
                      >
                        {d.dayNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isSelected ? '#E0F2FE' : (isDateFull ? '#DC2626' : '#94A3B8')
                        }}
                      >
                        {isDateFull ? 'BOOKED' : d.monthName}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>

              {/* Alert if selected date is fully booked */}
              {isSelectedDateFull && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.4,
                    bgcolor: '#FEF2F2',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    mb: 1.8
                  }}
                >
                  <WarningAmberIcon sx={{ color: '#DC2626', fontSize: 24, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B', fontSize: { xs: '13px', sm: '14px' } }}>
                      All technicians are booked on this date.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B91C1C', fontSize: { xs: '12px', sm: '12.5px' }, display: 'block' }}>
                      Please choose another date from the schedule ribbon above to reserve your slot.
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Selected Date Indicator Banner */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '8px 12px',
                  bgcolor: isSelectedDateFull ? '#FEF2F2' : '#EFF6FF',
                  borderRadius: '8px',
                  border: isSelectedDateFull ? '1px solid #FECACA' : '1px solid #BFDBFE',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <EventIcon sx={{ color: isSelectedDateFull ? '#DC2626' : '#0284C7', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: isSelectedDateFull ? '#991B1B' : '#0369A1', fontWeight: 800, fontSize: { xs: '13px', sm: '14px' } }}>
                    Selected Date: <strong>{getFormattedDateString()}</strong> {isSelectedDateFull ? '(Fully Booked)' : ''}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => dateInputRef.current && (dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click())}
                  sx={{ p: 0, minWidth: 0, fontSize: { xs: '12px', sm: '13px' }, fontWeight: 700, color: isSelectedDateFull ? '#DC2626' : '#0284C7', textTransform: 'none' }}
                >
                  Change Date
                </Button>
              </Box>

              {/* Step 2: Time Slots + Custom Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', fontSize: { xs: '12.5px', sm: '13.5px' } }}>
                  2. Select Time Window or Custom Time:
                </Typography>
              </Box>

              <Grid container spacing={1.2} sx={{ mb: 1.5 }}>
                {timeSlots.map(slot => {
                  const isSlotActive = !isCustomTimeActive && selectedSlot === slot.label;
                  const slotStatus = currentDateStatus?.slots?.[slot.label];
                  const isSlotFull = Boolean(slotStatus?.isFull);

                  return (
                    <Grid item xs={6} key={slot.id}>
                      <Paper
                        elevation={0}
                        onClick={() => {
                          if (isSlotFull || isSelectedDateFull) {
                            toast.error('This slot is fully booked. Please pick another slot or date.');
                            return;
                          }
                          setIsCustomTimeActive(false);
                          setSelectedSlot(slot.label);
                        }}
                        sx={{
                          p: { xs: 1.2, sm: 1.4 },
                          borderRadius: '8px',
                          cursor: (isSlotFull || isSelectedDateFull) ? 'not-allowed' : 'pointer',
                          opacity: (isSlotFull || isSelectedDateFull) ? 0.6 : 1,
                          border: isSlotActive 
                            ? '1.5px solid #0284C7' 
                            : (isSlotFull ? '1px dashed #CBD5E1' : '1px solid #E2E8F0'),
                          bgcolor: isSlotActive 
                            ? '#E0F2FE' 
                            : (isSlotFull ? '#F8FAFC' : '#FFFFFF'),
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.4
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: isSlotActive ? '#0369A1' : (isSlotFull ? '#64748B' : '#0F172A'), fontSize: { xs: '13px', sm: '14px' } }}>
                            {slot.label}
                          </Typography>
                          {isSlotActive && <CheckCircleIcon sx={{ fontSize: 16, color: '#0284C7' }} />}
                          {isSlotFull && (
                            <Chip label="Full" size="small" sx={{ height: 18, fontSize: '10px', fontWeight: 800, bgcolor: '#FEE2E2', color: '#991B1B' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '11.5px', sm: '12.5px' } }}>
                          {isSlotFull ? 'All specialists assigned' : `${slot.period} ${slot.popular ? '• Popular' : ''}`}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Custom Specific Time Picker Input */}
              <Paper
                elevation={0}
                onClick={() => setIsCustomTimeActive(true)}
                sx={{
                  p: { xs: 1.2, sm: 1.5 },
                  borderRadius: '8px',
                  border: isCustomTimeActive ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                  bgcolor: isCustomTimeActive ? '#E0F2FE' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  cursor: 'pointer'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: isCustomTimeActive ? '#0284C7' : '#64748B', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: isCustomTimeActive ? '#0369A1' : '#0F172A', fontSize: { xs: '13px', sm: '14px' }, display: 'block' }}>
                      Specify Exact Custom Time (Optional)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: { xs: '12px', sm: '13px' } }}>
                      {customTime ? `Chosen: ${getEffectiveSlot()}` : 'Pick an exact arrival time'}
                    </Typography>
                  </Box>
                </Box>

                <input
                  type="time"
                  value={customTime}
                  onFocus={() => setIsCustomTimeActive(true)}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    setIsCustomTimeActive(true);
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                />
              </Paper>

              {/* Admin Dispatch Notice */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.2, sm: 1.5 },
                  bgcolor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px dashed #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2
                }}
              >
                <AdminPanelSettingsIcon sx={{ color: '#0284C7', fontSize: 22, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#334155', fontSize: { xs: '12px', sm: '13px' }, lineHeight: 1.45 }}>
                  <strong>Admin Operations Queue:</strong> Once booked, this slot request is forwarded directly to the Salem Central Admin Board. Our operations desk assigns a certified technician for your scheduled window.
                </Typography>
              </Paper>
            </Box>
        </Card>

        {/* Quality & Guarantees Accordion Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.2, fontSize: { xs: '12px', sm: '13px' } }}>
            Shazu One Quality & Guarantees
          </Typography>

          {/* Accordion 1: Labour Pricing & Zero Product Selling */}
          <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ fontSize: 20, color: '#0066CC' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '14px', sm: '15px' }, color: '#0F172A' }}>
                  Transparent Labour & Zero Product Push
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, color: '#475569', fontSize: { xs: '13px', sm: '14px' }, lineHeight: 1.6 }}>
              Shazu One charges strictly for doorstep inspection and skilled workmanship. We do not sell or force spare parts. If any materials or replacement components are needed, you are completely free to provide them yourself or purchase them from any vendor of your choice.
            </AccordionDetails>
          </Accordion>

          {/* Accordion 2: 30-Day Free Rework Warranty */}
          <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px !important', mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: '#16A34A' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '14px', sm: '15px' }, color: '#0F172A' }}>
                  30-Day Free Work Warranty
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, color: '#475569', fontSize: { xs: '13px', sm: '14px' }, lineHeight: 1.6 }}>
              Every completed booking across Fairlands, Hasthampatti, Suramangalam, and all 10 Salem municipal wards comes with our 30-day workmanship assurance. If the same diagnosed fault reoccurs within 30 days, our technician will re-inspect and service it at zero extra labour charge.
            </AccordionDetails>
          </Accordion>

          {/* Accordion 3: Escrow Payment Protection */}
          <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 20, color: '#059669' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '14px', sm: '15px' }, color: '#0F172A' }}>
                  100% Escrow Payment Protection
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, color: '#475569', fontSize: { xs: '13px', sm: '14px' }, lineHeight: 1.6 }}>
              Your repair fee is locked in a secure digital escrow holding account. Funds are released to the technician only after you personally test the repaired appliance and sign off on completion.
            </AccordionDetails>
          </Accordion>
        </Box>

      </Container>

      {/* Sticky Bottom Action Bar */}
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: { xs: 54, md: 0 },
          left: 0,
          right: 0,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          py: 1.4,
          px: { xs: 2, md: 3 },
          zIndex: 995,
          boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Container maxWidth="md" disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '15px', sm: '17px' }, color: '#0F172A' }}>
              Inspection fee: ₹{inspectionFeeNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: bookingMode === 'scheduled' ? '#0066CC' : couponApplied ? '#16A34A' : '#64748B', fontSize: { xs: '12.5px', sm: '13.5px' }, fontWeight: 600 }}>
              {bookingMode === 'scheduled'
                ? `${getFormattedDateString()} • ${getEffectiveSlot().split('-')[0].trim()}`
                : couponApplied ? `₹${couponDiscount} discount applied` : `Service in ${userLocation.locality || 'Fairlands, Salem'}`}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disabled={isDomainTemporarilyClosed || isSelectedDateFull}
            onClick={handleProceed}
            endIcon={!isDomainTemporarilyClosed && !isSelectedDateFull ? <ArrowForwardIcon sx={{ fontSize: 20 }} /> : undefined}
            sx={{
              bgcolor: isDomainTemporarilyClosed 
                ? '#94A3B8' 
                : isSelectedDateFull 
                ? '#DC2626' 
                : '#0284C7',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 800,
              px: { xs: 2.2, sm: 3.5 },
              py: 1.1,
              fontSize: { xs: '13px', sm: '15px' },
              textTransform: 'none',
              boxShadow: isDomainTemporarilyClosed || isSelectedDateFull ? 'none' : '0 4px 14px rgba(2, 132, 199, 0.25)',
              '&:hover': {
                bgcolor: isDomainTemporarilyClosed ? '#94A3B8' : isSelectedDateFull ? '#B91C1C' : '#0369A1'
              },
              '&.Mui-disabled': {
                bgcolor: '#94A3B8',
                color: '#F8FAFC'
              }
            }}
          >
            {isDomainTemporarilyClosed
              ? 'Service Temporarily Closed in Salem'
              : isSelectedDateFull
              ? 'Date Fully Booked • Select Another Date'
              : `Pay ₹${Math.max(0, inspectionFeeNumber - (couponApplied ? couponDiscount : 0))} & Reserve Slot`}
          </Button>
        </Container>
      </Paper>

      {/* Mobile-Only Bottom Navigation */}
      <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
          <BottomNavigation showLabels value={0} sx={{ height: 56, '& .Mui-selected': { color: '#0066CC', fontWeight: 700 } }}>
            <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
            <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
            <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          </BottomNavigation>
        </Box>
      </Paper>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Registering scheduled appointment..."
        subtitle="Submitting slot to Shazu One Central Operations Desk"
        badge="Central Ops Queue"
      />

    </Box>
  );
}
  