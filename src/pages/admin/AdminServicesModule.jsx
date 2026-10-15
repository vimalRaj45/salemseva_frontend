import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import BuildIcon from '@mui/icons-material/Build';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import StarIcon from '@mui/icons-material/Star';
import SalemLottie from '../../components/SalemLottie';
import { API_V1_URL } from '../../config';

const getServiceCategoryIcon = (category) => {
  const c = (category || '').toLowerCase();
  if (c.includes('ac')) return <AcUnitIcon sx={{ fontSize: 18, color: '#0284C7' }} />;
  if (c.includes('electr')) return <ElectricalServicesIcon sx={{ fontSize: 18, color: '#D97706' }} />;
  if (c.includes('plumb')) return <PlumbingIcon sx={{ fontSize: 18, color: '#0EA5E9' }} />;
  if (c.includes('clean')) return <CleaningServicesIcon sx={{ fontSize: 18, color: '#10B981' }} />;
  if (c.includes('paint')) return <FormatPaintIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />;
  if (c.includes('carp')) return <HandymanIcon sx={{ fontSize: 18, color: '#B45309' }} />;
  if (c.includes('ro') || c.includes('water')) return <WaterDropIcon sx={{ fontSize: 18, color: '#06B6D4' }} />;
  return <BuildIcon sx={{ fontSize: 18, color: '#64748B' }} />;
};

