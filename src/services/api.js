import { API_V1_URL as BASE_URL } from '../config';

export const ApiService = {
  // 1. Fetch Services Catalog
  async fetchServices(lang = 'en') {
    try {
      const res = await fetch(`${BASE_URL}/services?lang=${lang}`);
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      return data.services || [];
    } catch (err) {
      console.warn('Error fetching services catalog:', err.message);
      return [];
    }
  },

  // 2. Fetch Issues for Service
  async fetchIssues(serviceId, lang = 'en') {
    try {
      const res = await fetch(`${BASE_URL}/services/${serviceId}/issues?lang=${lang}`);
      if (!res.ok) throw new Error('Failed to fetch issues');
      const data = await res.json();
      return data.issues || [];
    } catch (err) {
      console.warn('Error fetching service issues:', err.message);
      return [];
    }
  },

  // 3. Create Real Razorpay Order for Escrow
  async createRazorpayOrder(bookingData) {
    try {
      const res = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error creating order:', err);
      return { success: false, error: err.message };
    }
  },

  // 4. Verify Real Razorpay Payment Signature
  async verifyPayment(paymentPayload) {
    try {
      const res = await fetch(`${BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
      return await res.json();
    } catch (err) {
      console.error('Error verifying payment:', err);
      return { success: false, error: err.message };
    }
  },

  // 5. Calculate Razorpay Route Split
  async calculateSplit(splitData) {
    try {
      const res = await fetch(`${BASE_URL}/payments/calculate-split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(splitData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error calculating split:', err);
      return { success: false, error: err.message };
    }
  },

  // 6. Submit Dynamic Review
  async submitReview(reviewData) {
    try {
      const res = await fetch(`${BASE_URL}/reviews/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error submitting review:', err);
      return { success: false, error: err.message };
    }
  },

  // 7. WebRTC ICE Servers (Cloudflare TURN/STUN)
  async getIceServers() {
    try {
      const res = await fetch(`${BASE_URL}/webrtc/ice-servers`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        iceServers: [
          { urls: 'stun:stun.cloudflare.com:3478' },
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
    }
  },

  // 8. Fetch Real Customer Reviews & Stats
  async fetchReviews(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/reviews${query ? `?${query}` : ''}`);
      return await res.json();
    } catch (err) {
      console.error('Error fetching real reviews:', err);
      return { success: false, reviews: [] };
    }
  },

  async fetchReviewStats() {
    try {
      const res = await fetch(`${BASE_URL}/reviews/stats`);
      return await res.json();
    } catch (err) {
      console.error('Error fetching review stats:', err);
      return { success: false, stats: null };
    }
  }
};
