import { API_V1_URL } from './config';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerTabBar from './components/customer/CustomerTabBar';

// Customer & Global Action Pages (Migrated from Modals)
const LanguageSelectionPage = lazy(() => import('./pages/customer/LanguageSelectionPage'));
const FeedbackPage = lazy(() => import('./pages/customer/FeedbackPage'));
const SupportHubPage = lazy(() => import('./pages/customer/SupportHubPage'));
const LocationPickerPage = lazy(() => import('./pages/customer/LocationPickerPage'));
const BookingReceiptPage = lazy(() => import('./pages/customer/BookingReceiptPage'));
const BookingAddressPage = lazy(() => import('./pages/customer/BookingAddressPage'));
const AdvancePaymentPage = lazy(() => import('./pages/customer/AdvancePaymentPage'));

// Partner Action Pages (Migrated from Modals)
const PartnerSettlementSlipPage = lazy(() => import('./pages/partner/PartnerSettlementSlipPage'));
const PartnerProfilePage = lazy(() => import('./pages/partner/PartnerProfilePage'));
const PartnerJobReschedulePage = lazy(() => import('./pages/partner/PartnerJobReschedulePage'));

// Admin Action Pages (Migrated from Modals)
const AdminPaymentOverridePage = lazy(() => import('./pages/admin/AdminPaymentOverridePage'));
const AdminLiveTrackingPage = lazy(() => import('./pages/admin/AdminLiveTrackingPage'));
const AdminDispatchPage = lazy(() => import('./pages/admin/AdminDispatchPage'));
const AdminOrderCancelPage = lazy(() => import('./pages/admin/AdminOrderCancelPage'));
const AdminCouponEditorPage = lazy(() => import('./pages/admin/AdminCouponEditorPage'));
const AdminServiceEditorPage = lazy(() => import('./pages/admin/AdminServiceEditorPage'));
const AdminStaffEditorPage = lazy(() => import('./pages/admin/AdminStaffEditorPage'));
const DocumentViewerPage = lazy(() => import('./pages/admin/DocumentViewerPage'));
const AuthHelpPage = lazy(() => import('./pages/auth/AuthHelpPage'));

