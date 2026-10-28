import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  Box,
  Avatar,
  Paper
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable
} from '@simplewebauthn/browser';

import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shazuone_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Could not parse saved user:', e);
      return null;
    }
  });

  // Dedicated Independent Technician Session (survives refreshes without customer collision)
  const [techUser, setTechUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shazuone_tech_user');
      if (saved) return JSON.parse(saved);
      const userSaved = localStorage.getItem('shazuone_user');
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        if (parsed && (parsed.role === 'technician' || parsed.role === 'partner')) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.warn('Could not parse saved technician:', e);
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('shazuone_is_guest') === 'true';
  });

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('shazuone_is_guest', 'true');
  };

  const clearGuest = () => {
    setIsGuest(false);
    localStorage.removeItem('shazuone_is_guest');
  };

  const [dbTechnicians, setDbTechnicians] = useState([]);
  const [dbCustomers, setDbCustomers] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('customer');

  const [sessionTerminatedModalOpen, setSessionTerminatedModalOpen] = useState(false);
  const [rewardSettings, setRewardSettings] = useState({
    customer_referral_credits: 50,
    referee_discount_amount: 50,
    review_reward_credits: 25,
    feedback_reward_credits: 15,
    feedback_rewards_enabled: true,
    partner_referral_incentive: 100,
    partner_welcome_bonus: 50
  });

  const fetchRewardSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/settings/rewards`);
      const data = await res.json();
      if (data.success && data.settings) {
        setRewardSettings(data.settings);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchRewardSettings();
  }, []);

  const sessionTokenRef = useRef(localStorage.getItem('shazuone_session_token') || '');

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
        localStorage.setItem('shazuone_session_token', data.sessionToken);
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
        const token = sessionTokenRef.current || localStorage.getItem('shazuone_session_token');
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
          localStorage.removeItem('shazuone_user');
          localStorage.removeItem('shazuone_session_token');
          sessionTokenRef.current = '';
          toast.error('Session ended: Your account was accessed from another device.');
          window.location.href = '/login?session_expired=true';
        }
      } catch (e) {}
    };

    const interval = setInterval(checkSession, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // The API layer clears the stored token and fires this event when the server rejects it:
  // a restart, an expiry, or a revoked session. Without a listener every screen would keep
  // failing its requests while the app still believed somebody was signed in.
  useEffect(() => {
    const onSessionExpired = () => {
      sessionTokenRef.current = '';
      setUser(null);
      localStorage.removeItem('shazuone_user');
      toast.error('Your session ended. Please sign in again.');
    };
    window.addEventListener('shazuone:session-expired', onSessionExpired);
    return () => window.removeEventListener('shazuone:session-expired', onSessionExpired);
  }, []);

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
            const isVerified = Boolean(t.is_kyc_verified ?? t.isKycVerified ?? (t.status === 'Verified'));
            return {
              id: t.id,
              role: 'technician',
              name: t.full_name || t.name,
              phone: t.phone,
              rawPhone: (t.phone || '').replace(/[\s\-]/g, ''),
              email: t.email || `${(t.full_name || t.name || 'tech').toLowerCase().replace(/[^a-z]/g, '')}@Shazu One.in`,
              trade: t.primary_trade || t.trade,
              tradeName: tradeNames[t.primary_trade || t.trade] || 'Certified Trade Specialist',
              experienceYears: t.years_experience || t.experienceYears || 5,
              status: isVerified ? 'Verified' : 'Pending Verification',
              isKycVerified: isVerified,
              is_kyc_verified: isVerified,
              isOnline: Boolean(t.is_online),
              ratingAvg: parseFloat(t.rating_avg || t.ratingAvg || 4.9),
              ratingCount: parseInt(t.rating_count ?? t.ratingCount ?? 0, 10),
              jobsCompleted: parseInt(t.jobs_completed_count ?? t.jobsCompleted ?? 0, 10),
              todayEarnings: parseFloat(t.today_earnings ?? t.todayEarnings ?? 0),
              today_earnings: parseFloat(t.today_earnings ?? t.todayEarnings ?? 0),
              starTier: t.star_tier || t.starTier || 'Gold Partner (Salem)',
              upiId: t.upi_vpa || t.upiId,
              upi_vpa: t.upi_vpa,
              aadhaarCardUrl: t.aadhaar_card_url,
              aadhaarNumber: t.aadhaar_number,
              serviceArea: (t.assigned_localities && t.assigned_localities[0]) ? `${t.assigned_localities[0]}, Salem` : 'Fairlands, Salem',
              assignedLocalities: t.assigned_localities || ['Fairlands', 'Hasthampatti']
            };
          });
          setDbTechnicians(mapped);

          setUser(prev => {
            if (prev && (prev.role === 'technician' || prev.role === 'partner')) {
              const prevClean = (prev.phone || '').replace(/[^0-9]/g, '').slice(-10);
              const matched = mapped.find(t => {
                const tClean = (t.phone || '').replace(/[^0-9]/g, '').slice(-10);
                return (t.id && prev.id && t.id === prev.id) || (tClean && prevClean && tClean === prevClean);
              });
              if (matched) {
                const verified = Boolean(matched.is_kyc_verified ?? matched.isKycVerified ?? prev.is_kyc_verified ?? prev.isKycVerified ?? (prev.status === 'Verified'));
                const updated = {
                  ...prev,
                  ...matched,
                  is_kyc_verified: verified,
                  isKycVerified: verified,
                  status: verified ? 'Verified' : 'Pending Verification'
                };
                localStorage.setItem('shazuone_user', JSON.stringify(updated));
                return updated;
              }
            }
            return prev;
          });

          // Dedicated persistent technician session synchronization
          setTechUser(prev => {
            if (prev) {
              const prevClean = (prev.phone || '').replace(/[^0-9]/g, '').slice(-10);
              const matched = mapped.find(t => {
                const tClean = (t.phone || '').replace(/[^0-9]/g, '').slice(-10);
                return (t.id && prev.id && t.id === prev.id) || (tClean && prevClean && tClean === prevClean);
              });
              if (matched) {
                const verified = Boolean(matched.is_kyc_verified ?? matched.isKycVerified ?? prev.is_kyc_verified ?? prev.isKycVerified ?? (prev.status === 'Verified'));
                const updated = {
                  ...prev,
                  ...matched,
                  is_kyc_verified: verified,
                  isKycVerified: verified,
                  status: verified ? 'Verified' : 'Pending Verification'
                };
                localStorage.setItem('shazuone_tech_user', JSON.stringify(updated));
                return updated;
              }
            }
            return prev;
          });
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
            email: c.email || `${(c.name || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '')}@Shazu One.in`,
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
                localStorage.setItem('shazuone_user', JSON.stringify(updated));
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
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, phone, password, role })
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        throw new Error(data.error || 'Login failed with provided credentials');
      }

      setUser(data.user);
      localStorage.setItem('shazuone_user', JSON.stringify(data.user));
      if (data.sessionToken) {
        sessionTokenRef.current = data.sessionToken;
        localStorage.setItem('shazuone_session_token', data.sessionToken);
      }
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      console.error('Authentication error:', err.message);
      throw err;
    }
  };

  // Production Username / Phone / Email + Password Login
  const loginWithCredentials = async ({ identifier, password, role }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }
      setUser(data.user);
      localStorage.setItem('shazuone_user', JSON.stringify(data.user));
      if (data.sessionToken) {
        localStorage.setItem('shazuone_session_token', data.sessionToken);
        sessionTokenRef.current = data.sessionToken;
      }
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      console.error('OTP login failed:', err.message);
      throw err;
    }
  };

  // Production Registration
  // Request 6-digit WhatsApp OTP
  const requestWhatsAppOtp = async (phone, purpose = 'register') => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, purpose })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send WhatsApp OTP code');
      }
      return data;
    } catch (err) {
      console.error('WhatsApp OTP request error:', err.message);
      throw err;
    }
  };

  // Verify 6-digit WhatsApp OTP
  const verifyWhatsAppOtp = async (phone, otp, purpose = 'register') => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: (otp || '').trim(), purpose })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'OTP verification failed');
      }
      if (data.user && purpose === 'login') {
        setUser(data.user);
        localStorage.setItem('shazuone_user', JSON.stringify(data.user));
        if (data.user.role === 'technician') {
          setTechUser(data.user);
          localStorage.setItem('shazuone_tech_user', JSON.stringify(data.user));
        }
        if (data.sessionToken) {
          sessionTokenRef.current = data.sessionToken;
          localStorage.setItem('shazuone_session_token', data.sessionToken);
        }
        setAuthModalOpen(false);
      }
      return data;
    } catch (err) {
      console.error('WhatsApp OTP verify error:', err.message);
      throw err;
    }
  };

  // Set / Reset Password using Verification Token
  const setPasswordWithToken = async ({ phone, verificationToken, newPassword, role = 'customer' }) => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/password/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, verificationToken, newPassword, role })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update password');
      }
      return data;
    } catch (err) {
      console.error('Password set error:', err.message);
      throw err;
    }
  };

  // Check WebAuthn / Passkey capability on current device
  const checkPasskeySupport = async () => {
    try {
      if (!browserSupportsWebAuthn()) return false;
      return await platformAuthenticatorIsAvailable();
    } catch (e) {
      return false;
    }
  };

  // Register Passkey (Fingerprint / FaceID)
  const registerPasskey = async (phone) => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/register-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!data.success || !data.options) {
        throw new Error(data.error || 'Failed to initialize biometric registration');
      }

      const regResponse = await startRegistration({ optionsJSON: data.options });

      const verifyRes = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, response: regResponse })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Failed to link fingerprint or face lock');
      }
      return verifyData;
    } catch (err) {
      console.error('Fingerprint registration error:', err.message);
      throw err;
    }
  };

  // Sign in using Fingerprint / Face ID (1-tap Biometric)
  const loginWithPasskey = async (phone = '') => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/login-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!data.success || !data.options) {
        throw new Error(data.error || 'Could not connect to fingerprint sensor on this phone');
      }

      const authResponse = await startAuthentication({ optionsJSON: data.options });

      const verifyRes = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, response: authResponse })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || !verifyData.user) {
        throw new Error(verifyData.error || "Fingerprint or Face verification didn't match. Please try again.");
      }

      setUser(verifyData.user);
      localStorage.setItem('shazuone_user', JSON.stringify(verifyData.user));
      sessionStorage.setItem('shazuone_logged_in_with_passkey', 'true');
      if (verifyData.user.role === 'technician') {
        setTechUser(verifyData.user);
        localStorage.setItem('shazuone_tech_user', JSON.stringify(verifyData.user));
      }
      if (verifyData.sessionToken) {
        sessionTokenRef.current = verifyData.sessionToken;
        localStorage.setItem('shazuone_session_token', verifyData.sessionToken);
      }
      setAuthModalOpen(false);
      return verifyData.user;
    } catch (err) {
      console.error('Passkey login error:', err.message);
      throw err;
    }
  };

  // Get active Passkey status for customer or technician phone
  const getPasskeyStatus = async (phone) => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) return { hasPasskey: false, count: 0 };
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/status/${cleanPhone}`);
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Passkey status check note:', e);
      return { hasPasskey: false, count: 0 };
    }
  };

  // Unlink / Delete Passkey
  const deletePasskey = async (phone) => {
    try {
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) throw new Error('Valid phone required');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/passkey/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to remove fingerprint login');
      return data;
    } catch (err) {
      console.error('Passkey deletion error:', err);
      throw err;
    }
  };

  // Passkey Easy-Login Automatic Popup Prompt State
  const [passkeyPromptOpen, setPasskeyPromptOpen] = useState(false);
  const [passkeyEnrolling, setPasskeyEnrolling] = useState(false);

  const triggerPasskeyPromptIfEligible = async (targetUser) => {
    try {
      const activeUser = targetUser || user || techUser;
      if (!activeUser || !activeUser.phone) return;
      if (sessionStorage.getItem('shazuone_passkey_prompt_dismissed') === 'true') return;
      if (sessionStorage.getItem('shazuone_logged_in_with_passkey') === 'true') return;

      const isSupported = await checkPasskeySupport();
      if (!isSupported) return;

      const status = await getPasskeyStatus(activeUser.phone);
      if (status && !status.hasPasskey) {
        setTimeout(() => {
          setPasskeyPromptOpen(true);
        }, 900);
      }
    } catch (e) {
      console.warn('Passkey prompt auto-check note:', e);
    }
  };

  useEffect(() => {
    const active = user || techUser;
    if (active?.phone) {
      triggerPasskeyPromptIfEligible(active);
    }
  }, [user?.phone, techUser?.phone]);

  const handleEnablePasskeyFromPrompt = async () => {
    const activeUser = user || techUser;
    const phone = activeUser?.phone;
    if (!phone) return;
    setPasskeyEnrolling(true);
    try {
      const result = await registerPasskey(phone);
      if (result && result.success) {
        toast.success('கைரேகை லாகின் வெற்றிகரமாக இணைக்கப்பட்டது! (1-Tap Login enabled)');
        setPasskeyPromptOpen(false);
        sessionStorage.setItem('shazuone_passkey_prompt_dismissed', 'true');
      }
    } catch (err) {
      toast.error(err.message || 'Passkey enrollment was cancelled or failed');
    } finally {
      setPasskeyEnrolling(false);
    }
  };

  const handleDismissPasskeyPrompt = () => {
    setPasskeyPromptOpen(false);
    sessionStorage.setItem('shazuone_passkey_prompt_dismissed', 'true');
  };

  const registerAccount = async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        throw new Error(data.error || 'Registration failed. Please check details.');
      }
      setUser(data.user);
      localStorage.setItem('shazuone_user', JSON.stringify(data.user));
      if (data.sessionToken) {
        localStorage.setItem('shazuone_session_token', data.sessionToken);
        sessionTokenRef.current = data.sessionToken;
      }
      setAuthModalOpen(false);
      return data.user;
    } catch (err) {
      console.error('Registration error:', err.message);
      throw err;
    }
  };

  const signupCustomer = async ({ name, phone, password, address, locality, referralCode }) => {
    return registerAccount({
      name,
      phone,
      password,
      address,
      locality,
      referralCode: (referralCode || '').trim(),
      role: 'customer'
    });
  };

  const signupTechnician = async ({ name, phone, password, trade, aadhaar, serviceArea }) => {
    const userResult = await registerAccount({
      name,
      phone,
      password,
      trade,
      aadhaar,
      serviceArea,
      locality: serviceArea || 'Fairlands, Salem',
      role: 'technician'
    });

    if (userResult) {
      setTechUser(userResult);
      localStorage.setItem('shazuone_tech_user', JSON.stringify(userResult));
    }
    return userResult;
  };

  const loginAsPreset = async (presetKey) => {
    let preset = null;
    if (presetKey === 'customer') {
      preset = dbCustomers[0];
    } else if (presetKey === 'technicianVerified' || presetKey === 'technician') {
      preset = dbTechnicians[0];
    } else if (presetKey === 'admin') {
      preset = {
        id: 'adm-ops-001',
        role: 'admin',
        name: 'Shazu One Central Ops Admin',
        phone: '+91 98420 99999',
        email: 'ops.admin@Shazu One.in',
        designation: 'Operations Command Hub Lead',
        locality: 'Central HQ, Salem',
        isVerified: true
      };
    }

    if (!preset) return;
    setUser(preset);
    localStorage.setItem('shazuone_user', JSON.stringify(preset));
    setAuthModalOpen(false);

    if (preset.phone) {
      await registerSessionWithBackend(preset.phone, preset.role || 'customer', preset.name, preset.trade);
    }
  };

  const loginAsCustomer = (customerData) => {
    const cust = customerData || dbCustomers[0];
    if (!cust) return;
    setUser(cust);
    localStorage.setItem('shazuone_user', JSON.stringify(cust));
    setAuthModalOpen(false);
    registerSessionWithBackend(cust.phone, 'customer', cust.name);
  };

  const loginAsTechnician = (technicianData) => {
    const tech = technicianData || dbTechnicians[0];
    if (!tech) return;
    setUser(tech);
    setTechUser(tech);
    localStorage.setItem('shazuone_user', JSON.stringify(tech));
    localStorage.setItem('shazuone_tech_user', JSON.stringify(tech));
    setAuthModalOpen(false);
    registerSessionWithBackend(tech.phone, 'technician', tech.name, tech.trade);
  };

  // Dedicated Technician Login (Independent Session & Storage)
  const loginTech = async (technicianData, sessionToken) => {
    if (!technicianData) return;
    setTechUser(technicianData);
    setUser(technicianData);
    localStorage.setItem('shazuone_tech_user', JSON.stringify(technicianData));
    localStorage.setItem('shazuone_user', JSON.stringify(technicianData));
    if (sessionToken) {
      sessionTokenRef.current = sessionToken;
      localStorage.setItem('shazuone_tech_session_token', sessionToken);
      localStorage.setItem('shazuone_session_token', sessionToken);
    }
    if (technicianData.phone) {
      await registerSessionWithBackend(technicianData.phone, 'technician', technicianData.name, technicianData.trade);
    }
  };

  // Dedicated Technician Logout
  const logoutTech = async () => {
    try {
      const activePhone = techUser?.phone || user?.phone;
      if (activePhone) {
        fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: activePhone })
        }).catch(() => {});
      }
    } catch (e) {}

    setTechUser(null);
    localStorage.removeItem('shazuone_tech_user');
    localStorage.removeItem('shazuone_tech_session_token');
    localStorage.removeItem('shazuone_partner_phone');
    localStorage.removeItem('shazuone_partner_token');
    localStorage.removeItem('shazuone_partner_is_online');
    localStorage.removeItem('shazuone_partner_step');
    localStorage.removeItem('shazuone_partner_active_job');
    if (user && (user.role === 'technician' || user.role === 'partner')) {
      setUser(null);
      localStorage.removeItem('shazuone_user');
    }
  };

  const loginAsAdmin = () => {
    const admin = {
      id: 'adm-ops-001',
      role: 'admin',
      name: 'Shazu One Central Ops Admin',
      phone: '+91 98420 99999',
      email: 'ops.admin@Shazu One.in',
      designation: 'Operations Command Hub Lead',
      locality: 'Central HQ, Salem',
      isVerified: true
    };
    setUser(admin);
    localStorage.setItem('shazuone_user', JSON.stringify(admin));
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
      localStorage.setItem('shazuone_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      const activePhone = user?.phone || techUser?.phone;
      if (activePhone) {
        fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: activePhone })
        }).catch(() => {});
      }
    } catch (e) {}

    setUser(null);
    setTechUser(null);
    localStorage.removeItem('shazuone_user');
    localStorage.removeItem('shazuone_tech_user');
    localStorage.removeItem('shazuone_session_token');
    localStorage.removeItem('shazuone_tech_session_token');
    localStorage.removeItem('shazuone_partner_phone');
    localStorage.removeItem('shazuone_partner_token');
    localStorage.removeItem('shazuone_partner_is_online');
    localStorage.removeItem('shazuone_partner_step');
    localStorage.removeItem('shazuone_partner_active_job');
    localStorage.removeItem('shazuone_is_guest');
    setIsGuest(false);
    sessionTokenRef.current = '';
  };

  // Wallet & Incentives state management
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('shazuone_wallet_balance');
    return saved ? parseFloat(saved) : (user?.walletBalance ?? 150);
  });

  const [partnerIncentives, setPartnerIncentives] = useState(() => {
    const saved = localStorage.getItem('shazuone_partner_incentives');
    return saved ? JSON.parse(saved) : {
      totalIncentiveEarned: 0,
      availablePayout: 0,
      settledPayout: 0,
      starPoints: 0,
      totalReferralsCount: 0,
      zeroCommUnlocked: false
    };
  });

  const updateWalletBalance = (newBal) => {
    const val = Math.max(0, parseFloat(newBal) || 0);
    setWalletBalance(val);
    localStorage.setItem('shazuone_wallet_balance', val.toString());
    if (user) {
      updateUser({ walletBalance: val });
    }
  };

  const creditWallet = async (amount, title = '+50 Seva Credits Reward', description = 'Credits added to your Shazu One wallet', category = 'REWARD') => {
    const creditAmt = parseFloat(amount) || 50;
    const updated = walletBalance + creditAmt;
    updateWalletBalance(updated);

    try {
      await fetch(`${API_BASE_URL}/api/v1/wallet/customer/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '',
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
          phone: user?.phone || '',
          amount: actualDebit,
          bookingId
        })
      });
    } catch (e) {}
    return actualDebit;
  };

  const referTechnician = async ({ name, phone, trade, locality }) => {
    const incentiveAmount = parseFloat(rewardSettings?.partner_referral_incentive || 100);
    const newStarPoints = Math.min(30, (partnerIncentives.starPoints || 0) + 3);
    const newTotal = (partnerIncentives.totalIncentiveEarned || 0) + incentiveAmount;
    const newAvailable = (partnerIncentives.availablePayout || 0) + incentiveAmount;
    const isZeroComm = newStarPoints >= 30;

    const updated = {
      ...partnerIncentives,
      totalIncentiveEarned: newTotal,
      availablePayout: newAvailable,
      starPoints: newStarPoints,
      zeroCommUnlocked: isZeroComm
    };

    setPartnerIncentives(updated);
    localStorage.setItem('shazuone_partner_incentives', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE_URL}/api/v1/partner/refer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerPhone: user?.phone || '',
          referredName: name,
          referredPhone: phone,
          referredTrade: trade,
          referredLocality: locality
        })
      });
    } catch (e) {}

    return updated;
  };

  const claimPartnerPayout = async (upiId = '') => {
    const payoutAmount = partnerIncentives.availablePayout || 0;
    if (payoutAmount <= 0) return partnerIncentives;

    const updated = {
      ...partnerIncentives,
      settledPayout: (partnerIncentives.settledPayout || 0) + payoutAmount,
      availablePayout: 0
    };

    setPartnerIncentives(updated);
    localStorage.setItem('shazuone_partner_incentives', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE_URL}/api/v1/partner/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || '',
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
        isGuest,
        continueAsGuest,
        clearGuest,
        walletBalance,
        updateWalletBalance,
        creditWallet,
        debitWallet,
        rewardSettings,
        fetchRewardSettings,
        refreshRewardSettings: fetchRewardSettings,
        partnerIncentives,
        referTechnician,
        claimPartnerPayout,
        authModalOpen,
        authInitialTab,
        openAuthModal: openAuth,
        closeAuthModal: closeAuth,
        setAuthModalOpen,
        setAuthInitialTab,
        loginWithPhonePassword,
        loginWithCredentials,
        requestWhatsAppOtp,
        verifyWhatsAppOtp,
        setPasswordWithToken,
        checkPasskeySupport,
        registerPasskey,
        loginWithPasskey,
        getPasskeyStatus,
        deletePasskey,
        passkeyPromptOpen,
        openPasskeyPrompt: () => setPasskeyPromptOpen(true),
        closePasskeyPrompt: handleDismissPasskeyPrompt,
        registerAccount,
        signupCustomer,
        signupTechnician,
        loginAsPreset,
        loginAsCustomer,
        techUser,
        isTechAuthenticated: !!techUser,
        loginTech,
        logoutTech,
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
