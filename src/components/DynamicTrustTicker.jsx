import React, { useState } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';

export default function DynamicTrustTicker({ locality = 'Fairlands, Salem' }) {
  const [isPaused, setIsPaused] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('SALEM100');
    toast.success('Coupon code SALEM100 copied! ₹100 OFF applied at checkout.');
  };

  const tickerItems = [
    {
      id: 'active_pros',
      icon: <BoltIcon sx={{ fontSize: 16, color: '#0284C7' }} />,
      primary: '18+ Verified Specialists Active',
      secondary: 'Fairlands & Salem Zone',
      badge: 'LIVE NOW',
      badgeColor: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
      pulse: true
    },
    {
      id: 'speed_eta',
      icon: <TimerIcon sx={{ fontSize: 16, color: '#16A34A' }} />,
      primary: '15–25 Mins Doorstep Arrival',
      secondary: '15-25 நிமிடங்களில் நேரடி சேவை',
      badge: 'FAST DISPATCH',
      badgeColor: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }
    },
    {
      id: 'safe_guarantee',
      icon: <ShieldIcon sx={{ fontSize: 16, color: '#059669' }} />,
      primary: '100% Safe Payment Guarantee',
      secondary: 'Money released only after your OTP check',
      badge: 'SAFE ESCROW',
      badgeColor: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' }
    },
    {
      id: 'coupon_code',
      icon: <LocalOfferIcon sx={{ fontSize: 16, color: '#D97706' }} />,
      primary: 'Flat ₹100 OFF: Code SALEM100',
      secondary: 'Click to copy coupon code',
      badge: 'TAP TO COPY',
      badgeColor: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
      onClick: handleCopyCode,
      isInteractive: true
    },
    {
      id: 'warranty',
      icon: <StarIcon sx={{ fontSize: 16, color: '#EAB308' }} />,
      primary: '30-Day Free Rework Warranty',
      secondary: 'Certified & police-verified technicians',
      badge: 'ASSURED QUALITY',
      badgeColor: { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' }
    },
    {
      id: 'localities',
      icon: <LocationOnIcon sx={{ fontSize: 16, color: '#DC2626' }} />,
      primary: 'Salem Localities Covered',
      secondary: 'Fairlands, Hasthampatti, Junction, Ammapet',
      badge: 'ALL ZONES',
      badgeColor: { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' }
    }
  ];

  // Duplicate items for continuous seamless loop without jump
  const marqueeItems = [...tickerItems, ...tickerItems];

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        py: 0.8,
        display: 'flex',
        alignItems: 'center'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Left Fade Gradient Mask */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: { xs: 20, sm: 40 },
          background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 3,
          pointerEvents: 'none'
        }}
      />

      {/* Right Fade Gradient Mask */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: { xs: 20, sm: 40 },
          background: 'linear-gradient(to left, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 3,
          pointerEvents: 'none'
        }}
      />

      {/* Animated Marquee Strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          whiteSpace: 'nowrap',
          width: 'max-content',
          animation: 'shazuTicker 38s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          '@keyframes shazuTicker': {
            '0%': { transform: 'translate3d(0, 0, 0)' },
            '100%': { transform: 'translate3d(-50%, 0, 0)' }
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            overflowX: 'auto',
            width: '100%'
          }
        }}
      >
        {marqueeItems.map((item, index) => (
          <Box
            key={`${item.id}-${index}`}
            onClick={item.onClick}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.4,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: item.isInteractive ? '#FFFBEB' : '#F8FAFC',
              border: '1px solid',
              borderColor: item.isInteractive ? '#FDE68A' : '#E2E8F0',
              cursor: item.isInteractive ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': item.isInteractive
                ? {
                    bgcolor: '#FEF3C7',
                    borderColor: '#F59E0B',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)'
                  }
                : {
                    bgcolor: '#F1F5F9'
                  }
            }}
          >
            {/* Icon badge */}
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {item.icon}
            </Box>

            {/* Label texts */}
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    fontSize: '11.5px',
                    letterSpacing: -0.2
                  }}
                >
                  {item.primary}
                </Typography>
                {item.pulse && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#16A34A',
                      boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)',
                      animation: 'pulseDot 1.5s infinite ease-in-out',
                      '@keyframes pulseDot': {
                        '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                        '70%': { transform: 'scale(1)', boxShadow: '0 0 0 5px rgba(34, 197, 94, 0)' },
                        '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' }
                      }
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontSize: '10px',
                  fontWeight: 500
                }}
              >
                {item.secondary}
              </Typography>
            </Box>

            {/* Micro Badge */}
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '9px',
                  fontWeight: 800,
                  bgcolor: item.badgeColor.bg,
                  color: item.badgeColor.text,
                  border: `1px solid ${item.badgeColor.border}`,
                  borderRadius: '4px',
                  px: 0.2
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
