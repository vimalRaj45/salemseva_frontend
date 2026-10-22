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
  FormControlLabel,
  Dialog
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Compass,
  ShieldCheck,
  ArrowRight,
  Wrench,
  User,
  MapPin,
  Phone,
  HelpCircle,
  X,
  ChevronRight
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

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithCredentials, registerAccount, continueAsGuest } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialRoleParam = queryParams.get('role');
  const redirectTarget = queryParams.get('redirect') || '/';

  // If already logged in, redirect appropriately unless customer wants to register as partner
  useEffect(() => {
    if (user) {
      const isRegisteringPartner = (initialRoleParam === 'partner' || initialRoleParam === 'technician') && (user.role === 'customer' || !user.role);
      if (isRegisteringPartner) {
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
  const [showRoleModal, setShowRoleModal] = useState(!initialRoleParam);

  useEffect(() => {
    if (initialRoleParam === 'partner' || initialRoleParam === 'technician') {
      setSelectedRole('technician');
      setShowRoleModal(false);
    } else if (initialRoleParam === 'customer') {
      setSelectedRole('customer');
      setShowRoleModal(false);
    }
  }, [initialRoleParam]);

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
  const [helpModalOpen, setHelpModalOpen] = useState(false);

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
      toast.success('Account created successfully! Welcome credits added.');
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

  const isTech = selectedRole === 'technician';
  const brandPrimary = isTech ? '#059669' : '#0284C7';
  const brandHover = isTech ? '#047857' : '#0369A1';
  const brandSoftBg = isTech ? '#ECFDF5' : '#F0F9FF';
  const brandBorder = isTech ? '#A7F3D0' : '#BAE6FD';

  return (
    <Box
      sx={{
        bgcolor: { xs: '#FFFFFF', md: '#F1F5F9' },
        backgroundImage: {
          xs: 'none',
          md: `
            radial-gradient(at 10% 12%, rgba(2, 132, 199, 0.16) 0px, transparent 45%),
            radial-gradient(at 90% 88%, rgba(5, 150, 105, 0.16) 0px, transparent 45%),
            radial-gradient(at 85% 15%, rgba(99, 102, 241, 0.12) 0px, transparent 40%),
            radial-gradient(at 15% 85%, rgba(14, 165, 233, 0.14) 0px, transparent 45%),
            linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)
          `
        },
        height: { xs: '100dvh', md: '100vh' },
        minHeight: { xs: '100dvh', md: '100vh' },
        maxHeight: { xs: '100dvh', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0, md: 2 },
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Blurry Gradient Orbs behind Glass Card */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '-80px',
          left: '-60px',
          width: { xs: 260, md: 380 },
          height: { xs: 260, md: 380 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.38) 0%, rgba(2, 132, 199, 0.08) 60%, transparent 80%)',
          filter: 'blur(55px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          bottom: '-90px',
          right: '-60px',
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, rgba(5, 150, 105, 0.08) 60%, transparent 80%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '30%',
          right: '12%',
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Official Shazu One Ambient Brand Watermarks in Background */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          bottom: { xs: '-80px', md: '-120px' },
          right: { xs: '-60px', md: '-100px' },
          width: { xs: 340, md: 540 },
          height: { xs: 340, md: 540 },
          opacity: 0.045,
          transform: 'rotate(15deg)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: { xs: '-60px', md: '-90px' },
          left: { xs: '-50px', md: '-80px' },
          width: { xs: 260, md: 420 },
          height: { xs: 260, md: 420 },
          opacity: 0.04,
          transform: 'rotate(-12deg)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Floating Glassmorphic Brand Badges (Official Brand Logos with Frosted Glass Look) */}
      {/* Top Left Floating Frosted Brand Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '3%', md: '7%' },
          left: { xs: '2%', md: '6%' },
          width: { xs: 52, md: 66 },
          height: { xs: 52, md: 66 },
          borderRadius: '18px',
          bgcolor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 12px 32px 0 rgba(2, 132, 199, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.1, md: 1.4 },
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt="Shazu One"
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Bottom Right Floating Frosted Brand Badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '3%', md: '7%' },
          right: { xs: '2%', md: '6%' },
          width: { xs: 52, md: 66 },
          height: { xs: 52, md: 66 },
          borderRadius: '18px',
          bgcolor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 12px 32px 0 rgba(5, 150, 105, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1.1, md: 1.4 },
          transform: 'rotate(10deg)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt="Shazu One"
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Mid Left Subtle Frosted Brand Mark (Desktop) */}
      <Box
        sx={{
          position: 'absolute',
          top: '46%',
          left: '2.5%',
          width: 52,
          height: 52,
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 28px 0 rgba(2, 132, 199, 0.1)',
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.2,
          transform: 'rotate(6deg)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt="Shazu One"
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Mid Right Subtle Frosted Brand Mark (Desktop) */}
      <Box
        sx={{
          position: 'absolute',
          top: '48%',
          right: '3%',
          width: 52,
          height: 52,
          borderRadius: '16px',
          bgcolor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 28px 0 rgba(5, 150, 105, 0.1)',
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.2,
          transform: 'rotate(-10deg)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt="Shazu One"
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>

      {/* Main Container Card: Full-bleed on Mobile, Glassmorphism on Desktop */}
      <Card
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: { xs: '100%', md: '980px', lg: '1020px' },
          height: { xs: '100%', md: 'min(620px, calc(100vh - 28px))' },
          maxHeight: { xs: '100%', md: 'calc(100vh - 28px)' },
          bgcolor: { xs: '#FFFFFF', md: 'rgba(255, 255, 255, 0.88)' },
          backdropFilter: { xs: 'none', md: 'blur(20px) saturate(180%)' },
          WebkitBackdropFilter: { xs: 'none', md: 'blur(20px) saturate(180%)' },
          borderRadius: { xs: 0, md: '20px' },
          border: { xs: 'none', md: '1.5px solid rgba(255, 255, 255, 0.9)' },
          boxShadow: { xs: 'none', md: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset' },
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.12fr 0.88fr' }
        }}
      >
        {/* ===================== LEFT PANE: AUTHENTICATION FORM ===================== */}
        <Box
          sx={{
            p: { xs: '18px 20px', sm: '22px 24px', md: 2.5, lg: 2.8 },
            pt: { xs: 'calc(16px + env(safe-area-inset-top, 0px))', md: 2.5 },
            pb: { xs: 'calc(18px + env(safe-area-inset-bottom, 0px))', md: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '5px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.03)' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
            '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#94A3B8' }
          }}
        >
          <Box>
            {/* Header: Official logo.svg & Salem Verified Trust Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.2, md: 1.4 } }}>
              <Box
                component="img"
                src="/logo.svg"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                alt="Shazu One"
                sx={{
                  height: { xs: 26, sm: 30 },
                  width: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/')}
              />

              <Chip
                icon={<ShieldCheck size={13} color={isTech ? '#059669' : '#0284C7'} />}
                label="Salem Verified"
                size="small"
                sx={{
                  bgcolor: brandSoftBg,
                  color: brandPrimary,
                  fontWeight: 700,
                  fontSize: '10.5px',
                  border: `1px solid ${brandBorder}`,
                  height: 22
                }}
              />
            </Box>

            {/* Minimalist Portal Indicator with Change Action */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '8px 12px',
                mb: { xs: 1.2, md: 1.4 },
                borderRadius: '10px',
                bgcolor: brandSoftBg,
                border: `1px solid ${brandBorder}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '7px',
                    bgcolor: isTech ? '#059669' : '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  {isTech ? <Wrench size={14} /> : <User size={14} />}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    {isTech ? 'Service Partner Portal' : 'Customer Portal'}
                  </Typography>
                  <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                    {isTech ? 'பணியாளர் உள்நுழைவு' : 'வாடிக்கையாளர் உள்நுழைவு'}
                  </Typography>
                </Box>
              </Box>

              <Button
                type="button"
                onClick={() => setShowRoleModal(true)}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isTech ? '#059669' : '#0284C7',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${brandBorder}`,
                  borderRadius: '6px',
                  px: 1.2,
                  py: 0.3,
                  minWidth: 'auto',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: '#FFFFFF',
                    borderColor: isTech ? '#059669' : '#0284C7'
                  }
                }}
              >
                Change
              </Button>
            </Box>

            {/* Title & Subtitle */}
            <Box sx={{ mb: { xs: 1, md: 1.2 } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', mb: 0.2, fontSize: { xs: '1.2rem', sm: '1.3rem' } }}>
                {authMode === 'login'
                  ? (isTech ? 'Service Partner Sign In' : 'Sign in to Shazu One')
                  : (isTech ? 'Register as Service Partner' : 'Create Customer Account')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '12px', lineHeight: 1.4 }}>
                {authMode === 'login'
                  ? (isTech
                      ? 'Access your live duty radar, dispatch leads, and daily earnings.'
                      : 'Book certified doorstep repairs, track specialists, and manage orders.')
                  : (isTech
                      ? 'Join Salem’s certified technician network with 98% daily earnings.'
                      : 'Join Salem’s trusted doorstep service network in 30 seconds.')}
              </Typography>
            </Box>

            {/* Error Message Alert */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 1.2, borderRadius: '8px', fontSize: '11.5px', py: 0.4, px: 1.2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* ================= CASE 1: SIGN IN FORM ================= */}
            {authMode === 'login' ? (
              <Box component="form" onSubmit={handleLoginSubmit}>
                {/* Identifier Field */}
                <Box sx={{ mb: 1.1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                    {isTech ? 'Registered Mobile Number' : 'Mobile Number or Email'}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={isTech ? '94432 88901' : '98427 11234 or your email'}
                    variant="outlined"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {isTech ? <Phone size={15} color="#64748B" /> : <Mail size={15} color="#64748B" />}
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '9px',
                        bgcolor: '#FFFFFF',
                        fontSize: '12.5px',
                        height: '38px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: brandPrimary, borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                    Password (கடவுச்சொல்)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={15} color="#64748B" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#64748B' }}
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '9px',
                        bgcolor: '#FFFFFF',
                        fontSize: '12.5px',
                        height: '38px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: brandPrimary, borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Remember Me & Forgot Password */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: brandPrimary },
                          p: 0.3
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '11.5px' }}>
                        Remember for 30 Days
                      </Typography>
                    }
                  />

                  <Button
                    type="button"
                    onClick={() => toast.success('Password reset instructions sent to your mobile contact.')}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      color: brandPrimary,
                      fontWeight: 700,
                      fontSize: '11.5px',
                      textTransform: 'none',
                      '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                    }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                {/* Primary Sign In Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    bgcolor: brandPrimary,
                    color: '#FFFFFF',
                    height: '38px',
                    borderRadius: '9px',
                    fontWeight: 800,
                    fontSize: '13px',
                    textTransform: 'none',
                    boxShadow: isTech ? '0 4px 14px rgba(5, 150, 105, 0.25)' : '0 4px 14px rgba(2, 132, 199, 0.25)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: brandHover,
                      boxShadow: isTech ? '0 6px 18px rgba(5, 150, 105, 0.35)' : '0 6px 18px rgba(2, 132, 199, 0.35)'
                    }
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    isTech ? 'Sign in to Partner Radar' : 'Sign In'
                  )}
                </Button>

                {/* OR Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                  <Typography variant="caption" sx={{ px: 1.2, color: '#94A3B8', fontWeight: 700, fontSize: '10px', letterSpacing: '0.5px' }}>
                    OR
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                </Box>

                {/* Continue as Guest Button */}
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={handleContinueAsGuest}
                  startIcon={<Compass size={15} color="#0284C7" />}
                  endIcon={<ArrowRight size={14} color="#64748B" />}
                  sx={{
                    height: '36px',
                    borderRadius: '9px',
                    borderColor: '#E2E8F0',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'none',
                    transition: 'all 0.15s ease',
                    justifyContent: 'space-between',
                    px: 1.5,
                    '&:hover': {
                      bgcolor: '#F1F5F9',
                      borderColor: '#CBD5E1',
                      color: '#0284C7'
                    }
                  }}
                >
                  <span>Continue as Guest (விருந்தினராக தொடரவும்)</span>
                </Button>
              </Box>
            ) : (
              /* ================= CASE 2: REGISTER FORM ================= */
              <Box component="form" onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <Box sx={{ mb: 1.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                    Full Name (முழு பெயர்)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={isTech ? 'e.g. K. Ramesh' : 'e.g. Vimal Raj'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} color="#64748B" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '10px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13px',
                        height: '42px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: brandPrimary, borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {/* Mobile */}
                <Box sx={{ mb: 1.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                    Mobile Number (கைபேசி எண்)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="98427 11234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#64748B' }}>+91</span>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '10px',
                        bgcolor: '#FFFFFF',
                        fontSize: '13px',
                        height: '42px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: brandPrimary, borderWidth: '1.5px' }
                      }
                    }}
                  />
                </Box>

                {isTech ? (
                  /* Technician Fields */
                  <>
                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Primary Trade Skill (முக்கிய பணி)
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={trade}
                        onChange={(e) => setTrade(e.target.value)}
                        InputProps={{
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      >
                        <MenuItem value="ac">AC Repair & Cooling Specialist (ஏசி)</MenuItem>
                        <MenuItem value="electrician">Certified Electrician & Wiring (எலக்ட்ரீசியன்)</MenuItem>
                        <MenuItem value="plumber">Plumber & Drainage Specialist (பிளம்பர்)</MenuItem>
                        <MenuItem value="cleaning">Deep Sanitization & Cleaning (சுத்தம்)</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Create Duty Password (கடவுச்சொல் - min 6 chars)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Choose password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={16} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Confirm Password
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={16} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowRight size={16} />}
                      sx={{
                        bgcolor: '#059669',
                        color: '#FFFFFF',
                        height: '42px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      Continue to Partner Verification
                    </Button>
                  </>
                ) : (
                  /* Customer Fields */
                  <>
                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Salem Locality (பகுதி)
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={16} color="#64748B" />
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      >
                        {SALEM_LOCALITIES.map((loc) => (
                          <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Create Password (கடவுச்சொல் - min 6 chars)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Choose password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={16} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.4, fontSize: '11.5px' }}>
                        Confirm Password
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={16} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            fontSize: '13px',
                            height: '42px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        bgcolor: '#0284C7',
                        color: '#FFFFFF',
                        height: '42px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                        '&:hover': { bgcolor: '#0369A1' }
                      }}
                    >
                      {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Account'}
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Footer Navigation & Help Button */}
          <Box sx={{ mt: { xs: 1.2, md: 1.5 }, pt: 1, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            {authMode === 'login' ? (
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
                Don't have an account?{' '}
                <Button
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    color: brandPrimary,
                    fontWeight: 800,
                    fontSize: '12px',
                    textTransform: 'none',
                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                  }}
                >
                  Sign up
                </Button>
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
                Already have an account?{' '}
                <Button
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    color: brandPrimary,
                    fontWeight: 800,
                    fontSize: '12px',
                    textTransform: 'none',
                    '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            )}

            <Box sx={{ mt: 0.4 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setHelpModalOpen(true)}
                startIcon={<HelpCircle size={13} color="#64748B" />}
                sx={{
                  color: '#64748B',
                  fontSize: '11px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 0.2,
                  '&:hover': { color: brandPrimary }
                }}
              >
                Need help with your login or account?
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ===================== RIGHT PANE: 3D ILLUSTRATION SHOWCASE ===================== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#0F172A',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: 0,
            height: '100%'
          }}
        >
          {/* Full-Bleed 3D Isometric Showcase Image */}
          <Box
            component="img"
            src="/illustrations/auth_showcase.jpg"
            alt="Salem Doorstep Services Specialist"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />

          {/* Floating Glassmorphic Brand Tag on Top */}
          <Box
            sx={{
              position: 'relative',
              m: 2.2,
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              zIndex: 2
            }}
          >
            <ShieldCheck size={14} color="#38BDF8" />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', fontSize: '10.5px', color: '#FFFFFF' }}>
              Salem Certified Network
            </Typography>
          </Box>

          {/* Bottom Glass Gradient Scrim & Verified Specialist Badge */}
          <Box
            sx={{
              position: 'relative',
              p: 2,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src="/logo-mark.svg"
                onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                alt="Shazu One"
                sx={{ width: 22, height: 22, objectFit: 'contain' }}
              />
              <Typography variant="caption" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '12px', letterSpacing: '-0.01em' }}>
                Shazu One Verified Specialists
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, fontSize: '10.5px', bgcolor: 'rgba(56, 189, 248, 0.15)', px: 1, py: 0.3, borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              15-Min Dispatch
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Account Trouble / Help Modal */}
      <AuthHelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      {/* Minimalist Professional Portal Selection Dialog */}
      <Dialog
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#FFFFFF',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            border: '1px solid #E2E8F0',
            maxWidth: { xs: '340px', sm: '420px' },
            mx: 'auto',
            my: 'auto'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo-mark.svg"
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              alt="Shazu One"
              sx={{ width: 26, height: 26, borderRadius: '6px' }}
            />
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Shazu One · Salem
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setShowRoleModal(false)}
            sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}
          >
            <X size={18} />
          </IconButton>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.4, fontSize: { xs: '1.2rem', sm: '1.35rem' } }}>
          Choose Your Portal
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px', mb: 2 }}>
          Select how you want to continue to sign in or create an account.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {/* Card 1: Customer */}
          <Paper
            elevation={0}
            onClick={() => {
              setSelectedRole('customer');
              if (identifier === '94432 88901') setIdentifier('98427 11234');
              setErrorMessage('');
              setShowRoleModal(false);
            }}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: selectedRole === 'customer' ? '2px solid #0284C7' : '1px solid #E2E8F0',
              bgcolor: selectedRole === 'customer' ? '#F0F9FF' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              '&:hover': {
                borderColor: '#0284C7',
                bgcolor: '#F0F9FF',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={20} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    Customer
                  </Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#0284C7', lineHeight: 1.2 }}>
                    வாடிக்கையாளர்
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.3, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Book doorstep services in Salem
                </Typography>
              </Box>
            </Box>
            <ChevronRight size={18} color={selectedRole === 'customer' ? '#0284C7' : '#94A3B8'} style={{ flexShrink: 0 }} />
          </Paper>

          {/* Card 2: Service Partner */}
          <Paper
            elevation={0}
            onClick={() => {
              setSelectedRole('technician');
              if (identifier === '98427 11234') setIdentifier('94432 88901');
              setErrorMessage('');
              setShowRoleModal(false);
            }}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: selectedRole === 'technician' ? '2px solid #059669' : '1px solid #E2E8F0',
              bgcolor: selectedRole === 'technician' ? '#ECFDF5' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              '&:hover': {
                borderColor: '#059669',
                bgcolor: '#ECFDF5',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Wrench size={20} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    Service Partner
                  </Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#059669', lineHeight: 1.2 }}>
                    பணியாளர்
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.3, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Accept dispatches & earn 98%
                </Typography>
              </Box>
            </Box>
            <ChevronRight size={18} color={selectedRole === 'technician' ? '#059669' : '#94A3B8'} style={{ flexShrink: 0 }} />
          </Paper>
        </Box>
      </Dialog>
    </Box>
  );
}
