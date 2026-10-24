import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import toast from 'react-hot-toast';
import { API_V1_URL } from '../config';

const PAYMENT_METHODS = [
  { id: 'direct_upi', label: 'Direct Company UPI (GPay / PhonePe / QR)', tamil: 'நேரடி UPI / கம்பெனி QR' },
  { id: 'cash_technician', label: 'Cash Collected by Partner at Doorstep', tamil: 'டெக்னீஷியன் ரொக்கமாகப் பெற்றது' },
  { id: 'cash_central_desk', label: 'Cash Paid at Salem Central Office', tamil: 'சேலம் தலைமை அலுவலகத்தில் செலுத்தியது' },
  { id: 'bank_neft_imps', label: 'Direct Bank Transfer (NEFT / IMPS)', tamil: 'வங்கி பரிமாற்றம் (NEFT / IMPS)' }
];

const OVERRIDE_REASONS = [
  { id: 'razorpay_gateway_down', label: 'Razorpay Gateway Outage / 504 Timeout' },
  { id: 'customer_bank_timeout', label: 'Customer Bank UPI Server Failure / Timeout' },
  { id: 'direct_company_qr', label: 'Customer Paid Directly to Salem Company QR Code' },
  { id: 'cash_collected', label: 'Cash Collected Doorstep by Verified Partner' },
  { id: 'corporate_billing', label: 'Corporate / Offline Invoice Settlement' },
  { id: 'other', label: 'Other Operational Admin Override' }
];

