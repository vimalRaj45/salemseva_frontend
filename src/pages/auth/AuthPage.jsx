import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Compass,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Wrench,
  Home,
  MapPin,
  TrendingUp,
  PieChart as PieChartIcon,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

const CAROUSEL_SLIDES = [
  {
    title: '30-Minute Rapid Doorstep Arrival',
    desc: 'Live GPS dispatch connects you to certified technicians nearest to Fairlands, Hasthampatti, and all 10 Salem zones.',
    badge: 'Salem Rapid Dispatch',
    image: '/assets/illustrations/customer_booking.jpg'
  },
  {
    title: '100% Aadhaar KYC Verified Technicians',
    desc: 'Every specialist undergoes complete background screening, trade skill validation, and tool insurance before dispatch.',
    badge: 'Salem Trust Guarantee',
    image: '/assets/illustrations/safety_verification.jpg'
  },
  {
    title: 'Transparent Pricing & ₹100 Seva Wallet Bonus',
    desc: 'Zero hidden visit fees, upfront rate card confirmation, and instant ₹100 credits for every new Salem household.',
    badge: 'Upfront Quotes',
    image: '/assets/illustrations/transparent_pricing.jpg'
  },
  {
    title: 'Technician Partner Fleet & 98% Payout',
    desc: 'Salem trade specialists earn 98% direct daily revenue with automated bank transfers and flexible radar duty.',
    badge: 'Partner Network',
    image: '/assets/illustrations/partner_service.jpg'
  }
];

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithCredentials, registerAccount, continueAsGuest, loginAsCustomer, loginAsTechnician, loginAsAdmin } = useAuth();

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
  const redirectTarget = queryParams.get('redirect') || '/';
  const [selectedRole, setSelectedRole] = useState(
    initialRoleParam === 'partner' || initialRoleParam === 'technician' ? 'technician' : 'customer'
  );

  // Form Fields
  const [identifier, setIdentifier] = useState('98427 11234');
  const [password, setPassword] = useState('salem123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [trade, setTrade] = useState('ac');
  const [referralCode, setReferralCode] = useState('SALEM100');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  // Sync mode with route
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/login') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  // Carousel auto-cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number, email, or username');
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
      toast.success(`Welcome back, ${loggedUser.name}!`);
      if (loggedUser.role === 'technician' || loggedUser.role === 'partner') {
        navigate('/partner');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    const cleanPhone = (phone || identifier || '').replace(/[\s\-\(\)\+]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setErrorMessage('Please create a password with at least 6 characters');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password');
      return;
    }

    if (selectedRole === 'technician') {
      navigate(`/partner/onboarding?phone=${encodeURIComponent(cleanPhone)}&name=${encodeURIComponent(fullName)}&trade=${trade}&password=${encodeURIComponent(registerPassword)}`);
      return;
    }

    setIsLoading(true);
    try {
      await registerAccount({
        name: fullName.trim(),
        phone: cleanPhone,
        password: registerPassword.trim(),
        role: 'customer',
        locality,
        referralCode: referralCode.trim()
      });
      setIsLoading(false);
      toast.success('Account created successfully! ₹100 Welcome credits added.');
      navigate(redirectTarget);
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    toast.success('Browsing as Guest. You can explore services and sign in anytime to book!');
    navigate('/');
  };

  return (
    <Box
      sx={{
        bgcolor: '#F1F5F9',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Main Split-Screen Container Card */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '1160px',
          bgcolor: '#FFFFFF',
          borderRadius: { xs: '20px', md: '28px' },
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.09)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1.15fr' },
          minHeight: { md: '680px' }
        }}
      >
        {/* ===================== LEFT PANE: SIGN IN / REGISTER FORM ===================== */}
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            {/* Top Brand Logo & Mobile Continue as Guest Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0.5
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="SalemSeva"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0066CC', lineHeight: 1.1, fontSize: '1.25rem' }}>
                    Salem<span style={{ color: '#FF6600' }}>Seva</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px' }}>
                    Doorstep Services Hub
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={<ShieldCheck size={14} color="#059669" />}
                label="Salem Secured"
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

            {/* Title & Subtitle */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
                {authMode === 'login'
                  ? 'Welcome back! Please enter your details'
                  : 'Join Salem’s trusted network for home services & daily repairs'}
              </Typography>
            </Box>

            {/* Error Message Alert */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '12.5px' }}>
                {errorMessage}
              </Alert>
            )}

            {/* ================= CASE 1: SIGN IN FORM ================= */}
            {authMode === 'login' ? (
              <Box component="form" onSubmit={handleLoginSubmit}>
                {/* Email / Mobile Field */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8, fontSize: '12px' }}>
                    Email or Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your email or 98427 11234"
                    variant="outlined"
                    size="small"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={17} color="#94A3B8" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13.5px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#0066CC', borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8, fontSize: '12px' }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={17} color="#94A3B8" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#94A3B8' }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '12px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13.5px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#0066CC', borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Remember Me & Forgot Password Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#0066CC' },
                          p: 0.5
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>
                        Remember for 30 Days
                      </Typography>
                    }
                  />

                  <Button
                    type="button"
                    onClick={() => toast.success('Password reset link sent to your registered contact.')}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      color: '#0066CC',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'none',
                      '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                    }}
                  >
                    Forgot password
                  </Button>
                </Box>

                {/* Primary Sign In Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#0066CC',
                    color: '#FFFFFF',
                    py: 1.35,
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(0, 102, 204, 0.28)',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: '#0052CC', transform: 'translateY(-1px)' }
                  }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                </Button>

                {/* OR Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2.2 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                  <Typography variant="caption" sx={{ px: 2, color: '#94A3B8', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                    OR
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                </Box>

                {/* Continue as Guest Button (User Explicit Request) */}
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={handleContinueAsGuest}
                  startIcon={<Compass size={18} color="#0066CC" />}
                  endIcon={<ArrowRight size={16} color="#64748B" />}
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    textTransform: 'none',
                    transition: 'all 0.15s ease',
                    justifyContent: 'space-between',
                    px: 2,
                    '&:hover': {
                      bgcolor: '#F1F5F9',
                      borderColor: '#94A3B8',
                      color: '#0066CC'
                    }
                  }}
                >
                  <span>Continue as a Guest (விருந்தினராக தொடரவும்)</span>
                </Button>

                {/* Quick 1-Click Demo Accounts Pill Bar */}
                <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, fontSize: '11px', display: 'block', mb: 1 }}>
                    Quick Demo One-Click Sign In:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setIdentifier('98427 11234');
                        setPassword('salem123');
                        loginAsCustomer();
                        toast.success('Logged in as Customer (Vimal Raj)');
                        navigate(redirectTarget);
                      }}
                      sx={{
                        py: 0.6,
                        px: 0.8,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        bgcolor: '#EFF6FF',
                        color: '#0066CC',
                        border: '1px solid #BFDBFE',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#DBEAFE' }
                      }}
                    >
                      Customer
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setIdentifier('94432 88901');
                        setPassword('salem123');
                        loginAsTechnician();
                        toast.success('Logged in as Partner Pro (K. Ramesh)');
                        navigate('/partner');
                      }}
                      sx={{
                        py: 0.6,
                        px: 0.8,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        bgcolor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#D1FAE5' }
                      }}
                    >
                      Partner Pro
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setIdentifier('98420 99999');
                        setPassword('salem123');
                        loginAsAdmin();
                        toast.success('Logged in as Central Ops Admin');
                        navigate('/admin');
                      }}
                      sx={{
                        py: 0.6,
                        px: 0.8,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        bgcolor: '#FFFBEB',
                        color: '#D97706',
                        border: '1px solid #FDE68A',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#FEF3C7' }
                      }}
                    >
                      Admin
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              /* ================= CASE 2: REGISTER FORM ================= */
              <Box component="form" onSubmit={handleRegisterSubmit}>
                {/* Role Toggle */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Home size={18} color={selectedRole === 'customer' ? '#0066CC' : '#64748B'} />
                      {selectedRole === 'customer' && <CheckCircle2 size={16} color="#0066CC" />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                      Customer
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748B' }}>
                      Book repairs & cleanings
                    </Typography>
                  </Paper>

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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Wrench size={18} color={selectedRole === 'technician' ? '#059669' : '#64748B'} />
                      {selectedRole === 'technician' && <CheckCircle2 size={16} color="#059669" />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                      Service Partner
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748B' }}>
                      AC, Electrician, Plumber
                    </Typography>
                  </Paper>
                </Box>

                {/* Full Name */}
                <Box sx={{ mb: 1.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                    Full Name (முழு பெயர்)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={selectedRole === 'technician' ? 'e.g. K. Ramesh' : 'e.g. Vimal Raj'}
                    size="small"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                {/* Mobile */}
                <Box sx={{ mb: 1.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                    Mobile Number (கைபேசி எண்)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="98427 11234"
                    size="small"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>+91</span>
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Box>

                {selectedRole === 'customer' ? (
                  <>
                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Salem Locality / பகுதி
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      >
                        {SALEM_LOCALITIES.map(loc => (
                          <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Create Password (கடவுச்சொல் - min 6 chars)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Choose your password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        size="small"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Confirm Password (கடவுச்சொல் உறுதிப்படுத்தவும்)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Re-enter your password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        size="small"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        bgcolor: '#0066CC',
                        color: '#FFFFFF',
                        py: 1.35,
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(0, 102, 204, 0.28)',
                        '&:hover': { bgcolor: '#0052CC' }
                      }}
                    >
                      {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create Account & Claim ₹100 Credits'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Primary Trade Skill
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      >
                        <MenuItem value="ac">AC Repair & Cooling Specialist (ஏசி)</MenuItem>
                        <MenuItem value="electrician">Certified Electrician & Wiring (எலக்ட்ரீசியன்)</MenuItem>
                        <MenuItem value="plumber">Plumber & Drainage Specialist (பிளம்பர்)</MenuItem>
                        <MenuItem value="cleaning">Deep Sanitization & Cleaning (சுத்தம்)</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Create Duty Password (கடவுச்சொல் - min 6 chars)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Choose your technician duty password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        size="small"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.6, fontSize: '12px' }}>
                        Confirm Duty Password
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Re-enter your duty password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        size="small"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowRight size={18} />}
                      sx={{
                        bgcolor: '#059669',
                        color: '#FFFFFF',
                        py: 1.35,
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(5, 150, 105, 0.28)',
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      Continue to Partner KYC Verification
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Bottom Switcher Link */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            {authMode === 'login' ? (
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                Don't have an account?{' '}
                <Button
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    color: '#0066CC',
                    fontWeight: 800,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                Already have an account?{' '}
                <Button
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    color: '#0066CC',
                    fontWeight: 800,
                    fontSize: '13px',
                    textTransform: 'none',
                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            )}
          </Box>
        </Box>

        {/* ===================== RIGHT PANE: BRAND SHOWCASE WITH MOCK CHARTS ===================== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, #0052CC 0%, #0066CC 55%, #003D99 100%)',
            p: { md: 4.5, lg: 5 },
            position: 'relative',
            color: '#FFFFFF',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Decorative Circles */}
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-10%',
              left: '-10%',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,102,0,0.15) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Top Heading & Tagline */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.6, borderRadius: '20px', backdropFilter: 'blur(8px)', mb: 2 }}>
              <Sparkles size={14} color="#FBBF24" />
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '11px', color: '#FFFFFF' }}>
                Salem's No. 1 Service App
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                mb: 1.5,
                fontSize: { md: '2.1rem', lg: '2.35rem' }
              }}
            >
              Welcome back!<br />
              Please sign in to your<br />
              SalemSeva account
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
                maxWidth: '440px',
                fontSize: '13.5px'
              }}
            >
              {CAROUSEL_SLIDES[activeSlide].desc}
            </Typography>
          </Box>

          {/* Central Showcase: Nano Banana Illustration & Service Activity Cards */}
          <Box sx={{ position: 'relative', my: 2.5, zIndex: 2 }}>
            
            {/* Active Illustration Banner */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                mb: 2,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                height: '160px'
              }}
            >
              <img
                src={CAROUSEL_SLIDES[activeSlide]?.image || '/assets/illustrations/customer_booking.jpg'}
                alt={CAROUSEL_SLIDES[activeSlide]?.title || 'SalemSeva'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 10,
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  color: '#FFFFFF',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {CAROUSEL_SLIDES[activeSlide]?.badge}
              </Box>
            </Box>

            {/* 1. Main Service Activity Bar Chart Card (Inspired by Reference Screenshot) */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '20px',
                p: 2.5,
                color: '#0F172A',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                    Salem Service Report
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                    Daily Completed vs Dispatched
                  </Typography>
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0066CC' }} />
                    <Typography variant="caption" sx={{ fontSize: '10.5px', color: '#475569', fontWeight: 700 }}>
                      Completed
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E2E8F0' }} />
                    <Typography variant="caption" sx={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                      Dispatched
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Relative Bar Graph with Floating Tooltip */}
              <Box sx={{ position: 'relative', height: '110px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pt: 3 }}>
                
                {/* Floating Tooltip matching the screenshot */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: 80,
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    px: 1.2,
                    py: 0.6,
                    borderRadius: '8px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.2,
                    zIndex: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#38BDF8' }} />
                    <span>24,850+ Bookings</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#4ADE80' }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#4ADE80' }} />
                    <span>98.6% On-Time</span>
                  </Box>
                </Box>

                {/* 10 Monthly Vertical Bars */}
                {[
                  { month: 'Jan', h1: '40%', h2: '65%' },
                  { month: 'Feb', h1: '48%', h2: '72%' },
                  { month: 'Mar', h1: '54%', h2: '78%' },
                  { month: 'Apr', h1: '60%', h2: '84%' },
                  { month: 'May', h1: '45%', h2: '68%' },
                  { month: 'Jun', h1: '52%', h2: '75%' },
                  { month: 'Jul', h1: '62%', h2: '86%' },
                  { month: 'Aug', h1: '72%', h2: '94%' },
                  { month: 'Sep', h1: '66%', h2: '90%' },
                  { month: 'Oct', h1: '78%', h2: '98%' }
                ].map((bar, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 14, height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', bgcolor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <Box sx={{ width: '100%', height: bar.h2, bgcolor: '#CBD5E1', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end' }}>
                        <Box sx={{ width: '100%', height: bar.h1, bgcolor: '#0066CC', borderRadius: '4px 4px 0 0' }} />
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 600 }}>
                      {bar.month}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* 2. Floating Popular Categories Donut Card (Top-Right Placement like in Reference Image) */}
            <Card
              elevation={0}
              sx={{
                position: 'absolute',
                top: -36,
                right: -14,
                bgcolor: '#FFFFFF',
                borderRadius: '18px',
                p: 2,
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.22)',
                border: '1px solid #E2E8F0',
                width: '180px',
                zIndex: 4
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '11px', color: '#0F172A', display: 'block', mb: 1, textAlign: 'center' }}>
                Popular Categories
              </Typography>

              {/* Circular SVG Donut */}
              <Box sx={{ position: 'relative', width: 90, height: 90, mx: 'auto', my: 0.5 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                  {/* Segment 1: AC Repair (42%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0066CC"
                    strokeWidth="4"
                    strokeDasharray="37 100"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Electrician (28%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#FF6600"
                    strokeWidth="4"
                    strokeDasharray="25 100"
                    strokeDashoffset="-37"
                  />
                  {/* Segment 3: Plumbing (18%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray="16 100"
                    strokeDashoffset="-62"
                  />
                  {/* Segment 4: Cleaning (12%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="4"
                    strokeDasharray="10 100"
                    strokeDashoffset="-78"
                  />
                </svg>

                {/* Donut Center Label */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '11px', lineHeight: 1 }}>
                    24.5k
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '8px', color: '#64748B', fontWeight: 700 }}>
                    Bookings
                  </Typography>
                </Box>
              </Box>

              {/* Donut Mini Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#0066CC' }} />
                  <Typography variant="caption" sx={{ fontSize: '8.5px', color: '#64748B', fontWeight: 700 }}>
                    AC
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#FF6600' }} />
                  <Typography variant="caption" sx={{ fontSize: '8.5px', color: '#64748B', fontWeight: 700 }}>
                    Wiring
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Typography variant="caption" sx={{ fontSize: '8.5px', color: '#64748B', fontWeight: 700 }}>
                    Pipe
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Bottom Carousel Indicator Dots (Matching the screenshot) */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, pt: 1, zIndex: 2 }}>
            {CAROUSEL_SLIDES.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setActiveSlide(idx)}
                sx={{
                  width: activeSlide === idx ? 28 : 8,
                  height: 8,
                  borderRadius: '4px',
                  bgcolor: activeSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
