import { API_V1_URL, PARTNER_PAYOUT_PERCENT, PARTNER_COMMISSION_PERCENT } from '../../config';
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
import { PageHeader as CommonPageHeader, DataTable, StatusChip } from '../../components/common';
import { KpiCard, StatusPill } from '../../components/ui';

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
          setFinancialData(data.data || data);
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
          <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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
          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
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
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            ₹{tx.platformCut.toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        align: 'center',
        minWidth: 120,
        renderCell: (tx) => <StatusPill status={tx.status} />
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh', py: { xs: 2.5, sm: 4 } }}>
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

        {/* 5 KPI Metric Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* 1. Customer Gross Inflow */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="CUSTOMER GROSS"
              value={`₹${summary.totalGross.toLocaleString('en-IN')}`}
              subtitle={`${summary.totalTransactions} Total Transactions`}
              icon={Coins}
              iconColor="#1D6FE5"
              iconBg="#EFF6FF"
            />
          </Grid>

          {/* 2. Razorpay Gateway Fees */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="RAZORPAY CHARGES"
              value={`₹${summary.totalRazorpayFee.toLocaleString('en-IN')}`}
              subtitle="2.36% Gateway MDR + GST"
              icon={CreditCard}
              iconColor="#D97706"
              iconBg="#FEF3C7"
            />
          </Grid>

          {/* 3. Disbursed to Technicians */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="DISBURSED TO TECHS"
              value={`₹${summary.totalTechPayout.toLocaleString('en-IN')}`}
              subtitle={`100% Travel + ${PARTNER_PAYOUT_PERCENT}% Labor`}
              icon={Users}
              iconColor="#059669"
              iconBg="#ECFDF5"
            />
          </Grid>

          {/* 4. Customer Refunds */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="CUSTOMER REFUNDS"
              value={`₹${summary.totalCustomerRefunds.toLocaleString('en-IN')}`}
              subtitle="Cancellation Returns"
              icon={RotateCcw}
              iconColor="#DC2626"
              iconBg="#FEF2F2"
            />
          </Grid>

          {/* 5. Net Platform Revenue */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="NET PLATFORM CUT"
              value={`₹${summary.totalPlatformCut.toLocaleString('en-IN')}`}
              subtitle={`${PARTNER_COMMISSION_PERCENT}% Commission`}
              icon={TrendingUp}
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
            />
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
