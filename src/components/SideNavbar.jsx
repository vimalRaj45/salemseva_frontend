import React, { useState, useEffect } from 'react';
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
  LogOut,
  User,
  PhoneCall,
  Search,
  CheckCircle2,
  FileText,
  BadgeCheck,
  MapPin,
  ChevronRight,
  ChevronDown,
  Briefcase,
  HelpCircle,
  Clock,
  MessageSquarePlus,
  Sparkles,
  LifeBuoy,
  Wrench,
  Droplets,
  Layers,
  Power
} from 'lucide-react';
import { getCurrentLanguage, SUPPORTED_LANGUAGES } from '../services/languageService';

export default function SideNavbar({
  isOpen,
  onClose,
  user,
  techUser,
  creditsAmount = 0,
  isTechnician = false,
  isAdmin = false,
  isCustomer = false,
  isPartnerOnline = true,
  onToggleDuty,
  onOpenLanguageModal,
  onOpenFeedbackModal,
  onOpenSupportTicketModal,
  logout,
  logoutTech
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Collapsible sub-item states
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [partnerExpanded, setPartnerExpanded] = useState(true);
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [supportExpanded, setSupportExpanded] = useState(false);

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

  const displayName = user?.name || (isTechnician ? 'Salem Partner PRO' : isAdmin ? 'Salem Ops Admin' : 'Valued Customer');
  const userPhone = user?.phone || '';
  const userLocality = user?.locality || 'Salem, TN';

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
        justifyContent: 'flex-end',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>{`
        @keyframes sideNavFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sideNavSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .side-nav-accordion-content {
          transition: max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
          overflow: hidden;
        }
        .side-nav-chevron {
          transition: transform 0.2s ease;
        }
        .side-nav-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'sideNavFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '86%',
          maxWidth: '360px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          boxShadow: '-8px 0 28px rgba(15, 23, 42, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1301,
          animation: 'sideNavSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: 'calc(14px + env(safe-area-inset-top, 16px)) 16px 14px 16px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            flexShrink: 0
          }}
        >
          {/* Logo & Title */}
          <div
            onClick={() => handleNav(isTechnician ? '/partner' : isAdmin ? '/admin' : '/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              className="brand-logo-shine"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(10, 92, 196, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E2E8F0',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              <img
                src="/logo-mark.svg"
                onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                alt="Shazu One"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
              <span className="brand-title-shazu" style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px' }}>Shazu</span>
              <span className={isTechnician ? 'brand-title-partner' : isAdmin ? 'brand-title-ops' : 'brand-title-one'} style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px' }}>
                {isTechnician ? 'Partner' : isAdmin ? 'Ops' : 'One'}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Navigation"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px'
          }}
        >
          {/* ================= 1. ROLE-ADAPTIVE HERO IDENTITY CARD ================= */}
          {user ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: isTechnician ? '#F0FDF4' : isAdmin ? '#FFFBEB' : '#EFF6FF',
                border: isTechnician ? '1px solid #BBF7D0' : isAdmin ? '1px solid #FDE68A' : '1px solid #DBEAFE',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isTechnician ? '#2B9236' : isAdmin ? '#D97706' : '#0A5CC4',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                      {userPhone || userLocality}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 7px',
                    borderRadius: '6px',
                    backgroundColor: isTechnician ? '#DCFCE7' : isAdmin ? '#FEF3C7' : '#DBEAFE',
                    color: isTechnician ? '#15803D' : isAdmin ? '#92400E' : '#0A5CC4',
                    border: isTechnician ? '1px solid #86EFAC' : isAdmin ? '1px solid #FCD34D' : '1px solid #93C5FD'
                  }}
                >
                  {isTechnician ? 'PARTNER PRO' : isAdmin ? 'OPS ADMIN' : 'CUSTOMER'}
                </span>
              </div>

              {/* Role Quick Bar */}
              {isTechnician ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #BBF7D0'
                  }}
                >
                  <button
                    type="button"
                    onClick={onToggleDuty}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: isPartnerOnline ? '#DCFCE7' : '#FEE2E2',
                      color: isPartnerOnline ? '#15803D' : '#DC2626',
                      border: isPartnerOnline ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                      cursor: 'pointer'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isPartnerOnline ? '#16A34A' : '#DC2626'
                      }}
                    />
                    <span>{isPartnerOnline ? 'ON DUTY' : 'OFFLINE'}</span>
                  </button>

                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#15803D' }}>
                    ₹{user?.todayEarnings != null ? user.todayEarnings : 0} Today
                  </div>
                </div>
              ) : isCustomer ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #DBEAFE'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wallet size={13} color="#D97706" />
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#B45309' }}>
                      {creditsAmount} pts (₹{(creditsAmount / 10).toFixed(0)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNav('/wallet')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0A5CC4',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Wallet Details &rarr;
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#0A5CC4',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Welcome to Shazu One
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Salem Doorstep Service Platform
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNav('/login')}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#0A5CC4',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* ================= 2. ROLE FILTERED NAVIGATION SECTIONS ================= */}

          {/* --- CASE A: TECHNICIAN / PARTNER NAVIGATION --- */}
          {isTechnician && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <div
                onClick={() => setPartnerExpanded(!partnerExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Partner Tools (துணைக்கருவிகள்)
                </span>
                <ChevronDown size={14} color="#64748B" className={`side-nav-chevron ${partnerExpanded ? 'open' : ''}`} />
              </div>

              {partnerExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <DrawerNavItem
                    icon={<Zap size={16} color="#2B9236" />}
                    label="Duty Radar & Nearby Jobs"
                    sublabel="Active service dispatch calls"
                    active={currentPath === '/partner' || currentPath === '/partner/duty'}
                    badge="LIVE"
                    badgeColor="#2B9236"
                    onClick={() => handleNav('/partner')}
                  />
                  <DrawerNavItem
                    icon={<FileText size={16} color="#0A5CC4" />}
                    label="Digital Quote Builder"
                    sublabel="Create transparent parts and labour quotes"
                    active={currentPath === '/partner/quote-builder'}
                    onClick={() => handleNav('/partner/quote-builder')}
                  />
                  <DrawerNavItem
                    icon={<BadgeCheck size={16} color="#D97706" />}
                    label="KYC & Document Verification"
                    sublabel="Aadhaar and compliance certificate"
                    active={currentPath === '/partner/onboarding'}
                    onClick={() => handleNav('/partner/onboarding')}
                  />
                </div>
              )}
            </div>
          )}

          {/* --- CASE B: ADMIN OPERATIONS NAVIGATION --- */}
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <div
                onClick={() => setAdminExpanded(!adminExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Operations Command Desk
                </span>
                <ChevronDown size={14} color="#64748B" className={`side-nav-chevron ${adminExpanded ? 'open' : ''}`} />
              </div>

              {adminExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <DrawerNavItem
                    icon={<Activity size={16} color="#D97706" />}
                    label="Ops Fleet Dashboard"
                    sublabel="Real-time map and technician telemetry"
                    active={currentPath === '/admin'}
                    onClick={() => handleNav('/admin')}
                  />
                  <DrawerNavItem
                    icon={<Clock size={16} color="#0A5CC4" />}
                    label="Traceability & Audit Ledger"
                    sublabel="Tamper-proof event logs"
                    active={currentPath === '/admin/traceability'}
                    onClick={() => handleNav('/admin/traceability')}
                  />
                  <DrawerNavItem
                    icon={<Wallet size={16} color="#2B9236" />}
                    label="Settlements & Financial Escrow"
                    sublabel="Razorpay gateway and technician payouts"
                    active={currentPath === '/admin/settlements'}
                    onClick={() => handleNav('/admin/settlements')}
                  />
                  <DrawerNavItem
                    icon={<Home size={16} color="#475569" />}
                    label="Preview Customer App"
                    sublabel="Browse storefront as customer"
                    active={false}
                    onClick={() => handleNav('/')}
                  />
                </div>
              )}
            </div>
          )}

          {/* --- CASE C: CUSTOMER OR GUEST SERVICE EXPLORATION --- */}
          {(!isTechnician && !isAdmin) && (
            <>
              {/* Core Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
                <DrawerNavItem
                  icon={<Home size={16} color="#0A5CC4" />}
                  label="Home"
                  active={currentPath === '/'}
                  onClick={() => handleNav('/')}
                />
                <DrawerNavItem
                  icon={<Sparkles size={16} color="#2B9236" />}
                  label="How Shazu One Works"
                  sublabel="Doorstep verified technicians & warranty"
                  active={currentPath === '/how-it-works'}
                  onClick={() => handleNav('/how-it-works')}
                />
                {user && (
                  <>
                    <DrawerNavItem
                      icon={<Calendar size={16} color="#0A5CC4" />}
                      label="My Bookings & Invoices"
                      sublabel="Active service visits & receipts"
                      active={currentPath === '/history' || currentPath.startsWith('/track')}
                      onClick={() => handleNav('/history')}
                    />
                    <DrawerNavItem
                      icon={<Wallet size={16} color="#D97706" />}
                      label="Seva Wallet & Rewards"
                      badge={`${creditsAmount} pts`}
                      active={currentPath === '/wallet'}
                      onClick={() => handleNav('/wallet')}
                    />
                  </>
                )}
              </div>

              {/* Service Submenu Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <div
                  onClick={() => setServicesExpanded(!servicesExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Browse Services (சேவைகள்)
                  </span>
                  <ChevronDown size={14} color="#64748B" className={`side-nav-chevron ${servicesExpanded ? 'open' : ''}`} />
                </div>

                {servicesExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '4px' }}>
                    <DrawerNavItem
                      icon={<Wrench size={15} color="#0A5CC4" />}
                      label="AC Service & Repair"
                      sublabel="Jet wash, gas refill, installation"
                      active={currentPath === '/book/ac'}
                      onClick={() => handleNav('/book/ac')}
                    />
                    <DrawerNavItem
                      icon={<Zap size={15} color="#D97706" />}
                      label="Electrician Services"
                      sublabel="Wiring, switchboard, fuse, inverter"
                      active={currentPath === '/book/electrician'}
                      onClick={() => handleNav('/book/electrician')}
                    />
                    <DrawerNavItem
                      icon={<Droplets size={15} color="#0284C7" />}
                      label="Plumbing Solutions"
                      sublabel="Pipe leaks, taps, bathroom fixtures"
                      active={currentPath === '/book/plumber'}
                      onClick={() => handleNav('/book/plumber')}
                    />
                    <DrawerNavItem
                      icon={<Sparkles size={15} color="#2B9236" />}
                      label="Deep Home Cleaning"
                      sublabel="Full house, kitchen, bathroom wash"
                      active={currentPath === '/book/cleaning'}
                      onClick={() => handleNav('/book/cleaning')}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= 3. SUPPORT & POLICIES (UNIVERSAL) ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <div
              onClick={() => setSupportExpanded(!supportExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Help & Governance
              </span>
              <ChevronDown size={14} color="#64748B" className={`side-nav-chevron ${supportExpanded ? 'open' : ''}`} />
            </div>

            {supportExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <DrawerNavItem
                  icon={<Globe size={15} color="#0A5CC4" />}
                  label="Change Language"
                  badge={currentLangName}
                  badgeColor="#0A5CC4"
                  onClick={() => {
                    onClose();
                    onOpenLanguageModal();
                  }}
                />
                <DrawerNavItem
                  icon={<LifeBuoy size={15} color="#0A5CC4" />}
                  label="Support Desk & Ticket Tracking"
                  sublabel="Raise booking disputes and refund queries"
                  onClick={() => {
                    onClose();
                    if (onOpenSupportTicketModal) onOpenSupportTicketModal();
                  }}
                />
                {user && (
                  <DrawerNavItem
                    icon={<MessageSquarePlus size={15} color="#0D9488" />}
                    label="Platform Feedback"
                    sublabel="Report suggestions or app issues"
                    onClick={() => {
                      onClose();
                      if (onOpenFeedbackModal) onOpenFeedbackModal();
                    }}
                  />
                )}
                {!isTechnician && (
                  <DrawerNavItem
                    icon={<Briefcase size={15} color="#2B9236" />}
                    label="Become a Partner Specialist"
                    sublabel="Register trade and receive verified jobs"
                    onClick={() => handleNav('/register?role=partner')}
                  />
                )}
                <DrawerNavItem
                  icon={<PhoneCall size={15} color="#15803D" />}
                  label="Salem 24/7 Hotline"
                  sublabel="1800-425-7253 (Toll Free)"
                  onClick={() => {
                    window.location.href = 'tel:1800-425-7253';
                  }}
                />
                <DrawerNavItem
                  icon={<FileText size={15} color="#64748B" />}
                  label="Terms of Service"
                  onClick={() => handleNav('/terms')}
                />
                <DrawerNavItem
                  icon={<ShieldCheck size={15} color="#64748B" />}
                  label="Privacy Policy"
                  onClick={() => handleNav('/privacy')}
                />
                <DrawerNavItem
                  icon={<HelpCircle size={15} color="#64748B" />}
                  label="Refund & Cancellation Policy"
                  onClick={() => handleNav('/refund-policy')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div
          style={{
            padding: '12px 14px calc(14px + env(safe-area-inset-bottom, 14px)) 14px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            flexShrink: 0
          }}
        >
          {user ? (
            <button
              type="button"
              onClick={async () => {
                if (isTechnician && logoutTech) {
                  await logoutTech();
                } else if (logout) {
                  await logout();
                }
                onClose();
                navigate('/login', { replace: true });
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleNav('/login')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: '#0A5CC4',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <User size={15} />
                <span>Customer Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/register?role=partner')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#2B9236',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  cursor: 'pointer'
                }}
              >
                <Briefcase size={14} />
                <span>Join as Service Partner</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function DrawerNavItem({ icon, label, sublabel, active, badge, badgeColor = '#0A5CC4', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: '8px',
        backgroundColor: active ? '#EFF6FF' : 'transparent',
        border: active ? '1px solid #BFDBFE' : '1px solid transparent',
        color: active ? '#0A5CC4' : '#1E293B',
        cursor: 'pointer',
        transition: 'all 0.12s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '12.5px',
              fontWeight: active ? 700 : 600,
              color: active ? '#0A5CC4' : '#1E293B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {label}
          </div>
          {sublabel && (
            <div
              style={{
                fontSize: '10.5px',
                color: '#64748B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
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
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: `${badgeColor}15`,
            color: badgeColor,
            flexShrink: 0
          }}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}
