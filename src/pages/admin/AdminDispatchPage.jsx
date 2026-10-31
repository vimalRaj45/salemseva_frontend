import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Container,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Radio,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AdminDispatchPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [loading, setLoading] = useState(true);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/admin');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        if (!booking && bookingId) {
          const bRes = await fetch(`${API_V1_URL}/bookings/${bookingId}/track`);
          const bData = await bRes.json();
          if (isMounted && bData.success && bData.booking) {
            setBooking(bData.booking);
          }
        }

        const tRes = await fetch(`${API_V1_URL}/technicians`);
        const tData = await tRes.json();
        if (isMounted) {
          const list = Array.isArray(tData) ? tData : tData.technicians || [];
          setTechnicians(list);
          const firstOnline = list.find((t) => t.is_online);
          if (firstOnline) setSelectedTechId(firstOnline.id);
        }
      } catch (e) {
        if (isMounted) setErrorMsg('Failed to load dispatch desk resources');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handleExecuteDispatch = async () => {
    if (!selectedTechId) {
      toast.error('Please choose a verified technician for dispatch');
      return;
    }

    setDispatchLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/${bookingId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          technicianId: selectedTechId,
          dispatcher: localStorage.getItem('shazuone_admin_user') || 'Central Dispatch Desk'
        })
      });

      const data = await res.json();
      if (data.success || res.ok) {
        const assignedTech = technicians.find((t) => t.id === selectedTechId);
        toast.success(`Booking #${bookingId} successfully dispatched to ${assignedTech?.full_name || 'Technician'}!`);
        setTimeout(() => {
          handleDismiss();
        }, 1000);
      } else {
        toast.error(data.error || 'Dispatch execution failed');
      }
    } catch {
      toast.error('Network error during manual dispatch');
    } finally {
      setDispatchLoading(false);
    }
  };

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
            Central operations manual dispatch
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Booking #{bookingId} • Assign verified specialist
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A66C2',
            flexShrink: 0
          }}
        >
          <Send size={20} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Order Details Strip */}
          <Paper elevation={0} sx={{ p: 2.2, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                {booking?.service_name || booking?.service_id || 'Service Booking'}
              </Typography>
              <Chip
                label={booking?.status?.toUpperCase() || 'SEARCHING'}
                size="small"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '10.5px' }}
              />
            </Box>

            <Typography sx={{ fontSize: '13px', color: '#475569', mb: 0.5 }}>
              Customer: <strong>{booking?.customer_name || 'Customer'}</strong> • {booking?.customer_phone || ''}
            </Typography>

            <Typography sx={{ fontSize: '12.5px', color: '#64748B' }}>
              Doorstep Locality: <strong>{booking?.address_line || booking?.locality || 'Salem'}</strong>
            </Typography>

            {booking?.scheduled_slot && booking.scheduled_slot !== 'instant_now' && (
              <Box sx={{ mt: 1.5, p: 1.2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={16} color="#0A66C2" />
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0369A1' }}>
                  Scheduled Window: {booking.scheduled_slot}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Technicians List */}
          <Box>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#334155', mb: 1.2 }}>
              Choose online verified partner ({technicians.length} available)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {technicians.map((t) => {
                const isSelected = selectedTechId === t.id;
                const isOnline = t.is_online;
                return (
                  <Paper
                    key={t.id}
                    elevation={0}
                    onClick={() => setSelectedTechId(t.id)}
                    sx={{
                      p: 1.8,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #0A66C2' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: isOnline ? '#16A34A' : '#94A3B8'
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: isSelected ? 800 : 700, color: '#0F172A' }}>
                          {t.full_name || t.name}
                        </Typography>
                        <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>
                          Trade: <strong>{(t.primary_trade || 'Tech').toUpperCase()}</strong> • Rating: <strong>{t.rating_avg || '5.0'} / 5.0</strong> • [{isOnline ? 'Online Radar Active' : 'Offline'}]
                        </Typography>
                      </Box>
                    </Box>

                    {isSelected ? (
                      <CheckCircle2 size={20} color="#0A66C2" />
                    ) : (
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* Action Button */}
          <Box sx={{ mt: 1, pb: 5 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={dispatchLoading || !selectedTechId}
              onClick={handleExecuteDispatch}
              startIcon={dispatchLoading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <Send size={18} />}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#0A66C2',
                fontWeight: 800,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              {dispatchLoading ? 'Executing dispatch...' : 'Dispatch technician & notify customer'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
