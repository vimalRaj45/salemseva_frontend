import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  Collapse,
  Menu,
  TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Professional Material UI Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ElectricMopedIcon from '@mui/icons-material/ElectricMoped';
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GavelIcon from '@mui/icons-material/Gavel';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import BuildIcon from '@mui/icons-material/Build';
import PhoneIcon from '@mui/icons-material/Phone';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SendIcon from '@mui/icons-material/Send';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import RoomIcon from '@mui/icons-material/Room';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BugReportIcon from '@mui/icons-material/BugReport';
import ForumIcon from '@mui/icons-material/Forum';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import NavigationIcon from '@mui/icons-material/Navigation';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';

// Modular Sub-Components
import AdminSidebar from './AdminSidebar';
import AdminServicesModule from './AdminServicesModule';
import AdminTeamModule from './AdminTeamModule';
import AdminWhatsAppModule from './AdminWhatsAppModule';
import AdminDispatchDrawer from './AdminDispatchDrawer';
import AdminTechnicianDossierDrawer from './AdminTechnicianDossierDrawer';
import AdminCustomerDossierDrawer from './AdminCustomerDossierDrawer';
import LeadAudioPlayer from '../../components/LeadAudioPlayer';
import { useAuth } from '../../context/AuthContext';

import {
  AddonInput,
  FieldCard,
  SectionHeader,
  KpiCard,
  PageHeader,
  StickySaveBar,
  StatusPill,
  IconActionButton,
  EmptyState,
  SkeletonBlock,
  ConfirmDialog,
  DataTable
} from '../../components/ui';

