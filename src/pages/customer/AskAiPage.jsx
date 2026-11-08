/**
 * Domain:           Home Services Marketplace / AI Customer Support
 * Audience & tone:  Salem residents & service partners; direct, concise, factual, dependable
 * Mood:             "Warm & Precise"
 * Motion depth:     Subtle feedback (smooth bubble transitions, clean card surfaces)
 * Layout family:    App Shell with Sticky Header + Scrollable Chat Stream + Docked Command Bar
 * Reference anchor: Stripe / Linear support assistant grounded in design tokens
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
  LifeBuoy,
  ShieldAlert,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

const THEME = {
  primaryBlue: '#0D3B66',
  secondaryGreen: '#2E7D32',
  accentOrange: '#F7931E',
  lightGreen: '#A5D6A7',
  background: '#E8F5E9',
  text: '#546E7A'
};

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
  const inputRef = useRef(null);

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
          text: 'Welcome to Ask AI. I connect directly to your live bookings, technician dispatches, and support tickets in Salem. How can I assist you today?',
          isAuthBarrier: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const rawName = (currentUser?.full_name || currentUser?.name || '').trim();
    const formattedName = rawName && !['tech', 'customer', 'user', 'guest'].includes(rawName.toLowerCase())
      ? rawName
      : (isTechnician ? 'Partner' : 'there');

    const welcomeText = isTechnician
      ? `Hello ${formattedName}! I am your Shazu One Field Support Assistant. Ask about your assigned jobs, dispatch schedule, or partner payouts in Salem.`
      : `Hello ${formattedName}! I am your Shazu One Support Assistant. Ask about your booking status, assigned specialist, or support tickets.`;

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
          userName: currentUser?.full_name || currentUser?.name || 'Customer'
        })
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: 'Our voice assistant is synchronizing with Salem dispatch. You can type your question or call our operations desk below:',
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

      const isTicketInquiry = /ticket|complaint|issue|support\s*case/i.test(data.transcribedText || '');
      setMessages((prev) => [
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
      console.error('[Ask AI Voice] Dispatch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Network connection unavailable. Our Salem Operations team is standing by to help you directly.',
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
            text: 'Our AI cloud assistant is currently updating with central dispatch. Connect directly with our Salem Operations desk below:',
            escalateToOps: true,
            opsContact: opsContact || DEFAULT_OPS_CONTACT,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await res.json();

      const isTicketInquiry = /ticket|complaint|issue|support\s*case/i.test(data.transcribedText || '');
      setMessages((prev) => [
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
      console.error('[Ask AI Text] Dispatch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: 'Our AI support connection is momentarily busy. Our Salem Operations team is ready to assist you directly.',
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
        backgroundColor: THEME.background,
        color: THEME.primaryBlue,
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 8, md: 9.5 },
        pb: 3,
        boxSizing: 'border-box'
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
            backgroundColor: '#FFFFFF',
            border: `1px solid ${THEME.lightGreen}`,
            boxShadow: '0 2px 10px rgba(13, 59, 102, 0.05)',
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
                color: THEME.primaryBlue,
                bgcolor: '#F1F5F9',
                '&:hover': { bgcolor: '#E2E8F0' }
              }}
            >
              <ArrowLeft size={18} />
            </IconButton>

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: THEME.primaryBlue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(13, 59, 102, 0.25)'
              }}
            >
              <Bot size={22} color="#FFFFFF" />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: THEME.primaryBlue, fontSize: '15px' }}>
                  Ask AI Assistant
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: THEME.secondaryGreen,
                    boxShadow: `0 0 6px ${THEME.secondaryGreen}`
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: THEME.text, fontSize: '12px', fontWeight: 500 }}>
                Instant Service & Support (Salem Central Dispatch)
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
              color: THEME.secondaryGreen,
              borderColor: THEME.secondaryGreen,
              bgcolor: '#F0FDF4',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '12px',
              px: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: THEME.secondaryGreen,
                bgcolor: '#DCFCE7'
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
            backgroundColor: '#FFFFFF',
            border: `1px solid ${THEME.lightGreen}`,
            boxShadow: '0 4px 20px -2px rgba(13, 59, 102, 0.06)',
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
              gap: 2,
              backgroundColor: '#FAFCFA'
            }}
          >
            {/* Quick Suggestion Chips */}
            {messages.length <= 2 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: THEME.text, mb: 1, display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '11px' }}>
                  Frequently Asked Questions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickSuggestions.map((suggestion, idx) => (
                    <Chip
                      key={idx}
                      label={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      sx={{
                        bgcolor: '#F0FDF4',
                        color: THEME.primaryBlue,
                        border: `1px solid ${THEME.lightGreen}`,
                        fontWeight: 600,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: THEME.background,
                          borderColor: THEME.secondaryGreen
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
                      maxWidth: { xs: '90%', sm: '82%' },
                      flexDirection: isBot ? 'row' : 'row-reverse'
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: isBot ? THEME.primaryBlue : THEME.secondaryGreen,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.5,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isBot ? <Bot size={17} color="#FFFFFF" /> : <User size={17} color="#FFFFFF" />}
                    </Box>

                    <Box
                      sx={{
                        p: { xs: 1.75, sm: 2 },
                        borderRadius: 3,
                        borderTopLeftRadius: isBot ? 1 : 12,
                        borderTopRightRadius: isBot ? 12 : 1,
                        bgcolor: isBot ? '#FFFFFF' : THEME.primaryBlue,
                        color: isBot ? '#1E293B' : '#FFFFFF',
                        border: isBot ? `1px solid ${THEME.lightGreen}` : 'none',
                        boxShadow: isBot
                          ? '0 2px 10px rgba(13, 59, 102, 0.05)'
                          : '0 3px 12px rgba(13, 59, 102, 0.25)'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '14px',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          fontWeight: 500,
                          color: isBot ? '#1E293B' : '#FFFFFF'
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
                          color: isBot ? THEME.text : 'rgba(255, 255, 255, 0.75)',
                          textAlign: isBot ? 'left' : 'right',
                          fontWeight: 600
                        }}
                      >
                        {msg.timestamp}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 1. Active In-Progress Booking Card */}
                  {msg.activeBooking && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#F0FDF4',
                        border: `1px solid ${THEME.lightGreen}`,
                        maxWidth: '460px',
                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.08)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: THEME.primaryBlue, fontSize: '13.5px' }}>
                          Active Booking #{msg.activeBooking.id}
                        </Typography>
                        <Chip
                          label={String(msg.activeBooking.status || 'Active').replace(/_/g, ' ').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: THEME.secondaryGreen,
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '11px',
                            height: '22px'
                          }}
                        />
                      </Box>

                      {msg.activeBooking.technicianName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                          <CheckCircle2 size={15} color={THEME.secondaryGreen} />
                          <Typography variant="body2" sx={{ fontSize: '13px', color: '#1E293B' }}>
                            Specialist: <strong>{msg.activeBooking.technicianName}</strong>
                          </Typography>
                          {msg.activeBooking.technicianPhone && (
                            <Typography
                              component="a"
                              href={`tel:${msg.activeBooking.technicianPhone}`}
                              variant="body2"
                              sx={{
                                color: THEME.secondaryGreen,
                                textDecoration: 'none',
                                fontWeight: 700,
                                fontSize: '12px',
                                ml: 'auto'
                              }}
                            >
                              Call Specialist
                            </Typography>
                          )}
                        </Box>
                      )}

                      {msg.activeBooking.locality && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MapPin size={15} color={THEME.text} />
                          <Typography variant="caption" sx={{ color: THEME.text, fontSize: '12px' }}>
                            Locality: {msg.activeBooking.locality}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* 2. Completed Service Receipt Card (Never shows active allotment!) */}
                  {msg.recentCompletedBooking && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#FFFFFF',
                        border: `1px solid ${THEME.lightGreen}`,
                        maxWidth: '460px',
                        boxShadow: '0 2px 8px rgba(13, 59, 102, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle2 size={18} color={THEME.secondaryGreen} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: THEME.primaryBlue, fontSize: '13.5px' }}>
                            Service Completed & Closed
                          </Typography>
                        </Box>
                        <Chip
                          label="COMPLETED"
                          size="small"
                          sx={{
                            bgcolor: '#DCFCE7',
                            color: THEME.secondaryGreen,
                            fontWeight: 800,
                            fontSize: '10.5px',
                            height: '22px'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ fontSize: '12.5px', color: THEME.text, mb: 1 }}>
                        Booking #{msg.recentCompletedBooking.id} ({msg.recentCompletedBooking.serviceName}) was completed by Specialist {msg.recentCompletedBooking.technicianName}.
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                        <Typography variant="caption" sx={{ color: THEME.primaryBlue, fontWeight: 700, fontSize: '12px' }}>
                          Invoiced Total: ₹{msg.recentCompletedBooking.finalAmount}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => navigate('/')}
                          sx={{
                            color: THEME.primaryBlue,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            p: 0
                          }}
                        >
                          Book New Service &rarr;
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* 3. Live Support Ticket Progress Card */}
                  {msg.recentTicket && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#FFFFFF',
                        border: `1px solid ${THEME.lightGreen}`,
                        maxWidth: '460px',
                        boxShadow: '0 2px 8px rgba(13, 59, 102, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LifeBuoy size={17} color={THEME.primaryBlue} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: THEME.primaryBlue, fontSize: '13px' }}>
                            Support Ticket #{msg.recentTicket.ticketNumber}
                          </Typography>
                        </Box>
                        <Chip
                          label={String(msg.recentTicket.status || 'Active').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: msg.recentTicket.status === 'resolved' ? '#DCFCE7' : '#FEF3C7',
                            color: msg.recentTicket.status === 'resolved' ? THEME.secondaryGreen : THEME.accentOrange,
                            fontWeight: 800,
                            fontSize: '10.5px',
                            height: '22px'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" sx={{ fontSize: '12.5px', color: '#1E293B', fontWeight: 600, mb: 0.5 }}>
                        {msg.recentTicket.subject || 'Support Case'}
                      </Typography>

                      <Typography variant="caption" sx={{ color: THEME.text, display: 'block', fontSize: '11.5px' }}>
                        {msg.recentTicket.resolutionSummary || 'Salem Operations dispatch is actively tracking and reviewing this ticket.'}
                      </Typography>
                    </Box>
                  )}

                  {/* 4. Salem Operations Escalation Desk Card */}
                  {msg.escalateToOps && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: { xs: 0, sm: 5.5 },
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#FFFBEB',
                        border: '1px solid #FCD34D',
                        maxWidth: '480px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ShieldAlert size={16} color={THEME.accentOrange} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '13px' }}>
                          Salem Operations Support Desk
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: '#78350F', display: 'block', mb: 1.5, fontSize: '12px' }}>
                        Connect directly with our central Salem dispatchers for emergency overrides, cancellations, or booking queries:
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                        <Button
                          component="a"
                          href={`tel:${msg.opsContact?.phone || opsContact.phone}`}
                          variant="contained"
                          size="small"
                          startIcon={<Phone size={14} />}
                          sx={{
                            bgcolor: THEME.primaryBlue,
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '12px',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#0B2D4F' }
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
                            bgcolor: THEME.secondaryGreen,
                            color: '#FFFFFF',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '12px',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#226027' }
                          }}
                        >
                          WhatsApp
                        </Button>
                      </Box>

                      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: '#92400E', fontSize: '11px' }}>
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
                    bgcolor: THEME.primaryBlue,
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
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${THEME.lightGreen}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <CircularProgress size={16} sx={{ color: THEME.secondaryGreen }} />
                  <Typography variant="caption" sx={{ color: THEME.text, fontSize: '13px', fontWeight: 600 }}>
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
              backgroundColor: '#FFFFFF',
              borderTop: `1px solid ${THEME.lightGreen}`
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
                  bgcolor: '#FEF2F2',
                  border: '1px solid #FECACA'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: '#DC2626',
                      animation: 'pulse 1.2s infinite'
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#B91C1C', fontSize: '13.5px' }}>
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
                    fontWeight: 700,
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
                    color: THEME.primaryBlue,
                    bgcolor: THEME.background,
                    border: `1px solid ${THEME.lightGreen}`,
                    p: 1.25,
                    '&:hover': {
                      bgcolor: '#DCFCE7',
                      borderColor: THEME.secondaryGreen
                    }
                  }}
                >
                  <Mic size={19} />
                </IconButton>

                <TextField
                  inputRef={inputRef}
                  fullWidth
                  size="small"
                  placeholder="Ask about your technician, booking, tickets, or service rules..."
                  value={inputValue}
                  disabled={isLoading}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: THEME.primaryBlue,
                      bgcolor: '#F8FAFC',
                      borderRadius: 3,
                      fontSize: '13.5px',
                      '& fieldset': {
                        borderColor: THEME.lightGreen
                      },
                      '&:hover fieldset': {
                        borderColor: THEME.secondaryGreen
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: THEME.primaryBlue,
                        borderWidth: '1.5px'
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: THEME.text,
                      opacity: 1
                    }
                  }}
                />

                <IconButton
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Send message"
                  sx={{
                    color: '#FFFFFF',
                    bgcolor: inputValue.trim() ? THEME.primaryBlue : '#CBD5E1',
                    p: 1.25,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: inputValue.trim() ? '#0B2D4F' : '#94A3B8'
                    },
                    '&.Mui-disabled': {
                      color: '#FFFFFF',
                      bgcolor: '#E2E8F0'
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
