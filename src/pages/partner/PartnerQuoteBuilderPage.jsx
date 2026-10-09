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

import ProcessingBackdrop from '../../components/ProcessingBackdrop';

export default function PartnerQuoteBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Safely resolve active booking ID
  const rawParam = searchParams.get('bookingId');
  const storedJobId = localStorage.getItem('salemseva_partner_active_job');
  const storedCustId = localStorage.getItem('salemseva_active_booking');
  
  const resolvedId = (rawParam && rawParam !== 'null' && rawParam !== 'undefined')
    ? rawParam
    : (storedJobId || storedCustId || 'SLM-84920');

  const [bookingId, setBookingId] = useState(resolvedId);
  const [customerData, setCustomerData] = useState({
    name: 'Vimal Raj',
    locality: 'Fairlands, Salem',
    issue: 'AC Doorstep Inspection & Service'
  });
  const [isLoading, setIsLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [catalogSpares, setCatalogSpares] = useState([]);

  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customType, setCustomType] = useState('Spare Part');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Fetch real booking metadata and quote items from Neon DB
  useEffect(() => {
    let isMounted = true;
    const fetchBookingDetails = async () => {
      try {
        const [trackRes, quoteRes] = await Promise.all([
          fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${resolvedId}/track`).then(r => r.json()).catch(() => null),
          fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${resolvedId}/quote`).then(r => r.json()).catch(() => null)
        ]);

        if (isMounted) {
          const serviceId = trackRes?.booking?.service_id || 'ac';
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
              type: i.type || 'Spare Part',
              price: parseFloat(i.price) || 0,
              isOem: Boolean(i.isOem),
              qty: i.qty || 1
            })));
          }

          // Fetch real spares catalog for this service trade from DB
          try {
            const catRes = await fetch(`https://salemseva-backend.onrender.com/api/v1/services/${serviceId}/spares`);
            const catData = await catRes.json();
            if (catData.success && catData.items) {
              setCatalogSpares(catData.items);
              if (!quoteRes?.items || quoteRes.items.length === 0) {
                setItems(catData.items.slice(0, 3).map(i => ({
                  id: i.id,
                  name: i.name,
                  type: i.type,
                  price: parseFloat(i.price),
                  isOem: Boolean(i.isOem),
                  qty: 1
                })));
              }
            }
          } catch (e) {}
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
  const platformShare = totalGross * 0.05; // 5% SalemSeva Platform Fee
  const techShare = totalGross; // Partner receives full service quote amount
  const totalCustomerBill = totalGross + platformShare;

  const handleAddItem = () => {
    if (!customName.trim() || !customPrice || parseFloat(customPrice) <= 0) return;
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        name: customName.trim(),
        type: customType || 'Custom Spare / Labor',
        price: parseFloat(customPrice),
        isOem: customType === 'Spare Part',
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
      await fetch('https://salemseva-backend.onrender.com/api/v1/partner/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          items: items,
          partsMode: 'tech_buys'
        })
      });

      await fetch(`https://salemseva-backend.onrender.com/api/v1/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'quote_presented' })
      });

      localStorage.setItem('salemseva_quote_status_' + bookingId, 'quote_presented');
      localStorage.setItem('salemseva_active_booking', bookingId);
      window.dispatchEvent(new CustomEvent('salemseva_quote_updated', { detail: { bookingId, status: 'quote_presented' } }));
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
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
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
            On-Site Digital Quote Creator
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Booking ID: <strong>#{bookingId}</strong> • Customer: <strong>{customerData.name}</strong> ({customerData.locality})
        </Typography>

        <Grid container spacing={3}>
          
          {/* Left Column: Line Items */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0284C7' }}>
                  Bill Items & Spare Parts
                </Typography>
                <Chip label="Local Store Purchase" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 700, fontSize: '10px' }} />
              </Box>

              {/* Local Market Sourcing Notice for Tech */}
              <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '11px', lineHeight: 1.4 }}>
                  🛍️ <strong>Direct Local Market Purchase:</strong> You source OEM parts directly from authorized Salem electrical/hardware stores. Always provide the genuine dealer bill with 30-day warranty to the customer.
                </Typography>
              </Paper>

              {items.map(item => (
                <Paper key={item.id} elevation={0} sx={{ p: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>{item.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', mt: 0.3 }}>
                      <Chip label={item.type} size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontSize: '10px', height: 18, fontWeight: 700 }} />
                      {item.isOem && <Chip label="OEM Genuine" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontSize: '9px', height: 16, fontWeight: 700 }} />}
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

              {/* Quick Add from Available Trade Catalog */}
              {catalogSpares.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.6 }}>
                    QUICK ADD FROM SALEM SPARES CATALOG:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {catalogSpares.map(sp => (
                      <Chip
                        key={sp.id}
                        label={`+ ${sp.name} (₹${sp.price})`}
                        size="small"
                        onClick={() => {
                          setItems(prev => [...prev, {
                            id: Date.now() + Math.random(),
                            name: sp.name,
                            type: sp.type,
                            price: sp.price,
                            isOem: sp.isOem,
                            qty: 1
                          }]);
                        }}
                        sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '11px', cursor: 'pointer', '&:hover': { bgcolor: '#E0F2FE', color: '#0284C7' } }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2, borderColor: '#E2E8F0' }} />

              {/* Add Custom Item */}
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mb: 1 }}>
                ADD CUSTOM SPARE PART / LABOR TASK:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  placeholder="Item Name (e.g. Copper Flare Nut)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  sx={{ flex: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <TextField 
                  size="small" 
                  type="number"
                  placeholder="Price (₹)"
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
                Earnings & Split Breakdown
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>Your Service Quote (Labor & Spares)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>₹{totalGross.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#2563EB' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>SalemSeva Platform Fee (5%)</Typography>
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
                  <Typography variant="caption" sx={{ color: '#64748B' }}>100% of Quoted Service • Direct IMPS</Typography>
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
                Send Quote to Customer App
              </Button>
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Sending Digital Estimate..."
        subtitle="Broadcasting OEM parts & labor job card to Customer Vimal Raj for 1-Click Approval"
        badge="Live WebSync Active"
      />

    </Box>
  );
}
