import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HubIcon from '@mui/icons-material/Hub';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import ShieldIcon from '@mui/icons-material/Shield';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import SendIcon from '@mui/icons-material/Send';
import BoltIcon from '@mui/icons-material/Bolt';
import SalemLottie from '../../components/SalemLottie';
import { ILLUSTRATIONS } from '../../constants/visualAssets';
import { API_V1_URL } from '../../config';

export default function AdminDispatchDrawer({
  open,
  onClose,
  booking,
  technicians = [],
  onDispatched = () => {}
}) {
  const [techSearch, setTechSearch] = useState('');
  const [dispatchingTechId, setDispatchingTechId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Trade matcher helper
  const getCategoryFromService = (srv) => {
    const s = (srv || '').toLowerCase();
    if (s.includes('ac') || s.includes('cool')) return 'ac';
    if (s.includes('electr') || s.includes('wire') || s.includes('fan')) return 'electr';
    if (s.includes('plumb') || s.includes('pipe') || s.includes('tap') || s.includes('leak')) return 'plumb';
    if (s.includes('clean') || s.includes('deep')) return 'clean';
    if (s.includes('paint')) return 'paint';
    if (s.includes('carp')) return 'carp';
    return 'all';
  };

  const bookingTrade = booking ? getCategoryFromService(booking.service_name || booking.service_id) : 'all';

  // Filter & Rank Technicians
  const rankedTechnicians = useMemo(() => {
    if (!booking) return [];

    const q = techSearch.toLowerCase();
    const custLoc = (booking.locality || '').toLowerCase();

    return technicians
      .filter((t) => {
        const name = (t.full_name || '').toLowerCase();
        const trade = (t.primary_trade || '').toLowerCase();
        const phone = (t.phone || '').toLowerCase();
        const matchesQuery = !q || name.includes(q) || trade.includes(q) || phone.includes(q);
        return matchesQuery;
      })
      .map((t) => {
        let score = 0;
        const trade = (t.primary_trade || '').toLowerCase();

        // Trade Match Bonus
        if (bookingTrade !== 'all') {
          if (trade.includes(bookingTrade) || bookingTrade.includes(trade)) score += 50;
        }

        // Online Bonus
        if (t.is_online) score += 30;

        // Zero active job bonus (idle and ready)
        const activeJobs = parseInt(t.active_job_count || 0, 10);
        if (activeJobs === 0) score += 20;
        else score -= activeJobs * 10;

        // Rating bonus
        score += parseFloat(t.rating_avg || 4.5) * 5;

        // Locality match bonus
        const techLoc = (t.locality || t.current_locality || '').toLowerCase();
        if (custLoc && techLoc && (custLoc.includes(techLoc) || techLoc.includes(custLoc))) {
          score += 25;
        }

        return { ...t, dispatchScore: score };
      })
      .sort((a, b) => b.dispatchScore - a.dispatchScore);
  }, [technicians, booking, techSearch, bookingTrade]);

  const handleConfirmDispatch = async (tech) => {
    if (!booking) return;
    try {
      setDispatchingTechId(tech.id);
      setErrorMsg('');

      const res = await fetch(`${API_V1_URL}/admin/bookings/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          technicianId: tech.id
        })
      });

      const data = await res.json();
      if (data.success) {
        onDispatched(booking.id, tech);
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to dispatch technician');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Dispatch network error');
    } finally {
      setDispatchingTechId(null);
    }
  };

  if (!booking) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          p: 0,
          bgcolor: '#F8FAFC'
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HubIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
              Smart Technician Dispatch
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              Assign Partner to Booking #{booking.id}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: '#64748B' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Booking Context Banner */}
      <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0369A1' }}>
                  {booking.service_name || booking.service_id || 'Requested Service'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  Customer: {booking.customer_name || 'Salem Resident'} • {booking.customer_phone}
                </Typography>
              </Box>
              <Chip
                label={`Inspection Fee: ₹${parseFloat(booking.visit_fee || 99).toFixed(2)}`}
                size="small"
                sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '10px' }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
              <RoomIcon sx={{ fontSize: 15, color: '#0284C7' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11px' }}>
                {booking.customer_address || booking.locality || 'Salem City'}
              </Typography>
            </Box>
          </Box>

          <Box
            component="img"
            src={ILLUSTRATIONS.delivery}
            alt="Doorstep delivery"
            sx={{ width: 68, height: 58, objectFit: 'contain', display: { xs: 'none', sm: 'block' }, opacity: 0.9 }}
          />
        </Paper>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ m: 2, borderRadius: '8px' }}>
          {errorMsg}
        </Alert>
      )}

      {/* Technician Search & List */}
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter available technicians by name, trade, phone..."
          value={techSearch}
          onChange={(e) => setTechSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '12.5px', mb: 1.5 }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Matched Fleet ({rankedTechnicians.length} available)
          </Typography>
          <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800 }}>
            Ranked by Proximity & Trade
          </Typography>
        </Box>

        {rankedTechnicians.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <SalemLottie name="radar" width={110} height={110} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748B', mt: 1 }}>
              Radar Matcher: No online technicians found for this trade
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
              Try searching a different trade keyword or check the offline fleet.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {rankedTechnicians.map((tech) => {
              const isOnline = tech.is_online;
              const activeJobs = parseInt(tech.active_job_count || 0, 10);
              const isDispatching = dispatchingTechId === tech.id;

              return (
                <Paper
                  key={tech.id}
                  elevation={0}
                  sx={{
                    p: 1.8,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                    '&:hover': {
                      borderColor: '#0284C7',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar sx={{ width: 38, height: 38, bgcolor: isOnline ? '#0284C7' : '#94A3B8', fontWeight: 800, fontSize: '14px' }}>
                        {tech.full_name?.substring(0, 2).toUpperCase() || 'TC'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                          {tech.full_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
                          <Chip
                            label={(tech.primary_trade || 'general').toUpperCase()}
                            size="small"
                            sx={{ height: 18, fontSize: '9px', fontWeight: 900, bgcolor: '#F1F5F9', color: '#475569' }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                            {tech.years_experience || 4}y exp
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {isOnline ? (
                      activeJobs > 0 ? (
                        <Chip
                          icon={<WorkHistoryIcon sx={{ fontSize: '11px !important', color: '#B45309 !important' }} />}
                          label="ON JOB"
                          size="small"
                          sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '9.5px', height: 20 }}
                        />
                      ) : (
                        <Chip
                          icon={<SensorsIcon sx={{ fontSize: '11px !important', color: '#166534 !important' }} />}
                          label="READY"
                          size="small"
                          sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '9.5px', height: 20 }}
                        />
                      )
                    ) : (
                      <Chip
                        icon={<PowerSettingsNewIcon sx={{ fontSize: '11px !important', color: '#64748B !important' }} />}
                        label="OFFLINE"
                        size="small"
                        sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '9.5px', height: 20 }}
                      />
                    )}
                  </Box>

                  {/* Rating & KYC */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', p: 1, borderRadius: '8px', mb: 1.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A' }}>
                        {tech.rating_avg || '4.90'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                        ({tech.rating_count || 32} reviews)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <ShieldIcon sx={{ fontSize: 13, color: tech.is_kyc_verified ? '#10B981' : '#F59E0B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: tech.is_kyc_verified ? '#166534' : '#B45309', fontSize: '10px' }}>
                        {tech.is_kyc_verified ? 'DigiLocker KYC' : 'Pending KYC'}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11px' }}>
                      {tech.jobs_completed_count || 12} jobs
                    </Typography>
                  </Box>

                  {/* Dispatch Action */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={isDispatching ? <CircularProgress size={14} sx={{ color: '#FFFFFF' }} /> : <BoltIcon sx={{ fontSize: 15 }} />}
                    disabled={isDispatching}
                    onClick={() => handleConfirmDispatch(tech)}
                    sx={{
                      bgcolor: isOnline ? '#0284C7' : '#D97706',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '12px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      py: 0.7,
                      '&:hover': { bgcolor: isOnline ? '#0369A1' : '#B45309' }
                    }}
                  >
                    {isDispatching 
                      ? 'Dispatching...' 
                      : (isOnline ? 'Assign & Dispatch Now' : 'Request Offline Partner (ஆன்லைன் வர கோரவும்)')}
                  </Button>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
