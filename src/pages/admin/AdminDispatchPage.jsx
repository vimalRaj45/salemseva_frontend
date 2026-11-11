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
  ShieldCheck,
  Phone
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
          const firstOnline = list.find((t) => {
            return Boolean(
              t.is_online === true ||
              t.is_online === 'true' ||
              t.isOnline === true ||
              t.isOnline === 'true' ||
              (typeof window !== 'undefined' &&
                localStorage.getItem('shazuone_partner_id') === t.id &&
                localStorage.getItem('shazuone_partner_duty') === 'on')
            );
          });
          if (firstOnline) {
            setSelectedTechId(firstOnline.id);
          } else if (list.length > 0) {
            setSelectedTechId(list[0].id);
          }
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
          bgcolor: 'var(--cz-chrome-bg, #EBF3FE)',
          borderBottom: '1px solid var(--cz-chrome-border, #C7DBF7)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: { xs: 1.5, sm: 3 },
          pt: 'calc(10px + var(--sat))',
          pb: 1.25,
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
                const isOnline = Boolean(
                  t.is_online === true ||
                  t.is_online === 'true' ||
                  t.isOnline === true ||
                  t.isOnline === 'true' ||
                  (typeof window !== 'undefined' &&
                    localStorage.getItem('shazuone_partner_id') === t.id &&
                    localStorage.getItem('shazuone_partner_duty') === 'on')
                );
                const techName = t.full_name || t.name || 'Technician';
                const techTrade = (t.primary_trade || t.trade || 'Tech').toUpperCase();
                const techRating = t.rating_avg != null ? t.rating_avg : (t.ratingAvg != null ? t.ratingAvg : '5.0');
                const techPhone = t.phone || t.rawPhone || t.payoutPhone || '';

                // Technician's chosen working locations
                let rawLocs = t.assigned_localities || t.assignedLocalities || t.working_localities;
                if (!rawLocs || (Array.isArray(rawLocs) && rawLocs.length === 0)) {
                  if (typeof window !== 'undefined' && localStorage.getItem('shazuone_partner_id') === t.id) {
                    try {
                      rawLocs = JSON.parse(localStorage.getItem('shazuone_partner_localities') || '[]');
                    } catch {}
                  }
                }
                if (!rawLocs || (Array.isArray(rawLocs) && rawLocs.length === 0)) {
                  rawLocs = t.serviceArea ? [t.serviceArea] : ['Fairlands, Salem'];
                }
                const chosenLocations = Array.isArray(rawLocs)
                  ? rawLocs
                  : [String(rawLocs)];

                const doorstepLoc = String(booking?.address_line || booking?.locality || '').toLowerCase().trim();
                const isLocationMatch = doorstepLoc && chosenLocations.some(loc => {
                  const l = String(loc).toLowerCase().trim();
                  return doorstepLoc.includes(l) || l.includes(doorstepLoc);
                });

                return (
                  <Paper
                    key={t.id}
                    elevation={0}
                    onClick={() => setSelectedTechId(t.id)}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #0A66C2' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.2,
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: isOnline ? '#16A34A' : '#94A3B8',
                            mt: 0.8,
                            flexShrink: 0
                          }}
                        />
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: isSelected ? 800 : 700, color: '#0F172A' }}>
                              {techName}
                            </Typography>
                            <Chip
                              label={isOnline ? 'Online' : 'Offline'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '10.5px',
                                fontWeight: 700,
                                bgcolor: isOnline ? '#DCFCE7' : '#F1F5F9',
                                color: isOnline ? '#15803D' : '#64748B',
                                borderRadius: '6px'
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.2 }}>
                            Trade: <strong>{techTrade}</strong> • Rating: <strong>{techRating} / 5.0</strong>
                          </Typography>
                        </Box>
                      </Box>

                      {isSelected ? (
                        <CheckCircle2 size={20} color="#0A66C2" style={{ flexShrink: 0 }} />
                      ) : (
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #CBD5E1', flexShrink: 0 }} />
                      )}
                    </Box>

                    {/* Contact & Chosen Working Location Details */}
                    <Box sx={{ pl: 2.7, pt: 0.8, borderTop: '1px dashed #E2E8F0', display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                      {techPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                          <Phone size={13} color="#0A66C2" style={{ flexShrink: 0 }} />
                          <Typography
                            component="a"
                            href={`tel:${techPhone.replace(/[\s\-]/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#0A66C2',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {techPhone}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                            (Contact specialist before dispatch)
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                        <MapPin size={13} color="#64748B" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                            Working Areas:{' '}
                            <strong style={{ color: '#0F172A' }}>{chosenLocations.join(', ')}</strong>
                          </Typography>
                          {isLocationMatch && (
                            <Box sx={{ mt: 0.4 }}>
                              <Chip
                                label="Matches Doorstep Locality"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  bgcolor: '#ECFDF5',
                                  color: '#047857',
                                  border: '1px solid #A7F3D0',
                                  borderRadius: '4px'
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
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
