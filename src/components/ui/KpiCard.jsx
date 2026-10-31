import React from 'react';
import { Card, Box, Typography, Avatar } from '@mui/material';

/**
 * KpiCard
 * Standard metric display card.
 * Handles zero / empty states cleanly with slate-400 placeholder text.
 */
export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#1D6FE5',
  iconBg = '#EFF6FF',
  trend,
  trendColor,
  onClick,
  sx = {}
}) {
  const isZeroOrEmpty = value === 0 || value === '0' || value === '₹0' || value === '0.0' || value === undefined || value === null;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'slate.200',
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease-in-out',
        '&:hover': onClick ? {
          borderColor: 'slate.300',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)'
        } : {},
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            color: 'slate.500',
            letterSpacing: '0.06em',
            lineHeight: 1.3
          }}
        >
          {title}
        </Typography>

        {Icon && (
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: iconBg,
              color: iconColor,
              borderRadius: '8px'
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Avatar>
        )}
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            fontSize: '24px',
            color: isZeroOrEmpty ? 'slate.400' : 'slate.900',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {value !== undefined && value !== null ? value : '0'}
        </Typography>

        {subtitle ? (
          <Typography variant="caption" sx={{ color: 'slate.500', fontSize: '12px', display: 'block' }}>
            {subtitle}
          </Typography>
        ) : isZeroOrEmpty ? (
          <Typography variant="caption" sx={{ color: 'slate.400', fontSize: '12px', display: 'block' }}>
            No data recorded yet
          </Typography>
        ) : trend ? (
          <Typography
            variant="caption"
            sx={{
              color: trendColor || 'success.dark',
              fontWeight: 600,
              fontSize: '12px',
              display: 'block'
            }}
          >
            {trend}
          </Typography>
        ) : null}
      </Box>
    </Card>
  );
}
