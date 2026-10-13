import React from 'react';

/**
 * SalemSeamlessLoader
 * Pure frosted blur overlay loader (No card, no logo, ultra-minimal & smooth).
 *
 * @param {'booking' | 'dispatch' | 'payment' | 'startup'} mode
 * @param {string} customTitle Optional override
 * @param {string} customDesc Optional override
 */
export default function SalemSeamlessLoader({
  mode = 'booking',
  customTitle,
  customDesc
}) {
  const configs = {
    booking: {
      title: 'Finding Verified Technician...',
      desc: 'Scanning top-rated certified professionals within 3.5 km in Salem.',
      progress: 72,
      note: '100% Escrow Protected • SalemSeva'
    },
    dispatch: {
      title: 'Technician on the Way',
      desc: 'Partner en route with verified safety equipment and tools (ETA ~8m).',
      progress: 88,
      note: 'Live GPS Active • SalemSeva'
    },
    payment: {
      title: 'Authorizing Escrow...',
      desc: 'Securing booking deposit. Zero deduction without job completion.',
      progress: 55,
      note: 'Bank-Grade Encryption • SalemSeva'
    },
    startup: {
      title: 'Connecting to SalemSeva...',
      desc: 'Loading real-time service availability and pricing across Salem.',
      progress: 40,
      note: 'Hyperlocal Service Grid'
    }
  };

  const current = configs[mode] || configs.booking;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.82)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 24,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc',
      textAlign: 'center'
    }}>
      {/* Smooth Seamless Spinner */}
      <div style={{ width: 56, height: 56, marginBottom: 24 }}>
        <svg viewBox='0 0 50 50' style={{ width: '100%', height: '100%', animation: 'spin 1.4s linear infinite' }}>
          <circle cx='25' cy='25' r='20' fill='none' stroke='rgba(255, 255, 255, 0.08)' strokeWidth='3.5' />
          <circle cx='25' cy='25' r='20' fill='none' stroke='#2563eb' strokeWidth='3.5' strokeLinecap='round' strokeDasharray='80, 130' strokeDashoffset='-25' />
        </svg>
      </div>

      {/* Floating Headings (No Box / No Card) */}
      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.3px', color: '#f8fafc' }}>
        {customTitle || current.title}
      </h3>
      <p style={{ fontSize: 13.5, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.5, maxWidth: 320 }}>
        {customDesc || current.desc}
      </p>

      {/* Minimal Progress Line */}
      <div style={{ width: '100%', maxWidth: 240, height: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: current.progress + '%', backgroundColor: '#2563eb', borderRadius: 999, transition: 'width 0.35s ease' }} />
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 20 }}>
        {current.progress}%
      </div>

      {/* Minimal Footer Note */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10b981' }} />
        {current.note}
      </div>
    </div>
  );
}