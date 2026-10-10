import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Rating,
  CircularProgress,
  Paper,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandymanIcon from '@mui/icons-material/Handyman';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export default function FeedbackModal({ open, onClose, user, userRole = 'customer' }) {
  const isTechnician = userRole === 'technician' || userRole === 'partner';
  
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(isTechnician ? 'radar_gps' : 'app_glitch');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [userName, setUserName] = useState(user?.name || (isTechnician ? 'K. Ramesh (Partner)' : 'Vimal Raj'));
  const [userPhone, setUserPhone] = useState(user?.phone || '+91 98427 11234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const customerCategories = [
    { id: 'app_glitch', label: 'App Glitch / Freeze', icon: <BugReportIcon fontSize="small" /> },
    { id: 'booking_slot', label: 'Booking & Slot Issue', icon: <CalendarMonthIcon fontSize="small" /> },
    { id: 'pricing_payment', label: 'Pricing or Payment Issue', icon: <PaymentIcon fontSize="small" /> },
    { id: 'technician_matching', label: 'Technician Matching Delay', icon: <HandymanIcon fontSize="small" /> },
    { id: 'feature_request', label: 'Feature Suggestion', icon: <LightbulbIcon fontSize="small" /> },
    { id: 'general', label: 'General Feedback', icon: <SupportAgentIcon fontSize="small" /> }
  ];

  const technicianCategories = [
    { id: 'radar_gps', label: 'Duty Radar / GPS Location', icon: <GpsFixedIcon fontSize="small" /> },
    { id: 'payout_settlement', label: 'Payout / Commission Query', icon: <PaymentIcon fontSize="small" /> },
    { id: 'quote_builder', label: 'Quote Builder / Invoice Bug', icon: <BugReportIcon fontSize="small" /> },
    { id: 'customer_contact', label: 'Masked Call / Contact Issue', icon: <SupportAgentIcon fontSize="small" /> },
    { id: 'partner_idea', label: 'Partner Platform Suggestion', icon: <LightbulbIcon fontSize="small" /> },
    { id: 'general', label: 'General Partner Feedback', icon: <HandymanIcon fontSize="small" /> }
  ];

  const categories = isTechnician ? technicianCategories : customerCategories;

  const getRatingLabel = (val) => {
    switch (val) {
      case 1: return 'Very Poor / Critical Bug';
      case 2: return 'Facing Difficulties';
      case 3: return 'Average / Needs Improvement';
      case 4: return 'Good Platform Experience';
      case 5: return 'Excellent & Highly Reliable';
      default: return 'Rate Platform Experience';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide feedback details or issue description');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const payload = {
      userId: user?.id || (isTechnician ? 'tech-ramesh' : 'usr-cust-001'),
      userName: userName.trim() || (isTechnician ? 'Salem Technician' : 'Salem Customer'),
      userPhone: userPhone.trim() || '+91 98427 11234',
      role: isTechnician ? 'technician' : 'customer',
      feedbackType: category,
      rating: rating || 5,
      subject: subject.trim() || `${categories.find(c => c.id === category)?.label || 'General Feedback'}`,
      message: message.trim(),
      locality: user?.locality || 'Fairlands, Salem'
    };

    try {
      const res = await fetch('https://salemseva-backend.onrender.com/api/v1/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      // Store in localStorage backup as well
      const saved = JSON.parse(localStorage.getItem('salemseva_feedbacks_list') || '[]');
      const newRecord = {
        ...payload,
        id: data.feedback?.id || Date.now(),
        status: 'new',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('salemseva_feedbacks_list', JSON.stringify([newRecord, ...saved]));

      // Dispatch global event so Admin dashboard updates immediately
      window.dispatchEvent(new CustomEvent('salemseva_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        handleModalClose();
      }, 2000);
    } catch (err) {
      console.warn('Backend feedback sync fallback to local store:', err);
      // Offline fallback
      const saved = JSON.parse(localStorage.getItem('salemseva_feedbacks_list') || '[]');
      const newRecord = {
        ...payload,
        id: Date.now(),
        status: 'new',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('salemseva_feedbacks_list', JSON.stringify([newRecord, ...saved]));
      window.dispatchEvent(new CustomEvent('salemseva_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        handleModalClose();
      }, 2000);
    }
  };

  const handleModalClose = () => {
    setMessage('');
    setSubject('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: isTechnician ? '#ECFDF5' : '#EFF6FF',
              color: isTechnician ? '#059669' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isTechnician ? <HandymanIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', lineHeight: 1.2 }}>
              {isTechnician ? 'Technician Platform Feedback' : 'Customer Platform Feedback'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
              Direct line to Salem Central Operations Desk (HQ)
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={handleModalClose} sx={{ color: '#64748B' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '2px solid #A7F3D0'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Thank You for Your Feedback!
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: '340px', margin: '0 auto' }}>
              Your report has been forwarded directly to the Salem Operations Admin Dashboard. Our central operations team will review it immediately.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '12.5px' }}>{error}</Alert>}

            {/* Role Indicator Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                mb: 2,
                borderRadius: '10px',
                bgcolor: isTechnician ? '#F0FDF4' : '#EFF6FF',
                border: isTechnician ? '1px solid #BBF7D0' : '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={isTechnician ? 'PARTNER PRO FLEET' : 'REGISTERED CUSTOMER'}
                  size="small"
                  sx={{
                    bgcolor: isTechnician ? '#10B981' : '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '10px',
                    height: 20
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {userName} ({userPhone})
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                Salem HQ
              </Typography>
            </Paper>

            {/* 1. Star Rating */}
            <Box sx={{ mb: 2.5, textAlign: 'center', p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.8, textTransform: 'uppercase' }}>
                How would you rate your platform experience?
              </Typography>
              <Rating
                value={rating}
                onChange={(e, val) => setRating(val || 5)}
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                sx={{
                  color: '#F59E0B',
                  '& .MuiRating-iconFilled': { color: '#F59E0B' },
                  '& .MuiRating-iconHover': { color: '#D97706' }
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 700, color: rating <= 2 ? '#DC2626' : rating === 3 ? '#D97706' : '#16A34A' }}>
                {getRatingLabel(rating)}
              </Typography>
            </Box>

            {/* 2. Feedback Issue Category Chips */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, textTransform: 'uppercase' }}>
              Select What You Want to Report:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2.5 }}>
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <Chip
                    key={c.id}
                    icon={c.icon}
                    label={c.label}
                    clickable
                    onClick={() => setCategory(c.id)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '11.5px',
                      borderRadius: '8px',
                      py: 1.8,
                      bgcolor: isSelected ? (isTechnician ? '#10B981' : '#2563EB') : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      border: isSelected ? 'none' : '1px solid #CBD5E1',
                      '& .MuiChip-icon': {
                        color: isSelected ? '#FFFFFF !important' : '#64748B !important'
                      },
                      '&:hover': {
                        bgcolor: isSelected ? (isTechnician ? '#059669' : '#1D4ED8') : '#E2E8F0'
                      }
                    }}
                  />
                );
              })}
            </Box>

            {/* 3. Subject / Title */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.5 }}>
              Short Title (Optional):
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={isTechnician ? "e.g. GPS coordinates inaccurate near Hasthampatti" : "e.g. Booking screen took long to load"}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13px', bgcolor: '#F8FAFC' } }}
            />

            {/* 4. Detailed Description */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.5 }}>
              Describe the problem or suggestion in detail: *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={isTechnician ? "Tell us what happened, when it occurred, or any issues with earnings/jobs..." : "Tell us about any error, delay, feature idea, or feedback..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '13px', bgcolor: '#F8FAFC' } }}
            />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mb: 2 }}>
              Submitted feedbacks are forwarded in real time to the Salem Central Admin Operations Desk.
            </Typography>

            <DialogActions sx={{ px: 0, pb: 0 }}>
              <Button onClick={handleModalClose} sx={{ color: '#64748B', fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !message.trim()}
                startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#FFF' }} /> : <SendIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: isTechnician ? '#10B981' : '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '10px',
                  px: 2.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isTechnician ? '#059669' : '#1D4ED8' }
                }}
              >
                {isSubmitting ? 'Sending...' : 'Submit to Admin Desk'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
