import api from './api';

/**
 * Payment Service - MyFatoorah Integration
 * 
 * Handles payment initiation and status checking.
 * Flow:
 * 1. initiatePayment - Send cart data, get MyFatoorah payment URL
 * 2. User redirected to MyFatoorah to pay
 * 3. MyFatoorah redirects back to /payment/result with status
 */

// Payment initiation payload (same as CheckoutPayload)
export interface PaymentPayload {
  items: {
    product_id: number;
    quantity: number;
    purchase_type: 'wallet' | 'resale';
    resale_plan_id?: number | null;
    company_id?: number;
  }[];
  discount_code?: string;
  discount_percent?: number;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_phones?: string[];
  shipping_city?: string;
  shipping_address?: string;
}

// Payment initiation response
export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data?: {
    pending_payment_id: number;
    payment_url: string;
    invoice_id: string | null;
    amount: number;
    expires_at: string;
  };
  error?: string;
}

// Payment status response
export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    id: number;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    amount: number;
    created_at: string;
    expires_at: string;
    paid_at: string | null;
  };
  message?: string;
}

/**
 * Initiate payment with MyFatoorah
 * Returns a payment URL to redirect the user to
 */
export const initiatePayment = async (payload: PaymentPayload): Promise<PaymentInitiationResponse> => {
  const response = await api.post('/payment/initiate', payload);
  return response.data;
};

/**
 * Get payment status (for polling if needed)
 */
export const getPaymentStatus = async (pendingId: number): Promise<PaymentStatusResponse> => {
  const response = await api.get(`/payment/status/${pendingId}`);
  return response.data;
};
