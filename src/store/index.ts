import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import sliderReducer from "./slices/sliderSlice";
import marqueeReducer from "./slices/marqueeSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    orders: ordersReducer,
    products: productsReducer,
    sliders: sliderReducer,
    marquee: marqueeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
