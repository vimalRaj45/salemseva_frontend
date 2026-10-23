import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import HandymanIcon from '@mui/icons-material/Handyman';
import { RingtoneService } from '../services/RingtoneService';
import { API_BASE_URL } from '../config';

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

      const isCall = detail.data?.type === 'call';

      // Auto dismiss after 6.5 seconds unless it is an active incoming call
      if (!isCall) {
        timerRef.current = setTimeout(() => {
          setVisible(false);
        }, 6500);
      }
    };

    window.addEventListener('shazuone_heads_up_notification', handleNotification);

    return () => {
      window.removeEventListener('shazuone_heads_up_notification', handleNotification);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!notification) return null;

  const isCall = notification.data?.type === 'call';
  const isJob = notification.data?.type === 'new_job';
  const isChat = notification.data?.type === 'chat';
  const isOrder = notification.data?.type === 'order_status';

  const handleDismiss = (e) => {
    if (e) e.stopPropagation();
    setVisible(false);
    if (isCall) {
      RingtoneService.stopRinging();
    }
  };

  const handleClickBanner = () => {
    setVisible(false);
    if (isCall) {
      RingtoneService.stopRinging();
    }
    if (notification.data?.url) {
      navigate(notification.data.url);
    }
  };

  const handleAnswerCall = (e) => {
    e.stopPropagation();
    setVisible(false);
    RingtoneService.stopRinging();
    if (notification.data?.bookingId) {
      const role = notification.data?.role;
      const targetUrl = (role === 'Customer' || role === 'customer')
        ? `/track?bookingId=${notification.data.bookingId}&autoAnswer=true`
        : `/partner?bookingId=${notification.data.bookingId}&autoAnswer=true`;
      navigate(targetUrl);
    }
  };

  const handleDeclineCall = (e) => {
    e.stopPropagation();
    setVisible(false);
    RingtoneService.stopRinging();
    if (notification.data?.bookingId) {
      fetch(`${API_BASE_URL}/api/v1/webrtc/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: notification.data.bookingId, role: notification.data?.role || 'customer' })
      }).catch(() => {});
    }
  };

  return (
    <Slide direction="down" in={visible} mountOnEnter unmountOnExit>
      <Box
        onClick={handleClickBanner}
        sx={{
          position: 'fixed',
          top: { xs: 12, sm: 20 },
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

            {isCall && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 1.2s infinite' }} />
            )}
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
              bgcolor: isCall ? '#1E3A8A' : isJob ? '#78350F' : isChat ? '#064E3B' : '#0369A1',
              color: isCall ? '#60A5FA' : isJob ? '#FBBF24' : isChat ? '#34D399' : '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.2
            }}
          >
            {isCall ? (
              <PhoneInTalkIcon sx={{ fontSize: 20 }} />
            ) : isJob ? (
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

        {/* Action Controls for Calls */}
        {isCall && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pt: 1.2, borderTop: '1px solid #334155' }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<PhoneInTalkIcon sx={{ fontSize: 16 }} />}
              onClick={handleAnswerCall}
              sx={{
                bgcolor: '#16A34A',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                py: 0.8,
                borderRadius: '8px',
                '&:hover': { bgcolor: '#15803D' }
              }}
            >
              Answer Call
            </Button>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<PhoneDisabledIcon sx={{ fontSize: 16 }} />}
              onClick={handleDeclineCall}
              sx={{
                borderColor: '#DC2626',
                color: '#F87171',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                py: 0.8,
                borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)', borderColor: '#EF4444' }
              }}
            >
              Decline
            </Button>
          </Box>
        )}
      </Box>
    </Slide>
  );
}
