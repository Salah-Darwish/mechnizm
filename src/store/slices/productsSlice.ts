import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/product";

interface ProductsState {
  products: Product[];
}

const initialState: ProductsState = {
  products: [
    // Sample products
    {
      id: 1,
      name: "Fresh Beef",
      nameAr: "لحم بقري طازج",
      description: "High quality fresh beef",
      descriptionAr: "لحم بقري طازج عالي الجودة",
      price: 120,
      image: "/src/assets/images/test1.png",
      category: "meat",
      stock: 50,
      userId: "merchant1",
      installmentOptions: [
        { months: 3, percentage: 10 },
        { months: 6, percentage: 15 },
        { months: 12, percentage: 20 },
      ],
      allowInstallment: true,
      approvalStatus: "approved",
      isVisible: true,
      isFeatured: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Chicken Breast",
      nameAr: "صدور دجاج",
      description: "Fresh chicken breast",
      descriptionAr: "صدور دجاج طازجة",
      price: 45,
      image: "/src/assets/images/test1.png",
      category: "chicken",
      stock: 100,
      userId: "merchant1",
      installmentOptions: [
        { months: 3, percentage: 10 },
        { months: 6, percentage: 15 },
      ],
      allowInstallment: true,
      approvalStatus: "approved",
      isVisible: true,
      isFeatured: false,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Salmon Fillet",
      nameAr: "فيليه سالمون",
      description: "Fresh salmon fillet",
      descriptionAr: "فيليه سالمون طازج",
      price: 85,
      image: "/src/assets/images/test1.png",
      category: "fish",
      stock: 30,
      userId: "merchant2",
      installmentOptions: [
        { months: 3, percentage: 8 },
        { months: 6, percentage: 12 },
        { months: 12, percentage: 18 },
      ],
      allowInstallment: true,
      approvalStatus: "pending",
      isVisible: false,
      isFeatured: false,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Lamb Chops",
      nameAr: "ريش ضاني",
      description: "Premium lamb chops",
      descriptionAr: "ريش ضاني فاخرة",
      price: 180,
      image: "/src/assets/images/test1.png",
      category: "meat",
      stock: 25,
      userId: "merchant2",
      installmentOptions: [],
      allowInstallment: false,
      approvalStatus: "rejected",
      isVisible: false,
      isFeatured: false,
      displayOrder: 4,
      rejectionReason: "الصورة غير واضحة، يرجى إعادة رفع صورة أوضح",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<Product> }>
    ) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) {
        Object.assign(product, action.payload.updates);
        product.updatedAt = new Date().toISOString();
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    
    // Admin actions
    approveProduct: (state, action: PayloadAction<number>) => {
      const product = state.products.find((p) => p.id === action.payload);
      if (product) {
        product.approvalStatus = "approved";
        product.isVisible = true;
        product.rejectionReason = undefined;
        product.updatedAt = new Date().toISOString();
      }
    },
    rejectProduct: (
      state,
      action: PayloadAction<{ id: number; reason: string }>
    ) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) {
        product.approvalStatus = "rejected";
        product.isVisible = false;
        product.rejectionReason = action.payload.reason;
        product.updatedAt = new Date().toISOString();
      }
    },
    toggleProductVisibility: (state, action: PayloadAction<number>) => {
      const product = state.products.find((p) => p.id === action.payload);
      if (product && product.approvalStatus === "approved") {
        product.isVisible = !product.isVisible;
        product.updatedAt = new Date().toISOString();
      }
    },
    toggleProductFeatured: (state, action: PayloadAction<number>) => {
      const product = state.products.find((p) => p.id === action.payload);
      if (product && product.approvalStatus === "approved") {
        product.isFeatured = !product.isFeatured;
        product.updatedAt = new Date().toISOString();
      }
    },
    updateProductOrder: (
      state,
      action: PayloadAction<{ id: number; newOrder: number }>
    ) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) {
        product.displayOrder = action.payload.newOrder;
        product.updatedAt = new Date().toISOString();
      }
    },
    reorderProducts: (
      state,
      action: PayloadAction<{ id: number; direction: "up" | "down" }>
    ) => {
      const { id, direction } = action.payload;
      const currentIndex = state.products.findIndex((p) => p.id === id);
      if (currentIndex === -1) return;

      const swapIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= state.products.length) return;

      // Swap display orders
      const currentOrder = state.products[currentIndex].displayOrder;
      state.products[currentIndex].displayOrder =
        state.products[swapIndex].displayOrder;
      state.products[swapIndex].displayOrder = currentOrder;

      // Swap positions in array
      [state.products[currentIndex], state.products[swapIndex]] = [
        state.products[swapIndex],
        state.products[currentIndex],
      ];
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  setProducts,
  approveProduct,
  rejectProduct,
  toggleProductVisibility,
  toggleProductFeatured,
  updateProductOrder,
  reorderProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
