import api from './api';

// ==================== Dashboard Stats Types ====================

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  sale_orders: number;
  resale_orders: number;
}

export interface RevenueStats {
  total: number;
  profit: number;
  current_month: number;
  last_month: number;
  growth: number;
  wallet_revenue?: number;
  investment_revenue?: number;
}

export interface GrowthStats {
  orders: number;
  revenue: number;
}

export interface InvestmentStats {
  pending: number;
  expected_returns: number;
  completed: number;
}

export interface AdminStats {
  total_users: number;
  total_admins: number;
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  pending_partnerships: number;
}

export interface WalletOrdersStats {
  total: number;
  completed: number;
  revenue: number;
}

export interface InvestmentOrdersStats {
  total: number;
  completed: number;
  revenue: number;
}

export interface DashboardStats {
  orders: OrderStats;
  revenue: RevenueStats;
  growth: GrowthStats;
  investments: InvestmentStats;
  wallet_orders?: WalletOrdersStats;
  investment_orders?: InvestmentOrdersStats;
  admin?: AdminStats;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  type: 'sale' | 'resale';
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  resale_info?: {
    expected_return: number;
    return_date: string | null;
    returned: boolean;
  };
}

export interface ChartData {
  label: string;
  date: string;
  orders: number;
  revenue: number;
}

export interface Alert {
  type: 'warning' | 'info' | 'success' | 'error';
  icon: string;
  title: string;
  message: string;
  count: number;
}

// ==================== Partnership Types ====================

export interface PartnershipRequest {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  partnership_type: 'distribution' | 'reseller' | 'collaboration' | 'other';
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  admin_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface CreatePartnershipData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  partnership_type: 'distribution' | 'reseller' | 'collaboration' | 'other';
  message: string;
}

// ==================== Deferred Sale Types ====================

export interface DeferredSale {
  id: number;
  product: {
    id: number;
    title: string;
    image?: string;
    current_price?: number;
  };
  quantity: number;
  original_price: number;
  requested_price: number;
  profit_amount: number;
  profit_percentage: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  admin_notes?: string;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CreateDeferredSaleData {
  product_id: number;
  quantity: number;
  requested_price: number;
  notes?: string;
}

export interface DeferredSaleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  total_profit: number;
  average_profit_percentage: number;
}

// ==================== Dashboard API Calls ====================

// Overview stats for public homepage
export interface OverviewStats {
  products: number;
  users: number;
  companies: number;
}

/**
 * Get public overview statistics (no auth required)
 * Used on homepage to display products, users, and companies counts
 */
export const getOverviewStats = async (): Promise<OverviewStats> => {
  const response = await api.get('/overview-stats');
  return response.data.data;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
};

/**
 * Get recent orders for dashboard
 */
export const getRecentOrders = async (limit: number = 5): Promise<RecentOrder[]> => {
  const response = await api.get('/dashboard/recent-orders', { params: { limit } });
  return response.data.data;
};

/**
 * Get sales chart data
 */
export const getSalesChart = async (period: 'week' | 'month' | 'year' = 'week'): Promise<ChartData[]> => {
  const response = await api.get('/dashboard/chart/sales', { params: { period } });
  return response.data.data;
};

/**
 * Get dashboard alerts
 */
export const getAlerts = async (): Promise<Alert[]> => {
  const response = await api.get('/dashboard/alerts');
  return response.data.data;
};

// ==================== Partnership API Calls ====================

/**
 * Submit a partnership request
 */
export const submitPartnershipRequest = async (data: CreatePartnershipData): Promise<PartnershipRequest> => {
  const response = await api.post('/partnerships', data);
  return response.data.data;
};

/**
 * Get partnership requests
 */
export const getPartnershipRequests = async (status?: string): Promise<{
  partnerships: PartnershipRequest[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> => {
  const response = await api.get('/partnerships', { params: { status } });
  return response.data.data;
};

/**
 * Get a specific partnership request
 */
export const getPartnershipRequest = async (id: number): Promise<PartnershipRequest> => {
  const response = await api.get(`/partnerships/${id}`);
  return response.data.data;
};

/**
 * Update partnership request status (Admin only)
 */
export const updatePartnershipRequest = async (
  id: number,
  data: { status?: string; admin_notes?: string }
): Promise<PartnershipRequest> => {
  const response = await api.put(`/admin/partnerships/${id}`, data);
  return response.data.data;
};

/**
 * Delete partnership request (Admin only)
 */
export const deletePartnershipRequest = async (id: number): Promise<void> => {
  await api.delete(`/admin/partnerships/${id}`);
};

// ==================== Deferred Sale API Calls ====================

/**
 * Submit a deferred sale request
 */
export const submitDeferredSale = async (data: CreateDeferredSaleData): Promise<DeferredSale> => {
  const response = await api.post('/deferred-sales', data);
  return response.data.data;
};

/**
 * Get deferred sale requests
 */
export const getDeferredSales = async (status?: string): Promise<{
  deferred_sales: DeferredSale[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> => {
  const response = await api.get('/deferred-sales', { params: { status } });
  return response.data.data;
};

/**
 * Get a specific deferred sale request
 */
export const getDeferredSale = async (id: number): Promise<DeferredSale> => {
  const response = await api.get(`/deferred-sales/${id}`);
  return response.data.data;
};

/**
 * Update deferred sale request status (Admin only)
 */
export const updateDeferredSale = async (
  id: number,
  data: { status?: string; admin_notes?: string }
): Promise<DeferredSale> => {
  const response = await api.put(`/admin/deferred-sales/${id}`, data);
  return response.data.data;
};

/**
 * Delete deferred sale request
 */
export const deleteDeferredSale = async (id: number): Promise<void> => {
  await api.delete(`/deferred-sales/${id}`);
};

/**
 * Get deferred sale statistics (Admin only)
 */
export const getDeferredSaleStats = async (): Promise<DeferredSaleStats> => {
  const response = await api.get('/admin/deferred-sales/stats');
  return response.data.data;
};

// ==================== Profile API Calls ====================

export interface ProfileData {
  name?: string;
  email?: string;
  city?: string;
  national_id?: string;
  national_id_type?: string;
  bank_iban?: string;
  bank_name?: string;
  mobile?: string;
}

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
  const response = await api.get('/me/profile');
  return response.data.data;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (data: ProfileData) => {
  const response = await api.put('/me/profile', data);
  return response.data.data;
};

// ==================== Password Change Types ====================

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Change current user's password
 */
export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.post('/me/change-password', data);
  return response.data;
};
