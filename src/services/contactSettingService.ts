import api from "./api";

export interface ContactSettings {
  id: number;
  title_ar: string;
  title_en: string;
  description1_ar: string | null;
  description1_en: string | null;
  description2_ar: string | null;
  description2_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateContactSettingsData {
  title_ar?: string;
  title_en?: string;
  description1_ar?: string;
  description1_en?: string;
  description2_ar?: string;
  description2_en?: string;
}

// Get contact page settings (public)
export const getContactSettings = async (): Promise<ContactSettings> => {
  const response = await api.get("/contact-settings");
  return response.data.data;
};

// Update contact page settings (admin only)
export const updateContactSettings = async (
  data: UpdateContactSettingsData
): Promise<ContactSettings> => {
  const response = await api.post("/contact-settings", data);
  return response.data.data;
};
