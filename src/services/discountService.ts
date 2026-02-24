import api from './api';

export interface DiscountCode {
  id: number;
  code: string;
  discount_percent: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountCodeData {
  code: string;
  discount_percent: number;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
}

export interface ValidateDiscountResponse {
  success: boolean;
  message: string;
  valid: boolean;
  data?: {
    code: string;
    discount_percent: number;
  };
}

export interface DiscountCodeResponse {
  success: boolean;
  message: string;
  data: DiscountCode;
}

export interface DiscountCodesListResponse {
  success: boolean;
  data: {
    data: DiscountCode[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Validate a discount code (public endpoint for cart)
 */
export const validateDiscountCode = async (code: string): Promise<ValidateDiscountResponse> => {
  try {
    const response = await api.post('/discount-codes/validate', { code });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: ValidateDiscountResponse } };
    if (err.response?.data) {
      return err.response.data;
    }
    return {
      success: false,
      message: 'فشل التحقق من كود الخصم',
      valid: false,
    };
  }
};

/**
 * Get all discount codes (admin only)
 */
export const getDiscountCodes = async (params?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
}): Promise<DiscountCodesListResponse> => {
  const response = await api.get('/admin/discount-codes', { params });
  return response.data;
};

/**
 * Get a single discount code (admin only)
 */
export const getDiscountCode = async (id: number): Promise<DiscountCodeResponse> => {
  const response = await api.get(`/admin/discount-codes/${id}`);
  return response.data;
};

/**
 * Create a new discount code (admin only)
 */
export const createDiscountCode = async (data: CreateDiscountCodeData): Promise<DiscountCodeResponse> => {
  const response = await api.post('/admin/discount-codes', data);
  return response.data;
};

/**
 * Update a discount code (admin only)
 */
export const updateDiscountCode = async (id: number, data: Partial<CreateDiscountCodeData>): Promise<DiscountCodeResponse> => {
  const response = await api.put(`/admin/discount-codes/${id}`, data);
  return response.data;
};

/**
 * Toggle discount code active status (admin only)
 */
export const toggleDiscountCode = async (id: number): Promise<DiscountCodeResponse> => {
  const response = await api.patch(`/admin/discount-codes/${id}/toggle`);
  return response.data;
};

/**
 * Delete a discount code (admin only)
 */
export const deleteDiscountCode = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/discount-codes/${id}`);
  return response.data;
};
