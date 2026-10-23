import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
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
  ArrowLeft,
  Wrench,
  User,
  MapPin,
  Phone,
  HelpCircle,
  X,
  ChevronRight,
  Fingerprint,
  KeyRound,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle
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
  const {
    user,
    loginWithCredentials,
    requestWhatsAppOtp,
    verifyWhatsAppOtp,
    setPasswordWithToken,
    checkPasskeySupport,
    registerPasskey,
    loginWithPasskey,
    registerAccount,
    continueAsGuest
  } = useAuth();

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

  // Mode: 'login' | 'register' | 'forgot_password'
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [authMode, setAuthMode] = useState(isRegisterRoute ? 'register' : 'login');

  const [selectedRole, setSelectedRole] = useState(
    initialRoleParam === 'partner' || initialRoleParam === 'technician' ? 'technician' : 'customer'
  );
  const [showRoleModal, setShowRoleModal] = useState(!initialRoleParam);

  // Form Fields - Sign In
  const [identifier, setIdentifier] = useState('98427 11234');
  const [password, setPassword] = useState('salem123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Registration
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [trade, setTrade] = useState('ac');
  const [referralCode, setReferralCode] = useState('SALEM100');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Multi-step Registration: Step 1 (WhatsApp OTP) -> Step 2 (Set Password) -> Step 3 (Passkey Prompt)
  const [registerStep, setRegisterStep] = useState(1);
  const [registrationToken, setRegistrationToken] = useState('');

  // Forgot Password State: Step 1 (Request OTP) -> Step 2 (Verify OTP & Set New Password)
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [expiryRemaining, setExpiryRemaining] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Passkey availability & dialog
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyPromptOpen, setPasskeyPromptOpen] = useState(false);
  const [registeredUserPhone, setRegisteredUserPhone] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Cooldown & Expiry Timers
  useEffect(() => {
    let timer;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    let timer;
    if (expiryRemaining > 0) {
      timer = setInterval(() => {
        setExpiryRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expiryRemaining]);

  // Check device Passkey capability
  useEffect(() => {
    async function checkSupport() {
      const supported = await checkPasskeySupport();
      setPasskeySupported(supported);
    }
    checkSupport();
  }, [checkPasskeySupport]);

  useEffect(() => {
    if (initialRoleParam === 'partner' || initialRoleParam === 'technician') {
      setSelectedRole('technician');
      setShowRoleModal(false);
    } else if (initialRoleParam === 'customer') {
      setSelectedRole('customer');
      setShowRoleModal(false);
    }
  }, [initialRoleParam]);

  // Sync mode with route
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/login') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  // Standard Credentials Login
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

  // 1-Tap Biometric (Passkey) Login
  const handlePasskeyLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const cleanPhone = (identifier || '').replace(/[^0-9]/g, '').slice(-10);
      const loggedUser = await loginWithPasskey(cleanPhone);
      setIsLoading(false);
      toast.success(`Biometric login successful. Welcome, ${loggedUser.name}!`);
      if (loggedUser.role === 'technician' || loggedUser.role === 'partner') {
        navigate('/partner');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Biometric authentication was cancelled or not recognized.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Multi-step Registration: Step 1 - Request WhatsApp OTP
  const handleSendRegisterOtp = async () => {
    setErrorMessage('');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestWhatsAppOtp(cleanPhone, 'register');
      setIsLoading(false);
      setIsOtpSent(true);
      setCooldownRemaining(res.cooldownSeconds || 60);
      setExpiryRemaining(res.expiresInSeconds || 300);
      toast.success('6-digit verification code sent to your WhatsApp!');
      if (res.simulatedOtp) {
        setOtpCode(res.simulatedOtp);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Could not send WhatsApp OTP. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Multi-step Registration: Step 1 - Verify WhatsApp OTP
  const handleVerifyRegisterOtp = async () => {
    setErrorMessage('');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Valid 10-digit mobile number required');
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code received on WhatsApp');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyWhatsAppOtp(cleanPhone, otpCode.trim(), 'register');
      setIsLoading(false);
      setRegistrationToken(res.verificationToken);
      setRegisteredUserPhone(cleanPhone);
      toast.success('WhatsApp mobile number verified successfully!');
      setRegisterStep(2);
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Incorrect or expired OTP code.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Multi-step Registration: Step 2 - Set Password & Finalize Account
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setErrorMessage('Please create a password with at least 6 characters');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter');
      return;
    }

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

    if (selectedRole === 'technician') {
      navigate(
        `/partner/onboarding?phone=${encodeURIComponent(cleanPhone)}&name=${encodeURIComponent(fullName)}&trade=${trade}&password=${encodeURIComponent(registerPassword)}`
      );
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await registerAccount({
        name: fullName.trim(),
        phone: cleanPhone,
        password: registerPassword.trim(),
        role: 'customer',
        locality,
        referralCode: referralCode.trim()
      });
      setIsLoading(false);
      toast.success('Account created successfully! Welcome credits added.');

      // If device supports Passkeys, offer 1-tap passkey registration
      if (passkeySupported) {
        setPasskeyPromptOpen(true);
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Register Passkey on newly created account
  const handleEnablePasskey = async () => {
    try {
      setIsLoading(true);
      await registerPasskey(registeredUserPhone || phone);
      setIsLoading(false);
      setPasskeyPromptOpen(false);
      toast.success('Passkey linked! You can now use Fingerprint / FaceID for 1-tap sign-in.');
      navigate(redirectTarget);
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'Passkey setup cancelled.');
      navigate(redirectTarget);
    }
  };

  // Forgot Password: Send OTP
  const handleSendForgotOtp = async () => {
    setErrorMessage('');
    const cleanPhone = (forgotPhone || identifier || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter your registered 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestWhatsAppOtp(cleanPhone, 'forgot_password');
      setIsLoading(false);
      setForgotStep(2);
      setCooldownRemaining(res.cooldownSeconds || 60);
      setExpiryRemaining(res.expiresInSeconds || 300);
      toast.success('Password reset code sent to your WhatsApp!');
      if (res.simulatedOtp) {
        setForgotOtp(res.simulatedOtp);
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Failed to send WhatsApp reset code';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Forgot Password: Verify & Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = (forgotPhone || identifier || '').replace(/[^0-9]/g, '').slice(-10);
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await verifyWhatsAppOtp(cleanPhone, forgotOtp.trim(), 'forgot_password');
      if (!verifyRes.verificationToken) {
        throw new Error('Verification session expired');
      }

      // 2. Set new password
      await setPasswordWithToken({
        phone: cleanPhone,
        verificationToken: verifyRes.verificationToken,
        newPassword: forgotNewPassword.trim(),
        role: selectedRole
      });

      setIsLoading(false);
      toast.success('Password changed successfully! You can now sign in.');
      setPassword(forgotNewPassword.trim());
      setAuthMode('login');
      setForgotStep(1);
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Could not reset password. Please check OTP and retry.';
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
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0, sm: 2, md: 2 }
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '480px', md: '920px' },
          height: { xs: '100%', md: 'min(700px, 94vh)' },
          maxHeight: { xs: '100dvh', md: '700px' },
          borderRadius: { xs: 0, sm: '20px', md: '24px' },
          border: { xs: 'none', md: '1px solid #E2E8F0' },
          boxShadow: { xs: 'none', md: '0 20px 48px -12px rgba(15, 23, 42, 0.14)' },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' },
          overflow: 'hidden',
          bgcolor: '#FFFFFF'
        }}
      >
        {/* ===================== LEFT PANE: AUTH INTERACTION ===================== */}
        <Box
          sx={{
            p: { xs: 2.2, sm: 3, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <Box>
            {/* Header: Logo & Portal Switcher */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                onClick={() => navigate('/')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              >
                <Box
                  component="img"
                  src="/logo-mark.svg"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                  alt="Shazu One"
                  sx={{ width: 28, height: 28, borderRadius: '7px' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.1, fontSize: '14px', letterSpacing: '-0.02em' }}>
                    Shazu One
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px', display: 'block', fontWeight: 600 }}>
                    Salem Central
                  </Typography>
                </Box>
              </Box>

              {/* Portal Pill */}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowRoleModal(true)}
                endIcon={<ChevronRight size={13} />}
                sx={{
                  borderRadius: '16px',
                  borderColor: '#E2E8F0',
                  color: isTech ? '#059669' : '#0284C7',
                  bgcolor: brandSoftBg,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 0.3,
                  px: 1.1,
                  height: '26px',
                  '&:hover': {
                    bgcolor: '#FFFFFF',
                    borderColor: brandPrimary
                  }
                }}
              >
                {isTech ? 'Partner Portal' : 'Customer Portal'}
              </Button>
            </Box>

            {/* Title & Subtitle */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', mb: 0.2, fontSize: { xs: '1.25rem', sm: '1.35rem' } }}>
                {authMode === 'login' && (isTech ? 'Service Partner Sign In' : 'Sign in to Shazu One')}
                {authMode === 'register' && (isTech ? 'Partner Registration' : 'Create Customer Account')}
                {authMode === 'forgot_password' && 'Reset Your Password'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '12px', lineHeight: 1.4 }}>
                {authMode === 'login' && (isTech ? 'Access duty radar, leads, and daily earnings.' : 'Sign in using your password or 1-tap Fingerprint / FaceID.')}
                {authMode === 'register' && 'Verify your mobile via free WhatsApp OTP to set up your account.'}
                {authMode === 'forgot_password' && 'Enter your mobile number to receive a secure WhatsApp reset code.'}
              </Typography>
            </Box>

            {/* Error Message Alert */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', fontSize: '11.5px', py: 0.4, px: 1.2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* ================= CASE 1: SIGN IN FORM ================= */}
            {authMode === 'login' && (
              <Box component="form" onSubmit={handleLoginSubmit}>
                {/* 1-Tap Biometric Passkey Login Banner */}
                {passkeySupported && (
                  <Paper
                    elevation={0}
                    onClick={handlePasskeyLogin}
                    sx={{
                      p: 1.2,
                      mb: 1.6,
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: brandBorder,
                      bgcolor: brandSoftBg,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease-out',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        borderColor: brandPrimary,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '9px',
                          bgcolor: brandPrimary,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Fingerprint size={20} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          1-Tap Biometric Sign In
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#64748B', lineHeight: 1.2 }}>
                          Instant FaceID / Fingerprint (Passkey)
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowRight size={16} color={brandPrimary} />
                  </Paper>
                )}

                {/* Identifier Field */}
                <Box sx={{ mb: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                    {isTech ? 'Registered Mobile Number' : 'Mobile Number, Username, or Email'}
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
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your account password"
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.4 }}>
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
                    onClick={() => {
                      setForgotPhone(identifier.replace(/[^0-9]/g, '').slice(-10));
                      setAuthMode('forgot_password');
                      setForgotStep(1);
                      setErrorMessage('');
                    }}
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
                    isTech ? 'Sign in to Partner Radar' : 'Sign In with Password'
                  )}
                </Button>

                {/* OR Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1.2 }}>
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
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    px: 1.5,
                    '&:hover': {
                      bgcolor: '#F1F5F9',
                      borderColor: '#CBD5E1'
                    }
                  }}
                >
                  Explore Salem Services as Guest
                </Button>
              </Box>
            )}

            {/* ================= CASE 2: REGISTRATION FLOW ================= */}
            {authMode === 'register' && (
              <Box>
                {/* Step indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: registerStep >= 1 ? brandPrimary : '#E2E8F0',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      1
                    </Box>
                    <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: registerStep === 1 ? '#0F172A' : '#64748B' }}>
                      WhatsApp OTP
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, height: '2px', bgcolor: registerStep >= 2 ? brandPrimary : '#E2E8F0' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: registerStep >= 2 ? brandPrimary : '#E2E8F0',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      2
                    </Box>
                    <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: registerStep === 2 ? '#0F172A' : '#64748B' }}>
                      Set Password
                    </Typography>
                  </Box>
                </Box>

                {/* Step 1: Mobile & WhatsApp OTP Verification */}
                {registerStep === 1 && (
                  <Box>
                    <Box sx={{ mb: 1.2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        Mobile Number (WhatsApp Gateway)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="98427 11234"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isOtpSent && cooldownRemaining > 0}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>+91</span>
                              </InputAdornment>
                            ),
                            sx: {
                              borderRadius: '9px',
                              bgcolor: '#FFFFFF',
                              fontSize: '12.5px',
                              height: '38px',
                              '& fieldset': { borderColor: '#E2E8F0' }
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSendRegisterOtp}
                          disabled={isLoading || cooldownRemaining > 0}
                          sx={{
                            bgcolor: brandPrimary,
                            color: '#FFFFFF',
                            borderRadius: '9px',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            minWidth: '100px',
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            height: '38px',
                            '&:hover': { bgcolor: brandHover }
                          }}
                        >
                          {cooldownRemaining > 0 ? (
                            `${cooldownRemaining}s`
                          ) : isOtpSent ? (
                            'Resend'
                          ) : (
                            'Send OTP'
                          )}
                        </Button>
                      </Box>
                    </Box>

                    {/* WhatsApp OTP Input Area */}
                    {isOtpSent && (
                      <Box sx={{ mb: 1.5, p: 1.5, bgcolor: brandSoftBg, borderRadius: '12px', border: `1px solid ${brandBorder}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '11.5px' }}>
                            Enter 6-digit WhatsApp OTP
                          </Typography>
                          {expiryRemaining > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                              <Clock size={12} />
                              <Typography sx={{ fontSize: '10.5px', fontWeight: 600 }}>
                                Expires in {Math.floor(expiryRemaining / 60)}:{(expiryRemaining % 60).toString().padStart(2, '0')}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <TextField
                          fullWidth
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          InputProps={{
                            sx: {
                              borderRadius: '8px',
                              bgcolor: '#FFFFFF',
                              fontSize: '16px',
                              fontWeight: 800,
                              letterSpacing: '4px',
                              textAlign: 'center',
                              height: '40px',
                              '& input': { textAlign: 'center' }
                            }
                          }}
                        />

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleVerifyRegisterOtp}
                          disabled={isLoading || otpCode.length !== 6}
                          sx={{
                            mt: 1.2,
                            bgcolor: brandPrimary,
                            color: '#FFFFFF',
                            borderRadius: '9px',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            height: '38px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: brandHover }
                          }}
                        >
                          {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Verify Code & Proceed'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Step 2: Set Password & Profile Details */}
                {registerStep === 2 && (
                  <Box component="form" onSubmit={handleCompleteRegistration}>
                    <Box sx={{ mb: 1.1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        Full Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={15} color="#64748B" />
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    {isTech ? (
                      <Box sx={{ mb: 1.1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                          Primary Trade Skill
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          value={trade}
                          onChange={(e) => setTrade(e.target.value)}
                          InputProps={{
                            sx: {
                              borderRadius: '9px',
                              bgcolor: '#FFFFFF',
                              fontSize: '12.5px',
                              height: '38px',
                              '& fieldset': { borderColor: '#E2E8F0' }
                            }
                          }}
                        >
                          <MenuItem value="ac">AC Repair & Cooling Specialist</MenuItem>
                          <MenuItem value="electrician">Certified Electrician & Wiring</MenuItem>
                          <MenuItem value="plumber">Plumber & Sanitary Specialist</MenuItem>
                          <MenuItem value="cleaning">Deep Sanitization & Cleaning</MenuItem>
                        </TextField>
                      </Box>
                    ) : (
                      <Box sx={{ mb: 1.1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                          Salem Locality
                        </Typography>
                        <TextField
                          select
                          fullWidth
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MapPin size={15} color="#64748B" />
                              </InputAdornment>
                            ),
                            sx: {
                              borderRadius: '9px',
                              bgcolor: '#FFFFFF',
                              fontSize: '12.5px',
                              height: '38px',
                              '& fieldset': { borderColor: '#E2E8F0' }
                            }
                          }}
                        >
                          {SALEM_LOCALITIES.map((loc) => (
                            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    )}

                    <Box sx={{ mb: 1.1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        Create Password (min 6 characters)
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
                              <Lock size={15} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
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
                              <Lock size={15} color="#64748B" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
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
                        bgcolor: brandPrimary,
                        color: '#FFFFFF',
                        height: '38px',
                        borderRadius: '9px',
                        fontWeight: 800,
                        fontSize: '13px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: brandHover }
                      }}
                    >
                      {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Complete Registration'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* ================= CASE 3: FORGOT PASSWORD FLOW ================= */}
            {authMode === 'forgot_password' && (
              <Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  startIcon={<ArrowLeft size={13} />}
                  sx={{ color: '#64748B', fontSize: '11px', textTransform: 'none', mb: 1, p: 0 }}
                >
                  Back to Sign In
                </Button>

                {forgotStep === 1 && (
                  <Box>
                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        Registered Mobile Number
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="98427 11234"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>+91</span>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSendForgotOtp}
                      disabled={isLoading}
                      sx={{
                        bgcolor: brandPrimary,
                        color: '#FFFFFF',
                        height: '38px',
                        borderRadius: '9px',
                        fontWeight: 800,
                        fontSize: '13px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: brandHover }
                      }}
                    >
                      {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Send WhatsApp Reset Code'}
                    </Button>
                  </Box>
                )}

                {forgotStep === 2 && (
                  <Box component="form" onSubmit={handleResetPassword}>
                    <Box sx={{ mb: 1.1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '11px' }}>
                          6-digit WhatsApp OTP
                        </Typography>
                        {expiryRemaining > 0 && (
                          <Typography sx={{ fontSize: '10.5px', color: '#64748B' }}>
                            Expires in {Math.floor(expiryRemaining / 60)}:{(expiryRemaining % 60).toString().padStart(2, '0')}
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        fullWidth
                        placeholder="000000"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        InputProps={{
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 800,
                            letterSpacing: '3px',
                            height: '38px'
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        New Password (min 6 characters)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter new password"
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}>
                                {showForgotNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
                            '& fieldset': { borderColor: '#E2E8F0' }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                        Confirm New Password
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Re-enter new password"
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        InputProps={{
                          sx: {
                            borderRadius: '9px',
                            bgcolor: '#FFFFFF',
                            fontSize: '12.5px',
                            height: '38px',
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
                        bgcolor: brandPrimary,
                        color: '#FFFFFF',
                        height: '38px',
                        borderRadius: '9px',
                        fontWeight: 800,
                        fontSize: '13px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: brandHover }
                      }}
                    >
                      {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Set New Password & Sign In'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Footer Navigation & Help Button */}
          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            {authMode === 'login' ? (
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
                Don't have an account?{' '}
                <Button
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterStep(1);
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
                  Create account
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
                Need help with your login or WhatsApp OTP?
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

          {/* Bottom Glass Gradient Scrim */}
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
                Shazu One Verified Security
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, fontSize: '10.5px', bgcolor: 'rgba(56, 189, 248, 0.15)', px: 1, py: 0.3, borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              Passkey & WhatsApp OTP
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Account Trouble / Help Modal */}
      <AuthHelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

      {/* Post-Registration 1-Tap Passkey Enable Dialog */}
      <Dialog
        open={passkeyPromptOpen}
        onClose={() => {
          setPasskeyPromptOpen(false);
          navigate(redirectTarget);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 2.5,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            maxWidth: '380px'
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              bgcolor: '#F0F9FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5
            }}
          >
            <Fingerprint size={32} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, fontSize: '1.2rem' }}>
            Enable 1-Tap Biometric Sign In?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', lineHeight: 1.4 }}>
            Skip typing passwords on this device. Sign in with Fingerprint or FaceID whenever you return.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleEnablePasskey}
            disabled={isLoading}
            startIcon={<Fingerprint size={18} />}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              height: '42px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Enable Fingerprint / FaceID'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setPasskeyPromptOpen(false);
              navigate(redirectTarget);
            }}
            sx={{
              color: '#64748B',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'none'
            }}
          >
            Maybe Later
          </Button>
        </Box>
      </Dialog>

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
