import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

/**
 * IconActionButton
 * Standard 32x32 icon button with tooltip and required aria-label.
 */
export default function IconActionButton({
  icon: Icon,
  title,
  onClick,
  color = 'default',
  disabled = false,
  size = 'small',
  sx = {},
  ...props
}) {
  const isDestructive = color === 'error';

  return (
    <Tooltip title={title} arrow placement="top">
      <span>
        <IconButton
          size={size}
          aria-label={title}
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            color: isDestructive ? 'error.main' : 'slate.600',
            border: '1px solid',
            borderColor: 'slate.200',
            bgcolor: '#FFFFFF',
            '&:hover': {
              bgcolor: isDestructive ? 'error.light' : 'slate.100',
              borderColor: isDestructive ? 'error.main' : 'slate.300',
              color: isDestructive ? 'error.dark' : 'slate.900'
            },
            '&.Mui-disabled': {
              borderColor: 'slate.100',
              color: 'slate.300'
            },
            ...sx
          }}
          {...props}
        >
          {Icon && <Icon sx={{ fontSize: 16 }} />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
