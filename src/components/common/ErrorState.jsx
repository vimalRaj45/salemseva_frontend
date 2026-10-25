import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  minHeight = 220,
  sx = {}
}) {
  return (
    <Box
      sx={{
        py: 4,
        px: 3,
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'error.light',
        ...sx
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'error.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main',
          mb: 1.5
        }}
      >
        <AlertCircle size={24} />
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
          mb: onRetry ? 2 : 0,
          lineHeight: 1.5
        }}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onRetry}
          startIcon={<RotateCcw size={15} />}
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            px: 2
          }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
}
