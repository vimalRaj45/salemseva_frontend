import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { API_V1_URL } from '../config';
import toast from 'react-hot-toast';

export default function AuthHelpModal({ open, onClose, defaultRole = 'customer' }) {
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
      const selectedCat = categories.find(c => c.id === category)?.label || 'Login Issue';
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
      toast.success(`Support ticket ${data.ticketNumber} registered!`);
    } catch (err) {
      console.error('Auth help submission error:', err);
      toast.error(err.message || 'Could not submit support request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedTicket(null);
    setDetails('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SupportAgentIcon sx={{ color: '#0284C7', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', lineHeight: 1.2 }}>
              Salem Central Support Desk
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
              Instant Login & Access Recovery Assistance
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          onClick={handleClose}
          sx={{ minWidth: 32, width: 32, height: 32, p: 0, color: '#64748B', borderRadius: '50%' }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {submittedTicket ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Ticket Registered: {submittedTicket.ticket_number}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '13.5px', px: 2 }}>
              Your login assistance ticket has been dispatched to Salem Central Operations Desk.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', mb: 2, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Mobile Number:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>{submittedTicket.creator_phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Issue Category:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284C7' }}>{submittedTicket.subject}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Response SLA:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>Within 15 Minutes (Voice / SMS)</Typography>
              </Box>
            </Paper>

            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
              Need immediate urgent assistance? Call Salem Central Desk helpline directly: <strong>0427-2448899</strong>
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{ bgcolor: '#0284C7', color: '#FFFFFF', borderRadius: '8px', fontWeight: 800, py: 1, textTransform: 'none' }}
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            {/* Account Type Selector (No native select) */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', fontSize: '11px', display: 'block', mb: 0.8 }}>
                Select Account Role:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    onClick={() => setRole('customer')}
                    sx={{
                      p: 1.2,
                      textAlign: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: role === 'customer' ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                      bgcolor: role === 'customer' ? '#F0F9FF' : '#FFFFFF'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: role === 'customer' ? 800 : 600, color: role === 'customer' ? '#0369A1' : '#475569', fontSize: '13px' }}>
                      Customer Account
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    onClick={() => setRole('technician')}
                    sx={{
                      p: 1.2,
                      textAlign: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: role === 'technician' ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                      bgcolor: role === 'technician' ? '#F0F9FF' : '#FFFFFF'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: role === 'technician' ? 800 : 600, color: role === 'technician' ? '#0369A1' : '#475569', fontSize: '13px' }}>
                      Technician / Partner
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Mobile Number & Name */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '11px', display: 'block', mb: 0.5 }}>
                  Mobile Phone Number *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 9842711234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13.5px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '11px', display: 'block', mb: 0.5 }}>
                  Your Name (Optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Vimal Raj"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13.5px' } }}
                />
              </Grid>
            </Grid>

            {/* Problem Category Buttons (No native select) */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', fontSize: '11px', display: 'block', mb: 0.8 }}>
                Select Problem Category:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {categories.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <Chip
                      key={c.id}
                      label={c.label}
                      onClick={() => setCategory(c.id)}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12px',
                        py: 1.8,
                        bgcolor: isSelected ? '#0284C7' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                        '&:hover': {
                          bgcolor: isSelected ? '#0369A1' : '#E2E8F0'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Description */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '11px', display: 'block', mb: 0.5 }}>
                Describe what happened *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g. Trying to log in with 9842711234 since 10 AM, OTP SMS is not coming, please assist..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13.5px' } }}
              />
            </Box>

            <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <Typography variant="caption" sx={{ color: '#1E3A8A', fontSize: '11.5px', lineHeight: 1.45 }}>
                Salem Central Support Desk monitors this queue 24/7. Filing this ticket immediately alerts our duty supervisor to assist your number.
              </Typography>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 800,
                py: 1.2,
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              {isSubmitting ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Submit Support Request'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
