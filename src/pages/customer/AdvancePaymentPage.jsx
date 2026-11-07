import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  IconButton,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';
import DynamicQrPaymentBox from '../../components/payments/DynamicQrPaymentBox';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import toast from 'react-hot-toast';

export default function AdvancePaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retrieve state passed from ServiceDetailPage or fallback to sessionStorage
  const [bookingDraft, setBookingDraft] = useState(() => {
    if (location.state && location.state.payableNow !== undefined) {
      sessionStorage.setItem('shazuone_pending_advance_draft', JSON.stringify(location.state));
      return location.state;
    }
    const saved = sessionStorage.getItem('shazuone_pending_advance_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('Your payment is processing...');
  const [processingSubtitle, setProcessingSubtitle] = useState('Confirming booking and preparing live tracking...');
  const paymentSucceededRef = React.useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      // If customer leaves payment screen without completing payment, purge active booking from storage
      if (!paymentSucceededRef.current) {
        localStorage.removeItem('shazuone_active_booking');
      }
    };
  }, []);

  // If no draft exists, redirect back safely
  useEffect(() => {
    if (!bookingDraft) {
      toast.error('No active booking reservation found. Please select a service.');
      navigate('/');
    }
  }, [bookingDraft, navigate]);

  if (!bookingDraft) {
    return null;
  }

  const {
    bookingId: initialBookingId = null,
    serviceId = 'ac',
    serviceName = 'Doorstep Service',
    selectedIssue = '',
    customDescription = '',
    userLocation = {},
    couponApplied = false,
    couponCode = '',
    discount = 0,
    finalSlot = 'Today',
    payableNow = 99,
    inspectionFeeNumber = 99,
    requestedTechnician = null,
    selectedSlot = '',
    voiceNoteAudio = null,
    returnUrl = `/book/${serviceId}`
  } = bookingDraft;

  // Active persistent booking ID in PostgreSQL
  const [activeBookingId, setActiveBookingId] = useState(() => {
    if (initialBookingId && String(initialBookingId).startsWith('SLM-')) {
      return initialBookingId;
    }
    return null;
  });

  // Ensure real booking exists in database on mount
  useEffect(() => {
    if (activeBookingId) return;

    const initBooking = async () => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: serviceId || 'ac',
            issueId: selectedIssue,
            customNotes: customDescription,
            customerId: user?.id || null,
            customerName: user?.name || user?.full_name || 'Customer',
            customerPhone: user?.phone || '',
            lat: userLocation?.lat || 11.6643,
            lng: userLocation?.lng || 78.1460,
            locality: userLocation?.locality || 'Fairlands',
            address: userLocation?.address || '',
            pincode: userLocation?.pincode || '636016',
            couponCode: couponApplied ? couponCode : null,
            discountAmount: discount,
            isUrgentDispatch: Boolean(finalSlot.toLowerCase().includes('emergency') || selectedSlot === 'emergency_urgent'),
            scheduledSlot: finalSlot,
            bookingType: 'scheduled',
            requestedTechnicianId: requestedTechnician?.id || null,
            requestedTechnicianName: requestedTechnician?.name || null,
            paymentStatus: 'pending',
            paymentMethod: 'DYNAMIC_UPI_QR',
            visitFeePaid: 0,
            voiceNoteAudio: voiceNoteAudio
          })
        });

        const data = await res.json();
        if (data.success && data.booking?.id) {
          const newId = data.booking.id;
          setActiveBookingId(newId);
          setBookingDraft(prev => ({ ...prev, bookingId: newId, booking: data.booking }));
          sessionStorage.setItem('shazuone_pending_advance_draft', JSON.stringify({
            ...bookingDraft,
            bookingId: newId,
            booking: data.booking
          }));
        }
      } catch (err) {
        console.warn('Booking init error:', err);
      }
    };

    initBooking();
  }, [activeBookingId]);

  // Final confirmation upon successful QR submission
  const handlePaymentSuccess = async (paymentData) => {
    paymentSucceededRef.current = true;
    const finalBookingId = paymentData?.bookingId || activeBookingId || initialBookingId;

    // Clean pending draft
    sessionStorage.removeItem('shazuone_pending_advance_draft');

    // Store active booking in localStorage only when payment is actually submitted/verified
    if (finalBookingId) {
      localStorage.setItem('shazuone_active_booking', finalBookingId);
      window.dispatchEvent(new CustomEvent('shazuone_new_booking_created', { detail: { bookingId: finalBookingId } }));
      window.dispatchEvent(new Event('storage'));
    }

    toast.success('Payment verified! Preparing live tracking...');
    navigate(`/track?bookingId=${finalBookingId}&paid=1`, { replace: true });
  };

  const handleBack = async () => {
    const bookingToCancel = activeBookingId || initialBookingId;
    if (bookingToCancel) {
      try {
        await fetch(`${API_V1_URL}/bookings/${bookingToCancel}/cancel-unpaid`, {
          method: 'POST'
        });
      } catch (err) {
        console.warn('Cancel unpaid booking error:', err);
      }
    }

    sessionStorage.removeItem('shazuone_pending_advance_draft');
    localStorage.removeItem('shazuone_active_booking');
    toast.error('Booking not completed. Payment was not received.');
    navigate(returnUrl || `/book/${serviceId}`, { replace: true, state: { bookingCancelled: true } });
  };

  const currentDisplayBookingId = activeBookingId || initialBookingId || 'SLM-RESERVE';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        pb: { xs: 12, sm: 8 },
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          py: 1.5,
          px: { xs: 2, sm: 3 }
        }}
      >
        <Container maxWidth="sm" disableGutters sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#334155',
                '&:hover': { bgcolor: '#E2E8F0' }
              }}
            >
              <ArrowLeft size={18} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', lineHeight: 1.2 }}>
                Confirm & Pay Visit Fee
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                Direct Business UPI QR Payment
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<ShieldCheck size={14} color="#16A34A" />}
            label="100% Guaranteed Safe"
            size="small"
            sx={{
              bgcolor: '#F0FDF4',
              color: '#166534',
              fontWeight: 700,
              fontSize: '11px',
              border: '1px solid #BBF7D0'
            }}
          />
        </Container>
      </Box>

      {/* Main Scrollable Content */}
      <Container maxWidth="sm" sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>
        {/* Booking Summary Card */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
              {serviceName}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1D6FE5', fontSize: '17px' }}>
              ₹{parseFloat(payableNow).toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: '#64748B', fontSize: '12.5px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={14} color="#64748B" />
              <Typography variant="body2" sx={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>
                {finalSlot}
              </Typography>
            </Box>

            {userLocation?.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <MapPin size={14} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontSize: '12px', color: '#64748B' }}>
                  {userLocation.address}, {userLocation.locality || 'Salem'}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Fee Breakdown */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Doorstep Inspection Fee</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                ₹{parseFloat(inspectionFeeNumber).toFixed(2)}
              </Typography>
            </Box>

            {couponApplied && discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                  Coupon Discount ({couponCode})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>
                  -₹{parseFloat(discount).toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Total Payable Now
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 900, color: '#0F172A' }}>
                ₹{parseFloat(payableNow).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Dynamic Business UPI QR + Screenshot OCR Box */}
        <Box sx={{ mb: 4 }}>
          <DynamicQrPaymentBox
            bookingId={currentDisplayBookingId}
            amount={payableNow}
            paymentType="ADVANCE_FEE"
            serviceName={serviceName}
            onSuccess={handlePaymentSuccess}
            onCancel={handleBack}
          />
        </Box>
      </Container>

      {/* Processing Screen Backdrop */}
      <ProcessingBackdrop
        open={isProcessing}
        mode="payment"
        title={processingTitle}
        subtitle={processingSubtitle}
        badge="100% Safe Service Payment"
      />
    </Box>
  );
}
