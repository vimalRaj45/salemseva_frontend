import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Radio,
  Checkbox,
  Button,
  Chip,
  Paper,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockIcon from '@mui/icons-material/Lock';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import SecurityIcon from '@mui/icons-material/Security';

import { useAuth } from '../../context/AuthContext';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, walletBalance, debitWallet } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'SLM-84920';

  const [redeemCredits, setRedeemCredits] = useState(true);
  const [payMode, setPayMode] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [partsAndLabor, setPartsAndLabor] = useState(900);
  const [visitFee, setVisitFee] = useState(99);

  useEffect(() => {
    if (bookingId) {
      localStorage.setItem('salemseva_active_booking', bookingId);
    }
    fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/quote`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const items = data.items || [];
          const rawLaborCost = items
            .filter(i => i.type !== 'Spare Part')
            .reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty, 10) || 1), 0);
          const laborCost = rawLaborCost > 0 ? rawLaborCost : 250;
          const fee = Math.round(laborCost * 0.05 * 100) / 100;
          setPartsAndLabor(laborCost + fee);
          if (data.booking?.visit_fee) {
            setVisitFee(parseFloat(data.booking.visit_fee));
          }
        }
      })
      .catch(err => console.warn('Real checkout quote poll:', err));
  }, [bookingId]);

  const grossTotal = partsAndLabor;
  const maxBurnable = Math.min(walletBalance || 0, Math.floor(grossTotal * 0.20));
  const creditDiscount = (redeemCredits && maxBurnable > 0) ? maxBurnable : 0;
  const netPayable = Math.max(0, grossTotal - creditDiscount);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      if (creditDiscount > 0) {
        await debitWallet(creditDiscount, bookingId);
      }

      // 1. Ensure Razorpay checkout script is loaded
      await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      let orderId = undefined;
      let keyId = 'rzp_test_Tjo8HdYyapYlnO';

      try {
        const orderRes = await fetch('https://salemseva-backend.onrender.com/api/v1/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingId,
            amount: netPayable,
            currency: 'INR',
            isDiagnosticOnly: false
          })
        });
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          if (orderData.order.id && !orderData.order.id.includes('SLM') && orderData.order.id.startsWith('order_')) {
            orderId = orderData.order.id;
          }
          if (orderData.keyId) keyId = orderData.keyId;
        }
      } catch (err) {
        console.warn('Razorpay order backend creation note:', err);
      }

      // 3. Setup Razorpay Checkout options
      const options = {
        key: keyId,
        amount: Math.round(netPayable * 100),
        currency: 'INR',
        name: 'SalemSeva Cashless Escrow',
        description: `Service Escrow Authorization (${bookingId})`,
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=120&q=80',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            await fetch('https://salemseva-backend.onrender.com/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: bookingId,
                amount: netPayable,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature
              })
            });

            // Update booking status
            await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'quote_approved' })
            });
          } catch (e) {
            console.warn('Status update sync error:', e);
          }

          localStorage.setItem('salemseva_quote_status_' + bookingId, 'quote_approved');
          localStorage.setItem('salemseva_active_booking', bookingId);
          window.dispatchEvent(new CustomEvent('salemseva_quote_updated', { detail: { bookingId, status: 'quote_approved' } }));
          window.dispatchEvent(new Event('storage'));

          setIsProcessing(false);
          navigate(`/track?bookingId=${bookingId}`, { replace: true });
        },
        prefill: {
          name: user?.name || 'Vimal Raj',
          email: user?.email || 'customer@salemseva.in',
          contact: (user?.phone || '+919842711234').replace(/\s+/g, '')
        },
        theme: {
          color: '#0284C7'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      if (window.Razorpay) {
        setIsProcessing(false);
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('Razorpay payment failed:', response.error);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback for demo mode
        await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'quote_approved' })
        });
        localStorage.setItem('salemseva_quote_status_' + bookingId, 'quote_approved');
        localStorage.setItem('salemseva_active_booking', bookingId);
        window.dispatchEvent(new CustomEvent('salemseva_quote_updated', { detail: { bookingId, status: 'quote_approved' } }));
        setIsProcessing(false);
        navigate(`/track?bookingId=${bookingId}`, { replace: true });
      }
    } catch (e) {
      console.error('Payment checkout error:', e);
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* 1. Job Diagnosis Authorized Top Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            p: 2,
            textAlign: 'center',
            mb: 2,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              bgcolor: '#EFF6FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1
            }}
          >
            <LockIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '15px', mb: 0.3 }}>
            Authorize Cashless Escrow Payment
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
            Funds are securely held in SalemSeva Escrow until you inspect & confirm work completion.
          </Typography>
        </Card>

        {/* 2. Final Invoice Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            p: 2,
            mb: 2,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ReceiptIcon sx={{ color: '#0284C7', fontSize: 18 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '13.5px' }}>
              Escrow Authorization Breakdown (#{bookingId})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Technician Doorstep Visit & Diagnosis Fee
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 800, bgcolor: '#DCFCE7', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '10px' }}>
                PAID UPFRONT 
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B', textDecoration: 'line-through' }}>
                ₹{visitFee}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#0F172A', fontSize: '13px', fontWeight: 700 }}>
                தொழிலாளர் கட்டணம் + 5% தள கட்டணம் (Labour & Platform Fee)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px' }}>
                ₹{partsAndLabor.toFixed(2)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '11px', display: 'block', mt: 0.3 }}>
              * கடை பில்படி: டெக்னீஷியன் அசல் கடை ரசீதை பதிவேற்றியவுடன் அந்த பில் தொகை + 5% தள கட்டணம் நேரடியாக சேர்க்கப்படும்.
            </Typography>
          </Box>

          {/* Seva Credits Redeem Box */}
          {walletBalance > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                bgcolor: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox
                  checked={redeemCredits}
                  onChange={(e) => setRedeemCredits(e.target.checked)}
                  sx={{ p: 0, color: '#10B981', '&.Mui-checked': { color: '#10B981' } }}
                />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', fontSize: '11.5px' }}>
                  Redeem Seva Credits (Max 20% cap)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#047857' }}>
                - ₹{creditDiscount.toFixed(2)}
              </Typography>
            </Paper>
          )}

          <Divider sx={{ borderStyle: 'dashed', my: 1.2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Total Escrow Hold via Razorpay
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0284C7' }}>
              ₹{netPayable.toFixed(2)}
            </Typography>
          </Box>
        </Card>

        {/* 3. Exclusive Razorpay Gateway Card */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1.5px solid #0284C7',
            borderRadius: '20px',
            p: 2.2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LockIcon sx={{ color: '#0284C7', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#0284C7', letterSpacing: 0.5 }}>
                EXCLUSIVE RAZORPAY GATEWAY
              </Typography>
            </Box>
            <Chip
              label="100% CASHLESS"
              size="small"
              sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 900, fontSize: '10px', height: 22 }}
            />
          </Box>

          {/* Option 1: UPI */}
          <Paper
            elevation={0}
            onClick={() => setPayMode('upi')}
            sx={{
              p: 1.4,
              borderRadius: '12px',
              bgcolor: payMode === 'upi' ? '#F0FDF4' : '#FFFFFF',
              border: payMode === 'upi' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              mb: 1.2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Radio checked={payMode === 'upi'} sx={{ p: 0, color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />
              <QrCodeIcon sx={{ color: '#10B981', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
                Razorpay UPI (GPay / PhonePe / Paytm / BHIM)
              </Typography>
            </Box>
            <Chip label="RECOMMENDED" size="small" sx={{ bgcolor: '#10B981', color: '#FFF', fontWeight: 900, fontSize: '9.5px', height: 20 }} />
          </Paper>

          {/* Option 2: Cards */}
          <Paper
            elevation={0}
            onClick={() => setPayMode('card')}
            sx={{
              p: 1.4,
              borderRadius: '12px',
              bgcolor: payMode === 'card' ? '#F0FDF4' : '#FFFFFF',
              border: payMode === 'card' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer'
            }}
          >
            <Radio checked={payMode === 'card'} sx={{ p: 0, color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />
            <CreditCardIcon sx={{ color: '#0284C7', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12.5px' }}>
              Razorpay Cards (Visa / Mastercard / Rupay)
            </Typography>
          </Paper>
        </Card>

        {/* 4. Action Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={isProcessing}
          onClick={handlePayNow}
          endIcon={!isProcessing && <ArrowForwardIcon />}
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
          {isProcessing ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : `Authorize & Pay ₹${netPayable.toFixed(2)} into Escrow →`}
        </Button>

      </Container>

      {/* Bottom Navigation */}
      <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#0284C7', fontWeight: 700 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} sx={{ color: '#0284C7' }} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
          <BottomNavigationAction label="Partner Zone" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/partner')} />
        </BottomNavigation>
      </Paper>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Connecting to Razorpay..."
        subtitle="Opening official Razorpay Cashless Escrow checkout modal."
        badge="ICICI Bank Escrow Backed"
      />

    </Box>
  );
}
