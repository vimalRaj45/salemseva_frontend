import React from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * SkeletonBlock
 * Skeleton placeholder for loading states.
 */
export default function SkeletonBlock({
  variant = 'rectangular',
  height = 40,
  width = '100%',
  count = 1,
  spacing = 1.5,
  borderRadius = '8px',
  sx = {}
}) {
  if (count <= 1) {
    return (
      <Skeleton
        variant={variant}
        height={height}
        width={width}
        animation="wave"
        sx={{
          borderRadius,
          bgcolor: 'slate.100',
          ...sx
        }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing, width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant={variant}
          height={height}
          width={width}
          animation="wave"
          sx={{
            borderRadius,
            bgcolor: 'slate.100',
            ...sx
          }}
        />
      ))}
    </Box>
  );
}
