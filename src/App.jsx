import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';

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
import AuthModal from './components/AuthModal';
import GlobalNotificationWatcher from './components/GlobalNotificationWatcher';
import SplashScreen from './components/SplashScreen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function CustomerActiveJobGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only guard customer browsing routes
    const isCustomerRoute = !location.pathname.startsWith('/partner') && !location.pathname.startsWith('/admin');
    const isWorkStep = ['/matching', '/track', '/quote', '/checkout', '/rate'].some(p => location.pathname.startsWith(p));
    
    if (!isCustomerRoute || isWorkStep) return;

    const activeBookingId = localStorage.getItem('salemseva_active_booking');
    if (!activeBookingId) return;

    let isMounted = true;
    fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/track`)
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

        if (['matching', 'accepted', 'en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'completed'].includes(status)) {
          let target = `/track?bookingId=${activeBookingId}`;
          if (status === 'matching') target = `/matching?bookingId=${activeBookingId}`;
          else if (status === 'quote_presented') target = `/quote?bookingId=${activeBookingId}`;
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
        <GlobalNotificationWatcher />
        <CustomerActiveJobGuard>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
            
            {/* Production Top Navbar */}
            <Navbar 
              walletBalance={walletBalance} 
            />

          {/* Real Production URL Routes */}
          <Box sx={{ 
            flex: 1, 
            pt: { xs: 'calc(58px + env(safe-area-inset-top, 0px))', md: 'calc(68px + env(safe-area-inset-top, 0px))' },
            pb: 'calc(74px + env(safe-area-inset-bottom, 16px))'
          }}>
            <Routes>
              {/* Customer Routes */}
              <Route path="/onboarding" element={<CustomerOnboardingPage onLoginSuccess={(u) => console.log('Logged in:', u)} />} />
              <Route path="/" element={<CustomerHomePage />} />
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

          {/* Global Platform Auth Modal (Initial login & role gateway) */}
          <AuthModal />

        </Box>
      </CustomerActiveJobGuard>
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

