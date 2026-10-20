import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { API_V1_URL } from '../config';
import toast from 'react-hot-toast';

export default function AdminPortal({ onResolveTicket }) {
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicketToResolve, setSelectedTicketToResolve] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/tickets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setSupportTickets(data.tickets);
      }
    } catch {
      // Non-blocking fetch
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenResolve = (ticket) => {
    setSelectedTicketToResolve(ticket);
    setResolutionSummary(ticket.resolution_notes || '');
    setAdminNotes(ticket.admin_notes || '');
  };

  const handleConfirmResolve = async (status = 'resolved') => {
    if (!selectedTicketToResolve) return;
    if (!resolutionSummary.trim()) {
      toast.error('Please enter a resolution summary before marking as resolved');
      return;
    }

    setIsSubmittingResolution(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/tickets/${selectedTicketToResolve.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolutionSummary: resolutionSummary.trim(),
          adminNotes: adminNotes.trim(),
          resolvedBy: 'Shazu One Central Operations Desk (Anand Lead)'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update ticket');
      }

      toast.success(`Ticket ${selectedTicketToResolve.ticket_number} marked as ${status}!`);
      setSelectedTicketToResolve(null);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || 'Error updating ticket');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const openTicketsCount = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', p: 3, bgcolor: '#0B1120', color: '#FFF' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon /> Shazu One Operations & Quality Desk
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Salem City Live Dispatch & Escrow Settlement Monitor • Anand (Ops Lead)
          </Typography>
        </Box>
        <Chip icon={<HubIcon sx={{ color: '#10B981 !important' }} />} label="SALEM DISPATCH ONLINE" color="success" />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>ACTIVE BOOKINGS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#38BDF8', my: 0.5 }}>14</Typography>
              <Typography variant="caption" sx={{ color: '#34D399' }}>Fairlands & Hasthampatti</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>ONLINE TECHS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', my: 0.5 }}>38</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Govt KYC Verified</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>TODAY'S GMV</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', my: 0.5 }}>₹42,850</Typography>
              <Typography variant="caption" sx={{ color: '#F59E0B' }}>Razorpay Escrow</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>REPEAT CUST RATE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#A855F7', my: 0.5 }}>41.2%</Typography>
              <Typography variant="caption" sx={{ color: '#C4B5FD' }}>Shazu One Loyalty</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF', border: openTicketsCount > 0 ? '1.5px solid #EA580C' : '1px solid #334155' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#F97316' }}>OPEN SUPPORT TICKETS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#EA580C', my: 0.5 }}>{openTicketsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#FB923C' }}>Customer & Partner Redressal</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Support & Redressal Tickets Queue */}
      <Card sx={{ bgcolor: '#1E293B', color: '#FFF', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportAgentIcon /> Live Customer & Partner Support Desk Queue
            </Typography>
            <IconButton size="small" onClick={fetchTickets} sx={{ color: '#94A3B8' }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {loadingTickets ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#38BDF8' }} />
            </Box>
          ) : supportTickets.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#0F172A', border: '1px dashed #334155', borderRadius: '10px' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                No support tickets currently in queue. All customer and partner queries resolved.
              </Typography>
            </Paper>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#94A3B8', borderColor: '#334155' } }}>
                  <TableCell>Ticket #</TableCell>
                  <TableCell>Reporter & Role</TableCell>
                  <TableCell>Category & Booking</TableCell>
                  <TableCell>Subject & Issue</TableCell>
                  <TableCell>Status & Priority</TableCell>
                  <TableCell>Resolution Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supportTickets.map(t => (
                  <TableRow key={t.id} sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                    <TableCell>
                      <Chip label={t.ticket_number} size="small" sx={{ bgcolor: '#0369A1', color: '#E0F2FE', fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <strong>{t.creator_name}</strong>
                      <br />
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        +91 {t.creator_phone} • {t.creator_role ? t.creator_role.toUpperCase() : 'USER'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={t.category.replace(/_/g, ' ')} size="small" sx={{ bgcolor: '#334155', color: '#F1F5F9', fontSize: '11px' }} />
                      {t.booking_id && (
                        <Typography variant="caption" sx={{ color: '#38BDF8', display: 'block', mt: 0.5 }}>
                          #{t.booking_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12px' }}>
                        {t.subject}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '11px', lineHeight: 1.3 }}>
                        {t.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                        <Chip
                          label={t.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: t.status === 'resolved' ? '#065F46' : t.status === 'in_progress' ? '#1E3A8A' : '#7C2D12',
                            color: t.status === 'resolved' ? '#6EE7B7' : t.status === 'in_progress' ? '#93C5FD' : '#FED7AA',
                            fontWeight: 800,
                            fontSize: '10px'
                          }}
                        />
                        {t.priority === 'urgent' && (
                          <Chip label="URGENT" size="small" sx={{ bgcolor: '#991B1B', color: '#FEE2E2', fontWeight: 900, fontSize: '9px', height: 18 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {t.status === 'resolved' ? (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700, display: 'block' }}>
                            Resolved
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                            {t.resolution_notes}
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenResolve(t)}
                          sx={{
                            bgcolor: '#0284C7',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '11px',
                            textTransform: 'none',
                            py: 0.4,
                            px: 1.2,
                            borderRadius: '6px',
                            '&:hover': { bgcolor: '#0369A1' }
                          }}
                        >
                          Resolve & Redress
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Razorpay Route 85/15 Split Settlement Inspector */}
      <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <MonetizationOnIcon /> Razorpay Route 85/15 Financial Settlement Inspector
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: '#94A3B8', borderColor: '#334155' } }}>
                <TableCell>Job ID</TableCell>
                <TableCell>Gross Customer Paid</TableCell>
                <TableCell>Technician Share (85% + Visit)</TableCell>
                <TableCell>Shazu One Commission (15%)</TableCell>
                <TableCell>Escrow Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                <TableCell>SLM-84920</TableCell>
                <TableCell>₹899.00</TableCell>
                <TableCell sx={{ color: '#34D399', fontWeight: 700 }}>₹779.00 (Direct IMPS)</TableCell>
                <TableCell sx={{ color: '#38BDF8', fontWeight: 700 }}>₹120.00</TableCell>
                <TableCell><Chip label="RELEASED TO TECH" size="small" color="success" /></TableCell>
              </TableRow>
              <TableRow sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                <TableCell>SLM-84912</TableCell>
                <TableCell>₹549.00</TableCell>
                <TableCell sx={{ color: '#34D399', fontWeight: 700 }}>₹481.50 (Direct IMPS)</TableCell>
                <TableCell sx={{ color: '#38BDF8', fontWeight: 700 }}>₹67.50</TableCell>
                <TableCell><Chip label="RELEASED TO TECH" size="small" color="success" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Ticket Resolution Modal */}
      <Dialog
        open={Boolean(selectedTicketToResolve)}
        onClose={() => setSelectedTicketToResolve(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0F172A', color: '#FFF', borderRadius: '12px', border: '1px solid #334155' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', color: '#38BDF8', pb: 1 }}>
          Resolve Support Ticket {selectedTicketToResolve?.ticket_number}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ p: 1.5, bgcolor: '#1E293B', borderRadius: '8px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E2E8F0', mb: 0.3 }}>
              {selectedTicketToResolve?.subject}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
              Filed by {selectedTicketToResolve?.creator_name} (+91 {selectedTicketToResolve?.creator_phone})
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 1, fontSize: '12px' }}>
              {selectedTicketToResolve?.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Resolution Notes (Visible to Customer / Technician):
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="e.g. Free warranty revisit dispatched with senior technician. Refund processed to customer wallet."
              InputProps={{
                sx: {
                  bgcolor: '#1E293B',
                  color: '#FFF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#334155' }
                }
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 0.5 }}>
              Internal Admin Audit Notes (Internal Only):
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Technician reprimanded for late arrival; verified with GPS log."
              InputProps={{
                sx: {
                  bgcolor: '#1E293B',
                  color: '#FFF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#334155' }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #1E293B' }}>
          <Button
            onClick={() => setSelectedTicketToResolve(null)}
            sx={{ color: '#94A3B8', textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSubmittingResolution}
            onClick={() => handleConfirmResolve('resolved')}
            startIcon={isSubmittingResolution ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#059669',
              color: '#FFF',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            {isSubmittingResolution ? 'Submitting...' : 'Mark as Resolved'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

