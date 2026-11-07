import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Avatar } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * PageHeader
 * Unified header for all admin views.
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs = [],
  actions,
  badge,
  sx = {}
}) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: 'slate.400' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={idx} variant="caption" sx={{ color: 'slate.600', fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={idx}
                underline="hover"
                color="inherit"
                href={crumb.href || '#'}
                onClick={crumb.onClick}
                sx={{ fontSize: '12px', color: 'slate.500', cursor: crumb.onClick || crumb.href ? 'pointer' : 'default' }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {Icon && (
            <Avatar
              variant="rounded"
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'primary.light',
                color: '#FFFFFF',
                borderRadius: '10px'
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Avatar>
          )}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography variant="h1" sx={{ fontSize: '22px', fontWeight: 700, color: 'slate.900' }}>
                {title}
              </Typography>
              {badge}
            </Box>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'slate.500', mt: 0.25, fontSize: '13px' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
