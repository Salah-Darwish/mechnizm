import api from './api';

// Payout summary from backend
export interface PayoutSummary {
  pending_count: number;
  pending_total_return: number;
  pending_total_profit: number;
  paid_count: number;
  paid_total_return: number;
  active_count: number;
  active_total_invested: number;
}

// Individual payout item
export interface PayoutItem {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number | null;
    title: string | null;
    title_ar: string | null;
  } | null;
  order_number: string | null;
  invested_amount: number;
  expected_return: number;
  profit_amount: number;
  profit_percentage: number;
  plan_months: number;
  plan_label?: string;
  investment_date: string;
  maturity_date: string;
  days_since_matured?: number;
  paid_out_at?: string;
  paid_by?: {
    id: number;
    name: string;
  } | null;
  status: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PendingPayoutsResponse {
  success: boolean;
  data: {
    payouts: PayoutItem[];
    pagination: Pagination;
    summary: {
      total_pending: number;
      total_amount_to_pay: number;
    };
  };
}

export interface PaidHistoryResponse {
  success: boolean;
  data: {
    payouts: PayoutItem[];
    pagination: Pagination;
  };
}

export interface SummaryResponse {
  success: boolean;
  data: PayoutSummary;
}

export interface MarkAsPaidResponse {
  success: boolean;
  message: string;
  data: {
    investment: {
      id: number;
      status: string;
      paid_out_at: string;
      paid_by: {
        id: number;
        name: string;
      };
    };
  };
}

// Investment payout service functions
export const investmentPayoutService = {
  // Get pending payouts (matured investments ready for payout)
  getPendingPayouts: async (page: number = 1, perPage: number = 15): Promise<PendingPayoutsResponse> => {
    const response = await api.get<PendingPayoutsResponse>(
      `/admin/investment-payouts?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  // Get payout summary statistics
  getSummary: async (): Promise<SummaryResponse> => {
    const response = await api.get<SummaryResponse>('/admin/investment-payouts/summary');
    return response.data;
  },

  // Get paid payouts history
  getPaidHistory: async (page: number = 1, perPage: number = 15): Promise<PaidHistoryResponse> => {
    const response = await api.get<PaidHistoryResponse>(
      `/admin/investment-payouts/history?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  // Mark an investment as paid
  markAsPaid: async (investmentId: number): Promise<MarkAsPaidResponse> => {
    const response = await api.post<MarkAsPaidResponse>(
      `/admin/investment-payouts/${investmentId}/mark-paid`
    );
    return response.data;
  },
};

export default investmentPayoutService;
