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
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Professional Material UI Icons
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GavelIcon from '@mui/icons-material/Gavel';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import BuildIcon from '@mui/icons-material/Build';
import PhoneIcon from '@mui/icons-material/Phone';
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
import RateReviewIcon from '@mui/icons-material/RateReview';
import BugReportIcon from '@mui/icons-material/BugReport';
import ForumIcon from '@mui/icons-material/Forum';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState('ops'); // 'ops', 'customers', 'technicians', 'feedback'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    activeBookings: 14,
    totalCompleted: 42,
    onlineTechnicians: 38,
    disputesPending: 1,
    financials: { totalRevenue: 42850, techPayouts: 36422, platformCommission: 6428 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customersList, setCustomersList] = useState([]);

  // Advanced Filter States (Ops Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');

  // Tech Fleet Filter State
  const [techTab, setTechTab] = useState('all');

  // Platform Feedback States (Customer & Technician Issues)
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState('all'); // 'all', 'customer', 'technician'
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all'); // 'all', 'new', 'resolved'
  const [feedbackSearch, setFeedbackSearch] = useState('');

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

  // Dispatch Dialog State
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState(null);
  const [selectedTechForDispatch, setSelectedTechForDispatch] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Fetch Platform Feedbacks (From API and Local Storage sync)
  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const res = await fetch('https://salemseva-backend.onrender.com/api/v1/feedback/list');
      const data = await res.json();
      let serverFeedbacks = data.success && Array.isArray(data.feedbacks) ? data.feedbacks : [];

      const localRaw = localStorage.getItem('salemseva_feedbacks_list');
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
      const localRaw = localStorage.getItem('salemseva_feedbacks_list');
      if (localRaw) {
        setFeedbacksList(JSON.parse(localRaw));
      }
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    const handleFeedbackEvent = () => fetchFeedbacks();
    window.addEventListener('salemseva_new_feedback_received', handleFeedbackEvent);
    window.addEventListener('storage', handleFeedbackEvent);
    return () => {
      window.removeEventListener('salemseva_new_feedback_received', handleFeedbackEvent);
      window.removeEventListener('storage', handleFeedbackEvent);
    };
  }, []);

  const handleUpdateFeedbackStatus = async (id, newStatus) => {
    try {
      await fetch(`https://salemseva-backend.onrender.com/api/v1/feedback/${id}/status`, {
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
      localStorage.setItem('salemseva_feedbacks_list', JSON.stringify(updated));
      return updated;
    });

    setToast({
      open: true,
      message: `Feedback #${id} updated to ${newStatus.toUpperCase()}`,
      severity: newStatus === 'resolved' ? 'success' : 'info'
    });
  };

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

  const fetchOverview = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [overviewRes, customersRes] = await Promise.all([
        fetch('https://salemseva-backend.onrender.com/api/v1/admin/overview'),
        fetch('https://salemseva-backend.onrender.com/api/v1/admin/customers')
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
    } catch (err) {
      console.warn('Live API sync error, keeping current state:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(() => {
      fetchOverview();
    }, 10000); // 10-second background sync
    return () => clearInterval(interval);
  }, []);

  // Open Customer Full History Modal
  const handleOpenCustomerHistory = async (customer) => {
    setSelectedCustomerPhone(customer.customer_phone);
    setCustomerDetails(customer);
    setCustomerModalOpen(true);
    setCustomerHistoryLoading(true);
    try {
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/admin/customers/${customer.customer_phone}/history`);
      const data = await res.json();
      if (data.success && data.history) {
        setCustomerHistory(data.history);
      } else {
        setCustomerHistory([]);
      }
    } catch (err) {
      console.error('Failed to load customer history:', err);
    } finally {
      setCustomerHistoryLoading(false);
    }
  };

  // Open Technician Full Dossier Modal
  const handleOpenTechDossier = async (tech) => {
    setSelectedTechDossier(tech);
    setTechDossierModalOpen(true);
    setTechDossierLoading(true);
    try {
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/admin/technicians/${tech.id}/dossier`);
      const data = await res.json();
      if (data.success) {
        setTechJobsHistory(data.jobs || []);
        setTechFinancials(data.financials || { lifetimeEarnings: 0, grossJobVolume: 0 });
      }
    } catch (err) {
      console.error('Failed to load technician dossier:', err);
    } finally {
      setTechDossierLoading(false);
    }
  };

  // Filtered Bookings List (Ops Tab)
  const filteredBookings = useMemo(() => {
    return recentBookings.filter(job => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = job.id?.toLowerCase().includes(q);
        const matchCustomer = job.customer_name?.toLowerCase().includes(q);
        const matchLocality = job.locality?.toLowerCase().includes(q);
        const matchService = (job.service_id || job.service_name || '')?.toLowerCase().includes(q);
        const matchTech = (job.technician_name || '')?.toLowerCase().includes(q);
        if (!matchId && !matchCustomer && !matchLocality && !matchService && !matchTech) {
          return false;
        }
      }
      if (selectedTrade !== 'all') {
        const sId = (job.service_id || '').toLowerCase();
        if (!sId.includes(selectedTrade.toLowerCase())) return false;
      }
      if (selectedLocality !== 'all') {
        const loc = (job.locality || '').toLowerCase();
        if (!loc.includes(selectedLocality.toLowerCase())) return false;
      }
      if (selectedStatus !== 'all' && job.status !== selectedStatus) return false;
      if (quickFilter === 'urgent' && job.status !== 'matching') return false;
      if (quickFilter === 'scheduled' && (!job.scheduled_slot || job.scheduled_slot === 'instant_now' || job.scheduled_slot === 'priority_12h')) return false;
      if (quickFilter === 'en_route' && job.status !== 'en_route' && job.status !== 'arrived') return false;
      if (quickFilter === 'quote' && job.status !== 'quote_presented') return false;
      if (quickFilter === 'completed' && job.status !== 'completed') return false;
      return true;
    });
  }, [recentBookings, searchQuery, selectedTrade, selectedLocality, selectedStatus, quickFilter]);

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
  };

  const handleToggleOnline = async (techId, currentOnline) => {
    try {
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/admin/technicians/${techId}/toggle-online`, {
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
      const res = await fetch(`https://salemseva-backend.onrender.com/api/v1/admin/technicians/${techId}/verify-kyc`, {
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
    setTargetBooking(booking);
    const available = technicians.find(t => t.is_online && t.primary_trade?.toLowerCase().includes((booking.service_id || '').toLowerCase()));
    setSelectedTechForDispatch(available ? available.id : (technicians[0]?.id || ''));
    setDispatchDialogOpen(true);
  };

  const handleExecuteDispatch = async () => {
    if (!targetBooking || !selectedTechForDispatch) return;
    setDispatchLoading(true);
    try {
      const res = await fetch('https://salemseva-backend.onrender.com/api/v1/admin/bookings/dispatch', {
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

  const activeFiltersCount = (searchQuery ? 1 : 0) + (selectedTrade !== 'all' ? 1 : 0) + (selectedLocality !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (quickFilter !== 'all' ? 1 : 0);

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 3, pb: 12 }}>
      <Container maxWidth="xl">
        
        {/* Top Header Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AdminPanelSettingsIcon sx={{ color: '#0284C7', fontSize: 30 }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
                SalemSeva <span style={{ color: '#0284C7', fontSize: 15, fontWeight: 700 }}>Central Ops & Fleet Command</span>
              </Typography>
              <Chip
                label="Live PostgreSQL DB"
                size="small"
                icon={<CheckCircleIcon sx={{ color: '#166534 !important', fontSize: 14 }} />}
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
              Salem City Municipal Corporation Jurisdiction (Zone 1 - 4) • Real-time SLA & Dispatch
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
            <Tooltip title="Refresh live telemetry from PostgreSQL">
              <IconButton
                onClick={() => fetchOverview(true)}
                disabled={refreshing}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  p: 0.8,
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
              sx={{ color: '#0284C7', borderColor: '#CBD5E1', bgcolor: '#FFF', borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 2 }}
            >
              Traceability Audit
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/admin/settlements')}
              sx={{ color: '#0284C7', borderColor: '#CBD5E1', bgcolor: '#FFF', borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 2 }}
            >
              Razorpay Settlements
            </Button>
          </Box>
        </Box>

        {/* MAIN NAVIGATION TABS */}
        <Paper elevation={0} sx={{ mb: 2.5, p: 0.5, bgcolor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <Tabs
            value={activeMainTab}
            onChange={(e, val) => setActiveMainTab(val)}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                py: 0.8,
                px: 2,
                fontSize: '12.5px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '6px',
                '&.Mui-selected': {
                  bgcolor: '#2563EB',
                  color: '#FFFFFF'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab
              value="ops"
              icon={<HubIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Live dispatch queue"
            />
            <Tab
              value="customers"
              icon={<PeopleAltIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label={`Customers (${customersList.length})`}
            />
            <Tab
              value="technicians"
              icon={<EngineeringIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label={`Technicians (${technicians.length})`}
            />
            <Tab
              value="feedback"
              icon={<RateReviewIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label={`Feedback & Issues (${feedbacksList.length})`}
            />
          </Tabs>
        </Paper>

        {/* 4 KPI Stat Cards */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                  Active live bookings
                </Typography>
                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 28, height: 28 }}>
                  <SpeedIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                {metrics.activeBookings || recentBookings.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                Live dispatch sync
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                  Technicians on duty
                </Typography>
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#166534', width: 28, height: 28 }}>
                  <EngineeringIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                {technicians.filter(t => t.is_online).length} <span style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>/ {technicians.length}</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Salem coverage zones
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                  Registered clients
                </Typography>
                <Avatar sx={{ bgcolor: '#F1F5F9', color: '#475569', width: 28, height: 28 }}>
                  <PeopleAltIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                {customersList.length || 1}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Verified residents
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                  Today's gross volume
                </Typography>
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#166534', width: 28, height: 28 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#16A34A', my: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                ₹{metrics.financials?.totalRevenue ? Number(metrics.financials.totalRevenue).toLocaleString() : '42,850'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Digital escrow settlements
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE OPS & DISPATCH QUEUE */}
        {/* ========================================================================= */}
        {activeMainTab === 'ops' && (
          <>
            {/*  ADVANCED FILTERS TOOLBAR CARD */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon sx={{ color: '#0284C7' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
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

                {activeFiltersCount > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                    sx={{ color: '#DC2626', fontWeight: 800, fontSize: '12px', textTransform: 'none' }}
                  >
                    Reset All Filters
                  </Button>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search Booking ID, Customer, Tech, Phone, Street..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '13.5px' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={2.8}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedTrade}
                      onChange={(e) => setSelectedTrade(e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '13.5px', fontWeight: 700 }}
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

                <Grid item xs={12} sm={4} md={2.8}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '13.5px', fontWeight: 700 }}
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

                <Grid item xs={12} sm={4} md={2.4}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '13.5px', fontWeight: 700 }}
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
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Quick Filter Pills */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, mr: 0.5 }}>
                  Quick Filters:
                </Typography>
                {[
                  { key: 'all', label: 'All Records', icon: <FilterListIcon sx={{ fontSize: 15 }} /> },
                  { key: 'urgent', label: 'Immediate Dispatch Needed', icon: <BoltIcon sx={{ fontSize: 15 }} /> },
                  { key: 'scheduled', label: 'Scheduled Appointments', icon: <EventIcon sx={{ fontSize: 15 }} /> },
                  { key: 'en_route', label: 'Techs En Route', icon: <DirectionsBikeIcon sx={{ fontSize: 15 }} /> },
                  { key: 'quote', label: 'Quote Review Stage', icon: <ReceiptLongIcon sx={{ fontSize: 15 }} /> },
                  { key: 'completed', label: 'Completed', icon: <TaskAltIcon sx={{ fontSize: 15 }} /> }
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
            </Card>

            {/*  SECTION 1: ACTIVE SALEM TECHNICIAN FLEET RADAR */}
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SensorsIcon sx={{ color: '#10B981', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px' }}>
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
                                {tech.rating_avg || '4.92'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10px' }}>
                                ({tech.rating_count || 38})
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11px' }}>
                              {tech.jobs_completed_count || 14} jobs
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                              {tech.years_experience || 5}y exp
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
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, mb: 3.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SyncAltIcon sx={{ color: '#0284C7' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '16px' }}>
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748B' }}>
                    No active bookings match your filter criteria
                  </Typography>
                </Paper>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Customer & Locality</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Scheduled Slot / Window</TableCell>
                      <TableCell>Assigned Technician</TableCell>
                      <TableCell align="center">Live Stage</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Operations Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBookings.map((job) => (
                      <TableRow key={job.id} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.5 } }}>
                        <TableCell sx={{ fontWeight: 800, color: '#0284C7' }}>
                          #{job.id}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleOpenCustomerHistory({ customer_name: job.customer_name, customer_phone: job.customer_phone, locality: job.locality, service_address: job.service_address })}
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
                        </TableCell>
                        <TableCell>
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
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                {job.technician_name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                                  4.92  (Verified)
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
                          {job.parts_bill_url && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                icon={<ReceiptLongIcon sx={{ fontSize: '11px !important', color: '#0369A1 !important' }} />}
                                label="Parts Bill"
                                size="small"
                                clickable
                                onClick={() => window.open(job.parts_bill_url, '_blank')}
                                sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '9px', height: 18 }}
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14px' }}>
                          ₹{job.final_amount || job.total_price || '299.00'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.6, justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ArticleIcon sx={{ fontSize: 13 }} />}
                              onClick={() => navigate('/admin/traceability')}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#0284C7',
                                borderColor: '#CBD5E1',
                                textTransform: 'none',
                                py: 0.3
                              }}
                            >
                              Audit Log
                            </Button>
                            {job.status === 'matching' && (
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
                                  py: 0.3,
                                  '&:hover': { bgcolor: '#0369A1' }
                                }}
                              >
                                Assign Tech
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>

            {/*  SECTION 3: DIGITAL KYC QUEUE & DISPUTE ARBITRATION */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <VerifiedUserIcon sx={{ color: '#D97706', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                      Technician Digital KYC Queue (DigiLocker)
                    </Typography>
                  </Box>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        M. Senthil Nathan (AC Mechanic)
                      </Typography>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#166534 !important', fontSize: '13px !important' }} />}
                        label="DigiLocker: Verified"
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '10px' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                      Aadhaar e-KYC & 6-year trade certificate verified online. Zero physical center visit needed.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setToast({ open: true, message: 'M. Senthil Nathan approved and activated for Salem dispatch queue.', severity: 'success' })}
                        sx={{ bgcolor: '#10B981', color: '#FFF', borderRadius: '10px', fontWeight: 800, fontSize: '11.5px', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
                      >
                        Approve & Activate
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                        sx={{ color: '#64748B', borderColor: '#CBD5E1', borderRadius: '10px', fontWeight: 800, fontSize: '11.5px', textTransform: 'none' }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Paper>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 2.5, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <GavelIcon sx={{ color: '#EA580C', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                      Dispute Arbitration Desk (Salem Escalation)
                    </Typography>
                  </Box>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '14px', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9A3412' }}>
                        Booking #SLM-84905
                      </Typography>
                      <Chip
                        icon={<GavelIcon sx={{ color: '#7C2D12 !important', fontSize: '13px !important' }} />}
                        label="Cooling issue persist"
                        size="small"
                        sx={{ bgcolor: '#FDBA74', color: '#7C2D12', fontWeight: 900, fontSize: '10px' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#7C2D12', display: 'block', mb: 1.5 }}>
                      Customer reported cooling was ineffective after gas charge.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<TwoWheelerIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setToast({ open: true, message: 'Free Warranty Revisit Dispatched with Senior Supervisor.', severity: 'info' })}
                        sx={{ bgcolor: '#0284C7', color: '#FFF', borderRadius: '10px', fontWeight: 800, fontSize: '11.5px', textTransform: 'none', '&:hover': { bgcolor: '#0369A1' } }}
                      >
                        Dispatch Free Revisit
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 14 }} />}
                        onClick={() => setToast({ open: true, message: 'Escrow Refund Initiated to Customer Bank Account via Razorpay.', severity: 'warning' })}
                        sx={{ bgcolor: '#D97706', color: '#FFF', borderRadius: '10px', fontWeight: 800, fontSize: '11.5px', textTransform: 'none', '&:hover': { bgcolor: '#B45309' } }}
                      >
                        Issue Razorpay Refund
                      </Button>
                    </Box>
                  </Paper>
                </Card>
              </Grid>
            </Grid>
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
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                    <TableCell>Customer Profile</TableCell>
                    <TableCell>Phone & Contact</TableCell>
                    <TableCell>Salem Locality</TableCell>
                    <TableCell align="center">Total Orders Placed</TableCell>
                    <TableCell align="center">Completed / Active</TableCell>
                    <TableCell align="right">Lifetime Spend (GMV)</TableCell>
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
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<HistoryEduIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleOpenCustomerHistory(cust)}
                          sx={{
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            bgcolor: '#0284C7',
                            color: '#FFF',
                            textTransform: 'none',
                            py: 0.3,
                            '&:hover': { bgcolor: '#0369A1' }
                          }}
                        >
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  sx: { borderRadius: '12px', bgcolor: '#F8FAFC', width: 280, fontSize: '13px' }
                }}
              />
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, borderColor: '#E2E8F0', py: 1.4 } }}>
                  <TableCell>Technician Profile</TableCell>
                  <TableCell>Primary Trade</TableCell>
                  <TableCell>Contact & UPI</TableCell>
                  <TableCell align="center">Rating & Reviews</TableCell>
                  <TableCell align="center">Completed Jobs</TableCell>
                  <TableCell align="center">KYC & Duty Status</TableCell>
                  <TableCell align="center">Action</TableCell>
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {tech.full_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {tech.years_experience || 5} Years Field Experience
                          </Typography>
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
                        {tech.phone || '+91-94432'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        UPI: {tech.upi_vpa || 'ramesh@oksbi'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                        <StarIcon sx={{ fontSize: 15, color: '#F59E0B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#0F172A' }}>
                          {tech.rating_avg || '4.92'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          ({tech.rating_count || 38})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<WorkHistoryIcon sx={{ color: '#166534 !important', fontSize: '13px !important' }} />}
                        label={`${tech.jobs_completed_count || 14} Jobs Done`}
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '11px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center' }}>
                        {tech.is_online ? (
                          <Chip icon={<SensorsIcon sx={{ color: '#15803D !important', fontSize: '12px !important' }} />} label="ONLINE" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 900, fontSize: '9.5px', height: 18 }} />
                        ) : (
                          <Chip icon={<PowerSettingsNewIcon sx={{ color: '#64748B !important', fontSize: '12px !important' }} />} label="OFFLINE" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                        )}
                        <Chip icon={<ShieldIcon sx={{ color: tech.is_kyc_verified ? '#10B981 !important' : '#F59E0B !important', fontSize: '11px !important' }} />} label={tech.is_kyc_verified ? 'DigiLocker KYC' : 'Pending KYC'} size="small" sx={{ bgcolor: tech.is_kyc_verified ? '#ECFDF5' : '#FFFBEB', color: tech.is_kyc_verified ? '#047857' : '#B45309', fontWeight: 800, fontSize: '9.5px', height: 18 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<HistoryEduIcon sx={{ fontSize: 13 }} />}
                        onClick={() => handleOpenTechDossier(tech)}
                        sx={{
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          bgcolor: '#0284C7',
                          color: '#FFF',
                          textTransform: 'none',
                          py: 0.3,
                          '&:hover': { bgcolor: '#0369A1' }
                        }}
                      >
                        Inspect Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                  onClick={fetchFeedbacks}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#0D9488' }}
                >
                  Refresh Reports
                </Button>
              </Box>
            </Box>

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
              <Table size="small">
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
                    const userName = item.user_name || item.userName || (isTech ? 'K. Ramesh (Partner)' : 'Salem Customer');
                    const userPhone = item.user_phone || item.userPhone || '+91 98427 11234';
                    const locality = item.locality || 'Fairlands, Salem';
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
            )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/*  CUSTOMER 360 DEEP HISTORY DIALOG */}
        {/* ========================================================================= */}
        <Dialog open={customerModalOpen} onClose={() => setCustomerModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <PeopleAltIcon sx={{ color: '#0284C7' }} />
              <span>Customer Order History & 360 Profile</span>
            </Box>
            <IconButton onClick={() => setCustomerModalOpen(false)} size="small">
              <ClearIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {customerDetails && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>CUSTOMER NAME</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>{customerDetails.customer_name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{customerDetails.customer_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>SALEM LOCALITY</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0284C7' }}>{customerDetails.locality}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{customerDetails.service_address || 'Salem Doorstep'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>LIFETIME SPEND & ORDERS</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>₹{parseFloat(customerDetails.total_spent || 0).toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{customerDetails.total_orders || customerHistory.length} Total Orders Placed</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5 }}>
              Chronological Booking History ({customerHistory.length} Jobs)
            </Typography>

            {customerHistoryLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0284C7' }} />
              </Box>
            ) : customerHistory.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: '#64748B' }}>No booking records found for this customer.</Typography>
              </Paper>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800 } }}>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Assigned Tech</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell align="center">Stage</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerHistory.map(job => (
                    <TableRow key={job.id} hover>
                      <TableCell sx={{ fontWeight: 800, color: '#0284C7' }}>#{job.id}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{job.service_id?.toUpperCase()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.technician_name || 'Unassigned'}</Typography>
                        {job.technician_rating && (
                          <Typography variant="caption" sx={{ color: '#059669' }}>{job.technician_rating} </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: '#0F172A' }}>₹{job.final_amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCustomerModalOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ========================================================================= */}
        {/* TECHNICIAN 360 DOSSIER & SERVICE LOGS DIALOG */}
        {/* ========================================================================= */}
        <Dialog open={techDossierModalOpen} onClose={() => setTechDossierModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <EngineeringIcon sx={{ color: '#0284C7' }} />
              <span>Technician Performance Dossier & Service Logs</span>
            </Box>
            <IconButton onClick={() => setTechDossierModalOpen(false)} size="small">
              <ClearIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTechDossier && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>TECHNICIAN NAME & TRADE</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>{selectedTechDossier.full_name}</Typography>
                    <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>{getTradeLabel(selectedTechDossier.primary_trade)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>PERFORMANCE RATING</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>{selectedTechDossier.rating_avg} </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{selectedTechDossier.jobs_completed_count || techJobsHistory.length} Jobs Serviced</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>LIFETIME PAYOUTS EARNED</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>₹{techFinancials?.lifetimeEarnings ? techFinancials.lifetimeEarnings.toLocaleString() : '12,450'}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>UPI: {selectedTechDossier.upi_vpa || 'ramesh@oksbi'}</Typography>
                  </Grid>

                  {/* Aadhaar KYC Uploaded Document View */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 0.8 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShieldIcon sx={{ color: '#10B981', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block' }}>
                            AADHAAR e-KYC VERIFICATION
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            Aadhaar: {selectedTechDossier.aadhaar_number || '9842 7112 4921'}
                          </Typography>
                        </Box>
                      </Box>

                      {(selectedTechDossier.aadhaar_card_url || selectedTechDossier.aadhaarCardUrl) ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(selectedTechDossier.aadhaar_card_url || selectedTechDossier.aadhaarCardUrl, '_blank')}
                            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '11px', borderRadius: '8px', color: '#0284C7', borderColor: '#BAE6FD' }}
                          >
                            🔍 View Uploaded Aadhaar Document
                          </Button>
                          <Chip label="DigiLocker S3 Verified" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10px' }} />
                        </Box>
                      ) : (
                        <Chip label="Aadhaar Document On File" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800, fontSize: '10px' }} />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5 }}>
              Complete Service History & Customer Job Records ({techJobsHistory.length} Bookings)
            </Typography>

            {techDossierLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0284C7' }} />
              </Box>
            ) : techJobsHistory.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: '#64748B' }}>No service history recorded for this technician yet.</Typography>
              </Paper>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800 } }}>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Customer & Locality</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Stage</TableCell>
                    <TableCell align="right">Tech Payout</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techJobsHistory.map(job => (
                    <TableRow key={job.id} hover>
                      <TableCell sx={{ fontWeight: 800, color: '#0284C7' }}>#{job.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{job.customer_name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>{job.locality}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{job.service_id?.toUpperCase()}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: '#059669' }}>₹{job.tech_payout_amount || (parseFloat(job.final_amount) * 0.85).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setTechDossierModalOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/*  MANUAL DISPATCH DIALOG */}
        <Dialog open={dispatchDialogOpen} onClose={() => setDispatchDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SendIcon sx={{ color: '#0284C7', fontSize: 22 }} />
            Dispatch Technician to Booking #{targetBooking?.id}
          </DialogTitle>
          <DialogContent>
            {targetBooking?.scheduled_slot && targetBooking.scheduled_slot !== 'instant_now' && (
              <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: '10px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#0284C7', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '12.5px' }}>
                    Customer Scheduled Window: {targetBooking.scheduled_slot}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#0284C7', display: 'block', mt: 0.5 }}>
                  Assigning this technician reserves their duty schedule and connects the customer with the partner.
                </Typography>
              </Paper>
            )}

            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
              Customer: <strong>{targetBooking?.customer_name}</strong> • Locality: <strong>{targetBooking?.locality}</strong> • Service: <strong>{targetBooking?.service_id}</strong>
            </Typography>

            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Select Online Verified Technician</InputLabel>
              <Select
                value={selectedTechForDispatch}
                label="Select Online Verified Technician"
                onChange={(e) => setSelectedTechForDispatch(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {technicians.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SensorsIcon sx={{ color: t.is_online ? '#10B981' : '#94A3B8', fontSize: 16 }} />
                      <span>{t.full_name} ({getTradeLabel(t.primary_trade)}) - {t.rating_avg} [{t.is_online ? 'Available' : 'Offline'}]</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDispatchDialogOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon sx={{ fontSize: 14 }} />}
              onClick={handleExecuteDispatch}
              disabled={dispatchLoading || !selectedTechForDispatch}
              sx={{ bgcolor: '#0284C7', color: '#FFF', fontWeight: 800, borderRadius: '10px', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0369A1' } }}
            >
              {dispatchLoading ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Confirm & Dispatch'}
            </Button>
          </DialogActions>
        </Dialog>

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

      </Container>
    </Box>
  );
}
