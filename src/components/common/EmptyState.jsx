import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  action,
  actionLabel,
  onAction,
  minHeight = 240,
  sx = {}
}) {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        ...sx
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          mb: 1.5
        }}
      >
        <Icon size={26} strokeWidth={1.75} />
      </Box>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 0.5
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 420,
          mb: action || actionLabel ? 2.5 : 0,
          lineHeight: 1.5
        }}
      >
        {description}
      </Typography>

      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            px: 2
          }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}
