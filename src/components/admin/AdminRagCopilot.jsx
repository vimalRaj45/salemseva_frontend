import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LaunchIcon from '@mui/icons-material/Launch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';
import HubIcon from '@mui/icons-material/Hub';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { API_V1_URL } from '../../config';
import { askPuterRag } from '../../services/puterAiService';

const SUGGESTED_PROMPTS = [
  'Show unassigned bookings in Fairlands',
  'Technicians with pending KYC verification',
  'Show pending QR payments waiting for review',
  'Find all bookings for customer',
  'List open high priority support tickets',
  'Total active trips and online technicians'
];

export default function AdminRagCopilot({
  open,
  onClose,
  onNavigate
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Shazu One Operations Copilot is online. Ask any question regarding customers, bookings, partner fleet, settlements, or support to search the database and navigate directly to actions.',
      actions: [
        { label: 'View Live Dispatch Queue', tab: 'ops' },
        { label: 'Inspect Pending KYC Fleet', tab: 'technicians', filter: 'pending_kyc' },
        { label: 'Review QR Verifications', tab: 'settlements', filter: 'pending' }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overrideText) => {
    const q = (overrideText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const newMessages = [...messages, { id: userMsgId, role: 'user', text: q }];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Step 1: Query Backend RAG API to retrieve structured DB rows
      const res = await fetch(`${API_V1_URL}/admin/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const ragData = await res.json();

      if (!ragData.success) {
        throw new Error(ragData.error || 'Failed to retrieve database context');
      }

      // Step 2: Synthesize answer with Puter.js LLM
      const aiResult = await askPuterRag({
        query: q,
        ragContext: ragData.ragContext,
        data: ragData.data,
        suggestedActions: ragData.suggestedActions,
        model: selectedModel
      });

      setMessages(prev => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: aiResult.explanation,
          actions: aiResult.actions || [],
          metrics: ragData.metrics,
          extracted: ragData.extracted
        }
      ]);
    } catch (err) {
      console.error('RAG Copilot query error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `Lookup error: ${err.message || 'Could not complete query. Please retry.'}`,
          actions: [
            { label: 'Open Live Dispatch Queue', tab: 'ops' },
            { label: 'Open Customers CRM', tab: 'customers' }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (action) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#1D6FE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '13.5px', lineHeight: 1.2 }}>
              Shazu One AI Copilot
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
              Puter.js RAG Schema Engine
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={selectedModel}
            onClick={() => setSelectedModel(prev => prev === 'gpt-4o-mini' ? 'claude-3-5-sonnet' : 'gpt-4o-mini')}
            sx={{
              bgcolor: '#1E293B',
              color: '#38BDF8',
              fontWeight: 700,
              fontSize: '10.5px',
              height: '24px',
              cursor: 'pointer',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          />
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Suggested Quick Queries */}
      <Box sx={{ px: 2, py: 1.2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.8, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Suggested Operations Queries
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {SUGGESTED_PROMPTS.map((promptText, idx) => (
            <Chip
              key={idx}
              label={promptText}
              size="small"
              onClick={() => handleSend(promptText)}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Messages Scroll Area */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((m) => (
          <Box
            key={m.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.6,
                maxWidth: '92%',
                borderRadius: '12px',
                bgcolor: m.role === 'user' ? '#1D6FE5' : '#F1F5F9',
                color: m.role === 'user' ? '#FFFFFF' : '#0F172A',
                border: m.role === 'user' ? 'none' : '1px solid #E2E8F0'
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '12.5px', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                {m.text}
              </Typography>

              {/* Action Buttons */}
              {m.actions && m.actions.length > 0 && (
                <Box sx={{ mt: 1.5, pt: 1.2, borderTop: m.role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #CBD5E1' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: m.role === 'user' ? '#E0F2FE' : '#475569', display: 'block', mb: 0.8, fontSize: '10.5px' }}>
                    DIRECT NAVIGATION ACTIONS:
                  </Typography>
                  <Stack spacing={0.8}>
                    {m.actions.map((act, actIdx) => (
                      <Button
                        key={actIdx}
                        size="small"
                        variant="contained"
                        onClick={() => handleActionClick(act)}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: m.role === 'user' ? '#FFFFFF' : '#0F172A',
                          color: m.role === 'user' ? '#1D6FE5' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'none',
                          justifyContent: 'space-between',
                          borderRadius: '6px',
                          py: 0.6,
                          px: 1.4,
                          '&:hover': {
                            bgcolor: m.role === 'user' ? '#F8FAFC' : '#1E293B'
                          }
                        }}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: '10px', width: 'fit-content' }}>
            <CircularProgress size={16} sx={{ color: '#1D6FE5' }} />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
              Querying database schema & synthesizing with Puter.js...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Bar */}
      <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask e.g. 'I need all bookings of customer Murugan'..."
          value={inputQuery}
          inputRef={inputRef}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          InputProps={{
            sx: {
              borderRadius: '8px',
              fontSize: '12.5px',
              bgcolor: '#F8FAFC'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          sx={{
            bgcolor: '#1D6FE5',
            color: '#FFFFFF',
            borderRadius: '8px',
            minWidth: '44px',
            px: 1.5,
            fontWeight: 700,
            '&:hover': { bgcolor: '#1557B0' }
          }}
        >
          {isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
        </Button>
      </Box>
    </Drawer>
  );
}
