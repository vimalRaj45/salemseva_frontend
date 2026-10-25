import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export default function LoadingSkeleton({
  type = 'table',
  count = 4,
  columns = 5,
  sx = {}
}) {
  if (type === 'stats') {
    return (
      <Grid container spacing={2} sx={{ mb: 3, ...sx }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Grid item xs={6} sm={6} md={12 / count} key={idx}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="40%" height={32} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="text" width="70%" height={16} />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'cards') {
    return (
      <Grid container spacing={2} sx={{ ...sx }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1.5, mb: 2 }} />
              <Skeleton variant="text" width="70%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="90%" height={18} sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Skeleton variant="text" width="30%" height={22} />
                <Skeleton variant="rectangular" width="25%" height={32} sx={{ borderRadius: 1 }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'list') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...sx }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Card key={idx} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="45%" height={20} />
              <Skeleton variant="text" width="65%" height={16} />
            </Box>
            <Skeleton variant="rectangular" width={75} height={28} sx={{ borderRadius: 1 }} />
          </Card>
        ))}
      </Box>
    );
  }

  // Default: Table skeleton
  return (
    <Box sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {/* Search / Filter bar skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rectangular" width={240} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Table rows */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {/* Head */}
        <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 2, gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton key={idx} variant="text" sx={{ flex: 1 }} height={20} />
          ))}
        </Box>
        {/* Rows */}
        {Array.from({ length: count }).map((_, rowIdx) => (
          <Box
            key={rowIdx}
            sx={{
              display: 'flex',
              p: 2,
              gap: 2,
              borderBottom: rowIdx === count - 1 ? 'none' : '1px solid',
              borderColor: 'divider',
              alignItems: 'center'
            }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} variant="text" sx={{ flex: 1 }} height={20} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
