import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function SimulationBar({ currentStep, setStep, onAutoPlay }) {
  const steps = [
    { key: 'home', label: '1. 4 Core Services' },
    { key: 'service_detail', label: '2. Pick Issue & Promo' },
    { key: 'matching', label: '3. Match Tech' },
    { key: 'en_route', label: '4. En Route GPS' },
    { key: 'quote_review', label: '5. Digital Quote' },
    { key: 'payment', label: '6. Razorpay Escrow' },
    { key: 'rating', label: '7. Review & Escalation' }
  ];

  return (
    <Box sx={{ py: 1, px: 2, bgcolor: '#1E293B', display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', borderBottom: '1px solid #334155' }}>
      <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, whiteSpace: 'nowrap' }}>
        Interactive Steps:
      </Typography>
      {steps.map(s => (
        <Chip
          key={s.key}
          label={s.label}
          size="small"
          clickable
          color={currentStep === s.key ? 'primary' : 'default'}
          sx={{ 
            fontWeight: 700, 
            color: currentStep === s.key ? '#FFF' : '#94A3B8', 
            bgcolor: currentStep === s.key ? '#0284C7' : '#0F172A' 
          }}
          onClick={() => setStep(s.key)}
        />
      ))}
    </Box>
  );
}
