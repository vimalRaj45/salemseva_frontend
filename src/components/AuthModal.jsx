import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Paper,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ShieldIcon from '@mui/icons-material/Shield';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FlagIcon from '@mui/icons-material/Flag';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const navigate = useNavigate();
  const {
    user,
    authModalOpen,
    closeAuthModal,
    authInitialTab,
    loginWithPhonePassword,
    signupCustomer,
    signupTechnician,
    loginAsPreset,
    loginAsCustomer,
    loginAsTechnician,
    dbTechnicians,
    dbCustomers
  } = useAuth();
  const SEEDED_CUSTOMERS = dbCustomers || [];
  const VERIFIED_TECHNICIANS = dbTechnicians || [];

  const [activeTab, setActiveTab] = useState(authInitialTab || 'customer');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  
  // Form State
  const [phone, setPhone] = useState('98427 11234');
  const [password, setPassword] = useState('salem123');
  const [name, setName] = useState('Vimal Raj');
  const [address, setAddress] = useState('42, 3rd Cross, Fairlands Main Road');
  const [locality, setLocality] = useState('Fairlands, Salem');
  const [referralCode, setReferralCode] = useState('SALEM100');
  
  // Technician Specific Fields
  const [trade, setTrade] = useState('ac');
  const [aadhaar, setAadhaar] = useState('5482 9102 8901');
  const [serviceArea, setServiceArea] = useState('Fairlands & Hasthampatti');

  // UI state
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (authInitialTab) {
      setActiveTab(authInitialTab);
      if (authInitialTab === 'customer') {
        setPhone('98427 11234');
        setName('Vimal Raj');
      } else if (authInitialTab === 'technician') {
        setPhone('94432 88901');
        setName('K. Ramesh');
      } else if (authInitialTab === 'admin') {
        setPhone('90030 99999');
        setName('Salem Ops Admin');
      }
    }
  }, [authInitialTab, authModalOpen]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setStatusMessage(null);
    if (newValue === 'customer') {
      setPhone('98427 11234');
      setName('Vimal Raj');
    } else if (newValue === 'technician') {
      setPhone('94432 88901');
      setName('K. Ramesh');
    } else if (newValue === 'admin') {
      setPhone('90030 99999');
      setName('Salem Ops Admin');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      await new Promise(r => setTimeout(r, 450));

      if (activeTab === 'customer') {
        if (authMode === 'signup') {
          await signupCustomer({
            name,
            phone,
            password,
            address,
            locality,
            referralCode: referralCode.trim()
          });
        } else {
          await loginWithPhonePassword(phone, password, 'customer');
        }
      } else if (activeTab === 'technician') {
        if (authMode === 'signup') {
          await signupTechnician({
            name,
            phone,
            password,
            trade,
            aadhaar,
            serviceArea
          });
        } else {
          await loginWithPhonePassword(phone, password, 'technician');
        }
      } else if (activeTab === 'admin') {
        await loginWithPhonePassword(phone, password, 'admin');
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Authentication failed. Please check details.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetKey) => {
    setLoading(true);
    setTimeout(() => {
      loginAsPreset(presetKey);
      setLoading(false);
    }, 300);
  };

  const salemLocalities = [
    'Fairlands, Salem',
    'Hasthampatti, Salem',
    'Suramangalam / Junction, Salem',
    'Meyyanur, Salem',
    'Ammapet, Salem',
    'Shevapet, Salem',
    'Alagapuram, Salem',
    'Kondalampatti, Salem'
  ];

  return (
    <Dialog
      open={authModalOpen}
      onClose={() => {
        if (user) closeAuthModal();
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          border: '1px solid #334155',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header Bar */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: activeTab === 'technician' ? '#059669' : activeTab === 'admin' ? '#D97706' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}
          >
            {activeTab === 'technician' ? (
              <EngineeringIcon sx={{ fontSize: 18 }} />
            ) : activeTab === 'admin' ? (
              <ShieldIcon sx={{ fontSize: 18 }} />
            ) : (
              <HomeRepairServiceIcon sx={{ fontSize: 18 }} />
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFF', fontSize: '15px', lineHeight: 1.2 }}>
              SalemSeva account
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '11px' }}>
              Salem home services marketplace
            </Typography>
          </Box>
        </Box>

        {user && (
          <IconButton onClick={closeAuthModal} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Role Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          bgcolor: '#1E293B',
          borderBottom: '1px solid #334155',
          minHeight: 40,
          '& .MuiTabs-indicator': {
            bgcolor: activeTab === 'technician' ? '#10B981' : activeTab === 'admin' ? '#D97706' : '#2563EB',
            height: 2
          },
          '& .MuiTab-root': {
            color: '#94A3B8',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'none',
            py: 1,
            minHeight: 40,
            '&.Mui-selected': {
              color: '#FFFFFF'
            }
          }
        }}
      >
        <Tab label="Customer" value="customer" />
        <Tab label="Technician" value="technician" />
        <Tab label="Admin" value="admin" />
      </Tabs>

      <DialogContent sx={{ p: 2.5 }}>
        
        {/* Quick Demo Selector */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            mb: 2,
            bgcolor: '#1E293B',
            borderRadius: '8px',
            border: '1px solid #334155'
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '10.5px', display: 'block', mb: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quick demo profiles
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handlePresetSelect('customer')}
              startIcon={<PersonIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: '#0F172A',
                borderColor: '#334155',
                color: '#E2E8F0',
                textTransform: 'none',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.5,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#2563EB', borderColor: '#2563EB', color: '#FFF' }
              }}
            >
              Customer
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                handlePresetSelect('technicianVerified');
                navigate('/partner');
              }}
              startIcon={<EngineeringIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: '#0F172A',
                borderColor: '#334155',
                color: '#E2E8F0',
                textTransform: 'none',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.5,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#059669', borderColor: '#059669', color: '#FFF' }
              }}
            >
              Technician
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                handlePresetSelect('admin');
                navigate('/admin');
              }}
              startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: '#0F172A',
                borderColor: '#334155',
                color: '#E2E8F0',
                textTransform: 'none',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.5,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#D97706', borderColor: '#D97706', color: '#FFF' }
              }}
            >
              Admin
            </Button>
          </Box>
        </Paper>

        {/* 1-Click Customer Profiles Grid */}
        {activeTab === 'customer' && SEEDED_CUSTOMERS && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: '#0B1329',
              borderRadius: '8px',
              border: '1.5px solid #2563EB'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⚡ 1-Click Customer Login (Select Account):
              </Typography>
              <Chip label="Salem Resident" size="small" sx={{ bgcolor: '#1E3A8A', color: '#93C5FD', fontWeight: 700, fontSize: '9.5px', height: 18 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
              {SEEDED_CUSTOMERS.map((cust) => (
                <Button
                  key={cust.id}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    loginAsCustomer(cust);
                    navigate('/');
                  }}
                  sx={{
                    bgcolor: '#1E293B',
                    borderColor: '#334155',
                    color: '#FFFFFF',
                    p: 0.8,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 1,
                    textTransform: 'none',
                    textAlign: 'left',
                    '&:hover': { bgcolor: '#1D4ED8', borderColor: '#3B82F6' }
                  }}
                >
                  <Box sx={{ bgcolor: '#0F172A', p: 0.5, borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                  </Box>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '11.5px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cust.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '9.5px', display: 'block' }}>
                      {cust.locality.split(',')[0]} • ₹{cust.walletBalance}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Paper>
        )}

        {/* 1-Click All 8 Verified Specialists Selection Grid for Technicians */}
        {activeTab === 'technician' && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: '#0B1329',
              borderRadius: '8px',
              border: '1.5px solid #059669'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⚡ 1-Click Login (Select Specialist):
              </Typography>
              <Chip label="Salem Verified" size="small" sx={{ bgcolor: '#065F46', color: '#6EE7B7', fontWeight: 700, fontSize: '9.5px', height: 18 }} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
              {VERIFIED_TECHNICIANS.map((tech) => {
                const getTradeIcon = (t) => {
                  if (t === 'electrician') return <BoltIcon sx={{ fontSize: 15, color: '#FBBF24' }} />;
                  if (t === 'ac') return <AcUnitIcon sx={{ fontSize: 15, color: '#38BDF8' }} />;
                  if (t === 'plumber') return <PlumbingIcon sx={{ fontSize: 15, color: '#60A5FA' }} />;
                  return <CleaningServicesIcon sx={{ fontSize: 15, color: '#34D399' }} />;
                };

                return (
                  <Button
                    key={tech.id}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      loginAsTechnician(tech);
                      navigate('/partner');
                    }}
                    sx={{
                      bgcolor: '#1E293B',
                      borderColor: '#334155',
                      color: '#FFFFFF',
                      p: 0.8,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 0.8,
                      textAlign: 'left',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#065F46', borderColor: '#059669' }
                    }}
                  >
                    {getTradeIcon(tech.trade)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '11px', lineHeight: 1.2, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tech.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '9px', display: 'block' }}>
                        {tech.trade.toUpperCase()} • ★ {tech.ratingAvg}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Paper>
        )}

        {statusMessage && (
          <Alert severity={statusMessage.type} sx={{ mb: 1.5, borderRadius: '6px', fontSize: '12px', py: 0.2 }}>
            {statusMessage.text}
          </Alert>
        )}

        {/* Login / Sign Up Toggle */}
        {activeTab !== 'admin' && (
          <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
            <Button
              fullWidth
              size="small"
              onClick={() => setAuthMode('login')}
              variant={authMode === 'login' ? 'contained' : 'outlined'}
              sx={{
                bgcolor: authMode === 'login' ? (activeTab === 'technician' ? '#059669' : '#2563EB') : 'transparent',
                borderColor: '#334155',
                color: '#FFF',
                borderRadius: '6px',
                fontWeight: 600,
                textTransform: 'none',
                py: 0.5,
                fontSize: '12px'
              }}
            >
              Sign in
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => setAuthMode('signup')}
              variant={authMode === 'signup' ? 'contained' : 'outlined'}
              sx={{
                bgcolor: authMode === 'signup' ? (activeTab === 'technician' ? '#059669' : '#2563EB') : 'transparent',
                borderColor: '#334155',
                color: '#FFF',
                borderRadius: '6px',
                fontWeight: 600,
                textTransform: 'none',
                py: 0.5,
                fontSize: '12px'
              }}
            >
              Create account
            </Button>
          </Box>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleAuthSubmit}>
          
          {/* Phone Field */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
            Phone number
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#1E293B',
                px: 1.2,
                py: 0.8,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 600,
                fontSize: '13px',
                color: '#FFFFFF',
                border: '1px solid #334155'
              }}
            >
              <FlagIcon sx={{ fontSize: 14, color: '#EA580C' }} /> +91
            </Paper>
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphoneIcon sx={{ color: '#64748B', fontSize: 16 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1E293B',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#334155' }
                }
              }}
            />
          </Box>

          {/* Password Field */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
            {activeTab === 'admin' ? 'Admin access key' : 'Password or OTP'}
          </Typography>
          <TextField
            fullWidth
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password or 4-digit code"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#64748B', fontSize: 16 }} />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1E293B',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '13px',
                '& fieldset': { borderColor: '#334155' }
              }
            }}
          />

          {/* Signup Fields for Customer */}
          {activeTab === 'customer' && authMode === 'signup' && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Full name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vimal Raj"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Salem neighborhood
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              >
                {salemLocalities.map((loc) => (
                  <MenuItem key={loc} value={loc} sx={{ fontSize: '13px' }}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Street address
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door no, street name"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Referral code (optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="SALEM100"
                helperText="Use SALEM100 for ₹100 credit on your first booking"
                FormHelperTextProps={{ sx: { color: '#64748B', fontSize: '11px', mt: 0.3 } }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#6EE7B7',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />
            </>
          )}

          {/* Signup Fields for Technician */}
          {activeTab === 'technician' && authMode === 'signup' && (
            <>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Technician full name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. K. Ramesh"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Primary trade
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              >
                <MenuItem value="ac" sx={{ fontSize: '13px' }}>AC repair and service</MenuItem>
                <MenuItem value="electrician" sx={{ fontSize: '13px' }}>Electrician and wiring</MenuItem>
                <MenuItem value="plumber" sx={{ fontSize: '13px' }}>Plumbing and sanitary</MenuItem>
                <MenuItem value="cleaning" sx={{ fontSize: '13px' }}>Home cleaning</MenuItem>
              </TextField>

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Aadhaar number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                placeholder="12-digit number"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Service zone
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Fairlands, Hasthampatti"
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#334155' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ fontWeight: 600, color: '#34D399', display: 'block', mb: 0.5 }}>
                Technician referral code (optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. TECHRAMESH"
                helperText="Use a fellow technician's referral code to unlock +₹100 Welcome Tool Bonus"
                FormHelperTextProps={{ sx: { color: '#34D399', fontSize: '11px', mt: 0.3 } }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1E293B',
                    color: '#6EE7B7',
                    fontWeight: 600,
                    borderRadius: '6px',
                    fontSize: '13px',
                    '& fieldset': { borderColor: '#059669' }
                  }
                }}
              />

              <Typography variant="caption" sx={{ color: '#FCD34D', fontSize: '11px', display: 'block', mb: 1.5 }}>
                Note: Initial registrations require skill verification at the Salem hub before going on duty.
              </Typography>
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="medium"
            disabled={loading}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: activeTab === 'technician' ? '#059669' : activeTab === 'admin' ? '#D97706' : '#2563EB',
              borderRadius: '6px',
              py: 1,
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              mt: 1,
              '&:hover': {
                bgcolor: activeTab === 'technician' ? '#047857' : activeTab === 'admin' ? '#B45309' : '#1D4ED8'
              }
            }}
          >
            {loading ? 'Authenticating...' : (
              authMode === 'signup'
                ? `Create ${activeTab === 'technician' ? 'technician' : 'customer'} profile`
                : `Log in as ${activeTab === 'technician' ? 'technician' : activeTab === 'admin' ? 'admin' : 'customer'}`
            )}
          </Button>

        </Box>

      </DialogContent>
    </Dialog>
  );
}
