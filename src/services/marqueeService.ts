import api from './api';

export interface Marquee {
  id: number;
  text_ar: string;
  text_en: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface MarqueesResponse {
  success: boolean;
  data: {
    marquees: Marquee[];
  };
  message?: string;
}

export interface MarqueeResponse {
  success: boolean;
  data: Marquee;
  message?: string;
}

export interface CreateMarqueeData {
  text_ar: string;
  text_en: string;
  is_active?: boolean;
  order?: number;
}

export interface UpdateMarqueeData {
  text_ar?: string;
  text_en?: string;
  is_active?: boolean;
  order?: number;
}

// Get active marquees (Public - for banner display)
export const getActiveMarquees = async (): Promise<MarqueesResponse> => {
  const response = await api.get<MarqueesResponse>('/marquees');
  return response.data;
};

// Get all marquees (Admin)
export const getAdminMarquees = async (): Promise<MarqueesResponse> => {
  const response = await api.get<MarqueesResponse>('/admin/marquees');
  return response.data;
};

// Create marquee (Admin)
export const createMarquee = async (data: CreateMarqueeData): Promise<MarqueeResponse> => {
  const response = await api.post<MarqueeResponse>('/admin/marquees', data);
  return response.data;
};

// Update marquee (Admin)
export const updateMarquee = async (id: number, data: UpdateMarqueeData): Promise<MarqueeResponse> => {
  const response = await api.put<MarqueeResponse>(`/admin/marquees/${id}`, data);
  return response.data;
};

// Toggle marquee status (Admin)
export const toggleMarquee = async (id: number): Promise<MarqueeResponse> => {
  const response = await api.post<MarqueeResponse>(`/admin/marquees/${id}/toggle`);
  return response.data;
};

// Delete marquee (Admin)
export const deleteMarquee = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/marquees/${id}`);
  return response.data;
};
