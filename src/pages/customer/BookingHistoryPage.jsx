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
  BottomNavigation,
  BottomNavigationAction,
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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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

import CancelBookingModal from '../../components/CancelBookingModal';

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [invoiceModalBooking, setInvoiceModalBooking] = useState(null);

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
    fetch('https://salemseva-backend.onrender.com/api/v1/bookings/history')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.bookings && data.bookings.length > 0) {
          setBookings(data.bookings);
        }
      })
      .catch(err => console.warn('History fetch:', err))
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Top Header with Back Navigation Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                bgcolor: '#FFFFFF', 
                border: '1px solid #CBD5E1', 
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#F1F5F9' }
              }}
              size="small"
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                Service & Payment History
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                Full timestamps, itemized quotes & payment ledgers
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="Salem Citizen" 
            size="small" 
            sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '11px', borderRadius: '6px' }} 
          />
        </Box>
        
        {/* Top Badges Banner */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0284C7 0%, #0F172A 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            p: 1.8,
            display: 'flex',
            gap: 1.5,
            mb: 2,
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              py: 0.8,
              px: 1.2,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8
            }}
          >
            <ShieldIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '11.5px' }}>
              100% Escrow Protected
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1.2,
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              py: 0.8,
              px: 1.2,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8
            }}
          >
            <CheckCircleIcon sx={{ color: '#34D399', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '11.5px' }}>
              30-Day Free Work Warranty
            </Typography>
          </Paper>
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
        {isLoading ? (
          [1, 2].map((n) => (
            <Card
              key={n}
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                p: 2.2,
                mb: 2
              }}
            >
              <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: '12px', mb: 1 }} />
              <Skeleton variant="text" width="60%" height={24} />
            </Card>
          ))
        ) : filteredBookings.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', mb: 3 }}>
            <WorkOutlineIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', mb: 0.5 }}>
              No Bookings Found in this Filter
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px', mb: 2 }}>
              Choose another tab or book a new verified technician in Salem.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#0284C7', color: '#FFF', fontWeight: 700, fontSize: '13px', borderRadius: '8px', textTransform: 'none' }}
            >
              Book Doorstep Service
            </Button>
          </Paper>
        ) : (
          filteredBookings.map((item) => {
            const isExpanded = expandedBookingId === item.id;
            const statusConfig = getStatusColor(item.status);
            
            const part1Amt = parseFloat(item.visit_fee || item.paymentSummary?.part1Fee || 99);
            const rawQuoteSubtotal = parseFloat(item.quote_subtotal || item.paymentSummary?.part2Amount || 0);
            const displayedQuoteItems = item.quoteItems || [];
            
            const calculatedPartsTotal = displayedQuoteItems.reduce((s, qi) => s + (parseFloat(qi.price) * (qi.qty || 1)), 0);
            const part2Amt = rawQuoteSubtotal > 0 ? rawQuoteSubtotal : (item.status === 'completed' ? calculatedPartsTotal : 0);
            
            const part1Paid = ['en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(item.status) || (item.status === 'cancelled' && item.technician_id);
            const totalPaid = item.status === 'completed' 
              ? (part1Amt + part2Amt) 
              : (part1Paid ? part1Amt : 0);

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
                      ₹{totalPaid}
                    </Typography>
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
                    <Typography variant="caption" sx={{ color: '#334155', fontSize: '11.5px' }}>
                      <strong>Technician:</strong> {item.technician_name || 'Assigned on Demand'} {item.tech_rating ? `( ${item.tech_rating})` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <LocationOnIcon sx={{ fontSize: 15, color: '#EA580C' }} />
                    <Typography variant="caption" sx={{ color: '#334155', fontSize: '11.5px' }}>
                      <strong>Address:</strong> {item.address_line || item.locality || 'Fairlands, Salem'}
                    </Typography>
                  </Box>
                </Box>

                {/* 3. 2-Part Payment Overview Box */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    p: 1.2,
                    mb: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '10.5px' }}>
                      2-Part Payment Summary
                    </Typography>
                    <Chip
                      label={totalPaid > 0 ? `Total Paid: ₹${totalPaid}` : 'No Charges'}
                      size="small"
                      sx={{ bgcolor: totalPaid > 0 ? '#DCFCE7' : '#F1F5F9', color: totalPaid > 0 ? '#166534' : '#64748B', fontWeight: 800, fontSize: '10px', height: 18 }}
                    />
                  </Box>

                  {/* Part 1 Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <TwoWheelerIcon sx={{ fontSize: 15, color: '#2563EB' }} />
                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '11.5px' }}>
                        Part 1 (Visit & Doorstep Fuel):
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: part1Paid ? '#16A34A' : '#64748B' }}>
                      ₹{part1Amt} • {part1Paid ? 'PAID (100% to Tech)' : (item.status === 'accepted' ? 'Awaiting Payment' : 'Zero Charge')}
                    </Typography>
                  </Box>

                  {/* Part 2 Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <BuildIcon sx={{ fontSize: 15, color: '#D97706' }} />
                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '11.5px' }}>
                        Part 2 (Repair Labour & Spares):
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: item.status === 'completed' ? '#16A34A' : '#64748B' }}>
                      {item.status === 'completed' ? `₹${part2Amt} • PAID (Escrow Released)` : (item.status === 'quote_approved' ? `₹${part2Amt} • Approved` : 'Quoted on Inspection')}
                    </Typography>
                  </Box>

                  {/* Prominent Spares & Products Breakdown */}
                  {displayedQuoteItems.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '10.5px' }}>
                          Products, Spares & Labour ({displayedQuoteItems.length} items):
                        </Typography>
                        <Chip 
                          label={item.parts_mode === 'user_buys' ? 'Customer Self-Purchase' : 'Tech Direct Local Store Purchase'} 
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
                                label={qi.type === 'Spare Part' ? 'Tech Sourced' : (qi.type || 'Labor')} 
                                size="small" 
                                sx={{ bgcolor: qi.type === 'Spare Part' ? '#DCFCE7' : '#F1F5F9', color: qi.type === 'Spare Part' ? '#166534' : '#475569', fontSize: '8px', height: 14, fontWeight: 700 }} 
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
                       Official Payment Transactions & Escrow Logs:
                    </Typography>

                    {item.payments && item.payments.length > 0 ? (
                      item.payments.map((p, pIdx) => (
                        <Box key={p.id || pIdx} sx={{ bgcolor: '#FFFFFF', p: 1, borderRadius: '6px', border: '1px solid #E2E8F0', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '11px' }}>
                              Txn ID: {p.transaction_id || `TXN_${item.id}_${pIdx + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#16A34A', fontSize: '11px' }}>
                              ₹{p.amount} ({p.status || 'SETTLED'})
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10px' }}>
                            Mode: {p.payment_method || 'UPI (Instant Escrow)'} • {formatDateTime(p.created_at)}
                          </Typography>
                        </Box>
                      ))
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
                              Part 2 Spares & Labour: ₹{part2Amt} • Settled via Instant UPI to {item.technician_name || 'technician'}
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
                          setSelectedBookingForCancel(item);
                          setCancelModalOpen(true);
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
                        onClick={() => setInvoiceModalBooking(item)}
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

      {/* Digital Receipt / Invoice Modal */}
      {invoiceModalBooking && (
        <Dialog
          open={Boolean(invoiceModalBooking)}
          onClose={() => setInvoiceModalBooking(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon sx={{ color: '#0284C7', fontSize: 24 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px' }}>
                  SalemSeva Tax Invoice & Receipt
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Booking #{invoiceModalBooking.id}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setInvoiceModalBooking(null)}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: '8px', border: '1px solid #E2E8F0', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Service Date & Time:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>{formatDateTime(invoiceModalBooking.created_at)}</Typography>

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Assigned Certified Technician:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>{invoiceModalBooking.technician_name || 'K. Ramesh (Salem Verified)'}</Typography>

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Doorstep Address:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>{invoiceModalBooking.address_line || invoiceModalBooking.locality || 'Fairlands, Salem'}</Typography>
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8, textTransform: 'uppercase' }}>
              Itemized Charges:
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
              <Typography variant="body2" sx={{ color: '#334155', fontSize: '12.5px' }}>Part 1: Inspection & Doorstep Travel Fee:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>₹99.00</Typography>
            </Box>

            {invoiceModalBooking.status === 'completed' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '12.5px' }}>Part 2: Repair Labour & Parts:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>₹{invoiceModalBooking.quote_subtotal || 800}.00</Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>Total Amount Paid:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#16A34A' }}>
                ₹{invoiceModalBooking.status === 'completed' ? (parseFloat(invoiceModalBooking.quote_subtotal || 800) + 99) : 99}.00
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mt: 2, borderRadius: '8px', fontSize: '11px' }}>
              Protected by 30-Day Free Warranty Guarantee across Salem Corporation limits.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" onClick={() => setInvoiceModalBooking(null)} sx={{ bgcolor: '#0F172A', borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
              Close Receipt
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Universal Cancel Booking Modal */}
      {selectedBookingForCancel && (
        <CancelBookingModal
          open={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedBookingForCancel(null);
          }}
          bookingId={selectedBookingForCancel.id}
          currentStatus={selectedBookingForCancel.status}
          onCancelledSuccess={() => {
            fetchHistory();
          }}
        />
      )}

      {/* Bottom Navigation */}
      <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, pb: 'max(env(safe-area-inset-bottom, 0px), 14px)' }}>
        <BottomNavigation showLabels value={1} sx={{ height: 56, '& .Mui-selected': { color: '#0066CC', fontWeight: 700 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          <BottomNavigationAction label="Partner Zone" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/partner')} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
