import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  ButtonBase
} from '@mui/material';
import { X, Globe, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, changeAppLanguage } from '../services/languageService';

export default function LanguageSelectorModal({ open, onClose, isDarkMode = false }) {
  const currentLang = getCurrentLanguage();

  const handleSelectLanguage = (code) => {
    changeAppLanguage(code);
    if (onClose) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: isDarkMode ? '#0F172A' : '#FFFFFF',
          backgroundImage: 'none',
          border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
          p: 1
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 1.5,
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0066CC'
            }}
          >
            <Globe size={18} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: isDarkMode ? '#FFFFFF' : '#0F172A', lineHeight: 1.2 }}>
              Choose Language / மொழி
            </Typography>
            <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
              Powered by Google Translate
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            '&:hover': { bgcolor: isDarkMode ? '#1E293B' : '#F1F5F9' }
          }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 0.5 }}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;

            return (
              <ButtonBase
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: isSelected
                    ? isDarkMode ? 'rgba(0, 102, 204, 0.2)' : '#EFF6FF'
                    : isDarkMode ? '#1E293B' : '#F8FAFC',
                  border: isSelected
                    ? '1.5px solid #0066CC'
                    : isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#334155' : '#F1F5F9',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '20px' }}>
                    {lang.flag}
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 800 : 700,
                          color: isSelected ? '#0066CC' : isDarkMode ? '#FFFFFF' : '#0F172A'
                        }}
                      >
                        {lang.nativeName}
                      </Typography>
                      {lang.code !== 'en' && (
                        <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                          ({lang.label})
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '10.5px', color: '#94A3B8' }}>
                      {lang.region}
                    </Typography>
                  </Box>
                </Box>

                {isSelected ? (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: '#0066CC',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '1px solid #CBD5E1'
                    }}
                  />
                )}
              </ButtonBase>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.8,
            mt: 2,
            mb: 0.5,
            py: 1,
            px: 1.5,
            borderRadius: '10px',
            bgcolor: isDarkMode ? '#1E293B' : '#F1F5F9'
          }}
        >
          <Sparkles size={13} color="#FF6600" />
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
            Instant AI & Google Live Translation for Salem Users
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
