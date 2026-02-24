import api from './api';

export interface HeroSetting {
  id: number;
  title: string;
  title_ar: string;
  description1: string | null;
  description1_ar: string | null;
  description2: string | null;
  description2_ar: string | null;
  image: string | null;
  service_image: string | null;
  products_cover_image: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HeroResponse {
  success: boolean;
  data: {
    hero: HeroSetting | null;
  };
  message?: string;
}

export interface CreateHeroData {
  title: string;
  title_ar: string;
  description1?: string;
  description1_ar?: string;
  description2?: string;
  description2_ar?: string;
  is_active?: boolean;
}

export interface UpdateHeroData {
  title?: string;
  title_ar?: string;
  description1?: string;
  description1_ar?: string;
  description2?: string;
  description2_ar?: string;
  is_active?: boolean;
}

// Get active hero setting (Public - for hero display)
export const getActiveHero = async (): Promise<HeroResponse> => {
  const response = await api.get<HeroResponse>('/hero');
  return response.data;
};

// Get hero setting (Admin)
export const getAdminHero = async (): Promise<HeroResponse> => {
  const response = await api.get<HeroResponse>('/admin/hero');
  return response.data;
};

// Create or update hero setting (Admin) - with image files or base64 strings
export const saveHero = async (
  data: CreateHeroData,
  imageFile?: File | string,
  serviceImageFile?: File | string,
  productsCoverImageFile?: File | string
): Promise<HeroResponse> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('title_ar', data.title_ar);
  if (data.description1) formData.append('description1', data.description1);
  if (data.description1_ar) formData.append('description1_ar', data.description1_ar);
  if (data.description2) formData.append('description2', data.description2);
  if (data.description2_ar) formData.append('description2_ar', data.description2_ar);
  if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  if (serviceImageFile) {
    formData.append('service_image', serviceImageFile);
  }

  if (productsCoverImageFile) {
    formData.append('products_cover_image', productsCoverImageFile);
  }

  const response = await api.post<HeroResponse>('/admin/hero', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update products cover image only (Admin)
export const saveProductsCover = async (
  productsCoverImageFile: File | string
): Promise<HeroResponse> => {
  const formData = new FormData();
  formData.append('products_cover_image', productsCoverImageFile);

  const response = await api.post<HeroResponse>('/admin/hero/products-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update hero setting (Admin) - with optional image file
export const updateHero = async (id: number, data: UpdateHeroData, imageFile?: File): Promise<HeroResponse> => {
  const formData = new FormData();
  formData.append('_method', 'PUT'); // Laravel method spoofing for FormData
  if (data.title) formData.append('title', data.title);
  if (data.title_ar) formData.append('title_ar', data.title_ar);
  if (data.description1 !== undefined) formData.append('description1', data.description1 || '');
  if (data.description1_ar !== undefined) formData.append('description1_ar', data.description1_ar || '');
  if (data.description2 !== undefined) formData.append('description2', data.description2 || '');
  if (data.description2_ar !== undefined) formData.append('description2_ar', data.description2_ar || '');
  if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post<HeroResponse>(`/admin/hero/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Toggle hero setting status (Admin)
export const toggleHero = async (id: number): Promise<HeroResponse> => {
  const response = await api.post<HeroResponse>(`/admin/hero/${id}/toggle`);
  return response.data;
};
