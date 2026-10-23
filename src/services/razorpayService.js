import { Capacitor } from '@capacitor/core';
import { Checkout } from 'capacitor-razorpay';

/**
 * Loads the web Razorpay checkout.js script for browser environments.
 */
export const loadWebRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById('rzp-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'rzp-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Universal Razorpay Checkout Invoker
 * 
 * - Native Android: Invokes Razorpay's official Android SDK (CheckoutActivity) via capacitor-razorpay.
 *   This renders the native Android UPI Intent BottomSheet showing installed apps (Google Pay,
 *   PhonePe, Paytm, BHIM, CRED) with high-res app icons and native OS deep-linking.
 * - Web Browser: Loads checkout.js and opens the standard web checkout modal.
 * 
 * @param {Object} options Payment configuration (key, amount in paise, order_id, prefill, etc.)
 * @returns {Promise<{success: boolean, razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string}>}
 */
export async function openRazorpay(options) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    console.log('[RazorpayService] Invoking Native Android Checkout SDK for seamless UPI intent');
    try {
      const nativeOptions = {
        key: options.key,
        amount: String(options.amount),
        currency: options.currency || 'INR',
        name: options.name || 'Shazu One',
        description: options.description || 'Escrow Payment Authorization',
        image: options.image || 'https://salemseva-backend.onrender.com/favicon.png',
        order_id: options.order_id,
        prefill: {
          name: options.prefill?.name || 'Customer',
          email: options.prefill?.email || 'customer@shazuone.in',
          contact: (options.prefill?.contact || '').replace(/\s+/g, '')
        },
        theme: {
          color: options.theme?.color || '#0284C7'
        },
        send_sms_hash: true
      };

      const result = await Checkout.open(nativeOptions);
      console.log('[RazorpayService] Native Android payment result:', result);
      
      const payload = result?.response || result || {};
      const paymentId = payload.razorpay_payment_id || payload.payment_id;
      const orderId = payload.razorpay_order_id || payload.order_id || options.order_id;
      const signature = payload.razorpay_signature || payload.signature || '';

      if (!paymentId) {
        throw new Error('Payment was completed but no transaction ID was returned.');
      }

      return {
        success: true,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature
      };
    } catch (err) {
      console.warn('[RazorpayService] Native checkout error / dismissed:', err);
      let errMsg = 'Payment was cancelled or could not be completed';
      try {
        const parsed = typeof err === 'string' ? JSON.parse(err) : err;
        errMsg = parsed.description || parsed.message || errMsg;
      } catch (e) {
        errMsg = err?.message || String(err);
      }
      throw new Error(errMsg);
    }
  }

  // Web Browser Checkout
  await loadWebRazorpay();
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      return reject(new Error('Razorpay SDK failed to load. Please verify your internet connection.'));
    }

    const webOptions = {
      ...options,
      handler: function (response) {
        resolve({
          success: true,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || options.order_id,
          razorpay_signature: response.razorpay_signature || ''
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment window closed.'));
        }
      }
    };

    try {
      const rzp = new window.Razorpay(webOptions);
      rzp.on('payment.failed', function (resp) {
        reject(new Error(resp.error?.description || 'Payment processing failed'));
      });
      rzp.open();
    } catch (openErr) {
      reject(openErr);
    }
  });
}
