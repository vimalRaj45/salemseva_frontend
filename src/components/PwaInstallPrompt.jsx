import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // Check if user dismissed recently
    const dismissedUntil = localStorage.getItem('salemseva_pwa_dismissed');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 3 days
    localStorage.setItem('salemseva_pwa_dismissed', String(Date.now() + 3 * 24 * 60 * 60 * 1000));
  };

  if (!showPrompt) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 68, md: 24 },
        left: { xs: 12, md: 'auto' },
        right: { xs: 12, md: 24 },
        zIndex: 1300,
        maxWidth: { xs: '100%', md: 380 },
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 1.8,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '14px',
          border: '1.5px solid #0284C7',
          boxShadow: '0 8px 30px rgba(2, 132, 199, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          component="img"
          src="/icons/icon-192x192.png"
          alt="SalemSeva App Icon"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            bgcolor: '#FFFFFF',
            p: 0.3,
            flexShrink: 0
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px', lineHeight: 1.2 }}>
            Install SalemSeva App
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mt: 0.2, lineHeight: 1.3 }}>
            Add to home screen for 1-tap bookings and offline updates.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
            onClick={handleInstallClick}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '11px',
              borderRadius: '8px',
              textTransform: 'none',
              px: 1.2,
              py: 0.6,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: '#64748B', '&:hover': { color: '#CBD5E1' } }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
