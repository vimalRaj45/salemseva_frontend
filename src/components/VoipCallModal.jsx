import React, { useState, useEffect, useRef } from 'react';
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
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';

import { API_BASE_URL } from '../config';

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

export default function VoipCallModal({
  open,
  onClose,
  bookingId = 'SLM-84920',
  calleeName = 'K. Ramesh (Technician)',
  calleePhone = '+919842100001',
  role = 'Customer',
  isIncoming = false
}) {
  const [callState, setCallState] = useState(isIncoming ? 'INCOMING' : 'RINGING'); // INCOMING | RINGING | CONNECTED | ENDED
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const processedCandidatesRef = useRef(new Set());
  const ringtoneOscillatorRef = useRef(null);
  const audioContextRef = useRef(null);

  // Play synthesized ringtone using Web Audio API
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard 440Hz dialtone
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ringtoneOscillatorRef.current = osc;
    } catch (e) {}
  };

  const stopRingtone = () => {
    try {
      if (ringtoneOscillatorRef.current) {
        ringtoneOscillatorRef.current.stop();
        ringtoneOscillatorRef.current.disconnect();
        ringtoneOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {}
  };

  // Cleanup WebRTC Peer Connection & Media Streams
  const cleanupMedia = () => {
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    processedCandidatesRef.current.clear();
  };

  // Setup WebRTC Connection & Audio Streams
  const setupWebRtcConnection = async (isCaller) => {
    try {
      let iceServers = DEFAULT_ICE_SERVERS;
      try {
        const iceRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/ice-servers`);
        const iceData = await iceRes.json();
        if (iceData.success && iceData.iceServers && iceData.iceServers.length > 0) {
          iceServers = iceData.iceServers;
        }
      } catch (e) {}

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      // Handle Remote Audio Track
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(e => console.warn('Remote audio play:', e));
        }
      };

      // Handle Local ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          fetch(`${API_BASE_URL}/api/v1/webrtc/call/candidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId,
              candidate: event.candidate,
              senderRole: isCaller ? 'caller' : 'callee'
            })
          }).catch(() => {});
        }
      };

      // Request User Microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        setMicActive(true);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      } catch (micErr) {
        console.warn('Microphone access note:', micErr);
        setAudioError('Microphone not available. You can also use Direct Phone Call.');
      }

      if (isCaller) {
        // Create & Send SDP Offer
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
        await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sdp: offer })
        });
      }
    } catch (err) {
      console.warn('WebRTC Setup Error:', err);
    }
  };

  // Lifecycle & Call Initiation
  useEffect(() => {
    if (!open) {
      cleanupMedia();
      return;
    }

    setSeconds(0);
    setAudioError(null);

    if (isIncoming) {
      setCallState('INCOMING');
    } else {
      setCallState('RINGING');
      startRingtone();

      // Initiate Call Signal on Backend
      fetch(`${API_BASE_URL}/api/v1/webrtc/call/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          caller: role.toLowerCase(),
          callerName: role === 'Customer' ? 'Customer' : 'Technician',
          calleeName
        })
      }).catch(err => console.warn('VoIP initiate err:', err));

      setupWebRtcConnection(true);
    }

    return () => {
      cleanupMedia();
    };
  }, [open, isIncoming, bookingId, role, calleeName]);

  // Poller for WebRTC Signaling (Status, Offer, Answer, ICE Candidates)
  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const pollSignals = async () => {
      try {
        // 1. Poll Call Status
        const statusRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/status?bookingId=${bookingId}`);
        const statusData = await statusRes.json();
        if (statusData.success && statusData.call && isMounted) {
          const call = statusData.call;

          if (call.status === 'CONNECTED' && callState !== 'CONNECTED') {
            stopRingtone();
            setCallState('CONNECTED');
          } else if (call.status === 'ENDED' && callState !== 'ENDED') {
            stopRingtone();
            setCallState('ENDED');
            cleanupMedia();
            setTimeout(() => onClose(), 800);
            return;
          }
        }

        const pc = pcRef.current;
        if (!pc) return;

        // 2. If Caller, check for Callee's SDP Answer
        if (!isIncoming && pc.signalingState === 'have-local-offer') {
          const ansRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/answer?bookingId=${bookingId}`);
          const ansData = await ansRes.json();
          if (ansData.success && ansData.answer) {
            await pc.setRemoteDescription(new RTCSessionDescription(ansData.answer));
            stopRingtone();
            setCallState('CONNECTED');
          }
        }

        // 3. Poll Pending ICE Candidates
        const targetRole = isIncoming ? 'callee' : 'caller';
        const candRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/candidates?bookingId=${bookingId}&targetRole=${targetRole}`);
        const candData = await candRes.json();
        if (candData.success && candData.candidates) {
          for (const c of candData.candidates) {
            const cKey = JSON.stringify(c);
            if (!processedCandidatesRef.current.has(cKey) && pc.remoteDescription) {
              processedCandidatesRef.current.add(cKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {}
            }
          }
        }
      } catch (err) {}
    };

    const interval = setInterval(pollSignals, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [open, bookingId, isIncoming, callState, onClose]);

  // Duration Timer
  useEffect(() => {
    let timer;
    if (open && callState === 'CONNECTED') {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [open, callState]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAcceptIncoming = async () => {
    stopRingtone();
    setCallState('CONNECTED');

    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      await setupWebRtcConnection(false);

      // Fetch Caller's SDP Offer & Send SDP Answer
      const offerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer?bookingId=${bookingId}`);
      const offerData = await offerRes.json();
      if (offerData.success && offerData.offer && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offerData.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        await fetch(`${API_BASE_URL}/api/v1/webrtc/call/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sdp: answer })
        });
      }
    } catch (e) {
      console.warn('Accept call error:', e);
    }
  };

  const handleEndCall = async () => {
    stopRingtone();
    setCallState('ENDED');
    cleanupMedia();

    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
    } catch (e) {}

    setTimeout(() => onClose(), 500);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = muted; // toggle
        setMuted(!muted);
      }
    } else {
      setMuted(!muted);
    }
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
          p: 2,
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {/* Hidden Audio element for remote audio stream */}
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

        {/* Privacy Masked Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<SecurityIcon sx={{ color: '#34D399 !important', fontSize: 16 }} />}
            label="SalemSeva Masked VoIP • Zero Phone Number Leak"
            size="small"
            sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 800, fontSize: '11px' }}
          />
        </Box>

        {/* Callee Avatar with Animation */}
        <Box sx={{ position: 'relative', display: 'inline-block', my: 1.5 }}>
          <Avatar
            sx={{
              width: 76,
              height: 76,
              bgcolor: '#2563EB',
              fontSize: '26px',
              fontWeight: 800,
              mx: 'auto',
              border: '3px solid #38BDF8',
              boxShadow: callState === 'CONNECTED' 
                ? '0 0 25px rgba(56, 189, 248, 0.6)' 
                : (callState === 'RINGING' || callState === 'INCOMING' ? '0 0 20px rgba(234, 179, 8, 0.5)' : 'none')
            }}
          >
            {calleeName.substring(0, 2).toUpperCase()}
          </Avatar>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.3, fontSize: '16px' }}>
          {calleeName}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontSize: '12px' }}>
          {role === 'Customer' ? 'Technician • Fairlands & Salem Zone' : 'Customer • Fairlands, Salem'}
        </Typography>

        {/* Call State / Duration Display */}
        <Box sx={{ my: 1 }}>
          {callState === 'INCOMING' && (
            <Typography variant="subtitle2" sx={{ color: '#34D399', fontWeight: 800, fontSize: '13.5px' }}>
              📲 Incoming VoIP Call (அழைப்பு வருகிறது)...
            </Typography>
          )}
          {callState === 'RINGING' && (
            <Typography variant="subtitle2" sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '13.5px' }}>
              📞 Calling & Ringing (ரிங் ஆகிறது)...
            </Typography>
          )}
          {callState === 'CONNECTED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <GraphicEqIcon sx={{ color: '#10B981', fontSize: 22 }} />
              <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 800, fontSize: '19px' }}>
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

        {audioError && (
          <Typography variant="caption" sx={{ color: '#FCD34D', display: 'block', mb: 1, fontSize: '11px' }}>
            {audioError}
          </Typography>
        )}

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
                py: 1.1,
                fontWeight: 800,
                fontSize: '13px',
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
                py: 1.1,
                fontWeight: 800,
                fontSize: '13px',
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
                onClick={toggleMute}
                sx={{
                  bgcolor: muted ? '#EF4444' : 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: muted ? '#DC2626' : 'rgba(255,255,255,0.2)' }
                }}
              >
                {muted ? <MicOffIcon sx={{ fontSize: 22 }} /> : <MicIcon sx={{ fontSize: 22 }} />}
              </IconButton>

              <IconButton
                onClick={() => setSpeaker(!speaker)}
                sx={{
                  bgcolor: speaker ? '#2563EB' : 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: speaker ? '#1D4ED8' : 'rgba(255,255,255,0.2)' }
                }}
              >
                {speaker ? <VolumeUpIcon sx={{ fontSize: 22 }} /> : <VolumeOffIcon sx={{ fontSize: 22 }} />}
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
                py: 1.2,
                fontWeight: 800,
                fontSize: '13.5px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                textTransform: 'none',
                mt: 1,
                '&:hover': { bgcolor: '#DC2626' }
              }}
            >
              End Call (அழைப்பை முடி)
            </Button>

            {/* Direct Phone Fallback */}
            <Box sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant="text"
                startIcon={<PhoneInTalkIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  window.location.href = `tel:${calleePhone || '0427-2448888'}`;
                }}
                sx={{
                  color: '#94A3B8',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { color: '#38BDF8' }
                }}
              >
                📞 Direct Phone Call (Fallback)
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
