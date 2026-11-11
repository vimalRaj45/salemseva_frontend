import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  MenuItem,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';

const SALEM_LOCALITIES = [
  'Fairlands, Salem',
  'Hasthampatti, Salem',
  'Alagapuram, Salem',
  'Suramangalam, Salem',
  'Meyyanur, Salem',
  'Ammapet, Salem',
  'Shevapet, Salem',
  'Gugai, Salem',
  'Kondalampatti, Salem',
  'Kannankurichi, Salem',
  'Gorimedu, Salem',
  'Steel Plant Area, Salem'
];

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile data from database
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locality, setLocality] = useState(SALEM_LOCALITIES[0]);
  const [address, setAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [memberSince, setMemberSince] = useState('');

  // Fetch real customer record from PostgreSQL database
  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        const phoneParam = user?.phone || localStorage.getItem('shazuone_customer_phone') || '';
        const idParam = user?.id || '';

        if (!phoneParam && !idParam) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const queryParam = idParam
          ? `id=${encodeURIComponent(idParam)}`
          : `phone=${encodeURIComponent(phoneParam)}`;

        const res = await fetch(`${API_V1_URL}/customer/profile?${queryParam}`);
        const data = await res.json();

        if (data.success && data.customer && isMounted) {
          const c = data.customer;
          setFullName(c.fullName || c.name || '');
          setPhone(c.phone || phoneParam);
          setEmail(c.email || '');
          setLocality(c.locality || SALEM_LOCALITIES[0]);
          setAddress(c.defaultAddress || c.address || '');
          setWalletBalance(c.walletBalance || 0);
          setReferralCode(c.referralCode || '');
          setTotalBookings(c.totalBookings || 0);
          setCompletedBookings(c.completedBookings || 0);
          setReferralCount(c.referralCount || 0);
          if (c.createdAt) {
            setMemberSince(new Date(c.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric'
            }));
          }
          updateUser(c);
        } else if (isMounted && user) {
          // Fallback to active user session object if available
          setFullName(user.name || user.fullName || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
          setLocality(user.locality || SALEM_LOCALITIES[0]);
          setAddress(user.address || user.defaultAddress || '');
          setWalletBalance(parseFloat(user.walletBalance || 0));
          setReferralCode(user.referralCode || '');
        }
      } catch (err) {
        console.warn('Could not fetch customer record from DB:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCustomerProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.phone]);

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard');
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_V1_URL}/customer/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          phone: phone || user?.phone,
          fullName: fullName.trim(),
          email: email.trim(),
          locality,
          address: address.trim()
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile record');
      }

      updateUser({
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        locality,
        address: address.trim(),
        defaultAddress: address.trim()
      });

      toast.success('Customer profile updated in database');
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} sx={{ color: '#0A5CC4' }} />
      </Box>
    );
  }

  const initial = fullName ? fullName.charAt(0).toUpperCase() : 'C';

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 10 }}>
      {/* Top Header Bar */}
      <Box sx={{ bgcolor: 'var(--cz-chrome-bg, #EBF3FE)', borderBottom: '1px solid var(--cz-chrome-border, #C7DBF7)', py: 1.5, px: 2, position: 'sticky', top: 0, zIndex: 100 }}>
        <Container maxWidth="sm" sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#0F172A', p: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', letterSpacing: '-0.02em' }}>
              My Account & Profile
            </Typography>
          </Box>
          <Chip
            icon={<VerifiedUserOutlinedIcon sx={{ fontSize: '13px !important', color: '#16A34A !important' }} />}
            label="Verified Member"
            size="small"
            sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '10.5px', height: 22, borderRadius: '4px' }}
          />
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, pt: 2.5 }}>
        {/* 1. Hero Identity Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #1E293B',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#0A5CC4',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 800,
                border: '2px solid #38BDF8'
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: '17px', color: '#FFFFFF', lineHeight: 1.2 }}>
                {fullName || 'Salem Customer'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '12px', mt: 0.3 }}>
                {phone || 'No phone recorded'}
              </Typography>
              {memberSince && (
                <Typography variant="caption" sx={{ color: '#38BDF8', fontSize: '11px', fontWeight: 600, display: 'block', mt: 0.2 }}>
                  Member since {memberSince} • Salem
                </Typography>
              )}
            </Box>
          </Box>

          {/* Quick Metrics from Database */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 2.5, pt: 2, borderTop: '1px solid #1E293B', textAlign: 'center' }}>
            <Box sx={{ bgcolor: '#1E293B', p: 1, borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block' }}>
                Wallet
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', fontSize: '14px' }}>
                ₹{walletBalance.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#1E293B', p: 1, borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block' }}>
                Bookings
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', fontSize: '14px' }}>
                {totalBookings}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#1E293B', p: 1, borderRadius: '8px' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px', display: 'block' }}>
                Completed
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FBBF24', fontSize: '14px' }}>
                {completedBookings}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 2. Referral Code Card */}
        {referralCode && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: '#FFFFFF',
              borderRadius: '14px',
              border: '1.5px dashed #93C5FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  color: '#0A5CC4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CardGiftcardOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Your Salem Referral Code
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0A5CC4', fontSize: '15px', letterSpacing: '0.05em' }}>
                  {referralCode}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block' }}>
                  Friends get ₹50 off • {referralCount} referrals claimed
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCopyReferral}
              startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
              sx={{
                borderColor: '#BFDBFE',
                color: '#0A5CC4',
                fontWeight: 700,
                fontSize: '11.5px',
                textTransform: 'none',
                borderRadius: '8px',
                py: 0.6,
                px: 1.2,
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' }
              }}
            >
              Copy
            </Button>
          </Paper>
        )}

        {/* 3. Account Information Form */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSaveProfile}
          sx={{
            p: 2.5,
            bgcolor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', mb: 2 }}>
            Personal & Address Records
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', display: 'block', mb: 0.6 }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13.5px',
                    fontWeight: 600
                  }
                }}
              />
            </Box>

            {/* Mobile Number (Read-only verified) */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', display: 'block', mb: 0.6 }}>
                Mobile Number (Verified via OTP)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={phone}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F1F5F9',
                    fontSize: '13.5px',
                    fontWeight: 600
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', mt: 0.4, display: 'block' }}>
                Primary phone is linked to OTP authentication and order SMS.
              </Typography>
            </Box>

            {/* Email Address */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', display: 'block', mb: 0.6 }}>
                Email Address (for Invoices & Receipts)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@domain.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13.5px',
                    fontWeight: 600
                  }
                }}
              />
            </Box>

            {/* Service Locality */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', display: 'block', mb: 0.6 }}>
                Salem Operational Locality
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13.5px',
                    fontWeight: 600
                  }
                }}
              >
                {SALEM_LOCALITIES.map((loc) => (
                  <MenuItem key={loc} value={loc} sx={{ fontSize: '13px', fontWeight: 600 }}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Home / Doorstep Address */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', display: 'block', mb: 0.6 }}>
                Complete Doorstep Address
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Landmark, Salem"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <HomeOutlinedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '13.5px',
                    fontWeight: 500
                  }
                }}
              />
            </Box>

            {/* Save Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <SaveOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: '10px',
                bgcolor: '#0A5CC4',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 92, 196, 0.25)',
                '&:hover': { bgcolor: '#084B9E' }
              }}
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </Box>
        </Paper>

        {/* 4. Quick Account Actions */}
        <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/history')}
            startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              py: 1,
              borderRadius: '10px',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'none',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            View My Booking History & Invoices
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/wallet')}
            startIcon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              py: 1,
              borderRadius: '10px',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'none',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            Manage Shazu One Wallet (₹{walletBalance.toFixed(2)})
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
