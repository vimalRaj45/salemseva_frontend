import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Tooltip,
  Alert
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function VoiceNoteRecorder({ onAudioChange, existingAudio = null }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(existingAudio);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [totalAudioDuration, setTotalAudioDuration] = useState(0);
  const [permissionError, setPermissionError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioElementRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setPermissionError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : '');

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result;
          setAudioUrl(base64Data);
          setTotalAudioDuration(recordingDuration);
          if (onAudioChange) {
            onAudioChange(base64Data, recordingDuration);
          }
        };
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 119) {
            // Cap at 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      setPermissionError('Microphone access was denied. Please allow microphone permission in your browser to record a voice note.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDeleteAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl(null);
    setPlaybackTime(0);
    setTotalAudioDuration(0);
    if (onAudioChange) {
      onAudioChange(null, 0);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Box sx={{ mt: 1.5, mb: 1 }}>
      {permissionError && (
        <Alert severity="warning" sx={{ mb: 1.5, fontSize: '11.5px', py: 0.5, borderRadius: '8px' }}>
          {permissionError}
        </Alert>
      )}

      {/* State 1: Idle - Button to Record */}
      {!isRecording && !audioUrl && (
        <Paper
          elevation={0}
          sx={{
            p: 1.4,
            border: '1.5px dashed #CBD5E1',
            borderRadius: '10px',
            bgcolor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: '#94A3B8' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB'
              }}
            >
              <MicIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12.5px', color: '#0F172A' }}>
                Leave voice note for technician
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block' }}>
                Explain the problem or sound (up to 2 minutes)
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={startRecording}
            startIcon={<MicIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              px: 1.8,
              py: 0.6,
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            Record voice
          </Button>
        </Paper>
      )}

      {/* State 2: Active Recording */}
      {isRecording && (
        <Paper
          elevation={0}
          sx={{
            p: 1.4,
            border: '1.5px solid #EF4444',
            borderRadius: '10px',
            bgcolor: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {/* Pulsing indicator */}
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#EF4444',
                animation: 'recordPulse 1.2s infinite ease-in-out',
                '@keyframes recordPulse': {
                  '0%': { transform: 'scale(0.8)', opacity: 0.6 },
                  '50%': { transform: 'scale(1.2)', opacity: 1 },
                  '100%': { transform: 'scale(0.8)', opacity: 0.6 }
                }
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '12.5px', color: '#991B1B' }}>
                Recording voice note... ({formatTime(recordingDuration)} / 02:00)
              </Typography>
              <Typography variant="caption" sx={{ color: '#DC2626', fontSize: '10.5px' }}>
                Speak clearly about the issue
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={stopRecording}
            startIcon={<StopIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              px: 1.8,
              py: 0.6,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            Stop & Save
          </Button>
        </Paper>
      )}

      {/* State 3: Recorded - Audio Preview Player */}
      {!isRecording && audioUrl && (
        <Paper
          elevation={0}
          sx={{
            p: 1.4,
            border: '1.5px solid #10B981',
            borderRadius: '10px',
            bgcolor: '#F0FDF4',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {/* Hidden native audio element */}
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              if (!totalAudioDuration || isNaN(totalAudioDuration) || totalAudioDuration === 0) {
                setTotalAudioDuration(e.currentTarget.duration || recordingDuration || 10);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={togglePlayback}
                size="small"
                sx={{
                  bgcolor: '#059669',
                  color: '#FFFFFF',
                  width: 34,
                  height: 34,
                  '&:hover': { bgcolor: '#047857' }
                }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
              </IconButton>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 15 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '12px', color: '#065F46' }}>
                    Voice note recorded
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#047857', fontSize: '11px', fontWeight: 600 }}>
                  {formatTime(playbackTime)} / {formatTime(totalAudioDuration || recordingDuration || 1)}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Delete & re-record">
              <Button
                variant="outlined"
                size="small"
                onClick={handleDeleteAudio}
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: '#DC2626',
                  borderColor: '#FECACA',
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  py: 0.3,
                  px: 1,
                  '&:hover': { bgcolor: '#FEE2E2', borderColor: '#EF4444' }
                }}
              >
                Delete
              </Button>
            </Tooltip>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={totalAudioDuration > 0 ? (playbackTime / totalAudioDuration) * 100 : 0}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: '#A7F3D0',
              '& .MuiLinearProgress-bar': { bgcolor: '#059669' }
            }}
          />
        </Paper>
      )}
    </Box>
  );
}
