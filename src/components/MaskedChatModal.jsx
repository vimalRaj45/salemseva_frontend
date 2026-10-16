import { API_V1_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  IconButton,
  TextField,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Shield, Send, Lock } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

export default function MaskedChatModal({
  open,
  onClose,
  bookingId = '',
  userRole = 'customer',
  peerName = 'Assigned Partner',
  peerSubtitle = 'Verified Salem Specialist'
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Poll real-time messages from backend
  useEffect(() => {
    if (!open) return;
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
    const interval = setInterval(fetchMessages, 800);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [open, bookingId]);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

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

  const quickReplies = userRole === 'customer' ? [
    'I am waiting at the doorstep',
    'Near Salem Co-op Bank 5th Cross',
    'Please bring AC capacitor',
    'Please call once arrived'
  ] : [
    'En route now on two-wheeler (5 mins)',
    'At your doorstep in Fairlands',
    'Spare parts and diagnostic kit ready',
    'Testing AC airflow & compressor'
  ];

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm" ariaLabelledBy="chat-modal-title">
      <ModalHeader
        id="chat-modal-title"
        title={peerName}
        subtitle={`Masked privacy relay • Booking #${bookingId}`}
        onClose={onClose}
        icon={
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0A66C2', fontWeight: 700, fontSize: '13px' }}>
            {peerName.substring(0, 2).toUpperCase()}
          </Avatar>
        }
      />

      <ModalBody
        ref={scrollRef}
        sx={{
          bgcolor: '#F8FAFC',
          gap: 1.5,
          minHeight: 280,
          maxHeight: '52vh'
        }}
      >
        {/* Encrypted Notice Banner */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            icon={<Lock size={12} color="#64748B" />}
            label="Masked end-to-end communication • Zero phone number disclosure"
            size="small"
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              fontSize: '11px',
              height: 24,
              borderRadius: '9999px'
            }}
          />
        </Box>

        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                color: '#0A66C2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5
              }}
            >
              <Shield size={24} />
            </Box>
            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', mb: 0.5 }}>
              Secure masked messaging
            </Typography>
            <Typography sx={{ color: '#64748B', maxWidth: 280, fontSize: '12px', lineHeight: 1.4 }}>
              Send real-time updates safely. Your mobile number and partner details remain completely private.
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
                  px: 1.5,
                  py: 1,
                  borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  border: isMe ? 'none' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                }}
              >
                {!isMe && (
                  <Typography sx={{ color: '#0A66C2', fontWeight: 600, fontSize: '11px', mb: 0.2 }}>
                    {m.senderName || peerName}
                  </Typography>
                )}
                <Typography sx={{ fontSize: '13px', lineHeight: 1.4 }}>
                  {m.text}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: isMe ? 'rgba(255, 255, 255, 0.8)' : '#94A3B8',
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.3
                  }}
                >
                  {m.time}
                </Typography>
              </Box>
            );
          })
        )}
      </ModalBody>

      {/* Quick Replies */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {quickReplies.map((qr) => (
          <Chip
            key={qr}
            label={qr}
            size="small"
            onClick={() => handleSend(qr)}
            sx={{
              fontSize: '11px',
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              cursor: 'pointer',
              flexShrink: 0,
              height: 28,
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE' }
            }}
          />
        ))}
      </Box>

      {/* Input Action Bar */}
      <ModalFooter sx={{ flexDirection: 'row !important', p: 1.5, gap: 1 }}>
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
      </ModalFooter>
    </Modal>
  );
}
