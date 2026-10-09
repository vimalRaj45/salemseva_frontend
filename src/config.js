// Centralized API Base URL Configuration for Local Dev and Cloudflare / Render Deployment
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://salemseva-backend.onrender.com').replace(/\/$/, '');

export const API_V1_URL = `${API_BASE_URL}/api/v1`;

export default {
  API_BASE_URL,
  API_V1_URL
};
