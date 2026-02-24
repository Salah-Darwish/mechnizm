import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Order } from "../../types/order";
import { 
  fetchOrders as fetchOrdersApi, 
  fetchOrderDetail as fetchOrderDetailApi,
  cancelOrder as cancelOrderApi,
  fetchAllOrders as fetchAllOrdersApi,
  updateOrderStatus as updateOrderStatusApi,
  type OrderFilters,
  type Pagination,
  type FrontendOrder,
} from "../../services/orderService";

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: OrderFilters;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},
};

// Transform FrontendOrder to Order type for Redux state
const transformToOrder = (frontendOrder: FrontendOrder): Order => ({
  id: frontendOrder.id,
  orderNumber: frontendOrder.orderNumber,
  items: frontendOrder.items.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    totalPrice: item.totalPrice,
    image: item.image,
    isResale: item.isResale,
    resale: item.resale,
  })),
  total: frontendOrder.subtotal,
  subtotal: frontendOrder.subtotal,
  finalTotal: frontendOrder.totalAmount,
  totalAmount: frontendOrder.totalAmount,
  itemsCount: frontendOrder.itemsCount,
  status: frontendOrder.status,
  type: frontendOrder.type,
  resale: frontendOrder.resale,
  shipping: frontendOrder.shipping,
  notes: frontendOrder.notes,
  createdAt: frontendOrder.createdAt,
  updatedAt: frontendOrder.updatedAt,
});

// Async thunk to fetch user's orders
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (filters: OrderFilters | undefined, { rejectWithValue }) => {
    try {
      const result = await fetchOrdersApi(filters);
      return {
        orders: result.orders.map(transformToOrder),
        pagination: result.pagination,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch orders";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch order details
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId: string | number, { rejectWithValue }) => {
    try {
      const result = await fetchOrderDetailApi(orderId);
      return transformToOrder(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch order details";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to cancel an order
export const cancelUserOrder = createAsyncThunk(
  "orders/cancelUserOrder",
  async (orderId: string | number, { rejectWithValue }) => {
    try {
      const result = await cancelOrderApi(orderId);
      return transformToOrder(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel order";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch all orders (Admin)
export const fetchAllOrdersAdmin = createAsyncThunk(
  "orders/fetchAllOrdersAdmin",
  async (filters: OrderFilters | undefined, { rejectWithValue }) => {
    try {
      const result = await fetchAllOrdersApi(filters);
      return {
        orders: result.orders.map(transformToOrder),
        pagination: result.pagination,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch orders";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to update order status (Admin)
export const updateOrderStatusAdmin = createAsyncThunk(
  "orders/updateOrderStatusAdmin",
  async ({ id, status }: { id: string | number; status: string }, { rejectWithValue }) => {
    try {
      const result = await updateOrderStatusApi(id, status);
      return transformToOrder(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update order status";
      return rejectWithValue(message);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: Order['status'] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
      }
    },
    updateOrder: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Order> }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        Object.assign(order, action.payload.updates);
        order.updatedAt = new Date().toISOString();
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch order details
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        // Update the order in the list if it exists
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel order
    builder
      .addCase(cancelUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(cancelUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch all orders (Admin)
    builder
      .addCase(fetchAllOrdersAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update order status (Admin)
    builder
      .addCase(updateOrderStatusAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatusAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addOrder,
  updateOrderStatus,
  updateOrder,
  clearCurrentOrder,
  setOrders,
  setFilters,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
