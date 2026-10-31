import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Building,
  QrCode,
  DollarSign,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { API_V1_URL, PARTNER_COMMISSION_PERCENT, PARTNER_PAYOUT_PERCENT } from '../../config';
import { PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'direct_upi', label: 'Direct Company UPI (GPay / PhonePe / QR)', sub: 'நேரடி UPI / கம்பெனி QR' },
  { id: 'cash_technician', label: 'Cash Collected by Partner at Doorstep', sub: 'டெக்னீஷியன் ரொக்கமாகப் பெற்றது' },
  { id: 'cash_central_desk', label: 'Cash Paid at Salem Central Office', sub: 'சேலம் தலைமை அலுவலகத்தில் செலுத்தியது' },
  { id: 'bank_neft_imps', label: 'Direct Bank Transfer (NEFT / IMPS)', sub: 'வங்கி பரிமாற்றம் (NEFT / IMPS)' }
];

const OVERRIDE_REASONS = [
  { id: 'razorpay_gateway_down', label: 'Razorpay Gateway Outage / 504 Timeout' },
  { id: 'customer_bank_timeout', label: 'Customer Bank UPI Server Failure / Timeout' },
  { id: 'direct_company_qr', label: 'Customer Paid Directly to Salem Company QR Code' },
  { id: 'cash_collected', label: 'Cash Collected Doorstep by Verified Partner' },
  { id: 'corporate_billing', label: 'Corporate / Offline Invoice Settlement' },
  { id: 'other', label: 'Other Operational Admin Override' }
];

