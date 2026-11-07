import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';

/**
 * SectionHeader
 * Section divider with optional step number, title, subtitle, and action pill.
 */
export default function SectionHeader({
  number,
  title,
  description,
  badgeText,
  action,
  sx = {}
}) {
  return (
    <Box sx={{ mb: 2.5, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {number && (
            <Box
              component="span"
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              {number}
            </Box>
          )}
          <Typography variant="h3" sx={{ fontWeight: 600, color: 'slate.900' }}>
            {title}
          </Typography>
          {badgeText && (
            <Chip
              label={badgeText}
              size="small"
              sx={{
                height: 20,
                fontSize: '11px',
                fontWeight: 700,
                bgcolor: 'slate.100',
                color: 'slate.700',
                borderRadius: '4px'
              }}
            />
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>

      {description && (
        <Typography variant="body2" sx={{ color: 'slate.500', mb: 1.5, fontSize: '13px' }}>
          {description}
        </Typography>
      )}

      <Divider sx={{ borderColor: 'slate.200' }} />
    </Box>
  );
}
