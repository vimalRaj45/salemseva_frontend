// Shazu One Multi-Language & Google Translate Service
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', badge: 'EN', region: 'Default' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', badge: 'TA', region: 'சேலம் & தமிழ்நாடு' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', badge: 'HI', region: 'National' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', badge: 'TE', region: 'South' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', badge: 'KN', region: 'South' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', badge: 'ML', region: 'South' }
];

export function getCurrentLanguage() {
  return localStorage.getItem('shazuone_lang') || 'en';
}

export function isLanguageChosen() {
  return !!localStorage.getItem('shazuone_lang_chosen');
}

export function markLanguageChosen() {
  localStorage.setItem('shazuone_lang_chosen', 'true');
}

export function changeAppLanguage(langCode) {
  try {
    localStorage.setItem('shazuone_lang', langCode);
    localStorage.setItem('shazuone_lang_chosen', 'true');

    // Set Google Translate cookie for path=/
    const cookieVal = langCode === 'en' ? '' : `/en/${langCode}`;
    const hostname = window.location.hostname;
    
    if (langCode === 'en') {
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      if (hostname && hostname !== 'localhost' && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      }
    } else {
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      if (hostname && hostname !== 'localhost' && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      }
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
      if (langCode !== 'en') {
        window.location.reload();
      }
    }
  } catch (err) {
    console.warn('Language change error:', err);
    if (langCode !== 'en') {
      window.location.reload();
    }
  }
}
