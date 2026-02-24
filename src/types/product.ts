// Installment pricing tier
export interface InstallmentTier {
  months: number;
  percentage: number; // Extra percentage to add to the base price
}

// Product approval status
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Payment type for orders
export type PaymentType = 'cash' | 'installment' | 'credit';

export interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // Base price (cash price)
  image?: string | null;
  category: string;
  stock: number;
  userId?: string; // Owner of the product (merchant ID)
  
  // Installment options set by merchant
  installmentOptions: InstallmentTier[];
  allowInstallment: boolean; // Whether installment is available for this product
  
  // Admin controls
  approvalStatus: ApprovalStatus;
  isVisible: boolean; // Admin can hide products from users
  isFeatured: boolean; // Admin can feature products
  displayOrder: number; // Admin controls display order
  
  // Rejection reason (if rejected by admin)
  rejectionReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Calculate installment price
export const calculateInstallmentPrice = (
  basePrice: number, 
  tier: InstallmentTier
): number => {
  return basePrice * (1 + tier.percentage / 100);
};

// Calculate monthly payment
export const calculateMonthlyPayment = (
  basePrice: number, 
  tier: InstallmentTier
): number => {
  const totalPrice = calculateInstallmentPrice(basePrice, tier);
  return totalPrice / tier.months;
};
