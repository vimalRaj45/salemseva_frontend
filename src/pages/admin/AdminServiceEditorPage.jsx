import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Container,
  IconButton,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  ArrowLeft,
  Wrench,
  Save,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AdminServiceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = Boolean(id && id !== 'new');
  const existingService = location.state?.service || null;

  const [formData, setFormData] = useState({
    id: existingService?.id || (isEditMode ? id : ''),
    name: existingService?.name || existingService?.name_en || '',
    category: existingService?.category || 'ac',
    base_price: existingService?.base_price || existingService?.basePrice || '299.00',
    visit_fee: existingService?.visit_fee ? String(existingService.visit_fee) : '99.00',
    description: existingService?.description || '',
    rating_avg: existingService?.rating_avg || '4.85'
  });

  const [loading, setLoading] = useState(isEditMode && !existingService);
  const [saving, setSaving] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate('/admin');
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isEditMode && !existingService) {
      setLoading(true);
      fetch(`${API_V1_URL}/services/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (!isMounted) return;
          if (d.success && d.service) {
            const s = d.service;
            setFormData({
              id: s.id,
              name: s.name || s.name_en || '',
              category: s.category || 'ac',
              base_price: s.base_price || s.basePrice || '299.00',
              visit_fee: s.visit_fee ? String(s.visit_fee) : '99.00',
              description: s.description || '',
              rating_avg: s.rating_avg || '4.85'
            });
          } else {
            toast.error('Service not found');
          }
        })
        .catch(() => toast.error('Failed to load service'))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, existingService]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.base_price) {
      toast.error('Service name and base price are required');
      return;
    }

    setSaving(true);
    try {
      const url = isEditMode
        ? `${API_V1_URL}/admin/services/${formData.id}`
        : `${API_V1_URL}/admin/services`;
      const method = isEditMode ? 'PUT' : 'POST';

      const payload = {
        id: formData.id || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: formData.name,
        name_en: formData.name,
        category: formData.category,
        base_price: formData.base_price,
        estPriceRangeEn: formData.base_price ? `INR ${formData.base_price}` : undefined,
        visit_fee: parseFloat(formData.visit_fee) || 99.00,
        visitFee: parseFloat(formData.visit_fee) || 99.00,
        fee: parseFloat(formData.visit_fee) || 99.00,
        description: formData.description
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditMode ? 'Service updated successfully' : 'Service created successfully');
        handleDismiss();
      } else {
        toast.error(data.error || 'Failed to save service');
      }
    } catch (err) {
      toast.error(err.message || 'Network error saving service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#F8FAFC', pb: 10 }}>
      {/* Top App Bar */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 110 }}>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={handleDismiss} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: '#1E293B' } }}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '16px', sm: '18px' }, color: '#FFFFFF' }}>
                {isEditMode ? `Edit Service: ${formData.name}` : 'Create Catalog Service'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                Salem Seva Central Service Catalog & Diagnostic Fee Manager
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            sx={{
              bgcolor: '#0A66C2',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
              px: 2.5,
              height: 40,
              fontSize: '13px',
              '&:hover': { bgcolor: '#084e96' }
            }}
          >
            {saving ? 'Saving...' : 'Save Service'}
          </Button>
        </Container>
      </Box>

      {/* Form Content */}
      <Container maxWidth="md" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '10px', color: '#0A66C2' }}>
              <Wrench size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                Service Information and Pricing Tiers
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                Define doorstep inspection fee, base price, and technician labor tiers
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                SERVICE NAME
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Inverter AC Deep Jet Service"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                SERVICE CATEGORY
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
                >
                  <MenuItem value="ac">AC Repair & HVAC</MenuItem>
                  <MenuItem value="electrical">Electrician & Wiring</MenuItem>
                  <MenuItem value="plumbing">Plumbing & Drainage</MenuItem>
                  <MenuItem value="cleaning">Home Cleaning</MenuItem>
                  <MenuItem value="painting">Painting</MenuItem>
                  <MenuItem value="carpentry">Carpentry</MenuItem>
                  <MenuItem value="appliances">Appliances & Washing Machine</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                BASE SERVICE PRICE (INR)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="299.00"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">INR</InputAdornment>
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                DOORSTEP INSPECTION & TRAVEL FEE (INR)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="99.00"
                value={formData.visit_fee}
                onChange={(e) => setFormData({ ...formData, visit_fee: e.target.value })}
                helperText="Pre-authorized diagnostic allowance collected upfront"
                InputProps={{
                  startAdornment: <InputAdornment position="start">INR</InputAdornment>
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                DEFAULT DISPLAY RATING
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="4.85"
                value={formData.rating_avg}
                onChange={(e) => setFormData({ ...formData, rating_avg: e.target.value })}
                helperText="Customer satisfaction score displayed on service cards"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                DESCRIPTION & SCOPE OF WORK
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={4}
                placeholder="Details of inspection, inclusions, safety protocols, and warranty coverage..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
