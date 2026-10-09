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

const SALEM_LOCALITIES = [
  { name: 'Fairlands', pin: '636016', lat: 11.6738, lng: 78.1460 },
  { name: 'Hasthampatti', pin: '636007', lat: 11.6780, lng: 78.1630 },
  { name: 'Alagapuram', pin: '636004', lat: 11.6795, lng: 78.1380 },
  { name: 'Suramangalam / Junction', pin: '636005', lat: 11.6720, lng: 78.1150 },
  { name: 'Meyyanur', pin: '636004', lat: 11.6660, lng: 78.1340 },
  { name: 'Ammapet', pin: '636003', lat: 11.6540, lng: 78.1750 },
  { name: 'Shevapet', pin: '636002', lat: 11.6480, lng: 78.1420 },
  { name: 'Gugai', pin: '636006', lat: 11.6390, lng: 78.1520 },
  { name: 'Kondalampatti', pin: '636010', lat: 11.6180, lng: 78.1330 },
  { name: 'Kannankurichi (Yercaud Foothills)', pin: '636008', lat: 11.7100, lng: 78.1820 },
  { name: 'Gorimedu', pin: '636008', lat: 11.7050, lng: 78.1640 },
  { name: 'Steel Plant Area', pin: '636013', lat: 11.6420, lng: 78.0750 }
];

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
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleDetectGPS = () => {
    setIsDetecting(true);
    setGeoStatus('Locating your GPS coordinates in Salem...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsDetecting(false);
          setGeoStatus(`GPS Locked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
          
          // Find closest Salem locality
          const closest = SALEM_LOCALITIES.reduce((prev, curr) => {
            const prevDist = Math.hypot(prev.lat - latitude, prev.lng - longitude);
            const currDist = Math.hypot(curr.lat - latitude, curr.lng - longitude);
            return currDist < prevDist ? curr : prev;
          }, SALEM_LOCALITIES[0]);

          setSelectedLocality(closest.name);
          const fullAddr = `Live GPS Doorstep (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), ${closest.name}, Salem - ${closest.pin}`;
          setDoorAddress(fullAddr);
        },
        (error) => {
          setIsDetecting(false);
          setGeoStatus('GPS permission prompt dismissed. Using high-precision Salem Fairlands.');
          setSelectedLocality('Fairlands');
          setDoorAddress('Plot 42, 5th Cross, Fairlands, Salem - 636016');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetecting(false);
      setGeoStatus('Geolocation not supported by browser. Selected Salem Central.');
    }
  };

  const handleConfirm = () => {
    const locObj = SALEM_LOCALITIES.find(l => l.name === selectedLocality) || SALEM_LOCALITIES[0];
    const locationData = {
      locality: selectedLocality,
      pincode: locObj.pin,
      lat: locObj.lat,
      lng: locObj.lng,
      address: doorAddress || `${selectedLocality}, Salem - ${locObj.pin}`
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
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#059669', fontWeight: 700, bgcolor: '#ECFDF5', p: 1, borderRadius: '8px', border: '1px solid #A7F3D0' }}>
             {geoStatus}
          </Typography>
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
            const isSelected = selectedLocality === loc.name;
            return (
              <Chip
                key={loc.name}
                label={`${loc.name} (${loc.pin})`}
                onClick={() => {
                  setSelectedLocality(loc.name);
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
          sx={{
            bgcolor: '#10B981',
            borderRadius: '14px',
            px: 3,
            py: 1,
            fontWeight: 900,
            textTransform: 'none',
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}
