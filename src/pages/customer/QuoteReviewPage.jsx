import { API_V1_URL } from '../../config';
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
  const bookingId = searchParams.get('bookingId') || localStorage.getItem('salemseva_active_booking') || '';

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
    if (!bookingId) {
      navigate('/', { replace: true });
      return;
    }
    localStorage.setItem('salemseva_active_booking', bookingId);
    setIsLoading(true);
    fetch(`${API_V1_URL}/bookings/${bookingId}/quote`)
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
    .reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty, 10) || 1), 0);
  const laborCost = rawLaborCost > 0 ? rawLaborCost : 250;

  // Platform Fee is strictly 5% of Labor / Work Charge
  const platformFee = Math.round(laborCost * 0.05 * 100) / 100;
  const finalTotal = laborCost + platformFee;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await fetch(`${API_V1_URL}/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quote_approved',
          partsMode: 'none'
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
            borderRadius: '12px',
            p: 2,
            mb: 2,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AssignmentTurnedInIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
              Doorstep Diagnosis Completed (Booking #{bookingId})
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px', lineHeight: 1.45 }}>
            Technician inspected your unit on-site and presented the required service work tasks and labor charges below.
          </Typography>
        </Card>

        {/* 2. Platform Policy Notice: Zero Product Sales */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: '12px',
            p: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
            <ShieldIcon sx={{ color: '#16A34A', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '13px' }}>
              SalemSeva Direct Labor Guarantee (நேரடி தொழிலாளர் உத்தரவாதம்)
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#14532D', display: 'block', fontSize: '11.5px', lineHeight: 1.5 }}>
            சேலம்சேவா தளம் <strong>உதிரிபாகங்களை விற்பனை செய்வதில்லை</strong>. உதிரிபாகங்கள் தேவைப்பட்டால், நீங்கள் நேரடியாகவோ அல்லது டெக்னீஷியன் மூலமாகவோ உள்ளூர் கடையில் வாங்கிக்கொள்ளலாம். எங்கள் கட்டணம் (5%) டெக்னீஷியனின் <strong>வேலைக் கட்டணத்திற்கு மட்டுமே</strong> கணக்கிடப்படுகிறது.
          </Typography>
        </Card>

        {/* 3. Itemized Work Tasks Breakdown */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            p: 2,
            mb: 2,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.2, fontSize: '14px' }}>
            Work & Service Tasks Quoted by Technician
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 0.8, borderBottom: '1px solid #F1F5F9', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '11px' }}>Work Description</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '11px' }}>Category</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '11px' }}>Labor Charge</Typography>
          </Box>

          {/* Itemized Rows */}
          {isLoading ? (
            [1, 2].map((n) => (
              <Box key={n} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="rounded" width={50} height={18} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
            ))
          ) : (
            items.map((item, idx) => (
              <Box key={item.id || idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <BuildIcon sx={{ color: '#0284C7', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                    {item.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label="Labor Task"
                    size="small"
                    sx={{
                      bgcolor: '#EFF6FF',
                      color: '#1E40AF',
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
                      color: '#0F172A',
                      fontSize: '12.5px',
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: '55px',
                      textAlign: 'right'
                    }}
                  >
                    ₹{parseFloat(item.price).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}

          <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

          {/* Upfront Breakdown */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13px' }}>
              தொழிலாளர் வேலைக் கட்டணம் (Technician Labor Charge):
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
              ₹{laborCost.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShieldIcon sx={{ color: '#2563EB', fontSize: 14 }} />
              <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '12.5px', fontWeight: 600 }}>
                SalemSeva Platform & Safety Fee (5% on Labor):
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '13px' }}>
              +₹{platformFee.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                மொத்த கட்டணம் (Total Payable):
              </Typography>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600, display: 'block' }}>
                Work Charge + 5% Platform Fee Only
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
      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
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
