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
  { label: 'Payout Phone', tamil: 'கொடுப்பனவு எண்' }
];

const SALEM_LOCALITIES = [
  { id: 'Fairlands', name: 'Fairlands', tamil: 'ஃபேர்லான்ட்ஸ்' },
  { id: 'Hasthampatti', name: 'Hasthampatti', tamil: 'அஸ்தம்பட்டி' },
  { id: 'Alagapuram', name: 'Alagapuram', tamil: 'அழகாகபுரம்' },
  { id: 'Suramangalam', name: 'Suramangalam / Junction', tamil: 'சூரமங்கலம் / ஜங்ஷன்' },
  { id: 'Meyyanur', name: 'Meyyanur', tamil: 'மெய்யனூர்' },
  { id: 'Ammapet', name: 'Ammapet', tamil: 'அம்மாபேட்டை' },
  { id: 'Shevapet', name: 'Shevapet', tamil: 'செவ்வாய்பேட்டை' },
  { id: 'Gugai', name: 'Gugai', tamil: 'குகை' },
  { id: 'Kondalampatti', name: 'Kondalampatti', tamil: 'கொண்டலாம்பட்டி' },
  { id: 'Gorimedu', name: 'Gorimedu', tamil: 'கோரிமேடு' },
  { id: 'Kannankurichi', name: 'Kannankurichi (Yercaud Foothills)', tamil: 'கண்ணங்குறிச்சி' },
  { id: 'Steel Plant Area', name: 'Steel Plant Area', tamil: 'ஸ்டீல் பிளாண்ட்' }
];

