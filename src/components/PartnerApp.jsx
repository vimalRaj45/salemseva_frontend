import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Switch,
  IconButton,
  Divider,
  Paper,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import MapIcon from '@mui/icons-material/Map';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TranslateIcon from '@mui/icons-material/Translate';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BadgeIcon from '@mui/icons-material/Badge';

export default function PartnerApp({ currentStep, setStep }) {
  const [lang, setLang] = useState('ta'); // 'ta' for Tamil, 'en' for English
  const [isOnline, setIsOnline] = useState(true);
  const [dutyStep, setDutyStep] = useState(1); // 1: Travel, 2: Inspect, 3: Bill
  const [partnerNav, setPartnerNav] = useState(0);

  const isTa = lang === 'ta';

  const speakTamilHelp = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isTa ? 'ta-IN' : 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      
      {/* Top App Bar */}
      <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFF' }}>
            {isTa ? 'சேலம்சேவா டெக்னீசியன்' : 'SalemSeva Partner'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            K. Ramesh • Fairlands Zone
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<TranslateIcon sx={{ color: '#0F172A !important' }} />}
            label={isTa ? 'தமிழ்' : 'English'}
            size="small"
            sx={{ bgcolor: '#38BDF8', color: '#0F172A', fontWeight: 800 }}
            onClick={() => setLang(isTa ? 'en' : 'ta')}
          />
          <IconButton 
            size="small" 
            sx={{ color: '#F59E0B' }} 
            onClick={() => speakTamilHelp(isTa ? 'வணக்கம் ரமேஷ்! மேப் வழியை பின்பற்றி கஸ்டமர் வீட்டிற்கு செல்லவும்.' : 'Follow Google Maps to customer location.')}
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Duty Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        
        {/* Online Duty Bar */}
        <Card sx={{ p: 1.5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isOnline ? '#10B981' : '#94A3B8' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {isOnline ? (isTa ? 'ஆன்லைன் - வேலைக்கு தயார்' : 'DUTY: ONLINE') : (isTa ? 'ஆஃப்லைன்' : 'OFFLINE')}
            </Typography>
          </Box>
          <Switch checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} color="success" />
        </Card>

        {/* 3-Step Traffic Light Status Strip */}
        <Box sx={{ display: 'flex', gap: 1, p: 1, bgcolor: '#F1F5F9', borderRadius: 3, mb: 2.5 }}>
          <Chip
            icon={<TwoWheelerIcon fontSize="small" />}
            label={isTa ? '1. பயணம்' : '1. Travel'}
            color={dutyStep === 1 ? 'primary' : 'default'}
            sx={{ flex: 1, fontWeight: 700 }}
            onClick={() => setDutyStep(1)}
          />
          <Chip
            icon={<SearchIcon fontSize="small" />}
            label={isTa ? '2. ஆய்வு' : '2. Inspect'}
            color={dutyStep === 2 ? 'primary' : 'default'}
            sx={{ flex: 1, fontWeight: 700 }}
            onClick={() => { setDutyStep(2); setStep('quote_review'); }}
          />
          <Chip
            icon={<ReceiptLongIcon fontSize="small" />}
            label={isTa ? '3. பில்' : '3. Bill'}
            color={dutyStep === 3 ? 'primary' : 'default'}
            sx={{ flex: 1, fontWeight: 700 }}
            onClick={() => { setDutyStep(3); setStep('payment'); }}
          />
        </Box>

        {/* GIANT ACTION BUTTON 1: Call Customer */}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          startIcon={<PhoneIcon sx={{ fontSize: 30 }} />}
          sx={{ py: 2, mb: 1.5, fontSize: 16, borderRadius: 3 }}
          onClick={() => speakTamilHelp(isTa ? 'கஸ்டமர் பிரியாவுக்கு போன் செய்யப்படுகிறது.' : 'Calling customer Priya.')}
        >
          {isTa ? 'கஸ்டமரிடம் பேசு (பிரியா)' : 'Call Customer (Priya)'}
        </Button>

        {/* GIANT ACTION BUTTON 2: Open Google Maps */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<MapIcon sx={{ fontSize: 30 }} />}
          sx={{ py: 2, mb: 1.5, fontSize: 16, borderRadius: 3, bgcolor: '#0284C7' }}
          onClick={() => speakTamilHelp(isTa ? 'கூகுள் மேப் வழி திறக்கப்படுகிறது.' : 'Opening Google Maps.')}
        >
          {isTa ? 'கூகுள் மேப் வழி (Open Maps)' : 'Open Google Maps'}
        </Button>

        {/* GIANT ACTION BUTTON 3: Mark Arrived */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<CheckCircleIcon sx={{ fontSize: 30, color: '#38BDF8' }} />}
          sx={{ py: 2, mb: 2.5, fontSize: 16, borderRadius: 3, bgcolor: '#0F172A' }}
          onClick={() => {
            setDutyStep(2);
            setStep('quote_review');
            speakTamilHelp(isTa ? 'வந்தாச்சு! பழுது சோதனையை தொடங்கவும்.' : 'Arrived at location. Start inspection.');
          }}
        >
          {isTa ? 'வந்தாச்சு - வீட்டு முன் உள்ளேன்' : 'I Have Reached Location'}
        </Button>

        {/* Weekly Earnings Card */}
        <Card sx={{ p: 2, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFF', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isTa ? 'இந்த வார வருமானம் (Take-Home)' : 'Current Week Payout (Net 85%)'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#38BDF8', my: 0.5 }}>
            ₹4,890.00
          </Typography>
          <Typography variant="caption" sx={{ color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <CheckCircleIcon fontSize="small" /> {isTa ? 'வங்கி வரவு: HDFC Bank (Auto IMPS)' : 'Bank: HDFC Bank (Auto IMPS)'}
          </Typography>
        </Card>

      </Box>

      {/* Partner Bottom Nav */}
      <Paper elevation={3}>
        <BottomNavigation value={partnerNav} onChange={(e, val) => setPartnerNav(val)} showLabels>
          <BottomNavigationAction label={isTa ? 'வேலை' : 'Duty'} icon={<TwoWheelerIcon />} />
          <BottomNavigationAction label={isTa ? 'வருமானம்' : 'Earnings'} icon={<AccountBalanceWalletIcon />} />
          <BottomNavigationAction label={isTa ? 'உதவி' : 'Help'} icon={<SupportAgentIcon />} />
        </BottomNavigation>
      </Paper>

    </Box>
  );
}
