// SalemSeva Multi-Language & Google Translate Service
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Default' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'சேலம் & தமிழ்நாடு' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'National' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'South' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'South' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'South' }
];

export function getCurrentLanguage() {
  return localStorage.getItem('salemseva_lang') || 'en';
}

export function changeAppLanguage(langCode) {
  try {
    localStorage.setItem('salemseva_lang', langCode);

    // Set Google Translate cookie for path=/
    const cookieVal = langCode === 'en' ? '' : `/en/${langCode}`;
    const hostname = window.location.hostname;
    
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (hostname && hostname !== 'localhost' && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
    }

    // Check if Google Translate widget select element is ready in DOM
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
      // Slight delay to ensure DOM updates or force refresh if not auto-updated
      setTimeout(() => {
        if (!document.documentElement.classList.contains('translated-ltr') && langCode !== 'en') {
          window.location.reload();
        }
      }, 300);
    } else {
      window.location.reload();
    }
  } catch (err) {
    console.warn('Language change error:', err);
    window.location.reload();
  }
}
