import api from "./api";

export interface FooterLinks {
  whatsapp?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
}

/**
 * Get footer links (Public)
 */
export const getFooterLinks = async () => {
  const response = await api.get("/footer-links");
  return response.data;
};

/**
 * Update footer links (Admin only)
 */
export const updateFooterLinks = async (links: FooterLinks) => {
  const response = await api.post("/admin/footer-links", links);
  return response.data;
};
