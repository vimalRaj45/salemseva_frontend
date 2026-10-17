import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Paper,
  Grid,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PrintIcon from '@mui/icons-material/Print';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { API_V1_URL } from '../../config';

export default function AdminCustomerDossierPage() {
  const { phone } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/customers/${encodeURIComponent(phone)}/history`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer || {
          customer_name: data.customerName || 'Customer',
          customer_phone: phone,
          locality: data.locality || 'Fairlands, Salem',
          total_spent: data.totalSpent || 0,
          total_orders: data.totalOrders || (data.history ? data.history.length : 0)
        });
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load customer dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone) {
      fetchCustomerData();
    }
  }, [phone]);

  const handleToggleBlock = async (shouldBlock) => {
    try {
      const res = await fetch(`${API_V1_URL}/admin/customers/${encodeURIComponent(phone)}/toggle-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: shouldBlock })
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(prev => ({ ...prev, is_blocked: shouldBlock }));
        setActionNotice(`Customer account ${shouldBlock ? 'suspended' : 'restored'}.`);
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error('Block toggle error:', err);
    }
  };

  const getStatusChip = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'completed') return <Chip label="Completed" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px' }} />;
    if (s === 'en_route' || s === 'arrived' || s === 'inspecting') return <Chip label="In Progress" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '10.5px' }} />;
    if (s === 'cancelled') return <Chip label="Cancelled" size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '10.5px' }} />;
    return <Chip label={st || 'Created'} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '10.5px' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0284C7' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Top Banner & Breadcrumb */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pt: 3, pb: 4, px: 3, borderBottom: '1px solid #334155' }}>
        <Container maxWidth="xl" sx={{ p: 0 }}>
          <Breadcrumbs sx={{ mb: 1.5, color: '#94A3B8', fontSize: '12.5px' }}>
            <Link onClick={() => navigate('/admin')} sx={{ color: '#94A3B8', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
              Admin Ops Desk
            </Link>
            <Link onClick={() => navigate('/admin')} sx={{ color: '#94A3B8', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
              Customers
            </Link>
            <Typography sx={{ color: '#38BDF8', fontWeight: 700, fontSize: '12.5px' }}>
              {customer?.customer_name || 'Customer 360'}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/admin')}
                sx={{ borderColor: '#475569', color: '#E2E8F0', fontWeight: 700, fontSize: '12px', textTransform: 'none', borderRadius: '8px', py: 0.6 }}
              >
                Back to Desk
              </Button>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {customer?.customer_name || 'Customer Profile'}
                  {customer?.is_blocked && (
                    <Chip label="Suspended" size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '11px', height: 22 }} />
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                  Phone: <strong style={{ color: '#38BDF8' }}>{phone}</strong> • Locality: <strong>{customer?.locality || 'Fairlands, Salem'}</strong> • Orders: <strong>{history.length}</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.print()}
                sx={{ borderColor: '#475569', color: '#E2E8F0', fontWeight: 700, fontSize: '12px', textTransform: 'none', borderRadius: '8px' }}
              >
                Print Profile
              </Button>
              {customer?.is_blocked ? (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => handleToggleBlock(false)}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px' }}
                >
                  Restore Account
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleToggleBlock(true)}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px' }}
                >
                  Suspend Account
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Body */}
      <Container maxWidth="xl" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        {actionNotice && (
          <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, bgcolor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', color: '#166534', fontWeight: 700, fontSize: '13px' }}>
            {actionNotice}
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Left Column: Customer Details */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '11px', mb: 2 }}>
                Customer Account Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: '#2563EB', color: '#FFFFFF', width: 48, height: 48 }}>
                  <PersonIcon sx={{ fontSize: 26 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {customer?.customer_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <PhoneIcon sx={{ fontSize: 13 }} />
                    {phone}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.3 }}>
                  PRIMARY SALEM SERVICE ADDRESS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {customer?.service_address || customer?.address || 'Salem Doorstep'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                  <RoomIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                  {customer?.locality || 'Fairlands, Salem'}
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block', mb: 0.2 }}>
                  LIFETIME CUSTOMER SPEND
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#065F46' }}>
                  ₹{parseFloat(customer?.total_spent || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#047857' }}>
                  {history.length} completed & active service requests
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Order Ledger */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    Complete Order & Booking Ledger
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Track historical doorstep service requests and technician assignments
                  </Typography>
                </Box>
                <Chip label={`${history.length} Total Orders`} size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800 }} />
              </Box>

              {history.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <ShoppingBagIcon sx={{ fontSize: 32, color: '#94A3B8', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>No bookings recorded for this customer.</Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '12px' } }}>
                        <TableCell>Booking ID</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Assigned Partner</TableCell>
                        <TableCell>Order Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map(job => (
                        <TableRow key={job.id} hover>
                          <TableCell sx={{ fontWeight: 800, color: '#0284C7' }}>#{job.id}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{job.service_id?.toUpperCase()}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {job.technician_name || 'Unassigned'}
                            {job.technician_rating && (
                              <Typography variant="caption" sx={{ color: '#16A34A', display: 'block', fontSize: '10.5px' }}>
                                Rating: {job.technician_rating} / 5.0
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A' }}>₹{job.final_amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
