import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  IconButton
} from '@mui/material';
import {
  LifeBuoy,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { API_V1_URL } from '../config';
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

export default function SupportTicketModal({
  open,
  onClose,
  defaultBookingId = '',
  defaultCategory = ''
}) {
  const { user } = useAuth();
  const isTechnician = user?.role === 'technician' || user?.role === 'partner';
  const role = isTechnician ? 'technician' : 'customer';
  const categories = isTechnician ? TECHNICIAN_CATEGORIES : CUSTOMER_CATEGORIES;

  // Active view tab: 'create' | 'list'
  const [activeTab, setActiveTab] = useState('create');

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState(defaultCategory || categories[0].id);
  const [bookingId, setBookingId] = useState(defaultBookingId || '');
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

  // Sync user info and default props when opened
  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name || '');
        setPhone(user.phone || '');
      }
      if (defaultBookingId) setBookingId(defaultBookingId);
      if (defaultCategory) setCategory(defaultCategory);
      setCreatedTicket(null);
      setErrorMessage('');
      fetchUserTickets();
    }
  }, [open, user, defaultBookingId, defaultCategory]);

  const fetchUserTickets = async () => {
    const userPhone = user?.phone || phone;
    if (!userPhone) return;
    setIsLoadingTickets(true);
    try {
      const cleanPhone = userPhone.replace(/[\s\-\(\)\+]/g, '').slice(-10);
      const res = await fetch(`${API_V1_URL}/tickets/user/${encodeURIComponent(cleanPhone)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets);
      }
    } catch {
      // Non-blocking fetch
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

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setCreatedTicket(data.ticket);
      toast.success(`Support Ticket ${data.ticket.ticket_number} created successfully!`);
      // Refresh tickets history
      fetchUserTickets();
    } catch (err) {
      const msg = err.message || 'An unexpected error occurred while submitting your ticket';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setBookingId(defaultBookingId || '');
    setCategory(defaultCategory || categories[0].id);
    setPriority('normal');
    setCreatedTicket(null);
    setErrorMessage('');
    setActiveTab('create');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <Chip
            size="small"
            icon={<CheckCircle2 size={13} color="#059669" />}
            label="Resolved"
            sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '11px', border: '1px solid #A7F3D0' }}
          />
        );
      case 'in_progress':
        return (
          <Chip
            size="small"
            icon={<Clock size={13} color="#0066CC" />}
            label="In Progress"
            sx={{ bgcolor: '#EFF6FF', color: '#0066CC', fontWeight: 800, fontSize: '11px', border: '1px solid #BFDBFE' }}
          />
        );
      case 'closed':
        return (
          <Chip
            size="small"
            label="Closed"
            sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '11px', border: '1px solid #CBD5E1' }}
          />
        );
      case 'open':
      default:
        return (
          <Chip
            size="small"
            icon={<AlertCircle size={13} color="#D97706" />}
            label="Open (Desk Review)"
            sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 800, fontSize: '11px', border: '1px solid #FDE68A' }}
          />
        );
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm">
      <ModalHeader
        title="Shazu One Support Desk"
        subtitle={
          isTechnician
            ? 'Technician Duty Assistance, Dispute Resolution & Escalation'
            : 'Customer Redressal, Booking Disputes & Quality Support'
        }
        icon={<LifeBuoy size={20} color="#0066CC" />}
        onClose={onClose}
      />

      {/* View Tabs */}
      <Box sx={{ px: 3, pt: 1.5, pb: 0, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
        <Button
          size="small"
          onClick={() => setActiveTab('create')}
          sx={{
            py: 0.8,
            px: 1.8,
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '12px',
            textTransform: 'none',
            color: activeTab === 'create' ? '#0066CC' : '#64748B',
            borderBottom: activeTab === 'create' ? '2.5px solid #0066CC' : '2.5px solid transparent',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          Raise New Ticket
        </Button>
        <Button
          size="small"
          onClick={() => {
            setActiveTab('list');
            fetchUserTickets();
          }}
          sx={{
            py: 0.8,
            px: 1.8,
            borderRadius: '8px 8px 0 0',
            fontWeight: 800,
            fontSize: '12px',
            textTransform: 'none',
            color: activeTab === 'list' ? '#0066CC' : '#64748B',
            borderBottom: activeTab === 'list' ? '2.5px solid #0066CC' : '2.5px solid transparent',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          My Tickets ({ticketsList.length})
        </Button>
      </Box>

      <ModalBody>
        {activeTab === 'create' ? (
          createdTicket ? (
            /* Success confirmation */
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0'
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5
                }}
              >
                <CheckCircle2 size={28} color="#059669" />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, fontSize: '16px' }}>
                Ticket Created Successfully
              </Typography>

              <Chip
                icon={<Ticket size={14} color="#0066CC" />}
                label={createdTicket.ticket_number}
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#0066CC',
                  fontWeight: 900,
                  fontSize: '14px',
                  py: 1,
                  px: 1.5,
                  my: 1.5,
                  border: '1px solid #BFDBFE'
                }}
              />

              <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px', mb: 2, maxWidth: '400px', mx: 'auto' }}>
                Your request has been prioritized and assigned to Shazu One Central Operations. Our desk agent will review and update you on{' '}
                <strong>+91 {createdTicket.creator_phone}</strong>.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetForm}
                  sx={{
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  File Another Ticket
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setActiveTab('list')}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#0066CC',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0052CC' }
                  }}
                >
                  View Status
                </Button>
              </Box>
            </Paper>
          ) : (
            /* Ticket Creation Form */
            <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {errorMessage && (
                <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '12.5px', py: 0.5 }}>
                  {errorMessage}
                </Alert>
              )}

              {/* Creator details */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    Your Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    InputProps={{ sx: { borderRadius: '10px', fontSize: '13px', height: '38px' } }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    Mobile Number (Required)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="10-digit mobile"
                    InputProps={{ sx: { borderRadius: '10px', fontSize: '13px', height: '38px' } }}
                  />
                </Box>
              </Box>

              {/* Category selector (Tokens & Chips - No Native Select) */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8, fontSize: '11.5px' }}>
                  Issue Category
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {categories.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <Chip
                        key={cat.id}
                        label={cat.label}
                        onClick={() => setCategory(cat.id)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '11.5px',
                          borderRadius: '8px',
                          bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          color: isSelected ? '#0066CC' : '#475569',
                          border: isSelected ? '1.5px solid #0066CC' : '1px solid #E2E8F0',
                          '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F1F5F9' }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Booking ID and Priority Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    Booking ID (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="e.g. SLM-84920"
                    InputProps={{ sx: { borderRadius: '10px', fontSize: '13px', height: '38px' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    Urgency Priority
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[
                      { id: 'normal', label: 'Normal' },
                      { id: 'high', label: 'High' },
                      { id: 'urgent', label: 'Urgent' }
                    ].map((p) => {
                      const isSelected = priority === p.id;
                      return (
                        <Button
                          key={p.id}
                          size="small"
                          type="button"
                          onClick={() => setPriority(p.id)}
                          sx={{
                            flex: 1,
                            p: '6px 0',
                            borderRadius: '8px',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '11px',
                            textTransform: 'none',
                            bgcolor: isSelected
                              ? p.id === 'urgent'
                                ? '#FEF2F2'
                                : p.id === 'high'
                                ? '#FFFBEB'
                                : '#EFF6FF'
                              : '#F8FAFC',
                            color: isSelected
                              ? p.id === 'urgent'
                                ? '#DC2626'
                                : p.id === 'high'
                                ? '#D97706'
                                : '#0066CC'
                              : '#64748B',
                            border: isSelected
                              ? p.id === 'urgent'
                                ? '1.5px solid #F87171'
                                : p.id === 'high'
                                ? '1.5px solid #FBBF24'
                                : '1.5px solid #60A5FA'
                              : '1px solid #E2E8F0'
                          }}
                        >
                          {p.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {/* Subject */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                  Issue Summary / Subject
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Technician delayed by 45 minutes without notice"
                  InputProps={{ sx: { borderRadius: '10px', fontSize: '13px', height: '38px' } }}
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                  Detailed Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly what happened, timestamps, and how our support team can assist you."
                  InputProps={{ sx: { borderRadius: '10px', fontSize: '13px' } }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send size={15} />}
                sx={{
                  bgcolor: '#0066CC',
                  color: '#FFFFFF',
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
                  '&:hover': { bgcolor: '#0052CC' }
                }}
              >
                {isSubmitting ? 'Submitting to Central Desk...' : 'Submit Support Ticket'}
              </Button>
            </Box>
          )
        ) : (
          /* View List of Past & Active Tickets */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '12px' }}>
                Showing tickets filed for +91 {(user?.phone || phone || '').slice(-10)}
              </Typography>
              <IconButton size="small" onClick={fetchUserTickets} disabled={isLoadingTickets}>
                <RefreshCw size={14} color="#64748B" />
              </IconButton>
            </Box>

            {isLoadingTickets ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={24} sx={{ color: '#0066CC', mb: 1 }} />
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Loading your tickets...
                </Typography>
              </Box>
            ) : ticketsList.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px dashed #CBD5E1'
                }}
              >
                <FileText size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                  No Support Tickets Found
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  You have not raised any active or past support tickets on this account.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setActiveTab('create')}
                  sx={{
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#0066CC',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  Raise a Ticket Now
                </Button>
              </Paper>
            ) : (
              ticketsList.map((ticket) => (
                <Paper
                  key={ticket.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0066CC', fontSize: '13px' }}>
                          {ticket.ticket_number}
                        </Typography>
                        {getStatusChip(ticket.status)}
                        {ticket.priority === 'urgent' && (
                          <Chip
                            size="small"
                            label="URGENT"
                            sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 900, fontSize: '10px', height: '20px' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                        {ticket.subject}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {new Date(ticket.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '12px', mb: 1, lineHeight: 1.4 }}>
                    {ticket.description}
                  </Typography>

                  {ticket.booking_id && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        size="small"
                        label={`Booking: ${ticket.booking_id}`}
                        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontSize: '10.5px', height: '20px' }}
                      />
                    </Box>
                  )}

                  {/* Resolution Notes Box if Resolved */}
                  {ticket.status === 'resolved' && ticket.resolution_notes && (
                    <Box
                      sx={{
                        p: 1.2,
                        mt: 1,
                        bgcolor: '#F0FDF4',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 0.3 }}>
                        Central Desk Resolution:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803D', display: 'block', lineHeight: 1.4 }}>
                        {ticket.resolution_notes}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <ShieldCheck size={16} color="#059669" />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
              Salem Operations Desk &bull; 100% Guaranteed Resolution
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={onClose}
            sx={{
              color: '#64748B',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'none'
            }}
          >
            Close
          </Button>
        </Box>
      </ModalFooter>
    </Modal>
  );
}
