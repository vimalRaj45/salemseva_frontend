import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button
} from '@mui/material';

import CallEndIcon from '@mui/icons-material/CallEnd';
import CallIcon from '@mui/icons-material/Call';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SecurityIcon from '@mui/icons-material/Security';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

export default function VoipCallModal({
  open,
  onClose,
  bookingId = 'SLM-84920',
  calleeName = 'K. Ramesh (Technician)',
  role = 'Customer',
  isIncoming = false
}) {
  const [callState, setCallState] = useState(isIncoming ? 'INCOMING' : 'RINGING'); // INCOMING | RINGING | CONNECTED | ENDED
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  // Initialize Call Signaling with Backend
  useEffect(() => {
    if (!open) return;

    if (isIncoming) {
      setCallState('INCOMING');
    } else {
      setCallState('RINGING');
      setSeconds(0);
      // Post call initiate to backend
      fetch('http://localhost:8080/api/v1/webrtc/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          caller: role.toLowerCase(),
          callerName: role === 'Customer' ? 'Vimal Raj' : 'K. Ramesh',
          calleeName
        })
      }).catch(err => console.warn('VoIP initiate err:', err));

      // Auto-connect after 2.5s for seamless demo experience if no manual accept
      const autoConnectTimer = setTimeout(() => {
        setCallState((prev) => (prev === 'RINGING' ? 'CONNECTED' : prev));
      }, 2500);

      return () => clearTimeout(autoConnectTimer);
    }
  }, [open, isIncoming, bookingId, role, calleeName]);

  // Poll call state
  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const pollCall = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/webrtc/call/status?bookingId=${bookingId}`);
        const d = await res.json();
        if (d.success && d.call && isMounted) {
          if (d.call.status === 'CONNECTED' && callState === 'RINGING') {
            setCallState('CONNECTED');
          } else if (d.call.status === 'ENDED' && callState !== 'ENDED') {
            setCallState('ENDED');
            setTimeout(() => onClose(), 800);
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(pollCall, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [open, bookingId, callState, onClose]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (open && callState === 'CONNECTED') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, callState]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAcceptIncoming = async () => {
    setCallState('CONNECTED');
    try {
      await fetch('http://localhost:8080/api/v1/webrtc/call/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
    } catch (e) {}
  };

  const handleEndCall = async () => {
    setCallState('ENDED');
    try {
      await fetch('http://localhost:8080/api/v1/webrtc/call/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
    } catch (e) {}
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onClose={handleEndCall}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '24px',
          p: 2.5,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {/* Privacy Masked Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<SecurityIcon sx={{ color: '#34D399 !important', fontSize: 16 }} />}
            label="SalemSeva Masked VoIP • Zero Phone Sharing"
            size="small"
            sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 800, fontSize: '11px' }}
          />
        </Box>

        {/* Callee Avatar with Pulse Animation */}
        <Box sx={{ position: 'relative', display: 'inline-block', my: 1.5 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#2563EB',
              fontSize: '28px',
              fontWeight: 800,
              mx: 'auto',
              border: '3px solid #38BDF8',
              boxShadow: callState === 'CONNECTED' ? '0 0 25px rgba(56, 189, 248, 0.5)' : (callState === 'RINGING' || callState === 'INCOMING' ? '0 0 20px rgba(234, 179, 8, 0.4)' : 'none')
            }}
          >
            {calleeName.substring(0, 2).toUpperCase()}
          </Avatar>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.3, fontSize: '16px' }}>
          {calleeName}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5 }}>
          {role === 'Customer' ? 'Technician • Fairlands Zone' : 'Customer • Fairlands, Salem'}
        </Typography>

        {/* Call State / Duration */}
        <Box sx={{ my: 1 }}>
          {callState === 'INCOMING' && (
            <Typography variant="subtitle2" sx={{ color: '#34D399', fontWeight: 800 }}>
              📲 Incoming VoIP Call (அழைப்பு வருகிறது)...
            </Typography>
          )}
          {callState === 'RINGING' && (
            <Typography variant="subtitle2" sx={{ color: '#FCD34D', fontWeight: 800 }}>
              📞 Calling & Ringing (ரிங் ஆகிறது)...
            </Typography>
          )}
          {callState === 'CONNECTED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <GraphicEqIcon sx={{ color: '#10B981', fontSize: 20 }} />
              <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 800, fontSize: '18px' }}>
                {formatTime(seconds)}
              </Typography>
            </Box>
          )}
          {callState === 'ENDED' && (
            <Typography variant="subtitle2" sx={{ color: '#F87171', fontWeight: 800 }}>
              Call Ended
            </Typography>
          )}
        </Box>

        {/* Action Controls */}
        {callState === 'INCOMING' ? (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<CallIcon />}
              onClick={handleAcceptIncoming}
              sx={{
                bgcolor: '#16A34A',
                color: '#FFF',
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#15803D' }
              }}
            >
              Accept Call (பதில் கொடு)
            </Button>
            <Button
              variant="contained"
              startIcon={<CallEndIcon />}
              onClick={handleEndCall}
              sx={{
                bgcolor: '#DC2626',
                color: '#FFF',
                borderRadius: '12px',
                px: 2,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#B91C1C' }
              }}
            >
              Decline
            </Button>
          </Box>
        ) : (
          <>
            {/* Audio Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, my: 2 }}>
              <IconButton
                onClick={() => setMuted(!muted)}
                sx={{
                  bgcolor: muted ? '#EF4444' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: muted ? '#DC2626' : 'rgba(255,255,255,0.2)' }
                }}
              >
                {muted ? <MicOffIcon sx={{ fontSize: 20 }} /> : <MicIcon sx={{ fontSize: 20 }} />}
              </IconButton>

              <IconButton
                onClick={() => setSpeaker(!speaker)}
                sx={{
                  bgcolor: speaker ? '#2563EB' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: speaker ? '#1D4ED8' : 'rgba(255,255,255,0.2)' }
                }}
              >
                {speaker ? <VolumeUpIcon sx={{ fontSize: 20 }} /> : <VolumeOffIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Box>

            {/* End Call Button */}
            <Button
              variant="contained"
              fullWidth
              size="medium"
              startIcon={<CallEndIcon />}
              onClick={handleEndCall}
              sx={{
                bgcolor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '12px',
                py: 1,
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                textTransform: 'none',
                mt: 1,
                '&:hover': { bgcolor: '#DC2626' }
              }}
            >
              End Call (அழைப்பை முடி)
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
