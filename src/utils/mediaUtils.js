import { API_BASE_URL } from '../config';

/**
 * Resolves media URLs (Aadhaar KYC documents, spare parts bills, voice notes, signatures)
 * Ensuring relative backend paths like /api/v1/storage/view?key=... are fully qualified
 * with the correct backend API host (localhost in dev, onrender/cloudflare in production).
 *
 * @param {string} url - Raw storage URL, relative path, or data URI
 * @returns {string} Fully qualified accessible URL
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Data URIs and Blob URLs are already self-contained
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // Absolute external URLs (e.g. direct S3 or CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative paths from backend storage proxy
  const cleanBase = (API_BASE_URL || '').replace(/\/+$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${cleanBase}${cleanPath}`;
}
