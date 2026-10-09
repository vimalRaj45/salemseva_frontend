import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Button,
  Chip,
  Paper,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NavigationIcon from '@mui/icons-material/Navigation';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EngineeringIcon from '@mui/icons-material/Engineering';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarsIcon from '@mui/icons-material/Stars';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ShieldIcon from '@mui/icons-material/Shield';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TranslateIcon from '@mui/icons-material/Translate';
import SecurityIcon from '@mui/icons-material/Security';
import HandymanIcon from '@mui/icons-material/Handyman';
import WorkIcon from '@mui/icons-material/Work';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LockIcon from '@mui/icons-material/Lock';
import Avatar from '@mui/material/Avatar';

import LinearProgress from '@mui/material/LinearProgress';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShareIcon from '@mui/icons-material/Share';
import CampaignIcon from '@mui/icons-material/Campaign';

import MaskedChatModal from '../../components/MaskedChatModal';
import VoipCallModal from '../../components/VoipCallModal';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useAuth } from '../../context/AuthContext';
import { NativeNotifier } from '../../services/nativeNotify';

export default function PartnerDutyPage() {
  const navigate = useNavigate();
  const { user, updateUser, loginAsTechnician, partnerIncentives, referTechnician, claimPartnerPayout, dbTechnicians } = useAuth();
  const VERIFIED_TECHNICIANS = dbTechnicians || [];
  const [searchParams] = useSearchParams();
  const paramBookingId = searchParams.get('bookingId');
  const [techSwitcherAnchor, setTechSwitcherAnchor] = useState(null);

  const [copiedTechCode, setCopiedTechCode] = useState(false);
  const [techToast, setTechToast] = useState(null);

  const [referredTechsList, setReferredTechsList] = useState([
    {
      id: 'ref-tech-01',
      name: 'Murugan S.',
      phone: '+91 98421 66720',
      trade: 'HVAC & Refrigeration',
      locality: 'Hasthampatti, Salem',
      status: 'Verified & Active',
      onboardedAt: 'Oct 02, 2026',
      incentiveAmount: 250,
      payoutStatus: 'SETTLED_TO_UPI',
      upiRef: 'UPI-7749201-OKAXIS'
    },
    {
      id: 'ref-tech-02',
      name: 'S. Senthil Kumar',
      phone: '+91 98421 44551',
      trade: 'Senior Electrician',
      locality: 'Suramangalam, Salem',
      status: 'Verified & Active',
      onboardedAt: 'Oct 05, 2026',
      incentiveAmount: 250,
      payoutStatus: 'AVAILABLE_FOR_PAYOUT'
    },
    {
      id: 'ref-tech-03',
      name: 'P. Velumani',
      phone: '+91 97890 33442',
      trade: 'Master Plumber',
      locality: 'Shevapet, Salem',
      status: 'Verified & Active',
      onboardedAt: 'Oct 07, 2026',
      incentiveAmount: 250,
      payoutStatus: 'AVAILABLE_FOR_PAYOUT'
    }
  ]);

  const techReferralCode = partnerIncentives?.referralCode || `TECH${(user?.name || 'RAMESH').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8)}`;

  const handleCopyTechCode = () => {
    navigator.clipboard.writeText(techReferralCode);
    setCopiedTechCode(true);
    setTechToast(`Technician referral code ${techReferralCode} copied!`);
    setTimeout(() => setCopiedTechCode(false), 2500);
  };

  const handleShareTechWhatsApp = () => {
    const text = encodeURIComponent(
      `வணக்கம் நண்பா! சேலத்தில் தினசரி ₹1,500+ சம்பாதிக்க SalemSeva-வில் டெக்னீசியனாக இணையுங்கள். \n\nஎனது ரெஃபரல் கோட் *${techReferralCode}* பயன்படுத்தி இணையும்போது உங்களுக்கு ₹100 டூல் கிட் போனஸ் கிடைக்கும்: ${window.location.origin}/partner/onboarding`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSimulateReferral = async () => {
    const mockTechs = [
      { name: 'A. Manikandan', phone: '+91 94420 77884', trade: 'AC & Refrigeration Pro', locality: 'Alagapuram, Salem' },
      { name: 'D. Priya', phone: '+91 98432 66115', trade: 'Elite Sanitization Lead', locality: 'Hasthampatti, Salem' },
      { name: 'M. Karthik', phone: '+91 94431 88220', trade: 'Wiring & Safety Specialist', locality: 'Ammapet, Salem' },
      { name: 'R. Selvam', phone: '+91 98425 11993', trade: 'Concealed Drainage Expert', locality: 'Gugai, Salem' }
    ];
    const picked = mockTechs[Math.floor(Math.random() * mockTechs.length)];

    await referTechnician(picked);

    const newEntry = {
      id: `ref-tech-${Date.now()}`,
      name: picked.name,
      phone: picked.phone,
      trade: picked.trade,
      locality: picked.locality,
      status: 'Verified & Active',
      onboardedAt: 'Today',
      incentiveAmount: 250,
      payoutStatus: 'AVAILABLE_FOR_PAYOUT'
    };

    setReferredTechsList(prev => [newEntry, ...prev]);
    setTechToast(`Success! ${picked.name} onboarded as verified ${picked.trade}. +₹250 cash incentive credited to your wallet!`);
  };

  const handleClaimInstantPayout = async () => {
    if (!partnerIncentives?.availablePayout || partnerIncentives.availablePayout <= 0) {
      setTechToast('No available incentive balance to claim right now.');
      return;
    }
    const amt = partnerIncentives.availablePayout;
    await claimPartnerPayout('partner.pay@okaxis');
    setReferredTechsList(prev => prev.map(t => ({ ...t, payoutStatus: 'SETTLED_TO_UPI', upiRef: `UPI-${Math.floor(1000000 + Math.random() * 9000000)}-SALEM` })));
    setTechToast(`₹${amt}.00 successfully disbursed directly to your UPI ID (partner.pay@okaxis)!`);
  };

  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem('salemseva_partner_is_online');
    if (saved !== null) return saved === 'true';
    if (user && typeof user.isOnline === 'boolean') return user.isOnline;
    return true;
  });
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('salemseva_partner_step');
    return saved ? parseInt(saved, 10) : 1;
  }); // 1: Incoming Feed | 2: Active Trip | 3: Diagnostic & Quote
  const [bottomNav, setBottomNav] = useState(0); // 0: Duty | 1: Incentives & Referrals | 2: History & Pay | 3: Profile

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);

  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const lastMessageCountRef = useRef(-1);

  const [activeJob, setActiveJob] = useState(null);
  const [countdown, setCountdown] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState({ title: '', subtitle: '' });

  // Live GPS Transmitter & Location Permission State
  const [isGpsBroadcasting, setIsGpsBroadcasting] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [liveGps, setLiveGps] = useState({
    lat: 11.6780,
    lng: 78.1580,
    speed: 26,
    locality: 'Hasthampatti Main Rd, Salem'
  });
  const [completionOtp, setCompletionOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [arrivalOtp, setArrivalOtp] = useState('');
  const [arrivalOtpVerified, setArrivalOtpVerified] = useState(false);
  const [isArrivalOtpOpen, setIsArrivalOtpOpen] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  // Helper to send coordinates to SalemSeva backend
  const broadcastLocation = async (lat, lng, speed = 25) => {
    try {
      const phone = user?.phone || '+919443288901';
      await fetch('https://salemseva-backend.onrender.com/api/v1/partner/duty/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          technicianId: user?.id,
          lat,
          lng,
          speed
        })
      });
    } catch (e) {}
  };

  // Explicit Location Permission Request Flow (Only triggered when going ON DUTY)
  const requestLocationPermission = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationPermission('granted');
        resolve(true);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationPermission('granted');
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: Math.round((pos.coords.speed || 0) * 3.6) || 26,
            locality: 'Live Device GPS (Salem)'
          };
          setLiveGps(coords);
          broadcastLocation(coords.lat, coords.lng, coords.speed);
          setTechToast('Location access granted. Realtime GPS is active.');
          resolve(true);
        },
        (err) => {
          console.warn('Location permission denied or prompt required:', err);
          setLocationPermission('denied');
          setLocationModalOpen(true);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    });
  };

  // Real-Time GPS Broadcasting Effect (STRICT: Automatically runs in background when Working Mode / Duty is ON)
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    // Default stable Salem position for technician (Hasthampatti / Saradha College zone)
    const defaultSalemLat = step === 3 ? 11.6643 : (step === 2 ? 11.6740 : 11.6780);
    const defaultSalemLng = step === 3 ? 78.1460 : (step === 2 ? 78.1540 : 78.1580);
    const defaultLocality = step === 3 ? 'Customer Doorstep (Fairlands, Salem)' : (step === 2 ? 'En Route (Saradha College Rd, Salem)' : 'Hasthampatti, Salem');

    let watchId = null;
    if (navigator.geolocation && locationPermission === 'granted') {
      // First get immediate position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = Math.round((pos.coords.speed || 0) * 3.6) || 0;
          setLiveGps({ lat, lng, speed, locality: 'Live Device GPS (Salem)' });
          broadcastLocation(lat, lng, speed);
        },
        () => {
          setLiveGps({ lat: defaultSalemLat, lng: defaultSalemLng, speed: 0, locality: defaultLocality });
          broadcastLocation(defaultSalemLat, defaultSalemLng, 0);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      // Watch for actual physical device movement
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = Math.round((pos.coords.speed || 0) * 3.6) || 0;
          setLiveGps({ lat, lng, speed, locality: 'Live Device GPS (Salem)' });
          broadcastLocation(lat, lng, speed);
        },
        (err) => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      // Stable Salem position broadcast
      setLiveGps({ lat: defaultSalemLat, lng: defaultSalemLng, speed: 0, locality: defaultLocality });
      broadcastLocation(defaultSalemLat, defaultSalemLng, 0);
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOnline, locationPermission, step, user?.phone, user?.id]);

  // Payout & Settlement History state for Tab 1
  const [partnerJobs, setPartnerJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState('all');
  const [selectedSlipJob, setSelectedSlipJob] = useState(null);

  const formatDateTime = (dateStr) => {
    if (!dateStr) {
      const now = new Date();
      return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently completed';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchPartnerHistory = () => {
    setJobsLoading(true);
    fetch('https://salemseva-backend.onrender.com/api/v1/partner/jobs/history')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.jobs) {
          setPartnerJobs(data.jobs);
        }
      })
      .catch(err => console.warn('Partner jobs history fetch:', err))
      .finally(() => setJobsLoading(false));
  };

  useEffect(() => {
    fetchPartnerHistory();
  }, []);

  useEffect(() => {
    if (bottomNav === 1) {
      fetchPartnerHistory();
    }
  }, [bottomNav]);

  // Ticking countdown timer for incoming leads
  useEffect(() => {
    if (step !== 1 || !isOnline) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, isOnline]);

  const [cancellationNotice, setCancellationNotice] = useState(null);
  const [acknowledgedCancelIds, setAcknowledgedCancelIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('salemseva_ack_cancels') || '[]');
    } catch (e) {
      return [];
    }
  });

  const handleAcknowledgeCancellation = () => {
    if (cancellationNotice) {
      const updated = [...acknowledgedCancelIds, cancellationNotice.bookingId];
      setAcknowledgedCancelIds(updated);
      localStorage.setItem('salemseva_ack_cancels', JSON.stringify(updated));
    }
    setCancellationNotice(null);
    setActiveJob(null);
    setStep(1);
    localStorage.removeItem('salemseva_partner_step');
    localStorage.removeItem('salemseva_partner_active_job');
  };

  // Poll real active job & synchronized duty state from Neon DB
  useEffect(() => {
    let isMounted = true;

    const fetchDuty = async () => {
      try {
        const phone = user?.phone || '+919443288901';
        const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/partner/duty?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.technician && typeof data.technician.is_online === 'boolean') {
            setIsOnline(data.technician.is_online);
            localStorage.setItem('salemseva_partner_is_online', data.technician.is_online ? 'true' : 'false');
            if (updateUser && user && user.isOnline !== data.technician.is_online) {
              updateUser({ isOnline: data.technician.is_online });
            }
          }

          // Check if customer cancelled an assigned job
          if (data.cancelNotice && !acknowledgedCancelIds.includes(data.cancelNotice.bookingId)) {
            setCancellationNotice(data.cancelNotice);
            setActiveJob(null);
            setStep(1);
            localStorage.removeItem('salemseva_partner_step');
            localStorage.removeItem('salemseva_partner_active_job');
          } else if (data.technician?.is_online === false) {
            setActiveJob(null);
          } else if (data.activeJob) {
            setActiveJob(data.activeJob);
            const st = data.activeJob.status;
            // Lock session into corresponding stage so refresh never disconnects
            if (st === 'matching' || st === 'accepted') {
              setStep(1);
              localStorage.removeItem('salemseva_partner_step');
            } else if (st === 'en_route') {
              setStep(2);
              localStorage.setItem('salemseva_partner_step', '2');
            } else if (['arrived', 'inspecting', 'quote_presented', 'quote_approved'].includes(st)) {
              setStep(3);
              localStorage.setItem('salemseva_partner_step', '3');
            } else if (st === 'completed') {
              setActiveJob(null);
              setStep(1);
              localStorage.removeItem('salemseva_partner_step');
            }
          } else {
            setActiveJob(null);
            setStep(1);
            localStorage.removeItem('salemseva_partner_step');
            localStorage.removeItem('salemseva_partner_active_job');
          }
        }
      } catch (err) {
        console.warn('Partner duty poll:', err);
      }
    };

    fetchDuty();
    const interval = setInterval(fetchDuty, 1200);

    const handleSync = () => fetchDuty();
    window.addEventListener('salemseva_new_booking_created', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('salemseva_new_booking_created', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user?.phone, acknowledgedCancelIds]);

  const storedPartnerJob = localStorage.getItem('salemseva_partner_active_job');
  const storedActiveBooking = localStorage.getItem('salemseva_active_booking');
  const activeBookingId = (activeJob?.id && activeJob.id !== 'null') 
    ? activeJob.id 
    : ((paramBookingId && paramBookingId !== 'null') 
      ? paramBookingId 
      : (storedPartnerJob || storedActiveBooking || 'SLM-84920'));

  const [step3Quote, setStep3Quote] = useState(null);

  useEffect(() => {
    if (step === 3 && activeBookingId) {
      fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/quote`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStep3Quote(data);
          }
        })
        .catch(err => console.warn('Step 3 quote fetch note:', err));
    }
  }, [step, activeBookingId]);

  // Real-time VoIP Call & Chat Notification Poller from Customer
  useEffect(() => {
    let isMounted = true;

    const pollPartnerCommunications = async () => {
      try {
        // 1. Check for incoming VoIP calls from customer
        const callRes = await fetch(`https://salemseva-backend.onrender.com/api/v1/webrtc/call/status?bookingId=${activeBookingId}`);
        const callData = await callRes.json();
        if (callData.success && callData.call && isMounted) {
          if (callData.call.active && callData.call.caller === 'customer' && callData.call.status === 'RINGING') {
            if (!callOpen) {
              NativeNotifier.notifyIncomingCall({
                callerName: activeJob?.customerName || 'Customer',
                bookingId: activeBookingId,
                role: 'Technician'
              });
            }
            setIsIncomingCall(true);
            setCallOpen(true);
          }
        }

        // 2. Check for incoming chat messages from customer
        const msgRes = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/messages`);
        const msgData = await msgRes.json();
        if (msgData.success && msgData.messages && isMounted) {
          const msgs = msgData.messages;
          if (lastMessageCountRef.current === -1) {
            lastMessageCountRef.current = msgs.length;
          } else if (msgs.length > lastMessageCountRef.current) {
            const latest = msgs[msgs.length - 1];
            if (latest.sender === 'customer' && !chatOpenRef.current) {
              setIncomingMessageToast(latest.text);
              NativeNotifier.notifyIncomingMessage({
                senderName: activeJob?.customerName || 'Customer',
                messageText: latest.text,
                bookingId: activeBookingId
              });
            }
            lastMessageCountRef.current = msgs.length;
          }
        }
      } catch (err) {}
    };

    pollPartnerCommunications();
    const commInterval = setInterval(pollPartnerCommunications, 1000);
    return () => {
      isMounted = false;
      clearInterval(commInterval);
    };
  }, [activeBookingId]);

  const handleToggleOnline = async (checked) => {
    if (checked) {
      // 1. Ask device location permission when technician goes online
      setIsOnline(true);
      setIsGpsBroadcasting(true);
      localStorage.setItem('salemseva_partner_is_online', 'true');
      if (updateUser) {
        updateUser({ isOnline: true });
      }
      requestLocationPermission();
    } else {
      // 2. Going offline -> Stop location broadcasting immediately
      setIsOnline(false);
      setIsGpsBroadcasting(false);
      localStorage.setItem('salemseva_partner_is_online', 'false');
      if (updateUser) {
        updateUser({ isOnline: false });
      }
      setTechToast('Duty turned OFF. Location broadcasting stopped.');
    }

    fetch('https://salemseva-backend.onrender.com/api/v1/partner/duty/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: checked, phone: user?.phone || '+919443288901' })
    }).catch(err => console.warn('Duty toggle synced'));
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Top Header Mode Toggle */}
        <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
          <Button
            variant={bottomNav === 0 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setBottomNav(0)}
            startIcon={<TwoWheelerIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1,
              py: 0.8,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: bottomNav === 0 ? '#0F172A' : '#FFFFFF',
              color: bottomNav === 0 ? '#FFFFFF' : '#475569',
              borderColor: bottomNav === 0 ? '#0F172A' : '#CBD5E1',
              boxShadow: bottomNav === 0 ? '0 2px 6px rgba(15, 23, 42, 0.2)' : 'none',
              '&:hover': { bgcolor: bottomNav === 0 ? '#1E293B' : '#F1F5F9' }
            }}
          >
            Live Duty
          </Button>
          <Button
            variant={bottomNav === 1 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setBottomNav(1)}
            startIcon={<CardGiftcardIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1.3,
              py: 0.8,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: bottomNav === 1 ? '#059669' : '#FFFFFF',
              color: bottomNav === 1 ? '#FFFFFF' : '#059669',
              borderColor: bottomNav === 1 ? '#059669' : '#CBD5E1',
              boxShadow: bottomNav === 1 ? '0 2px 6px rgba(5, 150, 105, 0.25)' : 'none',
              '&:hover': { bgcolor: bottomNav === 1 ? '#047857' : '#F0FDF4' }
            }}
          >
            Incentives (₹250/Tech)
          </Button>
          <Button
            variant={bottomNav === 2 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => {
              setBottomNav(2);
              fetchPartnerHistory();
            }}
            startIcon={<ReceiptLongIcon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1.1,
              py: 0.8,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              bgcolor: bottomNav === 2 ? '#0F172A' : '#FFFFFF',
              color: bottomNav === 2 ? '#FFFFFF' : '#475569',
              borderColor: bottomNav === 2 ? '#0F172A' : '#CBD5E1',
              boxShadow: bottomNav === 2 ? '0 2px 6px rgba(15, 23, 42, 0.2)' : 'none',
              '&:hover': { bgcolor: bottomNav === 2 ? '#1E293B' : '#F1F5F9' }
            }}
          >
            Settlements ({partnerJobs.length || 2})
          </Button>
        </Box>

        {/* ===================== TAB 0: DUTY (வேலை) ===================== */}
        {bottomNav === 0 && (
          <Box>
            {/* Pending Verification Notice Banner */}
            {user?.status === 'Pending Verification' && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: '8px',
                  bgcolor: '#FFFBEB',
                  border: '1px solid #FCD34D'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <BadgeIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400E', fontSize: '13px' }}>
                    Application status: Pending hub verification
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#78350F', fontSize: '12px', mb: 1, lineHeight: 1.4 }}>
                  Please attend your in-person skill validation and ID check at the Salem Hub (Fairlands Main Rd) to start accepting customer bookings.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    updateUser({ status: 'Verified', isKycVerified: true, isOnline: true });
                  }}
                  sx={{
                    borderColor: '#D97706',
                    color: '#92400E',
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '6px',
                    textTransform: 'none',
                    py: 0.3
                  }}
                >
                  Verify profile (demo bypass)
                </Button>
              </Paper>
            )}

            {/* 1. Online Toggle Status */}
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: (isOnline && user?.status !== 'Pending Verification') ? '#16A34A' : '#DC2626' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                    {(isOnline && user?.status !== 'Pending Verification') ? 'Online • Ready for jobs' : 'Offline'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                    Zone: {user?.serviceArea || 'Fairlands & Hasthampatti'}
                  </Typography>
                </Box>
              </Box>
              <Switch 
                disabled={user?.status === 'Pending Verification' || step === 2 || step === 3}
                checked={isOnline && user?.status !== 'Pending Verification'} 
                onChange={(e) => {
                  if (step === 2 || step === 3) return;
                  handleToggleOnline(e.target.checked);
                }} 
                color="primary" 
              />
            </Paper>


            {/* 1.2 SalemSeva 3-Stage Escrow & Settlement Protocol Card */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '8px',
                mb: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                <ShieldIcon sx={{ color: '#0284C7', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  SalemSeva Instant Settlement Protocol (3-Stage Escrow)
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8, mb: 1 }}>
                <Paper elevation={0} sx={{ p: 0.8, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 800, fontSize: '10px', display: 'block' }}>
                    1. Payment Held
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontSize: '9.5px', lineHeight: 1.1, display: 'block' }}>
                    Customer pays ₹99 + Quote to Escrow
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 0.8, bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, fontSize: '10px', display: 'block' }}>
                    2. Job & OTP
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B45309', fontSize: '9.5px', lineHeight: 1.1, display: 'block' }}>
                    You finish job & verify customer OTP
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 0.8, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 800, fontSize: '10px', display: 'block' }}>
                    3. Instant Settlement
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10B981', fontSize: '9.5px', lineHeight: 1.1, display: 'block' }}>
                    100% Visit + 85% to your UPI instantly
                  </Typography>
                </Paper>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', display: 'block', lineHeight: 1.3 }}>
                <strong>டெக்னீசியன் கவனத்திற்கு:</strong> வாடிக்கையாளர் OTP உறுதி செய்த பிறகே உங்கள் வங்கிக் கணக்கிற்கு உடனடி பணம் செலுத்தப்படும் (No delayed settlements).
              </Typography>
            </Paper>

            {/* Active In-Progress Lock Notice */}
            {(step === 2 || step === 3) && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 1.5, 
                  py: 0.6, 
                  borderRadius: '8px', 
                  fontSize: '11.5px', 
                  bgcolor: '#EFF6FF', 
                  color: '#1E40AF', 
                  border: '1px solid #BFDBFE' 
                }}
              >
                <strong>Active Job Locked (Zero Disconnection):</strong> You are currently servicing customer #{activeBookingId}. Finish and mark work completed to unlock new leads or duty toggle.
              </Alert>
            )}

            {/* 2. Step Progress Bar */}
            <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', p: 0.5, borderRadius: '8px', mb: 2, gap: 0.5 }}>
              <Button
                disabled={step === 2 || step === 3}
                onClick={() => {
                  if (step === 2 || step === 3) return;
                  setStep(1);
                }}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 1 ? '#FFFFFF' : 'transparent',
                  color: (step === 2 || step === 3) ? '#94A3B8' : (step === 1 ? '#0F172A' : '#64748B'),
                  border: step === 1 ? '1px solid #E2E8F0' : 'none',
                  textTransform: 'none',
                  cursor: (step === 2 || step === 3) ? 'not-allowed' : 'pointer'
                }}
              >
                1. Requests {(step === 2 || step === 3) && ''}
              </Button>
              <Button
                onClick={() => setStep(2)}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 2 ? '#FFFFFF' : 'transparent',
                  color: step === 2 ? '#0F172A' : '#64748B',
                  border: step === 2 ? '1px solid #E2E8F0' : 'none',
                  textTransform: 'none'
                }}
              >
                2. In transit
              </Button>
              <Button
                onClick={() => setStep(3)}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 3 ? '#FFFFFF' : 'transparent',
                  color: step === 3 ? '#0F172A' : '#64748B',
                  border: step === 3 ? '1px solid #E2E8F0' : 'none',
                  textTransform: 'none'
                }}
              >
                3. Diagnostic & quote
              </Button>
            </Box>

            {/* 3. Technician Profile Bar with 1-Click Specialist Switcher */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EngineeringIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px', lineHeight: 1.2 }}>
                        {user?.name || 'K. Ramesh'}
                      </Typography>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#16A34A !important', fontSize: 13 }} />}
                        label="Salem Verified"
                        size="small"
                        sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '10px', height: 18 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '11px', display: 'block' }}>
                      {user?.tradeName || `${user?.trade?.toUpperCase() || 'SERVICE'} Specialist`} • {user?.phone || '+91 94432 88901'}
                    </Typography>
                  </Box>
                </Box>

                {/* 1-Click Switch Profile Button */}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => setTechSwitcherAnchor(e.currentTarget)}
                  startIcon={<SwapHorizIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '11px',
                    py: 0.6,
                    px: 1,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
                  }}
                >
                  Switch Tech
                </Button>
              </Box>
            </Card>

            {/* Switch Technician Menu */}
            <Menu
              anchorEl={techSwitcherAnchor}
              open={Boolean(techSwitcherAnchor)}
              onClose={() => setTechSwitcherAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: '10px',
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  minWidth: 280,
                  p: 0.5
                }
              }}
            >
              <Box sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid #1E293B' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px' }}>
                  Switch to Another Verified Specialist:
                </Typography>
              </Box>

              {VERIFIED_TECHNICIANS.map((tech) => {
                const isCurrent = (user?.id === tech.id) || (user?.name === tech.name);
                return (
                  <MenuItem
                    key={tech.id}
                    onClick={() => {
                      loginAsTechnician(tech);
                      setIsOnline(true);
                      setTechSwitcherAnchor(null);
                    }}
                    sx={{
                      borderRadius: '6px',
                      my: 0.3,
                      bgcolor: isCurrent ? '#065F46' : 'transparent',
                      '&:hover': { bgcolor: isCurrent ? '#047857' : '#1E293B' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: isCurrent ? '#34D399' : '#94A3B8' }}>
                      {tech.trade === 'electrician' ? <BoltIcon sx={{ fontSize: 16 }} /> : tech.trade === 'ac' ? <AcUnitIcon sx={{ fontSize: 16 }} /> : tech.trade === 'plumber' ? <BuildIcon sx={{ fontSize: 16 }} /> : <EngineeringIcon sx={{ fontSize: 16 }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: isCurrent ? 800 : 600, color: '#FFFFFF', fontSize: '12px' }}>
                            {tech.name}
                          </Typography>
                          {isCurrent && <Chip label="Active" size="small" sx={{ bgcolor: '#10B981', color: '#FFF', fontWeight: 800, fontSize: '9px', height: 16 }} />}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: isCurrent ? '#A7F3D0' : '#94A3B8', fontSize: '10px' }}>
                          {tech.tradeName} •  {tech.ratingAvg}
                        </Typography>
                      }
                    />
                  </MenuItem>
                );
              })}
            </Menu>

            {/* STEP 1: INCOMING LEADS FEED / RADAR SCANNING / OFFLINE */}
            {step === 1 && (
              <Box>
                {!isOnline ? (
                  /* Dedicated Offline Duty State */
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      p: 3,
                      mb: 2,
                      border: '1px solid #334155',
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: '#1E293B',
                        border: '2px dashed #64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <TwoWheelerIcon sx={{ color: '#94A3B8', fontSize: 32 }} />
                    </Box>

                    <Chip
                      label="தற்போது ஆஃப்லைனில் உள்ளீர்கள் • Currently Offline"
                      size="small"
                      sx={{ bgcolor: '#1E293B', color: '#FCA5A5', fontWeight: 700, fontSize: '11px', mb: 1.5, border: '1px solid #7F1D1D' }}
                    />

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px', mb: 0.8 }}>
                      வேலை கோரிக்கைகள் இடைநிறுத்தப்பட்டுள்ளன (Duty Paused)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px', maxWidth: 360, mx: 'auto', mb: 2.5, lineHeight: 1.5 }}>
                      You are marked offline. Customers will not see you on Salem radar and no dispatch requests will be sent to you until you go online.
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={() => handleToggleOnline(true)}
                      startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        bgcolor: '#16A34A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        px: 3,
                        py: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                        '&:hover': { bgcolor: '#15803D' }
                      }}
                    >
                      Go Online • ஆன்லைனுக்கு மாறவும்
                    </Button>
                  </Card>
                ) : activeJob && activeJob.status === 'accepted' ? (
                  /* ================= WAITING FOR CUSTOMER RAZORPAY PAYMENT (₹99 ADVANCE) ================= */
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      p: 2.5,
                      mb: 2,
                      border: '2px solid #F59E0B',
                      boxShadow: '0 4px 24px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <HourglassTopIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FEF08A', fontSize: '13.5px' }}>
                          வாடிக்கையாளர் கட்டணம் செலுத்தும் வரை காத்திருக்கவும்
                        </Typography>
                      </Box>
                      <Chip
                        icon={<LockIcon sx={{ fontSize: '12px !important', color: '#92400E !important' }} />}
                        label="Awaiting ₹99"
                        size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '10.5px', height: 22 }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '12.5px', mb: 1.5, lineHeight: 1.45 }}>
                      You accepted booking <strong>#{activeJob.id}</strong>. Customer <strong>{activeJob.customerName || 'Customer'}</strong> ({activeJob.locality || 'Fairlands, Salem'}) is currently completing the <strong>₹99.00 Doorstep Travel & Inspection Advance</strong> via Razorpay.
                    </Typography>

                    <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, display: 'block', mb: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px' }}>
                        RAZORPAY ESCROW GUARANTEE FOR PARTNERS
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, fontSize: '12px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>Doorstep Travel & Fuel Advance:</span>
                          <strong style={{ color: '#34D399' }}>₹99.00 (100% to your wallet)</strong>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>SalemSeva Platform Cut:</span>
                          <strong style={{ color: '#94A3B8' }}>₹0.00 (Zero Commission)</strong>
                        </Box>
                      </Box>
                    </Paper>

                    <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '11.5px', mb: 2, py: 0.5 }}>
                      <strong>கவனம்:</strong> வாடிக்கையாளர் Razorpay மூலம் ₹99 செலுத்திய பின்பே அழைப்பு (Call), செய்தி (Chat), மற்றும் GPS வழித்தடம் (Navigation) திறக்கப்படும். அதுவரை பைக்கை எடுக்க வேண்டாம்.
                    </Alert>

                    {/* Locked Action Buttons with visual indicators */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        disabled
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        sx={{ bgcolor: '#334155 !important', color: '#94A3B8 !important', borderRadius: '6px', py: 0.8, fontSize: '11.5px', textTransform: 'none' }}
                      >
                        Call (Locked)
                      </Button>

                      <Button
                        disabled
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                        sx={{ bgcolor: '#334155 !important', color: '#94A3B8 !important', borderRadius: '6px', py: 0.8, fontSize: '11.5px', textTransform: 'none' }}
                      >
                        Chat (Locked)
                      </Button>
                    </Box>
                  </Card>
                ) : activeJob ? (
                  /* Active Incoming Lead Requested by Customer */
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      p: 2,
                      mb: 2,
                      border: '2px solid #2563EB',
                      boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <WhatshotIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FEF08A', fontSize: '13.5px' }}>
                          Incoming dispatch request ({countdown}s)
                        </Typography>
                      </Box>
                      <Chip
                        label="85% tech share"
                        size="small"
                        sx={{ bgcolor: '#1E293B', color: '#FEF08A', border: '1px solid #334155', fontWeight: 700, fontSize: '10px' }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontSize: '11px' }}>
                      Direct bank settlement upon customer confirmation + ₹40 travel allowance.
                    </Typography>

                    {/* Real Lead Item */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: '#1E293B',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.3 }}>
                            <Chip label={`#${activeJob.id}`} size="small" sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 700, fontSize: '10px', height: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>
                              {activeJob.issueDescription || 'Doorstep Service & Inspection'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 600, display: 'block' }}>
                            Customer: {activeJob.customerName || 'Vimal Raj'} • {activeJob.customerPhone || '+91 98427 11234'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
                            <LocationOnIcon sx={{ color: '#F59E0B', fontSize: 13 }} />
                            <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '11px' }}>
                              {activeJob.address || activeJob.locality || 'Fairlands, Salem'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: '13.5px' }}>
                            ₹{activeJob.visitFee ? `${activeJob.visitFee} - ₹1,400` : '₹750 - ₹1,400'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                            Est. payout
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ borderColor: '#334155', my: 1 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
                          Response window: <strong>3 mins</strong>
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={async () => {
                            setLoadingMsg({
                              title: 'Accepting booking request...',
                              subtitle: `Notifying customer ${activeJob?.customerName || 'Customer'} of acceptance.`
                            });
                            setIsProcessing(true);
                            try {
                              await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeJob.id}/status`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  status: 'accepted',
                                  technicianId: user?.id
                                })
                              });
                              setActiveJob(prev => prev ? { ...prev, status: 'accepted' } : null);
                            } catch (err) {
                              console.warn('Status update fallback:', err);
                              setActiveJob(prev => prev ? { ...prev, status: 'accepted' } : null);
                            }
                            setStep(1);
                            localStorage.removeItem('salemseva_partner_step');
                            setTimeout(() => {
                              setIsProcessing(false);
                            }, 500);
                          }}
                          sx={{ bgcolor: '#16A34A', borderRadius: '6px', fontWeight: 700, fontSize: '12px', px: 2, py: 0.5, textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
                        >
                          Accept request
                        </Button>
                      </Box>
                    </Paper>
                  </Card>
                ) : (
                  /* Idle Radar State: Waiting for real customer request */
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      p: 3,
                      mb: 2,
                      border: '1px solid #1E293B',
                      textAlign: 'center'
                    }}
                  >
                    {/* Animated Pulsing Radar */}
                    <Box sx={{ position: 'relative', width: 90, height: 90, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '2px solid rgba(56, 189, 248, 0.4)',
                          animation: 'pulsePartnerRadar 2.5s infinite ease-out',
                          '@keyframes pulsePartnerRadar': {
                            '0%': { transform: 'scale(0.6)', opacity: 1 },
                            '100%': { transform: 'scale(1.4)', opacity: 0 }
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '70%',
                          height: '70%',
                          borderRadius: '50%',
                          border: '1.5px solid rgba(56, 189, 248, 0.6)',
                          animation: 'pulsePartnerRadar 2.5s infinite ease-out',
                          animationDelay: '0.8s'
                        }}
                      />
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)'
                        }}
                      >
                        <TwoWheelerIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />
                      </Box>
                    </Box>

                    <Chip
                      icon={<CheckCircleIcon sx={{ color: '#34D399 !important', fontSize: 13 }} />}
                      label="Online • Radar Active in Fairlands"
                      size="small"
                      sx={{ bgcolor: '#1E293B', color: '#34D399', fontWeight: 700, fontSize: '11px', mb: 1.5 }}
                    />

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px', mb: 0.5 }}>
                      புதிய ஆர்டர்களுக்காக காத்திருக்கிறது (Waiting for Customer Requests)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px', maxWidth: 360, mx: 'auto', mb: 2, lineHeight: 1.4 }}>
                      No customer has requested a service right now in your zone. When a nearby customer places a booking, it will pop up here immediately with an audio alert.
                    </Typography>

                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155', textAlign: 'left' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700, fontSize: '11px' }}>
                          High Search Traffic Zones:
                        </Typography>
                        <Chip label="Surge +₹40" size="small" sx={{ bgcolor: '#334155', color: '#38BDF8', fontWeight: 700, fontSize: '10px', height: 18 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', fontSize: '11px' }}>
                        Fairlands, Hasthampatti & Suramangalam areas are active. Keep your app open to receive instant priority dispatch.
                      </Typography>
                    </Paper>
                  </Card>
                )}
              </Box>
            )}

            {/* STEP 2: ACTIVE TRIP */}
            {step === 2 && (
              <Box>
                {/* 1. Google Maps Turn-by-Turn Navigation Card (Origin: Tech GPS -> Destination: Customer) */}
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1.5px solid #0284C7',
                    borderRadius: '12px',
                    p: 2,
                    mb: 2,
                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)'
                  }}
                >
                  {/* Google Maps Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ bgcolor: '#0284C7', color: '#FFF', p: 0.8, borderRadius: '8px', display: 'flex' }}>
                        <NavigationIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '13.5px', lineHeight: 1.2 }}>
                          Google Maps Live Navigation
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, fontSize: '11px' }}>
                          கூகுள் மேப் நேரடி வழித்தடம் (Turn-by-Turn)
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="2-Wheeler Route" 
                      size="small" 
                      sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '10.5px' }} 
                    />
                  </Box>

                  {/* Origin to Destination Route Visual */}
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2 }}>
                    {/* Origin: Tech Current GPS */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 0.3 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0284C7', border: '2px solid #BAE6FD' }} />
                        <Box sx={{ width: 2, height: 24, bgcolor: '#CBD5E1', my: 0.3 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>
                          From (Your Current Location / உங்கள் இருப்பிடம்):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12px' }}>
                          {liveGps.locality || 'Saradha College Rd / Hasthampatti, Salem'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                          GPS: {liveGps.lat ? liveGps.lat.toFixed(4) : '11.6780'}, {liveGps.lng ? liveGps.lng.toFixed(4) : '78.1580'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Destination: Customer Location */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                      <Box sx={{ mt: 0.3 }}>
                        <LocationOnIcon sx={{ color: '#EA580C', fontSize: 16 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#EA580C', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>
                          To (Customer Doorstep / வாடிக்கையாளர் முகவரி):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                          {activeJob?.address || activeJob?.locality || '14/2, 5th Cross, Fairlands, Salem - 636016'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                          Locality: <strong>{activeJob?.locality || 'Fairlands'}</strong> • Distance: <strong>1.8 km (approx 8 mins)</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Primary 1-Tap Google Maps Navigation Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<NavigationIcon sx={{ fontSize: 18 }} />}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      const tLat = liveGps.lat || 11.6780;
                      const tLng = liveGps.lng || 78.1580;
                      const cLat = parseFloat(activeJob?.customerLat || activeJob?.lat || 11.6643);
                      const cLng = parseFloat(activeJob?.customerLng || activeJob?.lng || 78.1460);
                      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${tLat},${tLng}&destination=${cLat},${cLng}&travelmode=two_wheeler`;
                      window.open(googleMapsUrl, '_blank');
                    }}
                    sx={{
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      py: 1.3,
                      fontWeight: 800,
                      fontSize: '13px',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                      '&:hover': { bgcolor: '#0369A1' }
                    }}
                  >
                    Open Google Maps Navigation (வழித்தடம் தொடங்கு) ↗
                  </Button>
                </Card>

                {/* 2. Customer Trip Details Card */}
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #16A34A',
                    borderRadius: '8px',
                    p: 2,
                    mb: 2
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#16A34A', display: 'block', mb: 0.3 }}>
                    Active trip • En route to customer
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', mb: 0.3 }}>
                    Customer: {activeJob?.customerName || 'Customer'} (Booking #{activeJob?.id || activeBookingId || 'SLM'})
                  </Typography>
                  <Chip
                    label={`Issue: ${activeJob?.issueDescription || 'AC Doorstep Inspection'}`}
                    size="small"
                    sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 500, fontSize: '11px', mb: 1, height: 20 }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.2 }}>
                    {activeJob?.address || activeJob?.locality || 'Fairlands, Salem - 636016'}
                  </Typography>

                  <Alert severity="success" sx={{ mb: 1.5, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '11.5px', py: 0.5 }}>
                    <strong>₹99.00 Payment Confirmed via Razorpay Gateway:</strong> 100% credited to your wallet for Salem travel & fuel allowance. Call, Message, and GPS directions are now unlocked.
                  </Alert>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setCallOpen(true)}
                        sx={{ bgcolor: '#16A34A', borderRadius: '6px', py: 0.8, fontWeight: 600, fontSize: '12px', textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
                      >
                        Call (masked)
                      </Button>

                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setChatOpen(true)}
                        sx={{ bgcolor: '#2563EB', borderRadius: '6px', py: 0.8, fontWeight: 600, fontSize: '12px', textTransform: 'none', '&:hover': { bgcolor: '#1D4ED8' } }}
                      >
                        Message
                      </Button>
                    </Box>

                    {/* Doorstep Safety Security PIN Display for Technician */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: '#EFF6FF',
                        border: '1.5px solid #93C5FD',
                        borderRadius: '8px',
                        mt: 1.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <VerifiedUserIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E3A8A', fontSize: '12.5px' }}>
                            Your Doorstep Verification PIN (வாடிக்கையாளருக்கு கூற வேண்டிய PIN)
                          </Typography>
                        </Box>
                        <Chip label="Tell to Customer" size="small" sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 800, fontSize: '10px' }} />
                      </Box>

                      <Typography variant="caption" sx={{ color: '#1E40AF', fontSize: '11.5px', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                        When you reach the customer's house, the customer will ask you: <em>"What is your SalemSeva PIN?"</em>. Tell them the 4 digits below so they can verify your identity on their screen and let you inside.
                      </Typography>

                      {/* Prominent 4-Digit Display for Tech */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 1.5 }}>
                        {String(activeJob?.customer_otp || '4892').split('').map((digit, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 44,
                              height: 50,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#FFFFFF',
                              border: '2px solid #2563EB',
                              borderRadius: '8px',
                              fontWeight: 900,
                              fontSize: '22px',
                              color: '#0F172A',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                            }}
                          >
                            {digit}
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#FFFFFF', p: 1, borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', animation: 'pulse 1.5s infinite' }} />
                        <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                          Awaiting customer doorstep confirmation... Once customer verifies your PIN, inspection mode will unlock automatically.
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Card>
              </Box>
            )}

            {/* STEP 3: DIAGNOSTIC & QUOTE */}
            {step === 3 && (
              <Box>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    p: 2,
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <AssignmentTurnedInIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                        Diagnostic inspection & quote
                      </Typography>
                    </Box>
                    <Chip 
                      label={activeJob?.status === 'quote_approved' ? 'Escrow Funded' : (quoteSent || activeJob?.status === 'quote_presented' ? 'Awaiting Customer' : 'Live Inspection')} 
                      size="small" 
                      sx={{ 
                        bgcolor: activeJob?.status === 'quote_approved' ? '#DCFCE7' : (quoteSent || activeJob?.status === 'quote_presented' ? '#FEF3C7' : '#EFF6FF'), 
                        color: activeJob?.status === 'quote_approved' ? '#166534' : (quoteSent || activeJob?.status === 'quote_presented' ? '#B45309' : '#2563EB'), 
                        fontWeight: 700, 
                        fontSize: '10px' 
                      }} 
                    />
                  </Box>

                  <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', mb: 1.5 }}>
                    {step3Quote?.items && step3Quote.items.length > 0 ? (
                      step3Quote.items.map((item, idx) => (
                        <Box key={item.id || idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>
                              {idx + 1}. {item.name}
                            </Typography>
                            {item.isOem && <span style={{ color: '#2563EB', fontSize: '10px', fontWeight: 700 }}>(OEM)</span>}
                            <Chip label={item.type === 'Spare Part' ? 'Tech Sourced' : item.type} size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontSize: '8.5px', height: 16, fontWeight: 700 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
                            ₹{(parseFloat(item.price) * (parseInt(item.qty, 10) || 1)).toFixed(2)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px', fontStyle: 'italic', py: 1 }}>
                        Diagnostic items ready in database. Click below to add or send line-item quote.
                      </Typography>
                    )}
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={() => navigate(`/partner/quote-builder?bookingId=${activeBookingId}`)}
                      sx={{ color: '#2563EB', borderColor: '#CBD5E1', borderRadius: '6px', fontWeight: 600, fontSize: '12px', textTransform: 'none' }}
                    >
                      + Add or edit parts quote
                    </Button>
                  </Box>

                  <Divider sx={{ my: 1.2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                      Total quote subtotal:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '15px' }}>
                      ₹{step3Quote?.subtotal ? parseFloat(step3Quote.subtotal).toFixed(2) : '0.00'}
                    </Typography>
                  </Box>

                  {/* STAGE A: SEND DIGITAL QUOTE TO CUSTOMER */}
                  {(!quoteSent && activeJob?.status !== 'quote_presented' && activeJob?.status !== 'quote_approved') && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                      onClick={async () => {
                        setLoadingMsg({
                          title: 'Sending digital job card to customer...',
                          subtitle: 'Customer will receive line-item quote for instant cashless escrow approval'
                        });
                        setIsProcessing(true);
                        try {
                          // Fetch latest database quote items if not in state
                          let quoteItemsPayload = step3Quote?.items || [];
                          if (quoteItemsPayload.length === 0) {
                            const qRes = await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/quote`);
                            const qData = await qRes.json();
                            if (qData.success && qData.items?.length > 0) {
                              quoteItemsPayload = qData.items;
                            }
                          }

                          // 1. Submit quote items to DB
                          await fetch('https://salemseva-backend.onrender.com/api/v1/partner/quote/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              bookingId: activeBookingId,
                              items: quoteItemsPayload,
                              partsMode: 'tech_buys'
                            })
                          });

                          // 2. Update status to quote_presented
                          await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'quote_presented' })
                          });

                          // 3. Update local state & dispatch cross-tab events
                          if (activeJob) {
                            setActiveJob(prev => ({ ...prev, status: 'quote_presented' }));
                          }
                          setQuoteSent(true);
                          localStorage.setItem('salemseva_quote_status_' + activeBookingId, 'quote_presented');
                          localStorage.setItem('salemseva_active_booking', activeBookingId);
                          window.dispatchEvent(new CustomEvent('salemseva_quote_updated', { detail: { bookingId: activeBookingId, status: 'quote_presented' } }));
                          window.dispatchEvent(new Event('storage'));
                        } catch (err) {
                          console.warn('Status update fallback:', err);
                        }
                        setTechToast('Digital quote sent to customer screen for approval!');
                        setTimeout(() => {
                          setIsProcessing(false);
                        }, 500);
                      }}
                      sx={{ bgcolor: '#0284C7', color: '#FFF', borderRadius: '6px', py: 1, fontWeight: 700, fontSize: '13px', textTransform: 'none', mb: 1.5, '&:hover': { bgcolor: '#0369A1' } }}
                    >
                      Send Digital Quote to Customer (வாடிக்கையாளருக்கு அனுப்பு) →
                    </Button>
                  )}

                  {/* STAGE B: WAITING FOR CUSTOMER APPROVAL */}
                  {(quoteSent || activeJob?.status === 'quote_presented') && activeJob?.status !== 'quote_approved' && (
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity="warning" 
                        sx={{ borderRadius: '8px', fontSize: '12px', mb: 1.5, bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}
                      >
                        ⏳ Digital quote (₹900.00) sent to customer. Waiting for customer approval & escrow authorization.
                      </Alert>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={async () => {
                          try {
                            await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/status`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'quote_approved' })
                            });
                          } catch (e) {}
                          if (activeJob) setActiveJob(prev => ({ ...prev, status: 'quote_approved' }));
                          setTechToast('Customer approved & escrow funded! Starting repair work.');
                        }}
                        sx={{ borderColor: '#0284C7', color: '#0284C7', borderRadius: '6px', fontWeight: 700, fontSize: '11.5px', textTransform: 'none' }}
                      >
                        Simulate Customer Approved & Escrow Funded
                      </Button>
                    </Box>
                  )}

                  {/* STAGE C: CUSTOMER APPROVED -> REPAIR COMPLETE & OTP SETTLEMENT */}
                  {(activeJob?.status === 'quote_approved') && (
                    <Alert 
                      severity="success" 
                      sx={{ borderRadius: '8px', fontSize: '12px', mb: 1.5, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
                    >
                      Customer Approved & Escrow Payment Secured! Perform repair work and ask customer for final Completion OTP.
                    </Alert>
                  )}

                  {/* Direct Job Completion & Payout Release Action */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={async () => {
                      setLoadingMsg({
                        title: 'Completing job & settling payment...',
                        subtitle: 'Settlement calculation: 100% Visit Fee (₹99) + 95% Labor/Parts to your UPI'
                      });
                      setIsProcessing(true);
                      try {
                        await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${activeBookingId}/status`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'completed' })
                        });
                      } catch (err) {
                        console.warn('Status update fallback:', err);
                      }
                      localStorage.removeItem('salemseva_partner_step');
                      localStorage.removeItem('salemseva_partner_active_job');
                      localStorage.setItem('salemseva_quote_status_' + activeBookingId, 'completed');
                      window.dispatchEvent(new CustomEvent('salemseva_status_updated', { detail: { bookingId: activeBookingId, status: 'completed' } }));
                      window.dispatchEvent(new Event('storage'));
                      setTechToast('Service completed! Instant UPI settlement disbursed.');
                      setTimeout(() => {
                        setIsProcessing(false);
                        setStep(1);
                      }, 600);
                    }}
                    sx={{ bgcolor: '#16A34A', borderRadius: '8px', py: 1.3, fontWeight: 800, fontSize: '14px', textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
                  >
                    Mark Work Completed & Release Instant Settlement (பணி முடிந்தது) 
                  </Button>
                </Card>
              </Box>
            )}

            {/* Weekly Summary */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                    Weekly earnings summary
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, cursor: 'pointer' }} onClick={() => setBottomNav(1)}>
                  View ledger
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                    This week (7 jobs)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                    ₹6,280
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '11px' }}>
                    Next payout date
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803D', fontSize: '14px' }}>
                    Friday, 11:00 AM
                  </Typography>
                </Paper>
              </Box>
            </Card>
          </Box>
        )}

        {/* ===================== TAB 1: INCENTIVES & REFER-A-TECH (பரிசுகள் & பரிந்துரை) ===================== */}
        {bottomNav === 1 && (
          <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                  டெக்னீசியன் போனஸ் & பரிந்துரை (Incentives Hub)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                  ₹250 per technician referral + 0% platform commission star rewards
                </Typography>
              </Box>
              <Chip
                icon={<StarsIcon sx={{ fontSize: '13px !important', color: '#166534 !important' }} />}
                label="Salem Partner Rewards"
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px' }}
              />
            </Box>

            {/* 1. Main Incentive Earnings Card */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                p: 2.2,
                mb: 2,
                boxShadow: '0 6px 20px rgba(4, 120, 87, 0.25)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    AVAILABLE INCENTIVE PAYOUT BALANCE
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{partnerIncentives?.availablePayout || 500}.00
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#FFFFFF !important', fontSize: 13 }} />}
                  label="Instant UPI Route"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 700, fontSize: '10px' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, my: 1 }}>
                <AccountBalanceIcon sx={{ color: '#A7F3D0', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '11.5px' }}>
                  Linked Settlement UPI: <strong>partner.pay@okaxis</strong>
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block', fontSize: '10px', fontWeight: 600 }}>
                    மொத்த பரிந்துரை வருமானம் (Total Earned)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                    ₹{partnerIncentives?.totalIncentiveEarned || 750}.00
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block', fontSize: '10px', fontWeight: 600 }}>
                    வங்கிக்கு வரவானது (Settled)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FDE047', fontSize: '14px' }}>
                    ₹{partnerIncentives?.settledPayout || 250}.00
                  </Typography>
                </Paper>
              </Box>

              {/* 1-Click Instant Payout Claim */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleClaimInstantPayout}
                disabled={!partnerIncentives?.availablePayout || partnerIncentives.availablePayout <= 0}
                sx={{
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  fontWeight: 900,
                  fontSize: '12.5px',
                  py: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                  '&:hover': { bgcolor: '#D97706' },
                  '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }
                }}
              >
                {partnerIncentives?.availablePayout > 0 
                  ? `Claim Instant ₹${partnerIncentives.availablePayout}.00 Payout to UPI`
                  : ' All Referral Incentives Settled'}
              </Button>
            </Card>

            {/* 2. Zero Commission Star Progression Banner */}
            <Card
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#FFFFFF',
                border: '1.5px solid #FCD34D',
                borderRadius: '12px',
                mb: 2,
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <StarsIcon sx={{ color: '#D97706', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                    Star Club: Zero Platform Cut Quest
                  </Typography>
                </Box>
                <Chip
                  label={partnerIncentives?.zeroCommUnlocked ? '0% Commission Unlocked!' : `${partnerIncentives?.starPoints || 24} / 30 Points`}
                  size="small"
                  sx={{
                    bgcolor: partnerIncentives?.zeroCommUnlocked ? '#DCFCE7' : '#FEF3C7',
                    color: partnerIncentives?.zeroCommUnlocked ? '#166534' : '#92400E',
                    fontWeight: 800,
                    fontSize: '10.5px'
                  }}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, (((partnerIncentives?.starPoints || 24) / 30) * 100))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#FEF3C7',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#D97706',
                    borderRadius: 4
                  },
                  mb: 1
                }}
              />

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                {partnerIncentives?.zeroCommUnlocked 
                  ? '100% Zero Commission active! You retain 100% of all customer labor & diagnostic payouts.'
                  : `Earn ${Math.max(0, 30 - (partnerIncentives?.starPoints || 24))} more Star Points to unlock 100% Zero Commission! (+2 pts per 5 rating, +3 pts per referred technician).`}
              </Typography>
            </Card>

            {/* 3. Refer-a-Technician Action Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #059669',
                borderRadius: '16px',
                p: 2.2,
                mb: 2,
                boxShadow: '0 2px 10px rgba(5, 150, 105, 0.06)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupAddIcon sx={{ color: '#059669', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14.5px' }}>
                    Refer a Technician in Salem
                  </Typography>
                </Box>
                <Chip
                  label="GET ₹250 / TECH"
                  size="small"
                  sx={{ bgcolor: '#DCFCE7', color: '#059669', fontWeight: 900, fontSize: '10.5px', height: 22 }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#475569', fontSize: '12px', lineHeight: 1.45, mb: 1.8 }}>
                Know skilled AC specialists, master electricians, or plumbers in Salem? Invite them with your partner code. You get <strong>₹250 instant cash incentive</strong> upon their KYC verification, and they receive a <strong>₹100 Welcome Tool Kit Bonus</strong>!
              </Typography>

              {/* Technician Referral Code Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  bgcolor: '#F0FDF4',
                  border: '1.5px dashed #059669',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '10px', fontWeight: 700 }}>
                    YOUR TECHNICIAN REFERRAL CODE:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#059669', letterSpacing: 1.5 }}>
                    {techReferralCode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCopyTechCode}
                    startIcon={copiedTechCode ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      bgcolor: copiedTechCode ? '#16A34A' : '#059669',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '11px',
                      px: 1.4,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#047857' }
                    }}
                  >
                    {copiedTechCode ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleShareTechWhatsApp}
                    startIcon={<WhatsAppIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      bgcolor: '#25D366',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '11px',
                      px: 1.4,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#128C7E' }
                    }}
                  >
                    WhatsApp
                  </Button>
                </Box>
              </Paper>

              {/* Test Simulation Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<CampaignIcon />}
                onClick={handleSimulateReferral}
                sx={{
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  py: 1.1,
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                Test: Simulate Referring a Fellow Specialist (+₹250 & +3 Pts)
              </Button>
            </Card>

            {/* 4. Referred Technicians Roster List */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                p: 2,
                mb: 2,
                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, fontSize: '13.5px' }}>
                Referred Technicians Roster ({referredTechsList.length} Partners)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {referredTechsList.map((t, idx) => (
                  <Paper
                    key={t.id || idx}
                    elevation={0}
                    sx={{
                      p: 1.2,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          bgcolor: '#DCFCE7',
                          color: '#166534',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <EngineeringIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                          {t.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                          {t.trade} • {t.locality} • {t.onboardedAt}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#16A34A', fontSize: '12.5px' }}>
                        +₹{t.incentiveAmount}.00
                      </Typography>
                      <Chip
                        label={t.payoutStatus === 'SETTLED_TO_UPI' ? 'Paid to UPI' : 'Ready to Claim'}
                        size="small"
                        sx={{
                          bgcolor: t.payoutStatus === 'SETTLED_TO_UPI' ? '#DCFCE7' : '#FEF3C7',
                          color: t.payoutStatus === 'SETTLED_TO_UPI' ? '#166534' : '#92400E',
                          fontWeight: 800,
                          fontSize: '9px',
                          height: 18
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Card>

            {/* Toast Notification */}
            <Snackbar
              open={Boolean(techToast)}
              autoHideDuration={4000}
              onClose={() => setTechToast(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity="success" onClose={() => setTechToast(null)} sx={{ borderRadius: '10px', fontWeight: 700 }}>
                {techToast}
              </Alert>
            </Snackbar>

          </Box>
        )}

        {/* ===================== TAB 2: PAY (வருமானம் & தீர்வு வரலாறு) ===================== */}
        {bottomNav === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                  வருமானம் & தீர்வு வரலாறு (Settlement Ledger)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                  Direct Razorpay Route bank payouts & escrow ledger
                </Typography>
              </Box>
              <Chip label="85% Tech Share" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '10.5px', borderRadius: '4px' }} />
            </Box>

            {/* 1. Main Earnings Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '12px',
                p: 2.2,
                mb: 2,
                border: '1px solid #1E293B'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '11px' }}>
                    மொத்த வருமானம் (Current Week Earnings)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#38BDF8', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{partnerJobs.length > 0 
                      ? partnerJobs.reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)
                      : '8,950.00'}
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#34D399 !important', fontSize: 13 }} />}
                  label="HDFC Auto-Route Active"
                  size="small"
                  sx={{ bgcolor: '#1E293B', color: '#34D399', fontWeight: 600, fontSize: '10px' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, my: 1 }}>
                <AccountBalanceIcon sx={{ color: '#34D399', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 500, fontSize: '11.5px' }}>
                  வங்கி கணக்கு: HDFC Bank • UPI: <strong>ramesh.tech@oksbi</strong>
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#334155', my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '10.5px' }}>
                    வங்கிக்கு வரவானது (Settled)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#34D399', fontSize: '13.5px' }}>
                    ₹{partnerJobs.length > 0
                      ? partnerJobs.filter(j => j.settlementStatus === 'SETTLED_TO_BANK').reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)
                      : '7,200.00'}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '10.5px' }}>
                    வெள்ளிக்கிழமை வரவு (Escrow)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FBBF24', fontSize: '13.5px' }}>
                    ₹{partnerJobs.length > 0
                      ? partnerJobs.filter(j => j.settlementStatus === 'ESCROW_HELD').reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)
                      : '1,750.00'}
                  </Typography>
                </Paper>
              </Box>
            </Card>

            {/* 2. Star Club Zero Commission Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                bgcolor: '#FFFBEB',
                border: '1px solid #FEF08A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <StarsIcon sx={{ color: '#D97706', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', fontSize: '12px' }}>
                  ஸ்டார் கிளப்: 85 / 100 புள்ளிகள் (15 புள்ளிகளில் 0% கமிஷன்)
                </Typography>
              </Box>
              <Chip label="Level: Gold" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '10px' }} />
            </Paper>

            {/* 3. Filter Tabs for Settlements */}
            <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
              {[
                { id: 'all', label: `All Jobs (${partnerJobs.length || 2})` },
                { id: 'settled', label: 'Settled to Bank (நேரடி வரவு)' },
                { id: 'escrow', label: 'Pending Escrow' }
              ].map(f => (
                <Chip
                  key={f.id}
                  label={f.label}
                  size="small"
                  onClick={() => setSettlementFilter(f.id)}
                  sx={{
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    bgcolor: settlementFilter === f.id ? '#0F172A' : '#FFFFFF',
                    color: settlementFilter === f.id ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: settlementFilter === f.id ? '#0F172A' : '#E2E8F0'
                  }}
                />
              ))}
            </Box>

            {/* 4. Itemized Job Settlement Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {partnerJobs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <ReceiptLongIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '15px', mb: 0.5 }}>
                    முடிக்கப்பட்ட ஆர்டர்கள் இல்லை (No Completed Jobs Yet)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
                    When you accept and complete customer requests, your itemized payouts, 85% tech share, and direct bank settlements will appear here.
                  </Typography>
                </Paper>
              ) : (
                partnerJobs
                  .filter((job) => {
                    if (settlementFilter === 'settled') return job.settlementStatus === 'SETTLED_TO_BANK';
                    if (settlementFilter === 'escrow') return job.settlementStatus === 'ESCROW_HELD';
                    return true;
                  })
                  .map((job) => (
                    <Card
                      key={job.id}
                      elevation={0}
                      sx={{
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        p: 1.8,
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                            <Chip label={`#${job.id}`} size="small" sx={{ bgcolor: '#2563EB', color: '#FFF', fontWeight: 700, fontSize: '10px', height: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                              {job.serviceName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, display: 'block', fontSize: '11px', mb: 0.2 }}>
                            Worked On: {formatDateTime(job.completedAt || job.created_at)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                            Customer: <strong>{job.customerName}</strong> • {job.locality}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#16A34A', fontSize: '15px' }}>
                            +₹{job.techPayout.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px', display: 'block' }}>
                            Tech share (85%)
                          </Typography>
                        </Box>
                      </Box>

                      {/* Financial Breakdown Grid */}
                      <Paper elevation={0} sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', mb: 1.2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#475569', mb: 0.3 }}>
                          <span>Customer Gross Bill:</span>
                          <strong>₹{job.grossAmount.toFixed(2)}</strong>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#16A34A', mb: 0.3 }}>
                          <span>Technician Payout (95% + Travel):</span>
                          <strong>₹{job.techPayout.toFixed(2)}</strong>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                          <span>SalemSeva Platform Commission (5%):</span>
                          <span>₹{job.platformCommission.toFixed(2)}</span>
                        </Box>
                      </Paper>

                      {/* Settlement Status Banner */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0.8,
                          px: 1.2,
                          bgcolor: job.settlementStatus === 'SETTLED_TO_BANK' ? '#F0FDF4' : '#EFF6FF',
                          border: '1px solid',
                          borderColor: job.settlementStatus === 'SETTLED_TO_BANK' ? '#BBF7D0' : '#BFDBFE',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <CheckCircleIcon sx={{ color: job.settlementStatus === 'SETTLED_TO_BANK' ? '#16A34A' : '#2563EB', fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: job.settlementStatus === 'SETTLED_TO_BANK' ? '#166534' : '#1E40AF', fontSize: '11px' }}>
                            {job.settlementStatus === 'SETTLED_TO_BANK' 
                              ? `Settled to Bank (UPI: ${job.settlementUpi})` 
                              : 'Held in Escrow • Releasing Friday 11 AM'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                          {job.bankRef}
                        </Typography>
                      </Paper>

                      {/* Customer Review if present */}
                      {job.customerReview && (
                        <Box sx={{ bgcolor: '#FFFBEB', p: 0.8, px: 1, borderRadius: '6px', border: '1px solid #FEF08A', mb: 1, display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
                          <StarIcon sx={{ color: '#D97706', fontSize: 14, mt: 0.2 }} />
                          <Typography variant="caption" sx={{ color: '#92400E', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.3 }}>
                            "{job.customerReview}"
                          </Typography>
                        </Box>
                      )}

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ReceiptLongIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setSelectedSlipJob(job)}
                        sx={{
                          color: '#2563EB',
                          borderColor: '#CBD5E1',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '11.5px',
                          py: 0.4,
                          textTransform: 'none',
                          '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                        }}
                      >
                        View digital settlement slip & tax receipt
                      </Button>
                    </Card>
                  ))
              )}
            </Box>
          </Box>
        )}

        {/* DIGITAL SETTLEMENT SLIP MODAL */}
        <Dialog open={Boolean(selectedSlipJob)} onClose={() => setSelectedSlipJob(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFF', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <ReceiptLongIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>
                Technician Payout Settlement Slip
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedSlipJob(null)} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </DialogTitle>

          {selectedSlipJob && (
            <DialogContent sx={{ p: 2, bgcolor: '#F8FAFC' }}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10.5px' }}>
                  BOOKING REFERENCE & SERVICE
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                  #{selectedSlipJob.id} • {selectedSlipJob.serviceName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, display: 'block', mt: 0.4 }}>
                  Service Date & Time: {formatDateTime(selectedSlipJob.completedAt || selectedSlipJob.created_at)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.2 }}>
                  Customer: {selectedSlipJob.customerName} ({selectedSlipJob.locality})
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', mb: 0.8, fontSize: '11px' }}>
                ITEMIZED SETTLEMENT CALCULATION:
              </Typography>

              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #E2E8F0', fontSize: '12px' }}>
                  <span>Customer Gross Payment</span>
                  <strong>₹{selectedSlipJob.grossAmount.toFixed(2)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #E2E8F0', fontSize: '12px', color: '#16A34A' }}>
                  <span>Technician Base Share (95%)</span>
                  <strong>₹{((selectedSlipJob.grossAmount - 99) * 0.95).toFixed(2)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #E2E8F0', fontSize: '12px', color: '#16A34A' }}>
                  <span>100% Visit & Travel Allowance</span>
                  <strong>₹99.00</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #E2E8F0', fontSize: '12px', color: '#DC2626' }}>
                  <span>SalemSeva Platform Cut (5%)</span>
                  <span>-₹{selectedSlipJob.platformCommission.toFixed(2)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, mt: 0.5, fontSize: '13.5px', color: '#0F172A' }}>
                  <strong>Net Bank Deposit:</strong>
                  <strong style={{ color: '#16A34A' }}>₹{selectedSlipJob.techPayout.toFixed(2)}</strong>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block', fontSize: '11px' }}>
                  Transfer Method: Razorpay Route Direct Transfer
                </Typography>
                <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '10.5px', mt: 0.2 }}>
                  Settled into: HDFC Bank (UPI: {selectedSlipJob.settlementUpi}) • Ref: {selectedSlipJob.bankRef}
                </Typography>
              </Paper>
            </DialogContent>
          )}

          <DialogActions sx={{ p: 1.5, bgcolor: '#FFF', borderTop: '1px solid #E2E8F0' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => {
                alert('Settlement slip receipt downloaded / printed successfully.');
                setSelectedSlipJob(null);
              }}
              sx={{ bgcolor: '#0F172A', color: '#FFF', borderRadius: '6px', fontWeight: 600, fontSize: '12px', textTransform: 'none' }}
            >
              Print / Save Settlement Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===================== TAB 2: HELP (உதவி) ===================== */}
        {bottomNav === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '18px' }}>
                டெக்னீசியன் உதவி மையம் (Technician support)
              </Typography>
              <Chip label="Salem hub available" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '11px', borderRadius: '4px' }} />
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PhoneIcon />}
              onClick={() => alert('சேலம் மத்திய மேனேஜர் ஆனந்திற்கு அவசர அழைப்பு மேற்கொள்ளப்படுகிறது... 0427-2448888')}
              sx={{
                bgcolor: '#2563EB',
                borderRadius: '8px',
                py: 1.2,
                fontWeight: 600,
                fontSize: '14px',
                mb: 2.5,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1D4ED8' }
              }}
            >
              சேலம் மேனேஜருக்கு அழைக்கவும் (Call manager)
            </Button>
          </Box>
        )}

        {/* ===================== TAB 3: PROFILE (சுயவிவரம்) ===================== */}
        {bottomNav === 3 && (
          <Box>
            {/* Top Page Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                  டெக்னீசியன் சுயவிவரம் (Partner Profile)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                  Technician ID: PRT-SLM-9428 • Salem Central Hub
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleIcon sx={{ color: '#047857 !important', fontSize: 13 }} />}
                label="Verified Pro"
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#047857', fontWeight: 700, fontSize: '11px', borderRadius: '4px' }}
              />
            </Box>

            {/* 1. Hero Identity Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '12px',
                p: 2,
                mb: 2,
                border: '1px solid #1E293B',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: '#2563EB',
                      fontSize: '22px',
                      fontWeight: 800,
                      border: '2px solid #38BDF8'
                    }}
                  >
                    KR
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      bgcolor: '#16A34A',
                      borderRadius: '50%',
                      border: '2px solid #0F172A'
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '16px' }}>
                      {user?.name || 'K. Ramesh (கே. ரமேஷ்)'}
                    </Typography>
                    <Chip label="Gold Partner" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '10px', height: 18 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 600, fontSize: '12px', mt: 0.2 }}>
                    Certified Senior HVAC & AC Specialist
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: '#1E293B', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                      <StarIcon sx={{ color: '#F59E0B', fontSize: 13 }} />
                      <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700, fontSize: '11px' }}>
                        4.9
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                        (428 reviews)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
                      Salem Hub • Fairlands
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#1E293B', my: 1.5 }} />

              {/* Quick Metrics Bar */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, textAlign: 'center' }}>
                <Box sx={{ bgcolor: '#1E293B', p: 0.8, borderRadius: '6px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                    Jobs Done
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', fontSize: '13px' }}>
                    428
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#1E293B', p: 0.8, borderRadius: '6px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                    On-Time
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: '13px' }}>
                    99.2%
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#1E293B', p: 0.8, borderRadius: '6px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                    Repeat Cust.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FBBF24', fontSize: '13px' }}>
                    94%
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#1E293B', p: 0.8, borderRadius: '6px' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                    Experience
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px' }}>
                    7+ Yrs
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* 2. Personal & Contact Information */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                <PersonIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                  தனிப்பட்ட & தொடர்பு விவரங்கள் (Contact Details)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Primary Phone (Registered):</span>
                  <strong style={{ color: '#0F172A' }}>+91 98427 89012</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Email Address:</span>
                  <strong style={{ color: '#0F172A' }}>ramesh.ac.salem@gmail.com</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Primary Skill / Category:</span>
                  <Chip label="AC Repair & HVAC Diagnostic" size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '11px', height: 20 }} />
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Secondary Skills:</span>
                  <strong style={{ color: '#0F172A' }}>Electrical Wiring, Inverter & MCB</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Working Languages:</span>
                  <strong style={{ color: '#0F172A' }}>தமிழ் (Tamil), English</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Blood Group (Emergency):</span>
                  <Chip label="O+ve (Registered)" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '10.5px', height: 20 }} />
                </Box>
              </Box>
            </Paper>

            {/* 3. Operational Hub & Localities */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
                <LocationOnIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                  பணிபுரியும் பகுதிகள் (Service Localities & Hub)
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                Base Hub: <strong>SalemSeva Fairlands Central Hub (Salem - 636016)</strong>
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
                {['Fairlands', 'Hasthampatti', 'Suramangalam', 'Alagapuram', 'Salem Junction', 'Ammapet', 'Meyyanur', 'Shevapet'].map((loc, idx) => (
                  <Chip
                    key={idx}
                    label={`${loc}`}
                    size="small"
                    sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '11px' }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#F8FAFC', p: 1, borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11.5px' }}>
                <span style={{ color: '#64748B' }}>Max Operating Radius:</span>
                <strong style={{ color: '#16A34A' }}>10 km (Fast 15-min doorstep arrival)</strong>
              </Box>
            </Paper>

            {/* 4. Government Verification & Badges */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                <VerifiedUserIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                  அரசு ஆவண சரிபார்ப்பு (Government Verified Badges)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', fontSize: '12px' }}>
                      Aadhaar Identity Verification
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', fontSize: '10.5px' }}>
                      UIDAI Biometric Verified • XXXX-XXXX-8901
                    </Typography>
                  </Box>
                  <Chip label="Verified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '10px', height: 20 }} />
                </Paper>

                <Paper elevation={0} sx={{ p: 1, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', fontSize: '12px' }}>
                      Police Background Clearance
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', fontSize: '10.5px' }}>
                      Salem City Police Record Clean • Clear 2026
                    </Typography>
                  </Box>
                  <Chip label="Passed" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '10px', height: 20 }} />
                </Paper>

                <Paper elevation={0} sx={{ p: 1, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', fontSize: '12px' }}>
                      Govt ITI Skill Certification
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', fontSize: '10.5px' }}>
                      Air Conditioning & Refrigeration Trade • Grade A+
                    </Typography>
                  </Box>
                  <Chip label="Certified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '10px', height: 20 }} />
                </Paper>
              </Box>
            </Paper>

            {/* 5. Bank Account & Settlement Routing */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                <AccountBalanceIcon sx={{ color: '#D97706', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                  வங்கி & கொடுப்பனவு கணக்கு (Bank & Payout Setup)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Primary Bank:</span>
                  <strong style={{ color: '#0F172A' }}>HDFC Bank - Fairlands Branch</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Account Holder:</span>
                  <strong style={{ color: '#0F172A' }}>K. RAMESH</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>UPI ID (Direct IMPS):</span>
                  <strong style={{ color: '#16A34A' }}>ramesh.tech@oksbi</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Settlement Model:</span>
                  <strong style={{ color: '#2563EB' }}>Razorpay Route (85% Technician Share)</strong>
                </Box>
              </Box>
            </Paper>

            {/* 6. Account Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                size="medium"
                startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/')}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  textTransform: 'none',
                  py: 1,
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
                }}
              >
                Switch to Customer Mode (வாடிக்கையாளர் பக்கம்)
              </Button>
            </Box>
          </Box>
        )}

      </Container>

      {/* Masked Chat Modal */}
      <MaskedChatModal 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        bookingId={activeBookingId}
        userRole="technician"
        peerName={activeJob?.customerName || 'Vimal Raj'} 
      />

      {/* Masked VoIP Call Modal */}
      <VoipCallModal 
        open={callOpen} 
        onClose={() => {
          setCallOpen(false);
          setIsIncomingCall(false);
        }} 
        bookingId={activeBookingId}
        calleeName={activeJob?.customerName || 'Vimal Raj (Customer)'} 
        role="Technician" 
        isIncoming={isIncomingCall}
      />

      {/* Instant Incoming Message Notification Banner */}
      <Snackbar
        open={Boolean(incomingMessageToast)}
        autoHideDuration={6000}
        onClose={() => setIncomingMessageToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 20, color: '#2563EB' }} />}
          action={
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setIncomingMessageToast(null);
                setChatOpen(true);
              }}
              sx={{ bgcolor: '#2563EB', color: '#FFF', fontSize: '11px', textTransform: 'none', py: 0.2 }}
            >
              Reply
            </Button>
          }
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #334155',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            alignItems: 'center'
          }}
        >
          <strong>{activeJob?.customerName || 'Customer'}:</strong> {incomingMessageToast}
        </Alert>
      </Snackbar>

      {/* Bottom Navigation */}
      <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, pb: 'max(env(safe-area-inset-bottom, 0px), 14px)' }}>
        <BottomNavigation
          showLabels
          value={bottomNav}
          onChange={(e, val) => setBottomNav(val)}
          sx={{ height: 56, '& .Mui-selected': { color: '#059669', fontWeight: 700 } }}
        >
          <BottomNavigationAction label="Duty" icon={<TwoWheelerIcon sx={{ fontSize: 20 }} />} />
          <BottomNavigationAction label="Incentives" icon={<CardGiftcardIcon sx={{ fontSize: 20 }} />} />
          <BottomNavigationAction label="Settlements" icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon sx={{ fontSize: 20 }} />} />
        </BottomNavigation>
      </Paper>

      {/* Transparent Customer Cancellation Notice Dialog */}
      <Dialog
        open={Boolean(cancellationNotice)}
        onClose={handleAcknowledgeCancellation}
        PaperProps={{
          sx: {
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #334155',
            maxWidth: 440,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, color: '#F87171' }}>
          <WarningAmberIcon sx={{ color: '#EF4444', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '16px' }}>
            Customer Cancelled Booking
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '13px', mb: 2, lineHeight: 1.5 }}>
            Customer <strong>{cancellationNotice?.customerName || 'Customer'}</strong> ({cancellationNotice?.locality || 'Fairlands, Salem'}) has cancelled booking <strong>#{cancellationNotice?.bookingId}</strong>.
          </Typography>

          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px' }}>
              TRANSPARENT SETTLEMENT & COMPENSATION BREAKDOWN
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, fontSize: '12.5px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Cancellation Reason:</span>
                <strong style={{ color: '#F1F5F9' }}>{cancellationNotice?.reason || 'Customer request'}</strong>
              </Box>
              <Divider sx={{ borderColor: '#334155', my: 0.4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8' }}>Travel & Fuel Compensation:</span>
                <strong style={{ color: '#34D399', fontSize: '13.5px' }}>
                  ₹{cancellationNotice?.technicianTravelDisbursal || 99}.00 (100%)
                </strong>
              </Box>
              <Divider sx={{ borderColor: '#334155', my: 0.4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Platform Commission:</span>
                <strong style={{ color: '#94A3B8' }}>₹0.00 (Zero cut)</strong>
              </Box>
            </Box>
          </Paper>

          <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#6EE7B7', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '8px', fontSize: '11px', py: 0.5 }}>
            ₹{cancellationNotice?.technicianTravelDisbursal || 99}.00 visit fee has been disbursed to your UPI. Your duty radar is unlocked for new leads.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAcknowledgeCancellation}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            Acknowledge & Continue Duty (வேலைக்கு திரும்புக)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Permission Request Dialog */}
      <Dialog 
        open={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 900, color: '#0F172A', pb: 1 }}>
          <LocationOnIcon sx={{ color: '#0284C7', fontSize: 24 }} />
          Location Access Required
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.5 }}>
            SalemSeva requires your device location <strong>only while you are ON DUTY</strong> to calculate live customer ETAs, doorstep route navigation in Salem, and dispatch nearby high-paying jobs.
          </Typography>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 700, display: 'block' }}>
              Privacy Guaranteed:
            </Typography>
            <Typography variant="caption" sx={{ color: '#0C4A6E', display: 'block' }}>
              Your location is never tracked when you go Offline. Turning duty off stops all GPS broadcasting immediately.
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => {
              setLocationModalOpen(false);
              setIsOnline(false);
              setIsGpsBroadcasting(false);
            }} 
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
          >
            Stay Offline
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setLocationModalOpen(false);
              setLocationPermission('granted');
              setIsOnline(true);
              setIsGpsBroadcasting(true);
              requestLocationPermission();
            }}
            sx={{ bgcolor: '#0284C7', color: '#FFF', fontWeight: 800, borderRadius: '8px', textTransform: 'none' }}
          >
            Allow Location & Go Online
          </Button>
        </DialogActions>
      </Dialog>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title={loadingMsg.title || 'Processing...'}
        subtitle={loadingMsg.subtitle || 'SalemSeva Partner Engine syncing state...'}
        badge="Real-time Dispatch"
      />

    </Box>
  );
}

