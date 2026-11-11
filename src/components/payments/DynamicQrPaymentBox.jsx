import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Paper
} from '@mui/material';
import {
  QrCode,
  UploadCloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Camera,
  Check,
  Smartphone
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function DynamicQrPaymentBox({
  bookingId,
  amount = 99.00,
  paymentType = 'ADVANCE_FEE',
  serviceName = 'Doorstep Service',
  onSuccess,
  onCancel
}) {
  const [loadingQr, setLoadingQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Screenshot and OCR States
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrDetectedUtr, setOcrDetectedUtr] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [customerUtr, setCustomerUtr] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // 1. Fetch Dynamic QR intent from backend (UPI ID and Merchant Name come dynamically from backend env)
  const fetchQrIntent = async () => {
    try {
      setLoadingQr(true);
      setErrorMessage('');
      const res = await fetch(`${API_V1_URL}/payments/qr-intent?bookingId=${encodeURIComponent(bookingId || '')}&amount=${amount}&paymentType=${paymentType}`);
      const data = await res.json();

      // Console log what comes from backend environment
      console.log('%c[DYNAMIC QR PAGE - BACKEND ENV CONFIG]', 'background: #2563EB; color: #FFFFFF; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
      console.log('1. Business UPI ID (from backend env):', data.businessUpiId);
      console.log('2. Business Merchant Name (from backend env):', data.businessMerchantName);
      console.log('3. Dynamic UPI Intent URI:', data.upiUri);
      console.log('4. Amount:', data.amount);
      console.log('5. Full Backend Response Payload:', data);

      if (data.success && data.upiUri) {
        setUpiUri(data.upiUri);
        setMerchantName(data.businessMerchantName || '');

        // Generate QR Code data URL
        const { default: QRCode } = await import('qrcode');
        const qrUrl = await QRCode.toDataURL(data.upiUri, {
          width: 220,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(qrUrl);
      } else {
        setErrorMessage(data?.error || 'Unable to generate dynamic UPI QR. Please ensure payment settings are configured.');
      }
    } catch (err) {
      console.warn('QR fetch error:', err);
      setErrorMessage('Network error connecting to payment gateway. Please retry.');
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    fetchQrIntent();
  }, [bookingId, amount, paymentType]);

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(parseFloat(amount).toFixed(2));
    setCopiedAmount(true);
    toast.success(`Amount ₹${parseFloat(amount).toFixed(2)} copied!`);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  // 2. Handle Screenshot Selection & OCR
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid payment screenshot image (PNG, JPG, WEBP).');
      return;
    }

    setScreenshotFile(file);
    const localUrl = URL.createObjectURL(file);
    setScreenshotPreview(localUrl);
    setErrorMessage('');

    // Trigger OCR & Background Storage Upload
    runOcrOnImage(file);
    uploadScreenshotToStorage(file);
  };

  // Run in-browser OCR with server fallback
  async function runOcrOnImage(file) {
    setIsScanningOcr(true);
    try {
      let extractedText = '';

      // Client-Side OCR with Tesseract Worker
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        extractedText = ret.data.text || '';
        await worker.terminate();
      } catch (clientOcrErr) {
        console.warn('Client OCR notice, using fallback server regex:', clientOcrErr);
      }

      // Extract 12-digit UTR using regex
      const utrPatterns = [
        /(?:UPI\s*Ref(?:\s*No)?|UTR(?:\s*No)?|Ref\s*No|Transaction\s*ID|Txn\s*ID|Google\s*Transaction\s*ID)[\s:=]*([0-9]{12})/i,
        /UPI\s*transaction\s*ID\s*[:=]?\s*([0-9]{12})/i,
        /\b([0-9]{12})\b/
      ];

      let detected = null;
      for (const pattern of utrPatterns) {
        const match = extractedText.match(pattern);
        if (match && match[1]) {
          detected = match[1];
          break;
        } else if (match && match[0] && match[0].length === 12 && /^\d+$/.test(match[0])) {
          detected = match[0];
          break;
        }
      }

      if (detected) {
        setOcrDetectedUtr(detected);
        setCustomerUtr(detected);
        setOcrConfidence(0.95);
        toast.success(`12-digit UTR ${detected} detected from screenshot!`);
      } else {
        // Send to backend OCR helper
        const res = await fetch(`${API_V1_URL}/payments/ocr-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText, rawOcr: extractedText })
        });
        const d = await res.json();
        if (d.success && d.detectedUtr) {
          setOcrDetectedUtr(d.detectedUtr);
          setCustomerUtr(d.detectedUtr);
          toast.success(`12-digit UTR ${d.detectedUtr} verified!`);
        }
      }
    } catch (err) {
      console.warn('OCR processing error:', err);
    } finally {
      setIsScanningOcr(false);
    }
  };

  // Upload screenshot to object storage
  async function uploadScreenshotToStorage(file) {
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          const res = await fetch(`${API_V1_URL}/storage/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type || 'image/jpeg',
              folder: 'payments',
              referenceId: bookingId || 'manual_qr',
              fileName: `screenshot_${bookingId}_${Date.now()}.jpg`
            })
          });
          const d = await res.json();
          if (d.success && d.url) {
            setScreenshotUrl(d.url);
          } else {
            // Keep local base64 preview as fallback URL
            setScreenshotUrl(base64Data);
          }
        } catch (upErr) {
          setScreenshotUrl(base64Data);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingImage(false);
    }
  };

  // 3. Final Submission
  const handleSubmitPayment = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const cleanUtr = String(customerUtr || '').trim().replace(/\s+/g, '');
    if (!cleanUtr || cleanUtr.length < 6) {
      setErrorMessage('Please enter the valid 12-digit UPI UTR / Transaction Reference number from your payment app.');
      return;
    }

    if (!screenshotPreview && !screenshotUrl) {
      setErrorMessage('Please attach the screenshot of your UPI payment receipt for verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bookingId,
        amount: parseFloat(amount),
        customerUtr: cleanUtr,
        screenshotUrl: screenshotUrl || screenshotPreview,
        ocrDetectedUtr: ocrDetectedUtr || null,
        paymentType
      };

      const res = await fetch(`${API_V1_URL}/payments/submit-manual-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Payment submitted! Central Operations Desk is verifying your booking.');
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        setErrorMessage(data.error || 'Failed to submit payment proof. Please review details and try again.');
      }
    } catch (err) {
      setErrorMessage('Network error while recording payment. Please check your internet connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        maxWidth: 580,
        mx: 'auto'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '10px', color: '#1D6FE5', display: 'flex' }}>
            <QrCode size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
              Business Dynamic UPI QR
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              {serviceName} • Booking #{bookingId}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<ShieldCheck size={13} color="#16A34A" />}
          label="Direct Company Payment"
          size="small"
          sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: '11px', height: 24 }}
        />
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '12.5px' }}>
          {errorMessage}
        </Alert>
      )}

      {/* STEP 1: Dynamic QR Code Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          bgcolor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
          mb: 2.5
        }}
      >
        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Step 1: Scan with Any UPI App & Pay Exact Amount
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          {loadingQr ? (
            <Box sx={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <CircularProgress size={32} sx={{ color: '#1D6FE5' }} />
            </Box>
          ) : (
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                border: '2px solid #CBD5E1',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
              }}
            >
              <img
                src={qrDataUrl}
                alt="Dynamic UPI QR Code"
                style={{ width: 210, height: 210, display: 'block', borderRadius: '6px' }}
              />
            </Box>
          )}
        </Box>

        {/* Amount & VPA Details with 1-Tap Copy */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 380, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#FFFFFF',
              px: 1.5,
              py: 0.8,
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '10.5px' }}>
                Exact Payable Amount
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                ₹{parseFloat(amount).toFixed(2)}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={handleCopyAmount}
              startIcon={copiedAmount ? <Check size={14} /> : <Copy size={14} />}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '11px', color: copiedAmount ? '#16A34A' : '#1D6FE5' }}
            >
              {copiedAmount ? 'Copied' : 'Copy'}
            </Button>
          </Box>
        </Box>

        {/* 1-Tap Mobile UPI App Triggers */}
        {upiUri && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1, fontSize: '11px' }}>
              Or tap your UPI app directly on this device:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                href={`gpay://upi/pay?${upiUri.replace('upi://pay?', '')}`}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '11px', py: 0.6 }}
              >
                GPay
              </Button>
              <Button
                variant="outlined"
                size="small"
                href={`phonepe://upi/pay?${upiUri.replace('upi://pay?', '')}`}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '11px', py: 0.6 }}
              >
                PhonePe
              </Button>
              <Button
                variant="outlined"
                size="small"
                href={`paytmmp://upi/pay?${upiUri.replace('upi://pay?', '')}`}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '11px', py: 0.6 }}
              >
                Paytm
              </Button>
              <Button
                variant="contained"
                size="small"
                href={upiUri}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '11px', py: 0.6, bgcolor: '#1D6FE5', '&:hover': { bgcolor: '#1657B5' } }}
              >
                Open UPI App
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* STEP 2: Screenshot Upload & OCR Auto-Detection */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
          Step 2: Upload Payment Screenshot (Auto-detects UTR)
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {!screenshotPreview ? (
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '2px dashed #93C5FD',
              bgcolor: '#EFF6FF',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#DBEAFE', borderColor: '#3B82F6' }
            }}
          >
            <UploadCloud size={32} color="#1D6FE5" style={{ margin: '0 auto 8px auto' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1D6FE5', mb: 0.5 }}>
              Click to upload payment screenshot
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Takes a photo or selects receipt from gallery. Instant OCR will detect the 12-digit UTR.
            </Typography>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              component="img"
              src={screenshotPreview}
              alt="Payment Proof"
              sx={{ width: 68, height: 68, objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1' }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                  Screenshot Attached
                </Typography>
                {isScanningOcr && (
                  <Chip
                    icon={<CircularProgress size={12} sx={{ color: '#0284C7' }} />}
                    label="OCR Scanning..."
                    size="small"
                    sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 700, fontSize: '10.5px', height: 20 }}
                  />
                )}
                {ocrDetectedUtr && (
                  <Chip
                    icon={<CheckCircle2 size={12} />}
                    label="UTR Detected"
                    size="small"
                    sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: '10.5px', height: 20 }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {screenshotFile?.name || 'receipt_screenshot.png'}
              </Typography>
              <Button
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: 'none', fontSize: '11px', p: 0, mt: 0.5, fontWeight: 700, color: '#1D6FE5' }}
              >
                Change Screenshot
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* STEP 3: UTR Field & Final Submission */}
      <Box component="form" onSubmit={handleSubmitPayment}>
        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
          Step 3: Confirm 12-Digit UPI Transaction / UTR Number
        </Typography>

        <TextField
          fullWidth
          required
          label="12-digit UPI UTR / Transaction Reference"
          placeholder="e.g. 412345678901"
          value={customerUtr}
          onChange={(e) => setCustomerUtr(e.target.value.replace(/\s+/g, ''))}
          helperText={ocrDetectedUtr ? 'Auto-filled from screenshot. Verify with your banking app if needed.' : 'Enter the 12-digit reference number displayed on your UPI receipt.'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Smartphone size={16} color="#64748B" />
              </InputAdornment>
            ),
            endAdornment: ocrDetectedUtr ? (
              <InputAdornment position="end">
                <CheckCircle2 size={16} color="#16A34A" />
              </InputAdornment>
            ) : null
          }}
          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {onCancel && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 1.2 }}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting || !customerUtr || customerUtr.length < 6}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '14px',
              py: 1.3,
              bgcolor: '#16A34A',
              '&:hover': { bgcolor: '#15803D' }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
            ) : (
              `Submit Payment Proof (₹${parseFloat(amount).toFixed(2)})`
            )}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
