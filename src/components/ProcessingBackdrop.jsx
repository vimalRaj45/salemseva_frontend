import React from 'react';
import SalemSeamlessLoader from './SalemSeamlessLoader';

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
    } else {
      resolvedMode = 'booking';
    }
  }

  return (
    <SalemSeamlessLoader
      open={open}
      mode={resolvedMode}
      customTitle={title}
      customDesc={subtitle}
    />
  );
}
