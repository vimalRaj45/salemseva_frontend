import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Avatar,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

// Material Icons
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarsIcon from '@mui/icons-material/Stars';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { ApiService } from '../services/api';

export default function CustomerApp({ currentStep, setStep, activeBooking, setActiveBooking, onEscalateOps }) {
  const [navTab, setNavTab] = useState(0);
  const [services, setServices] = useState([]);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [escalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const [rewardSnackbar, setRewardSnackbar] = useState(false);
  const [partsSourcing, setPartsSourcing] = useState('tech_buys'); // 'tech_buys' | 'customer_buys'

  useEffect(() => {
    ApiService.fetchServices('ta').then(data => {
      if (data && data.length) setServices(data);
    });
  }, []);

  const lowRatingChips = [
    { id: 'delay', label: 'Late Arrival / Delay', icon: <ScheduleIcon fontSize="small" /> },
    { id: 'price', label: 'High Price / Extra Demands', icon: <CurrencyRupeeIcon fontSize="small" /> },
    { id: 'unresolved', label: 'Issue Not Fully Resolved', icon: <BuildCircleOutlinedIcon fontSize="small" /> },
    { id: 'dirty', label: 'Area Left Dirty', icon: <CleaningServicesOutlinedIcon fontSize="small" /> },
    { id: 'rude', label: 'Impolite / Poor Communication', icon: <RecordVoiceOverOutlinedIcon fontSize="small" /> },
    { id: 'cash', label: 'Asked for Doorstep Cash', icon: <MoneyOffOutlinedIcon fontSize="small" /> }
  ];

  const highRatingChips = [
    { id: 'fast', label: 'Super Fast Arrival', icon: <BoltIcon fontSize="small" /> },
    { id: 'oem', label: 'Genuine OEM Parts', icon: <VerifiedIcon fontSize="small" /> },
    { id: 'clean', label: 'Clean & Tidy Workplace', icon: <CleaningServicesIcon fontSize="small" /> },
    { id: 'transparent', label: 'Transparent Pricing', icon: <ReceiptLongIcon fontSize="small" /> },
    { id: 'tamil', label: 'Polite Tamil Explanation', icon: <RecordVoiceOverOutlinedIcon fontSize="small" /> }
  ];

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleReviewSubmit = async () => {
    await ApiService.submitReview({
      bookingId: activeBooking.bookingId || 'SLM-84920',
      rating,
      comment: feedbackText,
      tags: selectedTags,
      rootCauseTags: rating <= 3 ? selectedTags : []
    });

    if (rating <= 3) {
      setEscalationDialogOpen(true);
      if (onEscalateOps) onEscalateOps();
    } else {
      alert(' Review Submitted! +50 Seva Credits Added to Wallet.');
      setStep('customer_history');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      
      {/* Scrollable Screen Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        
        {/* ================= STEP 1: HOME CATALOG ================= */}
        {currentStep === 'home' && (
          <Box>
            {/* Top Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ color: '#0284C7' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>Fairlands, Salem</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>Vanakkam, Priya!</Typography>
                </Box>
              </Box>
              <Chip 
                icon={<StarsIcon sx={{ color: '#F59E0B !important' }} />} 
                label="150 Credits" 
                size="small" 
                sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                onClick={() => setStep('wallet_hub')}
              />
            </Box>

            {/* Search Bar */}
            <Paper elevation={0} sx={{ p: '8px 12px', display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid #E2E8F0', mb: 2 }}>
              <SearchIcon sx={{ color: '#0284C7', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#94A3B8', flex: 1 }}>Search 'AC repair', 'Electrician'...</Typography>
              <IconButton size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7' }}>
                <MicIcon fontSize="small" />
              </IconButton>
            </Paper>

            {/* 30-Min Fast Dispatch Banner */}
            <Card sx={{ bgcolor: '#FFF7ED', border: '1px solid #F97316', mb: 2 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <BoltIcon sx={{ color: '#EA580C', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C2410C' }}>30-Min Doorstep Dispatch in Salem</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#9A3412', display: 'block' }}>
                  Serving Fairlands, Hasthampatti, Suramangalam & Meyyanur. Instant verified match.
                </Typography>
              </CardContent>
            </Card>

            {/* Promo Card */}
            <Card sx={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFF', mb: 2.5 }}>
              <CardContent sx={{ p: 2 }}>
                <Chip label="FIRST ORDER SPECIAL" size="small" sx={{ bgcolor: '#38BDF8', color: '#0F172A', fontWeight: 800, mb: 1, height: 20, fontSize: 10 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#38BDF8', mb: 0.5 }}>GET FLAT ₹100 OFF</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1.5 }}>USE CODE: SALEM100 • 30-DAY WARRANTY</Typography>
                <Button variant="contained" color="secondary" size="small" endIcon={<ArrowForwardIcon />} onClick={() => setStep('service_detail')}>
                  REDEEM NOW
                </Button>
              </CardContent>
            </Card>

            {/* 4 Core Services Grid */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: '#0F172A' }}>Our 4 Core Services</Typography>
            <Grid container spacing={1.5}>
              {[
                { id: 'ac', name: 'AC Repair & Svc', price: '₹99', eta: '25m', icon: <AcUnitIcon />, color: '#0284C7', bg: '#E0F2FE' },
                { id: 'electrician', name: 'Electrician', price: '₹99', eta: '20m', icon: <ElectricBoltIcon />, color: '#D97706', bg: '#FEF3C7' },
                { id: 'plumber', name: 'Plumber Leakage', price: '₹99', eta: '30m', icon: <PlumbingIcon />, color: '#4F46E5', bg: '#E0E7FF' },
                { id: 'cleaning', name: 'Home Deep Clean', price: '₹149', eta: '35m', icon: <CleaningServicesIcon />, color: '#059669', bg: '#DCFCE7' }
              ].map(svc => (
                <Grid item xs={6} key={svc.id}>
                  <Card 
                    sx={{ p: 1.5, cursor: 'pointer', '&:hover': { borderColor: '#0284C7' } }}
                    onClick={() => {
                      setActiveBooking(prev => ({ ...prev, selectedService: svc }));
                      setStep('service_detail');
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Avatar sx={{ bgcolor: svc.bg, color: svc.color, width: 36, height: 36 }}>{svc.icon}</Avatar>
                      <Chip label={`${svc.eta} ETA`} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#F1F5F9' }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{svc.name}</Typography>
                    <Typography variant="caption" sx={{ color: svc.color, fontWeight: 700 }}>From {svc.price} Visit</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Trust Strip */}
            <Card sx={{ mt: 2.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center', p: 1 }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <VerifiedIcon fontSize="small" /> 100% VERIFIED TECHS • RAZORPAY ESCROW • 30-DAY WARRANTY
              </Typography>
            </Card>
          </Box>
        )}

        {/* ================= STEP 2: SERVICE DETAIL & ISSUE PICKER ================= */}
        {currentStep === 'service_detail' && (
          <Box>
            <Button startIcon={<ArrowBackIcon />} size="small" onClick={() => setStep('home')} sx={{ mb: 1 }}>
              Back
            </Button>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>AC Repair & Diagnostic</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>Inspection First: ₹99 Doorstep Diagnostic Fee</Typography>

            {/* Common Issues Radio */}
            <Card sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Select Issue / Diagnostic Type</Typography>
              <RadioGroup defaultValue="diagnostic">
                <FormControlLabel value="diagnostic" control={<Radio size="small" />} label="Full Diagnostic & On-Site Inspection (₹99 Base Fee)" />
                <FormControlLabel value="capacitor" control={<Radio size="small" />} label="AC Capacitor Replacement (Est: ₹450 - ₹650)" />
                <FormControlLabel value="gas" control={<Radio size="small" />} label="Gas Top-Up & Coil Check (Est: ₹850 - ₹1,400)" />
              </RadioGroup>
            </Card>

            {/* Urgent Priority Surge Toggle */}
            <Card sx={{ p: 2, mb: 2, bgcolor: '#FFF7ED', border: '1px solid #F97316' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C2410C' }}> Urgent Priority Dispatch (20 Mins)</Typography>
                  <Typography variant="caption" sx={{ color: '#9A3412' }}>+₹50 surge allocated directly for instant technician response</Typography>
                </Box>
                <Switch size="small" color="warning" />
              </Box>
            </Card>

            {/* Price Summary */}
            <Card sx={{ p: 2, mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Inspection Base Fee</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>₹99.00</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#10B981' }}>
                <Typography variant="body2">SALEM100 Promo Discount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>-₹50.00</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Payable Now (Escrow Deposit)</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284C7' }}>₹49.00</Typography>
              </Box>
            </Card>

            <Button variant="contained" fullWidth size="large" onClick={() => setStep('matching')}>
              Proceed to Match Technician (₹49)
            </Button>
          </Box>
        )}

        {/* ================= STEP 3: MATCHING & EN-ROUTE ================= */}
        {(currentStep === 'matching' || currentStep === 'en_route') && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Technician Assigned</Typography>
            
            {/* Tech Card */}
            <Card sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: '#0284C7' }}>KR</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>K. Ramesh</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Master Electrician & AC Specialist</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Rating value={5} readOnly size="small" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>4.92 (428 Jobs)</Typography>
                  </Box>
                </Box>
                <Chip label="KYC VERIFIED" size="small" color="success" sx={{ fontSize: 9 }} />
              </Box>
            </Card>

            {/* Live GPS Map Simulation Card */}
            <Card sx={{ p: 2, mb: 2, bgcolor: '#0F172A', color: '#FFF' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', mb: 1 }}>
                 En Route to Fairlands (ETA: 8 mins)
              </Typography>
              <Box sx={{ height: 160, bgcolor: '#1E293B', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>[OpenStreetMap GPS Route: Hasthampatti → Fairlands]</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="secondary" fullWidth startIcon={<PhoneIcon />}>
                  Masked Call
                </Button>
                <Button variant="outlined" sx={{ color: '#FFF', borderColor: '#475569' }} fullWidth startIcon={<ChatIcon />}>
                  Chat
                </Button>
              </Box>
            </Card>

            <Button variant="contained" fullWidth onClick={() => setStep('quote_review')}>
              Simulate Arrival & On-Site Quote
            </Button>
          </Box>
        )}

        {/* ================= STEP 4: ON-SITE DIGITAL QUOTE ================= */}
        {currentStep === 'quote_review' && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>On-Site Digital Quote</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>Inspection Result: Burnt Capacitor & Wiring</Typography>

            {/* Parts Sourcing Toggle */}
            <Card sx={{ p: 1.5, mb: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369A1', display: 'block', mb: 1 }}>
                CHOOSE PARTS SOURCING MODE:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant={partsSourcing === 'tech_buys' ? 'contained' : 'outlined'} 
                  size="small" 
                  fullWidth
                  onClick={() => setPartsSourcing('tech_buys')}
                >
                  Tech Supplies OEM Parts
                </Button>
                <Button 
                  variant={partsSourcing === 'customer_buys' ? 'contained' : 'outlined'} 
                  size="small" 
                  fullWidth
                  onClick={() => setPartsSourcing('customer_buys')}
                >
                  I Will Buy Spares
                </Button>
              </Box>
            </Card>

            {/* Quotation Table */}
            <Card sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Item / Task</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partsSourcing === 'tech_buys' && (
                    <TableRow>
                      <TableCell>AC Capacitor 45uF (OEM Genuine)</TableCell>
                      <TableCell align="right">₹450.00</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>Compressor Wiring & Terminal Cleaning</TableCell>
                    <TableCell align="right">₹300.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gas & Electrical Testing</TableCell>
                    <TableCell align="right">₹150.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: '#10B981' }}>Inspection Fee Credit</TableCell>
                    <TableCell align="right" sx={{ color: '#10B981' }}>-₹49.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Final Balance Due</strong></TableCell>
                    <TableCell align="right"><strong>{partsSourcing === 'tech_buys' ? '₹851.00' : '₹401.00'}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" color="secondary" fullWidth onClick={() => setStep('payment')}>
                Accept & Authorize (OTP)
              </Button>
              <Button variant="outlined" color="error" fullWidth onClick={() => setStep('home')}>
                Decline (Pay ₹49 Only)
              </Button>
            </Box>
          </Box>
        )}

        {/* ================= STEP 5: RAZORPAY CHECKOUT ================= */}
        {currentStep === 'payment' && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Razorpay Escrow Settlement</Typography>
            <Card sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#64748B' }}>Total Work & Spares Amount</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', my: 0.5 }}>₹851.00</Typography>
              <Typography variant="caption" sx={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SecurityIcon fontSize="small" /> 100% Cashless Escrow Protection
              </Typography>
            </Card>

            <Card sx={{ p: 2, mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Select Payment Method</Typography>
              <RadioGroup defaultValue="upi">
                <FormControlLabel value="upi" control={<Radio size="small" />} label="Google Pay / PhonePe / Paytm (UPI)" />
                <FormControlLabel value="card" control={<Radio size="small" />} label="Credit / Debit Card" />
                <FormControlLabel value="netbanking" control={<Radio size="small" />} label="NetBanking (All Indian Banks)" />
              </RadioGroup>
            </Card>

            <Button variant="contained" color="secondary" fullWidth size="large" onClick={() => setStep('rating')}>
              Pay ₹851 via Razorpay
            </Button>
          </Box>
        )}

        {/* ================= STEP 6: DYNAMIC REVIEW & QUALITY ESCALATION ================= */}
        {currentStep === 'rating' && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>Rate & Review Technician</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2, textAlign: 'center' }}>How was K. Ramesh's service?</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Rating 
                value={rating} 
                onChange={(e, val) => {
                  setRating(val);
                  setSelectedTags([]);
                }} 
                size="large" 
                sx={{ fontSize: 40 }}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 800, color: rating <= 3 ? '#EA580C' : '#10B981', mb: 2 }}>
              {rating <= 3 ? `Needs Improvement (${rating}/5)` : `Excellent Service (${rating}/5)`}
            </Typography>

            {/* Below 3-Star Escalation Reasons Box */}
            {rating <= 3 ? (
              <Card sx={{ p: 2, mb: 2, bgcolor: '#FFF7ED', border: '1px solid #F97316' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C2410C', mb: 1 }}>
                  What went wrong? Select root causes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {lowRatingChips.map(chip => (
                    <Chip
                      key={chip.id}
                      icon={chip.icon}
                      label={chip.label}
                      clickable
                      color={selectedTags.includes(chip.id) ? "warning" : "default"}
                      onClick={() => handleTagToggle(chip.id)}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Tell Salem Operations Manager Anand what happened..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  sx={{ bgcolor: '#FFF', borderRadius: 1 }}
                />
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {highRatingChips.map(chip => (
                  <Chip
                    key={chip.id}
                    icon={chip.icon}
                    label={chip.label}
                    clickable
                    color={selectedTags.includes(chip.id) ? "primary" : "default"}
                    onClick={() => handleTagToggle(chip.id)}
                  />
                ))}
              </Box>
            )}

            <Button 
              variant="contained" 
              color={rating <= 3 ? "warning" : "secondary"} 
              fullWidth 
              size="large"
              onClick={handleReviewSubmit}
            >
              {rating <= 3 ? "Submit Feedback & Request Free Revisit" : "Submit Review & Claim +50 Credits"}
            </Button>
          </Box>
        )}

      </Box>

      {/* Operations Escalation Modal */}
      <Dialog open={escalationDialogOpen} onClose={() => { setEscalationDialogOpen(false); setStep('home'); }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#EA580C' }}>
          <SecurityIcon /> Salem Ops Escalated
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Your feedback has triggered an immediate investigation by <strong>Salem Operations Manager Anand</strong>.
          </Typography>
          <Typography variant="body2" sx={{ color: '#166534', bgcolor: '#F0FDF4', p: 1.5, borderRadius: 1.5 }}>
            Under SalemSeva Escrow Policy, you are entitled to a <strong>100% Free Warranty Revisit or Diagnostic Refund</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEscalationDialogOpen(false); setStep('home'); }} autoFocus>
            Understood
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottom Navigation */}
      <Paper elevation={3}>
        <BottomNavigation value={navTab} onChange={(e, val) => setNavTab(val)} showLabels>
          <BottomNavigationAction label="Services" icon={<HomeRepairServiceIcon />} onClick={() => setStep('home')} />
          <BottomNavigationAction label="History" icon={<ReceiptLongIcon />} onClick={() => setStep('quote_review')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon />} onClick={() => setStep('home')} />
        </BottomNavigation>
      </Paper>

    </Box>
  );
}
