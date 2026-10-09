import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Radio,
  Alert,
  LinearProgress,
  TextField,
  Avatar
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BoltIcon from '@mui/icons-material/Bolt';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import HeadsetIcon from '@mui/icons-material/Headset';
import ShieldIcon from '@mui/icons-material/Shield';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PhoneIcon from '@mui/icons-material/Phone';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeIcon from '@mui/icons-material/QrCode';
import TimerIcon from '@mui/icons-material/Timer';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import ProcessingBackdrop from '../../components/ProcessingBackdrop';

export default function MatchingPage({ onOpenVoiceAgent }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');
  const storedBookingId = localStorage.getItem('salemseva_active_booking');
  const bookingId = urlBookingId || storedBookingId || 'SLM-84920';

  const [loading, setLoading] = useState(true);
  const [trackData, setTrackData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPayingFee, setIsPayingFee] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState('upi');

  // Matching Flow States
  // 'dispatching' -> 'accepted' (awaiting Part 1 ₹99 payment within 2m) -> 'payment_timeout' / 'schedule_later'
  const [matchingState, setMatchingState] = useState('dispatching');
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [paymentSecondsRemaining, setPaymentSecondsRemaining] = useState(120);
  const [techIndex, setTechIndex] = useState(0);

  // Selected schedule slot
  const [selectedSlot, setSelectedSlot] = useState('priority_12h');
  const [customSlotTime, setCustomSlotTime] = useState('');

  // Multi-Trade Verified Technicians Directory for Salem Zones
  const SERVICE_TECH_MAP = {
    ac: [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'K. Ramesh',
        trade: 'AC Master Specialist',
        rating: 4.92,
        jobsCount: 428,
        distance: '1.2 km away',
        locality: 'Fairlands, Salem',
        eta: '15 mins',
        phone: '+91 94432 88901'
      },
      {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        name: 'Murugan S.',
        trade: 'HVAC & Refrigeration Expert',
        rating: 4.88,
        jobsCount: 312,
        distance: '2.4 km away',
        locality: 'Hasthampatti, Salem',
        eta: '22 mins',
        phone: '+91 98421 66720'
      }
    ],
    electrician: [
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        name: 'S. Senthil Kumar',
        trade: 'Senior Certified Electrician',
        rating: 4.95,
        jobsCount: 530,
        distance: '1.4 km away',
        locality: 'Suramangalam, Salem',
        eta: '12 mins',
        phone: '+91 98421 44551'
      },
      {
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        name: 'M. Karthik',
        trade: 'Wiring & MCB Safety Specialist',
        rating: 4.89,
        jobsCount: 340,
        distance: '2.8 km away',
        locality: 'Ammapet, Salem',
        eta: '20 mins',
        phone: '+91 94431 88220'
      }
    ],
    plumber: [
      {
        id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        name: 'P. Velumani',
        trade: 'Master Sanitary & Motor Plumber',
        rating: 4.94,
        jobsCount: 610,
        distance: '1.1 km away',
        locality: 'Shevapet, Salem',
        eta: '10 mins',
        phone: '+91 97890 33442'
      },
      {
        id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        name: 'R. Selvam',
        trade: 'Concealed Pipe & Drainage Expert',
        rating: 4.87,
        jobsCount: 285,
        distance: '2.6 km away',
        locality: 'Gugai, Salem',
        eta: '18 mins',
        phone: '+91 98425 11993'
      }
    ],
    cleaning: [
      {
        id: 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
        name: 'A. Manikandan',
        trade: 'Deep Home Sanitization Lead',
        rating: 4.91,
        jobsCount: 410,
        distance: '1.5 km away',
        locality: 'Fairlands, Salem',
        eta: '14 mins',
        phone: '+91 94420 77884'
      },
      {
        id: 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
        name: 'D. Priya & Team',
        trade: 'Elite Deep Cleaning & Descaling',
        rating: 4.96,
        jobsCount: 520,
        distance: '2.1 km away',
        locality: 'Hasthampatti, Salem',
        eta: '20 mins',
        phone: '+91 98432 66115'
      }
    ]
  };

  const currentServiceId = trackData?.booking?.service_id || searchParams.get('serviceId') || 'ac';
  const technicianCandidates = SERVICE_TECH_MAP[currentServiceId] || SERVICE_TECH_MAP.ac;

  const currentTech = (trackData?.technician && trackData.technician.name) ? {
    id: trackData.technician.id,
    name: trackData.technician.name,
    trade: `${trackData.technician.primaryTrade?.toUpperCase() || 'SERVICE'} Specialist`,
    rating: trackData.technician.rating || 4.9,
    jobsCount: trackData.technician.jobsCompleted || 350,
    distance: '1.3 km away',
    locality: 'Fairlands, Salem',
    eta: trackData.technician.eta || '12 mins',
    phone: trackData.technician.phone
  } : (technicianCandidates[techIndex] || technicianCandidates[0]);


  useEffect(() => {
    if (bookingId) {
      localStorage.setItem('salemseva_active_booking', bookingId);
    }
    let isMounted = true;
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/track`);
        const data = await res.json();
        if (data.success && isMounted) {
          setTrackData(data);
          const currentStatus = data.booking?.status;
          if (['en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(currentStatus)) {
            // Already paid inspection fee and technician is actively dispatched
            setTimeout(() => {
              if (isMounted) navigate(`/track?bookingId=${bookingId}`);
            }, 300);
          } else if (currentStatus === 'accepted') {
            // Technician accepted -> Prompt user for Part 1 (₹99) payment within 2 mins
            setMatchingState('accepted');
          } else if (data.booking?.scheduled_slot) {
            setSelectedSlot(data.booking.scheduled_slot);
          }
        }
      } catch (e) {
        console.warn('Booking track fetch:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookingDetails();
    const pollInterval = setInterval(fetchBookingDetails, 1000); // Poll every 1s for instant dispatch sync

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [bookingId, navigate]);

  // 1. Acceptance countdown timer (during search)
  useEffect(() => {
    if (matchingState !== 'dispatching') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // If first tech times out, cycle to next or prompt schedule
          if (techIndex < technicianCandidates.length - 1) {
            setTechIndex((curr) => curr + 1);
            return 90; // 90s for next tech
          } else {
            setMatchingState('schedule_later');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchingState, techIndex, technicianCandidates.length]);

  // 2. Part 1 Payment countdown timer (2 mins once technician accepts)
  useEffect(() => {
    if (matchingState !== 'accepted') return;

    const paymentTimer = setInterval(() => {
      setPaymentSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(paymentTimer);
          setMatchingState('payment_timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(paymentTimer);
  }, [matchingState]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSimulateAccept = async () => {
    setIsProcessing(true);
    try {
      await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          technicianId: currentTech.id
        })
      });
      setMatchingState('accepted');
      setPaymentSecondsRemaining(120);
    } catch (err) {
      console.warn('Accept fallback:', err);
      setMatchingState('accepted');
      setPaymentSecondsRemaining(120);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayInspectionFee = async () => {
    setIsPayingFee(true);
    try {
      // 1. Create Razorpay order on backend
      let orderId = `order_visit_${Date.now()}`;
      let keyId = 'rzp_test_Tjo8HdYyapYlnO';

      try {
        const orderRes = await fetch('http://localhost:8080/api/v1/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingId,
            amount: 99.00,
            currency: 'INR',
            isDiagnosticOnly: true
          })
        });
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          orderId = orderData.order.id;
          if (orderData.keyId) keyId = orderData.keyId;
        }
      } catch (e) {
        console.warn('Order create direct note:', e);
      }

      // 2. Open Official Razorpay Checkout if window.Razorpay exists and user selected non-wallet mode
      if (window.Razorpay && selectedPayMethod !== 'wallet') {
        const options = {
          key: keyId,
          amount: 9900,
          currency: 'INR',
          name: 'SalemSeva (சேலம் சேவை)',
          description: 'Part 1: Doorstep Inspection & Travel Advance (₹99)',
          order_id: (orderId.startsWith('order_') && orderId.length > 20) ? orderId : undefined,
          handler: async function (response) {
            await finalizePayment(
              response.razorpay_payment_id || `pay_${Date.now()}`,
              response.razorpay_order_id || orderId,
              response.razorpay_signature || ''
            );
          },
          prefill: {
            name: 'Vimal Raj',
            email: 'customer@salemseva.in',
            contact: '+919842711234'
          },
          theme: {
            color: '#2563EB'
          },
          modal: {
            ondismiss: function () {
              setIsPayingFee(false);
            }
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            console.error('Razorpay payment failed:', response.error);
            setIsPayingFee(false);
          });
          rzp.open();
          return; // Modal takes over
        } catch (rzpErr) {
          console.warn('Razorpay modal open fallback:', rzpErr);
        }
      }

      // Direct fallback / 1-Click Escrow Wallet verification
      await finalizePayment(`pay_rzp_${Date.now()}`, orderId, '');

    } catch (err) {
      console.error('Payment error:', err);
      setIsPayingFee(false);
    }
  };

  const finalizePayment = async (paymentId, orderId, signature) => {
    try {
      // 1. Record Part 1 Payment in Neon Payments Escrow Ledger
      await fetch(`http://localhost:8080/api/v1/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: 99.00,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          techId: currentTech.id
        })
      });

      // 2. Advance booking status to 'en_route' (Technician unlocked to start ride)
      await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'en_route',
          technicianId: currentTech.id
        })
      });

      // 3. Transition directly to live GPS tracking
      navigate(`/track?bookingId=${bookingId}`);
    } catch (e) {
      console.error('Finalize payment fallback:', e);
      navigate(`/track?bookingId=${bookingId}`);
    } finally {
      setIsPayingFee(false);
    }
  };

  const handleSearchNextTech = () => {
    if (techIndex < technicianCandidates.length - 1) {
      setTechIndex((curr) => curr + 1);
      setSecondsRemaining(90);
    } else {
      setMatchingState('schedule_later');
    }
  };

  const handleConfirmSchedule = async () => {
    setIsProcessing(true);
    try {
      await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledSlot: selectedSlot,
          customTime: customSlotTime || null
        })
      });
    } catch (e) {
      console.warn('Reschedule fallback:', e);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        navigate(`/track?bookingId=${bookingId}`);
      }, 700);
    }
  };

  const handleDirectCancel = async () => {
    setIsCancelling(true);
    try {
      await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Cancelled by customer during search',
          cancelledBy: 'customer'
        })
      });
    } catch (err) {
      console.warn('Cancel request fallback:', err);
    } finally {
      localStorage.removeItem('salemseva_active_booking');
      setIsCancelling(false);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#2563EB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>

        {/* ================= PIPELINE PROGRESS BAR ================= */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>
              Service pipeline: Booking #{bookingId}
            </Typography>
            <Chip
              label={
                matchingState === 'dispatching'
                  ? `Finding partner (${formatTimer(secondsRemaining)})`
                  : matchingState === 'accepted'
                  ? `Pay Part 1 ₹99 (${formatTimer(paymentSecondsRemaining)})`
                  : matchingState === 'payment_timeout'
                  ? 'Payment timed out'
                  : 'Ops schedule'
              }
              size="small"
              sx={{
                bgcolor: matchingState === 'accepted' ? '#FEF3C7' : matchingState === 'payment_timeout' ? '#FEE2E2' : '#EFF6FF',
                color: matchingState === 'accepted' ? '#B45309' : matchingState === 'payment_timeout' ? '#DC2626' : '#1D4ED8',
                fontWeight: 700,
                fontSize: '10.5px',
                borderRadius: '4px'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            {['1. Request', '2. Partner Match', '3. Part 1 (₹99)', '4. En route', '5. Part 2 Work'].map((stepName, i) => {
              const active = i <= (matchingState === 'accepted' ? 2 : 1);
              return (
                <Box key={stepName} sx={{ flex: 1, height: 4, borderRadius: 1, bgcolor: active ? '#2563EB' : '#E2E8F0' }} />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '10px' }}>
              1. Placed
            </Typography>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '10px' }}>
              2. Accepted
            </Typography>
            <Typography variant="caption" sx={{ color: matchingState === 'accepted' ? '#D97706' : '#94A3B8', fontWeight: matchingState === 'accepted' ? 700 : 500, fontSize: '10px' }}>
              3. Pay ₹99
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
              4. Live Route
            </Typography>
          </Box>
        </Paper>

        {/* ========================================================================= */}
        {/* STATE 1: DISPATCHING / 2-MINUTE ACCEPTANCE COUNTDOWN */}
        {/* ========================================================================= */}
        {matchingState === 'dispatching' && (
          <Box>
            {/* Live Dispatch Status Card */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} thickness={5} sx={{ color: '#2563EB' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                    Request dispatched to nearby partner
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2563EB', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTimer(secondsRemaining)}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={(secondsRemaining / 120) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#F1F5F9',
                  mb: 2,
                  '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' }
                }}
              />

              {/* Technician Candidate Preview */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  mb: 1.5
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#2563EB', width: 42, height: 42, borderRadius: '6px' }}>
                    <EngineeringIcon sx={{ fontSize: 24, color: '#FFF' }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                        {currentTech.name}
                      </Typography>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#16A34A !important', fontSize: 12 }} />}
                        label="DigiLocker verified"
                        size="small"
                        sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 600, fontSize: '9.5px', height: 18 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                      {currentTech.trade} • {currentTech.jobsCount} jobs completed in Salem
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                        <StarIcon sx={{ color: '#D97706', fontSize: 13 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11px' }}>
                          {currentTech.rating}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                        • {currentTech.distance} ({currentTech.locality})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, fontSize: '11px' }}>
                Technician has 2 minutes to confirm availability. If busy, we will immediately cycle to the next verified partner in your Salem zone.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  mb: 1.5
                }}
              >
                <CircularProgress size={20} thickness={5} sx={{ color: '#2563EB', flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E40AF', fontSize: '12.5px', lineHeight: 1.2 }}>
                    Awaiting {currentTech.name}'s acceptance...
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontSize: '11px', display: 'block', mt: 0.2 }}>
                    As soon as technician accepts on their partner app, you will automatically transition to live GPS tracking.
                  </Typography>
                </Box>
              </Paper>

              {/* Optional switch & cancel buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSearchNextTech}
                  startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    borderRadius: '6px',
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '12px',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                  }}
                >
                  Request another technician ({techIndex + 1}/{technicianCandidates.length})
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  disabled={isCancelling}
                  onClick={handleDirectCancel}
                  startIcon={isCancelling ? <CircularProgress size={16} color="inherit" /> : <CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: '#DC2626',
                    borderRadius: '6px',
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'none',
                    bgcolor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FECACA' }
                  }}
                >
                  {isCancelling ? 'Cancelling search...' : 'Cancel booking request'}
                </Button>
              </Box>
            </Card>


            {/* Switch to Schedule Option */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                    Prefer a scheduled inspection instead?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                    Our team will guarantee availability for your chosen time slot.
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                variant="text"
                onClick={() => setMatchingState('schedule_later')}
                sx={{ color: '#2563EB', fontWeight: 600, fontSize: '12px', textTransform: 'none' }}
              >
                Schedule slot
              </Button>
            </Paper>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: SCHEDULE FOR LATER / CENTRAL OPS CONFIRMATION */}
        {/* ========================================================================= */}
        {matchingState === 'schedule_later' && (
          <Box>
            {/* Ops Guarantee Card */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShieldIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>
                  Salem Central Ops Availability Guarantee
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2, borderRadius: '6px', fontSize: '12px', bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                Our operations team will confirm technician availability and assign the closest verified expert for your selected slot.
              </Alert>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', mb: 1 }}>
                Choose your preferred inspection time window:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {[
                  {
                    id: 'priority_12h',
                    title: 'Priority 12-hour auto-assign',
                    subtitle: 'Assign first available certified technician who signs on within 12h',
                    icon: <BoltIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  },
                  {
                    id: 'morning_9_11',
                    title: 'Tomorrow morning (09:00 AM - 11:00 AM)',
                    subtitle: 'Confirmed morning doorstep inspection',
                    icon: <WbSunnyIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  },
                  {
                    id: 'afternoon_2_4',
                    title: 'Tomorrow afternoon (02:00 PM - 04:00 PM)',
                    subtitle: 'Convenient afternoon doorstep visit',
                    icon: <ScheduleIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  },
                  {
                    id: 'evening_5_7',
                    title: 'Tomorrow evening (05:00 PM - 07:00 PM)',
                    subtitle: 'After-work doorstep inspection slot',
                    icon: <BedtimeIcon sx={{ color: '#4F46E5', fontSize: 18 }} />
                  }
                ].map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <Paper
                      key={slot.id}
                      elevation={0}
                      onClick={() => setSelectedSlot(slot.id)}
                      sx={{
                        p: 1.2,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedSlot(slot.id)}
                        size="small"
                        sx={{ p: 0.2, '&.Mui-checked': { color: '#2563EB' } }}
                      />
                      {slot.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 600 : 500, color: '#0F172A', fontSize: '12.5px' }}>
                          {slot.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                          {slot.subtitle}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {/* Custom Date/Time Input */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '11px' }}>
                  Or specify specific date & time note:
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. Saturday afternoon after 3 PM"
                  value={customSlotTime}
                  onChange={(e) => setCustomSlotTime(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '12px',
                      borderRadius: '6px',
                      bgcolor: '#F8FAFC'
                    }
                  }}
                />
              </Box>

              {/* Ops Helpline */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#F8FAFC', p: 1, borderRadius: '6px', border: '1px solid #E2E8F0', mb: 2 }}>
                <HeadsetIcon sx={{ color: '#2563EB', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px' }}>
                  Salem Ops Desk: <strong>0427-2448888</strong> • Mon-Sun 8 AM - 9 PM
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmSchedule}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  py: 1.1,
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' }
                }}
              >
                Confirm schedule & track with Central Ops
              </Button>
            </Card>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: TECHNICIAN ACCEPTED -> PART 1 (₹99 VISIT & TRAVEL FEE) PAYMENT */}
        {/* ========================================================================= */}
        {matchingState === 'accepted' && (
          <Box>
            {/* Urgent Payment Countdown Bar */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                borderRadius: '12px',
                p: 1.5,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon sx={{ color: '#D97706', fontSize: 22 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '13px' }}>
                    Pay within {formatTimer(paymentSecondsRemaining)} to confirm dispatch
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B45309', fontSize: '11px', display: 'block' }}>
                    Technician is waiting to start ride to your Salem doorstep
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={formatTimer(paymentSecondsRemaining)}
                size="small"
                sx={{
                  bgcolor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  borderRadius: '6px',
                  px: 0.5
                }}
              />
            </Paper>

            {/* Assigned Partner Profile Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #86EFAC',
                borderRadius: '12px',
                p: 2,
                mb: 2,
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#166534',
                      width: 48,
                      height: 48,
                      fontWeight: 800,
                      borderRadius: '10px'
                    }}
                  >
                    {currentTech.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', lineHeight: 1.2 }}>
                      {trackData?.technician?.name || currentTech.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600, fontSize: '12px' }}>
                      {currentTech.trade}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}>
                      <StarIcon sx={{ color: '#EAB308', fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '11.5px' }}>
                        {currentTech.rating}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                        • {currentTech.jobsCount} jobs • {currentTech.distance}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#16A34A !important', fontSize: 13 }} />}
                  label="DigiLocker verified"
                  size="small"
                  sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '10.5px', height: 22, borderRadius: '4px' }}
                />
              </Box>

              {/* 2-Part Transparent Payment Breakdown */}
              <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', p: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ color: '#2563EB', fontSize: 16 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                      Part 1: Doorstep Inspection & Travel Advance
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px' }}>
                    ₹99
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px', display: 'block', lineHeight: 1.45, mb: 1 }}>
                  • <strong>100% (₹99) disbursed to technician</strong> for Salem travel & fuel expenses.
                  <br />• <strong>SalemSeva charges ₹0 platform commission</strong> for inspection.
                </Typography>

                <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <InfoOutlinedIcon sx={{ color: '#64748B', fontSize: 14 }} />
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                    <strong>Part 2 (Repair Labour & Spares)</strong>: Quoted after diagnosis and paid only if you approve.
                  </Typography>
                </Box>
              </Box>

              {/* Payment Method Selector */}
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '11px' }}>
                Select Payment Mode (Escrow Protected):
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                {[
                  { id: 'upi', label: 'Instant UPI (Google Pay / PhonePe / Paytm / BHIM)', desc: 'Fastest 1-tap confirmation', icon: <QrCodeIcon sx={{ fontSize: 18, color: '#2563EB' }} /> },
                  { id: 'card', label: 'Debit / Credit Card / NetBanking', desc: 'All Indian cards supported', icon: <CreditCardIcon sx={{ fontSize: 18, color: '#0F172A' }} /> },
                  { id: 'wallet', label: 'SalemSeva Wallet / 1-Click Escrow', desc: 'Zero gateway fees', icon: <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#16A34A' }} /> }
                ].map(mode => {
                  const isSelected = selectedPayMethod === mode.id;
                  return (
                    <Paper
                      key={mode.id}
                      elevation={0}
                      onClick={() => setSelectedPayMethod(mode.id)}
                      sx={{
                        p: 1.1,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedPayMethod(mode.id)}
                        size="small"
                        sx={{ p: 0, '&.Mui-checked': { color: '#2563EB' } }}
                      />
                      {mode.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500, color: '#0F172A', fontSize: '12px' }}>
                          {mode.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10.5px' }}>
                          {mode.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {/* Action Buttons: Pay ₹99 & Start Ride or Cancel Request */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isPayingFee}
                  onClick={handlePayInspectionFee}
                  startIcon={isPayingFee ? <CircularProgress size={16} color="inherit" /> : <LockIcon sx={{ fontSize: 16 }} />}
                  endIcon={!isPayingFee && <TwoWheelerIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#16A34A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: '13.5px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                    '&:hover': { bgcolor: '#15803D' }
                  }}
                >
                  {isPayingFee ? 'Securing Escrow & Starting Ride...' : 'Pay ₹99 & Start Tech Ride (Live GPS)'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  disabled={isCancelling || isPayingFee}
                  onClick={handleDirectCancel}
                  startIcon={isCancelling ? <CircularProgress size={16} color="inherit" /> : <CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: '#DC2626',
                    borderRadius: '6px',
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'none',
                    bgcolor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FECACA' }
                  }}
                >
                  {isCancelling ? 'Cancelling search...' : 'Cancel booking request'}
                </Button>
              </Box>
            </Card>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STATE 4: PAYMENT TIMEOUT (2 MINS ELAPSED WITHOUT PAYMENT) */}
        {/* ========================================================================= */}
        {matchingState === 'payment_timeout' && (
          <Card
            elevation={0}
            sx={{
              bgcolor: '#FFFFFF',
              border: '1.5px solid #FCD34D',
              borderRadius: '12px',
              p: 3,
              textAlign: 'center',
              mb: 2,
              boxShadow: '0 4px 20px rgba(217, 119, 6, 0.1)'
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <TimerIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', mb: 0.5 }}>
              Payment Window Expired (2 mins)
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', mb: 2.5, lineHeight: 1.45 }}>
              The ₹99 inspection advance was not completed in time, so {currentTech.name}'s provisional assignment was released to other Salem customers.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setMatchingState('dispatching');
                  setSecondsRemaining(120);
                }}
                startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  py: 1.1,
                  fontWeight: 700,
                  fontSize: '13px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' }
                }}
              >
                Search Nearby Technicians Again
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setMatchingState('schedule_later')}
                startIcon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  borderRadius: '8px',
                  py: 1,
                  fontWeight: 600,
                  fontSize: '12.5px',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                }}
              >
                Schedule a Specific Time Slot
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={handleDirectCancel}
                sx={{
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'none'
                }}
              >
                Cancel request & return home
              </Button>
            </Box>
          </Card>
        )}

      </Container>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Syncing booking with Salem Central Ops..."
        subtitle="Real-time dispatch pipeline updating state"
        badge="Ops Dispatch"
      />

      {/* Bottom Navigation */}

      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#2563EB', fontWeight: 600 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Voice assist" icon={<MicIcon sx={{ fontSize: 20 }} />} onClick={onOpenVoiceAgent} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
