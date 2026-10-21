import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HandymanIcon from '@mui/icons-material/Handyman';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { Globe } from 'lucide-react';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import { getCurrentLanguage, SUPPORTED_LANGUAGES } from '../../services/languageService';
import { ILLUSTRATIONS } from '../../constants/visualAssets';

const CUSTOMER_SLIDES = [
  {
    id: 'rapid_dispatch',
    badge: '30-Minute Rapid Dispatch',
    title: 'Verified Home Experts at Your Doorstep',
    desc: 'Instant GPS dispatch connects you to certified AC, electrical, plumbing, and appliance specialists across Salem.',
    illustration: ILLUSTRATIONS.customerBooking,
    points: [
      'Real-time technician tracking & live ETA updates',
      'Fixed ₹99 doorstep inspection & diagnostic fee',
      'Available across Fairlands, Hasthampatti & all Salem wards'
    ]
  },
  {
    id: 'transparent_quotes',
    badge: 'Transparent Labour Billing',
    title: 'Upfront Quotes & Escrow Protection',
    desc: 'Review upfront labour estimates before work starts. Buying replacement parts is 100% your choice.',
    illustration: ILLUSTRATIONS.transparentPricing,
    points: [
      'Strictly skilled labour • Zero product push',
      'Payment held safely in Razorpay escrow until you approve',
      '₹100 Welcome credits applied on your first service'
    ]
  },
  {
    id: 'safety_guarantee',
    badge: 'Salem Trust Guarantee',
    title: 'Aadhaar Verified with 30-Day Warranty',
    desc: 'Every specialist undergoes government DigiLocker identity vetting and skill authentication.',
    illustration: ILLUSTRATIONS.safetyVerification,
    points: [
      'DigiLocker background verified with police check',
      'Masked phone calling to safeguard family privacy',
      'Free 30-day rework warranty on all workmanship'
    ]
  }
];

const PARTNER_SLIDES = [
  {
    id: 'partner_earnings',
    badge: 'Technician Partner Fleet',
    title: 'Earn 98% on Every Doorstep Job',
    desc: 'Join Salem trade network. Shazu One retains only 2% platform fee, giving you 98% direct daily earnings.',
    illustration: ILLUSTRATIONS.partnerService,
    points: [
      '98% net service revenue paid out to you',
      'Daily automated bank payouts via direct UPI',
      'Zero registration or subscription fees'
    ]
  },
  {
    id: 'partner_radar',
    badge: 'Smart Radar Dispatch',
    title: 'Work on Your Schedule in Your Ward',
    desc: 'Toggle duty on or off with one tap. Get dispatch requests matching your exact skill trade in your preferred Salem locality.',
    illustration: ILLUSTRATIONS.partnerService,
    points: [
      'Flexible duty radar: go online whenever you choose',
      'In-app digital estimate builder for customer approvals',
      'Direct GPS routing to customer doorsteps in Salem'
    ]
  },
  {
    id: 'partner_kyc',
    badge: 'Instant DigiLocker KYC',
    title: 'Paperless Onboarding in Under 5 Minutes',
    desc: 'Verify via government Aadhaar e-KYC and upload your trade credentials directly from your phone.',
    illustration: ILLUSTRATIONS.safetyVerification,
    points: [
      'Instant digital badge approval & dispatch activation',
      'Salem City certified partner accreditation',
      'Tool kit bonus when registering with fellow technician code'
    ]
  }
];

