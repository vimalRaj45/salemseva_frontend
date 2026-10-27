import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  MapPin,
  Search,
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
  Sparkles,
  Zap,
  Activity,
  Layers,
  Award,
  CheckCircle2,
  PhoneCall,
  Power,
  Globe,
  Menu,
  MessageSquarePlus,
  LifeBuoy,
  Droplets,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SideNavbar from './SideNavbar';
import { SUPPORTED_LANGUAGES, getCurrentLanguage } from '../services/languageService';
import { getLiveAccurateLocation } from '../utils/geoUtils';
import toast from 'react-hot-toast';

export default function Navbar({
  userName: propUserName,
  location: propLocation,
  credits: propCredits,
  onVoiceAssist,
  onLocationChange
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    user,
    techUser,
    logoutTech,
    openAuthModal,
    logout,
    walletBalance: authWalletBalance,
    partnerIncentives,
    updateUser
  } = useAuth();

  // Role detection
  const isTechnician = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user') ||
    currentPath.startsWith('/partner')
  );

  const isAdmin = Boolean(
    user?.role === 'admin' ||
    currentPath.startsWith('/admin')
  );

  const isCustomer = Boolean(!isTechnician && !isAdmin && user);
  const isGuest = Boolean(!isTechnician && !isAdmin && !user);
  const userRole = isTechnician ? 'technician' : isAdmin ? 'admin' : 'customer';

  // Display user information
  const displayName = propUserName || user?.name || (isTechnician ? 'Salem Partner' : isAdmin ? 'Salem Ops Admin' : 'Customer');
  const initial = displayName ? displayName.charAt(0).toUpperCase() : (isTechnician ? 'P' : isAdmin ? 'A' : 'C');
  const creditsAmount = propCredits !== undefined ? propCredits : (authWalletBalance ?? user?.walletBalance ?? 100);
  const isPartnerOnline = user?.isOnline !== false;

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Popover States
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Drawer State
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  // Search & Location
  const [selectedLocation, setSelectedLocation] = useState(propLocation || user?.locality || 'Fairlands, Salem');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasNotifications] = useState(true);

  // Refs for click outside
  const locationRef = useRef(null);
  const servicesRef = useRef(null);
  const partnerMenuRef = useRef(null);
  const adminMenuRef = useRef(null);
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

  // Close popovers on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setIsServicesOpen(false);
      }
      if (partnerMenuRef.current && !partnerMenuRef.current.contains(e.target)) {
        setIsPartnerMenuOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setIsAdminMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLocationOpen(false);
        setIsServicesOpen(false);
        setIsPartnerMenuOpen(false);
        setIsAdminMenuOpen(false);
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
    { name: 'Gugai, Salem', pincode: '636006' },
    { name: 'Kondalampatti, Salem', pincode: '636010' },
    { name: 'Kannankurichi, Salem', pincode: '636008' },
    { name: 'Gorimedu, Salem', pincode: '636008' },
    { name: 'Steel Plant Area, Salem', pincode: '636013' }
  ];

  const handleSelectArea = (areaName) => {
    setSelectedLocation(areaName);
    setIsLocationOpen(false);
    if (onLocationChange) {
      onLocationChange(areaName);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      setSelectedLocation('Detecting live GPS...');
      try {
        const geo = await getLiveAccurateLocation();
        if (geo.isSalem) {
          const locName = `${geo.localityName || 'Fairlands'}, Salem`;
          setSelectedLocation(locName);
          setIsLocationOpen(false);
          const locationData = {
            locality: geo.localityName || 'Fairlands',
            pincode: geo.pincode && geo.pincode.startsWith('636') ? geo.pincode : '636016',
            lat: geo.lat,
            lng: geo.lng,
            address: geo.fullAddress || `${locName} - 636016`
          };
          localStorage.setItem('shazuone_user_location', JSON.stringify(locationData));
          toast.success(`Location set to ${locName}`);
          if (onLocationChange) onLocationChange(locName);
        } else {
          const placeLabel = geo.city || geo.district || 'Outside Area';
          const outName = `${placeLabel} (Outside Salem)`;
          setSelectedLocation(outName);
          setIsLocationOpen(false);
          toast.error(`Notice: Live GPS detected in ${placeLabel} (~${Math.round(geo.distanceKmFromCenter || 0)} km away). Shazu One operates in Salem (636xxx).`);
          if (onLocationChange) onLocationChange(outName);
        }
      } catch (err) {
        setSelectedLocation('Fairlands, Salem');
        setIsLocationOpen(false);
      }
    } else {
      setSelectedLocation('Fairlands, Salem');
      setIsLocationOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('ac') || q.includes('cool')) navigate('/book/ac');
    else if (q.includes('elect') || q.includes('power') || q.includes('wire')) navigate('/book/electrician');
    else if (q.includes('plumb') || q.includes('pipe') || q.includes('water')) navigate('/book/plumber');
    else if (q.includes('clean') || q.includes('wash')) navigate('/book/cleaning');
    else navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleToggleDutyStatus = () => {
    const nextStatus = !isPartnerOnline;
    if (updateUser) {
      updateUser({ isOnline: nextStatus });
    }
    localStorage.setItem('shazuone_partner_is_online', nextStatus ? 'true' : 'false');
    toast.success(nextStatus ? 'Status changed to Online (On Duty)' : 'Status changed to Offline');
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
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: hasScrolled
          ? '0 4px 12px -2px rgba(15, 23, 42, 0.08)'
          : '0 1px 2px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <style>{`
        @keyframes navPopFade {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .nav-dropdown-menu {
          animation: navPopFade 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-hover-item:hover {
          background-color: #F8FAFC !important;
        }
        .nav-service-card:hover {
          background-color: #EFF6FF !important;
          border-color: #BFDBFE !important;
        }
      `}</style>

      <div
        style={{
          maxWidth: '1380px',
          width: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Main Navigation Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: isMobile ? '56px' : '64px',
            gap: isMobile ? '8px' : '16px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* ================= 1. BRAND LOGO & DYNAMIC ROLE BADGE ================= */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
              {/* Brand Logo Icon */}
              <div
                style={{
                  width: isMobile ? '34px' : '38px',
                  height: isMobile ? '34px' : '38px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(10, 92, 196, 0.12)'
                }}
              >
                <img
                  src="/logo-mark.svg"
                  onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                  alt="Shazu One"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Dynamic Wordmark */}
              <span
                style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: 900,
                  letterSpacing: '-0.4px',
                  color: '#0A5CC4',
                  lineHeight: 1
                }}
              >
                Shazu{' '}
                <span
                  style={{
                    color: isTechnician ? '#2B9236' : isAdmin ? '#D97706' : '#2B9236'
                  }}
                >
                  {isTechnician ? 'Partner' : isAdmin ? 'Ops' : 'One'}
                </span>
              </span>
            </div>
          </div>

          {/* ================= 2. CENTER: ROLE ADAPTIVE ACTION / SEARCH BAR (DESKTOP) ================= */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '580px', margin: '0 8px' }}>
              
              {/* --- CASE A: CUSTOMER OR GUEST: Locality Pill + Search --- */}
              {(!isTechnician && !isAdmin) && (
                <>
                  {/* Salem Locality Dropdown Pill */}
                  <div style={{ position: 'relative', flexShrink: 0 }} ref={locationRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsServicesOpen(false);
                        setIsProfileOpen(false);
                        setIsLocationOpen(!isLocationOpen);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        backgroundColor: isLocationOpen ? '#EFF6FF' : '#F8FAFC',
                        color: isLocationOpen ? '#0A5CC4' : '#1E293B',
                        border: isLocationOpen ? '1px solid #0A5CC4' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <MapPin size={14} color="#0A5CC4" />
                      <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedLocation.split(',')[0]}
                      </span>
                      <ChevronDown size={14} color="#64748B" />
                    </button>

                    {/* Locality Popover Dropdown */}
                    {isLocationOpen && (
                      <div
                        className="nav-dropdown-menu"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          width: '280px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                          border: '1px solid #E2E8F0',
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
                            borderBottom: '1px solid #F1F5F9',
                            marginBottom: '6px'
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                            Salem Municipal Localities
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#15803D',
                              backgroundColor: '#DCFCE7',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            15-Min Arrival
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
                            padding: '7px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0A5CC4',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginBottom: '6px'
                          }}
                        >
                          <Navigation size={13} color="#0A5CC4" />
                          <span>Detect Accurate Live GPS</span>
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
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: isSelected ? 800 : 500,
                                  color: isSelected ? '#0A5CC4' : '#334155',
                                  backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.12s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <MapPin size={12} color={isSelected ? '#0A5CC4' : '#94A3B8'} />
                                  <span>{loc.name}</span>
                                </div>
                                <span style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'monospace' }}>
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
                        height: '38px',
                        boxSizing: 'border-box',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        border: isSearchFocused ? '1px solid #0A5CC4' : '1px solid #E2E8F0',
                        boxShadow: isSearchFocused ? '0 0 0 3px rgba(10, 92, 196, 0.12)' : 'none',
                        padding: '0 12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Search size={15} color="#94A3B8" style={{ marginRight: '8px', flexShrink: 0 }} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder="Search AC repair, electrician, plumber, cleaning..."
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                          fontSize: '12.5px',
                          fontWeight: 500,
                          color: '#0F172A'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#64748B',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '4px',
                          padding: '1px 5px',
                          marginLeft: '6px',
                          flexShrink: 0
                        }}
                      >
                        Cmd+K
                      </span>
                    </div>
                  </form>
                </>
              )}

              {/* --- CASE B: TECHNICIAN: Duty Status Toggle + Assigned Zone --- */}
              {isTechnician && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  {/* Live Duty Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleDutyStatus}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: isPartnerOnline ? '#DCFCE7' : '#FEE2E2',
                      color: isPartnerOnline ? '#15803D' : '#DC2626',
                      border: isPartnerOnline ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isPartnerOnline ? '#16A34A' : '#DC2626',
                        boxShadow: isPartnerOnline ? '0 0 6px #16A34A' : 'none'
                      }}
                    />
                    <span>{isPartnerOnline ? 'ON DUTY (ஆன்லைனில்)' : 'OFFLINE (ஆஃப்லைனில்)'}</span>
                    <Power size={13} />
                  </button>

                  {/* Technician Service Zone Display */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#F8FAFC',
                      color: '#334155',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <MapPin size={13} color="#2B9236" />
                    <span>{user?.serviceArea || 'Salem Municipal Zone'}</span>
                  </div>
                </div>
              )}

              {/* --- CASE C: ADMIN: Live Dispatch Status --- */}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FCD34D'
                    }}
                  >
                    <Activity size={14} color="#D97706" />
                    <span>Salem Fleet Dispatch Telemetry Active</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. RIGHT NAVIGATION & ROLE DROP-DOWNS ================= */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            
            {/* 3.1 SERVICES DROPDOWN (Customer & Guest Desktop) */}
            {(!isTechnician && !isAdmin) && !isMobile && (
              <div style={{ position: 'relative' }} ref={servicesRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationOpen(false);
                    setIsProfileOpen(false);
                    setIsServicesOpen(!isServicesOpen);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: isServicesOpen ? '#EFF6FF' : 'transparent',
                    color: isServicesOpen ? '#0A5CC4' : '#334155',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Layers size={15} color={isServicesOpen ? '#0A5CC4' : '#64748B'} />
                  <span>Services</span>
                  <ChevronDown size={14} color={isServicesOpen ? '#0A5CC4' : '#64748B'} />
                </button>

                {/* Services Dropdown Menu with Sub-items */}
                {isServicesOpen && (
                  <div
                    className="nav-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '320px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 1200
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 8px 8px 8px',
                        borderBottom: '1px solid #F1F5F9',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Hyperlocal Doorstep Services
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <NavServiceItem
                        icon={<Wrench size={16} color="#0A5CC4" />}
                        title="AC Service & Repair"
                        subtitle="Deep jet wash, gas refill & copper installation"
                        onClick={() => {
                          setIsServicesOpen(false);
                          navigate('/book/ac');
                        }}
                      />
                      <NavServiceItem
                        icon={<Zap size={16} color="#D97706" />}
                        title="Electrician Works"
                        subtitle="Wiring, short circuit, switchboard & inverter"
                        onClick={() => {
                          setIsServicesOpen(false);
                          navigate('/book/electrician');
                        }}
                      />
                      <NavServiceItem
                        icon={<Droplets size={16} color="#0284C7" />}
                        title="Sanitary Plumbing"
                        subtitle="Pipe leaks, drainage clearing, tap & pump fitting"
                        onClick={() => {
                          setIsServicesOpen(false);
                          navigate('/book/plumber');
                        }}
                      />
                      <NavServiceItem
                        icon={<Sparkles size={16} color="#2B9236" />}
                        title="Deep Home Cleaning"
                        subtitle="Full house, kitchen degreasing & bathroom disinfection"
                        onClick={() => {
                          setIsServicesOpen(false);
                          navigate('/book/cleaning');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3.2 PARTNER TOOLS DROPDOWN (Technician Desktop) */}
            {isTechnician && !isMobile && (
              <div style={{ position: 'relative' }} ref={partnerMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsPartnerMenuOpen(!isPartnerMenuOpen);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: isPartnerMenuOpen ? '#F0FDF4' : 'transparent',
                    color: isPartnerMenuOpen ? '#2B9236' : '#334155',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Briefcase size={15} color={isPartnerMenuOpen ? '#2B9236' : '#64748B'} />
                  <span>Partner Tools</span>
                  <ChevronDown size={14} color={isPartnerMenuOpen ? '#2B9236' : '#64748B'} />
                </button>

                {/* Partner Tools Dropdown Menu */}
                {isPartnerMenuOpen && (
                  <div
                    className="nav-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '300px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 1200
                    }}
                  >
                    <div style={{ padding: '6px 8px 8px 8px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                        Technician Console
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <NavServiceItem
                        icon={<Zap size={16} color="#2B9236" />}
                        title="Duty Radar & Calls"
                        subtitle="View live job dispatches in your zone"
                        onClick={() => {
                          setIsPartnerMenuOpen(false);
                          navigate('/partner');
                        }}
                      />
                      <NavServiceItem
                        icon={<Wrench size={16} color="#0A5CC4" />}
                        title="Digital Quote Builder"
                        subtitle="Generate transparent parts and service bill"
                        onClick={() => {
                          setIsPartnerMenuOpen(false);
                          navigate('/partner/quote-builder');
                        }}
                      />
                      <NavServiceItem
                        icon={<ShieldCheck size={16} color="#D97706" />}
                        title="KYC & Verification"
                        subtitle="Aadhaar and identity clearance status"
                        onClick={() => {
                          setIsPartnerMenuOpen(false);
                          navigate('/partner/onboarding');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3.3 ADMIN MANAGEMENT DROPDOWN (Admin Desktop) */}
            {isAdmin && !isMobile && (
              <div style={{ position: 'relative' }} ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsAdminMenuOpen(!isAdminMenuOpen);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: isAdminMenuOpen ? '#FEF3C7' : 'transparent',
                    color: isAdminMenuOpen ? '#92400E' : '#334155',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Activity size={15} color={isAdminMenuOpen ? '#D97706' : '#64748B'} />
                  <span>Ops Management</span>
                  <ChevronDown size={14} color={isAdminMenuOpen ? '#D97706' : '#64748B'} />
                </button>

                {isAdminMenuOpen && (
                  <div
                    className="nav-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '310px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 1200
                    }}
                  >
                    <div style={{ padding: '6px 8px 8px 8px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                        Salem Operations Console
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <NavServiceItem
                        icon={<Activity size={16} color="#D97706" />}
                        title="Central Ops Radar"
                        subtitle="Fleet dispatch status & live tracking"
                        onClick={() => {
                          setIsAdminMenuOpen(false);
                          navigate('/admin');
                        }}
                      />
                      <NavServiceItem
                        icon={<ShieldCheck size={16} color="#0A5CC4" />}
                        title="Traceability & Audit Logs"
                        subtitle="Immutable ledger of platform actions"
                        onClick={() => {
                          setIsAdminMenuOpen(false);
                          navigate('/admin/traceability');
                        }}
                      />
                      <NavServiceItem
                        icon={<Wallet size={16} color="#2B9236" />}
                        title="Settlements & Payouts"
                        subtitle="Razorpay escrow disbursements"
                        onClick={() => {
                          setIsAdminMenuOpen(false);
                          navigate('/admin/settlements');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3.4 ROLE SPECIFIC QUICK CHIPS & ACTIONS (DESKTOP) */}
            {isCustomer && !isMobile && (
              <>
                {/* Bookings Link */}
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: isBookingsActive ? '#EFF6FF' : 'transparent',
                    color: isBookingsActive ? '#0A5CC4' : '#475569',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={15} color={isBookingsActive ? '#0A5CC4' : '#64748B'} />
                  <span>Bookings</span>
                </button>

                {/* Seva Wallet Pill */}
                <button
                  type="button"
                  onClick={() => navigate('/wallet')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: '#FFFBEB',
                    color: '#B45309',
                    border: '1px solid #FDE68A',
                    cursor: 'pointer'
                  }}
                >
                  <Wallet size={14} color="#D97706" />
                  <span>{creditsAmount} pts (₹{(creditsAmount / 10).toFixed(0)})</span>
                </button>
              </>
            )}

            {isTechnician && !isMobile && (
              <>
                {/* Partner Today's Earnings Pill */}
                <button
                  type="button"
                  onClick={() => navigate('/partner')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    border: '1px solid #86EFAC',
                    cursor: 'pointer'
                  }}
                >
                  <Wallet size={14} color="#15803D" />
                  <span>₹{user?.todayEarnings != null ? user.todayEarnings : 0} Today</span>
                </button>
              </>
            )}

            {isAdmin && !isMobile && (
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                <span>Customer Storefront</span>
                <ArrowRight size={13} />
              </button>
            )}

            {isGuest && !isMobile && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/how-it-works')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: 'transparent',
                    color: '#475569',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span>How It Works</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/register?role=partner')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    cursor: 'pointer'
                  }}
                >
                  <Briefcase size={14} color="#15803D" />
                  <span>Become a Partner</span>
                </button>
              </>
            )}

            {/* 3.5 NOTIFICATIONS BELL (Customer & Partner Only) */}
            {user && !isAdmin && (
              <button
                type="button"
                onClick={() => navigate(isTechnician ? '/partner' : '/history')}
                title="Notifications & Updates"
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isMobile ? '34px' : '38px',
                  height: isMobile ? '34px' : '38px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Bell size={isMobile ? 15 : 16} />
                {hasNotifications && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '7px',
                      right: '7px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: isTechnician ? '#2B9236' : '#0A5CC4',
                      borderRadius: '50%',
                      border: '1.5px solid #FFFFFF'
                    }}
                  />
                )}
              </button>
            )}

            {/* 3.6 LANGUAGE SELECTOR (Customer & Guest Desktop) */}
            {!isAdmin && !isMobile && (
              <button
                type="button"
                onClick={() => navigate('/language')}
                title="Change Language"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#0A5CC4',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <Globe size={14} color="#0A5CC4" />
                <span style={{ textTransform: 'uppercase' }}>
                  {getCurrentLanguage() === 'ta' ? 'தமிழ்' : getCurrentLanguage() === 'hi' ? 'हिन्दी' : 'EN'}
                </span>
              </button>
            )}

            {/* 3.7 USER PROFILE AVATAR & DROPDOWN (LOGGED IN) OR CLEAN SIGN IN BUTTON */}
            {user ? (
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationOpen(false);
                    setIsServicesOpen(false);
                    setIsPartnerMenuOpen(false);
                    setIsAdminMenuOpen(false);
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 0,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? '34px' : '38px',
                      height: isMobile ? '34px' : '38px',
                      borderRadius: '50%',
                      backgroundColor: isTechnician ? '#2B9236' : isAdmin ? '#D97706' : '#0A5CC4',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: isMobile ? '12px' : '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.15)'
                    }}
                  >
                    {initial}
                  </div>
                </button>

                {/* Profile Menu Popover */}
                {isProfileOpen && (
                  <div
                    className="nav-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '280px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      zIndex: 1200
                    }}
                  >
                    {/* User Profile Header */}
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: isTechnician ? '#F0FDF4' : isAdmin ? '#FFFBEB' : '#EFF6FF',
                        border: isTechnician ? '1px solid #BBF7D0' : isAdmin ? '1px solid #FDE68A' : '1px solid #DBEAFE',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: isTechnician ? '#2B9236' : isAdmin ? '#D97706' : '#0A5CC4',
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
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                              {displayName}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                              {user?.phone || 'Salem Member'}
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
                            backgroundColor: isTechnician ? '#DCFCE7' : isAdmin ? '#FEF3C7' : '#DBEAFE',
                            color: isTechnician ? '#15803D' : isAdmin ? '#92400E' : '#0A5CC4'
                          }}
                        >
                          {isTechnician ? 'Partner' : isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    {/* Role-adaptive Menu Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {isCustomer && (
                        <>
                          <div
                            className="nav-hover-item"
                            onClick={() => {
                              navigate('/wallet');
                              setIsProfileOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Wallet size={14} color="#D97706" />
                              <span>Seva Wallet & Rewards</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309' }}>
                              {creditsAmount} pts
                            </span>
                          </div>

                          <div
                            className="nav-hover-item"
                            onClick={() => {
                              navigate('/history');
                              setIsProfileOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <Calendar size={14} color="#0A5CC4" />
                            <span>My Bookings & Invoices</span>
                          </div>
                        </>
                      )}

                      {isTechnician && (
                        <>
                          <div
                            className="nav-hover-item"
                            onClick={() => {
                              navigate('/partner');
                              setIsProfileOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Zap size={14} color="#2B9236" />
                              <span>Duty Console & Calls</span>
                            </div>
                            <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#15803D', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                              LIVE
                            </span>
                          </div>

                          <div
                            className="nav-hover-item"
                            onClick={() => {
                              navigate('/partner/quote-builder');
                              setIsProfileOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <Wrench size={14} color="#0A5CC4" />
                            <span>Digital Quote Builder</span>
                          </div>
                        </>
                      )}

                      {isAdmin && (
                        <div
                          className="nav-hover-item"
                          onClick={() => {
                            navigate('/admin');
                            setIsProfileOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <Activity size={14} color="#D97706" />
                          <span>Ops Command Center</span>
                        </div>
                      )}

                      {/* Universal Items */}
                      <div
                        className="nav-hover-item"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/language');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Globe size={14} color="#0A5CC4" />
                          <span>Language / மொழி</span>
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0A5CC4' }}>
                          {SUPPORTED_LANGUAGES.find(l => l.code === getCurrentLanguage())?.nativeName || 'EN'}
                        </span>
                      </div>

                      <div
                        className="nav-hover-item"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/support');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <LifeBuoy size={14} color="#0A5CC4" />
                        <span>Support Desk & Tickets</span>
                      </div>

                      <div
                        className="nav-hover-item"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/feedback');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <MessageSquarePlus size={14} color="#0D9488" />
                        <span>Send App Feedback</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '6px 0' }} />

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (isTechnician) {
                          await logoutTech();
                        } else {
                          await logout();
                        }
                        setIsProfileOpen(false);
                        navigate('/login', { replace: true });
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#DC2626',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={13} color="#DC2626" />
                      <span>{isTechnician ? 'Sign Out of Partner Console' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: isMobile ? '34px' : '38px',
                  padding: isMobile ? '0 12px' : '0 16px',
                  borderRadius: '8px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: 700,
                  backgroundColor: '#0A5CC4',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease'
                }}
              >
                <User size={isMobile ? 13 : 15} />
                <span>Sign In</span>
              </button>
            )}

            {/* 3.8 MOBILE HAMBURGER BUTTON */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setIsSideNavOpen(true)}
                aria-label="Open Navigation Menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Menu size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Adaptive Slide-Out Drawer Panel */}
      <SideNavbar
        isOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
        user={user}
        techUser={techUser}
        creditsAmount={creditsAmount}
        isTechnician={isTechnician}
        isAdmin={isAdmin}
        isCustomer={isCustomer}
        isPartnerOnline={isPartnerOnline}
        onToggleDuty={handleToggleDutyStatus}
        onOpenLanguageModal={() => navigate('/language')}
        onOpenFeedbackModal={() => navigate('/feedback')}
        onOpenSupportTicketModal={() => navigate('/support')}
        logout={logout}
        logoutTech={logoutTech}
      />
    </header>
  );
}

function NavServiceItem({ icon, title, subtitle, onClick }) {
  return (
    <div
      className="nav-service-card"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
