import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Container,
  Paper,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  CreditCard,
  FileText,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_V1_URL } from '../../config';
import DocumentUploadControl from '../../components/DocumentUploadControl';
import toast from 'react-hot-toast';

export default function PartnerProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, techUser, updateUser } = useAuth();

  const activeTech = techUser || user;

  const [profileName, setProfileName] = useState(
    activeTech?.name || activeTech?.full_name || localStorage.getItem('shazuone_partner_name') || ''
  );
  const [profileTrade, setProfileTrade] = useState(
    activeTech?.trade || activeTech?.primary_trade || localStorage.getItem('shazuone_partner_trade') || 'ac'
  );
  const [profileSecondaryTrades, setProfileSecondaryTrades] = useState(() => {
    try {
      const raw = localStorage.getItem('shazuone_partner_secondary_trades');
      return raw ? JSON.parse(raw) : (activeTech?.secondary_trades || []);
    } catch {
      return activeTech?.secondary_trades || [];
    }
  });
  const [profilePayoutPhone, setProfilePayoutPhone] = useState(
    activeTech?.payout_phone || activeTech?.phone || localStorage.getItem('shazuone_partner_phone') || ''
  );
  const [profileAadhaarUrl, setProfileAadhaarUrl] = useState(
    activeTech?.aadhaar_card_url || localStorage.getItem('shazuone_partner_aadhaar_url') || null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/partner');
    }
  };

  const handleProfilePrimaryTradeChange = (newTrade) => {
    setProfileTrade(newTrade);
    if (!profileSecondaryTrades.includes(newTrade)) {
      setProfileSecondaryTrades((prev) => [...prev, newTrade]);
    }
  };

  const toggleProfileSecondaryTrade = (tradeId) => {
    if (tradeId === profileTrade) return;
    setProfileSecondaryTrades((prev) =>
      prev.includes(tradeId) ? prev.filter((t) => t !== tradeId) : [...prev, tradeId]
    );
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    const updatedTrades = Array.from(new Set([profileTrade, ...profileSecondaryTrades]));

    const profileData = {
      name: profileName.trim(),
      full_name: profileName.trim(),
      primary_trade: profileTrade,
      secondary_trades: updatedTrades,
      payout_phone: profilePayoutPhone,
      aadhaar_card_url: profileAadhaarUrl
    };

    localStorage.setItem('shazuone_partner_name', profileName.trim());
    localStorage.setItem('shazuone_partner_trade', profileTrade);
    localStorage.setItem('shazuone_partner_secondary_trades', JSON.stringify(updatedTrades));
    if (profilePayoutPhone) localStorage.setItem('shazuone_partner_payout_phone', profilePayoutPhone);
    if (profileAadhaarUrl) localStorage.setItem('shazuone_partner_aadhaar_url', profileAadhaarUrl);

    try {
      const techId = activeTech?.id || activeTech?.technician_id || localStorage.getItem('shazuone_partner_id');
      if (techId) {
        await fetch(`${API_V1_URL}/technicians/${techId}/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
      }

      if (updateUser) {
        updateUser(profileData);
      }

      toast.success('Partner specialist profile & KYC updated!');
      setTimeout(() => {
        handleDismiss();
      }, 1000);
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
      toast.success('Profile saved on this device!');
      setTimeout(() => {
        handleDismiss();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <IconButton
          onClick={handleDismiss}
          aria-label="Go back"
          sx={{
            color: '#0F172A',
            bgcolor: '#F1F5F9',
            '&:hover': { bgcolor: '#E2E8F0' },
            width: 40,
            height: 40,
            borderRadius: '10px'
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Partner specialist profile & KYC
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            Manage verified trade skills, payout phone, and identity documents
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A66C2',
            flexShrink: 0
          }}
        >
          <User size={20} />
        </Box>
      </Box>

      {/* Main Content Form */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 } }}>
        <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Full Name Field */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 1 }}>
              Specialist full name *
            </Typography>
            <TextField
              fullWidth
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. K. Ramesh"
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#F8FAFC' } }}
            />
          </Paper>

          {/* Primary Trade Selection */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 0.5 }}>
              முதன்மைத் தொழில் (Primary Trade) *
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#64748B', mb: 1.5 }}>
              This defines your primary verification badge and main dispatch category in Salem.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { id: 'ac', label: 'AC Repair & HVAC' },
                { id: 'electrician', label: 'Electrician & Wiring' },
                { id: 'plumber', label: 'Plumbing & Sanitation' },
                { id: 'cleaning', label: 'Deep Cleaning' }
              ].map((t) => {
                const isSelected = profileTrade === t.id;
                return (
                  <Chip
                    key={t.id}
                    label={t.label}
                    clickable
                    onClick={() => handleProfilePrimaryTradeChange(t.id)}
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '12.5px',
                      borderRadius: '10px',
                      py: 2.2,
                      px: 0.5,
                      bgcolor: isSelected ? '#0A66C2' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      border: isSelected ? '1px solid #0A66C2' : '1px solid #CBD5E1',
                      boxShadow: isSelected ? '0 2px 8px rgba(10, 102, 194, 0.22)' : 'none',
                      '&:hover': { bgcolor: isSelected ? '#084E96' : '#F1F5F9' }
                    }}
                  />
                );
              })}
            </Box>
          </Paper>

          {/* Additional Skills Multi-Select */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                கூடுதல் சேவைகள் (Additional Trades You Perform)
              </Typography>
              <Chip
                size="small"
                label={`${profileSecondaryTrades.filter((t) => t !== profileTrade).length} selected`}
                sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '11px', height: 22 }}
              />
            </Box>
            <Typography sx={{ fontSize: '11.5px', color: '#64748B', mb: 1.5 }}>
              Job alerts from these secondary categories will also ping your duty radar when nearby.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { id: 'ac', label: 'AC Repair' },
                { id: 'electrician', label: 'Electrician' },
                { id: 'plumber', label: 'Plumbing' },
                { id: 'cleaning', label: 'Cleaning' }
              ]
                .filter((t) => t.id !== profileTrade)
                .map((t) => {
                  const isSelected = profileSecondaryTrades.includes(t.id);
                  return (
                    <Chip
                      key={t.id}
                      label={t.label}
                      clickable
                      onClick={() => toggleProfileSecondaryTrade(t.id)}
                      icon={isSelected ? <CheckCircle2 size={14} color="#FFFFFF" /> : undefined}
                      sx={{
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '12px',
                        borderRadius: '10px',
                        py: 2,
                        bgcolor: isSelected ? '#7E22CE' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1px solid #7E22CE' : '1px solid #CBD5E1',
                        '&:hover': { bgcolor: isSelected ? '#6B21A8' : '#FAF5FF' }
                      }}
                    />
                  );
                })}
            </Box>
          </Paper>

          {/* Payout Phone & UPI */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 0.5 }}>
              Payout phone number & UPI link
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#64748B', mb: 1.5 }}>
              Automated 95% duty earnings & ₹99 travel fees will be disbursed directly to this phone number via IMPS UPI.
            </Typography>

            <TextField
              fullWidth
              inputMode="numeric"
              value={profilePayoutPhone}
              onChange={(e) => setProfilePayoutPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="e.g. 9842012345"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>+91</Typography>
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px', bgcolor: '#F8FAFC' }
              }}
            />
          </Paper>

          {/* KYC Document Upload */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#334155', mb: 0.5 }}>
              KYC Identity Document (Aadhaar / Govt ID)
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#64748B', mb: 1.5 }}>
              Required by Salem Operations Desk for duty verification and trust badge.
            </Typography>

            <DocumentUploadControl
              label="Aadhaar / Govt ID photo"
              sublabel="Direct camera or photo gallery upload (up to 5 MB)"
              folder="aadhaar"
              referenceId={activeTech?.phone || 'partner'}
              existingUrl={profileAadhaarUrl}
              onUploadSuccess={(url) => setProfileAadhaarUrl(url)}
              onRemove={() => setProfileAadhaarUrl(null)}
              maxSizeMb={5}
            />
          </Paper>

          {/* Save Action Button */}
          <Box sx={{ mt: 1, pb: 5 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <Save size={18} />}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#0A66C2',
                fontWeight: 800,
                fontSize: '15px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(10, 102, 194, 0.25)',
                '&:hover': { bgcolor: '#084E96' }
              }}
            >
              {isSaving ? 'Saving profile changes...' : 'Save Specialist Profile & KYC'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
