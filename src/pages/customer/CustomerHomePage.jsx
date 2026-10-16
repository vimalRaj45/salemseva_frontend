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
  InputBase,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Skeleton,
  Rating
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
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

import { ApiService } from '../../services/api';
import LocationPickerModal from '../../components/LocationPickerModal';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [navValue, setNavValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('salemseva_user_location');
    return saved ? JSON.parse(saved) : {
      locality: 'Fairlands',
      pincode: '636016',
      address: 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
      lat: 11.6738,
      lng: 78.1460
    };
  });

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
    const activeBookingId = localStorage.getItem('salemseva_active_booking');
    if (!activeBookingId) {
      setActiveBooking(null);
      return;
    }

    const checkActiveBooking = async () => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/${activeBookingId}/track`);
        const d = await res.json();
        if (d.success && d.booking && ['matching', 'accepted', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(d.booking.status)) {
          // If already completed and user dismissed/cleared, don't show, else keep active
          const isRated = localStorage.getItem(`salemseva_rated_${activeBookingId}`);
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
          desc: 'Jet cleaning, gas top-up, and cooling repairs',
          eta: '25 min ETA',
          icon: <AcUnitIcon sx={{ fontSize: 24 }} />,
          color: '#2563EB',
          bg: '#EFF6FF'
        };
      case 'electrician':
        return {
          desc: 'Fan installation, switchboard, and wiring fixes',
          eta: '20 min ETA',
          icon: <ElectricBoltIcon sx={{ fontSize: 24 }} />,
          color: '#D97706',
          bg: '#FEF3C7'
        };
      case 'plumber':
        return {
          desc: 'Pipe leakage, tap replacement, and motor repair',
          eta: '30 min ETA',
          icon: <PlumbingIcon sx={{ fontSize: 24 }} />,
          color: '#7C3AED',
          bg: '#F5F3FF'
        };
      case 'cleaning':
        return {
          desc: 'Bathroom deep cleaning and full home sanitization',
          eta: '35 min ETA',
          icon: <CleaningServicesIcon sx={{ fontSize: 24 }} />,
          color: '#059669',
          bg: '#ECFDF5'
        };
      default:
        return {
          desc: s.category || 'Professional home service & repair',
          eta: '30 min ETA',
          icon: <WorkOutlineIcon sx={{ fontSize: 24 }} />,
          color: s.colorHex || '#2563EB',
          bg: '#EFF6FF'
        };
    }
  };

  const activeServicesList = services || [];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 1.5, md: 3 } }}>
        
        {/* Guest Mode Explorer Notification Banner */}
        {!user && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E3A8A', fontSize: '13px', lineHeight: 1.2 }}>
                Browsing as Guest (விருந்தினர் பார்வை)
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB', fontSize: '11.5px', display: 'block', mt: 0.2 }}>
                Sign in anytime to claim ₹100 Welcome credits & live GPS tracking.
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
                height: '34px',
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
          </Paper>
        )}

        {/* Location selector bar */}
        <Paper
          elevation={0}
          onClick={() => setLocationPickerOpen(true)}
          sx={{
            p: 1.2,
            mb: 1.5,
            borderRadius: '10px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { borderColor: '#CBD5E1' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {(() => {
              const pinMatch = String(userLocation.pincode || userLocation.address || '').match(/\b(\d{6})\b/);
              const p = pinMatch ? pinMatch[1] : (userLocation.pincode || '');
              const isBadPin = Boolean(p && !p.startsWith('636'));
              return (
                <>
                  <LocationOnIcon sx={{ fontSize: 20, color: isBadPin ? '#DC2626' : '#2563EB', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isBadPin ? '#991B1B' : '#0F172A', fontSize: '13px' }}>
                        {userLocation.locality || 'Fairlands, Salem'}
                      </Typography>
                      <Chip
                        label={isBadPin ? 'Outside Salem Region' : 'Salem zone'}
                        size="small"
                        sx={{
                          bgcolor: isBadPin ? '#FEF2F2' : '#F1F5F9',
                          color: isBadPin ? '#DC2626' : '#475569',
                          border: isBadPin ? '1px solid #FCA5A5' : 'none',
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
                  </Box>
                </>
              );
            })()}
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
              px: 1.2,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#EFF6FF' }
            }}
          >
            Change
          </Button>
        </Paper>

        {/* Search bar */}
        <Paper
          elevation={0}
          sx={{
            p: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '10px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            mb: 2
          }}
        >
          <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 20 }} />
          <InputBase
            sx={{
              flex: 1,
              fontSize: '13px',
              color: '#0F172A',
              '& input::placeholder': {
                color: '#94A3B8',
                opacity: 1
              }
            }}
            placeholder="Search AC repair, electrician, plumber, cleaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery) {
                navigate('/matching');
              }
            }}
          />
        </Paper>

        {/* Active Connected Service Banner (Zero Interruption Lock & Seamless Resume) */}
        {user && activeBooking && activeBooking.booking?.id && (() => {
          const status = activeBooking.booking?.status || 'matching';
          const bId = activeBooking.booking?.id;
          const techName = activeBooking.technician?.name || activeBooking.technician_name || 'Assigned Partner';

          let resumeUrl = `/track?bookingId=${bId}`;
          let statusTitle = `Connected Service #${bId}`;
          let statusSubtitle = `${techName} • Active`;
          let btnText = 'Resume track';
          let dotColor = '#34D399';

          if (status === 'matching') {
            resumeUrl = `/matching?bookingId=${bId}`;
            statusTitle = 'Dispatching: Finding Technician...';
            statusSubtitle = 'Searching Fairlands & Salem zone';
            btnText = 'Resume search';
            dotColor = '#38BDF8';
          } else if (status === 'accepted' || status === 'en_route') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = `${techName} is En Route`;
            statusSubtitle = 'Live GPS navigation • Two-wheeler ETA 15 mins';
            btnText = 'Track live';
            dotColor = '#34D399';
          } else if (status === 'arrived') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = `${techName} at Your Doorstep`;
            statusSubtitle = 'Doorstep verification & check initiated';
            btnText = 'View service';
            dotColor = '#60A5FA';
          } else if (status === 'inspecting') {
            resumeUrl = `/track?bookingId=${bId}`;
            statusTitle = 'Inspection & Diagnosis in Progress';
            statusSubtitle = 'Preparing digital job card estimate';
            btnText = 'View progress';
            dotColor = '#FBBF24';
          } else if (status === 'quote_presented') {
            resumeUrl = `/quote?bookingId=${bId}`;
            statusTitle = 'Digital Estimate Ready for Approval';
            statusSubtitle = 'OEM parts & labor calculation available';
            btnText = 'Review quote';
            dotColor = '#F59E0B';
          } else if (status === 'quote_approved') {
            resumeUrl = `/checkout?bookingId=${bId}`;
            statusTitle = 'Work in Progress / Payment Ready';
            statusSubtitle = 'Digital escrow checkout';
            btnText = 'Go to pay';
            dotColor = '#10B981';
          } else if (status === 'completed') {
            resumeUrl = `/rate?bookingId=${bId}`;
            statusTitle = 'Service Completed • Rate Technician';
            statusSubtitle = 'Share your experience to close order';
            btnText = 'Rate service';
            dotColor = '#A78BFA';
          }

          return (
            <Paper
              elevation={2}
              sx={{
                p: 1.4,
                mb: 2,
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: dotColor,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${dotColor}`
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '12.5px', lineHeight: 1.2 }}
                  >
                    {statusTitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mt: 0.2 }}
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
                  px: 1.8,
                  flexShrink: 0,
                  ml: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0052CC' }
                }}
              >
                {btnText}
              </Button>
            </Paper>
          );
        })()}

        {/* User Account & Credits Summary */}
        {user && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: '8px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563EB', color: '#FFF', fontSize: '13px', fontWeight: 600 }}>
                {user.name ? user.name.charAt(0) : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarsIcon sx={{ color: '#D97706', fontSize: 13 }} /> {user.walletBalance ?? 150} Credits (₹{(((user.walletBalance ?? 150) / 10)).toFixed(0)}) available
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
                fontSize: '12px',
                borderRadius: '8px',
                height: '32px',
                textTransform: 'none',
                px: 1.5,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
              }}
            >
              Wallet
            </Button>
          </Paper>
        )}

        {/* First Order Offer Banner */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '10px',
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            border: '1px solid #1E293B',
            mb: 2.5
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ maxWidth: '75%' }}>
                <Chip
                  label="Special offer"
                  size="small"
                  sx={{ bgcolor: '#1E293B', color: '#FCD34D', fontWeight: 600, fontSize: '10px', height: 20, mb: 0.8 }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px', color: '#FFFFFF', mb: 0.3 }}>
                  ₹100 off your first home service
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mb: 1.2 }}>
                  Use promo code <strong>SALEM100</strong> at checkout • 30-day service warranty
                </Typography>
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
                    height: '34px',
                    px: 2,
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0052CC' }
                  }}
                >
                  Book AC service
                </Button>
              </Box>

              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  bgcolor: '#1E293B',
                  flexShrink: 0
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80"
                  alt="Verified Salem Technician"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Section Header: Services */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
            Available services in Salem
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
            Doorstep inspection
          </Typography>
        </Box>

        {/* Responsive Services Grid (Dynamic DB Data) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {isLoading ? (
            [1, 2, 3, 4].map((n) => (
              <Grid item xs={6} sm={4} md={3} key={n}>
                <Card elevation={0} sx={{ height: '100%', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ mb: 1.2, borderRadius: '8px' }} />
                  <Skeleton variant="text" width="80%" height={22} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="95%" height={16} />
                  <Skeleton variant="text" width="50%" height={16} />
                </Card>
              </Grid>
            ))
          ) : (
            activeServicesList.map((svc) => {
              const meta = getServiceMetadata(svc);
              return (
                <Grid item xs={6} sm={4} md={3} key={svc.id}>
                  <Card
                    elevation={0}
                    onClick={() => navigate(`/book/${svc.id}`, { state: { service: svc } })}
                    sx={{
                      height: '100%',
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      p: 1.5,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#CBD5E1',
                        bgcolor: '#FAFAFA',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '6px',
                            bgcolor: meta.bg,
                            color: meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Chip
                          label={meta.eta}
                          size="small"
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '10px',
                            height: 20
                          }}
                        />
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px', mb: 0.3 }}>
                        {svc.name || svc.name_en || svc.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          fontSize: '11.5px',
                          lineHeight: 1.35,
                          mb: 1.2
                        }}
                      >
                        {meta.desc}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5, borderTop: '1px solid #F1F5F9' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '11.5px' }}>
                        Visit fee ₹{svc.visitFee || 99}
                      </Typography>
                      <ArrowForwardIcon sx={{ color: '#94A3B8', fontSize: 15 }} />
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Real Customer Reviews & Star Ratings (PostgreSQL Grounded) */}
        {realReviews.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  Real Salem Customer Reviews
                  <Chip label="Verified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '10px', height: 20 }} />
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                  Authentic ratings from completed bookings in Salem
                </Typography>
              </Box>
              {reviewStats?.average_rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#FEF3C7', px: 1, py: 0.3, borderRadius: '6px' }}>
                  <Rating value={Number(reviewStats.average_rating)} precision={0.1} readOnly size="small" sx={{ color: '#D97706' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', fontSize: '11px' }}>
                    {reviewStats.average_rating} ({reviewStats.total_reviews})
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={1.5}>
              {realReviews.slice(0, 4).map((rev) => (
                <Grid item xs={12} sm={6} key={rev.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#0284C7', fontSize: '12px', fontWeight: 700 }}>
                            {(rev.customer_name || 'Customer').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px', lineHeight: 1.2 }}>
                              {rev.customer_name || 'Verified Homeowner'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                              {rev.locality || 'Salem'} • {rev.service_name || 'Home Service'}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={Number(rev.rating) || 5} precision={0.5} readOnly size="small" sx={{ color: '#F59E0B' }} />
                      </Box>

                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '12px', lineHeight: 1.4, mb: 1, fontStyle: 'italic' }}>
                        "{rev.feedback}"
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.8, borderTop: '1px solid #F1F5F9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 13 }} />
                        <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '10.5px' }}>
                          Verified Service #{rev.booking_id}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
                        Tech: {rev.technician_name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Trust & Guarantee Section */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '8px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            mb: 2
          }}
        >
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <VerifiedUserIcon sx={{ color: '#059669', fontSize: 20, mb: 0.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '11px' }}>
                Verified partners
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ color: '#2563EB', fontSize: 20, mb: 0.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '11px' }}>
                Escrow protected
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <ShieldIcon sx={{ color: '#D97706', fontSize: 20, mb: 0.2 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', fontSize: '11px' }}>
                30-day warranty
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Compliance, Policy & Legal Footer */}
        <Box
          sx={{
            mt: 3,
            mb: 4,
            p: 2.5,
            borderRadius: '14px',
            bgcolor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0066CC', fontSize: '14px' }}>
              Salem<span style={{ color: '#FF6600' }}>Seva</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}>
              • Salem Municipal Hyperlocal Network
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '11.5px', lineHeight: 1.6, maxWidth: '480px', mx: 'auto', mb: 2 }}>
            Salem technology intermediary connecting verified local technicians with homes across Fairlands, Hasthampatti, Suramangalam, Ammapet, and Shevapet. 2% platform fee, 98% technician payout.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
            <Box
              component="span"
              onClick={() => navigate('/how-it-works')}
              sx={{ color: '#0066CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              How It Works
            </Box>
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>|</Typography>
            <Box
              component="span"
              onClick={() => navigate('/terms')}
              sx={{ color: '#0066CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Terms & Conditions
            </Box>
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>|</Typography>
            <Box
              component="span"
              onClick={() => navigate('/privacy')}
              sx={{ color: '#0066CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Privacy Policy
            </Box>
            <Typography variant="caption" sx={{ color: '#CBD5E1' }}>|</Typography>
            <Box
              component="span"
              onClick={() => navigate('/refund-policy')}
              sx={{ color: '#0066CC', fontSize: '12px', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Refund Policy
            </Box>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8', fontSize: '10.5px', mt: 1.5 }}>
            Copyright 2026 SalemSeva Technologies. All rights reserved.
          </Typography>
        </Box>

      </Container>

      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          zIndex: 1000,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(event, newValue) => {
              setNavValue(newValue);
              if (newValue === 0) navigate('/');
              if (newValue === 1) {
                if (!user) navigate('/login');
                else navigate('/history');
              }
              if (newValue === 2) {
                if (!user) navigate('/login');
                else navigate('/wallet');
              }
              if (newValue === 3) navigate('/partner');
            }}
            sx={{
              height: 56,
              '& .Mui-selected': {
                color: '#0066CC',
                fontWeight: 700
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '11px',
                fontWeight: 600
              }
            }}
          >
            <BottomNavigationAction
              label="Services"
              icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />}
            />
            <BottomNavigationAction
              label="Bookings"
              icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />}
            />
            <BottomNavigationAction
              label={user ? "Wallet" : "Sign In"}
              icon={<AccountCircleIcon sx={{ fontSize: 20 }} />}
            />
            <BottomNavigationAction
              label="Partner Zone"
              icon={<StorefrontIcon sx={{ fontSize: 20 }} />}
            />
          </BottomNavigation>
        </Box>
      </Paper>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(newLoc) => setUserLocation(newLoc)}
      />
    </Box>
  );
}
