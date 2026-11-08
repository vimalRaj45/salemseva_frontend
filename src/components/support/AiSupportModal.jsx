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
  const isTechnician = Boolean(
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/partner')) ||
    techUser ||
    (user && (user.role === 'technician' || user.role === 'partner'))
  );
  const currentUser = isTechnician ? (techUser || user) : user;
  const role = isTechnician ? 'technician' : 'customer';

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

  // Quick suggestions based on role
  const quickSuggestions = isTechnician
    ? [
      "Today's assigned jobs",
      "Check my payout balance",
      "Check my support ticket status",
      "Talk to Salem Ops desk"
    ]
    : [
      "Where is my technician?",
      "Show my booking status",
      "Check my support ticket status",
      "Cancellation and refund rules"
    ];

  // Initial welcome message
  useEffect(() => {
    if (open) {
      if (!currentUser) {
        setMessages([
          {
            id: 'welcome_login',
            sender: 'bot',
            text: 'Hello! Ask AI is reserved for logged-in Shazu One users. Please sign in so I can check your technician location, active bookings, and service receipts.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (messages.length === 0 || messages[0]?.id === 'welcome_login') {
        const rawName = (currentUser?.name || currentUser?.full_name || '').trim();
        const formattedName = rawName && rawName.toLowerCase() !== 'customer'
          ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
          : 'there';

        const welcome = isTechnician
          ? `Hello ${formattedName}! I am your Shazu One Field Support Assistant. How can I assist you with your assigned dispatches, schedules, or payouts today?`
          : `Hello ${formattedName}! I am Ask AI, your personal Shazu One assistant. How can I assist you with your booking, assigned technician, or doorstep service today?`;

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
          userId: currentUser?.id || 'guest',
          userPhone: currentUser?.phone || '',
          userName: currentUser?.name || currentUser?.full_name || 'User'
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

      const isTicketInquiry = /ticket|complaint|issue|support\s*case/i.test(data.transcribedText || '');
      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Hello! I am Ask AI, your Shazu One support assistant. How can I assist you with your booking or technician today?',
          activeBooking: data.activeBooking || null,
          recentCompletedBooking: data.recentCompletedBooking || null,
          recentTicket: (isTicketInquiry && data.recentTicket) ? data.recentTicket : null,
          booking: data.activeBooking || data.booking || null,
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
          userId: currentUser?.id || 'guest',
          userPhone: currentUser?.phone || '',
          userName: currentUser?.name || currentUser?.full_name || 'User'
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

      const isTicketInquiry = /ticket|complaint|issue|support\s*case/i.test(data.transcribedText || '');
      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Hello! I am Ask AI, your Shazu One support assistant. How can I assist you with your booking or technician today?',
          activeBooking: data.activeBooking || null,
          recentCompletedBooking: data.recentCompletedBooking || null,
          recentTicket: (isTicketInquiry && data.recentTicket) ? data.recentTicket : null,
          booking: data.activeBooking || data.booking || null,
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
          borderRadius: { xs: 0, sm: 3 },
          height: { xs: '100dvh', sm: '660px' },
          maxHeight: { xs: '100dvh', sm: '660px' },
          m: { xs: 0, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: '#0F172A',
          color: '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: '#1D6FE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 12px rgba(29, 111, 229, 0.5)'
            }}
          >
            <Bot size={22} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                Ask AI
              </Typography>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.2, borderRadius: '10px', bgcolor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
                <Typography sx={{ color: '#4ADE80', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px' }}>
                  LIVE RAG
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11.5px', display: 'block', mt: 0.2 }}>
              {isTechnician ? 'Salem Technician Operations Desk' : 'Verified Booking & Technician Support'}
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
          p: { xs: 1.5, sm: 2 },
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#F8FAFC'
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1.2,
                maxWidth: { xs: '88%', sm: '82%' },
                alignItems: 'flex-start',
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: msg.sender === 'user' ? '#0F172A' : '#1D6FE5',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.3,
                  boxShadow: msg.sender === 'user' ? 'none' : '0 2px 6px rgba(29, 111, 229, 0.25)'
                }}
              >
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
              </Box>

              {/* Message Bubble */}
              <Box
                sx={{
                  p: { xs: 1.3, sm: 1.6 },
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, #1D6FE5 0%, #1558B0 100%)'
                    : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  boxShadow: msg.sender === 'user'
                    ? '0 3px 10px rgba(29, 111, 229, 0.25)'
                    : '0 2px 8px rgba(15, 23, 42, 0.04)',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.55, fontSize: { xs: '0.86rem', sm: '0.92rem' } }}>
                  {msg.text}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.6,
                    fontSize: '0.68rem',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.75)' : '#94A3B8',
                    fontWeight: 500
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Box>
            </Box>

            {/* Salem Ops Emergency Card if escalated or AI unavailable */}
            {msg.escalateToOps && (
              <Box sx={{ mt: 1.5, width: '100%', maxWidth: { xs: '96%', sm: '88%' } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.6, sm: 2 },
                    borderRadius: 2.5,
                    border: '1px solid #CBD5E1',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Headphones size={18} color="#1D6FE5" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                      Salem Operations Support Desk
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 1.8, lineHeight: 1.45 }}>
                    Connect directly with our live dispatchers for emergency overrides, cancellations, or booking modifications:
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mb: 1.2 }}>
                    <Button
                      variant="contained"
                      component="a"
                      href={`tel:${msg.opsContact?.phone || '+918807099288'}`}
                      startIcon={<Phone size={16} />}
                      sx={{
                        bgcolor: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        py: 1,
                        borderRadius: 2,
                        minHeight: 44,
                        '&:hover': { bgcolor: '#1E293B' }
                      }}
                    >
                      Call Desk ({msg.opsContact?.phone || '+918807099288'})
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
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.82rem',
                        py: 1,
                        borderRadius: 2,
                        minHeight: 44,
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      Chat on WhatsApp
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B' }}>
                    <Clock size={12} />
                    <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
                      Operating Hours: {msg.opsContact?.hours || '8:00 AM - 9:00 PM IST (All 7 Days)'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        ))}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', width: 'fit-content' }}>
            <CircularProgress size={16} sx={{ color: '#1D6FE5' }} />
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
              Checking your live booking & technician details...
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
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#991B1B', fontSize: '0.85rem' }}>
                Listening to voice query ({recordingSeconds}s)...
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={stopRecording}
              startIcon={<Square size={14} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, minHeight: 36 }}
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
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#1D6FE5', mb: 1 }}>
            <User size={22} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
            Sign In Required to Chat with Ask AI
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, px: 2 }}>
            Please sign in to your Shazu One account so Ask AI can locate your assigned technicians, track active bookings, and check payment receipts.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onClose();
              if (typeof openAuthModal === 'function') openAuthModal();
            }}
            sx={{
              bgcolor: '#1D6FE5',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              py: 1.1,
              minHeight: 44,
              '&:hover': { bgcolor: '#1558B0' }
            }}
          >
            Sign In to Shazu One
          </Button>
        </Box>
      ) : (
        <>
          {/* Quick Suggestion Chips */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: 1,
              bgcolor: '#FFFFFF',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 }
            }}
          >
            {quickSuggestions.map((text, idx) => (
              <Chip
                key={idx}
                label={text}
                size="small"
                clickable
                onClick={() => handleSendMessage(text)}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  height: 28,
                  '&:hover': { bgcolor: '#EDF2F7', borderColor: '#CBD5E1' }
                }}
              />
            ))}
          </Box>

          {/* Input Bar */}
          <Box
            sx={{
              p: { xs: 1.25, sm: 1.6 },
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
                  width: 42,
                  height: 42,
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
                  width: 42,
                  height: 42,
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
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  '& fieldset': {
                    borderColor: '#E2E8F0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#CBD5E1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1D6FE5'
                  }
                }
              }}
            />

            {/* Send Button */}
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading || isRecording}
              sx={{
                bgcolor: '#1D6FE5',
                color: '#FFFFFF',
                width: 42,
                height: 42,
                boxShadow: inputValue.trim() ? '0 2px 8px rgba(29, 111, 229, 0.35)' : 'none',
                '&:hover': { bgcolor: '#1558B0' },
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
