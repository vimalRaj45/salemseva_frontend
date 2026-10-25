import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import RoomIcon from '@mui/icons-material/Room';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigationIcon from '@mui/icons-material/Navigation';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LeafletMap from '../../components/LeafletMap';
import { ILLUSTRATIONS } from '../../constants/visualAssets';
import { API_V1_URL } from '../../config';

const TRACKING_STAGES = [
  { key: 'matching', label: 'Requested', icon: BoltIcon, desc: 'Booking received by Salem dispatch hub' },
  { key: 'accepted', label: 'Dispatched', icon: AssignmentIndIcon, desc: 'Technician assigned & confirmed order' },
  { key: 'en_route', label: 'En Route', icon: DirectionsBikeIcon, desc: 'Partner traveling to customer doorstep' },
  { key: 'arrived', label: 'On Site', icon: RoomIcon, desc: 'Arrived at location & OTP verified' },
  { key: 'quote_presented', label: 'Quote Review', icon: ReceiptLongIcon, desc: 'Diagnostic done, itemized quote presented' },
  { key: 'in_progress', label: 'In Progress', icon: BuildIcon, desc: 'Technical repair / installation underway' },
  { key: 'completed', label: 'Completed', icon: CheckCircleIcon, desc: 'Job finished, customer paid & settled' }
];

