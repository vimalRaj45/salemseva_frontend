import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function VoiceAgentModal({ open, onClose, onBookVoiceService }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Listening for voice command in Tamil / English...');

  const sampleQueries = [
    '"Fairlands la AC repair pannanum, ippo varamudiyuma?" (Tamil)',
    '"Where is my technician right now?" (English)',
    '"How many Seva Credits do I have in my wallet?"'
  ];

  const handleSampleClick = (text) => {
    setTranscript(`You said: ${text}`);
    if (text.includes('AC repair')) {
      setTimeout(() => {
        if (onBookVoiceService) onBookVoiceService();
      }, 1200);
    }
  };

  const toggleListen = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('Listening for Tamil/English voice input...');
      setTimeout(() => {
        setTranscript('"Fairlands la AC water leakage aaguthu, urgent ah tech anupunga"');
      }, 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1.5,
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
        }
      }}
    >
      <DialogContent sx={{ p: 2, textAlign: 'center' }}>
        
        {/* Top Header with WebRTC Badge & Close */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            icon={<FiberManualRecordIcon sx={{ color: '#10B981 !important', fontSize: 12 }} />}
            label="WebRTC Realtime AI (48kHz Low-Latency)"
            size="small"
            sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', height: 24 }}
          />
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Title & Subtitle */}
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px', mb: 0.5 }}>
          SalemSeva Voice Agent
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2.5, fontSize: '12px' }}>
          Speak in Tamil, Tanglish, or English to search, book, or query
        </Typography>

        {/* Animated Soundwave Visual */}
        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, gap: 0.8 }}>
          {[16, 32, 48, 60, 42, 54, 28, 18].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 4.5,
                height: isListening ? Math.max(12, (h * (1 + Math.sin(i * 1.5)))) : h,
                borderRadius: '4px',
                background: 'linear-gradient(180deg, #38BDF8 0%, #6366F1 100%)',
                transition: 'height 0.2s ease'
              }}
            />
          ))}
        </Box>

        {/* You Said Container */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            textAlign: 'left',
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
            <GraphicEqIcon sx={{ color: '#6366F1', fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#6366F1', fontSize: '11px' }}>
              YOU SAID:
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
            "{transcript}"
          </Typography>
        </Paper>

        {/* Sample Voice Queries */}
        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748B', display: 'block', textAlign: 'left', mb: 1, letterSpacing: 0.5, fontSize: '11px' }}>
          TAP SAMPLE VOICE QUERIES:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {sampleQueries.map((q, idx) => (
            <Paper
              key={idx}
              elevation={0}
              onClick={() => handleSampleClick(q)}
              sx={{
                p: 1.2,
                borderRadius: '12px',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                textAlign: 'left',
                '&:hover': { bgcolor: '#E2E8F0' }
              }}
            >
              <MicIcon sx={{ fontSize: 16, color: '#0F172A' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
                {q}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Action Button: Speak Now */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<MicIcon />}
          onClick={toggleListen}
          sx={{
            background: isListening ? '#DC2626' : 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
            borderRadius: '16px',
            py: 1.3,
            fontWeight: 900,
            fontSize: '15px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            '&:hover': { background: isListening ? '#B91C1C' : '#0369A1' }
          }}
        >
          {isListening ? 'Listening... Tap to Stop' : 'Speak Now'}
        </Button>

      </DialogContent>
    </Dialog>
  );
}
