import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  city: string;
  national_id: string;
  national_id_type?: string;
  bank_iban: string;
  bank_name: string;
  primary_mobile: string;
  secondary_mobiles?: Array<{ mobile: string; label?: string }>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      city?: string;
      national_id?: string;
      national_id_type?: string;
      bank_iban?: string;
      bank_name?: string;
      mobiles?: Array<{ mobile: string; label: string; is_primary: boolean }>;
    };
    token: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/login', credentials);
  return response.data;
};

// Register user
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/register', data);
  return response.data;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  await api.post('/logout');
  localStorage.removeItem('auth_token');
};

// Get current user
export const getCurrentUser = async (): Promise<AuthResponse['data']['user']> => {
  const response = await api.get<{ success: boolean; data: AuthResponse['data']['user'] }>('/me');
  return response.data.data;
};

// Store token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Verify email
export const verifyEmail = async (token: string, email: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/verify-email', { token, email });
  return response.data;
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/resend-verification', { email });
  return response.data;
};
