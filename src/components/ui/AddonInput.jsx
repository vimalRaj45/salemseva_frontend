import React from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';

/**
 * AddonInput
 * MUI TextField with styled InputAdornment segment inside the border.
 * Height 44px, right-aligned tabular numbers.
 */
export default function AddonInput({
  prefix,
  suffix,
  value,
  onChange,
  type = 'number',
  disabled = false,
  fullWidth = true,
  placeholder = '',
  inputProps = {},
  error = false,
  helperText = '',
  sx = {},
  ...props
}) {
  const isNumeric = type === 'number';

  return (
    <TextField
      fullWidth={fullWidth}
      size="small"
      type={type}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      inputProps={{
        ...(isNumeric ? { style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } } : {}),
        ...inputProps
      }}
      InputProps={{
        startAdornment: prefix ? (
          <InputAdornment position="start" sx={{ mr: 1 }}>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: 'slate.100',
                color: 'slate.600',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                userSelect: 'none'
              }}
            >
              {prefix}
            </Box>
          </InputAdornment>
        ) : undefined,
        endAdornment: suffix ? (
          <InputAdornment position="end" sx={{ ml: 1 }}>
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.5,
                bgcolor: 'slate.100',
                color: 'slate.600',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                userSelect: 'none'
              }}
            >
              {suffix}
            </Box>
          </InputAdornment>
        ) : undefined
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '44px',
          bgcolor: '#FFFFFF'
        },
        ...sx
      }}
      {...props}
    />
  );
}
