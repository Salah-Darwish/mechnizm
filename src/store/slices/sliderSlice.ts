import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Slider } from "../../types/slider";

interface SliderState {
  sliders: Slider[];
}

// Sample initial sliders
const initialState: SliderState = {
  sliders: [
    {
      id: "1",
      title: "Black Friday Sale",
      titleAr: "تخفيضات الجمعة السوداء",
      description: "20% OFF SITEWIDE! Promotion valid through Monday, December 1, 2025",
      descriptionAr: "خصم 20% على كل المنتجات! العرض ساري حتى الاثنين 1 ديسمبر 2025",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop",
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Fresh Products Daily",
      titleAr: "منتجات طازجة يومياً",
      description: "Get the freshest meat and seafood delivered to your door",
      descriptionAr: "احصل على أفضل اللحوم والمأكولات البحرية الطازجة حتى باب منزلك",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1920&h=600&fit=crop",
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const sliderSlice = createSlice({
  name: "sliders",
  initialState,
  reducers: {
    addSlider: (state, action: PayloadAction<Omit<Slider, "id" | "createdAt" | "updatedAt">>) => {
      const newSlider: Slider = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.sliders.push(newSlider);
    },
    updateSlider: (state, action: PayloadAction<Slider>) => {
      const index = state.sliders.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sliders[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteSlider: (state, action: PayloadAction<string>) => {
      state.sliders = state.sliders.filter((s) => s.id !== action.payload);
    },
    toggleSliderActive: (state, action: PayloadAction<string>) => {
      const slider = state.sliders.find((s) => s.id === action.payload);
      if (slider) {
        slider.isActive = !slider.isActive;
        slider.updatedAt = new Date().toISOString();
      }
    },
    reorderSliders: (state, action: PayloadAction<Slider[]>) => {
      state.sliders = action.payload;
    },
  },
});

export const { addSlider, updateSlider, deleteSlider, toggleSliderActive, reorderSliders } =
  sliderSlice.actions;
export default sliderSlice.reducer;
