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
  ListItemText,
  TextField
} from '@mui/material';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import InputAdornment from '@mui/material/InputAdornment';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import MaskedChatModal from '../../components/MaskedChatModal';
import VoipCallModal from '../../components/VoipCallModal';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import DocumentUploadControl from '../../components/DocumentUploadControl';
import LeadAudioPlayer from '../../components/LeadAudioPlayer';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';
import SalemLottie from '../../components/SalemLottie';
import SupportTicketModal from '../../components/SupportTicketModal';
import { useAuth } from '../../context/AuthContext';
import { NativeNotifier } from '../../services/nativeNotify';
import { API_V1_URL } from '../../config';
import { resolveMediaUrl } from '../../utils/mediaUtils';

// Helper to strictly match job lead locality against technician's chosen operating areas
const isLeadInTechnicianLocalities = (lead, localities) => {
  if (!lead) return false;
  if (!localities || !Array.isArray(localities) || localities.length === 0) return true;
  
  const leadLoc = String(lead.locality || '').toLowerCase().trim();
  const leadAddr = String(lead.address || lead.service_address || lead.serviceAddress || '').toLowerCase().trim();

  return localities.some(rawLoc => {
    if (!rawLoc) return false;
    const clean = String(rawLoc).toLowerCase().trim();
    if (!clean) return false;

    // Direct match or substring
    if (leadLoc && (leadLoc === clean || leadLoc.includes(clean) || clean.includes(leadLoc))) return true;
    if (leadAddr && leadAddr.includes(clean)) return true;

    // Sub-tokens (e.g. "Suramangalam / Junction" -> "suramangalam", "junction")
    const parts = clean.split(/[\/,]+/).map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (leadLoc && (leadLoc === part || leadLoc.includes(part) || part.includes(leadLoc))) return true;
      if (leadAddr && leadAddr.includes(part)) return true;
    }
    return false;
  });
};

