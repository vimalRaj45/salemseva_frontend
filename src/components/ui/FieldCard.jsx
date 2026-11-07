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
  helper,
  description,
  children,
  switchChecked,
  onSwitchChange,
  hasSwitch = false,
  switchLabel = '',
  disabled = false,
  sx = {}
}) {
  const actualHelper = helperText || helper || description || '';
  const isDisabled = disabled || (hasSwitch && !switchChecked);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
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
            color: 'text.secondary',
            letterSpacing: '0.08em',
            lineHeight: 1.2
          }}
        >
          {label}
        </Typography>

        {hasSwitch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {switchLabel && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
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
          color: 'text.secondary',
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
        {actualHelper}
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
