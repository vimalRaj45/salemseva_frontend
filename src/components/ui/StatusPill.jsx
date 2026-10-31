import React from 'react';
import { Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VerifiedIcon from '@mui/icons-material/Verified';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

/**
 * StatusPill
 * Strict full-border pill with real icon + text (zero emoji, zero 1-sided colored bars).
 */
export default function StatusPill({
  status = 'pending',
  label,
  size = 'small',
  sx = {}
}) {
  const norm = String(status || '').toLowerCase().trim();

  let color = 'slate.700';
  let bgcolor = 'slate.100';
  let borderColor = 'slate.300';
  let Icon = PendingIcon;
  let text = label || status;

  if (['completed', 'settled', 'verified', 'active', 'delivered', 'resolved', 'paid'].includes(norm)) {
    color = '#15803D';
    bgcolor = '#DCFCE7';
    borderColor = '#BBF7D0';
    Icon = CheckCircleIcon;
    text = label || (norm === 'settled' ? 'Settled' : norm === 'verified' ? 'Verified' : 'Completed');
  } else if (['in_progress', 'en_route', 'arrived', 'inspecting', 'dispatched', 'active_duty'].includes(norm)) {
    color = '#0369A1';
    bgcolor = '#E0F2FE';
    borderColor = '#BAE6FD';
    Icon = AutorenewIcon;
    text = label || (norm === 'en_route' ? 'En Route' : 'In Progress');
  } else if (['pending', 'matching', 'requested', 'allocated', 'draft'].includes(norm)) {
    color = '#B45309';
    bgcolor = '#FEF3C7';
    borderColor = '#FDE68A';
    Icon = PendingIcon;
    text = label || 'Pending';
  } else if (['cancelled', 'rejected', 'failed', 'refunded', 'suspended'].includes(norm)) {
    color = '#991B1B';
    bgcolor = '#FEE2E2';
    borderColor = '#FECACA';
    Icon = CancelIcon;
    text = label || (norm === 'cancelled' ? 'Cancelled' : 'Failed');
  } else if (['escalated', 'disputed', 'urgent', 'attention_required'].includes(norm)) {
    color = '#C2410C';
    bgcolor = '#FFEDD5';
    borderColor = '#FED7AA';
    Icon = WarningAmberIcon;
    text = label || 'Escalated';
  } else if (['online', 'available'].includes(norm)) {
    color = '#15803D';
    bgcolor = '#DCFCE7';
    borderColor = '#BBF7D0';
    Icon = RadioButtonCheckedIcon;
    text = label || 'Online';
  }

  return (
    <Chip
      size={size}
      icon={<Icon sx={{ fontSize: size === 'small' ? 14 : 16, color: `${color} !important` }} />}
      label={text}
      sx={{
        bgcolor,
        color,
        border: '1px solid',
        borderColor,
        fontWeight: 600,
        fontSize: size === 'small' ? '11px' : '12px',
        height: size === 'small' ? '22px' : '26px',
        borderRadius: '6px',
        '& .MuiChip-label': {
          px: 0.75
        },
        ...sx
      }}
    />
  );
}
