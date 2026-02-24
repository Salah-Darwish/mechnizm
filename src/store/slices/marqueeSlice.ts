import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Marquee, MarqueeState } from "../../types/marquee";

// Load marquees from localStorage
const loadMarqueesFromStorage = (): Marquee[] => {
  try {
    const storedMarquees = localStorage.getItem("marquees");
    if (storedMarquees) {
      return JSON.parse(storedMarquees);
    }
  } catch (error) {
    console.error("Failed to load marquees from localStorage:", error);
  }
  // Default marquee
  return [
    {
      id: "1",
      text_ar: "اشترك ووفر 15%",
      text_en: "subscribe & save 15%",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      },
     
  ];
};

// Save marquees to localStorage
const saveMarqueesToStorage = (marquees: Marquee[]) => {
  try {
    localStorage.setItem("marquees", JSON.stringify(marquees));
  } catch (error) {
    console.error("Failed to save marquees to localStorage:", error);
  }
};

const initialState: MarqueeState = {
  marquees: loadMarqueesFromStorage(),
  isLoading: false,
  error: null,
};

const marqueeSlice = createSlice({
  name: "marquee",
  initialState,
  reducers: {
    addMarquee: (state, action: PayloadAction<{ text_ar: string; text_en: string }>) => {
      const newMarquee: Marquee = {
        id: Date.now().toString(),
        text_ar: action.payload.text_ar,
        text_en: action.payload.text_en,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.marquees.push(newMarquee);
      saveMarqueesToStorage(state.marquees);
    },

    updateMarquee: (
      state,
      action: PayloadAction<{ id: string; text_ar: string; text_en: string }>
    ) => {
      const marquee = state.marquees.find((m) => m.id === action.payload.id);
      if (marquee) {
        marquee.text_ar = action.payload.text_ar;
        marquee.text_en = action.payload.text_en;
        marquee.updatedAt = new Date().toISOString();
        saveMarqueesToStorage(state.marquees);
      }
    },

    deleteMarquee: (state, action: PayloadAction<string>) => {
      state.marquees = state.marquees.filter((m) => m.id !== action.payload);
      saveMarqueesToStorage(state.marquees);
    },

    toggleMarqueeStatus: (state, action: PayloadAction<string>) => {
      const marquee = state.marquees.find((m) => m.id === action.payload);
      if (marquee) {
        marquee.isActive = !marquee.isActive;
        marquee.updatedAt = new Date().toISOString();
        saveMarqueesToStorage(state.marquees);
      }
    },

    setMarquees: (state, action: PayloadAction<Marquee[]>) => {
      state.marquees = action.payload;
      saveMarqueesToStorage(state.marquees);
    },
  },
});

export const {
  addMarquee,
  updateMarquee,
  deleteMarquee,
  toggleMarqueeStatus,
  setMarquees,
} = marqueeSlice.actions;

export default marqueeSlice.reducer;
