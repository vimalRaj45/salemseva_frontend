import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Paper
} from '@mui/material';
import {
  MapPin,
  Navigation,
  Home,
  CheckCircle2,
  AlertCircle,
  X,
  Compass
} from 'lucide-react';
import { SALEM_LOCALITIES, getLiveAccurateLocation, verifySalemBoundary } from '../utils/geoUtils';

export default function BookingAddressModal({ open, onClose, currentAddress, onAddressSelected }) {
  // Mode: 0 = Live GPS, 1 = Manual Entry
  const [activeTab, setActiveTab] = useState(0);

  // Live GPS state
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectedGpsData, setDetectedGpsData] = useState(null);
  const [gpsDoorNo, setGpsDoorNo] = useState('');
  const [gpsLandmark, setGpsLandmark] = useState('');
  const [gpsError, setGpsError] = useState('');

  // Manual entry state
  const [manualHouseNo, setManualHouseNo] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [manualLocality, setManualLocality] = useState(SALEM_LOCALITIES[0].name);
  const [manualLandmark, setManualLandmark] = useState('');
  const [manualPincode, setManualPincode] = useState(SALEM_LOCALITIES[0].pin);
  const [manualError, setManualError] = useState('');

  // Handle locality change in manual mode to auto-update pin
  const handleLocalityChange = (locName) => {
    setManualLocality(locName);
    const found = SALEM_LOCALITIES.find(l => l.name === locName);
    if (found) {
      setManualPincode(found.pin);
    }
  };

  // Request & verify live GPS
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setGpsError('');
    setDetectedGpsData(null);

    try {
      // 1. Check browser permission status if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' });
          if (perm.state === 'denied') {
            throw new Error('Location permission is blocked. Please allow location access in your browser/device settings, or choose manual address.');
          }
        } catch (pErr) {
          // Some browsers throw on permission query, continue to standard geolocation
        }
      }

      // 2. Fetch live coordinates & reverse geocode
      const geo = await getLiveAccurateLocation();

      if (!geo.isSalem) {
        throw new Error(
          `Detected location (${geo.city || geo.district || 'Outside Area'}) is outside Salem service boundary. Shazu One operates within Salem (636xxx). Please enter your service address manually.`
        );
      }

      setDetectedGpsData(geo);
    } catch (err) {
      console.warn('GPS detection failed:', err);
      let errorMsg = err.message || 'Could not detect live GPS.';
      if (errorMsg.includes('denied')) {
        errorMsg = 'Location permission is denied. Please enable Location in your device quick settings & browser settings, or enter address manually.';
      } else if (errorMsg.includes('unavailable') || errorMsg.includes('timed out')) {
        errorMsg = 'Device GPS signal is weak or turned off. Please turn ON location on your phone, or enter address manually.';
      }
      setGpsError(errorMsg);
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Confirm GPS Address
  const handleConfirmGps = () => {
    if (!detectedGpsData) {
      setGpsError('Please tap "Detect Live Location" first.');
      return;
    }
    if (!gpsDoorNo.trim()) {
      setGpsError('Please enter your House / Flat / Door Number for technician doorstep arrival.');
      return;
    }

    const localityPart = detectedGpsData.localityName || 'Salem Central';
    const pinPart = (detectedGpsData.pincode && detectedGpsData.pincode.startsWith('636'))
      ? detectedGpsData.pincode
      : '636016';

    const fullAddress = `${gpsDoorNo.trim()}, ${gpsLandmark.trim() ? gpsLandmark.trim() + ', ' : ''}${localityPart}, Salem - ${pinPart}`;

    const locationPayload = {
      locality: localityPart.replace(/,\s*Salem/i, '').trim(),
      pincode: pinPart,
      address: fullAddress,
      lat: detectedGpsData.lat,
      lng: detectedGpsData.lng,
      doorNo: gpsDoorNo.trim(),
      landmark: gpsLandmark.trim() || null,
      source: 'gps'
    };

    localStorage.setItem('shazuone_user_location', JSON.stringify(locationPayload));
    if (onAddressSelected) onAddressSelected(locationPayload);
    onClose();
  };

  // Confirm Manual Address
  const handleConfirmManual = () => {
    setManualError('');
    if (!manualHouseNo.trim()) {
      setManualError('Please enter your House / Flat / Door Number.');
      return;
    }
    if (!manualStreet.trim()) {
      setManualError('Please enter your Street / Building / Cross road name.');
      return;
    }

    const pin = manualPincode.trim() || '636016';
    if (!pin.startsWith('636') || pin.length !== 6) {
      setManualError('Service is available only in Salem pincodes (starts with 636).');
      return;
    }

    const locObj = SALEM_LOCALITIES.find(l => l.name === manualLocality) || SALEM_LOCALITIES[0];
    const fullAddress = `${manualHouseNo.trim()}, ${manualStreet.trim()}, ${manualLandmark.trim() ? manualLandmark.trim() + ', ' : ''}${manualLocality}, Salem - ${pin}`;

    const locationPayload = {
      locality: manualLocality,
      pincode: pin,
      address: fullAddress,
      lat: locObj.lat,
      lng: locObj.lng,
      doorNo: manualHouseNo.trim(),
      street: manualStreet.trim(),
      landmark: manualLandmark.trim() || null,
      source: 'manual'
    };

    localStorage.setItem('shazuone_user_location', JSON.stringify(locationPayload));
    if (onAddressSelected) onAddressSelected(locationPayload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          p: 0
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
            <MapPin size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Service Location
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
              Salem City Municipal Limits & Metro Zones
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{
            minHeight: '44px',
            '& .MuiTab-root': {
              minHeight: '44px',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'none'
            }
          }}
        >
          <Tab
            icon={<Navigation size={15} style={{ marginRight: 6 }} />}
            iconPosition="start"
            label="Use Live GPS"
          />
          <Tab
            icon={<Home size={15} style={{ marginRight: 6 }} />}
            iconPosition="start"
            label="Enter Manually"
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* ================= OPTION 1: LIVE GPS ================= */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1.5px dashed #0284C7',
                bgcolor: '#F0F9FF',
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={24} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14.5px', mb: 0.5 }}>
                1-Tap Device GPS Location
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '12px', mb: 2, maxWidth: 380, mx: 'auto' }}>
                Ensure your device location/GPS is turned ON. We will instantly pinpoint your road & locality.
              </Typography>

              <Button
                variant="contained"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                startIcon={isDetectingGps ? <CircularProgress size={16} color="inherit" /> : <Navigation size={16} />}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                {isDetectingGps ? 'Detecting Device Location...' : 'Detect My Live Location'}
              </Button>
            </Paper>

            {gpsError && (
              <Alert severity="warning" sx={{ fontSize: '12px', borderRadius: '10px' }}>
                {gpsError}
              </Alert>
            )}

            {detectedGpsData && (
              <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                  <CheckCircle2 size={18} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                      {detectedGpsData.localityName || 'Salem Area'}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '12px', lineHeight: 1.3 }}>
                      {detectedGpsData.fullAddress}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    label="House / Flat / Door Number *"
                    placeholder="e.g. Door No. 14/2, 2nd Floor, Sri Balaji Apts"
                    value={gpsDoorNo}
                    onChange={(e) => setGpsDoorNo(e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#CBD5E1' } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Landmark (Optional)"
                    placeholder="e.g. Near New Bus Stand / Opposite Bank"
                    value={gpsLandmark}
                    onChange={(e) => setGpsLandmark(e.target.value)}
                    sx={{ bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#CBD5E1' } }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ================= OPTION 2: MANUAL ENTRY ================= */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {manualError && (
              <Alert severity="error" sx={{ fontSize: '12px', borderRadius: '10px' }}>
                {manualError}
              </Alert>
            )}

            <TextField
              fullWidth
              size="small"
              required
              label="House / Flat / Door Number *"
              placeholder="e.g. 14/2 or Flat 302, Green Meadows"
              value={manualHouseNo}
              onChange={(e) => setManualHouseNo(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <TextField
              fullWidth
              size="small"
              required
              label="Street Name / Cross Road / Building *"
              placeholder="e.g. 5th Cross, Saradha College Main Rd"
              value={manualStreet}
              onChange={(e) => setManualStreet(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            />

            <TextField
              select
              fullWidth
              size="small"
              required
              label="Salem Locality / Area *"
              value={manualLocality}
              onChange={(e) => handleLocalityChange(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
            >
              {SALEM_LOCALITIES.map((loc) => (
                <MenuItem key={loc.name} value={loc.name}>
                  {loc.name} (Pin: {loc.pin})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
              <TextField
                fullWidth
                size="small"
                label="Landmark (Optional)"
                placeholder="e.g. Near Bus Stop"
                value={manualLandmark}
                onChange={(e) => setManualLandmark(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />

              <TextField
                fullWidth
                size="small"
                label="Salem Pincode *"
                value={manualPincode}
                onChange={(e) => setManualPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          sx={{ color: '#64748B', fontWeight: 700, fontSize: '13px', textTransform: 'none' }}
        >
          Cancel
        </Button>

        {activeTab === 0 ? (
          <Button
            variant="contained"
            onClick={handleConfirmGps}
            disabled={!detectedGpsData || !gpsDoorNo.trim()}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'none',
              px: 3,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Confirm GPS Address
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleConfirmManual}
            disabled={!manualHouseNo.trim() || !manualStreet.trim()}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'none',
              px: 3,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            Save Service Address
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
