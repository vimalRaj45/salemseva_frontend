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
 * Shared Modal Component
 * Strictly enforces 8px padding, tight gaps, compact controls, and no horizontal scroll.
 */
export function Modal({
  open,
  onClose,
  maxWidth = 'sm', // 'xs' (360px), 'sm' (440px), 'md' (560px), 'lg' (720px)
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
      case 'xs': return 360;
      case 'sm': return 440;
      case 'md': return 560;
      case 'lg': return 720;
      default: return typeof maxWidth === 'number' ? maxWidth : 440;
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
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)'
        }
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          m: { xs: 1, sm: 'auto' },
          p: '8px', // Strict 8px padding on all sides
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 8 : 'unset',
          left: isMobile ? 8 : 'unset',
          right: isMobile ? 8 : 'unset',
          width: isMobile ? 'calc(100% - 16px) !important' : '100%',
          maxWidth: isMobile ? 'calc(100% - 16px) !important' : `${getMaxWidthPx()}px !important`,
          maxHeight: 'calc(100vh - 24px)',
          borderRadius: '8px',
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          boxSizing: 'border-box'
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
            pb: 0.5,
            bgcolor: 'transparent',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 3,
              borderRadius: '2px',
              bgcolor: 'divider'
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
        p: '8px', // Strict 8px padding
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        flexShrink: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'primary.main',
              '& svg': { width: 16, height: 16 }
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
                fontSize: '0.9375rem', // Normal font size, non-oversized
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.25,
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
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontWeight: 500,
                lineHeight: 1.2,
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
            width: 28,
            height: 28,
            p: 0.5,
            color: 'text.secondary',
            borderRadius: '6px',
            flexShrink: 0,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary'
            }
          }}
        >
          <X size={16} />
        </IconButton>
      )}
    </Box>
  );
}

export function ModalBody({ children, sx = {}, ...props }) {
  // Strip any oversized per-modal padding overrides to guarantee strict 8px
  const cleanSx = { ...sx };
  delete cleanSx.p;
  delete cleanSx.padding;
  delete cleanSx.px;
  delete cleanSx.py;
  delete cleanSx.paddingLeft;
  delete cleanSx.paddingRight;
  delete cleanSx.paddingTop;
  delete cleanSx.paddingBottom;

  return (
    <Box
      sx={{
        p: '8px !important', // Strict 8px padding on all sides, nothing larger
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px', // Tight, consistent 8px gap
        color: 'text.primary',
        boxSizing: 'border-box',
        maxWidth: '100%',
        ...cleanSx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export function ModalFooter({ children, sx = {}, ...props }) {
  // Strip oversized padding to maintain strict 8px
  const cleanSx = { ...sx };
  delete cleanSx.p;
  delete cleanSx.padding;
  delete cleanSx.px;
  delete cleanSx.py;

  return (
    <Box
      sx={{
        p: '8px !important', // Strict 8px padding
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        gap: '8px',
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        flexShrink: 0,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        ...cleanSx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default Modal;
