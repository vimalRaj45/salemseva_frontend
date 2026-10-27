import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Container,
  Avatar,
  Divider
} from '@mui/material';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { API_V1_URL } from '../../config';
import { resolveMediaUrl } from '../../utils/mediaUtils';
import toast from 'react-hot-toast';

export default function DocumentViewerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedData = location.state?.document || {};
  const docUrl = passedData.url || searchParams.get('url') || '';
  const docTitle = passedData.title || searchParams.get('title') || 'Document Inspection Vault';
  const docType = passedData.type || searchParams.get('type') || 'document';
  const techData = passedData.data || null;

  const [zoom, setZoom] = useState(1);
  const [processingKyc, setProcessingKyc] = useState(false);

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleKycDecision = async (decision) => {
    if (!techData?.id) return;
    setProcessingKyc(true);
    try {
      const res = await fetch(`${API_V1_URL}/admin/technicians/${techData.id}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision === 'approve' ? 'verified' : 'rejected',
          reason: decision === 'approve' ? 'Aadhaar identity verified by operations administrator' : 'Document illegible or mismatched in verification vault'
        })
      });
      const d = await res.json();
      if (d.success) {
        toast.success(decision === 'approve' ? 'Partner Aadhaar KYC approved' : 'Partner KYC rejected');
        handleDismiss();
      } else {
        toast.error(d.error || 'Failed to update KYC status');
      }
    } catch (e) {
      toast.error('Network error updating KYC status');
    } finally {
      setProcessingKyc(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0B0F19', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <Box sx={{ bgcolor: '#0F172A', px: { xs: 2, sm: 3 }, py: 1.5, borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={handleDismiss} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: '#1E293B' } }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
              {docTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
              Verified High-Resolution Secure Document Inspection Vault
            </Typography>
          </Box>
        </Box>

        {/* Zoom & Tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            title="Zoom Out"
            sx={{ bgcolor: '#1E293B', color: '#CBD5E1', border: '1px solid #334155' }}
          >
            <ZoomOut size={16} />
          </IconButton>
          <Chip
            label={`${Math.round(zoom * 100)}%`}
            size="small"
            sx={{ bgcolor: '#1E293B', color: '#38BDF8', fontWeight: 800, fontSize: '11px', border: '1px solid #334155' }}
          />
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.min(3.5, z + 0.25))}
            title="Zoom In"
            sx={{ bgcolor: '#1E293B', color: '#CBD5E1', border: '1px solid #334155' }}
          >
            <ZoomIn size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            sx={{ bgcolor: '#1E293B', color: '#CBD5E1', border: '1px solid #334155' }}
          >
            <RotateCcw size={16} />
          </IconButton>
          {docUrl && (
            <IconButton
              size="small"
              onClick={() => window.open(resolveMediaUrl(docUrl), '_blank')}
              title="Open Original in New Tab"
              sx={{ bgcolor: '#0284C7', color: '#FFFFFF', border: '1px solid #0284C7', '&:hover': { bgcolor: '#0369A1' } }}
            >
              <ExternalLink size={16} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Main Document Canvas Viewport */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', p: 3, bgcolor: '#0B0F19' }}>
        {docUrl ? (
          <Box
            component="img"
            src={resolveMediaUrl(docUrl)}
            alt={docTitle}
            sx={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              maxWidth: '90%',
              maxHeight: '75vh',
              objectFit: 'contain',
              borderRadius: '12px',
              border: '1px solid #1E293B',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          />
        ) : (
          <Box sx={{ textAlign: 'center', p: 5 }}>
            <FileText size={48} color="#475569" style={{ marginBottom: 12 }} />
            <Typography variant="body1" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              No document URL provided for preview
            </Typography>
          </Box>
        )}
      </Box>

      {/* KYC Decision Bar (When viewing Aadhaar card of technician) */}
      {docType === 'aadhaar' && techData && (
        <Box sx={{ bgcolor: '#0F172A', p: 2, borderTop: '1px solid #1E293B', zIndex: 10 }}>
          <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: techData.is_kyc_verified ? '#DCFCE7' : '#FEF3C7', color: techData.is_kyc_verified ? '#166534' : '#92400E', width: 40, height: 40, fontWeight: 800 }}>
                {(techData.full_name || techData.name || 'T')[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '14px' }}>
                  {techData.full_name || techData.name} ({techData.phone})
                </Typography>
                <Typography variant="caption" sx={{ color: techData.is_kyc_verified ? '#4ADE80' : '#FBBF24', fontSize: '12px', fontWeight: 600 }}>
                  {techData.is_kyc_verified ? 'Verified Active Partner' : 'Aadhaar Verification Pending Review'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                disabled={processingKyc}
                startIcon={<XCircle size={16} />}
                onClick={() => handleKycDecision('reject')}
                sx={{
                  borderColor: '#DC2626',
                  color: '#EF4444',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }
                }}
              >
                Reject Identity
              </Button>
              <Button
                variant="contained"
                disabled={processingKyc}
                startIcon={<CheckCircle2 size={16} />}
                onClick={() => handleKycDecision('approve')}
                sx={{
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                  '&:hover': { bgcolor: '#15803D' }
                }}
              >
                Approve Partner KYC
              </Button>
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
}
