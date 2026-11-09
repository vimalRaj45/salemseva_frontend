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
  } else if (['refunded'].includes(norm)) {
    color = '#6B21A8';
    bgcolor = '#F3E8FF';
    borderColor = '#D8B4FE';
    Icon = CheckCircleIcon;
    text = label || 'Refunded';
  } else if (['refund_pending', 'refund_initiated', 'refund_in_progress'].includes(norm)) {
    color = '#B45309';
    bgcolor = '#FEF3C7';
    borderColor = '#FDE68A';
    Icon = PendingIcon;
    text = label || 'Refund Pending';
  } else if (['in_progress', 'en_route', 'arrived', 'inspecting', 'dispatched', 'active_duty'].includes(norm)) {
    color = '#0369A1';
    bgcolor = '#E0F2FE';
    borderColor = '#BAE6FD';
    Icon = AutorenewIcon;
    text = label || (norm === 'en_route' ? 'En Route' : 'In Progress');
  } else if (['escrow_held', 'held_in_escrow'].includes(norm)) {
    color = '#0284C7';
    bgcolor = '#E0F2FE';
    borderColor = '#BAE6FD';
    Icon = VerifiedIcon;
    text = label || 'Escrow Held';
  } else if (['unverified', 'pending_verification'].includes(norm)) {
    color = '#C2410C';
    bgcolor = '#FFEDD5';
    borderColor = '#FED7AA';
    Icon = WarningAmberIcon;
    text = label || 'Unverified QR';
  } else if (['unpaid', 'cancelled_unpaid', 'not_charged'].includes(norm)) {
    color = '#475569';
    bgcolor = '#F1F5F9';
    borderColor = '#CBD5E1';
    Icon = PendingIcon;
    text = label || (norm === 'cancelled_unpaid' ? 'Cancelled (Unpaid)' : 'Unpaid');
  } else if (['pending', 'matching', 'requested', 'allocated', 'draft'].includes(norm)) {
    color = '#B45309';
    bgcolor = '#FEF3C7';
    borderColor = '#FDE68A';
    Icon = PendingIcon;
    text = label || 'Pending';
  } else if (['cancelled', 'rejected', 'failed', 'suspended'].includes(norm)) {
    color = '#991B1B';
    bgcolor = '#FEE2E2';
    borderColor = '#FECACA';
    Icon = CancelIcon;
    text = label || (norm === 'cancelled' ? 'Cancelled' : norm === 'rejected' ? 'Rejected' : norm === 'suspended' ? 'Suspended' : 'Failed');
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
