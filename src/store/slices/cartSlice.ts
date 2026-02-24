import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { InstallmentTier } from "../../types/product";
import * as cartService from "../../services/cartService";
import type { PaymentOption, ResalePlan } from "../../services/cartService";

// Purchase type: 'wallet' for direct purchase, 'resale' for investment
export type PurchaseType = 'wallet' | 'resale';

export interface CartItem {
  id: number; // product_id for backend
  name: string;
  price: number; // Base price
  quantity: number;
  progress?: number;
  image?: string;
  // Payment and investment options from backend
  paymentOptions?: PaymentOption[];
  resalePlans?: ResalePlan[];
  // Selected purchase type (wallet = direct purchase, resale = investment)
  purchaseType: PurchaseType;
  // Selected resale plan (only used when purchaseType === 'resale')
  selectedResalePlan?: ResalePlan | null;
  // Selected company for delivery
  companyId?: number;
  // Legacy installment options (keeping for backward compatibility)
  allowInstallment?: boolean;
  installmentOptions?: InstallmentTier[];
  selectedInstallment?: InstallmentTier | null;
}

interface CartState {
  items: CartItem[];
  total: number; // Base total without installment fees
  installmentTotal: number; // Total with installment fees
  loading: boolean;
  error: string | null;
  synced: boolean; // Whether cart is synced with backend
}

const initialState: CartState = {
  items: [],
  total: 0,
  installmentTotal: 0,
  loading: false,
  error: null,
  synced: false,
};

// Async thunk to fetch cart from backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
    }
  }
);

// Async thunk to add item to backend cart
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (
    { productId, quantity = 1 }: { productId: number; quantity?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

// Async thunk to update cart quantity on backend
export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async (
    { productId, quantity }: { productId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await cartService.updateCartQuantity(productId, quantity);
      return { productId, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

// Async thunk to increase quantity by 1
export const increaseQuantityAsync = createAsyncThunk(
  "cart/increaseQuantityAsync",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await cartService.increaseCartQuantity(productId);
      return { productId, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to increase quantity");
    }
  }
);

// Async thunk to decrease quantity by 1
export const decreaseQuantityAsync = createAsyncThunk(
  "cart/decreaseQuantityAsync",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await cartService.decreaseCartQuantity(productId);
      return { productId, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to decrease quantity");
    }
  }
);

// Async thunk to remove item from backend cart
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async (productId: number, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(productId);
      return productId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to remove from cart");
    }
  }
);

// Async thunk to clear cart on backend
export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to clear cart");
    }
  }
);