export default function AdminServicesModule({ currentRole = 'super_admin', onToast = () => {} }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Quick Fee Edit Dialog State
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [selectedServiceForFee, setSelectedServiceForFee] = useState(null);
  const [newVisitFee, setNewVisitFee] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  // Full Service Create / Edit Dialog State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'ac',
    base_price: '',
    visit_fee: '99.00',
    description: '',
    rating_avg: '4.85'
  });
  const [savingService, setSavingService] = useState(false);

  const canEditPricing = currentRole === 'super_admin' || currentRole === 'finance_officer';

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/services`);
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch (err) {
      console.warn('Failed to fetch services:', err);
      onToast('Failed to load services list from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

const formatServicePrice = (srv) => {
  const p = srv.est_price_range_en || srv.estPriceRangeEn || srv.base_price;
  if (!p) return '₹299 - ₹1,499';
  if (typeof p === 'string' && (p.includes('₹') || p.includes('-') || isNaN(Number(p)))) {
    return p;
  }
  const n = parseFloat(p);
  return isNaN(n) ? 'Quote-based' : `₹${n.toFixed(2)}`;
};

  const handleOpenFeeDialog = (srv) => {
    setSelectedServiceForFee(srv);
    const rawVal = srv.visit_fee ?? srv.visitFee ?? '99.00';
    const parsed = parseFloat(rawVal);
    setNewVisitFee(isNaN(parsed) ? '99.00' : parsed.toFixed(2));
    setFeeDialogOpen(true);
  };

  const handleSaveVisitFee = async () => {
    if (!selectedServiceForFee) return;
    const feeNum = parseFloat(newVisitFee);
    if (isNaN(feeNum) || feeNum < 0) {
      onToast('Please enter a valid positive inspection fee', 'warning');
      return;
    }

    try {
      setSavingFee(true);
      const payload = JSON.stringify({ visitFee: feeNum, visit_fee: feeNum });
      let res;
      try {
        res = await fetch(`${API_V1_URL}/admin/services/${selectedServiceForFee.id}/fee`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      } catch (e) {
        res = await fetch(`${API_V1_URL}/admin/services/${selectedServiceForFee.id}/fee`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      }

      if (!res || !res.ok) {
        res = await fetch(`${API_V1_URL}/admin/services/${selectedServiceForFee.id}/fee`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
      }

      const data = await res.json();
      if (data.success) {
        const formattedFee = feeNum.toFixed(2);
        onToast(`Inspection fee updated to ₹${formattedFee} for ${selectedServiceForFee.name}`, 'success');
        setServices(prev => prev.map(s => (s.id === selectedServiceForFee.id ? {
          ...s,
          visit_fee: formattedFee,
          visitFee: feeNum,
          inspectionFee: feeNum
        } : s)));
        setFeeDialogOpen(false);
      } else {
        onToast(data.error || 'Failed to update inspection fee', 'error');
      }
    } catch (err) {
      onToast(err.message || 'Error updating fee', 'error');
    } finally {
      setSavingFee(false);
    }
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setFormData({
      id: `srv_${Date.now()}`,
      name: '',
      category: 'ac',
      base_price: '299.00',
      visit_fee: '99.00',
      description: '',
      rating_avg: '4.85'
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv) => {
    setEditingService(srv);
    setFormData({
      id: srv.id,
      name: srv.name_en || srv.name || '',
      category: srv.category || 'ac',
      base_price: srv.base_price || (srv.est_price_range_en ? srv.est_price_range_en.split('-')[0].replace(/[^0-9]/g, '') : '299.00'),
      visit_fee: srv.visit_fee || '99.00',
      description: srv.description || '',
      rating_avg: srv.rating_avg || '4.85'
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.base_price) {
      onToast('Service name and base price are required', 'warning');
      return;
    }

    try {
      setSavingService(true);
      const url = editingService
        ? `${API_V1_URL}/admin/services/${editingService.id}`
        : `${API_V1_URL}/admin/services`;
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onToast(editingService ? 'Service updated successfully' : 'Service created successfully', 'success');
        setServiceModalOpen(false);
        fetchServices();
      } else {
        onToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`${API_V1_URL}/admin/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onToast('Service deleted successfully', 'info');
        setServices(prev => prev.filter(s => s.id !== id));
      } else {
        onToast(data.error || 'Failed to delete service', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const filteredServices = services.filter(srv => {
    const q = search.toLowerCase();
    const sName = (srv.name_en || srv.name || srv.id || '').toLowerCase();
    const sCat = (srv.category || '').toLowerCase();
    const matchesSearch = !q || sName.includes(q) || sCat.includes(q);
    const matchesCat = categoryFilter === 'all' || sCat.includes(categoryFilter) || categoryFilter.includes(sCat);
    return matchesSearch && matchesCat;
  });

  return (
    <Box>
      {/* RBAC Notice if role cannot edit */}
      {!canEditPricing && (
        <Alert
          severity="warning"
          icon={<LockIcon sx={{ fontSize: 18 }} />}
          sx={{ mb: 2.5, borderRadius: '12px', fontWeight: 700 }}
        >
          View-Only Mode: You are logged in as {currentRole}. Modifying inspection fees or service pricing requires Super Admin or Finance Officer privileges.
        </Alert>
      )}

      {/* Header & Controls Card */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SalemLottie name="tool" width={36} height={36} style={{ margin: 0, flexShrink: 0 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                Services Catalog & Inspection Fees Management
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
              Set exact doorstep inspection fee (visit_fee) and base booking charge for each trade. Reflected live on customer checkout.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Catalog">
              <IconButton
                onClick={fetchServices}
                disabled={loading}
                sx={{ border: '1px solid #CBD5E1', borderRadius: '8px' }}
              >
                <RefreshIcon sx={{ fontSize: 18, color: '#0284C7' }} />
              </IconButton>
            </Tooltip>
            {canEditPricing && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenCreateService}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                Add New Service
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search service by name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '10px', bgcolor: '#F8FAFC', fontSize: '13px' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              {/* ds-allow-native-select */}
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#F8FAFC', fontSize: '13px', fontWeight: 700 }}
              >
                <MenuItem value="all">All Service Categories</MenuItem>
                <MenuItem value="ac">AC Repair & Service</MenuItem>
                <MenuItem value="electrical">Electrician & Wiring</MenuItem>
                <MenuItem value="plumbing">Plumbing & Sanitary</MenuItem>
                <MenuItem value="cleaning">Home Cleaning</MenuItem>
                <MenuItem value="painting">Painting & Polish</MenuItem>
                <MenuItem value="carpentry">Carpentry & Woodwork</MenuItem>
                <MenuItem value="appliances">Appliance Repair</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Services Table */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}
      >
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={24} sx={{ color: '#0284C7' }} />
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              Loading services from PostgreSQL...
            </Typography>
          </Box>
        ) : filteredServices.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              No services found matching your filter criteria.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
              Swipe left/right to view full table details
            </Typography>
            <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '12px', py: 1.5 } }}>
                <TableCell>Service</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Base Quote / Price</TableCell>
                <TableCell>Doorstep Inspection Fee</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.map((srv) => (
                <TableRow
                  key={srv.id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': { borderColor: '#E2E8F0', py: 1.3 }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '8px',
                          bgcolor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getServiceCategoryIcon(srv.category)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                          {srv.name_en || srv.name || srv.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                          ID: {srv.id} {srv.name_ta ? `• ${srv.name_ta}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={(srv.category || 'general').toUpperCase()}
                      size="small"
                      sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '10px', height: 20 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {formatServicePrice(srv)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<LocalAtmIcon sx={{ fontSize: '13px !important', color: '#0284C7 !important' }} />}
                        label={`₹${parseFloat(srv.visit_fee || 99).toFixed(2)}`}
                        size="small"
                        sx={{
                          bgcolor: '#E0F2FE',
                          color: '#0369A1',
                          fontWeight: 900,
                          fontSize: '11px',
                          height: 22
                        }}
                      />
                      {canEditPricing && (
                        <Tooltip title="Quick Change Inspection Fee">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenFeeDialog(srv)}
                            sx={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              textTransform: 'none',
                              py: 0.2,
                              px: 0.8,
                              minWidth: 'auto',
                              borderRadius: '6px',
                              borderColor: '#CBD5E1',
                              color: '#0284C7'
                            }}
                          >
                            Edit Fee
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {srv.rating_avg || '4.85'}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#166534 !important' }} />}
                      label="ACTIVE"
                      size="small"
                      sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '9.5px', height: 20 }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {canEditPricing ? (
                        <>
                          <Tooltip title="Edit Full Service Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditService(srv)}
                              sx={{ color: '#0284C7', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                            >
                              <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Service">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteService(srv.id, srv.name)}
                              sx={{ color: '#DC2626', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: '11px !important' }} />}
                          label="Locked"
                          size="small"
                          sx={{ height: 20, fontSize: '9.5px', color: '#94A3B8' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      </Card>

      {/* Quick Edit Visit/Inspection Fee Dialog */}
      <Dialog
        open={feeDialogOpen}
        onClose={() => !savingFee && setFeeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', pb: 0.5 }}>
          Update Inspection Fee (Visit Fee)
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
            This fee is charged to customer for doorstep diagnostic visit for {selectedServiceForFee?.name}.
          </Typography>

          <TextField
            fullWidth
            label="Doorstep Inspection Fee (₹)"
            type="number"
            value={newVisitFee}
            onChange={(e) => setNewVisitFee(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              sx: { borderRadius: '10px', fontWeight: 800, fontSize: '15px' }
            }}
            sx={{ mb: 2 }}
          />

          {/* Quick preset chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, width: '100%' }}>
              Quick presets:
            </Typography>
            {['49.00', '79.00', '99.00', '149.00', '199.00'].map(preset => (
              <Chip
                key={preset}
                label={`₹${preset}`}
                clickable
                onClick={() => setNewVisitFee(preset)}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '11px',
                  bgcolor: newVisitFee === preset ? '#0284C7' : '#F1F5F9',
                  color: newVisitFee === preset ? '#FFFFFF' : '#475569'
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setFeeDialogOpen(false)}
            disabled={savingFee}
            sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveVisitFee}
            disabled={savingFee}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '8px',
              textTransform: 'none',
              px: 2.5,
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            {savingFee ? 'Saving...' : 'Save Inspection Fee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Create / Edit Service Modal */}
      <Dialog
        open={serviceModalOpen}
        onClose={() => !savingService && setServiceModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', pb: 0.5 }}>
          {editingService ? `Edit Service: ${editingService.name}` : 'Create New Service'}
        </DialogTitle>
        <form onSubmit={handleSaveService}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Service Name"
                  placeholder="e.g., Water Purifier Full Service"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  InputProps={{ sx: { borderRadius: '10px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  {/* ds-allow-native-select */}
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="ac">AC Repair</MenuItem>
                    <MenuItem value="electrical">Electrician</MenuItem>
                    <MenuItem value="plumbing">Plumbing</MenuItem>
                    <MenuItem value="cleaning">Home Cleaning</MenuItem>
                    <MenuItem value="painting">Painting</MenuItem>
                    <MenuItem value="carpentry">Carpentry</MenuItem>
                    <MenuItem value="appliances">Appliances</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Price (₹)"
                  type="number"
                  placeholder="299.00"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    sx: { borderRadius: '10px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Inspection Visit Fee (₹)"
                  type="number"
                  placeholder="99.00"
                  value={formData.visit_fee}
                  onChange={(e) => setFormData({ ...formData, visit_fee: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    sx: { borderRadius: '10px' }
                  }}
                  helperText="Doorstep assessment charge"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Rating"
                  value={formData.rating_avg}
                  onChange={(e) => setFormData({ ...formData, rating_avg: e.target.value })}
                  InputProps={{ sx: { borderRadius: '10px' } }}
                  helperText="Default rating score (e.g. 4.85)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description / Scope of Work"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  InputProps={{ sx: { borderRadius: '10px' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setServiceModalOpen(false)}
              disabled={savingService}
              sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingService}
              sx={{
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: '8px',
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              {savingService ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
