import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Container,
  Chip
} from '@mui/material';
import {
  MapPin,
  Navigation,
  Home,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Compass,
  Check
} from 'lucide-react';
import { SALEM_LOCALITIES, getLiveAccurateLocation } from '../../utils/geoUtils';
import toast from 'react-hot-toast';

export default function BookingAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedLoc = (() => {
    try {
      const raw = localStorage.getItem('shazuone_user_location');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [activeTab, setActiveTab] = useState(0); // 0 = Live GPS, 1 = Manual Entry
  const [addressTag, setAddressTag] = useState('Home'); // Home, Work, Other

  // Live GPS state
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectedGpsData, setDetectedGpsData] = useState(null);
  const [gpsDoorNo, setGpsDoorNo] = useState('');
  const [gpsLandmark, setGpsLandmark] = useState('');
  const [gpsError, setGpsError] = useState('');

  // Manual entry state
  const [manualHouseNo, setManualHouseNo] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [manualLocality, setManualLocality] = useState(savedLoc?.locality || SALEM_LOCALITIES[0].name);
  const [manualLandmark, setManualLandmark] = useState('');
  const [manualPincode, setManualPincode] = useState(savedLoc?.pincode || SALEM_LOCALITIES[0].pin);
  const [manualError, setManualError] = useState('');

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleLocalityChange = (locName) => {
    setManualLocality(locName);
    const found = SALEM_LOCALITIES.find((l) => l.name === locName);
    if (found) {
      setManualPincode(found.pin);
    }
  };

  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setGpsError('');
    setDetectedGpsData(null);

    try {
      const geo = await getLiveAccurateLocation();
      setDetectedGpsData(geo);

      if (!geo.isSalem) {
        setGpsError(
          `Detected location (${geo.city || geo.district || 'Outside Area'}) is outside the Salem service zone. You can use manual entry to select your Salem address.`
        );
      }
    } catch (err) {
      console.warn('GPS detection failed:', err);
      let errorMsg = err.message || 'Could not detect live GPS.';
      if (errorMsg.includes('denied')) {
        errorMsg = 'Location permission is denied. Please enable Location in your device settings, or enter address manually.';
      } else if (errorMsg.includes('unavailable') || errorMsg.includes('timed out')) {
        errorMsg = 'Device GPS signal is weak. Please turn ON location on your phone, or enter address manually.';
      }
      setGpsError(errorMsg);
    } finally {
      setIsDetectingGps(false);
    }
  };

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
      address: fullAddress,
      pincode: pinPart,
      lat: detectedGpsData.lat,
      lng: detectedGpsData.lng,
      doorNo: gpsDoorNo.trim(),
      landmark: gpsLandmark.trim(),
      tag: addressTag
    };

    localStorage.setItem('shazuone_user_location', JSON.stringify(locationPayload));
    window.dispatchEvent(new CustomEvent('shazuone_location_updated', { detail: locationPayload }));
    toast.success('Doorstep service address confirmed!');
    handleDismiss();
  };

  const handleConfirmManual = () => {
    setManualError('');
    if (!manualHouseNo.trim()) {
      setManualError('House / Flat / Door Number is required.');
      return;
    }
    if (!manualStreet.trim()) {
      setManualError('Street Name / Area is required.');
      return;
    }
    if (!manualLocality) {
      setManualError('Please choose your Salem locality.');
      return;
    }

    const locObj = SALEM_LOCALITIES.find((l) => l.name === manualLocality) || SALEM_LOCALITIES[0];
    const fullAddress = `${manualHouseNo.trim()}, ${manualStreet.trim()}${manualLandmark.trim() ? ', Near ' + manualLandmark.trim() : ''}, ${manualLocality}, Salem - ${manualPincode || locObj.pin}`;

    const locationPayload = {
      locality: manualLocality,
      address: fullAddress,
      pincode: manualPincode || locObj.pin,
      lat: locObj.lat,
      lng: locObj.lng,
      doorNo: manualHouseNo.trim(),
      street: manualStreet.trim(),
      landmark: manualLandmark.trim(),
      tag: addressTag
    };

    localStorage.setItem('shazuone_user_location', JSON.stringify(locationPayload));
    window.dispatchEvent(new CustomEvent('shazuone_location_updated', { detail: locationPayload }));
    toast.success('Service address updated!');
    handleDismiss();
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <IconButton
          onClick={handleDismiss}
          aria-label="Go back"
          sx={{
            color: '#0F172A',
            bgcolor: '#F1F5F9',
            '&:hover': { bgcolor: '#E2E8F0' },
            width: 40,
            height: 40,
            borderRadius: '10px'
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Confirm service address
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Doorstep technician arrival details in Salem
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A66C2',
            flexShrink: 0
          }}
        >
          <MapPin size={20} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', px: { xs: 2, sm: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 46,
            '& .MuiTab-root': {
              minHeight: 46,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              color: '#64748B',
              '&.Mui-selected': { color: '#0A66C2' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#0A66C2', height: 3 }
          }}
        >
          <Tab icon={<Navigation size={15} />} iconPosition="start" label="Live GPS Detect" />
          <Tab icon={<Home size={15} />} iconPosition="start" label="Manual Address" />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        {/* Address Tag Selector */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', mb: 1 }}>
            Save address as
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { id: 'Home', icon: <Home size={14} />, label: 'Home' },
              { id: 'Work', icon: <Briefcase size={14} />, label: 'Work / Office' },
              { id: 'Other', icon: <Building size={14} />, label: 'Other' }
            ].map((t) => {
              const isSelected = addressTag === t.id;
              return (
                <Chip
                  key={t.id}
                  icon={t.icon}
                  label={t.label}
                  onClick={() => setAddressTag(t.id)}
                  clickable
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: '10px',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '12.5px',
                    bgcolor: isSelected ? '#0A66C2' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? '1px solid #0A66C2' : '1px solid #E2E8F0',
                    '& .MuiChip-icon': { color: isSelected ? '#FFFFFF' : '#64748B' },
                    '&:hover': { bgcolor: isSelected ? '#084E96' : '#F1F5F9' }
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {activeTab === 0 ? (
          /* LIVE GPS TAB */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={isDetectingGps ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <Navigation size={18} />}
              onClick={handleDetectLocation}
              disabled={isDetectingGps}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#0A66C2',
                fontWeight: 800,
                fontSize: '14.5px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              {isDetectingGps ? 'Detecting device GPS...' : 'Detect live GPS coordinates'}
            </Button>

            {gpsError && (
              <Alert severity="warning" icon={<AlertCircle size={18} />} sx={{ borderRadius: '12px' }}>
                {gpsError}
              </Alert>
            )}

            {detectedGpsData && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#F0F9FF',
                  border: '1.5px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={18} color="#0A66C2" />
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#0369A1' }}>
                    GPS Locked: {detectedGpsData.localityName || 'Salem Region'}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '12px', color: '#0C4A6E' }}>
                  Coordinates: {detectedGpsData.lat?.toFixed(5)} N, {detectedGpsData.lng?.toFixed(5)} E (Accuracy ±{detectedGpsData.accuracyMeters || 15}m)
                </Typography>
              </Paper>
            )}

            <TextField
              label="Flat / House / Door Number *"
              placeholder="e.g., 42/B, 2nd Floor, Sri Sai Nilayam"
              fullWidth
              required
              value={gpsDoorNo}
              onChange={(e) => setGpsDoorNo(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            <TextField
              label="Nearby Landmark (optional)"
              placeholder="e.g., Opposite Fairlands Bus Stop, Near Nilgiris Supermarket"
              fullWidth
              value={gpsLandmark}
              onChange={(e) => setGpsLandmark(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            <Box sx={{ mt: 2, pb: 4 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmGps}
                disabled={!detectedGpsData || !gpsDoorNo.trim()}
                sx={{
                  minHeight: 50,
                  borderRadius: '12px',
                  bgcolor: '#0A66C2',
                  fontWeight: 800,
                  fontSize: '15px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#084E96' }
                }}
              >
                Confirm Doorstep Address
              </Button>
            </Box>
          </Box>
        ) : (
          /* MANUAL ADDRESS TAB */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {manualError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {manualError}
              </Alert>
            )}

            <TextField
              label="Flat / House / Door Number *"
              placeholder="e.g. 14/2-A, Amman Nagar"
              fullWidth
              required
              value={manualHouseNo}
              onChange={(e) => setManualHouseNo(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            <TextField
              label="Street Name / Colony / Ward *"
              placeholder="e.g. 5th Cross Street, Fairlands Main Road"
              fullWidth
              required
              value={manualStreet}
              onChange={(e) => setManualStreet(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
                Select Salem locality *
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {SALEM_LOCALITIES.map((loc) => {
                  const isSelected = manualLocality === loc.name;
                  return (
                    <Chip
                      key={loc.name}
                      label={`${loc.name} (${loc.pin})`}
                      onClick={() => handleLocalityChange(loc.name)}
                      clickable
                      sx={{
                        borderRadius: '10px',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12px',
                        py: 2,
                        px: 0.5,
                        bgcolor: isSelected ? '#0A66C2' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1px solid #0A66C2' : '1px solid #E2E8F0',
                        '&:hover': { bgcolor: isSelected ? '#084E96' : '#F1F5F9' }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <TextField
              label="Nearby Landmark (optional)"
              placeholder="e.g., Near Saradha College, Behind Indian Bank"
              fullWidth
              value={manualLandmark}
              onChange={(e) => setManualLandmark(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            />

            <TextField
              label="Salem Postal PIN *"
              fullWidth
              required
              value={manualPincode}
              onChange={(e) => setManualPincode(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
              helperText="Must be a valid Salem postal PIN (636xxx)"
            />

            <Box sx={{ mt: 2, pb: 4 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmManual}
                sx={{
                  minHeight: 50,
                  borderRadius: '12px',
                  bgcolor: '#0A66C2',
                  fontWeight: 800,
                  fontSize: '15px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#084E96' }
                }}
              >
                Confirm Doorstep Address
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
