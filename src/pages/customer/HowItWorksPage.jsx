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
import { ILLUSTRATIONS } from '../../constants/visualAssets';

const CUSTOMER_STAGES = [
  {
    id: 'select',
    stageNumber: 1,
    badge: 'Stage 1: Choose Service',
    title: 'Select Service & Enter Locality',
    desc: 'Pick AC, Electrical, Plumbing, or Appliances with a fixed ₹99 doorstep inspection & diagnostic fee.',
    illustration: ILLUSTRATIONS.customerBooking,
    points: [
      'Fixed ₹99 doorstep diagnostic & fuel fee',
      'Servicing Fairlands, Hasthampatti, Suramangalam & all 10 wards',
      'Describe issues via voice note or direct text'
    ]
  },
  {
    id: 'radar',
    stageNumber: 2,
    badge: 'Stage 2: Live Radar',
    title: 'Real-Time Hyperlocal Dispatch',
    desc: 'Automated radar matches the closest verified technician within 3.5 km under 45 seconds.',
    illustration: ILLUSTRATIONS.safetyVerification,
    points: [
      'Algorithms check technician proximity, trade tools & rating',
      '100% vetted Salem residents - no unverified contractors',
      'Fast doorstep arrival ETA calculated in real-time'
    ]
  },
  {
    id: 'transit',
    stageNumber: 3,
    badge: 'Stage 3: En Route & Arrival',
    title: 'Live GPS Tracking & Safety PIN',
    desc: 'Track technician travel in real time. Verify technician identity using a 4-digit security PIN before entry.',
    illustration: ILLUSTRATIONS.partnerService,
    points: [
      'Live two-wheeler GPS tracking with accurate arrival countdown',
      'Digital photo ID card with vehicle number & trade credentials',
      'Masked VoIP phone calls to safeguard customer privacy'
    ]
  },
  {
    id: 'quote',
    stageNumber: 4,
    badge: 'Stage 4: Transparent Estimate',
    title: 'Upfront Labour Quote & Escrow Lock',
    desc: 'Physical inspection on arrival with a digital job card quote. Buying spare parts is 100% your choice.',
    illustration: ILLUSTRATIONS.transparentPricing,
    points: [
      'Strictly labour billing - Shazu One never sells products',
      'Any spare parts needed are 100% your choice to buy or provide',
      'Payment held safely in Razorpay escrow until you approve'
    ]
  },
  {
    id: 'warranty',
    stageNumber: 5,
    badge: 'Stage 5: Work & Warranty',
    title: 'Job Completion & 30-Day Free Warranty',
    desc: 'Test appliance, release payment with completion OTP, and enjoy unconditional 30-day warranty.',
    illustration: ILLUSTRATIONS.transparentPricing,
    points: [
      'Full digital receipt generated with unique warranty ID',
      'Free 30-day rework warranty on all skilled workmanship',
      'Rate technician to maintain highest Salem quality standards'
    ]
  }
];

