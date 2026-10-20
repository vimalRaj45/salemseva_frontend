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
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HandymanIcon from '@mui/icons-material/Handyman';
import PersonIcon from '@mui/icons-material/Person';
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
          py: { xs: 1.2, sm: 2 },
          px: { xs: 1.5, sm: 2.5 },
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header */}
        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '17px', color: '#0D3B66', letterSpacing: -0.5, fontFamily: '"Poppins", sans-serif' }}>
                Shazu <span style={{ color: '#2E7D32' }}>One</span>
              </Typography>
              <Chip
                label="Quick Start"
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#0066CC',
                  fontWeight: 700,
                  fontSize: '10.5px',
                  height: 20
                }}
              />
            </Box>

            {/* Role Switcher Pill */}
            <Box sx={{ display: 'flex', bgcolor: '#E2E8F0', p: 0.3, borderRadius: '8px' }}>
              <Button
                size="small"
                onClick={() => {
                  setRole('customer');
                  setActiveSlide(0);
                }}
                startIcon={<PersonIcon sx={{ fontSize: 14 }} />}
                sx={{
                  py: 0.3,
                  px: 1.2,
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'customer' ? '#FFFFFF' : 'transparent',
                  color: role === 'customer' ? '#0F172A' : '#64748B',
                  boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  minHeight: 28
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
                startIcon={<HandymanIcon sx={{ fontSize: 14 }} />}
                sx={{
                  py: 0.3,
                  px: 1.2,
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'partner' ? '#FFFFFF' : 'transparent',
                  color: role === 'partner' ? '#059669' : '#64748B',
                  boxShadow: role === 'partner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  minHeight: 28
                }}
              >
                Partner
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={() => setIsLangModalOpen(true)}
                startIcon={<Globe size={13} color="#0284C7" />}
                sx={{
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'none',
                  bgcolor: '#F1F5F9',
                  borderRadius: '8px',
                  px: 1,
                  py: 0.3,
                  minHeight: 28,
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: '#E2E8F0' }
                }}
              >
                {currentLangObj.badge}
              </Button>
              <Button
                size="small"
                onClick={handleFinish}
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  p: 0.5
                }}
              >
                Skip
              </Button>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                bgcolor: role === 'customer' ? '#0066CC' : '#059669'
              }
            }}
          />
        </Box>

        {/* Slide Content Card (Fills middle height without scrolling) */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            my: { xs: 1, sm: 1.5 },
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            p: { xs: 1.8, sm: 2.2 },
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
          }}
        >
          {/* Illustration Container */}
          <Box
            sx={{
              height: { xs: '24vh', sm: '28vh' },
              maxHeight: 180,
              width: '100%',
              bgcolor: '#F8FAFC',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #F1F5F9'
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
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={current.badge}
                size="small"
                sx={{
                  bgcolor: role === 'customer' ? '#EFF6FF' : '#ECFDF5',
                  color: role === 'customer' ? '#1E40AF' : '#047857',
                  fontWeight: 800,
                  fontSize: '10.5px',
                  height: 20
                }}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '11px' }}>
                Step {activeSlide + 1} of {slides.length}
              </Typography>
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '15px', sm: '17px' },
                lineHeight: 1.25,
                mb: 0.4
              }}
            >
              {current.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontSize: { xs: '11.5px', sm: '12.5px' },
                lineHeight: 1.35,
                mb: 1.2
              }}
            >
              {current.desc}
            </Typography>

            {/* 3 Concise Key Guarantees */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {current.points.map((pt, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 15, color: role === 'customer' ? '#0066CC' : '#16A34A', flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '11.5px' }}>
                    {pt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Zero Product Push Disclaimer */}
          <Box
            sx={{
              p: 1,
              mt: 1,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 16, color: '#059669', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', lineHeight: 1.3 }}>
              Pure skilled trade labour. Any replacement parts are completely your choice to purchase or provide.
            </Typography>
          </Box>
        </Card>

        {/* Bottom Actions Dock */}
        <Box sx={{ flexShrink: 0, display: 'flex', gap: 1.2, pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={handlePrev}
            disabled={activeSlide === 0}
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1,
              height: 38,
              borderRadius: '8px',
              borderColor: '#CBD5E1',
              color: '#475569',
              fontWeight: 700,
              fontSize: '12.5px',
              textTransform: 'none',
              '&:disabled': { opacity: 0.4 }
            }}
          >
            Previous
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1.8,
              height: 38,
              borderRadius: '8px',
              bgcolor: role === 'customer' ? '#0066CC' : '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
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
