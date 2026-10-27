import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  IconButton,
  Avatar,
  Skeleton,
  Rating,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StarsIcon from '@mui/icons-material/Stars';
import StarIcon from '@mui/icons-material/Star';
import HandymanIcon from '@mui/icons-material/Handyman';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BoltIcon from '@mui/icons-material/Bolt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { ApiService } from '../../services/api';
import DynamicTrustTicker from '../../components/DynamicTrustTicker';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [navValue, setNavValue] = useState(0);
  const [onlineTechnicians, setOnlineTechnicians] = useState([]);
  const [techTradeFilter, setTechTradeFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [servicesAvailability, setServicesAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('shazuone_user_location');
    return saved ? JSON.parse(saved) : {
      locality: 'Fairlands',
      pincode: '636016',
      address: 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
      lat: 11.6738,
      lng: 78.1460
    };
  });

  useEffect(() => {
    const handleLocationUpdate = (e) => {
      if (e.detail) {
        setUserLocation(e.detail);
      } else {
        const saved = localStorage.getItem('shazuone_user_location');
        if (saved) {
          try { setUserLocation(JSON.parse(saved)); } catch {}
        }
      }
    };
    window.addEventListener('shazuone_location_updated', handleLocationUpdate);
    window.addEventListener('storage', handleLocationUpdate);
    return () => {
      window.removeEventListener('shazuone_location_updated', handleLocationUpdate);
      window.removeEventListener('storage', handleLocationUpdate);
    };
  }, []);

  const [activeBooking, setActiveBooking] = useState(null);
  const [realReviews, setRealReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const data = await ApiService.fetchServices('en');
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (e) {
        console.warn('Failed to load services:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();

    async function loadAvailability() {
      try {
        const res = await fetch(`${API_V1_URL}/services-availability`);
        const data = await res.json();
        if (data.success && data.services) {
          setServicesAvailability(data.services);
        }
      } catch (e) {
        console.warn('Failed to load services availability:', e);
      }
    }
    loadAvailability();

    async function loadOnlineTechs() {
      try {
        const res = await fetch(`${API_V1_URL}/technicians`);
        const data = await res.json();
        if (data.success && Array.isArray(data.technicians)) {
          const tradeNames = {
            ac: 'AC Master Specialist',
            electrician: 'Senior Certified Electrician',
            plumber: 'Master Sanitary Plumber',
            cleaning: 'Deep Cleaning Specialist'
          };
          const mapped = data.technicians.map(t => ({
            id: t.id,
            name: t.name || t.full_name,
            trade: t.trade || t.primary_trade,
            tradeName: t.tradeName || tradeNames[t.trade || t.primary_trade] || 'Certified Specialist',
            ratingAvg: parseFloat(t.ratingAvg || t.rating_avg || 5.0),
            jobsCompleted: parseInt(t.jobsCompleted ?? t.jobs_completed_count ?? 0, 10),
            serviceArea: t.serviceArea || ((t.assigned_localities && t.assigned_localities[0]) ? `${t.assigned_localities[0]}, Salem` : 'Fairlands, Salem'),
            experienceYears: t.experienceYears || t.years_experience || 5,
            isOnline: Boolean(t.is_online ?? t.isOnline ?? true)
          }));
          setOnlineTechnicians(mapped.filter(t => t.isOnline));
        } else {
          setOnlineTechnicians([]);
        }
      } catch (e) {
        console.warn('Failed to load online technicians:', e);
        setOnlineTechnicians([]);
      }
    }
    loadOnlineTechs();

    async function loadReviews() {
      try {
        const [revData, statData] = await Promise.all([
          ApiService.fetchReviews({ limit: 4 }),
          ApiService.fetchReviewStats()
        ]);
        if (revData?.success && Array.isArray(revData.reviews)) {
          setRealReviews(revData.reviews);
        }
        if (statData?.success && statData.stats) {
          setReviewStats(statData.stats);
        }
      } catch (err) {
        console.warn('Real reviews loading notice:', err);
      }
    }
    loadReviews();

    // Real-time persistent active booking poll
    const activeBookingId = localStorage.getItem('shazuone_active_booking');
    if (!activeBookingId) {
      setActiveBooking(null);
      return;
    }

    const checkActiveBooking = async () => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/${activeBookingId}/track`);
        const d = await res.json();
        if (d.success && d.booking && ['matching', 'accepted', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(d.booking.status)) {
          const isRated = localStorage.getItem(`shazuone_rated_${activeBookingId}`);
          if (d.booking.status === 'completed' && isRated) {
            setActiveBooking(null);
          } else {
            setActiveBooking(d);
          }
        } else {
          setActiveBooking(null);
        }
      } catch (err) {
        console.warn('Active booking check:', err);
      }
    };

    checkActiveBooking();
    const interval = setInterval(checkActiveBooking, 2500);

    return () => clearInterval(interval);
  }, []);

  const getServiceMetadata = (s) => {
    switch (s.id) {
      case 'ac':
        return {
          desc: 'Jet cleaning, gas check & cooling repairs',
          eta: '25 min ETA',
          icon: <AcUnitIcon sx={{ fontSize: 24 }} />,
          color: '#0284C7',
          bg: '#F0F9FF',
          accent: '#BAE6FD'
        };
      case 'electrician':
        return {
          desc: 'Fan installation, switchboard & wiring fixes',
          eta: '20 min ETA',
          icon: <ElectricBoltIcon sx={{ fontSize: 24 }} />,
          color: '#D97706',
          bg: '#FFFBEB',
          accent: '#FDE68A'
        };
      case 'plumber':
        return {
          desc: 'Pipe leakage, tap replacement & motor repair',
          eta: '30 min ETA',
          icon: <PlumbingIcon sx={{ fontSize: 24 }} />,
          color: '#7C3AED',
          bg: '#FAF5FF',
          accent: '#DDD6FE'
        };
      case 'cleaning':
        return {
          desc: 'Bathroom deep clean & home sanitization',
          eta: '35 min ETA',
          icon: <CleaningServicesIcon sx={{ fontSize: 24 }} />,
          color: '#059669',
          bg: '#ECFDF5',
          accent: '#A7F3D0'
        };
      default:
        return {
          desc: s.category || 'Professional home service & repair',
          eta: '30 min ETA',
          icon: <WorkOutlineIcon sx={{ fontSize: 24 }} />,
          color: s.colorHex || '#0284C7',
          bg: '#F0F9FF',
          accent: '#BAE6FD'
        };
    }
  };

  const activeServicesList = services || [];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: { xs: 8, md: 5 } }}>
      <Container maxWidth={false} sx={{ maxWidth: '1380px', px: { xs: 1.5, sm: 2.5, md: 3 }, pt: { xs: 1.5, md: 2.5 } }}>
        
        {/* Unified Top Context Deck: Location Bar & User Account Status */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: { xs: 1.2, sm: 1.5 },
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          {/* Location Area Selector */}
          <Box
            onClick={() => navigate('/location', { state: { returnTo: '/', currentLocation: userLocation } })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 0.8,
              borderRadius: '10px',
              transition: 'background-color 0.15s ease',
              flex: 1,
              minWidth: 0,
              '&:hover': { bgcolor: '#F8FAFC' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  color: '#0066CC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #DBEAFE'
                }}
              >
                <LocationOnIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                {(() => {
                  const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
                  const p = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
                  const isBadPin = Boolean(p && !p.startsWith('636'));
                  return (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isBadPin ? '#991B1B' : '#0F172A', fontSize: '13.5px' }}>
                          {userLocation.locality || 'Fairlands, Salem'}
                        </Typography>
                        <Chip
                          label={isBadPin ? 'Outside Salem Region' : 'Salem Service Zone'}
                          size="small"
                          sx={{
                            bgcolor: isBadPin ? '#FEF2F2' : '#EFF6FF',
                            color: isBadPin ? '#DC2626' : '#0284C7',
                            border: isBadPin ? '1px solid #FCA5A5' : '1px solid #BFDBFE',
                            fontWeight: 700,
                            fontSize: '10px',
                            height: 18,
                            px: 0.2
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isBadPin ? '#DC2626' : '#64748B',
                          fontSize: '11px',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {isBadPin ? `PIN ${p} not accepted. Only Salem 636xxx serviced.` : (userLocation.address || 'Doorstep service in 25-35 mins')}
                      </Typography>
                    </>
                  );
                })()}
              </Box>
            </Box>

            <Button
              size="small"
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: '#0066CC',
                fontWeight: 700,
                fontSize: '12px',
                height: '32px',
                textTransform: 'none',
                flexShrink: 0,
                px: 1.4,
                borderRadius: '8px',
                bgcolor: '#EFF6FF',
                ml: 1,
                '&:hover': { bgcolor: '#DBEAFE' }
              }}
            >
              Change
            </Button>
          </Box>

          {/* Right Status Module: Guest Banner OR Logged-in User Wallet Strip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {!user ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  p: { xs: 1, sm: 1.2 },
                  borderRadius: '10px',
                  bgcolor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  width: { xs: '100%', md: 'auto' }
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '12.5px', lineHeight: 1.2 }}>
                    Guest Mode (விருந்தினர் பார்வை)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '11px', display: 'block' }}>
                    Sign in to claim ₹100 Welcome credits & live GPS
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: '#0066CC',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    height: '32px',
                    px: 2,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#0052CC' }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: { xs: 0.8, sm: 1 },
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#0066CC', color: '#FFF', fontSize: '13px', fontWeight: 700 }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarsIcon sx={{ color: '#D97706', fontSize: 13 }} /> {user.walletBalance ?? 150} Credits (₹{(((user.walletBalance ?? 150) / 10)).toFixed(0)})
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/wallet')}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    borderRadius: '8px',
                    height: '30px',
                    textTransform: 'none',
                    px: 1.5,
                    '&:hover': { bgcolor: '#FFFFFF', borderColor: '#94A3B8' }
                  }}
                >
                  Wallet
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Dynamic & Animated Salem Live Trust Strip */}
        <DynamicTrustTicker locality={user?.locality || 'Fairlands, Salem'} />

        {/* Active Connected Service Banner (Persistent Real-Time Sync) */}
        {user && activeBooking && activeBooking.booking?.id && (() => {
          const status = activeBooking.booking?.status || 'matching';
          const bId = activeBooking.booking?.id;
          const techName = activeBooking.technician?.name || activeBooking.technician_name || 'Assigned Partner';

          let resumeUrl = `/track?bookingId=${bId}`;
          let statusTitle = `Connected Service #${bId}`;
          let statusSubtitle = `${techName} • Active`;
          let btnText = 'Resume Track';
          let dotColor = '#34D399';

          if (status === 'matching') {
            resumeUrl = `/matching?bookingId=${bId}`;
            statusTitle = 'Dispatching: Finding Technician...';
            statusSubtitle = 'Searching Fairlands & Salem zone';
            btnText = 'Resume Search';
            dotColor = '#38BDF8';
          } else if (status === 'accepted' || status === 'en_route') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = `${techName} is En Route`;
            statusSubtitle = 'Live GPS navigation • Two-wheeler ETA 15 mins';
            btnText = 'Track Live';
            dotColor = '#34D399';
          } else if (status === 'arrived') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = `${techName} at Your Doorstep`;
            statusSubtitle = 'Doorstep verification & check initiated';
            btnText = 'View Service';
            dotColor = '#60A5FA';
          } else if (status === 'inspecting') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = 'Inspection & Diagnosis in Progress';
            statusSubtitle = 'Preparing digital job card estimate';
            btnText = 'View Progress';
            dotColor = '#FBBF24';
          } else if (status === 'quote_presented') {
            resumeUrl = `/quote?bookingId=${bId}`;
            statusTitle = 'Digital Estimate Ready for Approval';
            statusSubtitle = 'OEM parts & labor calculation available';
            btnText = 'Review Quote';
            dotColor = '#F59E0B';
          } else if (status === 'quote_approved') {
            resumeUrl = `/checkout?bookingId=${bId}`;
            statusTitle = 'Work in Progress / Payment Ready';
            statusSubtitle = 'Digital escrow checkout';
            btnText = 'Go to Pay';
            dotColor = '#10B981';
          } else if (status === 'completed') {
            resumeUrl = `/rate?bookingId=${bId}`;
            statusTitle = 'Service Completed • Rate Technician';
            statusSubtitle = 'Share your experience to close order';
            btnText = 'Rate Service';
            dotColor = '#A78BFA';
          }

          return (
            <Paper
              elevation={2}
              sx={{
                p: { xs: 1.4, sm: 1.8 },
                mb: 2.5,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: dotColor,
                    flexShrink: 0,
                    boxShadow: `0 0 10px ${dotColor}`
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px', lineHeight: 1.2 }}
                  >
                    {statusTitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: '#94A3B8', fontSize: '11.5px', display: 'block', mt: 0.3 }}
                  >
                    {statusSubtitle}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(resumeUrl)}
                sx={{
                  bgcolor: '#0066CC',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  height: '34px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  flexShrink: 0,
                  ml: 1.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0052CC' }
                }}
              >
                {btnText}
              </Button>
            </Paper>
          );
        })()}

        {/* High-Impact Hero Promotional Showcase Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
            mb: 3,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Ambient decorative glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '-30%',
              right: '10%',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } }, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label="Special Offer"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(254, 243, 199, 0.15)',
                      color: '#FDE68A',
                      border: '1px solid rgba(253, 230, 138, 0.3)',
                      fontWeight: 800,
                      fontSize: '10px',
                      height: 20
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
                    Valid for all Salem residences
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '18px', sm: '21px' },
                    color: '#FFFFFF',
                    letterSpacing: '-0.3px',
                    mb: 0.6,
                    lineHeight: 1.25
                  }}
                >
                  ₹100 off your first home service
                </Typography>

                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '12px', mb: 1.8, maxWidth: '520px', lineHeight: 1.5 }}>
                  Apply code <Box component="span" sx={{ bgcolor: 'rgba(255,255,255,0.12)', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>SALEM100</Box> at checkout. Includes complete 30-day rework warranty and background-checked technicians.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      const acService = activeServicesList.find(s => s.id === 'ac') || { id: 'ac', name: 'AC Repair & Service', visitFee: 149 };
                      navigate('/book/ac', { state: { service: acService } });
                    }}
                    sx={{
                      bgcolor: '#0066CC',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      height: '36px',
                      px: 2.2,
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0052CC' }
                    }}
                  >
                    Book AC Service
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const elService = activeServicesList.find(s => s.id === 'electrician') || { id: 'electrician', name: 'Electrician & Wiring', visitFee: 149 };
                      navigate('/book/electrician', { state: { service: elService } });
                    }}
                    sx={{
                      color: '#E2E8F0',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      height: '36px',
                      px: 1.8,
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)', borderColor: '#FFFFFF' }
                    }}
                  >
                    Book Electrician
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 130,
                    height: 130,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80"
                    alt="Verified Salem Technician"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 0.6,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      textAlign: 'center'
                    }}
                  >
                    <Typography sx={{ color: '#38BDF8', fontSize: '9.5px', fontWeight: 800 }}>
                      Verified Partner
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section Header: Available Services in Salem */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Available Services in Salem
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
              Standardized doorstep inspection with transparent digital pricing
            </Typography>
          </Box>
          <Chip
            label="Doorstep Service: 25-35 Mins"
            size="small"
            sx={{
              bgcolor: '#F1F5F9',
              color: '#475569',
              fontWeight: 700,
              fontSize: '10.5px',
              height: 22
            }}
          />
        </Box>

        {/* Responsive Services Grid (Dynamic DB Data - 2x2 on Mobile, 4 in a row on Desktop) */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3.5 }}>
          {isLoading ? (
            [1, 2, 3, 4].map((n) => (
              <Grid item xs={6} sm={6} md={3} key={n}>
                <Card elevation={0} sx={{ height: '100%', p: { xs: 1.5, sm: 2 }, borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <Skeleton variant="rounded" width={38} height={38} sx={{ mb: 1.2, borderRadius: '10px' }} />
                  <Skeleton variant="text" width="75%" height={22} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="95%" height={14} />
                  <Skeleton variant="text" width="55%" height={14} />
                </Card>
              </Grid>
            ))
          ) : (
            activeServicesList.map((svc) => {
              const meta = getServiceMetadata(svc);
              const avail = servicesAvailability[svc.id];
              const isClosed = Boolean(avail && !avail.hasTechnicians);

              return (
                <Grid item xs={6} sm={6} md={3} key={svc.id}>
                  <Card
                    elevation={0}
                    onClick={() => navigate(`/book/${svc.id}`, { state: { service: svc } })}
                    sx={{
                      height: '100%',
                      borderRadius: '14px',
                      bgcolor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      p: { xs: 1.4, sm: 2 },
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        borderColor: '#0284C7',
                        boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 1, sm: 1.5 } }}>
                        <Box
                          sx={{
                            width: { xs: 36, sm: 44 },
                            height: { xs: 36, sm: 44 },
                            borderRadius: '10px',
                            bgcolor: meta.bg,
                            color: meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${meta.accent}`,
                            '& svg': { fontSize: { xs: 20, sm: 24 } }
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Chip
                          label={isClosed ? 'Advance Booking' : meta.eta}
                          size="small"
                          sx={{
                            bgcolor: isClosed ? '#FEF3C7' : '#F0FDF4',
                            color: isClosed ? '#92400E' : '#166534',
                            fontWeight: 800,
                            fontSize: { xs: '8.5px', sm: '10px' },
                            height: { xs: 19, sm: 22 },
                            px: { xs: 0.2, sm: 0.6 },
                            border: isClosed ? '1px solid #FDE68A' : '1px solid #BBF7D0'
                          }}
                        />
                      </Box>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: '#0F172A',
                          fontSize: { xs: '12.5px', sm: '14px' },
                          mb: { xs: 0.3, sm: 0.5 },
                          lineHeight: 1.3,
                          minHeight: { xs: '34px', sm: '38px' },
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {svc.name || svc.name_en || svc.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          fontSize: { xs: '10.5px', sm: '11.5px' },
                          lineHeight: 1.35,
                          mb: { xs: 1, sm: 1.5 },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: { xs: '28px', sm: '32px' }
                        }}
                      >
                        {isClosed ? 'Reserve advance slot dispatched by Central Ops' : meta.desc}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: { xs: '9px', sm: '10px' }, display: 'block' }}>
                          Inspection fee
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '12px', sm: '13px' } }}>
                          ₹{svc.visitFee || 99}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          borderRadius: '50%',
                          bgcolor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: '#0066CC', color: '#FFFFFF' }
                        }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Active Specialists On Duty in Salem */}
        {(() => {
          const displayTechs = onlineTechnicians || [];
          const filteredTechs = displayTechs.filter(t => techTradeFilter === 'all' || t.trade === techTradeFilter);

          return (
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                    Active Specialists On Duty
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                    Certified Salem technicians available for appointment slots today & this week
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#ECFDF5', px: 1.4, py: 0.6, borderRadius: '20px', border: '1px solid #A7F3D0' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', fontSize: '11px' }}>
                    {displayTechs.length} Specialists Online in Salem
                  </Typography>
                </Box>
              </Box>

              {/* Trade Filter Chips */}
              <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.5, scrollbarWidth: 'none' }}>
                {[
                  { id: 'all', label: 'All Specialists' },
                  { id: 'ac', label: 'AC Master' },
                  { id: 'electrician', label: 'Electrician' },
                  { id: 'plumber', label: 'Plumbing' },
                  { id: 'cleaning', label: 'Deep Cleaning' }
                ].map((tab) => (
                  <Chip
                    key={tab.id}
                    label={tab.label}
                    onClick={() => setTechTradeFilter(tab.id)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      bgcolor: techTradeFilter === tab.id ? '#0F172A' : '#FFFFFF',
                      color: techTradeFilter === tab.id ? '#FFFFFF' : '#475569',
                      border: techTradeFilter === tab.id ? '1px solid #0F172A' : '1px solid #E2E8F0',
                      boxShadow: techTradeFilter === tab.id ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: techTradeFilter === tab.id ? '#1E293B' : '#F1F5F9'
                      }
                    }}
                  />
                ))}
              </Box>

              {displayTechs.length === 0 ? (
                /* Interactive Central Ops Dispatch Fallback Component */
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      bgcolor: '#EFF6FF',
                      color: '#0066CC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    <SupportAgentIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', mb: 0.5 }}>
                    Central Ops Automated Dispatch Active
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', maxWidth: '580px', mx: 'auto', mb: 2, lineHeight: 1.5 }}>
                    Specialists are currently completing on-site visits across Fairlands, Hasthampatti, and Suramangalam. You can reserve any service above to receive a prioritized morning or afternoon dispatch slot.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {['ac', 'electrician', 'plumber', 'cleaning'].map((key) => {
                      const svc = activeServicesList.find(s => s.id === key) || { id: key, name: key.toUpperCase(), visitFee: 99 };
                      return (
                        <Button
                          key={key}
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/book/${key}`, { state: { service: svc } })}
                          sx={{
                            color: '#0066CC',
                            borderColor: '#BFDBFE',
                            bgcolor: '#EFF6FF',
                            fontWeight: 700,
                            fontSize: '11px',
                            textTransform: 'capitalize',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' }
                          }}
                        >
                          Book {key}
                        </Button>
                      );
                    })}
                  </Box>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {(filteredTechs.length > 0 ? filteredTechs : displayTechs).slice(0, 4).map((tech) => (
                    <Grid item xs={12} sm={6} md={3} key={tech.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          bgcolor: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#0284C7',
                            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.1)',
                            transform: 'translateY(-3px)'
                          }
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar sx={{ width: 44, height: 44, bgcolor: '#0284C7', fontWeight: 800, fontSize: '16px' }}>
                                {(tech.name || 'Technician').charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981', border: '2px solid #FFFFFF' }} />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {tech.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, fontSize: '11px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {tech.tradeName || 'Certified Specialist'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2 }}>
                            <LocationOnIcon sx={{ fontSize: 13, color: '#D97706' }} />
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
                              {tech.serviceArea || 'Fairlands, Salem'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<StarIcon sx={{ fontSize: '11px !important', color: '#D97706 !important' }} />}
                              label={`${tech.ratingAvg || 4.9} (${tech.jobsCompleted || 80}+ jobs)`}
                              size="small"
                              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '10px', height: 20 }}
                            />
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '11px !important', color: '#16A34A !important' }} />}
                              label="KYC Verified"
                              size="small"
                              sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '9.5px', height: 20 }}
                            />
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => navigate(`/book/${tech.trade || 'ac'}`, { state: { requestedTechnician: tech } })}
                          sx={{
                            bgcolor: '#0F172A',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            py: 0.8,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#0284C7' }
                          }}
                        >
                          Reserve with Specialist
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          );
        })()}

        {/* Real Customer Reviews & Star Ratings (PostgreSQL Grounded) */}
        {realReviews.length > 0 && (
          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px', letterSpacing: '-0.3px', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Real Salem Customer Reviews
                  <Chip label="Verified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 800, fontSize: '10px', height: 20 }} />
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                  Authentic ratings from completed bookings in Salem
                </Typography>
              </Box>
              {reviewStats?.average_rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: '#FEF3C7', px: 1.2, py: 0.4, borderRadius: '8px', border: '1px solid #FDE68A' }}>
                  <Rating value={Number(reviewStats.average_rating)} precision={0.1} readOnly size="small" sx={{ color: '#D97706' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', fontSize: '11.5px' }}>
                    {reviewStats.average_rating} ({reviewStats.total_reviews} reviews)
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              {realReviews.slice(0, 4).map((rev) => (
                <Grid item xs={12} sm={6} key={rev.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0284C7', fontSize: '13px', fontWeight: 800 }}>
                            {(rev.customer_name || 'Customer').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                              {rev.customer_name || 'Verified Homeowner'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                              {rev.locality || 'Salem'} • {rev.service_name || 'Home Service'}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={Number(rev.rating) || 5} precision={0.5} readOnly size="small" sx={{ color: '#F59E0B' }} />
                      </Box>

                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '12px', lineHeight: 1.5, mb: 1.2, fontStyle: 'italic' }}>
                        "{rev.feedback}"
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 14 }} />
                        <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '11px' }}>
                          Verified Order #{rev.booking_id}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
                        Specialist: {rev.technician_name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Four-Pillar Enterprise Trust Ribbon */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            mb: 3.5
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #A7F3D0' }}>
                  <VerifiedUserIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                    KYC & Police Verified
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mt: 0.2 }}>
                    Aadhaar checked doorstep professionals
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #BFDBFE' }}>
                  <SecurityIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                    100% Escrow Protected
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mt: 0.2 }}>
                    Payment released only after job completion
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #FDE68A' }}>
                  <ShieldIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                    30-Day Rework Warranty
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mt: 0.2 }}>
                    Free revisit guarantee on all services
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #DDD6FE' }}>
                  <MonetizationOnIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                    Upfront Transparent Rates
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mt: 0.2 }}>
                    Standard visit fee, no hidden charges
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mb: 2 }} />

      </Container>

      {/* Floating Bottom Navigation for Mobile Devices (<900px) */}
      {/* Floating Bottom Navigation for Mobile Devices (<900px) */}
      <Box
        component="nav"
        aria-label="Mobile Navigation"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 1000,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Box
          sx={{
            maxWidth: 'sm',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: 56,
            px: 1
          }}
        >
          {[
            {
              id: 0,
              label: 'Services',
              icon: <WorkOutlineIcon sx={{ fontSize: 20 }} />,
              onClick: () => { setNavValue(0); navigate('/'); }
            },
            {
              id: 1,
              label: 'Bookings',
              icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />,
              onClick: () => {
                setNavValue(1);
                if (!user) navigate('/login');
                else navigate('/history');
              }
            },
            {
              id: 2,
              label: user ? 'Wallet' : 'Sign In',
              icon: <AccountCircleIcon sx={{ fontSize: 20 }} />,
              onClick: () => {
                setNavValue(2);
                if (!user) navigate('/login');
                else navigate('/wallet');
              }
            }
          ].map((item) => {
            const isSelected = navValue === item.id;
            return (
              <Box
                key={item.label}
                component="button"
                onClick={item.onClick}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  py: 0.5,
                  color: isSelected ? '#0066CC' : '#64748B',
                  transition: 'color 0.15s ease',
                  '&:focus-visible': { outline: '2px solid #0066CC', outlineOffset: -2 }
                }}
              >
                {item.icon}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    mt: 0.3,
                    color: 'inherit',
                    lineHeight: 1
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
