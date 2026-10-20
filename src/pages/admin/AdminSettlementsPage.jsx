import { API_V1_URL } from '../../config';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Skeleton,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldIcon from '@mui/icons-material/Shield';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReplayIcon from '@mui/icons-material/Replay';
import HandshakeIcon from '@mui/icons-material/Handshake';

const SALEM_LOCALITIES = [
  'All Salem Regions',
  'Fairlands',
  'Hasthampatti',
  'Suramangalam / Junction',
  'Ammapet',
  'Shevapet',
  'Meyyanur',
  'Alagapuram',
  'Gugai',
  'Kondalampatti',
  'Kannankurichi',
  'Gorimedu',
  'Steel Plant Area'
];

export default function AdminSettlementsPage() {
  const navigate = useNavigate();

  // Filter States
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All Salem Regions');
  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch End-to-End Financial Ledger
  const fetchLedger = () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedLocality !== 'All Salem Regions') {
      const cleanLoc = selectedLocality.split(' / ')[0].split(' (')[0];
      params.append('locality', cleanLoc);
    }
    if (selectedService !== 'all') {
      params.append('serviceId', selectedService);
    }
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    fetch(`${API_V1_URL}/admin/financials/ledger?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFinancialData(data);
        }
      })
      .catch((err) => console.warn('Financials ledger fetch notice:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedLocality, selectedService, startDate, endDate]);

  // Handle Preset Date Buttons
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const t = formatDate(today);
      setStartDate(t);
      setEndDate(t);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = formatDate(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === '7days') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      setStartDate(formatDate(d7));
      setEndDate(formatDate(today));
    } else if (preset === '30days') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      setStartDate(formatDate(d30));
      setEndDate(formatDate(today));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const summary = financialData?.summary || {
    totalGross: 0,
    totalRazorpayFee: 0,
    totalTechPayout: 0,
    totalPlatformCut: 0,
    totalCustomerRefunds: 0,
    netPlatformEarnings: 0,
    totalTransactions: 0,
    completedOrders: 0
  };

  const regionBreakdown = financialData?.regionBreakdown || [];
  const rawTransactions = financialData?.transactions || [];

  // Filter transactions by local search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return rawTransactions;
    const q = searchQuery.toLowerCase();
    return rawTransactions.filter(
      (tx) =>
        tx.bookingId?.toLowerCase().includes(q) ||
        tx.customerName?.toLowerCase().includes(q) ||
        tx.technicianName?.toLowerCase().includes(q) ||
        tx.locality?.toLowerCase().includes(q) ||
        tx.razorpayPaymentId?.toLowerCase().includes(q)
    );
  }, [rawTransactions, searchQuery]);

  // Reusable Glassmorphism Style Token
  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.65)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden'
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)',
        minHeight: '100vh',
        py: 4
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Navigation & Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin')}
            sx={{
              color: '#0284C7',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              px: 2,
              '&:hover': { bgcolor: '#FFFFFF' }
            }}
          >
            Back to Central Ops Desk
          </Button>

          <Tooltip title="Refresh Financials">
            <IconButton
              onClick={fetchLedger}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.8)'
              }}
            >
              <RefreshIcon sx={{ color: '#0284C7' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Title Glass Hero */}
        <Card elevation={0} sx={{ ...glassCardStyle, p: { xs: 2.5, md: 3.5 }, mb: 3.5 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '14px',
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
                    Salem End-to-End Financial Intelligence & Settlement Ledger
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800, fontSize: '11px', letterSpacing: 0.5 }}>
                    Shazu One ESCROW • RAZORPAY GATEWAY DEDUCTIONS • TECHNICIAN DISBURSALS
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 860, lineHeight: 1.5 }}>
                Real-time tracking of customer payments, automated 2.36% Razorpay payment gateway fees, 100% technician fuel travel disbursals, 95% quote labor releases, and platform commission.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: 16, color: '#0284C7 !important' }} />}
                label="Escrow Guarantee"
                sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '11px' }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#16A34A !important' }} />}
                label="Direct UPI Payouts"
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px' }}
              />
            </Box>
          </Box>
        </Card>

        {/* ========================================================================= */}
        {/* INTERACTIVE FILTERS: REGION-WISE, DATE PRESET & DATE PICKER */}
        {/* ========================================================================= */}
        <Card elevation={0} sx={{ ...glassCardStyle, p: 2.5, mb: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterAltIcon sx={{ color: '#0284C7', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
              Multi-Dimensional Financial Filters
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="center">
            {/* Quick Date Presets */}
            <Grid item xs={12} lg={4}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.8 }}>
                DATE RANGE PRESET:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' }
                ].map((p) => {
                  const isSelected = datePreset === p.id;
                  return (
                    <Chip
                      key={p.id}
                      label={p.label}
                      onClick={() => handlePresetChange(p.id)}
                      sx={{
                        fontWeight: isSelected ? 900 : 700,
                        fontSize: '11.5px',
                        bgcolor: isSelected ? '#0284C7' : 'rgba(255, 255, 255, 0.9)',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        border: isSelected ? '1px solid #0284C7' : '1px solid #CBD5E1',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>

            {/* Date Pickers */}
            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.5 }}>
                START DATE:
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={startDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setStartDate(e.target.value);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.5 }}>
                END DATE:
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={endDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setEndDate(e.target.value);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                }}
              />
            </Grid>

            {/* Region / Locality Dropdown */}
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.5 }}>
                SALEM REGION / LOCALITY:
              </Typography>
              <FormControl fullWidth size="small">
                {/* ds-allow-native-select */}
                <Select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  {SALEM_LOCALITIES.map((loc) => (
                    <MenuItem key={loc} value={loc} sx={{ fontSize: '13px', fontWeight: 600 }}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* ========================================================================= */}
        {/* 5 END-TO-END GLASS KPI METRIC CARDS */}
        {/* ========================================================================= */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {/* 1. Customer Gross Inflow */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ ...glassCardStyle, p: 2.2, borderTop: '3px solid #0284C7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                  CUSTOMER GROSS
                </Typography>
                <MonetizationOnIcon sx={{ color: '#0284C7', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 0.5 }}>
                ₹{summary.totalGross.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, fontSize: '11px' }}>
                {summary.totalTransactions} Total Transactions
              </Typography>
            </Card>
          </Grid>

          {/* 2. Razorpay Gateway Fees */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ ...glassCardStyle, p: 2.2, borderTop: '3px solid #F59E0B' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                  RAZORPAY CHARGES
                </Typography>
                <CreditCardIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309', mb: 0.5 }}>
                ₹{summary.totalRazorpayFee.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 700, fontSize: '11px' }}>
                2.36% Gateway MDR + GST
              </Typography>
            </Card>
          </Grid>

          {/* 3. Disbursed to Technicians */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ ...glassCardStyle, p: 2.2, borderTop: '3px solid #10B981' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                  DISBURSED TO TECHS
                </Typography>
                <HandshakeIcon sx={{ color: '#10B981', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#047857', mb: 0.5 }}>
                ₹{summary.totalTechPayout.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, fontSize: '11px' }}>
                100% Visit Travel + 95% Labor
              </Typography>
            </Card>
          </Grid>

          {/* 4. Customer Refunds */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ ...glassCardStyle, p: 2.2, borderTop: '3px solid #6366F1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                  CUSTOMER REFUNDS
                </Typography>
                <ReplayIcon sx={{ color: '#6366F1', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#4338CA', mb: 0.5 }}>
                ₹{summary.totalCustomerRefunds.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#3730A3', fontWeight: 700, fontSize: '11px' }}>
                Pre-Dispatch Cancellation Return
              </Typography>
            </Card>
          </Grid>

          {/* 5. Net Platform Revenue */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ ...glassCardStyle, p: 2.2, borderTop: '3px solid #06B6D4' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                  NET PLATFORM CUT
                </Typography>
                <TrendingUpIcon sx={{ color: '#06B6D4', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0E7490', mb: 0.5 }}>
                ₹{summary.totalPlatformCut.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#155E75', fontWeight: 700, fontSize: '11px' }}>
                5% Commission on Work Done
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* ========================================================================= */}
        {/* SALEM REGIONAL REVENUE DISTRIBUTION */}
        {/* ========================================================================= */}
        {regionBreakdown.length > 0 && (
          <Card elevation={0} sx={{ ...glassCardStyle, p: 2.5, mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                  Salem Regional Financial Share Distribution
                </Typography>
              </Box>
              <Chip
                label={`${regionBreakdown.length} Active Localities`}
                size="small"
                sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 800, fontSize: '10px' }}
              />
            </Box>

            <Grid container spacing={2}>
              {regionBreakdown.map((r) => (
                <Grid item xs={12} sm={6} md={3} key={r.locality}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: '14px',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                        {r.locality}
                      </Typography>
                      <Chip
                        label={`${r.pctShare}%`}
                        size="small"
                        sx={{ height: 18, fontSize: '9.5px', fontWeight: 900, bgcolor: '#E0F2FE', color: '#0284C7' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0369A1', fontSize: '15px' }}>
                      ₹{r.gross.toLocaleString('en-IN')}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: 0.8 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                        {r.orders} orders • Tech: ₹{r.techPayout}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, fontSize: '11px' }}>
                        Cut: ₹{r.platformCut}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, r.pctShare)}
                      sx={{ height: 6, borderRadius: '3px', bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#0284C7' } }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* COMPREHENSIVE END-TO-END ITEMIZED TRANSACTION LEDGER */}
        {/* ========================================================================= */}
        <Card elevation={0} sx={{ ...glassCardStyle, p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              gap: 2,
              mb: 2.5
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px' }}>
                End-to-End Financial Settlement Ledger
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Showing {filteredTransactions.length} itemized transaction lines with gateway fees and technician payouts
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search by customer, technician, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                width: { xs: '100%', md: 320 },
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(241, 245, 249, 0.7)', '& th': { color: '#475569', fontWeight: 800, fontSize: '11px', py: 1.5 } }}>
                  <TableCell>DATE / TIME</TableCell>
                  <TableCell>BOOKING ID</TableCell>
                  <TableCell>CUSTOMER & LOCALITY</TableCell>
                  <TableCell>ASSIGNED TECHNICIAN</TableCell>
                  <TableCell align="right">GROSS INFLOW</TableCell>
                  <TableCell align="right">RAZORPAY FEE</TableCell>
                  <TableCell align="right">DISBURSED TO TECH</TableCell>
                  <TableCell align="right">PLATFORM CUT</TableCell>
                  <TableCell align="right">REFUND</TableCell>
                  <TableCell align="center">PAYMENT & STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4].map((n) => (
                    <TableRow key={n}>
                      <TableCell><Skeleton width={80} height={20} /></TableCell>
                      <TableCell><Skeleton width={90} height={20} /></TableCell>
                      <TableCell><Skeleton width={120} height={20} /></TableCell>
                      <TableCell><Skeleton width={110} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={60} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={50} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={60} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={50} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={50} height={20} /></TableCell>
                      <TableCell align="center"><Skeleton width={90} height={20} /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
                        No transactions found matching the selected region or date filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => {
                    const dateFormatted = new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <TableRow
                        key={tx.id || tx.bookingId}
                        hover
                        sx={{
                          '& td': { borderColor: '#F1F5F9', py: 1.3, fontSize: '12px' },
                          '&:hover': { bgcolor: 'rgba(240, 249, 255, 0.4)' }
                        }}
                      >
                        <TableCell sx={{ color: '#64748B', fontWeight: 600 }}>
                          {dateFormatted}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`#${tx.bookingId}`}
                            size="small"
                            onClick={() => navigate(`/track?bookingId=${tx.bookingId}`)}
                            sx={{
                              bgcolor: '#E0F2FE',
                              color: '#0284C7',
                              fontWeight: 800,
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                            {tx.customerName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>
                            {tx.locality}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
                            {tx.technicianName}
                          </Typography>
                          {tx.technicianTrade && (
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                              {tx.technicianTrade.toUpperCase()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A' }}>
                          ₹{tx.grossAmount.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#D97706', fontWeight: 700 }}>
                          ₹{tx.razorpayFee.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#059669', fontWeight: 800 }}>
                          ₹{tx.techPayout.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#0284C7', fontWeight: 800 }}>
                          ₹{tx.platformCut.toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: tx.customerRefund > 0 ? '#DC2626' : '#94A3B8', fontWeight: 700 }}>
                          {tx.customerRefund > 0 ? `₹${tx.customerRefund.toFixed(2)}` : '₹0.00'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                            <Chip
                              label={tx.status}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                fontSize: '9.5px',
                                height: 18,
                                bgcolor:
                                  tx.status === 'SETTLED'
                                    ? '#DCFCE7'
                                    : tx.status === 'REFUNDED'
                                    ? '#FEE2E2'
                                    : '#FEF3C7',
                                color:
                                  tx.status === 'SETTLED'
                                    ? '#15803D'
                                    : tx.status === 'REFUNDED'
                                    ? '#B91C1C'
                                    : '#B45309'
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '9.5px' }}>
                              {tx.paymentMethod.split(' ')[0]}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
