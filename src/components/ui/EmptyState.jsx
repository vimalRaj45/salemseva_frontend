import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * EmptyState
 * Standard empty state view when no records match or exist.
 */
export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'No records found',
  description = 'There is no data to display right now.',
  actionLabel,
  onAction,
  actionIcon,
  sx = {}
}) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Avatar
        sx={{
          width: 52,
          height: 52,
          bgcolor: 'slate.100',
          color: 'slate.400',
          mb: 2,
          borderRadius: '12px'
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Avatar>

      <Typography variant="h3" sx={{ fontWeight: 600, color: 'slate.800', mb: 0.5, fontSize: '15px' }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: 'slate.500', maxWidth: 400, mb: actionLabel ? 2.5 : 0, fontSize: '13px' }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          startIcon={actionIcon}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            fontWeight: 600,
            borderRadius: '8px'
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
