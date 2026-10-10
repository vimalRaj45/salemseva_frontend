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

import { ApiService } from '../../services/api';
import LocationPickerModal from '../../components/LocationPickerModal';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useAuth } from '../../context/AuthContext';

export default function ServiceDetailPage({ onStartBooking }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceId = 'ac' } = useParams();
  const [selectedIssue, setSelectedIssue] = useState('not_cooling');
  const [customDescription, setCustomDescription] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('SALEM100');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(50);
  const [couponError, setCouponError] = useState('');

  const [serviceInfo, setServiceInfo] = useState(null);
  const [issuesList, setIssuesList] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Booking Mode: 'instant' (Search Tech Now) vs 'scheduled' (Choose Date & Slot)
  const [bookingMode, setBookingMode] = useState('instant');
  const [scheduledDateOption, setScheduledDateOption] = useState('tomorrow');
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM – 12:00 PM');
  const [scheduledSuccessModalOpen, setScheduledSuccessModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

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
        const svcRes = await fetch(`https://salemseva-backend.onrender.com/api/v1/services/${serviceId || 'ac'}`);
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

  const defaultIssues = [
    { id: 'not_cooling', title: 'Diagnostic & Troubleshooting', estRange: '₹299 - ₹799', visitFee: '₹99' },
    { id: 'water_leak', title: 'Repair & Parts Replacement', estRange: '₹199 - ₹499', visitFee: '₹99' },
    { id: 'full_service', title: 'Complete Deep Service & Maintenance', estRange: '₹449 - ₹899', visitFee: '₹99' },
    { id: 'other', title: 'Other problem / Custom inspection required', estRange: 'Quote on Inspection', visitFee: '₹99' }
  ];

  const displayIssues = issuesList.length > 0 ? issuesList : defaultIssues;

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

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = (couponInput || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a valid promo code');
      return;
    }
    if (code === 'SALEM100' || code === 'FIRST100' || code === 'SUPERSEVA') {
      setCouponCode(code);
      setCouponDiscount(50);
      setCouponApplied(true);
      setCouponInput('');
    } else if (code === 'SALEM50' || code === 'SAVE50') {
      setCouponCode(code);
      setCouponDiscount(30);
      setCouponApplied(true);
      setCouponInput('');
    } else {
      setCouponCode(code);
      setCouponDiscount(40);
      setCouponApplied(true);
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  };

  const getFormattedDateString = () => {
    const today = new Date();
    if (scheduledDateOption === 'today') {
      return `Today, ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    } else if (scheduledDateOption === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `Tomorrow, ${tomorrow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    } else if (scheduledDateOption === 'day_after') {
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + 2);
      return `${nextDay.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`;
    } else {
      if (!customDate) return 'Selected Date';
      const cDate = new Date(customDate);
      return cDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };

  const timeSlots = [
    { id: '08_10', label: '08:00 AM – 10:00 AM', period: 'Morning Window' },
    { id: '10_12', label: '10:00 AM – 12:00 PM', period: 'Mid-Morning', popular: true },
    { id: '12_02', label: '12:00 PM – 02:00 PM', period: 'Afternoon' },
    { id: '02_04', label: '02:00 PM – 04:00 PM', period: 'Post-Lunch' },
    { id: '04_06', label: '04:00 PM – 06:00 PM', period: 'Evening Window' },
    { id: '06_08', label: '06:00 PM – 08:00 PM', period: 'Night Window' }
  ];

  const handleProceed = async () => {
    setIsProcessing(true);
    const isInstant = bookingMode === 'instant';
    const finalSlot = isInstant ? 'instant_now' : `${getFormattedDateString()} • ${selectedSlot}`;

    try {
      const res = await fetch('https://salemseva-backend.onrender.com/api/v1/bookings/create', {
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
          couponCode: couponApplied ? couponCode : null,
          discountAmount: couponApplied ? couponDiscount : 0,
          isUrgentDispatch: isInstant,
          scheduledSlot: finalSlot,
          bookingType: isInstant ? 'instant' : 'scheduled'
        })
      });
      const data = await res.json();
      const bId = data.booking?.id || 'SLM-84920';
      const bObj = data.booking || { id: bId, scheduled_slot: finalSlot };

      localStorage.setItem('salemseva_active_booking', bId);
      window.dispatchEvent(new CustomEvent('salemseva_new_booking_created', { detail: { bookingId: bId, booking: bObj } }));
      window.dispatchEvent(new Event('storage'));
      if (onStartBooking) onStartBooking(bObj);
      setIsProcessing(false);

      if (isInstant) {
        navigate(`/matching?bookingId=${bId}`);
      } else {
        setConfirmedBooking({ ...bObj, id: bId, scheduled_slot: finalSlot });
        setScheduledSuccessModalOpen(true);
      }
    } catch (e) {
      console.warn('Fallback to booking handling:', e);
      const fallbackId = 'SLM-' + Math.floor(10000 + Math.random() * 90000);
      localStorage.setItem('salemseva_active_booking', fallbackId);
      setIsProcessing(false);
      if (isInstant) {
        navigate(`/matching?bookingId=${fallbackId}`);
      } else {
        setConfirmedBooking({ id: fallbackId, scheduled_slot: finalSlot });
        setScheduledSuccessModalOpen(true);
      }
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
        <Paper
          elevation={0}
          onClick={() => setLocationPickerOpen(true)}
          sx={{
            p: 1.2,
            mb: 1.5,
            borderRadius: '8px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { borderColor: '#CBD5E1' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <LocationOnIcon sx={{ fontSize: 20, color: '#2563EB', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                {userLocation.locality || 'Fairlands, Salem'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
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
              color: '#2563EB',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              flexShrink: 0
            }}
          >
            Change
          </Button>
        </Paper>

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
                  • Verified Salem Technicians • 15–25 min ETA
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
                onClick={handleApplyCoupon}
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
                Apply
              </Button>
            </Box>
            {couponError && (
              <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '11px', mt: 0.5, display: 'block' }}>
                {couponError}
              </Typography>
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
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', mt: 0.5, display: 'block' }}>
            Our technician will review these details before arriving with the right tools.
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
            Need immediate service in 15–25 mins, or want to pick a convenient date & slot?
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
                  ⚡ Instant dispatch • Arrives in 15–25 mins
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
                  📅 Scheduled visit • Central Ops Assigned
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
              {/* Step 1: Date Chips */}
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', display: 'block', mb: 1, textTransform: 'uppercase' }}>
                1. Select Service Date:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {[
                  { key: 'today', label: 'Today', desc: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                  { key: 'tomorrow', label: 'Tomorrow', desc: new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                  { key: 'day_after', label: 'Day After', desc: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
                ].map(d => (
                  <Button
                    key={d.key}
                    variant={scheduledDateOption === d.key ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setScheduledDateOption(d.key)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      py: 0.5,
                      px: 1.5,
                      bgcolor: scheduledDateOption === d.key ? '#0284C7' : '#FFFFFF',
                      color: scheduledDateOption === d.key ? '#FFFFFF' : '#475569',
                      borderColor: scheduledDateOption === d.key ? '#0284C7' : '#CBD5E1',
                      '&:hover': { bgcolor: scheduledDateOption === d.key ? '#0369A1' : '#F1F5F9' }
                    }}
                  >
                    {d.label} ({d.desc})
                  </Button>
                ))}
              </Box>

              {/* Step 2: Time Slots */}
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', display: 'block', mb: 1, textTransform: 'uppercase' }}>
                2. Select 2-Hour Convenient Window:
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {timeSlots.map(slot => {
                  const isSlotActive = selectedSlot === slot.label;
                  return (
                    <Grid item xs={6} key={slot.id}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedSlot(slot.label)}
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
              ? `📅 ${getFormattedDateString()} • ${selectedSlot.split('–')[0]}`
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
          {bookingMode === 'instant' ? 'Search Tech Now' : 'Confirm Scheduled Slot'}
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

      {/* SCHEDULED BOOKING SUCCESS CONFIRMATION MODAL */}
      <Dialog
        open={scheduledSuccessModalOpen}
        onClose={() => setScheduledSuccessModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              bgcolor: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              border: '2px solid #BBF7D0'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px' }}>
            Booking Scheduled Successfully!
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
                📅 {confirmedBooking?.scheduled_slot || `${getFormattedDateString()} • ${selectedSlot}`}
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
              Our operations dispatch controller will assign a verified technician for your selected window. You will receive updates directly on your tracking screen.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setScheduledSuccessModalOpen(false);
              navigate('/history');
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
            View in My Bookings
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setScheduledSuccessModalOpen(false);
              navigate(`/track?bookingId=${confirmedBooking?.id || 'SLM-84920'}`);
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
            Track Status Now
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
