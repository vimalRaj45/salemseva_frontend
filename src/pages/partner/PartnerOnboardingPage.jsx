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
  Chip,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlagIcon from '@mui/icons-material/Flag';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import DocumentUploadControl from '../../components/DocumentUploadControl';

export default function PartnerOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [mobile, setMobile] = useState(() => searchParams.get('phone') || '94432 88901');
  const [name, setName] = useState(() => searchParams.get('name') || 'K. Ramesh');
  const [trade, setTrade] = useState(() => searchParams.get('trade') || 'ac');
  const [aadhaar, setAadhaar] = useState('9842 7112 4921');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState(null);
  const [upiId, setUpiId] = useState('ramesh.tech@oksbi');
  const [referralCode, setReferralCode] = useState('TECHRAMESH');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    fetch('https://salemseva-backend.onrender.com/api/v1/partner/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        phone: mobile,
        trade,
        aadhaar,
        upiId,
        referralCode,
        aadhaarCardUrl
      })
    })
      .then(() => {
        setTimeout(() => {
          setIsProcessing(false);
          navigate('/partner');
        }, 1200);
      })
      .catch(() => {
        setIsProcessing(false);
        navigate('/partner');
      });
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
              mb: 1.8,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
            }}
          >
            <EngineeringIcon sx={{ fontSize: 38 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, mb: 0.5 }}>
            டெக்னீசியன் பதிவு (Technician Onboarding)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            சேலம் நகரில் 85% நேரடி வருமானம் + வாராந்திர வங்கி வரவு
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
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Mobile Number */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                மொபைல் எண் (MOBILE NUMBER)
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
                    fontSize: '13.5px',
                    color: '#0F172A',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <FlagIcon sx={{ fontSize: 16, color: '#EA580C' }} /> +91
                </Paper>
                <TextField
                  fullWidth
                  size="small"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>
            </Box>

            {/* Name */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                முழு பெயர் (FULL NAME)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
            </Box>

            {/* Primary Trade */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                தொழில் பிரிவு (PRIMARY TRADE)
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  <MenuItem value="ac">AC Repair & HVAC Specialist (7+ Yrs)</MenuItem>
                  <MenuItem value="electrician">Master Electrician & Wiring</MenuItem>
                  <MenuItem value="plumber">Plumbing & Drainage Expert</MenuItem>
                  <MenuItem value="cleaning">Deep Cleaning & Sanitization</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Aadhaar e-KYC Verification & Document Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  ஆதார் எண் (12-DIGIT AADHAAR NUMBER) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="e.g. 9842 7112 4921"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>

              {/* Aadhaar Photo / Document Upload with 5MB Cap & Camera Option */}
              <DocumentUploadControl
                label="ஆதார் அட்டை அசல் புகைப்படம் (Aadhaar Card Photo)"
                sublabel="நேரடி கேமரா மூலம் படம் எடுக்கவும் அல்லது 5 MB-க்குள் கோப்பை பதிவேற்றவும் (Take Camera Photo or Upload File <= 5MB)"
                folder="aadhaar"
                referenceId={mobile}
                existingUrl={aadhaarCardUrl}
                onUploadSuccess={(url) => setAadhaarCardUrl(url)}
                onRemove={() => setAadhaarCardUrl(null)}
                maxSizeMb={5}
                required
              />
            </Box>

            {/* Bank UPI for 85% Split */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                வருமானம் பெறும் UPI ID (85% DIRECT PAYOUT)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
              />
            </Box>

            {/* Technician Referral Code Field */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', display: 'block', mb: 0.6 }}>
                பரிந்துரை செய்த டெக்னீசியன் கோட் (REFERRAL CODE - OPTIONAL)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. TECHRAMESH"
                helperText="Use a fellow technician's referral code to unlock +₹100 Welcome Tool Bonus"
                FormHelperTextProps={{ sx: { color: '#059669', fontWeight: 600, fontSize: '11px', mt: 0.3 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontWeight: 700,
                    bgcolor: '#F0FDF4',
                    '& fieldset': { borderColor: '#BBF7D0' }
                  }
                }}
              />
            </Box>

            {/* Submit CTA */}
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
                fontWeight: 900,
                fontSize: '15px',
                mt: 1,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              பதிவு செய்து பணியில் சேரவும் (Start Duty)
            </Button>

          </Box>
        </Card>

      </Container>

      {/* Processing Backdrop */}
      <ProcessingBackdrop
        open={isProcessing}
        title="டிஜிலாக்கர் ஆதார் e-KYC சரிபார்க்கப்படுகிறது..."
        subtitle="சேலம் மத்திய பதிவு மற்றும் நேரடி வங்கி UPI சரிபார்ப்பு..."
        badge="DigiLocker Verified"
      />
    </Box>
  );
}
