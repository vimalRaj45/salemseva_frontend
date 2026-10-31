import React from 'react';
import { Card, Box, Typography, Switch } from '@mui/material';

/**
 * FieldCard
 * Standardized input container card for settings and edit matrices.
 * Guaranteed height: 100%, reserved 2-line helper text, pinned input slot.
 */
export default function FieldCard({
  label,
  helperText,
  children,
  switchChecked,
  onSwitchChange,
  hasSwitch = false,
  switchLabel = '',
  disabled = false,
  sx = {}
}) {
  const isDisabled = disabled || (hasSwitch && !switchChecked);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'slate.200',
        borderRadius: '12px',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'opacity 0.2s ease-in-out',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            color: 'slate.600',
            letterSpacing: '0.08em',
            lineHeight: 1.2
          }}
        >
          {label}
        </Typography>

        {hasSwitch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {switchLabel && (
              <Typography variant="caption" sx={{ color: 'slate.500', fontSize: '11px' }}>
                {switchLabel}
              </Typography>
            )}
            <Switch
              size="small"
              checked={Boolean(switchChecked)}
              onChange={onSwitchChange}
              inputProps={{ 'aria-label': `${label} toggle` }}
            />
          </Box>
        )}
      </Box>

      {/* Reserved 2-line helper text for uniform vertical rhythm */}
      <Typography
        variant="caption"
        sx={{
          color: 'slate.500',
          fontSize: '12px',
          lineHeight: 1.4,
          minHeight: '34px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 2
        }}
      >
        {helperText}
      </Typography>

      {/* Input pinned to bottom */}
      <Box
        sx={{
          mt: 'auto',
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      >
        {children}
      </Box>
    </Card>
  );
}
