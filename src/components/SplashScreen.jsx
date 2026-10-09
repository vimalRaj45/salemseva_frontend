import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(15);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const services = [
    { name: 'AC Repair', color: '#0077CC', icon: <AcUnitIcon sx={{ fontSize: 16 }} /> },
    { name: 'Electrical', color: '#FF6600', icon: <FlashOnIcon sx={{ fontSize: 16 }} /> },
    { name: 'Plumbing', color: '#16A34A', icon: <PlumbingIcon sx={{ fontSize: 16 }} /> },
    { name: 'Cleaning', color: '#0D9488', icon: <CleaningServicesIcon sx={{ fontSize: 16 }} /> }
  ];

  useEffect(() => {
    // Hide native platform splash screen so our animated UI shows instantly
    if (Capacitor.isNativePlatform()) {
      try {
        CapacitorSplashScreen.hide();
      } catch (e) {}
    }

    // Step Progress Simulation
    const timer1 = setTimeout(() => setProgress(45), 350);
    const timer2 = setTimeout(() => {
      setProgress(80);
      setActiveServiceIdx(1);
    }, 700);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setActiveServiceIdx(2);
    }, 1100);
    const timer4 = setTimeout(() => {
      setActiveServiceIdx(3);
    }, 1400);

    // Fade out and close
    const exitTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1700);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

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
        py: { xs: 6, sm: 8 },
        px: 3,
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      {/* Top Brand Location Tag */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, animation: 'fadeInDown 0.6s ease-out' }}>
        <VerifiedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#64748B'
          }}
        >
          Salem Corporation Verified • 15-Min Arrival
        </Typography>
      </Box>

      {/* Center Animated Logo & Branding */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Pulsing Logo Container */}
        <Box
          sx={{
            position: 'relative',
            width: 104,
            height: 104,
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Ambient Glow Pulse Behind Logo */}
          <Box
            sx={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 102, 204, 0.2) 0%, rgba(255, 102, 0, 0.15) 60%, transparent 80%)',
              animation: 'pulseGlow 2s infinite ease-in-out'
            }}
          />

          {/* Logo Card */}
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '24px',
              bgcolor: '#FFFFFF',
              boxShadow: '0 12px 32px -4px rgba(0, 102, 204, 0.22), 0 4px 12px rgba(255, 102, 0, 0.12)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.2
            }}
          >
            <img
              src="/logo.png"
              alt="SalemSeva Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>

        {/* Wordmark */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            fontSize: '30px',
            letterSpacing: '-0.5px',
            color: '#0066CC',
            mb: 0.5,
            lineHeight: 1,
            animation: 'fadeInUp 0.6s ease-out 0.2s both'
          }}
        >
          Salem<span style={{ color: '#FF6600' }}>Seva</span>
        </Typography>

        {/* Tagline */}
        <Typography
          variant="body2"
          sx={{
            color: '#475569',
            fontWeight: 600,
            fontSize: '13px',
            mb: 3,
            animation: 'fadeInUp 0.6s ease-out 0.3s both'
          }}
        >
          Your Local Home Services Partner
        </Typography>

        {/* 4 Animated Service Badges */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            animation: 'fadeInUp 0.6s ease-out 0.4s both'
          }}
        >
          {services.map((s, idx) => {
            const isActive = idx <= activeServiceIdx;
            return (
              <Box
                key={s.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.2,
                  py: 0.6,
                  borderRadius: '20px',
                  bgcolor: isActive ? `${s.color}15` : '#F1F5F9',
                  color: isActive ? s.color : '#94A3B8',
                  border: `1px solid ${isActive ? s.color : '#E2E8F0'}`,
                  transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {s.icon}
                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 800 }}>
                  {s.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Bottom Loading Progress Bar */}
      <Box sx={{ width: '100%', maxWidth: 260, textAlign: 'center', animation: 'fadeIn 0.8s ease-out 0.4s both' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 5,
            borderRadius: 4,
            bgcolor: '#E2E8F0',
            mb: 1.2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #0066CC 0%, #FF6600 100%)'
            }
          }}
        />
        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', fontWeight: 600 }}>
          {progress < 100 ? 'Connecting to Salem Hyperlocal Grid...' : 'Ready! Doorstep service online.'}
        </Typography>
      </Box>

      {/* Embedded Keyframe Animations */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInDown {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
