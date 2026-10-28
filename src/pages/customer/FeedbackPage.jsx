import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Rating,
  CircularProgress,
  Paper,
  Alert,
  Container,
  IconButton
} from '@mui/material';
import {
  MessageSquare,
  Star,
  Bug,
  Calendar,
  CreditCard,
  Wrench,
  Lightbulb,
  Headphones,
  MapPin,
  CheckCircle,
  Send,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, techUser, rewardSettings, updateWalletBalance } = useAuth();

  const isTechnician = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user') ||
    location.pathname.startsWith('/partner')
  );

  const feedbackRewardCredits = parseFloat(rewardSettings?.feedback_reward_credits || 15);
  const feedbackCreditsEnabled = Boolean(rewardSettings?.feedback_rewards_enabled ?? true);

  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(isTechnician ? 'radar_gps' : 'app_glitch');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState(user?.name || techUser?.name || '');
  const [userPhone, setUserPhone] = useState(user?.phone || techUser?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const customerCategories = [
    { id: 'app_glitch', label: 'App glitch or freeze', icon: <Bug size={14} /> },
    { id: 'booking_slot', label: 'Booking & slot issue', icon: <Calendar size={14} /> },
    { id: 'pricing_payment', label: 'Pricing or payment', icon: <CreditCard size={14} /> },
    { id: 'technician_matching', label: 'Partner matching delay', icon: <Wrench size={14} /> },
    { id: 'feature_request', label: 'Feature suggestion', icon: <Lightbulb size={14} /> },
    { id: 'general', label: 'General feedback', icon: <Headphones size={14} /> }
  ];

  const technicianCategories = [
    { id: 'radar_gps', label: 'Duty radar & GPS', icon: <MapPin size={14} /> },
    { id: 'payout_settlement', label: 'Payout or commission', icon: <CreditCard size={14} /> },
    { id: 'quote_builder', label: 'Quote builder', icon: <Bug size={14} /> },
    { id: 'customer_contact', label: 'Masked contact issue', icon: <Headphones size={14} /> },
    { id: 'partner_idea', label: 'Platform suggestion', icon: <Lightbulb size={14} /> },
    { id: 'general', label: 'General partner feedback', icon: <Wrench size={14} /> }
  ];

  const categories = isTechnician ? technicianCategories : customerCategories;

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 1: return 'Very poor experience';
      case 2: return 'Facing difficulties';
      case 3: return 'Average / Needs improvement';
      case 4: return 'Good platform experience';
      case 5: return 'Excellent and reliable';
      default: return 'Rate platform experience';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please provide feedback details or issue description');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const payload = {
      userId: user?.id || techUser?.id || null,
      userName: userName.trim() || user?.name || (isTechnician ? 'Partner Specialist' : 'Customer'),
      userPhone: userPhone.trim() || user?.phone || '',
      role: isTechnician ? 'technician' : 'customer',
      feedbackType: category,
      rating: rating || 5,
      subject: subject.trim() || `${categories.find((c) => c.id === category)?.label || 'General Feedback'}`,
      message: message.trim(),
      locality: user?.locality || 'Salem'
    };

    try {
      const res = await fetch(`${API_V1_URL}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.newBalance !== undefined && updateWalletBalance) {
        updateWalletBalance(data.newBalance);
      }

      const saved = JSON.parse(localStorage.getItem('shazuone_feedbacks_list') || '[]');
      const newRecord = {
        ...payload,
        id: data.feedback?.id || Date.now(),
        creditsAwarded: data.creditsAwarded || 0,
        status: 'new',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('shazuone_feedbacks_list', JSON.stringify([newRecord, ...saved]));

      window.dispatchEvent(new CustomEvent('shazuone_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success(data.message || 'Feedback submitted successfully!');

      setTimeout(() => {
        handleDismiss();
      }, 1600);
    } catch (err) {
      console.warn('Backend feedback sync fallback to local store:', err);
      const saved = JSON.parse(localStorage.getItem('shazuone_feedbacks_list') || '[]');
      const newRecord = {
        ...payload,
        id: Date.now(),
        status: 'new',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('shazuone_feedbacks_list', JSON.stringify([newRecord, ...saved]));
      window.dispatchEvent(new CustomEvent('shazuone_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Feedback recorded safely!');

      setTimeout(() => {
        handleDismiss();
      }, 1600);
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
            Platform feedback desk
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Help improve Shazu One services across Salem
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16A34A',
            flexShrink: 0
          }}
        >
          <MessageSquare size={20} />
        </Box>
      </Box>

      {/* Main Form Content */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {isSuccess ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid #BBF7D0',
              bgcolor: '#F0FDF4'
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <CheckCircle size={36} />
            </Box>
            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#166534', mb: 1 }}>
              Feedback received with thanks!
            </Typography>
            <Typography sx={{ fontSize: '13.5px', color: '#15803D', lineHeight: 1.5, mb: 2 }}>
              Your feedback helps our Salem operations desk optimize service delivery and resolve bugs quickly.
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#475569' }}>
              Redirecting you back to your previous screen...
            </Typography>
          </Paper>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {feedbackCreditsEnabled && !isTechnician && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: '14px',
                  bgcolor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={18} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#0369A1' }}>
                    Earn ₹{feedbackRewardCredits} wallet credits
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#0C4A6E' }}>
                    Quality bug reports and constructive suggestions credit your wallet on review.
                  </Typography>
                </Box>
              </Paper>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {errorMessage}
              </Alert>
            )}

            {/* Star Rating Section */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#334155', mb: 1.2 }}>
                Overall platform satisfaction
              </Typography>
              <Rating
                name="platform-rating"
                value={rating}
                onChange={(_, val) => setRating(val || 5)}
                size="large"
                sx={{
                  color: '#F59E0B',
                  fontSize: '34px',
                  mb: 1
                }}
              />
              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#0284C7' }}>
                {getRatingLabel(rating)}
              </Typography>
            </Paper>

            {/* Category Chips */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1.2 }}>
                What would you like to report?
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      icon={cat.icon}
                      label={cat.label}
                      onClick={() => setCategory(cat.id)}
                      clickable
                      sx={{
                        borderRadius: '10px',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12.5px',
                        py: 2.2,
                        px: 0.5,
                        bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1px solid #0284C7' : '1px solid #E2E8F0',
                        boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.22)' : 'none',
                        '& .MuiChip-icon': {
                          color: isSelected ? '#FFFFFF' : '#64748B'
                        },
                        '&:hover': {
                          bgcolor: isSelected ? '#0369A1' : '#F1F5F9'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Subject Input */}
            <TextField
              label="Brief subject / issue title (optional)"
              placeholder="e.g., GPS radar taking 2 minutes to locate Fairlands site"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              InputProps={{
                sx: { borderRadius: '12px', bgcolor: '#FFFFFF' }
              }}
            />

            {/* Message Details */}
            <TextField
              label="Feedback description / Details *"
              placeholder="Please describe what happened, what you expected, or suggestions for the Salem team..."
              fullWidth
              multiline
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                sx: { borderRadius: '12px', bgcolor: '#FFFFFF' }
              }}
            />

            {/* Contact Details */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <TextField
                label="Your name"
                size="small"
                fullWidth
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                InputProps={{ sx: { borderRadius: '10px' } }}
              />
              <TextField
                label="Contact phone (for follow-up)"
                size="small"
                fullWidth
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                InputProps={{ sx: { borderRadius: '10px' } }}
              />
            </Paper>

            {/* Submit Action Button */}
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
                {isSubmitting ? 'Submitting feedback...' : 'Send feedback to Salem Ops'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
