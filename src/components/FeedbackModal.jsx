import { API_V1_URL } from '../config';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Rating,
  CircularProgress,
  Paper,
  Alert
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
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

export default function FeedbackModal({ open, onClose, user, userRole = 'customer' }) {
  const { rewardSettings, updateWalletBalance } = useAuth();
  const feedbackRewardCredits = parseFloat(rewardSettings?.feedback_reward_credits || 15);
  const feedbackCreditsEnabled = Boolean(rewardSettings?.feedback_rewards_enabled ?? true);
  const isTechnician = userRole === 'technician' || userRole === 'partner';
  
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(isTechnician ? 'radar_gps' : 'app_glitch');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState(user?.name || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      setError('Please provide feedback details or issue description');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const payload = {
      userId: user?.id || null,
      userName: userName.trim() || user?.name || (isTechnician ? 'Partner' : 'Customer'),
      userPhone: userPhone.trim() || user?.phone || '',
      role: isTechnician ? 'technician' : 'customer',
      feedbackType: category,
      rating: rating || 5,
      subject: subject.trim() || `${categories.find(c => c.id === category)?.label || 'General Feedback'}`,
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

      window.dispatchEvent(new CustomEvent('Shazu One_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        handleModalClose();
      }, 1800);
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
      window.dispatchEvent(new CustomEvent('Shazu One_new_feedback_received', { detail: newRecord }));
      window.dispatchEvent(new Event('storage'));

      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        handleModalClose();
      }, 1800);
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
    <Modal open={open} onClose={handleModalClose} maxWidth="sm" ariaLabelledBy="feedback-modal-title">
      <ModalHeader
        id="feedback-modal-title"
        title={isTechnician ? 'Partner feedback' : 'Platform feedback'}
        subtitle="Direct to Shazu One Central Operations Desk"
        onClose={handleModalClose}
        icon={<MessageSquare size={20} color="#0A66C2" />}
      />

      <ModalBody>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BBF7D0'
              }}
            >
              <CheckCircle size={32} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px' }}>
              Thank you for your feedback
            </Typography>
            {feedbackCreditsEnabled && feedbackRewardCredits > 0 && (
              <Chip
                label={`+${feedbackRewardCredits} Seva credits added to wallet`}
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '12px', height: 26, borderRadius: '9999px' }}
              />
            )}
            <Typography sx={{ color: '#64748B', fontSize: '13px', maxWidth: '360px', lineHeight: 1.5 }}>
              Your feedback has been sent to our Salem Operations Desk. Our team reviews every report.
            </Typography>
          </Box>
        ) : (
          <Box component="form" id="feedback-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '13px' }}>
                {error}
              </Alert>
            )}

            {/* User Info Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                {userName || (isTechnician ? 'Partner' : 'Customer')} {userPhone ? `(${userPhone})` : ''}
              </Typography>
              <Chip
                label={isTechnician ? 'Partner' : 'Customer'}
                size="small"
                sx={{
                  bgcolor: isTechnician ? '#DCFCE7' : '#EFF6FF',
                  color: isTechnician ? '#166534' : '#0A66C2',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: 24,
                  borderRadius: '9999px'
                }}
              />
            </Paper>

            {/* 1. Star Rating */}
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 1 }}>
                How would you rate your platform experience?
              </Typography>
              <Rating
                value={rating}
                onChange={(e, val) => setRating(val || 5)}
                size="large"
                emptyIcon={<Star style={{ opacity: 0.3 }} fontSize="inherit" />}
                sx={{
                  color: '#F59E0B',
                  '& .MuiRating-iconFilled': { color: '#F59E0B' },
                  '& .MuiRating-iconHover': { color: '#D97706' }
                }}
              />
              <Typography sx={{ mt: 0.5, fontWeight: 600, fontSize: '12px', color: rating <= 2 ? '#DC2626' : rating === 3 ? '#D97706' : '#16A34A' }}>
                {getRatingLabel(rating)}
              </Typography>
            </Box>

            {/* 2. Issue Category */}
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 1 }}>
                Select category
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                        fontWeight: 600,
                        fontSize: '12px',
                        borderRadius: '9999px',
                        height: 36,
                        px: 1,
                        bgcolor: isSelected ? '#0A66C2' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? 'none' : '1px solid #E2E8F0',
                        '& .MuiChip-icon': {
                          color: isSelected ? '#FFFFFF !important' : '#64748B !important'
                        },
                        '&:hover': {
                          bgcolor: isSelected ? '#084E96' : '#E2E8F0'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* 3. Short Subject */}
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 0.5 }}>
                Title (optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={isTechnician ? "e.g. GPS coordinates inaccurate near Hasthampatti" : "e.g. Booking screen took long to load"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '13px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
            </Box>

            {/* 4. Detailed Description */}
            <Box>
              <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 0.5 }}>
                Describe your issue or suggestion *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={isTechnician ? "Tell us what happened, when it occurred, or any issues with earnings..." : "Tell us about any error, delay, feature idea, or feedback..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '13px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        {success ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleModalClose}
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFFFFF',
              borderRadius: '14px',
              height: 48,
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#084E96' }
            }}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleModalClose}
              disabled={isSubmitting}
              sx={{
                color: '#64748B',
                borderColor: '#E2E8F0',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '13px',
                borderRadius: '12px',
                minHeight: 44,
                px: 2,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }
              }}
            >
              Cancel
            </Button>

            <Button
              form="feedback-form"
              type="submit"
              variant="contained"
              disabled={isSubmitting || !message.trim()}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
              sx={{
                bgcolor: '#0A66C2',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '14px',
                borderRadius: '14px',
                minHeight: 48,
                px: 2.5,
                '&:hover': { bgcolor: '#084E96' },
                '&:disabled': { bgcolor: '#CBD5E1', color: '#94A3B8' }
              }}
            >
              {isSubmitting ? 'Sending...' : 'Submit feedback'}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
