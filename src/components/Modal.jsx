import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { X } from 'lucide-react';

/**
 * Standard Shazu One Reusable Modal System
 * Mobile: Bottom sheet with drag handle, 24px top radius, max-height 90vh
 * Desktop: Centered modal dialog, standard max-width, fixed header, scrollable body, sticky footer
 */
export function Modal({
  open,
  onClose,
  maxWidth = 'sm', // 'xs' (400px), 'sm' (480px), 'md' (640px), 'lg' (800px)
  children,
  ariaLabelledBy,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  fullWidth = true
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getMaxWidthPx = () => {
    switch (maxWidth) {
      case 'xs': return 400;
      case 'sm': return 480;
      case 'md': return 640;
      case 'lg': return 800;
      default: return typeof maxWidth === 'number' ? maxWidth : 480;
    }
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' && disableBackdropClick) return;
        if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
        if (onClose) onClose(event, reason);
      }}
      aria-labelledby={ariaLabelledBy}
      aria-modal="true"
      role="dialog"
      scroll="paper"
      fullWidth={fullWidth}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          transition: 'all 200ms cubic-bezier(0, 0, 0.2, 1) !important'
        }
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          m: isMobile ? 0 : 'auto',
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'unset',
          left: isMobile ? 0 : 'unset',
          right: isMobile ? 0 : 'unset',
          width: '100%',
          maxWidth: isMobile ? '100% !important' : `${getMaxWidthPx()}px !important`,
          maxHeight: isMobile ? '90vh' : '85vh',
          borderRadius: isMobile ? '12px 12px 0 0' : '8px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: isMobile
            ? '0 -10px 40px rgba(15, 23, 42, 0.15)'
            : '0 20px 48px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'transform 200ms ease-out, opacity 200ms ease-out',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none !important'
          }
        }
      }}
    >
      {/* Mobile bottom-sheet drag handle */}
      {isMobile && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pt: 1.5,
            pb: 0.5,
            bgcolor: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: '2px',
              bgcolor: '#CBD5E1'
            }}
          />
        </Box>
      )}
      {children}
    </Dialog>
  );
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  icon = null,
  id,
  children
}) {
  return (
    <Box
      sx={{
        px: 2.5, // 20px side padding
        py: 2,
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        bgcolor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        flexShrink: 0
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#0A66C2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {title && (
            <Typography
              id={id}
              component="h2"
              sx={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#0F172A',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              sx={{
                fontSize: '12px',
                color: '#64748B',
                fontWeight: 400,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
      </Box>

      {onClose && (
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          size="small"
          sx={{
            width: 44, // 44px min tap target
            height: 44,
            color: '#64748B',
            borderRadius: '10px',
            flexShrink: 0,
            '&:hover': {
              bgcolor: '#F1F5F9',
              color: '#0F172A'
            },
            '&:focus-visible': {
              outline: '2px solid #0A66C2',
              outlineOffset: 2
            }
          }}
        >
          <X size={20} />
        </IconButton>
      )}
    </Box>
  );
}

export function ModalBody({ children, sx = {}, ...props }) {
  return (
    <Box
      sx={{
        p: 2.5, // 20px standard side and vertical padding
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export function ModalFooter({ children, sx = {}, ...props }) {
  return (
    <Box
      sx={{
        px: 2.5, // 20px
        py: 2,
        borderTop: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        gap: 1.5,
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        flexShrink: 0,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default Modal;
