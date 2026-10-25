import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
  maxWidth = 'xs'
}) {
  return (
    <Dialog
      open={Boolean(open)}
      onClose={isLoading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          p: '8px', // Strict 8px padding
          maxWidth: { xs: 'calc(100vw - 16px)', sm: '380px' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ p: '8px', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              bgcolor: isDestructive ? 'error.light' : 'action.hover',
              color: isDestructive ? 'error.main' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& svg': { width: 15, height: 15 }
            }}
          >
            {isDestructive ? <AlertTriangle size={15} /> : <HelpCircle size={15} />}
          </Box>
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.25 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: '8px !important', my: 0.5, overflowX: 'hidden' }}>
        <Typography id="confirm-dialog-description" variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.45 }}>
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: '8px', gap: '8px', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={isLoading}
          sx={{
            minWidth: 70,
            minHeight: 34,
            py: 0.5,
            px: 1.5,
            borderRadius: '6px',
            fontSize: '0.8125rem'
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onConfirm}
          disabled={isLoading}
          color={isDestructive ? 'error' : 'primary'}
          sx={{
            minWidth: 85,
            minHeight: 34,
            py: 0.5,
            px: 1.5,
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.8125rem'
          }}
        >
          {isLoading ? <CircularProgress size={14} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
