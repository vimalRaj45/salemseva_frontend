import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import HandymanIcon from '@mui/icons-material/Handyman';

export default function HeadsUpNotificationBanner() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleNotification = (event) => {
      const detail = event.detail;
      if (!detail) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setNotification(detail);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 6500);
    };

    window.addEventListener('shazuone_heads_up_notification', handleNotification);

    return () => {
      window.removeEventListener('shazuone_heads_up_notification', handleNotification);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!notification) return null;

  const isJob = notification.data?.type === 'new_job';
  const isChat = notification.data?.type === 'chat';

  const handleDismiss = (e) => {
    if (e) e.stopPropagation();
    setVisible(false);
  };

  const handleClickBanner = () => {
    setVisible(false);
    if (notification.data?.url) {
      navigate(notification.data.url);
    }
  };

  return (
    <Slide direction="down" in={visible} mountOnEnter unmountOnExit>
      <Box
        onClick={handleClickBanner}
        sx={{
          position: 'fixed',
          top: { xs: 'calc(12px + var(--sat))', sm: 'calc(20px + var(--sat))' },
          left: '50%',
          transform: 'translateX(-50%) !important',
          width: { xs: 'calc(100% - 24px)', sm: 460 },
          maxWidth: '100%',
          zIndex: 99999,
          bgcolor: '#1E293B', // Dark charcoal matching native Android notification
          color: '#FFFFFF',
          borderRadius: '16px',
          p: 2,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          border: '1px solid #334155',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#243248'
          }
        }}
      >
        {/* Top Header: App Branding (Red square logo mark like Zomato reference) + App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Red Rounded Logo Mark */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: '#DC2626', // Vibrant Red matching user's Zomato reference
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '11px',
                letterSpacing: -0.5
              }}
            >
              SO
            </Box>

            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '12px' }}>
              Shazu One
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
              Now
            </Typography>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#FFFFFF' } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content Section: Headline + Details */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Status Indicator Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: isJob ? '#78350F' : isChat ? '#064E3B' : '#0369A1',
              color: isJob ? '#FBBF24' : isChat ? '#34D399' : '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.2
            }}
          >
            {isJob ? (
              <HandymanIcon sx={{ fontSize: 20 }} />
            ) : isChat ? (
              <ChatBubbleIcon sx={{ fontSize: 18 }} />
            ) : (
              <DirectionsBikeIcon sx={{ fontSize: 20 }} />
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Bold Headline (e.g. "Order is on its way!") */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#F8FAFC',
                fontSize: '14px',
                lineHeight: 1.3,
                mb: 0.3
              }}
            >
              {notification.title}
            </Typography>

            {/* Secondary line (e.g. "Kowsigan V (Delivery Partner) • I am at the doorstep") */}
            <Typography
              variant="body2"
              sx={{
                color: '#CBD5E1',
                fontSize: '12.5px',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {notification.body}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Slide>
  );
}
