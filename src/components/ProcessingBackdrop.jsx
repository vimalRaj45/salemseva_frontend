import React from 'react';
import BrandLoadingScreen from './BrandLoadingScreen';

export default function ProcessingBackdrop({
  open = false,
  title,
  subtitle,
  badge,
  mode
}) {
  if (!open) return null;

  let resolvedMode = mode;
  if (!resolvedMode) {
    const text = `${title || ''} ${subtitle || ''} ${badge || ''}`.toLowerCase();
    if (text.includes('escrow') || text.includes('pay') || text.includes('razorpay')) {
      resolvedMode = 'payment';
    } else if (text.includes('dispatch') || text.includes('route') || text.includes('sync')) {
      resolvedMode = 'dispatch';
    } else if (text.includes('connect') || text.includes('startup') || text.includes('loading')) {
      resolvedMode = 'startup';
    } else if (text.includes('match') || text.includes('search')) {
      resolvedMode = 'matching';
    } else if (text.includes('track') || text.includes('gps')) {
      resolvedMode = 'tracking';
    } else {
      resolvedMode = 'booking';
    }
  }

  return (
    <BrandLoadingScreen
      open={open}
      mode={resolvedMode}
      title={title}
      subtitle={subtitle}
      badge={badge}
    />
  );
}
