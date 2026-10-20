import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ArticleIcon from '@mui/icons-material/Article';

export default function AdminTraceabilityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_V1_URL}/admin/traceability`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          setLogs([]);
        }
      })
      .catch(err => {
        console.warn('Real-time audit log fetch note:', err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin')} 
          sx={{
            color: '#0284C7',
            mb: 2,
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '10px',
            minHeight: 44,
            px: 2,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            '&:hover': { bgcolor: '#F1F5F9' }
          }}
        >
          Back to Admin Dashboard
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <HistoryEduIcon sx={{ color: '#0284C7', fontSize: { xs: 28, sm: 32 } }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Forensic Job Audit & Traceability Matrix
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Forensic chronological audit trail of dispatched jobs, OTP doorstep validations, and settlement records.
        </Typography>

        <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', p: { xs: 2, sm: 3 }, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={32} sx={{ color: '#0284C7' }} />
              <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#64748B', fontWeight: 600 }}>
                Loading audit trail records...
              </Typography>
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <ArticleIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                No Audit Logs Recorded Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                All system state changes, payments, and dispatch events will be recorded here in real-time.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {logs.map((log, idx) => (
                <Paper
                  key={log.id || idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    transition: 'border-color 0.15s ease',
                    '&:hover': { borderColor: '#BAE6FD' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArticleIcon sx={{ fontSize: 18, color: '#0284C7' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                        {log.event_type}
                      </Typography>
                    </Box>
                    <Chip
                      label={new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      size="small"
                      sx={{ bgcolor: '#E2E8F0', color: '#475569', fontSize: '11px', fontWeight: 700, height: 22 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '12.5px' }}>
                    Booking: <span style={{ color: '#0284C7' }}>{log.booking_id}</span> • Actor: <span style={{ color: '#0F172A' }}>{log.actor_type}</span> ({log.actor_id})
                  </Typography>
                  {log.description && (
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                      {log.description}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}