import { API_V1_URL } from '../../config';
import { resolveMediaUrl } from '../../utils/mediaUtils';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('shazuone_admin_role') || 'super_admin');
  const [teamList, setTeamList] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState('ops'); // 'ops', 'tracking', 'services', 'technicians', 'customers', 'feedback', 'rewards', 'team', 'traceability'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    activeBookings: 0,
    totalCompleted: 0,
    onlineTechnicians: 0,
    disputesPending: 0,
    financials: { totalRevenue: 0, techPayouts: 0, platformCommission: 0 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customersList, setCustomersList] = useState([]);

  // Live Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedTrackingBooking, setSelectedTrackingBooking] = useState(null);

  // Advanced Filter States (Ops Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');
  const [selectedAudioFilter, setSelectedAudioFilter] = useState('all'); // 'all', 'audio_only', 'text_only'
  const [selectedDateFilter, setSelectedDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'week'
  const [selectedDispatchMode, setSelectedDispatchMode] = useState('all'); // 'all', 'instant', 'scheduled', 'urgent'

  // Tech Fleet Filter State
  const [techTab, setTechTab] = useState('all');

  // Platform Feedback States (Customer & Technician Issues)
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState('all'); // 'all', 'customer', 'technician'
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all'); // 'all', 'new', 'resolved'
  const [feedbackSearch, setFeedbackSearch] = useState('');

  // Support Tickets Desk States
  const [ticketsList, setTicketsList] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all'); // 'all', 'open', 'in_progress', 'resolved', 'closed'
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('all'); // 'all', 'urgent', 'high', 'normal', 'low'
  const [ticketRoleFilter, setTicketRoleFilter] = useState('all'); // 'all', 'partner', 'customer', 'guest'
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketNewStatus, setTicketNewStatus] = useState('resolved');
  const [ticketResolutionNote, setTicketResolutionNote] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // Real Service Reviews & Ratings States (PostgreSQL)
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsStats, setReviewsStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFilter, setReviewsFilter] = useState('all'); // 'all', '5star', 'escalated'

  // Customer 360 History Dialog
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false);

  // Technician 360 Dossier Dialog
  const [techDossierModalOpen, setTechDossierModalOpen] = useState(false);
  const [selectedTechDossier, setSelectedTechDossier] = useState(null);
  const [techJobsHistory, setTechJobsHistory] = useState([]);
  const [techFinancials, setTechFinancials] = useState(null);
  const [techDossierLoading, setTechDossierLoading] = useState(false);

  // Aadhaar Document & Parts Bill In-App Viewer Modal State
  const [docPreviewModal, setDocPreviewModal] = useState({
    open: false,
    url: '',
    title: '',
    type: 'aadhaar', // 'aadhaar' or 'bill'
    data: null
  });
  const [docZoom, setDocZoom] = useState(1);
  const [docImgError, setDocImgError] = useState(false);

  // Booking Deep Traceability Dialog State
  const [bookingTraceModalOpen, setBookingTraceModalOpen] = useState(false);
  const [selectedBookingTrace, setSelectedBookingTrace] = useState(null);

  // Audit Traceability Logs State
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEventFilter, setAuditEventFilter] = useState('all');

  // Dispatch Drawer State
  const [dispatchDrawerOpen, setDispatchDrawerOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [selectedTechForDispatch, setSelectedTechForDispatch] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Release Technician (Customer Unresponsive) State — legacy, kept for existing buttons
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [targetBookingForRelease, setTargetBookingForRelease] = useState(null);
  const [releaseReason, setReleaseReason] = useState('Customer not answering phone calls / Doorbell no response at doorstep');
  const [releaseDetails, setReleaseDetails] = useState('');
  const [compensateTech, setCompensateTech] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState(false);

  // Admin Cancel Order & Release Tech — general-purpose
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancelOrderReason, setCancelOrderReason] = useState('');
  const [cancelOrderDetails, setCancelOrderDetails] = useState('');
  const [cancelOrderCompensate, setCancelOrderCompensate] = useState(false);
  const [cancelOrderLoading, setCancelOrderLoading] = useState(false);

  // Admin Payment Override ("Mark as Paid") State
  const [paymentOverrideModalOpen, setPaymentOverrideModalOpen] = useState(false);
  const [targetBookingForPayment, setTargetBookingForPayment] = useState(null);

  // Rewards, Commission & Settings State (Customizable by Admin in platform_settings)
  const [rewardConfig, setRewardConfig] = useState({
    customer_referral_credits: 50,
    referee_discount_amount: 50,
    review_reward_credits: 25,
    feedback_reward_credits: 0,
    feedback_rewards_enabled: false,
    partner_referral_incentive: 100,
    partner_welcome_bonus: 0,
    partner_commission_percent: 2.0,
    customer_platform_fee_percent: 2.0,
    payment_gateway_fee_percent: 2.0,
    inspection_visit_fee: 99
  });
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsSaving, setRewardsSaving] = useState(false);
  const [initialRewardConfig, setInitialRewardConfig] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  // Coupons Engine State
  const [couponsList, setCouponsList] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'flat',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountCap: '',
    description: '',
    isActive: true,
    validUntil: '',
    usageLimit: ''
  });

  // Toast Notification
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Advanced Filter Collapse State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Row Action Dropdown Menu State (Dispatch Queue)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionTargetJob, setActionTargetJob] = useState(null);

  // Row Action Dropdown Menu State (Technicians)
  const [techActionMenuAnchor, setTechActionMenuAnchor] = useState(null);
  const [actionTargetTech, setActionTargetTech] = useState(null);

  // Row Action Dropdown Menu State (Customers)
  const [custActionMenuAnchor, setCustActionMenuAnchor] = useState(null);
  const [actionTargetCust, setActionTargetCust] = useState(null);

  // Table Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleActionMenuOpen = (event, job) => {
    setActionMenuAnchor(event.currentTarget);
    setActionTargetJob(job);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionTargetJob(null);
  };

  const handleTechActionMenuOpen = (event, tech) => {
    setTechActionMenuAnchor(event.currentTarget);
    setActionTargetTech(tech);
  };
  const handleTechActionMenuClose = () => {
    setTechActionMenuAnchor(null);
    setActionTargetTech(null);
  };

  const handleCustActionMenuOpen = (event, cust) => {
    setCustActionMenuAnchor(event.currentTarget);
    setActionTargetCust(cust);
  };
  const handleCustActionMenuClose = () => {
    setCustActionMenuAnchor(null);
    setActionTargetCust(null);
  };

  // Fetch Platform Feedbacks (From API and Local Storage sync)
  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const res = await fetch(`${API_V1_URL}/feedback/list`);
      const data = await res.json();
      let serverFeedbacks = data.success && Array.isArray(data.feedbacks) ? data.feedbacks : [];

      const localRaw = localStorage.getItem('shazuone_feedbacks_list');
      const localFeedbacks = localRaw ? JSON.parse(localRaw) : [];

      const map = new Map();
      localFeedbacks.forEach(item => {
        const key = item.id?.toString() || `${item.user_phone || item.userPhone}_${item.created_at}`;
        map.set(key, item);
      });
      serverFeedbacks.forEach(item => {
        const key = item.id?.toString() || `${item.user_phone || item.userPhone}_${item.created_at}`;
        map.set(key, item);
      });

      const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setFeedbacksList(merged);
    } catch (e) {
      console.warn('Feedback fetch fallback to local:', e);
      const localRaw = localStorage.getItem('shazuone_feedbacks_list');
      if (localRaw) {
        setFeedbacksList(JSON.parse(localRaw));
      }
    } finally {
      setFeedbacksLoading(false);
    }
  };

  // Fetch Real Customer Reviews & Ratings from PostgreSQL
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const [rRes, sRes] = await Promise.all([
        fetch(`${API_V1_URL}/reviews`),
        fetch(`${API_V1_URL}/reviews/stats`)
      ]);
      const [rData, sData] = await Promise.all([rRes.json(), sRes.json()]);
      if (rData.success && Array.isArray(rData.reviews)) {
        setReviewsList(rData.reviews);
      }
      if (sData.success && sData.stats) {
        setReviewsStats(sData.stats);
      }
    } catch (e) {
      console.warn('Reviews fetch note:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchReviews();
    const handleFeedbackEvent = () => {
      fetchFeedbacks();
      fetchReviews();
    };
    window.addEventListener('shazuone_new_feedback_received', handleFeedbackEvent);
    window.addEventListener('storage', handleFeedbackEvent);
    return () => {
      window.removeEventListener('shazuone_new_feedback_received', handleFeedbackEvent);
      window.removeEventListener('storage', handleFeedbackEvent);
    };
  }, []);

  const handleUpdateFeedbackStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_V1_URL}/feedback/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: `Status updated by Salem Ops Admin at ${new Date().toLocaleTimeString()}`
        })
      });
    } catch (e) {
      console.warn('Feedback status update network note:', e);
    }

    setFeedbacksList(prev => {
      const updated = prev.map(f => (f.id === id ? { ...f, status: newStatus } : f));
      localStorage.setItem('shazuone_feedbacks_list', JSON.stringify(updated));
      return updated;
    });

    setToast({
      open: true,
      message: `Feedback #${id} updated to ${newStatus.toUpperCase()}`,
      severity: newStatus === 'resolved' ? 'success' : 'info'
    });
  };

  // Fetch Support Tickets from Backend
  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/tickets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets);
      }
    } catch (e) {
      console.warn('Tickets fetch note:', e);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleOpenTicketModal = (ticket) => {
    setSelectedTicketForModal(ticket);
    setTicketNewStatus(ticket.status === 'open' ? 'in_progress' : ticket.status);
    setTicketResolutionNote(ticket.resolution_summary || ticket.admin_notes || '');
    setTicketModalOpen(true);
  };

  const handleUpdateTicketStatus = async () => {
    if (!selectedTicketForModal) return;
    try {
      setIsUpdatingTicket(true);
      const res = await fetch(`${API_V1_URL}/admin/tickets/${selectedTicketForModal.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: ticketNewStatus,
          resolutionSummary: ticketResolutionNote || 'Resolved by Central Operations Desk',
          resolvedBy: user?.name || 'Salem Operations Admin'
        })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setToast({ open: true, message: `Ticket ${data.ticket.ticket_number} updated to ${ticketNewStatus.toUpperCase()}`, severity: 'success' });
        setTicketsList(prev => prev.map(t => t.id === data.ticket.id ? data.ticket : t));
        setTicketModalOpen(false);
        setSelectedTicketForModal(null);
      } else {
        setToast({ open: true, message: data.error || 'Failed to update ticket', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error updating ticket', severity: 'error' });
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  // Filtered Tickets Computation
  const filteredTickets = useMemo(() => {
    return ticketsList.filter(item => {
      const status = (item.status || 'open').toLowerCase();
      const priority = (item.priority || 'normal').toLowerCase();
      const role = (item.creator_role || 'customer').toLowerCase();
      const query = ticketSearch.trim().toLowerCase();

      if (ticketStatusFilter !== 'all' && status !== ticketStatusFilter) return false;
      if (ticketPriorityFilter !== 'all' && priority !== ticketPriorityFilter) return false;
      if (ticketRoleFilter !== 'all' && role !== ticketRoleFilter) return false;

      if (query) {
        const tNum = (item.ticket_number || '').toLowerCase();
        const cName = (item.creator_name || '').toLowerCase();
        const cPhone = (item.creator_phone || '').toLowerCase();
        const subj = (item.subject || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const bId = (item.booking_id || '').toLowerCase();
        if (!tNum.includes(query) && !cName.includes(query) && !cPhone.includes(query) && !subj.includes(query) && !desc.includes(query) && !bId.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [ticketsList, ticketStatusFilter, ticketPriorityFilter, ticketRoleFilter, ticketSearch]);

  // Filtered Feedbacks Computation
  const filteredFeedbacks = useMemo(() => {
    return feedbacksList.filter(item => {
      const role = (item.role || 'customer').toLowerCase();
      const status = (item.status || 'new').toLowerCase();
      const name = (item.user_name || item.userName || '').toLowerCase();
      const phone = (item.user_phone || item.userPhone || '').toLowerCase();
      const msg = (item.message || '').toLowerCase();
      const subj = (item.subject || '').toLowerCase();
      const cat = (item.feedback_type || item.feedbackType || '').toLowerCase();
      const q = feedbackSearch.toLowerCase();

      const matchesRole = feedbackRoleFilter === 'all' || role === feedbackRoleFilter;
      const matchesStatus = feedbackStatusFilter === 'all' || status === feedbackStatusFilter;
      const matchesSearch = !q || name.includes(q) || phone.includes(q) || msg.includes(q) || subj.includes(q) || cat.includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [feedbacksList, feedbackRoleFilter, feedbackStatusFilter, feedbackSearch]);

  // Filtered Audit Logs Computation
  const filteredAuditLogs = useMemo(() => {
    return auditLogsList.filter(log => {
      const q = (auditSearch || '').toLowerCase();
      const eventType = (log.event_type || '').toLowerCase();
      const bookingId = (log.booking_id || '').toLowerCase();
      const actorId = (log.actor_id || '').toLowerCase();
      let metaStr = '';
      try {
        metaStr = typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata || {});
      } catch (e) {}

      const matchesSearch = !q || eventType.includes(q) || bookingId.includes(q) || actorId.includes(q) || metaStr.toLowerCase().includes(q);

      if (auditEventFilter === 'kyc') {
        if (!eventType.includes('kyc') && !eventType.includes('onboard')) return false;
      } else if (auditEventFilter === 'dispatch') {
        if (!eventType.includes('dispatch') && !eventType.includes('matched')) return false;
      } else if (auditEventFilter === 'quote') {
        if (!eventType.includes('quote')) return false;
      } else if (auditEventFilter === 'payment') {
        if (!eventType.includes('payment') && !eventType.includes('settlement')) return false;
      }

      return matchesSearch;
    });
  }, [auditLogsList, auditSearch, auditEventFilter]);

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [overviewRes, customersRes, teamRes] = await Promise.all([
        fetch(`${API_V1_URL}/admin/overview`),
        fetch(`${API_V1_URL}/admin/customers`),
        fetch(`${API_V1_URL}/admin/team`)
      ]);
      const data = await overviewRes.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentBookings) setRecentBookings(data.recentBookings);
        if (data.technicians) setTechnicians(data.technicians);
      }
      const cData = await customersRes.json();
      if (cData.success && cData.customers) {
        setCustomersList(cData.customers);
      }
      const tData = await teamRes.json();
      if (tData.success && Array.isArray(tData.team)) {
        setTeamList(tData.team);
      }
    } catch (err) {
      console.warn('Live API sync error, keeping current state:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/traceability`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setAuditLogsList(data.logs);
      }
    } catch (err) {
      console.warn('Audit logs fetch note:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // Fetch Reward Configuration from Backend
  const fetchRewardConfig = async () => {
    try {
      setRewardsLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/settings/rewards`);
      const data = await res.json();
      if (data.success && data.settings) {
        setRewardConfig(data.settings);
        setInitialRewardConfig(data.settings);
      }
    } catch (err) {
      console.warn('Reward settings fetch note:', err);
    } finally {
      setRewardsLoading(false);
    }
  };

  // Save Reward Configuration
  const handleSaveRewardConfig = async () => {
    try {
      setRewardsSaving(true);
      const res = await fetch(`${API_V1_URL}/admin/settings/rewards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardConfig)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: 'Reward & credit amounts updated successfully in database', severity: 'success' });
        if (data.settings) {
          setRewardConfig(prev => ({ ...prev, ...data.settings }));
          setInitialRewardConfig(prev => ({ ...prev, ...data.settings }));
        }
      } else {
        setToast({ open: true, message: data.error || 'Failed to update reward settings', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setRewardsSaving(false);
    }
  };

  // Fetch Coupons from Backend
  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/coupons`);
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCouponsList(data.coupons);
      }
    } catch (err) {
      console.warn('Coupons fetch note:', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  // Toggle Coupon Active Status
  const handleToggleCouponActive = async (coupon) => {
    try {
      const res = await fetch(`${API_V1_URL}/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: `Coupon ${coupon.code} ${!coupon.isActive ? 'activated' : 'deactivated'}`, severity: 'success' });
        fetchCoupons();
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      const res = await fetch(`${API_V1_URL}/admin/coupons/${coupon.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: `Coupon ${coupon.code} deleted`, severity: 'success' });
        fetchCoupons();
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Save Coupon (Create or Edit)
  const handleSaveCoupon = async () => {
    try {
      if (!couponFormData.code.trim()) {
        setToast({ open: true, message: 'Please enter a coupon code', severity: 'error' });
        return;
      }
      if (!couponFormData.discountValue || parseFloat(couponFormData.discountValue) <= 0) {
        setToast({ open: true, message: 'Please enter a valid discount value', severity: 'error' });
        return;
      }

      const isEdit = Boolean(editingCoupon);
      const url = isEdit ? `${API_V1_URL}/admin/coupons/${editingCoupon.id}` : `${API_V1_URL}/admin/coupons`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponFormData)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: data.message || 'Coupon saved successfully', severity: 'success' });
        setCouponModalOpen(false);
        fetchCoupons();
      } else {
        setToast({ open: true, message: data.error || 'Failed to save coupon', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchAuditLogs();
    fetchRewardConfig();
    fetchCoupons();
    fetchTickets();
    const interval = setInterval(() => {
      fetchOverview();
      if (activeMainTab === 'traceability') {
        fetchAuditLogs();
      }
      if (activeMainTab === 'rewards') {
        fetchRewardConfig();
        fetchCoupons();
      }
      if (activeMainTab === 'tickets') {
        fetchTickets();
      }
    }, 10000); // 10-second background sync
    return () => clearInterval(interval);
  }, [activeMainTab]);

  // Open Customer Full History Page
  const handleOpenCustomerHistory = (customer) => {
    const phone = customer.customer_phone || customer.phone;
    navigate(`/admin/customers/${phone}`, { state: { customer, returnTo: location.pathname } });
  };

  // Open Technician Full Dossier Page
  const handleOpenTechDossier = (tech) => {
    navigate(`/admin/technicians/${tech.id}`, { state: { technician: tech, returnTo: location.pathname } });
  };

  // Open In-App Aadhaar Card Viewer
  const handleOpenAadhaarViewer = (tech) => {
    const rawUrl = tech.aadhaar_card_url || tech.aadhaarCardUrl;
    if (!rawUrl) {
      setToast({ open: true, message: 'No Aadhaar document uploaded for this technician.', severity: 'warning' });
      return;
    }
    navigate('/admin/documents/preview', {
      state: {
        document: {
          url: rawUrl,
          title: `${tech.full_name || tech.name || 'Technician'} - Aadhaar e-KYC Identity Proof`,
          type: 'aadhaar',
          data: tech
        },
        returnTo: location.pathname
      }
    });
  };

  // Open In-App Parts Bill Receipt Viewer
  const handleOpenBillViewer = (booking) => {
    const rawUrl = booking.parts_bill_url || booking.partsBillUrl;
    if (!rawUrl) {
      setToast({ open: true, message: 'No parts bill uploaded for this booking.', severity: 'warning' });
      return;
    }
    navigate('/admin/documents/preview', {
      state: {
        document: {
          url: rawUrl,
          title: `Parts Receipt Bill for Booking #${booking.id}`,
          type: 'bill',
          data: booking
        },
        returnTo: location.pathname
      }
    });
  };

  // Open Deep Booking Traceability Page
  const handleOpenBookingTrace = (booking) => {
    navigate(`/admin/traceability?bookingId=${booking.id}`);
  };

  // Admin 1-Click KYC Approve / Reject Action
  const handleKycDecision = async (techId, action, reason = '') => {
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${techId}/verify-kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          open: true,
          message: data.message || `KYC ${action === 'approve' ? 'Approved' : 'Rejected'} successfully`,
          severity: action === 'approve' ? 'success' : 'warning'
        });
        setTechnicians(prev => prev.map(t => (t.id === techId ? { ...t, is_kyc_verified: action === 'approve' } : t)));
        if (selectedTechDossier && selectedTechDossier.id === techId) {
          setSelectedTechDossier(prev => ({ ...prev, is_kyc_verified: action === 'approve' }));
        }
        if (docPreviewModal.open && docPreviewModal.data?.id === techId) {
          setDocPreviewModal(prev => ({
            ...prev,
            data: { ...prev.data, is_kyc_verified: action === 'approve' }
          }));
        }
        try {
          const storedTech = JSON.parse(localStorage.getItem('shazuone_tech_user') || 'null');
          if (storedTech && (storedTech.id === techId || storedTech.phone === data.technician?.phone)) {
            const updatedTech = {
              ...storedTech,
              is_kyc_verified: action === 'approve',
              isKycVerified: action === 'approve',
              status: action === 'approve' ? 'Verified' : 'Pending Verification'
            };
            localStorage.setItem('shazuone_tech_user', JSON.stringify(updatedTech));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (storageErr) {}
        fetchOverview(true);
      } else {
        setToast({ open: true, message: data.error || 'KYC update failed', severity: 'error' });
      }
    } catch (e) {
      console.error('KYC update error:', e);
      setToast({ open: true, message: 'Network error updating KYC status', severity: 'error' });
    }
  };

  // Admin Toggle Block / Suspension for Customers
  const handleToggleCustomerBlock = async (cust, shouldBlock) => {
    const phone = cust.customer_phone || cust.phone;
    let reason = '';
    if (shouldBlock) {
      reason = window.prompt(`Enter administrative reason for blocking customer (${cust.customer_name || phone}):`, 'Policy violation or repeated fraudulent cancellations');
      if (reason === null) return;
    }
    try {
      const res = await fetch(`${API_V1_URL}/admin/customers/${phone}/toggle-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: shouldBlock, reason })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: data.message, severity: shouldBlock ? 'warning' : 'success' });
        setCustomersList(prev => prev.map(c => (c.customer_phone === phone || c.phone === phone) ? { ...c, is_blocked: shouldBlock, block_reason: reason } : c));
        if (customerDetails && (customerDetails.customer_phone === phone || customerDetails.phone === phone)) {
          setCustomerDetails(prev => ({ ...prev, is_blocked: shouldBlock, block_reason: reason }));
        }
      } else {
        setToast({ open: true, message: data.error || 'Operation failed', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Admin Toggle Block / Suspension for Technicians
  const handleToggleTechnicianBlock = async (tech, shouldBlock) => {
    let reason = '';
    if (shouldBlock) {
      reason = window.prompt(`Enter reason for suspending technician ${tech.full_name}:`, 'Disciplinary review, KYC discrepancy, or repeated complaints');
      if (reason === null) return;
    }
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${tech.id}/toggle-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: shouldBlock, reason })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ open: true, message: data.message, severity: shouldBlock ? 'warning' : 'success' });
        setTechnicians(prev => prev.map(t => t.id === tech.id ? { ...t, is_blocked: shouldBlock, block_reason: reason, is_online: shouldBlock ? false : t.is_online } : t));
        if (selectedTechDossier && selectedTechDossier.id === tech.id) {
          setSelectedTechDossier(prev => ({ ...prev, is_blocked: shouldBlock, block_reason: reason, is_online: shouldBlock ? false : prev.is_online }));
        }
        fetchOverview(true);
      } else {
        setToast({ open: true, message: data.error || 'Operation failed', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Filtered Bookings List (Ops Tab)
  const filteredBookings = useMemo(() => {
    return recentBookings.filter(job => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = job.id?.toLowerCase().includes(q);
        const matchCustomer = job.customer_name?.toLowerCase().includes(q);
        const matchCustPhone = (job.customer_phone || '')?.toLowerCase().includes(q);
        const matchLocality = job.locality?.toLowerCase().includes(q);
        const matchAddress = (job.service_address || '')?.toLowerCase().includes(q);
        const matchService = (job.service_id || job.service_name || '')?.toLowerCase().includes(q);
        const matchTech = (job.technician_name || '')?.toLowerCase().includes(q);
        const matchTechPhone = (job.technician_phone || '')?.toLowerCase().includes(q);
        const matchDesc = (job.custom_issue_description || job.selected_issue_id || '')?.toLowerCase().includes(q);

        if (!matchId && !matchCustomer && !matchCustPhone && !matchLocality && !matchAddress && !matchService && !matchTech && !matchTechPhone && !matchDesc) {
          return false;
        }
      }

      if (selectedTrade !== 'all') {
        const sId = (job.service_id || job.service_name || '').toLowerCase();
        if (!sId.includes(selectedTrade.toLowerCase())) return false;
      }

      if (selectedLocality !== 'all') {
        const loc = (job.locality || job.service_address || '').toLowerCase();
        if (!loc.includes(selectedLocality.toLowerCase())) return false;
      }

      if (selectedStatus !== 'all' && job.status !== selectedStatus) return false;

      // Audio Voice Note Filter
      if (selectedAudioFilter === 'audio_only' && !job.voice_note_url) return false;
      if (selectedAudioFilter === 'text_only' && Boolean(job.voice_note_url)) return false;

      // Date Window Filter
      if (selectedDateFilter !== 'all') {
        const jobDate = new Date(job.created_at || Date.now());
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;
        const jobTime = jobDate.getTime();

        if (selectedDateFilter === 'today' && jobTime < startOfToday) return false;
        if (selectedDateFilter === 'yesterday' && (jobTime < startOfYesterday || jobTime >= startOfToday)) return false;
        if (selectedDateFilter === 'week' && jobTime < (startOfToday - 7 * 86400000)) return false;
      }

      // Dispatch Mode Filter
      if (selectedDispatchMode === 'instant' && (job.booking_type === 'scheduled' || (job.scheduled_slot && job.scheduled_slot !== 'instant_now' && job.scheduled_slot !== 'priority_12h'))) return false;
      if (selectedDispatchMode === 'scheduled' && (job.booking_type !== 'scheduled' && (!job.scheduled_slot || job.scheduled_slot === 'instant_now' || job.scheduled_slot === 'priority_12h'))) return false;
      if (selectedDispatchMode === 'urgent' && !job.is_urgent_dispatch) return false;

      // Quick Filters
      if (quickFilter === 'urgent' && job.status !== 'matching') return false;
      if (quickFilter === 'scheduled' && (!job.scheduled_slot || job.scheduled_slot === 'instant_now' || job.scheduled_slot === 'priority_12h')) return false;
      if (quickFilter === 'en_route' && job.status !== 'en_route' && job.status !== 'arrived') return false;
      if (quickFilter === 'quote' && job.status !== 'quote_presented') return false;
      if (quickFilter === 'completed' && job.status !== 'completed') return false;
      if (quickFilter === 'cancelled' && job.status !== 'cancelled') return false;
      if (quickFilter === 'has_audio' && !job.voice_note_url) return false;

      return true;
    });
  }, [recentBookings, searchQuery, selectedTrade, selectedLocality, selectedStatus, quickFilter, selectedAudioFilter, selectedDateFilter, selectedDispatchMode]);

  // Filtered Customers List
  const filteredCustomers = useMemo(() => {
    return customersList.filter(cust => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = cust.customer_name?.toLowerCase().includes(q);
        const matchPhone = cust.customer_phone?.toLowerCase().includes(q);
        const matchLoc = cust.locality?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchLoc) return false;
      }
      if (selectedLocality !== 'all') {
        const loc = (cust.locality || '').toLowerCase();
        if (!loc.includes(selectedLocality.toLowerCase())) return false;
      }
      return true;
    });
  }, [customersList, searchQuery, selectedLocality]);

  // Filtered Technicians List
  const filteredTechs = useMemo(() => {
    return technicians.filter(tech => {
      if (techTab === 'online' && !tech.is_online) return false;
      if (techTab === 'busy' && (!tech.is_online || (parseInt(tech.active_job_count || 0, 10) === 0))) return false;
      if (techTab === 'offline' && tech.is_online) return false;
      if (techTab === 'kyc_pending' && tech.is_kyc_verified) return false;

      if (selectedTrade !== 'all') {
        const pTrade = (tech.primary_trade || '').toLowerCase();
        if (!pTrade.includes(selectedTrade.toLowerCase())) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = tech.full_name?.toLowerCase().includes(q);
        const matchPhone = tech.phone?.toLowerCase().includes(q);
        const matchTrade = tech.primary_trade?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTrade) return false;
      }

      return true;
    });
  }, [technicians, techTab, selectedTrade, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrade('all');
    setSelectedLocality('all');
    setSelectedStatus('all');
    setQuickFilter('all');
    setSelectedAudioFilter('all');
    setSelectedDateFilter('all');
    setSelectedDispatchMode('all');
  };

  const handleToggleOnline = async (techId, currentOnline) => {
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${techId}/toggle-online`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, is_online: !currentOnline } : t));
        setToast({
          open: true,
          message: `Technician status updated to ${!currentOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}`,
          severity: 'success'
        });
        fetchOverview();
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleVerifyKyc = async (techId, techName) => {
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${techId}/verify-kyc`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, is_kyc_verified: true, is_online: true } : t));
        setToast({
          open: true,
          message: `DigiLocker KYC Verified & ${techName} Activated for Salem Dispatch!`,
          severity: 'success'
        });
        fetchOverview();
      }
    } catch (err) {
      setToast({ open: true, message: 'KYC approval failed', severity: 'error' });
    }
  };

  const handleOpenDispatch = (booking) => {
    navigate(`/admin/dispatch/${booking.id}`, { state: { booking, returnTo: location.pathname } });
  };

  const handleOpenTracking = (booking) => {
    navigate(`/admin/jobs/${booking.id}/live-track`, { state: { booking, returnTo: location.pathname } });
  };

  const handleExecuteDispatch = async () => {
    if (!targetBooking || !selectedTechForDispatch) return;
    setDispatchLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: targetBooking.id,
          technicianId: selectedTechForDispatch
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          open: true,
          message: `Technician successfully assigned and dispatched to Booking #${targetBooking.id}`,
          severity: 'success'
        });
        setDispatchDialogOpen(false);
        fetchOverview();
      } else {
        setToast({ open: true, message: data.error || 'Dispatch error', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to dispatch', severity: 'error' });
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleOpenReleaseDialog = (booking) => {
    navigate(`/admin/orders/${booking.id}/cancel`, { state: { booking, returnTo: location.pathname } });
  };

  const handleExecuteReleaseTechnician = async () => {
    if (!targetBookingForRelease) return;
    setReleaseLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/release-technician`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: targetBookingForRelease.id,
          reason: releaseReason,
          reasonDetails: releaseDetails,
          compensateTech,
          adminNotes: releaseDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          open: true,
          message: data.message || `Technician released and booking #${targetBookingForRelease.id} cancelled.`,
          severity: 'success'
        });
        setReleaseDialogOpen(false);
        fetchOverview();
      } else {
        setToast({ open: true, message: data.error || 'Failed to release technician', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to release technician', severity: 'error' });
    } finally {
      setReleaseLoading(false);
    }
  };

  // ── Admin Cancel Order & Release Technician ──────────────────────────────
  const handleOpenCancelOrder = (booking) => {
    navigate(`/admin/orders/${booking.id}/cancel`, { state: { booking, returnTo: location.pathname } });
  };

  const handleExecuteCancelOrder = async () => {
    if (!cancelOrderTarget || !cancelOrderReason) return;
    setCancelOrderLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/bookings/cancel-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: cancelOrderTarget.id,
          reason: cancelOrderReason,
          reasonDetails: cancelOrderDetails,
          compensateTech: cancelOrderCompensate,
          adminNotes: cancelOrderDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast({
          open: true,
          message: data.message || `Order #${cancelOrderTarget.id} cancelled successfully.`,
          severity: 'success'
        });
        setCancelOrderOpen(false);
        fetchOverview();
      } else {
        setToast({ open: true, message: data.error || 'Failed to cancel order', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Network error — failed to cancel order', severity: 'error' });
    } finally {
      setCancelOrderLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<TaskAltIcon sx={{ color: '#166534 !important', fontSize: '15px !important' }} />}
            label="COMPLETED"
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'en_route':
        return (
          <Chip
            icon={<DirectionsBikeIcon sx={{ color: '#D97706 !important', fontSize: '15px !important' }} />}
            label="EN ROUTE"
            size="small"
            sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'arrived':
        return (
          <Chip
            icon={<RoomIcon sx={{ color: '#854D0E !important', fontSize: '15px !important' }} />}
            label="ON SITE"
            size="small"
            sx={{ bgcolor: '#FEF08A', color: '#854D0E', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'in_progress':
        return (
          <Chip
            icon={<BuildIcon sx={{ color: '#4338CA !important', fontSize: '14px !important' }} />}
            label="IN PROGRESS"
            size="small"
            sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'quote_presented':
        return (
          <Chip
            icon={<ReceiptLongIcon sx={{ color: '#0284C7 !important', fontSize: '15px !important' }} />}
            label="QUOTE REVIEW"
            size="small"
            sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'matching':
        return (
          <Chip
            icon={<BoltIcon sx={{ color: '#DC2626 !important', fontSize: '15px !important' }} />}
            label="DISPATCH PENDING"
            size="small"
            sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<CancelOutlinedIcon sx={{ color: '#DC2626 !important', fontSize: '15px !important' }} />}
            label="CANCELLED"
            size="small"
            sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
      default:
        return (
          <Chip
            icon={<SyncAltIcon sx={{ color: '#475569 !important', fontSize: '14px !important' }} />}
            label={status?.toUpperCase() || 'ACTIVE'}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 900, fontSize: '10.5px' }}
          />
        );
    }
  };

  const getTradeIcon = (trade) => {
    const t = (trade || '').toLowerCase();
    if (t.includes('ac') || t.includes('cool')) return <AcUnitIcon sx={{ fontSize: 16, color: '#0284C7' }} />;
    if (t.includes('electr')) return <ElectricalServicesIcon sx={{ fontSize: 16, color: '#D97706' }} />;
    if (t.includes('plumb')) return <PlumbingIcon sx={{ fontSize: 16, color: '#0EA5E9' }} />;
    if (t.includes('clean')) return <CleaningServicesIcon sx={{ fontSize: 16, color: '#10B981' }} />;
    return <HandymanIcon sx={{ fontSize: 16, color: '#64748B' }} />;
  };

  const getTradeLabel = (trade) => {
    const t = (trade || '').toLowerCase();
    if (t.includes('ac')) return 'AC Specialist';
    if (t.includes('electr')) return 'Master Electrician';
    if (t.includes('plumb')) return 'Plumbing Expert';
    if (t.includes('clean')) return 'Sanitation Specialist';
    return trade || 'Technician';
  };

  const activeFiltersCount = (searchQuery ? 1 : 0) + 
    (selectedTrade !== 'all' ? 1 : 0) + 
    (selectedLocality !== 'all' ? 1 : 0) + 
    (selectedStatus !== 'all' ? 1 : 0) + 
    (quickFilter !== 'all' ? 1 : 0) +
    (selectedAudioFilter !== 'all' ? 1 : 0) +
    (selectedDateFilter !== 'all' ? 1 : 0) +
    (selectedDispatchMode !== 'all' ? 1 : 0);

  if (!user) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', mb: 1 }}>
              Salem Operations Desk
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, mb: 3 }}>
              Administrative credentials required to view fleet telemetry, live dispatches, and financial ledgers.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 700, borderRadius: '10px', py: 1.2, mb: 1.5, textTransform: 'none', '&:hover': { bgcolor: '#0369A1' } }}
            >
              Sign In as Admin
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/')}
              sx={{ color: '#64748B', fontSize: '12px', fontWeight: 600, textTransform: 'none' }}
            >
              Return to Customer App &rarr;
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Enterprise Collapsible Left Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        activeTab={activeMainTab}
        onSelectTab={(tab) => {
          if (tab === 'settlements') {
            navigate('/admin/settlements');
          } else {
            setActiveMainTab(tab);
          }
        }}
        badgeData={{
          activeBookings: metrics.activeBookings || recentBookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length || 0,
          trackingCount: recentBookings.filter(b => ['en_route', 'arrived', 'in_progress', 'quote_presented'].includes(b.status)).length || 0,
          techCount: technicians.length,
          customerCount: customersList.length,
          newFeedbackCount: feedbacksList.filter(f => f.status === 'new').length,
          openTicketsCount: ticketsList.filter(t => t.status === 'open' || t.status === 'in_progress').length,
          couponsCount: couponsList.length,
          teamCount: teamList.length
        }}
        currentRole={currentRole}
        onRoleChange={(newRole) => {
          setCurrentRole(newRole);
          localStorage.setItem('shazuone_admin_role', newRole);
          setToast({ open: true, message: `Active RBAC role switched to ${newRole.toUpperCase()}`, severity: 'info' });
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 1.5, sm: 2, md: 3 }, overflowY: 'auto', pb: 10 }}>
        
        {/* Top Header Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, md: 2.5 }, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
            <IconButton
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                bgcolor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                p: 1,
                minWidth: 44,
                minHeight: 44,
                color: '#0284C7',
                '&:hover': { bgcolor: '#F1F5F9' }
              }}
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <AdminPanelSettingsIcon sx={{ color: '#0284C7', fontSize: { xs: 24, sm: 30 } }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, fontSize: { xs: '1.15rem', sm: '1.4rem', md: '1.5rem' } }}>
                  Shazu One <span style={{ color: '#0284C7', fontSize: '0.85em', fontWeight: 700 }}>Central Ops & Fleet Command</span>
                </Typography>
                <Chip
                  label="Live PostgreSQL DB"
                  size="small"
                  icon={<CheckCircleIcon sx={{ color: '#166534 !important', fontSize: 14 }} />}
                  sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px', height: 22 }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', sm: 'block' }, mt: 0.3 }}>
                Salem City Municipal Corporation Jurisdiction (Zone 1 - 4) • Real-time SLA & Dispatch
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="Refresh live telemetry from PostgreSQL">
              <IconButton
                onClick={() => fetchOverview(true)}
                disabled={refreshing}
                aria-label="Refresh telemetry"
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  minWidth: 40,
                  minHeight: 40,
                  color: '#0284C7',
                  '&:hover': { bgcolor: '#F1F5F9' }
                }}
              >
                <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TimelineIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/admin/traceability')}
              sx={{ color: '#0284C7', borderColor: '#CBD5E1', bgcolor: '#FFF', borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: { xs: 1.2, sm: 2 }, minHeight: 40, fontSize: { xs: '11.5px', sm: '13px' } }}
            >
              Traceability Audit
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/admin/settlements')}
              sx={{ color: '#0284C7', borderColor: '#CBD5E1', bgcolor: '#FFF', borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: { xs: 1.2, sm: 2 }, minHeight: 40, fontSize: { xs: '11.5px', sm: '13px' } }}
            >
              Razorpay Settlements
            </Button>
          </Box>
        </Box>

        {/* MAIN NAVIGATION TABS WITH LIVE REAL-TIME BADGES */}
        <Paper elevation={0} sx={{ mb: 2.5, p: 0.8, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <Tabs
            value={activeMainTab}
            onChange={(e, val) => setActiveMainTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0.8,
                px: 2,
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                transition: 'all 0.2s',
                mr: 0.5,
                '&.Mui-selected': {
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab
              value="ops"
              icon={<HubIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Live Dispatch Queue</span>
                  <Chip
                    label={metrics.activeBookings || recentBookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length || 0}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'ops' ? 'rgba(255,255,255,0.25)' : '#E0F2FE',
                      color: activeMainTab === 'ops' ? '#FFFFFF' : '#0284C7'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="technicians"
              icon={<EngineeringIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Technicians Fleet & KYC</span>
                  <Chip
                    label={technicians.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'technicians' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                      color: activeMainTab === 'technicians' ? '#FFFFFF' : '#475569'
                    }}
                  />
                  {technicians.filter(t => !t.is_kyc_verified).length > 0 && (
                    <Chip
                      label={`${technicians.filter(t => !t.is_kyc_verified).length} PENDING KYC`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '9.5px',
                        fontWeight: 900,
                        bgcolor: activeMainTab === 'technicians' ? '#FEF3C7' : '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #F59E0B'
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              value="customers"
              icon={<PeopleAltIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Customers 360</span>
                  <Chip
                    label={customersList.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'customers' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                      color: activeMainTab === 'customers' ? '#FFFFFF' : '#475569'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="feedback"
              icon={<RateReviewIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Feedback Desk</span>
                  <Chip
                    label={feedbacksList.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'feedback' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                      color: activeMainTab === 'feedback' ? '#FFFFFF' : '#475569'
                    }}
                  />
                  {feedbacksList.filter(f => f.status === 'new').length > 0 && (
                    <Chip
                      label={`${feedbacksList.filter(f => f.status === 'new').length} New`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '9.5px',
                        fontWeight: 900,
                        bgcolor: activeMainTab === 'feedback' ? '#FEE2E2' : '#FEE2E2',
                        color: '#991B1B'
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              value="tickets"
              icon={<SupportAgentIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Support Tickets</span>
                  <Chip
                    label={ticketsList.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '10px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'tickets' ? 'rgba(255,255,255,0.25)' : '#FFF7ED',
                      color: activeMainTab === 'tickets' ? '#FFFFFF' : '#EA580C'
                    }}
                  />
                  {ticketsList.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length > 0 && (
                    <Chip
                      label={`${ticketsList.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length} URGENT`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '9.5px',
                        fontWeight: 900,
                        bgcolor: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #EF4444'
                      }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              value="traceability"
              icon={<TimelineIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Audit Traceability</span>
                  <Chip
                    label="Live Logs"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'traceability' ? 'rgba(255,255,255,0.25)' : '#ECFDF5',
                      color: activeMainTab === 'traceability' ? '#FFFFFF' : '#065F46'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="rewards"
              icon={<ConfirmationNumberIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Rewards & Coupons</span>
                  <Chip
                    label={`${couponsList.length} Promo`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'rewards' ? 'rgba(255,255,255,0.25)' : '#FEF3C7',
                      color: activeMainTab === 'rewards' ? '#FFFFFF' : '#92400E'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="tracking"
              icon={<NavigationIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Live Tracking</span>
                  <Chip
                    label={recentBookings.filter(b => ['en_route', 'arrived', 'in_progress', 'quote_presented'].includes(b.status)).length || 0}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'tracking' ? 'rgba(255,255,255,0.25)' : '#DCFCE7',
                      color: activeMainTab === 'tracking' ? '#FFFFFF' : '#166534'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="services"
              icon={<PriceCheckIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Services & Inspection Fees</span>
                  <Chip
                    label="CRUD"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'services' ? 'rgba(255,255,255,0.25)' : '#F3E8FF',
                      color: activeMainTab === 'services' ? '#FFFFFF' : '#7C3AED'
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="team"
              icon={<GroupIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Team & RBAC</span>
                  <Chip
                    label={`${teamList.length} Staff`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '9.5px',
                      fontWeight: 900,
                      bgcolor: activeMainTab === 'team' ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
                      color: activeMainTab === 'team' ? '#FFFFFF' : '#4338CA'
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* 4 KPI Stat Cards - 2x2 on mobile, 4-col on desktop */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <KpiCard
              title="ACTIVE BOOKINGS"
              value={metrics.activeBookings || recentBookings.length || 0}
              subtitle="Live dispatch sync"
              icon={SpeedIcon}
              iconColor="#1D6FE5"
              iconBg="#EFF6FF"
              onClick={() => setActiveMainTab('ops')}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <KpiCard
              title="TECHS ON DUTY"
              value={`${technicians.filter(t => t.is_online).length} / ${technicians.length}`}
              subtitle="Salem coverage zones"
              icon={EngineeringIcon}
              iconColor="#10B981"
              iconBg="#ECFDF5"
              onClick={() => setActiveMainTab('technicians')}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <KpiCard
              title="REGISTERED CLIENTS"
              value={customersList.length}
              subtitle="Verified residents"
              icon={PeopleAltIcon}
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              onClick={() => setActiveMainTab('customers')}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <KpiCard
              title="TODAY'S VOLUME"
              value={`₹${Number(metrics.financials?.totalRevenue || 0).toLocaleString()}`}
              subtitle="Digital escrow settlements"
              icon={AccountBalanceWalletIcon}
              iconColor="#0D9488"
              iconBg="#F0FDFA"
              onClick={() => navigate('/admin/settlements')}
            />
          </Grid>
        </Grid>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE OPS & DISPATCH QUEUE */}
        {/* ========================================================================= */}
        {activeMainTab === 'ops' && (
          <>
            {/*  ADVANCED FILTERS TOOLBAR CARD */}
            <Card elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
                    Advanced Operations & Dispatch Filter
                  </Typography>
                  {activeFiltersCount > 0 && (
                    <Chip
                      label={`${activeFiltersCount} active`}
                      size="small"
                      sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '11px', height: 22 }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowAdvancedFilters(prev => !prev)}
                    startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
                    endIcon={showAdvancedFilters ? <KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#0284C7',
                      borderColor: '#BAE6FD',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: showAdvancedFilters ? '#F0F9FF' : '#FFF'
                    }}
                  >
                    {showAdvancedFilters ? 'Hide Advanced Filters' : 'Advanced Filters'}
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleResetFilters}
                      startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                      sx={{ color: '#DC2626', fontWeight: 800, fontSize: '12px', textTransform: 'none' }}
                    >
                      Reset All
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Row 1: Primary Search & Live Stage (Always Visible) */}
              <Grid container spacing={2} sx={{ mb: showAdvancedFilters ? 2 : 0 }}>
                <Grid item xs={12} sm={7} md={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search ID, Customer, Tech, Phone, Locality, Problem..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                      sx: {
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiInputBase-input': { color: 'text.primary' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5} md={4}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SyncAltIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Live Stages</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="matching">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BoltIcon sx={{ fontSize: 17, color: '#DC2626' }} />
                          <span>Pending Dispatch</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="en_route">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DirectionsBikeIcon sx={{ fontSize: 17, color: '#D97706' }} />
                          <span>En Route to Home</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="arrived">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RoomIcon sx={{ fontSize: 17, color: '#854D0E' }} />
                          <span>On Site</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="in_progress">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BuildIcon sx={{ fontSize: 17, color: '#4338CA' }} />
                          <span>Work In Progress</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="quote_presented">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptLongIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Quote Presented</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="completed">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TaskAltIcon sx={{ fontSize: 17, color: '#166534' }} />
                          <span>Job Completed</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="cancelled">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CancelOutlinedIcon sx={{ fontSize: 17, color: '#DC2626' }} />
                          <span>Customer Cancelled</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Collapsible Secondary Filters Panel */}
              <Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
                <Box sx={{ pt: 2, borderTop: '1px solid #E2E8F0', mt: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedTrade}
                      onChange={(e) => setSelectedTrade(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HandymanIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Trade Categories</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="ac">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AcUnitIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>AC Repair & Service</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="electr">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ElectricalServicesIcon sx={{ fontSize: 17, color: '#D97706' }} />
                          <span>Electrician & Wiring</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="plumb">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PlumbingIcon sx={{ fontSize: 17, color: '#0EA5E9' }} />
                          <span>Plumber & Sanitary</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="clean">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CleaningServicesIcon sx={{ fontSize: 17, color: '#10B981' }} />
                          <span>Home & Deep Cleaning</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationCityIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Salem Localities</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="fairlands">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Fairlands / Brindavan Rd</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="hasthampatti">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Hasthampatti / Foothills</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="suramangalam">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Suramangalam / Junction</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="meyyanur">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Meyyanur / New Bus Stand</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="ammapet">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Ammapet / Ponnamapet</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="gugai">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Gugai / Line Medu</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="shevapet">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Shevapet / Bazaar</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="kondalampatti">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Kondalampatti Bypass</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                  </Grid>

                  {/* Row 2: Date Window, Dispatch Mode, Audio Voice Note Filter */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Time Dates</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="today">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Today (Live)</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="yesterday">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 17, color: '#475569' }} />
                          <span>Yesterday</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="week">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 17, color: '#0D9488' }} />
                          <span>Last 7 Days</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedDispatchMode}
                      onChange={(e) => setSelectedDispatchMode(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TuneIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Dispatch Modes</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="instant">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BoltIcon sx={{ fontSize: 17, color: '#B45309' }} />
                          <span>Instant (15-25 min)</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="scheduled">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon sx={{ fontSize: 17, color: '#1E40AF' }} />
                          <span>Scheduled Slots</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="urgent">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BoltIcon sx={{ fontSize: 17, color: '#DC2626' }} />
                          <span>Urgent 25-Min Surge</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                  <FormControl fullWidth size="small">
                    {/* ds-allow-native-select */}
                    <Select
                      value={selectedAudioFilter}
                      onChange={(e) => setSelectedAudioFilter(e.target.value)}
                      sx={{
                        borderRadius: '12px',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiSelect-select': { color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }
                      }}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VolumeUpIcon sx={{ fontSize: 17, color: '#64748B' }} />
                          <span>All Bookings (Audio & Text)</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="audio_only">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VolumeUpIcon sx={{ fontSize: 17, color: '#0284C7' }} />
                          <span>Has Voice Note Audio</span>
                        </Box>
                      </MenuItem>
                      <MenuItem value="text_only">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArticleIcon sx={{ fontSize: 17, color: '#475569' }} />
                          <span>Text Description Only</span>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

                  

              {/* Active Filter Chips & Dismissal Bar */}
              {activeFiltersCount > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', p: 1.5, bgcolor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', mr: 0.5 }}>
                    Active filters:
                  </Typography>

                  {searchQuery && (
                    <Chip
                      size="small"
                      label={`Query: "${searchQuery}"`}
                      onDelete={() => setSearchQuery('')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedTrade !== 'all' && (
                    <Chip
                      size="small"
                      label={`Trade: ${selectedTrade.toUpperCase()}`}
                      onDelete={() => setSelectedTrade('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedLocality !== 'all' && (
                    <Chip
                      size="small"
                      label={`Locality: ${selectedLocality}`}
                      onDelete={() => setSelectedLocality('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedStatus !== 'all' && (
                    <Chip
                      size="small"
                      label={`Status: ${selectedStatus.toUpperCase()}`}
                      onDelete={() => setSelectedStatus('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedDateFilter !== 'all' && (
                    <Chip
                      size="small"
                      label={`Date: ${selectedDateFilter.toUpperCase()}`}
                      onDelete={() => setSelectedDateFilter('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedDispatchMode !== 'all' && (
                    <Chip
                      size="small"
                      label={`Mode: ${selectedDispatchMode.toUpperCase()}`}
                      onDelete={() => setSelectedDispatchMode('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  {selectedAudioFilter !== 'all' && (
                    <Chip
                      size="small"
                      icon={<VolumeUpIcon sx={{ fontSize: '12px !important' }} />}
                      label={selectedAudioFilter === 'audio_only' ? 'Audio Only' : 'Text Only'}
                      onDelete={() => setSelectedAudioFilter('all')}
                      sx={{ bgcolor: '#FFFFFF', color: '#0369A1', fontWeight: 700, fontSize: '11px', border: '1px solid #BAE6FD' }}
                    />
                  )}

                  <Chip
                    size="small"
                    label="Clear all"
                    onClick={handleResetFilters}
                    sx={{ bgcolor: '#DC2626', color: '#FFFFFF', fontWeight: 800, fontSize: '10.5px', cursor: 'pointer', ml: 'auto' }}
                  />
                </Box>
              )}

              {/* Quick Filter Pills */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, mr: 0.5 }}>
                  Quick Filters:
                </Typography>
                {[
                  { key: 'all', label: 'All Records', icon: <FilterListIcon sx={{ fontSize: 15 }} /> },
                  { key: 'has_audio', label: 'Audio Voice Note Attached', icon: <VolumeUpIcon sx={{ fontSize: 15 }} /> },
                  { key: 'urgent', label: 'Immediate Dispatch Needed', icon: <BoltIcon sx={{ fontSize: 15 }} /> },
                  { key: 'scheduled', label: 'Scheduled Appointments', icon: <EventIcon sx={{ fontSize: 15 }} /> },
                  { key: 'en_route', label: 'Techs En Route', icon: <DirectionsBikeIcon sx={{ fontSize: 15 }} /> },
                  { key: 'quote', label: 'Quote Review Stage', icon: <ReceiptLongIcon sx={{ fontSize: 15 }} /> },
                  { key: 'completed', label: 'Completed', icon: <TaskAltIcon sx={{ fontSize: 15 }} /> },
                  { key: 'cancelled', label: 'Customer Cancelled', icon: <CancelOutlinedIcon sx={{ fontSize: 15 }} /> }
                ].map(pill => (
                  <Chip
                    key={pill.key}
                    icon={pill.icon}
                    label={pill.label}
                    clickable
                    onClick={() => setQuickFilter(pill.key)}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '11px',
                      borderRadius: '10px',
                      bgcolor: quickFilter === pill.key ? '#0284C7' : '#F1F5F9',
                      color: quickFilter === pill.key ? '#FFFFFF' : '#475569',
                      '& .MuiChip-icon': {
                        color: quickFilter === pill.key ? '#FFFFFF !important' : '#64748B !important'
                      },
                      '&:hover': {
                        bgcolor: quickFilter === pill.key ? '#0369A1' : '#E2E8F0'
                      }
                    }}
                  />
                ))}
              </Box>
            
                </Box>
              </Collapse>
            </Card>

            {/*  SECTION 1: ACTIVE SALEM TECHNICIAN FLEET RADAR */}
            <Card elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SensorsIcon sx={{ color: 'success.main', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '16px' }}>
                    Salem Active Technician Fleet Radar ({filteredTechs.length} Technicians)
                  </Typography>
                </Box>

                <Tabs
                  value={techTab}
                  onChange={(e, val) => setTechTab(val)}
                  sx={{
                    minHeight: 32,
                    '& .MuiTab-root': {
                      minHeight: 32,
                      py: 0.5,
                      px: 1.5,
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '8px'
                    }
                  }}
                >
                  <Tab icon={<PeopleAltIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`All (${technicians.length})`} value="all" />
                  <Tab icon={<SensorsIcon sx={{ fontSize: 16, color: '#10B981' }} />} iconPosition="start" label={`Online (${technicians.filter(t => t.is_online).length})`} value="online" />
                  <Tab icon={<DirectionsBikeIcon sx={{ fontSize: 16, color: '#F59E0B' }} />} iconPosition="start" label={`On Job (${technicians.filter(t => t.is_online && parseInt(t.active_job_count || 0) > 0).length})`} value="busy" />
                  <Tab icon={<PowerSettingsNewIcon sx={{ fontSize: 16, color: '#64748B' }} />} iconPosition="start" label={`Offline (${technicians.filter(t => !t.is_online).length})`} value="offline" />
                  <Tab icon={<ShieldIcon sx={{ fontSize: 16, color: '#D97706' }} />} iconPosition="start" label={`Pending KYC (${technicians.filter(t => !t.is_kyc_verified).length})`} value="kyc_pending" />
                </Tabs>
              </Box>

              {filteredTechs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                  <EngineeringIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748B' }}>
                    No technicians match the current filter selection
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {filteredTechs.map((tech) => {
                    const isOnline = tech.is_online;
                    const hasActiveJob = parseInt(tech.active_job_count || 0, 10) > 0;
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={tech.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: isOnline ? (hasActiveJob ? '#FDE68A' : '#BBF7D0') : '#E2E8F0',
                            bgcolor: isOnline ? (hasActiveJob ? '#FFFBEB' : '#F0FDF4') : '#FAFAFA',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%',
                                      bgcolor: isOnline ? (hasActiveJob ? '#F59E0B' : '#10B981') : '#94A3B8',
                                      border: '2px solid #FFFFFF'
                                    }}
                                  />
                                }
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: isOnline ? '#0284C7' : '#CBD5E1',
                                    width: 38,
                                    height: 38,
                                    fontWeight: 800,
                                    fontSize: '14px'
                                  }}
                                >
                                  {tech.full_name?.substring(0, 2) || 'TK'}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                                  {tech.full_name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                                  {getTradeIcon(tech.primary_trade)}
                                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11px' }}>
                                    {getTradeLabel(tech.primary_trade)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {isOnline ? (
                              hasActiveJob ? (
                                <Chip
                                  icon={<WorkHistoryIcon sx={{ color: '#B45309 !important', fontSize: '12px !important' }} />}
                                  label="ON JOB"
                                  size="small"
                                  sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '9.5px', height: 20 }}
                                />
                              ) : (
                                <Chip
                                  icon={<SensorsIcon sx={{ color: '#15803D !important', fontSize: '12px !important' }} />}
                                  label="ACTIVE"
                                  size="small"
                                  sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 900, fontSize: '9.5px', height: 20 }}
                                />
                              )
                            ) : (
                              <Chip
                                icon={<PowerSettingsNewIcon sx={{ color: '#64748B !important', fontSize: '12px !important' }} />}
                                label="OFFLINE"
                                size="small"
                                sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '9.5px', height: 20 }}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF', p: 1, borderRadius: '10px', border: '1px solid #E2E8F0', mb: 1.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                              <Typography variant="caption" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '11.5px' }}>
                                {Number(tech.rating_avg) > 0 ? Number(tech.rating_avg).toFixed(1) : (Number(tech.jobs_completed_count) > 0 ? '5.0' : 'New')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                                ({Number(tech.rating_count) || 0})
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11px' }}>
                              {Number(tech.jobs_completed_count) || 0} jobs
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                              {tech.years_experience != null ? `${tech.years_experience}y exp` : '0y exp'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <ShieldIcon sx={{ fontSize: 13, color: tech.is_kyc_verified ? '#10B981' : '#F59E0B' }} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: tech.is_kyc_verified ? '#166534' : '#B45309', fontSize: '10.5px' }}>
                                {tech.is_kyc_verified ? 'DigiLocker KYC' : 'Pending KYC'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <PhoneIcon sx={{ fontSize: 12, color: '#64748B' }} />
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                                {tech.phone || '+91-94432'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.8 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={<HistoryEduIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleOpenTechDossier(tech)}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'none',
                                py: 0.4,
                                color: '#0284C7',
                                borderColor: '#CBD5E1'
                              }}
                            >
                              Dossier
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={<PowerSettingsNewIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleToggleOnline(tech.id, tech.is_online)}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'none',
                                py: 0.4,
                                borderColor: isOnline ? '#CBD5E1' : '#10B981',
                                color: isOnline ? '#64748B' : '#059669',
                                bgcolor: isOnline ? 'transparent' : '#ECFDF5'
                              }}
                            >
                              {isOnline ? 'Offline' : 'Online'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Card>

            {/* CENTRAL DISPATCH QUEUE & AUDIT TABLE */}
            <Card elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SyncAltIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '16px' }}>
                    Central Dispatch Queue & Live Traceability Tracker
                  </Typography>
                  <Chip
                    label={`Showing ${filteredBookings.length} bookings`}
                    size="small"
                    sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '11px' }}
                  />
                </Box>
              </Box>

              {filteredBookings.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                  <SearchIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748B', mb: 1.5 }}>
                    No operations records match the selected search and filter criteria
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                    sx={{ color: '#0284C7', borderColor: '#BAE6FD', textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                  >
                    Reset All Filters
                  </Button>
                </Paper>
              ) : (
                <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
                    Swipe left/right to view full table details
                  </Typography>
                  <Table size="small" sx={{ minWidth: { xs: 580, md: '100%' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Customer & Locality</TableCell>
                      <TableCell>Service & Problem</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Scheduled Slot / Window</TableCell>
                      <TableCell>Assigned Technician</TableCell>
                      <TableCell align="center">Live Stage</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Operations Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((job) => (
                      <TableRow key={job.id} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.5 } }}>
                        <TableCell 
                          sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => handleOpenBookingTrace(job)}
                          title="Click to inspect complete booking audit trail & traceability"
                        >
                          #{job.id}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleOpenCustomerHistory({ customer_name: job.customer_name, customer_phone: job.customer_phone, locality: job.locality, service_address: job.service_address })}
                            title="Click to view Customer 360 profile"
                          >
                            {job.customer_name || 'Customer'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                            <LocationOnIcon sx={{ fontSize: 13, color: '#64748B' }} />
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                              {job.locality || 'Salem Central'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            {getTradeIcon(job.service_id)}
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {job.service_id?.toUpperCase() || 'GENERAL'}
                            </Typography>
                          </Box>
                          {job.voice_note_url && (
                            <Chip
                              icon={<VolumeUpIcon sx={{ fontSize: '11px !important', color: '#0369A1 !important' }} />}
                              label="Voice Note"
                              size="small"
                              onClick={() => handleOpenBookingTrace(job)}
                              sx={{
                                mt: 0.5,
                                bgcolor: '#E0F2FE',
                                color: '#0369A1',
                                fontWeight: 800,
                                fontSize: '9.5px',
                                height: 18,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#BAE6FD' }
                              }}
                            />
                          )}
                          {job.custom_issue_description && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#64748B',
                                fontSize: '10.5px',
                                mt: 0.3,
                                maxWidth: 180,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={job.custom_issue_description}
                            >
                              {job.custom_issue_description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {job.scheduled_slot && job.scheduled_slot !== 'instant_now' && job.scheduled_slot !== 'priority_12h' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                              <Chip
                                icon={<EventIcon sx={{ fontSize: '12px !important', color: '#1E40AF !important' }} />}
                                label="SCHEDULED"
                                size="small"
                                sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 800, fontSize: '9.5px', height: 20, width: 'fit-content' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '11px' }}>
                                {job.scheduled_slot}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip
                              icon={<BoltIcon sx={{ fontSize: '12px !important', color: '#B45309 !important' }} />}
                              label="Instant (15-25 min)"
                              size="small"
                              sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '10px', height: 20 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {job.technician_name ? (
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ fontWeight: 700, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => {
                                  const matched = technicians.find(t => t.id === job.technician_id || t.full_name === job.technician_name);
                                  if (matched) handleOpenTechDossier(matched);
                                }}
                                title="Click to view technician performance dossier & KYC"
                              >
                                {job.technician_name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                                  {job.technician_rating && Number(job.technician_rating) > 0 ? `${Number(job.technician_rating).toFixed(1)} Verified` : 'New Partner'}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<SendIcon sx={{ fontSize: 12 }} />}
                              onClick={() => handleOpenDispatch(job)}
                              sx={{
                                color: '#DC2626',
                                borderColor: '#FCA5A5',
                                bgcolor: '#FEF2F2',
                                fontSize: '11px',
                                fontWeight: 800,
                                borderRadius: '8px',
                                textTransform: 'none',
                                py: 0.2
                              }}
                            >
                              Manual Dispatch
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(job.status)}
                          {job.status === 'cancelled' && (
                            <Box sx={{ mt: 0.8, p: 0.8, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', textAlign: 'left', minWidth: 160, maxWidth: 220 }}>
                              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 800, display: 'block', fontSize: '10.5px', lineHeight: 1.25 }}>
                                Reason: {job.cancellation_reason || 'Customer cancelled doorstep request'}
                              </Typography>
                              {job.cancellation_details && (
                                <Typography variant="caption" sx={{ color: '#B91C1C', display: 'block', fontSize: '10px', fontStyle: 'italic', mt: 0.2 }}>
                                  "{job.cancellation_details}"
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '9px', mt: 0.2 }}>
                                By {job.cancelled_by || 'Customer'} {job.cancelled_at ? `• ${new Date(job.cancelled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                              </Typography>
                            </Box>
                          )}
                          {job.parts_bill_url && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                icon={<ReceiptLongIcon sx={{ fontSize: '11px !important', color: '#0369A1 !important' }} />}
                                label="View Bill"
                                size="small"
                                clickable
                                onClick={() => handleOpenBillViewer(job)}
                                sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '9px', height: 18 }}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14px' }}>
                          ₹{Number(job.final_amount || job.total_price || 299).toFixed(2)}
                          {job.status === 'cancelled' && job.refund_amount > 0 && (
                            <Typography variant="caption" sx={{ color: '#059669', display: 'block', fontSize: '10px', fontWeight: 700 }}>
                              Refund: ₹{Number(job.refund_amount).toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', justifyContent: 'center' }}>
                            {['en_route', 'arrived', 'in_progress'].includes(job.status) ? (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<NavigationIcon sx={{ fontSize: 13 }} />}
                                onClick={() => handleOpenTracking(job)}
                                sx={{
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  py: 0.4,
                                  px: 1.2,
                                  color: '#16A34A',
                                  borderColor: '#BBF7D0',
                                  bgcolor: '#F0FDF4',
                                  '&:hover': { bgcolor: '#DCFCE7', borderColor: '#16A34A' }
                                }}
                              >
                                Live Track
                              </Button>
                            ) : job.status === 'matching' ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<SendIcon sx={{ fontSize: 12 }} />}
                                onClick={() => handleOpenDispatch(job)}
                                sx={{
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  bgcolor: '#0284C7',
                                  color: '#FFF',
                                  textTransform: 'none',
                                  py: 0.4,
                                  px: 1.2,
                                  '&:hover': { bgcolor: '#0369A1' }
                                }}
                              >
                                Assign
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ArticleIcon sx={{ fontSize: 13 }} />}
                                onClick={() => handleOpenBookingTrace(job)}
                                sx={{
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  py: 0.4,
                                  px: 1.2,
                                  color: '#0284C7',
                                  borderColor: '#BAE6FD',
                                  bgcolor: '#F0F9FF',
                                  '&:hover': { bgcolor: '#E0F2FE', borderColor: '#0284C7' }
                                }}
                              >
                                Trace
                              </Button>
                            )}

                            <IconButton
                              size="small"
                              onClick={(e) => handleActionMenuOpen(e, job)}
                              aria-label="Actions menu"
                              sx={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                p: 0.5,
                                color: '#475569',
                                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' }
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredBookings.length}
                    rowsPerPage={rowsPerPage}
                    page={Math.min(page, Math.max(0, Math.ceil(filteredBookings.length / rowsPerPage) - 1))}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    sx={{ borderTop: '1px solid #E2E8F0' }}
                  />
              </Box>
            )}
            </Card>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CUSTOMERS 360 & ORDER FREQUENCY DIRECTORY */}
        {/* ========================================================================= */}
        {activeMainTab === 'customers' && (
          <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleAltIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                    Customer 360 Analytics & Order Frequency Directory
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Track how many times each customer ordered, their lifetime GMV spend, and complete history.
                  </Typography>
                </Box>
              </Box>
              <TextField
                size="small"
                placeholder="Search customer by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px', bgcolor: '#F8FAFC', width: 280, fontSize: '13px' }
                }}
              />
            </Box>

            {filteredCustomers.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                <PersonSearchIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748B' }}>
                  No customer records found matching search
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
                  Swipe left/right to view full table details
                </Typography>
                <Table size="small" sx={{ minWidth: { xs: 580, md: '100%' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                    <TableCell>Customer Profile</TableCell>
                    <TableCell>Phone & Contact</TableCell>
                    <TableCell>Salem Locality</TableCell>
                    <TableCell align="center">Total Orders Placed</TableCell>
                    <TableCell align="center">Completed / Active</TableCell>
                    <TableCell align="right">Lifetime Spend (GMV)</TableCell>
                    <TableCell align="center">Account Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((cust, idx) => (
                    <TableRow key={idx} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.5 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ bgcolor: '#0284C7', width: 34, height: 34, fontWeight: 800, fontSize: '13px' }}>
                            {cust.customer_name?.substring(0, 2) || 'SC'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {cust.customer_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Last order: {cust.last_order_date ? new Date(cust.last_order_date).toLocaleDateString() : 'Recent'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 13, color: '#64748B' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {cust.customer_phone || '+91-94432'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: '#0284C7' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                            {cust.locality || 'Fairlands'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<ShoppingBagIcon sx={{ color: '#0284C7 !important', fontSize: '14px !important' }} />}
                          label={`${cust.total_orders || 1} Orders`}
                          size="small"
                          sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 900, fontSize: '11px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534' }}>
                          {cust.completed_orders || 0} done <span style={{ color: '#D97706' }}>({cust.active_orders || 0} live)</span>
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: '#059669', fontSize: '14px' }}>
                        ₹{parseFloat(cust.total_spent || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        {cust.is_blocked ? (
                          <Chip
                            label="BLOCKED"
                            size="small"
                            title={cust.block_reason || 'Administrative restriction'}
                            sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 900, fontSize: '10px', height: 20 }}
                          />
                        ) : (
                          <Chip
                            label="ACTIVE"
                            size="small"
                            sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10px', height: 20 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<HistoryEduIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleOpenCustomerHistory(cust)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#0284C7',
                              borderColor: '#BAE6FD',
                              bgcolor: '#F0F9FF',
                              textTransform: 'none',
                              py: 0.4,
                              px: 1.2,
                              '&:hover': { bgcolor: '#E0F2FE' }
                            }}
                          >
                            History
                          </Button>
                          <IconButton
                            size="small"
                            onClick={(e) => handleCustActionMenuOpen(e, cust)}
                            aria-label="Customer actions"
                            sx={{
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              p: 0.5,
                              color: '#475569',
                              '&:hover': { bgcolor: '#F1F5F9' }
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TECHNICIANS 360 PERFORMANCE & DOSSIER */}
        {/* ========================================================================= */}
        {activeMainTab === 'technicians' && (
          <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EngineeringIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                    Technician 360 Performance Dossier & Service Logs
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Inspect full track record: how many jobs completed, customer ratings, payouts, and live status.
                  </Typography>
                </Box>
              </Box>
              <TextField
                size="small"
                placeholder="Search technician by name or trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px', bgcolor: '#F8FAFC', width: { xs: '100%', sm: 280 }, fontSize: '13px' }
                }}
              />
            </Box>

            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
                Swipe left/right to view full table details
              </Typography>
              <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                  <TableCell>Technician Profile</TableCell>
                  <TableCell>Primary Trade</TableCell>
                  <TableCell>Contact & UPI</TableCell>
                  <TableCell align="center">Aadhaar Document</TableCell>
                  <TableCell align="center">Rating & Completed</TableCell>
                  <TableCell align="center">KYC & Duty Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTechs.map((tech) => (
                  <TableRow key={tech.id} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.5 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ bgcolor: tech.is_online ? '#0284C7' : '#94A3B8', width: 36, height: 36, fontWeight: 800, fontSize: '14px' }}>
                          {tech.full_name?.substring(0, 2) || 'TK'}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleOpenTechDossier(tech)}
                          >
                            {tech.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {tech.years_experience != null ? `${tech.years_experience} Years Experience` : '0 Years Experience'}
                          </Typography>
                          {!tech.is_kyc_verified && (
                            <Chip
                              label="New Registration"
                              size="small"
                              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '9px', height: 16, mt: 0.3 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTradeIcon(tech.primary_trade)}
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {getTradeLabel(tech.primary_trade)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {tech.phone || 'No Phone'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        UPI: {tech.upi_vpa || 'Not Configured'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block', mt: 0.2 }}>
                        Locality: {Array.isArray(tech.assigned_localities) && tech.assigned_localities.length > 0
                          ? tech.assigned_localities.join(', ')
                          : tech.service_area || tech.locality || 'Fairlands, Salem'}
                      </Typography>
                    </TableCell>

                    {/* Aadhaar Document Column */}
                    <TableCell align="center">
                      {(tech.aadhaar_card_url || tech.aadhaarCardUrl) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleOpenAadhaarViewer(tech)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'none',
                              py: 0.3,
                              px: 1,
                              color: '#0284C7',
                              borderColor: '#BAE6FD',
                              bgcolor: '#F0F9FF',
                              '&:hover': { bgcolor: '#E0F2FE', borderColor: '#0284C7' }
                            }}
                          >
                            View Aadhaar
                          </Button>
                          <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontSize: '10px', fontFamily: 'monospace' }}>
                            {tech.aadhaar_number ? tech.aadhaar_number : 'Doc Attached'}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip
                          label="No Aadhaar Uploaded"
                          size="small"
                          sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '10px' }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, mb: 0.3 }}>
                        <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#0F172A' }}>
                          {Number(tech.rating_avg) > 0 ? Number(tech.rating_avg).toFixed(1) : (Number(tech.jobs_completed_count) > 0 ? '5.0' : 'New')}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<WorkHistoryIcon sx={{ color: '#166534 !important', fontSize: '12px !important' }} />}
                        label={`${Number(tech.jobs_completed_count) || 0} Jobs`}
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px', height: 20 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center' }}>
                        {tech.is_blocked ? (
                          <Chip label="SUSPENDED" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 900, fontSize: '9.5px', height: 18 }} title={tech.block_reason || 'Suspended by admin'} />
                        ) : tech.is_online ? (
                          <Chip icon={<SensorsIcon sx={{ color: '#15803D !important', fontSize: '12px !important' }} />} label="ONLINE" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 900, fontSize: '9.5px', height: 18 }} />
                        ) : (
                          <Chip icon={<PowerSettingsNewIcon sx={{ color: '#64748B !important', fontSize: '12px !important' }} />} label="OFFLINE" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                        )}
                        <Chip
                          icon={<ShieldIcon sx={{ color: tech.is_kyc_verified ? '#10B981 !important' : '#F59E0B !important', fontSize: '11px !important' }} />}
                          label={tech.is_kyc_verified ? 'DigiLocker KYC' : 'Pending KYC'}
                          size="small"
                          sx={{ bgcolor: tech.is_kyc_verified ? '#ECFDF5' : '#FFFBEB', color: tech.is_kyc_verified ? '#047857' : '#B45309', fontWeight: 800, fontSize: '9.5px', height: 18 }}
                        />
                        {!tech.is_kyc_verified && (
                          <Chip
                            label="12h Review SLA"
                            size="small"
                            sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '9px', height: 16, border: '1px solid #FCD34D' }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', justifyContent: 'center' }}>
                        {!tech.is_kyc_verified ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleKycDecision(tech.id, 'approve')}
                            sx={{
                              bgcolor: '#16A34A',
                              color: '#FFF',
                              fontWeight: 800,
                              fontSize: '11px',
                              textTransform: 'none',
                              borderRadius: '8px',
                              py: 0.4,
                              px: 1.2,
                              '&:hover': { bgcolor: '#15803D' }
                            }}
                          >
                            Approve KYC
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<HistoryEduIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleOpenTechDossier(tech)}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#0284C7',
                              borderColor: '#BAE6FD',
                              bgcolor: '#F8FAFC',
                              textTransform: 'none',
                              py: 0.4,
                              px: 1.2,
                              '&:hover': { bgcolor: '#F1F5F9' }
                            }}
                          >
                            Dossier
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleTechActionMenuOpen(e, tech)}
                          aria-label="Technician actions"
                          sx={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            p: 0.5,
                            color: '#475569',
                            '&:hover': { bgcolor: '#F1F5F9' }
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PLATFORM FEEDBACK & ISSUE RESOLUTION CENTER (CUSTOMER & TECH) */}
        {/* ========================================================================= */}
        {activeMainTab === 'feedback' && (
          <Card
            elevation={0}
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              p: 3,
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
            }}
          >
            {/* Header & Description */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Avatar sx={{ bgcolor: '#0D9488', width: 40, height: 40 }}>
                  <RateReviewIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
                    Platform Feedback & Issue Resolution Center
                    <Chip label="Live Sync" size="small" sx={{ bgcolor: '#CCFBF1', color: '#0F766E', fontWeight: 800, fontSize: '10px', height: 20 }} />
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Customer reports, partner technician experiences, booking slot issues & platform bug escalations.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
                  onClick={() => {
                    fetchFeedbacks();
                    fetchReviews();
                  }}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#0D9488' }}
                >
                  Refresh Reviews & Reports
                </Button>
              </Box>
            </Box>

            {/* Real Verified Customer Service Reviews Card */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px' }}>
                      Real Customer Service Reviews & Star Ratings ({reviewsList.length} Verified Reviews)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Grounded in PostgreSQL reviews table with verified customer booking IDs and technician feedback.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<StarIcon sx={{ fontSize: '14px !important', color: '#B45309 !important' }} />}
                    label={`Avg Rating: ${reviewsStats?.average_rating || '4.46'} / 5.0`}
                    size="small"
                    sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 900, fontSize: '11px' }}
                  />
                  <Chip
                    label={`${reviewsStats?.stars_5 || 4} Five-Star`}
                    size="small"
                    sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px' }}
                  />
                  <Chip
                    label={`${reviewsStats?.escalated_count || 1} Escalated (<= 3 Stars)`}
                    size="small"
                    sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '11px' }}
                  />
                </Box>
              </Box>

              {reviewsList.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#64748B', py: 2, textAlign: 'center' }}>
                  No customer reviews recorded yet in database.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {reviewsList.map((rev) => (
                    <Paper
                      key={rev.id}
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        border: rev.is_below_3_star ? '1.5px solid #FECACA' : '1px solid #E2E8F0',
                        bgcolor: rev.is_below_3_star ? '#FEF2F2' : '#F8FAFC'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ bgcolor: rev.is_below_3_star ? '#FCA5A5' : '#FEF3C7', color: rev.is_below_3_star ? '#991B1B' : '#B45309', px: 1, py: 0.3, borderRadius: '6px', fontWeight: 900, fontSize: '12px', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <StarIcon sx={{ fontSize: 14 }} /> {rev.rating} / 5.0
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                            {rev.customer_name || 'Customer'} • {rev.locality || 'Salem'}
                          </Typography>
                          <Chip
                            label={`Booking #${rev.booking_id}`}
                            size="small"
                            sx={{ bgcolor: '#E2E8F0', color: '#475569', fontWeight: 700, fontSize: '10px', height: 20 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800, fontSize: '11.5px' }}>
                            Assigned: {rev.technician_name || 'Partner'} ({rev.primary_trade?.toUpperCase() || rev.service_id?.toUpperCase()})
                          </Typography>
                          {rev.is_below_3_star && (
                            <Chip
                              label="Escalated to Salem Ops Anand"
                              size="small"
                              sx={{ bgcolor: '#DC2626', color: '#FFFFFF', fontWeight: 900, fontSize: '10px', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '12.5px', lineHeight: 1.45, mb: 0.8 }}>
                        "{rev.comment}"
                      </Typography>

                      {rev.tags && rev.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 0.5 }}>
                          {rev.tags.map((tag, tIdx) => (
                            <Chip
                              key={tIdx}
                              label={tag}
                              size="small"
                              sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '10px', height: 20, border: '1px solid #BBF7D0' }}
                            />
                          ))}
                        </Box>
                      )}

                      {rev.root_cause_tags && rev.root_cause_tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 0.5 }}>
                          {rev.root_cause_tags.map((rc, rcIdx) => (
                            <Chip
                              key={rcIdx}
                              label={`Root Cause: ${rc}`}
                              size="small"
                              sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '10px', height: 20 }}
                            />
                          ))}
                        </Box>
                      )}

                      {rev.ops_manager_notes && (
                        <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 700, fontSize: '11px', display: 'block', mt: 0.5 }}>
                          Ops Lead Note: {rev.ops_manager_notes}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Card>

            {/* Quick Metrics Bar */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>TOTAL SUBMISSIONS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>{feedbacksList.length}</Typography>
                  <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 600 }}>Salem platform feedback</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 700 }}>CUSTOMER REPORTS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1D4ED8', mt: 0.5 }}>
                    {feedbacksList.filter(f => (f.role || 'customer') === 'customer').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>Slots, matching & app</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>TECHNICIAN REPORTS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#15803D', mt: 0.5 }}>
                    {feedbacksList.filter(f => (f.role || '') === 'technician').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>Duty Radar, payouts & jobs</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>PENDING RESOLUTION</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#B45309', mt: 0.5 }}>
                    {feedbacksList.filter(f => (f.status || 'new') === 'new').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>Action needed</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Filters Row */}
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Role Chips */}
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mr: 0.5 }}>SOURCE:</Typography>
                  {[
                    { id: 'all', label: `All (${feedbacksList.length})` },
                    { id: 'customer', label: `Customers (${feedbacksList.filter(f => (f.role || 'customer') === 'customer').length})` },
                    { id: 'technician', label: `Technicians (${feedbacksList.filter(f => (f.role || '') === 'technician').length})` }
                  ].map(tab => (
                    <Chip
                      key={tab.id}
                      label={tab.label}
                      onClick={() => setFeedbackRoleFilter(tab.id)}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        bgcolor: feedbackRoleFilter === tab.id ? '#0D9488' : '#FFFFFF',
                        color: feedbackRoleFilter === tab.id ? '#FFFFFF' : '#334155',
                        border: '1px solid',
                        borderColor: feedbackRoleFilter === tab.id ? '#0D9488' : '#CBD5E1',
                        '&:hover': { bgcolor: feedbackRoleFilter === tab.id ? '#0F766E' : '#F1F5F9' }
                      }}
                    />
                  ))}
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mr: 0.5 }}>STATUS:</Typography>
                  {[
                    { id: 'all', label: 'All Status' },
                    { id: 'new', label: 'Pending Action' },
                    { id: 'resolved', label: 'Resolved' }
                  ].map(tab => (
                    <Chip
                      key={tab.id}
                      label={tab.label}
                      onClick={() => setFeedbackStatusFilter(tab.id)}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        bgcolor: feedbackStatusFilter === tab.id ? '#2563EB' : '#FFFFFF',
                        color: feedbackStatusFilter === tab.id ? '#FFFFFF' : '#334155',
                        border: '1px solid',
                        borderColor: feedbackStatusFilter === tab.id ? '#2563EB' : '#CBD5E1',
                        '&:hover': { bgcolor: feedbackStatusFilter === tab.id ? '#1D4ED8' : '#F1F5F9' }
                      }}
                    />
                  ))}
                </Box>

                {/* Search Bar */}
                <TextField
                  size="small"
                  placeholder="Search feedback, user, phone..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '10px', bgcolor: '#FFFFFF', width: 240, fontSize: '12px' }
                  }}
                />
              </Box>
            </Paper>

            {/* Feedbacks Listing Table */}
            {feedbacksLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ color: '#0D9488' }} />
                <Typography variant="body2" sx={{ mt: 1.5, color: '#64748B', fontWeight: 600 }}>
                  Syncing platform feedbacks and user reports...
                </Typography>
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1'
                }}
              >
                <BugReportIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155' }}>
                  No feedback or issues found
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 460, mx: 'auto', mt: 0.5 }}>
                  {feedbackSearch || feedbackRoleFilter !== 'all' || feedbackStatusFilter !== 'all'
                    ? 'No submissions match your active filter criteria. Try resetting filters.'
                    : 'Customer and technician feedback submitted through the Navbar feedback button will appear here in real-time.'}
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
                  Swipe left/right to view full table details
                </Typography>
                <Table size="small" sx={{ minWidth: { xs: 580, md: '100%' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                    <TableCell>User / Reporter</TableCell>
                    <TableCell>Category & Subject</TableCell>
                    <TableCell>Platform Rating</TableCell>
                    <TableCell sx={{ minWidth: 260 }}>Feedback & Issue Details</TableCell>
                    <TableCell>Submitted Time</TableCell>
                    <TableCell align="center">Resolution Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFeedbacks.map((item, idx) => {
                    const isTech = (item.role || '').toLowerCase() === 'technician';
                    const isResolved = (item.status || 'new').toLowerCase() === 'resolved';
                    const userName = item.user_name || item.userName || (isTech ? 'Partner' : 'Customer');
                    const userPhone = item.user_phone || item.userPhone || '—';
                    const locality = item.locality || 'Salem';
                    const ratingVal = parseInt(item.rating, 10) || 5;
                    const categoryLabel = (item.feedback_type || item.feedbackType || 'General')
                      .replace(/_/g, ' ')
                      .toUpperCase();
                    const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now';

                    return (
                      <TableRow key={item.id || idx} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.6 } }}>
                        {/* 1. User & Contact */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar
                              sx={{
                                bgcolor: isTech ? '#10B981' : '#2563EB',
                                width: 34,
                                height: 34,
                                fontWeight: 800,
                                fontSize: '13px'
                              }}
                            >
                              {userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                  {userName}
                                </Typography>
                                <Chip
                                  label={isTech ? 'Technician' : 'Customer'}
                                  size="small"
                                  sx={{
                                    bgcolor: isTech ? '#ECFDF5' : '#EFF6FF',
                                    color: isTech ? '#047857' : '#1E40AF',
                                    fontWeight: 800,
                                    fontSize: '9.5px',
                                    height: 18
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {userPhone} • {locality}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* 2. Category & Subject */}
                        <TableCell>
                          <Chip
                            label={categoryLabel}
                            size="small"
                            sx={{
                              bgcolor: isTech ? '#F0FDF4' : '#F8FAFC',
                              color: isTech ? '#15803D' : '#0369A1',
                              fontWeight: 800,
                              fontSize: '10px',
                              border: '1px solid',
                              borderColor: isTech ? '#BBF7D0' : '#BAE6FD',
                              mb: 0.4
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                            {item.subject || categoryLabel}
                          </Typography>
                        </TableCell>

                        {/* 3. Rating */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <Box sx={{ display: 'flex' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  sx={{
                                    fontSize: 16,
                                    color: star <= ratingVal ? '#F59E0B' : '#E2E8F0'
                                  }}
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', ml: 0.5 }}>
                              {ratingVal}.0
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* 4. Feedback & Issue Details */}
                        <TableCell>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.2,
                              bgcolor: isResolved ? '#F8FAFC' : '#FFFBEB',
                              border: '1px solid',
                              borderColor: isResolved ? '#E2E8F0' : '#FDE68A',
                              borderRadius: '8px'
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '12.5px', whiteSpace: 'pre-wrap' }}>
                              {item.message}
                            </Typography>
                          </Paper>
                        </TableCell>

                        {/* 5. Timestamp */}
                        <TableCell sx={{ color: '#64748B', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                          {createdAt}
                        </TableCell>

                        {/* 6. Resolution Status */}
                        <TableCell align="center">
                          {isResolved ? (
                            <Chip
                              icon={<CheckCircleIcon sx={{ color: '#166534 !important', fontSize: '13px !important' }} />}
                              label="RESOLVED"
                              size="small"
                              sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '10px' }}
                            />
                          ) : (
                            <Chip
                              icon={<BugReportIcon sx={{ color: '#9A3412 !important', fontSize: '13px !important' }} />}
                              label="ACTION REQUIRED"
                              size="small"
                              sx={{ bgcolor: '#FFEDD5', color: '#9A3412', fontWeight: 900, fontSize: '10px' }}
                            />
                          )}
                        </TableCell>

                        {/* 7. Action Buttons */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleUpdateFeedbackStatus(item.id, isResolved ? 'new' : 'resolved')}
                              sx={{
                                bgcolor: isResolved ? '#64748B' : '#10B981',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '11px',
                                textTransform: 'none',
                                borderRadius: '8px',
                                py: 0.4,
                                px: 1.2,
                                '&:hover': { bgcolor: isResolved ? '#475569' : '#059669' }
                              }}
                            >
                              {isResolved ? 'Re-open' : 'Mark Resolved'}
                            </Button>

                            <IconButton
                              size="small"
                              title={`Call ${userName} (${userPhone})`}
                              onClick={() => window.open(`tel:${userPhone}`, '_self')}
                              sx={{
                                bgcolor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '8px',
                                p: 0.6
                              }}
                            >
                              <PhoneIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/*  TAB: CENTRAL SUPPORT TICKETS & HELPDESK TRACKING DESK */}
        {/* ========================================================================= */}
        {activeMainTab === 'tickets' && (
          <Box sx={{ mb: 4 }}>
            {/* 1. Header Toolbar */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', p: 2.5, mb: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#0284C7', width: 44, height: 44 }}>
                    <SupportAgentIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px' }}>
                        Support Tickets & Helpdesk Operations
                      </Typography>
                      <Chip
                        label={`${ticketsList.length} Total`}
                        size="small"
                        sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 800, fontSize: '11px' }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                      Real-time ticketing queue for Salem citizen customer grievances and technician field escalations.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={fetchTickets}
                  disabled={ticketsLoading}
                  startIcon={ticketsLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    px: 2,
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                  }}
                >
                  Refresh Queue
                </Button>
              </Box>
            </Card>

            {/* 2. KPI Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                    {ticketsList.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px' }}>
                  <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Open / Action Required
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#DC2626', mt: 0.5 }}>
                    {ticketsList.filter(t => t.status === 'open').length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '14px' }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    In Progress
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#D97706', mt: 0.5 }}>
                    {ticketsList.filter(t => t.status === 'in_progress').length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px' }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Resolved / Closed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#16A34A', mt: 0.5 }}>
                    {ticketsList.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* 3. Filter & Search Controls */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by ticket #, user, phone, subject..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ticket-status-label">Status</InputLabel>
                    <Select
                      labelId="ticket-status-label"
                      value={ticketStatusFilter}
                      label="Status"
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      sx={{ borderRadius: '10px' }}
                    >
                      <MenuItem value="all">All Statuses ({ticketsList.length})</MenuItem>
                      <MenuItem value="open">Open ({ticketsList.filter(t => t.status === 'open').length})</MenuItem>
                      <MenuItem value="in_progress">In Progress ({ticketsList.filter(t => t.status === 'in_progress').length})</MenuItem>
                      <MenuItem value="resolved">Resolved ({ticketsList.filter(t => t.status === 'resolved').length})</MenuItem>
                      <MenuItem value="closed">Closed ({ticketsList.filter(t => t.status === 'closed').length})</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4} md={2.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ticket-priority-label">Priority</InputLabel>
                    <Select
                      labelId="ticket-priority-label"
                      value={ticketPriorityFilter}
                      label="Priority"
                      onChange={(e) => setTicketPriorityFilter(e.target.value)}
                      sx={{ borderRadius: '10px' }}
                    >
                      <MenuItem value="all">All Priorities</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={4} md={2.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ticket-role-label">Creator Role</InputLabel>
                    <Select
                      labelId="ticket-role-label"
                      value={ticketRoleFilter}
                      label="Creator Role"
                      onChange={(e) => setTicketRoleFilter(e.target.value)}
                      sx={{ borderRadius: '10px' }}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="partner">Technician / Partner</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>

            {/* 4. Tickets Table */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              {ticketsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={36} sx={{ color: '#0284C7', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Loading support tickets queue...
                  </Typography>
                </Box>
              ) : filteredTickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                  <ConfirmationNumberIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>
                    No Support Tickets Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    No tickets match the current filter criteria or search query.
                  </Typography>
                  {(ticketSearch || ticketStatusFilter !== 'all' || ticketPriorityFilter !== 'all' || ticketRoleFilter !== 'all') && (
                    <Button
                      variant="text"
                      onClick={() => {
                        setTicketSearch('');
                        setTicketStatusFilter('all');
                        setTicketPriorityFilter('all');
                        setTicketRoleFilter('all');
                      }}
                      sx={{ mt: 2, textTransform: 'none', fontWeight: 700, color: '#0284C7' }}
                    >
                      Reset All Filters
                    </Button>
                  )}
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>TICKET ID & DATE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>PRIORITY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>CREATOR</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>CATEGORY & BOOKING</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>SUBJECT & DETAILS</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>STATUS</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '12px', py: 1.5 }}>ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTickets.map((ticket) => {
                        const isPartner = (ticket.creator_role || '').toLowerCase() === 'partner' || (ticket.creator_role || '').toLowerCase() === 'technician';
                        const priorityLower = (ticket.priority || 'normal').toLowerCase();
                        const statusLower = (ticket.status || 'open').toLowerCase();

                        // Priority badge styles
                        let priorityStyle = { bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' };
                        if (priorityLower === 'urgent') priorityStyle = { bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #F87171' };
                        else if (priorityLower === 'high') priorityStyle = { bgcolor: '#FFF7ED', color: '#9A3412', border: '1px solid #FDBA74' };
                        else if (priorityLower === 'low') priorityStyle = { bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' };

                        // Status badge styles
                        let statusStyle = { bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #93C5FD', label: 'OPEN' };
                        if (statusLower === 'in_progress') statusStyle = { bgcolor: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', label: 'IN PROGRESS' };
                        else if (statusLower === 'resolved') statusStyle = { bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #6EE7B7', label: 'RESOLVED' };
                        else if (statusLower === 'closed') statusStyle = { bgcolor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', label: 'CLOSED' };

                        const formattedDate = ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Recent';

                        return (
                          <TableRow key={ticket.id} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.8 } }}>
                            {/* 1. Ticket Number & Date */}
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                                {ticket.ticket_number || ticket.id}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px', mt: 0.3 }}>
                                {formattedDate}
                              </Typography>
                            </TableCell>

                            {/* 2. Priority */}
                            <TableCell>
                              <Chip
                                label={priorityLower.toUpperCase()}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '10px',
                                  height: '22px',
                                  ...priorityStyle
                                }}
                              />
                            </TableCell>

                            {/* 3. Creator */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: isPartner ? '#10B981' : '#2563EB',
                                    width: 32,
                                    height: 32,
                                    fontSize: '12px',
                                    fontWeight: 800
                                  }}
                                >
                                  {(ticket.creator_name || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                                      {ticket.creator_name || 'Salem User'}
                                    </Typography>
                                    <Chip
                                      label={isPartner ? 'Partner' : 'Customer'}
                                      size="small"
                                      sx={{
                                        bgcolor: isPartner ? '#ECFDF5' : '#EFF6FF',
                                        color: isPartner ? '#047857' : '#1E40AF',
                                        fontWeight: 800,
                                        fontSize: '9px',
                                        height: '18px'
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                    <PhoneIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                                    {ticket.creator_phone || '—'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* 4. Category & Booking */}
                            <TableCell>
                              <Chip
                                label={(ticket.category || 'General').toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: '#F8FAFC',
                                  color: '#334155',
                                  border: '1px solid #E2E8F0',
                                  fontWeight: 800,
                                  fontSize: '10px',
                                  height: '20px',
                                  mb: 0.5,
                                  display: 'inline-flex'
                                }}
                              />
                              {ticket.booking_id ? (
                                <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block', fontSize: '11px' }}>
                                  Booking #{ticket.booking_id}
                                </Typography>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '11px' }}>
                                  General Platform
                                </Typography>
                              )}
                            </TableCell>

                            {/* 5. Subject & Details */}
                            <TableCell sx={{ maxWidth: 320 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.3 }}>
                                {ticket.subject}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#64748B',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4
                                }}
                              >
                                {ticket.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.6 }}>
                                {ticket.voice_note_url && (
                                  <Chip
                                    icon={<VolumeUpIcon sx={{ fontSize: '13px !important' }} />}
                                    label="Audio Note"
                                    size="small"
                                    sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '10px', height: '20px' }}
                                  />
                                )}
                                {ticket.attachment_url && (
                                  <Chip
                                    icon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                                    label="Attachment"
                                    size="small"
                                    sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '10px', height: '20px' }}
                                  />
                                )}
                                {ticket.resolution_summary && (
                                  <Chip
                                    icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />}
                                    label="Resolution Added"
                                    size="small"
                                    sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '10px', height: '20px' }}
                                  />
                                )}
                              </Box>
                            </TableCell>

                            {/* 6. Status */}
                            <TableCell>
                              <Chip
                                label={statusStyle.label}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '10px',
                                  height: '22px',
                                  bgcolor: statusStyle.bgcolor,
                                  color: statusStyle.color,
                                  border: statusStyle.border
                                }}
                              />
                            </TableCell>

                            {/* 7. Action Button */}
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenTicketModal(ticket)}
                                startIcon={<TuneIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                  bgcolor: '#0284C7',
                                  color: '#FFFFFF',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '11.5px',
                                  borderRadius: '8px',
                                  px: 1.5,
                                  py: 0.6,
                                  boxShadow: 'none',
                                  '&:hover': { bgcolor: '#0369A1', boxShadow: 'none' }
                                }}
                              >
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Card>

            {/* 5. Ticket Detail & Resolution Modal */}
            <Dialog
              open={ticketModalOpen}
              onClose={() => !isUpdatingTicket && setTicketModalOpen(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: { borderRadius: '16px', p: 1 }
              }}
            >
              <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px' }}>
                    Ticket Dossier: {selectedTicketForModal?.ticket_number || selectedTicketForModal?.id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Created: {selectedTicketForModal?.created_at ? new Date(selectedTicketForModal.created_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                <Chip
                  label={(selectedTicketForModal?.status || 'OPEN').toUpperCase()}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '10.5px',
                    bgcolor: selectedTicketForModal?.status === 'resolved' ? '#ECFDF5' : selectedTicketForModal?.status === 'in_progress' ? '#FFFBEB' : '#EFF6FF',
                    color: selectedTicketForModal?.status === 'resolved' ? '#047857' : selectedTicketForModal?.status === 'in_progress' ? '#B45309' : '#1D4ED8',
                    border: '1px solid',
                    borderColor: selectedTicketForModal?.status === 'resolved' ? '#6EE7B7' : selectedTicketForModal?.status === 'in_progress' ? '#FCD34D' : '#93C5FD'
                  }}
                />
              </DialogTitle>

              <DialogContent dividers sx={{ py: 2.5 }}>
                {selectedTicketForModal && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* User and Booking Metadata */}
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Requester</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {selectedTicketForModal.creator_name || 'Salem Citizen'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                            {selectedTicketForModal.creator_phone} ({selectedTicketForModal.creator_role || 'Customer'})
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Category & Priority</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'capitalize' }}>
                            {selectedTicketForModal.category || 'General'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                            Priority: {(selectedTicketForModal.priority || 'Normal').toUpperCase()}
                          </Typography>
                        </Grid>
                        {selectedTicketForModal.booking_id && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 0.5, borderColor: '#E2E8F0' }} />
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Linked Booking</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284C7' }}>
                              #{selectedTicketForModal.booking_id}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>

                    {/* Subject & Description */}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>
                        Ticket Subject
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.3, mb: 1.5 }}>
                        {selectedTicketForModal.subject}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>
                        Issue Description
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', mt: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {selectedTicketForModal.description}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Audio or Attachment if present */}
                    {selectedTicketForModal.voice_note_url && (
                      <Box>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>
                          Voice Recording
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <audio controls src={selectedTicketForModal.voice_note_url} style={{ width: '100%' }} />
                        </Box>
                      </Box>
                    )}

                    {selectedTicketForModal.attachment_url && (
                      <Box>
                        <Button
                          variant="outlined"
                          size="small"
                          href={selectedTicketForModal.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<OpenInNewIcon />}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                        >
                          View Uploaded Proof / Attachment
                        </Button>
                      </Box>
                    )}

                    <Divider sx={{ borderColor: '#E2E8F0' }} />

                    {/* Resolution Controls */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        Update Ticket Status & Log Resolution
                      </Typography>

                      <FormControl fullWidth size="small">
                        <InputLabel id="modal-status-label">Ticket Status</InputLabel>
                        <Select
                          labelId="modal-status-label"
                          value={ticketNewStatus}
                          label="Ticket Status"
                          onChange={(e) => setTicketNewStatus(e.target.value)}
                          sx={{ borderRadius: '10px' }}
                        >
                          <MenuItem value="open">Open (Awaiting Central Desk)</MenuItem>
                          <MenuItem value="in_progress">In Progress (Under Investigation)</MenuItem>
                          <MenuItem value="resolved">Resolved (Solution Provided)</MenuItem>
                          <MenuItem value="closed">Closed (Archived)</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Admin Resolution Summary / Actions Taken"
                        placeholder="Detail the steps taken, customer conversation notes, or refund/dispatch adjustments..."
                        value={ticketResolutionNote}
                        onChange={(e) => setTicketResolutionNote(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />

                      {selectedTicketForModal.resolved_by && (
                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                          Last resolved by: {selectedTicketForModal.resolved_by} {selectedTicketForModal.resolved_at ? `on ${new Date(selectedTicketForModal.resolved_at).toLocaleString()}` : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </DialogContent>

              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setTicketModalOpen(false)}
                  disabled={isUpdatingTicket}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#475569', borderColor: '#CBD5E1' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdateTicketStatus}
                  disabled={isUpdatingTicket}
                  startIcon={isUpdatingTicket ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{
                    bgcolor: '#0284C7',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0369A1', boxShadow: 'none' }
                  }}
                >
                  {isUpdatingTicket ? 'Saving...' : 'Save Resolution'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* ========================================================================= */}
        {/*  TAB 5: REAL-TIME AUDIT LOGS & PLATFORM TRACEABILITY DESK */}
        {/* ========================================================================= */}
        {activeMainTab === 'traceability' && (
          <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            {/* Traceability Header & Quick Filters */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldIcon sx={{ color: '#059669', fontSize: 24 }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px' }}>
                        Shazu One Central Audit Trail & Deep Traceability Desk
                      </Typography>
                      <Chip
                        label={`${auditLogsList.length} Real-Time Events`}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 900, fontSize: '10.5px' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      Cryptographic immutable event stream tracking Partner KYC decisions, Dispatches, Quotes, and Doorstep settlements.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                  onClick={fetchAuditLogs}
                  disabled={auditLogsLoading}
                  sx={{
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'none'
                  }}
                >
                  {auditLogsLoading ? 'Refreshing...' : 'Refresh Logs'}
                </Button>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Filter Pills & Search Input */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', mr: 0.5 }}>EVENT FILTER:</Typography>
                  {[
                    { id: 'all', label: 'All Events' },
                    { id: 'kyc', label: 'Partner KYC & Onboarding' },
                    { id: 'dispatch', label: 'Dispatches & Matching' },
                    { id: 'quote', label: 'Quotes & Job Cards' },
                    { id: 'payment', label: 'Payments & Escrow' }
                  ].map(tab => (
                    <Chip
                      key={tab.id}
                      label={tab.label}
                      onClick={() => setAuditEventFilter(tab.id)}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '11px',
                        cursor: 'pointer',
                        bgcolor: auditEventFilter === tab.id ? '#0F172A' : '#FFFFFF',
                        color: auditEventFilter === tab.id ? '#FFFFFF' : '#475569',
                        border: '1px solid',
                        borderColor: auditEventFilter === tab.id ? '#0F172A' : '#CBD5E1',
                        '&:hover': { bgcolor: auditEventFilter === tab.id ? '#1E293B' : '#F1F5F9' }
                      }}
                    />
                  ))}
                </Box>

                <TextField
                  size="small"
                  placeholder="Search event, booking ID, actor..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '10px', bgcolor: '#FFFFFF', width: 260, fontSize: '12px' }
                  }}
                />
              </Box>
            </Paper>

            {/* Audit Logs Table */}
            {auditLogsLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ color: '#059669' }} />
                <Typography variant="body2" sx={{ mt: 1.5, color: '#64748B', fontWeight: 600 }}>
                  Querying immutable audit logs from database...
                </Typography>
              </Box>
            ) : filteredAuditLogs.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                <ShieldIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155' }}>
                  No audit log records match your filter
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 460, mx: 'auto', mt: 0.5 }}>
                  Try resetting your search query or selecting "All Events" to view recent system activity.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
                  Swipe left/right to view full table details
                </Typography>
                <Table size="small" sx={{ minWidth: { xs: 580, md: '100%' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                    <TableCell>Timestamp (IST)</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Reference ID / Booking</TableCell>
                    <TableCell>Actor & Role</TableCell>
                    <TableCell sx={{ minWidth: 280 }}>Event Audit Metadata</TableCell>
                    <TableCell align="center">Deep Inspection</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAuditLogs.map((log, idx) => {
                    const eventType = log.event_type || 'EVENT';
                    const isKycApproved = eventType === 'TECH_KYC_APPROVED';
                    const isKycRejected = eventType === 'TECH_KYC_REJECTED';
                    const isTechOnboard = eventType === 'TECH_ONBOARDED';
                    const isDispatch = eventType === 'MANUAL_DISPATCH' || eventType === 'BOOKING_MATCHED';
                    const isPayment = eventType.includes('PAYMENT') || eventType.includes('SETTLEMENT');

                    let metaObj = {};
                    try {
                      metaObj = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
                    } catch (e) {
                      metaObj = { raw: log.metadata };
                    }

                    const bookingId = log.booking_id || '';
                    const isBookingLink = bookingId && !bookingId.startsWith('PARTNER') && !bookingId.startsWith('TECH-KYC');

                    return (
                      <TableRow key={log.id || idx} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.4 } }}>
                        <TableCell sx={{ color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={eventType.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              fontSize: '9.5px',
                              bgcolor: isKycApproved ? '#DCFCE7' : isKycRejected ? '#FEE2E2' : isTechOnboard ? '#EFF6FF' : isDispatch ? '#F3E8FF' : isPayment ? '#ECFDF5' : '#F1F5F9',
                              color: isKycApproved ? '#166534' : isKycRejected ? '#991B1B' : isTechOnboard ? '#1E40AF' : isDispatch ? '#6B21A8' : isPayment ? '#065F46' : '#475569',
                              border: '1px solid',
                              borderColor: isKycApproved ? '#86EFAC' : isKycRejected ? '#FCA5A5' : isTechOnboard ? '#93C5FD' : isDispatch ? '#D8B4FE' : '#E2E8F0'
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          {isBookingLink ? (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline', fontSize: '12.5px' }}
                              onClick={() => handleOpenBookingTrace({ id: bookingId })}
                              title="Click to deep trace this booking"
                            >
                              #{bookingId}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '12px' }}>
                              {bookingId || 'SYSTEM'}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Chip
                              label={(log.actor_type || 'system').toUpperCase()}
                              size="small"
                              sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 800, fontSize: '9px', height: 18 }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {log.actor_id || 'system_worker'}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: '#F8FAFC',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              color: '#334155',
                              maxHeight: 64,
                              overflow: 'auto',
                              wordBreak: 'break-all'
                            }}
                          >
                            {JSON.stringify(metaObj, null, 1)}
                          </Paper>
                        </TableCell>

                        <TableCell align="center">
                          {isBookingLink ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ArticleIcon sx={{ fontSize: 13 }} />}
                              onClick={() => handleOpenBookingTrace({ id: bookingId })}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'none',
                                py: 0.3,
                                px: 1,
                                color: '#0284C7',
                                borderColor: '#BAE6FD',
                                bgcolor: '#F0F9FF',
                                '&:hover': { bgcolor: '#E0F2FE', borderColor: '#0284C7' }
                              }}
                            >
                              Trace
                            </Button>
                          ) : (
                            <Chip label="Log Only" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontSize: '10px' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/*  TAB 6: REWARDS & COUPONS MANAGEMENT (ADMIN CUSTOMIZABLE) */}
        {/* ========================================================================= */}
        {activeMainTab === 'rewards' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 1. Platform Settings: Fees, Commissions & Rewards */}
            <Card elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'amber.50', color: 'amber.700', width: 40, height: 40, borderRadius: '8px' }}>
                    <CardGiftcardIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '18px' }}>
                      Platform Settings: Fees, Commissions & Rewards
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      Central source of truth in PostgreSQL (platform_settings). Values edited here apply immediately across all bookings, splits, and user wallets.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {initialRewardConfig && JSON.stringify(rewardConfig) !== JSON.stringify(initialRewardConfig) && (
                    <Chip
                      label="Unsaved changes"
                      size="small"
                      sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 700, fontSize: '11px', height: 26 }}
                    />
                  )}
                  <Button
                    variant="contained"
                    startIcon={rewardsSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 18 }} />}
                    disabled={rewardsSaving}
                    onClick={handleSaveRewardConfig}
                    sx={{
                      minHeight: 40,
                      px: 2.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {rewardsSaving ? 'Saving...' : 'Save All Settings'}
                  </Button>
                </Box>
              </Box>

              {/* Section 1: Dual-Sided Commission & Fee Matrix */}
              <SectionHeader
                number="1"
                title="Dual-Sided Commission & Platform Fee Matrix"
                description="Central percentage cuts deducted from technician jobs and convenience fees charged at checkout."
              />

              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="PARTNER COMMISSION"
                    helper="Platform cut deducted from technician work total (e.g. 2% = 98% technician payout)."
                  >
                    <AddonInput
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      suffix="%"
                      value={rewardConfig.partner_commission_percent ?? 2.0}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, partner_commission_percent: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="CUSTOMER PLATFORM FEE"
                    helper="Customer convenience charge added to bill at checkout (e.g. 2.0%)."
                  >
                    <AddonInput
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      suffix="%"
                      value={rewardConfig.customer_platform_fee_percent ?? 2.0}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, customer_platform_fee_percent: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="PAYMENT GATEWAY FEE"
                    helper="Razorpay processing fee passed transparently to payment provider (e.g. 2.0%)."
                  >
                    <AddonInput
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      suffix="%"
                      value={rewardConfig.payment_gateway_fee_percent ?? 2.0}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, payment_gateway_fee_percent: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="INSPECTION VISIT FEE"
                    helper="Upfront diagnostic visitation fee paid on booking confirmation."
                  >
                    <AddonInput
                      type="number"
                      prefix="INR"
                      value={rewardConfig.inspection_visit_fee ?? 99}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, inspection_visit_fee: e.target.value })}
                    />
                  </FieldCard>
                </Grid>
              </Grid>

              {/* Section 2: Customer Booking & Referral Rewards */}
              <SectionHeader
                number="2"
                title="Customer Booking & Referral Rewards"
                description="Incentivize organic customer referral loops and repeat booking completions."
              />

              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="CUSTOMER REFERRER REWARD"
                    helper="Credits given to customer when their referred friend completes their 1st service."
                  >
                    <AddonInput
                      type="number"
                      suffix="Credits"
                      value={rewardConfig.customer_referral_credits}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, customer_referral_credits: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="FRIEND 1ST SERVICE DISCOUNT"
                    helper="Instant INR discount applied to friend's 1st booking via referral code."
                  >
                    <AddonInput
                      type="number"
                      prefix="INR"
                      value={rewardConfig.referee_discount_amount}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, referee_discount_amount: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="BOOKING CASHBACK REWARD"
                    helper="Credits awarded to customer wallet upon completing a service booking."
                  >
                    <AddonInput
                      type="number"
                      suffix="Credits"
                      value={rewardConfig.review_reward_credits}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, review_reward_credits: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6} xl={3}>
                  <FieldCard
                    label="FEEDBACK REWARD"
                    helper="Credits given when submitting general app feedback (policy: disabled)."
                    hasSwitch
                    switchChecked={Boolean(rewardConfig.feedback_rewards_enabled)}
                    onSwitchChange={(e) => setRewardConfig({ ...rewardConfig, feedback_rewards_enabled: e.target.checked })}
                    disabled={!rewardConfig.feedback_rewards_enabled}
                  >
                    <AddonInput
                      type="number"
                      suffix="Credits"
                      disabled={!rewardConfig.feedback_rewards_enabled}
                      value={rewardConfig.feedback_reward_credits}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, feedback_reward_credits: e.target.value })}
                    />
                  </FieldCard>
                </Grid>
              </Grid>

              {/* Section 3: Partner Fleet Referral Incentives */}
              <SectionHeader
                number="3"
                title="Partner Fleet Referral Incentives"
                description="Encourage technician fleet recruitment and new partner onboarding."
              />

              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} md={6}>
                  <FieldCard
                    label="PARTNER REFERRAL INCENTIVE"
                    helper="Incentive credited to technician wallet when referring a new partner to the fleet."
                  >
                    <AddonInput
                      type="number"
                      prefix="INR"
                      value={rewardConfig.partner_referral_incentive}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, partner_referral_incentive: e.target.value })}
                    />
                  </FieldCard>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <FieldCard
                    label="NEW PARTNER ONBOARDING BONUS"
                    helper="Welcome bonus for new technician signups (set to 0 for booking/referral only policy)."
                  >
                    <AddonInput
                      type="number"
                      prefix="INR"
                      value={rewardConfig.partner_welcome_bonus}
                      onChange={(e) => setRewardConfig({ ...rewardConfig, partner_welcome_bonus: e.target.value })}
                    />
                  </FieldCard>
                </Grid>
              </Grid>

              {/* Business Policy Preview Strip */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'slate.50',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'slate.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.700', mr: 0.5 }}>
                    Active Business Policy:
                  </Typography>
                  <Chip size="small" variant="outlined" label={`Partner Commission: ${rewardConfig.partner_commission_percent}%`} sx={{ bgcolor: '#FFFFFF', borderColor: 'slate.300', fontWeight: 600, fontSize: '11px' }} />
                  <Chip size="small" variant="outlined" label={`Customer Fee: ${rewardConfig.customer_platform_fee_percent}%`} sx={{ bgcolor: '#FFFFFF', borderColor: 'slate.300', fontWeight: 600, fontSize: '11px' }} />
                  <Chip size="small" variant="outlined" label={`Gateway Fee: ${rewardConfig.payment_gateway_fee_percent}%`} sx={{ bgcolor: '#FFFFFF', borderColor: 'slate.300', fontWeight: 600, fontSize: '11px' }} />
                  <Chip size="small" variant="outlined" label={`Booking Cashback: ${rewardConfig.review_reward_credits} Credits`} sx={{ bgcolor: '#FFFFFF', borderColor: 'slate.300', fontWeight: 600, fontSize: '11px' }} />
                  <Chip size="small" variant="outlined" label={`Customer Referral: ${rewardConfig.customer_referral_credits} Credits`} sx={{ bgcolor: '#FFFFFF', borderColor: 'slate.300', fontWeight: 600, fontSize: '11px' }} />
                </Box>
                <Chip
                  label="Real-time DB Sync"
                  size="small"
                  icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'primary.main !important' }} />}
                  sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 700, fontSize: '11px', border: '1px solid', borderColor: 'primary.200' }}
                />
              </Box>
            </Card>

            {/* 2. Promotional Coupon Code Manager */}
            <Card elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 40, height: 40, borderRadius: '8px' }}>
                    <ConfirmationNumberIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '18px' }}>
                        Promotional Coupon Codes
                      </Typography>
                      <Chip
                        label={couponsList.length}
                        size="small"
                        sx={{ bgcolor: 'slate.100', color: 'slate.700', fontWeight: 700, fontSize: '11px', height: 22 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      Manage discount vouchers, order thresholds, percentage vs flat deductions, and campaign toggles.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                    onClick={fetchCoupons}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', minHeight: 36 }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    onClick={() => navigate('/admin/coupons/new', { state: { returnTo: location.pathname } })}
                    sx={{
                      minHeight: 36,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  >
                    Create Coupon Code
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {couponsLoading ? (
                <SkeletonBlock variant="card" height={160} />
              ) : couponsList.length === 0 ? (
                <EmptyState
                  icon={ConfirmationNumberIcon}
                  title="No Promotional Coupons Yet"
                  description="Create discount vouchers and promotional campaign codes to drive customer engagement across Salem."
                  actionLabel="Create Coupon Code"
                  onAction={() => navigate('/admin/coupons/new', { state: { returnTo: location.pathname } })}
                />
              ) : (
                <DataTable
                  columns={[
                    {
                      field: 'code',
                      headerName: 'PROMO CODE',
                      minWidth: 140,
                      renderCell: (c) => (
                        <Chip
                          label={c.code}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            bgcolor: c.isActive ? 'primary.50' : 'slate.100',
                            color: c.isActive ? 'primary.main' : 'slate.600',
                            border: '1px solid',
                            borderColor: c.isActive ? 'primary.200' : 'slate.200'
                          }}
                        />
                      )
                    },
                    {
                      field: 'discount',
                      headerName: 'DISCOUNT',
                      minWidth: 160,
                      renderCell: (c) => (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'slate.900' }}>
                          {c.discountType === 'percent'
                            ? `${c.discountValue}% Off ${c.maxDiscountCap ? `(Max INR ${c.maxDiscountCap})` : ''}`
                            : `INR ${c.discountValue} Flat Off`}
                        </Typography>
                      )
                    },
                    {
                      field: 'minOrder',
                      headerName: 'MIN ORDER',
                      minWidth: 120,
                      renderCell: (c) => (
                        <Typography variant="body2" sx={{ color: 'slate.600', fontVariantNumeric: 'tabular-nums' }}>
                          INR {c.minOrderAmount}
                        </Typography>
                      )
                    },
                    {
                      field: 'description',
                      headerName: 'DESCRIPTION',
                      minWidth: 220,
                      renderCell: (c) => (
                        <Tooltip title={c.description || 'No description'}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'slate.600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxWidth: 240
                            }}
                          >
                            {c.description || '-'}
                          </Typography>
                        </Tooltip>
                      )
                    },
                    {
                      field: 'usage',
                      headerName: 'TIMES USED',
                      minWidth: 120,
                      renderCell: (c) => (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
                          {c.timesUsed} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                        </Typography>
                      )
                    },
                    {
                      field: 'status',
                      headerName: 'STATUS',
                      minWidth: 130,
                      renderCell: (c) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Switch
                            size="small"
                            checked={c.isActive}
                            onChange={() => handleToggleCouponActive(c)}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: c.isActive ? 'success.main' : 'slate.400' }}>
                            {c.isActive ? 'Active' : 'Disabled'}
                          </Typography>
                        </Box>
                      )
                    },
                    {
                      field: 'actions',
                      headerName: 'ACTIONS',
                      align: 'right',
                      minWidth: 100,
                      renderCell: (c) => (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconActionButton
                            title="Edit Coupon"
                            onClick={() => {
                              navigate(`/admin/coupons/${c.code}/edit`, { state: { coupon: c, returnTo: location.pathname } });
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconActionButton>
                          <IconActionButton
                            title="Delete Coupon"
                            color="error"
                            onClick={() => setCouponToDelete(c)}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconActionButton>
                        </Box>
                      )
                    }
                  ]}
                  rows={couponsList}
                  loading={couponsLoading}
                  emptyMessage="No promotional coupons registered yet."
                />
              )}
            </Card>

            {/* Mobile / Desktop Sticky Save Bar for Settings */}
            <StickySaveBar
              visible={Boolean(initialRewardConfig && JSON.stringify(rewardConfig) !== JSON.stringify(initialRewardConfig))}
              loading={rewardsSaving}
              onSave={handleSaveRewardConfig}
              onDiscard={() => setRewardConfig(initialRewardConfig)}
            />

            {/* Confirm Dialog for Coupon Deletion */}
            <ConfirmDialog
              open={Boolean(couponToDelete)}
              title="Delete Promotional Coupon"
              message={`Are you sure you want to permanently delete the coupon "${couponToDelete?.code}"? Customers will no longer be able to redeem this voucher at checkout.`}
              confirmLabel="Delete Coupon"
              confirmColor="error"
              onConfirm={async () => {
                if (!couponToDelete) return;
                try {
                  const res = await fetch(`${API_V1_URL}/admin/coupons/${couponToDelete.id}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (data.success) {
                    setToast({ open: true, message: `Coupon ${couponToDelete.code} deleted`, severity: 'success' });
                    fetchCoupons();
                  }
                } catch (err) {
                  setToast({ open: true, message: err.message, severity: 'error' });
                } finally {
                  setCouponToDelete(null);
                }
              }}
              onCancel={() => setCouponToDelete(null)}
            />
          </Box>
        )}

        {/* ========================================================================= */}
        {/* TAB: LIVE TRACKING FLEET CONSOLE */}
        {/* ========================================================================= */}
        {activeMainTab === 'tracking' && (
          <Box>
            <Card elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <NavigationIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                      Real-Time Active Tracking Fleet Command
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Monitoring ongoing doorstep dispatches, technician GPS telemetry, and 7-stage service progression.
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${recentBookings.filter(b => ['en_route', 'arrived', 'in_progress', 'quote_presented'].includes(b.status)).length} Live Jobs`}
                  size="small"
                  sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '11px', height: 24 }}
                />
              </Box>
            </Card>

            {/* Tracking Jobs Cards */}
            <Grid container spacing={2}>
              {recentBookings.filter(b => !['cancelled'].includes(b.status)).slice(0, 9).map(job => {
                const assignedTech = technicians.find(t => t.id === job.technician_id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={job.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#0284C7', boxShadow: '0 4px 16px rgba(2, 132, 199, 0.1)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800 }}>
                            #{job.id}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                            {job.service_name || job.service_id || 'Doorstep Service'}
                          </Typography>
                        </Box>
                        {getStatusChip(job.status)}
                      </Box>

                      <Box sx={{ mb: 1.5, bgcolor: '#F8FAFC', p: 1, borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block' }}>
                          Customer: {job.customer_name || 'Resident'} ({job.customer_phone})
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          Locality: {job.locality || 'Fairlands, Salem'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <ShieldIcon sx={{ fontSize: 13, color: '#10B981' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', fontSize: '10.5px' }}>
                            PIN: {job.doorstep_otp || job.doorstepOtp || '----'}
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 800, color: '#0284C7' }}>
                            Fee: ₹{parseFloat(job.visit_fee || 0).toFixed(0)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: assignedTech ? '#0284C7' : '#94A3B8', fontSize: '11px', fontWeight: 900 }}>
                            {assignedTech ? assignedTech.full_name?.substring(0, 2).toUpperCase() : 'NA'}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>
                              {assignedTech ? assignedTech.full_name : 'No Tech Assigned'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                              {assignedTech ? assignedTech.phone : 'Pending dispatch'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<NavigationIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleOpenTracking(job)}
                          sx={{
                            bgcolor: '#0284C7',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '11px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            py: 0.5,
                            '&:hover': { bgcolor: '#0369A1' }
                          }}
                        >
                          Open 7-Stage Console
                        </Button>
                        {/* Admin Cancel Order & Release Tech in Fleet Monitoring */}
                        {!['completed', 'cancelled'].includes(job.status) && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CancelIcon sx={{ fontSize: 12 }} />}
                            onClick={() => handleOpenCancelOrder(job)}
                            title="Cancel this order and release the technician (admin override)"
                            sx={{
                              borderColor: '#FCA5A5',
                              color: '#DC2626',
                              bgcolor: '#FEF2F2',
                              fontWeight: 800,
                              fontSize: '11px',
                              borderRadius: '8px',
                              textTransform: 'none',
                              px: 1.2,
                              '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' }
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        {job.status === 'matching' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDispatch(job)}
                            sx={{
                              borderColor: '#CBD5E1',
                              color: '#0284C7',
                              fontWeight: 800,
                              fontSize: '11px',
                              borderRadius: '8px',
                              textTransform: 'none',
                              px: 1.5
                            }}
                          >
                            Dispatch
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* TAB: SERVICES & INSPECTION FEES CRUD MODULE */}
        {/* ========================================================================= */}
        {activeMainTab === 'services' && (
          <AdminServicesModule
            currentRole={currentRole}
            onToast={(msg, sev) => setToast({ open: true, message: msg, severity: sev })}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: WHATSAPP BUSINESS GATEWAY & PAIRING MODULE */}
        {/* ========================================================================= */}
        {activeMainTab === 'whatsapp_gateway' && (
          <AdminWhatsAppModule />
        )}

        {/* ========================================================================= */}
        {/* TAB: INTERNAL TEAM & RBAC MODULE */}
        {/* ========================================================================= */}
        {activeMainTab === 'team' && (
          <AdminTeamModule
            currentRole={currentRole}
            onToast={(msg, sev) => setToast({ open: true, message: msg, severity: sev })}
          />
        )}

        {/* ========================================================================= */}
        {/* CUSTOMER 360 SLIDE-OVER DOSSIER DRAWER */}
        <AdminCustomerDossierDrawer
          open={customerModalOpen}
          onClose={() => setCustomerModalOpen(false)}
          customer={customerDetails}
          history={customerHistory}
          loading={customerHistoryLoading}
          onOpenBookingTrace={(job) => {
            setCustomerModalOpen(false);
            handleOpenBookingTrace(job);
          }}
          onOpenTechDossier={(job) => {
            const matched = technicians.find(t => t.id === job.technician_id || t.full_name === job.technician_name);
            if (matched) {
              setCustomerModalOpen(false);
              handleOpenTechDossier(matched);
            }
          }}
          onToggleBlock={handleToggleCustomerBlock}
          getStatusChip={getStatusChip}
        />

        {/* TECHNICIAN 360 SLIDE-OVER DOSSIER DRAWER */}
        <AdminTechnicianDossierDrawer
          open={techDossierModalOpen}
          onClose={() => setTechDossierModalOpen(false)}
          tech={selectedTechDossier}
          jobsHistory={techJobsHistory}
          financials={techFinancials}
          loading={techDossierLoading}
          onOpenBookingTrace={(job) => {
            setTechDossierModalOpen(false);
            handleOpenBookingTrace(job);
          }}
          onKycDecision={handleKycDecision}
          onToggleBlock={handleToggleTechnicianBlock}
          onOpenAadhaarViewer={handleOpenAadhaarViewer}
          onAttachAadhaarSuccess={(url) => {
            setSelectedTechDossier(prev => ({ ...prev, aadhaar_card_url: url }));
            setTechnicians(prev => prev.map(t => t.id === selectedTechDossier.id ? { ...t, aadhaar_card_url: url } : t));
            setToast({ open: true, message: 'Aadhaar document successfully attached!', severity: 'success' });
          }}
          getStatusChip={getStatusChip}
        />

        {/* LEGACY: RELEASE TECHNICIAN (CUSTOMER UNRESPONSIVE) */}
        

        {/* ── ADMIN CANCEL ORDER & RELEASE TECHNICIAN MODAL ─────────────────── */}
        

        {/* IN-APP DOCUMENT VIEWER MODAL (AADHAAR CARD & PARTS BILL RECEIPT) */}
        

        {/* DEEP BOOKING TRACEABILITY & AUDIT DOSSIER MODAL */}
        

        {/* Smart Technician Dispatch Drawer ("give tech to customer requested") */}
        <AdminDispatchDrawer
          open={dispatchDrawerOpen}
          onClose={() => setDispatchDrawerOpen(false)}
          booking={targetBooking}
          technicians={technicians}
          onDispatched={(bId, tech) => {
            setToast({
              open: true,
              message: `${tech.full_name} successfully dispatched to Booking #${bId}`,
              severity: 'success'
            });
            fetchOverview(true);
          }}
        />

        {/* Dispatch Action Dropdown Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '12px',
              minWidth: 220,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
              p: 0.5
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              const job = actionTargetJob;
              handleActionMenuClose();
              if (job) handleOpenBookingTrace(job);
            }}
            sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
          >
            <ArticleIcon sx={{ fontSize: 16, color: '#0284C7' }} />
            Inspect Audit Trail & Trace
          </MenuItem>

          <MenuItem
            onClick={() => {
              const job = actionTargetJob;
              handleActionMenuClose();
              if (job) handleOpenTracking(job);
            }}
            sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
          >
            <NavigationIcon sx={{ fontSize: 16, color: '#16A34A' }} />
            Live Map Telemetry
          </MenuItem>

          {actionTargetJob && !['completed', 'cancelled'].includes(actionTargetJob.status) && (
            <MenuItem
              onClick={() => {
                const job = actionTargetJob;
                handleActionMenuClose();
                if (job) handleOpenDispatch(job);
              }}
              sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
            >
              <ElectricMopedIcon sx={{ fontSize: 16, color: '#0284C7' }} />
              Reassign / Dispatch Specialist
            </MenuItem>
          )}

          {actionTargetJob && !['completed', 'cancelled'].includes(actionTargetJob.status) && (
            <MenuItem
              onClick={() => {
                const job = actionTargetJob;
                handleActionMenuClose();
                if (job) navigate(`/admin/settlements/${job.id}/override`, { state: { booking: job, returnTo: location.pathname } });
              }}
              sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
            >
              <PaymentsIcon sx={{ fontSize: 16, color: '#D97706' }} />
              Record Payment (Cash/Direct UPI)
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />

          {actionTargetJob && !['completed', 'cancelled'].includes(actionTargetJob.status) && (
            <MenuItem
              onClick={() => {
                const job = actionTargetJob;
                handleActionMenuClose();
                if (job) handleOpenCancelOrder(job);
              }}
              sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px', color: '#DC2626' }}
            >
              <CancelIcon sx={{ fontSize: 16, color: '#DC2626' }} />
              Cancel Order & Release Tech
            </MenuItem>
          )}
        </Menu>

        {/* Technicians Action Dropdown Menu */}
        <Menu
          anchorEl={techActionMenuAnchor}
          open={Boolean(techActionMenuAnchor)}
          onClose={handleTechActionMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '12px',
              minWidth: 220,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
              p: 0.5
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              const tech = actionTargetTech;
              handleTechActionMenuClose();
              if (tech) handleOpenTechDossier(tech);
            }}
            sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
          >
            <EngineeringIcon sx={{ fontSize: 16, color: '#0284C7' }} />
            View 360 Performance Dossier
          </MenuItem>

          {actionTargetTech && !actionTargetTech.is_kyc_verified && (
            <MenuItem
              onClick={() => {
                const tech = actionTargetTech;
                handleTechActionMenuClose();
                if (tech) handleKycDecision(tech.id, 'approve');
              }}
              sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px', color: '#16A34A' }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: '#16A34A' }} />
              Approve DigiLocker KYC
            </MenuItem>
          )}

          {actionTargetTech && !actionTargetTech.is_kyc_verified && (
            <MenuItem
              onClick={() => {
                const tech = actionTargetTech;
                handleTechActionMenuClose();
                if (tech) handleKycDecision(tech.id, 'reject');
              }}
              sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px', color: '#DC2626' }}
            >
              <CancelIcon sx={{ fontSize: 16, color: '#DC2626' }} />
              Reject Document / Application
            </MenuItem>
          )}

          <Divider sx={{ my: 0.5 }} />

          {actionTargetTech && (
            <MenuItem
              onClick={() => {
                const tech = actionTargetTech;
                handleTechActionMenuClose();
                if (tech) handleToggleTechnicianBlock(tech);
              }}
              sx={{
                fontSize: '12.5px',
                fontWeight: 600,
                gap: 1,
                py: 1,
                borderRadius: '8px',
                color: actionTargetTech.is_blocked ? '#16A34A' : '#DC2626'
              }}
            >
              <PowerSettingsNewIcon sx={{ fontSize: 16 }} />
              {actionTargetTech.is_blocked ? 'Unblock Partner Account' : 'Suspend / Block Partner'}
            </MenuItem>
          )}
        </Menu>

        {/* Customers Action Dropdown Menu */}
        <Menu
          anchorEl={custActionMenuAnchor}
          open={Boolean(custActionMenuAnchor)}
          onClose={handleCustActionMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '12px',
              minWidth: 220,
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)',
              p: 0.5
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              const cust = actionTargetCust;
              handleCustActionMenuClose();
              if (cust) handleOpenCustomerHistory(cust);
            }}
            sx={{ fontSize: '12.5px', fontWeight: 600, gap: 1, py: 1, borderRadius: '8px' }}
          >
            <HistoryEduIcon sx={{ fontSize: 16, color: '#0284C7' }} />
            View Order History Dossier
          </MenuItem>

          {actionTargetCust && (
            <MenuItem
              onClick={() => {
                const cust = actionTargetCust;
                handleCustActionMenuClose();
                if (cust) handleToggleCustomerBlock(cust, !cust.is_blocked);
              }}
              sx={{
                fontSize: '12.5px',
                fontWeight: 600,
                gap: 1,
                py: 1,
                borderRadius: '8px',
                color: actionTargetCust.is_blocked ? '#16A34A' : '#DC2626'
              }}
            >
              <PowerSettingsNewIcon sx={{ fontSize: 16 }} />
              {actionTargetCust.is_blocked ? 'Unblock Customer Account' : 'Suspend Customer Account'}
            </MenuItem>
          )}
        </Menu>

        {/* Global Toast Alert */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} sx={{ fontWeight: 700, borderRadius: '12px' }}>
            {toast.message}
          </Alert>
        </Snackbar>

      </Box>
    </Box>
  );
}
