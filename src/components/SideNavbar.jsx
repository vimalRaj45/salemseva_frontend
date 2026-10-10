import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Calendar,
  Wallet,
  Zap,
  Activity,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  LogOut,
  User,
  PhoneCall,
  Search,
  CheckCircle2,
  FileText,
  BadgeCheck,
  MapPin,
  ChevronRight,
  Briefcase,
  HelpCircle,
  Clock,
  MessageSquarePlus
} from 'lucide-react';
import { getCurrentLanguage, SUPPORTED_LANGUAGES } from '../services/languageService';

export default function SideNavbar({
  isOpen,
  onClose,
  user,
  creditsAmount = 150,
  isDarkMode = false,
  toggleDarkMode,
  onOpenLanguageModal,
  onOpenAuthModal,
  onOpenFeedbackModal,
  logout
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when side navbar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const userRole = user?.role || (currentPath.startsWith('/partner') ? 'technician' : currentPath.startsWith('/admin') ? 'admin' : 'customer');
  const displayName = user?.name || (userRole === 'technician' ? 'K. Ramesh' : userRole === 'admin' ? 'Salem Ops Admin' : 'Vimal Raj');
  const userPhone = user?.phone || '+91 98427 11234';
  const userLocality = user?.locality || 'Fairlands, Salem';

  const currentLangCode = getCurrentLanguage();
  const currentLangName = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode)?.nativeName || 'English';

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeInBackdrop 0.2s ease-out'
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '84%',
          maxWidth: '360px',
          height: '100%',
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          color: isDarkMode ? '#F8FAFC' : '#0F172A',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1301,
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: isDarkMode ? '1px solid #1E293B' : '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDarkMode ? '#131D31' : '#F8FAFC'
          }}
        >
          {/* Logo & Title */}
          <div
            onClick={() => handleNav('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 102, 204, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src="/logo.png"
                alt="SalemSeva"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.1 }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#0066CC' }}>Salem</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#FF6600' }}>Seva</span>
              </div>
              <span style={{ fontSize: '10.5px', color: isDarkMode ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                Salem Doorstep Services Hub
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Navigation"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
              border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
              color: isDarkMode ? '#E2E8F0' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Identity Profile Card */}
        <div style={{ padding: '16px 18px 12px 18px' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
              border: isDarkMode ? '1px solid #334155' : '1px solid #DBEAFE',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      color: isDarkMode ? '#F8FAFC' : '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {displayName}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '999px',
                      backgroundColor: userRole === 'technician' ? '#ECFDF5' : userRole === 'admin' ? '#FEF3C7' : '#DCFCE7',
                      color: userRole === 'technician' ? '#059669' : userRole === 'admin' ? '#B45309' : '#15803D',
                      border: userRole === 'technician' ? '1px solid #10B981' : userRole === 'admin' ? '1px solid #F59E0B' : '1px solid #86EFAC'
                    }}
                  >
                    {userRole === 'technician' ? 'PARTNER' : userRole === 'admin' ? 'ADMIN HQ' : 'VERIFIED'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={11} color="#64748B" />
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                    {userLocality}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet & Quick Stats Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: isDarkMode ? '1px solid #334155' : '1px solid #BFDBFE'
              }}
            >
              <div
                onClick={() => handleNav('/wallet')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Wallet size={14} color="#D97706" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>
                  ₹{creditsAmount} Seva Credits
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleNav('/wallet')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563EB',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Add Credits &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Chips */}
        <div style={{ padding: '0 18px 12px 18px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
            Switch Platform Portal
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleNav('/')}
              style={{
                padding: '7px 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: currentPath === '/' || currentPath.startsWith('/book') || currentPath.startsWith('/history')
                  ? '#2563EB'
                  : isDarkMode ? '#1E293B' : '#F1F5F9',
                color: currentPath === '/' || currentPath.startsWith('/book') || currentPath.startsWith('/history')
                  ? '#FFFFFF'
                  : isDarkMode ? '#CBD5E1' : '#475569',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => handleNav('/partner')}
              style={{
                padding: '7px 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: currentPath.startsWith('/partner')
                  ? '#059669'
                  : isDarkMode ? '#1E293B' : '#F1F5F9',
                color: currentPath.startsWith('/partner')
                  ? '#FFFFFF'
                  : isDarkMode ? '#CBD5E1' : '#475569',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Partner Pro
            </button>

            <button
              type="button"
              onClick={() => handleNav('/admin')}
              style={{
                padding: '7px 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: currentPath.startsWith('/admin')
                  ? '#D97706'
                  : isDarkMode ? '#1E293B' : '#F1F5F9',
                color: currentPath.startsWith('/admin')
                  ? '#FFFFFF'
                  : isDarkMode ? '#CBD5E1' : '#475569',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Central Ops
            </button>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', margin: '4px 0' }} />

        {/* Navigation Link Groups */}
        <div style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Group 1: Customer Core */}
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px', display: 'block', marginBottom: '6px' }}>
              Customer Services
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <SideNavItem
                icon={<Home size={18} />}
                label="Home / Explore Services"
                sublabel="AC, Electrician, Plumber, Cleaning"
                active={currentPath === '/'}
                isDark={isDarkMode}
                onClick={() => handleNav('/')}
              />
              <SideNavItem
                icon={<Calendar size={18} />}
                label="My Bookings & Invoices"
                sublabel="Track live technician or view history"
                active={currentPath === '/history' || currentPath.startsWith('/track')}
                isDark={isDarkMode}
                onClick={() => handleNav('/history')}
              />
              <SideNavItem
                icon={<Wallet size={18} />}
                label="Seva Wallet & Cashback"
                badge={`₹${creditsAmount}`}
                active={currentPath === '/wallet'}
                isDark={isDarkMode}
                onClick={() => handleNav('/wallet')}
              />
            </div>
          </div>

          {/* Group 2: Specialist Partner Zone */}
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px', display: 'block', marginBottom: '6px' }}>
              Technician Partner Desk
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <SideNavItem
                icon={<Zap size={18} />}
                label="Partner Duty Radar"
                badge="LIVE"
                badgeColor="#10B981"
                active={currentPath === '/partner'}
                isDark={isDarkMode}
                onClick={() => handleNav('/partner')}
              />
              <SideNavItem
                icon={<FileText size={18} />}
                label="Digital Quote Builder"
                sublabel="Create estimates & parts bill"
                active={currentPath === '/partner/quote-builder'}
                isDark={isDarkMode}
                onClick={() => handleNav('/partner/quote-builder')}
              />
              <SideNavItem
                icon={<BadgeCheck size={18} />}
                label="Partner KYC & Registration"
                sublabel="DigiLocker verification"
                active={currentPath === '/partner/onboarding'}
                isDark={isDarkMode}
                onClick={() => handleNav('/partner/onboarding')}
              />
            </div>
          </div>

          {/* Group 3: Central Operations HQ */}
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px', display: 'block', marginBottom: '6px' }}>
              Salem Operations Desk
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <SideNavItem
                icon={<Activity size={18} />}
                label="Central Ops Dashboard"
                sublabel="Live fleet radar & booking dispatches"
                active={currentPath === '/admin'}
                isDark={isDarkMode}
                onClick={() => handleNav('/admin')}
              />
              <SideNavItem
                icon={<Clock size={18} />}
                label="Traceability & Audit Logs"
                sublabel="Tamper-proof event ledger"
                active={currentPath === '/admin/traceability'}
                isDark={isDarkMode}
                onClick={() => handleNav('/admin/traceability')}
              />
              <SideNavItem
                icon={<Wallet size={18} />}
                label="Razorpay Settlements Ledger"
                sublabel="Payouts & escrow distributions"
                active={currentPath === '/admin/settlements'}
                isDark={isDarkMode}
                onClick={() => handleNav('/admin/settlements')}
              />
            </div>
          </div>

          {/* Group 4: Preferences & Support */}
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px', display: 'block', marginBottom: '6px' }}>
              Preferences & Support
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <SideNavItem
                icon={<Globe size={18} />}
                label="Language / மொழி"
                badge={currentLangName}
                badgeColor="#0284C7"
                isDark={isDarkMode}
                onClick={() => {
                  onClose();
                  onOpenLanguageModal();
                }}
              />
              <SideNavItem
                icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                isDark={isDarkMode}
                onClick={toggleDarkMode}
              />
              <SideNavItem
                icon={<MessageSquarePlus size={18} color="#0D9488" />}
                label="Platform Feedback & Issues"
                sublabel="Report platform bugs or ideas"
                badge="Ops Direct"
                badgeColor="#0D9488"
                isDark={isDarkMode}
                onClick={() => {
                  onClose();
                  if (onOpenFeedbackModal) onOpenFeedbackModal();
                }}
              />
              <SideNavItem
                icon={<PhoneCall size={18} />}
                label="24/7 Salem Emergency Hotline"
                sublabel="1800-425-7253 (Toll Free)"
                isDark={isDarkMode}
                onClick={() => {
                  window.location.href = 'tel:1800-425-7253';
                }}
              />
            </div>
          </div>

        </div>

        {/* Drawer Bottom Actions */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: isDarkMode ? '1px solid #1E293B' : '1px solid #E2E8F0',
            backgroundColor: isDarkMode ? '#131D31' : '#F8FAFC'
          }}
        >
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#E11D48',
                backgroundColor: isDarkMode ? 'rgba(225, 29, 72, 0.12)' : '#FFF1F2',
                border: '1px solid #FECDD3',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out of Account</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                backgroundColor: '#2563EB',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <User size={16} />
              <span>Login / Register Customer</span>
            </button>
          )}

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '10px', color: isDarkMode ? '#64748B' : '#94A3B8' }}>
              SalemSeva v2.4 • Smart City Service Mesh
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

function SideNavItem({ icon, label, sublabel, badge, badgeColor = '#2563EB', active = false, isDark = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '12px',
        cursor: 'pointer',
        backgroundColor: active
          ? isDark ? '#1E293B' : '#EFF6FF'
          : 'transparent',
        color: active
          ? '#2563EB'
          : isDark ? '#E2E8F0' : '#334155',
        border: active
          ? isDark ? '1px solid #334155' : '1px solid #BFDBFE'
          : '1px solid transparent',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{ color: active ? '#2563EB' : isDark ? '#94A3B8' : '#64748B', display: 'flex', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: active ? 800 : 600, lineHeight: 1.2 }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: '10.5px', color: isDark ? '#64748B' : '#94A3B8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>

      {badge ? (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
            color: badgeColor,
            border: `1px solid ${badgeColor}`,
            flexShrink: 0
          }}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight size={14} color={isDark ? '#475569' : '#CBD5E1'} style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}