// Customer Pages
const CustomerHomePage = lazy(() => import('./pages/customer/CustomerHomePage'));
const ServiceDetailPage = lazy(() => import('./pages/customer/ServiceDetailPage'));
const MatchingPage = lazy(() => import('./pages/customer/MatchingPage'));
const TrackingPage = lazy(() => import('./pages/customer/TrackingPage'));
const QuoteReviewPage = lazy(() => import('./pages/customer/QuoteReviewPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const RatingEscalationPage = lazy(() => import('./pages/customer/RatingEscalationPage'));
const WalletHubPage = lazy(() => import('./pages/customer/WalletHubPage'));
const BookingHistoryPage = lazy(() => import('./pages/customer/BookingHistoryPage'));
const CustomerProfilePage = lazy(() => import('./pages/customer/CustomerProfilePage'));

// Legal & Compliance Pages
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage'));
const HowItWorksPage = lazy(() => import('./pages/customer/HowItWorksPage'));
const FirstTimeOnboardingPage = lazy(() => import('./pages/customer/FirstTimeOnboardingPage'));
const BookingChatPage = lazy(() => import('./pages/customer/BookingChatPage'));
const BookingCancelPage = lazy(() => import('./pages/customer/BookingCancelPage'));
const BookingReschedulePage = lazy(() => import('./pages/customer/BookingReschedulePage'));

// Partner Pages
const PartnerDutyPage = lazy(() => import('./pages/partner/PartnerDutyPage'));
const PartnerQuoteBuilderPage = lazy(() => import('./pages/partner/PartnerQuoteBuilderPage'));
const PartnerLoginPage = lazy(() => import('./pages/partner/PartnerLoginPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminTraceabilityPage = lazy(() => import('./pages/admin/AdminTraceabilityPage'));
const AdminSettlementsPage = lazy(() => import('./pages/admin/AdminSettlementsPage'));
const AdminTechnicianDossierPage = lazy(() => import('./pages/admin/AdminTechnicianDossierPage'));
const AdminCustomerDossierPage = lazy(() => import('./pages/admin/AdminCustomerDossierPage'));
const AdminOtpLoginView = lazy(() => import('./components/admin/AdminOtpLoginView'));

import { useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CriticalWorkProvider } from './context/CriticalWorkContext';
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
import { Toaster } from 'react-hot-toast';
import GlobalNotificationWatcher from './components/GlobalNotificationWatcher';
import HeadsUpNotificationBanner from './components/HeadsUpNotificationBanner';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';
import SplashScreen from './components/SplashScreen';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// ── Phase 4: One-time localStorage key migration Shazu One → Shazu One ───────
// Runs once per device. Migrates all Shazu One_ prefixed keys to shazuone_
// so existing users do not lose their saved sessions or state.
(function migrateLocalStorageKeys() {
  try {
    if (localStorage.getItem('__shazuone_migrated__')) return;
    const OLD_PREFIX = 'Shazu One_';
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

    // Only guard customer browsing routes (home, service catalog exploration)
    const isCustomerRoute = !location.pathname.startsWith('/partner') && !location.pathname.startsWith('/admin');

    // Explicit list of all active-job flow screens, masked chat, booking management & utility pages
    const isExemptRoute = [
      '/matching',
      '/track',
      '/tracking',
      '/quote',
      '/checkout',
      '/rate',
      '/chat',
      '/booking',
      '/history',
      '/wallet',
      '/terms',
      '/privacy',
      '/refund-policy',
      '/refunds',
      '/how-it-works',
      '/welcome',
      '/login',
      '/register',
      '/language',
      '/feedback',
      '/support',
      '/location',
      '/receipt',
      '/partner',
      '/admin'
    ].some(p => location.pathname.startsWith(p));

    if (!isCustomerRoute || isExemptRoute) return;

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
        if (['matching', 'accepted', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(status)) {
          let target = `/track?bookingId=${activeBookingId}`;
          if (status === 'quote_presented') target = `/quote?bookingId=${activeBookingId}`;
          else if (status === 'completed') target = `/rate?bookingId=${activeBookingId}`;

          navigate(target, { replace: true });
        } else if (status === 'created' || status === 'cancelled') {
          // Unconfirmed or cancelled booking: never force user onto live tracking
          localStorage.removeItem('shazuone_active_booking');
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

// Strict Admin Route Guard: Requires verified Brevo Email OTP administrative session
function AdminRouteGuard({ children }) {
  const { isAdminAuthenticated } = useAuth();

  if (!isAdminAuthenticated) {
    return <AdminOtpLoginView />;
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

  const hasChosenLang = localStorage.getItem('shazuone_lang_chosen');
  if (!hasChosenLang && !user) {
    return <Navigate to="/language?firstTime=true" replace />;
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

  // Automatically reset scroll position to top on every route navigation
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/partner/login' || location.pathname === '/technician/login';
  const isFullScreenPage =
    isAuthPage ||
    location.pathname === '/how-it-works' ||
    location.pathname === '/welcome' ||
    location.pathname === '/language' ||
    location.pathname === '/feedback' ||
    location.pathname === '/support' ||
    location.pathname === '/location' ||
    location.pathname.startsWith('/receipt/') ||
    location.pathname.startsWith('/chat/') ||
    location.pathname.startsWith('/booking/') ||
    location.pathname.startsWith('/partner/settlements/') ||
    location.pathname === '/partner/profile' ||
    location.pathname.startsWith('/partner/duty/reschedule/') ||
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login/help' ||
    location.pathname === '/auth/help';

  // Focused flows keep their own sticky CTA at the bottom, so a second bar would compete
  // with it. Live tracking keeps the tab bar: the customer still needs a way to reach the
  // wallet or support while a job is running. Partner and admin surfaces are desktop
  // workstations and have their own shells.
  const isFocusedFlow = ['/matching', '/quote', '/checkout', '/rate', '/onboarding']
    .some((path) => location.pathname === path) || location.pathname.startsWith('/book/');
  const showTabBar = !isFullScreenPage &&
    !isFocusedFlow &&
    !location.pathname.startsWith('/partner') &&
    !location.pathname.startsWith('/admin');

  return (
    <CustomerActiveJobGuard>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        <a className="cz-skip-link" href="#main-content">Skip to content</a>
        {/* Production Top Navbar - hidden on full-screen auth / how-it-works / welcome pages */}
        {!isFullScreenPage && <Navbar walletBalance={walletBalance} />}

        {/* Real Production URL Routes */}
        <Box
          id="main-content"
          component="main"
          sx={{
            flex: 1,
            pt: isFullScreenPage ? 0 : { xs: 'calc(52px + var(--sat))', lg: 'calc(72px + var(--sat))' },
            scrollMarginTop: 'calc(84px + var(--sat))'
          }}
        >
          <Suspense fallback={<Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={28} /></Box>}>
          <Routes>
            {/* Dedicated Action Pages (Migrated from Modals) */}
            <Route path="/language" element={<LanguageSelectionPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/support" element={<SupportHubPage />} />
            {/* Ask AI in development: redirecting to support hub */}
            <Route path="/ask-ai" element={<Navigate to="/support" replace />} />
            <Route path="/support/ai" element={<Navigate to="/support" replace />} />
            <Route path="/location" element={<LocationPickerPage />} />
            <Route path="/receipt/:bookingId" element={<BookingReceiptPage />} />
            <Route path="/booking/address" element={<BookingAddressPage />} />
            <Route path="/booking/pay-advance" element={<CustomerRouteGuard><AdvancePaymentPage /></CustomerRouteGuard>} />
            <Route path="/chat/:bookingId" element={<BookingChatPage />} />
            <Route path="/booking/:bookingId/cancel" element={<BookingCancelPage />} />
            <Route path="/booking/:bookingId/reschedule" element={<BookingReschedulePage />} />

            {/* Partner Dedicated Action Pages */}
            <Route path="/partner/settlements/:bookingId" element={<PartnerSettlementSlipPage />} />
            <Route path="/partner/profile" element={<PartnerProfilePage />} />
            <Route path="/partner/duty/reschedule/:bookingId" element={<PartnerJobReschedulePage />} />

            {/* Admin Dedicated Action Pages */}
            <Route path="/admin/settlements/:bookingId/override" element={<AdminRouteGuard><AdminPaymentOverridePage /></AdminRouteGuard>} />
            <Route path="/admin/jobs/:bookingId/live-track" element={<AdminRouteGuard><AdminLiveTrackingPage /></AdminRouteGuard>} />
            <Route path="/admin/dispatch/:bookingId" element={<AdminRouteGuard><AdminDispatchPage /></AdminRouteGuard>} />
            <Route path="/admin/orders/:bookingId/cancel" element={<AdminRouteGuard><AdminOrderCancelPage /></AdminRouteGuard>} />
            <Route path="/admin/coupons/new" element={<AdminRouteGuard><AdminCouponEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/coupons/:code/edit" element={<AdminRouteGuard><AdminCouponEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/services/new" element={<AdminRouteGuard><AdminServiceEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/services/:id/edit" element={<AdminRouteGuard><AdminServiceEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/team/new" element={<AdminRouteGuard><AdminStaffEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/team/:id/edit" element={<AdminRouteGuard><AdminStaffEditorPage /></AdminRouteGuard>} />
            <Route path="/admin/documents/preview" element={<AdminRouteGuard><DocumentViewerPage /></AdminRouteGuard>} />
            <Route path="/login/help" element={<AuthHelpPage />} />
            <Route path="/auth/help" element={<Navigate to="/login/help" replace />} />

            {/* Customer Routes - Blocked for authenticated technicians */}
            <Route path="/onboarding" element={<CustomerRouteGuard><Navigate to="/register?role=customer" replace /></CustomerRouteGuard>} />
            <Route path="/" element={<CustomerRouteGuard><InitialHomeRoute /></CustomerRouteGuard>} />
            <Route path="/book/:serviceId" element={<CustomerRouteGuard><ServiceDetailPage onStartBooking={(b) => setCurrentBooking(b)} /></CustomerRouteGuard>} />
            <Route path="/matching" element={<CustomerRouteGuard><MatchingPage /></CustomerRouteGuard>} />
            <Route path="/track" element={<CustomerRouteGuard><TrackingPage /></CustomerRouteGuard>} />
            <Route path="/tracking" element={<Navigate to="/track" replace />} />
            <Route path="/quote" element={<CustomerRouteGuard><QuoteReviewPage /></CustomerRouteGuard>} />
            <Route path="/checkout" element={<CustomerRouteGuard><CheckoutPage walletBalance={walletBalance} /></CustomerRouteGuard>} />
            <Route path="/rate" element={<CustomerRouteGuard><RatingEscalationPage /></CustomerRouteGuard>} />
            <Route path="/wallet" element={<CustomerRouteGuard><WalletHubPage walletBalance={walletBalance} /></CustomerRouteGuard>} />
            <Route path="/coupons" element={<CustomerRouteGuard><WalletHubPage walletBalance={walletBalance} /></CustomerRouteGuard>} />
            <Route path="/history" element={<CustomerRouteGuard><BookingHistoryPage /></CustomerRouteGuard>} />
            <Route path="/profile" element={<CustomerRouteGuard><CustomerProfilePage /></CustomerRouteGuard>} />
            <Route path="/customer/profile" element={<Navigate to="/profile" replace />} />

            {/* Partner Routes */}
            <Route path="/partner/login" element={<PartnerLoginPage />} />
            <Route path="/technician/login" element={<Navigate to="/partner/login" replace />} />
            <Route path="/partner/onboarding" element={<Navigate to="/register?role=partner" replace />} />
            <Route path="/partner" element={<PartnerDutyPage />} />
            <Route path="/partner/duty" element={<PartnerDutyPage />} />
            <Route path="/partner/quote-builder" element={<PartnerQuoteBuilderPage />} />

            {/* Admin Desk Routes */}
            <Route path="/admin" element={<AdminRouteGuard><AdminDashboardPage /></AdminRouteGuard>} />
            <Route path="/admin/traceability" element={<AdminRouteGuard><AdminTraceabilityPage /></AdminRouteGuard>} />
            <Route path="/admin/settlements" element={<AdminRouteGuard><AdminSettlementsPage /></AdminRouteGuard>} />
            <Route path="/admin/financials" element={<AdminRouteGuard><AdminSettlementsPage /></AdminRouteGuard>} />
            <Route path="/admin/technicians/:id" element={<AdminRouteGuard><AdminTechnicianDossierPage /></AdminRouteGuard>} />
            <Route path="/admin/customers/:phone" element={<AdminRouteGuard><AdminCustomerDossierPage /></AdminRouteGuard>} />

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
          </Suspense>
        </Box>

        {/* Professional Enterprise Footer */}
        <Footer />

        {/* The tab bar is fixed, so the page needs a spacer of its own height to scroll past it */}
        {showTabBar && (
          <Box
            aria-hidden="true"
            sx={{ height: 'var(--cz-tabbar-space)', display: { xs: 'block', md: 'none' } }}
          />
        )}
        {showTabBar && <CustomerTabBar />}
      </Box>
    </CustomerActiveJobGuard>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

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

