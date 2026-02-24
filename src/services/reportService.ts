import api from './api';

// ==================== Types ====================

/**
 * Overview statistics from API
 */
export interface OverviewStats {
  total_revenue: number;
  current_period_revenue: number;
  previous_period_revenue: number;
  revenue_growth: number;
  total_orders: number;
  current_period_orders: number;
  previous_period_orders: number;
  orders_growth: number;
  avg_order_value: number;
  current_avg_order_value: number;
  avg_order_growth: number;
  total_products: number;
  active_products: number;
  total_profit: number;
  completed_revenue: number;
}

/**
 * Chart data point from API
 */
export interface ChartDataPoint {
  label: string;
  label_ar: string;
  date: string;
  orders: number;
  revenue: number;
  sale_orders: number;
  resale_orders: number;
}

/**
 * Order status distribution item
 */
export interface OrderStatusItem {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Order status distribution from API
 */
export interface OrderStatusDistribution {
  total: number;
  distribution: OrderStatusItem[];
}

/**
 * Order type stats
 */
export interface OrderTypeStats {
  count: number;
  percentage: number;
  revenue: number;
  revenue_percentage: number;
}

/**
 * Resale order type stats (extends OrderTypeStats)
 */
export interface ResaleOrderTypeStats extends OrderTypeStats {
  profit: number;
  pending_returns: number;
  completed_returns: number;
}

/**
 * Order types distribution from API
 */
export interface OrderTypesDistribution {
  sale: OrderTypeStats;
  resale: ResaleOrderTypeStats;
  total_revenue: number;
}

/**
 * Top product from API
 */
export interface TopProduct {
  id: number;
  title: string;
  title_ar: string | null;
  title_en: string | null;
  price: number;
  total_quantity_sold: number;
  total_revenue: number;
  order_count: number;
}

/**
 * Recent activity item from API
 */
export interface RecentActivityItem {
  id: number;
  order_number: string;
  type: 'sale' | 'resale';
  status: string;
  total_amount: number;
  user_name: string;
  user_email: string;
  created_at: string;
  created_at_human: string;
}

/**
 * Full reports response from API
 */
export interface ReportsData {
  overview: OverviewStats;
  chart_data: ChartDataPoint[];
  order_status: OrderStatusDistribution;
  order_types: OrderTypesDistribution;
  top_products: TopProduct[];
  recent_activity: RecentActivityItem[];
  period: 'week' | 'month' | 'year';
  generated_at: string;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ==================== API Functions ====================

/**
 * Fetch comprehensive reports data
 */
export const fetchReports = async (
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ReportsData> => {
  const response = await api.get<ApiResponse<ReportsData>>(`/reports?period=${period}`);
  
  if (response.data.status !== '200' && response.data.message !== 'Reports data retrieved successfully') {
    throw new Error(response.data.message || 'Failed to fetch reports');
  }
  
  return response.data.data;
};

/**
 * Export reports data
 */
export const exportReports = async (
  period: 'week' | 'month' | 'year' = 'month',
  format: 'json' | 'csv' = 'json'
): Promise<ReportsData & { csv_ready?: Record<string, unknown[][]> }> => {
  const response = await api.get<ApiResponse<ReportsData & { csv_ready?: Record<string, unknown[][]> }>>(
    `/reports/export?period=${period}&format=${format}`
  );
  
  if (response.data.status !== '200' && response.data.message !== 'Export data retrieved successfully') {
    throw new Error(response.data.message || 'Failed to export reports');
  }
  
  return response.data.data;
};

// ==================== Frontend Transform Functions ====================

/**
 * Transform API overview stats to frontend format
 */
export const transformOverviewStats = (stats: OverviewStats) => ({
  totalRevenue: stats.total_revenue,
  currentPeriodRevenue: stats.current_period_revenue,
  previousPeriodRevenue: stats.previous_period_revenue,
  revenueGrowth: stats.revenue_growth,
  totalOrders: stats.total_orders,
  currentPeriodOrders: stats.current_period_orders,
  previousPeriodOrders: stats.previous_period_orders,
  ordersGrowth: stats.orders_growth,
  avgOrderValue: stats.avg_order_value,
  currentAvgOrderValue: stats.current_avg_order_value,
  avgOrderGrowth: stats.avg_order_growth,
  totalProducts: stats.total_products,
  activeProducts: stats.active_products,
  totalProfit: stats.total_profit,
  completedRevenue: stats.completed_revenue,
});

/**
 * Transform chart data for recharts/visualization
 */
export const transformChartData = (
  chartData: ChartDataPoint[],
  isRTL: boolean
) => {
  return chartData.map((item) => ({
    label: isRTL ? item.label_ar : item.label,
    date: item.date,
    orders: item.orders,
    revenue: item.revenue,
    saleOrders: item.sale_orders,
    resaleOrders: item.resale_orders,
  }));
};

/**
 * Transform order status distribution
 */
export const transformOrderStatus = (orderStatus: OrderStatusDistribution) => ({
  total: orderStatus.total,
  distribution: orderStatus.distribution.map((item) => ({
    status: item.status,
    count: item.count,
    percentage: item.percentage,
  })),
});

/**
 * Transform order types distribution
 */
export const transformOrderTypes = (orderTypes: OrderTypesDistribution) => ({
  sale: {
    count: orderTypes.sale.count,
    percentage: orderTypes.sale.percentage,
    revenue: orderTypes.sale.revenue,
    revenuePercentage: orderTypes.sale.revenue_percentage,
  },
  resale: {
    count: orderTypes.resale.count,
    percentage: orderTypes.resale.percentage,
    revenue: orderTypes.resale.revenue,
    revenuePercentage: orderTypes.resale.revenue_percentage,
    profit: orderTypes.resale.profit,
    pendingReturns: orderTypes.resale.pending_returns,
    completedReturns: orderTypes.resale.completed_returns,
  },
  totalRevenue: orderTypes.total_revenue,
});

/**
 * Transform top products
 */
export const transformTopProducts = (products: TopProduct[], isRTL: boolean) => {
  return products.map((product) => ({
    id: product.id,
    title: isRTL ? (product.title_ar || product.title) : (product.title_en || product.title),
    price: product.price,
    totalQuantitySold: product.total_quantity_sold,
    totalRevenue: product.total_revenue,
    orderCount: product.order_count,
  }));
};

/**
 * Transform recent activity
 */
export const transformRecentActivity = (activity: RecentActivityItem[]) => {
  return activity.map((item) => ({
    id: item.id,
    orderNumber: item.order_number,
    type: item.type,
    status: item.status,
    totalAmount: item.total_amount,
    userName: item.user_name,
    userEmail: item.user_email,
    createdAt: item.created_at,
    createdAtHuman: item.created_at_human,
  }));
};

/**
 * Generate CSV download from data
 */
export const downloadCsv = (data: unknown[][], filename: string) => {
  const csvContent = data
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
