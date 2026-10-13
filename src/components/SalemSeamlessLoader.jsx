import React from 'react';

/**
 * SalemSeamlessLoader
 * Pure frosted blur overlay loader (No card, no logo, ultra-minimal & smooth).
 *
 * @param {'booking' | 'dispatch' | 'payment' | 'startup'} mode
 * @param {string} customTitle Optional override
 * @param {string} customDesc Optional override
 * @param {boolean} open Optional visibility toggle (defaults to true)
 */
export default function SalemSeamlessLoader({
  open = true,
  mode = 'booking',
  customTitle,
  customDesc,
  title,
  subtitle,
  desc
}) {
  if (open === false) return null;

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
  const resolvedTitle = customTitle || title || current.title;
  const resolvedDesc = customDesc || subtitle || desc || current.desc;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#0F172A',
      textAlign: 'center'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Smooth Seamless Spinner */}
      <div style={{ width: 56, height: 56, marginBottom: 20 }}>
        <svg viewBox='0 0 50 50' style={{ width: '100%', height: '100%', animation: 'spin 1.2s linear infinite' }}>
          <circle cx='25' cy='25' r='20' fill='none' stroke='rgba(37, 99, 235, 0.12)' strokeWidth='3.5' />
          <circle cx='25' cy='25' r='20' fill='none' stroke='#2563EB' strokeWidth='3.5' strokeLinecap='round' strokeDasharray='80, 130' strokeDashoffset='-25' />
        </svg>
      </div>

      {/* Floating Headings */}
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px', color: '#0F172A' }}>
        {resolvedTitle}
      </h3>
      <p style={{ fontSize: 13, color: '#475569', margin: '0 0 20px', lineHeight: 1.5, maxWidth: 320, fontWeight: 500 }}>
        {resolvedDesc}
      </p>

      {/* Minimal Progress Line */}
      <div style={{ width: '100%', maxWidth: 220, height: 4, backgroundColor: 'rgba(15, 23, 42, 0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: current.progress + '%', backgroundColor: '#2563EB', borderRadius: 999, transition: 'width 0.35s ease' }} />
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 16 }}>
        {current.progress}%
      </div>

      {/* Minimal Footer Note */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#059669', backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: 999, border: '1px solid #A7F3D0' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
        {current.note}
      </div>
    </div>
  );
}
