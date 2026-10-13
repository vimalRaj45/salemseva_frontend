import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Radio,
  Button,
  Chip,
  Paper,
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
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

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

import { ApiService } from '../../services/api';
import LocationPickerModal from '../../components/LocationPickerModal';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import VoiceNoteRecorder from '../../components/VoiceNoteRecorder';
import SalemLottie from '../../components/SalemLottie';
import { useAuth } from '../../context/AuthContext';

export default function ServiceDetailPage({ onStartBooking }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceId = 'ac' } = useParams();
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

  const [serviceInfo, setServiceInfo] = useState(null);
  const [issuesList, setIssuesList] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Booking Mode: 'instant' (Search Tech Now) vs 'scheduled' (Choose Date & Slot)
  const todayISO = new Date().toISOString().split('T')[0];
  const [bookingMode, setBookingMode] = useState('instant');
  const [selectedDateISO, setSelectedDateISO] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const [customTime, setCustomTime] = useState('');
  const [isCustomTimeActive, setIsCustomTimeActive] = useState(false);
  const [scheduledPaymentModalOpen, setScheduledPaymentModalOpen] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState('upi');
  const [isPayingScheduled, setIsPayingScheduled] = useState(false);
  const [scheduledSuccessModalOpen, setScheduledSuccessModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const dateInputRef = React.useRef(null);

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
    const saved = localStorage.getItem('salemseva_user_location');
    return saved ? JSON.parse(saved) : {
      locality: 'Fairlands',
      pincode: '636016',
      address: 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
      lat: 11.6738,
      lng: 78.1460
    };
  });

  useEffect(() => {
    async function loadServiceData() {
      setIsLoadingIssues(true);
      try {
        // Fetch Service Info from DB
        const svcRes = await fetch(`${API_V1_URL}/services/${serviceId || 'ac'}`);
        const svcData = await svcRes.json();
        if (svcData.success && svcData.service) {
          setServiceInfo(svcData.service);
        }

        // Fetch Issues from DB
        const issues = await ApiService.fetchIssues(serviceId || 'ac', 'en');
        if (issues && issues.length > 0) {
          const list = issues.map(i => ({
            id: i.id || 'issue_default',
            title: i.name || i.issue_name || 'Inspection & Repair',
            estRange: i.estRange || 'Quote on Inspection',
            visitFee: '₹99'
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
      const res = await fetch(`${API_V1_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, bookingAmount: 99 })
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
    { id: '08_10', label: '08:00 AM - 10:00 AM', period: 'Morning Window' },
    { id: '10_12', label: '10:00 AM - 12:00 PM', period: 'Mid-Morning', popular: true },
    { id: '12_02', label: '12:00 PM - 02:00 PM', period: 'Afternoon' },
    { id: '02_04', label: '02:00 PM - 04:00 PM', period: 'Post-Lunch' },
    { id: '04_06', label: '04:00 PM - 06:00 PM', period: 'Evening Window' },
    { id: '06_08', label: '06:00 PM - 08:00 PM', period: 'Night Window' }
  ];

  const checkSalemPincode = () => {
    const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
    const pin = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
    if (pin && !pin.startsWith('636')) {
      alert(`Service Unavailable Outside Salem: PIN code ${pin} is outside our active technician region. SalemSeva only serves Salem (PIN codes: 636xxx). Your booking cannot be accepted.`);
      return false;
    }
    return true;
  };

  const handleProceed = async () => {
    if (!checkSalemPincode()) return;

    if (bookingMode === 'scheduled') {
      setScheduledPaymentModalOpen(true);
      return;
    }

    setIsProcessing(true);
    const finalSlot = 'instant_now';

    try {
      const res = await fetch(`${API_V1_URL}/bookings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId || 'ac',
          issueId: selectedIssue,
          customNotes: customDescription,
          customerId: user?.id || 'usr-cust-001',
          customerName: user?.name || 'Vimal Raj',
          customerPhone: user?.phone || '+919842711234',
          lat: userLocation.lat || 11.6643,
          lng: userLocation.lng || 78.1460,
          locality: userLocation.locality || 'Fairlands',
          address: userLocation.address || 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
          pincode: userLocation.pincode || '636016',
          couponCode: couponApplied ? couponCode : null,
          discountAmount: couponApplied ? couponDiscount : 0,
          isUrgentDispatch: true,
          scheduledSlot: finalSlot,
          bookingType: 'instant',
          voiceNoteAudio: voiceNoteAudio
        })
      });
      const data = await res.json();
      if (!data.success || !data.booking?.id) {
        throw new Error(data.error || 'Failed to register booking in database');
      }
      const bId = data.booking.id;
      const bObj = data.booking;

      localStorage.setItem('salemseva_active_booking', bId);
      window.dispatchEvent(new CustomEvent('salemseva_new_booking_created', { detail: { bookingId: bId, booking: bObj } }));
      window.dispatchEvent(new Event('storage'));
      if (onStartBooking) onStartBooking(bObj);
      setIsProcessing(false);
      navigate(`/matching?bookingId=${bId}`);
    } catch (e) {
      console.error('Booking creation error:', e);
      setIsProcessing(false);
      alert('Unable to connect to service dispatch: ' + (e.message || 'Please check your connection and retry.'));
    }
  };

  const handlePayAndConfirmScheduled = async () => {
    if (!checkSalemPincode()) return;

    setIsPayingScheduled(true);
    const finalSlot = `${getFormattedDateString()} • ${getEffectiveSlot()}`;
    const visitFeeAmount = 49;
    const discount = couponApplied ? couponDiscount : 0;
    const payableNow = Math.max(0, visitFeeAmount - discount);

    try {
      const res = await fetch(`${API_V1_URL}/bookings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId || 'ac',
          issueId: selectedIssue,
          customNotes: customDescription,
          customerId: user?.id || 'usr-cust-001',
          customerName: user?.name || 'Vimal Raj',
          customerPhone: user?.phone || '+919842711234',
          lat: userLocation.lat || 11.6643,
          lng: userLocation.lng || 78.1460,
          locality: userLocation.locality || 'Fairlands',
          address: userLocation.address || 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
          pincode: userLocation.pincode || '636016',
          couponCode: couponApplied ? couponCode : null,
          discountAmount: discount,
          isUrgentDispatch: false,
          scheduledSlot: finalSlot,
          bookingType: 'scheduled',
          paymentStatus: 'paid',
          paymentMethod: selectedPayMethod,
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

      localStorage.setItem('salemseva_active_booking', bId);
      window.dispatchEvent(new CustomEvent('salemseva_new_booking_created', { detail: { bookingId: bId, booking: bObj } }));
      window.dispatchEvent(new Event('storage'));
      if (onStartBooking) onStartBooking(bObj);
      setIsPayingScheduled(false);
      setScheduledPaymentModalOpen(false);
      setConfirmedBooking({ ...bObj, id: bId, scheduled_slot: finalSlot });
      setScheduledSuccessModalOpen(true);
    } catch (e) {
      console.error('Scheduled booking creation error:', e);
      setIsPayingScheduled(false);
      setScheduledPaymentModalOpen(false);
      alert('Unable to reserve scheduled visit: ' + (e.message || 'Please retry.'));
    }
  };

  const currentServiceName = serviceInfo?.name || (
    serviceId === 'ac' ? 'AC Repair & Service' :
    serviceId === 'electrician' ? 'Electrician & Wiring Service' :
    serviceId === 'plumber' ? 'Plumber & Sanitary Service' :
    serviceId === 'cleaning' ? 'Home & Deep Cleaning' : 'Doorstep Home Service'
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 14 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Location selector bar */}
        {(() => {
          const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
          const p = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
          const isBadPin = Boolean(p && !p.startsWith('636'));
          return (
            <Paper
              elevation={0}
              onClick={() => setLocationPickerOpen(true)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: isBadPin ? '#DC2626' : '#2563EB', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isBadPin ? '#991B1B' : '#0F172A', fontSize: '13px' }}>
                      {userLocation.locality || 'Fairlands, Salem'}
                    </Typography>
                    {isBadPin && (
                      <Chip label="Outside Salem (Not Accepted)" size="small" sx={{ height: 18, fontSize: '9.5px', fontWeight: 800, bgcolor: '#EF4444', color: '#FFF' }} />
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isBadPin ? '#B91C1C' : '#64748B',
                      fontSize: '11px',
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
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: isBadPin ? '#DC2626' : '#2563EB',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'none',
                  flexShrink: 0
                }}
              >
                Change
              </Button>
            </Paper>
          );
        })()}

        {/* Service Hero Header Card (Dynamic from DB) */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 1.5,
            mb: 1.5
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14.5px', lineHeight: 1.2 }}>
                {currentServiceName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <StarIcon sx={{ color: '#D97706', fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>
                    4.9
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                  • Verified Salem Technicians • 15-25 min ETA
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Coupon Discount Section */}
        {couponApplied ? (
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
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
              <LocalOfferIcon sx={{ color: '#16A34A', fontSize: 16 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#166534', fontSize: '12px' }}>
                  ₹{couponDiscount} discount applied ({couponCode})
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: '11px' }}>
                  Promotional credit applied to inspection & repair bill
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              startIcon={<CloseIcon sx={{ fontSize: 13 }} />}
              onClick={handleRemoveCoupon}
              sx={{ color: '#475569', fontWeight: 600, fontSize: '11.5px', textTransform: 'none', py: 0.2, '&:hover': { color: '#EF4444' } }}
            >
              Remove
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <LocalOfferIcon sx={{ color: '#2563EB', fontSize: 16 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
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
                    fontSize: '12px',
                    borderRadius: '6px',
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
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  px: 2,
                  textTransform: 'none',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                {couponLoading ? 'Checking...' : 'Apply'}
              </Button>
            </Box>
            {couponError && (
              <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '11px', mt: 0.5, display: 'block' }}>
                {couponError}
              </Typography>
            )}

            {/* Available Coupon Quick Selectors */}
            {availableCoupons.length > 0 && (
              <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', fontWeight: 600 }}>
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
                      fontSize: '10px',
                      fontWeight: 700,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
            Select issue or problem
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
            Estimated cost in Salem
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {isLoadingIssues ? (
            [1, 2, 3, 4].map((n) => (
              <Card key={n} elevation={0} sx={{ p: 1.2, borderRadius: '8px' }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={14} />
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
                    p: 1.2,
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
                    <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 600 : 500, color: '#0F172A', fontSize: '13px' }}>
                      {item.title}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', fontSize: '11px' }}>
                      {item.estRange}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontSize: '10.5px' }}>
                      Visit fee: ₹49
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
            p: 1.5,
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <EditNoteIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
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
                fontSize: '12px',
                borderRadius: '6px',
                bgcolor: '#F8FAFC'
              }
            }}
          />
          
          {/* Audio Voice Note for Technician */}
          <VoiceNoteRecorder
            onAudioChange={(audio) => setVoiceNoteAudio(audio)}
          />

          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', mt: 0.5, display: 'block' }}>
            Our technician will listen to your voice note and review these details before arriving with the right tools.
          </Typography>
        </Card>

        {/* BOOKING MODE SELECTOR: Instant vs Scheduled */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            p: 2,
            mb: 2.5,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', mb: 0.5 }}>
            Choose How You Want to Book
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
            Need immediate service in 15-25 mins, or want to pick a convenient date & slot?
          </Typography>

          {/* Mode Tabs */}
          <Grid container spacing={1.2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                onClick={() => setBookingMode('instant')}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: bookingMode === 'instant' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  bgcolor: bookingMode === 'instant' ? '#EFF6FF' : '#F8FAFC',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <BoltIcon sx={{ color: bookingMode === 'instant' ? '#2563EB' : '#64748B', fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: bookingMode === 'instant' ? '#1D4ED8' : '#0F172A', fontSize: '12.5px' }}>
                      Search Tech Now
                    </Typography>
                  </Box>
                  <Radio
                    checked={bookingMode === 'instant'}
                    onChange={() => setBookingMode('instant')}
                    size="small"
                    sx={{ p: 0, '&.Mui-checked': { color: '#2563EB' } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', lineHeight: 1.3 }}>
                  Instant dispatch • Arrives in 15-25 mins
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                elevation={0}
                onClick={() => setBookingMode('scheduled')}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: bookingMode === 'scheduled' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                  bgcolor: bookingMode === 'scheduled' ? '#F0F9FF' : '#F8FAFC',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <CalendarMonthIcon sx={{ color: bookingMode === 'scheduled' ? '#0284C7' : '#64748B', fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: bookingMode === 'scheduled' ? '#0369A1' : '#0F172A', fontSize: '12.5px' }}>
                      Choose Date & Slot
                    </Typography>
                  </Box>
                  <Radio
                    checked={bookingMode === 'scheduled'}
                    onChange={() => setBookingMode('scheduled')}
                    size="small"
                    sx={{ p: 0, '&.Mui-checked': { color: '#0284C7' } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', lineHeight: 1.3 }}>
                  Scheduled visit • Central Ops Assigned
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Conditional Scheduled Slot Picker UI */}
          {bookingMode === 'scheduled' && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #BAE6FD'
              }}
            >
              {/* Step 1: 14-Day Horizontal Scroller + Calendar Picker */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', textTransform: 'uppercase' }}>
                  1. Select Service Date:
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<CalendarMonthIcon sx={{ fontSize: 15 }} />}
                  onClick={() => dateInputRef.current && (dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click())}
                  sx={{
                    color: '#0284C7',
                    fontWeight: 800,
                    fontSize: '11px',
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
                  gap: 1,
                  overflowX: 'auto',
                  pb: 1,
                  mb: 1.5,
                  '::-webkit-scrollbar': { height: '4px' },
                  '::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
                }}
              >
                {availableDates.map((d) => {
                  const isSelected = selectedDateISO === d.iso;
                  return (
                    <Paper
                      key={d.iso}
                      elevation={0}
                      onClick={() => setSelectedDateISO(d.iso)}
                      sx={{
                        minWidth: '68px',
                        p: '8px 6px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        flexShrink: 0,
                        border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                        bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
                        '&:hover': {
                          borderColor: '#0284C7',
                          bgcolor: isSelected ? '#0284C7' : '#F0F9FF'
                        }
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          color: isSelected ? '#E0F2FE' : '#64748B'
                        }}
                      >
                        {d.dayName}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 900,
                          fontSize: '18px',
                          lineHeight: 1.2,
                          my: 0.2,
                          color: isSelected ? '#FFFFFF' : '#0F172A'
                        }}
                      >
                        {d.dayNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isSelected ? '#E0F2FE' : '#94A3B8'
                        }}
                      >
                        {d.monthName}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>

              {/* Selected Date Indicator Banner */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '6px 10px',
                  bgcolor: '#EFF6FF',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <EventIcon sx={{ color: '#0284C7', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, fontSize: '11.5px' }}>
                    Selected Date: <strong>{getFormattedDateString()}</strong>
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => dateInputRef.current && (dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click())}
                  sx={{ p: 0, minWidth: 0, fontSize: '10.5px', fontWeight: 700, color: '#0284C7', textTransform: 'none' }}
                >
                  Change Date
                </Button>
              </Box>

              {/* Step 2: Time Slots + Custom Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', textTransform: 'uppercase' }}>
                  2. Select Time Window or Custom Time:
                </Typography>
              </Box>

              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                {timeSlots.map(slot => {
                  const isSlotActive = !isCustomTimeActive && selectedSlot === slot.label;
                  return (
                    <Grid item xs={6} key={slot.id}>
                      <Paper
                        elevation={0}
                        onClick={() => {
                          setIsCustomTimeActive(false);
                          setSelectedSlot(slot.label);
                        }}
                        sx={{
                          p: 1,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: isSlotActive ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                          bgcolor: isSlotActive ? '#E0F2FE' : '#FFFFFF',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.3
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: isSlotActive ? '#0369A1' : '#0F172A', fontSize: '11.5px' }}>
                            {slot.label}
                          </Typography>
                          {isSlotActive && <CheckCircleIcon sx={{ fontSize: 14, color: '#0284C7' }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                          {slot.period} {slot.popular ? '• Popular' : ''}
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
                  p: 1.2,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AccessTimeIcon sx={{ color: isCustomTimeActive ? '#0284C7' : '#64748B', fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: isCustomTimeActive ? '#0369A1' : '#0F172A', fontSize: '11.5px', display: 'block' }}>
                      Specify Exact Custom Time (Optional)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
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
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
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
                  p: 1.2,
                  bgcolor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px dashed #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AdminPanelSettingsIcon sx={{ color: '#0284C7', fontSize: 20, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#334155', fontSize: '11px', lineHeight: 1.4 }}>
                  <strong>Admin Operations Queue:</strong> Once booked, this slot request is forwarded directly to the Salem Central Admin Board. Our operations desk assigns a certified technician for your scheduled window.
                </Typography>
              </Paper>
            </Box>
          )}
        </Card>

      </Container>

      {/* Sticky Bottom Action Bar */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 54,
          left: 0,
          right: 0,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          px: 2,
          py: 1,
          zIndex: 990,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
            Inspection fee: ₹49
          </Typography>
          <Typography variant="caption" sx={{ color: bookingMode === 'scheduled' ? '#0284C7' : couponApplied ? '#16A34A' : '#64748B', fontSize: '11px', fontWeight: 600 }}>
            {bookingMode === 'scheduled'
              ? `${getFormattedDateString()} • ${getEffectiveSlot().split('-')[0].trim()}`
              : couponApplied ? `₹${couponDiscount} discount applied` : `Service in ${userLocation.locality || 'Fairlands, Salem'}`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleProceed}
          endIcon={bookingMode === 'instant' ? <BoltIcon sx={{ fontSize: 16 }} /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: bookingMode === 'instant' ? '#2563EB' : '#0284C7',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontWeight: 700,
            px: 2,
            py: 0.6,
            fontSize: '13px',
            textTransform: 'none',
            '&:hover': { bgcolor: bookingMode === 'instant' ? '#1D4ED8' : '#0369A1' }
          }}
        >
          {bookingMode === 'instant' ? 'Search Tech Now' : 'Pay ₹49 & Reserve Slot'}
        </Button>
      </Paper>

      {/* Bottom Navigation */}
      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#2563EB', fontWeight: 600 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          <BottomNavigationAction label="Partner Zone" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/partner')} />
        </BottomNavigation>
      </Paper>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(newLoc) => setUserLocation(newLoc)}
      />

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title={bookingMode === 'instant' ? 'Searching available technicians...' : 'Registering scheduled appointment...'}
        subtitle={bookingMode === 'instant' ? 'Finding verified partners in Fairlands & Hasthampatti zone' : 'Submitting slot to Salem Central Operations Desk'}
        badge={bookingMode === 'instant' ? 'Live dispatch' : 'Central Ops Queue'}
      />

      {/* SCHEDULED BOOKING PRE-PAYMENT MODAL */}
      <Dialog
        open={scheduledPaymentModalOpen}
        onClose={() => !isPayingScheduled && setScheduledPaymentModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon sx={{ color: '#0284C7', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '17px' }}>
                Reserve Scheduled Slot
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setScheduledPaymentModalOpen(false)}
              disabled={isPayingScheduled}
              sx={{ minWidth: 28, p: 0.5, color: '#94A3B8' }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
            Salem Central Operations Guaranteed Doorstep Slot
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 1 }}>
          {/* Appointment Summary Card */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: '12px', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <EventIcon sx={{ color: '#0284C7', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '13px' }}>
                {getFormattedDateString()} • {getEffectiveSlot()}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
              {currentServiceName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.2 }}>
              {userLocation.address || 'Fairlands, Salem - 636016'}
            </Typography>
          </Paper>

          {/* Price Breakdown */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.2 }}>
              Payment Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
                Doorstep Diagnostic & Inspection Visit:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
                ₹49.00
              </Typography>
            </Box>
            {couponApplied && couponDiscount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="body2" sx={{ color: '#16A34A', fontSize: '12.5px' }}>
                  Coupon Discount ({couponCode}):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '12.5px' }}>
                  -₹{couponDiscount}.00
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
                Central Ops Slot Reservation:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A', fontSize: '12.5px' }}>
                FREE
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                Total Payable Now:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0284C7', fontSize: '16px' }}>
                ₹{Math.max(0, 49 - (couponApplied ? couponDiscount : 0))}.00
              </Typography>
            </Box>
          </Paper>

          {/* Payment Method Selector */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
            Select Payment Method
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Paper
              elevation={0}
              onClick={() => setSelectedPayMethod('upi')}
              sx={{
                p: 1.4,
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1.5px solid',
                borderColor: selectedPayMethod === 'upi' ? '#0284C7' : '#E2E8F0',
                bgcolor: selectedPayMethod === 'upi' ? '#F0F9FF' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <QrCode2Icon sx={{ color: '#0284C7', fontSize: 22 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                    UPI / GPay / PhonePe / Cards
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                    Instant verification via Razorpay Escrow
                  </Typography>
                </Box>
              </Box>
              <Radio checked={selectedPayMethod === 'upi'} size="small" sx={{ p: 0, color: '#0284C7' }} />
            </Paper>

            <Paper
              elevation={0}
              onClick={() => setSelectedPayMethod('wallet')}
              sx={{
                p: 1.4,
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1.5px solid',
                borderColor: selectedPayMethod === 'wallet' ? '#10B981' : '#E2E8F0',
                bgcolor: selectedPayMethod === 'wallet' ? '#ECFDF5' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <AccountBalanceWalletIcon sx={{ color: '#059669', fontSize: 22 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                    Seva Credits Wallet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '10.5px' }}>
                    Available balance: ₹{user?.walletBalance ?? 150}
                  </Typography>
                </Box>
              </Box>
              <Radio checked={selectedPayMethod === 'wallet'} size="small" sx={{ p: 0, color: '#10B981' }} />
            </Paper>
          </Box>

          <Alert
            severity="info"
            icon={<ShieldIcon sx={{ fontSize: 18, color: '#0284C7' }} />}
            sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '11px', color: '#475569', py: 0.5 }}
          >
            Salem Central Operations will allocate a verified specialist prior to your slot. When the technician starts heading to your home, you will receive an automatic notification and live tracking.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setScheduledPaymentModalOpen(false)}
            disabled={isPayingScheduled}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayAndConfirmScheduled}
            disabled={isPayingScheduled}
            sx={{
              flex: 1,
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '10px',
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            {isPayingScheduled ? 'Processing Payment...' : `Pay ₹${Math.max(0, 49 - (couponApplied ? couponDiscount : 0))} & Confirm`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SCHEDULED BOOKING SUCCESS CONFIRMATION MODAL */}
      <Dialog
        open={scheduledSuccessModalOpen}
        onClose={() => setScheduledSuccessModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          {/* LottieFiles Booking Success Animation */}
          <SalemLottie
            name="success"
            width={110}
            height={110}
            loop={false}
            ariaLabel="Scheduled booking payment verified and confirmed"
            style={{ mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px' }}>
            Scheduled Booking Confirmed & Paid!
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
            Booking ID: <strong>#{confirmedBooking?.id || 'SLM-84920'}</strong>
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1 }}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                SCHEDULED APPOINTMENT SLOT
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284C7' }}>
                {confirmedBooking?.scheduled_slot || `${getFormattedDateString()} • ${selectedSlot}`}
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                SERVICE & LOCATION
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                {currentServiceName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                {userLocation.address}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminPanelSettingsIcon sx={{ color: '#0284C7', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                Sent to Salem Central Operations Desk
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Salem Central Operations team is allocating a verified technician for your scheduled time slot. Prior to your appointment window, when the technician starts traveling to your home, you will receive an instant notification with live GPS tracking.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setScheduledSuccessModalOpen(false);
              navigate(`/track?bookingId=${confirmedBooking?.id || 'SLM-84920'}`);
            }}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '10px',
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Track Status Now
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setScheduledSuccessModalOpen(false);
              navigate('/history');
            }}
            sx={{
              borderColor: '#CBD5E1',
              color: '#475569',
              fontWeight: 700,
              borderRadius: '10px',
              py: 0.8,
              textTransform: 'none'
            }}
          >
            View in My Bookings
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
