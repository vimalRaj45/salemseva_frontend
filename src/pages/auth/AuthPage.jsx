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
  Phone,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AuthHelpModal from '../../components/AuthHelpModal';

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

  // Role selection for onboarding: 'customer' | 'technician'
  const queryParams = new URLSearchParams(location.search);
  const initialRoleParam = queryParams.get('role');
  const redirectTarget = queryParams.get('redirect') || '/';

  // If already logged in, redirect to appropriate role portal, UNLESS a customer wants to register as a partner
  useEffect(() => {
    if (user) {
      const isRegisteringPartner = (initialRoleParam === 'partner' || initialRoleParam === 'technician') && (user.role === 'customer' || !user.role);
      if (isRegisteringPartner) {
        // Allow existing customer to register as a partner with the same mobile number
        setSelectedRole('technician');
        setAuthMode('register');
        if (user.name && !fullName) setFullName(user.name);
        if (user.phone && !phone) setPhone(user.phone.replace(/[^0-9]/g, '').slice(-10));
        return;
      }
      if (user.role === 'technician' || user.role === 'partner') {
        navigate('/partner', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectTarget, { replace: true });
      }
    }
  }, [user, navigate, redirectTarget, initialRoleParam]);

  // Mode: 'login' | 'register'
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [authMode, setAuthMode] = useState(isRegisterRoute ? 'register' : 'login');

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
  const [helpModalOpen, setHelpModalOpen] = useState(false);

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
      const loggedUser = await loginWithCredentials({ identifier, password, role: selectedRole });
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
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 1.5, md: 2 },
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Main Split-Screen Container Card - Viewport Fit (No Screen Scroll) */}
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '1120px',
          height: 'calc(100vh - 28px)',
          maxHeight: '680px',
          bgcolor: '#FFFFFF',
          borderRadius: { xs: '16px', md: '24px' },
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.09)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.05fr' }
        }}
      >
        {/* ===================== LEFT PANE: SIGN IN / REGISTER FORM ===================== */}
        <Box
          sx={{
            p: { xs: 2.2, sm: 2.8, md: 3.2 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' }
          }}
        >
          <Box>
            {/* Top Brand Logo & Mobile Continue as Guest Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8 }}>
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
                    src="/logo-mark.svg"
                    onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                    alt="Shazu One"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0D3B66', lineHeight: 1.1, fontSize: '1.25rem', fontFamily: '"Poppins", sans-serif' }}>
                    Shazu <span style={{ color: '#2E7D32' }}>One</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px' }}>
                    All Your Home Services. One Platform.
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={<ShieldCheck size={14} color="#059669" />}
                label="Shazu Verified"
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
            <Box sx={{ mb: 1.8 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.3, fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px' }}>
                {authMode === 'login'
                  ? 'Welcome back! Please enter your details'
                  : 'Join Salem’s trusted network for home services & daily repairs'}
              </Typography>
            </Box>

            {/* Error Message Alert */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 1.8, borderRadius: '10px', fontSize: '12px', py: 0.5 }}>
                {errorMessage}
              </Alert>
            )}

            {/* ================= CASE 1: SIGN IN FORM ================= */}
            {authMode === 'login' ? (
              <Box component="form" onSubmit={handleLoginSubmit}>
                {/* Role Switcher Pill Bar for Sign In */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.8 }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedRole('customer');
                      if (identifier === '94432 88901') setIdentifier('98427 11234');
                      setErrorMessage('');
                    }}
                    startIcon={<Home size={15} />}
                    sx={{
                      py: 0.7,
                      borderRadius: '9px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: selectedRole === 'customer' ? '#EFF6FF' : '#F8FAFC',
                      color: selectedRole === 'customer' ? '#0066CC' : '#64748B',
                      border: selectedRole === 'customer' ? '1.5px solid #0066CC' : '1px solid #E2E8F0',
                      boxShadow: selectedRole === 'customer' ? '0 2px 6px rgba(0, 102, 204, 0.12)' : 'none',
                      '&:hover': { bgcolor: selectedRole === 'customer' ? '#DBEAFE' : '#F1F5F9' }
                    }}
                  >
                    Customer Login
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedRole('technician');
                      if (identifier === '98427 11234') setIdentifier('94432 88901');
                      setErrorMessage('');
                    }}
                    startIcon={<Wrench size={15} />}
                    sx={{
                      py: 0.7,
                      borderRadius: '9px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: selectedRole === 'technician' ? '#ECFDF5' : '#F8FAFC',
                      color: selectedRole === 'technician' ? '#059669' : '#64748B',
                      border: selectedRole === 'technician' ? '1.5px solid #059669' : '1px solid #E2E8F0',
                      boxShadow: selectedRole === 'technician' ? '0 2px 6px rgba(5, 150, 105, 0.12)' : 'none',
                      '&:hover': { bgcolor: selectedRole === 'technician' ? '#D1FAE5' : '#F1F5F9' }
                    }}
                  >
                    Tech / Partner Login
                  </Button>
                </Box>

                {/* Email / Mobile Field */}
                <Box sx={{ mb: 1.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    {selectedRole === 'technician' ? 'Technician Registered Mobile' : 'Email or Mobile Number'}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={selectedRole === 'technician' ? 'Enter technician mobile (e.g. 94432 88901)' : 'Enter your email or 98427 11234'}
                    variant="outlined"
                    size="small"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {selectedRole === 'technician' ? <Phone size={16} color="#059669" /> : <Mail size={16} color="#94A3B8" />}
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '10px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13px',
                        height: '38px',
                        '& fieldset': { borderColor: selectedRole === 'technician' ? '#A7F3D0' : '#E2E8F0' },
                        '&:hover fieldset': { borderColor: selectedRole === 'technician' ? '#059669' : '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: selectedRole === 'technician' ? '#059669' : '#0066CC', borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box sx={{ mb: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                    {selectedRole === 'technician' ? 'Technician Duty Password' : 'Password'}
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
                          <Lock size={16} color="#94A3B8" />
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
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '10px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13px',
                        height: '38px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: selectedRole === 'technician' ? '#059669' : '#0066CC', borderWidth: '1.5px' }
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
                          '&.Mui-checked': { color: selectedRole === 'technician' ? '#059669' : '#0066CC' },
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
                      color: selectedRole === 'technician' ? '#059669' : '#0066CC',
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
                    bgcolor: selectedRole === 'technician' ? '#059669' : '#0066CC',
                    color: '#FFFFFF',
                    py: 1,
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    textTransform: 'none',
                    boxShadow: selectedRole === 'technician' ? '0 4px 14px rgba(5, 150, 105, 0.28)' : '0 4px 14px rgba(0, 102, 204, 0.25)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: selectedRole === 'technician' ? '#047857' : '#0052CC',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    selectedRole === 'technician' ? 'Sign in as Technician / Partner' : 'Sign in'
                  )}
                </Button>

                {/* Dedicated Click Here for Tech Login / Customer Login Callout */}
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.1,
                    textAlign: 'center',
                    borderRadius: '10px',
                    bgcolor: selectedRole === 'technician' ? '#EFF6FF' : '#F0FDF4',
                    border: selectedRole === 'technician' ? '1px dashed #BFDBFE' : '1px dashed #86EFAC'
                  }}
                >
                  {selectedRole === 'technician' ? (
                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#334155' }}>
                      Looking for customer home service booking?{' '}
                      <Box
                        component="span"
                        onClick={() => {
                          setSelectedRole('customer');
                          setIdentifier('98427 11234');
                          setPassword('salem123');
                          setErrorMessage('');
                        }}
                        sx={{
                          color: '#0066CC',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: '#0052CC' }
                        }}
                      >
                        Click here for Customer Login
                      </Box>
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: '12px', color: '#166534' }}>
                      Are you a Service Professional / Partner?{' '}
                      <Box
                        component="span"
                        onClick={() => {
                          setSelectedRole('technician');
                          setIdentifier('94432 88901');
                          setPassword('salem123');
                          setErrorMessage('');
                        }}
                        sx={{
                          color: '#059669',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: '#047857' }
                        }}
                      >
                        Click here for Tech Login
                      </Box>
                    </Typography>
                  )}
                </Box>

                {/* OR Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1.4 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                  <Typography variant="caption" sx={{ px: 1.5, color: '#94A3B8', fontWeight: 700, fontSize: '10.5px', letterSpacing: '0.5px' }}>
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
                  startIcon={<Compass size={16} color="#0066CC" />}
                  endIcon={<ArrowRight size={15} color="#64748B" />}
                  sx={{
                    py: 0.8,
                    borderRadius: '10px',
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    textTransform: 'none',
                    transition: 'all 0.15s ease',
                    justifyContent: 'space-between',
                    px: 1.8,
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
                <Box sx={{ mt: 1.5, p: 1.1, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, fontSize: '10.5px', display: 'block', mb: 0.8 }}>
                    Quick Demo One-Click Sign In:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.8 }}>
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

          {/* Bottom Switcher Link & Auth Help Button */}
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

            <Box sx={{ mt: 1.5, textAlign: 'center' }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setHelpModalOpen(true)}
                startIcon={<HelpCircle size={14} color="#64748B" />}
                sx={{
                  color: '#64748B',
                  fontSize: '11.5px',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { color: '#0066CC' }
                }}
              >
                Need Help? Report Login or Account Trouble
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ===================== RIGHT PANE: BRAND SHOWCASE WITH MOCK CHARTS ===================== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, #0052CC 0%, #0066CC 55%, #003D99 100%)',
            p: { md: 2.5, lg: 3 },
            height: '100%',
            boxSizing: 'border-box',
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
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(255,255,255,0.15)', px: 1.2, py: 0.4, borderRadius: '20px', backdropFilter: 'blur(8px)', mb: 1 }}>
              <Sparkles size={13} color="#FBBF24" />
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '10.5px', color: '#FFFFFF' }}>
                Salem's No. 1 Service App
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.18,
                mb: 0.6,
                fontSize: { md: '1.35rem', lg: '1.55rem' }
              }}
            >
              Welcome back!<br />
              Please sign in to your Shazu One account
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.4,
                maxWidth: '440px',
                fontSize: '12px'
              }}
            >
              {CAROUSEL_SLIDES[activeSlide].desc}
            </Typography>
          </Box>

          {/* Central Showcase: Full Illustration Banner & Service Activity Cards */}
          <Box sx={{ my: 1, zIndex: 2 }}>
            
            {/* Active Illustration Banner - 100% Unobscured & Full Image Shown */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                mb: 1.5,
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                bgcolor: '#FFFFFF',
                width: '100%',
                aspectRatio: '16/9',
                maxHeight: { md: '130px', lg: '145px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={CAROUSEL_SLIDES[activeSlide]?.image || '/assets/illustrations/customer_booking.jpg'}
                alt={CAROUSEL_SLIDES[activeSlide]?.title || 'Shazu One'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  left: 8,
                  bgcolor: 'rgba(15, 23, 42, 0.88)',
                  color: '#FFFFFF',
                  px: 1,
                  py: 0.3,
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)',
                  zIndex: 2
                }}
              >
                {CAROUSEL_SLIDES[activeSlide]?.badge}
              </Box>
            </Box>

            {/* Relative Chart Wrapper: Bar Chart + Compact Floating Donut Card */}
            <Box sx={{ position: 'relative' }}>
              {/* 1. Main Service Activity Bar Chart Card */}
              <Card
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  p: 1.6,
                  color: '#0F172A',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.18)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '11.5px', color: '#0F172A' }}>
                      Salem Service Report
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '9.5px' }}>
                      Daily Completed vs Dispatched
                    </Typography>
                  </Box>

                  {/* Legend */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0066CC' }} />
                      <Typography variant="caption" sx={{ fontSize: '9.5px', color: '#475569', fontWeight: 700 }}>
                        Completed
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
                      <Typography variant="caption" sx={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>
                        Dispatched
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Relative Bar Graph with Floating Tooltip */}
                <Box sx={{ position: 'relative', height: '65px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pt: 1.5 }}>
                  
                  {/* Floating Tooltip */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: 60,
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      px: 1,
                      py: 0.4,
                      borderRadius: '6px',
                      fontSize: '9.5px',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.1,
                      zIndex: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#38BDF8' }} />
                      <span>24.8k Bookings</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4ADE80' }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#4ADE80' }} />
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
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                      <Box sx={{ width: 12, height: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', bgcolor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <Box sx={{ width: '100%', height: bar.h2, bgcolor: '#CBD5E1', borderRadius: '3px 3px 0 0', display: 'flex', alignItems: 'flex-end' }}>
                          <Box sx={{ width: '100%', height: bar.h1, bgcolor: '#0066CC', borderRadius: '3px 3px 0 0' }} />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '8.5px', color: '#94A3B8', fontWeight: 600 }}>
                        {bar.month}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>

              {/* 2. Floating Popular Categories Donut Card (Decreased size, positioned over chart without covering illustration) */}
              <Card
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -6,
                  bgcolor: '#FFFFFF',
                  borderRadius: '14px',
                  p: 1.1,
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
                  border: '1px solid #E2E8F0',
                  width: '132px',
                  zIndex: 4
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '9px', color: '#0F172A', display: 'block', mb: 0.4, textAlign: 'center' }}>
                  Popular Categories
                </Typography>

                {/* Circular SVG Donut */}
                <Box sx={{ position: 'relative', width: 56, height: 56, mx: 'auto', my: 0.2 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#0066CC" strokeWidth="4" strokeDasharray="37 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#FF6600" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-37" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="16 100" strokeDashoffset="-62" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#0D9488" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-78" />
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
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '9px', lineHeight: 1 }}>
                      24.5k
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '6.5px', color: '#64748B', fontWeight: 700 }}>
                      Bookings
                    </Typography>
                  </Box>
                </Box>

                {/* Donut Mini Legend */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.6, mt: 0.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#0066CC' }} />
                    <Typography variant="caption" sx={{ fontSize: '7.5px', color: '#64748B', fontWeight: 700 }}>
                      AC
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#FF6600' }} />
                    <Typography variant="caption" sx={{ fontSize: '7.5px', color: '#64748B', fontWeight: 700 }}>
                      Wiring
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography variant="caption" sx={{ fontSize: '7.5px', color: '#64748B', fontWeight: 700 }}>
                      Pipe
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
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

      {/* Auth Help Modal */}
      <AuthHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        defaultRole={selectedRole || 'customer'}
      />
    </Box>
  );
}
