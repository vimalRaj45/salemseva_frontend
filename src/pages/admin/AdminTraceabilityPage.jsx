import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText } from 'lucide-react';
import { PageHeader, EmptyState, LoadingSkeleton } from '../../components/common';

export default function AdminTraceabilityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_V1_URL}/admin/traceability`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        console.warn('Real-time audit log fetch note:', err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Forensic Audit & Traceability Matrix"
          subtitle="Forensic chronological audit trail of dispatched jobs, OTP doorstep validations, and settlement records."
          backUrl="/admin"
          backLabel="Admin Dashboard"
          badge={
            <Chip
              icon={<Shield size={14} />}
              label="Live Immutable Stream"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          }
        />

        <Card elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <LoadingSkeleton type="list" count={4} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No Audit Logs Recorded Yet"
              description="All system state changes, payments, and dispatch events will be recorded here in real-time."
              icon={FileText}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {logs.map((log, idx) => (
                <Paper
                  key={log.id || idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'border-color 0.15s ease',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileText size={16} color="#0A5CC4" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {log.event_type}
                      </Typography>
                    </Box>
                    <Chip
                      label={new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      size="small"
                      sx={{ fontSize: '0.75rem', fontWeight: 600, height: 22 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.8125rem' }}>
                    Booking: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{log.booking_id}</Box> • Actor: <Box component="span" sx={{ fontWeight: 700 }}>{log.actor_type}</Box> ({log.actor_id})
                  </Typography>
                  {log.description && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
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
