import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
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
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StarIcon from '@mui/icons-material/Star';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import RoomIcon from '@mui/icons-material/Room';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import { API_V1_URL } from '../../config';

export default function AdminTechnicianDossierDrawer({
  open,
  onClose,
  tech,
  jobsHistory = [],
  financials = { lifetimeEarnings: 0, grossJobVolume: 0 },
  loading = false,
  onOpenBookingTrace = () => {},
  onKycDecision = () => {},
  onToggleBlock = () => {},
  onOpenAadhaarViewer = () => {},
  onAttachAadhaarSuccess = () => {},
  getStatusChip = (st) => st
}) {
  const navigate = useNavigate();
  if (!tech && !open) return null;

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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 580, md: 680 },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Sticky Drawer Header */}
      <Box sx={{
        p: 2.2,
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar sx={{ bgcolor: '#0284C7', color: '#FFFFFF', width: 42, height: 42, fontWeight: 800 }}>
            <EngineeringIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '15px', lineHeight: 1.2 }}>
              {tech?.full_name || 'Technician Dossier'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <span>ID: #{tech?.id}</span>
              <span>•</span>
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>{getTradeLabel(tech?.primary_trade)}</span>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {tech?.id && (
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
              onClick={() => {
                onClose();
                navigate(`/admin/technicians/${tech.id}`);
              }}
              sx={{
                borderColor: '#475569',
                color: '#E2E8F0',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                py: 0.5,
                '&:hover': { bgcolor: '#1E293B', borderColor: '#94A3B8' }
              }}
            >
              Full Page
            </Button>
          )}

          <IconButton onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: '#334155' } }} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable Content Body */}
      <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
        {tech && (
          <>
            {/* Top Stat Ribbon */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', mb: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', mb: 0.4 }}>
                    Contact & Locality
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <PhoneIcon sx={{ fontSize: 14, color: '#0284C7' }} />
                    {tech.phone}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.3 }}>
                    <RoomIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                    {tech.service_area || tech.locality || 'Fairlands, Salem'}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', mb: 0.4 }}>
                    Performance Rating
                  </Typography>
                  {Number(tech.jobs_completed_count) > 0 && Number(tech.rating_avg) > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>{tech.rating_avg}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748B' }}>New Partner</Typography>
                  )}
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{Number(tech.jobs_completed_count) || 0} Jobs Serviced</Typography>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', mb: 0.4 }}>
                    Lifetime Payouts
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>
                    ₹{(Number(financials?.lifetimeEarnings) || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    UPI: {tech.upi_vpa || 'Not Configured'}
                  </Typography>
                </Grid>

                {/* Aadhaar KYC Uploaded Document View & Decision */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.8 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, p: 1.4, bgcolor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: tech.is_kyc_verified ? '#DCFCE7' : '#FEF3C7', color: tech.is_kyc_verified ? '#166534' : '#B45309', width: 34, height: 34 }}>
                        <FingerprintIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block' }}>
                          AADHAAR IDENTITY & e-KYC VERIFICATION
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          Aadhaar: {tech.aadhaar_number ? `XXXX-XXXX-${tech.aadhaar_number.slice(-4)}` : 'Not Provided'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {(tech.aadhaar_card_url || tech.aadhaarCardUrl) ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={resolveMediaUrl(tech.aadhaar_card_url || tech.aadhaarCardUrl)}
                            alt="Uploaded Aadhaar Document"
                            onClick={() => onOpenAadhaarViewer(tech)}
                            sx={{
                              width: 58,
                              height: 38,
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #0284C7',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
                              '&:hover': { transform: 'scale(1.08)' },
                              transition: 'all 0.2s'
                            }}
                            title="Click to zoom Aadhaar document"
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                            onClick={() => onOpenAadhaarViewer(tech)}
                            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '11px', borderRadius: '8px', color: '#0284C7', borderColor: '#BAE6FD', bgcolor: '#F0F9FF' }}
                          >
                            Preview Card
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="No Document Uploaded" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '10px' }} />
                          <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadIcon sx={{ fontSize: 13 }} />}
                            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '11px', borderRadius: '8px', color: '#0284C7', borderColor: '#BAE6FD', bgcolor: '#F0F9FF' }}
                          >
                            Attach Photo
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    const base64Data = reader.result;
                                    const res = await fetch(`${API_V1_URL}/storage/upload-aadhaar`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        fileData: base64Data,
                                        mimeType: file.type || 'image/jpeg',
                                        phone: tech.phone,
                                        fileName: file.name
                                      })
                                    });
                                    const data = await res.json();
                                    if (data.success && data.url) {
                                      onAttachAadhaarSuccess(data.url);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } catch (err) {
                                  console.error('Failed to upload Aadhaar:', err);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      )}

                      {!tech.is_kyc_verified ? (
                        <Box sx={{ display: 'flex', gap: 0.8 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => onKycDecision(tech.id, 'approve')}
                            sx={{ bgcolor: '#16A34A', color: '#FFF', fontWeight: 800, fontSize: '11px', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#15803D' } }}
                          >
                            Approve KYC
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onKycDecision(tech.id, 'reject')}
                            sx={{ color: '#DC2626', borderColor: '#FCA5A5', fontWeight: 700, fontSize: '11px', textTransform: 'none', borderRadius: '8px' }}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        <Chip
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important', color: '#166534 !important' }} />}
                          label="KYC Verified Partner"
                          size="small"
                          sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '10.5px' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Complete Service History Table */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '14px' }}>
                Service History & Job Records ({jobsHistory.length})
              </Typography>
              <Chip label="Salem Duty Log" size="small" sx={{ bgcolor: '#EFF6FF', color: '#0284C7', fontWeight: 800, fontSize: '10px' }} />
            </Box>

            {loading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0284C7' }} />
              </Box>
            ) : jobsHistory.length === 0 ? (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>No service history recorded for this technician yet.</Typography>
              </Paper>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Table size="small" sx={{ minWidth: 540 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '11.5px' } }}>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Customer & Locality</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Stage</TableCell>
                      <TableCell align="right">Tech Payout</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobsHistory.map(job => (
                      <TableRow key={job.id} hover>
                        <TableCell 
                          sx={{ fontWeight: 800, color: '#0284C7', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => {
                            onClose();
                            onOpenBookingTrace(job);
                          }}
                          title="Click to deep trace booking"
                        >
                          #{job.id}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12px' }}>{job.customer_name}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>{job.locality}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{job.service_id?.toUpperCase()}</TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '11.5px' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">{getStatusChip(job.status)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: '#059669', fontSize: '12.5px' }}>
                          ₹{job.tech_payout_amount || (parseFloat(job.final_amount || 0) * 0.98).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Sticky Bottom Actions Bar */}
      <Box sx={{
        p: 2,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        {tech && (
          <Box>
            {tech.is_blocked ? (
              <Button
                variant="contained"
                color="success"
                onClick={() => onToggleBlock(tech, false)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px', py: 0.8 }}
              >
                Restore Partner
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onToggleBlock(tech, true)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '12px', py: 0.8 }}
              >
                Suspend Partner
              </Button>
            )}
          </Box>
        )}

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '8px',
            fontSize: '12px',
            py: 0.8,
            px: 2.5,
            '&:hover': { bgcolor: '#1E293B' }
          }}
        >
          Close Drawer
        </Button>
      </Box>
    </Drawer>
  );
}
