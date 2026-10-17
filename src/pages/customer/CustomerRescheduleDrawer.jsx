import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';

export default function CustomerRescheduleDrawer({
  open,
  onClose,
  rescheduleDates = [],
  selectedDayIndex = 0,
  onSelectDayIndex,
  timeSlots = [],
  selectedTimeSlot,
  onSelectTimeSlot,
  reasons = [],
  selectedReason,
  onSelectReason,
  onConfirm,
  loading = false,
  currentBooking
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : '520px',
          maxHeight: isMobile ? '90vh' : '100vh',
          height: isMobile ? 'auto' : '100%',
          borderTopLeftRadius: isMobile ? '20px' : 0,
          borderTopRightRadius: isMobile ? '20px' : 0,
          borderLeft: isMobile ? 'none' : '1px solid #E2E8F0',
          borderTop: isMobile ? '1px solid #E2E8F0' : 'none',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)'
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
          bgcolor: '#F8FAFC'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BAE6FD'
            }}
          >
            <EventIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', lineHeight: 1.2 }}>
              Reschedule Appointment
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
              Select a new date and time window with zero penalty
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close reschedule drawer"
          sx={{
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box
        sx={{
          p: 3,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {/* Booking Context Pill */}
        {currentBooking && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                CURRENT BOOKING #{currentBooking.id}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {currentBooking.service_name || currentBooking.service_id?.toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                CURRENT TIME SLOT
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284C7' }}>
                {currentBooking.scheduled_slot || 'Standard Dispatch'}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Escrow Guarantee Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            bgcolor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px'
          }}
        >
          <ShieldIcon sx={{ color: '#166534', fontSize: 22, mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '13px' }}>
              100% Escrow Protection: Zero Reschedule Fee
            </Typography>
            <Typography variant="caption" sx={{ color: '#15803D', fontSize: '12px', display: 'block', mt: 0.3 }}>
              Your inspection visit fee remains safely reserved in escrow. No additional charges or cancellation deductions apply.
            </Typography>
          </Box>
        </Box>

        {/* Step 1: Date Ribbon */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>
              STEP 1: SELECT NEW SERVICE DATE
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>
              14-Day Calendar Window
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.2,
              overflowX: 'auto',
              flexShrink: 0,
              width: '100%',
              minHeight: '88px',
              py: 0.5,
              pb: 1.5,
              '::-webkit-scrollbar': { height: '6px' },
              '::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
            }}
          >
            {rescheduleDates.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <Paper
                  key={d.iso}
                  elevation={0}
                  onClick={() => onSelectDayIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDayIndex(idx);
                    }
                  }}
                  sx={{
                    flexShrink: 0,
                    width: 78,
                    minWidth: 78,
                    height: 80,
                    minHeight: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                    '&:hover': {
                      borderColor: '#0284C7',
                      bgcolor: isSelected ? '#0284C7' : '#F0F9FF'
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      fontSize: '11px',
                      color: isSelected ? '#E0F2FE' : '#64748B',
                      display: 'block',
                      lineHeight: 1.2
                    }}
                  >
                    {d.dayName}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 900,
                      fontSize: '20px',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      my: 0.2,
                      lineHeight: 1.2
                    }}
                  >
                    {d.dayNumber}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isSelected ? '#E0F2FE' : '#94A3B8',
                      display: 'block',
                      lineHeight: 1.2
                    }}
                  >
                    {d.monthName}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* Step 2: Time Slot Selector */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1.2, letterSpacing: '0.04em' }}>
            STEP 2: CHOOSE PREFERRED TIME WINDOW
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
            {timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot;
              return (
                <Button
                  key={slot}
                  variant={isSelected ? 'contained' : 'outlined'}
                  size="medium"
                  onClick={() => onSelectTimeSlot(slot)}
                  startIcon={isSelected ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ScheduleIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    py: 1.4,
                    px: 1.5,
                    borderRadius: '10px',
                    borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                    bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    borderWidth: isSelected ? 2 : 1,
                    '&:hover': {
                      bgcolor: isSelected ? '#0369A1' : '#F8FAFC',
                      borderColor: '#0284C7'
                    }
                  }}
                >
                  {slot}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Step 3: Reason for Reschedule */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1.2, letterSpacing: '0.04em' }}>
            STEP 3: REASON FOR RESCHEDULE
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {reasons.map((r) => {
              const isSelected = selectedReason === r;
              return (
                <Chip
                  key={r}
                  label={r}
                  clickable
                  onClick={() => onSelectReason(r)}
                  sx={{
                    bgcolor: isSelected ? '#0F172A' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    height: 36,
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    '&:hover': { bgcolor: isSelected ? '#1E293B' : '#E2E8F0' }
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Drawer Footer Actions */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid #F1F5F9',
          bgcolor: '#FFFFFF',
          display: 'flex',
          gap: 1.5
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            flex: 1,
            height: 48,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            color: '#64748B',
            borderColor: '#CBD5E1'
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={onConfirm}
          sx={{
            flex: 2,
            height: 48,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '14px',
            bgcolor: '#0284C7',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#0369A1' }
          }}
        >
          {loading ? 'Confirming Update...' : 'Confirm Rescheduled Slot'}
        </Button>
      </Box>
    </Drawer>
  );
}
