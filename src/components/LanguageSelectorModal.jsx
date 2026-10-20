import React, { useState } from 'react';
import {
  Typography,
  Box,
  ButtonBase,
  Button
} from '@mui/material';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, changeAppLanguage, markLanguageChosen } from '../services/languageService';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

export default function LanguageSelectorModal({ open, onClose, isFirstTime = false }) {
  const currentLang = getCurrentLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLang || 'ta');

  const handleSelectLanguage = (code) => {
    if (isFirstTime) {
      setSelectedLang(code);
    } else {
      changeAppLanguage(code);
      if (onClose) onClose();
    }
  };

  const handleConfirmFirstTime = () => {
    changeAppLanguage(selectedLang);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    markLanguageChosen();
    if (onClose) onClose();
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <Modal
      open={open}
      onClose={isFirstTime ? handleSkip : onClose}
      maxWidth="xs"
      ariaLabelledBy="lang-modal-title"
      disableEscapeKeyDown={isFirstTime}
    >
      <ModalHeader
        id="lang-modal-title"
        title={isFirstTime ? 'Choose preferred language' : 'Choose language'}
        subtitle={
          isFirstTime
            ? 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்'
            : 'Automatic translation powered by Google Translate'
        }
        onClose={isFirstTime ? handleSkip : onClose}
        icon={<Globe size={20} color="#0284C7" />}
      />

      <ModalBody sx={{ gap: 1.5 }}>
        {isFirstTime && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#0369A1' }}>
              வணக்கம்! Welcome to Shazu One
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#0C4A6E', lineHeight: 1.4 }}>
              Select your preferred language. You can change this anytime from the top menu.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const activeCode = isFirstTime ? selectedLang : currentLang;
            const isSelected = activeCode === lang.code;

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
                  border: isSelected ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                  textAlign: 'left',
                  minHeight: 52,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#EFF6FF' : '#F1F5F9',
                    borderColor: isSelected ? '#0284C7' : '#CBD5E1'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      bgcolor: isSelected ? '#0284C7' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {lang.badge || lang.code.toUpperCase()}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                      <Typography
                        sx={{
                          fontSize: '14.5px',
                          fontWeight: isSelected ? 800 : 600,
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
                      {lang.code === 'ta' && (
                        <Box
                          sx={{
                            fontSize: '10px',
                            fontWeight: 700,
                            bgcolor: '#DCFCE7',
                            color: '#15803D',
                            px: 1,
                            py: 0.2,
                            borderRadius: '999px'
                          }}
                        >
                          Salem & TN
                        </Box>
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
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
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
                      border: '1.5px solid #CBD5E1',
                      flexShrink: 0
                    }}
                  />
                )}
              </ButtonBase>
            );
          })}
        </Box>
      </ModalBody>

      {isFirstTime && (
        <ModalFooter sx={{ flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleConfirmFirstTime}
            sx={{
              minHeight: 48,
              borderRadius: '12px',
              bgcolor: '#0284C7',
              fontWeight: 800,
              fontSize: '14.5px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
              '&:hover': { bgcolor: '#0369A1' }
            }}
          >
            {selectedLang === 'ta'
              ? 'தொடரவும் (Continue in தமிழ்)'
              : `Continue in ${selectedLangObj.nativeName}`}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleSkip}
            sx={{
              minHeight: 38,
              borderRadius: '10px',
              color: '#64748B',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
            }}
          >
            Skip for now / ஆங்கிலத்தில் தொடரவும் (English)
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
