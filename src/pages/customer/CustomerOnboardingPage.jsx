import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarsIcon from '@mui/icons-material/Stars';
import FlagIcon from '@mui/icons-material/Flag';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useAuth } from '../../context/AuthContext';

export default function CustomerOnboardingPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { signupCustomer } = useAuth();
  const [mobile, setMobile] = useState('98427 11234');
  const [referral, setReferral] = useState('SALEM100');
  const [referralValid, setReferralValid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await signupCustomer({
        name: 'Vimal Raj',
        phone: mobile,
        address: '42, 3rd Cross, Fairlands Main Road',
        locality: 'Fairlands, Salem',
        referralCode: referral
      });
      if (onLoginSuccess) onLoginSuccess({ mobile, referral });
      setIsProcessing(false);
      navigate('/');
    } catch (err) {
      setIsProcessing(false);
      navigate('/');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, px: 2 }}>
      <Container maxWidth="xs">
        
        {/* Brand Logo & Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '22px',
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
            }}
          >
            <HomeRepairServiceIcon sx={{ fontSize: 36 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, mb: 0.5 }}>
            SalemSeva Customer
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            Verified Local Experts Across Salem City
          </Typography>
        </Box>

        {/* Form Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            p: 2.5,
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            mb: 2.5
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            
            {/* Mobile Number Field */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.8, letterSpacing: 0.5 }}>
              MOBILE NUMBER
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1.2, mb: 2.5 }}>
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
                  fontSize: '14px',
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
                placeholder="Enter 10 digit number"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '15px'
                  }
                }}
              />
            </Box>

            {/* Referral Code Field */}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.8, letterSpacing: 0.5 }}>
              REFERRAL CODE (OPTIONAL)
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px',
                bgcolor: '#ECFDF5',
                border: '1.5px solid #10B981',
                mb: 1
              }}
            >
              <Typography sx={{ flex: 1, fontWeight: 800, color: '#047857', letterSpacing: 1, fontSize: '14px' }}>
                {referral}
              </Typography>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
            </Paper>

            {referralValid && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 2.5, pl: 0.5 }}>
                <StarsIcon sx={{ color: '#059669', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, fontSize: '12px' }}>
                  100 Seva Credits unlocked on your wallet!
                </Typography>
              </Box>
            )}

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
                fontSize: '15px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              Verify OTP & Get Started
            </Button>

          </Box>
        </Card>

      </Container>

      {/* Processing Backdrop */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Verifying Mobile OTP & Profile..."
        subtitle="Connecting with Salem City Customer Registry..."
        badge="Instant Login Verified"
      />
    </Box>
  );
}
