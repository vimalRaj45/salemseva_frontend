import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Radio,
  Button,
  Chip,
  Paper,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Skeleton,
  TextField,
  Collapse
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MemoryIcon from '@mui/icons-material/Memory';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import CancelBookingModal from '../../components/CancelBookingModal';

export default function QuoteReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'SLM-84920';

  const [procureOption, setProcureOption] = useState('tech_buys');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);


  // Reschedule return state when user buys parts
  const [returnDateType, setReturnDateType] = useState('tomorrow');
  const [customReturnDate, setCustomReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnTimeSlot, setReturnTimeSlot] = useState('morning_9_11');

  useEffect(() => {
    if (bookingId) {
      localStorage.setItem('salemseva_active_booking', bookingId);
    }
    setIsLoading(true);
    fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/quote`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuoteData(data);
          if (data.partsMode) setProcureOption(data.partsMode);
        }
      })
      .catch(err => console.warn('Failed to fetch quote:', err))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const items = quoteData?.items || [];

  // Calculate breakdown
  const rawLaborCost = items
    .filter(i => i.type !== 'Spare Part')
    .reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty, 10) || 1), 0);
  const laborCost = rawLaborCost > 0 ? rawLaborCost : 250;

  // Dynamic Quote Rule: Upfront authorization covers labour + 5% platform fee.
  // No fixed amount is shown or charged upfront for spare parts.
  const platformFee = Math.round(laborCost * 0.05 * 100) / 100;
  const finalTotal = laborCost + platformFee;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quote_approved',
          partsMode: procureOption,
          rescheduledReturnDate: procureOption === 'user_buys' ? customReturnDate : null,
          rescheduledReturnSlot: procureOption === 'user_buys' ? returnTimeSlot : null
        })
      });
    } catch (e) {
      console.warn('Status update fallback:', e);
    }
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/checkout?bookingId=${bookingId}`);
    }, 800);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* 1. Diagnosis Completed Header Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AssignmentTurnedInIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14.5px' }}>
              Physical diagnosis completed (Booking #{bookingId})
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px', lineHeight: 1.45 }}>
            Technician inspected unit in Fairlands. Found faulty 45uF run capacitor & burnt connector wires requiring replacement.
          </Typography>
        </Card>

        {/* 2. Spare Parts Procurement Decision Box */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', display: 'block', mb: 1, fontSize: '12.5px' }}>
            Who will procure the required spare parts?
          </Typography>

          {/* Local Market Sourcing Notice */}
          <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '6px', mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 700, display: 'block', mb: 0.3 }}>
              Transparent Store Bill Guarantee (வெளிப்படையான கடை பில் உறுதி):
            </Typography>
            <Typography variant="caption" sx={{ color: '#0C4A6E', display: 'block', lineHeight: 1.4 }}>
              உதிரிபாகங்களுக்கு உத்தேச விலை ஏதும் நிர்ணயிக்கப்படாது. டெக்னீஷியன் அசல் கடை ரசீதை வாங்கி புகைப்படமாக பதிவேற்றுவார். அசல் பில் தொகையும் 5% தள கட்டணமும் மட்டுமே சேர்க்கப்படும்.
            </Typography>
          </Paper>

          {/* Option A: Tech Buys */}
          <Paper
            elevation={0}
            onClick={() => setProcureOption('tech_buys')}
            sx={{
              p: 1.2,
              mb: 1.2,
              borderRadius: '6px',
              bgcolor: procureOption === 'tech_buys' ? '#EFF6FF' : '#FFFFFF',
              border: procureOption === 'tech_buys' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Radio
                  checked={procureOption === 'tech_buys'}
                  onChange={() => setProcureOption('tech_buys')}
                  size="small"
                  sx={{ p: 0, '&.Mui-checked': { color: '#2563EB' } }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                  டெக்னீஷியன் வாங்கி பில் பகிர்வார் (Tech buys & shares bill with you)
                </Typography>
              </Box>
              <Chip
                label="Direct Market Bill"
                size="small"
                sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 700, fontSize: '9.5px', height: 20, borderRadius: '4px' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', pl: 3.2, display: 'block', fontSize: '11.5px' }}>
              டெக்னீஷியன் அருகிலுள்ள கடையில் வாங்கி அசல் பில் படத்தை பதிவேற்றுவார். பில் தொகை + 5% தள கட்டணம் பின்னர் சேர்க்கப்படும்.
            </Typography>
          </Paper>

          {/* Option B: User Buys */}
          <Paper
            elevation={0}
            onClick={() => setProcureOption('user_buys')}
            sx={{
              p: 1.2,
              borderRadius: '6px',
              bgcolor: procureOption === 'user_buys' ? '#EFF6FF' : '#FFFFFF',
              border: procureOption === 'user_buys' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Radio
                  checked={procureOption === 'user_buys'}
                  onChange={() => setProcureOption('user_buys')}
                  size="small"
                  sx={{ p: 0, '&.Mui-checked': { color: '#2563EB' } }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                  I will buy parts (Reschedule return)
                </Typography>
              </Box>
              <Chip
                label="No extra visit fee"
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600, fontSize: '10px', height: 20, borderRadius: '4px' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', pl: 3.2, display: 'block', fontSize: '11.5px' }}>
              Technician gives exact specs. You buy parts and choose return time slot for fitting.
            </Typography>

            {/* ================= RESCHEDULE DATE & TIME PICKER (EMBEDDED) ================= */}
            <Collapse in={procureOption === 'user_buys'}>
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #DBEAFE', pl: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 1 }}>
                  <EventAvailableIcon sx={{ color: '#2563EB', fontSize: 16 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                    Select return date & time for technician fitting:
                  </Typography>
                </Box>

                {/* Return Date Options */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.2 }}>
                  {[
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'day_after', label: 'Day after' },
                    { id: 'custom', label: 'Pick date' }
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReturnDateType(tab.id);
                        if (tab.id === 'tomorrow') {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          setCustomReturnDate(d.toISOString().split('T')[0]);
                        } else if (tab.id === 'day_after') {
                          const d = new Date();
                          d.setDate(d.getDate() + 2);
                          setCustomReturnDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      sx={{
                        flex: 1,
                        fontSize: '11.5px',
                        fontWeight: returnDateType === tab.id ? 600 : 500,
                        py: 0.5,
                        bgcolor: returnDateType === tab.id ? '#2563EB' : '#FFFFFF',
                        color: returnDateType === tab.id ? '#FFFFFF' : '#475569',
                        border: '1px solid',
                        borderColor: returnDateType === tab.id ? '#2563EB' : '#CBD5E1',
                        borderRadius: '4px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: returnDateType === tab.id ? '#1D4ED8' : '#F8FAFC' }
                      }}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </Box>

                {returnDateType === 'custom' && (
                  <Box sx={{ mb: 1.2 }} onClick={(e) => e.stopPropagation()}>
                    <TextField
                      size="small"
                      type="date"
                      fullWidth
                      value={customReturnDate}
                      onChange={(e) => setCustomReturnDate(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '12px',
                          bgcolor: '#FFFFFF',
                          borderRadius: '4px'
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Return Time Window Picker */}
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.8, fontSize: '11px' }}>
                  Choose convenient return time slot:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 1 }}>
                  {[
                    { id: 'morning_9_11', title: 'Morning (09:00 AM - 11:00 AM)', desc: 'Early doorstep fitting' },
                    { id: 'afternoon_2_4', title: 'Afternoon (02:00 PM - 04:00 PM)', desc: 'Post-lunch slot' },
                    { id: 'evening_5_7', title: 'Evening (05:00 PM - 07:00 PM)', desc: 'After-work doorstep visit' }
                  ].map(slot => {
                    const isSlotSelected = returnTimeSlot === slot.id;
                    return (
                      <Paper
                        key={slot.id}
                        elevation={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setReturnTimeSlot(slot.id);
                        }}
                        sx={{
                          p: 1,
                          borderRadius: '4px',
                          bgcolor: isSlotSelected ? '#FFFFFF' : '#F8FAFC',
                          border: isSlotSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer'
                        }}
                      >
                        <Radio
                          checked={isSlotSelected}
                          size="small"
                          sx={{ p: 0, '&.Mui-checked': { color: '#2563EB' } }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>
                            {slot.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px' }}>
                            {slot.desc}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>

                {/* Confirmation info note */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, bgcolor: '#F0FDF4', p: 0.8, borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                  <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 15 }} />
                  <Typography variant="caption" sx={{ color: '#166534', fontSize: '10.5px', fontWeight: 500 }}>
                    Technician will return on <strong>{customReturnDate}</strong> ({returnTimeSlot.replace('_', ' ')}) to fit parts. Zero additional visit charge.
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        </Card>

        {/* 3. Itemized Estimate Table Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 2,
            mb: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.2, fontSize: '13.5px' }}>
            Itemized estimate breakdown
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 0.8, borderBottom: '1px solid #F1F5F9', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Item / Work</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Category</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', fontSize: '11px' }}>Amount</Typography>
          </Box>

          {/* Itemized Rows */}
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <Box key={n} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="rounded" width={50} height={18} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
            ))
          ) : (
            items.map((item, idx) => {
              const isSparePart = item.type === 'Spare Part';
              const isOmitted = isSparePart && procureOption === 'user_buys';

              return (
                <Box key={item.id || idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      {isSparePart ? (
                        <MemoryIcon sx={{ color: '#2563EB', fontSize: 16 }} />
                      ) : item.type === 'Labor' ? (
                        <BuildIcon sx={{ color: '#D97706', fontSize: 16 }} />
                      ) : (
                        <SpeedIcon sx={{ color: '#16A34A', fontSize: 16 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isOmitted ? '#94A3B8' : '#0F172A',
                          textDecoration: isOmitted ? 'line-through' : 'none',
                          fontSize: '12px'
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                    {isSparePart && (
                      <Typography variant="caption" sx={{ color: isOmitted ? '#64748B' : '#0369A1', fontSize: '10px', pl: 3, fontWeight: 500 }}>
                        {isOmitted
                          ? 'வாடிக்கையாளர் நேரடியாக வாங்குவார் (Sourced by customer)'
                          : 'கடை பில்படி மட்டுமே வசூலிக்கப்படும் (No estimate markup - original bill shared after purchase)'}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={
                        isOmitted
                          ? 'Customer Buying'
                          : isSparePart
                            ? 'கடை பில்படி (Store Bill)'
                            : (item.type || 'Labor')
                      }
                      size="small"
                      sx={{
                        bgcolor: isOmitted ? '#FEF3C7' : isSparePart ? '#EFF6FF' : '#F1F5F9',
                        color: isOmitted ? '#92400E' : isSparePart ? '#1E40AF' : '#475569',
                        fontWeight: 700,
                        fontSize: '10px',
                        height: 20,
                        borderRadius: '4px'
                      }}
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: isOmitted ? '#94A3B8' : isSparePart ? '#2563EB' : '#0F172A',
                        fontSize: isSparePart ? '11px' : '12.5px',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: '55px',
                        textAlign: 'right'
                      }}
                    >
                      {isOmitted ? '₹0.00' : isSparePart ? 'கடை பில்படி' : `₹${parseFloat(item.price).toFixed(2)}`}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Upfront Breakdown */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px' }}>
              தொழிலாளர் கட்டணம் (Labour Charge):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
              ₹{laborCost.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px' }}>
              உதிரிபாகங்கள் (Spare Parts):
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: procureOption === 'user_buys' ? '#64748B' : '#2563EB',
                fontSize: '12px'
              }}
            >
              {procureOption === 'user_buys' ? '₹0.00 (Customer Buys)' : '+ அசல் கடை பில் (பதிவேற்றப்படும்)'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShieldIcon sx={{ color: '#2563EB', fontSize: 14 }} />
              <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '12.5px', fontWeight: 600 }}>
                SalemSeva Platform & Safety Fee (5%):
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '13px' }}>
              +₹{platformFee.toFixed(2)}
            </Typography>
          </Box>

          {/* Informational guarantee card */}
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              mb: 1.5,
              borderRadius: '6px',
              bgcolor: procureOption === 'tech_buys' ? '#EFF6FF' : '#F0FDF4',
              border: `1px solid ${procureOption === 'tech_buys' ? '#BFDBFE' : '#BBF7D0'}`
            }}
          >
            <Typography variant="caption" sx={{ color: procureOption === 'tech_buys' ? '#1E40AF' : '#166534', fontWeight: 600, display: 'block' }}>
              {procureOption === 'tech_buys'
                ? 'ℹ️ ஆரம்ப அனுமதி: தொழிலாளர் கட்டணம் + 5% தள கட்டணம் மட்டுமே. டெக்னீஷியன் அசல் கடை பில்லை பதிவேற்றியவுடன் அந்த பில் தொகை + 5% தள கட்டணம் இதனுடன் நேரடியாக சேர்க்கப்பட்டு வெளிப்படையாக காட்டப்படும்.'
                : '✅ நீங்கள் பாகங்களை நேரடியாக வாங்குவதால், தொழிலாளர் கட்டணம் (₹' + laborCost.toFixed(0) + ') + 5% தள கட்டணம் மட்டுமே வசூலிக்கப்படும். கூடுதல் கட்டணம் ஏதுமில்லை.'}
            </Typography>
          </Paper>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                {procureOption === 'tech_buys' ? 'ஆரம்ப அனுமதித் தொகை (Upfront Approval):' : 'மொத்த கட்டணம் (Total Payable):'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600, display: 'block' }}>
                {procureOption === 'tech_buys' ? 'Labour + 5% Fee (கடை பில் வாங்கிய பின் சேர்க்கப்படும்)' : 'Labour + 5% Platform Fee Only'}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 900, color: '#2563EB', fontVariantNumeric: 'tabular-nums', fontSize: '19px' }}>
              ₹{finalTotal.toFixed(2)}
            </Typography>
          </Box>
        </Card>

        {/* 4. Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            onClick={handleApprove}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '6px',
              py: 1.2,
              fontWeight: 600,
              fontSize: '13.5px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1E293B' }
            }}
          >
            {procureOption === 'user_buys'
              ? `Confirm Reschedule & Pay Labour (₹${finalTotal.toFixed(0)})`
              : `Approve Labour (₹${finalTotal.toFixed(0)}) & Request Parts Purchase`}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setCancelModalOpen(true)}
            sx={{
              borderColor: '#FECACA',
              color: '#DC2626',
              borderRadius: '6px',
              py: 1,
              fontWeight: 600,
              fontSize: '12.5px',
              textTransform: 'none',
              bgcolor: '#FFF',
              '&:hover': { bgcolor: '#FEF2F2', borderColor: '#F87171' }
            }}
          >
            Decline estimate & cancel booking
          </Button>
        </Box>

      </Container>

      {/* Universal Cancel Booking Modal */}
      <CancelBookingModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        bookingId={bookingId}
        currentStatus="quote_presented"
      />


      {/* Bottom Navigation */}
      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#2563EB', fontWeight: 600 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          <BottomNavigationAction label="Partner Zone" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/partner')} />
        </BottomNavigation>
      </Paper>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Authorizing Job Card..."
        subtitle="Confirming spare parts choice & generating final settlement bill"
        badge="Zero Surge Guarantee"
      />

    </Box>
  );
}
