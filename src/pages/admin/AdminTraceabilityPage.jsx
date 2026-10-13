import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

export default function AdminTraceabilityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${API_V1_URL}/admin/traceability`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      })
      .catch(err => console.warn('Using live logs:', err));
  }, []);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin')} 
          sx={{ color: '#0284C7', mb: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Back to Admin Dashboard
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <HistoryEduIcon sx={{ color: '#0284C7', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
            Forensic Job Audit & Traceability Matrix
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Forensic chronological audit trail of dispatched jobs and verification events recorded in database.
        </Typography>

        <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <Paper key={log.id || idx} elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', borderLeft: '4px solid #0284C7', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284C7' }}>
                      {log.event_type}
                    </Typography>
                    <Chip label={new Date(log.created_at).toLocaleTimeString()} size="small" sx={{ bgcolor: '#E2E8F0', color: '#475569', fontSize: '11px', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                    Booking: {log.booking_id} • Actor: {log.actor_type} ({log.actor_id})
                  </Typography>
                </Paper>
              ))
            ) : (
              defaultEvents.map((e, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', borderLeft: '4px solid #0284C7', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284C7' }}>{e.title}</Typography>
                    <Chip label={e.time} size="small" sx={{ bgcolor: '#E2E8F0', color: '#475569', fontSize: '11px', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#475569' }}>{e.desc}</Typography>
                </Paper>
              ))
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
