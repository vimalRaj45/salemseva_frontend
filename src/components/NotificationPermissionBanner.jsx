import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import { NativeNotifier } from '../services/nativeNotify';
import { RingtoneService } from '../services/RingtoneService';

export default function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if permission already granted and audio unlocked
    const isDismissed = localStorage.getItem('shazuone_notif_banner_dismissed') === 'true';
    if (isDismissed) return;

    const notifGranted = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
    const audioUnlocked = RingtoneService.isUnlocked;

    if (!notifGranted || !audioUnlocked) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  const handleEnable = async () => {
    // 1. Request notifications
    await NativeNotifier.requestPermission();
    // 2. Unlock AudioContext with user gesture
    await RingtoneService.unlockAudio();
    // 3. Play sound confirmation so user knows audio works
    RingtoneService.playOrderStatusChime();

    setShowBanner(false);
    localStorage.setItem('shazuone_notif_banner_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('shazuone_notif_banner_dismissed', 'true');
  };

  return (
    <Box
      sx={{
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        p: { xs: 1.2, sm: 1.5 },
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        position: 'relative',
        zIndex: 9998
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1, minWidth: 260 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            bgcolor: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <NotificationsActiveIcon sx={{ fontSize: 18 }} />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F8FAFC', fontSize: '13px', lineHeight: 1.2 }}>
            Enable Call Ringing & Live Status Alerts
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block' }}>
            Receive ringing audio for doorstep calls and live technician arrival updates.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
          onClick={handleEnable}
          sx={{
            bgcolor: '#0284C7',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '11.5px',
            textTransform: 'none',
            borderRadius: '8px',
            px: 1.8,
            py: 0.6,
            '&:hover': { bgcolor: '#0369A1' }
          }}
        >
          Enable Sound & Alerts
        </Button>

        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#94A3B8' } }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
