import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandymanIcon from '@mui/icons-material/Handyman';
import BoltIcon from '@mui/icons-material/Bolt';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';
import CleanHandsIcon from '@mui/icons-material/CleaningServices';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { techUser, loginTech, dbTechnicians } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated as a technician, redirect to duty page
  useEffect(() => {
    if (techUser && techUser.phone) {
      navigate('/partner/duty', { replace: true });
    }
  }, [techUser, navigate]);

  const handlePhonePasswordSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    const rawClean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!rawClean || rawClean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: rawClean,
          phone: rawClean,
          password: password,
          role: 'technician'
        })
      });
      const data = await res.json();
      setLoading(false);

      if (!data.success || !data.user) {
        setErrorMessage(data.error || 'Technician authentication failed. Please verify phone number.');
        return;
      }

      // Check if user is actually a technician
      if (data.user.role !== 'technician' && data.user.role !== 'partner') {
        setErrorMessage('This account is registered as a customer. Please use the customer login.');
        return;
      }

      await loginTech(data.user, data.sessionToken);
      toast.success(`Welcome back Partner ${data.user.name || ''}!`);
      navigate('/partner/duty', { replace: true });
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error connecting to Shazu One partner gateway');
    }
  };

  const handleQuickSpecialistSelect = async (tech) => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginTech(tech, `tech-token-${tech.id}-${Date.now()}`);
      toast.success(`Logged in as verified specialist ${tech.name}`);
      navigate('/partner/duty', { replace: true });
    } catch (err) {
      setLoading(false);
      setErrorMessage('Failed to activate technician session');
    }
  };

  const getTradeIcon = (trade) => {
    switch (trade) {
      case 'ac':
        return <AcUnitIcon sx={{ fontSize: 18, color: '#38BDF8' }} />;
      case 'electrician':
        return <BoltIcon sx={{ fontSize: 18, color: '#FBBF24' }} />;
      case 'plumber':
        return <BuildIcon sx={{ fontSize: 18, color: '#34D399' }} />;
      case 'cleaning':
        return <CleanHandsIcon sx={{ fontSize: 18, color: '#A78BFA' }} />;
      default:
        return <HandymanIcon sx={{ fontSize: 18, color: '#38BDF8' }} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#0B1120', py: { xs: 3, md: 6 }, px: 2, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        {/* Header Badge */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              mb: 1.5,
              p: 1,
              boxShadow: '0 8px 24px rgba(13, 59, 102, 0.4)'
            }}
          >
            <img
              src="/logo-mark.svg"
              onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
              alt="Shazu One Partner"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#F8FAFC', letterSpacing: '-0.02em', fontSize: '22px' }}>
            Shazu One Partner Hub
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px', display: 'block', mt: 0.5 }}>
            Field Technician Duty & Service Dispatch Portal
          </Typography>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />}
            label="Verified Specialists Portal - சேலம்"
            size="small"
            sx={{
              mt: 1.2,
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 800,
              fontSize: '11px'
            }}
          />
        </Box>

        {/* Login Card */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            bgcolor: '#1E293B',
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, fontSize: '15px' }}>
            Technician Login - உள்நுழைக
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2, fontSize: '11.5px' }}>
            Sign in with your registered mobile number to manage your schedule and take live requests.
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#FCA5A5', border: '1px solid #EF4444', fontSize: '12px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePhonePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Registered Mobile Number"
              placeholder="e.g. 9842100000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphoneIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                    <Typography sx={{ color: '#94A3B8', fontSize: '13px', fontWeight: 700, ml: 0.5 }}>
                      +91
                    </Typography>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#0284C7' },
                  '&.Mui-focused fieldset': { borderColor: '#38BDF8' }
                },
                '& .MuiInputLabel-root': { color: '#94A3B8', fontSize: '13px' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#38BDF8' }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#94A3B8' }}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#0284C7' },
                  '&.Mui-focused fieldset': { borderColor: '#38BDF8' }
                },
                '& .MuiInputLabel-root': { color: '#94A3B8', fontSize: '13px' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#38BDF8' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13.5px',
                py: 1.2,
                borderRadius: '10px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                '&:hover': { bgcolor: '#0369A1' },
                '&.Mui-disabled': { bgcolor: '#334155', color: '#64748B' }
              }}
            >
              {loading ? 'Authenticating Partner...' : 'Enter Duty Portal - பணி தொடங்கு'}
            </Button>
          </Box>

          {/* Quick One-Tap Specialists Selector */}
          {dbTechnicians && dbTechnicians.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #334155' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
                <FlashOnIcon sx={{ color: '#F59E0B', fontSize: 17 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#E2E8F0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Active Verified Specialists in Salem:
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dbTechnicians.map((tech) => (
                  <Paper
                    key={tech.id}
                    onClick={() => handleQuickSpecialistSelect(tech)}
                    elevation={0}
                    sx={{
                      p: 1.2,
                      bgcolor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#0284C7',
                        bgcolor: '#1E293B',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ p: 0.6, bgcolor: 'rgba(2, 132, 199, 0.15)', borderRadius: '6px' }}>
                        {getTradeIcon(tech.trade)}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '12.5px' }}>
                          {tech.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
                          {tech.phone} - {tech.tradeName || tech.trade}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label="Select"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '10px',
                        fontWeight: 800,
                        bgcolor: '#0284C7',
                        color: '#FFFFFF'
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* New Field Partner Registration Link */}
          <Box sx={{ mt: 2.5, textAlign: 'center', pt: 1.5, borderTop: '1px dashed #334155' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11.5px', display: 'block' }}>
              Want to join Shazu One as a certified specialist?
            </Typography>
            <Button
              component={Link}
              to="/partner/onboarding"
              size="small"
              sx={{
                color: '#38BDF8',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                mt: 0.3,
                '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' }
              }}
            >
              Complete e-KYC Onboarding - புதிய டெக்னீசியன் பதிவு
            </Button>
          </Box>

          {/* Help & Login Recovery Trigger */}
          <Box sx={{ mt: 1.5, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={() => navigate('/auth/help?role=partner', { state: { returnTo: '/partner/login' } })}
              startIcon={<HelpOutlineIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: '#94A3B8',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { color: '#38BDF8' }
              }}
            >
              Need Help? Report Login or Account Trouble
            </Button>
          </Box>
        </Card>

        {/* Back to Customer App link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            component={Link}
            to="/"
            size="small"
            sx={{
              color: '#64748B',
              fontSize: '11.5px',
              textTransform: 'none',
              '&:hover': { color: '#94A3B8' }
            }}
          >
            Looking for Home Services? Go to Customer App
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
