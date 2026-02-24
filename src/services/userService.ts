import api from './api';

export interface UserMobile {
  id: number;
  mobile: string;
  is_primary: boolean;
  is_verified: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  city?: string;
  national_id?: string;
  bank_iban?: string;
  bank_name?: string;
  email_verified_at?: string;
  mobiles?: UserMobile[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'USER' | 'ADMIN';
  city?: string;
  national_id?: string;
  bank_iban?: string;
  bank_name?: string;
  primary_mobile?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: 'USER' | 'ADMIN';
  city?: string;
  national_id?: string;
  bank_iban?: string;
  bank_name?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

// Get all users (admin)
export const getUsers = async (params?: {
  role?: string;
  search?: string;
  per_page?: number;
  page?: number;
}): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>('/admin/users', { params });
  return response.data;
};

// Get single user (admin)
export const getUser = async (id: number): Promise<UserResponse> => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

// Create user (admin)
export const createUser = async (data: CreateUserData): Promise<UserResponse> => {
  const response = await api.post('/admin/users', data);
  return response.data;
};

// Update user (admin)
export const updateUser = async (id: number, data: UpdateUserData): Promise<UserResponse> => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

// Delete user (admin)
export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Get current user profile
export const getMyProfile = async (): Promise<UserResponse> => {
  const response = await api.get('/me/profile');
  return response.data;
};

// Update current user profile
export const updateMyProfile = async (data: UpdateUserData): Promise<UserResponse> => {
  const response = await api.put('/me/profile', data);
  return response.data;
};