const PARTNER_STAGES = [
  {
    id: 'p_onboard',
    stageNumber: 1,
    badge: 'Stage 1: Quick Registration',
    title: 'DigiLocker KYC & Skill Verification',
    desc: 'Register with Aadhaar e-KYC and trade certificates. Get approved as an official Shazu One certified specialist.',
    illustration: ILLUSTRATIONS.safetyVerification,
    points: [
      '100% paperless registration in under 5 minutes',
      'Identity verification via government DigiLocker portal',
      'Welcome tool bonus when using partner referral code'
    ]
  },
  {
    id: 'p_radar',
    stageNumber: 2,
    badge: 'Stage 2: Live Duty Radar',
    title: 'Toggle Duty & Receive Nearby Leads',
    desc: 'Go online whenever you want. Receive high-paying job dispatches matching your exact skill trade in your ward.',
    illustration: ILLUSTRATIONS.partnerService,
    points: [
      'One-tap Online/Offline duty radar toggle',
      'Audio alerts and customer destination GPS routes',
      'Guaranteed ₹99 fuel fee even if customer cancels on arrival'
    ]
  },
  {
    id: 'p_estimate',
    stageNumber: 3,
    badge: 'Stage 3: Digital Job Card',
    title: 'Present Upfront Labour Estimate',
    desc: 'Inspect customer appliance, create digital estimate on phone, and get instant customer authorization.',
    illustration: ILLUSTRATIONS.transparentPricing,
    points: [
      'In-app standardized labour rate chart calculator',
      'Zero dispute: customer approves digital quote before work',
      'Customer arranges any spare parts needed independently'
    ]
  },
  {
    id: 'p_completion',
    stageNumber: 4,
    badge: 'Stage 4: OTP Signoff & Payout',
    title: '98% Direct Daily Payout via UPI',
    desc: 'Complete service, verify customer completion OTP, and receive 98% of the booking directly into your UPI account.',
    illustration: ILLUSTRATIONS.partnerService,
    points: [
      'Shazu One retains only 2% platform facilitation',
      '98% net service payment disbursed daily via bank UPI',
      'Earn 5-star badges and qualify for weekly cash incentives'
    ]
  }
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // 'customer' | 'partner'
  const [currentStage, setCurrentStage] = useState(0);

  const stages = role === 'customer' ? CUSTOMER_STAGES : PARTNER_STAGES;
  const current = stages[currentStage];
  const progress = ((currentStage + 1) / stages.length) * 100;

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage((prev) => prev + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrev = () => {
    if (currentStage > 0) {
      setCurrentStage((prev) => prev - 1);
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
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pt: { xs: 'max(env(safe-area-inset-top, 0px), 8px)', sm: 'max(env(safe-area-inset-top, 0px), 12px)' },
          pb: { xs: 'max(env(safe-area-inset-bottom, 0px), 10px)', sm: 'max(env(safe-area-inset-bottom, 0px), 14px)' },
          px: { xs: 1.5, sm: 2.5 },
          boxSizing: 'border-box'
        }}
      >
        {/* Professional Header: Logo on left, compact pill switcher in center, Exit on right */}
        <Box sx={{ flexShrink: 0, mb: 1 }}>
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
              onClick={() => navigate('/')}
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
                p: 0.35,
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                flexShrink: 0
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setRole('customer');
                  setCurrentStage(0);
                }}
                startIcon={<PersonIcon sx={{ fontSize: 14 }} />}
                sx={{
                  py: 0.35,
                  px: { xs: 1, sm: 1.3 },
                  fontSize: '11.5px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'customer' ? '#FFFFFF' : 'transparent',
                  color: role === 'customer' ? '#0066CC' : '#64748B',
                  boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  minHeight: 28,
                  transition: 'all 0.15s ease'
                }}
              >
                Customer
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setRole('partner');
                  setCurrentStage(0);
                }}
                startIcon={<HandymanIcon sx={{ fontSize: 14 }} />}
                sx={{
                  py: 0.35,
                  px: { xs: 1, sm: 1.3 },
                  fontSize: '11.5px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  textTransform: 'none',
                  bgcolor: role === 'partner' ? '#FFFFFF' : 'transparent',
                  color: role === 'partner' ? '#059669' : '#64748B',
                  boxShadow: role === 'partner' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  minHeight: 28,
                  transition: 'all 0.15s ease'
                }}
              >
                Partner
              </Button>
            </Box>

            {/* Clean Exit Icon Button */}
            <IconButton
              size="small"
              onClick={() => navigate('/')}
              aria-label="Exit Walkthrough"
              sx={{
                width: 28,
                height: 28,
                borderRadius: '7px',
                bgcolor: '#FFFFFF',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
                flexShrink: 0
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
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

        {/* Stage Content Card: Edge-to-edge full width illustration */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            my: { xs: 0.6, sm: 1 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: { xs: '18px', sm: '22px' },
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Edge-to-Edge Full Width Illustration */}
          <Box
            sx={{
              height: { xs: '20vh', sm: '23vh', md: '25vh' },
              minHeight: 120,
              maxHeight: 200,
              width: '100%',
              bgcolor: '#F1F5F9',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative'
            }}
          >
            <Box
              component="img"
              src={current.illustration}
              alt={current.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />
          </Box>

          {/* Text and Details Container */}
          <Box
            sx={{
              p: { xs: 1.6, sm: 2.2 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Box sx={{ mb: { xs: 0.8, sm: 1.2 } }}>
              {/* Stage Badge & Step Indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={current.badge}
                  size="small"
                  sx={{
                    bgcolor: role === 'customer' ? '#EFF6FF' : '#ECFDF5',
                    color: role === 'customer' ? '#1E40AF' : '#047857',
                    fontWeight: 800,
                    fontSize: '11px',
                    height: 22,
                    px: 0.6
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '11.5px' }}>
                  Stage {currentStage + 1} of {stages.length}
                </Typography>
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' },
                  lineHeight: 1.22,
                  letterSpacing: '-0.02em',
                  mb: 0.4
                }}
              >
                {current.title}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: '#475569',
                  fontSize: { xs: '12.5px', sm: '13px' },
                  lineHeight: 1.4,
                  mb: { xs: 0.8, sm: 1.2 }
                }}
              >
                {current.desc}
              </Typography>

              {/* Concise Bullet Points with Clear Visibility */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.6, sm: 0.8 } }}>
                {current.points.map((pt, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                    <CheckCircleIcon sx={{ fontSize: 17, color: role === 'customer' ? '#0066CC' : '#16A34A', flexShrink: 0, mt: 0.15 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: { xs: '12px', sm: '12.5px' }, lineHeight: 1.35 }}>
                      {pt}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Pure Labour Guarantee Note: Larger and Highly Readable */}
            <Box
              sx={{
                p: { xs: 0.9, sm: 1.1 },
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 17, color: '#059669', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#334155', fontSize: { xs: '11px', sm: '11.5px' }, lineHeight: 1.35, fontWeight: 500 }}>
                Zero product push. Shazu One only charges for skilled doorstep labour. Replacement parts are 100% your choice.
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Bottom Actions Dock */}
        <Box sx={{ flexShrink: 0, display: 'flex', gap: 1.2, pt: 0.4 }}>
          <Button
            variant="outlined"
            onClick={handlePrev}
            disabled={currentStage === 0}
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1,
              height: { xs: 40, sm: 44 },
              borderRadius: '9px',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 700,
              fontSize: { xs: '13px', sm: '13.5px' },
              textTransform: 'none',
              '&:disabled': { opacity: 0.35 }
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
              height: { xs: 40, sm: 44 },
              borderRadius: '9px',
              bgcolor: role === 'customer' ? '#0066CC' : '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: { xs: '13px', sm: '13.5px' },
              textTransform: 'none',
              boxShadow: role === 'customer' ? '0 4px 14px rgba(0, 102, 204, 0.25)' : '0 4px 14px rgba(5, 150, 105, 0.25)',
              '&:hover': {
                bgcolor: role === 'customer' ? '#0052CC' : '#047857'
              }
            }}
          >
            {currentStage < stages.length - 1
              ? 'Next Stage'
              : role === 'customer'
              ? 'Book Service Now'
              : 'Start Partner Duty'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
