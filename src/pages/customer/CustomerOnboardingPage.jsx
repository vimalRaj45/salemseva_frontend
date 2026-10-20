import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarsIcon from '@mui/icons-material/Stars';
import FlagIcon from '@mui/icons-material/Flag';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import ProcessingBackdrop from '../../components/ProcessingBackdrop';
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

export default function CustomerOnboardingPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { registerAccount } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referral, setReferral] = useState('SALEM100');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const cleanMobile = mobile.replace(/[\s\-\(\)\+]/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password');
      return;
    }

    setIsProcessing(true);
    try {
      const created = await registerAccount({
        name: name.trim(),
        phone: cleanMobile,
        password: password.trim(),
        role: 'customer',
        locality,
        referralCode: referral.trim()
      });
      if (onLoginSuccess) onLoginSuccess(created);
      setIsProcessing(false);
      navigate('/');
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Unable to complete sign up. Please try again.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, px: 2 }}>
      <Container maxWidth="xs">
        
        {/* Brand Logo & Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '20px',
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
            }}
          >
            <HomeRepairServiceIcon sx={{ fontSize: 34 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, mb: 0.5 }}>
            Create Customer Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            Verified Doorstep Home Services in Salem City
          </Typography>
        </Box>

        {/* Nano Banana Brand Illustration Banner */}
        <Box
          sx={{
            width: '100%',
            height: 150,
            borderRadius: '16px',
            overflow: 'hidden',
            mb: 2,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
          }}
        >
          <img
            src="/assets/illustrations/customer_booking.jpg"
            alt="Customer Doorstep Services"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>

        {/* Form Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            p: 3,
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            mb: 2.5
          }}
        >
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '12.5px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                FULL NAME
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Vimal Raj"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            {/* Mobile Number Field */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                MOBILE NUMBER
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#F1F5F9',
                    px: 1.5,
                    py: 1,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#0F172A',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <FlagIcon sx={{ fontSize: 16, color: '#EA580C' }} /> +91
                </Paper>
                <TextField
                  fullWidth
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '14px'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Locality */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                SALEM LOCALITY
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                {SALEM_LOCALITIES.map((loc) => (
                  <MenuItem key={loc} value={loc} sx={{ fontSize: '13px' }}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                CREATE PASSWORD (MIN 6 CHARACTERS)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            {/* Confirm Password */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                CONFIRM PASSWORD
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            {/* Referral Code Field */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.6, letterSpacing: 0.4 }}>
                REFERRAL CODE (OPTIONAL)
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  bgcolor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  mb: 0.5
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  value={referral}
                  onChange={(e) => setReferral(e.target.value.toUpperCase())}
                  sx={{ input: { fontWeight: 800, color: '#047857', letterSpacing: 1, fontSize: '13px' } }}
                />
                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, pl: 0.5 }}>
                <StarsIcon sx={{ color: '#059669', fontSize: 15 }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, fontSize: '11.5px' }}>
                  100 Seva Credits unlocked on first booking!
                </Typography>
              </Box>
            </Box>

            {/* Action Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#0284C7',
                borderRadius: '14px',
                py: 1.3,
                fontWeight: 800,
                fontSize: '14.5px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                textTransform: 'none',
                mt: 1,
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              Create Account & Proceed
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                Already registered with Shazu One?{' '}
                <Link to="/login" style={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>

          </Box>
        </Card>

      </Container>

      {/* Processing Backdrop */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Registering Profile & Credentials..."
        subtitle="Creating your Shazu One customer account in registry..."
        badge="Secure Authentication"
      />
    </Box>
  );
}
