import React from 'react';
import BrandLoadingScreen from './BrandLoadingScreen';

export default function SalemUniversalLoader({
  mode = 'booking',
  customTitle,
  customDesc
}) {
  return (
    <BrandLoadingScreen
      open={true}
      mode={mode}
      title={customTitle}
      subtitle={customDesc}
    />
  );
}
