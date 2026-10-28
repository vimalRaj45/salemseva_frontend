import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Container,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  Navigation,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  FastForward,
  User,
  MapPin,
  Wrench
} from 'lucide-react';
import LeafletMap from '../../components/LeafletMap';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const TRACKING_STAGES = [
  { key: 'matching', label: 'Requested', desc: 'Booking received by Salem dispatch hub' },
  { key: 'accepted', label: 'Dispatched', desc: 'Technician assigned & confirmed order' },
  { key: 'en_route', label: 'En Route', desc: 'Partner traveling to customer doorstep' },
  { key: 'arrived', label: 'On Site', desc: 'Arrived at location & OTP verified' },
  { key: 'quote_presented', label: 'Quote Review', desc: 'Diagnostic done, itemized quote presented' },
  { key: 'in_progress', label: 'In Progress', desc: 'Technical repair / installation underway' },
  { key: 'completed', label: 'Completed', desc: 'Job finished, customer paid & settled' }
];

export default function AdminLiveTrackingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [technician, setTechnician] = useState(location.state?.technician || null);
  const [loading, setLoading] = useState(!booking);
  const [advancing, setAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/admin');
    }
  };

  const fetchTrackingDetails = () => {
    if (!bookingId) return;
    fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.booking) {
          setBooking(d.booking);
          if (d.booking.technician) {
            setTechnician(d.booking.technician);
          }
        }
      })
      .catch((e) => console.warn('Tracking fetch error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrackingDetails();
    const interval = setInterval(fetchTrackingDetails, 6000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const currentStatus = booking?.status || 'matching';
  const currentIndex = TRACKING_STAGES.findIndex((s) => s.key === currentStatus);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;
  const nextStage = activeStep < TRACKING_STAGES.length - 1 ? TRACKING_STAGES[activeStep + 1] : null;

  const handleAdvanceStatus = async (targetStatusKey) => {
    try {
      setAdvancing(true);
      setErrorMsg('');

      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatusKey })
      });

      const data = await res.json();
      if (data.success || res.ok) {
        toast.success(`Booking status advanced to ${targetStatusKey.replace(/_/g, ' ').toUpperCase()}`);
        setBooking((prev) => ({ ...prev, status: targetStatusKey }));
      } else {
        setErrorMsg(data.error || 'Failed to update booking status');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error updating status');
    } finally {
      setAdvancing(false);
    }
  };

  const techCoords = technician?.current_lat && technician?.current_lng
    ? [parseFloat(technician.current_lat), parseFloat(technician.current_lng)]
    : [11.6780, 78.1580]; // Hasthampatti, Salem

  const custCoords = [11.6643, 78.1460]; // Fairlands, Salem

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

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
            Admin live tracking console
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{bookingId} • {booking?.service_name || booking?.service_id || 'Service Duty'}
          </Typography>
        </Box>

        <Chip
          label={currentStatus.replace(/_/g, ' ').toUpperCase()}
          size="small"
          sx={{ bgcolor: '#EFF6FF', color: '#0A66C2', fontWeight: 800, fontSize: '11px', height: 26 }}
        />
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
            {errorMsg}
          </Alert>
        )}

        {/* 7-Stage Progression Bar */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 2.5 }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#334155', mb: 1.5 }}>
            Operational Lifecycle Progression
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {TRACKING_STAGES.map((st, i) => {
              const isPast = i < activeStep;
              const isCurrent = i === activeStep;
              return (
                <Box
                  key={st.key}
                  sx={{
                    flex: '1 0 110px',
                    p: 1.2,
                    borderRadius: '10px',
                    border: isCurrent ? '2px solid #0A66C2' : isPast ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                    bgcolor: isCurrent ? '#EFF6FF' : isPast ? '#F0FDF4' : '#F8FAFC',
                    textAlign: 'center'
                  }}
                >
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: isCurrent ? '#0A66C2' : isPast ? '#166534' : '#64748B' }}>
                    {st.label}
                  </Typography>
                  <Typography sx={{ fontSize: '9.5px', color: '#64748B', mt: 0.3, display: 'block' }}>
                    {isCurrent ? 'Current' : isPast ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Admin Override Controls */}
          {nextStage && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                disabled={advancing}
                onClick={() => handleAdvanceStatus(nextStage.key)}
                startIcon={advancing ? <CircularProgress size={16} sx={{ color: '#FFF' }} /> : <FastForward size={16} />}
                sx={{
                  bgcolor: '#0A66C2',
                  fontWeight: 700,
                  fontSize: '12px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#084E96' }
                }}
              >
                Advance to: {nextStage.label}
              </Button>
            </Box>
          )}
        </Paper>

        {/* Live Radar Map */}
        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', mb: 2.5, height: 360 }}>
          <LeafletMap
            technicianLocation={techCoords}
            customerLocation={custCoords}
            status={currentStatus}
          />
        </Paper>

        {/* Technician & Customer Details Split */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2.2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#64748B', mb: 1, textTransform: 'uppercase' }}>
                Assigned Specialist
              </Typography>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {booking?.technician_name || technician?.full_name || 'Verified Salem Partner'}
              </Typography>
              <Typography sx={{ fontSize: '12.5px', color: '#475569', mb: 1.5 }}>
                Trade: <strong>{(booking?.service_id || technician?.primary_trade || 'Specialist').toUpperCase()}</strong> • Rating: <strong>4.9 / 5.0</strong>
              </Typography>
              {booking?.technician_phone && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={`tel:${booking.technician_phone}`}
                  startIcon={<Phone size={14} />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Call Specialist ({booking.technician_phone})
                </Button>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2.2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#64748B', mb: 1, textTransform: 'uppercase' }}>
                Customer & Doorstep
              </Typography>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {booking?.customer_name || 'Customer'}
              </Typography>
              <Typography sx={{ fontSize: '12.5px', color: '#475569', mb: 1.5 }}>
                Locality: <strong>{booking?.address_line || booking?.locality || 'Fairlands, Salem'}</strong>
              </Typography>
              {booking?.customer_phone && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={`tel:${booking.customer_phone}`}
                  startIcon={<Phone size={14} />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  Call Customer ({booking.customer_phone})
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
