import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Wrench,
  Receipt
} from 'lucide-react';
import { API_V1_URL } from '../../config';

export default function BookingReceiptPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
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
          } else {
            setError('Booking receipt not found');
          }
        })
        .catch(() => {
          if (isMounted) setError('Failed to load receipt details');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, booking]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

  const isCompleted = booking?.status === 'completed';
  const visitFee = 99.0;
  const quoteLabor = parseFloat(booking?.quote_subtotal || booking?.final_amount || 0);
  const totalAmount = isCompleted && quoteLabor > 0 ? (visitFee + quoteLabor) : visitFee;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
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
          gap: 1.5,
          '@media print': { display: 'none' }
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
            Tax invoice & receipt
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{bookingId || booking?.id}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Printer size={16} />}
          onClick={handlePrint}
          sx={{
            borderRadius: '10px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            fontWeight: 700,
            textTransform: 'none'
          }}
        >
          Print / Save
        </Button>
      </Box>

      {/* Main Receipt Content */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}
        >
          {/* Header Brand Strip */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#0A66C2', letterSpacing: '-0.3px' }}>
                SHAZU ONE
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                Salem City On-Demand Services • GST Invoice
              </Typography>
            </Box>
            <Chip
              label={isCompleted ? 'PAID & SETTLED' : (booking?.status || 'CONFIRMED').toUpperCase()}
              size="small"
              sx={{
                bgcolor: isCompleted ? '#DCFCE7' : '#EFF6FF',
                color: isCompleted ? '#15803D' : '#0284C7',
                fontWeight: 800,
                fontSize: '11px',
                height: 24
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Service Details Card */}
          <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Calendar size={15} color="#64748B" />
              <Typography sx={{ fontSize: '12.5px', color: '#475569' }}>
                Service Date: <strong>{formatDateTime(booking?.created_at)}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <User size={15} color="#64748B" />
              <Typography sx={{ fontSize: '12.5px', color: '#475569' }}>
                Assigned Specialist: <strong>{booking?.technician_name || 'Verified Salem Specialist'}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <MapPin size={15} color="#64748B" style={{ marginTop: '2px' }} />
              <Typography sx={{ fontSize: '12.5px', color: '#475569' }}>
                Doorstep Address: <strong>{booking?.address_line || booking?.locality || 'Fairlands, Salem'}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Itemized Charges */}
          <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
            Itemized Service Charges
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                Part 1: Inspection & Doorstep Travel Fee
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                Guaranteed technician arrival & diagnostic inspection
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
              ₹{visitFee.toFixed(2)}
            </Typography>
          </Box>

          {isCompleted && quoteLabor > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Part 2: Workmanship & Skilled Labour
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                  {booking?.service_name || 'Appliance Repair / Installation Work'}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                ₹{quoteLabor.toFixed(2)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Total Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              Total Amount Settled
            </Typography>
            <Typography sx={{ fontSize: '20px', fontWeight: 900, color: '#16A34A' }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>

          {/* Warranty Guarantee Box */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              display: 'flex',
              gap: 1.5,
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                30-Day Doorstep Warranty Protected
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#15803D', lineHeight: 1.4 }}>
                Any recurring issues within 30 days will be resolved free of cost by SalemSeva technicians.
              </Typography>
            </Box>
          </Paper>

          {/* Close Action */}
          <Box sx={{ mt: 3, '@media print': { display: 'none' } }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleDismiss}
              sx={{
                minHeight: 48,
                borderRadius: '12px',
                bgcolor: '#0A66C2',
                fontWeight: 800,
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              Back to My Bookings
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
