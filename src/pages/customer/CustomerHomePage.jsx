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
  Skeleton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // Real-time persistent active booking poll
    const activeBookingId = localStorage.getItem('salemseva_active_booking');
    if (!activeBookingId) {
      setActiveBooking(null);
      return;
    }

    const checkActiveBooking = async () => {
      try {
        const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/track`);
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

  const defaultServices = [
    { id: 'ac', name: 'AC Repair & Service', category: 'Cooling & Appliances', visitFee: 99, priceRange: '₹299 - ₹1,499' },
    { id: 'electrician', name: 'Electrician & Wiring', category: 'Home Power & Safety', visitFee: 99, priceRange: '₹199 - ₹999' },
    { id: 'plumber', name: 'Plumber & Sanitary', category: 'Sanitary & Motors', visitFee: 99, priceRange: '₹149 - ₹799' },
    { id: 'cleaning', name: 'Home & Bath Cleaning', category: 'Sanitization', visitFee: 99, priceRange: '₹349 - ₹2,499' }
  ];

  const activeServicesList = (services && services.length > 0) ? services : defaultServices;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        
        {/* Location selector bar */}
        <Paper
          elevation={0}
          onClick={() => setLocationPickerOpen(true)}
          sx={{
            p: 1.2,
            mb: 1.5,
            borderRadius: '8px',
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
            <LocationOnIcon sx={{ fontSize: 20, color: '#2563EB', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                  {userLocation.locality || 'Fairlands, Salem'}
                </Typography>
                <Chip
                  label="Salem zone"
                  size="small"
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '10px',
                    height: 18,
                    px: 0.2
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontSize: '11px',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userLocation.address || 'Doorstep service in 25–35 mins'}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: '#2563EB',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              flexShrink: 0,
              p: 0.5
            }}
          >
            Change
          </Button>
        </Paper>

        {/* Search bar */}
        <Paper
          elevation={0}
          sx={{
            p: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
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
        {activeBooking && (() => {
          const status = activeBooking.booking?.status || 'matching';
          const bId = activeBooking.booking?.id || 'SLM-84920';
          const techName = activeBooking.technician?.name || 'K. Ramesh';

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
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 0.5,
                  px: 1.4,
                  flexShrink: 0,
                  ml: 1,
                  '&:hover': { bgcolor: '#1D4ED8' }
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
                  <StarsIcon sx={{ color: '#D97706', fontSize: 13 }} /> ₹{user.walletBalance ?? 150} wallet credits available
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate('/wallet')}
              sx={{
                borderColor: '#E2E8F0',
                color: '#334155',
                fontWeight: 600,
                fontSize: '11px',
                borderRadius: '6px',
                textTransform: 'none',
                py: 0.3,
                px: 1
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
                  onClick={() => navigate('/book/ac')}
                  sx={{
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '11.5px',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#1D4ED8' }
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
            Visit fee ₹99
          </Typography>
        </Box>

        {/* 2x2 Services Grid (Dynamic DB Data) */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {isLoading ? (
            [1, 2, 3, 4].map((n) => (
              <Grid item xs={6} key={n}>
                <Card elevation={0} sx={{ height: '100%', p: 1.5, borderRadius: '8px' }}>
                  <Skeleton variant="rounded" width={36} height={36} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="95%" height={14} />
                  <Skeleton variant="text" width="50%" height={14} />
                </Card>
              </Grid>
            ))
          ) : (
            activeServicesList.map((svc) => {
              const meta = getServiceMetadata(svc);
              return (
                <Grid item xs={6} key={svc.id}>
                  <Card
                    elevation={0}
                    onClick={() => navigate(`/book/${svc.id}`)}
                    sx={{
                      height: '100%',
                      borderRadius: '8px',
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

      </Container>

      {/* Bottom Navigation */}
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
          pb: 'calc(6px + env(safe-area-inset-bottom, 16px))'
        }}
      >
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
            setNavValue(newValue);
            if (newValue === 0) navigate('/');
            if (newValue === 1) navigate('/history');
            if (newValue === 2) navigate('/wallet');
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
            label="Wallet"
            icon={<AccountCircleIcon sx={{ fontSize: 20 }} />}
          />
          <BottomNavigationAction
            label="Partner Zone"
            icon={<StorefrontIcon sx={{ fontSize: 20 }} />}
          />
        </BottomNavigation>
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
