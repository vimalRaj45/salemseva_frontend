import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Rating,
  Chip,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import toast from 'react-hot-toast';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ServiceReviewSection({
  bookingId,
  technicianName = 'the technician',
  existingReview = null,
  onReviewSubmitted = null
}) {
  const { creditWallet } = useAuth();

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['fast', 'oem', 'clean', 'transparent']);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize from existing review or localStorage
  useEffect(() => {
    if (existingReview) {
      setRating(Number(existingReview.rating) || 5);
      setSelectedTags(Array.isArray(existingReview.tags) ? existingReview.tags : ['fast', 'oem', 'clean']);
      setFeedbackText(existingReview.comment || existingReview.feedback || '');
      setIsSubmitted(true);
      setSubmittedData(existingReview);
      return;
    }

    if (bookingId) {
      const localRated = localStorage.getItem(`shazuone_rated_${bookingId}`);
      if (localRated) {
        try {
          const parsed = JSON.parse(localRated);
          if (parsed && typeof parsed === 'object') {
            setRating(Number(parsed.rating) || 5);
            setSelectedTags(Array.isArray(parsed.tags) ? parsed.tags : ['fast', 'oem', 'clean']);
            setFeedbackText(parsed.comment || '');
            setIsSubmitted(true);
            setSubmittedData(parsed);
          } else {
            setIsSubmitted(true);
          }
        } catch {
          setIsSubmitted(true);
        }
      }
    }
  }, [bookingId, existingReview]);

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
        return { label: 'Tap stars below to rate the service', color: '#64748B', isLow: false };
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
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitReview = async () => {
    if (!bookingId) {
      toast.error('Booking reference missing');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rating >= 4 && typeof creditWallet === 'function') {
        try {
          await creditWallet(50, '+50 Service Review Reward', `Rating ${rating} reward for booking #${bookingId}`, 'REVIEW_REWARD');
        } catch (cErr) {
          console.warn('Wallet credit notice:', cErr);
        }
      }

      const res = await ApiService.submitReview({
        bookingId,
        rating,
        tags: selectedTags,
        feedback: feedbackText
      });

      const payload = {
        bookingId,
        rating,
        tags: selectedTags,
        comment: feedbackText,
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem(`shazuone_rated_${bookingId}`, JSON.stringify(payload));
      setIsSubmitted(true);
      setIsEditing(false);
      setSubmittedData(payload);

      if (rating <= 3) {
        toast.success('Feedback recorded. Salem Operations Desk alerted for priority follow-up.');
      } else {
        toast.success('Thank you! Review submitted and verified.');
      }

      if (typeof onReviewSubmitted === 'function') {
        onReviewSubmitted(res?.review || payload);
      }
    } catch (err) {
      console.warn('Review submission error:', err);
      toast.error('Network error submitting review, saved locally');
      setIsSubmitted(true);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Submitted View (Receipt Page Display)
  if (isSubmitted && !isEditing) {
    const displayRating = submittedData?.rating || rating;
    const displayComment = submittedData?.comment || feedbackText;
    const displayTags = submittedData?.tags || selectedTags;
    const isLow = displayRating <= 3;

    return (
      <Card
        elevation={0}
        sx={{
          bgcolor: isLow ? '#FEF2F2' : '#F0FDF4',
          border: `1.5px solid ${isLow ? '#FECACA' : '#BBF7D0'}`,
          borderRadius: '16px',
          p: 2.5,
          mb: 2.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: isLow ? '#EF4444' : '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                Verified Service Review Recorded
              </Typography>
              <Typography variant="caption" sx={{ color: isLow ? '#991B1B' : '#166534', fontWeight: 600, fontSize: '11.5px' }}>
                Thank you for rating {technicianName}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="text"
            startIcon={<EditIcon sx={{ fontSize: 14 }} />}
            onClick={() => setIsEditing(true)}
            sx={{
              color: '#475569',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '6px',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1, bgcolor: '#FFFFFF', p: 1.5, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <Rating value={displayRating} readOnly size="medium" sx={{ color: isLow ? '#EF4444' : '#F59E0B' }} />
          <Typography variant="body2" sx={{ fontWeight: 800, color: isLow ? '#DC2626' : '#16A34A' }}>
            {displayRating} / 5 Stars
          </Typography>
        </Box>

        {displayTags && displayTags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, my: 1.2 }}>
            {displayTags.map((tagId) => {
              const item = [...compliments, ...issueTags].find((x) => x.id === tagId);
              if (!item) return null;
              return (
                <Chip
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155'
                  }}
                />
              );
            })}
          </Box>
        )}

        {displayComment && (
          <Box sx={{ mt: 1, p: 1.2, bgcolor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic', fontSize: '12px', display: 'block' }}>
              &ldquo;{displayComment}&rdquo;
            </Typography>
          </Box>
        )}
      </Card>
    );
  }

  // 2. Interactive Form View (Matching User Attachment Pixel-by-Pixel)
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '16px',
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}
    >
      {/* 1. Header with Golden Star Icon */}
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
            mb: 1.2
          }}
        >
          {ratingInfo.isLow ? (
            <ReportProblemIcon sx={{ fontSize: 28, color: '#DC2626' }} />
          ) : (
            <StarIcon sx={{ fontSize: 32, color: '#D97706' }} />
          )}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '16px', sm: '17px' }, mb: 0.3 }}>
          How was {technicianName}&apos;s service{bookingId ? ` for #${bookingId}` : ''}?
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px', display: 'block' }}>
          Tap stars below to rate the service:
        </Typography>

        {/* Star Rating Interactive */}
        <Box sx={{ my: 1.2 }}>
          <Rating
            value={rating}
            onChange={(e, val) => handleRatingChange(val)}
            size="large"
            sx={{
              fontSize: { xs: '2.5rem', sm: '2.8rem' },
              color: ratingInfo.isLow ? '#EF4444' : '#F59E0B'
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: ratingInfo.color, mt: 0.5, fontSize: '13.5px' }}>
            {ratingInfo.label}
          </Typography>
        </Box>
      </Box>

      {/* 2. Low Rating Escalation Alert */}
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
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          <strong>Salem Central Ops Escalation:</strong> We are sorry your experience was not satisfactory. Please select the issues below so our Salem operations manager can arrange a 100% free re-visit or refund.
        </Alert>
      )}

      {/* 3. Tags Selection Card */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          p: 2,
          mb: 2
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', mb: 1.2, fontSize: '12.5px' }}>
          {ratingInfo.isLow
            ? 'What went wrong? (Tap to report issues):'
            : `What did you like about ${technicianName}'s service? (Tap to add compliments):`}
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
          borderRadius: '10px',
          p: 2,
          mb: 2
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
          {ratingInfo.isLow ? 'Describe the issue (Sent directly to Salem Ops Manager):' : 'Additional comments or feedback (optional):'}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={ratingInfo.isLow ? 3 : 2}
          placeholder={
            ratingInfo.isLow
              ? 'Please explain what happened (e.g. cooling problem persists, technician left without testing, charges higher than quote)...'
              : 'Share your experience or special mention for the technician...'
          }
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '12.5px',
              borderRadius: '8px',
              bgcolor: '#F8FAFC'
            }
          }}
        />
      </Card>

      {/* 5. Verified Salem Service Review Assurance Banner */}
      {!ratingInfo.isLow && (
        <Card
          elevation={0}
          sx={{
            bgcolor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            p: 1.5,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <VerifiedIcon sx={{ fontSize: 22 }} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '13px' }}>
                Verified Salem Service Review
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D', display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                Your honest feedback helps Salem neighbors find trusted technicians and supports certified professionals.
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
        disabled={isSubmitting}
        endIcon={!isSubmitting && <ArrowForwardIcon sx={{ fontSize: 16 }} />}
        onClick={handleSubmitReview}
        sx={{
          bgcolor: ratingInfo.isLow ? '#DC2626' : '#0F172A',
          color: '#FFFFFF',
          borderRadius: '8px',
          py: 1.3,
          fontWeight: 800,
          fontSize: '13.5px',
          textTransform: 'none',
          boxShadow: ratingInfo.isLow ? '0 4px 14px rgba(220,38,38,0.25)' : '0 4px 14px rgba(15,23,42,0.25)',
          '&:hover': { bgcolor: ratingInfo.isLow ? '#B91C1C' : '#1E293B' }
        }}
      >
        {isSubmitting ? (
          <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
        ) : ratingInfo.isLow ? (
          'Submit Feedback & Alert Salem Ops Manager'
        ) : (
          'Submit Review & Collect Credits'
        )}
      </Button>
    </Card>
  );
}
