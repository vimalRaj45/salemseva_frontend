import React from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';

export default function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  sx = {}
}) {
  return (
    <Box sx={{ mb: 2, ...sx }}>
      {label && (
        <Typography
          variant="caption"
          component="label"
          sx={{
            display: 'block',
            fontWeight: 700,
            color: error ? 'error.main' : 'text.primary',
            fontSize: '0.8125rem',
            mb: 0.75
          }}
        >
          {label}
          {required && (
            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      )}

      {children}

      {(error || helperText) && (
        <FormHelperText
          error={Boolean(error)}
          sx={{
            mx: 0.5,
            mt: 0.5,
            fontSize: '0.75rem',
            fontWeight: error ? 600 : 400
          }}
        >
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
