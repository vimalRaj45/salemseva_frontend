import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Paper,
  Divider,
  Skeleton,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import MicIcon from '@mui/icons-material/Mic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import NavigationIcon from '@mui/icons-material/Navigation';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneIcon from '@mui/icons-material/Phone';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import { useAuth } from '../../context/AuthContext';
import { PageHeader, EmptyState, LoadingSkeleton, StatusChip } from '../../components/common';

function BookingStageStepper({ status }) {
  const isCancelled = status === 'cancelled';
  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'transit', label: 'In Transit' },
    { key: 'service', label: 'Inspected' },
    { key: 'finish', label: isCancelled ? 'Cancelled' : 'Completed' }
  ];

  let currentIdx = 0;
  if (['matching'].includes(status)) currentIdx = 0;
  else if (['accepted'].includes(status)) currentIdx = 1;
  else if (['en_route', 'arrived'].includes(status)) currentIdx = 2;
  else if (['inspecting', 'quote_presented', 'quote_approved'].includes(status)) currentIdx = 3;
  else if (status === 'completed' || isCancelled) currentIdx = 4;

  return (
    <Box sx={{ my: 1.2, p: 1.2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <Stepper activeStep={currentIdx} alternativeLabel>
        {steps.map((st, idx) => {
          const isCurrent = idx === currentIdx;
          const isError = isCancelled && isCurrent;

          return (
            <Step key={st.key} completed={idx < currentIdx && !isCancelled}>
              <StepLabel
                error={isError}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '10px',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isError ? '#DC2626' : (isCurrent ? '#0066CC' : '#64748B'),
                    mt: 0.2
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: '18px',
                    color: '#CBD5E1',
                    '&.Mui-active': { color: isError ? '#DC2626' : '#0066CC' },
                    '&.Mui-completed': { color: '#0066CC' },
                    '&.Mui-error': { color: '#DC2626' }
                  }
                }}
              >
                {st.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  const formatDateTime = (dateStr) => {
    if (!dateStr) {
      const now = new Date();
      return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently updated';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchHistory = () => {
    setIsLoading(true);
    fetch(`${API_V1_URL}/bookings/history`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      })
      .catch(err => {
        console.warn('Real-time history fetch note:', err);
        setBookings([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedBookingId(prev => (prev === id ? null : id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'COMPLETED' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5', label: 'CANCELLED' };
      case 'en_route':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD', label: 'EN ROUTE' };
      case 'arrived':
      case 'inspecting':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'INSPECTING' };
      case 'quote_presented':
      case 'quote_approved':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE', label: 'QUOTE ACTIVE' };
      case 'matching':
      case 'created':
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'SEARCHING' };
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterTab === 'active') return !['completed', 'cancelled'].includes(b.status);
    if (filterTab === 'completed') return b.status === 'completed';
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: { xs: 18, md: 8 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, md: 2 } }}>
        
        {/* Page Header */}
        <PageHeader
          title="Service & Payment History"
          subtitle="Full timestamps, itemized quotes & payment ledgers"
          backUrl="/"
          backLabel="Home"
          badge={
            <Chip 
              label="Salem Citizen" 
              size="small" 
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '11px', borderRadius: '6px' }} 
            />
          }
        />
        
        {/* Top Badges Banner with High Contrast */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            p: 1.5,
            display: 'flex',
            gap: 1.2,
            mb: 2.5,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              py: 1,
              px: 1.2,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8
            }}
          >
            <ShieldIcon sx={{ color: '#16A34A', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '12px', color: '#166534' }}>
              100% Payment Guarantee
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1.2,
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              py: 1,
              px: 1.2,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8
            }}
          >
            <CheckCircleIcon sx={{ color: '#0066CC', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '12px', color: '#1E40AF' }}>
              30-Day Free Work Warranty
            </Typography>
          </Box>
        </Box>

        {/* Filter Pills */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 0.5 }}>
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'active', label: `Active (${bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length})` },
            { id: 'completed', label: `Completed (${bookings.filter(b => b.status === 'completed').length})` },
            { id: 'cancelled', label: `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})` }
          ].map(tab => (
            <Chip
              key={tab.id}
              label={tab.label}
              onClick={() => setFilterTab(tab.id)}
              sx={{
                bgcolor: filterTab === tab.id ? '#0284C7' : '#FFFFFF',
                color: filterTab === tab.id ? '#FFFFFF' : '#64748B',
                fontWeight: 700,
                fontSize: '11.5px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>

        {/* Booking History Items */}
        {!user ? (
          <EmptyState
            title="Sign In to View Your Bookings"
            description="Track live service requests and download digital GST service bills."
            actionLabel="Sign In"
            onAction={() => navigate('/login')}
            sx={{ mb: 3 }}
          />
        ) : isLoading ? (
          <LoadingSkeleton type="cards" count={3} sx={{ mb: 3 }} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found in this Filter"
            description="Choose another tab or book a new verified technician in Salem."
            actionLabel="Book Doorstep Service"
            onAction={() => navigate('/')}
            sx={{ mb: 3 }}
          />
        ) : (
          filteredBookings.map((item) => {
            const isExpanded = expandedBookingId === item.id;
            const statusConfig = getStatusColor(item.status);
            
            const part1Amt = parseFloat(item.visit_fee || item.paymentSummary?.part1Fee || 99);
            const rawQuoteSubtotal = parseFloat(item.quote_subtotal || item.paymentSummary?.part2Amount || 0);
            const displayedQuoteItems = item.quoteItems || [];
            
            const calculatedPartsTotal = displayedQuoteItems.reduce((s, qi) => s + (parseFloat(qi.price) * (qi.qty || 1)), 0);
            const part2Amt = rawQuoteSubtotal > 0 ? rawQuoteSubtotal : (item.status === 'completed' ? calculatedPartsTotal : 0);
            
            const isCancelled = item.status === 'cancelled';
            const grossPaid = parseFloat(item.gross_paid_amount || item.final_amount || (isCancelled ? part1Amt : 0));
            const refundAmt = parseFloat(item.refund_amount || 0);
            const platformFeeRetained = parseFloat(item.refund_platform_fee || 0);
            const gatewayFeeRetained = parseFloat(item.refund_gateway_fee || 0);
            const totalRetained = parseFloat((platformFeeRetained + gatewayFeeRetained).toFixed(2));

            const part1Paid = ['en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(item.status) || (isCancelled && grossPaid > 0);
            const totalPaid = item.status === 'completed' 
              ? (part1Amt + part2Amt) 
              : (isCancelled ? grossPaid : (part1Paid ? part1Amt : 0));

            return (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  p: 2,
                  mb: 2,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* 1. Header Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                  <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '10px',
                        bgcolor: item.service_color ? `${item.service_color}18` : '#E0F2FE',
                        color: item.service_color || '#0284C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                      }}
                    >
                      <WorkOutlineIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '11px', display: 'block' }}>
                        BOOKING #{item.id}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14.5px', lineHeight: 1.2 }}>
                        {item.service_name || `${item.service_id?.toUpperCase()} Service`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px' }}>
                      ₹{isCancelled && refundAmt > 0 ? refundAmt.toFixed(2) : totalPaid.toFixed(2)}
                    </Typography>
                    {isCancelled && refundAmt > 0 && (
                      <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '10px', display: 'block' }}>
                        Refund Initiated
                      </Typography>
                    )}
                    <Chip 
                      label={statusConfig.label} 
                      size="small" 
                      sx={{ 
                        bgcolor: statusConfig.bg, 
                        color: statusConfig.text, 
                        border: `1px solid ${statusConfig.border}`,
                        fontWeight: 800, 
                        fontSize: '9.5px', 
                        height: 20 
                      }} 
                    />
                  </Box>
                </Box>

                {/* Lifecycle Stage Stepper */}
                <BookingStageStepper status={item.status} />

                {/* 2. Key Metadata & Timestamps */}
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.2, borderRadius: '10px', border: '1px solid #E2E8F0', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: 15, color: '#2563EB' }} />
                    <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '11.5px' }}>
                      <strong>Placed:</strong> {formatDateTime(item.created_at)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                    <PersonIcon sx={{ fontSize: 15, color: '#0284C7' }} />
                    <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '11.5px' }}>
                      <strong>Technician:</strong> {item.technician_name || 'Assigned on Demand'} {item.tech_rating ? `( ${item.tech_rating})` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <LocationOnIcon sx={{ fontSize: 15, color: '#EA580C' }} />
                    <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '11.5px' }}>
                      <strong>Address:</strong> {item.address_line || item.locality || 'Fairlands, Salem'}
                    </Typography>
                  </Box>
                </Box>

                {/* 3. 2-Part Payment Overview Box */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    p: 1.4,
                    mb: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', fontSize: '11px' }}>
                      2-Part Payment Summary
                    </Typography>
                    <Chip
                      label={isCancelled ? (refundAmt > 0 ? `Net Refunded: ₹${refundAmt.toFixed(2)}` : 'Cancelled') : (totalPaid > 0 ? `Total Paid: ₹${totalPaid.toFixed(2)}` : 'No Charges')}
                      size="small"
                      sx={{ 
                        bgcolor: isCancelled ? '#EFF6FF' : (totalPaid > 0 ? '#DCFCE7' : '#F1F5F9'), 
                        color: isCancelled ? '#0284C7' : (totalPaid > 0 ? '#166534' : '#334155'), 
                        border: `1px solid ${isCancelled ? '#BAE6FD' : (totalPaid > 0 ? '#86EFAC' : '#E2E8F0')}`,
                        fontWeight: 800, 
                        fontSize: '10.5px', 
                        height: 20 
                      }}
                    />
                  </Box>

                  {/* Part 1 Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <TwoWheelerIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '12px' }}>
                        Part 1 (Visit & Doorstep Fuel):
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: isCancelled ? '#0284C7' : (part1Paid ? '#15803D' : '#475569'), fontSize: '12px' }}>
                      ₹{part1Amt.toFixed(2)} • {isCancelled ? (refundAmt > 0 ? `Refunded (Net ₹${refundAmt.toFixed(2)})` : 'Cancelled') : (part1Paid ? 'PAID (100% to Tech)' : (item.status === 'accepted' ? 'Awaiting Payment' : 'Zero Charge'))}
                    </Typography>
                  </Box>

                  {/* Part 2 Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <BuildIcon sx={{ fontSize: 16, color: '#D97706' }} />
                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '12px' }}>
                        Part 2 (Repair Work & Labour Charge):
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: item.status === 'completed' ? '#15803D' : (item.status === 'quote_approved' ? '#0066CC' : '#475569'), fontSize: '12px' }}>
                      {item.status === 'completed' ? `₹${part2Amt.toFixed(2)} • PAID (Released on Completion)` : (item.status === 'quote_approved' ? `₹${part2Amt.toFixed(2)} • Approved` : 'Quoted on Inspection')}
                    </Typography>
                  </Box>

                  {/* Transparent Cancellation & Refund Breakdown if cancelled */}
                  {isCancelled && grossPaid > 0 && (
                    <Box sx={{ mt: 1, p: 1.2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', mb: 0.3 }}>
                        <Typography sx={{ color: '#166534', fontWeight: 600 }}>Original Advance Paid:</Typography>
                        <Typography sx={{ fontWeight: 700, color: '#166534' }}>₹{grossPaid.toFixed(2)}</Typography>
                      </Box>
                      {totalRetained > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', mb: 0.3 }}>
                          <Typography sx={{ color: '#DC2626', fontWeight: 600 }}>Retained Fees (Platform + Gateway):</Typography>
                          <Typography sx={{ fontWeight: 700, color: '#DC2626' }}>-₹{totalRetained.toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', pt: 0.4, borderTop: '1px dashed #86EFAC' }}>
                        <Typography sx={{ fontWeight: 800, color: '#14532D' }}>Net Refund Initiated to Source:</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#15803D' }}>₹{refundAmt.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Prominent Labor Tasks Breakdown */}
                  {displayedQuoteItems.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '10.5px' }}>
                          Service Work Tasks & Labour ({displayedQuoteItems.length} tasks):
                        </Typography>
                        <Chip 
                          label="Workmanship Only • 0% Product Markup" 
                          size="small" 
                          sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '8.5px', height: 16 }} 
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {displayedQuoteItems.map((qi, qIdx) => (
                          <Box key={qIdx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', px: 0.8, py: 0.3, borderRadius: '4px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#334155', fontSize: '10.5px', fontWeight: 600 }}>
                                • {qi.name || qi.item_name}
                              </Typography>
                              <Chip 
                                label="Labor Task" 
                                size="small" 
                                sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontSize: '8px', height: 14, fontWeight: 700 }} 
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontSize: '10.5px' }}>
                              ₹{qi.price}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>

                {/* 4. Expandable Detailed Ledger & Timestamps Section */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', p: 1.5, mb: 1.5 }}>
                    
                    {/* Itemized Payments */}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8, fontSize: '11px' }}>
                       Official Payment Transactions & Receipts:
                    </Typography>

                    {item.payments && item.payments.length > 0 ? (
                      item.payments.map((p, pIdx) => {
                        const isRefund = p.status === 'REFUNDED';
                        const pAmount = Number(p.amount || 0);
                        const pPgFee = Number(p.pg_fee || gatewayFeeRetained || 0);
                        const pPlatformFee = Number(p.platform_fee || platformFeeRetained || 0);

                        return (
                          <Box key={p.id || pIdx} sx={{ bgcolor: '#FFFFFF', p: 1.2, borderRadius: '6px', border: '1px solid #E2E8F0', mb: 0.6 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '11px' }}>
                                Txn ID: {p.transaction_id || `TXN_${item.id}_${pIdx + 1}`}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: isRefund ? '#15803D' : '#16A34A', fontSize: '11.5px' }}>
                                ₹{pAmount.toFixed(2)} ({isRefund ? 'NET REFUNDED' : (p.status || 'SETTLED')})
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10px', mt: 0.2 }}>
                              Mode: {p.payment_method || 'UPI (Protected Payment)'} • {formatDateTime(p.created_at)}
                            </Typography>
                            {isRefund && (pPgFee > 0 || pPlatformFee > 0) && (
                              <Typography variant="caption" sx={{ color: '#0369A1', display: 'block', fontSize: '10px', mt: 0.3, bgcolor: '#F0F9FF', px: 0.8, py: 0.3, borderRadius: '4px' }}>
                                Retained deductions: ₹{pPlatformFee.toFixed(2)} Platform fee + ₹{pPgFee.toFixed(2)} Razorpay gateway interchange
                              </Typography>
                            )}
                          </Box>
                        );
                      })
                    ) : (
                      <>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 1, borderRadius: '6px', border: '1px solid #E2E8F0', mb: 0.6 }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                            Part 1 Advance: ₹{part1Amt} • Disbursed 100% directly to {item.technician_name || 'technician'}
                          </Typography>
                        </Box>
                        {item.status === 'completed' && (
                          <Box sx={{ bgcolor: '#FFFFFF', p: 1, borderRadius: '6px', border: '1px solid #E2E8F0', mb: 0.6 }}>
                            <Typography variant="caption" sx={{ color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>
                              Part 2 Spares & Labour: ₹{part2Amt} • Transferred via Instant UPI to {item.technician_name || 'technician'}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}

                    {/* Itemized Quote Breakdown (if available) */}
                    {item.quoteItems && item.quoteItems.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.5, fontSize: '11px' }}>
                          Itemized Diagnosis & Parts Bill:
                        </Typography>
                        <Table size="small" sx={{ bgcolor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#F1F5F9' }}>
                              <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, py: 0.5 }}>Item / Labour</TableCell>
                              <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, py: 0.5 }}>Type</TableCell>
                              <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, py: 0.5 }}>Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.quoteItems.map((qi, qiIdx) => (
                              <TableRow key={qi.id || qiIdx}>
                                <TableCell sx={{ fontSize: '10.5px', py: 0.4 }}>{qi.name || qi.item_name}</TableCell>
                                <TableCell sx={{ fontSize: '10px', py: 0.4, color: '#64748B' }}>{qi.type || qi.item_type}</TableCell>
                                <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, py: 0.4 }}>₹{qi.price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    )}

                    {/* Timeline Events */}
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.5, fontSize: '11px' }}>
                        Service Lifecycle Event Timestamps:
                      </Typography>
                      <Box sx={{ pl: 0.5, borderLeft: '2px solid #CBD5E1', ml: 0.5 }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontSize: '10.5px', mb: 0.3 }}>
                          • <strong>Placed:</strong> {formatDateTime(item.created_at)}
                        </Typography>
                        {item.updated_at && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontSize: '10.5px', mb: 0.3 }}>
                            • <strong>Technician Dispatched:</strong> {formatDateTime(item.updated_at)}
                          </Typography>
                        )}
                        {item.status === 'completed' && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#166534', fontSize: '10.5px', mb: 0.3 }}>
                            • <strong>Job Completed & Warranty Activated:</strong> {formatDateTime(item.completed_at || item.updated_at)}
                          </Typography>
                        )}
                        {item.status === 'cancelled' && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#DC2626', fontSize: '10.5px', mb: 0.3 }}>
                            • <strong>Cancelled:</strong> {formatDateTime(item.cancelled_at || item.updated_at)} ({item.cancellation_reason || 'Customer request'})
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Collapse>

                {/* 5. Card Footer Actions */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => toggleExpand(item.id)}
                    endIcon={isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: '#2563EB', fontWeight: 700, fontSize: '11.5px', textTransform: 'none', px: 1 }}
                  >
                    {isExpanded ? 'Hide Details' : 'View Full Details & Ledger'}
                  </Button>

                  <Box sx={{ flex: 1 }} />

                  {!['completed', 'cancelled'].includes(item.status) ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<NavigationIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(item.status === 'matching' ? `/matching?bookingId=${item.id}` : `/track?bookingId=${item.id}`)}
                        sx={{ bgcolor: '#2563EB', color: '#FFF', borderRadius: '8px', fontWeight: 700, fontSize: '11px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#1D4ED8' } }}
                      >
                        Track Live
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => {
                          navigate(`/booking/${item.id}/cancel`);
                        }}
                        sx={{ borderColor: '#FECACA', color: '#DC2626', borderRadius: '8px', fontWeight: 700, fontSize: '11px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#FEF2F2', borderColor: '#F87171' } }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/receipt/${item.id}`)}
                        sx={{ borderColor: '#CBD5E1', color: '#334155', borderRadius: '8px', fontWeight: 700, fontSize: '11px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#F8FAFC' } }}
                      >
                        Receipt
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/book/${item.service_id || 'ac'}`)}
                        sx={{ bgcolor: '#0284C7', color: '#FFF', borderRadius: '8px', fontWeight: 800, fontSize: '11px', py: 0.6, textTransform: 'none', '&:hover': { bgcolor: '#0369A1' } }}
                      >
                        Book Again
                      </Button>
                    </>
                  )}
                </Box>
              </Card>
            );
          })
        )}

      </Container>

      {/* Navigation lives in the global CustomerTabBar rendered by App.jsx. */}
    </Box>
  );
}
