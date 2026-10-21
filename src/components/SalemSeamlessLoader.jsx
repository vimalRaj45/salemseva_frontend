import React from 'react';
import BrandLoadingScreen from './BrandLoadingScreen';

/**
 * SalemSeamlessLoader
 * Connects all existing loader calls across the app to the BrandLoadingScreen.
 */
export default function SalemSeamlessLoader({
  open = true,
  mode = 'booking',
  customTitle,
  customDesc,
  title,
  subtitle,
  desc,
  badge
}) {
  if (open === false) return null;

  return (
    <BrandLoadingScreen
      open={open}
      mode={mode}
      title={customTitle || title}
      subtitle={customDesc || subtitle || desc}
      badge={badge}
    />
  );
}