export default function FirstTimeOnboardingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // 'customer' | 'partner'
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const currentLangCode = getCurrentLanguage();
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const slides = role === 'customer' ? CUSTOMER_SLIDES : PARTNER_SLIDES;
  const current = slides[activeSlide];
  const progress = ((activeSlide + 1) / slides.length) * 100;

  const handleFinish = () => {
    localStorage.setItem('shazuone_has_seen_onboarding', 'true');
    if (role === 'partner') {
      navigate('/partner/onboarding');
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  return (
    <Box
      sx={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        bgcolor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          py: { xs: 1, sm: 1.5 },
          px: { xs: 1.5, sm: 2.5 },
          boxSizing: 'border-box'
        }}
      >
        {/* Professional Header: Logo on left, role switcher in center, language & skip on right */}
        <Box sx={{ flexShrink: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1
            }}
          >
            {/* Official Shazu One Logo on top left */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                cursor: 'pointer',
                flexShrink: 0
              }}
              onClick={handleFinish}
            >
              <Box
                component="img"
                src="/logo.svg"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                alt="Shazu One"
                sx={{
                  height: { xs: 26, sm: 30 },
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/* Compact Professional Role Switcher Pill */}
            <Box
              sx={{
                display: 'flex',
                bgcolor: '#F1F5F9',
                p: 0.3,
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                flexShrink: 0
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setRole('customer');
                  setActiveSlide(0);
                }}
                startIcon={<PersonIcon sx={{ fontSize: 13 }} />}
                sx={{
                  py: 0.25,
                  px: { xs: 0.9, sm: 1.2 },
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'customer' ? '#FFFFFF' : 'transparent',
                  color: role === 'customer' ? '#0066CC' : '#64748B',
                  boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  minHeight: 26,
                  transition: 'all 0.15s ease'
                }}
              >
                Customer
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setRole('partner');
                  setActiveSlide(0);
                }}
                startIcon={<HandymanIcon sx={{ fontSize: 13 }} />}
                sx={{
                  py: 0.25,
                  px: { xs: 0.9, sm: 1.2 },
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'partner' ? '#FFFFFF' : 'transparent',
                  color: role === 'partner' ? '#059669' : '#64748B',
                  boxShadow: role === 'partner' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  minHeight: 26,
                  transition: 'all 0.15s ease'
                }}
              >
                Partner
              </Button>
            </Box>

            {/* Language & Skip Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
              <Button
                size="small"
                onClick={() => setIsLangModalOpen(true)}
                startIcon={<Globe size={12} color="#0284C7" />}
                sx={{
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '10.5px',
                  textTransform: 'none',
                  bgcolor: '#F1F5F9',
                  borderRadius: '7px',
                  px: 0.8,
                  py: 0.2,
                  minHeight: 26,
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: '#E2E8F0' }
                }}
              >
                {currentLangObj.badge}
              </Button>
              <IconButton
                size="small"
                onClick={handleFinish}
                aria-label="Skip Onboarding"
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '7px',
                  bgcolor: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' }
                }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3.5,
              borderRadius: 2,
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                bgcolor: role === 'customer' ? '#0066CC' : '#059669',
                borderRadius: 2
              }
            }}
          />
        </Box>

        {/* Slide Content Card: Concise, auto-scrolling fallback if screen is tiny */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            my: { xs: 0.8, sm: 1.2 },
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            p: { xs: 1.4, sm: 2 },
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {/* Illustration Container: Proportional & Compact */}
          <Box
            sx={{
              height: { xs: 125, sm: 155, md: 175 },
              width: '100%',
              bgcolor: '#F8FAFC',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #F1F5F9',
              flexShrink: 0,
              mb: 1
            }}
          >
            <Box
              component="img"
              src={current.illustration}
              alt={current.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Text and Milestone Information */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {/* Step Badge & Counter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
              <Chip
                label={current.badge}
                size="small"
                sx={{
                  bgcolor: role === 'customer' ? '#EFF6FF' : '#ECFDF5',
                  color: role === 'customer' ? '#1E40AF' : '#047857',
                  fontWeight: 800,
                  fontSize: '10px',
                  height: 19
                }}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '10.5px' }}>
                Step {activeSlide + 1} of {slides.length}
              </Typography>
            </Box>

            {/* Title */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '14px', sm: '16px' },
                lineHeight: 1.25,
                mb: 0.3
              }}
            >
              {current.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontSize: { xs: '11px', sm: '12px' },
                lineHeight: 1.35,
                mb: 0.9
              }}
            >
              {current.desc}
            </Typography>

            {/* 3 Concise Key Guarantees */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 0.8 }}>
              {current.points.map((pt, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: role === 'customer' ? '#0066CC' : '#16A34A', flexShrink: 0, mt: 0.2 }} />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '11px', lineHeight: 1.3 }}>
                    {pt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Zero Product Push Disclaimer: Slim & Clean */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: '7px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 0.7,
              flexShrink: 0
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 15, color: '#059669', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '10px', lineHeight: 1.25, fontWeight: 500 }}>
              Pure skilled trade labour. Any replacement parts are completely your choice to purchase or provide.
            </Typography>
          </Box>
        </Card>

        {/* Bottom Actions Dock */}
        <Box sx={{ flexShrink: 0, display: 'flex', gap: 1, pt: 0.4 }}>
          <Button
            variant="outlined"
            onClick={handlePrev}
            disabled={activeSlide === 0}
            startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1,
              height: 38,
              borderRadius: '8px',
              borderColor: '#CBD5E1',
              color: '#475569',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'none',
              '&:disabled': { opacity: 0.35 }
            }}
          >
            Previous
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1.8,
              height: 38,
              borderRadius: '8px',
              bgcolor: role === 'customer' ? '#0066CC' : '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '12.5px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: role === 'customer' ? '#0052CC' : '#047857'
              }
            }}
          >
            {activeSlide < slides.length - 1
              ? 'Next Stage'
              : role === 'customer'
              ? 'Get Started (Claim ₹100)'
              : 'Register as Partner'}
          </Button>
        </Box>
      </Container>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        open={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </Box>
  );
}
