import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  onBack,
  backUrl,
  backLabel = 'Back',
  actions,
  badge,
  sx = {}
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const showBackButton = Boolean(onBack || backUrl);

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        pb: { xs: 1.5, sm: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        ...sx
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 0.75,
              fontSize: '0.8125rem',
              '& .MuiBreadcrumbs-separator': {
                color: 'text.secondary',
                mx: 0.5
              }
            }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={idx} color="text.primary" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={idx}
                  underline="hover"
                  color="text.secondary"
                  href={crumb.href || '#'}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    } else if (crumb.href && !crumb.href.startsWith('http')) {
                      e.preventDefault();
                      navigate(crumb.href);
                    }
                  }}
                  sx={{ cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {showBackButton && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowLeft size={16} />}
              aria-label={backLabel}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                height: 34,
                borderRadius: 1
              }}
            >
              {backLabel}
            </Button>
          )}

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.25
            }}
          >
            {title}
          </Typography>

          {badge && <Box>{badge}</Box>}
        </Box>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              lineHeight: 1.45,
              maxWidth: 720
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            alignSelf: { xs: 'stretch', sm: 'center' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
