import { API_V1_URL } from '../config';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  Paper,
  TextField,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

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
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/cancel`, {
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
    <Modal open={open} onClose={handleClose} maxWidth="sm" ariaLabelledBy="cancel-modal-title">
      <ModalHeader
        id="cancel-modal-title"
        title={cancelResult ? 'Booking cancelled' : (isMatchingStage ? 'Cancel search request' : 'Cancel doorstep request')}
        subtitle={`Booking #${bookingId}`}
        onClose={handleClose}
        icon={cancelResult ? <CheckCircle size={20} color="#16A34A" /> : <AlertTriangle size={20} color="#DC2626" />}
      />

      <ModalBody>
        {cancelResult ? (
          /* Cancellation Success View */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {cancelResult.isPreMatching ? (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '6px',
                  p: 1
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13px', mb: 0.5 }}>
                  Search request stopped
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.4 }}>
                  Your search has been stopped. No technician was assigned, and no charges have been deducted.
                </Typography>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '6px',
                  p: 1
                }}
              >
                <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11px', mb: 1 }}>
                  Cancellation and refund summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#64748B', fontSize: '13px' }}>Original paid amount</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                    ₹{Number(cancelResult.originalPaid || visitFee).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#DC2626', fontSize: '13px' }}>Platform fee (2%)</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#DC2626', fontSize: '13px' }}>
                    -₹{Number(cancelResult.platformFeeDeduction ?? (Number(cancelResult.originalPaid || visitFee) * 0.02)).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#DC2626', fontSize: '13px' }}>Payment gateway charge (2%)</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#DC2626', fontSize: '13px' }}>
                    -₹{Number(cancelResult.gatewayChargeDeduction ?? (Number(cancelResult.originalPaid || visitFee) * 0.02)).toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '14px' }}>
                    Net refund initiated
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '16px' }}>
                    ₹{Number(cancelResult.refundAmount ?? (Number(cancelResult.originalPaid || visitFee) * 0.96)).toFixed(2)}
                  </Typography>
                </Box>

                <Typography sx={{ color: '#64748B', fontSize: '12px', lineHeight: 1.5, bgcolor: '#FFFFFF', p: 1.5, borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  Refund will be credited to your original payment method within 3 to 5 banking days.
                </Typography>
              </Paper>
            )}
          </Box>
        ) : (
          /* Confirmation & Reason Selection */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: '6px', fontSize: '12px', p: 0.5 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Policy Notice Card */}
            <Box sx={{ bgcolor: 'background.default', p: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 600, color: isMatchingStage ? '#16A34A' : 'text.primary', fontSize: '12px', mb: 0.25 }}>
                {isMatchingStage ? 'Zero charges apply' : 'Cancellation policy'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '11px', lineHeight: 1.4 }}>
                {isMatchingStage
                  ? 'Technician has not been assigned yet. You can cancel your search anytime with zero fees.'
                  : 'A 2% platform fee and 2% payment gateway fee are retained. The remaining 96% will be automatically refunded.'}
              </Typography>
            </Box>

            <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11.5px' }}>
              Select reason for cancellation
            </Typography>

            {/* Reasons List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {CANCEL_REASONS.map(reason => {
                const isSelected = selectedReason === reason.id;
                return (
                  <Paper
                    key={reason.id}
                    elevation={0}
                    onClick={() => setSelectedReason(reason.id)}
                    sx={{
                      p: 1,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #0A66C2' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'rgba(10, 92, 196, 0.08)' : 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minHeight: 48,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#0A66C2' : '#CBD5E1'
                      }
                    }}
                  >
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      size="small"
                      sx={{ p: 0, '&.Mui-checked': { color: '#0A66C2' } }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: isSelected ? 600 : 500, color: '#0F172A', fontSize: '13px' }}>
                        {reason.label}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '12px' }}>
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
                placeholder="Optional details (helps us improve Salem service)..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '13px',
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
            )}
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        {cancelResult ? (
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onClose();
              navigate('/');
            }}
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
            Back to home
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
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
              {isMatchingStage ? 'Keep searching' : 'Keep booking'}
            </Button>

            <Button
              variant="contained"
              onClick={handleCancelSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '14px',
                borderRadius: '14px',
                minHeight: 48,
                px: 2.5,
                '&:hover': { bgcolor: '#B91C1C' },
                '&:disabled': { bgcolor: '#FCA5A5', color: '#FFFFFF' }
              }}
            >
              {isSubmitting ? 'Cancelling...' : (isMatchingStage ? 'Stop search & cancel' : 'Confirm cancellation')}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
