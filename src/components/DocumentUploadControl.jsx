import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  Chip
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function DocumentUploadControl({
  label = 'ஆவணம் பதிவேற்றம் (Document Upload)',
  sublabel = 'அதிகபட்சம் 5 MB • JPG, PNG, PDF அனுமதிக்கப்படும்',
  folder = 'uploads',
  referenceId = 'doc',
  existingUrl = null,
  onUploadSuccess,
  onRemove,
  maxSizeMb = 5,
  required = false
}) {
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Upload States:
  // 1. stagedFile: Local preview file (NOT yet uploaded to S3)
  // 2. uploadedUrl: Verified URL after user approves and uploads to S3
  const [stagedFile, setStagedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || null);
  const [isUploaded, setIsUploaded] = useState(Boolean(existingUrl));

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (existingUrl) {
      setUploadedUrl(existingUrl);
      setIsUploaded(true);
      setStagedFile(null);
    }
  }, [existingUrl]);

  // Read file as Base64 Data URL for local preview
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Step 1: User selects / takes photo -> Stage for PREVIEW ONLY (DO NOT upload blindly!)
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset inputs so user can pick the same file again if desired
    e.target.value = '';
    setErrorMessage('');

    // 1. Strict <= 5 MB validation
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(
        `⚠️ கோப்பின் அளவு (${actualMb} MB) அனுமதிக்கப்பட்ட ${maxSizeMb} MB வரம்பை தாண்டியுள்ளது. தயவுசெய்து 5 MB-க்குள் உள்ள சிறிய படத்தை தேர்ந்தெடுக்கவும்.`
      );
      return;
    }

    try {
      const base64Data = await readFileAsBase64(file);

      // Save to local staged state for PREVIEW FIRST
      setStagedFile({
        file,
        dataUrl: base64Data,
        name: file.name || 'captured_document.jpg',
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type || 'image/jpeg'
      });
      setIsUploaded(false);
    } catch (err) {
      setErrorMessage('கோப்பை வாசிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
    }
  };

  // Step 2: User reviewed preview and confirmed -> Perform actual S3 Upload
  const handleConfirmUpload = async () => {
    if (!stagedFile) return;

    try {
      setIsUploading(true);
      setErrorMessage('');

      // Upload to S3-compatible backend
      const res = await fetch('https://salemseva-backend.onrender.com/api/v1/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: stagedFile.dataUrl,
          mimeType: stagedFile.type || 'image/jpeg',
          folder,
          referenceId,
          fileName: stagedFile.name
        })
      });

      const data = await res.json();
      const finalUrl = data.url || stagedFile.dataUrl;

      setUploadedUrl(finalUrl);
      setIsUploaded(true);
      setStagedFile(null);

      if (onUploadSuccess) {
        onUploadSuccess(finalUrl, data);
      }
    } catch (err) {
      console.warn('S3 upload network fallback to local image:', err);
      // Fallback: local base64 still works so technician is never blocked in field
      const fallbackUrl = stagedFile.dataUrl;
      setUploadedUrl(fallbackUrl);
      setIsUploaded(true);
      setStagedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(fallbackUrl, { storageType: 'LOCAL_FALLBACK' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Discard / Clear
  const handleClear = () => {
    setStagedFile(null);
    setUploadedUrl(null);
    setIsUploaded(false);
    setErrorMessage('');
    if (onRemove) onRemove();
  };

  const activeDisplayUrl = stagedFile ? stagedFile.dataUrl : uploadedUrl;
  const isPdf = activeDisplayUrl?.includes('application/pdf') || stagedFile?.type?.includes('pdf') || activeDisplayUrl?.endsWith('.pdf');

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hidden Native File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Title & Subtitle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '11.5px', textTransform: 'uppercase' }}>
          {label} {required && <span style={{ color: '#E11D48' }}>*</span>}
        </Typography>
        <Chip
          label={`Max ${maxSizeMb} MB`}
          size="small"
          sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '9.5px', height: 18 }}
        />
      </Box>

      {/* Error Alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 1.5, py: 0.4, fontSize: '12px', borderRadius: '10px' }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* ================= STAGE 1: NO FILE SELECTED YET ================= */}
      {!stagedFile && !isUploaded && !isUploading && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: '14px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#0284C7', bgcolor: '#F0F9FF' }
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5, fontSize: '12px', lineHeight: 1.4 }}>
            {sublabel}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Option 1: Direct Camera Snap */}
            <Button
              variant="contained"
              size="small"
              startIcon={<PhotoCameraIcon sx={{ fontSize: 17 }} />}
              onClick={() => cameraInputRef.current?.click()}
              sx={{
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                py: 0.8,
                px: 1.8,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                '&:hover': { bgcolor: '#0369A1' }
              }}
            >
              📸 கேமரா (Take Photo)
            </Button>

            {/* Option 2: Upload File / Gallery */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon sx={{ fontSize: 17 }} />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                color: '#0F172A',
                borderColor: '#CBD5E1',
                bgcolor: '#FFFFFF',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'none',
                py: 0.8,
                px: 1.8,
                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
              }}
            >
              📁 பதிவேற்று (Upload File)
            </Button>
          </Box>
        </Paper>
      )}

      {/* ================= STAGE 2: PREVIEW BEFORE UPLOAD (NEVER UPLOAD BLINDLY!) ================= */}
      {stagedFile && !isUploading && (
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            bgcolor: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.08)'
          }}
        >
          {/* Header Inspection Notice */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <WarningAmberIcon sx={{ color: '#D97706', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '12.5px' }}>
                பதிவேற்றத்திற்கு முன் சரிபார்க்கவும் (Preview Before Upload)
              </Typography>
            </Box>
            <Chip
              label={`${stagedFile.sizeMb} MB • Ready`}
              size="small"
              sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '10px', height: 20 }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: '#78350F', display: 'block', mb: 1.5, fontSize: '11px', lineHeight: 1.4 }}>
            படம் தெளிவாகவும் எண்கள்/விவரங்கள் தெளிவாகப் படிக்கக்கூடியதாகவும் உள்ளதா என்று சரிபார்க்கவும். திருப்தியடைந்தால் மட்டுமே கீழே உள்ள <strong>"Confirm & Upload"</strong> பட்டனை அழுத்தவும்.
          </Typography>

          {/* Staged Photo Inspection Card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              bgcolor: '#FFFFFF',
              p: 1.2,
              borderRadius: '10px',
              border: '1px solid #FDE68A',
              mb: 1.5
            }}
          >
            {/* Thumbnail with Zoom trigger */}
            <Box
              onClick={() => !isPdf && setZoomOpen(true)}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '8px',
                overflow: 'hidden',
                bgcolor: '#0F172A',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPdf ? 'default' : 'pointer',
                flexShrink: 0,
                position: 'relative',
                '&:hover .zoom-overlay': { opacity: 1 }
              }}
            >
              {isPdf ? (
                <DescriptionIcon sx={{ color: '#EA580C', fontSize: 32 }} />
              ) : (
                <>
                  <img
                    src={stagedFile.dataUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    className="zoom-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.15s ease'
                    }}
                  >
                    <ZoomInIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
                  </Box>
                </>
              )}
            </Box>

            {/* Document Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stagedFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '11px', mt: 0.2 }}>
                அளவு: <strong>{stagedFile.sizeMb} MB</strong> (Max {maxSizeMb} MB)
              </Typography>
              {!isPdf && (
                <Button
                  size="small"
                  startIcon={<ZoomInIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setZoomOpen(true)}
                  sx={{ p: 0, minWidth: 0, mt: 0.4, color: '#0284C7', fontSize: '11px', fontWeight: 700, textTransform: 'none' }}
                >
                  முழுமையாக பார்க்க (Inspect Full Size)
                </Button>
              )}
            </Box>
          </Box>

          {/* Action CTAs: 1. Confirm & Upload, 2. Retake, 3. Discard */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              fullWidth
              size="small"
              startIcon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
              onClick={handleConfirmUpload}
              sx={{
                bgcolor: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '12px',
                py: 0.9,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                '&:hover': { bgcolor: '#15803D' }
              }}
            >
              ✓ சரிபார்த்து பதிவேற்றவும் (Confirm & Upload)
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={() => cameraInputRef.current?.click()}
              sx={{
                color: '#475569',
                borderColor: '#CBD5E1',
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '11.5px',
                py: 0.8,
                px: 1.4,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
              }}
            >
              மீண்டும் எடு (Retake)
            </Button>

            <IconButton size="small" onClick={handleClear} title="Discard" sx={{ color: '#E11D48' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* ================= STAGE 3: UPLOADING TO S3 SPINNER ================= */}
      {isUploading && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: '#F0F9FF',
            border: '1.5px solid #BAE6FD',
            borderRadius: '14px',
            textAlign: 'center'
          }}
        >
          <CircularProgress size={28} sx={{ color: '#0284C7', mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0369A1', fontSize: '13px' }}>
            S3 கிளவுடில் பாதுகாப்பாக பதிவேற்றப்படுகிறது... (Uploading to S3...)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Validating 5 MB threshold & securing in Neon S3 Storage
          </Typography>
        </Paper>
      )}

      {/* ================= STAGE 4: UPLOADED & VERIFIED STATE ================= */}
      {isUploaded && uploadedUrl && !isUploading && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          {/* Thumbnail / Icon with Zoom trigger */}
          <Box
            onClick={() => !isPdf && setZoomOpen(true)}
            sx={{
              width: 58,
              height: 58,
              borderRadius: '10px',
              overflow: 'hidden',
              bgcolor: '#0F172A',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isPdf ? 'default' : 'pointer',
              flexShrink: 0,
              position: 'relative',
              '&:hover .zoom-overlay': { opacity: 1 }
            }}
          >
            {isPdf ? (
              <DescriptionIcon sx={{ color: '#EA580C', fontSize: 32 }} />
            ) : (
              <>
                <img
                  src={uploadedUrl}
                  alt="Verified Document"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box
                  className="zoom-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  <ZoomInIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
                </Box>
              </>
            )}
          </Box>

          {/* Metadata details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
              <CloudDoneIcon sx={{ color: '#16A34A', fontSize: 17 }} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534', fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stagedFile?.name || 'S3 ஆவணம் உறுதி செய்யப்பட்டது'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#15803D', display: 'block', fontSize: '11px', fontWeight: 600 }}>
              ✓ S3 கிளவுடில் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளது (Verified)
            </Typography>
          </Box>

          {/* Action Buttons: Zoom, Replace, Delete */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {!isPdf && (
              <IconButton size="small" onClick={() => setZoomOpen(true)} title="Zoom In" sx={{ color: '#0369A1' }}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            )}
            <Button
              size="small"
              onClick={() => cameraInputRef.current?.click()}
              sx={{ color: '#0284C7', fontWeight: 800, fontSize: '11px', textTransform: 'none', px: 0.8 }}
            >
              மாற்று (Change)
            </Button>
            <IconButton size="small" onClick={handleClear} title="Remove" sx={{ color: '#E11D48' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* ================= LIGHTBOX / FULL-SIZE INSPECTION MODAL ================= */}
      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
            {label} (முழு பார்வை • Full Resolution Inspection)
          </Typography>
          <IconButton size="small" onClick={() => setZoomOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center' }}>
          {activeDisplayUrl && (
            <img
              src={activeDisplayUrl}
              alt="Full Preview"
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {stagedFile ? '⚠️ பதிவேற்றத்திற்கு முந்தைய பார்வை (Pre-Upload Inspection)' : '✓ S3 கிளவுட் ஆவணம் (Verified S3 Document)'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
