import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Button
} from '@mui/material';
import { ArrowLeft, Phone, Lock, Send, ShieldCheck } from 'lucide-react';
import { API_V1_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function BookingChatPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role === 'technician' || user?.role === 'partner' ? 'technician' : 'customer';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const scrollRef = useRef(null);

  // Fetch booking details for header info
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

  // Poll real-time messages
  useEffect(() => {
    if (!bookingId) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/messages`);
        const data = await res.json();
        if (data.success && isMounted) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.warn('Chat poll error:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [bookingId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customText) => {
    const textToSend = (customText || input || '').trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    setInput('');

    const mySenderName = userRole === 'customer' ? 'Customer' : 'Technician';

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: userRole,
      senderName: mySenderName,
      text: textToSend,
      time: 'Just now',
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch(`${API_V1_URL}/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: userRole,
          senderName: mySenderName,
          text: textToSend
        })
      });
      const res = await fetch(`${API_V1_URL}/bookings/${bookingId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.warn('Send message error:', e);
    } finally {
      setIsSending(false);
    }
  };

  const partnerName = bookingInfo?.technician_name || 'Assigned Partner';
  const partnerRole = bookingInfo?.service_title || 'Service Specialist';

  const quickReplies =
    userRole === 'customer'
      ? [
          'I am waiting at the doorstep',
          'Near Salem Co-op Bank 5th Cross',
          'Please bring diagnostic spare parts',
          'Please call once arrived at gate'
        ]
      : [
          'En route on two-wheeler (approx 5 mins)',
          'Arrived at your doorstep in Fairlands',
          'Spare parts and diagnostic kit ready',
          'Testing appliance operations now'
        ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(userRole === 'technician' ? '/partner' : `/track?bookingId=${bookingId}`);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        bgcolor: '#F8FAFC',
        overflow: 'hidden'
      }}
    >
      {/* App Bar / Top Navigation */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Back to tracking"
            sx={{
              color: '#0F172A',
              bgcolor: '#F1F5F9',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#E2E8F0' }
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>

          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#0A66C2',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            {partnerName.substring(0, 2).toUpperCase()}
          </Avatar>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  fontSize: '14px',
                  lineHeight: 1.2
                }}
              >
                {partnerName}
              </Typography>
              <ShieldCheck size={14} color="#059669" />
            </Box>
            <Typography
              sx={{
                color: '#64748B',
                fontSize: '11px',
                lineHeight: 1.2
              }}
            >
              {partnerRole} • Booking #{bookingId}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => navigate(`/call/${bookingId}`)}
          size="small"
          aria-label="Start audio call"
          sx={{
            bgcolor: '#EFF6FF',
            color: '#0A66C2',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            width: 38,
            height: 38,
            '&:hover': { bgcolor: '#DBEAFE' }
          }}
        >
          <Phone size={18} />
        </IconButton>
      </Box>

      {/* Privacy Notice Banner */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          px: 2,
          py: 0.75,
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Chip
          icon={<Lock size={12} color="#64748B" />}
          label="Masked end-to-end communication • Zero phone number disclosure"
          size="small"
          sx={{
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '11px',
            height: 24,
            borderRadius: '9999px'
          }}
        />
      </Box>

      {/* Message Stream */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              py: 6,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                bgcolor: '#EFF6FF',
                color: '#0A66C2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <ShieldCheck size={28} />
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                fontSize: '15px',
                mb: 0.5
              }}
            >
              Secure Masked Messaging
            </Typography>
            <Typography
              sx={{
                color: '#64748B',
                maxWidth: 320,
                fontSize: '13px',
                lineHeight: 1.5
              }}
            >
              Send updates directly to your assigned technician. Personal phone numbers remain masked for privacy.
            </Typography>
          </Box>
        ) : (
          messages.map((m) => {
            const isMe = m.sender === userRole;
            return (
              <Box
                key={m.id}
                sx={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  bgcolor: isMe ? '#0A66C2' : '#FFFFFF',
                  color: isMe ? '#FFFFFF' : '#0F172A',
                  px: 1.75,
                  py: 1.25,
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  border: isMe ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                }}
              >
                {!isMe && (
                  <Typography
                    sx={{
                      color: '#0A66C2',
                      fontWeight: 600,
                      fontSize: '11px',
                      mb: 0.25
                    }}
                  >
                    {m.senderName || partnerName}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '13px', lineHeight: 1.45, wordBreak: 'break-word' }}>
                  {m.text}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: isMe ? 'rgba(255, 255, 255, 0.8)' : '#94A3B8',
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5
                  }}
                >
                  {m.time}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>

      {/* Quick Reply Chips */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0
        }}
      >
        {quickReplies.map((qr) => (
          <Chip
            key={qr}
            label={qr}
            size="small"
            onClick={() => handleSend(qr)}
            sx={{
              fontSize: '12px',
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              cursor: 'pointer',
              flexShrink: 0,
              height: 30,
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE' }
            }}
          />
        ))}
      </Box>

      {/* Message Composer */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexShrink: 0
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type message in Tamil / English..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '13px',
              bgcolor: '#F8FAFC'
            }
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          sx={{
            bgcolor: '#0A66C2',
            color: '#FFFFFF',
            borderRadius: '12px',
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': { bgcolor: '#084E96' },
            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
          }}
        >
          {isSending ? (
            <CircularProgress size={18} sx={{ color: '#FFF' }} />
          ) : (
            <Send size={18} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}
