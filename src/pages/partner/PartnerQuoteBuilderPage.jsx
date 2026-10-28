import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  IconButton,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';

import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useCriticalWork } from '../../context/CriticalWorkContext';

export default function PartnerQuoteBuilderPage() {
  const navigate = useNavigate();
  const { setCriticalWork } = useCriticalWork();
  const [searchParams] = useSearchParams();

  // Safely resolve active booking ID
  const rawParam = searchParams.get('bookingId');
  const storedJobId = localStorage.getItem('shazuone_partner_active_job');
  const storedCustId = localStorage.getItem('shazuone_active_booking');
  
  const resolvedId = (rawParam && rawParam !== 'null' && rawParam !== 'undefined')
    ? rawParam
    : (storedJobId || storedCustId || '');

  const [bookingId, setBookingId] = useState(resolvedId);
  const [customerData, setCustomerData] = useState({
    name: 'Customer',
    locality: 'Salem',
    issue: 'Service Diagnostics & Inspection'
  });
  const [isLoading, setIsLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [standardWorkTasks, setStandardWorkTasks] = useState([
    { id: 'w1', name: 'Diagnostics & Issue Inspection Labor', price: 150, type: 'Labor' },
    { id: 'w2', name: 'Basic Servicing & Maintenance Labor', price: 250, type: 'Labor' },
    { id: 'w3', name: 'Component Repair & Fitting Labor', price: 350, type: 'Labor' },
    { id: 'w4', name: 'Full Unit Overhaul & Deep Service Labor', price: 550, type: 'Labor' }
  ]);

  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setCriticalWork(true, 'Digital estimate submission in progress. Please do not refresh.');
    } else {
      setCriticalWork(false);
    }
    return () => setCriticalWork(false);
  }, [isProcessing, setCriticalWork]);

  // Fetch real booking metadata and quote items from Neon DB
  useEffect(() => {
    let isMounted = true;
    const fetchBookingDetails = async () => {
      try {
        const [trackRes, quoteRes] = await Promise.all([
          fetch(`${API_V1_URL}/bookings/${resolvedId}/track`).then(r => r.json()).catch(() => null),
          fetch(`${API_V1_URL}/bookings/${resolvedId}/quote`).then(r => r.json()).catch(() => null)
        ]);

        if (isMounted) {
          if (trackRes?.booking) {
            setBookingId(trackRes.booking.id);
            setCustomerData({
              name: trackRes.booking.customer_name || 'Customer',
              locality: trackRes.booking.locality || 'Fairlands, Salem',
              issue: trackRes.booking.custom_issue_description || 'Service Diagnostics & Inspection'
            });
          }

          if (quoteRes?.items && quoteRes.items.length > 0) {
            setItems(quoteRes.items.map(i => ({
              id: i.id || Date.now() + Math.random(),
              name: i.name,
              type: 'Labor',
              price: parseFloat(i.price) || 0,
              qty: i.qty || 1
            })));
          } else {
            // Default initial labor task
            setItems([
              {
                id: 'init_labor',
                name: 'Doorstep Diagnostics & Repair Labor',
                type: 'Labor',
                price: 250,
                qty: 1
              }
            ]);
          }
        }
      } catch (err) {
        console.warn('Quote builder fetch note:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBookingDetails();
    return () => { isMounted = false; };
  }, [resolvedId]);

  const totalGross = items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 1)), 0);
  const platformShare = Math.round(totalGross * 0.05 * 100) / 100; // 5% Platform Fee on Labor ONLY
  const techShare = totalGross; // Partner receives full quoted work charge amount
  const totalCustomerBill = totalGross + platformShare;

  const handleAddItem = () => {
    if (!customName.trim() || !customPrice || parseFloat(customPrice) <= 0) return;
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        name: customName.trim(),
        type: 'Labor',
        price: parseFloat(customPrice),
        qty: 1
      }
    ]);
    setCustomName('');
    setCustomPrice('');
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSendToCustomer = async () => {
    setIsProcessing(true);
    try {
      await fetch(`${API_V1_URL}/partner/quote/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          items: items.map(i => ({ ...i, type: 'Labor' })),
          partsMode: 'none'
        })
      });

      await fetch(`${API_V1_URL}/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'quote_presented', partsMode: 'none' })
      });

      localStorage.setItem('shazuone_quote_status_' + bookingId, 'quote_presented');
      localStorage.setItem('shazuone_active_booking', bookingId);
      window.dispatchEvent(new CustomEvent('shazuone_quote_updated', { detail: { bookingId, status: 'quote_presented' } }));
      window.dispatchEvent(new Event('storage'));

      setSuccessToast(true);
    } catch (e) {
      console.warn('Quote submit fallback:', e);
    }
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/partner');
    }, 800);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', py: 4 }}>
      <Container maxWidth="md">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/partner')} 
          sx={{ color: '#0284C7', mb: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Back to Duty Screen (வேலைக்கு திரும்பு)
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
          <AssignmentTurnedInIcon sx={{ color: '#0284C7', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
            Work & Labor Charge Card (வேலைக் கட்டணம் உள்ளீடு)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Booking ID: <strong>#{bookingId}</strong> • Customer: <strong>{customerData.name}</strong> ({customerData.locality})
        </Typography>

        <Grid container spacing={3}>
          
          {/* Left Column: Work Tasks */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0284C7' }}>
                  Technician Work & Labor Tasks
                </Typography>
                <Chip label="Workmanship Only" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 700, fontSize: '10px' }} />
              </Box>

              {/* No Products Notice */}
              <Paper elevation={0} sx={{ p: 1.4, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', mb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ShieldIcon sx={{ fontSize: 18, color: '#166534', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '11.5px', lineHeight: 1.45, fontWeight: 600 }}>
                  <strong>உதிரிபாகங்கள் தளம் மூலம் விற்கப்படுவதில்லை (No Product Sales):</strong> உதிரிபாகங்கள் தேவைப்பட்டால், வாடிக்கையாளர் நேரடியாகவோ அல்லது நீங்கள் உள்ளூர் கடையிலிருந்தோ வாங்கிக் கொள்ளலாம். சேலம்சேவா தளத்தின் 5% கட்டணம் உங்கள் <strong>வேலைக் கட்டணத்திற்கு மட்டுமே</strong> பொருந்தும்.
                </Typography>
              </Paper>

              {items.map(item => (
                <Paper key={item.id} elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>{item.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mt: 0.3 }}>
                      <Chip label="Service Labor" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontSize: '10px', height: 18, fontWeight: 700 }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#10B981' }}>₹{parseFloat(item.price).toFixed(2)}</Typography>
                    <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))}

              {/* Quick Add Standard Work Tasks */}
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.6 }}>
                  QUICK ADD STANDARD WORK CHARGES:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {standardWorkTasks.map(sp => (
                    <Chip
                      key={sp.id}
                      label={`+ ${sp.name} (₹${sp.price})`}
                      size="small"
                      onClick={() => {
                        setItems(prev => [...prev, {
                          id: Date.now() + Math.random(),
                          name: sp.name,
                          type: 'Labor',
                          price: sp.price,
                          qty: 1
                        }]);
                      }}
                      sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '11px', cursor: 'pointer', '&:hover': { bgcolor: '#E0F2FE', color: '#0284C7' } }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2, borderColor: '#E2E8F0' }} />

              {/* Add Custom Labor Task */}
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mb: 1 }}>
                ADD CUSTOM WORK / LABOR TASK:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  placeholder="Task Description (e.g. Fan Motor Bearing Repair)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  sx={{ flex: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <TextField 
                  size="small" 
                  type="number"
                  placeholder="Labor Charge (₹)"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <Button variant="contained" onClick={handleAddItem} sx={{ bgcolor: '#0284C7', borderRadius: '10px', '&:hover': { bgcolor: '#0369A1' } }}>
                  <AddCircleIcon />
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Earnings Summary */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
                Earnings & Commission Breakdown
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Your Work / Labor Charge</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>₹{totalGross.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#2563EB' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Shazu One Platform Fee (5% on Labor)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>+₹{platformShare.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>Total Billed to Customer</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>₹{totalCustomerBill.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10B981' }}>
                    Your Guaranteed Payout
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>100% of Quoted Labor • Direct IMPS</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981' }}>
                  ₹{techShare.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSendToCustomer}
                sx={{
                  py: 1.4,
                  fontSize: '15px',
                  borderRadius: '14px',
                  fontWeight: 900,
                  bgcolor: '#10B981',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Send Work Charge to Customer
              </Button>
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Sending Work Charge Estimate..."
        subtitle="Broadcasting verified labor estimate to Customer for 1-Click Approval"
        badge="Live WebSync Active"
      />

    </Box>
  );
}
