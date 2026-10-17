import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
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
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function AdminCustomerDossierDrawer({
  open,
  onClose,
  customer,
  history = [],
  loading = false,
  onOpenBookingTrace = () => {},
  onOpenTechDossier = () => {},
  onToggleBlock = () => {},
  getStatusChip = (st) => st
}) {
  const navigate = useNavigate();
  if (!customer && !open) return null;

  const phone = customer?.customer_phone || customer?.phone || '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540, md: 640 },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Drawer Sticky Header */}
      <Box sx={{
        p: 2.2,
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{ bgcolor: '#2563EB', color: '#FFFFFF', width: 42, height: 42 }}>
            <PersonIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px', lineHeight: 1.2 }}>
              {customer?.customer_name || customer?.name || 'Customer Profile'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Salem Customer 360 Dossier
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {phone && (
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
              onClick={() => {
                onClose();
                navigate(`/admin/customers/${encodeURIComponent(phone)}`);
              }}
              sx={{
                borderColor: '#475569',
                color: '#E2E8F0',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                py: 0.5,
                '&:hover': { bgcolor: '#1E293B', borderColor: '#94A3B8' }
              }}
            >
              Full Page
            </Button>
          )}

          <IconButton onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: '#334155' } }} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Drawer Scrollable Body */}
      <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
        {customer && (
          <>
            {/* Stat Summary Box */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>
                    Customer Contact
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.3 }}>
                    {customer.customer_name || customer.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <PhoneIcon sx={{ fontSize: 13 }} />
                    {phone}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>
                    Locality & Address
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <RoomIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                    {customer.locality || 'Fairlands, Salem'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {customer.service_address || 'Salem Doorstep'}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>
                    Lifetime Spend
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#16A34A', mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 15 }} />
                    ₹{parseFloat(customer.total_spent || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {customer.total_orders || history.length} total orders placed
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Complete History Table */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14px' }}>
                Booking History ({history.length} Jobs)
              </Typography>
              <Chip label="Salem Order Book" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '10px' }} />
            </Box>

            {loading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0284C7' }} />
              </Box>
            ) : history.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>No service history recorded for this customer.</Typography>
              </Paper>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '11.5px' } }}>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Assigned Partner</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell align="center">Stage</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map(job => (
                      <TableRow key={job.id} hover>
                        <TableCell 
                          sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => {
                            onClose();
                            onOpenBookingTrace(job);
                          }}
                          title="Click to deep trace booking"
                        >
                          #{job.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
                          {job.service_id?.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ fontWeight: 700, color: job.technician_name ? '#0284C7' : '#64748B', cursor: job.technician_name ? 'pointer' : 'default', textDecoration: job.technician_name ? 'underline' : 'none', fontSize: '12px' }}
                            onClick={() => {
                              if (job.technician_name) {
                                onClose();
                                onOpenTechDossier(job);
                              }
                            }}
                          >
                            {job.technician_name || 'Unassigned'}
                          </Typography>
                          {job.technician_rating && (
                            <Typography variant="caption" sx={{ color: '#16A34A', display: 'block', fontSize: '10.5px' }}>
                              Rating: {job.technician_rating} / 5.0
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '11.5px' }}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '12.5px' }}>
                          ₹{job.final_amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Drawer Sticky Bottom Footer */}
      <Box sx={{
        p: 2,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        {customer && (
          <Box>
            {customer.is_blocked ? (
              <Button
                variant="contained"
                color="success"
                onClick={() => onToggleBlock(customer, false)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px', py: 0.8 }}
              >
                Restore Customer Account
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onToggleBlock(customer, true)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px', py: 0.8 }}
              >
                Suspend Customer Account
              </Button>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '8px',
            fontSize: '12px',
            py: 0.8,
            px: 2.5,
            '&:hover': { bgcolor: '#1E293B' }
          }}
        >
          Close Drawer
        </Button>
      </Box>
    </Drawer>
  );
}
