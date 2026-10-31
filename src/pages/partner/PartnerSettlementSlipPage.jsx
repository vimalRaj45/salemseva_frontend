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
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Building,
  CreditCard,
  Receipt
} from 'lucide-react';
import { API_V1_URL, PARTNER_PAYOUT_PERCENT, PARTNER_COMMISSION_PERCENT } from '../../config';

export default function PartnerSettlementSlipPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(location.state?.job || null);
  const [loading, setLoading] = useState(!job);
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
    if (!job && bookingId) {
      setLoading(true);
      fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
        .then((r) => r.json())
        .then((d) => {
          if (!isMounted) return;
          if (d.success && d.booking) {
            const b = d.booking;
            const gross = parseFloat(b.final_amount || b.quote_subtotal || 250);
            const visit = parseFloat(b.visit_fee || 99);
            const labor = Math.max(0, gross - visit);
            const payoutRate = (Number(PARTNER_PAYOUT_PERCENT) || 98.0) / 100.0;
            const commRate = (Number(PARTNER_COMMISSION_PERCENT) || 2.0) / 100.0;
            const comm = labor * commRate;
            const payout = (labor * payoutRate) + visit;

            setJob({
              id: b.id,
              serviceName: b.service_name || b.selected_issue || 'Service Duty',
              customerName: b.customer_name || 'Customer',
              locality: b.locality || 'Salem',
              completedAt: b.completed_at || b.created_at,
              grossAmount: gross,
              visitFee: visit,
              platformCommission: comm,
              techPayout: payout,
              settlementUpi: b.technician_upi || 'Registered IMPS UPI',
              bankRef: b.payment_id || `RZP_IMPS_${b.id}`
            });
          } else {
            setError('Settlement slip not found');
          }
        })
        .catch(() => {
          if (isMounted) setError('Failed to load settlement details');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [bookingId, job]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Recent';
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

  const grossAmount = job?.grossAmount || 0;
  const visitFee = parseFloat(job?.visit_fee || job?.visitFee || 99);
  const payoutRate = (Number(PARTNER_PAYOUT_PERCENT) || 98.0) / 100.0;
  const commRate = (Number(PARTNER_COMMISSION_PERCENT) || 2.0) / 100.0;
  const laborShare = Math.max(0, grossAmount - visitFee) * payoutRate;
  const platformComm = job?.platformCommission || (Math.max(0, grossAmount - visitFee) * commRate);
  const netPayout = job?.techPayout || (laborShare + visitFee);

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
            Payout settlement voucher
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{job?.id || bookingId} • {job?.serviceName}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Printer size={16} />}
          onClick={() => window.print()}
          sx={{
            borderRadius: '10px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            fontWeight: 700,
            textTransform: 'none'
          }}
        >
          Print Slip
        </Button>
      </Box>

      {/* Main Content Area */}
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
          {/* Header Strip */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#0A66C2' }}>
                SHAZU ONE PARTNER NETWORK
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                Technician Disbursal Statement • Salem Hub
              </Typography>
            </Box>
            <Chip
              icon={<CheckCircle2 size={13} />}
              label="DISBURSED"
              size="small"
              sx={{
                bgcolor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 800,
                fontSize: '11px',
                height: 24
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Job summary card */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2.5 }}>
            <Typography sx={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, display: 'block', mb: 0.3 }}>
              Booking Reference & Service
            </Typography>
            <Typography sx={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', mb: 0.8 }}>
              #{job?.id} • {job?.serviceName}
            </Typography>
            <Typography sx={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'block' }}>
              Service Date: {formatDateTime(job?.completedAt)}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.3 }}>
              Customer: {job?.customerName} ({job?.locality || 'Salem'})
            </Typography>
          </Paper>

          {/* Itemized Calculation */}
          <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', mb: 1.2 }}>
            Itemized Settlement Calculation
          </Typography>

          <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #E2E8F0', fontSize: '13.5px' }}>
              <Typography sx={{ color: '#475569', fontSize: '13px' }}>Customer gross charge</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>₹{grossAmount.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #E2E8F0', fontSize: '13.5px' }}>
              <Typography sx={{ color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>Technician labour share ({PARTNER_PAYOUT_PERCENT}%)</Typography>
              <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '13.5px' }}>+₹{laborShare.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #E2E8F0', fontSize: '13.5px' }}>
              <Typography sx={{ color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>Visit & doorstep travel allowance (100%)</Typography>
              <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '13.5px' }}>+₹{visitFee.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed #E2E8F0', fontSize: '13.5px' }}>
              <Typography sx={{ color: '#DC2626', fontSize: '13px' }}>Platform tech fee ({PARTNER_COMMISSION_PERCENT}% on labour)</Typography>
              <Typography sx={{ fontWeight: 600, color: '#DC2626', fontSize: '13.5px' }}>-₹{platformComm.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, mt: 0.5, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Net Bank Payout</Typography>
              <Typography sx={{ fontSize: '20px', fontWeight: 900, color: '#16A34A' }}>₹{netPayout.toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* Transfer Info Box */}
          <Box sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CreditCard size={16} color="#166534" />
              <Typography sx={{ color: '#166534', fontWeight: 800, fontSize: '13px' }}>
                Automated IMPS Route Settlement
              </Typography>
            </Box>
            <Typography sx={{ color: '#15803D', fontSize: '12px', lineHeight: 1.45 }}>
              Disbursed to: <strong>{job?.settlementUpi || 'Registered Bank Account'}</strong>
            </Typography>
            <Typography sx={{ color: '#15803D', fontSize: '11px', mt: 0.5 }}>
              Banking Ref: {job?.bankRef || `TXN_${job?.id}`}
            </Typography>
          </Box>

          {/* Action */}
          <Box sx={{ '@media print': { display: 'none' } }}>
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
              Back to Duty Radar
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
