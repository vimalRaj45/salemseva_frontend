import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  InputAdornment,
  Container,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import { MapPin, Navigation, Search, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { SALEM_LOCALITIES, getLiveAccurateLocation } from '../../utils/geoUtils';

export default function LocationPickerPage() {
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

  const [selectedLocality, setSelectedLocality] = useState(
    location.state?.currentLocation?.locality || savedLoc?.locality || 'Fairlands'
  );
  const [doorAddress, setDoorAddress] = useState(
    location.state?.currentLocation?.address || savedLoc?.address || 'Fairlands, Salem - 636016'
  );
  const [customPin, setCustomPin] = useState(
    location.state?.currentLocation?.pincode || savedLoc?.pincode || '636016'
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [detectedCoords, setDetectedCoords] = useState(
    savedLoc?.lat && savedLoc?.lng ? { lat: savedLoc.lat, lng: savedLoc.lng } : null
  );
  const [detectedOutsideRegion, setDetectedOutsideRegion] = useState(false);
  const [detectedPlaceInfo, setDetectedPlaceInfo] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const pinInAddress = doorAddress.match(/\b(\d{6})\b/);
  const activePin = pinInAddress ? pinInAddress[1] : customPin;
  const isOutOfRegion = Boolean(
    detectedOutsideRegion ||
    (activePin && activePin.length === 6 && !activePin.startsWith('636'))
  );

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setGeoStatus('Locating your live GPS coordinates...');

    try {
      const geo = await getLiveAccurateLocation();
      setIsDetecting(false);
      setDetectedCoords({ lat: geo.lat, lng: geo.lng });

      if (geo.isSalem) {
        setDetectedOutsideRegion(false);
        setDetectedPlaceInfo(null);
        setGeoStatus(`GPS locked: ${geo.lat.toFixed(4)} N, ${geo.lng.toFixed(4)} E`);

        const closest = SALEM_LOCALITIES.reduce((prev, curr) => {
          const prevDist = Math.hypot(prev.lat - geo.lat, prev.lng - geo.lng);
          const currDist = Math.hypot(curr.lat - geo.lat, curr.lng - geo.lng);
          return currDist < prevDist ? curr : prev;
        }, SALEM_LOCALITIES[0]);

        setSelectedLocality(closest.name);
        setCustomPin(geo.pincode && geo.pincode.startsWith('636') ? geo.pincode : closest.pin);
        const resolvedAddr = geo.fullAddress && geo.fullAddress.length > 15
          ? geo.fullAddress
          : `Live GPS Doorstep (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}), ${closest.name}, Salem - ${closest.pin}`;
        setDoorAddress(resolvedAddr);
      } else {
        setDetectedOutsideRegion(true);
        setDetectedPlaceInfo({
          name: geo.localityName || geo.city || 'Outside Salem',
          distanceKm: geo.distanceKmFromCenter || 0,
          pincode: geo.pincode || ''
        });
        setGeoStatus('Current device location is outside Salem operational boundary');
      }
    } catch (err) {
      console.warn('GPS detection failed:', err);
      setIsDetecting(false);
      setGeoStatus('Could not detect location. Please select your locality below.');
    }
  };

  const handleConfirm = () => {
    if (isOutOfRegion) {
      toast.error('Shazu One exclusively serves the Salem region (PIN 636xxx). Please select a valid Salem locality.');
      return;
    }

    const locObj = SALEM_LOCALITIES.find((l) => l.name === selectedLocality) || SALEM_LOCALITIES[0];
    const finalLocation = {
      locality: selectedLocality,
      address: doorAddress.trim() || `${selectedLocality}, Salem - ${customPin}`,
      pincode: activePin || locObj.pin,
      lat: detectedCoords?.lat || locObj.lat,
      lng: detectedCoords?.lng || locObj.lng
    };

    localStorage.setItem('shazuone_user_location', JSON.stringify(finalLocation));
    window.dispatchEvent(new CustomEvent('shazuone_location_updated', { detail: finalLocation }));

    toast.success(`Service address set to ${selectedLocality}, Salem`);
    handleDismiss();
  };

  const filteredLocalities = SALEM_LOCALITIES.filter((l) =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.pin.includes(searchFilter)
  );

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
            Set service location
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Technician dispatch across Salem city (PIN 636xxx)
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

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* GPS Auto Detect Action Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={isDetecting ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <Navigation size={18} />}
          onClick={handleDetectGPS}
          disabled={isDetecting}
          sx={{
            py: 1.6,
            borderRadius: '14px',
            bgcolor: '#0A66C2',
            fontWeight: 800,
            fontSize: '14.5px',
            minHeight: 52,
            boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#084E96' }
          }}
        >
          {isDetecting ? 'Detecting live GPS location...' : 'Use current device GPS location'}
        </Button>

        {geoStatus && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            <Typography
              sx={{
                fontSize: '12.5px',
                color: isOutOfRegion ? '#DC2626' : '#0369A1',
                bgcolor: isOutOfRegion ? '#FEF2F2' : '#F0F9FF',
                p: 1.5,
                borderRadius: '10px',
                border: isOutOfRegion ? '1px solid #FECACA' : '1px solid #BAE6FD',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {geoStatus}
            </Typography>
            <Typography sx={{ fontSize: '10px', color: '#64748B', textAlign: 'center' }}>
              Address lookup (c){' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0A66C2', textDecoration: 'underline' }}
              >
                OpenStreetMap contributors
              </a>
            </Typography>
          </Box>
        )}

        {isOutOfRegion && (
          <Alert severity="warning" icon={<ShieldAlert size={18} />} sx={{ borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700 }}>
              Outside Salem Service Zone
            </Typography>
            <Typography sx={{ fontSize: '12px' }}>
              Shazu One operates exclusively in Salem District (PIN codes starting with 636). Please choose a Salem locality below.
            </Typography>
          </Alert>
        )}

        {/* Search locality */}
        <TextField
          fullWidth
          placeholder="Search Salem locality or 6-digit PIN..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#64748B" />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', bgcolor: '#FFFFFF' }
          }}
        />

        {/* Localities Grid */}
        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1.2 }}>
            Salem service wards & areas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredLocalities.map((loc) => {
              const isSelected = selectedLocality === loc.name;
              return (
                <Chip
                  key={loc.name}
                  label={`${loc.name} (${loc.pin})`}
                  onClick={() => {
                    setSelectedLocality(loc.name);
                    setCustomPin(loc.pin);
                    setDoorAddress(`${loc.name}, Salem - ${loc.pin}`);
                    setDetectedOutsideRegion(false);
                  }}
                  clickable
                  sx={{
                    borderRadius: '10px',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '12px',
                    py: 2.2,
                    px: 0.5,
                    bgcolor: isSelected ? '#0A66C2' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? '1px solid #0A66C2' : '1px solid #E2E8F0',
                    boxShadow: isSelected ? '0 2px 8px rgba(10, 102, 194, 0.22)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? '#084E96' : '#F1F5F9'
                    }
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Detailed Address Field */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            Doorstep delivery / service address
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Flat / Door No, Building, Street, Landmark"
            value={doorAddress}
            onChange={(e) => setDoorAddress(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
          />

          <TextField
            fullWidth
            label="Salem postal PIN code"
            value={customPin}
            onChange={(e) => setCustomPin(e.target.value)}
            InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
            helperText="Must be a valid Salem postal PIN (636xxx)"
          />
        </Box>

        {/* Action Button */}
        <Box sx={{ mt: 'auto', pt: 2, pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            disabled={isOutOfRegion}
            sx={{
              minHeight: 50,
              borderRadius: '12px',
              bgcolor: '#0A66C2',
              fontWeight: 800,
              fontSize: '15px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
              '&:hover': { bgcolor: '#084E96' },
              '&.Mui-disabled': { bgcolor: '#CBD5E1', color: '#94A3B8' }
            }}
          >
            Confirm {selectedLocality} as service location
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