// Async thunk to update cart item options (purchase_type, resale_plan_id, company_id)
export const updateCartOptionsAsync = createAsyncThunk(
  "cart/updateCartOptionsAsync",
  async (
    { productId, options }: { productId: number; options: cartService.UpdateCartOptionsPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await cartService.updateCartOptions(productId, options);
      return { productId, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to update cart options");
    }
  }
);

// Helper to calculate totals
// For wallet purchases: base price * quantity
// For resale purchases: base price * quantity (investment amount - returns later with profit)
const calculateTotals = (items: CartItem[]) => {
  let total = 0;
  let investmentTotal = 0; // Expected return for resale items
  
  items.forEach(item => {
    const baseAmount = item.price * item.quantity;
    total += baseAmount;
    
    if (item.purchaseType === 'resale' && item.selectedResalePlan) {
      // For resale, calculate expected return
      investmentTotal += item.selectedResalePlan.expected_return * item.quantity;
    } else {
      investmentTotal += baseAmount;
    }
  });
  
  return { total, installmentTotal: investmentTotal };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity" | "purchaseType"> & { purchaseType?: PurchaseType }>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ 
          ...action.payload, 
          quantity: 1,
          purchaseType: action.payload.purchaseType || 'wallet',
        });
      }

      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.installmentTotal = totals.installmentTotal;
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.installmentTotal = totals.installmentTotal;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>,
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);

      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }

      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.installmentTotal = totals.installmentTotal;
    },
    // Set installment option for a cart item
    setItemInstallment: (
      state,
      action: PayloadAction<{ id: number; installment: InstallmentTier | null }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.selectedInstallment = action.payload.installment;
      }
      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.installmentTotal = totals.installmentTotal;
    },
    // Set purchase type (wallet = direct purchase, resale = investment)
    setItemPurchaseType: (
      state,
      action: PayloadAction<{ id: number; purchaseType: PurchaseType; resalePlan?: ResalePlan | null }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.purchaseType = action.payload.purchaseType;
        if (action.payload.purchaseType === 'resale') {
          item.selectedResalePlan = action.payload.resalePlan || null;
        } else {
          item.selectedResalePlan = null;
        }
      }
      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.installmentTotal = totals.installmentTotal;
    },
    // Set company for a cart item
    setItemCompany: (
      state,
      action: PayloadAction<{ id: number; companyId: number | undefined }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.companyId = action.payload.companyId;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.installmentTotal = 0;
      state.synced = false;
    },
    // Reset synced status (use when logging out)
    resetSyncStatus: (state) => {
      state.synced = false;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.synced = true;
        // Transform backend items to frontend CartItem format
        state.items = action.payload.cart_items.map((item) => ({
          id: item.product_id,
          name: item.title || "",
          price: item.price || 0,
          quantity: item.quantity,
          image: item.main_image_base64 || undefined,
          paymentOptions: item.payment_options || [],
          resalePlans: item.resale_plans || [],
          // Load saved purchase type from backend (default to 'wallet')
          purchaseType: (item.purchase_type as PurchaseType) || 'wallet',
          // Load saved resale plan from backend
          selectedResalePlan: item.selected_resale_plan || null,
          // Store company_id for reference
          companyId: item.company_id || undefined,
        }));
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Add to cart async
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        const existingItem = state.items.find((i) => i.id === item.product_id);
        
        if (existingItem) {
          existingItem.quantity = item.quantity;
          // Update payment and resale options if available
          if (item.payment_options) {
            existingItem.paymentOptions = item.payment_options;
          }
          if (item.resale_plans) {
            existingItem.resalePlans = item.resale_plans;
          }
        } else {
          state.items.push({
            id: item.product_id,
            name: item.title || "",
            price: item.price || 0,
            quantity: item.quantity,
            image: item.main_image_base64 || undefined,
            paymentOptions: item.payment_options || [],
            resalePlans: item.resale_plans || [],
            purchaseType: 'wallet' as PurchaseType,
            selectedResalePlan: null,
          });
        }
        
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update quantity async
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const { productId, data } = action.payload;
        const item = state.items.find((i) => i.id === productId);
        if (item) {
          item.quantity = data.quantity;
        }
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })

    // Increase quantity async
      .addCase(increaseQuantityAsync.fulfilled, (state, action) => {
        const { productId, data } = action.payload;
        const item = state.items.find((i) => i.id === productId);
        if (item) {
          item.quantity = data.quantity;
        }
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })

    // Decrease quantity async
      .addCase(decreaseQuantityAsync.fulfilled, (state, action) => {
        const { productId, data } = action.payload;
        if (!data) {
          // Item was removed (quantity became 0)
          state.items = state.items.filter((i) => i.id !== productId);
        } else {
          const item = state.items.find((i) => i.id === productId);
          if (item) {
            item.quantity = data.quantity;
          }
        }
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })

    // Remove from cart async
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      })

    // Clear cart async
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.installmentTotal = 0;
      })

    // Update cart options async
      .addCase(updateCartOptionsAsync.fulfilled, (state, action) => {
        const { productId, data } = action.payload;
        const item = state.items.find((i) => i.id === productId);
        if (item) {
          item.purchaseType = (data.purchase_type as PurchaseType) || 'wallet';
          item.selectedResalePlan = data.selected_resale_plan || null;
          item.companyId = data.company_id || undefined;
        }
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.installmentTotal = totals.installmentTotal;
      });
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  setItemInstallment,
  setItemPurchaseType,
  setItemCompany,
  clearCart,
  resetSyncStatus,
  setLoading,
  setError,
} = cartSlice.actions;
export default cartSlice.reducer;
