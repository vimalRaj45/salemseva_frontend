import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Paper
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('salemseva_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Could not parse saved user:', e);
      return null;
    }
  });

  const [dbTechnicians, setDbTechnicians] = useState([]);
  const [dbCustomers, setDbCustomers] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('customer'); // 'customer' | 'technician' | 'admin'
  const [sessionTerminatedModalOpen, setSessionTerminatedModalOpen] = useState(false);

  const sessionTokenRef = useRef(localStorage.getItem('salemseva_session_token') || '');

  // Register session with backend
  const registerSessionWithBackend = async (phone, role, name, trade) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, name, trade })
      });
      const data = await res.json();
      if (data.success && data.sessionToken) {
        sessionTokenRef.current = data.sessionToken;
        localStorage.setItem('salemseva_session_token', data.sessionToken);
      }
    } catch (err) {
      console.warn('Session registration note:', err);
    }
  };

  // Concurrent Session Heartbeat Poller: Detect if logged in on another device
  useEffect(() => {
    if (!user || !user.phone) return;

    let isMounted = true;
    const checkSession = async () => {
      try {
        const token = sessionTokenRef.current || localStorage.getItem('salemseva_session_token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/v1/auth/session/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: user.phone,
            sessionToken: token,
            role: user.role
          })
        });
        const data = await res.json();

        if (isMounted && data.code === 'SESSION_TERMINATED') {
          // Logged out because account logged in on another device!
          setUser(null);
          localStorage.removeItem('salemseva_user');
          localStorage.removeItem('salemseva_session_token');
          sessionTokenRef.current = '';
          setSessionTerminatedModalOpen(true);
        }
      } catch (e) {}
    };

    const interval = setInterval(checkSession, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Fetch live technicians list from Neon PostgreSQL DB
  useEffect(() => {
    async function loadDbTechnicians() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/technicians`);
        const data = await res.json();
        if (data.success && data.technicians && data.technicians.length > 0) {
          const mapped = data.technicians.map(t => {
            const tradeNames = {
              ac: 'AC Master Specialist',
              electrician: 'Senior Certified Electrician',
              plumber: 'Master Sanitary & Motor Plumber',
              cleaning: 'Deep Home Sanitization Lead'
            };
            return {
              id: t.id,
              role: 'technician',
              name: t.full_name || t.name,
              phone: t.phone,
              rawPhone: (t.phone || '').replace(/[\s\-]/g, ''),
              email: t.email || `${(t.full_name || t.name || 'tech').toLowerCase().replace(/[^a-z]/g, '')}@salemseva.in`,
              trade: t.primary_trade || t.trade,
              tradeName: tradeNames[t.primary_trade || t.trade] || 'Certified Trade Specialist',
              experienceYears: t.years_experience || t.experienceYears || 5,
              status: t.is_kyc_verified ? 'Verified' : 'Pending Verification',
              isKycVerified: Boolean(t.is_kyc_verified),
              isOnline: Boolean(t.is_online),
              ratingAvg: parseFloat(t.rating_avg || t.ratingAvg || 4.9),
              ratingCount: t.rating_count || t.ratingCount || 100,
              jobsCompleted: t.jobs_completed_count || t.jobsCompleted || 300,
              todayEarnings: 1450,
              starTier: t.star_tier || t.starTier || 'Gold Partner (Salem)',
              serviceArea: (t.assigned_localities && t.assigned_localities[0]) ? `${t.assigned_localities[0]}, Salem` : 'Fairlands, Salem',
              assignedLocalities: t.assigned_localities || ['Fairlands', 'Hasthampatti']
            };
          });
          setDbTechnicians(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch technicians from DB:', err);
      }
    }
    loadDbTechnicians();
  }, []);

  // Fetch live customers list from Neon PostgreSQL DB
  useEffect(() => {
    async function loadDbCustomers() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/customers`);
        const data = await res.json();
        if (data.success && data.customers && data.customers.length > 0) {
          const mapped = data.customers.map(c => ({
            id: c.id,
            role: 'customer',
            name: c.name || c.full_name,
            phone: c.phone,
            rawPhone: (c.phone || '').replace(/[\s\-]/g, ''),
            email: c.email || `${(c.name || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '')}@salemseva.in`,
            locality: c.locality || 'Fairlands, Salem',
            address: c.address || `${c.locality || 'Fairlands'}, Salem`,
            walletBalance: parseFloat(c.walletBalance || c.wallet_balance || 0),
            firstTimeUser: false,
            referralCodeUsed: c.referralCodeUsed || c.referral_code,
            isVerified: true
          }));
          setDbCustomers(mapped);

          setUser(prev => {
            if (prev && prev.role === 'customer') {
              const matched = mapped.find(c => c.id === prev.id || c.phone === prev.phone || c.rawPhone === prev.rawPhone);
              if (matched) {
                const updated = { ...prev, ...matched };
                localStorage.setItem('salemseva_user', JSON.stringify(updated));
                return updated;
              }
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Could not fetch customers from DB:', err);
      }
    }
    loadDbCustomers();
  }, []);

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const openAuth = (initialTab = 'customer') => {
    setAuthInitialTab(initialTab);
    setAuthModalOpen(true);
  };

  const loginWithPhonePassword = async (phone, password, role = 'customer') => {
    let loggedUser = null;
    const cleanPhone = phone.replace(/[\s\-]/g, '');

    if (role === 'customer') {
      const matched = dbCustomers.find(c => c.rawPhone === cleanPhone || c.phone === phone);
      loggedUser = matched || {
        id: `usr-cust-${Date.now()}`,
        role: 'customer',
        name: 'Salem Customer',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        email: 'customer@salemseva.in',
        locality: 'Fairlands, Salem',
        address: 'Fairlands, Salem - 636016',
        walletBalance: 150,
        isVerified: true
      };
    } else if (role === 'technician') {
      const matched = dbTechnicians.find(t => t.rawPhone === cleanPhone || t.phone === phone);
      loggedUser = matched || (dbTechnicians[0] || {
        id: 'tech-default',
        role: 'technician',
        name: 'Salem Technician',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        trade: 'ac',
        isKycVerified: true,
        isOnline: true
      });
    } else if (role === 'admin') {
      loggedUser = {
        id: 'adm-ops-001',
        role: 'admin',
        name: 'Salem Ops Central Admin',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        email: 'ops.admin@salemseva.in',
        designation: 'Operations Command Hub Lead',
        locality: 'Central HQ, Salem',
        isVerified: true
      };
    }

    setUser(loggedUser);
    localStorage.setItem('salemseva_user', JSON.stringify(loggedUser));
    setAuthModalOpen(false);

    // Register active session token on backend to enforce single-device login
    await registerSessionWithBackend(loggedUser.phone, role, loggedUser.name, loggedUser.trade);

    return loggedUser;
  };

  const signupCustomer = async ({ name, phone, password, address, locality, referralCode }) => {
    const hasReferral = referralCode && referralCode.trim().length > 0;
    const newUser = {
      id: `usr-cust-${Date.now()}`,
      role: 'customer',
      name: name || 'Salem Resident',
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      email: `${(name || 'user').toLowerCase().replace(/\s+/g, '')}@salemseva.in`,
      locality: locality || 'Fairlands, Salem',
      address: address || 'Fairlands Main Road, Salem - 636016',
      walletBalance: hasReferral ? 100 : 0,
      firstTimeUser: true,
      referralCodeUsed: hasReferral ? referralCode.toUpperCase() : null,
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    localStorage.setItem('salemseva_user', JSON.stringify(newUser));
    setAuthModalOpen(false);
    await registerSessionWithBackend(newUser.phone, 'customer', newUser.name);
    return newUser;
  };

  const signupTechnician = async ({ name, phone, password, trade, aadhaar, serviceArea }) => {
    const tradeNames = {
      ac: 'AC Repair & Cooling Expert',
      electrician: 'Electrician & Wiring Specialist',
      plumber: 'Plumbing & Drainage Specialist',
      cleaning: 'Home & Bathroom Cleaning Pro'
    };

    const newTech = {
      id: `tech-${Date.now()}`,
      role: 'technician',
      name: name || 'Salem Technician',
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      email: `${(name || 'tech').toLowerCase().replace(/\s+/g, '')}@salemseva.in`,
      trade: trade || 'ac',
      tradeName: tradeNames[trade] || 'Home Services Expert',
      experienceYears: 3,
      aadhaarNumber: aadhaar || 'XXXX-XXXX-1234',
      status: 'Pending Verification',
      isKycVerified: false,
      isOnline: false,
      ratingAvg: 5.0,
      ratingCount: 0,
      jobsCompleted: 0,
      todayEarnings: 0,
      serviceArea: serviceArea || 'Fairlands, Salem',
      assignedLocalities: [serviceArea || 'Fairlands', 'Hasthampatti'],
      createdAt: new Date().toISOString()
    };

    setUser(newTech);
    localStorage.setItem('salemseva_user', JSON.stringify(newTech));
    setAuthModalOpen(false);
    await registerSessionWithBackend(newTech.phone, 'technician', newTech.name, newTech.trade);
    return newTech;
  };

  const loginAsPreset = async (presetKey) => {
    let preset = null;
    if (presetKey === 'customer') {
      preset = dbCustomers[0] || {
        id: 'c0000000-0000-0000-0000-000000000001',
        role: 'customer',
        name: 'Vimal Raj',
        phone: '+91 98427 11234',
        rawPhone: '+919842711234',
        locality: 'Fairlands, Salem',
        address: '14/2, 5th Cross, Fairlands, Salem - 636016',
        walletBalance: 150,
        isVerified: true
      };
    } else if (presetKey === 'technicianVerified' || presetKey === 'technician') {
      preset = dbTechnicians[0] || {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        role: 'technician',
        name: 'K. Ramesh',
        phone: '+91 94432 88901',
        trade: 'ac',
        isKycVerified: true,
        isOnline: true,
        ratingAvg: 4.95,
        ratingCount: 142,
        jobsCompleted: 389,
        todayEarnings: 1450,
        serviceArea: 'Fairlands, Salem'
      };
    } else if (presetKey === 'admin') {
      preset = {
        id: 'adm-ops-001',
        role: 'admin',
        name: 'Salem Central Ops Admin',
        phone: '+91 98420 99999',
        email: 'ops.admin@salemseva.in',
        designation: 'Operations Command Hub Lead',
        locality: 'Central HQ, Salem',
        isVerified: true
      };
    }

    setUser(preset);
    localStorage.setItem('salemseva_user', JSON.stringify(preset));
    setAuthModalOpen(false);

    if (preset && preset.phone) {
      await registerSessionWithBackend(preset.phone, preset.role || 'customer', preset.name, preset.trade);
    }
  };

  const loginAsCustomer = (customerData) => {
    const cust = customerData || dbCustomers[0] || {
      id: 'usr-cust-01',
      role: 'customer',
      name: 'Vimal Raj',
      phone: '+91 98427 11234',
      locality: 'Fairlands, Salem',
      address: 'Fairlands, Salem - 636016',
      walletBalance: 150,
      isVerified: true
    };
    setUser(cust);
    localStorage.setItem('salemseva_user', JSON.stringify(cust));
    setAuthModalOpen(false);
    registerSessionWithBackend(cust.phone, 'customer', cust.name);
  };

  const loginAsTechnician = (technicianData) => {
    const tech = technicianData || dbTechnicians[0] || {
      id: 'tech-01',
      role: 'technician',
      name: 'K. Ramesh',
      phone: '+91 94432 88901',
      trade: 'ac',
      isKycVerified: true,
      isOnline: true
    };
    setUser(tech);
    localStorage.setItem('salemseva_user', JSON.stringify(tech));
    setAuthModalOpen(false);
    registerSessionWithBackend(tech.phone, 'technician', tech.name, tech.trade);
  };

  const loginAsAdmin = () => {
    const admin = {
      id: 'adm-ops-001',
      role: 'admin',
      name: 'Salem Central Ops Admin',
      phone: '+91 98420 99999',
      email: 'ops.admin@salemseva.in',
      designation: 'Operations Command Hub Lead',
      locality: 'Central HQ, Salem',
      isVerified: true
    };
    setUser(admin);
    localStorage.setItem('salemseva_user', JSON.stringify(admin));
    setAuthModalOpen(false);
  };

  const switchRole = (newRole) => {
    if (newRole === 'customer') {
      loginAsCustomer();
    } else if (newRole === 'technician') {
      loginAsTechnician();
    } else if (newRole === 'admin') {
      loginAsAdmin();
    }
  };

  const updateUser = (fields) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem('salemseva_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      if (user && user.phone) {
        fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone })
        }).catch(() => {});
      }
    } catch (e) {}

    setUser(null);
    localStorage.removeItem('salemseva_user');
    localStorage.removeItem('salemseva_session_token');
    sessionTokenRef.current = '';
  };

  // Wallet & Incentives state management
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('salemseva_wallet_balance');
    return saved ? parseFloat(saved) : (user?.walletBalance ?? 150);
  });

  const [partnerIncentives, setPartnerIncentives] = useState(() => {
    const saved = localStorage.getItem('salemseva_partner_incentives');
    return saved ? JSON.parse(saved) : {
      totalIncentiveEarned: 750,
      availablePayout: 500,
      settledPayout: 250,
      starPoints: 24,
      totalReferralsCount: 3,
      zeroCommUnlocked: false
    };
  });

  const updateWalletBalance = (newBal) => {
    const val = Math.max(0, parseFloat(newBal) || 0);
    setWalletBalance(val);
    localStorage.setItem('salemseva_wallet_balance', val.toString());
    if (user) {
      updateUser({ walletBalance: val });
    }
  };

  const creditWallet = async (amount, title = '+50 Seva Credits Reward', description = 'Credits added to your SalemSeva wallet', category = 'REWARD') => {
    const creditAmt = parseFloat(amount) || 50;
    const updated = walletBalance + creditAmt;
    updateWalletBalance(updated);

    try {
      await fetch(`${API_BASE_URL}/api/v1/wallet/customer/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '+91 98427 11234',
          amount: creditAmt,
          title,
          description,
          category
        })
      });
    } catch (e) {}
    return updated;
  };

  const debitWallet = async (amount, bookingId = 'SLM-84920') => {
    const debitAmt = parseFloat(amount) || 100;
    const actualDebit = Math.min(walletBalance, debitAmt);
    const updated = Math.max(0, walletBalance - actualDebit);
    updateWalletBalance(updated);

    try {
      await fetch(`${API_BASE_URL}/api/v1/wallet/customer/debit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '+91 98427 11234',
          amount: actualDebit,
          bookingId
        })
      });
    } catch (e) {}
    return actualDebit;
  };

  const simulateCustomerReferral = async (friendName = 'Kavitha S.', locality = 'Meyyanur, Salem') => {
    const updated = walletBalance + 100;
    updateWalletBalance(updated);

    try {
      await fetch(`${API_BASE_URL}/api/v1/wallet/customer/simulate-referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName,
          locality,
          phone: user?.phone || '+91 98427 11234'
        })
      });
    } catch (e) {}
    return updated;
  };

  const referTechnician = async ({ name, phone, trade, locality }) => {
    const incentiveAmount = 250;
    const newStarPoints = Math.min(30, (partnerIncentives.starPoints || 24) + 3);
    const newTotal = (partnerIncentives.totalIncentiveEarned || 750) + incentiveAmount;
    const newAvailable = (partnerIncentives.availablePayout || 500) + incentiveAmount;
    const isZeroComm = newStarPoints >= 30;

    const updated = {
      ...partnerIncentives,
      totalIncentiveEarned: newTotal,
      availablePayout: newAvailable,
      starPoints: newStarPoints,
      zeroCommUnlocked: isZeroComm
    };

    setPartnerIncentives(updated);
    localStorage.setItem('salemseva_partner_incentives', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE_URL}/api/v1/partner/refer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerPhone: user?.phone || '+919443288901',
          referredName: name,
          referredPhone: phone,
          referredTrade: trade,
          referredLocality: locality
        })
      });
    } catch (e) {}

    return updated;
  };

  const claimPartnerPayout = async (upiId = 'partner.pay@okaxis') => {
    const payoutAmount = partnerIncentives.availablePayout || 0;
    if (payoutAmount <= 0) return partnerIncentives;

    const updated = {
      ...partnerIncentives,
      settledPayout: (partnerIncentives.settledPayout || 250) + payoutAmount,
      availablePayout: 0
    };

    setPartnerIncentives(updated);
    localStorage.setItem('salemseva_partner_incentives', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE_URL}/api/v1/partner/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '+919443288901',
          upiId
        })
      });
    } catch (e) {}

    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        walletBalance,
        updateWalletBalance,
        creditWallet,
        debitWallet,
        simulateCustomerReferral,
        partnerIncentives,
        referTechnician,
        claimPartnerPayout,
        authModalOpen,
        authInitialTab,
        openAuthModal: openAuth,
        closeAuthModal: closeAuth,
        setAuthModalOpen,
        loginWithPhonePassword,
        signupCustomer,
        signupTechnician,
        loginAsPreset,
        loginAsCustomer,
        loginAsAdmin,
        loginAsTechnician,
        switchRole,
        updateUser,
        logout,
        dbTechnicians,
        technicians: dbTechnicians,
        VERIFIED_TECHNICIANS: dbTechnicians,
        dbCustomers,
        customers: dbCustomers,
        SEEDED_CUSTOMERS: dbCustomers
      }}
    >
      {children}

      {/* ⚠️ SINGLE-DEVICE CONCURRENT LOGIN LOGOUT MODAL */}
      <Dialog
        open={sessionTerminatedModalOpen}
        onClose={() => setSessionTerminatedModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 25px 50px rgba(15, 23, 42, 0.35)',
            border: '1.5px solid #FCD34D'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pb: 1 }}>
          <Box sx={{ bgcolor: '#FEF3C7', color: '#D97706', p: 1, borderRadius: '12px', display: 'flex' }}>
            <DevicesIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px', lineHeight: 1.2 }}>
              Logged In on Another Device
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '11px' }}>
              மற்றொரு சாதனத்தில் உள்நுழைந்துள்ளீர்கள்
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#D97706', fontSize: 20, mt: 0.2 }} />
              <Typography variant="body2" sx={{ color: '#92400E', fontSize: '13px', lineHeight: 1.5, fontWeight: 600 }}>
                Your SalemSeva account was accessed from a new phone/browser. To protect your data and security, you have been automatically logged out from this device.
              </Typography>
            </Box>
          </Paper>

          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px', display: 'block', textAlign: 'center' }}>
            If this was you, you can log back in on this device anytime.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setSessionTerminatedModalOpen(false);
              setAuthModalOpen(true);
            }}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFF',
              borderRadius: '10px',
              py: 1.2,
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            Log In Again on This Device (மீண்டும் உள்நுழைய)
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
