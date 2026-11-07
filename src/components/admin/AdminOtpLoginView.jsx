import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  InputAdornment
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useAuth } from '../../context/AuthContext';

/**
 * Domain:           dev-tool / ops console
 * Audience & tone:  expert, calm, precise
 * Mood:             precise
 * Motion depth:     subtle feedback
 * Layout family:    centered security card
 * Reference anchor: Enterprise Identity & Operations Console
 *
 * Primary authentication: Brevo Email OTP (single source of truth).
 * Emergency fallback: Admin Password override (enabled only when ENABLE_ADMIN_PASSWORD_LOGIN=true in .env).
 * Zero emoji rule strictly observed.
 */
export default function AdminOtpLoginView({ onLoginSuccess }) {
  const { requestAdminOtp, loginAdminWithOtp, fetchAdminConfig, loginAdminWithPassword } = useAuth();

  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [step, setStep] = useState('email'); // 'email' | 'otp' (when authMode === 'otp')
  const [email, setEmail] = useState('malikasaravanan774@gmail.com');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoginAllowed, setPasswordLoginAllowed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(600); // 10 minutes

  const timerRef = useRef(null);
  const otpInputRef = useRef(null);

  // Check backend .env configuration on mount
  useEffect(() => {
    let mounted = true;
    fetchAdminConfig().then((cfg) => {
      if (mounted && cfg && cfg.passwordLoginEnabled) {
        setPasswordLoginAllowed(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Passcode expiry timer
  useEffect(() => {
    if (authMode === 'otp' && step === 'otp' && expiresIn > 0) {
      timerRef.current = setTimeout(() => setExpiresIn((e) => e - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
  }, [authMode, step, expiresIn]);

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await requestAdminOtp(cleanEmail);
      setInfoMessage(`Verification passcode sent to ${cleanEmail}. Check your inbox.`);
      setStep('otp');
      setCooldown(res.cooldownSeconds || 30);
      setExpiresIn(res.expiresInSeconds || 600);
      setOtp('');
      setTimeout(() => {
        if (otpInputRef.current) otpInputRef.current.focus();
      }, 200);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginAdminWithOtp(email.trim().toLowerCase(), cleanOtp);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please re-check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter the administrator password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginAdminWithPassword(cleanEmail, cleanPassword);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Password authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0B132B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Card
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          bgcolor: '#1C2541',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Header Accent Bar */}
        <Box sx={{ height: 4, bgcolor: authMode === 'password' ? '#F59E0B' : '#1D6FE5' }} />

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Brand & Security Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: authMode === 'password' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(29, 111, 229, 0.15)',
                color: authMode === 'password' ? '#FBBF24' : '#38BDF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                border: '1px solid',
                borderColor: authMode === 'password' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(56, 189, 248, 0.3)'
              }}
            >
              {authMode === 'password' ? (
                <VpnKeyIcon sx={{ fontSize: 30 }} />
              ) : (
                <SecurityIcon sx={{ fontSize: 32 }} />
              )}
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#F8FAFC',
                letterSpacing: '-0.5px',
                fontSize: { xs: '20px', sm: '22px' }
              }}
            >
              Shazu One Central Operations
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.75 }}>
              <Chip
                label={authMode === 'password' ? 'Emergency Password Override' : 'Restricted Administrative Surface'}
                size="small"
                sx={{
                  bgcolor: authMode === 'password' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: authMode === 'password' ? '#FDE68A' : '#FCA5A5',
                  border: '1px solid',
                  borderColor: authMode === 'password' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: 22
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />

          {/* Feedback Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#FECACA',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-icon': { color: '#F87171' }
              }}
            >
              {error}
            </Alert>
          )}

          {infoMessage && (
            <Alert
              severity="info"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(29, 111, 229, 0.15)',
                color: '#BAE6FD',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                '& .MuiAlert-icon': { color: '#38BDF8' }
              }}
            >
              {infoMessage}
            </Alert>
          )}

          {/* EMERGENCY PASSWORD MODE */}
          {authMode === 'password' ? (
            <Box component="form" onSubmit={handlePasswordLogin}>
              <Alert
                severity="warning"
                sx={{
                  mb: 2.5,
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#FDE68A',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  '& .MuiAlert-icon': { color: '#FBBF24' }
                }}
              >
                Emergency Override Mode: Authenticate with the administrator password configured in backend environment.
              </Alert>

              <TextField
                fullWidth
                label="Administrator Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="ops.admin@shazuone.in"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: '#64748B', mr: 1 }} />
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#FBBF24' },
                    '&.Mui-focused fieldset': { borderColor: '#FBBF24' }
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#FBBF24' }
                }}
              />

              <TextField
                fullWidth
                label="Administrator Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter ADMIN_PASSWORD from .env"
                InputProps={{
                  startAdornment: <KeyIcon sx={{ color: '#64748B', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        sx={{ color: '#94A3B8' }}
                      >
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#FBBF24' },
                    '&.Mui-focused fieldset': { borderColor: '#FBBF24' }
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#FBBF24' }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !password.trim() || !email.trim()}
                sx={{
                  py: 1.25,
                  bgcolor: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: '#B45309' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748B' }
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Authenticate with Password'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  size="small"
                  onClick={() => {
                    setAuthMode('otp');
                    setError('');
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                  sx={{ color: '#38BDF8', textTransform: 'none', fontSize: '12px' }}
                >
                  Return to Email OTP Verification
                </Button>
              </Box>
            </Box>
          ) : step === 'email' ? (
            /* STEP 1: Enter Authorized Admin Email for OTP */
            <Box component="form" onSubmit={handleRequestOtp}>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, lineHeight: 1.5 }}>
                Enter your authorized administrator email address to receive a secure, 6-digit one-time passcode.
              </Typography>

              <TextField
                fullWidth
                label="Administrator Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="ops.admin@shazuone.in"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: '#64748B', mr: 1 }} />
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#38BDF8' },
                    '&.Mui-focused fieldset': { borderColor: '#38BDF8' }
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#38BDF8' }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || !email.trim()}
                sx={{
                  py: 1.25,
                  bgcolor: '#1D6FE5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: '#1557B0' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748B' }
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Verification Passcode'}
              </Button>

              {/* Emergency Password Login Trigger (Visible only when ENABLE_ADMIN_PASSWORD_LOGIN=true in .env) */}
              {passwordLoginAllowed && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setAuthMode('password');
                      setError('');
                      setInfoMessage('');
                    }}
                    startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#FBBF24',
                      textTransform: 'none',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Emergency Sign In with Password
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            /* STEP 2: Enter 6-digit OTP */
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Code sent to <strong style={{ color: '#F1F5F9' }}>{email}</strong>
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setInfoMessage('');
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                  sx={{ color: '#38BDF8', textTransform: 'none', fontSize: '12px', p: 0.5 }}
                >
                  Change
                </Button>
              </Box>

              <TextField
                fullWidth
                inputRef={otpInputRef}
                label="6-Digit Verification Code"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                disabled={loading}
                autoFocus
                placeholder="123456"
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '28px',
                    letterSpacing: '8px',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0F172A',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&:hover fieldset': { borderColor: '#38BDF8' },
                    '&.Mui-focused fieldset': { borderColor: '#38BDF8' }
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#38BDF8' }
                }}
              />

              {/* Countdown and Resend */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="caption" sx={{ color: expiresIn > 60 ? '#94A3B8' : '#F87171' }}>
                  Expires in {formatTime(expiresIn)}
                </Typography>

                <Button
                  size="small"
                  disabled={loading || cooldown > 0}
                  onClick={handleRequestOtp}
                  startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: cooldown > 0 ? '#64748B' : '#38BDF8',
                    textTransform: 'none',
                    fontSize: '12px'
                  }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </Button>
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading || otp.length !== 6}
                sx={{
                  py: 1.25,
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: '#15803D' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748B' }
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Access Console'}
              </Button>

              {/* Emergency Password Fallback if stuck on OTP */}
              {passwordLoginAllowed && (
                <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setAuthMode('password');
                      setError('');
                      setInfoMessage('');
                    }}
                    startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#FBBF24',
                      textTransform: 'none',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Stuck? Use Emergency Admin Password
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Security Notice Footer */}
          <Box
            sx={{
              mt: 3.5,
              pt: 2.5,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            <ShieldIcon sx={{ fontSize: 18, color: '#64748B', mt: 0.2 }} />
            <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.4 }}>
              Administrative authentication is governed by Brevo Transactional Email Service and server security policy. Access attempts are cryptographically verified and logged.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
