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
import StarsIcon from '@mui/icons-material/Stars';

import { useAuth } from '../../context/AuthContext';

export default function WalletHubPage({ onOpenVoiceAgent }) {
  const navigate = useNavigate();
  const { walletBalance, simulateCustomerReferral, user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-001',
      title: 'Welcome Signup Bonus',
      amount: 50,
      type: 'CREDIT',
      category: 'SIGNUP_BONUS',
      timestamp: 'Sep 25, 2026',
      description: 'Instant +50 Seva Credits for registering on SalemSeva'
    },
    {
      id: 'tx-002',
      title: 'Referral: Kavitha (1st Service Done)',
      amount: 100,
      type: 'CREDIT',
      category: 'REFERRAL_REWARD',
      timestamp: 'Sep 28, 2026',
      description: 'Friend Kavitha completed AC service in Meyyanur (+100 Credits)'
    }
  ]);
  const [referralStats, setReferralStats] = useState({
    friendsInvited: 3,
    friendsCompleted: 1,
    creditsEarned: 100
  });

  const myReferralCode = user?.referralCodeUsed || 'SALEM100';

  useEffect(() => {
    fetch('https://salemseva-backend.onrender.com/api/v1/wallet/customer')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.transactions && data.transactions.length > 0) {
            setTransactions(data.transactions);
          }
          setReferralStats({
            friendsInvited: data.friendsInvited || 3,
            friendsCompleted: data.friendsCompleted || 1,
            creditsEarned: data.creditsEarnedFromReferrals || 100
          });
        }
      })
      .catch(err => console.warn('Wallet data fetch note:', err));
  }, [walletBalance]);

  const copyCode = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    setToastMessage(`Referral code ${myReferralCode} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `வணக்கம்! சேலத்தில் நம்பகமான எலக்ட்ரீசியன், பிளம்பர், AC சர்வீஸ் பெற SalemSeva பயன்பாட்டைப் பயன்படுத்துங்கள். \n\nஎனது ரெஃபரல் கோட் *${myReferralCode}* பயன்படுத்தி முதல் புக்கிங்கில் ₹50 தள்ளுபடி பெறுங்கள்: http://localhost:3000/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSimulateFriendBooking = async () => {
    const friendNames = ['Kavitha S.', 'Suresh Kumar', 'Anand M.', 'Meena R.'];
    const localities = ['Meyyanur, Salem', 'Hasthampatti, Salem', 'Suramangalam, Salem', 'Fairlands, Salem'];
    const randomFriend = friendNames[Math.floor(Math.random() * friendNames.length)];
    const randomLocality = localities[Math.floor(Math.random() * localities.length)];

    await simulateCustomerReferral(randomFriend, randomLocality);
    
    const newTx = {
      id: `tx-${Date.now()}`,
      title: `Referral: ${randomFriend} (Completed)`,
      amount: 100,
      type: 'CREDIT',
      category: 'REFERRAL_REWARD',
      timestamp: 'Just now',
      description: `Friend ${randomFriend} completed 1st service in ${randomLocality} (+100 Credits)`
    };

    setTransactions(prev => [newTx, ...prev]);
    setReferralStats(prev => ({
      ...prev,
      friendsCompleted: prev.friendsCompleted + 1,
      creditsEarned: prev.creditsEarned + 100
    }));

    setToastMessage(`🎉 Friend ${randomFriend} completed service in ${randomLocality}! +100 Seva Credits unlocked.`);
  };

  const formatTxDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    if (dateStr.includes('Sep') || dateStr.includes('Oct') || dateStr.includes('Just')) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Top Header with Back Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                bgcolor: '#FFFFFF', 
                border: '1px solid #CBD5E1', 
                color: '#0F172A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: '#F1F5F9' }
              }}
              size="small"
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '18px', lineHeight: 1.2 }}>
                Seva Credits & Rewards
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                Salem community wallet & referral hub
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={<StarsIcon sx={{ fontSize: '14px !important', color: '#166534 !important' }} />}
            label="1 Credit = ₹1" 
            size="small" 
            sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 800, fontSize: '11px', borderRadius: '6px' }} 
          />
        </Box>
        
        {/* 1. Hero Balance Blue Card */}
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            color: '#FFFFFF',
            borderRadius: '20px',
            p: 2.5,
            mb: 2.5,
            boxShadow: '0 6px 20px rgba(2, 132, 199, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.8, opacity: 0.9, fontSize: '11px', textTransform: 'uppercase' }}>
            AVAILABLE SEVA CREDITS BALANCE
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, my: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
              }}
            >
              <StarIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: -0.5 }}>
              {walletBalance} <span style={{ fontSize: 18, fontWeight: 700 }}>Credits</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={`₹${walletBalance} Cash Value`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 800, fontSize: '11px' }}
            />
            <Chip
              label="20% Max Burn Cap / Booking"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 800, fontSize: '11px' }}
            />
            <Chip
              label="100% Usable Across Salem"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 800, fontSize: '11px' }}
            />
          </Box>
        </Card>

        {/* 2. Referral Hub Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1.5px solid #0284C7',
            borderRadius: '20px',
            p: 2.2,
            mb: 2.5,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShareIcon sx={{ color: '#0284C7', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14.5px' }}>
                Refer Friends in Salem
              </Typography>
            </Box>
            <Chip
              label="EARN ₹100 / FRIEND"
              size="small"
              sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 900, fontSize: '10px', height: 22 }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px', lineHeight: 1.45, mb: 1.8 }}>
            Give friends <strong>₹50 OFF</strong> their first home service. You get <strong>100 Seva Credits (₹100)</strong> instantly credited when their service is completed!
          </Typography>

          {/* Referral Code Box */}
          <Paper
            elevation={0}
            sx={{
              p: 1.4,
              bgcolor: '#F8FAFC',
              border: '1.5px dashed #0284C7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: 700 }}>
                YOUR REFERRAL CODE:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0284C7', letterSpacing: 1.5 }}>
                {myReferralCode}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant="contained"
                onClick={copyCode}
                startIcon={copied ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: copied ? '#10B981' : '#0284C7',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  px: 1.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: copied ? '#059669' : '#0369A1' }
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={shareWhatsApp}
                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  px: 1.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#128C7E' }
                }}
              >
                Share
              </Button>
            </Box>
          </Paper>

          {/* Referral Stats Counter */}
          <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#F1F5F9', borderRadius: '10px', mb: 1.8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                {referralStats.friendsInvited}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                Friends Invited
              </Typography>
            </Box>
            <Box sx={{ borderLeft: '1px solid #CBD5E1', borderRight: '1px solid #CBD5E1' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#16A34A', fontSize: '15px' }}>
                {referralStats.friendsCompleted}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                Completed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284C7', fontSize: '15px' }}>
                ₹{referralStats.creditsEarned}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                Credits Earned
              </Typography>
            </Box>
          </Paper>

          {/* Simulate Friend Booking Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<CampaignIcon />}
            onClick={handleSimulateFriendBooking}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '14px',
              py: 1.1,
              fontWeight: 800,
              fontSize: '12.5px',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            ⚡ Test Simulation: Friend Completes 1st Service (+100 Credits)
          </Button>
        </Card>

        {/* 3. Credits Activity History Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            p: 2.2,
            mb: 3,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5, fontSize: '13.5px' }}>
            Credits Activity Ledger ({transactions.length} entries)
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {transactions.map((tx, idx) => {
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
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
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
            })}
          </Box>
        </Card>

        {/* 4. Action Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/')}
          sx={{
            bgcolor: '#0284C7',
            borderRadius: '16px',
            py: 1.4,
            fontWeight: 900,
            fontSize: '15px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#0369A1' }
          }}
        >
          Book Home Service & Redeem Credits
        </Button>

      </Container>

      {/* Floating AI Voice Mic Button */}
      <Fab
        onClick={onOpenVoiceAgent}
        sx={{
          position: 'fixed',
          bottom: 72,
          right: { xs: 20, sm: 'calc(50% - 260px)' },
          width: 54,
          height: 54,
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
          zIndex: 1050
        }}
      >
        <MicIcon sx={{ fontSize: 26 }} />
      </Fab>

      {/* Bottom Navigation */}
      <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={3} sx={{ height: 60, '& .Mui-selected': { color: '#0284C7', fontWeight: 800 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 22 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="AI Voice" icon={<GraphicEqIcon sx={{ fontSize: 22, color: '#0284C7' }} />} sx={{ color: '#0284C7' }} onClick={onOpenVoiceAgent} />
          <BottomNavigationAction label="History" icon={<ReceiptLongIcon sx={{ fontSize: 22 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet & Hub" icon={<AccountCircleIcon sx={{ fontSize: 22 }} />} sx={{ color: '#0284C7' }} />
        </BottomNavigation>
      </Paper>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)} sx={{ borderRadius: '10px', fontWeight: 700 }}>
          {toastMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}
