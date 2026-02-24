import api from './api';

// Checkout item with purchase type
export interface CheckoutItem {
  product_id: number;
  quantity: number;
  purchase_type: 'wallet' | 'resale';
  resale_plan_id?: number | null;
  company_id: number; // Required - company selection for each item
}

// Checkout request payload
export interface CheckoutPayload {
  items: CheckoutItem[];
  discount_code?: string;
  discount_percent?: number;
  // Shipping info (phone and address required when any item has purchase_type = 'wallet')
  // Name and city are optional - backend uses user profile data if not provided
  shipping_name?: string;
  shipping_phone?: string;
  shipping_phones?: string[]; // Additional phone numbers
  shipping_city?: string;
  shipping_address?: string;
}

// Investment from checkout response
export interface InvestmentResult {
  id: number;
  invested_amount: number;
  expected_return: number;
  profit_amount: number;
  maturity_date: string;
  plan_months: number;
  plan_profit_percentage: number;
}

// Checkout response
export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      id: number;
      order_number: string;
      type: 'sale' | 'resale' | 'mixed';
      status: string;
      total_amount: number;
      created_at: string;
    };
    summary: {
      sale_items: number;
      resale_items: number;
      requires_shipping: boolean;
      subtotal: number;
      discount_amount: number;
      total_to_pay: number;
    };
    investments?: InvestmentResult[];
    total_expected_return?: number;
    total_expected_profit?: number;
  };
}

// User investment (from getInvestments)
export interface UserInvestment {
  id: number;
  product_name: string | null;
  order_number: string | null;
  invested_amount: number;
  expected_return: number;
  profit_amount: number;
  profit_percentage: number;
  investment_date: string;
  maturity_date: string;
  days_until_maturity: number;
  status: 'pending' | 'active' | 'matured' | 'paid_out' | 'cancelled';
  is_matured: boolean;
  can_withdraw: boolean;
}

export interface InvestmentsSummary {
  total_invested: number;
  total_expected_return: number;
  total_expected_profit: number;
  active_count: number;
  matured_count: number;
  paid_out_count: number;
}

export interface GetInvestmentsResponse {
  success: boolean;
  data: {
    investments: UserInvestment[];
    summary: InvestmentsSummary;
  };
}

/**
 * Process checkout with wallet and/or resale items
 * Uses database transactions on backend for data integrity
 */
export const processCheckout = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
  const response = await api.post('/checkout', payload);
  return response.data;
};

/**
 * Get user's investments
 */
export const getInvestments = async (): Promise<GetInvestmentsResponse> => {
  const response = await api.get('/investments');
  return response.data;
};
