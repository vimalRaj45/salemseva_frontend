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
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MicIcon from '@mui/icons-material/Mic';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneIcon from '@mui/icons-material/Phone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useAuth } from '../../context/AuthContext';
import { useCriticalWork } from '../../context/CriticalWorkContext';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { App as CapApp } from '@capacitor/app';
import { openRazorpay } from '../../services/razorpayService';
import DynamicQrPaymentBox from '../../components/payments/DynamicQrPaymentBox';

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
  const [payMode, setPayMode] = useState('dynamic_qr'); // 'dynamic_qr' | 'razorpay'

  const handleDynamicQrSuccess = () => {
    localStorage.setItem('shazuone_quote_status_' + bookingId, 'completed');
    localStorage.setItem('shazuone_active_booking', bookingId);
    window.dispatchEvent(new CustomEvent('shazuone_quote_updated', { detail: { bookingId, status: 'completed' } }));
    window.dispatchEvent(new Event('storage'));
    navigate(`/track?bookingId=${bookingId}&paid=1`, { replace: true });
  };
  // One stage machine drives the button, the critical-work lock and the copy on the loading
  // screen. 'verifying' is the window between Razorpay closing and the booking being ready,
  // which previously showed nothing but a stale "Connecting to Razorpay" message.
  const [paymentStage, setPaymentStage] = useState('idle'); // idle | preparing | awaiting | verifying
  const isProcessing = paymentStage !== 'idle';

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
  // Direct Cash Referral Reward Wallet deduction (1 Rupee = 1 Rupee direct deduction on next booking)
  const referralRewardRs = Math.max(0, parseFloat(walletBalance || 0));
  const referralDiscount = Math.min(referralRewardRs, grossTotal);
  const netPayable = Math.max(0, grossTotal - referralDiscount);

  const handlePayNow = async () => {
    setPaymentStage('preparing');

    try {
      if (referralDiscount > 0) {
        await debitWallet(referralDiscount, bookingId);
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
      setPaymentStage('awaiting');
      try {
        const rzpResult = await openRazorpay({
          key: keyId,
          amount: rzpAmountPaise,
          currency: 'INR',
          name: 'SalemSeva Home Services',
          description: `Service Payment Authorization (${bookingId})`,
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
          // The money has already left the customer by this point. Keep the processing screen
          // up and say what is actually happening until the booking is ready to be shown.
          setPaymentStage('verifying');

          const verifyRes = await fetch(`${API_V1_URL}/payments/verify`, {
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
          const verifyData = await verifyRes.json().catch(() => null);
          if (!verifyRes.ok || !verifyData?.success) {
            // The Razorpay webhook may still settle this charge, and the tracking page reads the
            // booking rather than trusting this call, so record the failure and carry on.
            console.warn('Payment verification did not confirm:', verifyRes.status, verifyData?.error || '');
          }

          // Status sync is best effort: the verification above is the source of truth.
          try {
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

          // `paid=1` tells the tracking page to show the payment confirmation rather than the
          // generic dispatch loader while it pulls the booking for the first time.
          setPaymentStage('idle');
          navigate(`/track?bookingId=${bookingId}&paid=1`, { replace: true });
          return;
        }
      } catch (payErr) {
        console.warn('Razorpay checkout error / cancelled:', payErr);
        setPaymentStage('idle');
        alert(payErr.message || 'Payment did not complete. Please retry or choose another payment method.');
        return;
      }
    } catch (e) {
      console.error('Payment checkout error:', e);
      setPaymentStage('idle');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 10 }}>
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
            <Typography variant="body2" sx={{ color: '#16A34A', fontSize: '12.5px', fontWeight: 600 }}>
              Payment Gateway Fee (Direct Business UPI)
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A', fontSize: '13px' }}>
              ₹0.00 (Free)
            </Typography>
          </Box>

          {/* Customer Referral Cash Reward Auto-Applied */}
          {referralDiscount > 0 && (
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
                <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', fontSize: '11.5px' }}>
                  Referral Cash Reward Applied (Direct Rupee Discount)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#047857' }}>
                - ₹{referralDiscount.toFixed(2)}
              </Typography>
            </Paper>
          )}

          <Divider sx={{ borderStyle: 'dashed', my: 1.2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Total Final Payable Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0284C7' }}>
              ₹{netPayable.toFixed(2)}
            </Typography>
          </Box>
        </Card>

        {/* 3. Direct Business Dynamic QR Payment with Screenshot & OCR */}
        <Box sx={{ mb: 3 }}>
          <DynamicQrPaymentBox
            bookingId={bookingId}
            amount={netPayable}
            paymentType="FINAL_SETTLEMENT"
            serviceName="Doorstep Service"
            onSuccess={handleDynamicQrSuccess}
          />
        </Box>
      </Container>

      {/* Navigation lives in the global CustomerTabBar; this flow keeps only its own CTA. */}

      {/* Processing Loader: the copy follows the stage so the customer is never told the
          Razorpay window is opening while their money is already being confirmed. */}
      <ProcessingBackdrop
        open={isProcessing}
        mode="payment"
        title={
          paymentStage === 'verifying'
            ? 'Your payment is processing...'
            : paymentStage === 'awaiting'
              ? 'Complete your payment in UPI app'
              : 'Setting up your secure payment...'
        }
        subtitle={
          paymentStage === 'verifying'
            ? 'Confirming with the bank and securing your payment. Please keep this screen open.'
            : 'Finish the payment and upload your receipt screenshot to confirm your booking.'
        }
        badge="100% Safe Payment Guarantee"
      />

    </Box>
  );
}
