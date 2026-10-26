import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const TECH_RESCHEDULE_TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

const TECH_PROPOSE_REASONS = [
  'Current customer job taking longer than expected',
  'Severe traffic congestion / delay in Salem',
  'Specialist spare part acquisition in market',
  'Appliance requires advanced diagnostic tools',
  'Customer requested slightly later timing on phone'
];

const TECH_HANDOVER_REASONS = [
  'Vehicle breakdown or transit puncture in Salem',
  'Personal or medical emergency',
  'Job requires two-person team or high ladder',
  'Customer unreachable / site locked',
  'Specialist skill mismatch for this appliance'
];

export default function PartnerJobReschedulePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!booking);
  const [mode, setMode] = useState('propose_slot'); // 'propose_slot' | 'request_handover'
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TECH_RESCHEDULE_TIME_SLOTS[0]);
  const [selectedReason, setSelectedReason] = useState(TECH_PROPOSE_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/partner');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!booking && bookingId) {
      setLoading(true);
      fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
        .then((r) => r.json())
        .then((d) => {
          if (!isMounted) return;
          if (d.success && d.booking) {
            setBooking(d.booking);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, booking]);

  // Generate 4 calendar days starting today
  const upcomingDays = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthLabel: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === 'propose_slot') {
        const proposedDay = upcomingDays[selectedDayIndex];
        const proposedString = `${proposedDay.dayLabel} (${proposedDay.dayNum} ${proposedDay.monthLabel}), ${selectedTimeSlot}`;

        await fetch(`${API_V1_URL}/bookings/${bookingId}/propose-slot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposedSlot: proposedString,
            reason: selectedReason,
            proposedDateIso: proposedDay.iso
          })
        });

        toast.success('Proposed slot sent to customer for confirmation!');
      } else {
        await fetch(`${API_V1_URL}/bookings/${bookingId}/handover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: selectedReason,
            handoverToOps: true
          })
        });

        toast.success('Handover submitted to Salem Operations Desk!');
      }

      setTimeout(() => {
        handleDismiss();
      }, 1000);
    } catch {
      toast.error('Could not submit request. Please try again or call dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <IconButton
          onClick={handleDismiss}
          aria-label="Go back"
          sx={{
            color: '#0F172A',
            bgcolor: '#F1F5F9',
            '&:hover': { bgcolor: '#E2E8F0' },
            width: 40,
            height: 40,
            borderRadius: '10px'
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Reschedule / Handover • பணி மாற்றம்
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{bookingId || booking?.id} • {booking?.customer_name || 'Customer'}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7',
            flexShrink: 0
          }}
        >
          <Calendar size={20} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {/* Mode Selector Tabs */}
        <Box sx={{ display: 'flex', gap: 1, p: 0.6, bgcolor: '#0F172A', borderRadius: '12px', mb: 3 }}>
          <Button
            fullWidth
            onClick={() => {
              setMode('propose_slot');
              setSelectedReason(TECH_PROPOSE_REASONS[0]);
            }}
            sx={{
              borderRadius: '10px',
              py: 1,
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'none',
              bgcolor: mode === 'propose_slot' ? '#0284C7' : 'transparent',
              color: mode === 'propose_slot' ? '#FFFFFF' : '#94A3B8',
              '&:hover': { bgcolor: mode === 'propose_slot' ? '#0369A1' : '#1E293B' }
            }}
          >
            Propose New Slot to Customer
          </Button>

          <Button
            fullWidth
            onClick={() => {
              setMode('request_handover');
              setSelectedReason(TECH_HANDOVER_REASONS[0]);
            }}
            sx={{
              borderRadius: '10px',
              py: 1,
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'none',
              bgcolor: mode === 'request_handover' ? '#DC2626' : 'transparent',
              color: mode === 'request_handover' ? '#FFFFFF' : '#94A3B8',
              '&:hover': { bgcolor: mode === 'request_handover' ? '#B91C1C' : '#1E293B' }
            }}
          >
            Emergency Handover to Ops
          </Button>
        </Box>

        {mode === 'propose_slot' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: '#F0F9FF',
                border: '1px solid #BAE6FD'
              }}
            >
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#0369A1', mb: 0.3 }}>
                Proposing Revised Time Window
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#0C4A6E', lineHeight: 1.45 }}>
                The customer will receive an alert on their tracking screen to approve your revised slot. You remain assigned to this booking.
              </Typography>
            </Paper>

            {/* Step 1: Date selection */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
                1. Select proposed date
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.2 }}>
                {upcomingDays.map((d, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <Box
                      key={d.iso}
                      onClick={() => setSelectedDayIndex(idx)}
                      sx={{
                        flex: 1,
                        py: 1.2,
                        px: 0.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#0284C7' : '#64748B' }}>
                        {d.dayLabel}
                      </Typography>
                      <Typography sx={{ fontSize: '18px', fontWeight: 900, color: isSelected ? '#0369A1' : '#0F172A', my: 0.2 }}>
                        {d.dayNum}
                      </Typography>
                      <Typography sx={{ fontSize: '10.5px', color: isSelected ? '#0284C7' : '#94A3B8' }}>
                        {d.monthLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Step 2: Time Window */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
                2. Select time window
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {TECH_RESCHEDULE_TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <Button
                      key={slot}
                      onClick={() => setSelectedTimeSlot(slot)}
                      variant={isSelected ? 'contained' : 'outlined'}
                      sx={{
                        py: 1.4,
                        borderRadius: '10px',
                        borderColor: isSelected ? '#0284C7' : '#CBD5E1',
                        bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        fontWeight: 700,
                        fontSize: '12px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: isSelected ? '#0369A1' : '#F8FAFC' }
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* Step 3: Reason */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
                3. Reason for delay or time revision
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {TECH_PROPOSE_REASONS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <Chip
                      key={r}
                      label={r}
                      onClick={() => setSelectedReason(r)}
                      clickable
                      sx={{
                        py: 2.2,
                        borderRadius: '10px',
                        justifyContent: 'flex-start',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12.5px',
                        bgcolor: isSelected ? '#0F172A' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                        '&:hover': { bgcolor: isSelected ? '#1E293B' : '#F1F5F9' }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 1, pb: 4 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <Send size={18} />}
                sx={{
                  minHeight: 50,
                  borderRadius: '12px',
                  bgcolor: '#0284C7',
                  fontWeight: 800,
                  fontSize: '15px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                {isSubmitting ? 'Sending proposal...' : 'Send proposed slot to customer'}
              </Button>
            </Box>
          </Box>
        ) : (
          /* EMERGENCY HANDOVER MODE */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AlertTriangle size={18} color="#DC2626" />
                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>
                  Central Operations Immediate Handover
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.45 }}>
                If you can no longer attend this appointment due to an emergency or breakdown, Shazu One Central Ops will immediately reassign this customer to another verified technician in your trade without service interruption.
              </Typography>
            </Paper>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
                Select handover reason
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {TECH_HANDOVER_REASONS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <Chip
                      key={r}
                      label={r}
                      onClick={() => setSelectedReason(r)}
                      clickable
                      sx={{
                        py: 2.2,
                        borderRadius: '10px',
                        justifyContent: 'flex-start',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12.5px',
                        bgcolor: isSelected ? '#DC2626' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1px solid #DC2626' : '1px solid #E2E8F0',
                        '&:hover': { bgcolor: isSelected ? '#B91C1C' : '#F1F5F9' }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 1, pb: 4 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <AlertTriangle size={18} />}
                sx={{
                  minHeight: 50,
                  borderRadius: '12px',
                  bgcolor: '#DC2626',
                  fontWeight: 800,
                  fontSize: '15px',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                  '&:hover': { bgcolor: '#B91C1C' }
                }}
              >
                {isSubmitting ? 'Transferring job...' : 'Confirm handover to Central Ops'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
