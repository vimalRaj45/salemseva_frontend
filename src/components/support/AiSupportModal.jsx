import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Box,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  X,
  Send,
  Mic,
  Square,
  Bot,
  User,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ShieldAlert,
  Headphones,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const DEFAULT_OPS_CONTACT = {
  phone: '+918807099288',
  whatsapp: '+918807099288',
  whatsappUrl: `https://wa.me/918807099288?text=${encodeURIComponent('Hello Shazu One Salem Ops Support, I need assistance with my service.')}`,
  email: 'support@shazuone.com',
  hours: '8:00 AM - 9:00 PM IST (All 7 Days)'
};

export default function AiSupportModal({ open, onClose, defaultQuery = '' }) {
  const { user, techUser, openAuthModal } = useAuth();
  const currentUser = user || techUser;
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [opsContact, setOpsContact] = useState(DEFAULT_OPS_CONTACT);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isTechnician = currentUser?.role === 'technician' || currentUser?.role === 'partner';
  const role = isTechnician ? 'technician' : 'customer';

  // Quick suggestions based on role
  const quickSuggestions = isTechnician
    ? [
        "Today's assigned jobs",
        "Check my payout balance",
        "Emergency dispatch support",
        "Talk to Salem Ops desk"
      ]
    : [
        "Where is my technician?",
        "Show my booking status",
        "Cancellation and refund rules",
        "Talk to Salem Ops desk"
      ];

  // Initial welcome message
  useEffect(() => {
    if (open) {
      if (!currentUser) {
        setMessages([
          {
            id: 'welcome_login',
            sender: 'bot',
            text: 'Hello! Ask AI is reserved for logged-in SalemSeva users. Please sign in so I can check your technician location, active bookings, and service receipts.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (messages.length === 0 || messages[0]?.id === 'welcome_login') {
        const welcome = isTechnician
          ? `Hello ${currentUser?.name || 'Partner'}, I am your Shazu One Field Support Assistant. Ask about your assigned jobs, daily capacity, or payout statuses.`
          : `Hello ${currentUser?.name || currentUser?.full_name || 'Customer'}, I am your Shazu One Support Assistant. How can I assist you with your booking, payment, or technician today?`;

        setMessages([
          {
            id: 'welcome_1',
            sender: 'bot',
            text: welcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (defaultQuery) {
          handleSendMessage(defaultQuery);
        }
      }
    }
  }, [open, currentUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecording]);

  // Fetch Ops contact details on mount
  useEffect(() => {
    fetch(`${API_V1_URL}/support/ops-contact`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.opsContact) {
          setOpsContact(data.opsContact);
        }
      })
      .catch(err => {
        console.warn('Ops contact fetch error:', err);
      });
  }, []);

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result;
          handleSendAudio(base64Data);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      toast.error('Microphone permission required for voice queries. Please allow access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Send Audio Query
  const handleSendAudio = async (base64Audio) => {
    const userMsgId = `msg_${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: 'Voice query recorded...',
        isAudio: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsLoading(true);

    try {
      const res = await fetch(`${API_V1_URL}/support/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          role,
          userId: user?.id || 'guest',
          userPhone: user?.phone || '',
          userName: user?.name || user?.full_name || 'User'
        })
      });

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: 'Our AI cloud assistant is currently synchronizing with the central dispatch network. For immediate assistance with your booking, payment, or technician, please connect directly with our Salem Operations desk below:',
            escalateToOps: true,
            opsContact: opsContact || DEFAULT_OPS_CONTACT,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await res.json();

      // Update user message with transcribed text if available
      if (data.transcribedText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === userMsgId ? { ...m, text: `"${data.transcribedText}"` } : m
          )
        );
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Support response received.',
          escalateToOps: Boolean(data.escalateToOps),
          opsContact: data.opsContact || opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('AI chat voice dispatch error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'We are experiencing high demand on our voice line. Please connect directly with our Salem Operations team below.',
          escalateToOps: true,
          opsContact: opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Text Query
  const handleSendMessage = async (textToSend = null) => {
    const query = String(textToSend !== null ? textToSend : inputValue).trim();
    if (!query) return;

    setInputValue('');
    const userMsgId = `msg_${Date.now()}`;

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsLoading(true);

    try {
      const res = await fetch(`${API_V1_URL}/support/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          role,
          userId: user?.id || 'guest',
          userPhone: user?.phone || '',
          userName: user?.name || user?.full_name || 'User'
        })
      });

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: 'Our AI cloud assistant is currently synchronizing with the central dispatch network. For immediate assistance with your booking, payment, or technician, please connect directly with our Salem Operations desk below:',
            escalateToOps: true,
            opsContact: opsContact || DEFAULT_OPS_CONTACT,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Support response received.',
          escalateToOps: Boolean(data.escalateToOps),
          opsContact: data.opsContact || opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('AI chat text dispatch error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Our network connection to the AI support copilot is momentarily unavailable. Our Salem Operations team is ready to help you directly.',
          escalateToOps: true,
          opsContact: opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: { xs: '90vh', sm: '680px' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#0F172A',
          color: '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Bot size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF' }}>
              Ask AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {isTechnician ? 'Technician Operations Agent' : 'Instant Service & Booking Support'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close support dialog"
          sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Messages Scroll Area */}
      <DialogContent
        sx={{
          p: 2,
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: '#F8FAFC'
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                maxWidth: '88%',
                alignItems: 'flex-start',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: msg.sender === 'user' ? '#0F172A' : '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.5
                }}
              >
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </Box>

              {/* Message Bubble */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: msg.sender === 'user' ? '#2563EB' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  {msg.text}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    fontSize: '0.7rem',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#94A3B8'
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Box>
            </Box>

            {/* Salem Ops Emergency Card if escalated or AI unavailable */}
            {msg.escalateToOps && (
              <Box sx={{ mt: 1.5, width: '100%', maxWidth: '92%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid #CBD5E1',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Headphones size={18} color="#2563EB" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Salem Operations Support Desk
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', mb: 2 }}>
                    Connect directly with our live dispatchers for emergency overrides, cancellations, or booking modifications:
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    <Button
                      variant="contained"
                      component="a"
                      href={`tel:${msg.opsContact?.phone || '+918807099288'}`}
                      startIcon={<Phone size={16} />}
                      sx={{
                        bgcolor: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        '&:hover': { bgcolor: '#1E293B' }
                      }}
                    >
                      Call Desk
                    </Button>

                    <Button
                      variant="contained"
                      component="a"
                      href={msg.opsContact?.whatsappUrl || 'https://wa.me/918807099288'}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<MessageCircle size={16} />}
                      sx={{
                        bgcolor: '#059669',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      WhatsApp
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B' }}>
                    <Clock size={13} />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      Operating Hours: {msg.opsContact?.hours || '8:00 AM - 9:00 PM IST'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        ))}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
            <CircularProgress size={16} sx={{ color: '#2563EB' }} />
            <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic' }}>
              Consulting live operations database...
            </Typography>
          </Box>
        )}

        {/* Audio Recording Active Pulse Indicator */}
        {isRecording && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              bgcolor: '#FEF2F2',
              border: '1px solid #FCA5A5'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#DC2626',
                  animation: 'pulse 1.2s infinite'
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#991B1B' }}>
                Recording voice query... ({recordingSeconds}s)
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={stopRecording}
              startIcon={<Square size={14} />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Done
            </Button>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      {/* Quick Suggestion Chips or Sign In Barrier */}
      {!currentUser ? (
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#2563EB', mb: 1 }}>
            <User size={22} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
            Sign In Required to Chat with Ask AI
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, px: 2 }}>
            Please sign in to your SalemSeva account so Ask AI can locate your assigned technicians, track active bookings, and check payment receipts.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onClose();
              if (typeof openAuthModal === 'function') openAuthModal();
            }}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            Sign In to SalemSeva
          </Button>
        </Box>
      ) : (
        <>
          {/* Quick Suggestion Chips */}
          <Box sx={{ px: 2, py: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 1, overflowX: 'auto' }}>
            {quickSuggestions.map((text, idx) => (
              <Chip
                key={idx}
                label={text}
                size="small"
                clickable
                onClick={() => handleSendMessage(text)}
                sx={{
                  fontSize: '0.75rem',
                  bgcolor: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                  '&:hover': { bgcolor: '#E2E8F0' }
                }}
              />
            ))}
          </Box>

          {/* Input Bar */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {/* Voice Input Button */}
            {isRecording ? (
              <IconButton
                onClick={stopRecording}
                sx={{
                  bgcolor: '#DC2626',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#B91C1C' }
                }}
                aria-label="Stop recording"
              >
                <Square size={18} />
              </IconButton>
            ) : (
              <IconButton
                onClick={startRecording}
                disabled={isLoading}
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A' }
                }}
                aria-label="Voice input"
              >
                <Mic size={18} />
              </IconButton>
            )}

            {/* Text Input Field */}
            <TextField
              fullWidth
              size="small"
              placeholder={isRecording ? 'Listening to speech...' : 'Type your question here...'}
              value={inputValue}
              disabled={isRecording || isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8FAFC'
                }
              }}
            />

            {/* Send Button */}
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || isRecording}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#1D4ED8' },
                '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
              }}
              aria-label="Send message"
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </>
      )}
    </Dialog>
  );
}
