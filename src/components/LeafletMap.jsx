import React, { useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

// Fix standard Leaflet default icon paths in React
const customTechIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customHomeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to smoothly sync map bounds with updated live coordinates
function MapViewUpdater({ center, techPos, custPos }) {
  const map = useMap();
  useEffect(() => {
    if (techPos && custPos && map) {
      const bounds = L.latLngBounds([techPos, custPos]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [techPos, custPos, map]);
  return null;
}

export default function LeafletMap({ 
  techPos = [11.6780, 78.1580], // Hasthampatti, Salem
  custPos = [11.6643, 78.1460], // Fairlands, Salem
  techName = 'K. Ramesh (Scooter)',
  custAddress = 'Plot 42, 5th Cross, Fairlands, Salem',
  eta = '8 mins',
  distance = '1.8 km',
  height = 320 
}) {
  const center = [
    (techPos[0] + custPos[0]) / 2,
    (techPos[1] + custPos[1]) / 2
  ];

  const midLat = (techPos[0] + custPos[0]) / 2;
  const midLng = (techPos[1] + custPos[1]) / 2;

  const polylineCoords = [
    techPos,
    [midLat + 0.001, midLng - 0.001], // realistic street curvature
    custPos
  ];

  return (
    <Box sx={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapViewUpdater center={center} techPos={techPos} custPos={custPos} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Technician Marker */}
        <Marker position={techPos} icon={customTechIcon}>
          <Popup>
            <strong>🛵 {techName}</strong><br />
            En Route • ETA {eta} ({distance})
          </Popup>
        </Marker>

        {/* Customer Doorstep Marker */}
        <Marker position={custPos} icon={customHomeIcon}>
          <Popup>
            <strong>📍 Your Destination</strong><br />
            {custAddress}
          </Popup>
        </Marker>

        {/* Live GPS Route Polyline */}
        <Polyline positions={polylineCoords} color="#0284C7" weight={5} opacity={0.85} dashArray="6, 8" />
      </MapContainer>

      {/* Live GPS Connected Tag */}
      <Chip
        icon={<GpsFixedIcon sx={{ fontSize: 13, color: '#10B981 !important', animation: 'spin 4s linear infinite' }} />}
        label={`Live GPS (${distance} • ${eta})`}
        size="small"
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          color: '#FFFFFF',
          backdropFilter: 'blur(6px)',
          fontWeight: 700,
          fontSize: '11px',
          height: 24,
          borderRadius: '6px',
          zIndex: 800,
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      />
    </Box>
  );
}
