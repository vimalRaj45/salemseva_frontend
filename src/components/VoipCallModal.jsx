import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Alert
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
import LockIcon from '@mui/icons-material/Lock';

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
  const [callState, setCallState] = useState(isIncoming ? 'INCOMING' : 'RINGING'); // INCOMING | RINGING | CONNECTED | ENDED | PERMISSION_REQUIRED
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [micGranted, setMicGranted] = useState(false);
  const [micRequesting, setMicRequesting] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const processedCandidatesRef = useRef(new Set());
  const pendingIceCandidatesQueueRef = useRef([]);
  const ringtoneOscillatorRef = useRef(null);
  const audioContextRef = useRef(null);

  // Synthesized ringtone using Web Audio API
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

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
    pendingIceCandidatesQueueRef.current = [];
  };

  // Request Microphone Media Stream with standard noise suppression
  const acquireMicrophone = async () => {
    setMicRequesting(true);
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      localStreamRef.current = stream;
      setMicGranted(true);
      setMicRequesting(false);
      return stream;
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setMicRequesting(false);
      setMicGranted(false);
      setAudioError('Microphone permission was denied. Please allow microphone access in your browser to speak, or use Direct Phone Call.');
      return null;
    }
  };

  // Setup WebRTC Connection & Attach Audio Transceivers
  const setupPeerConnection = async (localStream, isCaller) => {
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

      // Attach Local Microphone Tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Ensure Bidirectional Audio Transceiver
      try {
        const transceivers = pc.getTransceivers();
        const audioTrans = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === 'audio');
        if (audioTrans) {
          audioTrans.direction = 'sendrecv';
        } else {
          pc.addTransceiver('audio', { direction: 'sendrecv' });
        }
      } catch (tErr) {}

      // Handle Inbound Remote Audio Stream
      pc.ontrack = (event) => {
        const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.muted = false;
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.play().catch(e => {
            console.warn('Remote audio autoplay catch:', e);
          });
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

      return pc;
    } catch (err) {
      console.error('Failed to create RTCPeerConnection:', err);
      return null;
    }
  };

  // Start Outbound Call Flow
  const startOutboundCall = async () => {
    setCallState('RINGING');
    startRingtone();

    // 1. Acquire Local Mic
    const stream = await acquireMicrophone();
    if (!stream) {
      setCallState('PERMISSION_REQUIRED');
      stopRingtone();
      return;
    }

    // 2. Setup RTCPeerConnection with local track
    const pc = await setupPeerConnection(stream, true);
    if (!pc) return;

    // 3. Initiate Call Signal on Backend
    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          caller: role.toLowerCase(),
          callerName: role === 'Customer' ? 'Customer' : 'Technician',
          calleeName
        })
      });

      // 4. Create and send SDP Offer (sendrecv)
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, sdp: offer })
      });
    } catch (e) {
      console.warn('Initiate call error:', e);
    }
  };

  // Lifecycle on modal open
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
      startOutboundCall();
    }

    return () => {
      cleanupMedia();
    };
  }, [open, isIncoming, bookingId, role, calleeName]);

  // Poller for WebRTC Signaling (Offer/Answer/Candidates)
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

            // Drain any pending queued candidates
            for (const cand of pendingIceCandidatesQueueRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {}
            }
            pendingIceCandidatesQueueRef.current = [];
          }
        }

        // 3. Poll Pending ICE Candidates
        const targetRole = isIncoming ? 'callee' : 'caller';
        const candRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/candidates?bookingId=${bookingId}&targetRole=${targetRole}`);
        const candData = await candRes.json();
        if (candData.success && candData.candidates) {
          for (const c of candData.candidates) {
            const cKey = JSON.stringify(c);
            if (!processedCandidatesRef.current.has(cKey)) {
              processedCandidatesRef.current.add(cKey);
              if (pc.remoteDescription && pc.remoteDescription.type) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(c));
                } catch (e) {}
              } else {
                pendingIceCandidatesQueueRef.current.push(c);
              }
            }
          }
        }
      } catch (err) {}
    };

    const interval = setInterval(pollSignals, 900);
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

  // Handle Callee Accepting Call
  const handleAcceptIncoming = async () => {
    stopRingtone();
    
    // 1. Acquire Local Microphone
    const stream = await acquireMicrophone();
    if (!stream) {
      setCallState('PERMISSION_REQUIRED');
      return;
    }

    setCallState('CONNECTED');

    try {
      // 2. Notify Backend Call Accepted
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      // 3. Setup Callee PeerConnection
      const pc = await setupPeerConnection(stream, false);
      if (!pc) return;

      // 4. Fetch Caller's SDP Offer
      const offerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer?bookingId=${bookingId}`);
      const offerData = await offerRes.json();
      if (offerData.success && offerData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
        
        // 5. Create & Send SDP Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`${API_BASE_URL}/api/v1/webrtc/call/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sdp: answer })
        });

        // Drain pending candidates
        for (const cand of pendingIceCandidatesQueueRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {}
        }
        pendingIceCandidatesQueueRef.current = [];
      }
    } catch (e) {
      console.warn('Accept call error:', e);
    }
  };

  // Terminate Call
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

    setTimeout(() => onClose(), 400);
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !muted;
        audioTracks[0].enabled = !nextState;
        setMuted(nextState);
      }
    } else {
      setMuted(!muted);
    }
  };

  // Toggle Speaker / Earpiece
  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = speaker;
      setSpeaker(!speaker);
    } else {
      setSpeaker(!speaker);
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
          p: 2.5,
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        {/* Hidden Audio element for remote audio stream - NOT display:none so browser audio engine processes it */}
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          controls={false}
          style={{ position: 'fixed', top: '-1000px', left: '-1000px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />

        {/* Privacy Masked Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            icon={<SecurityIcon sx={{ color: '#34D399 !important', fontSize: 16 }} />}
            label="SalemSeva Masked VoIP • Zero Phone Number Leak"
            size="small"
            sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontWeight: 700, fontSize: '11px' }}
          />
        </Box>

        {/* Callee Avatar with Animation */}
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
              boxShadow: callState === 'CONNECTED' 
                ? '0 0 25px rgba(56, 189, 248, 0.6)' 
                : (callState === 'RINGING' || callState === 'INCOMING' ? '0 0 20px rgba(234, 179, 8, 0.5)' : 'none')
            }}
          >
            {calleeName.substring(0, 2).toUpperCase()}
          </Avatar>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.3, fontSize: '17px' }}>
          {calleeName}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontSize: '12px' }}>
          {role === 'Customer' ? 'Technician • Fairlands & Salem Zone' : 'Customer • Fairlands, Salem'}
        </Typography>

        {/* Call State / Duration Display */}
        <Box sx={{ my: 1 }}>
          {callState === 'INCOMING' && (
            <Typography variant="subtitle2" sx={{ color: '#34D399', fontWeight: 800, fontSize: '14px' }}>
              📲 Incoming VoIP Call (அழைப்பு வருகிறது)...
            </Typography>
          )}
          {callState === 'RINGING' && (
            <Typography variant="subtitle2" sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '14px' }}>
              📞 Calling & Ringing (ரிங் ஆகிறது)...
            </Typography>
          )}
          {callState === 'CONNECTED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <GraphicEqIcon sx={{ color: '#10B981', fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 800, fontSize: '20px' }}>
                {formatTime(seconds)}
              </Typography>
            </Box>
          )}
          {callState === 'ENDED' && (
            <Typography variant="subtitle2" sx={{ color: '#F87171', fontWeight: 800 }}>
              Call Ended
            </Typography>
          )}
          {callState === 'PERMISSION_REQUIRED' && (
            <Typography variant="subtitle2" sx={{ color: '#FCD34D', fontWeight: 800, fontSize: '13px' }}>
              ⚠️ Microphone Permission Needed
            </Typography>
          )}
        </Box>

        {/* Permission Required State Banner */}
        {callState === 'PERMISSION_REQUIRED' && (
          <Box sx={{ bgcolor: 'rgba(234, 179, 8, 0.12)', border: '1px solid #FCD34D', borderRadius: '12px', p: 1.5, my: 2 }}>
            <Typography variant="body2" sx={{ color: '#FDE047', fontWeight: 600, fontSize: '12px', mb: 1.2 }}>
              SalemSeva needs microphone access so both you and the other party can talk and hear clearly.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<MicIcon />}
              onClick={isIncoming ? handleAcceptIncoming : startOutboundCall}
              disabled={micRequesting}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFF',
                fontWeight: 800,
                borderRadius: '10px',
                py: 1,
                fontSize: '13px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#1D4ED8' }
              }}
            >
              {micRequesting ? 'Requesting Permission...' : '🎤 Allow Microphone & Connect'}
            </Button>
          </Box>
        )}

        {audioError && callState !== 'PERMISSION_REQUIRED' && (
          <Alert severity="warning" sx={{ bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#FDE047', borderRadius: '10px', fontSize: '11px', my: 1, p: 0.5 }}>
            {audioError}
          </Alert>
        )}

        {/* Action Controls */}
        {callState === 'INCOMING' ? (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<CallIcon />}
              onClick={handleAcceptIncoming}
              disabled={micRequesting}
              sx={{
                bgcolor: '#16A34A',
                color: '#FFF',
                borderRadius: '12px',
                px: 2.5,
                py: 1.1,
                fontWeight: 800,
                fontSize: '13.5px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#15803D' }
              }}
            >
              {micRequesting ? 'Connecting...' : 'Accept Call (பதில் கொடு)'}
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
        ) : callState !== 'PERMISSION_REQUIRED' && (
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
                onClick={toggleSpeaker}
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