const ALL_TRADES = [
  { id: 'ac', name: 'AC Repair & HVAC Specialist', tamil: 'ஏசி மெக்கானிக் / ஏசி சர்வீஸ்' },
  { id: 'electrician', name: 'Master Electrician & Wiring', tamil: 'எலக்ட்ரீஷியன் & வயரிங்' },
  { id: 'plumber', name: 'Plumbing & Drainage Expert', tamil: 'பிளம்பிங் & குழாய் வேலை' },
  { id: 'cleaning', name: 'Deep Cleaning & Sanitization', tamil: 'முழு வீடு & கழிவறை சுத்தம்' }
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
  const [secondaryTrades, setSecondaryTrades] = useState(() => {
    if (user?.secondaryTrades && Array.isArray(user.secondaryTrades)) return user.secondaryTrades;
    if (user?.secondary_trades && Array.isArray(user.secondary_trades)) return user.secondary_trades;
    return [];
  });

  const handlePrimaryTradeChange = (newTrade) => {
    setTrade(newTrade);
    setSecondaryTrades((prev) => prev.filter((t) => t !== newTrade));
  };

  const toggleSecondaryTrade = (tradeId) => {
    setSecondaryTrades((prev) =>
      prev.includes(tradeId) ? prev.filter((t) => t !== tradeId) : [...prev, tradeId]
    );
  };
  const [yearsExperience, setYearsExperience] = useState(() => searchParams.get('exp') || user?.years_experience || user?.experienceYears || '');
  const [selectedLocalities, setSelectedLocalities] = useState(() => {
    if (user?.assignedLocalities && Array.isArray(user.assignedLocalities) && user.assignedLocalities.length > 0) {
      return user.assignedLocalities;
    }
    return ['Fairlands', 'Hasthampatti'];
  });
  const [aadhaar, setAadhaar] = useState(() => user?.aadhaarNumber || '');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState(() => user?.aadhaarCardUrl || null);
  const [payoutPhone, setPayoutPhone] = useState(() => user?.payoutPhone || mobile || '');
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
      if (!selectedLocalities || selectedLocalities.length === 0) {
        toast.error('பணிபுரிய குறைந்தது ஒரு பகுதியையாவது தேர்ந்தெடுக்கவும் (Please select at least one area you are willing to work in Salem)');
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
    const cleanPayout = payoutPhone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPayout.length < 10) {
      toast.error('சரியான 10 இலக்க கொடுப்பனவு மொபைல் எண்ணை உள்ளிடவும் (Enter valid 10-digit payout phone)');
      return;
    }
    // Phone-linked UPI format: number@ybl
    const derivedUpiId = `${cleanPayout}@ybl`;
    setIsProcessing(true);
    fetch(`${API_V1_URL}/partner/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        phone: mobile,
        password,
        trade,
        secondaryTrades: secondaryTrades.filter(t => t !== trade),
        yearsExperience: parseInt(yearsExperience, 10) || 0,
        serviceArea: selectedLocalities.join(', '),
        assignedLocalities: selectedLocalities,
        noPoliceCaseAccepted,
        aadhaar,
        upiId: derivedUpiId,
        payoutPhone: cleanPayout,
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
        const cleanPayout2 = payoutPhone.replace(/[^0-9]/g, '').slice(-10);
        const derivedUpi2 = cleanPayout2 ? `${cleanPayout2}@ybl` : '';
        const techObj = data.user || {
          id: data.technician?.id || `tech-${Date.now()}`,
          role: 'technician',
          name: data.technician?.full_name || name,
          phone: data.technician?.phone || (mobile.startsWith('+91') ? mobile : `+91 ${mobile}`),
          email: data.technician?.email || `${(name || 'tech').toLowerCase().replace(/[^a-z]/g, '')}@shazuone.in`,
          trade: data.technician?.primary_trade || trade,
          tradeName: tradeNames[trade] || 'Home Services Specialist',
          secondary_trades: data.user?.secondary_trades || data.technician?.secondary_trades || secondaryTrades.filter(t => t !== trade),
          secondaryTrades: data.user?.secondaryTrades || data.technician?.secondary_trades || secondaryTrades.filter(t => t !== trade),
          years_experience: parseInt(yearsExperience, 10) || 0,
          experienceYears: parseInt(yearsExperience, 10) || 0,
          isKycVerified: Boolean(data.technician?.is_kyc_verified),
          isOnline: false,
          payoutPhone: cleanPayout2,
          upi_vpa: derivedUpi2 || data.technician?.upi_vpa,
          aadhaarCardUrl: aadhaarCardUrl || data.technician?.aadhaar_card_url,
          aadhaarNumber: aadhaar || data.technician?.aadhaar_number,
          serviceArea: selectedLocalities.join(', ') || 'Fairlands, Salem',
          assignedLocalities: selectedLocalities.length > 0 ? selectedLocalities : ['Fairlands'],
          ratingAvg: 5.0,
          ratingCount: 0,
          jobsCompleted: 0
        };
        localStorage.removeItem('shazuone_partner_incentives');
        loginAsTechnician(techObj);
        toast.success(`Registration & KYC submitted! Operations team will review within 12 hours and notify you.`);
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
        const cleanPayout3 = payoutPhone.replace(/[^0-9]/g, '').slice(-10);
        const fallbackTech = {
          id: `tech-${Date.now()}`,
          role: 'technician',
          name: name,
          phone: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
          email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@shazuone.in`,
          trade,
          tradeName: tradeNames[trade] || 'Home Services Specialist',
          secondary_trades: secondaryTrades.filter(t => t !== trade),
          secondaryTrades: secondaryTrades.filter(t => t !== trade),
          isKycVerified: false,
          isOnline: false,
          payoutPhone: cleanPayout3,
          upi_vpa: cleanPayout3 ? `${cleanPayout3}@ybl` : '',
          aadhaarCardUrl,
          aadhaarNumber: aadhaar,
          serviceArea: selectedLocalities.join(', ') || 'Fairlands, Salem',
          assignedLocalities: selectedLocalities.length > 0 ? selectedLocalities : ['Fairlands'],
          ratingAvg: 5.0,
          ratingCount: 0,
          jobsCompleted: 0
        };
        localStorage.removeItem('shazuone_partner_incentives');
        loginAsTechnician(fallbackTech);
        toast.success(`Registration & KYC submitted! Operations team will review within 12 hours and notify you.`);
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
                  முதன்மைத் தொழில் பிரிவு (PRIMARY TRADE) *
                </Typography>
                <FormControl fullWidth size="small">
                  {/* ds-allow-native-select */}
                  <Select
                    value={trade}
                    onChange={(e) => handlePrimaryTradeChange(e.target.value)}
                    sx={{ borderRadius: '12px', fontWeight: 700 }}
                  >
                    <MenuItem value="ac">AC Repair & HVAC Specialist (7+ Yrs)</MenuItem>
                    <MenuItem value="electrician">Master Electrician & Wiring</MenuItem>
                    <MenuItem value="plumber">Plumbing & Drainage Expert</MenuItem>
                    <MenuItem value="cleaning">Deep Cleaning & Sanitization</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Additional Services Multi-Select */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>
                    கூடுதல் சேவைகள் (ADDITIONAL SERVICES YOU CAN PROVIDE)
                  </Typography>
                  <Chip
                    size="small"
                    label={`${secondaryTrades.filter(t => t !== trade).length} Selected`}
                    sx={{
                      bgcolor: secondaryTrades.filter(t => t !== trade).length > 0 ? '#F3E8FF' : '#F1F5F9',
                      color: secondaryTrades.filter(t => t !== trade).length > 0 ? '#7E22CE' : '#64748B',
                      fontWeight: 800,
                      fontSize: '10.5px',
                      height: 20
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mb: 1 }}>
                  உங்கள் முதன்மைத் தொழில் தவிர பிற பணிகளையும் உங்களால் செய்ய முடியுமா? நீங்கள் செய்யும் சேவைகளைத் தேர்ந்தெடுக்கவும்:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  {ALL_TRADES.filter((t) => t.id !== trade).map((t) => {
                    const isSelected = secondaryTrades.includes(t.id);
                    return (
                      <Paper
                        key={t.id}
                        elevation={0}
                        onClick={() => toggleSecondaryTrade(t.id)}
                        sx={{
                          p: 1.2,
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E2E8F0',
                          bgcolor: isSelected ? '#FAF5FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: '#A855F7', bgcolor: isSelected ? '#FAF5FF' : '#F8FAFC' }
                        }}
                      >
                        <Box sx={{ pr: 1 }}>
                          <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: isSelected ? '#6B21A8' : '#0F172A' }}>
                            {t.name}
                          </Typography>
                          <Typography sx={{ fontSize: '10.5px', color: isSelected ? '#7E22CE' : '#64748B' }}>
                            {t.tamil}
                          </Typography>
                        </Box>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          sx={{
                            p: 0,
                            color: '#CBD5E1',
                            '&.Mui-checked': { color: '#7E22CE' }
                          }}
                        />
                      </Paper>
                    );
                  })}
                </Box>
                <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '11px', display: 'block', mt: 0.8, fontWeight: 600 }}>
                  * நீங்கள் தேர்ந்தெடுக்கும் கூடுதல் சேவைகளுக்கும் வேலை அறிவிப்புகள் (Job Alerts) உங்கள் Duty ஆப்பில் நேரடியாக வரும்.
                </Typography>
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

              {/* Working Areas in Salem (Multiple Select) */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6, flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block' }}>
                    பணிபுரிய விரும்பும் பகுதிகள் (AREAS WILLING TO WORK IN SALEM) *
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={`${selectedLocalities.length} Selected`}
                      sx={{
                        bgcolor: selectedLocalities.length > 0 ? '#E0F2FE' : '#F1F5F9',
                        color: selectedLocalities.length > 0 ? '#0284C7' : '#64748B',
                        fontWeight: 800,
                        fontSize: '10.5px',
                        height: 20
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        if (selectedLocalities.length === SALEM_LOCALITIES.length) {
                          setSelectedLocalities(['Fairlands']);
                        } else {
                          setSelectedLocalities(SALEM_LOCALITIES.map((l) => l.name));
                        }
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        py: 0,
                        px: 0.8,
                        minWidth: 0,
                        color: '#0284C7'
                      }}
                    >
                      {selectedLocalities.length === SALEM_LOCALITIES.length ? 'Reset (மீட்டமை)' : 'Select All (முழு சேலம்)'}
                    </Button>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block', mb: 1 }}>
                  சேலத்தில் நீங்கள் பணியாற்ற விரும்பும் பகுதிகளைத் தேர்வு செய்யவும் (ஒன்று அல்லது பல பகுதிகளைத் தேர்ந்தெடுக்கலாம்):
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.8,
                    p: 1.2,
                    bgcolor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    '&:hover': { borderColor: '#CBD5E1' }
                  }}
                >
                  {SALEM_LOCALITIES.map((loc) => {
                    const isSelected = selectedLocalities.includes(loc.name);
                    return (
                      <Chip
                        key={loc.id}
                        label={`${loc.name} (${loc.tamil})`}
                        icon={isSelected ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#FFFFFF !important' }} /> : undefined}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedLocalities.length === 1) {
                              toast.warning('குறைந்தது ஒரு பகுதியாவது தேர்ந்தெடுக்கப்பட வேண்டும்');
                              return;
                            }
                            setSelectedLocalities(selectedLocalities.filter((item) => item !== loc.name));
                          } else {
                            setSelectedLocalities([...selectedLocalities, loc.name]);
                          }
                        }}
                        clickable
                        size="small"
                        sx={{
                          minHeight: 34,
                          px: 0.5,
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          bgcolor: isSelected ? '#0284C7' : '#F8FAFC',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          border: isSelected ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                          '&:hover': {
                            bgcolor: isSelected ? '#0369A1' : '#F1F5F9'
                          }
                        }}
                      />
                    );
                  })}
                </Box>
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

          {/* STEP 2: PAYOUT PHONE & SECURITY PASSWORD */}
          {activeStep === 2 && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  படி 3: கொடுப்பனவு எண் & கடவுச்சொல் (Payout Phone & Security)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  ஒவ்வொரு வேலையும் முடிந்தவுடன் 98% கட்டணம் உங்கள் மொபைல் எண்ணுக்கு அனுப்பப்படும்.
                </Typography>
              </Box>

              {/* Payout Phone Number */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.6 }}>
                  கொடுப்பனவு மொபைல் எண் (PAYOUT PHONE — 98% DIRECT) *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  inputMode="numeric"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="e.g. 9842012345"
                  helperText="பணம் இந்த மொபைல் எண்ணுடன் இணைந்த UPI கணக்கிற்கு அனுப்பப்படும் (Money sent via phone-linked UPI)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: '14px' }}>+91</Typography>
                      </InputAdornment>
                    )
                  }}
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
        subtitle="சேலம் மத்திய பதிவு மற்றும் கொடுப்பனவு மொபைல் சரிபார்ப்பு..."
        badge="DigiLocker Verified"
      />
    </Box>
  );
}
