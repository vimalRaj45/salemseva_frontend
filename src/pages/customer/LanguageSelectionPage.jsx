import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  ButtonBase,
  Button,
  Container,
  Paper,
  IconButton
} from '@mui/material';
import { Globe, Check, ArrowLeft, Languages } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  changeAppLanguage,
  markLanguageChosen
} from '../../services/languageService';

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get('firstTime') === 'true' || location.state?.isFirstTime;
  const returnTo = location.state?.returnTo || '/';

  const currentLang = getCurrentLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLang || 'ta');

  const handleDismiss = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleSelectLanguage = (code) => {
    if (isFirstTime) {
      setSelectedLang(code);
    } else {
      changeAppLanguage(code);
      markLanguageChosen();
      handleDismiss();
    }
  };

  const handleConfirmFirstTime = () => {
    changeAppLanguage(selectedLang);
    markLanguageChosen();
    navigate(returnTo, { replace: true });
  };

  const handleSkip = () => {
    markLanguageChosen();
    navigate(returnTo, { replace: true });
  };

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        {!isFirstTime && (
          <IconButton
            onClick={handleDismiss}
            aria-label="Go back"
            sx={{
              color: '#0F172A',
              bgcolor: '#F1F5F9',
              '&:hover': { bgcolor: '#E2E8F0' },
              width: 40,
              height: 40,
              borderRadius: '10px'
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            {isFirstTime ? 'Choose preferred language' : 'Select language'}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
            {isFirstTime
              ? 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்'
              : 'Automatic translation powered by Google Translate'}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284C7',
            flexShrink: 0
          }}
        >
          <Globe size={20} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column' }}>
        {isFirstTime && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '14px',
              bgcolor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start'
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Languages size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: '#0369A1', mb: 0.3 }}>
                வணக்கம்! Welcome to Shazu One
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#0C4A6E', lineHeight: 1.45 }}>
                Select your preferred language for technician updates, quotes, and bills in Salem. You can change this anytime from the top navigation.
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Language Options List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const activeCode = isFirstTime ? selectedLang : currentLang;
            const isSelected = activeCode === lang.code;

            return (
              <ButtonBase
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                focusRipple
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  textAlign: 'left',
                  minHeight: 64,
                  transition: 'all 0.18s ease-in-out',
                  '&:hover': {
                    bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    borderColor: isSelected ? '#0284C7' : '#CBD5E1',
                    transform: 'translateY(-1px)'
                  },
                  '&:focus-visible': {
                    outline: '2px solid #0284C7',
                    outlineOffset: '2px'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: isSelected ? '#0284C7' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      fontWeight: 800,
                      fontSize: '14px',
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
                          fontSize: '15.5px',
                          fontWeight: isSelected ? 800 : 600,
                          color: '#0F172A'
                        }}
                      >
                        {lang.nativeName}
                      </Typography>
                      {lang.code !== 'en' && (
                        <Typography sx={{ fontSize: '13px', color: '#64748B' }}>
                          ({lang.label})
                        </Typography>
                      )}
                      {lang.code === 'ta' && (
                        <Box
                          sx={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            bgcolor: '#DCFCE7',
                            color: '#15803D',
                            px: 1,
                            py: 0.2,
                            borderRadius: '999px',
                            border: '1px solid #BBF7D0'
                          }}
                        >
                          Salem & TN Default
                        </Box>
                      )}
                    </Box>

                    <Typography sx={{ fontSize: '12px', color: '#64748B', mt: 0.2 }}>
                      {lang.region}
                    </Typography>
                  </Box>
                </Box>

                {isSelected ? (
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      border: '2px solid #CBD5E1',
                      flexShrink: 0
                    }}
                  />
                )}
              </ButtonBase>
            );
          })}
        </Box>

        {/* First-time Bottom Confirmation Sticky Buttons */}
        {isFirstTime && (
          <Box sx={{ mt: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirmFirstTime}
              sx={{
                minHeight: 50,
                borderRadius: '12px',
                bgcolor: '#0284C7',
                fontWeight: 800,
                fontSize: '15px',
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
                minHeight: 42,
                borderRadius: '10px',
                color: '#64748B',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
              }}
            >
              Skip for now / ஆங்கிலத்தில் தொடரவும் (English)
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
