import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Switch,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  AlertTriangle,
  XCircle,
  PhoneOff,
  UserX,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const CANCELLATION_REASONS = [
  'Customer not answering phone calls / Doorbell no response at doorstep',
  'Customer requested cancellation via Salem Central Ops',
  'Customer address is incorrect or untraceable in Salem',
  'Customer refused entry or verbally requested cancellation',
  'Technician breakdown or vehicle issue — unable to reach',
  'Technician wrongly assigned — skill mismatch for this job',
  'Service temporarily unavailable in this locality',
  'Admin emergency override — operational requirement'
];

export default function AdminOrderCancelPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelDetails, setCancelDetails] = useState('');
  const [compensateTech, setCompensateTech] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/admin');
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
  }, [bookingId]);

  const handleExecuteCancel = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          details: cancelDetails.trim(),
          compensateTech,
          adminUser: localStorage.getItem('shazuone_admin_user') || 'Central Dispatch Operations'
        })
      });

      const data = await res.json();
      if (data.success || res.ok) {
        toast.success(`Booking #${bookingId} cancelled and technician released!`);
        setTimeout(() => {
          handleDismiss();
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to execute cancellation');
      }
    } catch {
      toast.error('Network error during cancellation override');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#DC2626' }} />
      </Box>
    );
  }

  const hasAssignedTech = Boolean(booking?.technician_id || booking?.technician_name);

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
            Admin cancel order & release technician
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{bookingId} • Emergency central ops override
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626',
            flexShrink: 0
          }}
        >
          <XCircle size={20} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Order Details Strip */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              {booking?.service_name || booking?.service_id || 'Service Booking'}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#475569', mb: 0.5 }}>
              Customer: <strong>{booking?.customer_name || 'Customer'}</strong> • {booking?.customer_phone || ''}
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
              Locality: <strong>{booking?.address_line || booking?.locality || 'Salem'}</strong>
            </Typography>
            {hasAssignedTech ? (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #F1F5F9' }}>
                <Typography sx={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 700 }}>
                  Assigned Specialist: {booking?.technician_name || `Partner #${booking?.technician_id}`}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.5 }}>
                No partner assigned yet
              </Typography>
            )}
          </Paper>

          {/* Cancellation Reasons Chips */}
          <Box>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
              Cancellation reason *
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CANCELLATION_REASONS.map((r) => {
                const isSelected = cancelReason === r;
                return (
                  <Chip
                    key={r}
                    label={r}
                    onClick={() => setCancelReason(r)}
                    clickable
                    sx={{
                      py: 2.2,
                      borderRadius: '10px',
                      justifyContent: 'flex-start',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '12px',
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

          {/* Dispatcher Notes */}
          <TextField
            label="Dispatcher notes / Investigation details"
            placeholder="e.g. Technician called customer 3 times with no answer at site..."
            fullWidth
            multiline
            rows={3}
            value={cancelDetails}
            onChange={(e) => setCancelDetails(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
          />

          {/* Technician Compensation Toggle */}
          {hasAssignedTech && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: compensateTech ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                bgcolor: compensateTech ? '#F0FDF4' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: compensateTech ? '#166534' : '#0F172A' }}>
                  Compensate Partner Travel Allowance (₹99.00)
                </Typography>
                <Typography sx={{ fontSize: '11.5px', color: compensateTech ? '#15803D' : '#64748B' }}>
                  Disburse ₹99 to technician wallet so they do not bear travel loss for customer no-show.
                </Typography>
              </Box>
              <Switch
                checked={compensateTech}
                onChange={(e) => setCompensateTech(e.target.checked)}
                color="success"
              />
            </Paper>
          )}

          {/* Warning Banner */}
          <Paper elevation={0} sx={{ p: 1.8, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.5 }}>
              <strong>Permanent Operational Action:</strong> The booking will be marked cancelled, the technician will be unlocked and set online immediately on duty radar, and this override will be logged in the audit trail.
            </Typography>
          </Paper>

          {/* Action Button */}
          <Box sx={{ mt: 1, pb: 5 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              onClick={handleExecuteCancel}
              startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <XCircle size={18} />}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#DC2626',
                fontWeight: 800,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.28)',
                '&:hover': { bgcolor: '#B91C1C' }
              }}
            >
              {isSubmitting ? 'Cancelling & releasing partner...' : 'Confirm Cancel & Release Technician'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
