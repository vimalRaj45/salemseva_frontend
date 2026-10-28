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
  Grid
} from '@mui/material';
import {
  ArrowLeft,
  Users,
  Save,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Phone
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import toast from 'react-hot-toast';

export default function AdminStaffEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = Boolean(id && id !== 'new');
  const existingMember = location.state?.member || null;

  const [formData, setFormData] = useState({
    id: existingMember?.id || (isEditMode ? id : ''),
    name: existingMember?.name || '',
    email: existingMember?.email || '',
    phone: existingMember?.phone || '',
    role: existingMember?.role || 'ops_dispatcher',
    hub_locality: existingMember?.hub_locality || 'Hasthampatti Hub, Salem',
    status: existingMember?.status || 'active'
  });

  const [loading, setLoading] = useState(isEditMode && !existingMember);
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
    if (isEditMode && !existingMember) {
      setLoading(true);
      fetch(`${API_V1_URL}/admin/team`)
        .then((r) => r.json())
        .then((d) => {
          if (!isMounted) return;
          if (d.success && Array.isArray(d.team)) {
            const found = d.team.find((m) => String(m.id) === String(id));
            if (found) {
              setFormData({
                id: found.id,
                name: found.name || '',
                email: found.email || '',
                phone: found.phone || '',
                role: found.role || 'ops_dispatcher',
                hub_locality: found.hub_locality || 'Hasthampatti Hub, Salem',
                status: found.status || 'active'
              });
            } else {
              toast.error('Staff member not found');
            }
          }
        })
        .catch(() => toast.error('Failed to load team member'))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, existingMember]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and official email are required');
      return;
    }

    setSaving(true);
    try {
      const url = isEditMode
        ? `${API_V1_URL}/admin/team/${formData.id}`
        : `${API_V1_URL}/admin/team`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditMode ? 'Team member updated' : 'Team member added');
        handleDismiss();
      } else {
        toast.error(data.error || 'Failed to save staff member');
      }
    } catch (err) {
      toast.error(err.message || 'Network error saving staff');
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
                {isEditMode ? `Edit Staff: ${formData.name}` : 'Add Operations Staff Member'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                Salem Seva Operations Control & Team Privileges
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
            {saving ? 'Saving...' : 'Save Staff Member'}
          </Button>
        </Container>
      </Box>

      {/* Form Content */}
      <Container maxWidth="md" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ p: 1, bgcolor: '#EFF6FF', borderRadius: '10px', color: '#0A66C2' }}>
              <Users size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>
                Staff Profile and Hub Allocation
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '12px' }}>
                Assign roles, contact details, and operating hub across Salem Corporation wards
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                FULL NAME
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Anand M."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                OFFICIAL EMAIL
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="e.g. anand@shazuone.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                PHONE NUMBER
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="+91 98421 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                OPERATIONAL ROLE
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
                >
                  <MenuItem value="super_admin">Super Admin (Root Operations)</MenuItem>
                  <MenuItem value="ops_dispatcher">Ops Dispatcher</MenuItem>
                  <MenuItem value="support_quality">Support & Quality Desk</MenuItem>
                  <MenuItem value="finance_officer">Finance & Escrow Officer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                SALEM HUB LOCALITY
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Hasthampatti Hub, Salem"
                value={formData.hub_locality}
                onChange={(e) => setFormData({ ...formData, hub_locality: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8, fontSize: '12.5px' }}>
                ACCOUNT STATUS
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
                >
                  <MenuItem value="active">Active & Authorized</MenuItem>
                  <MenuItem value="suspended">Suspended / Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
