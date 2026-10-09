import React from 'react';
import { Backdrop, Box, Typography, CircularProgress, Paper, Chip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';

export default function ProcessingBackdrop({
  open = false,
  title = 'Processing Request...',
  subtitle = 'SalemSeva Real-time Engine is securely handling your request',
  badge = '100% Cashless Escrow'
}) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: 2500,
        bgcolor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)'
      }}
      open={open}
    >
      <Paper
        elevation={10}
        sx={{
          bgcolor: '#FFFFFF',
          color: '#0F172A',
          p: 3.5,
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: 340,
          mx: 2,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Radial Pulse Spinner */}
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2.5 }}>
          <CircularProgress
            size={68}
            thickness={4.5}
            sx={{
              color: '#0284C7',
              animationDuration: '1.2s'
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BoltIcon sx={{ color: '#0284C7', fontSize: 28 }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px', mb: 0.8 }}>
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', lineHeight: 1.45, mb: 2 }}>
          {subtitle}
        </Typography>

        {badge && (
          <Chip
            icon={<SecurityIcon sx={{ color: '#047857 !important', fontSize: 14 }} />}
            label={badge}
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#047857', fontWeight: 800, fontSize: '10.5px' }}
          />
        )}
      </Paper>
    </Backdrop>
  );
}
