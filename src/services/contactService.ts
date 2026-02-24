import api from './api';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageData {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data: ContactMessage;
}

export interface ContactMessagesListResponse {
  success: boolean;
  data: {
    data: ContactMessage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

/**
 * Submit a contact message (public endpoint)
 */
export const submitContactMessage = async (data: ContactMessageData): Promise<ContactMessageResponse> => {
  const response = await api.post('/contact', data);
  return response.data;
};

/**
 * Get all contact messages (admin only)
 */
export const getContactMessages = async (params?: {
  page?: number;
  per_page?: number;
  is_read?: boolean;
}): Promise<ContactMessagesListResponse> => {
  const response = await api.get('/admin/contact-messages', { params });
  return response.data;
};

/**
 * Get a single contact message (admin only)
 */
export const getContactMessage = async (id: number): Promise<ContactMessageResponse> => {
  const response = await api.get(`/admin/contact-messages/${id}`);
  return response.data;
};

/**
 * Mark a message as read (admin only)
 */
export const markMessageAsRead = async (id: number): Promise<ContactMessageResponse> => {
  const response = await api.patch(`/admin/contact-messages/${id}/mark-read`);
  return response.data;
};

/**
 * Mark a message as unread (admin only)
 */
export const markMessageAsUnread = async (id: number): Promise<ContactMessageResponse> => {
  const response = await api.patch(`/admin/contact-messages/${id}/mark-unread`);
  return response.data;
};

/**
 * Delete a contact message (admin only)
 */
export const deleteContactMessage = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/contact-messages/${id}`);
  return response.data;
};

/**
 * Get unread messages count (admin only)
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get('/admin/contact-messages/unread-count');
  return response.data;
};
