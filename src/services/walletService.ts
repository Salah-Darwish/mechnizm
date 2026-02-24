import api from './api';

export interface WalletBalance {
  balance: string | number;
}

export interface WalletResponse {
  success: boolean;
  data: {
    balance: string | number;
  };
  message?: string;
}

// Get wallet balance only
export const getWalletBalance = async (): Promise<WalletResponse> => {
  const response = await api.get('/wallet/balance');
  return response.data;
};
