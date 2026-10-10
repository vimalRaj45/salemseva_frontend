import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandymanIcon from '@mui/icons-material/Handyman';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarsIcon from '@mui/icons-material/Stars';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../../context/AuthContext';

const SALEM_LOCALITIES = [
  'Fairlands, Salem',
  'Hasthampatti, Salem',
  'Alagapuram, Salem',
  'Suramangalam, Salem',
  'Ammapet, Salem',
  'Meyyanur, Salem',
  'Shevapet, Salem',
  'Kandhampatti, Salem',
  'Kannankurichi, Salem',
  'Gorimedu, Salem'
];

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithCredentials, registerAccount } = useAuth();

  // If already logged in, redirect to appropriate role portal
  useEffect(() => {
    if (user) {
      if (user.role === 'technician' || user.role === 'partner') {
        navigate('/partner', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  // Mode: 'login' | 'register'
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [authMode, setAuthMode] = useState(isRegisterRoute ? 'register' : 'login');

  // Role selection for onboarding: 'customer' | 'technician'
  const queryParams = new URLSearchParams(location.search);
  const initialRoleParam = queryParams.get('role');
  const [selectedRole, setSelectedRole] = useState(
    initialRoleParam === 'partner' || initialRoleParam === 'technician' ? 'technician' : 'customer'
  );

  // Form Fields
  const [identifier, setIdentifier] = useState('98427 11234');
  const [password, setPassword] = useState('salem123');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [trade, setTrade] = useState('ac');
  const [referralCode, setReferralCode] = useState('SALEM100');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode with route
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/login') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number, username, or email');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await loginWithCredentials({ identifier, password });
      setIsLoading(false);
      // Role-based auto navigation
      if (loggedUser.role === 'technician' || loggedUser.role === 'partner') {
        navigate('/partner');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedRole === 'technician') {
      // Direct technician to comprehensive partner KYC onboarding
      navigate(`/partner/onboarding?phone=${encodeURIComponent(phone || identifier)}&name=${encodeURIComponent(fullName)}&trade=${trade}`);
      return;
    }

    // Customer Registration
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await registerAccount({
        name: fullName,
        phone,
        password: password || 'salem123',
        role: 'customer',
        locality,
        referralCode
      });
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#F8FAFC',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pt: 'calc(24px + env(safe-area-inset-top, 0px))',
        pb: 'calc(36px + env(safe-area-inset-bottom, 16px))',
        px: 2
      }}
    >
      <Container maxWidth="xs" sx={{ p: 0 }}>
        {/* Back to Home Link */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/')}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            Back to Home
          </Button>

          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
            label="Salem Secured Auth"
            size="small"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 800,
              fontSize: '11px',
              border: '1px solid #A7F3D0'
            }}
          />
        </Box>

        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 102, 204, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              p: 0.8
            }}
          >
            <img
              src="/logo.png"
              alt="SalemSeva"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0066CC', letterSpacing: '-0.5px' }}>
            Salem<span style={{ color: '#FF6600' }}>Seva</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3, fontWeight: 600 }}>
            சேலம் வீட்டு சேவைகள் மையம் • Doorstep Services Hub
          </Typography>
        </Box>

        {/* Auth Main Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Top Segmented Mode Switcher */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              p: 0.8,
              bgcolor: '#F1F5F9',
              borderBottom: '1px solid #E2E8F0'
            }}
          >
            <Button
              type="button"
              onClick={() => {
                setAuthMode('login');
                navigate('/login', { replace: true });
                setErrorMessage('');
              }}
              sx={{
                py: 1,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                textTransform: 'none',
                bgcolor: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#0066CC' : '#64748B',
                boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                '&:hover': { bgcolor: authMode === 'login' ? '#FFFFFF' : '#E2E8F0' }
              }}
            >
              Sign In (உள்நுழைக)
            </Button>

            <Button
              type="button"
              onClick={() => {
                setAuthMode('register');
                navigate('/register', { replace: true });
                setErrorMessage('');
              }}
              sx={{
                py: 1,
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                textTransform: 'none',
                bgcolor: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? '#0066CC' : '#64748B',
                boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                '&:hover': { bgcolor: authMode === 'register' ? '#FFFFFF' : '#E2E8F0' }
              }}
            >
              Register (புதிய கணக்கு)
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '12px' }}>
                {errorMessage}
              </Alert>
            )}

            {/* ======================= CASE 1: SIGN IN ======================= */}
            {authMode === 'login' && (
              <Box component="form" onSubmit={handleLoginSubmit}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  Welcome Back to SalemSeva
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2.5 }}>
                  Enter your credentials to access your home services or partner workspace.
                </Typography>

                {/* Username / Mobile / Email */}
                <TextField
                  fullWidth
                  label="Username, Mobile (+91), or Email"
                  placeholder="e.g. 98427 11234"
                  variant="outlined"
                  size="small"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ fontSize: 20, color: '#64748B' }} />
                      </InputAdornment>
                    )
                  }}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  label="Password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 20, color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Submit Sign In */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#0066CC',
                    color: '#FFFFFF',
                    py: 1.2,
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(0, 102, 204, 0.25)',
                    '&:hover': { bgcolor: '#0052A3' }
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In to SalemSeva'}
                </Button>

                {/* Demo Seed Credentials Hint */}
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 1.5,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px dashed #CBD5E1'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.8 }}>
                    Quick Credentials for Demo / Testing:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                    <Box
                      onClick={() => {
                        setIdentifier('98427 11234');
                        setPassword('salem123');
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#0066CC',
                        p: '4px 6px',
                        borderRadius: '6px',
                        bgcolor: '#EFF6FF'
                      }}
                    >
                      <span><strong>Customer:</strong> 98427 11234</span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>Password: salem123</span>
                    </Box>

                    <Box
                      onClick={() => {
                        setIdentifier('94432 88901');
                        setPassword('salem123');
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#059669',
                        p: '4px 6px',
                        borderRadius: '6px',
                        bgcolor: '#ECFDF5'
                      }}
                    >
                      <span><strong>Partner Pro:</strong> 94432 88901</span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>Password: salem123</span>
                    </Box>

                    <Box
                      onClick={() => {
                        setIdentifier('98420 99999');
                        setPassword('salem123');
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#D97706',
                        p: '4px 6px',
                        borderRadius: '6px',
                        bgcolor: '#FFFBEB'
                      }}
                    >
                      <span><strong>Admin Ops:</strong> 98420 99999</span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>Password: salem123</span>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* ======================= CASE 2: ROLE-BASED ONBOARDING & REGISTER ======================= */}
            {authMode === 'register' && (
              <Box component="form" onSubmit={handleRegisterSubmit}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  Choose Your Account Role
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                  Select how you plan to use SalemSeva to start your tailored onboarding.
                </Typography>

                {/* Role Selection Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
                  {/* Option 1: Customer */}
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedRole('customer')}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: selectedRole === 'customer' ? '2px solid #0066CC' : '1px solid #E2E8F0',
                      bgcolor: selectedRole === 'customer' ? '#EFF6FF' : '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          bgcolor: selectedRole === 'customer' ? '#0066CC' : '#F1F5F9',
                          color: selectedRole === 'customer' ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <HomeOutlinedIcon sx={{ fontSize: 20 }} />
                      </Box>
                      {selectedRole === 'customer' && <CheckCircleIcon sx={{ fontSize: 18, color: '#0066CC' }} />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                      Customer
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748B', lineHeight: 1.2, display: 'block' }}>
                      Book repairs & home cleaning
                    </Typography>
                    <Chip
                      label="₹100 Credits"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: '#FEF3C7',
                        color: '#B45309',
                        fontWeight: 800,
                        fontSize: '9.5px',
                        height: 18
                      }}
                    />
                  </Paper>

                  {/* Option 2: Service Partner */}
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedRole('technician')}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: selectedRole === 'technician' ? '2px solid #059669' : '1px solid #E2E8F0',
                      bgcolor: selectedRole === 'technician' ? '#ECFDF5' : '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          bgcolor: selectedRole === 'technician' ? '#059669' : '#F1F5F9',
                          color: selectedRole === 'technician' ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <HandymanIcon sx={{ fontSize: 18 }} />
                      </Box>
                      {selectedRole === 'technician' && <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                      Service Partner
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748B', lineHeight: 1.2, display: 'block' }}>
                      AC, Electrician, Plumber
                    </Typography>
                    <Chip
                      label="Daily Payout"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: '#D1FAE5',
                        color: '#065F46',
                        fontWeight: 800,
                        fontSize: '9.5px',
                        height: 18
                      }}
                    />
                  </Paper>
                </Box>

                {/* Common Inputs */}
                <TextField
                  fullWidth
                  label="Full Name (முழு பெயர்)"
                  placeholder={selectedRole === 'technician' ? 'e.g. K. Ramesh' : 'e.g. Vimal Raj'}
                  variant="outlined"
                  size="small"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  sx={{ mb: 1.8 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ fontSize: 20, color: '#64748B' }} />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Mobile Number (கைபேசி எண்)"
                  placeholder="98427 11234"
                  variant="outlined"
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 1.8 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>+91</span>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Customer Specific Fields */}
                {selectedRole === 'customer' && (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Salem Locality / பகுதி"
                      size="small"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      sx={{ mb: 1.8 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#64748B' }} />
                          </InputAdornment>
                        )
                      }}
                    >
                      {SALEM_LOCALITIES.map((loc) => (
                        <MenuItem key={loc} value={loc}>
                          {loc}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Create Password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      size="small"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ mb: 2.5 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 20, color: '#64748B' }} />
                          </InputAdornment>
                        )
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        bgcolor: '#0066CC',
                        color: '#FFFFFF',
                        py: 1.2,
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(0, 102, 204, 0.25)',
                        '&:hover': { bgcolor: '#0052A3' }
                      }}
                    >
                      {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Account & Get ₹100 Credits'}
                    </Button>
                  </>
                )}

                {/* Technician Specific Fields */}
                {selectedRole === 'technician' && (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Primary Trade Skill / தொழில்"
                      size="small"
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value="ac">AC Repair & Cooling Specialist (ஏசி)</MenuItem>
                      <MenuItem value="electrician">Certified Electrician & Wiring (எலக்ட்ரீசியன்)</MenuItem>
                      <MenuItem value="plumber">Plumber & Drainage Specialist (பிளம்பர்)</MenuItem>
                      <MenuItem value="cleaning">Deep Sanitization & Cleaning (சுத்தம்)</MenuItem>
                    </TextField>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: '#059669',
                        color: '#FFFFFF',
                        py: 1.2,
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      Continue to Partner Onboarding & KYC
                    </Button>
                  </>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
