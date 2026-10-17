import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CriticalWorkContext = createContext(null);

export function CriticalWorkProvider({ children }) {
  const [criticalWork, setCriticalWorkState] = useState({
    active: false,
    reason: '',
    operationId: null
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState(null);

  const setCriticalWork = useCallback((active, reason = 'Critical operation in progress', operationId = null) => {
    setCriticalWorkState({
      active: Boolean(active),
      reason: String(reason || 'Critical operation in progress'),
      operationId: operationId || (active ? `OP-${Date.now()}` : null)
    });
  }, []);

  // Browser beforeunload event handler (F5, Tab Close, Window Close)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (criticalWork.active) {
        const message = 'A critical payment or appointment reservation is currently in progress. Refreshing or leaving this page may cause transaction disruption or duplicate charges.';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [criticalWork.active, criticalWork.reason]);

  // Request in-app navigation guard (intercepts route changes when critical work is active)
  const guardedNavigate = useCallback((navigateCallback) => {
    if (criticalWork.active) {
      setPendingNavigationAction(() => navigateCallback);
      setConfirmDialogOpen(true);
      return false;
    }
    navigateCallback();
    return true;
  }, [criticalWork.active]);

  const handleConfirmLeave = () => {
    setConfirmDialogOpen(false);
    setCriticalWork(false);
    if (pendingNavigationAction) {
      pendingNavigationAction();
      setPendingNavigationAction(null);
    }
  };

  const handleStayOnPage = () => {
    setConfirmDialogOpen(false);
    setPendingNavigationAction(null);
  };

  return (
    <CriticalWorkContext.Provider value={{
      isCriticalWorkActive: criticalWork.active,
      criticalWorkReason: criticalWork.reason,
      setCriticalWork,
      guardedNavigate
    }}>
      {children}

      {/* Navigation Interception Alert Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleStayOnPage}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 1,
            border: '1.5px solid #FCA5A5'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <WarningAmberIcon sx={{ color: '#DC2626', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#991B1B', fontSize: '16px' }}>
            Critical Operation In Progress
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.55 }}>
            {criticalWork.reason || 'A secure payment or appointment reservation is currently underway.'}
          </Typography>
          <Box sx={{ mt: 1.5, p: 1.2, bgcolor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
            <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 600, display: 'block' }}>
              Leaving or refreshing now may result in duplicate charges or an unconfirmed appointment slot.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleConfirmLeave}
            sx={{
              color: '#991B1B',
              borderColor: '#F87171',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '12.5px',
              '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' }
            }}
          >
            Leave Anyway
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleStayOnPage}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '12.5px',
              px: 2,
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Stay on Page
          </Button>
        </DialogActions>
      </Dialog>
    </CriticalWorkContext.Provider>
  );
}

export function useCriticalWork() {
  const context = useContext(CriticalWorkContext);
  if (!context) {
    return {
      isCriticalWorkActive: false,
      criticalWorkReason: '',
      setCriticalWork: () => {},
      guardedNavigate: (cb) => cb()
    };
  }
  return context;
}
