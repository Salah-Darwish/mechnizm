import api from './api';

export interface PaymentOption {
  id?: number;
  type: 'cash' | 'installment' | 'wallet';
  label?: string;
  is_active?: boolean;
}

export interface ResalePlan {
  id?: number;
  months: number;
  profit_percentage: number;
  label?: string;
  is_active?: boolean;
}

export interface CreateProductData {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  type: string;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
  main_image?: File;
  payment_options?: PaymentOption[];
  resale_plans?: ResalePlan[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

export interface Product {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  type: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
  is_active: boolean;
  main_image_url?: string;
  images?: Array<{
    id: number;
    url: string;
    sort_order: number;
  }>;
  payment_options?: PaymentOption[];
  resale_plans?: ResalePlan[];
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  message: string;
}

// Get all products (admin)
export const getAdminProducts = async (params?: {
  type?: string;
  in_stock?: boolean;
  is_active?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>('/admin/products', { params });
  return response.data;
};

// Get single product (admin)
export const getAdminProduct = async (id: number): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

// Create product (admin)
export const createProduct = async (data: CreateProductData): Promise<{ success: boolean; data: Product; message: string }> => {
  const formData = new FormData();

  formData.append('title_ar', data.title_ar);
  formData.append('title_en', data.title_en);
  if (data.description_ar) formData.append('description_ar', data.description_ar);
  if (data.description_en) formData.append('description_en', data.description_en);
  formData.append('type', data.type);
  formData.append('price', data.price.toString());
  formData.append('stock_quantity', data.stock_quantity.toString());
  formData.append('is_active', (data.is_active ?? true) ? '1' : '0');

  // Main image is REQUIRED for create
  if (data.main_image) {
    formData.append('main_image', data.main_image);
  }

  // Payment options - send as proper Laravel array notation
  if (data.payment_options && data.payment_options.length > 0) {
    data.payment_options.forEach((option, index) => {
      formData.append(`payment_options[${index}][type]`, option.type);
      if (option.label) formData.append(`payment_options[${index}][label]`, option.label);
      formData.append(`payment_options[${index}][is_active]`, (option.is_active !== false) ? '1' : '0');
    });
  }

  // Resale plans - send as proper Laravel array notation
  if (data.resale_plans && data.resale_plans.length > 0) {
    data.resale_plans.forEach((plan, index) => {
      formData.append(`resale_plans[${index}][months]`, plan.months.toString());
      formData.append(`resale_plans[${index}][profit_percentage]`, plan.profit_percentage.toString());
      if (plan.label) formData.append(`resale_plans[${index}][label]`, plan.label);
      formData.append(`resale_plans[${index}][is_active]`, (plan.is_active !== false) ? '1' : '0');
    });
  }

  const response = await api.post('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Update product (admin)
export const updateProduct = async (data: UpdateProductData): Promise<{ success: boolean; data: Product; message: string }> => {
  const { id, ...updateData } = data;
  const formData = new FormData();

  // Use POST with _method for proper file upload handling in Laravel
  formData.append('_method', 'PUT');

  if (updateData.title_ar) formData.append('title_ar', updateData.title_ar);
  if (updateData.title_en) formData.append('title_en', updateData.title_en);
  if (updateData.description_ar !== undefined) formData.append('description_ar', updateData.description_ar || '');
  if (updateData.description_en !== undefined) formData.append('description_en', updateData.description_en || '');
  if (updateData.type) formData.append('type', updateData.type);
  if (updateData.price !== undefined) formData.append('price', updateData.price.toString());
  if (updateData.stock_quantity !== undefined) formData.append('stock_quantity', updateData.stock_quantity.toString());
  if (updateData.is_active !== undefined) formData.append('is_active', updateData.is_active ? '1' : '0');

  // Main image is OPTIONAL for update
  if (updateData.main_image) {
    formData.append('main_image', updateData.main_image);
  }

  // Payment options - send as proper Laravel array notation
  if (updateData.payment_options) {
    if (updateData.payment_options.length === 0) {
      // Send empty array indicator to clear all options
      formData.append('payment_options', '');
    } else {
      updateData.payment_options.forEach((option, index) => {
        if (option.id) formData.append(`payment_options[${index}][id]`, option.id.toString());
        formData.append(`payment_options[${index}][type]`, option.type);
        if (option.label) formData.append(`payment_options[${index}][label]`, option.label);
        formData.append(`payment_options[${index}][is_active]`, (option.is_active !== false) ? '1' : '0');
      });
    }
  }

  // Resale plans - send as proper Laravel array notation  
  if (updateData.resale_plans) {
    if (updateData.resale_plans.length === 0) {
      // Send empty array indicator to clear all plans
      formData.append('resale_plans', '');
    } else {
      updateData.resale_plans.forEach((plan, index) => {
        if (plan.id) formData.append(`resale_plans[${index}][id]`, plan.id.toString());
        formData.append(`resale_plans[${index}][months]`, plan.months.toString());
        formData.append(`resale_plans[${index}][profit_percentage]`, plan.profit_percentage.toString());
        if (plan.label) formData.append(`resale_plans[${index}][label]`, plan.label);
        formData.append(`resale_plans[${index}][is_active]`, (plan.is_active !== false) ? '1' : '0');
      });
    }
  }

  // Use POST instead of PUT for proper multipart/form-data handling
  const response = await api.post(`/admin/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Delete product (admin)
export const deleteProduct = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

// Image response interface
export interface ProductImageResponse {
  id: number;
  url: string;
  sort_order: number;
}

// Add images to product (admin)
export const addProductImages = async (productId: number, images: File[]): Promise<{ success: boolean; data: { images: ProductImageResponse[] }; message: string }> => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append('images[]', image);
  });

  const response = await api.post(`/admin/products/${productId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Delete product image (admin)
export const deleteProductImage = async (productId: number, imageId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/products/${productId}/images/${imageId}`);
  return response.data;
};

// Get product types
export const getProductTypes = async (): Promise<{ success: boolean; data: { types: string[] } }> => {
  const response = await api.get('/products/types');
  return response.data;
};

// Base64 image response interface
export interface Base64ImageResponse {
  success: boolean;
  data: {
    images: Array<{
      id: number | string;
      base64: string;
      mime_type: string;
      is_main: boolean;
    }>;
    total_images: number;
    product_id: number;
  };
}

// Get product images as Base64
export const getProductImagesBase64 = async (productId: number): Promise<Base64ImageResponse> => {
  const response = await api.get(`/products/${productId}/images/base64`);
  return response.data;
};

// =============================================================================
// PUBLIC API ENDPOINTS (No authentication required)
// =============================================================================

// Public product interface (frontend-compatible format from API)
export interface PublicProduct {
  id: number;
  // Bilingual fields
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  // Category & pricing
  category: string;
  price: number;
  // Stock
  stock: number;
  max_stock: number;
  in_stock: boolean;
  // Stock visualization helpers
  stock_percentage: number;
  stock_status: 'high' | 'medium' | 'low' | 'out';
  // Status
  isVisible: boolean;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  // Featured & order
  isFeatured: boolean;
  displayOrder: number;
  // Images
  image?: string | null;
  main_image_base64?: string;
  images?: Array<{
    id: number;
    url: string;
    base64?: string;
    sort_order: number;
  }>;
  // Installment options
  allowInstallment: boolean;
  installmentOptions: Array<{
    months: number;
    percentage: number;
  }>;
  payment_options?: PaymentOption[];
  // Favorites
  is_favorited?: boolean;
  favorites_count?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PublicProductsResponse {
  success: boolean;
  data: PublicProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  message?: string;
}

export interface PublicProductDetailResponse {
  success: boolean;
  data: PublicProduct;
  message?: string;
}

// Get all public products (no auth required)
export const getPublicProducts = async (params?: {
  type?: string;
  category?: string;
  search?: string;
  per_page?: number;
  page?: number;
  sort?: 'price-low' | 'price-high' | 'newest' | 'featured';
}): Promise<PublicProductsResponse> => {
  const response = await api.get<PublicProductsResponse>('/products', { params });
  return response.data;
};

// Get single public product details (no auth required)
export const getPublicProduct = async (id: number): Promise<PublicProductDetailResponse> => {
  const response = await api.get<PublicProductDetailResponse>(`/products/${id}`);
  return response.data;
};

// Featured products response interface
export interface FeaturedProductsResponse {
  success: boolean;
  data: PublicProduct[];
  count: number;
}

// Get featured products for homepage (exactly 3 products - fast endpoint)
export const getFeaturedProducts = async (): Promise<FeaturedProductsResponse> => {
  const response = await api.get<FeaturedProductsResponse>('/products/featured');
  return response.data;
};

// =============================================================================
// FAVORITES API ENDPOINTS (Requires authentication)
// =============================================================================

export interface ToggleFavoriteResponse {
  success: boolean;
  data: {
    product_id: number;
    is_favorited: boolean;
  };
  message: string;
}

// Toggle product favorite status (requires authentication)
export const toggleProductFavorite = async (productId: number): Promise<ToggleFavoriteResponse> => {
  const response = await api.post<ToggleFavoriteResponse>(`/products/${productId}/favorite`);
  return response.data;
};
