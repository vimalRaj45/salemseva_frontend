import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  LifeBuoy,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AuthHelpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') || location.state?.role || 'customer';
  const [role, setRole] = useState(defaultRole);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('otp_issue');
  const [details, setDetails] = useState('');
  const [locality, setLocality] = useState('Salem');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const categories = [
    { id: 'otp_issue', label: 'OTP Not Received' },
    { id: 'account_blocked', label: 'Account Blocked / KYC' },
    { id: 'phone_changed', label: 'Phone Number Lost / Changed' },
    { id: 'app_trouble', label: 'Duty App / Technical Trouble' },
    { id: 'general_auth', label: 'Other Login Problem' }
  ];

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const cleanPhone = String(phone).trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!details.trim()) {
      toast.error('Please describe the issue you are facing');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === category)?.label || 'Login Issue';
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}`;

      const res = await fetch(`${API_V1_URL}/tickets/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorRole: role,
          creatorName: fullName.trim() || (role === 'technician' ? 'Partner Specialist' : 'Customer'),
          creatorPhone: formattedPhone,
          category: `auth_${category}`,
          priority: category === 'account_blocked' ? 'urgent' : 'high',
          subject: `${selectedCat} on ${role === 'technician' ? 'Partner' : 'Customer'} Login`,
          description: details.trim(),
          locality: locality || 'Salem'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit issue report');
      }

      setSubmittedTicket(data.ticket);
      toast.success(`Support ticket ${data.ticketNumber || data.ticket?.id} registered!`);
    } catch (err) {
      console.error('Auth help submission error:', err);
      toast.error(err.message || 'Could not submit support request');
    } finally {
      setIsSubmitting(false);
    }
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
            Login & account recovery
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Salem Central Operations instant access assistance
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
          <HelpCircle size={20} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {/* Quick Hotlines Banner */}
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
            Need an immediate bypass code or manual account unlock? Contact dispatch operators directly:
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
              Call Hotline (+91 98421 00000)
            </Button>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="https://wa.me/919842100000?text=Hello%20SalemSeva%20Login%20Help"
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

        {submittedTicket ? (
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
              Recovery Ticket #{submittedTicket.ticket_number || submittedTicket.id} Logged!
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#15803D', lineHeight: 1.5, mb: 2 }}>
              A central operations manager is reviewing your login profile and will dispatch an SMS or call you directly.
            </Typography>
            <Button
              variant="contained"
              onClick={handleDismiss}
              sx={{
                borderRadius: '12px',
                bgcolor: '#0284C7',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              Return to Login Screen
            </Button>
          </Paper>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
            {/* Account Role Selector */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
                Account type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { id: 'customer', label: 'Customer Account' },
                  { id: 'technician', label: 'Partner Specialist / Technician' }
                ].map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <Chip
                      key={r.id}
                      label={r.label}
                      onClick={() => setRole(r.id)}
                      clickable
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12.5px',
                        py: 2.2,
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

            {/* Category Chips */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
                What trouble are you experiencing?
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

            {/* Phone Input */}
            <TextField
              label="Registered Mobile Number *"
              placeholder="10-digit mobile number"
              fullWidth
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            {/* Full Name */}
            <TextField
              label="Your Full Name (optional)"
              placeholder="e.g. Anand M."
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            {/* Details Description */}
            <TextField
              label="Problem Description *"
              placeholder="e.g. Waiting for SMS OTP since 5 minutes, phone has full signal in Fairlands..."
              fullWidth
              multiline
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
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
                {isSubmitting ? 'Registering request...' : 'Submit recovery request'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
