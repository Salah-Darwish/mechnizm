import api from './api';

// ==================== Interfaces ====================

export interface FaqQuestion {
  id: number;
  faq_id: number;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: number;
  image: string | null;
  order: number;
  is_active: boolean;
  questions: FaqQuestion[];
  created_at: string;
  updated_at: string;
}

export type { Faq as FaqType };

export interface CreateQuestionData {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  order?: number;
  is_active?: boolean;
}

export interface CreateFaqData {
  image?: File;
  order?: number;
  is_active?: boolean;
  questions: CreateQuestionData[];
}

export interface UpdateFaqData {
  image?: File;
  order?: number;
  is_active?: boolean;
}

export interface UpdateQuestionData {
  question_ar?: string;
  question_en?: string;
  answer_ar?: string;
  answer_en?: string;
  order?: number;
  is_active?: boolean;
}

// ==================== FAQ API Functions ====================

/**
 * Get all active FAQs with questions (Public endpoint)
 */
export const getActiveFaqs = async (): Promise<Faq[]> => {
  const response = await api.get('/faqs');
  return response.data.data.faqs;
};

/**
 * Get all FAQs including inactive (Admin only)
 */
export const getAllFaqs = async (): Promise<Faq[]> => {
  const response = await api.get('/admin/faqs');
  return response.data.data.faqs;
};

/**
 * Create a new FAQ with questions (Admin only)
 */
export const createFaq = async (data: CreateFaqData): Promise<Faq> => {
  const formData = new FormData();
  
  if (data.image) {
    formData.append('image', data.image);
  }
  
  if (data.order !== undefined) {
    formData.append('order', data.order.toString());
  }
  
  if (data.is_active !== undefined) {
    formData.append('is_active', data.is_active ? '1' : '0');
  }

  // Add questions array
  data.questions.forEach((q, index) => {
    formData.append(`questions[${index}][question_ar]`, q.question_ar);
    formData.append(`questions[${index}][question_en]`, q.question_en);
    formData.append(`questions[${index}][answer_ar]`, q.answer_ar);
    formData.append(`questions[${index}][answer_en]`, q.answer_en);
    if (q.order !== undefined) {
      formData.append(`questions[${index}][order]`, q.order.toString());
    }
    if (q.is_active !== undefined) {
      formData.append(`questions[${index}][is_active]`, q.is_active ? '1' : '0');
    }
  });

  const response = await api.post('/admin/faqs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data.faq;
};

/**
 * Update an existing FAQ (image, order, is_active) - Admin only
 */
export const updateFaq = async (id: number, data: UpdateFaqData): Promise<Faq> => {
  const formData = new FormData();
  
  if (data.image) {
    formData.append('image', data.image);
  }
  
  if (data.order !== undefined) {
    formData.append('order', data.order.toString());
  }
  
  if (data.is_active !== undefined) {
    formData.append('is_active', data.is_active ? '1' : '0');
  }

  formData.append('_method', 'PUT');

  const response = await api.post(`/admin/faqs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data.faq;
};

/**
 * Delete a FAQ and all its questions (Admin only)
 */
export const deleteFaq = async (id: number): Promise<void> => {
  await api.delete(`/admin/faqs/${id}`);
};

/**
 * Reorder FAQs (Admin only)
 */
export const reorderFaqs = async (faqs: Array<{ id: number; order: number }>): Promise<void> => {
  await api.post('/admin/faqs/reorder', { faqs });
};

// ==================== FAQ Question API Functions ====================

/**
 * Add a question to an existing FAQ (Admin only)
 */
export const addQuestion = async (faqId: number, data: CreateQuestionData): Promise<FaqQuestion> => {
  const response = await api.post(`/admin/faqs/${faqId}/questions`, data);
  return response.data.data.question;
};

/**
 * Update a FAQ question (Admin only)
 */
export const updateQuestion = async (questionId: number, data: UpdateQuestionData): Promise<FaqQuestion> => {
  const response = await api.put(`/admin/faq-questions/${questionId}`, data);
  return response.data.data.question;
};

/**
 * Delete a FAQ question (Admin only)
 */
export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/admin/faq-questions/${questionId}`);
};

/**
 * Reorder questions within a FAQ (Admin only)
 */
export const reorderQuestions = async (faqId: number, questions: Array<{ id: number; order: number }>): Promise<void> => {
  await api.post(`/admin/faqs/${faqId}/questions/reorder`, { questions });
};
