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
  FormControlLabel
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
  AlertCircle,
  Briefcase,
  Check
} from 'lucide-react';
import { FormHelperText, Chip } from '@mui/material';
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

const AVAILABLE_TRADES = [
  { id: 'ac', name: 'AC Repair & Cooling Specialist' },
  { id: 'electrician', name: 'Master Electrician & Wiring' },
  { id: 'plumber', name: 'Plumbing & Drainage Expert' },
  { id: 'cleaning', name: 'Deep Cleaning & Sanitization' }
];

const USER_SERVICE_PREFERENCES = [
  { id: 'ac', label: 'AC Repair & Service' },
  { id: 'electrician', label: 'Electrical & Wiring' },
  { id: 'plumber', label: 'Plumbing & Drainage' },
  { id: 'cleaning', label: 'Deep Cleaning' }
];

const EXPERIENCE_OPTIONS = [
  { value: '1', label: '1 - 2 Years' },
  { value: '3', label: '3 - 5 Years' },
  { value: '5', label: '5+ Years' }
];

const DRAFT_STORAGE_KEY = 'shazuone_onboarding_draft';

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

  // Flag to prevent immediate redirect while completing Step 3 (Passkey setup)
  const isNewRegistrationRef = useRef(false);

  // Mode: 'login' | 'register' | 'forgot_password'
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [authMode, setAuthMode] = useState(isRegisterRoute ? 'register' : 'login');

  // View Mode: 'select_role' (in-page full selection) | 'auth' (login / register forms)
  const [viewMode, setViewMode] = useState(initialRoleParam ? 'auth' : 'select_role');

  const [selectedRole, setSelectedRole] = useState(
    initialRoleParam === 'partner' || initialRoleParam === 'technician' ? 'technician' : 'customer'
  );

  // Form Fields - Sign In
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Registration
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [trade, setTrade] = useState('ac');
  const [referralCode, setReferralCode] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow specific fields
  const [yearsExperience, setYearsExperience] = useState('2');
  const [partnerLocalities, setPartnerLocalities] = useState(['Fairlands, Salem', 'Hasthampatti, Salem']);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [userPreferences, setUserPreferences] = useState(['ac', 'electrician']);
  const [notificationChannel, setNotificationChannel] = useState('whatsapp');

  // Multi-step Registration: Step 1 (Sign Up) -> Step 2 (Details) -> Step 3 (Preferences/Docs) -> Step 4 (Done)
  const [registerStep, setRegisterStep] = useState(1);
  const [registrationToken, setRegistrationToken] = useState('');

  // Draft persistence for resuming onboarding
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.selectedRole) setSelectedRole(draft.selectedRole);
        if (draft.registerStep && draft.registerStep >= 1 && draft.registerStep <= 3) {
          setRegisterStep(draft.registerStep);
        }
        if (draft.phone) setPhone(draft.phone);
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.locality) setLocality(draft.locality);
        if (draft.trade) setTrade(draft.trade);
        if (draft.yearsExperience) setYearsExperience(draft.yearsExperience);
        if (draft.partnerLocalities && Array.isArray(draft.partnerLocalities)) {
          setPartnerLocalities(draft.partnerLocalities);
        }
        if (draft.aadhaarNumber) setAadhaarNumber(draft.aadhaarNumber);
        if (draft.upiId) setUpiId(draft.upiId);
        if (draft.userPreferences && Array.isArray(draft.userPreferences)) {
          setUserPreferences(draft.userPreferences);
        }
        if (draft.notificationChannel) setNotificationChannel(draft.notificationChannel);
      }
    } catch (_) {}
  }, []);

  const saveDraft = (step, extra = {}) => {
    try {
      const draft = {
        selectedRole,
        registerStep: step || registerStep,
        phone,
        fullName,
        locality,
        trade,
        yearsExperience,
        partnerLocalities,
        aadhaarNumber,
        upiId,
        userPreferences,
        notificationChannel,
        ...extra
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (_) {}
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_) {}
  };

  // Forgot Password State: Step 1 (Request OTP) -> Step 2 (Verify OTP & Set New Password)
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [expiryRemaining, setExpiryRemaining] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [activeDemoOtp, setActiveDemoOtp] = useState('');
  const [activeForgotDemoOtp, setActiveForgotDemoOtp] = useState('');

  // Passkey availability
  const [passkeySupported, setPasskeySupported] = useState(false);
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

  // If already logged in, redirect appropriately unless customer wants to register as partner or is completing Passkey step
  useEffect(() => {
    if (user) {
      // Pause automatic redirect if user is in the middle of registration step 3 or 4
      if (isNewRegistrationRef.current || registerStep >= 3) {
        return;
      }
      const isRegisteringPartner = (initialRoleParam === 'partner' || initialRoleParam === 'technician') && (user.role === 'customer' || !user.role);
      if (isRegisteringPartner) {
        setSelectedRole('technician');
        setViewMode('auth');
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
  }, [user, navigate, redirectTarget, initialRoleParam, registerStep]);

  useEffect(() => {
    if (initialRoleParam === 'partner' || initialRoleParam === 'technician') {
      setSelectedRole('technician');
      setViewMode('auth');
    } else if (initialRoleParam === 'customer') {
      setSelectedRole('customer');
      setViewMode('auth');
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
      const code = res.demoOtp || res.simulatedOtp || res.otp || '';
      if (code) {
        setActiveDemoOtp(code);
        setOtpCode(code);
        toast.success(`Demo Verification OTP: ${code} (shown in UI)`, { duration: 6000 });
      } else {
        toast.success('6-digit verification code sent to your WhatsApp!');
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Could not send WhatsApp OTP. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Multi-step Registration: Step 1 - Verify WhatsApp OTP & Password
  const handleVerifyRegisterOtp = async () => {
    setErrorMessage('');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit WhatsApp OTP');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setErrorMessage('Please create a password with at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyWhatsAppOtp(cleanPhone, otpCode.trim(), 'register');
      setIsLoading(false);
      setRegistrationToken(res.verificationToken || 'verified');
      setRegisteredUserPhone(cleanPhone);
      toast.success('Mobile verified successfully');
      setRegisterStep(2);
      saveDraft(2, { phone: cleanPhone });
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Incorrect or expired OTP code.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Step 2 Continue - User
  const handleUserStep2Continue = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    setRegisterStep(3);
    saveDraft(3, { fullName: fullName.trim(), locality });
  };

  // Step 2 Continue - Partner
  const handlePartnerStep2Continue = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name matching official ID');
      return;
    }
    if (!trade) {
      setErrorMessage('Please select your primary trade specialty');
      return;
    }
    setRegisterStep(3);
    saveDraft(3, { fullName: fullName.trim(), trade, yearsExperience, partnerLocalities });
  };

  // Step 3 User Submit / Skip -> Step 4 Done
  const handleCompleteUserRegistration = async (isSkipping = false) => {
    setErrorMessage('');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    isNewRegistrationRef.current = true;
    setIsLoading(true);

    try {
      await registerAccount({
        name: fullName.trim(),
        phone: cleanPhone,
        password: registerPassword.trim(),
        role: 'customer',
        locality,
        referralCode: referralCode.trim(),
        preferences: isSkipping ? [] : userPreferences,
        notificationChannel
      });
      clearDraft();
      setIsLoading(false);
      setRegisteredUserPhone(cleanPhone);
      toast.success('Account created successfully');
      setRegisterStep(4);
    } catch (err) {
      isNewRegistrationRef.current = false;
      setIsLoading(false);
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Step 3 Partner Submit / Skip -> Step 4 Done (Under Review)
  const handleCompletePartnerRegistration = async (isSkipping = false) => {
    setErrorMessage('');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    isNewRegistrationRef.current = true;
    setIsLoading(true);

    try {
      await registerAccount({
        name: fullName.trim(),
        phone: cleanPhone,
        password: registerPassword.trim(),
        role: 'technician',
        trade,
        locality: (partnerLocalities && partnerLocalities[0]) || locality || 'Fairlands, Salem',
        aadhaar: isSkipping ? '' : aadhaarNumber.trim(),
        upiId: isSkipping ? '' : upiId.trim(),
        experienceYears: yearsExperience
      });
      clearDraft();
      setIsLoading(false);
      setRegisteredUserPhone(cleanPhone);
      toast.success('Partner application submitted for review');
      setRegisterStep(4);
    } catch (err) {
      isNewRegistrationRef.current = false;
      setIsLoading(false);
      const msg = err.message || 'Partner registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Legacy alias for compatibility
  const handleCompleteRegistration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (selectedRole === 'technician') {
      handlePartnerStep2Continue(e);
    } else {
      handleUserStep2Continue(e);
    }
  };

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
      setRegisteredUserPhone(cleanPhone);
      toast.success('Account created successfully! Welcome credits added.');

      // Move directly to Step 3 (Passkey setup) in-page
      setRegisterStep(3);
    } catch (err) {
      isNewRegistrationRef.current = false;
      setIsLoading(false);
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  // Step 3: Register Passkey on newly created account
  const handleEnablePasskey = async () => {
    try {
      setIsLoading(true);
      const cleanPhone = (registeredUserPhone || phone || user?.phone || '').replace(/[^0-9]/g, '').slice(-10);
      await registerPasskey(cleanPhone);
      setIsLoading(false);
      isNewRegistrationRef.current = false;
      toast.success('Passkey linked! You can now use Fingerprint / FaceID for 1-tap sign-in.');
      if (selectedRole === 'technician' || user?.role === 'technician' || user?.role === 'partner') {
        navigate('/partner', { replace: true });
      } else {
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      setIsLoading(false);
      isNewRegistrationRef.current = false;
      toast.error(err.message || 'Passkey setup cancelled.');
      if (selectedRole === 'technician' || user?.role === 'technician' || user?.role === 'partner') {
        navigate('/partner', { replace: true });
      } else {
        navigate(redirectTarget, { replace: true });
      }
    }
  };

  // Step 3: Skip Passkey and continue to destination
  const handleSkipPasskey = () => {
    isNewRegistrationRef.current = false;
    if (selectedRole === 'technician' || user?.role === 'technician' || user?.role === 'partner') {
      navigate('/partner', { replace: true });
    } else {
      navigate(redirectTarget, { replace: true });
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
      const code = res.demoOtp || res.simulatedOtp || res.otp || '';
      if (code) {
        setActiveForgotDemoOtp(code);
        setForgotOtp(code);
        toast.success(`Demo Password Reset OTP: ${code} (shown in UI)`, { duration: 6000 });
      } else {
        toast.success('Password reset code sent to your WhatsApp!');
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
      const verifyRes = await verifyWhatsAppOtp(cleanPhone, forgotOtp.trim(), 'forgot_password');
      if (!verifyRes.verificationToken) {
        throw new Error('Verification session expired');
      }

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
        {/* ===================== LEFT PANE: AUTH & ROLE INTERACTION ===================== */}
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

              {/* Portal Pill (when inside auth mode) */}
              {viewMode === 'auth' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setViewMode('select_role');
                    setErrorMessage('');
                  }}
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
              )}
            </Box>

            {/* Error Message Alert */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', fontSize: '11.5px', py: 0.4, px: 1.2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 1: IN-PAGE FULL ROLE SELECTION (NO POPUP MODALS) */}
            {/* ========================================================================= */}
            {viewMode === 'select_role' ? (
              <Box sx={{ py: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', mb: 0.4, fontSize: { xs: '1.35rem', sm: '1.5rem' } }}>
                    Choose Your Portal
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', lineHeight: 1.4 }}>
                    Select your account type to proceed with sign-in or registration.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
                  {/* Option 1: Customer Card */}
                  <Paper
                    elevation={0}
                    onClick={() => {
                      setSelectedRole('customer');
                      if (identifier === '94432 88901') setIdentifier('98427 11234');
                      setViewMode('auth');
                      setErrorMessage('');
                    }}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      border: '2px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.18s ease-out',
                      '&:hover': {
                        borderColor: '#0284C7',
                        bgcolor: '#F0F9FF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(2, 132, 199, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '12px',
                          bgcolor: '#E0F2FE',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <User size={24} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                            Customer Portal
                          </Typography>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0284C7' }}>
                            வாடிக்கையாளர்
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.2 }}>
                          Book certified doorstep home services in Salem
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRight size={20} color="#0284C7" />
                  </Paper>

                  {/* Option 2: Service Partner Card */}
                  <Paper
                    elevation={0}
                    onClick={() => {
                      setSelectedRole('technician');
                      if (identifier === '98427 11234') setIdentifier('94432 88901');
                      setViewMode('auth');
                      setErrorMessage('');
                    }}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      border: '2px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.18s ease-out',
                      '&:hover': {
                        borderColor: '#059669',
                        bgcolor: '#ECFDF5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(5, 150, 105, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '12px',
                          bgcolor: '#D1FAE5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Wrench size={24} />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                            Service Partner
                          </Typography>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                            பணியாளர்
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.2 }}>
                          Accept customer dispatches & earn 98% daily
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRight size={20} color="#059669" />
                  </Paper>
                </Box>

                {/* Continue as Guest Button */}
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleContinueAsGuest}
                    startIcon={<Compass size={16} color="#0284C7" />}
                    endIcon={<ArrowRight size={15} color="#64748B" />}
                    sx={{
                      height: '42px',
                      borderRadius: '10px',
                      borderColor: '#E2E8F0',
                      bgcolor: '#F8FAFC',
                      color: '#334155',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      textTransform: 'none',
                      justifyContent: 'space-between',
                      px: 2,
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                        borderColor: '#CBD5E1'
                      }
                    }}
                  >
                    Explore Salem Services as Guest
                  </Button>
                </Box>
              </Box>
            ) : (
              /* ========================================================================= */
              /* VIEW MODE 2: AUTH FORMS (LOGIN / REGISTER / FORGOT PASSWORD) */
              /* ========================================================================= */
              <Box>
                {/* Title & Subtitle */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em', mb: 0.2, fontSize: { xs: '1.25rem', sm: '1.35rem' } }}>
                    {authMode === 'login' && (isTech ? 'Service Partner Sign In' : 'Sign in to Shazu One')}
                    {authMode === 'register' && (
                      isTech
                        ? (registerStep === 1 ? 'Partner Sign Up' : registerStep === 2 ? 'Business Details' : registerStep === 3 ? 'Verification Documents' : 'Partner Application Status')
                        : (registerStep === 1 ? 'Customer Sign Up' : registerStep === 2 ? 'Basic Details' : registerStep === 3 ? 'Service Preferences' : 'Account Created')
                    )}
                    {authMode === 'forgot_password' && 'Reset Your Password'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.4 }}>
                    {authMode === 'login' && (isTech ? 'Access duty radar, leads, and daily earnings.' : 'Sign in using your password or 1-tap Fingerprint / FaceID.')}
                    {authMode === 'register' && (
                      isTech
                        ? (registerStep === 1 ? 'Verify your mobile via WhatsApp OTP to get started.' : registerStep === 2 ? 'Tell us your trade specialty, experience, and service areas.' : registerStep === 3 ? 'Provide identity and payout details. You can skip this step and complete it later.' : 'Your partner registration has been submitted.')
                        : (registerStep === 1 ? 'Verify your mobile via WhatsApp OTP to get started.' : registerStep === 2 ? 'Tell us your name and neighborhood in Salem.' : registerStep === 3 ? 'Select services you may need. You can skip this step anytime.' : 'Your customer account is ready.')
                    )}
                    {authMode === 'forgot_password' && 'Enter your mobile number to receive a secure WhatsApp reset code.'}
                  </Typography>
                </Box>

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

                {/* ================= CASE 2: ONBOARDING FLOWS (USER & PARTNER) ================= */}
                {authMode === 'register' && (
                  <Box>
                    {/* Progress Indicator Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {[
                          { num: 1, label: 'Sign up' },
                          { num: 2, label: isTech ? 'Business' : 'Details' },
                          { num: 3, label: isTech ? 'Verify' : 'Preferences' },
                          { num: 4, label: 'Done' }
                        ].map((s, idx) => (
                          <React.Fragment key={s.num}>
                            {idx > 0 && (
                              <Box sx={{ width: 12, height: '2px', bgcolor: registerStep >= s.num ? brandPrimary : 'divider' }} />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  bgcolor: registerStep >= s.num ? brandPrimary : 'divider',
                                  color: registerStep >= s.num ? '#FFFFFF' : 'text.secondary',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {registerStep > s.num ? <Check size={11} strokeWidth={3} /> : s.num}
                              </Box>
                              <Typography sx={{ fontSize: '11px', fontWeight: registerStep === s.num ? 800 : 600, color: registerStep === s.num ? 'text.primary' : 'text.secondary' }}>
                                {s.label}
                              </Typography>
                            </Box>
                          </React.Fragment>
                        ))}
                      </Box>

                      {/* Navigation back link */}
                      {registerStep === 1 && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            setViewMode('select_role');
                            setErrorMessage('');
                          }}
                          startIcon={<ArrowLeft size={12} />}
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: '11px',
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': { color: brandPrimary, bgcolor: 'transparent' }
                          }}
                        >
                          Change Role
                        </Button>
                      )}
                    </Box>

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 1: SIGN UP (COMMON FOR USER & PARTNER) */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 1 && (
                      <Box>
                        {/* Mobile Number Input */}
                        <Box sx={{ mb: 1.2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Mobile Number (WhatsApp)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              placeholder="98427 11234"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                              disabled={isOtpSent && cooldownRemaining > 0}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>+91</span>
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: '6px',
                                  bgcolor: 'background.paper',
                                  fontSize: '12.5px',
                                  height: '38px'
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
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                minWidth: '96px',
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                height: '38px',
                                '&:hover': { bgcolor: brandHover }
                              }}
                            >
                              {cooldownRemaining > 0 ? `${cooldownRemaining}s` : isOtpSent ? 'Resend' : 'Send OTP'}
                            </Button>
                          </Box>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            {isTech
                              ? 'Active WhatsApp number for job dispatch alerts and direct customer contact.'
                              : 'We send an instant verification code to your WhatsApp.'}
                          </FormHelperText>
                        </Box>

                        {/* WhatsApp OTP Input Area */}
                        {isOtpSent && (
                          <Box sx={{ mb: 1.2, p: 1, bgcolor: brandSoftBg, borderRadius: '6px', border: `1px solid ${brandBorder}` }}>
                            {/* Demo Mode OTP Callout */}
                            {activeDemoOtp && (
                              <Box
                                sx={{
                                  mb: 1,
                                  p: 1,
                                  bgcolor: 'background.paper',
                                  borderRadius: '6px',
                                  border: '1.5px dashed #0A5CC4',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 1
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <KeyRound size={16} color="#0A5CC4" />
                                  <Box>
                                    <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                                      Demo Verification OTP
                                    </Typography>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 900, color: 'text.primary', letterSpacing: '2px', fontFamily: 'monospace', lineHeight: 1.1 }}>
                                      {activeDemoOtp}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => {
                                    setOtpCode(activeDemoOtp);
                                    toast.success('Demo OTP auto-filled');
                                  }}
                                  sx={{
                                    bgcolor: brandPrimary,
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    textTransform: 'none',
                                    borderRadius: '4px',
                                    py: 0.3,
                                    px: 1,
                                    boxShadow: 'none',
                                    height: '26px'
                                  }}
                                >
                                  Auto Fill
                                </Button>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '11px' }}>
                                Enter 6-digit WhatsApp OTP
                              </Typography>
                              {expiryRemaining > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
                                  <Clock size={11} />
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
                                  borderRadius: '6px',
                                  bgcolor: 'background.paper',
                                  fontSize: '15px',
                                  fontWeight: 800,
                                  letterSpacing: '3px',
                                  height: '38px',
                                  '& input': { textAlign: 'center' }
                                }
                              }}
                            />
                          </Box>
                        )}

                        {/* Password Field */}
                        <Box sx={{ mb: 1.4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Create Password
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="At least 6 characters"
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
                                  <IconButton size="small" onClick={() => setShowRegisterPassword(!showRegisterPassword)} sx={{ p: 0.5 }}>
                                    {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: {
                                borderRadius: '6px',
                                bgcolor: 'background.paper',
                                fontSize: '12.5px',
                                height: '38px'
                              }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Password must contain a minimum of 6 characters.
                          </FormHelperText>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleVerifyRegisterOtp}
                          disabled={isLoading || (!isOtpSent && !otpCode) || otpCode.length !== 6 || !registerPassword || registerPassword.length < 6}
                          sx={{
                            bgcolor: brandPrimary,
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            height: '38px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: brandHover }
                          }}
                        >
                          {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Continue'}
                        </Button>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 2: USER BASIC DETAILS */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 2 && !isTech && (
                      <Box component="form" onSubmit={handleUserStep2Continue}>
                        <Box sx={{ mb: 1.2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
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
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Your full name for service booking and doorstep technician visits.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
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
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          >
                            {SALEM_LOCALITIES.map((loc) => (
                              <MenuItem key={loc} value={loc} sx={{ fontSize: '12.5px' }}>
                                {loc}
                              </MenuItem>
                            ))}
                          </TextField>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Your neighborhood in Salem for faster technician arrival.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Referral Code (Optional)
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="SALEM100"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            InputProps={{
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Enter referral code if you were invited by a friend.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => setRegisterStep(1)}
                            startIcon={<ArrowLeft size={14} />}
                            sx={{
                              borderColor: 'divider',
                              color: 'text.secondary',
                              height: '38px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '12px',
                              textTransform: 'none',
                              px: 1.5,
                              '&:hover': { bgcolor: 'background.default' }
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!fullName.trim()}
                            sx={{
                              bgcolor: brandPrimary,
                              color: '#FFFFFF',
                              height: '38px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '12.5px',
                              textTransform: 'none',
                              '&:hover': { bgcolor: brandHover }
                            }}
                          >
                            Continue
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 2: PARTNER BUSINESS DETAILS */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 2 && isTech && (
                      <Box component="form" onSubmit={handlePartnerStep2Continue}>
                        <Box sx={{ mb: 1.1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Full Name (as per official ID)
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="e.g. S. Venkatesh"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <User size={15} color="#64748B" />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Your legal name matching official documents.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Primary Trade Specialty
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={trade}
                            onChange={(e) => setTrade(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Briefcase size={15} color="#64748B" />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          >
                            {AVAILABLE_TRADES.map((t) => (
                              <MenuItem key={t.id} value={t.id} sx={{ fontSize: '12.5px' }}>
                                {t.name}
                              </MenuItem>
                            ))}
                          </TextField>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Primary skill category used to dispatch customer orders.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Years of Experience
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            InputProps={{
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          >
                            {EXPERIENCE_OPTIONS.map((exp) => (
                              <MenuItem key={exp.value} value={exp.value} sx={{ fontSize: '12.5px' }}>
                                {exp.label}
                              </MenuItem>
                            ))}
                          </TextField>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Hands-on trade experience in Salem and surrounding areas.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.4, fontSize: '11px' }}>
                            Salem Service Coverage Areas
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                            {SALEM_LOCALITIES.slice(0, 6).map((loc) => {
                              const isChecked = partnerLocalities.includes(loc);
                              return (
                                <Chip
                                  key={loc}
                                  label={loc.replace(', Salem', '')}
                                  size="small"
                                  onClick={() => {
                                    if (isChecked) {
                                      if (partnerLocalities.length > 1) {
                                        setPartnerLocalities(partnerLocalities.filter((item) => item !== loc));
                                      }
                                    } else {
                                      setPartnerLocalities([...partnerLocalities, loc]);
                                    }
                                  }}
                                  icon={isChecked ? <Check size={12} color="#0A5CC4" /> : undefined}
                                  sx={{
                                    fontSize: '11px',
                                    fontWeight: isChecked ? 700 : 500,
                                    bgcolor: isChecked ? 'rgba(10, 92, 196, 0.1)' : 'background.default',
                                    color: isChecked ? 'primary.main' : 'text.primary',
                                    border: isChecked ? '1px solid #0A5CC4' : '1px solid',
                                    borderColor: isChecked ? 'primary.main' : 'divider',
                                    borderRadius: '4px',
                                    height: '26px',
                                    cursor: 'pointer'
                                  }}
                                />
                              );
                            })}
                          </Box>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '4px 0 0' }}>
                            Localities in Salem where you can travel for doorstep jobs.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => setRegisterStep(1)}
                            startIcon={<ArrowLeft size={14} />}
                            sx={{
                              borderColor: 'divider',
                              color: 'text.secondary',
                              height: '38px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '12px',
                              textTransform: 'none',
                              px: 1.5,
                              '&:hover': { bgcolor: 'background.default' }
                            }}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={!fullName.trim()}
                            sx={{
                              bgcolor: brandPrimary,
                              color: '#FFFFFF',
                              height: '38px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '12.5px',
                              textTransform: 'none',
                              '&:hover': { bgcolor: brandHover }
                            }}
                          >
                            Continue
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 3: USER PREFERENCES (SKIPPABLE) */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 3 && !isTech && (
                      <Box>
                        <Box sx={{ mb: 1.3 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.4, fontSize: '11px' }}>
                            What services do you need most?
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {USER_SERVICE_PREFERENCES.map((pref) => {
                              const isChecked = userPreferences.includes(pref.id);
                              return (
                                <Chip
                                  key={pref.id}
                                  label={pref.label}
                                  size="small"
                                  onClick={() => {
                                    if (isChecked) {
                                      setUserPreferences(userPreferences.filter((p) => p !== pref.id));
                                    } else {
                                      setUserPreferences([...userPreferences, pref.id]);
                                    }
                                  }}
                                  icon={isChecked ? <Check size={12} color="#0A5CC4" /> : undefined}
                                  sx={{
                                    fontSize: '11.5px',
                                    fontWeight: isChecked ? 700 : 500,
                                    bgcolor: isChecked ? 'rgba(10, 92, 196, 0.1)' : 'background.default',
                                    color: isChecked ? 'primary.main' : 'text.primary',
                                    border: isChecked ? '1px solid #0A5CC4' : '1px solid',
                                    borderColor: isChecked ? 'primary.main' : 'divider',
                                    borderRadius: '6px',
                                    height: '28px',
                                    cursor: 'pointer'
                                  }}
                                />
                              );
                            })}
                          </Box>
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '4px 0 0' }}>
                            Pick services you are interested in. You can change this anytime from your profile.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.4, fontSize: '11px' }}>
                            Booking Updates Channel
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant={notificationChannel === 'whatsapp' ? 'contained' : 'outlined'}
                              onClick={() => setNotificationChannel('whatsapp')}
                              sx={{
                                flex: 1,
                                height: '34px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textTransform: 'none',
                                bgcolor: notificationChannel === 'whatsapp' ? brandPrimary : 'transparent',
                                color: notificationChannel === 'whatsapp' ? '#FFFFFF' : 'text.primary',
                                borderColor: 'divider'
                              }}
                            >
                              WhatsApp (Recommended)
                            </Button>
                            <Button
                              size="small"
                              variant={notificationChannel === 'sms' ? 'contained' : 'outlined'}
                              onClick={() => setNotificationChannel('sms')}
                              sx={{
                                flex: 1,
                                height: '34px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textTransform: 'none',
                                bgcolor: notificationChannel === 'sms' ? brandPrimary : 'transparent',
                                color: notificationChannel === 'sms' ? '#FFFFFF' : 'text.primary',
                                borderColor: 'divider'
                              }}
                            >
                              SMS Notifications
                            </Button>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setRegisterStep(2)}
                              startIcon={<ArrowLeft size={14} />}
                              sx={{
                                borderColor: 'divider',
                                color: 'text.secondary',
                                height: '38px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '12px',
                                textTransform: 'none',
                                px: 1.5,
                                '&:hover': { bgcolor: 'background.default' }
                              }}
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              fullWidth
                              variant="contained"
                              disabled={isLoading}
                              onClick={() => handleCompleteUserRegistration(false)}
                              sx={{
                                bgcolor: brandPrimary,
                                color: '#FFFFFF',
                                height: '38px',
                                borderRadius: '6px',
                                fontWeight: 800,
                                fontSize: '12.5px',
                                textTransform: 'none',
                                '&:hover': { bgcolor: brandHover }
                              }}
                            >
                              {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Continue'}
                            </Button>
                          </Box>

                          <Button
                            type="button"
                            variant="text"
                            disabled={isLoading}
                            onClick={() => handleCompleteUserRegistration(true)}
                            sx={{
                              color: 'text.secondary',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textTransform: 'none',
                              py: 0.3,
                              '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                            }}
                          >
                            Skip for now
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 3: PARTNER VERIFICATION DOCUMENTS (SKIPPABLE) */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 3 && isTech && (
                      <Box>
                        <Box sx={{ mb: 1.2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            Aadhaar Card Number
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="12-digit Aadhaar number"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ShieldCheck size={15} color="#64748B" />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Required to activate your verified partner badge.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3, fontSize: '11px' }}>
                            UPI ID or Payout Mobile
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="e.g. 9842711234@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            InputProps={{
                              sx: { borderRadius: '6px', bgcolor: 'background.paper', fontSize: '12.5px', height: '38px' }
                            }}
                          />
                          <FormHelperText sx={{ fontSize: '10.5px', color: 'text.secondary', m: '3px 0 0' }}>
                            Direct UPI or mobile number where daily 98% earnings are deposited.
                          </FormHelperText>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setRegisterStep(2)}
                              startIcon={<ArrowLeft size={14} />}
                              sx={{
                                borderColor: 'divider',
                                color: 'text.secondary',
                                height: '38px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '12px',
                                textTransform: 'none',
                                px: 1.5,
                                '&:hover': { bgcolor: 'background.default' }
                              }}
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              fullWidth
                              variant="contained"
                              disabled={isLoading}
                              onClick={() => handleCompletePartnerRegistration(false)}
                              sx={{
                                bgcolor: brandPrimary,
                                color: '#FFFFFF',
                                height: '38px',
                                borderRadius: '6px',
                                fontWeight: 800,
                                fontSize: '12.5px',
                                textTransform: 'none',
                                '&:hover': { bgcolor: brandHover }
                              }}
                            >
                              {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Submit Application'}
                            </Button>
                          </Box>

                          <Button
                            type="button"
                            variant="text"
                            disabled={isLoading}
                            onClick={() => handleCompletePartnerRegistration(true)}
                            sx={{
                              color: 'text.secondary',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              textTransform: 'none',
                              py: 0.3,
                              '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                            }}
                          >
                            Skip document upload for now
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 4: USER DONE (SUCCESS & ACTION) */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 4 && !isTech && (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: 'rgba(43, 146, 54, 0.12)',
                            color: 'secondary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          <CheckCircle2 size={26} />
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '15px', mb: 0.4 }}>
                          Welcome to Shazu One, {fullName || 'Customer'}!
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.4, mb: 1.5 }}>
                          Your customer account is ready. 100 welcome credits have been deposited into your wallet.
                        </Typography>

                        <Paper
                          elevation={0}
                          sx={{
                            p: '8px',
                            borderRadius: '6px',
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 1.5,
                            textAlign: 'left'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>Mobile Number:</Typography>
                            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: 'text.primary' }}>+91 {phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>Locality:</Typography>
                            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: 'text.primary' }}>{locality}</Typography>
                          </Box>
                        </Paper>

                        {passkeySupported && (
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleEnablePasskey}
                            disabled={isLoading}
                            startIcon={<Fingerprint size={15} />}
                            sx={{
                              mb: 1,
                              height: '36px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              textTransform: 'none',
                              borderColor: 'divider',
                              color: 'text.primary'
                            }}
                          >
                            Enable 1-Tap Biometric Sign In
                          </Button>
                        )}

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            isNewRegistrationRef.current = false;
                            navigate('/', { replace: true });
                          }}
                          endIcon={<ArrowRight size={15} />}
                          sx={{
                            bgcolor: brandPrimary,
                            color: '#FFFFFF',
                            height: '38px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: brandHover }
                          }}
                        >
                          Explore Services in Salem
                        </Button>
                      </Box>
                    )}

                    {/* ------------------------------------------------------------- */}
                    {/* STEP 4: PARTNER DONE (UNDER REVIEW & ACTION) */}
                    {/* ------------------------------------------------------------- */}
                    {registerStep === 4 && isTech && (
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            bgcolor: 'rgba(10, 92, 196, 0.12)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          <Clock size={24} />
                        </Box>

                        <Chip
                          label="Application Submitted - Under Review"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(217, 119, 6, 0.1)',
                            color: '#D97706',
                            fontWeight: 700,
                            fontSize: '11px',
                            height: '22px',
                            borderRadius: '4px',
                            mb: 0.8
                          }}
                        />

                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '15px', mb: 0.4 }}>
                          Partner Application Registered
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.4, mb: 1.5 }}>
                          Thank you, {fullName || 'Partner'}! Your partner profile has been registered and is under verification by our Salem operations desk (usually within 2 hours). You can access your Partner Console now to explore available tools and duty radar.
                        </Typography>

                        <Paper
                          elevation={0}
                          sx={{
                            p: '8px',
                            borderRadius: '6px',
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 1.5,
                            textAlign: 'left'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>Mobile Number:</Typography>
                            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: 'text.primary' }}>+91 {phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>Primary Trade:</Typography>
                            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: 'text.primary' }}>
                              {AVAILABLE_TRADES.find((t) => t.id === trade)?.name || trade}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: '11.5px', color: 'text.secondary' }}>Verification Status:</Typography>
                            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#D97706' }}>
                              Under Review (Max 2h)
                            </Typography>
                          </Box>
                        </Paper>

                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            isNewRegistrationRef.current = false;
                            navigate('/partner', { replace: true });
                          }}
                          endIcon={<ArrowRight size={15} />}
                          sx={{
                            bgcolor: brandPrimary,
                            color: '#FFFFFF',
                            height: '38px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: brandHover }
                          }}
                        >
                          Go to Partner Console
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
                        if (forgotStep === 2) {
                          setForgotStep(1);
                        } else {
                          setAuthMode('login');
                        }
                        setErrorMessage('');
                      }}
                      startIcon={<ArrowLeft size={13} />}
                      sx={{ color: '#64748B', fontSize: '11px', textTransform: 'none', mb: 1, p: 0 }}
                    >
                      {forgotStep === 2 ? 'Back to Mobile Number' : 'Back to Sign In'}
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
                        {/* Demo Mode Reset OTP Callout */}
                        {activeForgotDemoOtp && (
                          <Box
                            sx={{
                              mb: 1.5,
                              p: 1.25,
                              bgcolor: '#EFF6FF',
                              borderRadius: '9px',
                              border: '1.5px dashed #3B82F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <KeyRound size={16} color="#2563EB" />
                              <Box>
                                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Demo Reset Code
                                </Typography>
                                <Typography sx={{ fontSize: '16px', fontWeight: 900, color: '#1E3A8A', letterSpacing: '2.5px', fontFamily: 'monospace', lineHeight: 1.1 }}>
                                  {activeForgotDemoOtp}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                setForgotOtp(activeForgotDemoOtp);
                                toast.success('Demo reset OTP auto-filled');
                              }}
                              sx={{
                                bgcolor: '#2563EB',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'none',
                                borderRadius: '6px',
                                py: 0.4,
                                px: 1.2,
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#1D4ED8' }
                              }}
                            >
                              Auto Fill
                            </Button>
                          </Box>
                        )}

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

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => setForgotStep(1)}
                            startIcon={<ArrowLeft size={15} />}
                            sx={{
                              borderColor: '#CBD5E1',
                              color: '#475569',
                              height: '38px',
                              borderRadius: '9px',
                              fontWeight: 700,
                              fontSize: '12px',
                              textTransform: 'none',
                              px: 1.5,
                              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
                            }}
                          >
                            Back
                          </Button>

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
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Footer Navigation & Help Button */}
          {viewMode === 'auth' && (
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
          )}
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
    </Box>
  );
}