export default function AdminPaymentOverridePage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [stage, setStage] = useState('advance');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('direct_upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [reason, setReason] = useState('razorpay_gateway_down');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/admin/settlements');
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
            initializeForm(d.booking);
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else if (booking) {
      initializeForm(booking);
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const initializeForm = (b) => {
    const visitFee = parseFloat(b.visit_fee) || 99.0;
    const quoteSubtotal = parseFloat(b.quote_subtotal) || 0.0;
    const isPostQuote = ['quote_presented', 'quote_approved', 'in_progress', 'completed'].includes(b.status);

    if (isPostQuote && quoteSubtotal > 0) {
      setStage('final_settlement');
      setAmount(String(quoteSubtotal));
    } else {
      setStage('advance');
      setAmount(String(visitFee));
    }
    setTransactionRef(`MANUAL-${(b.id || 'SLM').toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`);
  };

  const visitFee = parseFloat(booking?.visit_fee) || 99.0;
  const quoteSubtotal = parseFloat(booking?.quote_subtotal) || 0.0;
  const totalAmount = visitFee + quoteSubtotal;

  const handleStageChange = (newStage) => {
    setStage(newStage);
    if (newStage === 'advance') {
      setAmount(String(visitFee));
    } else if (newStage === 'final_settlement') {
      setAmount(String(quoteSubtotal > 0 ? quoteSubtotal : 250));
    } else if (newStage === 'full') {
      setAmount(String(totalAmount > 0 ? totalAmount : 349));
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const commissionRate = (Number(PARTNER_COMMISSION_PERCENT) || 2.0) / 100.0;
  const platformCut = stage === 'advance' ? 0.0 : parseFloat((parsedAmount * commissionRate).toFixed(2));
  const techPayout = parseFloat((parsedAmount - platformCut).toFixed(2));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid override settlement amount');
      return;
    }
    if (!transactionRef.trim()) {
      toast.error('Transaction reference number is required for audit logs');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/${booking.id}/payment-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          amount: parsedAmount,
          paymentMethod,
          transactionRef: transactionRef.trim(),
          reason,
          notes: notes.trim(),
          platformCut,
          techPayout,
          adminUser: localStorage.getItem('shazuone_admin_user') || 'Central Admin'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to apply manual override');
      }

      toast.success(`Booking #${booking.id} payment overridden successfully!`);
      setTimeout(() => {
        handleDismiss();
      }, 1000);
    } catch (err) {
      console.error('Payment override error:', err);
      toast.error(err.message || 'Error processing payment override');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: 8 }}>
      <Container maxWidth="sm" sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Payment Override & Ledger Settlement"
          subtitle={`Booking #${booking?.id || bookingId} • ${booking?.customer_name || 'Customer'} (${booking?.locality || 'Salem'})`}
          backUrl={location.state?.returnTo || '/admin'}
          backLabel="Back to Admin"
        />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
          {/* Summary Card */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                {booking?.service_name || 'Appliance Service'}
              </Typography>
              <Chip label={booking?.status?.toUpperCase()} size="small" sx={{ fontWeight: 800, fontSize: '10px' }} />
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
              Customer: <strong>{booking?.customer_name}</strong> • Phone: <strong>{booking?.customer_phone}</strong>
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.3 }}>
              Specialist: <strong>{booking?.technician_name || 'Assigned Partner'}</strong>
            </Typography>
          </Paper>

          {/* Step 1: Stage Selection */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1 }}>
              Settlement stage
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { id: 'advance', label: `Advance / Diagnostic (₹${visitFee.toFixed(0)})` },
                { id: 'final_settlement', label: `Labour Quote (₹${quoteSubtotal.toFixed(0)})` },
                { id: 'full', label: `Full Order (₹${totalAmount.toFixed(0)})` }
              ].map((s) => {
                const isSelected = stage === s.id;
                return (
                  <Chip
                    key={s.id}
                    label={s.label}
                    onClick={() => handleStageChange(s.id)}
                    clickable
                    sx={{
                      flex: 1,
                      py: 2.2,
                      borderRadius: '10px',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '11.5px',
                      bgcolor: isSelected ? '#0A66C2' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      border: isSelected ? '1px solid #0A66C2' : '1px solid #E2E8F0',
                      '&:hover': { bgcolor: isSelected ? '#084E96' : '#F1F5F9' }
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Amount Field */}
          <TextField
            label="Override amount settled (₹) *"
            type="number"
            fullWidth
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              sx: { borderRadius: '12px', bgcolor: '#FFFFFF', fontWeight: 800, fontSize: '16px' }
            }}
          />

          {/* Payment Method Selector */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1 }}>
              Payment collection method *
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {PAYMENT_METHODS.map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <Paper
                    key={m.id}
                    elevation={0}
                    onClick={() => setPaymentMethod(m.id)}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #0A66C2' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: isSelected ? 800 : 600, color: '#0F172A' }}>
                          {m.label}
                        </Typography>
                        <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>
                          {m.sub}
                        </Typography>
                      </Box>
                      {isSelected && <CheckCircle2 size={18} color="#0A66C2" />}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* Override Reason */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1 }}>
              Audit reason *
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {OVERRIDE_REASONS.map((r) => {
                const isSelected = reason === r.id;
                return (
                  <Chip
                    key={r.id}
                    label={r.label}
                    onClick={() => setReason(r.id)}
                    clickable
                    sx={{
                      borderRadius: '10px',
                      py: 2,
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '11.5px',
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

          {/* Transaction Ref Number */}
          <TextField
            label="Transaction reference / UTR / Receipt No *"
            placeholder="e.g. UTR-2026-984210"
            fullWidth
            required
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
          />

          {/* Admin Notes */}
          <TextField
            label="Internal dispatcher notes (optional)"
            placeholder="e.g. Verified with Salem Accounts Desk phone confirmation"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
          />

          {/* Payout Calculation Ledger */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #BBF7D0', bgcolor: '#F0FDF4' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#166534', mb: 1 }}>
              Automatic Escrow & Split Allocation
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', mb: 0.5 }}>
              <Typography sx={{ color: '#166534' }}>Technician Net Disbursal ({PARTNER_PAYOUT_PERCENT}%):</Typography>
              <Typography sx={{ fontWeight: 800, color: '#166534' }}>₹{techPayout.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <Typography sx={{ color: '#166534' }}>Shazu One Platform Commission ({PARTNER_COMMISSION_PERCENT}%):</Typography>
              <Typography sx={{ fontWeight: 800, color: '#166534' }}>₹{platformCut.toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* Submit Action */}
          <Box sx={{ mt: 1, pb: 5 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <CheckCircle2 size={18} />}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#0A66C2',
                fontWeight: 800,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              {isSubmitting ? 'Recording settlement override...' : 'Confirm Payment Override & Settle Order'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
