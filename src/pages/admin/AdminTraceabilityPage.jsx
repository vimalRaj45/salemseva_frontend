import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Paper,
  Collapse,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader, EmptyState, SkeletonBlock } from '../../components/ui';

export default function AdminTraceabilityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

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
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
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

        <Card elevation={0} sx={{ p: { xs: 2, sm: 3 }, mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.paper' }}>
          {loading ? (
            <SkeletonBlock variant="table" height={220} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No Audit Logs Recorded Yet"
              description="All system state changes, payments, and dispatch events will be recorded here in real-time."
              icon={FileText}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {logs.map((log, idx) => {
                const logKey = log.id || idx;
                const isExpanded = expandedLogId === logKey;
                return (
                  <Paper
                    key={logKey}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'border-color 0.15s ease',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileText size={16} color="#1D6FE5" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                          {log.event_type}
                        </Typography>
                        {log.booking_id && (
                          <Chip
                            label={`#${log.booking_id}`}
                            size="small"
                            sx={{ fontFamily: 'monospace', fontWeight: 700, height: 22, fontSize: '11px', bgcolor: 'slate.100', color: 'slate.700' }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          size="small"
                          sx={{ fontSize: '0.75rem', fontWeight: 600, height: 22 }}
                        />
                        {(log.metadata || log.payload) && (
                          <IconButton
                            size="small"
                            onClick={() => setExpandedLogId(isExpanded ? null : logKey)}
                            sx={{ p: 0.5 }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.8125rem' }}>
                      Actor: <Box component="span" sx={{ fontWeight: 700 }}>{log.actor_type}</Box> {log.actor_id ? `(${log.actor_id})` : ''}
                    </Typography>

                    {log.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {log.description}
                      </Typography>
                    )}

                    {(log.metadata || log.payload) && (
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'slate.900', color: 'slate.100', borderRadius: '6px', overflowX: 'auto' }}>
                          <Typography component="pre" variant="caption" sx={{ fontFamily: 'monospace', fontSize: '11.5px', m: 0 }}>
                            {JSON.stringify(log.metadata || log.payload, null, 2)}
                          </Typography>
                        </Box>
                      </Collapse>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}
