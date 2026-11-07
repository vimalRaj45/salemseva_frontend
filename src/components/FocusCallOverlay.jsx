import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function FocusCallOverlay({
  incomingCall,
  onAccept,
  onDecline
}) {
  if (!incomingCall) return null;

  const { callerName, bookingId, locality, role } = incomingCall;

  const isRaw = /^\+?[0-9\s-]{6,}$/.test(String(callerName || '').trim()) || /^\d{7,14}$/.test(String(callerName || '').replace(/\D/g, ''));
  const safeCallerName = (!callerName || isRaw)
    ? (role === 'Customer' ? 'Assigned Technician' : 'Customer')
    : callerName;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        bgcolor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        animation: 'fadeIn 0.25s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#1E293B',
          borderRadius: '20px',
          border: '2px solid #2563EB',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.4)',
          p: 3.5,
          textAlign: 'center',
          color: '#FFFFFF'
        }}
      >
        {/* Top Priority Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<VolumeUpIcon sx={{ fontSize: '14px !important', color: '#60A5FA !important' }} />}
            label="INCOMING HIGH-PRIORITY VOIP CALL"
            size="small"
            sx={{
              bgcolor: 'rgba(37, 99, 235, 0.15)',
              color: '#93C5FD',
              border: '1px solid #3B82F6',
              fontWeight: 800,
              fontSize: '10.5px',
              letterSpacing: 0.5
            }}
          />
        </Box>

        {/* Pulsing Avatar Container */}
        <Box
          sx={{
            position: 'relative',
            width: 104,
            height: 104,
            mx: 'auto',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Animated Wave Rings */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #3B82F6',
              animation: 'pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
              '@keyframes pulseRing': {
                '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                '50%': { transform: 'scale(1.4)', opacity: 0.3 },
                '100%': { transform: 'scale(1.7)', opacity: 0 }
              }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid #10B981',
              animation: 'pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
              animationDelay: '0.6s'
            }}
          />

          <Avatar
            sx={{
              width: 88,
              height: 88,
              bgcolor: '#2563EB',
              fontSize: 32,
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.5)'
            }}
          >
            {safeCallerName.slice(0, 2).toUpperCase()}
          </Avatar>
        </Box>

        {/* Caller Info */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: '#F8FAFC' }}>
          {safeCallerName}
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1, fontSize: '13px' }}>
          Booking #{bookingId}
        </Typography>

        {locality && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#0F172A', px: 1.5, py: 0.5, borderRadius: '20px', border: '1px solid #334155', mb: 3 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: '#38BDF8' }} />
            <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '11.5px' }}>
              {locality}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" sx={{ display: 'block', color: '#34D399', fontWeight: 700, mb: 3, fontSize: '12px', letterSpacing: 0.3 }}>
          Ringing with WhatsApp-style chime audio...
        </Typography>

        {/* Call Action Controls: Decline (Red) & Accept (Green) */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onDecline}
            startIcon={<CallEndIcon sx={{ fontSize: 20 }} />}
            sx={{
              flex: 1,
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              py: 1.4,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
              '&:hover': { bgcolor: '#B91C1C' }
            }}
          >
            Decline
          </Button>

          <Button
            variant="contained"
            onClick={onAccept}
            startIcon={<CallIcon sx={{ fontSize: 20 }} />}
            sx={{
              flex: 1,
              bgcolor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              py: 1.4,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)',
              '&:hover': { bgcolor: '#15803D' }
            }}
          >
            Answer Call
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