export default function AdminTrackingModal({
  open,
  onClose,
  booking,
  technician,
  onStatusUpdated = () => {}
}) {
  const [advancing, setAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!booking) return null;

  const currentStatus = booking.status || 'matching';
  const currentIndex = TRACKING_STAGES.findIndex(s => s.key === currentStatus);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  const nextStage = activeStep < TRACKING_STAGES.length - 1 ? TRACKING_STAGES[activeStep + 1] : null;

  const handleAdvanceStatus = async (targetStatusKey) => {
    try {
      setAdvancing(true);
      setErrorMsg('');

      const res = await fetch(`${API_V1_URL}/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatusKey })
      });

      const data = await res.json();
      if (data.success || res.ok) {
        onStatusUpdated(booking.id, targetStatusKey);
      } else {
        setErrorMsg(data.error || 'Failed to update booking status');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error updating status');
    } finally {
      setAdvancing(false);
    }
  };

  // Coords fallback
  const techCoords = technician?.current_lat && technician?.current_lng
    ? [parseFloat(technician.current_lat), parseFloat(technician.current_lng)]
    : [11.6780, 78.1580]; // Hasthampatti, Salem

  const custCoords = [11.6643, 78.1460]; // Fairlands, Salem

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="md"
      ariaLabelledBy="admin-tracking-title"
    >
      <ModalHeader
        id="admin-tracking-title"
        title="Live tracking console"
        subtitle={`Booking #${booking.id} • ${booking.service_name || booking.service_id}`}
        onClose={onClose}
        icon={<NavigationIcon sx={{ fontSize: 20 }} />}
      />

      <ModalBody sx={{ bgcolor: '#F8FAFC' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {errorMsg}
          </Alert>
        )}

        {/* 7-STAGE PROFESSIONAL STATUS PROGRESSION BAR */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              7-Stage Operational Lifecycle
            </Typography>
            <Chip
              label={`Current Stage: ${TRACKING_STAGES[activeStep]?.label.toUpperCase()}`}
              size="small"
              sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '10.5px' }}
            />
          </Box>

          {/* Stepper Progression Track */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', px: 1 }}>
            {TRACKING_STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isPassed = idx < activeStep;
              const isCurrent = idx === activeStep;
              const isFuture = idx > activeStep;

              return (
                <Box
                  key={stage.key}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {/* Connecting line */}
                  {idx > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 18,
                        right: '50%',
                        left: '-50%',
                        height: 3,
                        bgcolor: idx <= activeStep ? '#0284C7' : '#E2E8F0',
                        zIndex: -1,
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  )}

                  {/* Stage Icon Node */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isCurrent ? '#0284C7' : isPassed ? '#10B981' : '#F1F5F9',
                      color: isCurrent || isPassed ? '#FFFFFF' : '#94A3B8',
                      border: isCurrent ? '3px solid #BAE6FD' : '2px solid transparent',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.2)' : 'none',
                      transition: 'all 0.25s ease',
                      cursor: 'default'
                    }}
                  >
                    <StageIcon sx={{ fontSize: 18 }} />
                  </Box>

                  {/* Stage Title */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      fontWeight: isCurrent ? 900 : isPassed ? 700 : 600,
                      color: isCurrent ? '#0284C7' : isPassed ? '#10B981' : '#64748B',
                      fontSize: '11px',
                      textAlign: 'center',
                      lineHeight: 1.1
                    }}
                  >
                    {stage.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Current Stage Description & Dispatch Action Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {TRACKING_STAGES[activeStep]?.desc}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Timestamp: {booking.updated_at ? new Date(booking.updated_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </Typography>
            </Box>

            {nextStage && (
              <Button
                variant="contained"
                size="small"
                startIcon={advancing ? <CircularProgress size={14} sx={{ color: '#FFFFFF' }} /> : <FastForwardIcon sx={{ fontSize: 16 }} />}
                disabled={advancing}
                onClick={() => handleAdvanceStatus(nextStage.key)}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '11.5px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                {advancing ? 'Updating...' : `Advance to: ${nextStage.label}`}
              </Button>
            )}
          </Box>

          {/* Customer Cancellation Response Banner */}
          {(booking.status === 'cancelled' || booking.cancellation_reason) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '12px' }}>
              <Typography variant="subtitle2" sx={{ color: '#991B1B', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                Customer Cancellation Recorded
              </Typography>
              <Typography variant="body2" sx={{ color: '#7F1D1D', fontWeight: 700, mt: 0.5, fontSize: '12.5px' }}>
                Reason: {booking.cancellation_reason || 'Customer requested doorstep request cancellation'}
              </Typography>
              {booking.cancellation_details && (
                <Typography variant="body2" sx={{ color: '#991B1B', fontStyle: 'italic', mt: 0.3, fontSize: '12px' }}>
                  Customer Note: "{booking.cancellation_details}"
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.8, fontSize: '11px' }}>
                Action logged by {booking.cancelled_by || 'Customer'} {booking.cancelled_at ? `on ${new Date(booking.cancelled_at).toLocaleString()}` : ''}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Live Leaflet GPS Map */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ p: 1.5, px: 2, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src={ILLUSTRATIONS.salemMap}
                alt="Salem City Map"
                sx={{ width: 22, height: 22, objectFit: 'contain' }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Live GPS Telemetry & Street Navigation
              </Typography>
            </Box>
            <Chip
              label="Salem Municipal Grid"
              size="small"
              sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '10px' }}
            />
          </Box>

          <Box sx={{ height: 260 }}>
            <LeafletMap
              techPos={techCoords}
              custPos={custCoords}
              techName={technician?.full_name || 'Dispatched Partner'}
              custAddress={booking.customer_address || booking.locality || 'Fairlands, Salem'}
              eta="6-10 mins"
              distance="2.1 km"
              height={260}
            />
          </Box>
        </Paper>

        {/* Details Grid: Technician Dossier & Customer Destination */}
        <Grid container spacing={2}>
          {/* Technician Details */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Assigned Technician
                </Typography>
                <Box
                  component="img"
                  src={ILLUSTRATIONS.technicianEnRoute}
                  alt="Technician driving"
                  sx={{ width: 44, height: 32, objectFit: 'contain', opacity: 0.85 }}
                />
              </Box>

              {technician ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: '#0284C7',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900
                      }}
                    >
                      {technician.full_name?.substring(0, 2).toUpperCase() || 'TC'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>
                        {technician.full_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Trade: {(technician.primary_trade || 'general').toUpperCase()} • {technician.years_experience || 4}y exp
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', p: 1, borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 13, color: '#64748B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        {technician.phone || '+91-94432'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {technician.rating_avg || '4.90'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <ShieldIcon sx={{ fontSize: 13, color: '#10B981' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>
                        DigiLocker KYC
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
                    No technician dispatched yet.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Customer & Security Details */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Customer & Doorstep Security
                </Typography>
                <Box
                  component="img"
                  src={ILLUSTRATIONS.orderConfirmed}
                  alt="Order verified"
                  sx={{ width: 44, height: 32, objectFit: 'contain', opacity: 0.85 }}
                />
              </Box>

              <Box sx={{ mb: 1.2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  {booking.customer_name || 'Salem Resident'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Phone: {booking.customer_phone || '+91-98765'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, display: 'block' }}>
                  Locality: {booking.locality || 'Fairlands, Salem'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F0FDF4', p: 1, borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block', fontSize: '10px' }}>
                    DOORSTEP VERIFICATION PIN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#14532D', letterSpacing: 1 }}>
                    PIN: {booking.doorstep_otp || booking.doorstepOtp || '----'}
                  </Typography>
                </Box>
                <Chip
                  label="Security Guard"
                  size="small"
                  sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '9.5px', height: 20 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </ModalBody>

      <ModalFooter sx={{ bgcolor: '#FFFFFF' }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#0A66C2',
            color: '#FFFFFF',
            borderRadius: '12px',
            minHeight: 44,
            px: 3,
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#084E96' }
          }}
        >
          Close console
        </Button>
      </ModalFooter>
    </Modal>
  );
}
