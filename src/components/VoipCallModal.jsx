import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Alert
} from '@mui/material';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Shield,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

export default function VoipCallModal({
  open,
  onClose,
  bookingId = '',
  calleeName = 'Assigned Partner',
  calleePhone = '',
  role = 'Customer',
  isIncoming = false
}) {
  const [callState, setCallState] = useState(isIncoming ? 'INCOMING' : 'RINGING');
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
  const answerPollRef = useRef(null);

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
    // Ensure any answer polling interval is cleared to avoid stray timers
    if (answerPollRef.current) {
      clearInterval(answerPollRef.current);
      answerPollRef.current = null;
    }
  };

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
      setAudioError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      return null;
    }
  };

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

      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(e => console.warn('Remote audio play error:', e));
          stopRingtone();
          setCallState('CONNECTED');
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate && bookingId) {
          try {
            await fetch(`${API_BASE_URL}/api/v1/webrtc/candidate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                candidate: event.candidate,
                role
              })
            });
          } catch (e) {}
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          stopRingtone();
          setCallState('CONNECTED');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setCallState('ENDED');
          cleanupMedia();
        }
      };

      return pc;
    } catch (err) {
      console.error('Peer connection error:', err);
      return null;
    }
  };

  const startOutboundCall = async () => {
    cleanupMedia();
    const stream = await acquireMicrophone();
    if (!stream) {
      setCallState('PERMISSION_REQUIRED');
      return;
    }
    setCallState('RINGING');
    startRingtone();

    const pc = await setupPeerConnection(stream, true);
    if (!pc) return;

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      await fetch(`${API_BASE_URL}/api/v1/webrtc/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, sdp: offer.sdp, role })
      });

      // Start polling for answer after offer is sent (only if we have a bookingId)
      if (bookingId) {
        answerPollRef.current = setInterval(async () => {
          try {
            const answerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/answer?bookingId=${bookingId}`);
            const answerData = await answerRes.json();
            if (answerData.success && answerData.answer && answerData.answer.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerData.answer.sdp }));
              // Connection established
              setCallState('CONNECTED');
              stopRingtone();
              clearInterval(answerPollRef.current);
              answerPollRef.current = null;
            }
          } catch (e) {
            console.warn('Error polling for answer:', e);
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to create/send offer:', err);
      stopRingtone();
      setCallState('ENDED');
    }
  };

  const handleAcceptIncoming = async () => {
    stopRingtone();
    const stream = await acquireMicrophone();
    if (!stream) {
      setCallState('PERMISSION_REQUIRED');
      return;
    }
    setCallState('RINGING');

    const pc = await setupPeerConnection(stream, false);
    if (!pc) return;

    try {
      const offerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/offer?bookingId=${bookingId}`);
      const offerData = await offerRes.json();
      if (offerData.success && offerData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerData.offer.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`${API_BASE_URL}/api/v1/webrtc/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sdp: answer.sdp, role })
        });
      }
    } catch (err) {
      console.error('Accept incoming error:', err);
      setCallState('ENDED');
    }
  };

  const handleEndCall = async () => {
    stopRingtone();
    setCallState('ENDED');
    cleanupMedia();

    if (bookingId) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/webrtc/hangup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, role })
        });
      } catch (e) {}
    }

    // Clear any answer polling interval
    if (answerPollRef.current) {
      clearInterval(answerPollRef.current);
      answerPollRef.current = null;
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setSpeaker(prev => !prev);
  };

  // Timer counter when connected
  useEffect(() => {
    let timer = null;
    if (callState === 'CONNECTED') {
      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  // Handle call opening
  useEffect(() => {
    if (open) {
      if (isIncoming) {
        setCallState('INCOMING');
        startRingtone();
      } else {
        startOutboundCall();
      }
    } else {
      cleanupMedia();
    }
    return () => {
      cleanupMedia();
    };
  }, [open, isIncoming]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal open={open} onClose={handleEndCall} maxWidth="xs" ariaLabelledBy="voip-modal-title">
      <ModalHeader
        id="voip-modal-title"
        title="VoIP Voice Call"
        subtitle={`Masked privacy relay • Booking #${bookingId}`}
        onClose={handleEndCall}
        icon={<Phone size={20} color="#0A66C2" />}
      />

      <ModalBody sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}>
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          controls={false}
          style={{ position: 'fixed', top: '-1000px', left: '-1000px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />

        <Box sx={{ mb: 1 }}>
          <Chip
            icon={<Shield size={12} color="#16A34A" />}
            label="Masked VoIP • Zero phone number disclosure"
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '11px', height: 24, borderRadius: '9999px' }}
          />
        </Box>

        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#0A66C2',
            fontSize: '24px',
            fontWeight: 700,
            mx: 'auto',
            my: 2,
            border: '3px solid #BFDBFE'
          }}
        >
          {calleeName.substring(0, 2).toUpperCase()}
        </Avatar>

        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '16px', mb: 0.5 }}>
          {calleeName}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '12px', mb: 2 }}>
          {role === 'Customer' ? 'Technician • Fairlands & Salem Zone' : 'Customer • Fairlands, Salem'}
        </Typography>

        {/* Call State Display */}
        <Box sx={{ my: 1 }}>
          {callState === 'INCOMING' && (
            <Typography sx={{ color: '#0A66C2', fontWeight: 600, fontSize: '14px' }}>
              Incoming VoIP call...
            </Typography>
          )}
          {callState === 'RINGING' && (
            <Typography sx={{ color: '#D97706', fontWeight: 600, fontSize: '14px' }}>
              Ringing...
            </Typography>
          )}
          {callState === 'CONNECTED' && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Activity size={18} color="#16A34A" />
              <Typography sx={{ color: '#16A34A', fontWeight: 700, fontSize: '20px' }}>
                {formatTime(seconds)}
              </Typography>
            </Box>
          )}
          {callState === 'ENDED' && (
            <Typography sx={{ color: '#DC2626', fontWeight: 600, fontSize: '14px' }}>
              Call ended
            </Typography>
          )}
          {callState === 'PERMISSION_REQUIRED' && (
            <Typography sx={{ color: '#D97706', fontWeight: 600, fontSize: '13px' }}>
              Microphone permission needed
            </Typography>
          )}
        </Box>

        {callState === 'PERMISSION_REQUIRED' && (
          <Box sx={{ bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', p: 2, my: 1 }}>
            <Typography sx={{ color: '#92400E', fontSize: '12px', mb: 1.5, lineHeight: 1.4 }}>
              Microphone access is required to connect audio.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Mic size={16} />}
              onClick={isIncoming ? handleAcceptIncoming : startOutboundCall}
              disabled={micRequesting}
              sx={{
                bgcolor: '#0A66C2',
                color: '#FFF',
                fontWeight: 600,
                borderRadius: '12px',
                height: 44,
                fontSize: '13px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              {micRequesting ? 'Requesting access...' : 'Allow microphone'}
            </Button>
          </Box>
        )}

        {audioError && callState !== 'PERMISSION_REQUIRED' && (
          <Alert severity="warning" sx={{ borderRadius: '10px', fontSize: '12px', my: 1 }}>
            {audioError}
          </Alert>
        )}

        {/* Audio Controls */}
        {callState === 'CONNECTED' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <IconButton
              onClick={toggleMute}
              sx={{
                bgcolor: muted ? '#DC2626' : '#F1F5F9',
                color: muted ? '#FFFFFF' : '#0F172A',
                width: 48,
                height: 48,
                borderRadius: '12px',
                '&:hover': { bgcolor: muted ? '#B91C1C' : '#E2E8F0' }
              }}
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </IconButton>

            <IconButton
              onClick={toggleSpeaker}
              sx={{
                bgcolor: speaker ? '#0A66C2' : '#F1F5F9',
                color: speaker ? '#FFFFFF' : '#0F172A',
                width: 48,
                height: 48,
                borderRadius: '12px',
                '&:hover': { bgcolor: speaker ? '#084E96' : '#E2E8F0' }
              }}
            >
              {speaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </IconButton>
          </Box>
        )}
      </ModalBody>

      <ModalFooter sx={{ justifyContent: 'center' }}>
        {callState === 'INCOMING' ? (
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PhoneOff size={16} />}
              onClick={handleEndCall}
              sx={{
                color: '#DC2626',
                borderColor: '#FCA5A5',
                borderRadius: '12px',
                height: 48,
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' }
              }}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PhoneCall size={16} />}
              onClick={handleAcceptIncoming}
              disabled={micRequesting}
              sx={{
                bgcolor: '#16A34A',
                color: '#FFF',
                borderRadius: '14px',
                height: 48,
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#15803D' }
              }}
            >
              {micRequesting ? 'Connecting...' : 'Accept'}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PhoneOff size={18} />}
            onClick={handleEndCall}
            sx={{
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              borderRadius: '14px',
              height: 48,
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#B91C1C' }
            }}
          >
            End call
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
