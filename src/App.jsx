import { API_V1_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';
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

// Partner Pages
import PartnerOnboardingPage from './pages/partner/PartnerOnboardingPage';
import PartnerDutyPage from './pages/partner/PartnerDutyPage';
import PartnerQuoteBuilderPage from './pages/partner/PartnerQuoteBuilderPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminTraceabilityPage from './pages/admin/AdminTraceabilityPage';
import AdminSettlementsPage from './pages/admin/AdminSettlementsPage';

import { useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/auth/AuthPage';
import { Toaster } from 'react-hot-toast';
import GlobalNotificationWatcher from './components/GlobalNotificationWatcher';
import SplashScreen from './components/SplashScreen';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function CustomerActiveJobGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only guard customer browsing routes
    const isCustomerRoute = !location.pathname.startsWith('/partner') && !location.pathname.startsWith('/admin');
    const isWorkStep = ['/matching', '/track', '/quote', '/checkout', '/rate'].some(p => location.pathname.startsWith(p));
    const isLegalPage = ['/terms', '/privacy', '/refund-policy', '/refunds', '/how-it-works'].some(p => location.pathname.startsWith(p));
    
    if (!isCustomerRoute || isWorkStep || isLegalPage) return;

    const activeBookingId = localStorage.getItem('salemseva_active_booking');
    if (!activeBookingId) return;

    let isMounted = true;
    fetch(`${API_V1_URL}/bookings/${activeBookingId}/track`)
      .then(r => r.json())
      .then(d => {
        if (!isMounted) return;
        if (!d.success || !d.booking) {
          // Booking was truncated or no longer exists in DB - clean up localStorage
          localStorage.removeItem('salemseva_active_booking');
          localStorage.removeItem('salemseva_partner_active_job');
          localStorage.removeItem('salemseva_partner_step');
          return;
        }

        const status = d.booking.status;
        const isRated = localStorage.getItem(`salemseva_rated_${activeBookingId}`);

        if (status === 'completed' && isRated) {
          localStorage.removeItem('salemseva_active_booking');
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

function InitialHomeRoute() {
  const { user, isGuest } = useAuth();
  const hasSeen = localStorage.getItem('salemseva_has_seen_onboarding');
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isFullScreenPage = isAuthPage || location.pathname === '/how-it-works' || location.pathname === '/welcome';

  return (
    <CustomerActiveJobGuard>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        {/* Production Top Navbar - hidden on full-screen auth / how-it-works / welcome pages */}
        {!isFullScreenPage && <Navbar walletBalance={walletBalance} />}

        {/* Real Production URL Routes */}
        <Box sx={{ 
          flex: 1, 
          pt: isFullScreenPage ? 0 : { xs: 'calc(68px + env(safe-area-inset-top, 0px))', md: 'calc(88px + env(safe-area-inset-top, 0px))' },
          pb: isFullScreenPage ? 0 : 'calc(74px + env(safe-area-inset-bottom, 16px))'
        }}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/onboarding" element={<CustomerOnboardingPage onLoginSuccess={(u) => console.log('Logged in:', u)} />} />
            <Route path="/" element={<InitialHomeRoute />} />
            <Route path="/book/:serviceId" element={<ServiceDetailPage onStartBooking={(b) => setCurrentBooking(b)} />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/tracking" element={<Navigate to="/track" replace />} />
            <Route path="/quote" element={<QuoteReviewPage />} />
            <Route path="/checkout" element={<CheckoutPage walletBalance={walletBalance} />} />
            <Route path="/rate" element={<RatingEscalationPage />} />
            <Route path="/wallet" element={<WalletHubPage walletBalance={walletBalance} />} />
            <Route path="/history" element={<BookingHistoryPage />} />

            {/* Partner Routes */}
            <Route path="/partner/onboarding" element={<PartnerOnboardingPage />} />
            <Route path="/partner" element={<PartnerDutyPage />} />
            <Route path="/partner/quote-builder" element={<PartnerQuoteBuilderPage />} />

            {/* Admin Desk Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/traceability" element={<AdminTraceabilityPage />} />
            <Route path="/admin/settlements" element={<AdminSettlementsPage />} />
            <Route path="/admin/financials" element={<AdminSettlementsPage />} />

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
      const hasChosen = localStorage.getItem('salemseva_lang_chosen');
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

      {/* Global React Hot Toast Notifier */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            marginTop: 'calc(10px + env(safe-area-inset-top, 0px))',
            border: '1px solid #334155'
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
      <AppContent />
    </AuthProvider>
  );
}

