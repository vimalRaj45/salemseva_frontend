// Centralized API Base URL Configuration for Local Dev and Cloudflare / Render Deployment
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8080' : 'https://salemseva-backend.onrender.com')
).replace(/\/$/, '');

export const API_V1_URL = `${API_BASE_URL}/api/v1`;

// Dual-Sided Platform Commission & Payout Percentages from Environment
export const PARTNER_COMMISSION_PERCENT = parseFloat(import.meta.env.VITE_PARTNER_COMMISSION_PERCENT || '2.0');
export const PARTNER_PAYOUT_PERCENT = parseFloat(
  import.meta.env.VITE_PARTNER_PAYOUT_PERCENT || (100 - PARTNER_COMMISSION_PERCENT).toString()
);
export const CUSTOMER_PLATFORM_FEE_PERCENT = parseFloat(import.meta.env.VITE_CUSTOMER_PLATFORM_FEE_PERCENT || '2.0');
export const PAYMENT_GATEWAY_FEE_PERCENT = parseFloat(import.meta.env.VITE_PAYMENT_GATEWAY_FEE_PERCENT || '2.0');

export default {
  API_BASE_URL,
  API_V1_URL,
  PARTNER_COMMISSION_PERCENT,
  PARTNER_PAYOUT_PERCENT,
  CUSTOMER_PLATFORM_FEE_PERCENT,
  PAYMENT_GATEWAY_FEE_PERCENT
};
