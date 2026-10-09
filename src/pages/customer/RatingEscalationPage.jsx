import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Rating,
  Chip,
  Button,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  Alert
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SecurityIcon from '@mui/icons-material/Security';

import { ApiService } from '../../services/api';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useAuth } from '../../context/AuthContext';

export default function RatingEscalationPage() {
  const navigate = useNavigate();
  const { creditWallet } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'SLM-84920';

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['fast', 'oem', 'clean', 'transparent']);
  const [feedbackText, setFeedbackText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Compliments for high ratings (4-5 stars)
  const compliments = [
    { id: 'fast', label: 'Super Fast Arrival', icon: <BoltIcon sx={{ fontSize: 16, color: '#D97706' }} /> },
    { id: 'oem', label: 'Genuine OEM Parts', icon: <VerifiedIcon sx={{ fontSize: 16, color: '#2563EB' }} /> },
    { id: 'clean', label: 'Clean & Tidy Workplace', icon: <CleaningServicesIcon sx={{ fontSize: 16, color: '#16A34A' }} /> },
    { id: 'transparent', label: 'Transparent Pricing', icon: <ReceiptLongIcon sx={{ fontSize: 16, color: '#D97706' }} /> },
    { id: 'tamil', label: 'Polite Tamil Explanation', icon: <RecordVoiceOverIcon sx={{ fontSize: 16, color: '#2563EB' }} /> }
  ];

  // Issue tags for low ratings (1-3 stars)
  const issueTags = [
    { id: 'late', label: 'Arrived Very Late', icon: <AccessTimeIcon sx={{ fontSize: 16, color: '#DC2626' }} /> },
    { id: 'incomplete', label: 'Problem Not Fully Solved', icon: <BuildCircleIcon sx={{ fontSize: 16, color: '#DC2626' }} /> },
    { id: 'pricing', label: 'High / Unexpected Charges', icon: <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#DC2626' }} /> },
    { id: 'behavior', label: 'Unprofessional Behavior', icon: <ReportProblemIcon sx={{ fontSize: 16, color: '#DC2626' }} /> },
    { id: 'messy', label: 'Left Workspace Messy', icon: <CleaningServicesIcon sx={{ fontSize: 16, color: '#DC2626' }} /> }
  ];

  const getRatingInfo = (val) => {
    switch (val) {
      case 5:
        return { label: 'Excellent service! (5 / 5)', color: '#16A34A', isLow: false };
      case 4:
        return { label: 'Good service (4 / 5)', color: '#2563EB', isLow: false };
      case 3:
        return { label: 'Average experience (3 / 5)', color: '#D97706', isLow: true };
      case 2:
        return { label: 'Below expectations (2 / 5)', color: '#EA580C', isLow: true };
      case 1:
        return { label: 'Poor service / Issue faced (1 / 5)', color: '#DC2626', isLow: true };
      default:
        return { label: 'Tap stars to rate', color: '#64748B', isLow: false };
    }
  };

  const ratingInfo = getRatingInfo(rating);

  const handleRatingChange = (newVal) => {
    const nextVal = newVal || 1;
    setRating(nextVal);
    if (nextVal <= 3) {
      setSelectedTags(['incomplete']);
    } else {
      setSelectedTags(['fast', 'oem', 'clean', 'transparent']);
    }
  };

  const handleToggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      if (rating >= 4) {
        await creditWallet(50, '+50 Service Review Reward', `Rating ${rating}★ reward for booking #${bookingId}`, 'REVIEW_REWARD');
      }

      await ApiService.submitReview({
        bookingId: bookingId,
        rating,
        tags: selectedTags,
        feedback: feedbackText
      });
      localStorage.setItem(`salemseva_rated_${bookingId}`, 'true');
      localStorage.removeItem('salemseva_active_booking');
    } catch (e) {
      console.warn('Review submission fallback:', e);
      localStorage.setItem(`salemseva_rated_${bookingId}`, 'true');
      localStorage.removeItem('salemseva_active_booking');
    }
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/history');
    }, 800);
  };


  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2.5 }}>
        
        {/* 1. Header with Rating Badge */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: ratingInfo.isLow ? '#FEE2E2' : '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1
            }}
          >
            {ratingInfo.isLow ? (
              <ReportProblemIcon sx={{ fontSize: 28, color: '#DC2626' }} />
            ) : (
              <StarIcon sx={{ fontSize: 30, color: '#D97706' }} />
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px', mb: 0.3 }}>
            How was K. Ramesh's service for #{bookingId}?
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
            Tap stars below to rate the service:
          </Typography>

          {/* Star Rating Interactive */}
          <Box sx={{ my: 1 }}>
            <Rating
              value={rating}
              onChange={(e, val) => handleRatingChange(val)}
              size="large"
              sx={{
                fontSize: '2.4rem',
                color: ratingInfo.isLow ? '#EF4444' : '#F59E0B'
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ratingInfo.color, mt: 0.3, fontSize: '13px' }}>
              {ratingInfo.label}
            </Typography>
          </Box>
        </Box>

        {/* 2. Low Rating Escalation Notice */}
        {ratingInfo.isLow && (
          <Alert
            severity="error"
            icon={<SupportAgentIcon sx={{ fontSize: 20 }} />}
            sx={{
              mb: 2,
              borderRadius: '8px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '12px'
            }}
          >
            <strong>Salem Central Ops Escalation:</strong> We are sorry your experience was not satisfactory. Please select the issues below and provide details so our ops manager can arrange a free re-visit or refund.
          </Alert>
        )}

        {/* 3. Tags Selection Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', display: 'block', mb: 1.2, fontSize: '12.5px' }}>
            {ratingInfo.isLow ? 'What went wrong? (Tap to report issues):' : 'What did you like about Ramesh\'s service? (Tap to add compliments):'}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(ratingInfo.isLow ? issueTags : compliments).map((item) => {
              const isSelected = selectedTags.includes(item.id);
              return (
                <Chip
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  clickable
                  onClick={() => handleToggleTag(item.id)}
                  sx={{
                    bgcolor: isSelected ? (ratingInfo.isLow ? '#FEF2F2' : '#EFF6FF') : '#FFFFFF',
                    color: isSelected ? (ratingInfo.isLow ? '#991B1B' : '#1D4ED8') : '#475569',
                    border: isSelected ? `1.5px solid ${ratingInfo.isLow ? '#EF4444' : '#2563EB'}` : '1px solid #CBD5E1',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    borderRadius: '6px',
                    py: 1
                  }}
                />
              );
            })}
          </Box>
        </Card>

        {/* 4. Feedback Input Box */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
            {ratingInfo.isLow ? 'Describe the issue (Sent directly to Salem Ops Manager):' : 'Additional comments or feedback (optional):'}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={ratingInfo.isLow ? 3 : 2}
            placeholder={
              ratingInfo.isLow
                ? "Please explain what happened (e.g. AC cooling problem persists, technician left without testing, charges were higher than quote)..."
                : "Share your experience or special mention for the technician..."
            }
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '12px',
                borderRadius: '6px',
                bgcolor: '#F8FAFC'
              }
            }}
          />
        </Card>

        {/* 5. Seva Credits Reward Card (Only for 4-5 Stars) */}
        {!ratingInfo.isLow && (
          <Card
            elevation={0}
            sx={{
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              p: 1.5,
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '6px',
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CardGiftcardIcon sx={{ fontSize: 22 }} />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#166534', fontSize: '13px' }}>
                  +50 Seva credits reward
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', display: 'block', fontSize: '11px' }}>
                  • +20 credits: 5-star service rating • +30 credits: repeat booking cashback
                </Typography>
              </Box>
            </Box>
          </Card>
        )}

        {/* 6. Submit Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          onClick={handleFinish}
          sx={{
            bgcolor: ratingInfo.isLow ? '#DC2626' : '#0F172A',
            color: '#FFFFFF',
            borderRadius: '6px',
            py: 1.2,
            fontWeight: 600,
            fontSize: '13.5px',
            textTransform: 'none',
            '&:hover': { bgcolor: ratingInfo.isLow ? '#B91C1C' : '#1E293B' }
          }}
        >
          {ratingInfo.isLow ? 'Submit Feedback & Alert Salem Ops Manager' : 'Submit Review & Collect Credits'}
        </Button>

      </Container>

      {/* Bottom Navigation */}
      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#2563EB', fontWeight: 600 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          <BottomNavigationAction label="Partner Zone" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/partner')} />
        </BottomNavigation>
      </Paper>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title={ratingInfo.isLow ? 'Escalating to Salem Central Ops...' : 'Submitting rating...'}
        subtitle={ratingInfo.isLow ? 'Logging feedback ticket with Salem operations desk' : 'Crediting Seva wallet balance'}
        badge="Live Feedback"
      />

    </Box>
  );
}