export default function PartnerDutyPage() {
  const navigate = useNavigate();
  const { user, techUser, updateUser, loginTech, logoutTech, loginAsTechnician, partnerIncentives, referTechnician, claimPartnerPayout, dbTechnicians, rewardSettings } = useAuth();

  // Strict Persistent Technician Identity Resolution (Independent localStorage key)
  const activeTech = techUser || (() => {
    try {
      const saved = localStorage.getItem('shazuone_tech_user');
      if (saved) return JSON.parse(saved);
      if (user && (user.role === 'technician' || user.role === 'partner')) return user;
      return null;
    } catch (e) {
      return null;
    }
  })();

  const activeTechLocalities = activeTech?.assigned_localities || activeTech?.assignedLocalities || user?.assigned_localities || user?.assignedLocalities || [];

  // If not authenticated as a technician, redirect to dedicated technician login
  useEffect(() => {
    if (!activeTech) {
      navigate('/partner/login', { replace: true });
    }
  }, [activeTech, navigate]);

  const partnerIncentiveAmount = parseFloat(rewardSettings?.partner_referral_incentive || 100);
  const partnerWelcomeBonus = parseFloat(rewardSettings?.partner_welcome_bonus || 50);
  const VERIFIED_TECHNICIANS = dbTechnicians || [];
  const [searchParams] = useSearchParams();
  const paramBookingId = searchParams.get('bookingId');
  const [techSwitcherAnchor, setTechSwitcherAnchor] = useState(null);

  const [copiedTechCode, setCopiedTechCode] = useState(false);
  const [techToast, setTechToast] = useState(null);
  const [supportTicketModalOpen, setSupportTicketModalOpen] = useState(false);

  const [referredTechsList, setReferredTechsList] = useState(partnerIncentives?.referredTechs || []);

  const techReferralCode = partnerIncentives?.referralCode || `TECH${(activeTech?.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8)}`;

  const handleCopyTechCode = () => {
    navigator.clipboard.writeText(techReferralCode);
    setCopiedTechCode(true);
    setTechToast(`Technician referral code ${techReferralCode} copied!`);
    setTimeout(() => setCopiedTechCode(false), 2500);
  };

  const handleShareTechWhatsApp = () => {
    const text = encodeURIComponent(
      `வணக்கம் நண்பா! சேலத்தில் தினசரி ₹1,500+ சம்பாதிக்க Shazu One-வில் டெக்னீசியனாக இணையுங்கள். \n\nஎனது ரெஃபரல் கோட் *${techReferralCode}* பயன்படுத்தி இணையும்போது உங்களுக்கு ₹${partnerWelcomeBonus} டூல் கிட் போனஸ் கிடைக்கும்: ${window.location.origin}/partner/onboarding`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleClaimInstantPayout = async () => {
    if (!partnerIncentives?.availablePayout || partnerIncentives.availablePayout <= 0) {
      setTechToast('No available incentive balance to claim right now.');
      return;
    }
    const amt = partnerIncentives.availablePayout;
    const payPhone = activeTech?.payoutPhone || activeTech?.phone?.replace(/[^0-9]/g, '').slice(-10) || '';
    const derivedPayout = payPhone ? `${payPhone}@ybl` : 'partner.pay@ybl';
    await claimPartnerPayout(derivedPayout);
    setReferredTechsList(prev => prev.map(t => ({ ...t, payoutStatus: 'SETTLED_TO_PHONE', phoneRef: `PHONE-${Math.floor(1000000 + Math.random() * 9000000)}-SALEM` })));
    setTechToast(`₹${amt}.00 successfully sent to your payout phone +91${payPhone}!`);
  };

  // Active verification determination: Checks database status flags across all sources
  const isVerified = Boolean(
    activeTech?.is_kyc_verified === true ||
    activeTech?.isKycVerified === true ||
    activeTech?.status === 'Verified' ||
    user?.is_kyc_verified === true ||
    user?.isKycVerified === true ||
    user?.status === 'Verified'
  );
  const isKycLocked = !isVerified;

  const [isOnline, setIsOnline] = useState(() => {
    if (!isVerified) {
      return false;
    }
    const saved = localStorage.getItem('shazuone_partner_is_online');
    if (saved !== null) return saved === 'true';
    if (activeTech && typeof activeTech.isOnline === 'boolean') return activeTech.isOnline;
    return false;
  });

  // Live Database Sync: Auto-detects admin approval without requiring technician to refresh or relogin
  useEffect(() => {
    const techPhone = activeTech?.phone || user?.phone;
    if (!techPhone) return;

    let isMounted = true;
    const syncTechnicianState = async () => {
      try {
        const techPhone = activeTech?.phone || user?.phone;
        const techId = activeTech?.id || user?.id || '';
        const cleanDigits = techPhone ? String(techPhone).replace(/[^0-9]/g, '').slice(-10) : '';
        const res = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(cleanDigits)}&technicianId=${encodeURIComponent(techId)}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.technician) {
          const t = data.technician;
          const isDbVerified = Boolean(t.is_kyc_verified ?? t.isKycVerified ?? (t.status === 'Verified'));
          const currentlyVerified = Boolean(
            activeTech?.is_kyc_verified === true ||
            activeTech?.isKycVerified === true ||
            activeTech?.status === 'Verified'
          );

          if (isDbVerified !== currentlyVerified || !activeTech?.id) {
            const updated = {
              ...(activeTech || user || {}),
              id: t.id,
              name: t.full_name || activeTech?.name,
              phone: t.phone || activeTech?.phone,
              trade: t.primary_trade || activeTech?.trade,
              tradeName: t.trade_name || activeTech?.tradeName,
              is_kyc_verified: isDbVerified,
              isKycVerified: isDbVerified,
              status: isDbVerified ? 'Verified' : 'Pending Verification',
              isOnline: Boolean(t.is_online),
              aadhaarCardUrl: t.aadhaar_card_url || activeTech?.aadhaarCardUrl
            };
            await loginTech(updated);
            updateUser(updated);
            localStorage.setItem('shazuone_tech_user', JSON.stringify(updated));
            if (isDbVerified) {
              setIsOnline(Boolean(t.is_online));
            }
          }
        }
      } catch (e) {
        // Silent sync
      }
    };

    syncTechnicianState();
    const interval = setInterval(syncTechnicianState, isKycLocked ? 4000 : 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeTech?.phone, user?.phone, isKycLocked]);

  // Strict KYC Duty Lock: unverified partners are barred from going online
  useEffect(() => {
    if (isKycLocked && isOnline) {
      setIsOnline(false);
      localStorage.setItem('shazuone_partner_is_online', 'false');
    }
  }, [isKycLocked, isOnline]);
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('shazuone_partner_step');
    return saved ? parseInt(saved, 10) : 1;
  }); // 1: Incoming Feed | 2: Active Trip | 3: Diagnostic & Quote
  const [bottomNav, setBottomNav] = useState(0); // 0: Duty | 1: Incentives & Referrals | 2: History & Pay | 3: Profile

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingMessageToast, setIncomingMessageToast] = useState(null);
  const [selectedCommunicationJob, setSelectedCommunicationJob] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoAnswer') === 'true') {
      setIsIncomingCall(true);
      setCallOpen(true);
    }
    const handleOpenActiveCall = (e) => {
      const job = e?.detail;
      if (job) setSelectedCommunicationJob(job);
      setIsIncomingCall(true);
      setCallOpen(true);
    };
    window.addEventListener('shazuone_open_active_call', handleOpenActiveCall);
    return () => window.removeEventListener('shazuone_open_active_call', handleOpenActiveCall);
  }, []);

  const handleOpenCall = (job) => {
    setSelectedCommunicationJob(job || activeJob);
    setCallOpen(true);
  };

  const handleOpenChat = (job) => {
    setSelectedCommunicationJob(job || activeJob);
    setChatOpen(true);
  };

  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  const lastMessageCountRef = useRef(-1);

  const [activeJob, setActiveJob] = useState(null);
  const [offlineJobRequest, setOfflineJobRequest] = useState(null);
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

  // Scheduled Leads & Direct Acceptance State
  const [activeDutyTab, setActiveDutyTab] = useState('live'); // 'live' | 'scheduled'
  const [openScheduledLeads, setOpenScheduledLeads] = useState([]);
  const [myScheduledJobs, setMyScheduledJobs] = useState([]);
  const [claimingBookingId, setClaimingBookingId] = useState(null);
  const [loadingScheduledLeads, setLoadingScheduledLeads] = useState(false);
  const prevScheduledCountRef = useRef(0);

  // Helper to determine if a scheduled slot is for today
  const isSlotToday = (slotText) => {
    if (!slotText) return true; // Instant booking or unscheduled slot is for today
    const s = String(slotText).toLowerCase();
    if (s.includes('today') || s.includes('இன்று') || s.includes('instant')) return true;
    const now = new Date();
    const isoDate = now.toISOString().slice(0, 10);
    if (s.includes(isoDate)) return true;
    const d1 = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
    const d2 = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toLowerCase();
    const dayName = now.toLocaleDateString('en-IN', { weekday: 'short' }).toLowerCase();
    return s.includes(d1) || s.includes(d2) || s.includes(dayName);
  };

  // Helper to determine if a scheduled slot is for tomorrow
  const isSlotTomorrow = (slotText) => {
    if (!slotText) return false;
    const s = String(slotText).toLowerCase();
    if (s.includes('tomorrow') || s.includes('நாளை')) return true;
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const isoTom = tom.toISOString().slice(0, 10);
    if (s.includes(isoTom)) return true;
    const d1 = tom.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
    const d2 = tom.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toLowerCase();
    const dayName = tom.toLocaleDateString('en-IN', { weekday: 'short' }).toLowerCase();
    return s.includes(d1) || s.includes(d2) || s.includes(dayName);
  };

  // Sound chime when new scheduled slot is assigned
  const playScheduledChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const todayDateISO = new Date().toISOString().split('T')[0];
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(todayDateISO);

  // Technician Reschedule / Delay Handover State
  const [techRescheduleModalOpen, setTechRescheduleModalOpen] = useState(false);
  const [techRescheduleJob, setTechRescheduleJob] = useState(null);
  const [techRescheduleMode, setTechRescheduleMode] = useState('propose_slot'); // 'propose_slot' | 'request_handover'
  const [techProposedDayIndex, setTechProposedDayIndex] = useState(0);
  const [techProposedTime, setTechProposedTime] = useState('02:00 PM - 04:00 PM');
  const [techRescheduleReason, setTechRescheduleReason] = useState('Previous customer service took longer than expected');
  const [techSubmittingReschedule, setTechSubmittingReschedule] = useState(false);

  const TECH_PROPOSE_REASONS = [
    'I am currently nearby in your locality and available earlier',
    'Earlier appointment slot opened up today',
    'Previous customer service took longer than expected',
    'Two-wheeler breakdown / repair on road',
    'Heavy traffic / rain delay in Salem',
    'Spare part procurement delay at market'
  ];

  const TECH_HANDOVER_REASONS = [
    'Unavoidable emergency / family obligation',
    'Sudden health / fever / medical issue',
    'Vehicle breakdown unable to ride today'
  ];

  const TECH_RESCHEDULE_TIME_SLOTS = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  // Month-by-Month Calendar Navigation State
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(y => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(y => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
    setCalendarSelectedDate(now.toISOString().split('T')[0]);
  };

  const currentMonthTitle = new Date(calendarYear, calendarMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Generate all days in the currently viewed month (Past, Today, and Future)
  const daysInSelectedMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthDaysList = Array.from({ length: daysInSelectedMonth }).map((_, i) => {
    const dayNum = i + 1;
    const d = new Date(calendarYear, calendarMonth, dayNum);
    const iso = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const compareDate = new Date(d);
    compareDate.setHours(0, 0, 0, 0);

    const isToday = compareDate.getTime() === todayDate.getTime();
    const isPast = compareDate.getTime() < todayDate.getTime();
    const isFuture = compareDate.getTime() > todayDate.getTime();

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const isYesterday = compareDate.getTime() === yesterdayDate.getTime();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const isTomorrow = compareDate.getTime() === tomorrowDate.getTime();

    const dayLabel = isToday
      ? 'TODAY'
      : isYesterday
      ? 'YEST'
      : isTomorrow
      ? 'TOM'
      : d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();

    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    const fullDateString = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return {
      dayNum,
      iso,
      dayLabel,
      monthLabel,
      fullDateString,
      isToday,
      isPast,
      isFuture
    };
  });

  // Upcoming 14-day window for technician reschedule modal
  const upcomingRescheduleDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const dayLabel = isToday ? 'TODAY' : isTomorrow ? 'TOM' : d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    return { offset: i, iso, dayLabel, dayNum, monthLabel, isToday };
  });

  // Helper to match a job's scheduledSlot or createdAt to an ISO date
  const jobMatchesDate = (job, targetIso) => {
    if (!job || !targetIso) return false;
    const slotStr = String(job.scheduledSlot || job.scheduled_slot || job.scheduledDate || job.scheduled_date || job.slot || '');
    
    // Direct ISO match (e.g., '2026-10-29')
    if (slotStr.includes(targetIso)) return true;
    if (job.scheduledDate === targetIso || job.scheduled_date === targetIso) return true;

    // Check if target matches today or tomorrow keywords
    const now = new Date();
    const nowIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (targetIso === nowIso && isSlotToday(slotStr)) return true;

    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomIso = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;
    if (targetIso === tomIso && slotStr.toLowerCase().includes('tomorrow')) return true;

    // Month and day name matching (e.g. '29 Oct', '29-Oct', 'Thu, 29 Oct')
    const [y, m, day] = targetIso.split('-').map(Number);
    const targetDate = new Date(y, m - 1, day);
    const dayNumStr = String(day);
    const monthShort = targetDate.toLocaleDateString('en-IN', { month: 'short' }).toLowerCase();
    const lowerSlot = slotStr.toLowerCase();

    if (lowerSlot.includes(monthShort)) {
      if (
        lowerSlot.includes(` ${dayNumStr} `) ||
        lowerSlot.includes(` ${dayNumStr},`) ||
        lowerSlot.includes(` ${dayNumStr} •`) ||
        lowerSlot.includes(` ${dayNumStr}-`) ||
        lowerSlot.includes(`${dayNumStr} ${monthShort}`) ||
        lowerSlot.includes(`${String(day).padStart(2, '0')} ${monthShort}`) ||
        lowerSlot.includes(`${monthShort} ${dayNumStr}`) ||
        lowerSlot.includes(`${monthShort} ${String(day).padStart(2, '0')}`)
      ) {
        return true;
      }
    }

    // Only fallback to createdAt if no scheduledSlot was provided (e.g. instant dispatch)
    if (!job.scheduledSlot && !job.scheduled_slot && (job.createdAt || job.created_at)) {
      const createdDate = new Date(job.createdAt || job.created_at);
      if (!isNaN(createdDate.getTime())) {
        const cIso = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
        if (cIso === targetIso) return true;
      }
    }

    return false;
  };

  const getJobStageIndex = (status) => {
    switch (status) {
      case 'created':
      case 'matching':
        return 0;
      case 'accepted':
        return 1;
      case 'en_route':
        return 2;
      case 'arrived':
      case 'inspecting':
        return 3;
      case 'quote_presented':
      case 'quote_approved':
      case 'in_progress':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  // Profile & KYC Update Modal State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(() => activeTech?.name || '');
  const [profilePayoutPhone, setProfilePayoutPhone] = useState(() => {
    const raw = activeTech?.payoutPhone || activeTech?.upi_vpa?.replace(/@.*$/, '') || '';
    return raw;
  });
  const [profileTrade, setProfileTrade] = useState(() => activeTech?.trade || 'ac');
  const [profileAadhaarUrl, setProfileAadhaarUrl] = useState(() => activeTech?.aadhaarCardUrl || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (activeTech) {
      if (activeTech.name) setProfileName(activeTech.name);
      if (activeTech.payoutPhone || activeTech.upi_vpa) {
        const raw = activeTech.payoutPhone || activeTech.upi_vpa?.replace(/@.*$/, '') || '';
        setProfilePayoutPhone(raw);
      }
      if (activeTech.trade) setProfileTrade(activeTech.trade);
      if (activeTech.aadhaarCardUrl) setProfileAadhaarUrl(activeTech.aadhaarCardUrl);
    }
  }, [activeTech]);

  const handleOpenEditProfile = () => {
    setProfileName(activeTech?.name || '');
    const raw2 = activeTech?.payoutPhone || activeTech?.upi_vpa?.replace(/@.*$/, '') || '';
    setProfilePayoutPhone(raw2);
    setProfileTrade(activeTech?.trade || 'ac');
    setProfileAadhaarUrl(activeTech?.aadhaarCardUrl || null);
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    const cleanPayout = profilePayoutPhone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPayout.length < 10) {
      setTechToast('Please enter a valid 10-digit payout phone number');
      return;
    }
    const derivedUpi = `${cleanPayout}@ybl`;
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_V1_URL}/partner/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeTech?.phone,
          technicianId: activeTech?.id,
          fullName: profileName.trim() || activeTech?.name,
          upiId: derivedUpi,
          payoutPhone: cleanPayout,
          trade: profileTrade,
          aadhaarCardUrl: profileAadhaarUrl
        })
      });
      const data = await res.json();
      setIsSavingProfile(false);
      if (data.success && data.user) {
        updateUser(data.user);
        await loginTech(data.user);
        setTechToast('Profile & KYC documents updated successfully!');
        setEditProfileOpen(false);
      } else {
        const updated = {
          ...activeTech,
          name: profileName.trim() || activeTech?.name,
          payoutPhone: cleanPayout,
          upi_vpa: derivedUpi,
          trade: profileTrade,
          aadhaarCardUrl: profileAadhaarUrl
        };
        updateUser(updated);
        await loginTech(updated);
        setTechToast('Profile updated!');
        setEditProfileOpen(false);
      }
    } catch (err) {
      setIsSavingProfile(false);
      const updated2 = {
        ...activeTech,
        name: profileName.trim() || activeTech?.name,
        payoutPhone: cleanPayout,
        upi_vpa: derivedUpi,
        trade: profileTrade,
        aadhaarCardUrl: profileAadhaarUrl
      };
      updateUser(updated);
      await loginTech(updated);
      setTechToast('Profile updated locally!');
      setEditProfileOpen(false);
    }
  };

  // Helper to send coordinates to Shazu One backend
  const broadcastLocation = async (lat, lng, speed = 25) => {
    try {
      const phone = activeTech?.phone || user?.phone || '';
      if (!phone) return;
      await fetch(`${API_V1_URL}/partner/duty/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          technicianId: activeTech?.id || user?.id,
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
    fetch(`${API_V1_URL}/partner/jobs/history`)
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
      return JSON.parse(localStorage.getItem('shazuone_ack_cancels') || '[]');
    } catch (e) {
      return [];
    }
  });

  const handleAcknowledgeCancellation = () => {
    if (cancellationNotice) {
      const updated = [...acknowledgedCancelIds, cancellationNotice.bookingId];
      setAcknowledgedCancelIds(updated);
      localStorage.setItem('shazuone_ack_cancels', JSON.stringify(updated));
    }
    setCancellationNotice(null);
    setActiveJob(null);
    setStep(1);
    localStorage.removeItem('shazuone_partner_step');
    localStorage.removeItem('shazuone_partner_active_job');
  };

  // Poll real active job & synchronized duty state from Neon DB
  useEffect(() => {
    let isMounted = true;

    const fetchDuty = async () => {
      try {
        const phone = activeTech?.phone || user?.phone || '';
        const techId = activeTech?.id || user?.id || '';
        if (!phone && !techId) return;
        const res = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(phone)}&technicianId=${encodeURIComponent(techId)}`);
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.technician && typeof data.technician.is_online === 'boolean') {
            setIsOnline(data.technician.is_online);
            localStorage.setItem('shazuone_partner_is_online', data.technician.is_online ? 'true' : 'false');
            if (updateUser && user && user.isOnline !== data.technician.is_online) {
              updateUser({ isOnline: data.technician.is_online });
            }
          }

          // Track offline job request dispatched by admin
          if (data.offlineJobRequest) {
            setOfflineJobRequest(data.offlineJobRequest);
          } else {
            setOfflineJobRequest(null);
          }

          // Sync technician's accepted scheduled appointments
          if (data.myScheduledJobs) {
            setMyScheduledJobs(data.myScheduledJobs);
            if (prevScheduledCountRef.current !== 0 && data.myScheduledJobs.length > prevScheduledCountRef.current) {
              playScheduledChime();
              setTechToast('புதிய முன்பதிவு அட்டவணை ஒதுக்கப்பட்டது (New scheduled appointment assigned to you)!');
            }
            prevScheduledCountRef.current = data.myScheduledJobs.length;
          }

          // Check if customer cancelled an assigned job
          if (data.cancelNotice && !acknowledgedCancelIds.includes(data.cancelNotice.bookingId)) {
            setCancellationNotice(data.cancelNotice);
            setActiveJob(null);
            setStep(1);
            localStorage.removeItem('shazuone_partner_step');
            localStorage.removeItem('shazuone_partner_active_job');
          } else if (data.technician?.is_online === false) {
            setActiveJob(null);
          } else if (data.activeJob) {
            const techLocs = (data.technician && (data.technician.assigned_localities || data.technician.assignedLocalities)) || activeTechLocalities;
            const st = data.activeJob.status;
            // Unassigned matching broadcast leads must strictly match technician's chosen operational areas
            const isMatchLocality = (st !== 'matching') || isLeadInTechnicianLocalities(data.activeJob, techLocs);
            if (!isMatchLocality) {
              setActiveJob(null);
              setStep(1);
              localStorage.removeItem('shazuone_partner_step');
              localStorage.removeItem('shazuone_partner_active_job');
            } else {
              setActiveJob(data.activeJob);
              localStorage.setItem('shazuone_partner_active_job', data.activeJob.id);
              // Lock session into corresponding stage based on actual journey status
              const isScheduled = data.activeJob.bookingType === 'scheduled' || Boolean(data.activeJob.scheduledSlot);
              if (st === 'matching') {
                setStep(1);
              } else if (st === 'en_route') {
                setStep(2);
                localStorage.setItem('shazuone_partner_step', '2');
              } else if (['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'in_progress'].includes(st)) {
                setStep(3);
                localStorage.setItem('shazuone_partner_step', '3');
              } else if (st === 'accepted' || st === 'preparing') {
                // Scheduled appointments stay on Step 1 (Schedule Dashboard) until transit is started
                if (isScheduled) {
                  setStep(1);
                  localStorage.setItem('shazuone_partner_step', '1');
                } else {
                  // Instant bookings in transit
                  const savedStep = localStorage.getItem('shazuone_partner_step');
                  if (savedStep === '2') {
                    setStep(2);
                  } else {
                    setStep(1);
                  }
                }
              } else if (st === 'completed') {
                setActiveJob(null);
                setStep(1);
                localStorage.removeItem('shazuone_partner_step');
                localStorage.removeItem('shazuone_partner_active_job');
              }
            }
          } else {
            // Check if there is an in-transit or on-site job in myScheduledJobs
            const scheduledInTransit = (data.myScheduledJobs || []).find(j => 
              ['en_route', 'arrived', 'inspecting', 'quote_presented', 'quote_approved', 'in_progress'].includes(j.status)
            );
            if (scheduledInTransit) {
              setActiveJob(scheduledInTransit);
              localStorage.setItem('shazuone_partner_active_job', scheduledInTransit.id);
              if (scheduledInTransit.status === 'en_route') {
                setStep(2);
                localStorage.setItem('shazuone_partner_step', '2');
              } else if (['arrived', 'inspecting', 'quote_presented', 'quote_approved', 'in_progress'].includes(scheduledInTransit.status)) {
                setStep(3);
                localStorage.setItem('shazuone_partner_step', '3');
              } else {
                setStep(1);
              }
            } else {
              // No jobs in transit or on-site; technician stays on Step 1 (Multi-Order Queue)
              setStep(1);
              localStorage.setItem('shazuone_partner_step', '1');
              const firstScheduled = (data.myScheduledJobs || []).find(j => ['accepted', 'preparing'].includes(j.status));
              if (firstScheduled) {
                setActiveJob(firstScheduled);
                localStorage.setItem('shazuone_partner_active_job', firstScheduled.id);
              } else {
                setActiveJob(null);
                localStorage.removeItem('shazuone_partner_active_job');
              }
            }
          }
        }
      } catch (err) {
        console.warn('Partner duty poll:', err);
      }
    };

    fetchDuty();
    const interval = setInterval(fetchDuty, 1200);

    const handleSync = () => fetchDuty();
    window.addEventListener('shazuone_new_booking_created', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('shazuone_new_booking_created', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [activeTech?.phone, user?.phone, acknowledgedCancelIds]);

  // Fetch Open Scheduled Leads (Autonomous Technician Visibility & Direct Claiming)
  const fetchScheduledLeads = async () => {
    try {
      const phone = activeTech?.phone || user?.phone || '';
      if (!phone) return;
      setLoadingScheduledLeads(true);
      const res = await fetch(`${API_V1_URL}/partner/scheduled-leads?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success && data.leads) {
        const techLocs = activeTechLocalities;
        const filteredLeads = isLeadInTechnicianLocalities ? data.leads.filter(lead => isLeadInTechnicianLocalities(lead, techLocs)) : data.leads;
        setOpenScheduledLeads(filteredLeads);
      }
    } catch (err) {
      console.warn('Scheduled leads fetch note:', err);
    } finally {
      setLoadingScheduledLeads(false);
    }
  };

  useEffect(() => {
    fetchScheduledLeads();
    const schedInterval = setInterval(fetchScheduledLeads, 4000);
    const handleSync = () => fetchScheduledLeads();
    window.addEventListener('shazuone_new_booking_created', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      clearInterval(schedInterval);
      window.removeEventListener('shazuone_new_booking_created', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [activeTech?.phone, user?.phone]);

  // Direct Acceptance of Open Scheduled Requests (No Central Admin Approval Required)
  const handleClaimScheduledSlot = async (leadId) => {
    setClaimingBookingId(leadId);
    try {
      const res = await fetch(`${API_V1_URL}/partner/duty/accept-scheduled-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeTech?.phone || user?.phone || '',
          technicianId: activeTech?.id || user?.id,
          bookingId: leadId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTechToast(`Scheduled booking #${leadId} claimed directly! Check 'My Accepted Upcoming Appointments'.`);
        await fetchScheduledLeads();
        try {
          const ph = activeTech?.phone || user?.phone || '';
          const tid = activeTech?.id || user?.id || '';
          if (ph || tid) {
            const dRes = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(ph)}&technicianId=${encodeURIComponent(tid)}`);
            const dJson = await dRes.json();
            if (dJson.success) {
              if (dJson.myScheduledJobs) {
                setMyScheduledJobs(dJson.myScheduledJobs);
              }
              if (dJson.activeJob) {
                setActiveJob(dJson.activeJob);
              } else if (dJson.myScheduledJobs) {
                const claimed = dJson.myScheduledJobs.find(j => String(j.id) === String(leadId));
                if (claimed) {
                  setActiveJob(claimed);
                }
              }
            }
          }
        } catch (e) {}
      } else {
        setTechToast(data.error || data.message || 'Could not claim this booking. Please try another.');
        await fetchScheduledLeads();
      }
    } catch (e) {
      setTechToast('Server error while claiming slot. Please try again.');
    } finally {
      setIsProcessing(false);
      setClaimingBookingId(null);
    }
  };

  // Pass / Decline Open Scheduled Lead for this technician for today (other customer requests unaffected)
  const handlePassScheduledLead = async (leadId) => {
    try {
      await fetch(`${API_V1_URL}/partner/bookings/${leadId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: user?.id,
          reason: 'Technician passed scheduled slot'
        })
      });
      setTechToast('Scheduled request passed. This customer will not be shown to you for the rest of today. Other customer requests remain active.');
      fetchScheduledLeads();
    } catch (e) {
      console.warn('Pass scheduled lead note:', e);
      fetchScheduledLeads();
    }
  };

  // Start Trip to customer doorstep for a scheduled or accepted booking
  const handleStartTripForJob = async (jobId) => {
    setIsProcessing(true);
    setLoadingMsg({
      title: 'பயணம் தொடங்குகிறது...',
      subtitle: 'Starting live GPS transit to customer doorstep'
    });
    try {
      const techId = activeTech?.id || user?.id;
      const techPhone = activeTech?.phone || user?.phone;
      const res = await fetch(`${API_V1_URL}/bookings/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'en_route',
          technicianId: techId,
          technicianPhone: techPhone
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTechToast(data.error || 'Failed to start transit');
        return;
      }
      setIsOnline(true);
      setIsGpsBroadcasting(true);
      localStorage.setItem('shazuone_partner_is_online', 'true');
      if (updateUser) updateUser({ isOnline: true });
      localStorage.setItem('shazuone_partner_active_job', jobId);
      localStorage.setItem('shazuone_partner_step', '2');
      setActiveJob(data.booking || { id: jobId, status: 'en_route', technician_id: techId });
      setStep(2);
      setTechToast('பயணம் தொடங்கியது! நேரலை GPS வழித்தடம் திறக்கப்பட்டது (Journey started! GPS live navigation active).');
      broadcastLocation(liveGps.lat, liveGps.lng, 25);
    } catch (e) {
      console.warn('Start trip note:', e);
      setTechToast('Network error while starting transit');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update pacing status: Gathering tools & diagnostic equipment
  const handlePrepareJob = async (jobId) => {
    try {
      const techId = activeTech?.id || user?.id;
      const techPhone = activeTech?.phone || user?.phone;
      await fetch(`${API_V1_URL}/bookings/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'preparing',
          technicianId: techId,
          technicianPhone: techPhone
        })
      });
      setMyScheduledJobs(prev => (prev || []).map(j => String(j.id) === String(jobId) ? { ...j, status: 'preparing' } : j));
      setTechToast('உபகரணங்கள் தயார் செய்யப்படுகின்றன (Tools & equipment ready. Customer notified).');
    } catch (e) {
      console.warn('Prepare job note:', e);
    }
  };

  // Technician Reschedule Modal Opener
  const handleOpenTechReschedule = (job) => {
    setTechRescheduleJob(job);
    setTechRescheduleMode('propose_slot');
    setTechProposedDayIndex(0);
    setTechProposedTime('02:00 PM - 04:00 PM');
    setTechRescheduleReason(TECH_PROPOSE_REASONS[0]);
    setTechRescheduleModalOpen(true);
  };

  // Submit Technician Reschedule Proposal or Central Ops Handover
  const handleSubmitTechReschedule = async () => {
    if (!techRescheduleJob) return;
    setTechSubmittingReschedule(true);
    try {
      let payload = {
        mode: techRescheduleMode,
        reason: techRescheduleReason,
        technicianId: user?.id
      };
      if (techRescheduleMode === 'propose_slot') {
        const dObj = upcomingRescheduleDays[techProposedDayIndex] || upcomingRescheduleDays[0];
        const dateStr = dObj.isToday ? `Today, ${dObj.dayNum} ${dObj.monthLabel}` : `${dObj.dayLabel}, ${dObj.dayNum} ${dObj.monthLabel}`;
        payload.proposedSlot = `${dateStr} • ${techProposedTime}`;
      }

      const res = await fetch(`${API_V1_URL}/partner/bookings/${techRescheduleJob.id}/reschedule-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTechToast(data.message || 'Reschedule request submitted successfully');
        setTechRescheduleModalOpen(false);
        if (user?.phone) {
          const dRes = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(user.phone)}`);
          const dJson = await dRes.json();
          if (dJson.success && dJson.myScheduledJobs) {
            setMyScheduledJobs(dJson.myScheduledJobs);
          }
        }
      } else {
        setTechToast(data.error || 'Failed to submit reschedule request');
      }
    } catch (err) {
      setTechToast('Network error while requesting reschedule');
    } finally {
      setTechSubmittingReschedule(false);
    }
  };

  // Emergency / Reassignment for Scheduled Appointment
  const handleReassignScheduledJob = async (jobId) => {
    if (!window.confirm('இந்த முன்பதிவை ரத்து செய்து சேலம் தலைமை அலுவலகத்திற்கு மாற்ற விரும்புகிறீர்களா? (Release this slot back to Central Ops for re-dispatch)?')) {
      return;
    }
    setIsProcessing(true);
    try {
      await fetch(`${API_V1_URL}/partner/bookings/${jobId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: user?.id,
          reason: 'Technician requested reassignment for scheduled appointment'
        })
      });
      setTechToast('முன்பதிவு தலைமை அலுவலகத்திற்கு மாற்றப்பட்டது (Slot released back to Central Ops queue).');
      setMyScheduledJobs(prev => prev.filter(j => j.id !== jobId));
      await fetchScheduledLeads();
    } catch (e) {
      setTechToast('Error releasing slot. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const storedPartnerJob = localStorage.getItem('shazuone_partner_active_job');
  const storedActiveBooking = localStorage.getItem('shazuone_active_booking');
  const activeBookingId = (activeJob?.id && activeJob.id !== 'null') 
    ? activeJob.id 
    : ((paramBookingId && paramBookingId !== 'null') 
      ? paramBookingId 
      : (storedPartnerJob || storedActiveBooking || 'SLM-84920'));

  const [step3Quote, setStep3Quote] = useState(null);

  useEffect(() => {
    if (step === 3 && activeBookingId) {
      fetch(`${API_V1_URL}/bookings/${activeBookingId}/quote`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStep3Quote(data);
          }
        })
        .catch(err => console.warn('Step 3 quote fetch note:', err));
    }
  }, [step, activeBookingId]);

  const [partsBillUrl, setPartsBillUrl] = useState(activeJob?.partsBillUrl || null);
  const [partsBillAmount, setPartsBillAmount] = useState(activeJob?.partsBillAmount ? String(activeJob.partsBillAmount) : '');

  useEffect(() => {
    if (activeJob?.partsBillUrl) {
      setPartsBillUrl(activeJob.partsBillUrl);
      if (activeJob.partsBillAmount) setPartsBillAmount(String(activeJob.partsBillAmount));
    } else if (activeBookingId) {
      fetch(`${API_V1_URL}/partner/bookings/${activeBookingId}/bill`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (data.billUrl) setPartsBillUrl(data.billUrl);
            if (data.billAmount) setPartsBillAmount(String(data.billAmount));
          }
        })
        .catch(() => {});
    }
  }, [activeJob?.partsBillUrl, activeJob?.partsBillAmount, activeBookingId]);

  const handleBillUploadSuccess = async (url) => {
    setPartsBillUrl(url);
    const amt = parseFloat(partsBillAmount) || (step3Quote?.subtotal || 650);
    try {
      await fetch(`${API_V1_URL}/partner/bookings/${activeBookingId}/upload-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: url,
          billAmount: amt,
          fileName: `parts_bill_${activeBookingId}.jpg`
        })
      });
      setTechToast(`உதிரிபாகங்கள் கடை பில் (₹${amt}) வெற்றிகரமாக பதிவேற்றப்பட்டது! (Parts bill uploaded & attached)`);
    } catch (e) {
      console.warn('Bill sync note:', e);
    }
  };

  const handleUpdateBillAmount = async () => {
    if (!partsBillUrl) {
      setTechToast('தயவுசெய்து முதலில் கடை ரசீது புகைப்படத்தை பதிவேற்றவும் (Please upload bill receipt photo first).');
      return;
    }
    const amt = parseFloat(partsBillAmount) || 0;
    if (amt <= 0) {
      setTechToast('சரியான கடை பில் தொகையை உள்ளிடவும் (Please enter valid bill amount in ₹).');
      return;
    }
    try {
      await fetch(`${API_V1_URL}/partner/bookings/${activeBookingId}/upload-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: partsBillUrl,
          billAmount: amt,
          fileName: `parts_bill_${activeBookingId}.jpg`
        })
      });
      setTechToast(`கடை பில் தொகை ₹${amt} சேமிக்கப்பட்டது! வாடிக்கையாளருக்கு பில் + 5% கட்டணம் காண்பிக்கப்படும்.`);
    } catch (e) {
      console.warn('Bill amount update error:', e);
    }
  };

  // Real-time VoIP Call & Chat Notification Poller from Customer
  useEffect(() => {
    let isMounted = true;

    const pollPartnerCommunications = async () => {
      try {
        // 1. Check for incoming VoIP calls from customer
        const callRes = await fetch(`${API_V1_URL}/webrtc/call/status?bookingId=${activeBookingId}`);
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
        const msgRes = await fetch(`${API_V1_URL}/bookings/${activeBookingId}/messages`);
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
    if (checked && (!user?.isKycVerified || user?.status === 'Pending Verification')) {
      setTechToast('ஆதார் KYC இன்னும் அங்கீகரிக்கப்படவில்லை. நிர்வாகி ஒப்புதல் அளித்த பிறகே Online செல்ல முடியும். (Aadhaar KYC pending admin verification).');
      setIsOnline(false);
      return;
    }

    if (checked) {
      // 1. Ask device location permission when technician goes online
      setIsOnline(true);
      setIsGpsBroadcasting(true);
      localStorage.setItem('shazuone_partner_is_online', 'true');
      if (updateUser) {
        updateUser({ isOnline: true });
      }
      requestLocationPermission();
    } else {
      // 2. Going offline -> Stop location broadcasting immediately
      setIsOnline(false);
      setIsGpsBroadcasting(false);
      localStorage.setItem('shazuone_partner_is_online', 'false');
      if (updateUser) {
        updateUser({ isOnline: false });
      }
      setTechToast('Duty turned OFF. Location broadcasting stopped.');
    }

    if (user?.phone) {
      fetch(`${API_V1_URL}/partner/duty/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: checked, phone: user.phone })
      }).catch(err => console.warn('Duty toggle synced'));
    }
  };

  const handleAcceptOfflineRequest = async (bookingId) => {
    setIsProcessing(true);
    setLoadingMsg({
      title: 'நிர்வாக கோரிக்கையை ஏற்கிறது...',
      subtitle: 'Connecting to Shazu One Central Ops & Switching Duty to Online'
    });
    try {
      const res = await fetch(`${API_V1_URL}/partner/duty/accept-offline-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          phone: user?.phone,
          technicianId: user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(true);
        setIsGpsBroadcasting(true);
        localStorage.setItem('shazuone_partner_is_online', 'true');
        if (updateUser) {
          updateUser({ isOnline: true });
        }
        const isScheduled = offlineJobRequest?.bookingType === 'scheduled' || Boolean(offlineJobRequest?.scheduledSlot);
        setOfflineJobRequest(null);
        if (isScheduled) {
          setStep(1);
          localStorage.setItem('shazuone_partner_step', '1');
          setTechToast('Scheduled appointment accepted and confirmed in your calendar queue.');
        } else {
          setStep(2); // Go directly to En Route active job navigation for instant jobs
          localStorage.setItem('shazuone_partner_step', '2');
          setTechToast('கோரிக்கை ஏற்கப்பட்டது! நீங்கள் இப்போது ஆன்லைனில் உள்ளீர்கள். வாடிக்கையாளர் இருப்பிடத்திற்கு புறப்படவும்.');
        }
      } else {
        setTechToast(data.error || 'Failed to accept offline request');
      }
    } catch (e) {
      setTechToast('Network error accepting offline request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineOfflineRequest = async (bookingId) => {
    try {
      await fetch(`${API_V1_URL}/partner/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: user?.id,
          reason: 'Technician currently unavailable / offline'
        })
      });
      setOfflineJobRequest(null);
      setTechToast('கோரிக்கை நிராகரிக்கப்பட்டது (Request declined).');
    } catch (e) {
      setOfflineJobRequest(null);
    }
  };

  if (!activeTech) {
    return (
      <Box sx={{ bgcolor: '#0B1120', minHeight: '100vh', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #334155', bgcolor: '#1E293B' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(2, 132, 199, 0.15)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <EngineeringIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '18px', mb: 1 }}>
              Technician Portal Access
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.5, mb: 3 }}>
              Please sign in with your verified technician credentials to access duty radar and customer dispatches.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/partner/login')}
              sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 700, borderRadius: '10px', py: 1.2, mb: 1.5, textTransform: 'none', '&:hover': { bgcolor: '#0369A1' } }}
            >
              Partner Sign In - உள்நுழைக
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/partner/onboarding')}
              sx={{ color: '#38BDF8', fontSize: '12px', fontWeight: 600, textTransform: 'none' }}
            >
              New Partner? Register for Onboarding - புதிய பதிவு &rarr;
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
        
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
            Settlements ({partnerJobs.length})
          </Button>
        </Box>

        {/* ===================== TAB 0: DUTY (வேலை) ===================== */}
        {bottomNav === 0 && (
          <Box>
            {/* Real Production KYC Gate Warning Card */}
            {isKycLocked && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: '8px',
                  bgcolor: '#FFFBEB',
                  border: '1.5px solid #F59E0B',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <ShieldIcon sx={{ color: '#D97706', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '13.5px' }}>
                      ஆதார் KYC சரிபார்ப்பு நிலுவையில் உள்ளது (Aadhaar KYC Under Review)
                    </Typography>
                  </Box>
                  <Chip
                    icon={<HourglassTopIcon sx={{ fontSize: '13px !important', color: '#B45309 !important' }} />}
                    label="APPROVAL PENDING"
                    size="small"
                    sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '10px' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#78350F', fontSize: '12px', mb: 1.2, lineHeight: 1.5 }}>
                  உங்கள் ஆதார் அட்டை மற்றும் தொழில் விவரங்கள் சேலம் தலைமை நிர்வாக அலுவலகத்திற்கு (Shazu One Central Operations Desk) சரிபார்ப்புக்கு அனுப்பப்பட்டுள்ளது. 12 மணி நேரத்திற்குள் சரிபார்த்து உங்களுக்குத் தெரிவிக்கப்படும். நிர்வாகி ஒப்புதல் அளித்தவுடன் உங்களது Duty Radar தானாகவே இயங்கும்.
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '6px', px: 1.2, py: 0.4, mb: 1.2 }}>
                  <AccessTimeIcon sx={{ fontSize: 13, color: '#B45309' }} />
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, fontSize: '11px' }}>
                    12 மணி நேரத்திற்குள் சரிபார்க்கப்படும் • Review Turnaround: Within 12 Hours
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#92400E', fontSize: '11px', display: 'block', mb: 1.5 }}>
                  * We will review all your submitted registration details within 12 hours and let you know. Duty access will unlock immediately upon approval.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(activeTech?.aadhaarCardUrl || activeTech?.aadhaar_card_url) && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptLongIcon sx={{ fontSize: 14 }} />}
                      onClick={() => window.open(resolveMediaUrl(activeTech.aadhaarCardUrl || activeTech.aadhaar_card_url), '_blank')}
                      sx={{
                        borderColor: '#D97706',
                        color: '#92400E',
                        fontWeight: 700,
                        fontSize: '11px',
                        borderRadius: '6px',
                        textTransform: 'none',
                        py: 0.4
                      }}
                    >
                      Uploaded Aadhaar Preview
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                    onClick={async () => {
                      try {
                        const phone = activeTech?.phone || user?.phone || '';
                        if (!phone) return;
                        const res = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(phone)}`);
                        const data = await res.json();
                        if (data.success && data.technician) {
                          const isVerified = Boolean(data.technician.is_kyc_verified);
                          const updated = {
                            ...activeTech,
                            status: isVerified ? 'Verified' : 'Pending Verification',
                            isKycVerified: isVerified,
                            is_kyc_verified: isVerified,
                            isOnline: data.technician.is_online
                          };
                          updateUser(updated);
                          await loginTech(updated);
                          localStorage.setItem('shazuone_tech_user', JSON.stringify(updated));
                          setIsOnline(data.technician.is_online);
                          if (isVerified) {
                            setTechToast('வாழ்த்துகள்! உங்கள் ஆதார் KYC அங்கீகரிக்கப்பட்டது. நீங்கள் இப்போது பணியைத் தொடங்கலாம்!');
                          } else {
                            setTechToast('ஆதார் KYC இன்னும் நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கிறது (Still pending admin approval).');
                          }
                        }
                      } catch (e) {
                        setTechToast('Could not reach server to check KYC status.');
                      }
                    }}
                    sx={{
                      bgcolor: '#D97706',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '11px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      py: 0.4,
                      '&:hover': { bgcolor: '#B45309' }
                    }}
                  >
                    Check Status Now
                  </Button>
                </Box>
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
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: (isOnline && activeTech?.isKycVerified && activeTech?.status !== 'Pending Verification') ? '#16A34A' : '#DC2626' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                    {(!activeTech?.isKycVerified || activeTech?.status === 'Pending Verification') 
                      ? 'Duty Locked • Complete KYC to Go Online'
                      : (isOnline ? 'Online • Ready for jobs' : 'Offline')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px' }}>
                    Zone: {activeTech?.serviceArea || 'Fairlands & Hasthampatti'}
                  </Typography>
                </Box>
              </Box>
              <Switch 
                disabled={!activeTech?.isKycVerified || activeTech?.status === 'Pending Verification' || step === 2 || step === 3}
                checked={Boolean(isOnline && activeTech?.isKycVerified && activeTech?.status !== 'Pending Verification')} 
                onChange={(e) => {
                  if (step === 2 || step === 3) return;
                  handleToggleOnline(e.target.checked);
                }} 
                color="primary" 
              />
            </Paper>


            {/* 1.2 Shazu One 3-Stage Escrow & Settlement Protocol Card */}
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
                  Shazu One Instant Settlement Protocol (3-Stage Escrow)
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
                onClick={() => {
                  setStep(1);
                  localStorage.setItem('shazuone_partner_step', '1');
                }}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 1 ? '#FFFFFF' : 'transparent',
                  color: step === 1 ? '#0F172A' : '#64748B',
                  border: step === 1 ? '1px solid #E2E8F0' : 'none',
                  boxShadow: step === 1 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  textTransform: 'none',
                  cursor: 'pointer'
                }}
              >
                1. Orders & Schedule
              </Button>
              <Button
                disabled={step !== 2 && !(activeJob && (activeJob.status === 'accepted' || activeJob.status === 'en_route'))}
                onClick={() => {
                  setStep(2);
                  localStorage.setItem('shazuone_partner_step', '2');
                }}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 2 ? '#FFFFFF' : 'transparent',
                  color: step === 2 ? '#0F172A' : '#94A3B8',
                  border: step === 2 ? '1px solid #E2E8F0' : 'none',
                  boxShadow: step === 2 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  textTransform: 'none',
                  cursor: (step === 2 || (activeJob && (activeJob.status === 'accepted' || activeJob.status === 'en_route'))) ? 'pointer' : 'not-allowed',
                  '&.Mui-disabled': {
                    color: '#94A3B8',
                    cursor: 'not-allowed',
                    bgcolor: 'transparent',
                    border: 'none',
                    opacity: 0.6
                  }
                }}
              >
                2. In transit / Map
              </Button>
              <Button
                disabled={step !== 3}
                onClick={() => {
                  if (step !== 3) return;
                  setStep(3);
                }}
                sx={{
                  flex: 1,
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  py: 0.5,
                  bgcolor: step === 3 ? '#FFFFFF' : 'transparent',
                  color: step === 3 ? '#0F172A' : '#94A3B8',
                  border: step === 3 ? '1px solid #E2E8F0' : 'none',
                  boxShadow: step === 3 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  textTransform: 'none',
                  cursor: step === 3 ? 'default' : 'not-allowed',
                  '&.Mui-disabled': {
                    color: '#94A3B8',
                    cursor: 'not-allowed',
                    bgcolor: 'transparent',
                    border: 'none',
                    opacity: 0.6
                  }
                }}
              >
                3. Diagnostic & quote
              </Button>
            </Box>

            {/* 3. Technician Profile Bar with 1-Click Specialist Switcher & Logout */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: '8px', bgcolor: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EngineeringIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px', lineHeight: 1.2 }}>
                        {activeTech?.name || user?.name || 'Partner'}
                      </Typography>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#16A34A !important', fontSize: 13 }} />}
                        label="Salem Verified"
                        size="small"
                        sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '10px', height: 18 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '11px', display: 'block' }}>
                      {activeTech?.tradeName || `${activeTech?.trade?.toUpperCase() || 'SERVICE'} Specialist`} - {activeTech?.phone || ''}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Dedicated Support Ticket Desk Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSupportTicketModalOpen(true)}
                    startIcon={<HelpOutlineIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderColor: '#93C5FD',
                      color: '#0066CC',
                      bgcolor: '#EFF6FF',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11px',
                      py: 0.5,
                      px: 1,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#DBEAFE', borderColor: '#60A5FA' }
                    }}
                  >
                    Support Desk
                  </Button>

                  {/* 1-Click Switch Profile Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => setTechSwitcherAnchor(e.currentTarget)}
                    startIcon={<SwapHorizIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderColor: '#CBD5E1',
                      color: '#0F172A',
                      bgcolor: '#F8FAFC',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11px',
                      py: 0.5,
                      px: 1,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
                    }}
                  >
                    Switch Tech
                  </Button>

                  {/* Dedicated Technician Logout Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      await logoutTech();
                      navigate('/partner/login', { replace: true });
                    }}
                    startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderColor: '#FCA5A5',
                      color: '#DC2626',
                      bgcolor: '#FEF2F2',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11px',
                      py: 0.5,
                      px: 1,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#FEE2E2', borderColor: '#EF4444' }
                    }}
                  >
                    Logout
                  </Button>
                </Box>
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
                const isCurrent = (activeTech?.id === tech.id) || (activeTech?.name === tech.name);
                return (
                  <MenuItem
                    key={tech.id}
                    onClick={async () => {
                      await loginTech(tech);
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
                {isKycLocked ? (
                  /* Dedicated KYC Verification Pending Locked State (Partner cannot start work before KYC approved) */
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      p: 3.5,
                      mb: 2,
                      border: '2px solid #F59E0B',
                      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.18)',
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: 'rgba(245, 158, 11, 0.15)',
                        border: '2px dashed #F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <ShieldIcon sx={{ color: '#FBBF24', fontSize: 38 }} />
                    </Box>

                    <Chip
                      icon={<HourglassTopIcon sx={{ fontSize: '13px !important', color: '#92400E !important' }} />}
                      label="ஆதார் KYC சரிபார்ப்பு நிலுவையில் உள்ளது • APPROVAL PENDING"
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '11px', mb: 1.5, py: 0.5, px: 1 }}
                    />

                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: '16px', mb: 0.8 }}>
                      பணி தொடங்குவதற்கு முன் KYC சரிபார்ப்பு அவசியம் (Duty Access Locked)
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '12.5px', maxWidth: 440, mx: 'auto', mb: 1.5, lineHeight: 1.6 }}>
                      சேலம் தலைமை நிர்வாக அலுவலகம் (Shazu One Central Operations) 12 மணி நேரத்திற்குள் உங்கள் ஆதார் அட்டை மற்றும் தொழில் விவரங்களை சரிபார்த்து உங்களுக்குத் தெரிவிக்கும். சரிபார்ப்பிற்குப் பிறகு உங்கள் Duty Dashboard திறக்கப்படும்.
                    </Typography>

                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', px: 2, py: 0.6, mb: 2.2 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: '#FBBF24' }} />
                      <Typography variant="caption" sx={{ color: '#FDE68A', fontWeight: 800, fontSize: '11.5px' }}>
                        12 மணி நேரத்திற்குள் சரிபார்க்கப்படும் • We will review within 12 hours and let you know
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {(user?.aadhaarCardUrl || user?.aadhaar_card_url || activeTech?.aadhaarCardUrl || activeTech?.aadhaar_card_url) && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptLongIcon sx={{ fontSize: 15 }} />}
                          onClick={() => window.open(resolveMediaUrl(user?.aadhaarCardUrl || user?.aadhaar_card_url || activeTech?.aadhaarCardUrl || activeTech?.aadhaar_card_url), '_blank')}
                          sx={{
                            borderColor: '#F59E0B',
                            color: '#FDE68A',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: 1.8,
                            py: 0.6
                          }}
                        >
                          View Uploaded Aadhaar
                        </Button>
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                        onClick={async () => {
                          try {
                            const phone = user?.phone || activeTech?.phone || '';
                            if (!phone) return;
                            const cleanDigits = String(phone).replace(/[^0-9]/g, '').slice(-10);
                            const res = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(cleanDigits)}`);
                            const data = await res.json();
                            if (data.success && data.technician) {
                              const isVerified = Boolean(data.technician.is_kyc_verified);
                              const updatedUser = {
                                ...(activeTech || user || {}),
                                ...data.technician,
                                name: data.technician.full_name || activeTech?.name,
                                status: isVerified ? 'Verified' : 'Pending Verification',
                                isKycVerified: isVerified,
                                is_kyc_verified: isVerified,
                                isOnline: data.technician.is_online
                              };
                              await loginTech(updatedUser);
                              updateUser(updatedUser);
                              localStorage.setItem('shazuone_tech_user', JSON.stringify(updatedUser));
                              setIsOnline(data.technician.is_online);
                              if (isVerified) {
                                setTechToast('Congratulations! Your partner account is approved by admin. You can now go online and accept doorstep jobs!');
                              } else {
                                setTechToast('Aadhaar KYC is still under admin verification review.');
                              }
                            }
                          } catch (e) {
                            setTechToast('Could not reach server to check KYC status.');
                          }
                        }}
                        sx={{
                          bgcolor: '#D97706',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '11.5px',
                          borderRadius: '8px',
                          textTransform: 'none',
                          px: 2.2,
                          py: 0.6,
                          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                          '&:hover': { bgcolor: '#B45309' }
                        }}
                      >
                        Check Approval Status Now
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  <Box>
                    {/* Duty Mode Sub-Navigation Tabs - Accessible Both Online & Offline */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', bgcolor: '#0F172A', p: 0.6, borderRadius: '10px', border: '1px solid #1E293B', gap: 0.8 }}>
                        <Button
                          onClick={() => setActiveDutyTab('live')}
                          startIcon={<WhatshotIcon sx={{ fontSize: 18, color: activeDutyTab === 'live' ? '#F59E0B' : '#94A3B8' }} />}
                          sx={{
                            borderRadius: '8px',
                            py: 0.9,
                            fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)',
                            fontWeight: 700,
                            bgcolor: activeDutyTab === 'live' ? '#1E293B' : 'transparent',
                            color: activeDutyTab === 'live' ? '#FFFFFF' : '#94A3B8',
                            border: activeDutyTab === 'live' ? '1px solid #334155' : 'none',
                            textTransform: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: activeDutyTab === 'live' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                            '&:hover': { bgcolor: '#1E293B', color: '#FFFFFF' }
                          }}
                        >
                          Live Dispatches
                          {activeJob && (
                            <Box sx={{ ml: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E' }} />
                          )}
                        </Button>

                        <Button
                          onClick={() => {
                            setActiveDutyTab('scheduled');
                            fetchScheduledLeads();
                          }}
                          startIcon={<CalendarMonthIcon sx={{ fontSize: 18, color: activeDutyTab === 'scheduled' ? '#38BDF8' : '#94A3B8' }} />}
                          sx={{
                            borderRadius: '8px',
                            py: 0.9,
                            fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)',
                            fontWeight: 700,
                            bgcolor: activeDutyTab === 'scheduled' ? '#1E293B' : 'transparent',
                            color: activeDutyTab === 'scheduled' ? '#FFFFFF' : '#94A3B8',
                            border: activeDutyTab === 'scheduled' ? '1px solid #334155' : 'none',
                            textTransform: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: activeDutyTab === 'scheduled' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                            '&:hover': { bgcolor: '#1E293B', color: '#FFFFFF' }
                          }}
                        >
                          Scheduled Requests
                          {((openScheduledLeads?.length || 0) + (myScheduledJobs ? myScheduledJobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length : 0)) > 0 && (
                            <Chip
                              label={(openScheduledLeads?.length || 0) + (myScheduledJobs ? myScheduledJobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length : 0)}
                              size="small"
                              sx={{
                                ml: 0.8,
                                bgcolor: '#0284C7',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '11px',
                                height: 20,
                                minWidth: 20
                              }}
                            />
                          )}
                        </Button>
                      </Box>
                    </Box>

                    {/* TAB 1: LIVE RADAR DISPATCHES */}
                    {activeDutyTab === 'live' && (
                      !isOnline ? (
                        offlineJobRequest ? (
                          /* Priority Direct Job Dispatch Request from Salem Central Admin (Technician Offline) */
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
                                <BoltIcon sx={{ color: '#F59E0B', fontSize: 22 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FEF08A', fontSize: '13.5px' }}>
                                  நிர்வாக நேரடி கோரிக்கை • Admin Dispatch Request
                                </Typography>
                              </Box>
                              <Chip
                                label="OFFLINE PRIORITY"
                                size="small"
                                sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '10px', height: 20 }}
                              />
                            </Box>

                            <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '12px', mb: 2, py: 0.6 }}>
                              <strong>சேலம் தலைமை அலுவலக அறிவிப்பு:</strong> வாடிக்கையாளருக்கு அவசர உதவி தேவைப்படுகிறது. நீங்கள் இந்த வேலையை ஏற்றுக்கொண்டால் உங்கள் நிலை <strong>தானாகவே ONLINE</strong> ஆக மாற்றப்பட்டு வாடிக்கையாளர் முகவரி திறக்கப்படும்.
                            </Alert>

                            {/* Job Overview */}
                            <Paper elevation={0} sx={{ p: 1.8, bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                                    {offlineJobRequest.customerName || 'Customer'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon sx={{ fontSize: 13, color: '#38BDF8' }} />
                                    {offlineJobRequest.locality || 'Fairlands, Salem'}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`Booking #${offlineJobRequest.id}`}
                                  size="small"
                                  sx={{ bgcolor: '#334155', color: '#CBD5E1', fontSize: '10.5px', fontWeight: 700 }}
                                />
                              </Box>

                              <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '12.5px', bgcolor: '#0F172A', p: 1.2, borderRadius: '6px', border: '1px solid #334155', mb: 1.5 }}>
                                <strong>தேவை:</strong> {offlineJobRequest.issueDescription || 'Service Diagnostics & Inspection'}
                              </Typography>

                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                <Box sx={{ bgcolor: '#0F172A', p: 1, borderRadius: '6px', border: '1px solid #334155' }}>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                                    TRAVEL & VISIT FEE:
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ color: '#34D399', fontWeight: 800, fontSize: '13px' }}>
                                    ₹{offlineJobRequest.visitFee || 99}.00 (Guaranteed)
                                  </Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#0F172A', p: 1, borderRadius: '6px', border: '1px solid #334155' }}>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', display: 'block' }}>
                                    DISPATCH MODE:
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ color: '#38BDF8', fontWeight: 800, fontSize: '13px' }}>
                                    Admin Allocated
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>

                            {/* Action CTA Buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleAcceptOfflineRequest(offlineJobRequest.id)}
                                startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                  bgcolor: '#16A34A',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '13px',
                                  py: 1.2,
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                                  '&:hover': { bgcolor: '#15803D' }
                                }}
                              >
                                ஏற்றுக்கொண்டு ஆன்லைன் வரவும் (Accept & Go Online)
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleDeclineOfflineRequest(offlineJobRequest.id)}
                                sx={{
                                  borderColor: '#475569',
                                  color: '#94A3B8',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  px: 2,
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  '&:hover': { borderColor: '#EF4444', color: '#EF4444' }
                                }}
                              >
                                தவிர்க்கவும்
                              </Button>
                            </Box>
                          </Card>
                        ) : (
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

                            {/* Scheduled Work Notification on Login / Offline */}
                            {((openScheduledLeads?.length > 0) || (myScheduledJobs?.some(j => !['completed', 'cancelled'].includes(j.status)))) && (
                              <Box
                                onClick={() => {
                                  setActiveDutyTab('scheduled');
                                  fetchScheduledLeads();
                                }}
                                sx={{
                                  bgcolor: '#1E293B',
                                  border: '1.5px solid #0284C7',
                                  borderRadius: '10px',
                                  p: 1.5,
                                  mb: 2.5,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: '#24334C', borderColor: '#38BDF8' }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>
                                      Scheduled Jobs & Requests Available
                                    </Typography>
                                    <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                      {(myScheduledJobs?.filter(j => !['completed', 'cancelled'].includes(j.status)).length || 0)} upcoming appointments • {(openScheduledLeads?.length || 0)} open requests
                                    </Typography>
                                  </Box>
                                </Box>
                                <Button size="small" sx={{ textTransform: 'none', fontSize: '11.5px', fontWeight: 800, color: '#38BDF8', minWidth: 'auto', p: 0.5 }}>
                                  View Agenda &gt;
                                </Button>
                              </Box>
                            )}

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
                        )
                      ) : (
                        <Box>
                        {/* UPCOMING / TODAY'S SCHEDULED APPOINTMENT BANNER */}
                        {myScheduledJobs && myScheduledJobs.length > 0 && (() => {
                          const activeScheduledJobs = myScheduledJobs.filter(j => !['completed', 'cancelled'].includes(j.status));
                          if (activeScheduledJobs.length === 0) return null;
                          const todayJob = activeScheduledJobs.find(j => isSlotToday(j.scheduledSlot));
                          const nextJob = todayJob || activeScheduledJobs[0];
                          if (activeJob && String(activeJob.id) === String(nextJob.id)) return null;
                          const isToday = Boolean(todayJob || isSlotToday(nextJob.scheduledSlot));

                          return (
                            <Card
                              elevation={0}
                              sx={{
                                bgcolor: isToday ? '#064E3B' : '#0F172A',
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                p: 2,
                                mb: 2,
                                border: isToday ? '2px solid #10B981' : '1.5px solid #0284C7',
                                boxShadow: isToday ? '0 4px 20px rgba(16, 185, 129, 0.3)' : '0 4px 16px rgba(2, 132, 199, 0.2)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, flexWrap: 'wrap', gap: 0.8 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <EventIcon sx={{ color: isToday ? '#34D399' : '#38BDF8', fontSize: 20 }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isToday ? '#A7F3D0' : '#E0F2FE', fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)' }}>
                                    {isToday ? "TODAY'S SCHEDULED APPOINTMENT • இன்றைய பணி" : "UPCOMING SCHEDULED BOOKING • முன்பதிவு"}
                                  </Typography>
                                </Box>
                                <Chip
                                  icon={<ScheduleIcon sx={{ fontSize: '13px !important', color: isToday ? '#065F46 !important' : '#0369A1 !important' }} />}
                                  label={nextJob.scheduledSlot || 'Scheduled'}
                                  size="small"
                                  sx={{
                                    bgcolor: isToday ? '#A7F3D0' : '#BAE6FD',
                                    color: isToday ? '#064E3B' : '#0C4A6E',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    height: 22
                                  }}
                                />
                              </Box>

                              <Typography variant="body2" sx={{ color: '#F1F5F9', mb: 1, fontWeight: 700, fontSize: 'clamp(0.8125rem, 1.8vw, 0.9rem)' }}>
                                {nextJob.customerName && !/^\+?[0-9]{10,13}$/.test(String(nextJob.customerName).replace(/[\s\-]/g, '')) ? nextJob.customerName : 'Customer (Doorstep)'} • <span style={{ color: isToday ? '#6EE7B7' : '#7DD3FC' }}>{nextJob.locality || 'Fairlands, Salem'}</span>
                              </Typography>
                              
                              <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', mb: 1.5, fontSize: '11.5px' }}>
                                <strong>Issue:</strong> {nextJob.issueDescription || 'Diagnostic Inspection'} • <strong style={{ color: '#FDE047' }}>₹{nextJob.visitFee || 99} Escrow Paid</strong>
                              </Typography>

                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {isToday ? (
                                  <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleStartTripForJob(nextJob.id)}
                                    startIcon={<NavigationIcon sx={{ fontSize: 18 }} />}
                                    sx={{
                                      bgcolor: '#10B981',
                                      color: '#FFFFFF',
                                      fontWeight: 800,
                                      fontSize: 'clamp(0.8125rem, 1.8vw, 0.9rem)',
                                      py: 1,
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                                      '&:hover': { bgcolor: '#059669' }
                                    }}
                                  >
                                    Start Ride Now • சவாரி தொடங்கு (Live GPS)
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      disabled
                                      variant="contained"
                                      startIcon={<LockIcon sx={{ fontSize: 16 }} />}
                                      sx={{
                                        flex: 1,
                                        bgcolor: '#1E293B !important',
                                        color: '#94A3B8 !important',
                                        border: '1px solid #334155',
                                        fontWeight: 700,
                                        fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)',
                                        textTransform: 'none',
                                        py: 0.8,
                                        borderRadius: '8px'
                                      }}
                                    >
                                      Ride Unlocks on Appointment Day ({nextJob.scheduledSlot?.split('•')?.[0] || 'Scheduled Date'})
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => setActiveDutyTab('scheduled')}
                                      sx={{
                                        color: '#38BDF8',
                                        borderColor: '#0284C7',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        px: 1.5
                                      }}
                                    >
                                      View All ({myScheduledJobs.length})
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </Card>
                          );
                        })()}
                        {activeJob && activeJob.status === 'accepted' ? (
                          /* ACCEPTED & CONFIRMED JOB READY FOR TRANSIT */
                          <Card
                            elevation={0}
                            sx={{
                              bgcolor: '#0F172A',
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              p: 2.5,
                              mb: 2,
                              border: '2px solid #10B981',
                              boxShadow: '0 4px 24px rgba(16, 185, 129, 0.25)'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <CheckCircleIcon sx={{ color: '#10B981', fontSize: 22 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
                                  பணி உறுதி செய்யப்பட்டது (Job Accepted & Confirmed)
                                </Typography>
                              </Box>
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#065F46 !important' }} />}
                                label={`Ready • ₹${activeJob.visit_fee || activeJob.visitFee || 99} Visit Fee`}
                                size="small"
                                sx={{ bgcolor: '#D1FAE5', color: '#064E3B', fontWeight: 800, fontSize: '11px', height: 24 }}
                              />
                            </Box>

                            <Box sx={{ bgcolor: '#1E293B', borderRadius: '10px', p: 1.8, mb: 2, border: '1px solid #334155' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
                                    Booking #{activeJob.id} • {activeJob.bookingType || 'Instant Dispatch'}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#F8FAFC', fontSize: '15px' }}>
                                    {activeJob.customerName && !/^\+?[0-9]{10,13}$/.test(String(activeJob.customerName).replace(/[\s\-]/g, '')) ? activeJob.customerName : 'Customer (Doorstep)'}
                                  </Typography>
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: '15px' }}>
                                  ₹{activeJob.visit_fee || activeJob.visitFee || 99}.00
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8, fontSize: '13px' }}>
                                <LocationOnIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
                                {activeJob.address || activeJob.locality || 'Fairlands, Salem'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '12px' }}>
                                <strong>Issue:</strong> {activeJob.issueDescription || 'Doorstep Service & Diagnostic Inspection'}
                              </Typography>
                            </Box>

                            {/* Start Ride Primary Action */}
                            <Button
                              variant="contained"
                              fullWidth
                              size="large"
                              onClick={() => handleStartTripForJob(activeJob.id)}
                              startIcon={<NavigationIcon sx={{ fontSize: 20 }} />}
                              sx={{
                                bgcolor: '#10B981',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
                                py: 1.2,
                                borderRadius: '8px',
                                textTransform: 'none',
                                mb: 1.5,
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                                '&:hover': { bgcolor: '#059669' }
                              }}
                            >
                              Start Ride Now - கிளம்புகிறேன் (Live GPS)
                            </Button>

                            {/* Direct Communication Actions - Strictly Masked WebRTC In-App VoIP */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={() => handleOpenCall(activeJob)}
                                startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  borderColor: '#0284C7',
                                  color: '#38BDF8',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  py: 0.8,
                                  fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)', borderColor: '#38BDF8' }
                                }}
                              >
                                Call Customer (In-App VoIP)
                              </Button>

                              <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={() => setChatDrawerOpen(true)}
                                startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  borderColor: '#475569',
                                  color: '#E2E8F0',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  py: 0.8,
                                  fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.2)', borderColor: '#94A3B8' }
                                }}
                              >
                                Chat
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
                              p: 2.2,
                              mb: 2,
                              border: '2px solid #2563EB',
                              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <WhatshotIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FEF08A', fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)' }}>
                                  Incoming dispatch request ({countdown}s)
                                </Typography>
                              </Box>
                              <Chip
                                label="85% tech share"
                                size="small"
                                sx={{ bgcolor: '#1E293B', color: '#FEF08A', border: '1px solid #334155', fontWeight: 700, fontSize: '10px' }}
                              />
                            </Box>

                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5, fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                              Direct bank settlement upon customer confirmation + ₹40 travel allowance.
                            </Typography>

                            {/* Lead Item */}
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.8,
                                bgcolor: '#1E293B',
                                color: '#FFFFFF',
                                borderRadius: '10px',
                                border: '1px solid #334155',
                                mb: 1
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                                <Box sx={{ flex: 1, pr: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                                    <Chip label={`#${activeJob.id}`} size="small" sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', height: 20 }} />
                                    {activeJob.bookingType === 'scheduled' || activeJob.scheduledSlot ? (
                                      <Chip
                                        icon={<CalendarMonthIcon sx={{ fontSize: '13px !important', color: '#FDE047 !important' }} />}
                                        label={`Scheduled: ${activeJob.scheduledSlot || 'Advance Slot'}`}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(234, 179, 8, 0.15)', color: '#FEF08A', border: '1px solid #CA8A04', fontWeight: 700, fontSize: '10.5px', height: 20 }}
                                      />
                                    ) : (
                                      <Chip
                                        icon={<BoltIcon sx={{ fontSize: '13px !important', color: '#38BDF8 !important' }} />}
                                        label="Live Instant Dispatch"
                                        size="small"
                                        sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#7DD3FC', border: '1px solid #0284C7', fontWeight: 700, fontSize: '10.5px', height: 20 }}
                                      />
                                    )}
                                  </Box>

                                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, display: 'block', fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                                    Customer: {activeJob.customerName || 'Customer'} • In-App VoIP Call Only
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                                    <LocationOnIcon sx={{ color: '#F59E0B', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                                      {activeJob.address || activeJob.locality || 'Fairlands, Salem'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
                                    ₹{activeJob.visitFee ? `${activeJob.visitFee} - ₹1,400` : '₹750 - ₹1,400'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                                    Est. payout
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Customer Detailed Problem Request Box */}
                              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#0F172A', borderRadius: '8px', border: '1px solid #334155', my: 1.2 }}>
                                <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px', display: 'block', mb: 0.4 }}>
                                  Customer Problem Description (விவரிக்கப்பட்ட பிரச்சனை):
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 700, fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)', lineHeight: 1.5 }}>
                                  {activeJob.issueDescription || 'Doorstep Service & Diagnostic Inspection'}
                                </Typography>
                                {(activeJob.customIssueDescription || activeJob.custom_issue_description) && (
                                  <Box sx={{ mt: 0.8, p: 1, bgcolor: '#1E293B', borderRadius: '6px', border: '1px solid #334155' }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, display: 'block', mb: 0.2 }}>
                                      Customer Stated Notes:
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontStyle: 'italic', fontSize: '12.5px' }}>
                                      "{activeJob.customIssueDescription || activeJob.custom_issue_description}"
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>

                              {/* Customer Voice Note Player (if customer recorded problem audio) */}
                              {activeJob.voiceNoteUrl && (
                                <Box sx={{ my: 1.2, p: 1.4, bgcolor: '#0F172A', borderRadius: '8px', border: '1.5px solid #0284C7' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                      <VolumeUpIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E0F2FE', fontSize: '12px' }}>
                                        Customer Audio Voice Note
                                      </Typography>
                                    </Box>
                                    <Chip label="LISTEN FIRST" size="small" sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '9px', height: 18 }} />
                                  </Box>
                                  <LeadAudioPlayer audioSrc={activeJob.voiceNoteUrl} />
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mt: 0.6 }}>
                                    Customer recorded this explanation of the issue. Listen before accepting or rejecting.
                                  </Typography>
                                </Box>
                              )}

                              <Divider sx={{ borderColor: '#334155', my: 1.2 }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                                  Response window: <strong>3 mins</strong>
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {/* Reject / Pass Lead Button */}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={async () => {
                                      const leadId = activeJob.id;
                                      try {
                                        await fetch(`${API_V1_URL}/partner/bookings/${leadId}/reject`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            technicianId: user?.id,
                                            reason: 'Technician declined request'
                                          })
                                        });
                                      } catch (err) {
                                        console.warn('Pass lead note:', err);
                                      }
                                      setActiveJob(null);
                                      setStep(1);
                                      setIsProcessing(false);
                                      setTechToast('Request declined. This customer will not be shown to you for the rest of today. Other customer dispatches remain active.');
                                    }}
                                    sx={{
                                      borderColor: '#475569',
                                      color: '#CBD5E1',
                                      borderRadius: '6px',
                                      fontWeight: 700,
                                      fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)',
                                      px: 1.8,
                                      py: 0.6,
                                      textTransform: 'none',
                                      '&:hover': { bgcolor: '#334155', borderColor: '#94A3B8', color: '#FFFFFF' }
                                    }}
                                  >
                                    Pass / Reject
                                  </Button>

                                  {/* Accept Lead Button */}
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={async () => {
                                      setIsProcessing(true);
                                      setLoadingMsg({
                                        title: 'ஏற்கப்படுகிறது (Accepting dispatch)...',
                                        subtitle: 'Assigning order and opening live GPS navigation map'
                                      });
                                      try {
                                        const techId = activeTech?.id || user?.id;
                                        const techPhone = activeTech?.phone || user?.phone;
                                        await fetch(`${API_V1_URL}/bookings/${activeJob.id}/status`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            status: 'en_route',
                                            technicianId: techId,
                                            technicianPhone: techPhone
                                          })
                                        });
                                        const updatedJob = { ...activeJob, status: 'en_route', technician_id: techId };
                                        setActiveJob(updatedJob);
                                        setIsOnline(true);
                                        setIsGpsBroadcasting(true);
                                        localStorage.setItem('shazuone_partner_is_online', 'true');
                                        localStorage.setItem('shazuone_partner_active_job', activeJob.id);
                                        localStorage.setItem('shazuone_partner_step', '2');
                                        setStep(2);
                                        setTechToast('கோரிக்கை ஏற்கப்பட்டது! நேரலை GPS வழித்தடம் திறக்கப்பட்டது (Order accepted! Live map and navigation active).');
                                        if (broadcastLocation && liveGps?.lat) {
                                          broadcastLocation(liveGps.lat, liveGps.lng, 25);
                                        }
                                        try {
                                          if (techPhone || techId) {
                                            const dRes = await fetch(`${API_V1_URL}/partner/duty?phone=${encodeURIComponent(techPhone || '')}&technicianId=${encodeURIComponent(techId || '')}`);
                                            const dJson = await dRes.json();
                                            if (dJson.success) {
                                              if (dJson.myScheduledJobs) setMyScheduledJobs(dJson.myScheduledJobs);
                                              if (dJson.activeJob) setActiveJob(dJson.activeJob);
                                            }
                                          }
                                        } catch (e) {}
                                      } catch (err) {
                                        console.warn('Status update fallback:', err);
                                        setActiveJob(prev => prev ? { ...prev, status: 'en_route' } : null);
                                        setStep(2);
                                        localStorage.setItem('shazuone_partner_step', '2');
                                      } finally {
                                        setIsProcessing(false);
                                      }
                                    }}
                                    sx={{
                                      bgcolor: '#16A34A',
                                      borderRadius: '6px',
                                      fontWeight: 800,
                                      fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                                      px: 2.2,
                                      py: 0.6,
                                      textTransform: 'none',
                                      '&:hover': { bgcolor: '#15803D' }
                                    }}
                                  >
                                    Accept request
                                  </Button>
                                </Box>
                              </Box>
                            </Paper>
                          </Card>
                        ) : (
                          /* Idle Radar State: Waiting for real customer request */
                          <Box>
                            {/* Proactive Banner for Open Scheduled Requests */}
                            {openScheduledLeads.length > 0 && (
                              <Card
                                elevation={0}
                                sx={{
                                  bgcolor: '#0F172A',
                                  border: '1.5px solid #0284C7',
                                  borderRadius: '12px',
                                  p: 2,
                                  mb: 2,
                                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.15)'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(2, 132, 199, 0.15)', color: '#38BDF8' }}>
                                      <CalendarMonthIcon sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
                                        {openScheduledLeads.length} Open Scheduled {openScheduledLeads.length === 1 ? 'Booking' : 'Bookings'} Available
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', display: 'block' }}>
                                        Salem customers requested scheduled slots for your trade. You can directly claim and reserve them for your day!
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setActiveDutyTab('scheduled')}
                                    endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                      bgcolor: '#0284C7',
                                      fontWeight: 800,
                                      fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      px: 2,
                                      py: 0.8,
                                      '&:hover': { bgcolor: '#0369A1' }
                                    }}
                                  >
                                    View & Claim Slots
                                  </Button>
                                </Box>
                              </Card>
                            )}

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
                              <SalemLottie
                                name="radar"
                                width={150}
                                height={150}
                                ariaLabel="Radar actively scanning for incoming Salem doorstep service dispatches"
                                style={{ mb: 1.5 }}
                              />

                              <Chip
                                icon={<CheckCircleIcon sx={{ color: '#34D399 !important', fontSize: 13 }} />}
                                label={`Online • Radar Active in ${activeTechLocalities.length > 0 ? (activeTechLocalities.length > 2 ? `${activeTechLocalities.slice(0, 2).join(', ')} +${activeTechLocalities.length - 2}` : activeTechLocalities.join(', ')) : 'Salem'}`}
                                size="small"
                                sx={{ bgcolor: '#1E293B', color: '#34D399', fontWeight: 700, fontSize: '11px', mb: 1.5 }}
                              />

                              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)', mb: 0.5 }}>
                                புதிய ஆர்டர்களுக்காக காத்திருக்கிறது (Waiting for Customer Requests)
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', maxWidth: 380, mx: 'auto', mb: 2, lineHeight: 1.5 }}>
                                No customer has requested a live instant dispatch right now in your zone. When a nearby customer places a booking, it will pop up here immediately with an audio alert.
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
                          </Box>
                        )}
                      </Box>
                    )
                  )}

                    {/* TAB 2: SCHEDULED REQUESTS (AUTONOMOUS DIRECT ACCEPTANCE) */}
                    {activeDutyTab === 'scheduled' && (
                      <Box>
                        {/* Section Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.8 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)' }}>
                              Salem Customer Scheduled Requests
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', display: 'block', maxWidth: 480 }}>
                              Salem customers who requested advance doorstep appointment slots. Technicians can directly claim and accept slots for their day without central admin approval.
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                            onClick={fetchScheduledLeads}
                            disabled={loadingScheduledLeads}
                            sx={{
                              borderColor: '#334155',
                              color: '#38BDF8',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              borderRadius: '6px',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#1E293B', borderColor: '#0284C7' }
                            }}
                          >
                            Refresh
                          </Button>
                        </Box>

                        {/* Open Scheduled Leads List */}
                        {openScheduledLeads.length === 0 ? (
                          <Card
                            elevation={0}
                            sx={{
                              bgcolor: '#0F172A',
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              p: 3.5,
                              mb: 2.5,
                              border: '1px solid #1E293B',
                              textAlign: 'center'
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                bgcolor: '#1E293B',
                                border: '1.5px dashed #475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 1.5
                              }}
                            >
                              <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 28 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)', mb: 0.5 }}>
                              No Open Scheduled Requests in Salem Right Now
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', maxWidth: 380, mx: 'auto', mb: 2, lineHeight: 1.5 }}>
                              All advance customer bookings for your trade have been claimed. When new customers schedule appointments, they will appear here instantly for direct acceptance.
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={fetchScheduledLeads}
                              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                borderColor: '#334155',
                                color: '#E2E8F0',
                                fontWeight: 700,
                                fontSize: '12px',
                                textTransform: 'none',
                                borderRadius: '8px'
                              }}
                            >
                              Check for New Requests
                            </Button>
                          </Card>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 3 }}>
                            {openScheduledLeads.map((lead) => (
                              <Card
                                key={lead.id}
                                elevation={0}
                                sx={{
                                  bgcolor: '#0F172A',
                                  color: '#FFFFFF',
                                  borderRadius: '12px',
                                  p: 2.2,
                                  border: '1.5px solid #0284C7',
                                  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)'
                                }}
                              >
                                {/* Lead Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                                  <Box>
                                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                                      <Chip
                                        label={`#${lead.id}`}
                                        size="small"
                                        sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', height: 20 }}
                                      />
                                      <Chip
                                        icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#10B981 !important' }} />}
                                        label="Autonomous Direct Claim"
                                        size="small"
                                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#34D399', border: '1px solid #059669', fontWeight: 800, fontSize: '10px', height: 20 }}
                                      />
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
                                      {lead.serviceName || (lead.serviceId ? `${lead.serviceId.toUpperCase()} Service` : 'Doorstep Service')}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
                                      ₹{lead.visitFee || 99}.00
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                                      Guaranteed Visit Fee
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Scheduled Appointment Window Highlight */}
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 1.2,
                                    bgcolor: 'rgba(2, 132, 199, 0.12)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(2, 132, 199, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.2,
                                    mb: 1.5
                                  }}
                                >
                                  <CalendarMonthIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                                  <Box>
                                    <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', display: 'block' }}>
                                      Requested Appointment Slot:
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E0F2FE', fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)' }}>
                                      {lead.scheduledSlot || 'Upcoming Advance Slot'}
                                    </Typography>
                                  </Box>
                                </Paper>

                                {/* Customer Info & Location */}
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                                    Customer: <strong style={{ color: '#FFFFFF' }}>{lead.customerName || 'Customer'}</strong>
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                                    <LocationOnIcon sx={{ color: '#F59E0B', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                                      {lead.address || lead.locality || 'Fairlands, Salem'}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Customer Detailed Problem Request Box */}
                                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155', mb: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '10px', display: 'block', mb: 0.4 }}>
                                    Customer Problem Request:
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)', lineHeight: 1.5 }}>
                                    {lead.issueDescription || 'Scheduled Service Inspection & Diagnostics'}
                                  </Typography>
                                  {(lead.customIssueDescription || lead.custom_issue_description) && (
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', display: 'block', mt: 0.4, fontSize: '12px' }}>
                                      "{lead.customIssueDescription || lead.custom_issue_description}"
                                    </Typography>
                                  )}
                                </Paper>

                                {/* Customer Voice Note Player */}
                                {lead.voiceNoteUrl && (
                                  <Box sx={{ mb: 1.5, p: 1.4, bgcolor: '#1E293B', borderRadius: '8px', border: '1.5px solid #0284C7' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        <VolumeUpIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E0F2FE', fontSize: '12px' }}>
                                          Customer Voice Note
                                        </Typography>
                                      </Box>
                                      <Chip label="LISTEN FIRST" size="small" sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '9px', height: 18 }} />
                                    </Box>
                                    <LeadAudioPlayer audioSrc={lead.voiceNoteUrl} />
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block', mt: 0.6 }}>
                                      Customer recorded this explanation of the issue. Listen before claiming this slot.
                                    </Typography>
                                  </Box>
                                )}

                                {/* Claim & Pass Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePassScheduledLead(lead.id)}
                                    sx={{
                                      borderColor: '#475569',
                                      color: '#CBD5E1',
                                      fontWeight: 700,
                                      fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)',
                                      px: 1.8,
                                      py: 0.9,
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      '&:hover': { bgcolor: '#334155', borderColor: '#94A3B8', color: '#FFFFFF' }
                                    }}
                                  >
                                    Pass / தவிர்
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={claimingBookingId === lead.id}
                                    onClick={() => handleClaimScheduledSlot(lead.id)}
                                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                                    sx={{
                                      bgcolor: '#16A34A',
                                      color: '#FFFFFF',
                                      fontWeight: 800,
                                      fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)',
                                      py: 1.1,
                                      borderRadius: '8px',
                                      textTransform: 'none',
                                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                                      '&:hover': { bgcolor: '#15803D' }
                                    }}
                                  >
                                    {claimingBookingId === lead.id ? 'Claiming slot...' : 'Claim & Accept Slot (ஏற்றுக்கொள்)'}
                                  </Button>
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        )}

                        {/* MY ACCEPTED UPCOMING APPOINTMENTS SECTION (MULTI-ORDER QUEUE) */}
                        {(() => {
                          const activeAcceptedJobs = (myScheduledJobs || []).filter(j => !['completed', 'cancelled'].includes(j.status));
                          const todayJobs = activeAcceptedJobs.filter(j => isSlotToday(j.scheduledSlot));
                          const tomorrowJobs = activeAcceptedJobs.filter(j => !isSlotToday(j.scheduledSlot) && isSlotTomorrow(j.scheduledSlot));
                          const upcomingJobs = activeAcceptedJobs.filter(j => !isSlotToday(j.scheduledSlot) && !isSlotTomorrow(j.scheduledSlot));

                          const renderJobCard = (job, groupLabel, badgeColor, borderColor) => {
                            const jobIsToday = isSlotToday(job.scheduledSlot);
                            const hasPendingEarlyProposal = job.rescheduleStatus === 'pending_customer_approval';
                            const isPreparing = job.status === 'preparing';
                            const isEnRoute = job.status === 'en_route';

                            return (
                              <Card
                                key={job.id}
                                elevation={0}
                                sx={{
                                  bgcolor: '#0F172A',
                                  color: '#FFFFFF',
                                  borderRadius: '12px',
                                  p: 2,
                                  border: borderColor,
                                  boxShadow: jobIsToday ? '0 4px 16px rgba(16, 185, 129, 0.2)' : '0 4px 14px rgba(2, 132, 199, 0.15)'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 0.8 }}>
                                  <Box>
                                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                                      <Chip
                                        label={`#${job.id}`}
                                        size="small"
                                        sx={{ bgcolor: badgeColor, color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', height: 20 }}
                                      />
                                      <Chip
                                        icon={<ScheduleIcon sx={{ fontSize: '12px !important', color: jobIsToday ? '#065F46 !important' : '#0369A1 !important' }} />}
                                        label={job.scheduledSlot || 'Instant Today'}
                                        size="small"
                                        sx={{
                                          bgcolor: jobIsToday ? '#D1FAE5' : '#E0F2FE',
                                          color: jobIsToday ? '#064E3B' : '#0369A1',
                                          fontWeight: 800,
                                          fontSize: '11px',
                                          height: 20
                                        }}
                                      />
                                      <Chip
                                        label={groupLabel}
                                        size="small"
                                        sx={{
                                          bgcolor: jobIsToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                          color: jobIsToday ? '#34D399' : '#7DD3FC',
                                          fontWeight: 700,
                                          fontSize: '10px',
                                          height: 20
                                        }}
                                      />
                                      {isPreparing && (
                                        <Chip
                                          label="Packing Tools & Spares"
                                          size="small"
                                          sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid #D97706', fontWeight: 700, fontSize: '10px', height: 20 }}
                                        />
                                      )}
                                      {isEnRoute && (
                                        <Chip
                                          label="En Route (Live GPS)"
                                          size="small"
                                          sx={{ bgcolor: 'rgba(14, 165, 233, 0.2)', color: '#38BDF8', border: '1px solid #0284C7', fontWeight: 700, fontSize: '10px', height: 20 }}
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                                      {job.customerName || 'Customer'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                                      <LocationOnIcon sx={{ color: '#F59E0B', fontSize: 13 }} />
                                      {job.address || job.locality || 'Fairlands, Salem'}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: '15px' }}>
                                      ₹{job.visitFee || 99}.00
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                                      Visit Fee Paid
                                    </Typography>
                                  </Box>
                                </Box>

                                {hasPendingEarlyProposal && (
                                  <Box sx={{ p: 1, mb: 1.2, bgcolor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #D97706', borderRadius: '6px' }}>
                                    <Typography variant="caption" sx={{ color: '#FBBF24', fontWeight: 700, display: 'block' }}>
                                      Early Arrival Proposed: {job.proposedRescheduledSlot || 'Alternative Slot'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#FDE68A', fontSize: '10.5px' }}>
                                      Awaiting customer decision. Original slot remains active until customer confirms.
                                    </Typography>
                                  </Box>
                                )}

                                <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px', mb: 1.5 }}>
                                  <strong>Service Note:</strong> {job.issueDescription || 'Diagnostic Inspection & Repair'}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {jobIsToday ? (
                                    <>
                                      {job.status === 'accepted' && (
                                        <Button
                                          variant="outlined"
                                          onClick={() => handlePrepareJob(job.id)}
                                          startIcon={<BuildIcon sx={{ fontSize: 14 }} />}
                                          sx={{
                                            borderColor: '#F59E0B',
                                            color: '#FBBF24',
                                            fontWeight: 700,
                                            fontSize: '11.5px',
                                            py: 0.7,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)', borderColor: '#FBBF24' }
                                          }}
                                        >
                                          Mark Tools Ready
                                        </Button>
                                      )}
                                      <Button
                                        variant="contained"
                                        onClick={() => handleStartTripForJob(job.id)}
                                        startIcon={<NavigationIcon sx={{ fontSize: 15 }} />}
                                        sx={{
                                          flex: 1,
                                          bgcolor: '#10B981',
                                          color: '#FFFFFF',
                                          fontWeight: 800,
                                          fontSize: '12px',
                                          py: 0.7,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: '#059669' }
                                        }}
                                      >
                                        {isEnRoute ? 'Open Navigation (Live GPS)' : 'Start Ride Now (Live GPS)'}
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outlined"
                                        onClick={() => handleOpenTechReschedule(job)}
                                        startIcon={<SwapHorizIcon sx={{ fontSize: 15 }} />}
                                        sx={{
                                          flex: 1,
                                          borderColor: '#0284C7',
                                          color: '#38BDF8',
                                          fontWeight: 700,
                                          fontSize: '12px',
                                          py: 0.7,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)', borderColor: '#38BDF8' }
                                        }}
                                      >
                                        Request Early Arrival / Reschedule
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        onClick={() => handleStartTripForJob(job.id)}
                                        startIcon={<NavigationIcon sx={{ fontSize: 14 }} />}
                                        sx={{
                                          borderColor: '#10B981',
                                          color: '#34D399',
                                          fontWeight: 700,
                                          fontSize: '11.5px',
                                          py: 0.7,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#6EE7B7' }
                                        }}
                                      >
                                        Start Trip
                                      </Button>
                                    </>
                                  )}

                                  {job.customerPhone && (
                                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                                      <Button
                                        variant="outlined"
                                        onClick={() => handleOpenCall(job)}
                                        startIcon={<PhoneIcon sx={{ fontSize: 14 }} />}
                                        sx={{
                                          borderColor: '#38BDF8',
                                          color: '#38BDF8',
                                          fontWeight: 700,
                                          fontSize: '11.5px',
                                          py: 0.7,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#7DD3FC' }
                                        }}
                                      >
                                        Call (In-App)
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        onClick={() => handleOpenChat(job)}
                                        startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                                        sx={{
                                          borderColor: '#10B981',
                                          color: '#34D399',
                                          fontWeight: 700,
                                          fontSize: '11.5px',
                                          py: 0.7,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#6EE7B7' }
                                        }}
                                      >
                                        Chat
                                      </Button>
                                    </Box>
                                  )}
                                </Box>
                              </Card>
                            );
                          };

                          return (
                            <Box sx={{ mt: 3, mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <AssignmentTurnedInIcon sx={{ color: '#10B981', fontSize: 20 }} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.9375rem, 2vw, 1.05rem)' }}>
                                    Assigned Orders & Schedule Queue ({activeAcceptedJobs.length})
                                  </Typography>
                                </Box>
                                <Chip
                                  label={activeAcceptedJobs.length > 0 ? `${activeAcceptedJobs.length} Confirmed` : 'No active bookings'}
                                  size="small"
                                  sx={{
                                    bgcolor: activeAcceptedJobs.length > 0 ? 'rgba(16, 185, 129, 0.15)' : '#1E293B',
                                    color: activeAcceptedJobs.length > 0 ? '#34D399' : '#94A3B8',
                                    border: activeAcceptedJobs.length > 0 ? '1px solid #059669' : '1px solid #334155',
                                    fontWeight: 800,
                                    fontSize: '11px'
                                  }}
                                />
                              </Box>

                              {activeAcceptedJobs.length === 0 ? (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    bgcolor: '#1E293B',
                                    border: '1px dashed #334155',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    mb: 2
                                  }}
                                >
                                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13px' }}>
                                    You have no active orders in your queue right now.
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, fontSize: '11px' }}>
                                    Click 'Claim & Accept Slot' on any open request above to add it to your schedule.
                                  </Typography>
                                </Paper>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                                  {/* 1. TODAY'S JOBS */}
                                  {todayJobs.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                        Today's Appointments ({todayJobs.length})
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {todayJobs.map(job => renderJobCard(job, "Today's Appointment", '#059669', '2px solid #10B981'))}
                                      </Box>
                                    </Box>
                                  )}

                                  {/* 2. TOMORROW'S JOBS */}
                                  {tomorrowJobs.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                        Tomorrow's Appointments ({tomorrowJobs.length})
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {tomorrowJobs.map(job => renderJobCard(job, "Tomorrow's Appointment", '#0284C7', '1.5px solid #0284C7'))}
                                      </Box>
                                    </Box>
                                  )}

                                  {/* 3. UPCOMING FUTURE DATES */}
                                  {upcomingJobs.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" sx={{ color: '#A78BFA', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                        Upcoming Dates ({upcomingJobs.length})
                                      </Typography>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {upcomingJobs.map(job => renderJobCard(job, 'Upcoming Date', '#7C3AED', '1.5px solid #6D28D9'))}
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        })()}

                        {/* MONTH-BY-MONTH INTERACTIVE CALENDAR AGENDA (Past & Future Tracking) */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #334155' }}>
                          {/* Calendar Header with Month Navigation */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <CalendarMonthIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: 'clamp(0.9375rem, 2vw, 1.05rem)' }}>
                                  Service Calendar Agenda ({myScheduledJobs.length} Duty Records)
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px', display: 'block' }}>
                                  Switch months to view past completed job history or upcoming customer bookings.
                                </Typography>
                              </Box>
                            </Box>

                            {/* Month Navigator Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#0F172A', p: 0.5, borderRadius: '8px', border: '1px solid #334155' }}>
                              <IconButton
                                size="small"
                                onClick={handlePrevMonth}
                                title="Previous Month"
                                sx={{ color: '#38BDF8', p: 0.5, '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }}
                              >
                                <ChevronLeftIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#F8FAFC', minWidth: 120, textAlign: 'center', fontSize: '13px' }}>
                                {currentMonthTitle}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={handleNextMonth}
                                title="Next Month"
                                sx={{ color: '#38BDF8', p: 0.5, '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }}
                              >
                                <ChevronRightIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={handleJumpToday}
                                sx={{
                                  ml: 0.5,
                                  borderColor: '#10B981',
                                  color: '#10B981',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  py: 0.2,
                                  px: 1,
                                  minWidth: 0,
                                  borderRadius: '5px',
                                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }
                                }}
                              >
                                Today
                              </Button>
                            </Box>
                          </Box>

                          {/* Days with Bookings Summary & Quick Jump Bar */}
                          {(() => {
                            const daysWithAssigned = monthDaysList.filter(d => (myScheduledJobs || []).some(j => jobMatchesDate(j, d.iso)));
                            const daysWithOpen = monthDaysList.filter(d => (openScheduledLeads || []).some(j => jobMatchesDate(j, d.iso)));
                            const allBookedDays = Array.from(new Set([...daysWithAssigned, ...daysWithOpen]));

                            return (
                              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, p: 1.2, bgcolor: '#0B132B', border: '1px solid #1E293B', borderRadius: '8px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.4px' }}>
                                    Booking Indicators:
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                                    <Typography variant="caption" sx={{ color: '#34D399', fontSize: '11px', fontWeight: 700 }}>
                                      {daysWithAssigned.length} Days with Your Bookings
                                    </Typography>
                                  </Box>
                                  {daysWithOpen.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#38BDF8' }} />
                                      <Typography variant="caption" sx={{ color: '#38BDF8', fontSize: '11px', fontWeight: 700 }}>
                                        {daysWithOpen.length} Days with Open Requests
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {allBookedDays.length > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                    <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '11px', fontWeight: 600 }}>
                                      Jump to booked day:
                                    </Typography>
                                    {allBookedDays.slice(0, 4).map(bd => {
                                      const isCurr = calendarSelectedDate === bd.iso;
                                      const isAssigned = (myScheduledJobs || []).some(j => jobMatchesDate(j, bd.iso));
                                      return (
                                        <Button
                                          key={bd.iso}
                                          size="small"
                                          onClick={() => setCalendarSelectedDate(bd.iso)}
                                          sx={{
                                            py: 0.2,
                                            px: 1,
                                            minWidth: 0,
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            textTransform: 'none',
                                            borderRadius: '6px',
                                            bgcolor: isCurr ? '#0284C7' : isAssigned ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                                            color: isCurr ? '#FFFFFF' : isAssigned ? '#34D399' : '#38BDF8',
                                            border: isCurr ? '1px solid #38BDF8' : isAssigned ? '1px solid #059669' : '1px solid #0284C7',
                                            '&:hover': { bgcolor: isCurr ? '#0284C7' : '#1E293B' }
                                          }}
                                        >
                                          {bd.dayLabel} {bd.dayNum} {bd.monthLabel}
                                        </Button>
                                      );
                                    })}
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}

                          {/* Full Month Calendar Days Ribbon */}
                          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2, scrollbarWidth: 'none' }}>
                            {monthDaysList.map((d) => {
                              const isSelected = calendarSelectedDate === d.iso;
                              const dayAssignedJobs = (myScheduledJobs || []).filter(j => jobMatchesDate(j, d.iso));
                              const dayOpenLeads = (openScheduledLeads || []).filter(j => jobMatchesDate(j, d.iso));
                              const assignedCount = dayAssignedJobs.length;
                              const openCount = dayOpenLeads.length;
                              const hasAssigned = assignedCount > 0;
                              const hasOpen = openCount > 0;
                              const hasAny = hasAssigned || hasOpen;

                              return (
                                <Paper
                                  key={d.iso}
                                  onClick={() => setCalendarSelectedDate(d.iso)}
                                  elevation={0}
                                  sx={{
                                    minWidth: 78,
                                    p: 1,
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.15s ease',
                                    bgcolor: isSelected
                                      ? '#0284C7'
                                      : hasAssigned
                                      ? 'linear-gradient(180deg, #064E3B 0%, #022C22 100%)'
                                      : hasOpen
                                      ? 'linear-gradient(180deg, #0C4A6E 0%, #082F49 100%)'
                                      : d.isToday
                                      ? '#0F172A'
                                      : '#1E293B',
                                    color: isSelected ? '#FFFFFF' : hasAssigned ? '#FFFFFF' : '#CBD5E1',
                                    border: isSelected
                                      ? '2px solid #38BDF8'
                                      : hasAssigned
                                      ? '2px solid #10B981'
                                      : hasOpen
                                      ? '2px solid #38BDF8'
                                      : d.isToday
                                      ? '1.5px solid #10B981'
                                      : '1px solid #334155',
                                    boxShadow: isSelected
                                      ? '0 4px 16px rgba(2, 132, 199, 0.45)'
                                      : hasAssigned
                                      ? '0 4px 16px rgba(16, 185, 129, 0.35)'
                                      : hasOpen
                                      ? '0 4px 14px rgba(56, 189, 248, 0.25)'
                                      : 'none',
                                    opacity: d.isPast && !isSelected && !hasAny ? 0.75 : 1,
                                    '&:hover': {
                                      bgcolor: isSelected ? '#0284C7' : hasAssigned ? '#065F46' : '#334155',
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  {/* Top Indicator Dot for days with bookings */}
                                  {hasAssigned && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#34D399',
                                        boxShadow: '0 0 6px #34D399'
                                      }}
                                    />
                                  )}
                                  {!hasAssigned && hasOpen && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#38BDF8',
                                        boxShadow: '0 0 6px #38BDF8'
                                      }}
                                    />
                                  )}

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      display: 'block',
                                      color: isSelected
                                        ? '#E0F2FE'
                                        : hasAssigned
                                        ? '#34D399'
                                        : hasOpen
                                        ? '#38BDF8'
                                        : d.isToday
                                        ? '#34D399'
                                        : '#94A3B8'
                                    }}
                                  >
                                    {d.dayLabel}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontSize: '18px',
                                      fontWeight: 900,
                                      lineHeight: 1.2,
                                      my: 0.2,
                                      color: isSelected ? '#FFFFFF' : hasAssigned ? '#FFFFFF' : hasOpen ? '#F0F9FF' : '#E2E8F0'
                                    }}
                                  >
                                    {d.dayNum}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '9.5px',
                                      fontWeight: 700,
                                      display: 'block',
                                      color: isSelected ? '#BAE6FD' : hasAssigned ? '#A7F3D0' : '#64748B'
                                    }}
                                  >
                                    {d.monthLabel}
                                  </Typography>

                                  {/* Prominent Highlighting Chip */}
                                  {hasAssigned ? (
                                    <Chip
                                      label={`${assignedCount} Booked`}
                                      size="small"
                                      sx={{
                                        mt: 0.5,
                                        height: 18,
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        bgcolor: isSelected ? '#FFFFFF' : '#10B981',
                                        color: isSelected ? '#0284C7' : '#FFFFFF',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                                      }}
                                    />
                                  ) : hasOpen ? (
                                    <Chip
                                      label={`${openCount} Open`}
                                      size="small"
                                      sx={{
                                        mt: 0.5,
                                        height: 18,
                                        fontSize: '9px',
                                        fontWeight: 900,
                                        bgcolor: isSelected ? '#FFFFFF' : '#0284C7',
                                        color: isSelected ? '#0284C7' : '#FFFFFF'
                                      }}
                                    />
                                  ) : (
                                    <Box sx={{ height: 18, mt: 0.5 }} />
                                  )}
                                </Paper>
                              );
                            })}
                          </Box>

                          {/* Selected Date Customer Bookings */}
                          {(() => {
                            const selectedDayObj = monthDaysList.find(d => d.iso === calendarSelectedDate) || monthDaysList[0];
                            const selectedDayJobs = (myScheduledJobs || []).filter(j => jobMatchesDate(j, calendarSelectedDate));
                            const selectedDayOpenLeads = (openScheduledLeads || []).filter(j => jobMatchesDate(j, calendarSelectedDate));
                            const isToday = selectedDayObj ? selectedDayObj.isToday : false;
                            const isPast = selectedDayObj ? selectedDayObj.isPast : false;
                            const nextBookedDay = monthDaysList.find(d => (myScheduledJobs || []).some(j => jobMatchesDate(j, d.iso)) && d.iso !== calendarSelectedDate);

                            return (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 0.8 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F8FAFC', fontSize: '13.5px' }}>
                                      Agenda for {selectedDayObj ? `${selectedDayObj.dayLabel}, ${selectedDayObj.dayNum} ${selectedDayObj.monthLabel}` : calendarSelectedDate}
                                    </Typography>
                                    {selectedDayJobs.length > 0 && (
                                      <Chip
                                        label={`${selectedDayJobs.length} Booked Duty`}
                                        size="small"
                                        sx={{ bgcolor: '#059669', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', height: 20 }}
                                      />
                                    )}
                                    {selectedDayOpenLeads.length > 0 && (
                                      <Chip
                                        label={`${selectedDayOpenLeads.length} Open Request${selectedDayOpenLeads.length > 1 ? 's' : ''}`}
                                        size="small"
                                        sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', height: 20 }}
                                      />
                                    )}
                                  </Box>
                                  {isToday && (
                                    <Chip
                                      label="Today's Service Schedule - இன்றைய பணி"
                                      size="small"
                                      sx={{ bgcolor: '#059669', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px' }}
                                    />
                                  )}
                                  {isPast && (
                                    <Chip
                                      label="Past Duty History - கடந்த பணி வரலாறு"
                                      size="small"
                                      sx={{ bgcolor: '#334155', color: '#CBD5E1', fontWeight: 700, fontSize: '10.5px', border: '1px solid #475569' }}
                                    />
                                  )}
                                  {!isToday && !isPast && selectedDayJobs.length > 0 && (
                                    <Chip
                                      label="Confirmed Appointment - உறுதிப்படுத்தப்பட்ட பணி"
                                      size="small"
                                      sx={{ bgcolor: '#0369A1', color: '#FFFFFF', fontWeight: 700, fontSize: '10.5px' }}
                                    />
                                  )}
                                </Box>

                                {selectedDayJobs.length === 0 && selectedDayOpenLeads.length === 0 ? (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2.5,
                                      bgcolor: '#1E293B',
                                      border: '1px dashed #334155',
                                      borderRadius: '10px',
                                      textAlign: 'center'
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12.5px' }}>
                                      {isPast
                                        ? `No service history recorded for ${selectedDayObj ? `${selectedDayObj.dayLabel}, ${selectedDayObj.dayNum} ${selectedDayObj.monthLabel}` : calendarSelectedDate}.`
                                        : `No customer bookings scheduled for ${selectedDayObj ? `${selectedDayObj.dayLabel}, ${selectedDayObj.dayNum} ${selectedDayObj.monthLabel}` : calendarSelectedDate}.`}
                                    </Typography>
                                    {nextBookedDay ? (
                                      <Box sx={{ mt: 1.5 }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => setCalendarSelectedDate(nextBookedDay.iso)}
                                          sx={{
                                            bgcolor: '#0284C7',
                                            color: '#FFFFFF',
                                            fontWeight: 800,
                                            fontSize: '11.5px',
                                            textTransform: 'none',
                                            borderRadius: '6px',
                                            '&:hover': { bgcolor: '#0369A1' }
                                          }}
                                        >
                                          View Next Booked Day: {nextBookedDay.dayLabel} {nextBookedDay.dayNum} {nextBookedDay.monthLabel}
                                        </Button>
                                      </Box>
                                    ) : (
                                      !isPast && (
                                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, fontSize: '11px' }}>
                                          You can claim open requests from the list above to schedule work for this date.
                                        </Typography>
                                      )
                                    )}
                                  </Paper>
                                ) : (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {selectedDayJobs.map((job) => {
                                      const isCompleted = job.status === 'completed';
                                      const isCancelled = job.status === 'cancelled';
                                      const stageIdx = getJobStageIndex(job.status);
                                      const stages = [
                                        '1. Booked',
                                        '2. Assigned',
                                        '3. Ride Start',
                                        '4. Arrived',
                                        '5. Quoted',
                                        '6. Settled'
                                      ];

                                      return (
                                        <Paper
                                          key={job.id}
                                          elevation={0}
                                          sx={{
                                            p: 2,
                                            bgcolor: '#1E293B',
                                            border: isToday
                                              ? '2px solid #10B981'
                                              : isCompleted
                                              ? '1.5px solid #059669'
                                              : '1.5px solid #0284C7',
                                            borderRadius: '12px'
                                          }}
                                        >
                                          {/* Top Bar: Booking ID + Customer Call */}
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 0.8 }}>
                                            <Box>
                                              <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mb: 0.5 }}>
                                                <Chip
                                                  label={`#${job.id}`}
                                                  size="small"
                                                  sx={{
                                                    bgcolor: isToday ? '#059669' : isCompleted ? '#065F46' : '#0284C7',
                                                    color: '#FFFFFF',
                                                    fontWeight: 800,
                                                    fontSize: '10px',
                                                    height: 20
                                                  }}
                                                />
                                                <Chip
                                                  icon={<AccessTimeIcon sx={{ fontSize: '12px !important', color: isToday ? '#065F46 !important' : '#0369A1 !important' }} />}
                                                  label={job.scheduledSlot || 'Slot Confirmed'}
                                                  size="small"
                                                  sx={{
                                                    bgcolor: isToday ? '#D1FAE5' : '#E0F2FE',
                                                    color: isToday ? '#064E3B' : '#0369A1',
                                                    fontWeight: 800,
                                                    fontSize: '10.5px',
                                                    height: 20
                                                  }}
                                                />
                                                {isCompleted && (
                                                  <Chip
                                                    label="Settled & Completed"
                                                    size="small"
                                                    sx={{
                                                      bgcolor: '#065F46',
                                                      color: '#A7F3D0',
                                                      fontWeight: 800,
                                                      fontSize: '10px',
                                                      height: 20
                                                    }}
                                                  />
                                                )}
                                                {isCancelled && (
                                                  <Chip
                                                    label="Cancelled"
                                                    size="small"
                                                    sx={{
                                                      bgcolor: '#7F1D1D',
                                                      color: '#FECACA',
                                                      fontWeight: 800,
                                                      fontSize: '10px',
                                                      height: 20
                                                    }}
                                                  />
                                                )}
                                              </Box>
                                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                                                {job.customerName || 'Customer'}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                <LocationOnIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                                                {job.address || job.locality || 'Fairlands, Salem'}
                                              </Typography>
                                            </Box>

                                            {job.customerPhone && (
                                              <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  onClick={() => handleOpenCall(job)}
                                                  startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                                                  sx={{
                                                    borderColor: '#38BDF8',
                                                    color: '#38BDF8',
                                                    fontWeight: 700,
                                                    fontSize: '11px',
                                                    textTransform: 'none',
                                                    borderRadius: '6px',
                                                    py: 0.4,
                                                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' }
                                                  }}
                                                >
                                                  Call (In-App)
                                                </Button>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  onClick={() => handleOpenChat(job)}
                                                  startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />}
                                                  sx={{
                                                    borderColor: '#10B981',
                                                    color: '#34D399',
                                                    fontWeight: 700,
                                                    fontSize: '11px',
                                                    textTransform: 'none',
                                                    borderRadius: '6px',
                                                    py: 0.4,
                                                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                                                  }}
                                                >
                                                  Chat
                                                </Button>
                                              </Box>
                                            )}
                                          </Box>

                                          {/* Problem Description */}
                                          <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '12.5px', bgcolor: '#0F172A', p: 1.2, borderRadius: '6px', border: '1px solid #334155', my: 1 }}>
                                            <strong>Problem:</strong> {job.issueDescription || 'Doorstep Diagnostic & Inspection'}
                                          </Typography>

                                          {/* Customer Voice Note if available */}
                                          {job.voiceNoteUrl && (
                                            <Box sx={{ my: 1, p: 1.2, bgcolor: '#0F172A', borderRadius: '6px', border: '1px solid #0284C7' }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                                                <VolumeUpIcon sx={{ color: '#38BDF8', fontSize: 15 }} />
                                                <Typography variant="caption" sx={{ color: '#E0F2FE', fontWeight: 800 }}>
                                                  Customer Voice Note Recorded
                                                </Typography>
                                              </Box>
                                              <LeadAudioPlayer audioSrc={job.voiceNoteUrl} />
                                            </Box>
                                          )}

                                          {/* End-to-End Tracking Stepper for this Request */}
                                          <Box sx={{ my: 1.5, p: 1.2, bgcolor: '#0F172A', borderRadius: '8px', border: '1px solid #334155' }}>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '9.5px', display: 'block', mb: 0.8 }}>
                                              End-to-End Lifecycle Tracking:
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5, textAlign: 'center' }}>
                                              {stages.map((stageName, sIdx) => {
                                                const isDone = sIdx <= stageIdx;
                                                const isCurrent = sIdx === stageIdx;
                                                return (
                                                  <Box
                                                    key={sIdx}
                                                    sx={{
                                                      p: 0.5,
                                                      borderRadius: '4px',
                                                      bgcolor: isCurrent ? '#0284C7' : isDone ? '#065F46' : '#1E293B',
                                                      color: isCurrent ? '#FFFFFF' : isDone ? '#6EE7B7' : '#64748B',
                                                      border: isCurrent ? '1px solid #38BDF8' : 'none'
                                                    }}
                                                  >
                                                    <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                                                      {stageName}
                                                    </Typography>
                                                  </Box>
                                                );
                                              })}
                                            </Box>
                                          </Box>

                                          {/* Action Bar */}
                                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
                                            {isCompleted ? (
                                              <Chip
                                                label={`Settled Amount: Rs. ${job.finalPrice || job.totalAmount || 0} - Duty Completed`}
                                                sx={{
                                                  bgcolor: '#064E3B',
                                                  color: '#A7F3D0',
                                                  fontWeight: 800,
                                                  fontSize: '11px',
                                                  border: '1px solid #059669'
                                                }}
                                              />
                                            ) : isPast ? (
                                              <Chip
                                                label={`Past Status: ${job.status || 'Archived'}`}
                                                sx={{
                                                  bgcolor: '#334155',
                                                  color: '#CBD5E1',
                                                  fontWeight: 700,
                                                  fontSize: '11px'
                                                }}
                                              />
                                            ) : (
                                              <>
                                                {job.rescheduleStatus === 'pending_customer_approval' ? (
                                                  <Chip
                                                    size="small"
                                                    label={`Awaiting Customer Approval: ${job.proposedRescheduledSlot || 'Proposed Slot'}`}
                                                    sx={{
                                                      bgcolor: '#FEF3C7',
                                                      color: '#92400E',
                                                      fontWeight: 800,
                                                      fontSize: '10.5px',
                                                      border: '1px solid #FCD34D'
                                                    }}
                                                  />
                                                ) : (
                                                  <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<ScheduleIcon sx={{ fontSize: 13 }} />}
                                                    onClick={() => handleOpenTechReschedule(job)}
                                                    sx={{
                                                      color: '#38BDF8',
                                                      borderColor: '#0284C7',
                                                      fontWeight: 700,
                                                      fontSize: '11px',
                                                      borderRadius: '6px',
                                                      textTransform: 'none',
                                                      px: 1.2,
                                                      py: 0.5,
                                                      '&:hover': { borderColor: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.08)' }
                                                    }}
                                                  >
                                                    Request Reschedule - நேரம் மாற்றம்
                                                  </Button>
                                                )}

                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  onClick={() => {
                                                    setTechRescheduleJob(job);
                                                    setTechRescheduleMode('request_handover');
                                                    setTechRescheduleReason(TECH_HANDOVER_REASONS[0]);
                                                    setTechRescheduleModalOpen(true);
                                                  }}
                                                  sx={{
                                                    color: '#EF4444',
                                                    borderColor: '#991B1B',
                                                    fontWeight: 700,
                                                    fontSize: '11px',
                                                    borderRadius: '6px',
                                                    textTransform: 'none',
                                                    px: 1.2,
                                                    py: 0.5,
                                                    '&:hover': { borderColor: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.08)' }
                                                  }}
                                                >
                                                  Handover to Ops - அவசர மாற்றம்
                                                </Button>

                                                {isToday ? (
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleStartTripForJob(job.id)}
                                                    startIcon={<NavigationIcon sx={{ fontSize: 16 }} />}
                                                    sx={{
                                                      bgcolor: '#10B981',
                                                      color: '#FFFFFF',
                                                      fontWeight: 800,
                                                      fontSize: '12px',
                                                      borderRadius: '6px',
                                                      textTransform: 'none',
                                                      px: 2,
                                                      py: 0.6,
                                                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                                                      '&:hover': { bgcolor: '#059669' }
                                                    }}
                                                  >
                                                    Start Ride Now - சவாரி தொடங்கு (Live GPS)
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    disabled
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<LockIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                      bgcolor: '#334155 !important',
                                                      color: '#94A3B8 !important',
                                                      fontWeight: 700,
                                                      fontSize: '11px',
                                                      borderRadius: '6px',
                                                      textTransform: 'none',
                                                      py: 0.6
                                                    }}
                                                  >
                                                    Ride Unlocks on {selectedDayObj.dayLabel} ({selectedDayObj.dayNum} {selectedDayObj.monthLabel})
                                                  </Button>
                                                )}
                                              </>
                                            )}
                                          </Box>
                                        </Paper>
                                      );
                                    })}
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
                        </Box>
                      </Box>
                    )}
                  </Box>
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
                    borderRadius: '12px',
                    p: 2,
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                    <DirectionsBikeIcon sx={{ color: '#0284C7', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Active trip • En route to customer (பயணத்தில் உள்ளது)
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', mb: 0.3 }}>
                    Customer: {activeJob?.customerName || 'Customer'} (Booking #{activeJob?.id || activeBookingId || 'SLM'})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.2 }}>
                    {activeJob?.address || activeJob?.locality || 'Fairlands, Salem - 636016'}
                  </Typography>

                  {/* Customer Described Problem Card */}
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block', mb: 0.3 }}>
                      Customer Problem Diagnosis (விவரிக்கப்பட்ட பழுது):
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '13px' }}>
                      {activeJob?.issueDescription || 'AC Doorstep Diagnostic Inspection'}
                    </Typography>
                    {(activeJob?.customIssueDescription || activeJob?.custom_issue_description) && (
                      <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic', display: 'block', mt: 0.4, fontSize: '12px' }}>
                        "{activeJob?.customIssueDescription || activeJob?.custom_issue_description}"
                      </Typography>
                    )}
                  </Paper>

                  {/* Customer Voice Note Player in En Route view */}
                  {activeJob?.voiceNoteUrl && (
                    <Box sx={{ mb: 1.5, p: 1.4, bgcolor: '#0F172A', borderRadius: '10px', border: '1.5px solid #0284C7' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <VolumeUpIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E0F2FE', fontSize: '12px' }}>
                            Customer Audio Recording (வாடிக்கையாளர் குரல் விளக்கம்)
                          </Typography>
                        </Box>
                        <Chip label="LISTEN NOW" size="small" sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, fontSize: '9px', height: 18 }} />
                      </Box>
                      <LeadAudioPlayer audioSrc={activeJob.voiceNoteUrl} />
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block', mt: 0.6 }}>
                        Listen while traveling to verify tools and spare parts needed for the job.
                      </Typography>
                    </Box>
                  )}

                  <Alert severity="success" sx={{ mb: 1.5, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: '8px', fontSize: '11.5px', py: 0.5 }}>
                    <strong>₹{activeJob?.visit_fee || activeJob?.visitFee || 99}.00 Payment Confirmed via Razorpay Gateway:</strong> 100% credited to your wallet for Salem travel & fuel allowance. Call, Message, and GPS directions are now unlocked.
                  </Alert>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleOpenCall(activeJob)}
                        sx={{ bgcolor: '#16A34A', borderRadius: '6px', py: 0.8, fontWeight: 600, fontSize: '12px', textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
                      >
                        In-App Call (Masked)
                      </Button>

                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleOpenChat(activeJob)}
                        sx={{ bgcolor: '#2563EB', borderRadius: '6px', py: 0.8, fontWeight: 600, fontSize: '12px', textTransform: 'none', '&:hover': { bgcolor: '#1D4ED8' } }}
                      >
                        In-App Chat
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
                        When you reach the customer's house, the customer will ask you: <em>"What is your Shazu One PIN?"</em>. Tell them the 4 digits below so they can verify your identity on their screen and let you inside.
                      </Typography>

                      {/* Prominent 4-Digit Display for Tech */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 1.5 }}>
                        {String(activeJob?.customerOtp || activeJob?.customer_otp || '----').split('').map((digit, idx) => (
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

                  {/* Customer Stated Problem & Voice Note Reference */}
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}>
                        Customer Stated Problem (வாடிக்கையாளர் புகார்):
                      </Typography>
                      {activeJob?.voiceNoteUrl && (
                        <Chip
                          icon={<VolumeUpIcon sx={{ fontSize: '12px !important', color: '#0369A1 !important' }} />}
                          label="Audio Attached"
                          size="small"
                          sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '9px', height: 18 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '12.5px' }}>
                      {activeJob?.issueDescription || 'Standard Doorstep Diagnostic Visit'}
                    </Typography>
                    {(activeJob?.customIssueDescription || activeJob?.custom_issue_description) && (
                      <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic', display: 'block', mt: 0.3, fontSize: '11.5px' }}>
                        "{activeJob?.customIssueDescription || activeJob?.custom_issue_description}"
                      </Typography>
                    )}
                    {activeJob?.voiceNoteUrl && (
                      <Box sx={{ mt: 1, p: 1.2, bgcolor: '#0F172A', borderRadius: '8px' }}>
                        <LeadAudioPlayer audioSrc={activeJob.voiceNoteUrl} />
                      </Box>
                    )}
                  </Paper>

                  {/* In-App Direct Communication during Diagnostic Inspection */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PhoneIcon sx={{ fontSize: 14 }} />}
                      onClick={() => handleOpenCall(activeJob)}
                      sx={{ flex: 1, borderColor: '#16A34A', color: '#16A34A', fontWeight: 700, fontSize: '11px', textTransform: 'none', py: 0.5, '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.08)' } }}
                    >
                      Call Customer (In-App)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                      onClick={() => handleOpenChat(activeJob)}
                      sx={{ flex: 1, borderColor: '#2563EB', color: '#2563EB', fontWeight: 700, fontSize: '11px', textTransform: 'none', py: 0.5, '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' } }}
                    >
                      Chat with Customer (In-App)
                    </Button>
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
                        try {
                          // Fetch latest database quote items if not in state
                          let quoteItemsPayload = step3Quote?.items || [];
                          if (quoteItemsPayload.length === 0) {
                            const qRes = await fetch(`${API_V1_URL}/bookings/${activeBookingId}/quote`);
                            const qData = await qRes.json();
                            if (qData.success && qData.items?.length > 0) {
                              quoteItemsPayload = qData.items;
                            }
                          }

                          // 1. Submit quote items to DB
                          await fetch(`${API_V1_URL}/partner/quote/create`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              bookingId: activeBookingId,
                              items: quoteItemsPayload,
                              partsMode: 'tech_buys'
                            })
                          });

                          // 2. Update status to quote_presented
                          await fetch(`${API_V1_URL}/bookings/${activeBookingId}/status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'quote_presented' })
                          });

                          // 3. Update local state & dispatch cross-tab events
                          if (activeJob) {
                            setActiveJob(prev => ({ ...prev, status: 'quote_presented' }));
                          }
                          setQuoteSent(true);
                          localStorage.setItem('shazuone_quote_status_' + activeBookingId, 'quote_presented');
                          localStorage.setItem('shazuone_active_booking', activeBookingId);
                          window.dispatchEvent(new CustomEvent('shazuone_quote_updated', { detail: { bookingId: activeBookingId, status: 'quote_presented' } }));
                          window.dispatchEvent(new Event('storage'));
                        } catch (err) {
                          console.warn('Status update fallback:', err);
                        }
                        setIsProcessing(false);
                        setTechToast('Digital quote sent to customer screen for approval!');
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
                        severity="info" 
                        sx={{ borderRadius: '8px', fontSize: '12px', mb: 1.5, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD' }}
                      >
                        Digital quote (₹{step3Quote?.subtotal ? parseFloat(step3Quote.subtotal).toFixed(2) : '0.00'}) sent to customer. Waiting for customer approval and escrow authorization.
                      </Alert>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_V1_URL}/bookings/${activeBookingId}`);
                            const data = await res.json();
                            if (data.success && data.booking) {
                              if (data.booking.status === 'quote_approved' || data.booking.status === 'in_progress') {
                                setActiveJob(prev => ({ ...prev, status: data.booking.status }));
                                setTechToast('Customer approved & escrow funded! Starting repair work.');
                              } else {
                                setTechToast('Awaiting customer review. Status will update once approved.');
                              }
                            }
                          } catch (e) {
                            setTechToast('Checking status...');
                          }
                        }}
                        sx={{ borderColor: '#0284C7', color: '#0284C7', borderRadius: '8px', fontWeight: 700, fontSize: '11.5px', textTransform: 'none' }}
                      >
                        Check Customer Approval Status
                      </Button>
                    </Box>
                  )}

                  {/* STAGE C: CUSTOMER APPROVED WORK CHARGE -> DIRECT WORK COMPLETION */}
                  {(activeJob?.status === 'quote_approved') && (
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity="success" 
                        sx={{ borderRadius: '8px', fontSize: '12px', mb: 1.5, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
                      >
                        வாடிக்கையாளர் ஒப்புதல் அளித்தார்! (Customer Approved Work Charge & Escrow Secured). உதிரிபாகங்கள் ஏதும் தேவைப்பட்டால் வாடிக்கையாளருடன் நேரடியாக முடிக்கவும். பழுதுபார்க்கும் வேலை முடிந்ததும் கீழே முடிக்கவும்.
                      </Alert>

                      {/* Labor Summary Box */}
                      <Card
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          bgcolor: '#F8FAFC',
                          border: '1.5px solid #0284C7',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.08)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <BuildIcon sx={{ color: '#0284C7', fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              வேலைக் கட்டணம் & தீர்வு (Direct Labor Execution)
                            </Typography>
                          </Box>
                          <Chip
                            label="Ready to Complete"
                            size="small"
                            sx={{
                              bgcolor: '#DCFCE7',
                              color: '#166534',
                              fontWeight: 800,
                              fontSize: '10px'
                            }}
                          />
                        </Box>

                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1, lineHeight: 1.4 }}>
                          சேலம்சேவா தளம் 5% கமிஷனை உங்கள் <strong>வேலைக் கட்டணத்திற்கு மட்டுமே</strong> கணக்கிடுகிறது. உதிரிபாகங்கள் விற்பனை தளத்தில் இல்லை.
                        </Typography>
                      </Card>
                    </Box>
                  )}

                  {/* Direct Job Completion & Payout Release Action */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    onClick={async () => {
                      try {
                        await fetch(`${API_V1_URL}/bookings/${activeBookingId}/status`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'completed' })
                        });
                      } catch (err) {
                        console.warn('Status update fallback:', err);
                      }
                      localStorage.removeItem('shazuone_partner_step');
                      localStorage.removeItem('shazuone_partner_active_job');
                      localStorage.setItem('shazuone_quote_status_' + activeBookingId, 'completed');
                      window.dispatchEvent(new CustomEvent('shazuone_status_updated', { detail: { bookingId: activeBookingId, status: 'completed' } }));
                      window.dispatchEvent(new Event('storage'));
                      setIsProcessing(false);
                      setStep(1);
                      setTechToast('Service completed! Instant UPI settlement disbursed.');
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
                  ₹{partnerIncentiveAmount} per technician referral + 0% platform commission star rewards
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
                    ₹{Number(partnerIncentives?.availablePayout || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#FFFFFF !important', fontSize: 13 }} />}
                  label="Instant Phone Route"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 700, fontSize: '10px' }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, my: 1 }}>
                <AccountBalanceIcon sx={{ color: '#A7F3D0', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '11.5px' }}>
                  Payout Phone: <strong>+91{activeTech?.payoutPhone || activeTech?.phone?.replace(/[^0-9]/g, '').slice(-10) || '---'}</strong>
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block', fontSize: '10px', fontWeight: 600 }}>
                    மொத்த பரிந்துரை வருமானம் (Total Earned)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                    ₹{Number(partnerIncentives?.totalIncentiveEarned || 0).toFixed(2)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <Typography variant="caption" sx={{ color: '#A7F3D0', display: 'block', fontSize: '10px', fontWeight: 600 }}>
                    வங்கிக்கு வரவானது (Settled)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FDE047', fontSize: '14px' }}>
                    ₹{Number(partnerIncentives?.settledPayout || 0).toFixed(2)}
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
                  ? `Claim Instant ₹${partnerIncentives.availablePayout}.00 to Payout Phone`
                  : 'All Referral Incentives Settled'}
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
                  label={partnerIncentives?.zeroCommUnlocked ? '0% Commission Unlocked!' : `${partnerIncentives?.starPoints || 0} / 30 Points`}
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
                value={Math.min(100, (((partnerIncentives?.starPoints || 0) / 30) * 100))}
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
                  : `Earn ${Math.max(0, 30 - (partnerIncentives?.starPoints || 0))} more Star Points to unlock 100% Zero Commission! (+2 pts per 5 rating, +3 pts per referred technician).`}
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
                        label={t.payoutStatus === 'SETTLED_TO_PHONE' || t.payoutStatus === 'SETTLED_TO_UPI' ? 'Paid to Phone' : 'Ready to Claim'}
                        size="small"
                        sx={{
                          bgcolor: (t.payoutStatus === 'SETTLED_TO_PHONE' || t.payoutStatus === 'SETTLED_TO_UPI') ? '#DCFCE7' : '#FEF3C7',
                          color: (t.payoutStatus === 'SETTLED_TO_PHONE' || t.payoutStatus === 'SETTLED_TO_UPI') ? '#166534' : '#92400E',
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
                    ₹{partnerJobs.reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)}
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
                  வங்கி கணக்கு: HDFC Bank • Payout Phone: <strong>+91{activeTech?.payoutPhone || activeTech?.phone?.replace(/[^0-9]/g, '').slice(-10) || '---'}</strong>
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#334155', my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '10.5px' }}>
                    வங்கிக்கு வரவானது (Settled)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#34D399', fontSize: '13.5px' }}>
                    ₹{partnerJobs.filter(j => j.settlementStatus === 'SETTLED_TO_BANK').reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)}
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ flex: 1, p: 1, bgcolor: '#1E293B', borderRadius: '8px', border: '1px solid #334155' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '10.5px' }}>
                    வெள்ளிக்கிழமை வரவு (Escrow)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FBBF24', fontSize: '13.5px' }}>
                    ₹{partnerJobs.filter(j => j.settlementStatus === 'ESCROW_HELD').reduce((sum, j) => sum + (j.techPayout || 0), 0).toFixed(2)}
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
                  ஸ்டார் கிளப்: {Number(activeTech?.star_points ?? partnerIncentives?.starPoints ?? 0)} / 100 புள்ளிகள் ({Math.max(0, 100 - Number(activeTech?.star_points ?? partnerIncentives?.starPoints ?? 0))} புள்ளிகளில் 0% கமிஷன்)
                </Typography>
              </Box>
              <Chip
                label={Number(activeTech?.star_points ?? partnerIncentives?.starPoints ?? 0) >= 80 ? 'Level: Gold' : Number(activeTech?.star_points ?? partnerIncentives?.starPoints ?? 0) >= 30 ? 'Level: Silver' : 'Level: Bronze'}
                size="small"
                sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '10px' }}
              />
            </Paper>

            {/* 3. Filter Tabs for Settlements */}
            <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
              {[
                { id: 'all', label: `All Jobs (${partnerJobs.length})` },
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
                          <span>Shazu One Platform Commission (5%):</span>
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
        <Modal open={Boolean(selectedSlipJob)} onClose={() => setSelectedSlipJob(null)} maxWidth="xs">
          <ModalHeader
            title="Payout settlement slip"
            subtitle={selectedSlipJob ? `Booking #${selectedSlipJob.id} • ${selectedSlipJob.serviceName}` : 'Settlement details'}
            onClose={() => setSelectedSlipJob(null)}
          />

          {selectedSlipJob && (
            <ModalBody>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '12px' }}>
                  Booking reference & service
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                  #{selectedSlipJob.id} • {selectedSlipJob.serviceName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '13px' }}>
                  Service date: {formatDateTime(selectedSlipJob.completedAt || selectedSlipJob.created_at)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3, fontSize: '12px' }}>
                  Customer: {selectedSlipJob.customerName} ({selectedSlipJob.locality})
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 1, fontSize: '12px' }}>
                Itemized settlement calculation
              </Typography>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px dashed #E2E8F0', fontSize: '13px' }}>
                  <span>Customer gross payment</span>
                  <strong>₹{selectedSlipJob.grossAmount.toFixed(2)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px dashed #E2E8F0', fontSize: '13px', color: '#16A34A' }}>
                  <span>Technician base share (95%)</span>
                  <strong>₹{(Math.max(0, (selectedSlipJob.grossAmount - (selectedSlipJob.visit_fee || selectedSlipJob.visitFee || 99))) * 0.95).toFixed(2)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px dashed #E2E8F0', fontSize: '13px', color: '#16A34A' }}>
                  <span>Visit & travel allowance (100%)</span>
                  <strong>₹{parseFloat(selectedSlipJob.visit_fee || selectedSlipJob.visitFee || 99).toFixed(2)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px dashed #E2E8F0', fontSize: '13px', color: '#DC2626' }}>
                  <span>Platform fee (5%)</span>
                  <span>-₹{selectedSlipJob.platformCommission.toFixed(2)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, mt: 0.5, fontSize: '15px', color: '#0F172A' }}>
                  <strong>Net bank deposit:</strong>
                  <strong style={{ color: '#16A34A' }}>₹{selectedSlipJob.techPayout.toFixed(2)}</strong>
                </Box>
              </Paper>

              <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block', fontSize: '12px' }}>
                  Transfer method: Razorpay route direct transfer
                </Typography>
                <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '11px', mt: 0.4 }}>
                  Settled into: HDFC Bank (UPI: {selectedSlipJob.settlementUpi}) • Ref: {selectedSlipJob.bankRef}
                </Typography>
              </Box>
            </ModalBody>
          )}

          <ModalFooter>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => {
                setTechToast('Settlement slip receipt downloaded / printed successfully.');
                setSelectedSlipJob(null);
              }}
              sx={{
                bgcolor: '#0A66C2',
                color: '#FFF',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                height: 48,
                textTransform: 'none',
                '&:hover': { bgcolor: '#084e96' }
              }}
            >
              Print / save settlement receipt
            </Button>
          </ModalFooter>
        </Modal>

        {/* ===================== TAB 2: HELP (உதவி) ===================== */}
        {bottomNav === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '18px' }}>
                டெக்னீசியன் உதவி மையம் (Technician support)
              </Typography>
              <Chip label="Salem hub available" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '11px', borderRadius: '4px' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<PhoneIcon />}
                onClick={() => {
                  handleOpenCall({
                    id: activeBookingId || 'SLM-OPS-HELP',
                    customerName: 'Shazu One Central Ops Desk (Anand)',
                    customerPhone: '0427-2448888'
                  });
                }}
                sx={{
                  bgcolor: '#2563EB',
                  borderRadius: '8px',
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' }
                }}
              >
                மேனேஜருக்கு அழைக்கவும் (In-App Call)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={() => {
                  handleOpenChat({
                    id: activeBookingId || 'SLM-OPS-HELP',
                    customerName: 'Shazu One Central Ops Desk (Anand)',
                    customerPhone: '0427-2448888'
                  });
                }}
                sx={{
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  borderRadius: '8px',
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' }
                }}
              >
                உதவி அரட்டை (In-App Chat)
              </Button>
            </Box>
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
                  Technician ID: PRT-SLM-{user?.id ? String(user.id).slice(0, 6).toUpperCase() : 'PARTNER'} • Salem Central Hub
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleIcon sx={{ color: user?.isKycVerified ? '#047857 !important' : '#B45309 !important', fontSize: 13 }} />}
                label={user?.isKycVerified ? 'Verified Pro' : 'Verification Pending'}
                size="small"
                sx={{ bgcolor: user?.isKycVerified ? '#DCFCE7' : '#FEF3C7', color: user?.isKycVerified ? '#047857' : '#B45309', fontWeight: 700, fontSize: '11px', borderRadius: '4px' }}
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
                    {(user?.name || 'PR').slice(0, 2).toUpperCase()}
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
                      {user?.name || 'Partner'}
                    </Typography>
                    <Chip 
                      label={Number(user?.jobsCompleted || user?.jobs_completed_count) > 0 ? 'Gold Partner' : 'New Partner'} 
                      size="small" 
                      sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '10px', height: 18 }} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 600, fontSize: '12px', mt: 0.2 }}>
                    {user?.tradeName || `${user?.trade?.toUpperCase() || 'SERVICE'} Specialist`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: '#1E293B', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                      <StarIcon sx={{ color: '#F59E0B', fontSize: 13 }} />
                      <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700, fontSize: '11px' }}>
                        {Number(user?.jobsCompleted || user?.jobs_completed_count) > 0 && Number(user?.ratingAvg) > 0 ? user.ratingAvg : 'Unrated'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                        ({Number(user?.ratingCount) || 0} reviews)
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
                    {Number(user?.jobsCompleted || user?.jobs_completed_count) || 0}
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

            {/* Action Bar: Edit Profile & KYC Documents */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                  சுயவிவரம் & KYC ஆவணங்கள் (Profile & KYC Documents)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                  UPI ID, ஆவணங்கள் மற்றும் திறன்களை எந்த நேரத்திலும் புதுப்பிக்கலாம் (Update UPI ID, Trade & Re-upload ID)
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenEditProfile}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '11.5px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 1.8,
                  py: 0.8,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                விவரங்களை மாற்று (Edit)
              </Button>
            </Paper>

            {/* 2. Personal & Contact Information */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <PersonIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                    தனிப்பட்ட & தொடர்பு விவரங்கள் (Contact Details)
                  </Typography>
                </Box>
                <Button size="small" onClick={handleOpenEditProfile} startIcon={<EditIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '11px', textTransform: 'none', py: 0, color: '#0284C7', fontWeight: 700 }}>
                  Edit
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Partner Name:</span>
                  <strong style={{ color: '#0F172A' }}>{user?.name || user?.full_name || 'Salem Certified Partner'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Primary Phone (Registered):</span>
                  <strong style={{ color: '#0F172A' }}>{user?.phone || '+91 98427 89012'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Email Address:</span>
                  <strong style={{ color: '#0F172A' }}>{user?.email || 'partner@Shazu One.in'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Primary Skill / Category:</span>
                  <Chip label={user?.tradeName || (user?.trade ? user.trade.toUpperCase() : 'Home Services Specialist')} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '11px', height: 20 }} />
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Operating Area:</span>
                  <strong style={{ color: '#0F172A' }}>{user?.serviceArea || 'Fairlands, Salem'}</strong>
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
                Base Hub: <strong>Shazu One Fairlands Central Hub (Salem - 636016)</strong>
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
                {(activeTechLocalities.length > 0 ? activeTechLocalities : ['Fairlands']).map((loc, idx) => (
                  <Chip
                    key={idx}
                    icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#16A34A !important' }} />}
                    label={loc}
                    size="small"
                    sx={{ bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', fontWeight: 700, fontSize: '11px' }}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <VerifiedUserIcon sx={{ color: '#059669', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                    அரசு ஆவண சரிபார்ப்பு (Government Verified Badges)
                  </Typography>
                </Box>
                <Button size="small" onClick={handleOpenEditProfile} startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '11px', textTransform: 'none', py: 0, color: '#0284C7', fontWeight: 700 }}>
                  Re-upload ID
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: user?.aadhaarCardUrl || user?.isKycVerified ? '#F0FDF4' : '#FEF3C7', border: `1px solid ${user?.aadhaarCardUrl || user?.isKycVerified ? '#BBF7D0' : '#FDE68A'}`, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: user?.aadhaarCardUrl || user?.isKycVerified ? '#166534' : '#92400E', fontSize: '12px' }}>
                      Aadhaar Identity Verification (UIDAI e-KYC)
                    </Typography>
                    <Typography variant="caption" sx={{ color: user?.aadhaarCardUrl || user?.isKycVerified ? '#15803D' : '#B45309', fontSize: '10.5px' }}>
                      {user?.aadhaarCardUrl ? 'Document Uploaded & Stored in Cloud' : 'Pending Document Upload'} • {user?.aadhaarNumber ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}` : 'UIDAI Verified'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip 
                      label={user?.isKycVerified ? 'Verified' : user?.aadhaarCardUrl ? 'Under Review' : 'Action Required'} 
                      size="small" 
                      sx={{ 
                        bgcolor: user?.isKycVerified ? '#DCFCE7' : user?.aadhaarCardUrl ? '#E0F2FE' : '#FEF3C7', 
                        color: user?.isKycVerified ? '#166534' : user?.aadhaarCardUrl ? '#0369A1' : '#92400E', 
                        fontWeight: 700, 
                        fontSize: '10px', 
                        height: 20 
                      }} 
                    />
                    <Button 
                      size="small" 
                      onClick={handleOpenEditProfile}
                      sx={{ fontSize: '10.5px', textTransform: 'none', py: 0.2, px: 0.8, minWidth: 'auto', fontWeight: 700, color: '#0284C7' }}
                    >
                      {user?.aadhaarCardUrl ? 'Re-upload' : 'Upload'}
                    </Button>
                  </Box>
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
                      {user?.tradeName || 'Home Services Trade'} • Grade A+
                    </Typography>
                  </Box>
                  <Chip label="Certified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '10px', height: 20 }} />
                </Paper>
              </Box>
            </Paper>

            {/* 5. Bank Account & Settlement Routing */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AccountBalanceIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                    வங்கி & கொடுப்பனவு கணக்கு (Bank & Payout Setup)
                  </Typography>
                </Box>
                <Button size="small" onClick={handleOpenEditProfile} startIcon={<EditIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '11px', textTransform: 'none', py: 0, color: '#0284C7', fontWeight: 700 }}>
                  Edit Payout
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Primary Bank:</span>
                  <strong style={{ color: '#0F172A' }}>{user?.bankName || 'Verified Partner Bank'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Account Holder:</span>
                  <strong style={{ color: '#0F172A' }}>{user?.name?.toUpperCase() || 'VERIFIED PARTNER'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B' }}>Payout Phone:</span>
                  <strong style={{ color: '#16A34A', fontSize: '13px' }}>+91{activeTech?.payoutPhone || activeTech?.upi_vpa?.replace(/@.*$/, '') || user?.phone?.replace(/[^0-9]/g, '').slice(-10) || 'Not Set'}</strong>
                </Box>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Settlement Model:</span>
                  <strong style={{ color: '#2563EB' }}>Shazu One Direct (98% Technician Share)</strong>
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

      {/* Masked Chat Modal (In-App Only) */}
      <MaskedChatModal 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        bookingId={selectedCommunicationJob?.id || activeBookingId}
        userRole="technician"
        peerName={selectedCommunicationJob?.customerName || activeJob?.customerName || 'Customer'} 
      />

      {/* Masked VoIP Call Modal (In-App Only - Zero Number Disclosure) */}
      <VoipCallModal 
        open={callOpen} 
        onClose={() => {
          NativeNotifier.stopCallRingtone();
          setCallOpen(false);
          setIsIncomingCall(false);
        }} 
        bookingId={selectedCommunicationJob?.id || activeBookingId}
        calleeName={selectedCommunicationJob?.customerName || activeJob?.customerName || 'Customer'} 
        role="Technician" 
        isIncoming={isIncomingCall}
        autoAnswer={new URLSearchParams(window.location.search).get('autoAnswer') === 'true'}
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
      <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
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

      {/* Transparent Customer Cancellation Notice Modal */}
      <Modal
        open={Boolean(cancellationNotice)}
        onClose={handleAcknowledgeCancellation}
        maxWidth="xs"
      >
        <ModalHeader
          title="Customer cancelled booking"
          subtitle={cancellationNotice ? `Booking #${cancellationNotice.bookingId}` : 'Cancellation notice'}
          onClose={handleAcknowledgeCancellation}
        />
        <ModalBody>
          <Typography variant="body2" sx={{ color: '#0F172A', fontSize: '14px', mb: 2, lineHeight: 1.5 }}>
            Customer <strong>{cancellationNotice?.customerName || 'Customer'}</strong> ({cancellationNotice?.locality || 'Fairlands, Salem'}) has cancelled booking <strong>#{cancellationNotice?.bookingId}</strong>.
          </Typography>

          <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 1, fontSize: '12px' }}>
              Settlement and compensation breakdown
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '13px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Cancellation reason:</span>
                <strong style={{ color: '#0F172A' }}>{cancellationNotice?.reason || 'Customer request'}</strong>
              </Box>
              <Divider sx={{ borderColor: '#E2E8F0' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Travel & fuel compensation:</span>
                <strong style={{ color: '#16A34A', fontSize: '14px' }}>
                  ₹{cancellationNotice?.technicianTravelDisbursal || 99}.00 (100%)
                </strong>
              </Box>
              <Divider sx={{ borderColor: '#E2E8F0' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Platform commission:</span>
                <strong style={{ color: '#64748B' }}>₹0.00 (Zero deduction)</strong>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', p: 1.5 }}>
            <Typography variant="caption" sx={{ fontSize: '12px', lineHeight: 1.4, display: 'block' }}>
              ₹{cancellationNotice?.technicianTravelDisbursal || 99}.00 visit fee has been sent to your payout phone. Your duty radar is unlocked for new leads.
            </Typography>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAcknowledgeCancellation}
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFFFFF',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '14px',
              height: 48,
              textTransform: 'none',
              '&:hover': { bgcolor: '#084e96' }
            }}
          >
            Acknowledge and continue duty
          </Button>
        </ModalFooter>
      </Modal>

      {/* Location Permission Request Modal */}
      <Modal 
        open={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)}
        maxWidth="xs"
      >
        <ModalHeader
          title="Location access required"
          subtitle="Required for live navigation and job dispatch"
          onClose={() => setLocationModalOpen(false)}
        />
        <ModalBody>
          <Typography variant="body2" sx={{ color: '#0F172A', mb: 2, lineHeight: 1.5, fontSize: '14px' }}>
            Shazu One requires device location <strong>only while you are on duty</strong> to calculate live customer ETAs, doorstep route navigation in Salem, and dispatch nearby high-paying jobs.
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: '#0A66C2', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '12px' }}>
              Privacy guaranteed
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '12px', lineHeight: 1.4 }}>
              Your location is never tracked when offline. Turning duty off stops all GPS broadcasting immediately.
            </Typography>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button 
            onClick={() => {
              setLocationModalOpen(false);
              setIsOnline(false);
              setIsGpsBroadcasting(false);
            }} 
            sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none', height: 48 }}
          >
            Stay offline
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
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFF',
              fontWeight: 700,
              borderRadius: '14px',
              height: 48,
              minWidth: 150,
              textTransform: 'none',
              '&:hover': { bgcolor: '#084e96' }
            }}
          >
            Allow and go online
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Profile & KYC Documents Modal */}
      <Modal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        maxWidth="sm"
      >
        <ModalHeader
          title="Edit profile & KYC"
          subtitle="Update payout phone and verified identity documents"
          onClose={() => setEditProfileOpen(false)}
        />

        <ModalBody>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', display: 'block', mb: 0.6, fontSize: '13px' }}>
                Full name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. K. Ramesh"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '14px' } }}
              />
            </Box>

            {/* Trade Category Selection */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', display: 'block', mb: 0.8, fontSize: '13px' }}>
                Primary trade
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { id: 'ac', label: 'AC Repair' },
                  { id: 'electrician', label: 'Electrician' },
                  { id: 'plumber', label: 'Plumbing' },
                  { id: 'cleaning', label: 'Cleaning' }
                ].map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    clickable
                    onClick={() => setProfileTrade(t.id)}
                    variant={profileTrade === t.id ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 600,
                      fontSize: '13px',
                      borderRadius: '999px',
                      minHeight: 40,
                      px: 1,
                      bgcolor: profileTrade === t.id ? '#0A66C2' : 'transparent',
                      color: profileTrade === t.id ? '#FFFFFF' : '#0F172A',
                      borderColor: '#CBD5E1',
                      '&:hover': { bgcolor: profileTrade === t.id ? '#084e96' : '#F1F5F9' }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Payout Phone */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', display: 'block', mb: 0.6, fontSize: '13px' }}>
                Payout phone number
              </Typography>
              <TextField
                fullWidth
                size="small"
                inputMode="numeric"
                value={profilePayoutPhone}
                onChange={(e) => setProfilePayoutPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="e.g. 9842012345"
                helperText="Earnings will be sent directly to this phone-linked UPI account."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: '14px' }}>+91</Typography>
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '14px' } }}
              />
            </Box>

            {/* KYC Document Upload / Re-upload */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', display: 'block', mb: 0.6, fontSize: '13px' }}>
                KYC identity photo (Aadhaar / Govt ID)
              </Typography>
              <DocumentUploadControl
                label="Aadhaar / Govt ID photo"
                sublabel="Direct camera or gallery upload (up to 5 MB)"
                folder="aadhaar"
                referenceId={user?.phone || 'partner'}
                existingUrl={profileAadhaarUrl}
                onUploadSuccess={(url) => setProfileAadhaarUrl(url)}
                onRemove={() => setProfileAadhaarUrl(null)}
                maxSizeMb={5}
              />
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            onClick={() => setEditProfileOpen(false)}
            sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none', height: 48 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '14px',
              textTransform: 'none',
              height: 48,
              minWidth: 140,
              fontSize: '14px',
              '&:hover': { bgcolor: '#084e96' }
            }}
          >
            {isSavingProfile ? 'Saving...' : 'Save changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Technician Reschedule / Delay Handover Modal */}
      <Modal
        open={techRescheduleModalOpen}
        onClose={() => setTechRescheduleModalOpen(false)}
        maxWidth="sm"
      >
        <ModalHeader
          title="Reschedule / Emergency Handover • பணி மாற்றம்"
          subtitle={`Booking #${techRescheduleJob?.id || ''} - ${techRescheduleJob?.customerName || 'Customer'}`}
          onClose={() => setTechRescheduleModalOpen(false)}
        />
        <ModalBody>
          {/* Mode Selector Tabs */}
          <Box sx={{ display: 'flex', gap: 1, p: 0.5, bgcolor: '#0F172A', borderRadius: '10px', mb: 2.5 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                setTechRescheduleMode('propose_slot');
                setTechRescheduleReason(TECH_PROPOSE_REASONS[0]);
              }}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                fontWeight: 800,
                fontSize: '11.5px',
                textTransform: 'none',
                bgcolor: techRescheduleMode === 'propose_slot' ? '#0284C7' : 'transparent',
                color: techRescheduleMode === 'propose_slot' ? '#FFFFFF' : '#94A3B8',
                '&:hover': { bgcolor: techRescheduleMode === 'propose_slot' ? '#0369A1' : '#1E293B' }
              }}
            >
              Propose New Slot to Customer
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => {
                setTechRescheduleMode('request_handover');
                setTechRescheduleReason(TECH_HANDOVER_REASONS[0]);
              }}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                fontWeight: 800,
                fontSize: '11.5px',
                textTransform: 'none',
                bgcolor: techRescheduleMode === 'request_handover' ? '#DC2626' : 'transparent',
                color: techRescheduleMode === 'request_handover' ? '#FFFFFF' : '#94A3B8',
                '&:hover': { bgcolor: techRescheduleMode === 'request_handover' ? '#B91C1C' : '#1E293B' }
              }}
            >
              Handover to Central Ops
            </Button>
          </Box>

          {techRescheduleMode === 'propose_slot' ? (
            <>
              {/* Context Pill */}
              <Box sx={{ p: 1.5, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '12px' }}>
                  Proposing Revised Time Window
                </Typography>
                <Typography variant="caption" sx={{ color: '#0C4A6E', fontSize: '11px', display: 'block' }}>
                  The customer will receive an instant notification on their tracking screen to approve your revised slot. You remain assigned to this booking.
                </Typography>
              </Box>

              {/* Step 1: Select Proposed Day */}
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                SELECT PROPOSED SERVICE DATE
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5, mb: 2.5, '::-webkit-scrollbar': { height: 4 } }}>
                {upcomingRescheduleDays.map((d, idx) => {
                  const isSelected = techProposedDayIndex === idx;
                  return (
                    <Box
                      key={d.iso}
                      onClick={() => setTechProposedDayIndex(idx)}
                      sx={{
                        flexShrink: 0,
                        width: 72,
                        py: 0.8,
                        px: 0.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                        bgcolor: isSelected ? '#F0F9FF' : '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '10px', color: isSelected ? '#0284C7' : '#64748B', display: 'block' }}>
                        {d.dayLabel}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '15px', color: isSelected ? '#0C4A6E' : '#0F172A', my: 0.2 }}>
                        {d.dayNum}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9.5px', color: isSelected ? '#0369A1' : '#94A3B8', display: 'block' }}>
                        {d.monthLabel}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Step 2: Select Proposed Time Window */}
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                CHOOSE PROPOSED TIME WINDOW
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1, mb: 2.5 }}>
                {TECH_RESCHEDULE_TIME_SLOTS.map((slot) => {
                  const isSelected = techProposedTime === slot;
                  return (
                    <Button
                      key={slot}
                      variant={isSelected ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setTechProposedTime(slot)}
                      sx={{
                        py: 0.9,
                        px: 1,
                        borderRadius: '8px',
                        borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                        bgcolor: isSelected ? '#0284C7' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        fontWeight: 700,
                        fontSize: '11px',
                        textTransform: 'none',
                        justifyContent: 'center',
                        '&:hover': {
                          bgcolor: isSelected ? '#0369A1' : '#F8FAFC',
                          borderColor: '#0284C7'
                        }
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </Box>

              {/* Step 3: Reason for Delay / Reschedule */}
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                REASON FOR DELAY OR TIME REVISION
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                {TECH_PROPOSE_REASONS.map((r) => {
                  const isSelected = techRescheduleReason === r;
                  return (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      clickable
                      onClick={() => setTechRescheduleReason(r)}
                      sx={{
                        bgcolor: isSelected ? '#0F172A' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontWeight: 700,
                        fontSize: '11px',
                        border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0'
                      }}
                    />
                  );
                })}
              </Box>
            </>
          ) : (
            <>
              {/* Mode B: Emergency Handover Notice */}
              <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B', fontSize: '12.5px', mb: 0.5 }}>
                  Immediate Central Operations Handover
                </Typography>
                <Typography variant="caption" sx={{ color: '#B91C1C', fontSize: '11px', display: 'block', lineHeight: 1.5 }}>
                  If you can no longer attend this appointment due to an emergency or breakdown, Shazu One Central Ops will immediately reassign this customer to another verified technician in your trade without service interruption.
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                SELECT HANDOVER REASON
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                {TECH_HANDOVER_REASONS.map((r) => {
                  const isSelected = techRescheduleReason === r;
                  return (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      clickable
                      onClick={() => setTechRescheduleReason(r)}
                      sx={{
                        bgcolor: isSelected ? '#DC2626' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontWeight: 700,
                        fontSize: '11px',
                        border: isSelected ? '1px solid #DC2626' : '1px solid #E2E8F0'
                      }}
                    />
                  );
                })}
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={() => setTechRescheduleModalOpen(false)}
              sx={{ flex: 1, borderRadius: '8px', textTransform: 'none', fontWeight: 700, color: '#64748B', borderColor: '#CBD5E1' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={techSubmittingReschedule}
              onClick={handleSubmitTechReschedule}
              sx={{
                flex: 2,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '12.5px',
                bgcolor: techRescheduleMode === 'propose_slot' ? '#0284C7' : '#DC2626',
                color: '#FFF',
                '&:hover': { bgcolor: techRescheduleMode === 'propose_slot' ? '#0369A1' : '#B91C1C' }
              }}
            >
              {techSubmittingReschedule
                ? 'Submitting...'
                : techRescheduleMode === 'propose_slot'
                ? 'Send Proposed Slot to Customer'
                : 'Confirm Handover to Central Ops'}
            </Button>
          </Box>
        </ModalFooter>
      </Modal>

      {/* Partner Support Ticket & Resolution Modal */}
      <SupportTicketModal
        open={supportTicketModalOpen}
        onClose={() => setSupportTicketModalOpen(false)}
        defaultBookingId={activeBookingId || ''}
        defaultCategory="duty_gps_issue"
      />


    </Box>
  );
}

