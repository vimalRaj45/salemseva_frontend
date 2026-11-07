/**
 * Domain:           Home Services Marketplace / AI Customer Support
 * Audience & tone:  Salem residents & service partners; reassuring, fast, dependable, professional
 * Mood:             "Precise & Warm"
 * Motion depth:     Subtle feedback (smooth bubble transitions, gentle audio waveform indicator)
 * Layout family:    App Shell with Sticky Header + Scrollable Chat Stream + Docked Command Bar
 * Reference anchor: High-end conversational assistant with live transactional status widgets
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  ArrowLeft,
  Bot,
  User,
  Send,
  Mic,
  Square,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldAlert,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LogIn
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

export default function AskAiPage() {
  const navigate = useNavigate();
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
  const inputRef = useRef(null);

  const isTechnician = currentUser?.role === 'technician' || currentUser?.role === 'partner';
  const role = isTechnician ? 'technician' : 'customer';

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

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch live ops contact info once
  useEffect(() => {
    async function loadOpsContact() {
      try {
        const res = await fetch(`${API_V1_URL}/support/ops-contact`);
        if (res.ok) {
          const data = await res.json();
          if (data?.opsContact) setOpsContact(data.opsContact);
        }
      } catch (err) {
        console.warn('[Ask AI Page] Ops contact fetch error:', err.message);
      }
    }
    loadOpsContact();
  }, []);

  // Initialize Welcome Message
  useEffect(() => {
    if (!currentUser) {
      setMessages([
        {
          id: 'welcome_unauth',
          sender: 'bot',
          text: 'Welcome to Ask AI. This assistant connects directly to your live bookings, technician GPS updates, and service receipts in Salem. Please sign in to your account to get started.',
          isAuthBarrier: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const userName = currentUser?.full_name || currentUser?.name || 'Customer';
    const welcomeText = isTechnician
      ? `Hello Specialist ${userName}, I am your Shazu One Field Support Assistant. Ask me about your assigned jobs, schedule, or technician payouts in Salem.`
      : `Hello ${userName}, I am your Shazu One Support Assistant. How can I assist you with your booking, payment, or technician today?`;

    setMessages([
      {
        id: 'welcome_auth',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentUser, isTechnician]);

  // Voice Recording Handlers
  const startRecording = async () => {
    if (!currentUser) {
      toast.error('Please sign in to record a voice query.');
      if (typeof openAuthModal === 'function') openAuthModal();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

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
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[Ask AI Voice] Microphone access error:', err);
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

  // Send Audio Payload
  const handleSendAudio = async (base64Audio) => {
    const userMsgId = `msg_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: 'Voice query recorded and transcribing...',
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
          userName: currentUser?.full_name || currentUser?.name || 'Customer'
        })
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: 'Our voice assistant line is currently synchronizing with the central dispatch network. You can type your request or connect directly with our Salem Operations desk below:',
            escalateToOps: true,
            opsContact: opsContact || DEFAULT_OPS_CONTACT,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await res.json();

      if (data.transcribedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId ? { ...m, text: `"${data.transcribedText}"` } : m
          )
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Support response received.',
          booking: data.booking || null,
          escalateToOps: Boolean(data.escalateToOps),
          opsContact: data.opsContact || opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('[Ask AI Voice] Dispatch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Our AI support assistant is currently at high demand. Our dedicated Salem Operations team is standing by to help you directly right now.',
          escalateToOps: true,
          opsContact: opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Text Payload
  const handleSendMessage = async (textToSend = null) => {
    const query = String(textToSend !== null ? textToSend : inputValue).trim();
    if (!query) return;

    if (!currentUser) {
      toast.error('Please sign in to chat with Ask AI.');
      if (typeof openAuthModal === 'function') openAuthModal();
      return;
    }

    setInputValue('');
    const userMsgId = `msg_${Date.now()}`;

    setMessages((prev) => [
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
          userName: currentUser?.full_name || currentUser?.name || 'Customer'
        })
      });

      if (!res.ok) {
        setMessages((prev) => [
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

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || 'Support response received.',
          booking: data.booking || null,
          escalateToOps: Boolean(data.escalateToOps),
          opsContact: data.opsContact || opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('[Ask AI Text] Dispatch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Our AI support assistant is currently at high demand. Our dedicated Salem Operations team is standing by to help you directly right now.',
          escalateToOps: true,
          opsContact: opsContact || DEFAULT_OPS_CONTACT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #021636 0%, #061F4A 40%, #0B192C 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 8, md: 9 }, // clear fixed navbar
        pb: 2
      }}
    >
      {/* Container Card */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: '920px',
          mx: 'auto',
          px: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sticky App Header Bar */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 3,
            background: 'rgba(2, 47, 110, 0.45)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => navigate(-1)}
              aria-label="Back"
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' }
              }}
            >
              <ArrowLeft size={18} />
            </IconButton>

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#0A5CC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(10, 92, 196, 0.5)'
              }}
            >
              <Bot size={22} color="#FFFFFF" />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '15px' }}>
                  Ask AI Assistant
                </Typography>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#2B9236',
                    boxShadow: '0 0 8px #2B9236'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px' }}>
                Instant Service & Dispatch Support (Salem)
              </Typography>
            </Box>
          </Box>

          <Button
            component="a"
            href={`tel:${opsContact.phone}`}
            startIcon={<Phone size={14} />}
            variant="outlined"
            size="small"
            sx={{
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              px: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#2B9236',
                bgcolor: 'rgba(43, 146, 54, 0.15)'
              }
            }}
          >
            Call Desk
          </Button>
        </Paper>

        {/* Chat Thread Surface */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            background: 'rgba(2, 22, 54, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            minHeight: '480px'
          }}
        >
          {/* Messages Scroll Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              overflowY: 'auto',
              maxHeight: { xs: 'calc(100vh - 280px)', md: 'calc(100vh - 300px)' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Quick Suggestion Chips */}
            {currentUser && messages.length <= 2 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1, display: 'block', fontWeight: 600 }}>
                  Suggested queries:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickSuggestions.map((suggestion, idx) => (
                    <Chip
                      key={idx}
                      label={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      sx={{
                        bgcolor: 'rgba(10, 92, 196, 0.2)',
                        color: '#93C5FD',
                        border: '1px solid rgba(147, 197, 253, 0.2)',
                        fontWeight: 500,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(10, 92, 196, 0.4)',
                          borderColor: '#60A5FA'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Render Messages */}
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '100%'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.25,
                      maxWidth: { xs: '90%', sm: '80%' },
                      flexDirection: isBot ? 'row' : 'row-reverse'
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: isBot ? '#0A5CC4' : '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.5,
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      {isBot ? <Bot size={17} color="#FFFFFF" /> : <User size={17} color="#94A3B8" />}
                    </Box>

                    <Box
                      sx={{
                        p: { xs: 1.75, sm: 2 },
                        borderRadius: 3,
                        borderTopLeftRadius: isBot ? 1 : 12,
                        borderTopRightRadius: isBot ? 12 : 1,
                        bgcolor: isBot ? 'rgba(15, 30, 54, 0.9)' : '#0A5CC4',
                        color: '#FFFFFF',
                        border: isBot ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        boxShadow: isBot
                          ? '0 4px 12px rgba(0, 0, 0, 0.25)'
                          : '0 4px 12px rgba(10, 92, 196, 0.35)'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '14px',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          fontWeight: 400
                        }}
                      >
                        {msg.text}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.75,
                          fontSize: '10.5px',
                          color: isBot ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.7)',
                          textAlign: isBot ? 'left' : 'right'
                        }}
                      >
                        {msg.timestamp}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Auth Barrier Card */}
                  {msg.isAuthBarrier && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(2, 47, 110, 0.4)',
                        border: '1px solid rgba(10, 92, 196, 0.4)',
                        maxWidth: '480px'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#93C5FD' }}>
                        Sign In Required to Chat with Ask AI
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                        Ask AI retrieves your real-time booking status, assigned technician contact, and verified invoices in Salem. Sign in to your account with your mobile number to access.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<LogIn size={16} />}
                        onClick={() => {
                          if (typeof openAuthModal === 'function') openAuthModal();
                          else navigate('/login');
                        }}
                        sx={{
                          bgcolor: '#0A5CC4',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#0A86EC' }
                        }}
                      >
                        Sign In with Phone
                      </Button>
                    </Box>
                  )}

                  {/* Real-time Booking Card */}
                  {msg.booking && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(10, 92, 196, 0.15)',
                        border: '1px solid rgba(10, 92, 196, 0.35)',
                        maxWidth: '460px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13.5px' }}>
                          Booking #{msg.booking.id}
                        </Typography>
                        <Chip
                          label={msg.booking.status}
                          size="small"
                          sx={{
                            bgcolor: '#2B9236',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '11px',
                            height: '22px'
                          }}
                        />
                      </Box>

                      {msg.booking.technicianName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                          <CheckCircle2 size={15} color="#2B9236" />
                          <Typography variant="body2" sx={{ fontSize: '13px', color: '#E2E8F0' }}>
                            Specialist: <strong>{msg.booking.technicianName}</strong>
                          </Typography>
                          {msg.booking.technicianPhone && (
                            <Typography
                              component="a"
                              href={`tel:${msg.booking.technicianPhone}`}
                              variant="body2"
                              sx={{
                                color: '#93C5FD',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '12px',
                                ml: 'auto'
                              }}
                            >
                              Call Specialist
                            </Typography>
                          )}
                        </Box>
                      )}

                      {msg.booking.locality && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MapPin size={15} color="#94A3B8" />
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                            Locality: {msg.booking.locality}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Salem Operations Escalation Desk Card */}
                  {msg.escalateToOps && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(2, 47, 110, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        maxWidth: '480px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ShieldAlert size={16} color="#38BDF8" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>
                          Salem Operations Support Desk
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 1.5, fontSize: '12px' }}>
                        Connect directly with our live dispatchers for emergency overrides, cancellations, or booking modifications:
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                        <Button
                          component="a"
                          href={`tel:${msg.opsContact?.phone || opsContact.phone}`}
                          variant="contained"
                          size="small"
                          startIcon={<Phone size={14} />}
                          sx={{
                            bgcolor: '#0F172A',
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#1E293B' }
                          }}
                        >
                          Call Desk
                        </Button>

                        <Button
                          component="a"
                          href={msg.opsContact?.whatsappUrl || opsContact.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          size="small"
                          startIcon={<MessageCircle size={14} />}
                          sx={{
                            bgcolor: '#2B9236',
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#22782B' }
                          }}
                        >
                          WhatsApp
                        </Button>
                      </Box>

                      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                        Operating Hours: {msg.opsContact?.hours || opsContact.hours}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#0A5CC4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={17} color="#FFFFFF" />
                </Box>
                <Paper
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 3,
                    bgcolor: 'rgba(15, 30, 54, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <CircularProgress size={16} sx={{ color: '#60A5FA' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '13px' }}>
                    Consulting Salem dispatch records...
                  </Typography>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Bottom Docked Input Command Bar */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              background: 'rgba(2, 47, 110, 0.5)',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {isRecording ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#EF4444',
                      animation: 'pulse 1.2s infinite'
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#FCA5A5', fontSize: '13.5px' }}>
                    Recording voice query: {formatTimer(recordingSeconds)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<Square size={14} />}
                  onClick={stopRecording}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '12px',
                    borderRadius: 2
                  }}
                >
                  Done & Send
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={startRecording}
                  disabled={isLoading}
                  title="Speak voice query (Whisper STT)"
                  aria-label="Speak voice query"
                  sx={{
                    color: '#93C5FD',
                    bgcolor: 'rgba(10, 92, 196, 0.25)',
                    border: '1px solid rgba(147, 197, 253, 0.2)',
                    p: 1.25,
                    '&:hover': {
                      bgcolor: 'rgba(10, 92, 196, 0.45)',
                      borderColor: '#60A5FA'
                    }
                  }}
                >
                  <Mic size={19} />
                </IconButton>

                <TextField
                  inputRef={inputRef}
                  fullWidth
                  size="small"
                  placeholder={
                    currentUser
                      ? "Ask about your technician, booking, or home services in Salem..."
                      : "Sign in to chat with Ask AI..."
                  }
                  value={inputValue}
                  disabled={isLoading || !currentUser}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 3,
                      fontSize: '13.5px',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.15)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0A5CC4',
                        borderWidth: '1.5px'
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      opacity: 1
                    }
                  }}
                />

                <IconButton
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim() || !currentUser}
                  aria-label="Send message"
                  sx={{
                    color: '#FFFFFF',
                    bgcolor: inputValue.trim() ? '#0A5CC4' : 'rgba(255, 255, 255, 0.08)',
                    p: 1.25,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: inputValue.trim() ? '#0A86EC' : 'rgba(255, 255, 255, 0.15)'
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  <Send size={19} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

