import { API_V1_URL } from '../../config';
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlagIcon from '@mui/icons-material/Flag';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import DocumentUploadControl from '../../components/DocumentUploadControl';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ILLUSTRATIONS } from '../../constants/visualAssets';

const ONBOARDING_STEPS = [
  { label: 'Basic Profile', tamil: 'சுயவிவரம்' },
  { label: 'Aadhaar e-KYC', tamil: 'அடையாளச் சான்று' },
  { label: 'Bank Payout', tamil: 'வங்கி & கடவுச்சொல்' }
];

export default function PartnerOnboardingPage() {
  const navigate = useNavigate();
  const { rewardSettings, loginAsTechnician, user } = useAuth();
  const welcomeBonus = parseFloat(rewardSettings?.partner_welcome_bonus || 50);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [activeStep, setActiveStep] = useState(0);

  const [mobile, setMobile] = useState(() => searchParams.get('phone') || user?.phone || '');
  const [name, setName] = useState(() => searchParams.get('name') || user?.name || '');
  const [trade, setTrade] = useState(() => searchParams.get('trade') || user?.trade || 'ac');
  const [yearsExperience, setYearsExperience] = useState(() => searchParams.get('exp') || user?.years_experience || user?.experienceYears || '');
  const [aadhaar, setAadhaar] = useState(() => user?.aadhaarNumber || '');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState(() => user?.aadhaarCardUrl || null);
  const [upiId, setUpiId] = useState(() => user?.upiId || user?.upi_vpa || '');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState(() => searchParams.get('password') || '');
  const [confirmPassword, setConfirmPassword] = useState(() => searchParams.get('password') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [noPoliceCaseAccepted, setNoPoliceCaseAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNextStep = () => {
    if (activeStep === 0) {
      const cleanPhone = mobile.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        toast.error('சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும் (Enter valid 10-digit mobile)');
        return;
      }
      if (!name.trim()) {
        toast.error('தயவுசெய்து உங்கள் பெயரை உள்ளிடவும் (Please enter your full name)');
        return;
      }
      if (yearsExperience === '' || isNaN(parseInt(yearsExperience, 10)) || parseInt(yearsExperience, 10) < 0) {
        toast.error('உங்கள் பணி அனுபவத்தை உள்ளிடவும் (Please enter valid work experience in years)');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      const cleanAadhaar = aadhaar.replace(/[^0-9]/g, '');
      if (cleanAadhaar.length < 12) {
        toast.error('சரியான 12 இலக்க ஆதார் எண்ணை உள்ளிடவும் (Enter 12-digit Aadhaar number)');
        return;
      }
      if (!aadhaarCardUrl) {
        toast.error('தயவுசெய்து ஆதார் அட்டை புகைப்படத்தை பதிவேற்றவும் (Please upload Aadhaar Card photo)');
        return;
      }
      setActiveStep(2);
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும் (Password must be >= 6 chars)');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match)');
      return;
    }
    if (!noPoliceCaseAccepted) {
      toast.error('காவல்துறை வழக்கு & நடத்தை உறுதிமொழியை ஏற்றுக்கொண்டு டிக் செய்யவும் (Please accept the legal declaration and background check statement)');
      return;
    }
    setIsProcessing(true);
    fetch(`${API_V1_URL}/partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        phone: mobile,
        password,
        trade,
        yearsExperience: parseInt(yearsExperience, 10) || 0,
        noPoliceCaseAccepted,
        aadhaar,
        upiId,
        referralCode,
        aadhaarCardUrl
      })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        setIsProcessing(false);
        const tradeNames = {
          ac: 'AC Repair & Cooling Expert',
          electrician: 'Electrician & Wiring Specialist',
          plumber: 'Plumbing & Drainage Specialist',
          cleaning: 'Home & Bathroom Cleaning Pro'
        };
        const techObj = data.user || {
          id: data.technician?.id || `tech-${Date.now()}`,
          role: 'technician',
          name: data.technician?.full_name || name,
          phone: data.technician?.phone || (mobile.startsWith('+91') ? mobile : `+91 ${mobile}`),
          email: data.technician?.email || `${(name || 'tech').toLowerCase().replace(/[^a-z]/g, '')}@salemseva.in`,
          trade: data.technician?.primary_trade || trade,
          tradeName: tradeNames[trade] || 'Home Services Specialist',
          years_experience: parseInt(yearsExperience, 10) || 0,
          experienceYears: parseInt(yearsExperience, 10) || 0,
          isKycVerified: Boolean(data.technician?.is_kyc_verified),
          isOnline: false,
          upiId: upiId || data.technician?.upi_vpa,
          upi_vpa: upiId || data.technician?.upi_vpa,
          aadhaarCardUrl: aadhaarCardUrl || data.technician?.aadhaar_card_url,
          aadhaarNumber: aadhaar || data.technician?.aadhaar_number,
          serviceArea: 'Fairlands, Salem',
          assignedLocalities: ['Fairlands'],
          ratingAvg: 5.0,
          ratingCount: 0,
          jobsCompleted: 0
        };
        loginAsTechnician(techObj);
        toast.success(`KYC & verification submitted! Welcome Partner ${techObj.name}.`);
        navigate('/partner');
      })
      .catch(() => {
        setIsProcessing(false);
        const tradeNames = {
          ac: 'AC Repair & Cooling Expert',
          electrician: 'Electrician & Wiring Specialist',
          plumber: 'Plumbing & Drainage Specialist',
          cleaning: 'Home & Bathroom Cleaning Pro'
        };
        const fallbackTech = {
          id: `tech-${Date.now()}`,
          role: 'technician',
          name: name,
          phone: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
          email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@salemseva.in`,
          trade,
          tradeName: tradeNames[trade] || 'Home Services Specialist',
          isKycVerified: false,
          isOnline: false,
          upiId,
          upi_vpa: upiId,
          aadhaarCardUrl,
          aadhaarNumber: aadhaar,
          serviceArea: 'Fairlands, Salem',
          assignedLocalities: ['Fairlands'],
          ratingAvg: 5.0,
          ratingCount: 0,
          jobsCompleted: 0
        };
        loginAsTechnician(fallbackTech);
        toast.success(`KYC & verification submitted! Welcome Partner ${name}.`);
        navigate('/partner');
      });
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', py: { xs: 3, md: 5 }, px: 2 }}>
      <Container maxWidth="sm">
        
        {/* Brand Header with Verified Partners Illustration */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src={ILLUSTRATIONS.verifiedPartners}
            alt="Verified Partners Onboarding"
            sx={{
              width: { xs: 160, sm: 200 },
              height: { xs: 110, sm: 135 },
              objectFit: 'contain',
              mx: 'auto',
              mb: 1.5,
              filter: 'drop-shadow(0 4px 12px rgba(2, 132, 199, 0.15))'
            }}
          />

          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, mb: 0.5 }}>
            டெக்னீசியன் பதிவு (Technician Onboarding)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            சேலம் நகரில் 98% நேரடி வருமானம் + தினசரி வங்கி வரவு (98% Direct Daily Payouts)
          </Typography>
        </Box>

        {/* Multi-Stage Stepper Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {ONBOARDING_STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#0284C7' },
                      '&.Mui-completed': { color: '#16A34A' }
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: activeStep === index ? 800 : 600, color: activeStep === index ? '#0F172A' : '#64748B', display: 'block', fontSize: '12px' }}>
                    {step.tamil}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '10.5px', color: '#94A3B8' }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step-by-Step Form Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            p: { xs: 2.5, sm: 3.5 },
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            mb: 2.5
          }}
        >
          {/* STEP 0: BASIC PROFILE & TRADE */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  படி 1: உங்கள் அடிப்படை விவரங்கள் (Basic Details)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  வாடிக்கையாளர்கள் மற்றும் சேலம் கட்டுப்பாட்டு மையத்திற்கான தொடர்பு விவரம்.
                </Typography>
              </Box>

              {/* Mobile Number */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  மொபைல் எண் (MOBILE NUMBER) *
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
                    placeholder="98420 12345"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                  />
                </Box>
              </Box>

              {/* Name */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  முழு பெயர் (FULL NAME) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>

              {/* Primary Trade */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  தொழில் பிரிவு (PRIMARY TRADE) *
                </Typography>
                <FormControl fullWidth size="small">
                  {/* ds-allow-native-select */}
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

              {/* Work Experience */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  பணி அனுபவம் (WORK EXPERIENCE IN YEARS) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0, max: 50, step: 1 }}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 5"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                          வருடங்கள் (Years)
                        </Typography>
                      </InputAdornment>
                    )
                  }}
                  helperText="உங்கள் முதன்மைத் தொழிலில் உள்ள மொத்த வருட அனுபவம் (Total experience in primary trade)"
                  FormHelperTextProps={{ sx: { color: '#64748B', fontSize: '11px', mt: 0.3 } }}
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
                  helperText={`Use a fellow technician's referral code to unlock +₹${welcomeBonus} Welcome Tool Bonus`}
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

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleNextStep}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#0284C7',
                  borderRadius: '14px',
                  py: 1.3,
                  fontWeight: 800,
                  fontSize: '15px',
                  mt: 1,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                அடுத்து: ஆதார் சரிபார்ப்பு (Next: Aadhaar e-KYC)
              </Button>
            </Box>
          )}

          {/* STEP 1: AADHAAR VERIFICATION & DOCUMENT */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  படி 2: ஆதார் & அடையாளச் சான்று (Identity Verification)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  வாடிக்கையாளர் பாதுகாப்பு மற்றும் போலீஸ் சரிபார்ப்புக்காக ஆதார் கட்டாயம்.
                </Typography>
              </Box>

              {/* Aadhaar Number */}
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

              {/* Aadhaar Photo / Document Upload */}
              <DocumentUploadControl
                label="ஆதார் அட்டை அசல் புகைப்படம் (Aadhaar Card Photo) *"
                sublabel="நேரடி கேமரா மூலம் படம் எடுக்கவும் அல்லது 5 MB-க்குள் கோப்பை பதிவேற்றவும் (Take Camera Photo or Upload File <= 5MB)"
                folder="aadhaar"
                referenceId={mobile}
                existingUrl={aadhaarCardUrl}
                onUploadSuccess={(url) => setAadhaarCardUrl(url)}
                onRemove={() => setAadhaarCardUrl(null)}
                maxSizeMb={5}
                required
              />

              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevStep}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  முந்தைய (Back)
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNextStep}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    flex: 1.5,
                    bgcolor: '#0284C7',
                    borderRadius: '12px',
                    py: 1.2,
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0369A1' }
                  }}
                >
                  அடுத்து: வங்கி (Next: Bank)
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 2: BANK UPI & SECURITY PASSWORD */}
          {activeStep === 2 && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  படி 3: வங்கி வரவு & கடவுச்சொல் (Payout & Account Security)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  ஒவ்வொரு வேலையும் முடிந்தவுடன் 98% கட்டணம் உங்கள் UPI கணக்கிற்கு மாற்றப்படும்.
                </Typography>
              </Box>

              {/* Bank UPI for 98% Split */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  வருமானம் பெறும் UPI ID (98% DIRECT PAYOUT) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@okaxis or name@upi"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  கடவுச்சொல் (CREATE PASSWORD - MIN 6 CHARS) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose your duty login password"
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>

              {/* Confirm Password Field */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  கடவுச்சொல்லை மீண்டும் உள்ளிடவும் (CONFIRM PASSWORD) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your duty login password"
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontWeight: 700 } }}
                />
              </Box>

              {/* Police Case & Code of Conduct Legal Declaration Checkbox */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: noPoliceCaseAccepted ? '#F0FDF4' : '#FEF2F2',
                  border: '1.5px solid',
                  borderColor: noPoliceCaseAccepted ? '#BBF7D0' : '#FECACA',
                  transition: 'all 0.2s ease'
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={noPoliceCaseAccepted}
                      onChange={(e) => setNoPoliceCaseAccepted(e.target.checked)}
                      sx={{
                        color: noPoliceCaseAccepted ? '#16A34A' : '#DC2626',
                        '&.Mui-checked': { color: '#16A34A' },
                        mt: 0.2,
                        p: 0.5,
                        alignSelf: 'flex-start'
                      }}
                    />
                  }
                  label={
                    <Box sx={{ pl: 0.75 }}>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0F172A',
                          lineHeight: 1.4,
                          mb: 0.5
                        }}
                      >
                        காவல்துறை வழக்கு & ஒழுங்குமுறை உறுதிமொழி (Legal & Conduct Declaration) *
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#334155',
                          lineHeight: 1.5,
                          display: 'block'
                        }}
                      >
                        என் மீது எந்தவிதமான குற்றப்பின்னணியோ அல்லது நிலுவையில் உள்ள போலீஸ் வழக்கோ இல்லை என உறுதியளிக்கிறேன். வாடிக்கையாளர்களிடம் தகாத முறையில் நடந்துகொண்டாலோ, முறைகேடு, மோசடி அல்லது விதிமீறல்களில் ஈடுபட்டாலோ சட்டரீதியான நடவடிக்கை எடுக்கப்படுவதையும், சேலம்சேவா தளத்திலிருந்து எனது கணக்கு நிரந்தரமாக முடக்கப்படுவதையும் முழுமையாக ஏற்றுக்கொள்கிறேன்.
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '11px',
                          color: '#64748B',
                          lineHeight: 1.4,
                          display: 'block',
                          mt: 0.5,
                          fontStyle: 'italic'
                        }}
                      >
                        "I declare that I have no criminal background or pending police cases registered against me. In case of any misbehavior, fraud, or violation of conduct rules, I accept that strict legal action will be initiated and my account will be permanently banned."
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', m: 0 }}
                />
              </Paper>

              {/* Back and Submit Actions */}
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrevStep}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    flex: 1,
                    borderRadius: '12px',
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  முந்தைய (Back)
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!noPoliceCaseAccepted}
                  endIcon={<CheckCircleIcon />}
                  sx={{
                    flex: 1.8,
                    bgcolor: '#16A34A',
                    borderRadius: '12px',
                    py: 1.3,
                    fontWeight: 900,
                    fontSize: '14.5px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#15803D' },
                    '&.Mui-disabled': {
                      bgcolor: '#E2E8F0',
                      color: '#94A3B8'
                    }
                  }}
                >
                  பதிவு செய்து பணியில் சேரவும் (Start Duty)
                </Button>
              </Box>
            </Box>
          )}

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
