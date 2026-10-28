import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  Container,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  LifeBuoy,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  FileText,
  Phone,
  MessageCircle,
  ArrowLeft,
  Headphones
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const CUSTOMER_CATEGORIES = [
  { id: 'booking_dispute', label: 'Booking Dispute' },
  { id: 'delay_complaint', label: 'Technician Delay / No Show' },
  { id: 'payment_refund', label: 'Payment or Refund Issue' },
  { id: 'quality_issue', label: 'Service Quality Dispute' },
  { id: 'technician_behavior', label: 'Technician Conduct' },
  { id: 'reschedule_request', label: 'Emergency Reschedule' },
  { id: 'other', label: 'Other Support Query' }
];

const TECHNICIAN_CATEGORIES = [
  { id: 'duty_gps_issue', label: 'GPS / Radar Dispatch Issue' },
  { id: 'payout_delay', label: 'Payout / Commission Settlement' },
  { id: 'customer_unreachable', label: 'Customer Unreachable at Doorstep' },
  { id: 'booking_cancellation_dispute', label: 'Cancellation Dispute / Fake Booking' },
  { id: 'spare_part_approval', label: 'Spare Part Approval Delay' },
  { id: 'other', label: 'General Partner Support' }
];

export default function SupportHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryBookingId = searchParams.get('bookingId') || location.state?.bookingId || '';
  const queryCategory = searchParams.get('category') || location.state?.category || '';

  const { user, techUser } = useAuth();
  const isTechnician = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user') ||
    location.pathname.startsWith('/partner')
  );

  const role = isTechnician ? 'technician' : 'customer';
  const categories = isTechnician ? TECHNICIAN_CATEGORIES : CUSTOMER_CATEGORIES;

  const [activeTab, setActiveTab] = useState(0); // 0: 'create', 1: 'history'

  // Form Fields
  const [name, setName] = useState(user?.name || techUser?.name || '');
  const [phone, setPhone] = useState(user?.phone || techUser?.phone || '');
  const [category, setCategory] = useState(queryCategory || categories[0].id);
  const [bookingId, setBookingId] = useState(queryBookingId);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('normal');
  const [description, setDescription] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Existing Tickets History
  const [ticketsList, setTicketsList] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (user || techUser) {
      setName(user?.name || techUser?.name || '');
      setPhone(user?.phone || techUser?.phone || '');
    }
    if (queryBookingId) setBookingId(queryBookingId);
    if (queryCategory) setCategory(queryCategory);
    fetchUserTickets();
  }, [user, techUser, queryBookingId, queryCategory]);

  const fetchUserTickets = async () => {
    const userPhone = user?.phone || techUser?.phone || phone;
    if (!userPhone) return;
    setIsLoadingTickets(true);
    try {
      const cleanPhone = String(userPhone).replace(/[\s\-\(\)\+]/g, '').slice(-10);
      const res = await fetch(`${API_V1_URL}/tickets/user/${encodeURIComponent(cleanPhone)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const digitsOnly = String(phone || user?.phone || '').replace(/\D/g, '');
    const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please provide a valid 10-digit contact mobile number');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Please provide a short subject for the ticket');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe the issue in detail');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        creatorRole: role,
        creator_role: role,
        creatorName: name.trim() || user?.name || (isTechnician ? 'Technician' : 'Customer'),
        creator_name: name.trim() || user?.name || (isTechnician ? 'Technician' : 'Customer'),
        creatorPhone: cleanPhone,
        creator_phone: cleanPhone,
        phone: cleanPhone,
        bookingId: bookingId.trim() || null,
        booking_id: bookingId.trim() || null,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim()
      };

      const res = await fetch(`${API_V1_URL}/tickets/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.ticket) {
        setCreatedTicket(data.ticket);
        toast.success(`Support Ticket #${data.ticket.id} raised!`);
        fetchUserTickets();
      } else {
        setErrorMessage(data.error || 'Failed to submit ticket. Please check details and try again.');
      }
    } catch {
      setErrorMessage('Network error while connecting to central dispatch desk. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'resolved') {
      return (
        <Chip
          icon={<CheckCircle2 size={12} />}
          label="Resolved"
          size="small"
          sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: '11px', height: 22 }}
        />
      );
    }
    if (s === 'in_progress') {
      return (
        <Chip
          icon={<Clock size={12} />}
          label="In Progress"
          size="small"
          sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '11px', height: 22 }}
        />
      );
    }
    return (
      <Chip
        icon={<AlertCircle size={12} />}
        label="Open"
        size="small"
        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '11px', height: 22 }}
      />
    );
  };

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
          gap: 1.5
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
            Salem central support desk
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            24/7 resolution for bookings, disputes & emergency assistance
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7',
            flexShrink: 0
          }}
        >
          <Headphones size={20} />
        </Box>
      </Box>

      {/* Tabs navigation */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', px: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 46,
            '& .MuiTab-root': {
              minHeight: 46,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: '#64748B',
              '&.Mui-selected': { color: '#0284C7' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#0284C7', height: 3 }
          }}
        >
          <Tab icon={<Ticket size={16} />} iconPosition="start" label="Raise Support Ticket" />
          <Tab
            icon={<Clock size={16} />}
            iconPosition="start"
            label={`My Tickets (${ticketsList.length})`}
          />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {/* Quick Operations Callout */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '14px',
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldCheck size={18} color="#0284C7" />
            <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#0369A1' }}>
              Salem Operations Desk Hotline
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '12px', color: '#0C4A6E', lineHeight: 1.45 }}>
            Need immediate doorstep escalation or cancellation assistance? Connect with the central dispatch desk directly:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="tel:+919842100000"
              startIcon={<Phone size={14} />}
              sx={{
                borderRadius: '10px',
                borderColor: '#0284C7',
                color: '#0284C7',
                fontWeight: 700,
                fontSize: '12.5px',
                textTransform: 'none',
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#0369A1' }
              }}
            >
              Call Dispatch (+91 98421 00000)
            </Button>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="https://wa.me/919842100000?text=Hello%20SalemSeva%20Support"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<MessageCircle size={14} />}
              sx={{
                borderRadius: '10px',
                borderColor: '#16A34A',
                color: '#16A34A',
                fontWeight: 700,
                fontSize: '12.5px',
                textTransform: 'none',
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F0FDF4', borderColor: '#15803D' }
              }}
            >
              WhatsApp Support
            </Button>
          </Box>
        </Paper>

        {activeTab === 0 && (
          <Box>
            {createdTicket ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '1px solid #BBF7D0',
                  bgcolor: '#F0FDF4'
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <CheckCircle2 size={34} />
                </Box>
                <Typography sx={{ fontSize: '17px', fontWeight: 800, color: '#166534', mb: 0.8 }}>
                  Support Ticket #{createdTicket.id} Logged!
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#15803D', lineHeight: 1.5, mb: 2 }}>
                  Your request has been routed to our Salem Operations Team. A manager will inspect your booking details and call you shortly.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setCreatedTicket(null);
                      setSubject('');
                      setDescription('');
                      setActiveTab(1);
                    }}
                    sx={{
                      borderRadius: '12px',
                      bgcolor: '#0284C7',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#0369A1' }
                    }}
                  >
                    View Ticket Status
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCreatedTicket(null)}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#CBD5E1',
                      color: '#475569',
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    Raise Another Ticket
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                {errorMessage && (
                  <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {errorMessage}
                  </Alert>
                )}

                {/* Category Selection */}
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
                    Issue category *
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <Chip
                          key={cat.id}
                          label={cat.label}
                          onClick={() => setCategory(cat.id)}
                          clickable
                          sx={{
                            borderRadius: '10px',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '12px',
                            py: 2,
                            px: 0.5,
                            bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            border: isSelected ? '1px solid #0284C7' : '1px solid #E2E8F0',
                            '&:hover': { bgcolor: isSelected ? '#0369A1' : '#F1F5F9' }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Priority Selection */}
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
                    Urgency level
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[
                      { id: 'normal', label: 'Standard Query', color: '#64748B' },
                      { id: 'high', label: 'Urgent Issue', color: '#D97706' },
                      { id: 'critical', label: 'Doorstep Emergency', color: '#DC2626' }
                    ].map((p) => {
                      const isSelected = priority === p.id;
                      return (
                        <Chip
                          key={p.id}
                          label={p.label}
                          onClick={() => setPriority(p.id)}
                          clickable
                          sx={{
                            flex: 1,
                            borderRadius: '10px',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '12px',
                            py: 2,
                            bgcolor: isSelected ? (p.id === 'critical' ? '#DC2626' : p.id === 'high' ? '#D97706' : '#0284C7') : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            border: isSelected ? 'none' : '1px solid #E2E8F0',
                            '&:hover': { opacity: 0.9 }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Booking ID Input */}
                <TextField
                  label="Associated Booking ID (optional)"
                  placeholder="e.g., 10452"
                  fullWidth
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                  helperText="Leave empty if this is a general account or platform question"
                />

                {/* Subject Input */}
                <TextField
                  label="Ticket subject *"
                  placeholder="Brief summary of your query"
                  fullWidth
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                />

                {/* Description Input */}
                <TextField
                  label="Detailed description *"
                  placeholder="Provide complete details including technician name, address, or payment transaction..."
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                />

                {/* Contact Phone */}
                <TextField
                  label="Callback phone number *"
                  placeholder="10-digit mobile number"
                  fullWidth
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                />

                {/* Submit Action */}
                <Box sx={{ mt: 1, pb: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <Send size={18} />}
                    sx={{
                      minHeight: 50,
                      borderRadius: '12px',
                      bgcolor: '#0284C7',
                      fontWeight: 800,
                      fontSize: '15px',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                      '&:hover': { bgcolor: '#0369A1' }
                    }}
                  >
                    {isSubmitting ? 'Raising support ticket...' : 'Submit support ticket'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Ticket History */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                Your ticket history ({ticketsList.length})
              </Typography>
              <IconButton
                size="small"
                onClick={fetchUserTickets}
                disabled={isLoadingTickets}
                sx={{ color: '#0284C7' }}
              >
                <RefreshCw size={16} className={isLoadingTickets ? 'animate-spin' : ''} />
              </IconButton>
            </Box>

            {isLoadingTickets ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress size={32} sx={{ color: '#0284C7' }} />
                <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 1 }}>
                  Loading your support tickets...
                </Typography>
              </Box>
            ) : ticketsList.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF'
                }}
              >
                <FileText size={36} color="#94A3B8" />
                <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#334155', mt: 1.5, mb: 0.5 }}>
                  No support tickets found
                </Typography>
                <Typography sx={{ fontSize: '12.5px', color: '#64748B', mb: 2 }}>
                  You do not have any open or previous disputes recorded with this phone number.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveTab(0)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Raise a ticket now
                </Button>
              </Paper>
            ) : (
              ticketsList.map((ticket) => (
                <Paper
                  key={ticket.id}
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                        <Typography sx={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                          #{ticket.id} • {ticket.subject}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                        {ticket.category?.replace(/_/g, ' ')?.toUpperCase()} • {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Recent'}
                      </Typography>
                    </Box>
                    {getStatusChip(ticket.status)}
                  </Box>

                  <Typography sx={{ fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>
                    {ticket.description}
                  </Typography>

                  {ticket.booking_id && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', p: 1, borderRadius: '8px' }}>
                      <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>
                        Booking Reference: <strong>#{ticket.booking_id}</strong>
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
