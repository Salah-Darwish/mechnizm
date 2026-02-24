import api from './api';

export interface AboutSettings {
  id: number;
  hero_image: string | null;
  title_ar: string;
  title_en: string;
  description1_ar: string;
  description1_en: string;
  description2_ar: string;
  description2_en: string;
  mission_title_ar: string;
  mission_title_en: string;
  mission_description_ar: string;
  mission_description_en: string;
  values_title_ar: string;
  values_title_en: string;
  values_description_ar: string;
  values_description_en: string;
  vision_title_ar: string;
  vision_title_en: string;
  vision_description_ar: string;
  vision_description_en: string;
  created_at: string;
  updated_at: string;
}

interface AboutResponse {
  success: boolean;
  data: {
    about: AboutSettings;
  };
  message?: string;
}

/**
 * Get about page settings (Public)
 */
export const getAboutSettings = async (): Promise<AboutSettings> => {
  const response = await api.get<AboutResponse>('/about');
  return response.data.data.about;
};

/**
 * Update about page settings (Admin only)
 */
export const updateAboutSettings = async (
  data: Partial<Omit<AboutSettings, 'id' | 'created_at' | 'updated_at' | 'hero_image'>> & {
    hero_image?: File;
  }
): Promise<AboutSettings> => {
  const formData = new FormData();

  // Add all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'hero_image' && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    }
  });

  const response = await api.post<AboutResponse>('/about', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.about;
};

/**
 * Remove hero image (Admin only)
 */
export const removeAboutHeroImage = async (): Promise<AboutSettings> => {
  const response = await api.delete<AboutResponse>('/about/image');
  return response.data.data.about;
};

export default {
  getAboutSettings,
  updateAboutSettings,
  removeAboutHeroImage,
};
