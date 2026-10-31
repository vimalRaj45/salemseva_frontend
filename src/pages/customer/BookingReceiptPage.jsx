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
  const isCancelled = booking?.status === 'cancelled';
  const grossPaid = parseFloat(booking?.final_amount || booking?.gross_paid_amount || booking?.visit_fee || 99.0);
  const refundAmount = parseFloat(booking?.refund_amount || 0);
  const platformFeeRetained = parseFloat(booking?.refund_platform_fee || 0);
  const gatewayFeeRetained = parseFloat(booking?.refund_gateway_fee || 0);
  const quoteLabor = parseFloat(booking?.quote_subtotal || 0);
  const totalAmount = isCompleted && quoteLabor > 0 ? (grossPaid + quoteLabor) : (isCancelled ? refundAmount : grossPaid);

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
              label={isCancelled ? 'CANCELLED & REFUNDED' : (isCompleted ? 'PAID & SETTLED' : (booking?.status || 'CONFIRMED').toUpperCase())}
              size="small"
              sx={{
                bgcolor: isCancelled ? '#FEF2F2' : (isCompleted ? '#DCFCE7' : '#EFF6FF'),
                color: isCancelled ? '#DC2626' : (isCompleted ? '#15803D' : '#0284C7'),
                border: isCancelled ? '1px solid #FECACA' : 'none',
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
            {isCancelled ? 'Itemized Cancellation & Refund Ledger' : 'Itemized Service Charges'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                {isCancelled ? 'Initial Advance Booking Paid' : 'Part 1: Inspection & Doorstep Travel Fee'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                {isCancelled ? 'Pre-service payment received at checkout' : 'Guaranteed technician arrival & diagnostic inspection'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
              ₹{grossPaid.toFixed(2)}
            </Typography>
          </Box>

          {isCancelled && platformFeeRetained > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>
                  Platform Facilitation Retention (2%)
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                  Cloud dispatch & technician matching retention
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#DC2626' }}>
                -₹{platformFeeRetained.toFixed(2)}
              </Typography>
            </Box>
          )}

          {isCancelled && gatewayFeeRetained > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography sx={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>
                  Payment Gateway Surcharge Retention (2%)
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                  Razorpay banking interchange processing charge
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#DC2626' }}>
                -₹{gatewayFeeRetained.toFixed(2)}
              </Typography>
            </Box>
          )}

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
              {isCancelled ? 'Net Refund Credited to Source' : 'Total Amount Settled'}
            </Typography>
            <Typography sx={{ fontSize: '20px', fontWeight: 900, color: isCancelled ? '#059669' : '#16A34A' }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>

          {/* Guarantee / Refund Box */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: isCancelled ? '#F0F9FF' : '#F0FDF4',
              border: isCancelled ? '1px solid #BAE6FD' : '1px solid #BBF7D0',
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
                bgcolor: isCancelled ? '#E0F2FE' : '#DCFCE7',
                color: isCancelled ? '#0284C7' : '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: isCancelled ? '#0369A1' : '#166534' }}>
                {isCancelled ? 'Razorpay Escrow Refund Initiated' : '30-Day Doorstep Warranty Protected'}
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: isCancelled ? '#0284C7' : '#15803D', lineHeight: 1.4 }}>
                {isCancelled 
                  ? 'Your net refund has been dispatched via automated banking route and will reflect in your source account within 3 to 5 business days.'
                  : 'Any recurring issues within 30 days will be resolved free of cost by SalemSeva technicians.'}
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
