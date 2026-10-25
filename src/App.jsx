import { API_V1_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LanguageSelectorModal from './components/LanguageSelectorModal';

// Customer Pages
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerOnboardingPage from './pages/customer/CustomerOnboardingPage';
import ServiceDetailPage from './pages/customer/ServiceDetailPage';
import MatchingPage from './pages/customer/MatchingPage';
import TrackingPage from './pages/customer/TrackingPage';
import QuoteReviewPage from './pages/customer/QuoteReviewPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import RatingEscalationPage from './pages/customer/RatingEscalationPage';
import WalletHubPage from './pages/customer/WalletHubPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';

// Legal & Compliance Pages
import TermsPage from './pages/legal/TermsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import RefundPolicyPage from './pages/legal/RefundPolicyPage';
import HowItWorksPage from './pages/customer/HowItWorksPage';
import FirstTimeOnboardingPage from './pages/customer/FirstTimeOnboardingPage';
import BookingChatPage from './pages/customer/BookingChatPage';
import VoipCallingPage from './pages/customer/VoipCallingPage';
import BookingCancelPage from './pages/customer/BookingCancelPage';
import BookingReschedulePage from './pages/customer/BookingReschedulePage';

// Partner Pages
import PartnerOnboardingPage from './pages/partner/PartnerOnboardingPage';
import PartnerDutyPage from './pages/partner/PartnerDutyPage';
import PartnerQuoteBuilderPage from './pages/partner/PartnerQuoteBuilderPage';
import PartnerLoginPage from './pages/partner/PartnerLoginPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminTraceabilityPage from './pages/admin/AdminTraceabilityPage';
import AdminSettlementsPage from './pages/admin/AdminSettlementsPage';
import AdminTechnicianDossierPage from './pages/admin/AdminTechnicianDossierPage';
import AdminCustomerDossierPage from './pages/admin/AdminCustomerDossierPage';

import { useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CriticalWorkProvider } from './context/CriticalWorkContext';
import AuthPage from './pages/auth/AuthPage';
import { Toaster } from 'react-hot-toast';
import GlobalNotificationWatcher from './components/GlobalNotificationWatcher';
import HeadsUpNotificationBanner from './components/HeadsUpNotificationBanner';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';
import SplashScreen from './components/SplashScreen';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// ── Phase 4: One-time localStorage key migration SalemSeva → Shazu One ───────
// Runs once per device. Migrates all salemseva_ prefixed keys to shazuone_
// so existing users do not lose their saved sessions or state.
(function migrateLocalStorageKeys() {
  try {
    if (localStorage.getItem('__shazuone_migrated__')) return;
    const OLD_PREFIX = 'salemseva_';
    const NEW_PREFIX = 'shazuone_';
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(OLD_PREFIX)) {
        const newKey = NEW_PREFIX + key.slice(OLD_PREFIX.length);
        const value = localStorage.getItem(key);
        if (value !== null) localStorage.setItem(newKey, value);
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('__shazuone_migrated__', '1');
  } catch (_) { /* storage unavailable */ }
})();


function CustomerActiveJobGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, techUser } = useAuth();

  const isTechLoggedIn = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user')
  );

  useEffect(() => {
    // Technicians should never run customer active job restoration
    if (isTechLoggedIn) return;

    // Only guard customer browsing routes
    const isCustomerRoute = !location.pathname.startsWith('/partner') && !location.pathname.startsWith('/admin');
    const isWorkStep = ['/matching', '/track', '/quote', '/checkout', '/rate'].some(p => location.pathname.startsWith(p));
    const isLegalPage = ['/terms', '/privacy', '/refund-policy', '/refunds', '/how-it-works'].some(p => location.pathname.startsWith(p));
    
    if (!isCustomerRoute || isWorkStep || isLegalPage) return;

    const activeBookingId = localStorage.getItem('shazuone_active_booking');
    if (!activeBookingId) return;

    let isMounted = true;
    fetch(`${API_V1_URL}/bookings/${activeBookingId}/track`)
      .then(r => r.json())
      .then(d => {
        if (!isMounted) return;
        if (!d.success || !d.booking) {
          // Booking was truncated or no longer exists in DB - clean up localStorage
          localStorage.removeItem('shazuone_active_booking');
          localStorage.removeItem('shazuone_partner_active_job');
          localStorage.removeItem('shazuone_partner_step');
          return;
        }

        const status = d.booking.status;
        const isRated = localStorage.getItem(`shazuone_rated_${activeBookingId}`);

        if (status === 'completed' && isRated) {
          localStorage.removeItem('shazuone_active_booking');
          return;
        }

        const isScheduled = d.booking?.booking_type === 'scheduled' || (!d.booking?.is_urgent_dispatch && d.booking?.scheduled_slot && d.booking?.scheduled_slot !== 'instant_now');
        if (['created', 'matching', 'accepted', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(status)) {
          let target = `/track?bookingId=${activeBookingId}`;
          if (status === 'quote_presented') target = `/quote?bookingId=${activeBookingId}`;
          else if (status === 'completed') target = `/rate?bookingId=${activeBookingId}`;

          navigate(target, { replace: true });
        }
      })
      .catch(() => {
        // If fetch fails, keep state safe
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  return children;
}

// Strict Role Separation Guard: Technicians cannot view customer booking or browsing pages.
// If a technician is logged in, automatically redirect them to /partner.
// If they wish to book as a customer, they must log out from their technician account first.
function CustomerRouteGuard({ children }) {
  const { user, techUser } = useAuth();

  const isTechLoggedIn = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user')
  );

  if (isTechLoggedIn) {
    return <Navigate to="/partner" replace />;
  }

  return children;
}

function InitialHomeRoute() {
  const { user, techUser, isGuest } = useAuth();
  const isTechLoggedIn = Boolean(
    techUser ||
    user?.role === 'technician' ||
    user?.role === 'partner' ||
    localStorage.getItem('shazuone_tech_user')
  );

  if (isTechLoggedIn) {
    return <Navigate to="/partner" replace />;
  }

  const hasSeen = localStorage.getItem('shazuone_has_seen_onboarding');
  if (!hasSeen && !user) {
    return <Navigate to="/welcome" replace />;
  }
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  return <CustomerHomePage />;
}

function MainLayout({ walletBalance, currentBooking, setCurrentBooking }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/partner/login' || location.pathname === '/technician/login';
  const isFullScreenPage =
    isAuthPage ||
    location.pathname === '/how-it-works' ||
    location.pathname === '/welcome' ||
    location.pathname.startsWith('/call/') ||
    location.pathname.startsWith('/chat/') ||
    location.pathname.startsWith('/booking/');

  return (
    <CustomerActiveJobGuard>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        {/* Production Top Navbar - hidden on full-screen auth / how-it-works / welcome pages */}
        {!isFullScreenPage && <Navbar walletBalance={walletBalance} />}

        {/* Real Production URL Routes */}
        <Box sx={{ 
          flex: 1, 
          pt: isFullScreenPage ? 0 : { xs: '54px', md: '64px' },
          pb: isFullScreenPage ? 0 : { xs: '58px', md: 0 }
        }}>
          <Routes>
            {/* Dedicated Action Pages (Migrated from Modals) */}
            <Route path="/chat/:bookingId" element={<BookingChatPage />} />
            <Route path="/call/:bookingId" element={<VoipCallingPage />} />
            <Route path="/booking/:bookingId/cancel" element={<BookingCancelPage />} />
            <Route path="/booking/:bookingId/reschedule" element={<BookingReschedulePage />} />

            {/* Customer Routes - Blocked for authenticated technicians */}
            <Route path="/onboarding" element={<CustomerRouteGuard><CustomerOnboardingPage onLoginSuccess={(u) => console.log('Logged in:', u)} /></CustomerRouteGuard>} />
            <Route path="/" element={<CustomerRouteGuard><InitialHomeRoute /></CustomerRouteGuard>} />
            <Route path="/book/:serviceId" element={<CustomerRouteGuard><ServiceDetailPage onStartBooking={(b) => setCurrentBooking(b)} /></CustomerRouteGuard>} />
            <Route path="/matching" element={<CustomerRouteGuard><MatchingPage /></CustomerRouteGuard>} />
            <Route path="/track" element={<CustomerRouteGuard><TrackingPage /></CustomerRouteGuard>} />
            <Route path="/tracking" element={<Navigate to="/track" replace />} />
            <Route path="/quote" element={<CustomerRouteGuard><QuoteReviewPage /></CustomerRouteGuard>} />
            <Route path="/checkout" element={<CustomerRouteGuard><CheckoutPage walletBalance={walletBalance} /></CustomerRouteGuard>} />
            <Route path="/rate" element={<CustomerRouteGuard><RatingEscalationPage /></CustomerRouteGuard>} />
            <Route path="/wallet" element={<CustomerRouteGuard><WalletHubPage walletBalance={walletBalance} /></CustomerRouteGuard>} />
            <Route path="/history" element={<CustomerRouteGuard><BookingHistoryPage /></CustomerRouteGuard>} />

            {/* Partner Routes */}
            <Route path="/partner/login" element={<PartnerLoginPage />} />
            <Route path="/technician/login" element={<Navigate to="/partner/login" replace />} />
            <Route path="/partner/onboarding" element={<PartnerOnboardingPage />} />
            <Route path="/partner" element={<PartnerDutyPage />} />
            <Route path="/partner/duty" element={<PartnerDutyPage />} />
            <Route path="/partner/quote-builder" element={<PartnerQuoteBuilderPage />} />

            {/* Admin Desk Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/traceability" element={<AdminTraceabilityPage />} />
            <Route path="/admin/settlements" element={<AdminSettlementsPage />} />
            <Route path="/admin/financials" element={<AdminSettlementsPage />} />
            <Route path="/admin/technicians/:id" element={<AdminTechnicianDossierPage />} />
            <Route path="/admin/customers/:phone" element={<AdminCustomerDossierPage />} />

            {/* Dedicated Authentication Routes */}
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />

            {/* Public Legal & Compliance Routes */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/refunds" element={<Navigate to="/refund-policy" replace />} />

            {/* Explainer & How It Works Routes */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/welcome" element={<FirstTimeOnboardingPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>

        {/* Professional Enterprise Footer */}
        <Footer />
      </Box>
    </CustomerActiveJobGuard>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showFirstTimeLangModal, setShowFirstTimeLangModal] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#FFFFFF' });
      } catch (e) {
        console.warn('StatusBar init error:', e);
      }
    }
  }, []);

  useEffect(() => {
    // When splash finishes, check if user has chosen their preferred language yet
    if (!showSplash) {
      const hasChosen = localStorage.getItem('shazuone_lang_chosen');
      if (!hasChosen) {
        const timer = setTimeout(() => {
          setShowFirstTimeLangModal(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [showSplash]);

  const walletBalance = user?.walletBalance ?? 150;

  return (
    <>
      {/* Animated App Open Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <BrowserRouter>
        <NotificationPermissionBanner />
        <HeadsUpNotificationBanner />
        <GlobalNotificationWatcher />
        <MainLayout
          walletBalance={walletBalance}
          currentBooking={currentBooking}
          setCurrentBooking={setCurrentBooking}
        />

        {/* First-time Language Choice Modal */}
        <LanguageSelectorModal
          open={showFirstTimeLangModal}
          onClose={() => setShowFirstTimeLangModal(false)}
          isFirstTime
        />

      {/* PWA Floating Install Prompt */}
      <PwaInstallPrompt />

      {/* Global React Hot Toast Notifier - Single-Line Clean Bottom-Left Toast */}
      <Toaster
        position="bottom-left"
        containerStyle={{
          bottom: 20,
          left: 20,
        }}
        toastOptions={{
          duration: 3200,
          style: {
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '8px 18px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.22)',
            border: '1px solid #334155',
            maxWidth: 'min(580px, calc(100vw - 36px))',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            lineHeight: 1.4,
            letterSpacing: '0.1px'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CriticalWorkProvider>
        <AppContent />
      </CriticalWorkProvider>
    </AuthProvider>
  );
}

