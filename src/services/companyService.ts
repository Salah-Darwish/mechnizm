import api from './api';

// ==================== Types ====================

export interface Company {
  id: number;
  name: string;
  logo: string | null;
  logo_mime_type: string | null;
  activity: string | null;
  store_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  logo?: File;
  activity?: string;
  store_url?: string;
  is_active?: boolean;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: number;
}

export interface CompaniesResponse {
  status: string;
  message: string;
  data: {
    companies: Company[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ==================== API Calls ====================

/**
 * Get all companies (Admin only)
 */
export const getAdminCompanies = async (params?: {
  active?: boolean;
  per_page?: number;
  page?: number;
}): Promise<CompaniesResponse> => {
  const response = await api.get<CompaniesResponse>('/admin/companies', { params });
  return response.data;
};

/**
 * Get active companies (Public - for resale checkout)
 */
export const getActiveCompanies = async (): Promise<CompaniesResponse> => {
  const response = await api.get<CompaniesResponse>('/companies');
  return response.data;
};

/**
 * Get single company (Admin only)
 */
export const getCompany = async (id: number): Promise<{ success: boolean; data: Company }> => {
  const response = await api.get(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Create company (Admin only)
 */
export const createCompany = async (data: CreateCompanyData): Promise<{ success: boolean; data: Company; message: string }> => {
  const formData = new FormData();
  
  formData.append('name', data.name);
  if (data.activity) formData.append('activity', data.activity);
  if (data.store_url) formData.append('store_url', data.store_url);
  formData.append('is_active', (data.is_active ?? true) ? '1' : '0');
  
  // Logo image
  if (data.logo) {
    formData.append('logo', data.logo);
  }

  const response = await api.post('/admin/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Update company (Admin only)
 */
export const updateCompany = async (data: UpdateCompanyData): Promise<{ success: boolean; data: Company; message: string }> => {
  const { id, ...updateData } = data;
  const formData = new FormData();
  
  // Use POST with _method for proper file upload handling in Laravel
  formData.append('_method', 'PUT');
  
  if (updateData.name) formData.append('name', updateData.name);
  if (updateData.activity !== undefined) formData.append('activity', updateData.activity || '');
  if (updateData.store_url !== undefined) formData.append('store_url', updateData.store_url || '');
  if (updateData.is_active !== undefined) formData.append('is_active', updateData.is_active ? '1' : '0');
  
  // Logo image (optional for update)
  if (updateData.logo) {
    formData.append('logo', updateData.logo);
  }

  // Use POST instead of PUT for proper multipart/form-data handling
  const response = await api.post(`/admin/companies/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Delete company (Admin only)
 */
export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/admin/companies/${id}`);
};

/**
 * Get company logo URL
 */
export const getCompanyLogoUrl = (companyId: number): string => {
  return `${api.defaults.baseURL}/companies/${companyId}/logo`;
};

/**
 * Convert logo blob to base64 for display
 */
export const getCompanyLogoBase64 = (logo: string | null, mimeType: string | null): string | null => {
  if (!logo || !mimeType) return null;
  return `data:${mimeType};base64,${logo}`;
};
