import { API_V1_URL } from '../../config';
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
import PhoneIcon from '@mui/icons-material/Phone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useAuth } from '../../context/AuthContext';
import { useCriticalWork } from '../../context/CriticalWorkContext';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { App as CapApp } from '@capacitor/app';
import { openRazorpay } from '../../services/razorpayService';

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
  const { setCriticalWork } = useCriticalWork();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'SLM-84920';

  const [redeemCredits, setRedeemCredits] = useState(true);
  const [payMode, setPayMode] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setCriticalWork(true, 'Digital payment in progress. Please do not refresh or leave this page.');
    } else {
      setCriticalWork(false);
    }
    return () => setCriticalWork(false);
  }, [isProcessing, setCriticalWork]);

  const [partsAndLabor, setPartsAndLabor] = useState(900);
  const [visitFee, setVisitFee] = useState(99);
  const [invoice, setInvoice] = useState(null);
  const [totalJobAmount, setTotalJobAmount] = useState(1000);
  const [upfrontFeePaid, setUpfrontFeePaid] = useState(99);
  const [remainingWorkAmount, setRemainingWorkAmount] = useState(901);
  const [customerFeePercent, setCustomerFeePercent] = useState(2.0);
  const [customerPlatformFee, setCustomerPlatformFee] = useState(18.02);
  const [gatewayFeePercent, setGatewayFeePercent] = useState(2.0);
  const [paymentGatewayFee, setPaymentGatewayFee] = useState(18.38);
  const [customerFinalPayable, setCustomerFinalPayable] = useState(937.40);

  useEffect(() => {
    if (bookingId) {
      localStorage.setItem('shazuone_active_booking', bookingId);
    }
    fetch(`${API_V1_URL}/bookings/${bookingId}/quote`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const inv = data.invoice;
          if (inv) {
            setInvoice(inv);
            setTotalJobAmount(inv.totalJobAmount);
            setUpfrontFeePaid(inv.upfrontFeePaid);
            setRemainingWorkAmount(inv.remainingWorkAmount);
            setCustomerFeePercent(inv.customerFeePercent);
            setCustomerPlatformFee(inv.customerPlatformFee);
            setGatewayFeePercent(inv.gatewayFeePercent);
            setPaymentGatewayFee(inv.paymentGatewayFee);
            setCustomerFinalPayable(inv.customerFinalPayable);
            setPartsAndLabor(inv.customerFinalPayable);
          } else {
            const items = data.items || [];
            const rawLaborCost = items
              .filter(i => i.type !== 'Spare Part')
              .reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty, 10) || 1), 0);
            const laborCost = rawLaborCost || 1000;
            const visit = data.booking?.visit_fee ? parseFloat(data.booking.visit_fee) : 99;
            const rem = Math.max(0, laborCost - visit);
            const cFee = Math.round(((rem * 2.0) / 100) * 100) / 100;
            const pgFee = Math.round((((rem + cFee) * 2.0) / 100) * 100) / 100;
            const finalPay = rem + cFee + pgFee;
            setTotalJobAmount(laborCost);
            setUpfrontFeePaid(visit);
            setRemainingWorkAmount(rem);
            setCustomerPlatformFee(cFee);
            setPaymentGatewayFee(pgFee);
            setCustomerFinalPayable(finalPay);
            setPartsAndLabor(finalPay);
          }
          if (data.booking?.visit_fee) {
            setVisitFee(parseFloat(data.booking.visit_fee));
          }
        }
      })
      .catch(err => console.warn('Real checkout quote poll:', err));

    // Auto-reconcile payment if customer returns after completing payment in UPI / external bank app
    const handleVisibilityCheck = async () => {
      if (bookingId) {
        try {
          const res = await fetch(`${API_V1_URL}/payments/status/${bookingId}`);
          const data = await res.json();
          if (data.success && (data.isPaid || data.status === 'quote_approved' || data.status === 'en_route')) {
            localStorage.setItem('shazuone_quote_status_' + bookingId, 'quote_approved');
            localStorage.setItem('shazuone_active_booking', bookingId);
            window.dispatchEvent(new CustomEvent('shazuone_quote_updated', { detail: { bookingId, status: 'quote_approved' } }));
            navigate(`/track?bookingId=${bookingId}`, { replace: true });
          }
        } catch (e) {
          // ignore background poll errors
        }
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleVisibilityCheck();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    // Native Capacitor app lifecycle resume handler (external UPI app switch return)
    let nativeListener = null;
    try {
      CapApp.addListener('appStateChange', (state) => {
        if (state && state.isActive) {
          handleVisibilityCheck();
        }
      }).then((handle) => {
        nativeListener = handle;
      }).catch(() => {});
    } catch (e) {
      // Browser fallback
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (nativeListener && typeof nativeListener.remove === 'function') {
        nativeListener.remove();
      }
    };
  }, [bookingId, navigate]);

  const grossTotal = partsAndLabor;
  // Standard conversion: 10 credits = 1 rs
  const availableRsFromCredits = Math.floor((walletBalance || 0) / 10);
  const maxBurnableRs = Math.min(availableRsFromCredits, Math.floor(grossTotal * 0.20));
  const creditDiscount = (redeemCredits && maxBurnableRs > 0) ? maxBurnableRs : 0;
  const creditsToDebit = creditDiscount * 10;
  const netPayable = Math.max(0, grossTotal - creditDiscount);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      if (creditsToDebit > 0) {
        await debitWallet(creditsToDebit, bookingId);
      }

      // 1. Ensure Razorpay checkout script is loaded
      await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      let orderId = undefined;
      let keyId = 'rzp_test_Tjo8HdYyapYlnO';
      let rzpAmountPaise = Math.round(netPayable * 100);

      try {
        const orderRes = await fetch(`${API_V1_URL}/payments/create-order`, {
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
          if (orderData.order.id && orderData.order.id.startsWith('order_')) {
            orderId = orderData.order.id;
          }
          if (orderData.order.amount) {
            rzpAmountPaise = parseInt(orderData.order.amount, 10);
          }
          if (orderData.keyId) keyId = orderData.keyId;
        }
      } catch (err) {
        console.warn('Razorpay order backend creation note:', err);
      }

      // 3. Open Razorpay Checkout (Native Android SDK BottomSheet on Mobile, Web SDK on Browser)
      try {
        const rzpResult = await openRazorpay({
          key: keyId,
          amount: rzpAmountPaise,
          currency: 'INR',
          name: 'Shazu One Cashless Escrow',
          description: `Service Escrow Authorization (${bookingId})`,
          image: 'https://salemseva-backend.onrender.com/favicon.png',
          order_id: orderId,
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@shazuone.in',
            contact: (user?.phone || '').replace(/\s+/g, '')
          },
          theme: {
            color: '#0284C7'
          }
        });

        if (rzpResult && rzpResult.success) {
          try {
            // Verify payment on backend
            await fetch(`${API_V1_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: bookingId,
                amount: netPayable,
                razorpay_payment_id: rzpResult.razorpay_payment_id,
                razorpay_order_id: rzpResult.razorpay_order_id || orderId,
                razorpay_signature: rzpResult.razorpay_signature
              })
            });

            // Update booking status
            await fetch(`${API_V1_URL}/bookings/${bookingId}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'quote_approved' })
            });
          } catch (e) {
            console.warn('Status update sync error:', e);
          }

          localStorage.setItem('shazuone_quote_status_' + bookingId, 'quote_approved');
          localStorage.setItem('shazuone_active_booking', bookingId);
          window.dispatchEvent(new CustomEvent('shazuone_quote_updated', { detail: { bookingId, status: 'quote_approved' } }));
          window.dispatchEvent(new Event('storage'));

          setIsProcessing(false);
          navigate(`/track?bookingId=${bookingId}`, { replace: true });
          return;
        }
      } catch (payErr) {
        console.warn('Razorpay checkout error / cancelled:', payErr);
        setIsProcessing(false);
        alert(payErr.message || 'Payment did not complete. Please retry or choose another payment method.');
        return;
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
            Safe Digital Advance Payment
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
            Your money is protected safely with Shazu One until you inspect & confirm work completion.
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
              Payment Summary & Protection Details (#{bookingId})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
              Approved Service Work Charge (வேலைக் கட்டணம்)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
              ₹{totalJobAmount.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#16A34A', fontSize: '12.5px' }}>
              Doorstep Diagnosis Fee (முன்பணம் கழித்தல்)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 800, bgcolor: '#DCFCE7', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '10px' }}>
                PAID UPFRONT
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                -₹{upfrontFeePaid.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '12.5px' }}>
              Net Balance Work Charges (மீதமுள்ள கட்டணம்)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
              ₹{remainingWorkAmount.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '12.5px', fontWeight: 600 }}>
              Platform Convenience Fee ({customerFeePercent}% தளக் கட்டணம்)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '13px' }}>
              +₹{customerPlatformFee.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px' }}>
              Payment Gateway Surcharge ({gatewayFeePercent}% PG கட்டணம்)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B', fontSize: '13px' }}>
              +₹{paymentGatewayFee.toFixed(2)}
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
                  Redeem Seva Credits ({walletBalance} credits = ₹{availableRsFromCredits}, Max 20% cap)
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
              Total Protected Amount via Razorpay
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
              label="100% DIGITAL ONLY"
              size="small"
              sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 900, fontSize: '10px', height: 22 }}
            />
          </Box>

          <Box sx={{ mb: 1.5, p: 1, bgcolor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#D97706', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, fontSize: '11px' }}>
              Digital Payments Only: No cash accepted at doorstep. 100% money protection guaranteed.
            </Typography>
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

        {/* Razorpay Gateway Outage / Offline Emergency Support Card */}
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            mb: 2,
            bgcolor: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '14px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
            <SupportAgentIcon sx={{ color: '#D97706', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '12.5px' }}>
              Razorpay சிக்கல் அல்லது அவசர உதவி தேவைப்படுகிறதா? (Gateway Helpline)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#78350F', fontSize: '11.5px', lineHeight: 1.5, mb: 1.2 }}>
            Razorpay கட்டண முறை செயல்படவில்லை என்றாலோ அல்லது ரொக்கமாக / நேரடி UPI மூலம் செலுத்த விரும்பினாலோ எங்கள் மத்திய கட்டுப்பாட்டு அறையை அழைக்கவும். ஆபரேட்டர் உடனே சரிபார்த்து உறுதி செய்வார்.
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<PhoneIcon sx={{ fontSize: 15 }} />}
            component="a"
            href="tel:+919842012345"
            sx={{
              borderColor: '#D97706',
              color: '#92400E',
              bgcolor: '#FEF3C7',
              fontWeight: 800,
              fontSize: '11.5px',
              textTransform: 'none',
              borderRadius: '8px',
              py: 0.6,
              '&:hover': { bgcolor: '#FDE68A', borderColor: '#B45309' }
            }}
          >
            Call Salem Central Ops (+91 98420 12345)
          </Button>
        </Paper>

        {/* 4. Action Button */}
        <Button
          variant="contained"
          className="btn-shimmer"
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
          {isProcessing ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : `Pay ₹${netPayable.toFixed(2)} Securely (Protected Advance) →`}
        </Button>

        {isOverrideActive && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOverrideModalOpen(true)}
            sx={{
              mt: 2,
              borderColor: '#D97706',
              color: '#B45309',
              fontWeight: 800,
              borderRadius: '12px',
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#FEF3C7', borderColor: '#B45309' }
            }}
          >
            Direct Cash / Offline Payment Confirmation
          </Button>
        )}

      </Container>

      {/* Bottom Navigation */}
      <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000, display: { xs: 'block', md: 'none' } }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#0284C7', fontWeight: 700 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} sx={{ color: '#0284C7' }} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
        </BottomNavigation>
      </Paper>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Connecting to Razorpay..."
        subtitle="Opening official Razorpay secure payment window."
        badge="100% Safe Payment Guarantee"
      />

    </Box>
  );
}
