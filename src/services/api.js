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
      console.warn('Using fallback local catalog:', err.message);
      return [
        { id: 'ac', name: 'AC Repair & Service', name_ta: 'ஏசி பழுதுபார்த்தல்', visit_fee: 99.00, price_range: '₹299 - ₹1,499', icon: 'ac_unit' },
        { id: 'electrician', name: 'Electrician Services', name_ta: 'எலக்ட்ரீஷியன் சேவை', visit_fee: 99.00, price_range: '₹149 - ₹899', icon: 'electric_bolt' },
        { id: 'plumber', name: 'Plumbing & Drainage', name_ta: 'பிளம்பர் சேவை', visit_fee: 99.00, price_range: '₹149 - ₹799', icon: 'plumbing' },
        { id: 'cleaning', name: 'Home & Bathroom Cleaning', name_ta: 'வீடு சுத்தம் செய்தல்', visit_fee: 149.00, price_range: '₹399 - ₹1,999', icon: 'cleaning_services' }
      ];
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
      console.warn('Using fallback issues:', err.message);
      return [
        { id: 'cap', issue_name: 'Capacitor Replacement', min_price: 450, max_price: 650 },
        { id: 'gas', issue_name: 'Gas Top-up & Coil Check', min_price: 850, max_price: 1400 },
        { id: 'wash', issue_name: 'Deep Foam Jet Wash', min_price: 499, max_price: 699 }
      ];
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
  }
};
