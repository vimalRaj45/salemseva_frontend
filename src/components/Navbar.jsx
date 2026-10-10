import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  MapPin,
  Search,
  Mic,
  Calendar,
  Wallet,
  Bell,
  User,
  ChevronDown,
  Navigation,
  LogOut,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Award,
  CheckCircle2,
  PhoneCall,
  Power,
  Globe,
  Languages,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelectorModal from './LanguageSelectorModal';
import SideNavbar from './SideNavbar';
import { SUPPORTED_LANGUAGES, getCurrentLanguage } from '../services/languageService';

export default function Navbar({
  userName: propUserName,
  location: propLocation,
  credits: propCredits,
  onVoiceAssist,
  onLocationChange
}) {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const {
    user,
    openAuthModal,
    logout,
    loginAsCustomer,
    loginAsTechnician,
    loginAsAdmin,
    dbTechnicians,
    dbCustomers,
    walletBalance: authWalletBalance,
    partnerIncentives,
    updateUser
  } = useAuth();

  // Role detection: prioritize logged-in user role, with route fallback
  const userRole = user?.role || (currentPath.startsWith('/partner') ? 'technician' : currentPath.startsWith('/admin') ? 'admin' : 'customer');
  const isCustomer = userRole === 'customer';
  const isTechnician = userRole === 'technician' || userRole === 'partner';
  const isAdmin = userRole === 'admin';

  // Dynamic user data
  const displayName = propUserName || user?.name || (isTechnician ? 'K. Ramesh' : isAdmin ? 'Salem Ops Admin' : 'Vimal Raj');
  const initial = displayName.charAt(0).toUpperCase() || (isTechnician ? 'R' : isAdmin ? 'A' : 'V');
  const creditsAmount = propCredits !== undefined ? propCredits : (authWalletBalance ?? user?.walletBalance ?? 150);
  const isPartnerOnline = user?.isOnline !== false;

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States
  const [selectedLocation, setSelectedLocation] = useState(propLocation || user?.locality || 'Fairlands, Salem');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  // Refs for click outside handling
  const locationRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (propLocation) setSelectedLocation(propLocation);
  }, [propLocation]);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme detection / toggle
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close popovers on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLocationOpen(false);
        setIsProfileOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const salemLocalities = [
    { name: 'Fairlands, Salem', pincode: '636016' },
    { name: 'Hasthampatti, Salem', pincode: '636007' },
    { name: 'Suramangalam, Salem', pincode: '636005' },
    { name: 'Ammapet, Salem', pincode: '636003' },
    { name: 'Shevapet, Salem', pincode: '636002' },
    { name: 'Alagapuram, Salem', pincode: '636004' },
    { name: 'Meyyanur, Salem', pincode: '636004' },
    { name: 'Salem Junction Area', pincode: '636005' }
  ];

  const handleSelectArea = (areaName) => {
    setSelectedLocation(areaName);
    setIsLocationOpen(false);
    if (onLocationChange) {
      onLocationChange(areaName);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setSelectedLocation('Detecting location...');
      navigator.geolocation.getCurrentPosition(
        () => {
          setSelectedLocation('Fairlands, Salem (Current)');
          setIsLocationOpen(false);
          if (onLocationChange) onLocationChange('Fairlands, Salem');
        },
        () => {
          setSelectedLocation('Fairlands, Salem');
          setIsLocationOpen(false);
        }
      );
    } else {
      setSelectedLocation('Fairlands, Salem');
      setIsLocationOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('ac') || q.includes('cool')) navigate('/services/ac');
    else if (q.includes('elect') || q.includes('power') || q.includes('wire')) navigate('/services/electrician');
    else if (q.includes('plumb') || q.includes('pipe') || q.includes('water')) navigate('/services/plumber');
    else if (q.includes('clean') || q.includes('wash')) navigate('/services/cleaning');
    else navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleToggleDutyStatus = () => {
    const nextStatus = !isPartnerOnline;
    if (updateUser) {
      updateUser({ isOnline: nextStatus });
    }
    localStorage.setItem('salemseva_partner_is_online', nextStatus ? 'true' : 'false');
  };

  const isBookingsActive = currentPath === '/history' || currentPath.startsWith('/tracking');
  const isPartnerActive = currentPath.startsWith('/partner');
  const isAdminActive = currentPath.startsWith('/admin');

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        width: '100%',
        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isDarkMode ? '1px solid #1E293B' : '1px solid #E2E8F0',
        boxShadow: hasScrolled
          ? isDarkMode
            ? '0 6px 20px -5px rgba(0, 0, 0, 0.5)'
            : '0 2px 12px -2px rgba(15, 23, 42, 0.08)'
          : '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 10px' : '0 16px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Main Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: isMobile ? '48px' : '62px',
            gap: isMobile ? '6px' : '14px',
            width: '100%'
          }}
        >
          {/* ================= 1. BRAND LOGO & ROLE IDENTITY ================= */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            {/* Hamburger Button for Slide-Out Side Navigation */}
            <button
              type="button"
              onClick={() => setIsSideNavOpen(true)}
              aria-label="Open Side Navigation Menu"
              title="Menu / வழிசெலுத்தல்"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '34px' : '38px',
                height: isMobile ? '34px' : '38px',
                borderRadius: '10px',
                backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                color: isDarkMode ? '#F8FAFC' : '#0F172A',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <Menu size={isMobile ? 18 : 20} />
            </button>

            <div
              onClick={() => {
                if (isTechnician) navigate('/partner');
                else if (isAdmin) navigate('/admin');
                else navigate('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '10px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {/* Official SalemSeva Logo Icon */}
              <div
                style={{
                  width: isMobile ? '36px' : '42px',
                  height: isMobile ? '36px' : '42px',
                  borderRadius: isMobile ? '8px' : '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src="/logo.png"
                  alt="SalemSeva Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Dynamic Wordmark and Subtitle based on Active Role */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', lineHeight: 1 }}>
                  <span
                    style={{
                      fontSize: isMobile ? '18px' : '21px',
                      fontWeight: 900,
                      letterSpacing: '-0.5px',
                      color: '#0066CC'
                    }}
                  >
                    Salem
                    <span
                      style={{
                        color: isTechnician ? '#10B981' : isAdmin ? '#F59E0B' : '#FF6600'
                      }}
                    >
                      {isTechnician ? 'Partner' : isAdmin ? 'Ops' : 'Seva'}
                    </span>
                  </span>

                  {/* Role Verified / Badge */}
                  {isTechnician ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        backgroundColor: isDarkMode ? 'rgba(6, 95, 70, 0.4)' : '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #10B981'
                      }}
                    >
                      <ShieldCheck size={10} color="#059669" />
                      {user?.trade?.toUpperCase() || 'AC'} PRO
                    </span>
                  ) : isAdmin ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #F59E0B'
                      }}
                    >
                      <Activity size={10} color="#B45309" />
                      HQ
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        backgroundColor: isDarkMode ? 'rgba(6, 95, 70, 0.3)' : '#ECFDF5',
                        color: isDarkMode ? '#34D399' : '#059669',
                        border: isDarkMode ? '1px solid #065F46' : '1px solid #A7F3D0'
                      }}
                    >
                      <ShieldCheck size={10} color={isDarkMode ? '#34D399' : '#059669'} />
                      Verified
                    </span>
                  )}
                </div>

                {!isMobile && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      marginTop: '3px'
                    }}
                  >
                    {isTechnician
                      ? 'Verified Specialist Hub • Salem'
                      : isAdmin
                      ? 'Central Dispatch Operations • Salem'
                      : 'On-Demand Home Services • Salem'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ================= 2. CENTRE BAR: ROLE DYNAMIC CONTENT (DESKTOP ONLY) ================= */}
          {/* --- CASE A: CUSTOMER / LOGGED OUT: Location Pill + Global Search --- */}
          {isCustomer && !isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: 1,
                maxWidth: '520px'
              }}
            >
              {/* Location Selector Pill */}
              <div style={{ position: 'relative', flexShrink: 0 }} ref={locationRef}>
                <button
                  type="button"
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: isDarkMode
                      ? isLocationOpen ? '#1E293B' : '#0F172A'
                      : isLocationOpen ? '#EFF6FF' : '#F1F5F9',
                    color: isDarkMode
                      ? isLocationOpen ? '#38BDF8' : '#E2E8F0'
                      : isLocationOpen ? '#2563EB' : '#1E293B',
                    border: isLocationOpen
                      ? '1.5px solid #2563EB'
                      : isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MapPin size={14} color="#2563EB" />
                  <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedLocation.split(',')[0]}
                  </span>
                  <ChevronDown size={14} color="#94A3B8" />
                </button>

                {/* Location Popover */}
                {isLocationOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '280px',
                      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                      borderRadius: '16px',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 1200
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderBottom: isDarkMode ? '1px solid #1E293B' : '1px solid #F1F5F9',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                        Salem Localities
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#059669',
                          backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        15-min Arrival
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#2563EB',
                        backgroundColor: isDarkMode ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: '4px'
                      }}
                    >
                      <Navigation size={14} color="#2563EB" />
                      <span>Use current location (GPS)</span>
                    </button>

                    <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {salemLocalities.map((loc) => {
                        const isSelected = selectedLocation.startsWith(loc.name.split(',')[0]);
                        return (
                          <div
                            key={loc.name}
                            onClick={() => handleSelectArea(loc.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: isSelected ? 800 : 500,
                              color: isSelected ? '#2563EB' : isDarkMode ? '#E2E8F0' : '#334155',
                              backgroundColor: isSelected
                                ? isDarkMode ? '#1E293B' : '#F1F5F9'
                                : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.1s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={13} color={isSelected ? '#2563EB' : '#94A3B8'} />
                              <span>{loc.name}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
                              {loc.pincode}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Global Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ flex: 1, margin: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '12px',
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    border: isSearchFocused
                      ? '1.5px solid #2563EB'
                      : isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    padding: '0 12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Search size={16} color="#94A3B8" style={{ marginRight: '8px', flexShrink: 0 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search AC repair, electrician, plumber..."
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '8px 0',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: isDarkMode ? '#FFFFFF' : '#0F172A'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#94A3B8',
                      backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      marginLeft: '6px',
                      flexShrink: 0
                    }}
                  >
                    ⌘K
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* --- CASE B: TECHNICIAN / PARTNER: Duty Online Toggle + Zone Pill --- */}
          {isTechnician && !isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: 1,
                maxWidth: '520px'
              }}
            >
              {/* Live Duty Toggle Button */}
              <button
                type="button"
                onClick={handleToggleDutyStatus}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isPartnerOnline
                    ? isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'
                    : isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                  color: isPartnerOnline ? '#059669' : '#DC2626',
                  border: isPartnerOnline
                    ? '1.5px solid #10B981'
                    : '1.5px solid #EF4444',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isPartnerOnline ? '#10B981' : '#EF4444',
                    boxShadow: isPartnerOnline ? '0 0 8px #10B981' : 'none'
                  }}
                />
                <span>{isPartnerOnline ? 'ON DUTY (ஆன்லைனில்)' : 'OFFLINE (ஆஃப்லைனில்)'}</span>
                <Power size={13} />
              </button>

              {/* Technician Area / Zone Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                  color: isDarkMode ? '#E2E8F0' : '#334155',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0'
                }}
              >
                <MapPin size={14} color="#10B981" />
                <span>{user?.serviceArea || 'Fairlands & Hasthampatti Zone'}</span>
              </div>
            </div>
          )}

          {/* --- CASE C: ADMIN: Live Dispatch Radar Status --- */}
          {isAdmin && !isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flex: 1,
                maxWidth: '520px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFBEB',
                  color: '#D97706',
                  border: '1.5px solid #F59E0B'
                }}
              >
                <Activity size={14} color="#D97706" />
                <span>Dispatch Radar: 8 Active Techs • 100% Online</span>
              </div>
            </div>
          )}

          {/* ================= 3. RIGHT ACTION ITEMS (ROLE ADAPTIVE) ================= */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            
            {/* 3.1 Role Specific Action / Links (Desktop Only) */}
            {isCustomer && !isMobile && (
              <>
                {/* Customer Bookings Link */}
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: isBookingsActive
                      ? isDarkMode ? '#1E293B' : '#EFF6FF'
                      : 'transparent',
                    color: isBookingsActive
                      ? '#2563EB'
                      : isDarkMode ? '#E2E8F0' : '#475569',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <Calendar size={15} color={isBookingsActive ? '#2563EB' : '#64748B'} />
                  <span>Bookings</span>
                  {isBookingsActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '12px',
                        right: '12px',
                        height: '2px',
                        backgroundColor: '#2563EB',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>

                {/* Customer Credits Chip */}
                <button
                  type="button"
                  onClick={() => navigate('/wallet')}
                  title="View Seva Wallet & Credits"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                    color: isDarkMode ? '#FBBF24' : '#B45309',
                    border: isDarkMode ? '1px solid #B45309' : '1px solid #FDE68A',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Wallet size={15} color="#D97706" />
                  <span>₹{creditsAmount} CREDITS</span>
                </button>
              </>
            )}

            {isTechnician && !isMobile && (
              <>
                {/* Active Partner Duty Radar Link */}
                <button
                  type="button"
                  onClick={() => navigate('/partner')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: isPartnerActive ? '#059669' : '#1E293B',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={14} color="#FEF08A" />
                  <span>Duty Radar</span>
                </button>

                {/* Partner Earnings / Payout Chip */}
                <button
                  type="button"
                  onClick={() => navigate('/partner')}
                  title="Partner Incentives & Payout"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    border: '1.5px solid #10B981',
                    cursor: 'pointer'
                  }}
                >
                  <Wallet size={14} color="#047857" />
                  <span>₹{user?.todayEarnings || 1450} TODAY</span>
                </button>
              </>
            )}

            {isAdmin && !isMobile && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: '#F59E0B',
                    color: '#0F172A',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Operations Command
                </button>
              </>
            )}

            {/* 3.2 Notifications Bell */}
            <button
              type="button"
              onClick={() => navigate(isTechnician ? '/partner' : '/history')}
              title="Notifications & Updates"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                color: isDarkMode ? '#94A3B8' : '#64748B',
                cursor: 'pointer'
              }}
            >
              <Bell size={isMobile ? 16 : 17} />
              {hasNotifications && (
                <span
                  style={{
                    position: 'absolute',
                    top: isMobile ? '6px' : '8px',
                    right: isMobile ? '6px' : '8px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: isTechnician ? '#10B981' : '#2563EB',
                    borderRadius: '50%',
                    border: isDarkMode ? '1.5px solid #0F172A' : '1.5px solid #FFFFFF'
                  }}
                />
              )}
            </button>

            {/* 3.3 Google Translate / Language Selector Button */}
            <button
              type="button"
              onClick={() => setIsLanguageModalOpen(true)}
              title="Change Language / மொழி தேர்வு (Google Translate)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: isMobile ? '3px 6px' : '4px 8px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
                border: isDarkMode ? '1px solid #334155' : '1px solid #DBEAFE',
                color: '#0066CC',
                cursor: 'pointer',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 800,
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={isMobile ? 14 : 15} color="#0066CC" />
              <span style={{ textTransform: 'uppercase' }}>
                {getCurrentLanguage() === 'ta' ? 'தமிழ்' : getCurrentLanguage() === 'hi' ? 'हिन्दी' : getCurrentLanguage()}
              </span>
            </button>

            {/* 3.4 Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '30px' : '32px',
                height: isMobile ? '30px' : '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: isDarkMode ? '#FBBF24' : '#64748B',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? <Sun size={isMobile ? 15 : 16} color="#FBBF24" /> : <Moon size={isMobile ? 15 : 16} color="#475569" />}
            </button>

            {/* 3.5 User Avatar & Adaptive Role Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: isMobile ? '32px' : '36px',
                      height: isMobile ? '32px' : '36px',
                      borderRadius: '50%',
                      background: isTechnician
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : isAdmin
                        ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                        : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: isMobile ? '12px' : '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isDarkMode ? '1.5px solid #334155' : '1.5px solid #E2E8F0'
                    }}
                  >
                    {initial}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: isMobile ? '7px' : '9px',
                      height: isMobile ? '7px' : '9px',
                      backgroundColor: isPartnerOnline ? '#10B981' : '#EF4444',
                      borderRadius: '50%',
                      border: isDarkMode ? '1.5px solid #0F172A' : '1.5px solid #FFFFFF'
                    }}
                  />
                </div>
              </button>

              {/* Profile Menu Popover */}
              {isProfileOpen && (
                <div
                  style={{
                    position: isMobile ? 'fixed' : 'absolute',
                    top: isMobile ? '60px' : 'calc(100% + 8px)',
                    right: isMobile ? '12px' : 0,
                    width: isMobile ? 'calc(100vw - 24px)' : '280px',
                    maxWidth: '300px',
                    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                    padding: '8px',
                    zIndex: 1200
                  }}
                >
                  {/* User Header */}
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isTechnician ? '#059669' : isAdmin ? '#D97706' : '#2563EB',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: isDarkMode ? '#FFFFFF' : '#0F172A' }}>
                            {displayName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                            {user?.phone || '+91 98427 11234'}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isTechnician ? '#ECFDF5' : isAdmin ? '#FEF3C7' : '#EFF6FF',
                          color: isTechnician ? '#059669' : isAdmin ? '#B45309' : '#2563EB'
                        }}
                      >
                        {isTechnician ? 'Partner' : isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                  </div>

                  {/* Mode / View Switchers */}
                  <div style={{ padding: '4px 6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Switch User Mode
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          loginAsCustomer();
                          navigate('/');
                          setIsProfileOpen(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          border: 'none',
                          backgroundColor: isCustomer ? '#2563EB' : isDarkMode ? '#1E293B' : '#F1F5F9',
                          color: isCustomer ? '#FFFFFF' : isDarkMode ? '#E2E8F0' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        <User size={12} /> Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          loginAsTechnician();
                          navigate('/partner');
                          setIsProfileOpen(false);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          border: 'none',
                          backgroundColor: isTechnician ? '#059669' : isDarkMode ? '#1E293B' : '#F1F5F9',
                          color: isTechnician ? '#FFFFFF' : isDarkMode ? '#E2E8F0' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        <Briefcase size={12} /> Partner
                      </button>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', margin: '6px 0' }} />

                  {/* Role Specific Nav Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {isCustomer ? (
                      <>
                        <div
                          onClick={() => {
                            navigate('/wallet');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#E2E8F0' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wallet size={15} color="#D97706" />
                            <span>Seva Wallet & Rewards</span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706' }}>₹{creditsAmount}</span>
                        </div>

                        <div
                          onClick={() => {
                            navigate('/history');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#E2E8F0' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <Calendar size={15} color="#2563EB" />
                          <span>My Bookings & Invoices</span>
                        </div>

                        {/* Customer Direct Links */}
                      </>
                    ) : isTechnician ? (
                      <>
                        <div
                          onClick={() => {
                            navigate('/partner');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#E2E8F0' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={15} color="#10B981" />
                            <span>Partner Duty Radar</span>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                            LIVE
                          </span>
                        </div>

                        <div
                          onClick={() => {
                            navigate('/partner');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#E2E8F0' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={15} color="#D97706" />
                            <span>Incentives & Payouts</span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                            ₹{partnerIncentives?.availablePayout || 500} Available
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            navigate('/admin');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isDarkMode ? '#E2E8F0' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <Activity size={15} color="#D97706" />
                          <span>Admin Control Center</span>
                        </div>
                      </>
                    )}

                    <div
                      onClick={() => {
                        setIsLanguageModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isDarkMode ? '#E2E8F0' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={15} color="#0066CC" />
                        <span>Language / மொழி மாற்றவும்</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#0066CC' }}>
                        {SUPPORTED_LANGUAGES.find(l => l.code === getCurrentLanguage())?.nativeName || 'EN'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        window.location.href = 'tel:1800-425-7253';
                        setIsProfileOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isDarkMode ? '#E2E8F0' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      <HelpCircle size={15} color="#0D9488" />
                      <span>Help & Support (Salem 24/7)</span>
                    </div>
                  </div>

                  <div style={{ height: '1px', backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', margin: '6px 0' }} />

                  {/* Auth Actions */}
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#E11D48',
                        backgroundColor: isDarkMode ? 'rgba(225, 29, 72, 0.1)' : '#FFF1F2',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={14} color="#E11D48" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal();
                        setIsProfileOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        backgroundColor: '#2563EB',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <User size={14} />
                      <span>Login / Sign Up</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Translate & Language Selector Modal */}
      <LanguageSelectorModal
        open={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Slide-out Side Navbar Drawer */}
      <SideNavbar
        isOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
        user={user}
        creditsAmount={creditsAmount}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenAuthModal={openAuthModal}
        logout={logout}
      />
    </header>
  );
}
