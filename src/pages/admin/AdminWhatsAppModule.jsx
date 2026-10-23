import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  QrCode,
  Phone,
  ShieldCheck,
  RefreshCw,
  Send,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AdminWhatsAppModule() {
  const [gatewayStatus, setGatewayStatus] = useState({
    status: 'connecting',
    isConnected: false,
    connectedPhone: null,
    connectedName: null,
    qrCodeDataUrl: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pairingTab, setPairingTab] = useState('qr'); // 'qr' | 'pairing_code'

  // Phone number for pairing code
  const [businessPhone, setBusinessPhone] = useState('9842099999');
  const [pairingCodeResult, setPairingCodeResult] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);

  // Test OTP Diagnostic
  const [testRecipientPhone, setTestRecipientPhone] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/whatsapp/status`);
      const data = await res.json();
      if (data.success) {
        setGatewayStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch WhatsApp gateway status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Request 8-character pairing code
  const handleRequestPairingCode = async () => {
    setPairingLoading(true);
    setPairingCodeResult('');
    try {
      const cleanPhone = (businessPhone || '').replace(/[^0-9]/g, '');
      const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/whatsapp/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted })
      });
      const data = await res.json();
      setPairingLoading(false);
      if (data.success && data.pairingCode) {
        setPairingCodeResult(data.pairingCode);
        toast.success('Pairing code generated! Enter it on your WhatsApp app.');
      } else {
        toast.error(data.error || 'Failed to generate pairing code');
      }
    } catch (err) {
      setPairingLoading(false);
      toast.error(err.message || 'Error requesting pairing code');
    }
  };

  // Disconnect / Reset session
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect this WhatsApp session? You will need to re-scan to link.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/whatsapp/disconnect`, {
        method: 'POST'
      });
      const data = await res.json();
      setIsLoading(false);
      toast.success(data.message || 'Session reset. Fresh QR generating...');
      setPairingCodeResult('');
      fetchStatus();
    } catch (err) {
      setIsLoading(false);
      toast.error('Failed to disconnect');
    }
  };

  // Send test OTP
  const handleSendTestOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = (testRecipientPhone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/whatsapp/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      setTestSending(false);
      if (data.success) {
        setTestResult(data);
        toast.success(`Test OTP dispatched: ${data.otpCode}`);
      } else {
        toast.error(data.error || 'Test send failed');
      }
    } catch (err) {
      setTestSending(false);
      toast.error(err.message || 'Error sending test message');
    }
  };

  const isConnected = gatewayStatus.isConnected;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1100px', mx: 'auto' }}>
      {/* Title & Description */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#059669',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={22} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              WhatsApp Business OTP Gateway
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            Connect your official WhatsApp number via Baileys multi-device pairing to send free verification OTPs and alerts.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={isConnected ? <CheckCircle2 size={14} color="#059669" /> : <AlertCircle size={14} color="#D97706" />}
            label={isConnected ? `Live Connected (${gatewayStatus.connectedPhone || 'Business Number'})` : 'Waiting for Pairing'}
            sx={{
              fontWeight: 700,
              fontSize: '12px',
              bgcolor: isConnected ? '#ECFDF5' : '#FEF3C7',
              color: isConnected ? '#059669' : '#B45309',
              border: '1px solid',
              borderColor: isConnected ? '#A7F3D0' : '#FDE68A'
            }}
          />

          <Button
            size="small"
            variant="outlined"
            onClick={fetchStatus}
            startIcon={<RefreshCw size={14} />}
            sx={{
              borderRadius: '8px',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontSize: '12px',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Main Grid: Left (Pairing / Status) & Right (Diagnostics & Settings) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 3 }}>
        
        {/* ================= LEFT CARD: PAIRING & CONNECTION ================= */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF'
          }}
        >
          {isConnected ? (
            /* ACTIVE CONNECTED STATE */
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '24px',
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  border: '2px solid #A7F3D0'
                }}
              >
                <CheckCircle2 size={40} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                WhatsApp Gateway is Online & Active
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px', mb: 2 }}>
                Paired with WhatsApp Account: <strong style={{ color: '#0F172A' }}>+{gatewayStatus.connectedPhone}</strong>
              </Typography>

              <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1, maxWidth: '400px', mx: 'auto', textAlign: 'left', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '12px' }}>
                    Spam calls auto-rejected silently
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <Send size={16} color="#0284C7" />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '12px' }}>
                    Auto-dispatches 6-digit WhatsApp OTPs (5-min expiry, 60s cooldown)
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  startIcon={<LogOut size={16} />}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    textTransform: 'none',
                    px: 3,
                    py: 1
                  }}
                >
                  {isLoading ? 'Resetting session...' : 'Disconnect & Pair Different Number'}
                </Button>
              </Box>
            </Box>
          ) : (
            /* UNPAIRED: SHOW QR CODE & PAIRING CODE TABS */
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.4 }}>
                  Connect Your WhatsApp Account
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12.5px' }}>
                  Scan the QR code below or generate an 8-character pairing code to link your business phone.
                </Typography>
              </Box>

              <Tabs
                value={pairingTab}
                onChange={(e, val) => setPairingTab(val)}
                sx={{
                  mb: 2.5,
                  borderBottom: '1px solid #E2E8F0',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    minHeight: '40px'
                  }
                }}
              >
                <Tab label="Scan QR Code" value="qr" icon={<QrCode size={16} />} iconPosition="start" />
                <Tab label="Link with Phone Number" value="pairing_code" icon={<KeyRound size={16} />} iconPosition="start" />
              </Tabs>

              {/* TAB 1: QR CODE */}
              {pairingTab === 'qr' && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  {gatewayStatus.qrCodeDataUrl ? (
                    <Box sx={{ display: 'inline-block', p: 1.5, bgcolor: '#FFFFFF', borderRadius: '16px', border: '2px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', mb: 2 }}>
                      <Box
                        component="img"
                        src={gatewayStatus.qrCodeDataUrl}
                        alt="WhatsApp Pairing QR Code"
                        sx={{ width: 220, height: 220, display: 'block' }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CircularProgress size={32} sx={{ color: '#059669', mb: 1.5 }} />
                      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
                        Starting Baileys gateway and generating pairing QR...
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ maxWidth: '380px', mx: 'auto', textAlign: 'left', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', mb: 1, fontSize: '12px' }}>
                      How to scan and link:
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                      1. Open <strong>WhatsApp</strong> on your phone or business device.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5, fontSize: '11.5px' }}>
                      2. Tap <strong>Settings</strong> or <strong>Three Dots</strong> &gt; <strong>Linked Devices</strong>.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '11.5px' }}>
                      3. Tap <strong>Link a Device</strong> and point your camera at this QR code.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* TAB 2: LINK WITH PHONE NUMBER (PAIRING CODE) */}
              {pairingTab === 'pairing_code' && (
                <Box sx={{ py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.5 }}>
                    Enter WhatsApp Mobile Number (with Country Code)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="919842099999"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone size={15} color="#64748B" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '9px', fontSize: '13px' }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleRequestPairingCode}
                      disabled={pairingLoading}
                      sx={{
                        bgcolor: '#059669',
                        color: '#FFFFFF',
                        borderRadius: '9px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        textTransform: 'none',
                        px: 2.5,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#047857' }
                      }}
                    >
                      {pairingLoading ? <CircularProgress size={16} color="inherit" /> : 'Get Pairing Code'}
                    </Button>
                  </Box>

                  {pairingCodeResult && (
                    <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: '12px', border: '1.5px solid #A7F3D0', textAlign: 'center', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Enter this 8-character code in your WhatsApp app:
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#059669', letterSpacing: '4px', my: 1 }}>
                        {pairingCodeResult}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#047857', fontSize: '11px', display: 'block' }}>
                        WhatsApp &gt; Linked Devices &gt; Link a Device &gt; "Link with phone number instead"
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Card>

        {/* ================= RIGHT CARD: LIVE DIAGNOSTICS & TEST SENDER ================= */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Test Sender Tool */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Send size={18} color="#0284C7" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                Test Live WhatsApp Transmission
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, fontSize: '11.5px' }}>
              Send an instant verification test OTP to any phone number to verify your WhatsApp gateway delivery.
            </Typography>

            <Box component="form" onSubmit={handleSendTestOtp}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block', mb: 0.3, fontSize: '11px' }}>
                  Recipient Mobile Number
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="98427 11234"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>+91</span>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px', fontSize: '12.5px' }
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={testSending}
                startIcon={<Send size={15} />}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  textTransform: 'none',
                  py: 0.9,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                {testSending ? <CircularProgress size={16} color="inherit" /> : 'Send Test WhatsApp OTP'}
              </Button>
            </Box>

            {testResult && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F0F9FF', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 700, display: 'block' }}>
                  {testResult.message}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284C7', fontSize: '11px', display: 'block', mt: 0.3 }}>
                  Dispatched OTP: <strong>{testResult.otpCode}</strong> ({testResult.delivered ? 'Delivered via WhatsApp' : 'Simulated / Logged in Terminal'})
                </Typography>
              </Box>
            )}
          </Card>

          {/* Security & Anti-Spam Guard Info */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShieldCheck size={18} color="#059669" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>
                Protection Policies Active
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px', lineHeight: 1.4 }}>
                - <strong>Auto-Call Reject:</strong> Any voice or video call placed to your business number is automatically declined without disturbing your device.
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px', lineHeight: 1.4 }}>
                - <strong>Zero Message Ingestion:</strong> Incoming random text messages and spam are completely ignored to protect your WhatsApp account health.
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '11.5px', lineHeight: 1.4 }}>
                - <strong>Rate Limits:</strong> 60-second cooldown per mobile number prevents OTP spamming and misuse.
              </Typography>
            </Box>
          </Card>
        </Box>

      </Box>
    </Box>
  );
}
