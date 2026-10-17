import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Paper,
  Divider,
  Grid,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ShieldIcon from '@mui/icons-material/Shield';
import PrintIcon from '@mui/icons-material/Print';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import { API_V1_URL } from '../../config';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';

export default function AdminTechnicianDossierPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tech, setTech] = useState(null);
  const [jobsHistory, setJobsHistory] = useState([]);
  const [financials, setFinancials] = useState({ lifetimeEarnings: 0, grossJobVolume: 0 });
  const [loading, setLoading] = useState(true);
  const [aadhaarModalOpen, setAadhaarModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${id}/dossier`);
      const data = await res.json();
      if (data.success) {
        setTech(data.technician);
        setJobsHistory(data.jobs || []);
        setFinancials(data.financials || { lifetimeEarnings: 0, grossJobVolume: 0 });
      }
    } catch (err) {
      console.error('Failed to load technician dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDossier();
    }
  }, [id]);

  const handleKycDecision = async (decision) => {
    if (!tech) return;
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${tech.id}/verify-kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        setTech(prev => ({
          ...prev,
          is_kyc_verified: decision === 'approve',
          status: decision === 'approve' ? 'Active' : 'Pending Verification'
        }));
        setActionNotice(`KYC successfully ${decision === 'approve' ? 'approved' : 'rejected'}.`);
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error('KYC update error:', err);
    }
  };

  const handleToggleBlock = async (shouldBlock) => {
    if (!tech) return;
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${tech.id}/toggle-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: shouldBlock })
      });
      const data = await res.json();
      if (data.success) {
        setTech(prev => ({ ...prev, is_blocked: shouldBlock }));
        setActionNotice(`Technician partner ${shouldBlock ? 'suspended' : 'restored'}.`);
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error('Block toggle error:', err);
    }
  };

  const getTradeLabel = (trade) => {
    switch ((trade || '').toLowerCase()) {
      case 'ac': return 'Air Conditioner (AC)';
      case 'electrical': return 'Electrical & Wiring';
      case 'plumbing': return 'Plumbing & Drainage';
      case 'cleaning': return 'Deep Cleaning';
      case 'appliances': return 'Home Appliances';
      default: return trade || 'All Trades';
    }
  };

  const getStatusChip = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'completed') return <Chip label="Completed" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px' }} />;
    if (s === 'en_route' || s === 'arrived' || s === 'inspecting') return <Chip label="In Progress" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '10.5px' }} />;
    if (s === 'cancelled') return <Chip label="Cancelled" size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '10.5px' }} />;
    return <Chip label={st || 'Created'} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '10.5px' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={36} sx={{ color: '#0284C7' }} />
      </Box>
    );
  }

  if (!tech) {
    return (
      <Box sx={{ minHeight: '80vh', p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>Technician Record Not Found</Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>No partner record matching ID #{id} exists in Salem database.</Typography>
        <Button variant="contained" onClick={() => navigate('/admin')} sx={{ bgcolor: '#0284C7', textTransform: 'none', fontWeight: 700 }}>
          Return to Admin Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Top Breadcrumb & Action Banner */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pt: 3, pb: 4, px: 3, borderBottom: '1px solid #334155' }}>
        <Container maxWidth="xl" sx={{ p: 0 }}>
          <Breadcrumbs sx={{ mb: 1.5, color: '#94A3B8', fontSize: '12.5px' }}>
            <Link onClick={() => navigate('/admin')} sx={{ color: '#94A3B8', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
              Admin Ops Desk
            </Link>
            <Link onClick={() => navigate('/admin')} sx={{ color: '#94A3B8', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}>
              Technicians
            </Link>
            <Typography sx={{ color: '#38BDF8', fontWeight: 700, fontSize: '12.5px' }}>
              {tech.full_name} (#{tech.id})
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/admin')}
                sx={{ borderColor: '#475569', color: '#E2E8F0', fontWeight: 700, fontSize: '12px', textTransform: 'none', borderRadius: '8px', py: 0.6 }}
              >
                Back to Desk
              </Button>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tech.full_name}
                  {tech.is_kyc_verified && (
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: '14px !important', color: '#166534 !important' }} />}
                      label="e-KYC Verified"
                      size="small"
                      sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '11px', height: 22 }}
                    />
                  )}
                  {tech.is_blocked && (
                    <Chip label="Suspended" size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '11px', height: 22 }} />
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12px' }}>
                  Primary Trade: <strong style={{ color: '#38BDF8' }}>{getTradeLabel(tech.primary_trade)}</strong> • Phone: <strong>{tech.phone}</strong> • Locality: <strong>{tech.service_area || tech.locality || 'Fairlands, Salem'}</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.print()}
                sx={{ borderColor: '#475569', color: '#E2E8F0', fontWeight: 700, fontSize: '12px', textTransform: 'none', borderRadius: '8px' }}
              >
                Print Dossier
              </Button>
              {tech.is_blocked ? (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => handleToggleBlock(false)}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px' }}
                >
                  Restore Partner
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleToggleBlock(true)}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px' }}
                >
                  Suspend Partner
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Page Content Body */}
      <Container maxWidth="xl" sx={{ mt: 3, px: { xs: 2, sm: 3 } }}>
        {actionNotice && (
          <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, bgcolor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', color: '#166534', fontWeight: 700, fontSize: '13px' }}>
            {actionNotice}
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Left Column (380px): Identity, Verification & Profile */}
          <Grid item xs={12} lg={4}>
            {/* Identity & KYC Card */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 3, boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '11px' }}>
                  Government Identity & e-KYC
                </Typography>
                <Chip
                  label={tech.is_kyc_verified ? 'Verified' : 'Pending'}
                  size="small"
                  sx={{
                    bgcolor: tech.is_kyc_verified ? '#DCFCE7' : '#FEF3C7',
                    color: tech.is_kyc_verified ? '#166534' : '#B45309',
                    fontWeight: 800,
                    fontSize: '10.5px'
                  }}
                />
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.4 }}>
                  AADHAAR NUMBER
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', letterSpacing: 1 }}>
                  {tech.aadhaar_number ? `XXXX-XXXX-${tech.aadhaar_number.slice(-4)}` : 'Not Provided'}
                </Typography>
              </Box>

              {/* Aadhaar Photo Preview */}
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.8 }}>
                UPLOADED AADHAAR CARD DOCUMENT
              </Typography>

              {(tech.aadhaar_card_url || tech.aadhaarCardUrl) ? (
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={resolveMediaUrl(tech.aadhaar_card_url || tech.aadhaarCardUrl)}
                    alt="Aadhaar Document"
                    onClick={() => setAadhaarModalOpen(true)}
                    sx={{
                      width: '100%',
                      maxHeight: 220,
                      objectFit: 'contain',
                      bgcolor: '#0F172A',
                      borderRadius: '10px',
                      border: '1.5px solid #0284C7',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                    title="Click to view full screen document"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setAadhaarModalOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 800, fontSize: '11px', borderRadius: '8px', color: '#0284C7', borderColor: '#BAE6FD' }}
                    >
                      Enlarge Document
                    </Button>
                    <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic' }}>Verified image</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1', mb: 2 }}>
                  <FingerprintIcon sx={{ fontSize: 32, color: '#94A3B8', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>No Aadhaar scan uploaded by technician.</Typography>
                </Box>
              )}

              {/* KYC Decisions */}
              {!tech.is_kyc_verified ? (
                <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleKycDecision('approve')}
                    sx={{ bgcolor: '#16A34A', textTransform: 'none', fontWeight: 800, borderRadius: '8px', py: 1, fontSize: '12.5px', '&:hover': { bgcolor: '#15803D' } }}
                  >
                    Approve KYC
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleKycDecision('reject')}
                    sx={{ color: '#DC2626', borderColor: '#FCA5A5', textTransform: 'none', fontWeight: 800, borderRadius: '8px', py: 1, fontSize: '12.5px' }}
                  >
                    Reject KYC
                  </Button>
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleKycDecision('reject')}
                  sx={{ color: '#DC2626', borderColor: '#FECACA', textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: '11.5px', py: 0.8 }}
                >
                  Revoke KYC Verification
                </Button>
              )}
            </Paper>

            {/* Financial Details Card */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 3, boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AccountBalanceWalletIcon sx={{ color: '#059669', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '11px' }}>
                  Settlement & UPI Banking
                </Typography>
              </Box>

              <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700, display: 'block', mb: 0.2 }}>
                  UPI VPA ADDRESS (Instant IMPS Payouts)
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#065F46', fontFamily: 'monospace' }}>
                  {tech.upi_vpa || tech.upiId || 'Not Configured'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Lifetime Gross Volume:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>₹{(financials.grossJobVolume || 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Lifetime Tech Payouts:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: '#059669' }}>₹{(financials.lifetimeEarnings || 0).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Platform Revenue (2-5%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284C7' }}>
                  ₹{(Math.max(0, (financials.grossJobVolume || 0) - (financials.lifetimeEarnings || 0))).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column (Flexible): Complete History Ledger */}
          <Grid item xs={12} lg={8}>
            {/* Stat Row */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>Completed Jobs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.5 }}>{jobsHistory.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>Rating Average</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#F59E0B', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 22 }} />
                    {tech.rating_avg || '5.0'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>Dispute Rate</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#16A34A', mt: 0.5 }}>0.0%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>Police Verification</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#16A34A', mt: 0.5 }}>Clear</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Service History Table */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '16px' }}>
                    Complete Service History & Customer Job Records
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Showing all historical bookings dispatched and serviced across Salem city zones
                  </Typography>
                </Box>
                <Chip label={`${jobsHistory.length} Total Records`} size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800 }} />
              </Box>

              {jobsHistory.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>No bookings recorded for this technician yet.</Typography>
                </Box>
              ) : (
                <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '12px' } }}>
                        <TableCell>Booking ID</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Locality</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Technician Payout</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobsHistory.map(job => (
                        <TableRow key={job.id} hover>
                          <TableCell sx={{ fontWeight: 800, color: '#0284C7' }}>#{job.id}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{job.customer_name || 'Customer'}</TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>{job.locality || 'Salem Central'}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{job.service_id?.toUpperCase()}</TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '12px' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900, color: '#059669' }}>
                            ₹{job.tech_payout_amount || (parseFloat(job.final_amount || 0) * 0.98).toFixed(0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Aadhaar Full-Screen Zoom Modal */}
      <Modal open={aadhaarModalOpen} onClose={() => setAadhaarModalOpen(false)} maxWidth="md">
        <ModalHeader
          title="Aadhaar Document Inspection"
          subtitle={`Technician: ${tech.full_name} • ID: #${tech.id}`}
          onClose={() => setAadhaarModalOpen(false)}
        />
        <ModalBody sx={{ p: 2, textAlign: 'center', bgcolor: '#0F172A' }}>
          {(tech.aadhaar_card_url || tech.aadhaarCardUrl) ? (
            <Box
              component="img"
              src={resolveMediaUrl(tech.aadhaar_card_url || tech.aadhaarCardUrl)}
              alt="High-Res Aadhaar Scan"
              sx={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: '#CBD5E1' }}>No document available</Typography>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="contained" onClick={() => setAadhaarModalOpen(false)} sx={{ bgcolor: '#0284C7', textTransform: 'none', fontWeight: 700 }}>
            Done Inspecting
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
}
