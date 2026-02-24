export interface Marquee {
  id: string;
  text_ar: string;
  text_en: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarqueeState {
  marquees: Marquee[];
  isLoading: boolean;
  error: string | null;
}
