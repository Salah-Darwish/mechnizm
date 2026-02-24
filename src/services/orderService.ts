import api from './api';

// ==================== Types ====================

/**
 * Laravel Carbon date object from API
 */
interface LaravelDate {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  dayOfYear: number;
  hour: number;
  minute: number;
  second: number;
  micro: number;
  timestamp: number;
  formatted: string;
  timezone: {
    timezone_type: number;
    timezone: string;
  };
}

/**
 * Order item from API response
 */
export interface ApiOrderItem {
  id: number;
  product_id: number;
  product_title: string | null;
  product_image_base64: string | null;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  purchase_type?: string;
  resale?: {
    plan_id: number;
    months: number;
    profit_percentage: number | string;
    expected_return: number | string;
    profit_amount: number | string;
  } | null;
}

/**
 * Order from API response (list view)
 */
export interface ApiOrder {
  id: number;
  order_number: string;
  type: 'sale' | 'resale' | 'mixed';
  status: string;
  subtotal: number | string;
  total_amount: number | string;
  items_count: number;
  items?: ApiOrderItem[];
  // Sale order info - can be string, null, or empty object
  shipping_city?: string | Record<string, never> | null;
  shipping?: {
    name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
  } | Record<string, never> | null;
  // Resale order info
  resale_return_date?: string | LaravelDate | null;
  resale_expected_return?: number | string | null;
  resale_profit_amount?: number | string | null;
  resale_profit_percentage?: number | string | null;
  resale_returned?: boolean;
  created_at: string | LaravelDate;
}

/**
 * Order detail from API response
 */
export interface ApiOrderDetail {
  id: number;
  order_number: string;
  type: 'sale' | 'resale' | 'mixed';
  status: string;
  subtotal: number | string;
  total_amount: number | string;
  notes: string | null;
  // Shipping info for sale orders
  shipping?: {
    name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
  } | Record<string, never> | null;
  // Resale info
  resale?: {
    return_date: string | null;
    expected_return: number | string | null;
    profit_amount: number | string | null;
    returned: boolean;
    returned_at: string | null;
  } | null;
  items: ApiOrderItem[];
  created_at: string | LaravelDate;
  updated_at: string | LaravelDate;
}

/**
 * Pagination info from API
 */
export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * API response for orders list (Laravel format)
 */
export interface OrdersListResponse {
  message: string;
  status: string;
  data: {
    orders: ApiOrder[];
    pagination: Pagination;
  };
}

/**
 * API response for order detail (Laravel format)
 */
export interface OrderDetailResponse {
  message: string;
  status: string;
  data: ApiOrderDetail;
}

/**
 * Filter options for fetching orders
 */
export interface OrderFilters {
  type?: 'sale' | 'resale';
  status?: string;
  per_page?: number;
  page?: number;
}

// ==================== Frontend Order Types ====================

/**
 * Transformed order item for frontend consumption
 */
export interface FrontendOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image: string | null;
  // Resale/Investment info
  isResale: boolean;
  resale?: {
    planId: number;
    months: number;
    profitPercentage: number;
    expectedReturn: number;
    profitAmount: number;
  };
}

/**
 * Transformed order for frontend consumption
 */
