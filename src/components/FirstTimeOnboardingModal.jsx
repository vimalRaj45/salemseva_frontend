import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Users,
  Briefcase
} from 'lucide-react';

const CUSTOMER_SLIDES = [
  {
    id: 'rapid_arrival',
    badge: '30-Minute Rapid Dispatch',
    title: 'Verified Home Experts at Your Doorstep',
    desc: 'Instant GPS dispatch connects you to certified AC, electrical, plumbing, and appliance specialists across all 10 Salem municipal zones.',
    image: '/assets/illustrations/customer_booking.jpg',
    points: ['Real-time technician tracking', 'Fairlands, Hasthampatti & Salem zones', '₹99 fixed visit fee']
  },
  {
    id: 'transparent_pricing',
    badge: 'Transparent Labour Billing',
    title: 'Upfront Quotes & Escrow Protection',
    desc: 'Review upfront labour estimates before work starts. Buying any replacement parts is completely your choice. Payment is held in secure escrow.',
    image: '/assets/illustrations/transparent_pricing.jpg',
    points: ['Labour only • Parts choice is yours', 'Razorpay & UPI escrow secured', '₹100 new resident wallet bonus']
  },
  {
    id: 'safety_warranty',
    badge: 'Salem Trust Guarantee',
    title: 'Aadhaar Verified with 30-Day Warranty',
    desc: 'Every specialist undergoes government DigiLocker identity vetting and skill authentication, backed by our 30-day free re-service assurance.',
    image: '/assets/illustrations/safety_verification.jpg',
    points: ['DigiLocker background verified', 'Masked calling for phone privacy', 'Free 30-day rework warranty']
  }
];

const PARTNER_SLIDES = [
  {
    id: 'partner_earnings',
    badge: 'Technician Partner Fleet',
    title: 'Earn 98% on Every Doorstep Job',
    desc: 'Join Salem premier trade network. Shazu One retains only 2% platform facilitation, giving you 98% direct bank payouts every day.',
    image: '/assets/illustrations/partner_service.jpg',
    points: ['98% net service revenue payout', 'Daily automated Razorpay settlements', 'Zero registration fees']
  },
  {
    id: 'partner_radar',
    badge: 'Smart Radar Dispatch',
    title: 'Work on Your Schedule in Your Ward',
    desc: 'Toggle duty on or off with one tap. Get dispatch requests matching your exact skill trade in your preferred Salem locality.',
    image: '/assets/illustrations/partner_service.jpg',
    points: ['Flexible duty radar toggle', 'In-app digital quote builder', 'Free tool & accident insurance']
  },
  {
    id: 'partner_kyc',
    badge: 'Instant DigiLocker KYC',
    title: 'Paperless Onboarding in Under 5 Minutes',
    desc: 'Verify via government Aadhaar e-KYC and upload your trade credentials directly from your phone to start accepting bookings.',
    image: '/assets/illustrations/safety_verification.jpg',
    points: ['Instant digital badge approval', 'Salem City trade accreditation', 'Dedicated 24/7 partner support']
  }
];

export default function FirstTimeOnboardingModal({ isOpen, onClose, onOpenAuth }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // 'customer' | 'partner'
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = role === 'customer' ? CUSTOMER_SLIDES : PARTNER_SLIDES;

  useEffect(() => {
    setActiveSlide(0);
  }, [role]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSlide, slides.length]);

  if (!isOpen) return null;

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(prev => prev + 1);
    } else {
      setActiveSlide(0);
    }
  };

  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(prev => prev - 1);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('Shazu One_has_seen_onboarding', 'true');
    if (onClose) onClose();
  };

  const handleGetStarted = (mode = 'register') => {
    handleDismiss();
    navigate(`/${mode}?role=${role}`);
  };

  const current = slides[activeSlide];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '94vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FAFAFA'
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#0066CC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '15px'
              }}
            >
              S
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#0066CC' }}>Salem</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#FF6600' }}>Seva</span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginLeft: '6px' }}>
                How It Works
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Walkthrough"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Role Switcher Pill Bar */}
        <div style={{ padding: '12px 20px 0', backgroundColor: '#FFFFFF' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#F1F5F9',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}
          >
            <button
              type="button"
              onClick={() => setRole('customer')}
              style={{
                padding: '8px 12px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: role === 'customer' ? '#FFFFFF' : 'transparent',
                color: role === 'customer' ? '#0066CC' : '#64748B',
                fontWeight: role === 'customer' ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: role === 'customer' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={14} />
              <span>For Residents</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('partner')}
              style={{
                padding: '8px 12px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: role === 'partner' ? '#FFFFFF' : 'transparent',
                color: role === 'partner' ? '#0066CC' : '#64748B',
                fontWeight: role === 'partner' ? 800 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: role === 'partner' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Briefcase size={14} />
              <span>For Technicians</span>
            </button>
          </div>
        </div>

        {/* Middle Body with Illustration Carousel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Nano Banana Custom Illustration Viewport */}
          <div
            style={{
              width: '100%',
              height: '210px',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
            }}
          >
            <img
              src={current.image}
              alt={current.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Float Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0066CC',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              {current.badge}
            </div>

            {/* Carousel Arrow Controls */}
            {activeSlide > 0 && (
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Slide"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Slide Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '14px 0 10px' }}>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: activeSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: activeSlide === idx ? '#0066CC' : '#CBD5E1',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
              />
            ))}
          </div>

          {/* Text Content */}
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', lineHeight: 1.3 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0' }}>
            {current.desc}
          </p>

          {/* Key Value Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {current.points.map((pt, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#1E293B', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="#16A34A" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <button
            type="button"
            onClick={() => handleGetStarted('register')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#0066CC',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>{role === 'customer' ? 'Create Free Resident Account' : 'Join as Partner Specialist'}</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => handleGetStarted('login')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#0066CC',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 6px'
              }}
            >
              Sign In to Existing Account
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 6px'
              }}
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
