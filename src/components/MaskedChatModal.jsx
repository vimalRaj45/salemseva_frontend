import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';

export default function MaskedChatModal({
  open,
  onClose,
  bookingId = 'SLM-84920',
  userRole = 'customer', // 'customer' | 'technician'
  peerName = 'K. Ramesh',
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
        const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/messages`);
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

    const mySenderName = userRole === 'customer' ? 'Customer' : 'K. Ramesh (Technician)';

    // Optimistic UI insert
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
      await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: userRole,
          senderName: mySenderName,
          text: textToSend
        })
      });
      // Re-fetch instantly
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/messages`);
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
    'Please bring 45uF AC capacitor',
    'Please call once arrived'
  ] : [
    'En route now on two-wheeler (5 mins)',
    'At your doorstep in Fairlands',
    'Spare parts and diagnostic kit ready',
    'Testing AC airflow & compressor terminal'
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#F8FAFC',
          borderRadius: '16px',
          height: 520,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 1.5,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontWeight: 700, fontSize: '13px' }}>
            {peerName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13.5px', color: '#FFFFFF' }}>
              {peerName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: 0.4, fontSize: '10.5px' }}
            >
              <SecurityIcon sx={{ fontSize: 12 }} /> Masked Privacy Relay • Booking #{bookingId}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Messages Feed */}
      <DialogContent
        ref={scrollRef}
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
          overflowY: 'auto',
          bgcolor: '#F1F5F9'
        }}
      >
        {/* Encrypted Notice Banner */}
        <Box sx={{ textAlign: 'center', my: 0.5 }}>
          <Chip
            icon={<LockIcon sx={{ fontSize: 12, color: '#64748B !important' }} />}
            label="Masked end-to-end communication • Zero phone number disclosure"
            size="small"
            sx={{ bgcolor: '#E2E8F0', color: '#475569', fontSize: '10px', height: 22 }}
          />
        </Box>

        {messages.map((m) => {
          const isMe = m.sender === userRole;
          return (
            <Box
              key={m.id}
              sx={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                bgcolor: isMe ? '#2563EB' : '#FFFFFF',
                color: isMe ? '#FFFFFF' : '#0F172A',
                px: 1.5,
                py: 1,
                borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                border: isMe ? 'none' : '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)'
              }}
            >
              {!isMe && (
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, fontSize: '10.5px', display: 'block', mb: 0.2 }}>
                  {m.senderName || peerName}
                </Typography>
              )}
              <Typography variant="body2" sx={{ fontSize: '12.5px', lineHeight: 1.4 }}>
                {m.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '9.5px',
                  color: isMe ? 'rgba(255,255,255,0.75)' : '#94A3B8',
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.3
                }}
              >
                {m.time}
              </Typography>
            </Box>
          );
        })}
      </DialogContent>

      {/* Quick Replies */}
      <Box sx={{ px: 1.2, py: 0.8, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 0.6, overflowX: 'auto' }}>
        {quickReplies.map((qr) => (
          <Chip
            key={qr}
            label={qr}
            size="small"
            onClick={() => handleSend(qr)}
            sx={{
              fontSize: '10.5px',
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              '&:hover': { bgcolor: '#DBEAFE' }
            }}
          />
        ))}
      </Box>

      {/* Input Action Bar */}
      <DialogActions sx={{ p: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', gap: 0.5 }}>
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
              borderRadius: '8px',
              fontSize: '12.5px',
              bgcolor: '#F8FAFC'
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '8px',
            p: 1,
            '&:hover': { bgcolor: '#1D4ED8' },
            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
          }}
        >
          {isSending ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
