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
  Switch,
  Paper,
  Container,
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  ArrowLeft,
  Tag,
  Save,
  CheckCircle2,
  Percent,
  Coins
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AdminCouponEditorPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = Boolean(code && code !== 'new');
  const existingCoupon = location.state?.coupon || null;

  const [formData, setFormData] = useState({
    id: existingCoupon?.id || null,
    code: existingCoupon?.code || (isEditMode ? code : ''),
    discountType: existingCoupon?.discountType || existingCoupon?.discount_type || 'flat',
    discountValue: existingCoupon?.discountValue ?? existingCoupon?.discount_value ?? '',
    minOrderAmount: existingCoupon?.minOrderAmount ?? existingCoupon?.min_order_amount ?? '',
    maxDiscountCap: existingCoupon?.maxDiscountCap ?? existingCoupon?.max_discount_cap ?? '',
    usageLimit: existingCoupon?.usageLimit ?? existingCoupon?.usage_limit ?? '',
    description: existingCoupon?.description || '',
    isActive: existingCoupon ? Boolean(existingCoupon.isActive ?? existingCoupon.is_active) : true
  });

  const [loading, setLoading] = useState(isEditMode && !existingCoupon);
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
    if (isEditMode && !existingCoupon) {
      setLoading(true);
      fetch(`${API_V1_URL}/admin/coupons`)
        .then((r) => r.json())
        .then((d) => {
          if (!isMounted) return;
          if (d.success && Array.isArray(d.coupons)) {
            const found = d.coupons.find(
              (c) => String(c.code).toUpperCase() === String(code).toUpperCase() || String(c.id) === String(code)
            );
            if (found) {
              setFormData({
                id: found.id,
                code: found.code,
                discountType: found.discountType || found.discount_type || 'flat',
                discountValue: found.discountValue ?? found.discount_value ?? '',
                minOrderAmount: found.minOrderAmount ?? found.min_order_amount ?? '',
                maxDiscountCap: found.maxDiscountCap ?? found.max_discount_cap ?? '',
                usageLimit: found.usageLimit ?? found.usage_limit ?? '',
                description: found.description || '',
                isActive: Boolean(found.isActive ?? found.is_active)
              });
            } else {
              toast.error('Coupon not found');
            }
          }
        })
        .catch(() => toast.error('Failed to load coupon'))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [code, isEditMode, existingCoupon]);

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    setSaving(true);
    try {
      const url = formData.id
        ? `${API_V1_URL}/admin/coupons/${formData.id}`
        : `${API_V1_URL}/admin/coupons`;
      const method = formData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || (formData.id ? 'Coupon updated' : 'Coupon created'));
        handleDismiss();
      } else {
        toast.error(data.error || 'Failed to save coupon');
      }
    } catch (err) {
      toast.error(err.message || 'Network error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0A66C2' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: 10 }}>
      {/* Top App Bar */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 110 }}>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={handleDismiss} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: '#1E293B' } }}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '16px', sm: '18px' }, color: '#FFFFFF' }}>
                {isEditMode ? `Edit Coupon: ${formData.code}` : 'Create Promotional Coupon'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                Salem Operations Promotional Discount Desk
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
            {saving ? 'Saving...' : 'Save Coupon'}
          </Button>
        </Container>
      </Box>

      {/* Form Content */}
      <Container maxWidth="md" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '10px', color: '#0A66C2' }}>
              <Tag size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                Coupon Rules and Redemption Criteria
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                Configure discounts applicable during doorstep service checkout across Salem
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                COUPON CODE
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. SALEM50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                helperText="Must be unique uppercase characters (e.g. FESTIVE50)"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                DISCOUNT TYPE
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
                >
                  <MenuItem value="flat">Flat Rupee Amount (INR)</MenuItem>
                  <MenuItem value="percent">Percentage Discount (%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                {formData.discountType === 'percent' ? 'DISCOUNT PERCENTAGE (%)' : 'DISCOUNT AMOUNT (INR)'}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder={formData.discountType === 'percent' ? '15' : '100'}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                MINIMUM ORDER SUB-TOTAL (INR)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="e.g. 299"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            {formData.discountType === 'percent' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                  MAXIMUM DISCOUNT CAP (INR)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 150"
                  value={formData.maxDiscountCap}
                  onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={formData.discountType === 'percent' ? 6 : 12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                USAGE LIMIT (OPTIONAL)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="Leave blank for unlimited"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                INTERNAL DESCRIPTION & CAMPAIGN PURPOSE
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="e.g. Deepavali festive campaign across Salem Urban areas"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '13.5px' }}>
                    Coupon Active Status
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                    Active coupons can be redeemed by customers in the checkout cart
                  </Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
