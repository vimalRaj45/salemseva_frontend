import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Radio,
  Paper,
  TextField,
  Alert,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';

const CANCEL_REASONS = [
  { id: 'change_plans', label: 'Plans changed / No longer required', desc: 'Request will be closed immediately' },
  { id: 'found_local_alt', label: 'Arranged alternative technician locally', desc: 'Close search request' },
  { id: 'issue_resolved', label: 'Appliance issue resolved automatically', desc: 'Self-fixed or power issue resolved' },
  { id: 'taking_too_long', label: 'Looking for faster local option', desc: 'Cancel current search' },
  { id: 'wrong_locality', label: 'Booked wrong service or wrong address', desc: 'Can re-book anytime' },
  { id: 'other', label: 'Other specific reason', desc: 'Write details below' }
];

export default function CancelBookingModal({
  open,
  onClose,
  bookingId,
  currentStatus = 'matching',
  onCancelledSuccess
}) {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('change_plans');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Determine stage: Is it before technician assignment (matching/searching) or after assignment/payment?
  const isMatchingStage = currentStatus === 'matching' || currentStatus === 'created';
  const visitFee = 99;

  const handleCancelSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const selectedObj = CANCEL_REASONS.find(r => r.id === selectedReason);
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedObj ? selectedObj.label : selectedReason,
          reasonDetails: customNote,
          cancelledBy: 'customer'
        })
      });

      const data = await res.json();
      if (data.success) {
        setCancelResult(data.cancellationSummary || {
          bookingId,
          isPreMatching: isMatchingStage,
          originalPaid: isMatchingStage ? 0 : visitFee,
          technicianTravelDisbursal: isMatchingStage ? 0 : visitFee,
          platformCommission: 0,
          refundAmount: 0,
          policyNotice: isMatchingStage ? 'Cancelled during search. No charges apply.' : '100% of visit fee disbursed to technician.'
        });
        if (onCancelledSuccess) {
          onCancelledSuccess(data);
        }
      } else {
        setErrorMessage(data.error || 'Unable to cancel booking. Please try again or contact Salem Ops.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setErrorMessage('Network error during cancellation. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (cancelResult) {
      setCancelResult(null);
      navigate('/');
    } else {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 0.5,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: cancelResult ? '#DCFCE7' : '#FEE2E2', color: cancelResult ? '#16A34A' : '#DC2626', p: 0.8, borderRadius: '8px', display: 'flex' }}>
            {cancelResult ? <CheckCircleOutlineIcon sx={{ fontSize: 22 }} /> : <CancelOutlinedIcon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', lineHeight: 1.2 }}>
              {cancelResult ? 'Booking Cancelled' : (isMatchingStage ? 'Cancel Search Request' : 'Cancel Doorstep Request')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
              Booking #{bookingId}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {cancelResult ? (
          /* Cancellation Success View */
          <Box sx={{ textAlign: 'center', py: 1 }}>
            {cancelResult.isPreMatching ? (
              /* Success View for Pre-Assignment (Matching) Cancellation */
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  p: 2,
                  mb: 2,
                  textAlign: 'left'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  Search Request Cancelled
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', lineHeight: 1.4 }}>
                  Your search has been stopped. No technician was assigned, and <strong>no amount has been charged</strong>.
                </Typography>
              </Paper>
            ) : (
              /* Success View for Post-Assignment / Post-Payment Cancellation */
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  p: 2,
                  mb: 2,
                  textAlign: 'left'
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Fee Disbursal Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px' }}>Visit & Inspection Fee:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>₹{cancelResult.originalPaid || visitFee}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '13px' }}>Disbursed to Technician (Travel & Fuel):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '13px' }}>100% (₹{cancelResult.technicianTravelDisbursal || cancelResult.originalPaid || visitFee})</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px' }}>SalemSeva Platform Commission:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '12.5px' }}>₹0.00 (0%)</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', fontSize: '13px' }}>
                    Refund Amount:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', fontSize: '13px' }}>
                    ₹0.00 (Non-refundable)
                  </Typography>
                </Box>
              </Paper>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onClose();
                navigate('/');
              }}
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '8px',
                py: 1.1,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1E293B' }
              }}
            >
              Back to SalemSeva Home
            </Button>
          </Box>
        ) : (
          /* Cancellation Confirmation & Reason Selection */
          <Box>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', fontSize: '12px' }}>
                {errorMessage}
              </Alert>
            )}

            {/* Stage-aware Policy Banner */}
            {isMatchingStage ? (
              /* Pre-Assignment Banner: Clean Zero Charge Message */
              <Box sx={{ bgcolor: '#F0FDF4', p: 1.4, borderRadius: '10px', border: '1px solid #BBF7D0', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '12.5px', mb: 0.3 }}>
                  No Charges Apply
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: '11.5px', display: 'block', lineHeight: 1.4 }}>
                  Technician has not accepted yet and no payment has been charged. You can cancel your search anytime with zero fees.
                </Typography>
              </Box>
            ) : (
              /* Post-Assignment / Post-Payment Banner: Fair Partner Travel Policy */
              <Box sx={{ bgcolor: '#FFFBEB', p: 1.4, borderRadius: '10px', border: '1px solid #FDE68A', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.6 }}>
                  <TwoWheelerIcon sx={{ color: '#D97706', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '12.5px' }}>
                    Technician Travel & Visit Policy
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#78350F', fontSize: '11.5px', display: 'block', lineHeight: 1.45 }}>
                  A technician has been assigned and dispatched. The <strong>₹99 inspection fee is non-refundable</strong> because <strong>100% of it is allocated directly to the technician</strong> for travel and fuel expenses. <strong>SalemSeva takes ₹0 commission</strong>.
                </Typography>
              </Box>
            )}

            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '11px' }}>
              Please select a reason for cancellation:
            </Typography>

            {/* Reasons List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1.5 }}>
              {CANCEL_REASONS.map(reason => {
                const isSelected = selectedReason === reason.id;
                return (
                  <Paper
                    key={reason.id}
                    elevation={0}
                    onClick={() => setSelectedReason(reason.id)}
                    sx={{
                      p: 1.1,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #DC2626' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      size="small"
                      sx={{ p: 0, '&.Mui-checked': { color: '#DC2626' } }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 700 : 500, color: '#0F172A', fontSize: '12.5px' }}>
                        {reason.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10.5px' }}>
                        {reason.desc}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* Optional Additional Note */}
            {selectedReason === 'other' && (
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Optional details (helps improve Salem service)..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '12px',
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
            )}
          </Box>
        )}
      </DialogContent>

      {!cancelResult && (
        <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '13px',
              borderRadius: '8px'
            }}
          >
            {isMatchingStage ? 'Keep searching' : 'Keep booking'}
          </Button>

          <Button
            variant="contained"
            onClick={handleCancelSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CancelOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '13px',
              borderRadius: '8px',
              px: 2,
              py: 0.9,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              '&:hover': { bgcolor: '#B91C1C' }
            }}
          >
            {isSubmitting ? 'Cancelling...' : (isMatchingStage ? 'Stop Search & Cancel' : 'Confirm Cancel (Fee to Tech)')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
