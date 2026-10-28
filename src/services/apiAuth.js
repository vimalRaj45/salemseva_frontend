// Every API request carries the session token.
//
// The backend now refuses any non-public route without one, and the app has 45 separate
// fetch call sites. Patching fetch once is the only way to cover all of them without
// touching each screen, and it cannot be forgotten the way an import can.
//
// The token is read on every call rather than captured once, because sign-in happens after
// this module loads.

import { API_BASE_URL } from '../config';

export const SESSION_TOKEN_KEY = 'shazuone_session_token';
export const SESSION_EXPIRED_EVENT = 'shazuone:session-expired';

const PUBLIC_PATH_PREFIXES = [
  '/api/v1/auth/',
  '/api/v1/services',
  '/api/v1/services-availability',
  '/api/v1/coupons/active',
  '/api/v1/reviews',
  '/api/v1/feedback',
  '/api/v1/settings/rewards',
  '/api/v1/notifications/vapid-public-key',
  '/api/v1/storage/file/',
  '/api/v1/storage/view',
  '/api/v1/translate',
  '/health'
];

function isApiRequest(url) {
  return typeof url === 'string' && url.startsWith(API_BASE_URL);
}

function isPublicPath(url) {
  const path = url.slice(API_BASE_URL.length).split('?')[0];
  return PUBLIC_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix));
}

function readToken() {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch (_) {
    return '';
  }
}

export function installApiAuth() {
  if (window.__shazuApiAuthInstalled__) return;
  window.__shazuApiAuthInstalled__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input && input.url);
    if (!isApiRequest(url)) return originalFetch(input, init);

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    const token = readToken();
    if (token && !isPublicPath(url) && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await originalFetch(input instanceof Request ? new Request(input, { headers }) : input, {
      ...init,
      headers
    });

    // A 401 on a request that carried a token means the session is gone: server restart,
    // expiry, or a token from a previous install. Clearing it lets AuthContext send the
    // person back to sign-in instead of leaving every screen failing silently.
    if (response.status === 401 && token) {
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      } catch (_) { /* storage unavailable */ }
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    return response;
  };
}
