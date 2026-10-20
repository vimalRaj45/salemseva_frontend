import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HandymanIcon from '@mui/icons-material/Handyman';
import PersonIcon from '@mui/icons-material/Person';
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
    illustration: ILLUSTRATIONS.safetyVerification,
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
              <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '17px', color: '#0066CC', letterSpacing: -0.5 }}>
                Salem<span style={{ color: '#FF6600' }}>Seva</span>
              </Typography>
              <Chip
                label="Workflow"
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

            {/* Role Switcher */}
            <Box sx={{ display: 'flex', bgcolor: '#E2E8F0', p: 0.3, borderRadius: '8px' }}>
              <Button
                size="small"
                onClick={() => {
                  setRole('customer');
                  setCurrentStage(0);
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
                  setCurrentStage(0);
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

            <Button
              size="small"
              onClick={() => navigate('/')}
              sx={{
                color: '#64748B',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'none',
                minWidth: 'auto',
                p: 0.5
              }}
            >
              Exit
            </Button>
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

        {/* Stage Content Card (Fits middle space without scrolling) */}
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

          {/* Text and Details */}
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
                Stage {currentStage + 1} of {stages.length}
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

            {/* Concise Bullet Points */}
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

          {/* Pure Labour Guarantee Note */}
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
              Zero product push. Shazu One only charges for skilled doorstep labour. Replacement parts are 100% your choice.
            </Typography>
          </Box>
        </Card>

        {/* Bottom Actions Dock */}
        <Box sx={{ flexShrink: 0, display: 'flex', gap: 1.2, pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={handlePrev}
            disabled={currentStage === 0}
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
