import api from './api';

// User investment from API
export interface UserInvestment {
  id: number;
  product: {
    id: number;
    title: string;
    title_ar: string;
  };
  order: {
    id: number;
    order_number: string;
  };
  order_item: {
    quantity: number;
    unit_price: number;
  };
  invested_amount: number;
  expected_return: number;
  profit_amount: number;
  profit_percentage: number;
  plan_months: number;
  plan_label: string;
  investment_date: string;
  maturity_date: string;
  status: 'pending' | 'active' | 'matured' | 'paid_out';
  status_display: string;
  paid_out_at: string | null;
  days_until_maturity: number;
  has_matured: boolean;
}

export interface InvestmentSummary {
  active_count: number;
  matured_count: number;
  paid_out_count: number;
  total_invested: number;
  total_expected_return: number;
  total_paid_out: number;
  pending_payout: number;
  total_profit: number;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface GetUserInvestmentsResponse {
  message: string;
  status: string;
  data: {
    investments: UserInvestment[];
    pagination: Pagination;
    summary: InvestmentSummary;
  };
}

/**
 * Get authenticated user's investments
 */
export const getUserInvestments = async (
  page: number = 1,
  perPage: number = 15,
  status?: 'active' | 'matured' | 'paid_out' | 'all'
): Promise<GetUserInvestmentsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (status) {
    params.append('status', status);
  }

  const response = await api.get<GetUserInvestmentsResponse>(
    `/user/investments?${params.toString()}`
  );
  return response.data;
};

export default {
  getUserInvestments,
};
