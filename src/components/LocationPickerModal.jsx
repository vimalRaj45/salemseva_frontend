import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { MapPin, Navigation, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import {
  SALEM_LOCALITIES,
  getLiveAccurateLocation
} from '../utils/geoUtils';

export default function LocationPickerModal({
  open,
  onClose,
  currentLocation,
  onSelectLocation
}) {
  const [selectedLocality, setSelectedLocality] = useState(
    currentLocation?.locality || 'Fairlands'
  );
  const [doorAddress, setDoorAddress] = useState(
    currentLocation?.address || 'Plot 42, 5th Cross, Fairlands, Salem - 636016'
  );
  const [customPin, setCustomPin] = useState(
    currentLocation?.pincode || '636016'
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [detectedCoords, setDetectedCoords] = useState(
    currentLocation?.lat && currentLocation?.lng ? { lat: currentLocation.lat, lng: currentLocation.lng } : null
  );
  const [detectedOutsideRegion, setDetectedOutsideRegion] = useState(false);
  const [detectedPlaceInfo, setDetectedPlaceInfo] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Extract or detect 6-digit PIN code
  const pinInAddress = doorAddress.match(/\b(\d{6})\b/);
  const activePin = pinInAddress ? pinInAddress[1] : customPin;
  const isOutOfRegion = Boolean(
    detectedOutsideRegion ||
    (activePin && activePin.length === 6 && !activePin.startsWith('636'))
  );

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setGeoStatus('Locating your accurate live GPS coordinates...');

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

    const locObj = SALEM_LOCALITIES.find(l => l.name === selectedLocality) || SALEM_LOCALITIES[0];
    const finalLocation = {
      locality: selectedLocality,
      address: doorAddress.trim() || `${selectedLocality}, Salem - ${customPin}`,
      pincode: activePin || locObj.pin,
      lat: detectedCoords?.lat || locObj.lat,
      lng: detectedCoords?.lng || locObj.lng
    };

    if (onSelectLocation) {
      onSelectLocation(finalLocation);
    }
    toast.success(`Service address set to ${selectedLocality}, Salem`);
    onClose();
  };

  const filteredLocalities = SALEM_LOCALITIES.filter(l =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.pin.includes(searchFilter)
  );

  return (
    <Modal open={open} onClose={onClose} maxWidth="sm" ariaLabelledBy="location-modal-title">
      <ModalHeader
        id="location-modal-title"
        title="Set service location"
        subtitle="Technician dispatch across Salem city (PIN 636xxx)"
        onClose={onClose}
        icon={<MapPin size={20} color="#0A66C2" />}
      />

      <ModalBody>
        {/* GPS Auto Detect Action Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={isDetecting ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <Navigation size={18} />}
          onClick={handleDetectGPS}
          disabled={isDetecting}
          sx={{
            py: 1.5,
            borderRadius: '14px',
            bgcolor: '#0A66C2',
            fontWeight: 700,
            fontSize: '14px',
            minHeight: 48,
            boxShadow: '0 2px 8px rgba(10, 102, 194, 0.25)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#084E96' }
          }}
        >
          {isDetecting ? 'Detecting live GPS location...' : 'Use current GPS location'}
        </Button>

        {geoStatus && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: detectedOutsideRegion ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${detectedOutsideRegion ? '#FECACA' : '#BBF7D0'}`
            }}
          >
            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: detectedOutsideRegion ? '#DC2626' : '#16A34A' }}>
              {geoStatus}
            </Typography>
          </Box>
        )}

        {detectedOutsideRegion && (
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <Typography sx={{ color: '#991B1B', fontWeight: 700, fontSize: '13px', mb: 0.5 }}>
              Location outside Salem region
            </Typography>
            <Typography sx={{ color: '#7F1D1D', fontSize: '12px', lineHeight: 1.45 }}>
              Your device ({detectedPlaceInfo?.name || 'Outside Area'}) is ~{Math.round(detectedPlaceInfo?.distanceKm || 0)} km from Salem. Shazu One doorstep service is available within Salem PINs (636xxx). Please select a Salem locality below.
            </Typography>
          </Box>
        )}

        {/* Search localities */}
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 0.8 }}>
            Choose Salem locality hub
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search Salem locality (e.g. Fairlands, Ammapet)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#94A3B8" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '13px' } }}
          />

          {/* Salem Localities: Clean wrapped chips without inner scrollbox */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredLocalities.map((loc) => {
              const isSelected = selectedLocality === loc.name && !detectedOutsideRegion;
              return (
                <Chip
                  key={loc.name}
                  label={`${loc.name} (${loc.pin})`}
                  onClick={() => {
                    setDetectedOutsideRegion(false);
                    setSelectedLocality(loc.name);
                    setCustomPin(loc.pin);
                    setDetectedCoords({ lat: loc.lat, lng: loc.lng });
                    setDoorAddress(`Plot/House No., ${loc.name}, Salem - ${loc.pin}`);
                  }}
                  icon={isSelected ? <CheckCircle size={14} color="#0A66C2" /> : undefined}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '12px',
                    bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    color: isSelected ? '#0A66C2' : '#334155',
                    border: isSelected ? '1.5px solid #0A66C2' : '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    height: 36,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? '#EFF6FF' : '#F1F5F9'
                    }
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Postal PIN Code Verification */}
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px' }}>
              Postal PIN code (service region)
            </Typography>
            <Chip
              size="small"
              label={isOutOfRegion ? 'Outside service area' : 'Active Salem region'}
              sx={{
                fontWeight: 600,
                fontSize: '11px',
                height: 22,
                borderRadius: '9999px',
                bgcolor: isOutOfRegion ? '#FEE2E2' : '#DCFCE7',
                color: isOutOfRegion ? '#DC2626' : '#166534'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              value={activePin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCustomPin(val);
                if (doorAddress.match(/\b\d{6}\b/)) {
                  setDoorAddress(doorAddress.replace(/\b\d{6}\b/, val));
                }
              }}
              placeholder="636xxx"
              inputProps={{ maxLength: 6 }}
              sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF', fontWeight: 600, fontSize: '13px' } }}
            />
            <Typography sx={{ color: isOutOfRegion ? '#DC2626' : '#16A34A', fontSize: '12px', lineHeight: 1.4 }}>
              {isOutOfRegion
                ? `PIN ${activePin} is outside our coverage area (Salem: 636xxx only).`
                : `Verified Salem hub (${activePin}). Doorstep dispatch ready.`}
            </Typography>
          </Box>
        </Box>

        {/* Doorstep Full Address Field */}
        <Box>
          <Typography sx={{ fontWeight: 600, color: '#64748B', fontSize: '13px', mb: 0.8 }}>
            Complete doorstep address
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={doorAddress}
            onChange={(e) => setDoorAddress(e.target.value)}
            placeholder="House/flat no., street name, landmark"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '13px', bgcolor: '#F8FAFC' } }}
          />
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderColor: '#E2E8F0',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '13px',
            borderRadius: '12px',
            minHeight: 44,
            px: 2,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isOutOfRegion}
          sx={{
            bgcolor: '#0A66C2',
            color: '#FFFFFF',
            borderRadius: '14px',
            minHeight: 48,
            px: 3,
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#084E96' },
            '&:disabled': { bgcolor: '#CBD5E1', color: '#94A3B8' }
          }}
        >
          {isOutOfRegion ? 'Cannot accept (outside Salem)' : 'Confirm location'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
