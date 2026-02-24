import type { PaymentType, InstallmentTier } from './product';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number; // Base cash price
  totalPrice: number;
  image?: string | null;
  merchantId?: string;
  // Resale/Investment info
  isResale?: boolean;
  resale?: {
    planId: number;
    months: number;
    profitPercentage: number;
    expectedReturn: number;
    profitAmount: number;
  };
}

// Installment payment details (legacy support)
export interface InstallmentDetails {
  tier: InstallmentTier;
  totalAmount: number; // Price with installment fee
  monthlyPayment: number;
  monthsPaid: number;
  nextPaymentDate: string;
  remainingPayments: number;
  profit: number; // Merchant's profit from installment
}

// Resale/Investment details
export interface ResaleDetails {
  returnDate: string | null;
  expectedReturn: number;
  profitAmount: number;
  returned: boolean;
  returnedAt: string | null;
  daysRemaining: number;
}

// Order type: sale = direct purchase, resale = investment
export type OrderType = 'sale' | 'resale' | 'mixed';

// Order status (simplified):
// - pending: awaiting confirmation
// - confirmed: final status for wallet/sale orders
// - invested: status for resale/investment orders
// - cancelled: order cancelled
// Legacy statuses kept for backwards compatibility
export type OrderStatus = 
  | 'pending' 
  | 'confirmed'
  | 'invested'
  | 'cancelled'
  // Legacy statuses (kept for backwards compatibility)
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'completed';

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discountAmount?: number;
  finalTotal: number; // Cash total or installment total
  totalAmount?: number;
  itemsCount?: number;
  status: OrderStatus;
  type?: OrderType; // Order type: sale, resale, or mixed
  paymentType?: PaymentType; // 'cash' | 'installment' (legacy)
  
  // Installment-specific fields (legacy)
  installmentDetails?: InstallmentDetails;
  
  // Resale/Investment-specific fields
  resale?: ResaleDetails;
  
  // Shipping info
  shipping?: {
    name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
  };
  
  // Merchant info
  merchantId?: string;
  
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deliveryLink?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerNotes?: string;
  merchantNotes?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
  monthlyGrowth: number;
}

export interface PartnershipRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  partnershipType: 'distribution' | 'reseller' | 'collaboration' | 'other';
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SeasonalProduct {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  discountPrice?: number;
  launchDate: string;
  endDate: string;
  available: boolean;
}

export interface DeferredSaleRequest {
  id: string;
  productId: number;
  productName: string;
  requestedPrice: number;
  originalPrice: number;
  profit: number;
  profitPercentage: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  merchantNotes?: string;
}
