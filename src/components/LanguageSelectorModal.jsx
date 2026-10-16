import React from 'react';
import {
  Typography,
  Box,
  ButtonBase
} from '@mui/material';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, changeAppLanguage } from '../services/languageService';
import { Modal, ModalHeader, ModalBody } from './Modal';

export default function LanguageSelectorModal({ open, onClose }) {
  const currentLang = getCurrentLanguage();

  const handleSelectLanguage = (code) => {
    changeAppLanguage(code);
    if (onClose) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="xs" ariaLabelledBy="lang-modal-title">
      <ModalHeader
        id="lang-modal-title"
        title="Choose language"
        subtitle="Automatic translation powered by Google Translate"
        onClose={onClose}
        icon={<Globe size={20} color="#0A66C2" />}
      />

      <ModalBody>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  borderRadius: '12px',
                  bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  border: isSelected ? '1.5px solid #0A66C2' : '1px solid #E2E8F0',
                  textAlign: 'left',
                  minHeight: 48,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#EFF6FF' : '#F1F5F9',
                    borderColor: isSelected ? '#0A66C2' : '#CBD5E1'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: isSelected ? '#0A66C2' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {lang.badge || lang.code.toUpperCase()}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 700 : 500,
                          color: '#0F172A'
                        }}
                      >
                        {lang.nativeName}
                      </Typography>
                      {lang.code !== 'en' && (
                        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                          ({lang.label})
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: '#64748B' }}>
                      {lang.region}
                    </Typography>
                  </Box>
                </Box>

                {isSelected ? (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: '#0A66C2',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '1px solid #CBD5E1'
                    }}
                  />
                )}
              </ButtonBase>
            );
          })}
        </Box>
      </ModalBody>
    </Modal>
  );
}
