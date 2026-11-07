import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { API_BASE_URL, API_V1_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { RingtoneService } from '../../services/RingtoneService';

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

export default function VoipCallingPage() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isIncoming = searchParams.get('incoming') === 'true';
  const autoAnswer = searchParams.get('autoAnswer') === 'true';
  const role = user?.role === 'technician' || user?.role === 'partner' ? 'Technician' : 'Customer';

  const [bookingInfo, setBookingInfo] = useState(null);
  const [callState, setCallState] = useState(isIncoming ? 'INCOMING' : 'RINGING');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [audioError, setAudioError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const processedCandidatesRef = useRef(new Set());
  const pendingIceCandidatesQueueRef = useRef([]);
  const answerPollRef = useRef(null);
  const candidatePollRef = useRef(null);
  const statusPollRef = useRef(null);

  // Load booking info for contact header
  useEffect(() => {
    let isMounted = true;
    if (!bookingId) return;

    fetch(`${API_V1_URL}/bookings/${bookingId}/track`)
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.success && d.booking) {
          setBookingInfo(d.booking);
        }
      })
      .catch((err) => console.warn('Failed to fetch booking info:', err));

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const partnerName =
    role === 'Customer'
      ? bookingInfo?.technician_name || 'Assigned Partner'
      : 'Customer (Doorstep)';

  const avatarInitials = (() => {
    const parts = partnerName.split(/[\s()]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return partnerName.substring(0, 2).toUpperCase() || (role === 'Customer' ? 'TC' : 'CU');
  })();

  const startRingtone = () => {
    try {
      RingtoneService.startRinging();
    } catch (e) {}
  };

  const stopRingtone = () => {
    try {
      RingtoneService.stopRinging();
    } catch (e) {}
  };

  const cleanupMedia = () => {
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {}
      pcRef.current = null;
    }
    processedCandidatesRef.current.clear();
    pendingIceCandidatesQueueRef.current = [];

    if (answerPollRef.current) {
      clearInterval(answerPollRef.current);
      answerPollRef.current = null;
    }
    if (candidatePollRef.current) {
      clearInterval(candidatePollRef.current);
      candidatePollRef.current = null;
    }
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }
  };

  const acquireMicrophone = async () => {
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
      return stream;
    } catch (err) {
      console.warn('Microphone permission error:', err);
      setAudioError('Microphone permission was denied. Please allow microphone access in your browser or device settings.');
      return null;
    }
  };

  const flushPendingCandidates = async (pc) => {
    while (pendingIceCandidatesQueueRef.current.length > 0) {
      const cand = pendingIceCandidatesQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (ce) {}
    }
  };

  const setupPeerConnection = async (localStream, isCaller) => {
    try {
      let iceServers = DEFAULT_ICE_SERVERS;
      try {
        const iceRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/ice-servers`);
        const iceData = await iceRes.json();
        if (iceData.success && Array.isArray(iceData.iceServers) && iceData.iceServers.length > 0) {
          iceServers = iceData.iceServers;
        }
      } catch (e) {}

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch((e) => console.warn('Remote audio play error:', e));
          stopRingtone();
          setCallState('CONNECTED');
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate && bookingId) {
          try {
            await fetch(`${API_BASE_URL}/api/v1/webrtc/call/candidate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                candidate: event.candidate,
                senderRole: isCaller ? 'caller' : 'callee'
              })
            });
          } catch (e) {}
        }
      };

      candidatePollRef.current = setInterval(async () => {
        if (!bookingId || !pcRef.current) return;
        try {
          const targetRole = isCaller ? 'caller' : 'callee';
          const candRes = await fetch(
            `${API_BASE_URL}/api/v1/webrtc/call/candidates?bookingId=${bookingId}&targetRole=${targetRole}`
          );
          const candData = await candRes.json();
          if (candData.success && Array.isArray(candData.candidates)) {
            for (const cand of candData.candidates) {
              const candKey = JSON.stringify(cand);
              if (!processedCandidatesRef.current.has(candKey)) {
                processedCandidatesRef.current.add(candKey);
                if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
                  try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (err) {}
                } else {
                  pendingIceCandidatesQueueRef.current.push(cand);
                }
              }
            }
          }
        } catch (e) {}
      }, 1500);

      statusPollRef.current = setInterval(async () => {
        if (!bookingId) return;
        try {
          const statusRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/status?bookingId=${bookingId}`);
          const statusData = await statusRes.json();
          if (statusData.success && statusData.call) {
            if (statusData.call.status === 'ENDED' || (!statusData.call.active && statusData.call.status !== 'CONNECTED')) {
              setCallState('ENDED');
              cleanupMedia();
            } else if (statusData.call.status === 'CONNECTED' && isCaller) {
              stopRingtone();
              setCallState('CONNECTED');
            }
          }
        } catch (e) {}
      }, 2000);

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          stopRingtone();
          setCallState('CONNECTED');
        } else if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
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

    const callerRole = role.toLowerCase() === 'technician' ? 'technician' : 'customer';

    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          caller: callerRole,
          callerName: role === 'Technician' ? 'Technician' : 'Customer',
          calleeName: partnerName
        })
      });
    } catch (e) {}

    const pc = await setupPeerConnection(stream, true);
    if (!pc) return;

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, sdp: offer.sdp, role: callerRole })
      });

      if (bookingId) {
        answerPollRef.current = setInterval(async () => {
          try {
            const answerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/answer?bookingId=${bookingId}`);
            const answerData = await answerRes.json();
            if (answerData.success && answerData.answer) {
              const answerSdp = typeof answerData.answer === 'string' ? answerData.answer : answerData.answer.sdp;
              if (answerSdp) {
                await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
                await flushPendingCandidates(pc);
                setCallState('CONNECTED');
                stopRingtone();
                if (answerPollRef.current) {
                  clearInterval(answerPollRef.current);
                  answerPollRef.current = null;
                }
              }
            }
          } catch (e) {
            console.warn('Error polling for answer:', e);
          }
        }, 1500);
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

    try {
      await fetch(`${API_BASE_URL}/api/v1/webrtc/call/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
    } catch (e) {}

    const pc = await setupPeerConnection(stream, false);
    if (!pc) return;

    try {
      const offerRes = await fetch(`${API_BASE_URL}/api/v1/webrtc/call/offer?bookingId=${bookingId}`);
      const offerData = await offerRes.json();
      if (offerData.success && offerData.offer) {
        const offerSdp = typeof offerData.offer === 'string' ? offerData.offer : offerData.offer.sdp;
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerSdp }));
        await flushPendingCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch(`${API_BASE_URL}/api/v1/webrtc/call/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, sdp: answer.sdp, role: role.toLowerCase() })
        });
        setCallState('CONNECTED');
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
        await fetch(`${API_BASE_URL}/api/v1/webrtc/call/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, role })
        });
      } catch (e) {}
    }

    setTimeout(() => {
      handleBackNavigation();
    }, 600);
  };

  const handleBackNavigation = () => {
    cleanupMedia();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(role === 'Technician' ? '/partner' : `/track?bookingId=${bookingId}`);
    }
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
    setSpeaker((prev) => !prev);
  };

  useEffect(() => {
    let timer = null;
    if (callState === 'CONNECTED') {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  useEffect(() => {
    if (isIncoming) {
      setCallState('INCOMING');
      if (autoAnswer) {
        handleAcceptIncoming();
      } else {
        startRingtone();
      }
    } else {
      startOutboundCall();
    }
    return () => {
      cleanupMedia();
    };
  }, [bookingId]);

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Top Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <IconButton
          onClick={handleBackNavigation}
          size="small"
          aria-label="Back"
          sx={{
            color: '#94A3B8',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' }
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Chip
          icon={<ShieldCheck size={14} color="#10B981" />}
          label="Masked Secure Relay"
          size="small"
          sx={{
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.24)',
            fontSize: '11px',
            fontWeight: 600
          }}
        />
      </Box>

      {/* Main Call Hub Canvas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          textAlign: 'center'
        }}
      >
        {/* Animated Avatar */}
        <Box
          sx={{
            position: 'relative',
            mb: 3
          }}
        >
          {callState === 'RINGING' && (
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: -12,
                right: -12,
                bottom: -12,
                borderRadius: '50%',
                border: '2px solid rgba(10, 102, 194, 0.4)',
                animation: 'pulse 2s infinite ease-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                  '70%': { transform: 'scale(1.2)', opacity: 0 },
                  '100%': { transform: 'scale(0.95)', opacity: 0 }
                }
              }}
            />
          )}

          <Avatar
            sx={{
              width: 104,
              height: 104,
              bgcolor: '#0A66C2',
              fontSize: '36px',
              fontWeight: 800,
              boxShadow: '0 8px 32px rgba(10, 102, 194, 0.35)',
              border: '4px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {avatarInitials}
          </Avatar>
        </Box>

        {/* Partner Name & Booking Badge */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#F8FAFC', mb: 0.75, fontSize: '22px' }}>
          {partnerName}
        </Typography>

        <Typography sx={{ color: '#94A3B8', fontSize: '13px', mb: 2 }}>
          Doorstep Specialist • Booking #{bookingId}
        </Typography>

        {/* Dynamic Status / Timer */}
        <Box sx={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
          {callState === 'CONNECTED' && (
            <Chip
              label={formatDuration(seconds)}
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                fontWeight: 700,
                fontSize: '14px',
                px: 1,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            />
          )}

          {callState === 'RINGING' && (
            <Typography sx={{ color: '#38BDF8', fontSize: '14px', fontWeight: 600 }}>
              Calling partner...
            </Typography>
          )}

          {callState === 'INCOMING' && (
            <Typography sx={{ color: '#FBBF24', fontSize: '14px', fontWeight: 600 }}>
              Incoming masked call...
            </Typography>
          )}

          {callState === 'ENDED' && (
            <Typography sx={{ color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
              Call ended
            </Typography>
          )}

          {callState === 'PERMISSION_REQUIRED' && (
            <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', fontSize: '12px' }}>
              Microphone permission needed
            </Alert>
          )}
        </Box>

        {audioError && (
          <Alert severity="error" sx={{ mt: 2, maxWidth: 360, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>
            {audioError}
          </Alert>
        )}
      </Box>

      {/* Control Action Bar */}
      <Box
        sx={{
          p: 3,
          pb: 5,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          zIndex: 10
        }}
      >
        {callState === 'INCOMING' ? (
          <>
            <IconButton
              onClick={handleEndCall}
              aria-label="Decline incoming call"
              sx={{
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                width: 64,
                height: 64,
                '&:hover': { bgcolor: '#B91C1C' }
              }}
            >
              <PhoneOff size={28} />
            </IconButton>

            <IconButton
              onClick={handleAcceptIncoming}
              aria-label="Accept incoming call"
              sx={{
                bgcolor: '#059669',
                color: '#FFFFFF',
                width: 64,
                height: 64,
                '&:hover': { bgcolor: '#047857' }
              }}
            >
              <PhoneCall size={28} />
            </IconButton>
          </>
        ) : (
          <>
            {/* Mute Toggle */}
            <IconButton
              onClick={toggleMute}
              disabled={callState !== 'CONNECTED'}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              sx={{
                bgcolor: muted ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                width: 54,
                height: 54,
                '&:hover': { bgcolor: muted ? '#DC2626' : 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-disabled': { opacity: 0.3 }
              }}
            >
              {muted ? <MicOff size={22} /> : <Mic size={22} />}
            </IconButton>

            {/* End Call Button */}
            <IconButton
              onClick={handleEndCall}
              aria-label="End audio call"
              sx={{
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                width: 64,
                height: 64,
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                '&:hover': { bgcolor: '#B91C1C' }
              }}
            >
              <PhoneOff size={28} />
            </IconButton>

            {/* Speaker Toggle */}
            <IconButton
              onClick={toggleSpeaker}
              disabled={callState !== 'CONNECTED'}
              aria-label={speaker ? 'Speaker phone enabled' : 'Speaker phone disabled'}
              sx={{
                bgcolor: speaker ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                width: 54,
                height: 54,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                '&.Mui-disabled': { opacity: 0.3 }
              }}
            >
              {speaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
}
