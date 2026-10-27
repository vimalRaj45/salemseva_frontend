import { API_V1_URL } from '../../config';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Filter,
  CreditCard,
  TrendingUp,
  MapPin,
  RefreshCw,
  Shield,
  Coins,
  RotateCcw,
  Users,
  CheckCircle2
} from 'lucide-react';
import { PageHeader, DataTable, StatusChip } from '../../components/common';

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
          setFinancialData(data.data);
        } else {
          setFinancialData(null);
        }
      })
      .catch((err) => {
        console.warn('Financial ledger fetch error:', err);
        setFinancialData(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedLocality, selectedService, startDate, endDate]);

  const handlePresetChange = (presetId) => {
    setDatePreset(presetId);
    const now = new Date();
    const toDateStr = (d) => d.toISOString().split('T')[0];

    if (presetId === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (presetId === 'today') {
      const todayStr = toDateStr(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (presetId === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = toDateStr(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (presetId === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
    } else if (presetId === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
    }
  };

  const summary = financialData?.summary || {
    totalGross: 0,
    totalRazorpayFee: 0,
    totalTechPayout: 0,
    totalPlatformCut: 0,
    totalCustomerRefunds: 0,
    totalTransactions: 0
  };

  const transactions = financialData?.transactions || [];
  const regionBreakdown = financialData?.regionBreakdown || [];

  // Table Columns Definition for DataTable
  const columns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date / Time',
        minWidth: 130,
        renderCell: (tx) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )
      },
      {
        field: 'bookingId',
        headerName: 'Booking ID',
        minWidth: 120,
        renderCell: (tx) => (
          <Chip
            label={`#${tx.bookingId}`}
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => navigate(`/track?bookingId=${tx.bookingId}`)}
            sx={{ fontWeight: 700, cursor: 'pointer' }}
          />
        )
      },
      {
        field: 'customerName',
        headerName: 'Customer & Locality',
        minWidth: 160,
        renderCell: (tx) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {tx.customerName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {tx.locality}
            </Typography>
          </Box>
        )
      },
      {
        field: 'technicianName',
        headerName: 'Technician',
        minWidth: 140,
        renderCell: (tx) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tx.technicianName}
            </Typography>
            {tx.technicianTrade && (
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                {tx.technicianTrade}
              </Typography>
            )}
          </Box>
        )
      },
      {
        field: 'grossAmount',
        headerName: 'Gross Inflow',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            ₹{tx.grossAmount.toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'razorpayFee',
        headerName: 'Razorpay Fee',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
            ₹{tx.razorpayFee.toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'techPayout',
        headerName: 'Disbursed',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700 }}>
            ₹{tx.techPayout.toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'platformCut',
        headerName: 'Platform Cut',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
            ₹{tx.platformCut.toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        align: 'center',
        minWidth: 120,
        renderCell: (tx) => <StatusChip status={tx.status} />
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'center',
        sortable: false,
        minWidth: 100,
        renderCell: (tx) =>
          tx.status !== 'SETTLED' && tx.status !== 'REFUNDED' ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                navigate(`/admin/settlements/${tx.bookingId}/override`, {
                  state: {
                    booking: {
                      bookingId: tx.bookingId,
                      amount: tx.grossAmount,
                      techPayout: tx.techPayout,
                      customerPhone: tx.customerPhone || '',
                      technicianPhone: tx.technicianPhone || ''
                    },
                    returnTo: location.pathname
                  }
                });
              }}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1, minHeight: 28 }}
            >
              Override
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Finalized
            </Typography>
          )
      }
    ],
    [navigate]
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Financial Intelligence & Settlement Ledger"
          subtitle="Real-time tracking of customer payments, Razorpay gateway fees, technician fuel & labor disbursals, and platform commission."
          backUrl="/admin"
          backLabel="Central Ops Desk"
          actions={
            <Tooltip title="Refresh Financials">
              <Button
                variant="outlined"
                size="small"
                onClick={fetchLedger}
                startIcon={<RefreshCw size={15} />}
                sx={{ borderRadius: 1 }}
              >
                Refresh
              </Button>
            </Tooltip>
          }
          badge={
            <Chip
              icon={<Shield size={14} />}
              label="Escrow Guarantee"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          }
        />

        {/* 5 Glass KPI Metric Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* 1. Customer Gross Inflow */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  CUSTOMER GROSS
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main' }}>
                  <Coins size={16} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                ₹{summary.totalGross.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {summary.totalTransactions} Total Transactions
              </Typography>
            </Card>
          </Grid>

          {/* 2. Razorpay Gateway Fees */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  RAZORPAY CHARGES
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light', color: 'warning.main' }}>
                  <CreditCard size={16} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'warning.main', mb: 0.5 }}>
                ₹{summary.totalRazorpayFee.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                2.36% Gateway MDR + GST
              </Typography>
            </Card>
          </Grid>

          {/* 3. Disbursed to Technicians */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  DISBURSED TO TECHS
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                  <Users size={16} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main', mb: 0.5 }}>
                ₹{summary.totalTechPayout.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'secondary.dark', fontWeight: 600 }}>
                100% Travel + 95% Labor
              </Typography>
            </Card>
          </Grid>

          {/* 4. Customer Refunds */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  CUSTOMER REFUNDS
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.light', color: 'error.main' }}>
                  <RotateCcw size={16} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main', mb: 0.5 }}>
                ₹{summary.totalCustomerRefunds.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Cancellation Returns
              </Typography>
            </Card>
          </Grid>

          {/* 5. Net Platform Revenue */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  NET PLATFORM CUT
                </Typography>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark' }}>
                  <TrendingUp size={16} />
                </Avatar>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                ₹{summary.totalPlatformCut.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                5% Commission on Work Done
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Multi-Dimensional Financial Filters */}
        <Card elevation={0} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Filter size={16} color="#0A5CC4" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Multi-Dimensional Financial Filters
            </Typography>
          </Box>

          <Grid container spacing={2} alignItems="center">
            {/* Quick Date Presets */}
            <Grid item xs={12} lg={5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                DATE RANGE PRESET:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
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
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                    />
                  );
                })}
              </Box>
            </Grid>

            {/* Date Pickers */}
            <Grid item xs={12} sm={6} md={3} lg={3.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                CUSTOM DATE RANGE:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
                />
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
                />
              </Box>
            </Grid>

            {/* Region / Locality Dropdown */}
            <Grid item xs={12} sm={6} md={3} lg={3.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                SALEM REGION / LOCALITY:
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  {SALEM_LOCALITIES.map((loc) => (
                    <MenuItem key={loc} value={loc} sx={{ fontSize: '0.8125rem' }}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Financial Settlements Table with DataTable */}
        <DataTable
          columns={columns}
          data={transactions}
          keyField="bookingId"
          isLoading={isLoading}
          searchPlaceholder="Search by customer, technician, booking ID..."
          searchFields={['bookingId', 'customerName', 'technicianName', 'locality']}
          emptyTitle="No Financial Transactions Found"
          emptyDescription="There are no transaction lines matching the selected date or region filter."
          initialPageSize={10}
        />
      </Container>
    </Box>
  );
}