export default function AdminPaymentOverrideModal({
  open,
  onClose,
  booking,
  onSuccess
}) {
  const [stage, setStage] = useState('advance');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('direct_upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [reason, setReason] = useState('razorpay_gateway_down');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      const visitFee = parseFloat(booking.visit_fee) || 99.00;
      const quoteSubtotal = parseFloat(booking.quote_subtotal) || 0.00;
      const isPostQuote = ['quote_presented', 'quote_approved', 'in_progress', 'completed'].includes(booking.status);

      if (isPostQuote && quoteSubtotal > 0) {
        setStage('final_settlement');
        setAmount(String(quoteSubtotal));
      } else {
        setStage('advance');
        setAmount(String(visitFee));
      }
      setTransactionRef(`MANUAL-${(booking.id || 'SLM').substring(0, 8)}-${Date.now().toString().slice(-4)}`);
      setPaymentMethod('direct_upi');
      setReason('razorpay_gateway_down');
      setNotes('');
    }
  }, [booking, open]);

  if (!booking) return null;

  const visitFee = parseFloat(booking.visit_fee) || 99.00;
  const quoteSubtotal = parseFloat(booking.quote_subtotal) || 0.00;
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
  const platformCut = stage === 'advance' ? 0.00 : parseFloat((parsedAmount * 0.02).toFixed(2));
  const techPayout = parseFloat((parsedAmount - platformCut).toFixed(2));

  const handleSubmit = async () => {
    if (parsedAmount <= 0) {
      toast.error('செல்லுபடியாகும் தொகையை உள்ளிடவும் (Please enter a valid amount > 0)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/${booking.id}/payment-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStage: stage,
          amountPaid: parsedAmount,
          paymentMethod,
          transactionRef,
          reason,
          notes: notes.trim()
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        toast.success(data.message || `Booking #${booking.id} marked as PAID!`);
        if (onSuccess) onSuccess(data);
        onClose();
      } else {
        toast.error(data.error || 'Failed to apply manual payment override');
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error('Network error. Could not connect to Central Ops server.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 2.2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(2, 132, 199, 0.2)',
              border: '1px solid #0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PaymentsIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px', lineHeight: 1.2 }}>
              Direct Payment Confirmation (நேரடி கட்டணப் பதிவு)
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
              Booking #{booking.id} • {booking.customer_name || 'Customer'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, bgcolor: '#F8FAFC' }}>
        {/* Warning Callout for Direct Payment Confirmation */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            bgcolor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.2
          }}
        >
          <WarningAmberIcon sx={{ color: '#D97706', fontSize: 20, mt: 0.2 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#92400E', fontSize: '12px' }}>
              Direct Offline Payment Confirmation (Cash / Direct Company QR)
            </Typography>
            <Typography sx={{ color: '#B45309', fontSize: '11px', mt: 0.3, lineHeight: 1.4 }}>
              Use this when online payment is unavailable or the customer pays via direct cash/UPI. Marking as paid immediately updates both customer and partner screens.
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Payment Stage Selector */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.8, fontSize: '12px' }}>
              கட்டண நிலை (PAYMENT STAGE TO CLEAR) *
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
              {[
                { id: 'advance', label: 'Part 1: Advance', sub: `₹${visitFee}` },
                { id: 'final_settlement', label: 'Part 2: Balance', sub: `₹${quoteSubtotal || 0}` },
                { id: 'full', label: 'Full Total', sub: `₹${totalAmount}` }
              ].map((s) => (
                <Paper
                  key={s.id}
                  elevation={0}
                  onClick={() => handleStageChange(s.id)}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    border: stage === s.id ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    bgcolor: stage === s.id ? '#EFF6FF' : '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Typography sx={{ fontSize: '11.5px', fontWeight: 800, color: stage === s.id ? '#0284C7' : '#0F172A' }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: stage === s.id ? '#0369A1' : '#64748B' }}>
                    {s.sub}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Amount Input */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, fontSize: '12px' }}>
              பெறப்பட்ட தொகை (EXACT AMOUNT COLLECTED IN ₹) *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#FFFFFF', fontWeight: 700 } }}
            />
          </Box>

          {/* Payment Method */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, fontSize: '12px' }}>
              கட்டண முறை (PAYMENT METHOD / CHANNEL) *
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', fontWeight: 600, fontSize: '13px' }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.id} value={m.id} sx={{ fontSize: '13px' }}>
                    {m.label} ({m.tamil})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Transaction Ref / UTR */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, fontSize: '12px' }}>
              பரிவர்த்தனை குறிப்பு எண் (UTR / TRANSACTION REFERENCE)
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI-9842012345-AXIS"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '13px' } }}
            />
          </Box>

          {/* Reason for Override */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, fontSize: '12px' }}>
              காரணம் (REASON FOR MANUAL OVERRIDE) *
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', fontWeight: 600, fontSize: '13px' }}
              >
                {OVERRIDE_REASONS.map((r) => (
                  <MenuItem key={r.id} value={r.id} sx={{ fontSize: '13px' }}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Dispatcher Notes */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, fontSize: '12px' }}>
              நிர்வாக குறிப்புகள் (DISPATCHER / OPS AUDIT NOTES)
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer bank server error, payment received via direct GPay to company scanner."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '12.5px' } }}
            />
          </Box>

          {/* Financial Breakdown Preview */}
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#0F172A', color: '#FFFFFF', borderRadius: '10px', border: '1px solid #1E293B' }}>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, letterSpacing: 0.5, display: 'block', mb: 0.8 }}>
              FINANCIAL LEDGER ALLOCATION PREVIEW:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block' }}>
                  Technician Share ({stage === 'advance' ? '100%' : '98%'}):
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#34D399', fontWeight: 800, fontSize: '14px' }}>
                  ₹{techPayout.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block' }}>
                  Platform Commission ({stage === 'advance' ? '0%' : '2%'}):
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '14px' }}>
                  ₹{platformCut.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: '#64748B', textTransform: 'none', fontWeight: 700, fontSize: '13px' }}
        >
          Cancel (ரத்து)
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || parsedAmount <= 0}
          startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <CheckCircleIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#16A34A',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '13px',
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.5,
            py: 0.8,
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            '&:hover': { bgcolor: '#15803D' }
          }}
        >
          {isSubmitting ? 'Confirming...' : `Confirm & Mark as Paid (₹${parsedAmount.toFixed(2)})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
