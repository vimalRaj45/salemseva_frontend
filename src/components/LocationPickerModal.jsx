import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  InputAdornment
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ILLUSTRATIONS } from '../constants/visualAssets';
import toast from 'react-hot-toast';

import {
  SALEM_LOCALITIES,
  SALEM_CENTER,
  getLiveAccurateLocation,
  calculateDistanceKm,
  verifySalemBoundary
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
        setGeoStatus(`GPS Locked: ${geo.lat.toFixed(4)} N, ${geo.lng.toFixed(4)} E (${geo.localityName || 'Salem Grid'})`);

        // Find closest locality in Salem
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
        // Accurately acknowledge that user is outside Salem
        setDetectedOutsideRegion(true);
        setDetectedPlaceInfo({
          name: geo.localityName || geo.city || 'Outside Salem',
          distanceKm: geo.distanceKmFromCenter || 0,
          pincode: geo.pincode || ''
        });
        setGeoStatus(
          `Live GPS: ${geo.lat.toFixed(4)} N, ${geo.lng.toFixed(4)} E (${geo.city || geo.district || 'Outside Region'}, ~${Math.round(geo.distanceKmFromCenter || 0)} km from Salem)`
        );
        if (geo.pincode) {
          setCustomPin(geo.pincode);
        }
        setDoorAddress(geo.fullAddress || `Live Location: ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)} (${geo.city})`);
      }
    } catch (error) {
      setIsDetecting(false);
      setGeoStatus(`Location detection notice: ${error.message || 'Please select a Salem locality below.'}`);
    }
  };

  const handleConfirm = () => {
    if (isOutOfRegion) {
      toast.error(`Service Unavailable: PIN (${activePin}) is outside Salem district. SalemSeva operates exclusively in Salem (636xxx). Please select a Salem locality.`);
      return;
    }
    const locObj = SALEM_LOCALITIES.find(l => l.name === selectedLocality) || SALEM_LOCALITIES[0];
    const finalPin = activePin && activePin.length === 6 ? activePin : locObj.pin;
    const locationData = {
      locality: selectedLocality,
      pincode: finalPin,
      lat: detectedCoords ? detectedCoords.lat : locObj.lat,
      lng: detectedCoords ? detectedCoords.lng : locObj.lng,
      address: doorAddress || `${selectedLocality}, Salem - ${finalPin}`
    };
    localStorage.setItem('salemseva_user_location', JSON.stringify(locationData));
    onSelectLocation(locationData);
    onClose();
  };

  const filteredLocalities = SALEM_LOCALITIES.filter(l =>
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.pin.includes(searchFilter)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1,
          bgcolor: '#FFFFFF',
          boxShadow: '0 25px 50px rgba(15, 23, 42, 0.25)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon sx={{ color: '#0284C7', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
              Select Salem Service Location
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Technicians dispatch from nearest local hub within 25 mins
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {/* Salem Live Service Map Illustration Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '16px',
            p: 1.5,
            mb: 2
          }}
        >
          <Box sx={{ maxWidth: '65%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '13px' }}>
              Salem Citywide Live Coverage
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '11px', display: 'block', lineHeight: 1.35, mt: 0.3 }}>
              Select your ward or tap GPS for verified local technician auto-dispatch within 25 minutes.
            </Typography>
          </Box>
          <Box
            component="img"
            src={ILLUSTRATIONS.salemMap}
            alt="Salem Live Service Map"
            sx={{ width: 80, height: 60, objectFit: 'contain' }}
          />
        </Box>

        {/* GPS Auto Detect Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={isDetecting ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <MyLocationIcon />}
          onClick={handleDetectGPS}
          disabled={isDetecting}
          sx={{
            py: 1.3,
            borderRadius: '16px',
            bgcolor: '#0284C7',
            fontWeight: 800,
            fontSize: '14px',
            mb: 2,
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#0369A1' }
          }}
        >
          {isDetecting ? 'Detecting Live GPS Pin...' : 'Use My Current Live GPS Location'}
        </Button>

        {geoStatus && (
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: detectedOutsideRegion ? '#B91C1C' : '#059669', fontWeight: 700, bgcolor: detectedOutsideRegion ? '#FEF2F2' : '#ECFDF5', p: 1, borderRadius: '8px', border: detectedOutsideRegion ? '1px solid #FECACA' : '1px solid #A7F3D0' }}>
             {geoStatus}
          </Typography>
        )}

        {detectedOutsideRegion && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
            <Typography variant="subtitle2" sx={{ color: '#991B1B', fontWeight: 800, fontSize: '13px', mb: 0.5 }}>
              Live GPS Detected Outside Salem Region
            </Typography>
            <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block', lineHeight: 1.4 }}>
              Your current device location ({detectedPlaceInfo?.name || 'Outside Area'}) is approximately {Math.round(detectedPlaceInfo?.distanceKm || 0)} km from Salem. SalemSeva technician doorstep service is exclusively available within Salem (PIN 636xxx). To schedule service for a home or property in Salem, select a Salem locality below.
            </Typography>
          </Box>
        )}

        {/* Search localities */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search Salem locality (e.g. Fairlands, Hasthampatti, Ammapet)..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />

        {/* Salem Localities Grid */}
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 1, letterSpacing: 0.5 }}>
          CHOOSE SALEM LOCALITY HUB:
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5, maxHeight: 160, overflowY: 'auto', pr: 0.5 }}>
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
                icon={isSelected ? <CheckCircleIcon sx={{ fontSize: 16, color: '#0284C7 !important' }} /> : undefined}
                sx={{
                  fontWeight: isSelected ? 900 : 600,
                  fontSize: '12px',
                  bgcolor: isSelected ? '#E0F2FE' : '#F1F5F9',
                  color: isSelected ? '#0284C7' : '#334155',
                  border: isSelected ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </Box>

        {/* Postal PIN Code & Service Coverage Verification */}
        <Box sx={{ mb: 2, p: 1.5, borderRadius: '14px', bgcolor: isOutOfRegion ? '#FEF2F2' : '#F0FDF4', border: isOutOfRegion ? '1.5px solid #FCA5A5' : '1px solid #BBF7D0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: isOutOfRegion ? '#991B1B' : '#166534', letterSpacing: 0.5 }}>
              POSTAL PIN CODE (SERVICE REGION):
            </Typography>
            <Chip
              size="small"
              label={isOutOfRegion ? 'Outside Service Area' : 'Salem Active Grid'}
              sx={{
                fontWeight: 800,
                fontSize: '11px',
                bgcolor: isOutOfRegion ? '#EF4444' : '#10B981',
                color: '#FFFFFF'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              value={activePin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCustomPin(val);
                // Also update pin in address
                if (doorAddress.match(/\b\d{6}\b/)) {
                  setDoorAddress(doorAddress.replace(/\b\d{6}\b/, val));
                }
              }}
              placeholder="e.g. 636016"
              inputProps={{ maxLength: 6 }}
              sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#FFFFFF', fontWeight: 700 } }}
            />
            <Typography variant="caption" sx={{ color: isOutOfRegion ? '#DC2626' : '#15803D', fontWeight: 600, fontSize: '11.5px', lineHeight: 1.3 }}>
              {isOutOfRegion
                ? `PIN ${activePin} is outside our working region. SalemSeva only serves Salem (PINs: 636xxx).`
                : `Verified Salem hub (${activePin}). Technicians arrive within 25 mins.`}
            </Typography>
          </Box>
        </Box>

        {/* Doorstep Full Address Field */}
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', display: 'block', mb: 0.8, letterSpacing: 0.5 }}>
          COMPLETE DOORSTEP / STREET ADDRESS:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={doorAddress}
          onChange={(e) => setDoorAddress(e.target.value)}
          placeholder="House/Flat No., Street Name, Landmark (e.g. Opp Reliance Smart)"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#F8FAFC' } }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isOutOfRegion}
          sx={{
            bgcolor: isOutOfRegion ? '#94A3B8' : '#10B981',
            borderRadius: '14px',
            px: 3,
            py: 1,
            fontWeight: 900,
            textTransform: 'none',
            '&:hover': { bgcolor: isOutOfRegion ? '#94A3B8' : '#059669' }
          }}
        >
          {isOutOfRegion ? 'Cannot Accept (Outside Salem)' : 'Confirm Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
