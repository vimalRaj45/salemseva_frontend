import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';

/**
 * BrandLoadingScreen
 * Ultra-professional minimal branded loading & splash system.
 * Used across the entire platform: app splash, payments, bookings, matching, and order tracking.
 *
 * @param {'splash' | 'payment' | 'booking' | 'matching' | 'tracking' | 'wallet' | 'dispatch' | 'startup'} mode
 * @param {string} title Optional override for the main heading
 * @param {string} subtitle Optional override for the description/subtext
 * @param {string} badge Optional override for the security/status badge
 * @param {boolean} open Whether the loading screen is visible
 * @param {function} onFinish Optional callback when transition completes
 * @param {number} duration Optional auto-finish timer in milliseconds (for splash/timed screens)
 */
export default function BrandLoadingScreen({
  open = true,
  mode = 'splash',
  title,
  subtitle,
  desc,
  customTitle,
  customDesc,
  badge,
  onFinish,
  duration
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!duration || !onFinish) return;

    const exitTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, duration - 350);

    const completeTimer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onFinish]);

  if (!open) return null;

  const modeConfigs = {
    splash: {
      title: 'Shazu One',
      subtitle: 'All Your Home Services. One Platform.',
      badge: null
    },
    payment: {
      title: 'Securing Escrow Payment...',
      subtitle: 'Bank-grade 256-bit encryption. Funds held safely in escrow until service completion.',
      badge: null
    },
    booking: {
      title: 'Registering Your Booking...',
      subtitle: 'Reserving your doorstep inspection slot.',
      badge: null
    },
    matching: {
      title: 'Locating Nearby Specialists...',
      subtitle: 'Connecting with verified technicians across Salem.',
      badge: null
    },
    tracking: {
      title: 'Connecting to Live GPS...',
      subtitle: 'Retrieving specialist location and route updates.',
      badge: null
    },
    wallet: {
      title: 'Updating Wallet Credits...',
      subtitle: 'Processing reward balance and instant credits securely.',
      badge: null
    },
    dispatch: {
      title: 'Technician on the Way',
      subtitle: 'Partner en route with equipment and tools.',
      badge: null
    },
    startup: {
      title: 'Connecting to Shazu One...',
      subtitle: 'Loading service availability and pricing across Salem.',
      badge: null
    }
  };

  const currentConfig = modeConfigs[mode] || modeConfigs.splash;
  const resolvedTitle = customTitle || title || currentConfig.title;
  const resolvedSubtitle = customDesc || subtitle || desc || currentConfig.subtitle;
  const resolvedBadge = badge || currentConfig.badge;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        pt: 'max(env(safe-area-inset-top, 0px), 32px)',
        pb: 'max(env(safe-area-inset-bottom, 0px), 32px)',
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1), transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isTransitioning ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      {/* Top spacer to balance vertical symmetry */}
      <Box sx={{ height: 28 }} />

      {/* Center Stage: Minimal, High-Craft Brand Presentation */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '380px',
          animation: 'brandFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Standalone Official Brand Emblem (Pure logo without background box) */}
        <Box
          component="img"
          src="/logo-mark.svg"
          onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
          alt="Shazu One"
          sx={{
            width: { xs: 78, sm: 88 },
            height: { xs: 78, sm: 88 },
            objectFit: 'contain',
            mb: 2.2,
            filter: 'drop-shadow(0 8px 24px rgba(2, 132, 199, 0.16))'
          }}
        />

        {/* Brand or Transaction Heading */}
        <Typography
          sx={{
            fontSize: { xs: '18px', sm: '20px' },
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.3px',
            lineHeight: 1.25,
            mb: 0.6,
            fontFamily: '"Plus Jakarta Sans", "Poppins", sans-serif'
          }}
        >
          {resolvedTitle}
        </Typography>

        {/* Minimal Subtitle / Reassurance */}
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#64748B',
            letterSpacing: '0.1px',
            lineHeight: 1.5,
            mb: 2.2,
            px: 1
          }}
        >
          {resolvedSubtitle}
        </Typography>

        {/* Minimal Precision Hairline Progress Tracker */}
        <Box
          sx={{
            width: 120,
            height: 2.5,
            bgcolor: '#F1F5F9',
            borderRadius: '99px',
            overflow: 'hidden',
            position: 'relative',
            mb: 2
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '35%',
              background: 'linear-gradient(90deg, #0066CC 0%, #10B981 100%)',
              borderRadius: '99px',
              animation: 'hairlineSweep 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </Box>

        {/* Optional Status / Security Chip */}
        {resolvedBadge && (
          <Chip
            label={resolvedBadge}
            size="small"
            sx={{
              bgcolor: '#F8FAFC',
              color: '#334155',
              border: '1px solid #E2E8F0',
              fontWeight: 700,
              fontSize: '10px',
              height: 22,
              letterSpacing: '0.2px'
            }}
          />
        )}
      </Box>

      {/* Bottom Understated Attribution */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          opacity: 0.85
        }}
      >
        <Box
          component="img"
          src="/shazusoft_logo.png"
          alt=""
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            objectFit: 'contain'
          }}
        />
        <Typography
          sx={{
            fontSize: '10.5px',
            fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.2px'
          }}
        >
          Shazu Soft Technologies
        </Typography>
      </Box>

      {/* Scoped CSS Keyframes */}
      <style>
        {`
          @keyframes brandFadeUp {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes hairlineSweep {
            0% {
              left: -35%;
              width: 25%;
            }
            50% {
              width: 50%;
            }
            100% {
              left: 100%;
              width: 25%;
            }
          }
        `}
      </style>
    </Box>
  );
}
