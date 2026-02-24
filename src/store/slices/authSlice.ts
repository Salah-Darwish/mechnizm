import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserMobile {
  mobile: string;
  label: string;
  is_primary: boolean;
}

interface User {
  id: number | string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'customer' | 'merchant' | 'admin';
  city?: string;
  national_id?: string;
  national_id_type?: string;
  bank_iban?: string;
  bank_name?: string;
  mobiles?: UserMobile[];
  // Legacy fields for backwards compatibility
  phone?: string;
  businessType?: 'credit' | 'selfPickup' | 'onlineStore' | 'mixed';
  companyName?: string;
  address?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Track if auth has been initialized
}

// Check for existing token on app load
const storedToken = localStorage.getItem('auth_token');
const storedUser = localStorage.getItem('auth_user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken, // Set to true if token exists - this ensures API calls include token
  isInitialized: false, // Will be set to true after AuthInitializer runs
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('auth_token', action.payload);
    },
    // Action to mark auth as initialized (called after AuthInitializer checks token validity)
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { login, logout, updateUser, setToken, setInitialized } = authSlice.actions;
export default authSlice.reducer;
