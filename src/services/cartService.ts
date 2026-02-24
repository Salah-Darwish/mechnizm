import api from './api';

// Payment option from backend (always includes wallet for direct purchase)
export interface PaymentOption {
  id: number;
  type: 'wallet' | 'cash' | 'installment';
  label: string;
}

// Resale plan (investment option) from backend
export interface ResalePlan {
  id: number;
  months: number;
  profit_percentage: number;
  label: string;
  expected_return: number;
  profit_amount: number;
}

// Types matching backend response
export interface CartItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  purchase_type: 'wallet' | 'resale';
  resale_plan_id: number | null;
  company_id: number | null;
  title: string | null;
  description: string | null;
  price: number | null;
  total_price: number;
  in_stock: boolean | null;
  stock_quantity: number | null;
  main_image_base64: string | null;
  payment_options: PaymentOption[];
  resale_plans: ResalePlan[];
  selected_resale_plan: ResalePlan | null;
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  total_items: number;
  total_price: string;
  items_count: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    cart_items: CartItemResponse[];
    summary: CartSummary;
  };
  message?: string;
}

export interface SingleCartItemResponse {
  success: boolean;
  data: CartItemResponse;
  message?: string;
}

// Get all cart items
export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get('/cart');
  return response.data;
};

// Add product to cart
export const addToCart = async (
  productId: number,
  quantity: number = 1
): Promise<SingleCartItemResponse> => {
  const response = await api.post('/cart', {
    product_id: productId,
    quantity,
  });
  return response.data;
};

// Update cart item quantity
export const updateCartQuantity = async (
  productId: number,
  quantity: number
): Promise<SingleCartItemResponse> => {
  const response = await api.put(`/cart/${productId}`, { quantity });
  return response.data;
};

// Increase product quantity by 1
export const increaseCartQuantity = async (
  productId: number
): Promise<SingleCartItemResponse> => {
  const response = await api.post(`/cart/${productId}/increase`);
  return response.data;
};

// Decrease product quantity by 1
export const decreaseCartQuantity = async (
  productId: number
): Promise<SingleCartItemResponse> => {
  const response = await api.post(`/cart/${productId}/decrease`);
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (
  productId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async (): Promise<{
  success: boolean;
  data: { deleted_count: number };
  message: string;
}> => {
  const response = await api.delete('/cart');
  return response.data;
};

// Update cart item purchase options (purchase_type, resale_plan_id, company_id)
export interface UpdateCartOptionsPayload {
  purchase_type?: 'wallet' | 'resale';
  resale_plan_id?: number | null;
  company_id?: number | null;
}

export const updateCartOptions = async (
  productId: number,
  options: UpdateCartOptionsPayload
): Promise<SingleCartItemResponse> => {
  const response = await api.patch(`/cart/${productId}/options`, options);
  return response.data;
};