export interface FrontendOrder {
  id: string;
  orderNumber: string;
  type: 'sale' | 'resale' | 'mixed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'invested' | 'completed';
  items: FrontendOrderItem[];
  subtotal: number;
  totalAmount: number;
  itemsCount: number;
  // Sale order info
  shipping?: {
    name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
  };
  // Resale/Investment info
  resale?: {
    returnDate: string | null;
    expectedReturn: number;
    profitAmount: number;
    returned: boolean;
    returnedAt: string | null;
    daysRemaining: number;
  };
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== Helper Functions ====================

/**
 * Parse Laravel date format to ISO string
 */
const parseLaravelDate = (date: string | LaravelDate | null | undefined): string => {
  if (!date) return new Date().toISOString();
  
  // If it's already a string, return it
  if (typeof date === 'string') return date;
  
  // If it's a Laravel Carbon date object, use the formatted field or construct from parts
  if (typeof date === 'object' && 'formatted' in date) {
    return date.formatted;
  }
  
  return new Date().toISOString();
};

/**
 * Check if shipping_city is a valid string (not empty object)
 */
const getShippingCity = (city: string | Record<string, never> | null | undefined): string | null => {
  if (!city) return null;
  if (typeof city === 'string' && city.trim()) return city;
  if (typeof city === 'object' && Object.keys(city).length === 0) return null;
  return null;
};

/**
 * Calculate days remaining until a date
 */
const calculateDaysRemaining = (dateString: string | LaravelDate | null | undefined): number => {
  const dateStr = parseLaravelDate(dateString);
  if (!dateStr) return 0;
  const now = new Date();
  const targetDate = new Date(dateStr);
  const diff = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Map API status to frontend status
 */
const mapStatus = (status: string): FrontendOrder['status'] => {
  const statusMap: Record<string, FrontendOrder['status']> = {
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    invested: 'invested',
    completed: 'completed',
  };
  return statusMap[status] || 'pending';
};

/**
 * Transform API order item to frontend format
 */
const transformOrderItem = (item: ApiOrderItem): FrontendOrderItem => {
  // Check if resale exists and is not an empty object
  const hasValidResale = !!(item.resale && 
    typeof item.resale === 'object' && 
    Object.keys(item.resale).length > 0 &&
    item.resale.plan_id !== undefined);
  
  return {
    id: item.id,
    productId: item.product_id,
    productName: item.product_title || 'Product #' + item.product_id,
    quantity: item.quantity,
    price: Number(item.unit_price),
    totalPrice: Number(item.total_price),
    image: item.product_image_base64,
    isResale: hasValidResale,
    resale: hasValidResale && item.resale ? {
      planId: item.resale.plan_id,
      months: item.resale.months,
      profitPercentage: Number(item.resale.profit_percentage),
      expectedReturn: Number(item.resale.expected_return),
      profitAmount: Number(item.resale.profit_amount) || 
        (Number(item.resale.expected_return) - Number(item.total_price)),
    } : undefined,
  };
};

/**
 * Helper to check if a value is a valid number (not empty object, null, or undefined)
 */
const isValidNumber = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') return false;
  const num = Number(value);
  return !isNaN(num);
};

/**
 * Transform API order to frontend format (list view)
 */
export const transformOrder = (order: ApiOrder): FrontendOrder => {
  const hasResale = order.type === 'resale' || order.type === 'mixed';
  const shippingCity = getShippingCity(order.shipping_city);
  const createdAtStr = parseLaravelDate(order.created_at);
  
  // Handle resale_return_date - check if it's empty object
  const resaleReturnDateStr = 
    typeof order.resale_return_date === 'string' && order.resale_return_date
      ? order.resale_return_date
      : (typeof order.resale_return_date === 'object' && order.resale_return_date && 'formatted' in order.resale_return_date)
        ? parseLaravelDate(order.resale_return_date)
        : null;
  
  // Transform items if available
  const items = order.items ? order.items.map(transformOrderItem) : [];
  
  // For mixed orders, calculate resale totals from items
  let resaleExpectedReturn = 0;
  let resaleProfitAmount = 0;
  let hasResaleItems = false;
  
  if (order.type === 'mixed' && items.length > 0) {
    // Calculate from resale items only
    items.forEach(item => {
      if (item.isResale && item.resale) {
        hasResaleItems = true;
        resaleExpectedReturn += item.resale.expectedReturn;
        resaleProfitAmount += item.resale.profitAmount;
      }
    });
  } else if (isValidNumber(order.resale_expected_return)) {
    // Use order-level values for pure resale orders
    resaleExpectedReturn = Number(order.resale_expected_return);
    resaleProfitAmount = isValidNumber(order.resale_profit_amount) 
      ? Number(order.resale_profit_amount) 
      : 0;
  }
  
  // Get shipping info (prefer shipping object over shipping_city)
  let shipping: FrontendOrder['shipping'] | undefined;
  if (order.shipping && typeof order.shipping === 'object' && Object.keys(order.shipping).length > 0) {
    shipping = order.shipping as FrontendOrder['shipping'];
  } else if (shippingCity) {
    shipping = { name: null, phone: null, city: shippingCity, address: null };
  }
  
  // Determine if we have valid resale data
  const hasValidResale = hasResale && (resaleExpectedReturn > 0 || hasResaleItems || resaleReturnDateStr);
  
  return {
    id: String(order.id),
    orderNumber: order.order_number,
    type: order.type,
    status: mapStatus(order.status),
    items,
    subtotal: Number(order.subtotal),
    totalAmount: Number(order.total_amount),
    itemsCount: order.items_count,
    shipping,
    resale: hasValidResale ? {
      returnDate: resaleReturnDateStr,
      expectedReturn: resaleExpectedReturn,
      profitAmount: resaleProfitAmount,
      returned: typeof order.resale_returned === 'boolean' ? order.resale_returned : false,
      returnedAt: null,
      daysRemaining: resaleReturnDateStr ? calculateDaysRemaining(resaleReturnDateStr) : 0,
    } : undefined,
    notes: null,
    createdAt: createdAtStr,
    updatedAt: createdAtStr,
  };
};

/**
 * Helper to check if shipping is valid (not empty object)
 */
const getValidShipping = (shipping: ApiOrderDetail['shipping']): FrontendOrder['shipping'] | undefined => {
  if (!shipping) return undefined;
  if (typeof shipping === 'object' && Object.keys(shipping).length === 0) return undefined;
  return shipping as FrontendOrder['shipping'];
};

/**
 * Transform API order detail to frontend format
 */
export const transformOrderDetail = (order: ApiOrderDetail): FrontendOrder => {
  const hasResale = order.type === 'resale' || order.type === 'mixed';
  const createdAtStr = parseLaravelDate(order.created_at);
  const updatedAtStr = parseLaravelDate(order.updated_at);
  
  // Transform items first
  const items = order.items ? order.items.map(transformOrderItem) : [];
  
  // For mixed orders, calculate resale totals from items if order-level data is missing
  let resaleExpectedReturn = 0;
  let resaleProfitAmount = 0;
  let resaleReturnDate: string | null = null;
  let hasResaleItems = false;
  
  if (hasResale) {
    // Check if order-level resale data exists and is valid
    if (order.resale && isValidNumber(order.resale.expected_return) && Number(order.resale.expected_return) > 0) {
      resaleExpectedReturn = Number(order.resale.expected_return);
      resaleProfitAmount = isValidNumber(order.resale.profit_amount) ? Number(order.resale.profit_amount) : 0;
      resaleReturnDate = order.resale.return_date || null;
    } else if (items.length > 0) {
      // Calculate from items for mixed orders
      items.forEach(item => {
        if (item.isResale && item.resale) {
          hasResaleItems = true;
          resaleExpectedReturn += item.resale.expectedReturn;
          resaleProfitAmount += item.resale.profitAmount;
        }
      });
    }
  }
  
  const hasValidResale = hasResale && (resaleExpectedReturn > 0 || hasResaleItems);
  
  return {
    id: String(order.id),
    orderNumber: order.order_number,
    type: order.type,
    status: mapStatus(order.status),
    items,
    subtotal: Number(order.subtotal),
    totalAmount: Number(order.total_amount),
    itemsCount: items.length,
    shipping: getValidShipping(order.shipping),
    resale: hasValidResale ? {
      returnDate: resaleReturnDate,
      expectedReturn: resaleExpectedReturn,
      profitAmount: resaleProfitAmount,
      returned: order.resale?.returned || false,
      returnedAt: order.resale?.returned_at || null,
      daysRemaining: resaleReturnDate ? calculateDaysRemaining(resaleReturnDate) : 0,
    } : undefined,
    notes: order.notes,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
};

// ==================== API Functions ====================

/**
 * Fetch all orders for the authenticated user
 */
export const fetchOrders = async (filters?: OrderFilters): Promise<{
  orders: FrontendOrder[];
  pagination: Pagination;
}> => {
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.per_page) params.append('per_page', String(filters.per_page));
  if (filters?.page) params.append('page', String(filters.page));
  
  const response = await api.get<OrdersListResponse>(`/orders?${params.toString()}`);
  
  // Laravel response uses status: "200" instead of success: true
  if (response.data.status !== '200' && response.data.message !== 'Success') {
    throw new Error(response.data.message || 'Failed to fetch orders');
  }
  
  return {
    orders: response.data.data.orders.map(transformOrder),
    pagination: response.data.data.pagination,
  };
};

/**
 * Fetch order details by ID
 */
export const fetchOrderDetail = async (orderId: string | number): Promise<FrontendOrder> => {
  const response = await api.get<OrderDetailResponse>(`/orders/${orderId}`);
  
  // Laravel response uses status: "200" instead of success: true
  if (response.data.status !== '200' && response.data.message !== 'Success') {
    throw new Error(response.data.message || 'Failed to fetch order details');
  }
  
  return transformOrderDetail(response.data.data);
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string | number): Promise<FrontendOrder> => {
  const response = await api.post<OrderDetailResponse>(`/orders/${orderId}/cancel`);
  
  // Laravel response uses status: "200" instead of success: true
  if (response.data.status !== '200' && response.data.message !== 'Success') {
    throw new Error(response.data.message || 'Failed to cancel order');
  }
  
  return transformOrderDetail(response.data.data);
};

// ==================== Admin API Functions ====================

/**
 * Fetch all orders (Admin only)
 */
export const fetchAllOrders = async (filters?: OrderFilters): Promise<{
  orders: FrontendOrder[];
  pagination: Pagination;
}> => {
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.per_page) params.append('per_page', String(filters.per_page));
  if (filters?.page) params.append('page', String(filters.page));
  
  const response = await api.get<OrdersListResponse>(`/admin/orders?${params.toString()}`);
  
  // Laravel response uses status: "200" instead of success: true
  if (response.data.status !== '200' && response.data.message !== 'Success') {
    throw new Error(response.data.message || 'Failed to fetch orders');
  }
  
  return {
    orders: response.data.data.orders.map(transformOrder),
    pagination: response.data.data.pagination,
  };
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
  orderId: string | number,
  status: string
): Promise<FrontendOrder> => {
  const response = await api.put<OrderDetailResponse>(`/admin/orders/${orderId}/status`, { status });
  
  // Laravel response uses status: "200" instead of success: true
  if (response.data.status !== '200' && response.data.message !== 'Success') {
    throw new Error(response.data.message || 'Failed to update order status');
  }
  
  return transformOrderDetail(response.data.data);
};

/**
 * Process pending resale returns (Admin only)
 */
export const processResaleReturns = async (): Promise<{ processed_count: number; message: string }> => {
  const response = await api.post('/admin/orders/process-resale-returns');
  return response.data.data;
};
