import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  TextField,
  Alert,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ArrowLeft, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight, Lock, Phone, MessageCircle, Clock } from 'lucide-react';
import { API_V1_URL } from '../../config';

const CANCEL_REASONS = [
  { id: 'change_plans', label: 'Plans changed / No longer required', desc: 'Request will be closed immediately' },
  { id: 'found_local_alt', label: 'Arranged alternative technician locally', desc: 'Close search request' },
  { id: 'issue_resolved', label: 'Appliance issue resolved automatically', desc: 'Self-fixed or power issue resolved' },
  { id: 'taking_too_long', label: 'Looking for faster local option', desc: 'Cancel current search' },
  { id: 'wrong_locality', label: 'Booked wrong service or wrong address', desc: 'Can re-book anytime' },
  { id: 'other', label: 'Other specific reason', desc: 'Write details below' }
];

export default function BookingCancelPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [bookingInfo, setBookingInfo] = useState(null);
  const [selectedReason, setSelectedReason] = useState('change_plans');
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isWindowLocked, setIsWindowLocked] = useState(false);
  const [lockDetails, setLockDetails] = useState(null);

  // Fetch booking details
  useEffect(() => {
    let isMounted = true;
    if (!bookingId) return;

    fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          if (d.success && d.booking) {
            setBookingInfo(d.booking);

            // Pre-evaluate 24-hour cancellation cutoff window
            // Free self-cancellation is always permitted BEFORE technician assignment (created / matching stage)
            const isTechAssigned = Boolean(
              d.booking.technician_id ||
              d.booking.technicianName ||
              d.booking.tech_name ||
              !['created', 'matching'].includes(d.booking.status)
            );

            const slotStr = String(d.booking.scheduled_slot || '').toLowerCase();
            const isUrgent = Boolean(d.booking.is_urgent_dispatch || slotStr.includes('emergency'));
            const dateMatch = slotStr.match(/\b(202\d)-(\d{2})-(\d{2})\b/);
            let appointmentTime = null;

            if (isUrgent) {
              appointmentTime = new Date(Date.now() + 60 * 60 * 1000);
            } else if (dateMatch) {
              appointmentTime = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T10:00:00`);
            } else if (slotStr.includes('today')) {
              appointmentTime = new Date();
            } else if (slotStr.includes('tomorrow')) {
              appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
            }

            // Only lock cancellation window if a technician has already been assigned
            if (isTechAssigned && appointmentTime) {
              const hoursLeft = (appointmentTime.getTime() - Date.now()) / (1000 * 60 * 60);
              if (hoursLeft < 24) {
                setIsWindowLocked(true);
                setLockDetails({
                  policyReason: 'Under Shazu One policy, cancellations are only available at least 24 hours prior to the scheduled service appointment once a specialist technician is assigned.',
                  hoursRemaining: Math.max(0, Math.round(hoursLeft)),
                  opsContact: {
                    phone: '+918807099288',
                    whatsappUrl: `https://wa.me/918807099288?text=${encodeURIComponent(`Hello Shazu One Ops Desk, I need assistance with booking #${bookingId}`)}`
                  }
                });
              }
            }
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error fetching booking for cancellation:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const currentStatus = bookingInfo?.status || 'matching';
  const isMatchingStage = currentStatus === 'matching' || currentStatus === 'created';
  const visitFee = 99;

  const handleCancelSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const selectedObj = CANCEL_REASONS.find((r) => r.id === selectedReason);
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
        // Clean active booking from local state
        localStorage.removeItem('shazuone_active_booking');
        setCancelResult(
          data.cancellationSummary || {
            bookingId,
            isPreMatching: isMatchingStage,
            originalPaid: isMatchingStage ? 0 : visitFee,
            technicianTravelDisbursal: isMatchingStage ? 0 : visitFee,
            platformCommission: 0,
            refundAmount: 0,
            policyNotice: isMatchingStage
              ? 'Cancelled during search. Zero charges applied.'
              : '100% of visit fee disbursed to technician.'
          }
        );
      } else {
        if (data.code === 'CANCELLATION_WINDOW_EXPIRED') {
          setIsWindowLocked(true);
          setLockDetails({
            policyReason: data.policyReason || data.error,
            hoursRemaining: data.hoursRemaining || 0,
            opsContact: data.opsContact || {
              phone: '+918807099288',
              whatsappUrl: `https://wa.me/918807099288?text=${encodeURIComponent(`Hello Shazu One Ops Desk, I need emergency assistance with booking #${bookingId}`)}`
            }
          });
        }
        setErrorMessage(data.error || 'Unable to cancel booking. Please try again or contact Salem Ops.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setErrorMessage('Network error during cancellation. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/track?bookingId=${bookingId}`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Back"
            sx={{
              color: '#0F172A',
              bgcolor: '#F1F5F9',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#E2E8F0' }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
              Cancel Service Request
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '11px' }}>
              Booking #{bookingId}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Form Body */}
      <Box
        sx={{
          flex: 1,
          maxWidth: '600px',
          width: '100%',
          mx: 'auto',
          p: { xs: 2, sm: 3 }
        }}
      >
        {cancelResult ? (
          /* Cancellation Confirmation State */
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <CheckCircle size={32} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Service Request Cancelled
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '13px', mb: 3 }}>
              Your booking #{bookingId} has been successfully closed.
            </Typography>

            {/* Cancellation Ledger */}
            {(() => {
              const originalPaid = Number(cancelResult.originalPaid || cancelResult.originalAmount || 0);
              const platformFeeRetained = Number(cancelResult.platformFeeRetained || cancelResult.refundPlatformFee || 0);
              const gatewayChargeRetained = Number(cancelResult.gatewayChargeRetained || cancelResult.refundGatewayFee || 0);
              const techDisbursal = Number(cancelResult.technicianTravelDisbursal || 0);
              const refundAmt = Number(cancelResult.refundAmount || Math.max(0, originalPaid - (platformFeeRetained + gatewayChargeRetained + techDisbursal)));

              return (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    mb: 2.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    textAlign: 'left'
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '13.5px', color: '#0F172A', mb: 1.5 }}>
                    Cancellation & Refund Ledger
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '13px' }}>
                    <Typography sx={{ color: '#475569' }}>Initial Search Stage Fee Paid</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{originalPaid.toFixed(2)}
                    </Typography>
                  </Box>

                  {platformFeeRetained > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, fontSize: '12.5px' }}>
                      <Box>
                        <Typography sx={{ color: '#DC2626', fontWeight: 600 }}>
                          Platform Facilitation Retention (2%)
                        </Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
                          Cloud matching & dispatch telemetry retention
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#DC2626' }}>
                        -₹{platformFeeRetained.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  {gatewayChargeRetained > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, fontSize: '12.5px' }}>
                      <Box>
                        <Typography sx={{ color: '#DC2626', fontWeight: 600 }}>
                          Payment Gateway Surcharge Retention (2%)
                        </Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
                          Banking interchange processing fee
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#DC2626' }}>
                        -₹{gatewayChargeRetained.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  {techDisbursal > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, fontSize: '12.5px' }}>
                      <Box>
                        <Typography sx={{ color: '#D97706', fontWeight: 600 }}>
                          Technician Doorstep Travel Disbursal
                        </Typography>
                        <Typography sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
                          Compensated to assigned specialist for fuel
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#D97706' }}>
                        -₹{techDisbursal.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1.2, borderColor: '#CBD5E1' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                        Net Refund to Source / UPI
                      </Typography>
                      <Typography sx={{ color: '#16A34A', fontSize: '11px', fontWeight: 600 }}>
                        Initiated to your payment method (3-5 business days)
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, color: '#059669', fontSize: '18px' }}>
                      ₹{refundAmt.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Deduction Rationale Explanation */}
                  {(platformFeeRetained > 0 || gatewayChargeRetained > 0) && (
                    <Box sx={{ mt: 1.5, p: 1.2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
                      <Typography sx={{ fontSize: '11px', color: '#0369A1', lineHeight: 1.45 }}>
                        <strong>Why was ₹{(platformFeeRetained + gatewayChargeRetained).toFixed(2)} retained?</strong> Under Shazu One Fair Cancellation Policy, standard operational cloud dispatch fees and banking gateway interchange costs are non-refundable, while the entire balance is credited directly back to your account.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })()}

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/')}
              sx={{
                bgcolor: '#0A66C2',
                color: '#FFFFFF',
                borderRadius: '12px',
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              Return to Home
            </Button>
          </Paper>
        ) : isWindowLocked ? (
          /* 24-Hour Policy Lock Notice Screen */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #FECACA',
                bgcolor: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Lock size={28} color="#DC2626" />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Cancellation Window Closed
              </Typography>

              <Typography sx={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.6, mb: 2.5 }}>
                Under Shazu One policy, cancellations are only available at least <strong>24 hours prior</strong> to your scheduled appointment. Because this service is scheduled within the next 24 hours, our specialist technician, equipment, and travel route have already been committed.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  textAlign: 'left'
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', mb: 0.5 }}>
                  Need to change plans or reschedule?
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                  Our central Salem Operations Desk is available to help you reschedule or resolve urgent issues directly:
                </Typography>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
                <Button
                  variant="contained"
                  component="a"
                  href={`tel:${lockDetails?.opsContact?.phone || '+918807099288'}`}
                  startIcon={<Phone size={16} />}
                  sx={{
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    py: 1.25,
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1E293B' }
                  }}
                >
                  Call Salem Ops Desk
                </Button>

                <Button
                  variant="contained"
                  component="a"
                  href={lockDetails?.opsContact?.whatsappUrl || 'https://wa.me/918807099288'}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<MessageCircle size={16} />}
                  sx={{
                    bgcolor: '#059669',
                    color: '#FFFFFF',
                    py: 1.25,
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#047857' }
                  }}
                >
                  WhatsApp Support
                </Button>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleBack}
                sx={{
                  color: '#475569',
                  borderColor: '#CBD5E1',
                  borderRadius: '10px',
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: '13.5px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
                }}
              >
                Return to Live Tracking
              </Button>
            </Paper>
          </Box>
        ) : (
          /* Active Cancellation Selection Form */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Policy Notice Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: isMatchingStage ? '#F0FDF4' : '#FFFBEB',
                border: isMatchingStage ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start'
              }}
            >
              {isMatchingStage ? (
                <CheckCircle size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: isMatchingStage ? '#166534' : '#92400E',
                    mb: 0.25
                  }}
                >
                  {isMatchingStage ? 'Free Cancellation Active' : 'Technician Already Dispatched'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: isMatchingStage ? '#15803D' : '#B45309',
                    lineHeight: 1.4
                  }}
                >
                  {isMatchingStage
                    ? 'Technician has not been assigned yet. You can cancel now with 100% zero charges or penalties.'
                    : 'A technician is already on the way. The visiting charge of ₹99 is disbursed to compensate partner travel time.'}
                </Typography>
              </Box>
            </Paper>

            {/* Reason Selection */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', mb: 1.5 }}>
                Please specify a reason for cancellation
              </Typography>

              <RadioGroup
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                {CANCEL_REASONS.map((r) => {
                  const isChecked = selectedReason === r.id;
                  return (
                    <Box
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: isChecked ? '1.5px solid #0A66C2' : '1px solid #E2E8F0',
                        bgcolor: isChecked ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Radio
                        checked={isChecked}
                        value={r.id}
                        sx={{
                          p: 0,
                          mt: 0.25,
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#0A66C2' }
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>
                          {r.label}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                          {r.desc}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </RadioGroup>

              {selectedReason === 'other' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="Tell us what happened so we can improve..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '13px'
                    }
                  }}
                />
              )}
            </Paper>

            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {errorMessage}
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1, pb: 4 }}>
              <Button
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                onClick={handleCancelSubmit}
                sx={{
                  bgcolor: '#DC2626',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#B91C1C' },
                  '&.Mui-disabled': { bgcolor: '#FCA5A5', color: '#FFFFFF' }
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleBack}
                disabled={isSubmitting}
                sx={{
                  color: '#475569',
                  borderColor: '#CBD5E1',
                  borderRadius: '12px',
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
                }}
              >
                Keep Booking Active
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
