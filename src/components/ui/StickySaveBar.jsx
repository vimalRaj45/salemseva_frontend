import React from 'react';
import { Paper, Box, Typography, Button, Chip, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

/**
 * StickySaveBar
 * Floating bottom / top bar for settings and forms with unsaved changes.
 */
export default function StickySaveBar({
  show = true,
  onSave,
  onDiscard,
  saving = false,
  saveText = 'Save All Settings',
  discardText = 'Discard',
  message = 'You have unsaved changes in platform settings',
  position = 'bottom',
  sx = {}
}) {
  if (!show) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'sticky',
        bottom: position === 'bottom' ? 24 : 'auto',
        top: position === 'top' ? 24 : 'auto',
        zIndex: 1100,
        p: 2,
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: 'primary.light',
        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label="Unsaved Changes"
          size="small"
          sx={{
            bgcolor: 'warning.light',
            color: 'warning.dark',
            fontWeight: 700,
            fontSize: '11px',
            borderRadius: '4px'
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'slate.800', fontSize: '13px' }}>
          {message}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {onDiscard && (
          <Button
            variant="outlined"
            size="small"
            onClick={onDiscard}
            disabled={saving}
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: 'slate.300',
              color: 'slate.700',
              fontWeight: 600
            }}
          >
            {discardText}
          </Button>
        )}

        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            fontWeight: 700,
            px: 2.5
          }}
        >
          {saving ? 'Saving...' : saveText}
        </Button>
      </Box>
    </Paper>
  );
}
