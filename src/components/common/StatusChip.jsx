import React from 'react';
import { Chip } from '@mui/material';

const STATUS_CONFIGS = {
  // Booking Statuses
  created: { label: 'Created', color: '#0A5CC4', bg: '#EFF6FF', border: '#BFDBFE' },
  matching: { label: 'Matching', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  accepted: { label: 'Accepted', color: '#0A5CC4', bg: '#EFF6FF', border: '#BFDBFE' },
  preparing: { label: 'Preparing', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  en_route: { label: 'En Route', color: '#0A5CC4', bg: '#EFF6FF', border: '#BFDBFE' },
  arrived: { label: 'Arrived', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  inspecting: { label: 'Inspecting', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  quote_presented: { label: 'Quote Sent', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  quote_approved: { label: 'Quote Approved', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  quote_declined: { label: 'Quote Declined', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  in_progress: { label: 'In Progress', color: '#0A5CC4', bg: '#EFF6FF', border: '#BFDBFE' },
  completed: { label: 'Completed', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  cancelled: { label: 'Cancelled', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  disputed: { label: 'Disputed', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },

  // Verification & KYC Statuses
  verified: { label: 'Verified', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  pending: { label: 'Pending Review', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  blocked: { label: 'Blocked', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  active: { label: 'Active', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  inactive: { label: 'Inactive', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },

  // Partner Duty Statuses
  online: { label: 'Online', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  offline: { label: 'Offline', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },

  // Payment Statuses
  escrow_held: { label: 'Escrow Held', color: '#0A5CC4', bg: '#EFF6FF', border: '#BFDBFE' },
  captured: { label: 'Captured', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  settled: { label: 'Settled', color: '#2B9236', bg: '#ECFDF5', border: '#A7F3D0' },
  refunded: { label: 'Refunded', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  failed: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
};

export default function StatusChip({
  status,
  label,
  size = 'small',
  icon,
  sx = {}
}) {
  const normalizedKey = String(status || '').toLowerCase().trim();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status || 'Unknown',
    color: '#475569',
    bg: '#F1F5F9',
    border: '#E2E8F0'
  };

  const displayLabel = label || config.label;

  return (
    <Chip
      size={size}
      icon={icon}
      label={displayLabel}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        height: size === 'small' ? 24 : 28,
        borderRadius: 1,
        '& .MuiChip-icon': {
          color: 'inherit',
          fontSize: '0.875rem'
        },
        ...sx
      }}
    />
  );
}
