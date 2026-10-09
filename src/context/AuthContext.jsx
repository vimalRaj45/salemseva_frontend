import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Fetch live technicians list from Neon PostgreSQL DB
  useEffect(() => {
    async function loadDbTechnicians() {
      try {
        const res = await fetch('https://salemseva-backend.onrender.com/api/v1/technicians');
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
        const res = await fetch('https://salemseva-backend.onrender.com/api/v1/customers');
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

          // If current user is a customer, keep their wallet balance updated from DB
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

  // Trigger Auth modal on initial load if user is not logged in
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setAuthModalOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

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
    return newTech;
  };

  const loginAsPreset = (presetKey) => {
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
        isOnline: true
      };
    } else {
      preset = {
        id: 'adm-ops-001',
        role: 'admin',
        name: 'Salem Ops Central Admin',
        phone: '+91 90030 99999',
        isVerified: true
      };
    }
    setUser(preset);
    localStorage.setItem('salemseva_user', JSON.stringify(preset));
    setAuthModalOpen(false);
    return preset;
  };

  const loginAsCustomer = (customerIdOrObj) => {
    let cust = null;
    if (typeof customerIdOrObj === 'string') {
      cust = dbCustomers.find(c => c.id === customerIdOrObj || c.phone === customerIdOrObj || c.rawPhone === customerIdOrObj || c.name === customerIdOrObj);
    } else if (customerIdOrObj && typeof customerIdOrObj === 'object') {
      cust = { ...customerIdOrObj, role: 'customer' };
    }
    
    if (!cust) {
      cust = dbCustomers[0] || {
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
    }

    setUser(cust);
    localStorage.setItem('salemseva_user', JSON.stringify(cust));
    setAuthModalOpen(false);
    return cust;
  };

  const loginAsAdmin = () => {
    const adminUser = {
      id: 'adm-ops-001',
      role: 'admin',
      name: 'Salem Ops Central Admin',
      phone: '+91 90030 99999',
      email: 'ops.admin@salemseva.in',
      designation: 'Operations Command Hub Lead',
      locality: 'Central HQ, Salem',
      isVerified: true
    };
    setUser(adminUser);
    localStorage.setItem('salemseva_user', JSON.stringify(adminUser));
    setAuthModalOpen(false);
    return adminUser;
  };

  const switchRole = (role) => {
    if (role === 'partner' || role === 'technician') {
      return loginAsTechnician();
    } else if (role === 'admin') {
      return loginAsAdmin();
    } else {
      return loginAsCustomer();
    }
  };

  const loginAsTechnician = (techIdOrObj) => {
    let tech = null;
    if (typeof techIdOrObj === 'string') {
      tech = dbTechnicians.find(t => t.id === techIdOrObj || t.trade === techIdOrObj || t.rawPhone === techIdOrObj || t.name === techIdOrObj);
    } else if (techIdOrObj && typeof techIdOrObj === 'object') {
      tech = techIdOrObj;
    }
    
    if (!tech) {
      tech = dbTechnicians[0] || {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        role: 'technician',
        name: 'K. Ramesh',
        phone: '+91 94432 88901',
        trade: 'ac',
        isKycVerified: true,
        isOnline: true
      };
    }

    setUser(tech);
    localStorage.setItem('salemseva_user', JSON.stringify(tech));
    localStorage.setItem('salemseva_partner_is_online', 'true');
    setAuthModalOpen(false);
    return tech;
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('salemseva_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('salemseva_user');
    setAuthModalOpen(true);
  };

  const openAuth = (tab = 'customer') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  // Customer Wallet State
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('salemseva_wallet_balance');
      if (saved !== null) return parseFloat(saved);
      const savedUser = localStorage.getItem('salemseva_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (typeof u.walletBalance === 'number') return u.walletBalance;
      }
      return 150;
    } catch (e) {
      return 150;
    }
  });

  // Technician Incentives State
  const [partnerIncentives, setPartnerIncentives] = useState(() => {
    try {
      const saved = localStorage.getItem('salemseva_partner_incentives');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      totalIncentiveEarned: 750,
      availablePayout: 500,
      settledPayout: 250,
      starPoints: 24,
      starPointsTarget: 30,
      zeroCommUnlocked: false,
      referralCode: 'TECHRAMESH'
    };
  });

  // Keep walletBalance synchronized with user object and localStorage
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
      await fetch('https://salemseva-backend.onrender.com/api/v1/wallet/customer/credit', {
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
    } catch (e) {
      console.warn('Credit wallet backend sync:', e);
    }
    return updated;
  };

  const debitWallet = async (amount, bookingId = 'SLM-84920') => {
    const debitAmt = parseFloat(amount) || 100;
    const actualDebit = Math.min(walletBalance, debitAmt);
    const updated = Math.max(0, walletBalance - actualDebit);
    updateWalletBalance(updated);

    try {
      await fetch('https://salemseva-backend.onrender.com/api/v1/wallet/customer/debit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '+91 98427 11234',
          amount: actualDebit,
          bookingId
        })
      });
    } catch (e) {
      console.warn('Debit wallet backend sync:', e);
    }
    return actualDebit;
  };

  const simulateCustomerReferral = async (friendName = 'Kavitha S.', locality = 'Meyyanur, Salem') => {
    const updated = walletBalance + 100;
    updateWalletBalance(updated);

    try {
      await fetch('https://salemseva-backend.onrender.com/api/v1/wallet/customer/simulate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName,
          locality,
          phone: user?.phone || '+91 98427 11234'
        })
      });
    } catch (e) {
      console.warn('Referral simulate sync:', e);
    }
    return updated;
  };

  // Technician Refer-a-Partner & Incentive Claim
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
      await fetch('https://salemseva-backend.onrender.com/api/v1/partner/refer', {
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
    } catch (e) {
      console.warn('Technician referral backend sync:', e);
    }

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
      await fetch('https://salemseva-backend.onrender.com/api/v1/partner/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '+919443288901',
          upiId
        })
      });
    } catch (e) {
      console.warn('Partner payout backend sync:', e);
    }

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
