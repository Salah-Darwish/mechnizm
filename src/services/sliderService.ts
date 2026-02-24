import api from './api';

export interface Slider {
  id: number;
  title: string;
  title_ar: string;
  description: string | null;
  description_ar: string | null;
  image: string | null;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface SlidersResponse {
  success: boolean;
  data: {
    sliders: Slider[];
  };
  message?: string;
}

export interface SliderResponse {
  success: boolean;
  data: Slider;
  message?: string;
}

export interface CreateSliderData {
  title: string;
  title_ar: string;
  description?: string;
  description_ar?: string;
  is_active?: boolean;
  order?: number;
}

export interface UpdateSliderData {
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  is_active?: boolean;
  order?: number;
}

// Get active sliders (Public - for hero display)
export const getActiveSliders = async (): Promise<SlidersResponse> => {
  const response = await api.get<SlidersResponse>('/sliders');
  return response.data;
};

// Get all sliders (Admin)
export const getAdminSliders = async (): Promise<SlidersResponse> => {
  const response = await api.get<SlidersResponse>('/admin/sliders');
  return response.data;
};

// Create slider (Admin) - with image file
export const createSlider = async (data: CreateSliderData, imageFile?: File): Promise<SliderResponse> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('title_ar', data.title_ar);
  if (data.description) formData.append('description', data.description);
  if (data.description_ar) formData.append('description_ar', data.description_ar);
  if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
  if (data.order !== undefined) formData.append('order', data.order.toString());
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post<SliderResponse>('/admin/sliders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update slider (Admin) - with optional image file
export const updateSlider = async (id: number, data: UpdateSliderData, imageFile?: File): Promise<SliderResponse> => {
  const formData = new FormData();
  formData.append('_method', 'PUT'); // Laravel method spoofing for FormData
  if (data.title) formData.append('title', data.title);
  if (data.title_ar) formData.append('title_ar', data.title_ar);
  if (data.description !== undefined) formData.append('description', data.description || '');
  if (data.description_ar !== undefined) formData.append('description_ar', data.description_ar || '');
  if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
  if (data.order !== undefined) formData.append('order', data.order.toString());
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post<SliderResponse>(`/admin/sliders/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Toggle slider status (Admin)
export const toggleSlider = async (id: number): Promise<SliderResponse> => {
  const response = await api.post<SliderResponse>(`/admin/sliders/${id}/toggle`);
  return response.data;
};

// Reorder sliders (Admin)
export const reorderSliders = async (sliders: { id: number; order: number }[]): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/sliders/reorder', { sliders });
  return response.data;
};

// Delete slider (Admin)
export const deleteSlider = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/sliders/${id}`);
  return response.data;
};
