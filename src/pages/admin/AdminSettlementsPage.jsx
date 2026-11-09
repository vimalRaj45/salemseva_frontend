import { API_V1_URL, PARTNER_PAYOUT_PERCENT, PARTNER_COMMISSION_PERCENT } from '../../config';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Filter,
  CreditCard,
  TrendingUp,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Coins,
  RotateCcw,
  Users,
  CheckCircle2,
  QrCode,
  Eye,
  Check,
  X,
  MessageSquare,
  Phone,
  Edit,
  Send,
  Copy,
  ExternalLink,
  Award
} from 'lucide-react';
import { PageHeader, DataTable, KpiCard, StatusPill } from '../../components/ui';
import { StatusChip } from '../../components/common';

const SALEM_LOCALITIES = [
  'All Salem Regions',
  'Fairlands',
  'Hasthampatti',
  'Suramangalam / Junction',
  'Ammapet',
  'Shevapet',
  'Meyyanur',
  'Alagapuram',
  'Gugai',
  'Kondalampatti',
  'Kannankurichi',
  'Gorimedu',
  'Steel Plant Area'
];

export default function AdminSettlementsPage() {
  const navigate = useNavigate();

  // Filter States
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All Salem Regions');
  const [selectedService, setSelectedService] = useState('all');

  // Data States
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State:
  // 0 = Technician Job Payouts (On-Demand / Any Time)
  // 1 = Cancellation Refunds (Customer Returns, 0% Gateway Fee)
  // 2 = Referral Incentives (Partner Bonus Payouts)
  // 3 = UPI QR Verifications (Customer Payment Slips)
  // 4 = Master Cash Flow Ledger
  const [activeTab, setActiveTab] = useState(0);

  // Dynamic QR Verifications
  const [qrVerifications, setQrVerifications] = useState([]);
  const [loadingQr, setLoadingQr] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectModalPayment, setRejectModalPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Manual Technician UTR and WhatsApp / SMS States
  const [selectedUtrModalTx, setSelectedUtrModalTx] = useState(null);
  const [manualUtrInput, setManualUtrInput] = useState('');
  const [manualUtrNotes, setManualUtrNotes] = useState('');
  const [isSavingUtr, setIsSavingUtr] = useState(false);

  // Batch Technician Settlement State
  const [selectedBatchTech, setSelectedBatchTech] = useState(null);
  const [batchUtrInput, setBatchUtrInput] = useState('');
  const [batchNotesInput, setBatchNotesInput] = useState('');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Customer Cancellation Refunds State
  const [refundsList, setRefundsList] = useState([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [selectedRefundModal, setSelectedRefundModal] = useState(null);
  const [refundUtrInput, setRefundUtrInput] = useState('');
  const [refundNotesInput, setRefundNotesInput] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Technician Referral Incentives State
  const [referralsList, setReferralsList] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [selectedReferralModal, setSelectedReferralModal] = useState(null);
  const [referralUtrInput, setReferralUtrInput] = useState('');
  const [referralNotesInput, setReferralNotesInput] = useState('');
  const [isProcessingReferral, setIsProcessingReferral] = useState(false);

  const handleCopyText = (text, label = 'Information') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const generateTechPayoutMessage = (tx, manualUtr) => {
    const utr = manualUtr || tx.payoutUtr || 'PROCESSED_VIA_UPI';
    const techName = tx.technicianName || 'Partner';
    const bookingId = tx.bookingId || '';
    const amount = (tx.techPayout || 0).toFixed(2);
    const service = tx.technicianTrade ? tx.technicianTrade.toUpperCase() : 'HOME SERVICE';
    const locality = tx.locality || 'Salem';
    const dateStr = new Date(tx.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      `Vanakkam ${techName}!\n` +
      `Shazu One Salem service payment has been disbursed to your account.\n\n` +
      `[SERVICE SETTLEMENT DETAILS]\n` +
      `- Booking ID: #${bookingId}\n` +
      `- Service: ${service}\n` +
      `- Locality: ${locality}\n` +
      `- Disbursed Amount: INR ${amount}\n` +
      `- Transaction ID / UTR: ${utr}\n` +
      `- Date: ${dateStr}\n\n` +
      `Amount successfully credited to your account. Thank you.\n` +
      `- Shazu One Central Accounts, Salem`
    );
  };

  const generateCustomerRefundMessage = (refund, refundUtr) => {
    const utr = refundUtr || refund.refundUtr || 'PROCESSED_VIA_UPI';
    const custName = refund.customerName || 'Customer';
    const bookingId = refund.bookingId || '';
    const amount = (refund.refundAmount || 0).toFixed(2);
    const dateStr = new Date(refund.refundedAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      `Vanakkam ${custName}!\n` +
      `Your refund for Shazu One Salem Booking #${bookingId} has been successfully processed.\n\n` +
      `[REFUND TRANSACTION DETAILS]\n` +
      `- Booking ID: #${bookingId}\n` +
      `- Refunded Amount: INR ${amount}\n` +
      `- Transaction ID / UTR: ${utr}\n` +
      `- Date: ${dateStr}\n\n` +
      `The amount has been credited to your UPI / bank account with 0% payment gateway charge. Thank you.\n` +
      `- Shazu One Central Operations Desk, Salem`
    );
  };

  const generateReferralRewardMessage = (item, incentiveUtr) => {
    const utr = incentiveUtr || 'PROCESSED_VIA_UPI';
    const referrerName = item.referrerName || 'Partner';
    const refereeName = item.refereeName || 'specialist';
    const amount = (item.incentiveAmount || 100).toFixed(2);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      `Vanakkam ${referrerName}!\n` +
      `Your partner referral incentive bonus has been disbursed.\n\n` +
      `[REFERRAL INCENTIVE DETAILS]\n` +
      `- Referred Specialist: ${refereeName}\n` +
      `- Milestone: First Verified Job Completed\n` +
      `- Bonus Amount: INR ${amount}\n` +
      `- Transaction ID / UTR: ${utr}\n` +
      `- Date: ${dateStr}\n\n` +
      `Thank you for helping grow Shazu One verified partner fleet in Salem!\n` +
      `- Shazu One Partner Operations Desk`
    );
  };

  const handleOpenUtrModal = (tx) => {
    setSelectedUtrModalTx(tx);
    setManualUtrInput(tx.payoutUtr || '');
    setManualUtrNotes('');
  };

  const handleSendWhatsApp = (tx, customUtr) => {
    const cleanDigits = String(tx.technicianPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanDigits) {
      toast.error('Technician phone number is not available for this record');
      return;
    }
    const msg = generateTechPayoutMessage(tx, customUtr);
    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=91${cleanDigits}&text=${encoded}`, '_blank');
  };

  const handleSendCustomerRefundWhatsApp = (refund, customUtr) => {
    const cleanDigits = String(refund.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanDigits) {
      toast.error('Customer phone number is not available for this refund');
      return;
    }
    const msg = generateCustomerRefundMessage(refund, customUtr);
    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=91${cleanDigits}&text=${encoded}`, '_blank');
  };

  const handleSendReferralWhatsApp = (item, customUtr) => {
    const cleanDigits = String(item.referrerPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanDigits) {
      toast.error('Referring technician phone number is not available');
      return;
    }
    const msg = generateReferralRewardMessage(item, customUtr);
    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=91${cleanDigits}&text=${encoded}`, '_blank');
  };

  const handleSendSms = (tx, customUtr) => {
    const cleanDigits = String(tx.technicianPhone || '').replace(/\D/g, '').slice(-10);
    if (!cleanDigits) {
      toast.error('Technician phone number is not available for this record');
      return;
    }
    const msg = generateTechPayoutMessage(tx, customUtr);
    const encoded = encodeURIComponent(msg);
    window.open(`sms:+91${cleanDigits}?body=${encoded}`, '_self');
  };

  const handleSaveManualUtr = async (channelAfter = null) => {
    if (!selectedUtrModalTx) return;
    if (!manualUtrInput.trim()) {
      toast.error('Please enter a valid Transaction ID / Bank UTR');
      return;
    }

    try {
      setIsSavingUtr(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/${selectedUtrModalTx.bookingId}/manual-payout-utr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: manualUtrInput.trim(),
          notes: manualUtrNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Transaction ID recorded for #${selectedUtrModalTx.bookingId}`);
        // Update local ledger transaction row
        setFinancialData(prev => {
          if (!prev || !Array.isArray(prev.transactions)) return prev;
          return {
            ...prev,
            transactions: prev.transactions.map(t =>
              t.bookingId === selectedUtrModalTx.bookingId
                ? { ...t, payoutUtr: manualUtrInput.trim(), status: 'SETTLED' }
                : t
            )
          };
        });

        if (channelAfter === 'whatsapp') {
          handleSendWhatsApp(selectedUtrModalTx, manualUtrInput.trim());
        } else if (channelAfter === 'sms') {
          handleSendSms(selectedUtrModalTx, manualUtrInput.trim());
        }

        setSelectedUtrModalTx(null);
      } else {
        toast.error(data.error || 'Failed to record Transaction ID');
      }
    } catch (err) {
      console.warn('Save UTR error:', err);
      toast.error('Network error saving Transaction ID');
    } finally {
      setIsSavingUtr(false);
    }
  };

  // Fetch QR Verifications
  const fetchQrVerifications = async () => {
    try {
      setLoadingQr(true);
      const res = await fetch(`${API_V1_URL}/admin/payments/pending-verifications`);
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setQrVerifications(data.payments);
      }
    } catch (e) {
      console.warn('QR verifications fetch:', e);
    } finally {
      setLoadingQr(false);
    }
  };

  // Fetch Cancellation Refunds
  const fetchCancellationRefunds = async () => {
    try {
      setLoadingRefunds(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/cancellation-refunds`);
      const data = await res.json();
      if (data.success && Array.isArray(data.refunds)) {
        setRefundsList(data.refunds);
      }
    } catch (e) {
      console.warn('Refunds fetch error:', e);
    } finally {
      setLoadingRefunds(false);
    }
  };

  // Fetch Referral Incentives
  const fetchReferralIncentives = async () => {
    try {
      setLoadingReferrals(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/referral-incentives`);
      const data = await res.json();
      if (data.success && Array.isArray(data.incentives)) {
        setReferralsList(data.incentives);
      }
    } catch (e) {
      console.warn('Referrals fetch error:', e);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    fetchQrVerifications();
    fetchCancellationRefunds();
    fetchReferralIncentives();
  }, []);

  const handleProcessRefundSubmit = async (channelAfter = null) => {
    if (!selectedRefundModal || !refundUtrInput.trim()) {
      toast.error('Please enter the refund transaction UTR / Reference');
      return;
    }
    try {
      setIsProcessingRefund(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/${selectedRefundModal.bookingId}/process-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundUtr: refundUtrInput.trim(),
          refundNotes: refundNotesInput.trim(),
          refundAmount: selectedRefundModal.refundAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Refund of ₹${selectedRefundModal.refundAmount} recorded for #${selectedRefundModal.bookingId}`);
        setRefundsList(prev => prev.map(r => r.bookingId === selectedRefundModal.bookingId ? { ...r, refundStatus: 'REFUNDED', refundUtr: refundUtrInput.trim(), refundedAt: new Date().toISOString() } : r));
        fetchLedger();
        if (channelAfter === 'whatsapp') {
          handleSendCustomerRefundWhatsApp(selectedRefundModal, refundUtrInput.trim());
        }
        setSelectedRefundModal(null);
        setRefundUtrInput('');
        setRefundNotesInput('');
      } else {
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (err) {
      toast.error('Network error processing refund');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleDisburseReferralSubmit = async (channelAfter = null) => {
    if (!selectedReferralModal || !referralUtrInput.trim()) {
      toast.error('Please enter the referral bonus transfer UTR');
      return;
    }
    try {
      setIsProcessingReferral(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/referrals/${selectedReferralModal.refereeId}/disburse-incentive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: referralUtrInput.trim(),
          notes: referralNotesInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Referral incentive of ₹${selectedReferralModal.incentiveAmount} recorded!`);
        setReferralsList(prev => prev.map(item => item.refereeId === selectedReferralModal.refereeId ? { ...item, isPaid: true, status: 'PAID' } : item));
        if (channelAfter === 'whatsapp') {
          handleSendReferralWhatsApp(selectedReferralModal, referralUtrInput.trim());
        }
        setSelectedReferralModal(null);
        setReferralUtrInput('');
        setReferralNotesInput('');
      } else {
        toast.error(data.error || 'Failed to record referral incentive');
      }
    } catch (err) {
      toast.error('Network error disbursing referral incentive');
    } finally {
      setIsProcessingReferral(false);
    }
  };

  const handleBatchPayoutSubmit = async () => {
    if (!selectedBatchTech || !batchUtrInput.trim()) {
      toast.error('Please enter the bank transfer UTR');
      return;
    }
    try {
      setIsProcessingBatch(true);
      const res = await fetch(`${API_V1_URL}/admin/settlements/batch-payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: selectedBatchTech.techId,
          bookingIds: selectedBatchTech.bookingIds,
          utr: batchUtrInput.trim(),
          notes: batchNotesInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Settled ${selectedBatchTech.bookingIds.length} jobs for ${selectedBatchTech.techName}!`);
        fetchLedger();
        setSelectedBatchTech(null);
        setBatchUtrInput('');
        setBatchNotesInput('');
      } else {
        toast.error(data.error || 'Failed to process batch settlement');
      }
    } catch (err) {
      toast.error('Network error processing batch settlement');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch(`${API_V1_URL}/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'Salem Central Operations Desk' })
      });
      const data = await res.json();
      if (data.success) {
        setQrVerifications((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...p, verification_status: 'verified', status: 'escrow_held' } : p
          )
        );
        fetchLedger();
      }
    } catch (err) {
      console.warn('Verify payment error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectModalPayment) return;
    try {
      setIsProcessingAction(true);
      const res = await fetch(`${API_V1_URL}/admin/payments/${rejectModalPayment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectReason.trim() || 'Invalid UTR or screenshot does not match bank record',
          verifiedBy: 'Salem Central Operations Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        setQrVerifications((prev) =>
          prev.map((p) =>
            p.id === rejectModalPayment.id
              ? { ...p, verification_status: 'rejected', rejection_reason: rejectReason }
              : p
          )
        );
        setRejectModalPayment(null);
        setRejectReason('');
      }
    } catch (err) {
      console.warn('Reject payment error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Fetch End-to-End Financial Ledger
  function fetchLedger() {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedLocality !== 'All Salem Regions') {
      const cleanLoc = selectedLocality.split(' / ')[0].split(' (')[0];
      params.append('locality', cleanLoc);
    }
    if (selectedService !== 'all') {
      params.append('serviceId', selectedService);
    }
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    fetch(`${API_V1_URL}/admin/financials/ledger?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFinancialData(data.data || data);
        } else {
          setFinancialData(null);
        }
      })
      .catch((err) => {
        console.warn('Financial ledger fetch error:', err);
        setFinancialData(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedLocality, selectedService, startDate, endDate]);

  const handlePresetChange = (presetId) => {
    setDatePreset(presetId);
    const now = new Date();
    const toDateStr = (d) => d.toISOString().split('T')[0];

    if (presetId === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (presetId === 'today') {
      const todayStr = toDateStr(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (presetId === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = toDateStr(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (presetId === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
    } else if (presetId === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
    }
  };

  const summary = financialData?.summary || {
    totalGross: 0,
    totalRazorpayFee: 0,
    totalTechPayout: 0,
    totalPlatformCut: 0,
    totalCustomerRefunds: 0,
    totalTransactions: 0
  };

  const transactions = financialData?.transactions || [];
  const regionBreakdown = financialData?.regionBreakdown || [];

  // Stream filter inside Master Cash Flow Ledger: 'all' | 'payments' | 'refunds' | 'tech_payouts'
  const [ledgerStreamFilter, setLedgerStreamFilter] = useState('all');
  const [showTruncateConfirm, setShowTruncateConfirm] = useState(false);
  const [isTruncating, setIsTruncating] = useState(false);

  // Filtered lists for the 4 streams
  const paymentsList = useMemo(() => {
    return transactions.filter((t) => (t.grossAmount > 0 || t.status === 'SETTLED' || t.status === 'ESCROW_HELD') && !['REFUNDED', 'REFUND_PENDING', 'CANCELLED_UNPAID'].includes(t.status));
  }, [transactions]);

  const refundsOnlyList = useMemo(() => {
    return transactions.filter((t) => ['REFUNDED', 'REFUND_PENDING'].includes(t.status) || t.customerRefund > 0 || t.bookingStatus === 'cancelled');
  }, [transactions]);

  const techPayoutsList = useMemo(() => {
    return transactions.filter((t) => t.techPayout > 0 && t.technicianName && !t.technicianName.includes('Pre-Dispatch'));
  }, [transactions]);

  const displayedTransactions = useMemo(() => {
    if (ledgerStreamFilter === 'payments') return paymentsList;
    if (ledgerStreamFilter === 'refunds') return refundsOnlyList;
    if (ledgerStreamFilter === 'tech_payouts') return techPayoutsList;
    return transactions;
  }, [ledgerStreamFilter, transactions, paymentsList, refundsOnlyList, techPayoutsList]);

  // Handler to truncate all test data on demand
  const handleTruncateData = async () => {
    try {
      setIsTruncating(true);
      const res = await fetch(`${API_V1_URL}/admin/database/truncate-test-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('All transactional test data truncated successfully! Database is ready for scratch manual testing.');
        fetchLedger();
        fetchQrVerifications();
        fetchCancellationRefunds();
        fetchReferralIncentives();
        setShowTruncateConfirm(false);
      } else {
        toast.error(data.error || 'Failed to truncate test data');
      }
    } catch (err) {
      toast.error('Network error during data truncate');
    } finally {
      setIsTruncating(false);
    }
  };

  // Computed Pending Technician Groups for Batch Payouts
  const pendingTechGroups = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const isSettled = tx.status === 'SETTLED' || Boolean(tx.payoutUtr);
      if (isSettled || tx.status === 'REFUNDED' || !tx.technicianName) return;

      const techKey = tx.technicianId || tx.technicianName;
      if (!map.has(techKey)) {
        map.set(techKey, {
          techId: tx.technicianId,
          techName: tx.technicianName,
          techPhone: tx.technicianPhone,
          techUpi: tx.technicianUpi,
          trade: tx.technicianTrade,
          locality: tx.locality,
          bookingIds: [],
          totalPayout: 0,
          jobs: []
        });
      }
      const entry = map.get(techKey);
      entry.bookingIds.push(tx.bookingId);
      entry.totalPayout += Number(tx.techPayout || 0);
      entry.jobs.push(tx);
    });
    return Array.from(map.values());
  }, [transactions]);

  // Refund Columns Definition for DataTable
  const refundColumns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date / Time',
        minWidth: 130,
        renderCell: (r) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date(r.cancelledAt || r.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )
      },
      {
        field: 'bookingId',
        headerName: 'Booking ID',
        minWidth: 120,
        renderCell: (r) => (
          <Box>
            <Chip
              label={`#${r.bookingId}`}
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => navigate(`/track?bookingId=${r.bookingId}`)}
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
              {r.locality || 'Salem'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'customer',
        headerName: 'Customer & Contact',
        minWidth: 160,
        renderCell: (r) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {r.customerName || 'Customer'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              +91 {r.customerPhone || '—'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'totalAmount',
        headerName: 'Gross Paid',
        align: 'right',
        minWidth: 105,
        renderCell: (r) => (
          <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ₹{parseFloat(r.totalAmount || 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'gatewayFee',
        headerName: 'Gateway Fee',
        align: 'right',
        minWidth: 110,
        renderCell: () => (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ₹0.00 (0%)
          </Typography>
        )
      },
      {
        field: 'refundPlatformFee',
        headerName: 'Platform Fee',
        align: 'right',
        minWidth: 110,
        renderCell: (r) => (
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ₹{parseFloat(r.refundPlatformFee || 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'refundAmount',
        headerName: 'Refund Due',
        align: 'right',
        minWidth: 115,
        renderCell: (r) => (
          <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            ₹{parseFloat(r.refundAmount || 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'refundStatus',
        headerName: 'Refund Status',
        align: 'center',
        minWidth: 140,
        renderCell: (r) => {
          const statusStr = String(r.refundStatus || '').toUpperCase();
          const isDone = statusStr === 'REFUNDED';
          const isUnverified = statusStr === 'UNVERIFIED_PAYMENT';
          return (
            <Chip
              label={isDone ? 'REFUNDED' : isUnverified ? 'UNVERIFIED (NO INFLOW)' : 'PENDING DISBURSAL'}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '10px',
                bgcolor: isDone ? '#F3E8FF' : isUnverified ? '#F1F5F9' : '#FEF3C7',
                color: isDone ? '#6B21A8' : isUnverified ? '#64748B' : '#B45309',
                border: '1px solid',
                borderColor: isDone ? '#D8B4FE' : isUnverified ? '#CBD5E1' : '#FDE68A'
              }}
            />
          );
        }
      },
      {
        field: 'refundUtr',
        headerName: 'Refund UTR',
        minWidth: 150,
        renderCell: (r) =>
          r.refundUtr ? (
            <Chip
              label={r.refundUtr}
              size="small"
              onClick={() => handleCopyText(r.refundUtr, 'Refund UTR')}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '11px',
                bgcolor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                cursor: 'pointer'
              }}
            />
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Pending transfer
            </Typography>
          )
      },
      {
        field: 'actions',
        headerName: 'Action',
        align: 'center',
        minWidth: 180,
        renderCell: (r) => {
          const statusStr = String(r.refundStatus || '').toUpperCase();
          const isDone = statusStr === 'REFUNDED';
          const isUnverified = statusStr === 'UNVERIFIED_PAYMENT';

          if (isUnverified) {
            return (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                No Inflow Verified
              </Typography>
            );
          }

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
              {!isDone ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setSelectedRefundModal(r);
                    setRefundUtrInput('');
                    setRefundNotesInput('');
                  }}
                  sx={{
                    fontSize: '11px',
                    py: 0.4,
                    px: 1.2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#DC2626',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#B91C1C' }
                  }}
                >
                  Disburse Refund
                </Button>
              ) : (
                <Tooltip title="Send WhatsApp Refund Slip to Customer">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSendCustomerRefundWhatsApp(r, r.refundUtr)}
                    startIcon={<MessageSquare size={13} />}
                    sx={{
                      fontSize: '11px',
                      py: 0.4,
                      px: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      '&:hover': { bgcolor: '#15803D' }
                    }}
                  >
                    WhatsApp Slip
                  </Button>
                </Tooltip>
              )}
            </Box>
          );
        }
      }
    ],
    [navigate]
  );

  // Referral Incentives Columns Definition
  const referralColumns = useMemo(
    () => [
      {
        field: 'registeredAt',
        headerName: 'Joined Date',
        minWidth: 120,
        renderCell: (item) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date(item.registeredAt || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </Typography>
        )
      },
      {
        field: 'referee',
        headerName: 'Referred Specialist (Referee)',
        minWidth: 170,
        renderCell: (item) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {item.refereeName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
              {item.refereeTrade || 'Specialist'} • +91 {item.refereePhone || '—'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'referrer',
        headerName: 'Beneficiary (Referrer)',
        minWidth: 180,
        renderCell: (item) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {item.referrerName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block' }}>
              UPI: {item.referrerUpi || 'Direct Phone / Bank'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              +91 {item.referrerPhone || '—'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'milestone',
        headerName: 'Milestone Trigger',
        minWidth: 150,
        renderCell: (item) => (
          <Chip
            label={`1st Job Done (${item.jobsCompletedCount} Total)`}
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '10px' }}
          />
        )
      },
      {
        field: 'incentiveAmount',
        headerName: 'Incentive Bonus',
        align: 'right',
        minWidth: 130,
        renderCell: (item) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
            ₹{parseFloat(item.incentiveAmount || 100).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Payout Status',
        align: 'center',
        minWidth: 130,
        renderCell: (item) => (
          <Chip
            label={item.isPaid ? 'DISBURSED' : 'PENDING'}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '10px',
              bgcolor: item.isPaid ? '#DCFCE7' : '#FEF3C7',
              color: item.isPaid ? '#15803D' : '#B45309'
            }}
          />
        )
      },
      {
        field: 'actions',
        headerName: 'Action',
        align: 'center',
        minWidth: 180,
        renderCell: (item) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
            {!item.isPaid ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedReferralModal(item);
                  setReferralUtrInput('');
                  setReferralNotesInput('');
                }}
                startIcon={<Award size={13} />}
                sx={{
                  fontSize: '11px',
                  py: 0.4,
                  px: 1.2,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#059669',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#047857' }
                }}
              >
                Disburse ₹{item.incentiveAmount}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleSendReferralWhatsApp(item)}
                startIcon={<MessageSquare size={13} />}
                sx={{
                  fontSize: '11px',
                  py: 0.4,
                  px: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#15803D' }
                }}
              >
                WhatsApp Slip
              </Button>
            )}
          </Box>
        )
      }
    ],
    []
  );

  // Table Columns Definition for DataTable
  const columns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date / Time',
        minWidth: 130,
        renderCell: (tx) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )
      },
      {
        field: 'bookingId',
        headerName: 'Booking ID',
        minWidth: 120,
        renderCell: (tx) => (
          <Chip
            label={`#${tx.bookingId}`}
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => navigate(`/track?bookingId=${tx.bookingId}`)}
            sx={{ fontWeight: 700, cursor: 'pointer' }}
          />
        )
      },
      {
        field: 'customerName',
        headerName: 'Customer & Locality',
        minWidth: 160,
        renderCell: (tx) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {tx.customerName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {tx.locality}
            </Typography>
          </Box>
        )
      },
      {
        field: 'technicianName',
        headerName: 'Technician',
        minWidth: 140,
        renderCell: (tx) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {tx.technicianName}
            </Typography>
            {tx.technicianTrade && (
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                {tx.technicianTrade}
              </Typography>
            )}
          </Box>
        )
      },
      {
        field: 'grossAmount',
        headerName: 'Gross Inflow',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            ₹{Number(tx?.grossAmount ?? tx?.customerGross ?? 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'customerPlatformFee',
        headerName: 'Customer Cutoff',
        align: 'right',
        minWidth: 125,
        renderCell: (tx) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              +₹{Number(tx?.customerPlatformFee ?? 0).toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              ({tx?.customerFeePercent || 0}% fee)
            </Typography>
          </Box>
        )
      },
      {
        field: 'techCommissionCut',
        headerName: 'Tech Cutoff',
        align: 'right',
        minWidth: 120,
        renderCell: (tx) => (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              -₹{Number(tx?.techCommissionCut ?? 0).toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              ({tx?.techCommissionPercent || 0}% cut)
            </Typography>
          </Box>
        )
      },
      {
        field: 'razorpayFee',
        headerName: 'Gateway & Bank Fee',
        align: 'right',
        minWidth: 120,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ₹{Number(tx?.razorpayFee ?? tx?.gatewayFee ?? 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'techPayout',
        headerName: 'Disbursed',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            ₹{Number(tx?.techPayout ?? 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'platformCut',
        headerName: 'Platform Cut',
        align: 'right',
        minWidth: 110,
        renderCell: (tx) => (
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            ₹{Number(tx?.platformCut ?? 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'payoutUtr',
        headerName: 'Payout Txn ID / UTR',
        minWidth: 170,
        renderCell: (tx) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            {tx.payoutUtr ? (
              <Tooltip title="Click to view or edit Transaction ID">
                <Chip
                  label={tx.payoutUtr}
                  size="small"
                  onClick={() => handleOpenUtrModal(tx)}
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '11px',
                    bgcolor: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    color: '#0F172A',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#E2E8F0', borderColor: '#94A3B8' }
                  }}
                />
              </Tooltip>
            ) : (Number(tx.techPayout || 0) > 0 && !tx.technicianName?.includes('Pre-Dispatch') && tx.bookingStatus !== 'cancelled') ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenUtrModal(tx)}
                sx={{
                  fontSize: '10.5px',
                  py: 0.25,
                  px: 1,
                  fontWeight: 800,
                  textTransform: 'none',
                  color: '#D97706',
                  borderColor: '#FCD34D',
                  bgcolor: '#FEF3C7',
                  '&:hover': { bgcolor: '#FDE68A', borderColor: '#F59E0B' }
                }}
              >
                + Enter UTR
              </Button>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                —
              </Typography>
            )}
          </Box>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        align: 'center',
        minWidth: 120,
        renderCell: (tx) => <StatusPill status={tx.status} />
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'center',
        sortable: false,
        minWidth: 230,
        renderCell: (tx) => {
          const hasPayoutDue = Number(tx.techPayout || 0) > 0 && !tx.technicianName?.includes('Pre-Dispatch') && tx.bookingStatus !== 'cancelled';
          if (!hasPayoutDue) {
            return (
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                No Payout Due
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
              {/* Enter/Edit UTR */}
              <Tooltip title="Manually Enter / Edit Bank UTR or Transaction ID">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenUtrModal(tx)}
                  sx={{
                    fontSize: '11px',
                    py: 0.3,
                    px: 1,
                    minHeight: 28,
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#0F172A',
                    borderColor: '#CBD5E1',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
                  }}
                >
                  {tx.payoutUtr ? 'Edit UTR' : 'Enter UTR'}
                </Button>
              </Tooltip>

              {/* WhatsApp Payout Receipt to Technician */}
              <Tooltip title={tx.technicianPhone ? `Send WhatsApp Payout Confirmation to ${tx.technicianPhone}` : 'No phone number available'}>
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSendWhatsApp(tx)}
                    disabled={!tx.technicianPhone}
                    startIcon={<MessageSquare size={13} />}
                    sx={{
                      fontSize: '11px',
                    py: 0.3,
                    px: 1,
                    minHeight: 28,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: '#16A34A',
                    color: '#FFFFFF',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#15803D' },
                    '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
                  }}
                >
                  WhatsApp
                </Button>
              </span>
            </Tooltip>

            {/* Direct SMS Option */}
            <Tooltip title={tx.technicianPhone ? `Send Direct SMS to ${tx.technicianPhone}` : 'No phone number available'}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleSendSms(tx)}
                  disabled={!tx.technicianPhone}
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    p: '5px',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#DBEAFE' },
                    '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8', borderColor: '#E2E8F0' }
                  }}
                >
                  <Phone size={14} />
                </IconButton>
              </span>
            </Tooltip>

            {/* Override if not settled or refunded */}
            {tx.status !== 'SETTLED' && tx.status !== 'REFUNDED' && (
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => {
                  navigate(`/admin/settlements/${tx.bookingId}/override`, {
                    state: {
                      booking: {
                        bookingId: tx.bookingId,
                        amount: tx.grossAmount,
                        techPayout: tx.techPayout,
                        customerPhone: tx.customerPhone || '',
                        technicianPhone: tx.technicianPhone || ''
                      },
                      returnTo: location.pathname
                    }
                  });
                }}
                sx={{ fontSize: '10.5px', py: 0.3, px: 0.8, minHeight: 28, textTransform: 'none' }}
              >
                Override
              </Button>
            )}
          </Box>
        );
      }
    }
  ],
  [navigate]
);

  // QR Verifications Table Columns
  const qrColumns = useMemo(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date / Time',
        minWidth: 140,
        renderCell: (p) => (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {new Date(p.created_at || Date.now()).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short'
            })}{' '}
            •{' '}
            {new Date(p.created_at || Date.now()).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )
      },
      {
        field: 'booking_id',
        headerName: 'Booking ID',
        minWidth: 130,
        renderCell: (p) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              #{p.booking_id}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {p.locality || 'Salem'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'customer',
        headerName: 'Customer',
        minWidth: 160,
        renderCell: (p) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {p.customer_name || 'Customer'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {p.customer_phone || '—'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'amount_total',
        headerName: 'Amount Paid',
        align: 'right',
        minWidth: 120,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
            ₹{parseFloat(p.amount_total || 0).toFixed(2)}
          </Typography>
        )
      },
      {
        field: 'customer_utr',
        headerName: '12-Digit UTR',
        minWidth: 170,
        renderCell: (p) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums' }}>
              {p.customer_utr}
            </Typography>
            {p.ocr_detected_utr && (
              <Chip
                label={p.ocr_detected_utr === p.customer_utr ? 'OCR Match' : `OCR: ${p.ocr_detected_utr}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '9.5px',
                  fontWeight: 700,
                  bgcolor: p.ocr_detected_utr === p.customer_utr ? '#DCFCE7' : '#FEF3C7',
                  color: p.ocr_detected_utr === p.customer_utr ? '#15803D' : '#B45309'
                }}
              />
            )}
          </Box>
        )
      },
      {
        field: 'screenshot',
        headerName: 'Receipt Proof',
        minWidth: 130,
        renderCell: (p) =>
          p.screenshot_url ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedProof(p)}
              startIcon={<Eye size={13} />}
              sx={{ textTransform: 'none', fontSize: '11px', py: 0.4, borderRadius: '6px' }}
            >
              View Receipt
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              No image
            </Typography>
          )
      },
      {
        field: 'technician',
        headerName: 'Assigned Partner',
        minWidth: 160,
        renderCell: (p) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
              {p.technician_name || 'Pending Dispatch'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
              Payout: ₹{parseFloat(p.tech_payout_amount || 0).toFixed(2)}
            </Typography>
          </Box>
        )
      },
      {
        field: 'verification_status',
        headerName: 'Status',
        minWidth: 140,
        renderCell: (p) => {
          const st = String(p.verification_status || 'pending').toLowerCase();
          if (st === 'verified') {
            return <Chip label="Verified & Escrowed" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '10px' }} />;
          }
          if (st === 'rejected') {
            return <Chip label="Rejected" size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: '10px' }} />;
          }
          return <Chip label="Pending Review" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '10px' }} />;
        }
      },
      {
        field: 'actions',
        headerName: 'Action',
        minWidth: 170,
        renderCell: (p) => {
          const st = String(p.verification_status || 'pending').toLowerCase();
          if (st === 'verified') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>
                  Verified
                </Typography>
                {p.technician_phone && (
                  <Tooltip title="Send WhatsApp Confirmation to Technician">
                    <IconButton
                      size="small"
                      onClick={() => handleSendWhatsApp({
                        bookingId: p.booking_id,
                        technicianName: p.technician_name,
                        technicianPhone: p.technician_phone,
                        techPayout: parseFloat(p.tech_payout_amount || 0),
                        technicianTrade: 'Service Partner',
                        locality: p.locality || 'Salem',
                        payoutUtr: p.customer_utr || 'ESCROW_VERIFIED',
                        createdAt: p.created_at
                      })}
                      sx={{ bgcolor: '#DCFCE7', color: '#166534', p: '3px', '&:hover': { bgcolor: '#BBF7D0' } }}
                    >
                      <MessageSquare size={13} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          }
          return (
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleVerifyPayment(p.id)}
                disabled={isProcessingAction}
                sx={{ bgcolor: '#16A34A', color: '#FFF', fontSize: '11px', py: 0.4, px: 1, textTransform: 'none', fontWeight: 700, borderRadius: '6px', '&:hover': { bgcolor: '#15803D' } }}
              >
                Verify
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  setRejectModalPayment(p);
                  setRejectReason('');
                }}
                disabled={isProcessingAction}
                sx={{ fontSize: '11px', py: 0.4, px: 1, textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
              >
                Reject
              </Button>
            </Box>
          );
        }
      }
    ],
    [isProcessingAction]
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh', py: { xs: 2.5, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="Financial Intelligence & Settlement Ledger"
          subtitle="Real-time tracking of customer payments, gateway & banking fees, technician fuel & labor disbursals, and platform commission."
          backUrl="/admin"
          backLabel="Central Ops Desk"
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Financials">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={fetchLedger}
                  startIcon={<RefreshCw size={15} />}
                  sx={{ borderRadius: 1 }}
                >
                  Refresh
                </Button>
              </Tooltip>
              <Tooltip title="Truncate all transactional test data and start testing from scratch">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setShowTruncateConfirm(true)}
                  startIcon={<RotateCcw size={15} />}
                  sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
                >
                  Reset Test Data
                </Button>
              </Tooltip>
            </Box>
          }
          badge={
            <Chip
              icon={<Shield size={14} />}
              label="Escrow Guarantee"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          }
        />

        {/* 5 KPI Metric Cards (Dual-Sided Percentage Cutoff Matrix & Clean Confirmed Inflow) */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* 1. Customer Gross Inflow (Strictly Non-Failed) */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="CUSTOMER GROSS"
              value={`₹${(summary.totalGross || 0).toLocaleString('en-IN')}`}
              subtitle={`${summary.totalTransactions || 0} Orders • Excl. Failed`}
              icon={Coins}
              iconColor="#1D6FE5"
              iconBg="#EFF6FF"
            />
          </Grid>

          {/* 2. Customer-side Platform Cutoff */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="CUSTOMER CUTOFF"
              value={`₹${(summary.totalCustomerPlatformFees || 0).toLocaleString('en-IN')}`}
              subtitle={`${summary.customerFeePercent || 2.0}% Platform Fee Cutoff`}
              icon={CreditCard}
              iconColor="#0284C7"
              iconBg="#E0F2FE"
            />
          </Grid>

          {/* 3. Technician-side Commission Cutoff */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="TECH CUTOFF"
              value={`₹${(summary.totalPartnerCommissionCut || 0).toLocaleString('en-IN')}`}
              subtitle={`${summary.partnerCommPercent || 5.0}% Partner Commission Retained`}
              icon={TrendingUp}
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
            />
          </Grid>

          {/* 4. Disbursed to Technicians */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="TECH PAYOUTS"
              value={`₹${(summary.totalTechPayout || 0).toLocaleString('en-IN')}`}
              subtitle={`100% Fuel + Net Labor Payouts`}
              icon={Users}
              iconColor="#059669"
              iconBg="#ECFDF5"
            />
          </Grid>

          {/* 5. Net Platform Revenue */}
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="NET PLATFORM CUT"
              value={`₹${(summary.totalPlatformCut || 0).toLocaleString('en-IN')}`}
              subtitle={`Customer Cut + Partner Cut`}
              icon={ShieldCheck}
              iconColor="#16A34A"
              iconBg="#F0FDF4"
            />
          </Grid>
        </Grid>

        {/* Dual-Sided Cutoff & Failed Payment Exclusion Telemetry Banner */}
        <Box sx={{ p: 1.5, mb: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '11.5px' }}>
              Dual-Sided Cutoff Matrix:
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
              Customer Fee: <strong>{summary.customerFeePercent || 2.0}%</strong> (₹{summary.totalCustomerPlatformFees || 0}) • Tech Cut: <strong>{summary.partnerCommPercent || 5.0}%</strong> (₹{summary.totalPartnerCommissionCut || 0}) • Net Platform Margin: <strong>₹{summary.totalPlatformCut || 0}</strong>
            </Typography>
          </Box>
          {summary.totalFailedPaymentsCount > 0 && (
            <Chip 
              label={`Failed Attempts Excluded: ₹${summary.totalFailedPaymentsAmount || 0} (${summary.totalFailedPaymentsCount} txns)`} 
              size="small" 
              sx={{ bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', fontWeight: 700, fontSize: '10.5px' }} 
            />
          )}
        </Box>

        {/* Navigation Tabs: 5 Disbursal & Verification Streams */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                minHeight: 44
              }
            }}
          >
            <Tab
              icon={<Users size={16} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Technician Job Payouts</span>
                  {pendingTechGroups.length > 0 && (
                    <Chip
                      label={`${pendingTechGroups.length} Pending`}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, height: 20, fontSize: '10.5px' }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              icon={<RotateCcw size={16} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Cancellation Refunds</span>
                  {refundsList.filter((r) => r.refundStatus !== 'REFUNDED').length > 0 && (
                    <Chip
                      label={refundsList.filter((r) => r.refundStatus !== 'REFUNDED').length}
                      size="small"
                      sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 800, height: 20, fontSize: '10.5px' }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              icon={<Award size={16} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Referral Incentives</span>
                  {referralsList.filter((item) => !item.isPaid).length > 0 && (
                    <Chip
                      label={referralsList.filter((item) => !item.isPaid).length}
                      size="small"
                      sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, height: 20, fontSize: '10.5px' }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              icon={<QrCode size={16} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>UPI QR Verifications</span>
                  {qrVerifications.filter((p) => p.verification_status === 'pending').length > 0 && (
                    <Chip
                      label={qrVerifications.filter((p) => p.verification_status === 'pending').length}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, height: 20, fontSize: '10.5px' }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              icon={<Wallet size={16} />}
              iconPosition="start"
              label={`Master Cash Flow Ledger (${transactions.length})`}
            />
          </Tabs>
        </Box>

        {/* TAB 0: On-Demand Technician Job Payouts */}
        {activeTab === 0 && (
          <Box>
            {/* Header Banner */}
            <Card elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    On-Demand Technician Settlements (Available Any Time)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Disburse individual job earnings or execute single-UTR batch payouts to technicians directly via UPI VPA at any time.
                  </Typography>
                </Box>
                {pendingTechGroups.length > 0 && (
                  <Chip
                    label={`${pendingTechGroups.length} Technicians Pending Payout`}
                    color="warning"
                    sx={{ fontWeight: 800, fontSize: '11px' }}
                  />
                )}
              </Box>
            </Card>

            {/* Pending Grouped Technicians Cards (If any pending) */}
            {pendingTechGroups.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Users size={16} />
                  <span>Pending Technician Settlement Balances</span>
                </Typography>
                <Grid container spacing={2}>
                  {pendingTechGroups.map((group) => (
                    <Grid item xs={12} sm={6} md={4} key={group.techId || group.techName}>
                      <Card
                        elevation={0}
                        sx={{
                          p: 2,
                          border: '1.5px solid #FCD34D',
                          bgcolor: '#FFFBEB',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 1.5
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                {group.techName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                                {group.trade || 'Partner Specialist'} • {group.locality || 'Salem'}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${group.bookingIds.length} ${group.bookingIds.length === 1 ? 'Job' : 'Jobs'}`}
                              size="small"
                              sx={{ fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309', height: 22 }}
                            />
                          </Box>

                          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {group.techPhone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Phone size={13} color="#0284C7" />
                                <Typography
                                  component="a"
                                  href={`tel:${group.techPhone}`}
                                  variant="caption"
                                  sx={{ color: '#0284C7', fontWeight: 700, textDecoration: 'none' }}
                                >
                                  +91 {group.techPhone}
                                </Typography>
                              </Box>
                            )}
                            {group.techUpi && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Wallet size={13} color="#475569" />
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                                  {group.techUpi}
                                </Typography>
                                <IconButton size="small" onClick={() => handleCopyText(group.techUpi, 'UPI ID')} sx={{ p: '2px' }}>
                                  <Copy size={11} />
                                </IconButton>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E' }}>
                              Total Payout Due:
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#B45309', fontVariantNumeric: 'tabular-nums' }}>
                              ₹{Number(group?.totalPayout || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => {
                            setSelectedBatchTech(group);
                            setBatchUtrInput('');
                            setBatchNotesInput('');
                          }}
                          sx={{
                            bgcolor: '#16A34A',
                            fontWeight: 800,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '12px',
                            py: 0.6,
                            '&:hover': { bgcolor: '#15803D' }
                          }}
                        >
                          Batch Settle All ({group.bookingIds.length} Jobs - 1 UTR)
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Itemized Technician Jobs Table */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Itemized Technician Job Payouts & Disbursal Status
              </Typography>
            </Box>
            <DataTable
              columns={columns}
              data={techPayoutsList}
              keyField="bookingId"
              isLoading={isLoading}
              searchPlaceholder="Search by technician name, booking ID, locality..."
              searchFields={['bookingId', 'customerName', 'technicianName', 'locality']}
              emptyTitle="No Technician Payouts Found"
              emptyDescription="Completed jobs ready for disbursal will appear here."
              initialPageSize={10}
            />
          </Box>
        )}

        {/* TAB 1: Cancellation Refunds */}
        {activeTab === 1 && (
          <Box>
            <Card elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#991B1B' }}>
                    Customer Cancellation Refunds (0% Gateway Charge)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F1D1D' }}>
                    All customer refunds are disbursed directly via UPI with zero gateway deductions and live platform fee rules.
                  </Typography>
                </Box>
                <Chip
                  label={`${refundsList.filter((r) => r.refundStatus !== 'REFUNDED').length} Pending Disbursals`}
                  sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 800, fontSize: '11px' }}
                />
              </Box>
            </Card>

            <DataTable
              columns={refundColumns}
              data={refundsList}
              keyField="bookingId"
              isLoading={loadingRefunds}
              searchPlaceholder="Search by booking ID, customer phone, reason..."
              searchFields={['bookingId', 'customerName', 'customerPhone', 'cancellationReason']}
              emptyTitle="No Cancellation Refunds Found"
              emptyDescription="Cancelled bookings requiring customer refunds will appear here."
              initialPageSize={10}
            />
          </Box>
        )}

        {/* TAB 2: Referral Incentives */}
        {activeTab === 2 && (
          <Box>
            <Card elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#065F46' }}>
                    Technician Referral Incentives (First Job Milestones)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#064E3B' }}>
                    When a referred specialist completes their 1st verified job, bonus incentives are awarded to the referring partner from real-time platform reward settings.
                  </Typography>
                </Box>
                <Chip
                  label={`${referralsList.filter((item) => !item.isPaid).length} Unsettled Bonuses`}
                  sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '11px' }}
                />
              </Box>
            </Card>

            <DataTable
              columns={referralColumns}
              data={referralsList}
              keyField="refereeId"
              isLoading={loadingReferrals}
              searchPlaceholder="Search by referee name, referrer name, phone..."
              searchFields={['refereeName', 'referrerName', 'refereePhone', 'referrerPhone']}
              emptyTitle="No Referral Incentives Found"
              emptyDescription="Referral incentives triggered by completed specialist milestones will appear here."
              initialPageSize={10}
            />
          </Box>
        )}

        {/* TAB 3: UPI QR Verifications Desk */}
        {activeTab === 3 && (
          <Box>
            <DataTable
              columns={qrColumns}
              data={qrVerifications}
              keyField="id"
              isLoading={loadingQr}
              searchPlaceholder="Search by customer phone, UTR, booking ID..."
              searchFields={['booking_id', 'customer_name', 'customer_phone', 'customer_utr', 'technician_name']}
              emptyTitle="No UPI QR Payments Submitted"
              emptyDescription="Customer QR payments with uploaded receipts and OCR-detected UTRs will appear here for verification."
              initialPageSize={10}
            />
          </Box>
        )}

        {/* TAB 4: Master Cash Flow Ledger */}
        {activeTab === 4 && (
          <Box>
            {/* Multi-Dimensional Financial Filters */}
            <Card elevation={0} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Filter size={16} color="#0A5CC4" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Multi-Dimensional Financial Filters
                </Typography>
              </Box>

              {/* Stream Filter Tabs: All, Payments, Refunds, Tech Payouts */}
              <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 1, letterSpacing: 0.5 }}>
                  FINANCIAL STREAM / TYPE (பரிவர்த்தனை வகை):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    { id: 'all', label: 'All Transactions', icon: Wallet, count: transactions.length, color: '#0A5CC4', bg: '#EFF6FF' },
                    { id: 'payments', label: 'Payments', icon: Coins, count: paymentsList.length, color: '#059669', bg: '#ECFDF5' },
                    { id: 'refunds', label: 'Refunds', icon: RotateCcw, count: refundsOnlyList.length, color: '#DC2626', bg: '#FEF2F2' },
                    { id: 'tech_payouts', label: 'Tech Payout', icon: Users, count: techPayoutsList.length, color: '#D97706', bg: '#FEF3C7' }
                  ].map((streamTab) => {
                    const isSelected = ledgerStreamFilter === streamTab.id;
                    const Icon = streamTab.icon;
                    return (
                      <Button
                        key={streamTab.id}
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => setLedgerStreamFilter(streamTab.id)}
                        startIcon={<Icon size={15} />}
                        sx={{
                          py: 0.7,
                          px: 1.8,
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '13px',
                          bgcolor: isSelected ? streamTab.color : '#FFFFFF',
                          borderColor: isSelected ? streamTab.color : '#CBD5E1',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                          '&:hover': {
                            bgcolor: isSelected ? streamTab.color : streamTab.bg,
                            borderColor: streamTab.color
                          }
                        }}
                      >
                        <span>{streamTab.label}</span>
                        <Chip
                          label={streamTab.count}
                          size="small"
                          sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '11px',
                            fontWeight: 800,
                            bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : streamTab.bg,
                            color: isSelected ? '#FFFFFF' : streamTab.color
                          }}
                        />
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Grid container spacing={2} alignItems="center">
                {/* Quick Date Presets */}
                <Grid item xs={12} lg={5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                    DATE RANGE PRESET:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: '7days', label: 'Last 7 Days' },
                      { id: '30days', label: 'Last 30 Days' }
                    ].map((p) => {
                      const isSelected = datePreset === p.id;
                      return (
                        <Chip
                          key={p.id}
                          label={p.label}
                          onClick={() => handlePresetChange(p.id)}
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Box>
                </Grid>

                {/* Date Pickers */}
                <Grid item xs={12} sm={6} md={3} lg={3.5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    CUSTOM DATE RANGE:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      type="date"
                      fullWidth
                      size="small"
                      value={startDate}
                      onChange={(e) => {
                        setDatePreset('custom');
                        setStartDate(e.target.value);
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="date"
                      fullWidth
                      size="small"
                      value={endDate}
                      onChange={(e) => {
                        setDatePreset('custom');
                        setEndDate(e.target.value);
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>

                {/* Region / Locality Dropdown */}
                <Grid item xs={12} sm={6} md={3} lg={3.5}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    SALEM REGION / LOCALITY:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      sx={{ fontSize: '0.8125rem' }}
                    >
                      {SALEM_LOCALITIES.map((loc) => (
                        <MenuItem key={loc} value={loc} sx={{ fontSize: '0.8125rem' }}>
                          {loc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>

            {/* Financial Settlements Table with DataTable (Filtered by Stream Tab) */}
            <DataTable
              columns={columns}
              data={displayedTransactions}
              keyField="bookingId"
              isLoading={isLoading}
              searchPlaceholder={
                ledgerStreamFilter === 'payments'
                  ? 'Search customer payments by name, phone, booking ID...'
                  : ledgerStreamFilter === 'refunds'
                  ? 'Search refunds by customer, booking ID, reason...'
                  : ledgerStreamFilter === 'tech_payouts'
                  ? 'Search technician payouts by tech name, booking ID...'
                  : 'Search all transactions by customer, technician, booking ID...'
              }
              searchFields={['bookingId', 'customerName', 'technicianName', 'locality', 'payoutUtr']}
              emptyTitle={
                ledgerStreamFilter === 'payments'
                  ? 'No Customer Payments Found'
                  : ledgerStreamFilter === 'refunds'
                  ? 'No Customer Refunds Found'
                  : ledgerStreamFilter === 'tech_payouts'
                  ? 'No Technician Payouts Found'
                  : 'No Financial Transactions Found'
              }
              emptyDescription={
                ledgerStreamFilter === 'payments'
                  ? 'There are no customer payment inflows matching the selected filters.'
                  : ledgerStreamFilter === 'refunds'
                  ? 'There are no customer cancellation refunds matching the selected filters.'
                  : ledgerStreamFilter === 'tech_payouts'
                  ? 'There are no technician payouts matching the selected filters.'
                  : 'There are no transaction lines matching the selected date or region filter.'
              }
              initialPageSize={10}
            />
          </Box>
        )}

        {/* Modal: View Receipt Proof */}
        <Dialog
          open={Boolean(selectedProof)}
          onClose={() => setSelectedProof(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          {selectedProof && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Payment Receipt #{selectedProof.booking_id}</span>
                <IconButton size="small" onClick={() => setSelectedProof(null)}>
                  <X size={18} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={selectedProof.screenshot_url}
                  alt="Customer Payment Receipt"
                  sx={{
                    width: '100%',
                    maxHeight: '65vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    bgcolor: '#0F172A'
                  }}
                />
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Entered UTR: {selectedProof.customer_utr}
                  </Typography>
                  {selectedProof.ocr_detected_utr && (
                    <Typography variant="caption" sx={{ color: '#059669', display: 'block' }}>
                      OCR Detected UTR: {selectedProof.ocr_detected_utr}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Amount: ₹{parseFloat(selectedProof.amount_total || 0).toFixed(2)} • Customer: {selectedProof.customer_name} ({selectedProof.customer_phone})
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button variant="outlined" onClick={() => setSelectedProof(null)}>
                  Close
                </Button>
                {selectedProof.verification_status !== 'verified' && (
                  <Button
                    variant="contained"
                    onClick={async () => {
                      await handleVerifyPayment(selectedProof.id);
                      setSelectedProof(null);
                    }}
                    disabled={isProcessingAction}
                    sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
                  >
                    Verify & Confirm Escrow
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal: Reject Payment Reason */}
        <Dialog
          open={Boolean(rejectModalPayment)}
          onClose={() => setRejectModalPayment(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: '15px' }}>
            Flag & Reject Payment Proof
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2, fontSize: '12.5px' }}>
              Booking #{rejectModalPayment?.booking_id} • UTR: {rejectModalPayment?.customer_utr}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Rejection"
              placeholder="e.g. UTR does not reflect in bank account, blurred screenshot, or amount mismatch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" onClick={() => setRejectModalPayment(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectPayment}
              disabled={isProcessingAction}
            >
              Confirm Rejection
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: Manual Technician Payout Transaction ID & WhatsApp / SMS Sender */}
        <Dialog
          open={Boolean(selectedUtrModalTx)}
          onClose={() => setSelectedUtrModalTx(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          {selectedUtrModalTx && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Manual Technician Settlement: #{selectedUtrModalTx.bookingId}</span>
                <IconButton size="small" onClick={() => setSelectedUtrModalTx(null)}>
                  <X size={18} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 2.5 }}>
                {/* Payout Summary Info Box */}
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                        TECHNICIAN:
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {selectedUtrModalTx.technicianName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700 }}>
                        +91 {selectedUtrModalTx.technicianPhone || 'No Phone Registered'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                        DISBURSED AMOUNT:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{Number(selectedUtrModalTx.techPayout || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        UPI: {selectedUtrModalTx.technicianUpi || 'Bank / Phone Direct'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Input for Manual Transaction ID / UTR */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8 }}>
                    BANK TRANSACTION REFERENCE / UTR NUMBER (MANUAL ENTRY):
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g. 430198273645, UTR-892019, UPI-99201"
                    value={manualUtrInput}
                    onChange={(e) => setManualUtrInput(e.target.value.toUpperCase())}
                    helperText="Enter the 12-digit UPI reference or bank transaction ID after completing transfer."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '15px',
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Box>

                {/* Optional Internal Notes */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.8 }}>
                    INTERNAL SETTLEMENT NOTE (OPTIONAL):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Paid via GPay business account, verified by accountant"
                    value={manualUtrNotes}
                    onChange={(e) => setManualUtrNotes(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="outlined" onClick={() => setSelectedUtrModalTx(null)} disabled={isSavingUtr}>
                  Cancel
                </Button>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {/* Just Save */}
                  <Button
                    variant="outlined"
                    onClick={() => handleSaveManualUtr(null)}
                    disabled={isSavingUtr || !manualUtrInput.trim()}
                    sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                  >
                    Save UTR Only
                  </Button>

                  {/* Save & Send SMS */}
                  {selectedUtrModalTx.technicianPhone && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSaveManualUtr('sms')}
                      disabled={isSavingUtr || !manualUtrInput.trim()}
                      startIcon={<Phone size={14} />}
                      sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                    >
                      Save & SMS
                    </Button>
                  )}

                  {/* Save & Send WhatsApp */}
                  {selectedUtrModalTx.technicianPhone && (
                    <Button
                      variant="contained"
                      onClick={() => handleSaveManualUtr('whatsapp')}
                      disabled={isSavingUtr || !manualUtrInput.trim()}
                      startIcon={<MessageSquare size={14} />}
                      sx={{
                        fontWeight: 800,
                        borderRadius: '8px',
                        textTransform: 'none',
                        bgcolor: '#16A34A',
                        '&:hover': { bgcolor: '#15803D' }
                      }}
                    >
                      Save & Send WhatsApp
                    </Button>
                  )}
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal: Batch Technician Payout */}
        <Dialog
          open={Boolean(selectedBatchTech)}
          onClose={() => setSelectedBatchTech(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          {selectedBatchTech && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Batch Technician Settlement: {selectedBatchTech.techName}</span>
                <IconButton size="small" onClick={() => setSelectedBatchTech(null)}>
                  <X size={18} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 2.5 }}>
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 2.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={7}>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                        TECHNICIAN:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {selectedBatchTech.techName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block' }}>
                        +91 {selectedBatchTech.techPhone || 'No Phone Registered'}
                      </Typography>
                      {selectedBatchTech.techUpi && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                            UPI: {selectedBatchTech.techUpi}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopyText(selectedBatchTech.techUpi, 'UPI ID')} sx={{ p: '2px' }}>
                            <Copy size={12} />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                        TOTAL DISBURSAL ({selectedBatchTech.bookingIds.length} JOBS):
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{Number(selectedBatchTech?.totalPayout || 0).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #CBD5E1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.5 }}>
                      BOOKING IDS INCLUDED IN BATCH:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedBatchTech.bookingIds.map((bId) => (
                        <Chip key={bId} label={`#${bId}`} size="small" sx={{ fontWeight: 700, fontSize: '10.5px' }} />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8 }}>
                    BANK TRANSACTION REFERENCE / UTR (SINGLE TRANSFER):
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g. 430198273645, UTR-BATCH-892"
                    value={batchUtrInput}
                    onChange={(e) => setBatchUtrInput(e.target.value.toUpperCase())}
                    helperText="Enter the 12-digit UPI reference or bank transaction ID for the consolidated payment."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '15px',
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.8 }}>
                    SETTLEMENT NOTE (OPTIONAL):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Consolidated daily settlement paid via ICICI corporate banking"
                    value={batchNotesInput}
                    onChange={(e) => setBatchNotesInput(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button variant="outlined" onClick={() => setSelectedBatchTech(null)} disabled={isProcessingBatch}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBatchPayoutSubmit}
                  disabled={isProcessingBatch || !batchUtrInput.trim()}
                  sx={{
                    bgcolor: '#16A34A',
                    fontWeight: 800,
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#15803D' }
                  }}
                >
                  {isProcessingBatch ? 'Processing...' : `Confirm Batch Settlement (₹${Number(selectedBatchTech?.totalPayout || 0).toFixed(2)})`}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal: Process Customer Cancellation Refund */}
        <Dialog
          open={Boolean(selectedRefundModal)}
          onClose={() => setSelectedRefundModal(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          {selectedRefundModal && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Disburse Customer Cancellation Refund: #{selectedRefundModal.bookingId}</span>
                <IconButton size="small" onClick={() => setSelectedRefundModal(null)}>
                  <X size={18} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 2.5 }}>
                <Box sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', mb: 2.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={7}>
                      <Typography variant="caption" sx={{ color: '#991B1B', display: 'block', fontWeight: 600 }}>
                        CUSTOMER & CONTACT:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7F1D1D' }}>
                        {selectedRefundModal.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block' }}>
                        +91 {selectedRefundModal.customerPhone}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Locality: {selectedRefundModal.locality || 'Salem'}
                      </Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#991B1B', display: 'block', fontWeight: 600 }}>
                        NET REFUND AMOUNT:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{parseFloat(selectedRefundModal.refundAmount || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block' }}>
                        Gateway Fee: 0% (₹0.00)
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #FCA5A5' }}>
                    <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block' }}>
                      Cancellation Reason: {selectedRefundModal.cancellationReason || 'Direct customer request'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8 }}>
                    BANK REFUND TRANSACTION ID / UTR:
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g. REF-430198273645, UPI-REF-9921"
                    value={refundUtrInput}
                    onChange={(e) => setRefundUtrInput(e.target.value.toUpperCase())}
                    helperText="Enter the 12-digit UPI reference or bank UTR issued upon transferring refund to customer."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '15px',
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.8 }}>
                    INTERNAL REFUND NOTE (OPTIONAL):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Sent via GPay to customer phone number"
                    value={refundNotesInput}
                    onChange={(e) => setRefundNotesInput(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setSelectedRefundModal(null)} disabled={isProcessingRefund}>
                  Cancel
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleProcessRefundSubmit(null)}
                    disabled={isProcessingRefund || !refundUtrInput.trim()}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Record UTR Only
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleProcessRefundSubmit('whatsapp')}
                    disabled={isProcessingRefund || !refundUtrInput.trim()}
                    startIcon={<MessageSquare size={14} />}
                    sx={{
                      bgcolor: '#16A34A',
                      fontWeight: 800,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#15803D' }
                    }}
                  >
                    Record & WhatsApp Slip
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal: Disburse Technician Referral Incentive */}
        <Dialog
          open={Boolean(selectedReferralModal)}
          onClose={() => setSelectedReferralModal(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          {selectedReferralModal && (
            <>
              <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Disburse Referral Incentive Bonus</span>
                <IconButton size="small" onClick={() => setSelectedReferralModal(null)}>
                  <X size={18} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 2.5 }}>
                <Box sx={{ p: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', mb: 2.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={7}>
                      <Typography variant="caption" sx={{ color: '#065F46', display: 'block', fontWeight: 600 }}>
                        REFERRING PARTNER (BENEFICIARY):
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#064E3B' }}>
                        {selectedReferralModal.referrerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block' }}>
                        +91 {selectedReferralModal.referrerPhone}
                      </Typography>
                      {selectedReferralModal.referrerUpi && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                            UPI: {selectedReferralModal.referrerUpi}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopyText(selectedReferralModal.referrerUpi, 'UPI ID')} sx={{ p: '2px' }}>
                            <Copy size={12} />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#065F46', display: 'block', fontWeight: 600 }}>
                        BONUS AMOUNT:
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{parseFloat(selectedReferralModal.incentiveAmount || 100).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        Referee: {selectedReferralModal.refereeName}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 0.8 }}>
                    BONUS TRANSFER TRANSACTION ID / UTR:
                  </Typography>
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g. REF-BONUS-430198273645"
                    value={referralUtrInput}
                    onChange={(e) => setReferralUtrInput(e.target.value.toUpperCase())}
                    helperText="Enter the 12-digit UPI reference or bank transaction ID."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '15px',
                        bgcolor: '#FFFFFF'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 0.8 }}>
                    INTERNAL NOTE (OPTIONAL):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Sent via PhonePe to referrer UPI"
                    value={referralNotesInput}
                    onChange={(e) => setReferralNotesInput(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => setSelectedReferralModal(null)} disabled={isProcessingReferral}>
                  Cancel
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDisburseReferralSubmit(null)}
                    disabled={isProcessingReferral || !referralUtrInput.trim()}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Record UTR Only
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleDisburseReferralSubmit('whatsapp')}
                    disabled={isProcessingReferral || !referralUtrInput.trim()}
                    startIcon={<MessageSquare size={14} />}
                    sx={{
                      bgcolor: '#16A34A',
                      fontWeight: 800,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#15803D' }
                    }}
                  >
                    Record & WhatsApp Slip
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal: Full System Truncate Confirmation */}
        <Dialog
          open={showTruncateConfirm}
          onClose={() => !isTruncating && setShowTruncateConfirm(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: '16px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
            <RotateCcw size={18} />
            <span>Full System Reset (Truncate)?</span>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '13px', lineHeight: 1.5 }}>
              This will wipe all test bookings, customer payments, quote items, technician registrations, and customer accounts so you can test all flows cleanly from scratch.
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, display: 'block' }}>
                Safe Preservations:
              </Typography>
              <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block' }}>
                - Platform settings and reward configs are preserved.
              </Typography>
              <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block' }}>
                - Admin logins, services catalog, and coupons are preserved.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" onClick={() => setShowTruncateConfirm(false)} disabled={isTruncating}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleTruncateData}
              disabled={isTruncating}
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              {isTruncating ? 'Truncating Full System...' : 'Confirm Full System Wipe'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
