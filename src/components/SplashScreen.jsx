import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

const FULL_QUOTE = 'Your Local Home Services Partner';

export default function SplashScreen({ onFinish }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Hide native Android platform splash immediately so this animated screen takes over
    if (Capacitor.isNativePlatform()) {
      try {
        CapacitorSplashScreen.hide();
      } catch (e) {}
    }

    // 1. Left-to-right typewriter quote starts at 320ms
    let charIndex = 0;
    let typeInterval = null;

    const startTimer = setTimeout(() => {
      typeInterval = setInterval(() => {
        if (charIndex <= FULL_QUOTE.length) {
          setDisplayedText(FULL_QUOTE.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 48);
    }, 320);

    // 2. At 2.8s: Initiate smooth fluid upward glide & fade transition
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 2800);

    // 3. At 3.4s: Complete transition into active application
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3400);

    return () => {
      clearTimeout(startTimer);
      if (typeInterval) clearInterval(typeInterval);
      clearTimeout(transitionTimer);
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
        justifyContent: 'center',
        px: 3,
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isTransitioning ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      {/* Center Brand Stage */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: isTransitioning ? 'translateY(-45px) scale(0.92)' : 'translateY(-14px)',
          opacity: isTransitioning ? 0 : 1,
          transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
        }}
      >
        {/* Official SalemSeva Logo */}
        <Box
          component="img"
          src="/logo.png"
          alt="SalemSeva Logo"
          sx={{
            width: { xs: 215, sm: 245 },
            maxWidth: '72vw',
            height: 'auto',
            objectFit: 'contain',
            mb: 2.5,
            filter: 'drop-shadow(0 14px 35px rgba(0, 102, 204, 0.14))',
            animation: 'splashLogoPop 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        />

        {/* Typewriter Quote Pill */}
        <Box
          sx={{
            minHeight: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            px: 2,
            py: 0.6,
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '0.84rem', sm: '0.92rem' },
              fontWeight: 700,
              color: '#334155',
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap'
            }}
          >
            {displayedText}
          </Typography>

          {/* Smooth Blinking Orange Cursor */}
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: '2px',
              height: '15px',
              bgcolor: '#FF6600',
              ml: '3px',
              borderRadius: '1px',
              animation: 'cursorBlink 0.75s infinite',
              verticalAlign: 'middle'
            }}
          />
        </Box>
      </Box>

      {/* Subtle Bottom Region Tag */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 'max(env(safe-area-inset-bottom, 24px), 32px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: isTransitioning ? 0 : 1,
          animation: 'fadeInTag 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards',
          transition: 'opacity 0.3s ease'
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: '#16A34A',
            boxShadow: '0 0 8px #16A34A'
          }}
        />
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: '#94A3B8',
            letterSpacing: '1.2px',
            textTransform: 'uppercase'
          }}
        >
          Salem, Tamil Nadu
        </Typography>
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes splashLogoPop {
            0% {
              opacity: 0;
              transform: scale(0.82) translateY(24px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          @keyframes fadeInTag {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
}
