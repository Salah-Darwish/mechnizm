import api from './api';

export interface PrivacySettings {
  id: number;
  hero_image: string | null;
  title_ar: string;
  title_en: string;
  intro_ar: string[];
  intro_en: string[];
  terms_title_ar: string;
  terms_title_en: string;
  terms_content_ar: string;
  terms_content_en: string;
  privacy_title_ar: string;
  privacy_title_en: string;
  privacy_content_ar: string;
  privacy_content_en: string;
  operation_title_ar: string;
  operation_title_en: string;
  operation_content_ar: string;
  operation_content_en: string;
  copyright_title_ar: string;
  copyright_title_en: string;
  copyright_content_ar: string;
  copyright_content_en: string;
  created_at: string;
  updated_at: string;
}

interface PrivacyResponse {
  success: boolean;
  data: {
    privacy: PrivacySettings;
  };
  message?: string;
}

/**
 * Get privacy page settings (Public)
 */
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  const response = await api.get<PrivacyResponse>('/privacy');
  return response.data.data.privacy;
};

/**
 * Update privacy page settings (Admin only)
 */
export const updatePrivacySettings = async (
  data: Partial<Omit<PrivacySettings, 'id' | 'created_at' | 'updated_at' | 'hero_image'>> & {
    hero_image?: File;
  }
): Promise<PrivacySettings> => {
  const formData = new FormData();

  // Add all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'hero_image' && value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle arrays (intro_ar, intro_en)
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    }
  });

  const response = await api.post<PrivacyResponse>('/privacy', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.privacy;
};

/**
 * Remove hero image (Admin only)
 */
export const removePrivacyHeroImage = async (): Promise<PrivacySettings> => {
  const response = await api.delete<PrivacyResponse>('/privacy/image');
  return response.data.data.privacy;
};

export default {
  getPrivacySettings,
  updatePrivacySettings,
  removePrivacyHeroImage,
};
