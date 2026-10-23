import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { ArrowLeft, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const DEFAULT_TIME_SLOTS = [
  { id: 'morning_1', label: '09:00 AM - 11:00 AM', period: 'Morning' },
  { id: 'morning_2', label: '11:00 AM - 01:00 PM', period: 'Morning' },
  { id: 'afternoon_1', label: '02:00 PM - 04:00 PM', period: 'Afternoon' },
  { id: 'evening_1', label: '04:00 PM - 06:00 PM', period: 'Evening' },
  { id: 'evening_2', label: '06:00 PM - 08:00 PM', period: 'Evening' }
];

const RESCHEDULE_REASONS = [
  'Not available at doorstep at this time',
  'Emergency travel out of Salem',
  'Prefer earlier morning slot',
  'Appliance power / water supply issue today',
  'Other personal schedule conflict'
];

export default function BookingReschedulePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [bookingInfo, setBookingInfo] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_TIME_SLOTS[0].label);
  const [selectedReason, setSelectedReason] = useState(RESCHEDULE_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generate 7 days starting today
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const isoString = d.toISOString().split('T')[0];
    return { index: i, dayName, formattedDate, isoString };
  });

  // Load booking details
  useEffect(() => {
    let isMounted = true;
    if (!bookingId) return;

    fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.success && d.booking) {
          setBookingInfo(d.booking);
        }
      })
      .catch((err) => console.warn('Failed to load booking info:', err));

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const targetDate = availableDates[selectedDayIndex];
    const newSlotString = `${targetDate.dayName}, ${targetDate.formattedDate} (${selectedSlot})`;

    try {
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newSlot: newSlotString,
          newDate: targetDate.isoString,
          reason: selectedReason
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Appointment rescheduled successfully');
        navigate(`/track?bookingId=${bookingId}`, { replace: true });
      } else {
        setErrorMessage(data.error || 'Unable to reschedule booking. Please try another slot.');
      }
    } catch (err) {
      console.error('Reschedule network error:', err);
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/track?bookingId=${bookingId}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Back"
            sx={{
              color: '#0F172A',
              bgcolor: '#F1F5F9',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#E2E8F0' }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
              Reschedule Appointment
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '11px' }}>
              Booking #{bookingId} • Zero penalty
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Body */}
      <Box
        sx={{
          flex: 1,
          maxWidth: '600px',
          width: '100%',
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {/* Zero Penalty Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            gap: 1.5,
            alignItems: 'center'
          }}
        >
          <ShieldCheck size={20} color="#0A66C2" style={{ flexShrink: 0 }} />
          <Typography sx={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
            Salem Instant Guarantee: Reschedule at any point prior to doorstep arrival with 100% zero cancellation or penalty charges.
          </Typography>
        </Paper>

        {/* 1. Date Selection Carousel */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Calendar size={18} color="#0A66C2" />
            <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
              1. Choose New Date
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {availableDates.map((item) => {
              const isSelected = selectedDayIndex === item.index;
              return (
                <Box
                  key={item.index}
                  onClick={() => setSelectedDayIndex(item.index)}
                  sx={{
                    minWidth: 72,
                    p: 1.25,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0A66C2' : '1px solid #E2E8F0',
                    bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isSelected ? '#0A66C2' : '#64748B',
                      mb: 0.25
                    }}
                  >
                    {item.dayName}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isSelected ? '#0A66C2' : '#0F172A'
                    }}
                  >
                    {item.formattedDate}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* 2. Time Slot Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Clock size={18} color="#0A66C2" />
            <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
              2. Select Arrival Time Window
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.label;
              return (
                <Box
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.label)}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0A66C2' : '1px solid #E2E8F0',
                    bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                      {slot.label}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                      {slot.period} Service Slot
                    </Typography>
                  </Box>
                  {isSelected && <CheckCircle2 size={18} color="#0A66C2" />}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* 3. Reason for Rescheduling */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', mb: 1.5 }}>
            3. Reason for Rescheduling
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {RESCHEDULE_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <Box
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  sx={{
                    p: 1.25,
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #0A66C2' : '1px solid #E2E8F0',
                    bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#0A66C2' : '#334155'
                    }}
                  >
                    {reason}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        )}

        {/* Action Button */}
        <Box sx={{ pt: 1, pb: 4 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            onClick={handleConfirm}
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFFFFF',
              borderRadius: '12px',
              py: 1.5,
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#084E96' },
              '&.Mui-disabled': { bgcolor: '#93C5FD', color: '#FFFFFF' }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
            ) : (
              'Confirm New Appointment'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
