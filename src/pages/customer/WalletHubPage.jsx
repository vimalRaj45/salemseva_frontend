import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import ShareIcon from '@mui/icons-material/Share';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShieldIcon from '@mui/icons-material/Shield';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SecurityIcon from '@mui/icons-material/Security';

import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function WalletHubPage() {
  const navigate = useNavigate();
  const {
    walletBalance,
    user,
    rewardSettings,
    registerPasskey,
    checkPasskeySupport,
    getPasskeyStatus,
    deletePasskey
  } = useAuth();

  const rewardCredits = parseFloat(rewardSettings?.customer_referral_credits || 50);
  const refereeDiscount = parseFloat(rewardSettings?.referee_discount_amount || 50);

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [referralStats, setReferralStats] = useState({
    friendsInvited: 0,
    friendsCompleted: 0,
    creditsEarned: 0
  });

  const [passkeyStatus, setPasskeyStatus] = useState({ hasPasskey: false, count: 0, lastLinked: null });
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(true);

  const myReferralCode = user?.referralCodeUsed || 'SHAZU100';

  const loadPasskeyStatus = async () => {
    if (!user?.phone) return;
    try {
      const isSupp = await checkPasskeySupport();
      setPasskeySupported(isSupp);
      const res = await getPasskeyStatus(user.phone);
      if (res && res.success) {
        setPasskeyStatus(res);
      }
    } catch (e) {
      console.warn('Failed to load passkey status:', e);
    }
  };

  useEffect(() => {
    loadPasskeyStatus();
  }, [user?.phone]);

  const handleEnablePasskey = async () => {
    if (!user?.phone) return;
    setPasskeyLoading(true);
    try {
      const result = await registerPasskey(user.phone);
      if (result && result.success) {
        toast.success('Passkey linked successfully. You can now use Fingerprint or Face ID to sign in.');
        await loadPasskeyStatus();
      }
    } catch (err) {
      toast.error(err.message || 'Passkey registration cancelled or failed');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleUnlinkPasskey = async () => {
    if (!window.confirm('Are you sure you want to remove your biometric passkey from this device?')) return;
    setPasskeyLoading(true);
    try {
      await deletePasskey(user.phone);
      toast.success('Biometric passkey unlinked successfully');
      await loadPasskeyStatus();
    } catch (err) {
      toast.error(err.message || 'Failed to remove passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_V1_URL}/wallet/customer`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          } else {
            setTransactions([]);
          }
          setReferralStats({
            friendsInvited: data.friendsInvited || 0,
            friendsCompleted: data.friendsCompleted || 0,
            creditsEarned: data.creditsEarnedFromReferrals || 0
          });
        }
      })
      .catch(err => console.warn('Wallet data fetch note:', err));
  }, [walletBalance]);

  const copyCode = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    toast.success(`Referral code ${myReferralCode} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `வணக்கம்! சேலத்தில் நம்பகமான எலக்ட்ரீசியன், பிளம்பர், AC சர்வீஸ் பெற Shazu One பயன்பாட்டைப் பயன்படுத்துங்கள். \n\nஎனது ரெஃபரல் கோட் *${myReferralCode}* பயன்படுத்தி முதல் புக்கிங்கில் ₹${refereeDiscount} தள்ளுபடி பெறுங்கள்: ${window.location.origin}/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const formatTxDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    if (dateStr.includes('Sep') || dateStr.includes('Oct') || dateStr.includes('Just')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 1, md: 2 } }}>
        
        {/* Top Header with Back Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                bgcolor: '#FFFFFF', 
                border: '1.5px solid #CBD5E1', 
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#F1F5F9' }
              }}
              size="small"
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                Seva Credits & Rewards
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                Salem community wallet & referral hub
              </Typography>
            </Box>
          </Box>
          <Chip 
            label="10 Credits = ₹1" 
            size="small" 
            sx={{ bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 800, fontSize: '11px', borderRadius: '6px' }} 
          />
        </Box>
        
        {/* If user is not logged in, prompt to sign in */}
        {!user ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', mb: 3 }}>
            <AccountCircleIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px', mb: 0.5 }}>
              Sign In to View Seva Escrow Wallet
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px', mb: 2 }}>
              Access your referral credits, welcome bonus, and digital cashback balance.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ bgcolor: '#0066CC', color: '#FFF', fontWeight: 700, fontSize: '13px', borderRadius: '8px', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0052A3' } }}
            >
              Sign In
            </Button>
          </Paper>
        ) : (
          <>
            {/* 1. Hero Balance Salem Sapphire Card with 100% Readable Typography */}
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #0A2540 0%, #004085 55%, #0066CC 100%)',
                color: '#FFFFFF',
                borderRadius: '20px',
                p: { xs: 2.5, sm: 3 },
                mb: 2.5,
                boxShadow: '0 8px 28px rgba(0, 64, 133, 0.28)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {/* Subtle background glow effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 102, 0, 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  {/* High contrast uppercase balance label */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 1.2,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: '#93C5FD',
                      display: 'block',
                      mb: 0.8
                    }}
                  >
                    AVAILABLE SEVA CREDITS BALANCE
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2, mb: 0.8 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: '#F59E0B',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.5)',
                        verticalAlign: 'middle'
                      }}
                    >
                      <StarIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: -0.5,
                        fontSize: { xs: '32px', sm: '38px' },
                        lineHeight: 1
                      }}
                    >
                      {walletBalance}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: '#E0F2FE',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}
                    >
                      Credits
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#E2E8F0',
                      fontSize: '12px',
                      mb: 2,
                      lineHeight: 1.3
                    }}
                  >
                    10 Credits = ₹1 Cash Value • Redeemable across any home service in Salem
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`₹${(walletBalance / 10).toFixed(2)} Cash Value (10 Credits = ₹1)`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.18)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '11px',
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Chip
                      label="20% Max Burn Cap / Booking"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.18)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '11px',
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                  </Box>
                </Box>

                {/* Vector Glass Wallet Icon Badge */}
                <Box
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: '20px',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    flexShrink: 0,
                    ml: 2
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#FDE047' }} />
                </Box>
              </Box>
            </Card>

            {/* 2. 100% Escrow Protection & Safety Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.8,
                boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '12px',
                  bgcolor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', mb: 0.3 }}>
                  100% Cashless Escrow Protection & Safety
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px', display: 'block', lineHeight: 1.45 }}>
                  Payment is held safely in Shazu One escrow. Funds are released to verified technicians only after your OTP service completion verification.
                </Typography>
              </Box>
            </Paper>

            {/* 3. Referral Hub Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '20px',
                p: { xs: 2.2, sm: 2.8 },
                mb: 2.5,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShareIcon sx={{ color: '#0066CC', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px' }}>
                    Refer Friends & Family in Salem
                  </Typography>
                </Box>
                <Chip
                  label={`EARN ${rewardCredits} CREDITS (₹${(rewardCredits / 10).toFixed(0)}) / FRIEND`}
                  size="small"
                  sx={{ bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 900, fontSize: '10.5px', height: 22 }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#334155', fontSize: '12.5px', lineHeight: 1.5, mb: 2 }}>
                Give friends <strong>₹{refereeDiscount} OFF</strong> their first home service. You get <strong>{rewardCredits} Seva Credits (₹{(rewardCredits / 10).toFixed(0)} value)</strong> credited directly to your wallet when their service is completed!
              </Typography>

              {/* Referral Code Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  bgcolor: '#F8FAFC',
                  border: '1.5px dashed #94A3B8',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10.5px', fontWeight: 700 }}>
                    YOUR REFERRAL CODE:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0066CC', letterSpacing: 2, fontSize: '17px' }}>
                    {myReferralCode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={copyCode}
                    startIcon={copied ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: copied ? '#10B981' : '#0066CC',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '11.5px',
                      px: 1.8,
                      py: 0.8,
                      textTransform: 'none',
                      '&:hover': { bgcolor: copied ? '#059669' : '#0052A3' }
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={shareWhatsApp}
                    startIcon={<WhatsAppIcon sx={{ fontSize: 17 }} />}
                    sx={{
                      bgcolor: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '11.5px',
                      px: 1.8,
                      py: 0.8,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#15803D' }
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Paper>

              {/* Referral Stats Counter */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '17px' }}>
                    {referralStats.friendsInvited}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                    Friends Invited
                  </Typography>
                </Box>
                <Box sx={{ borderLeft: '1px solid #CBD5E1', borderRight: '1px solid #CBD5E1' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#059669', fontSize: '17px' }}>
                    {referralStats.friendsCompleted}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                    Completed
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0066CC', fontSize: '17px' }}>
                    {referralStats.creditsEarned} pts (₹{(referralStats.creditsEarned / 10).toFixed(0)})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>
                    Credits Earned
                  </Typography>
                </Box>
              </Paper>
            </Card>

            {/* 3b. Biometric Passkey & 1-Tap Login Security Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '20px',
                p: { xs: 2.2, sm: 2.8 },
                mb: 2.5,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FingerprintIcon sx={{ color: '#0066CC', fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px', lineHeight: 1.2 }}>
                      Biometric Passkey (கைரேகை / Face ID)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px', fontWeight: 500 }}>
                      Fast, passwordless 1-tap authentication using your device hardware
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={passkeyStatus.hasPasskey ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#047857 !important' }} /> : <SecurityIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
                  label={passkeyStatus.hasPasskey ? 'Passkey Active' : 'Not Linked'}
                  size="small"
                  sx={{
                    bgcolor: passkeyStatus.hasPasskey ? '#ECFDF5' : '#F1F5F9',
                    color: passkeyStatus.hasPasskey ? '#047857' : '#475569',
                    border: `1px solid ${passkeyStatus.hasPasskey ? '#A7F3D0' : '#CBD5E1'}`,
                    fontWeight: 800,
                    fontSize: '11px',
                    height: 24
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#334155', fontSize: '12.5px', lineHeight: 1.5, mb: 2 }}>
                {passkeyStatus.hasPasskey
                  ? 'Your device biometric key is linked. You can log in instantly without typing passwords or waiting for WhatsApp OTP.'
                  : 'Link your fingerprint scanner, Face ID, or Windows Hello to your account. Enjoy secure 1-tap sign-ins across all your visits.'}
              </Typography>

              {passkeyStatus.hasPasskey && passkeyStatus.lastLinked && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', p: 1.2, borderRadius: '8px', border: '1px solid #E2E8F0', mb: 2 }}>
                  <VpnKeyIcon sx={{ fontSize: 16, color: '#0284C7' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px' }}>
                    Active Credentials: <strong>{passkeyStatus.count} Key{passkeyStatus.count > 1 ? 's' : ''}</strong> • Last Registered: <strong>{formatTxDate(passkeyStatus.lastLinked)}</strong>
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleEnablePasskey}
                  disabled={passkeyLoading || !passkeySupported}
                  startIcon={<FingerprintIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#0066CC',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 2.2,
                    py: 1,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0052A3', boxShadow: 'none' }
                  }}
                >
                  {passkeyLoading ? 'Authenticating...' : (passkeyStatus.hasPasskey ? 'Add / Re-link Biometric Key' : 'Enable 1-Tap Biometric Passkey')}
                </Button>

                {passkeyStatus.hasPasskey && (
                  <Button
                    variant="outlined"
                    onClick={handleUnlinkPasskey}
                    disabled={passkeyLoading}
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      '&:hover': { borderColor: '#FECACA', bgcolor: '#FEF2F2' }
                    }}
                  >
                    Unlink Passkey
                  </Button>
                )}
              </Box>
            </Card>

            {/* 4. Credits Activity History Card */}
            <Card
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: '20px',
                p: { xs: 2.2, sm: 2.8 },
                mb: 3,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5, fontSize: '14px' }}>
                Credits Activity Ledger ({transactions.length} entries)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {transactions.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                      No wallet transactions yet. Referral bonuses and credits used at checkout will be recorded here in real-time.
                    </Typography>
                  </Box>
                ) : (
                  transactions.map((tx, idx) => {
                    const isCredit = tx.type === 'CREDIT';
                    return (
                      <Box key={tx.id || idx}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box
                              sx={{
                                bgcolor: isCredit ? '#DCFCE7' : '#FEE2E2',
                                p: 0.8,
                                borderRadius: '10px',
                                color: isCredit ? '#166534' : '#991B1B',
                                display: 'flex'
                              }}
                            >
                              {isCredit ? (
                                tx.category === 'SIGNUP_BONUS' ? <CardGiftcardIcon sx={{ fontSize: 18 }} /> : <GroupAddIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <ShoppingBagIcon sx={{ fontSize: 18 }} />
                              )}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px', lineHeight: 1.2 }}>
                                {tx.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#475569', fontSize: '11px' }}>
                                {formatTxDate(tx.timestamp)} • {tx.description || (isCredit ? 'Credited to wallet' : 'Burned at checkout')}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 900,
                              color: isCredit ? '#047857' : '#DC2626',
                              fontSize: '13.5px'
                            }}
                          >
                            {isCredit ? `+${tx.amount}` : `-${tx.amount}`} Credits
                          </Typography>
                        </Box>
                        {idx < transactions.length - 1 && <Divider sx={{ my: 0.6 }} />}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Card>

            {/* 5. Action Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/')}
              sx={{
                bgcolor: '#0066CC',
                color: '#FFFFFF',
                borderRadius: '14px',
                py: 1.5,
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: '0 4px 16px rgba(0, 102, 204, 0.3)',
                textTransform: 'none',
                mb: { xs: 8, md: 2 },
                '&:hover': { bgcolor: '#0052A3' }
              }}
            >
              Book Home Service & Redeem Credits
            </Button>
          </>
        )}

      </Container>

      {/* Mobile-Only Bottom Navigation (Hidden on desktop/tablet >= 900px) */}
      <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
        <BottomNavigation showLabels value={2} sx={{ height: 56, '& .Mui-selected': { color: '#0066CC', fontWeight: 700 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} sx={{ color: '#0066CC' }} />
        </BottomNavigation>
      </Paper>

    </Box>
  );
}
