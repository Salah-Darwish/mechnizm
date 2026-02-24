import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getCurrentUser } from "../services/authService";
import { login, logout, setInitialized } from "../store/slices/authSlice";
import { fetchCart, resetSyncStatus } from "../store/slices/cartSlice";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartSynced = useAppSelector((state) => state.cart.synced);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const userData = await getCurrentUser();
          
          // Map backend role to frontend role format if needed
          // Since we updated Login.tsx to use ADMIN, we should be consistent here
          // But let's check what the backend returns. It returns 'ADMIN', 'USER', etc.
          
          // We don't need mapping if we updated the frontend to accept ADMIN
          // But we need to cast the role to satisfy TypeScript
          
          dispatch(
            login({
              user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role as 'customer' | 'merchant' | 'admin' | 'ADMIN',
                city: userData.city,
                national_id: userData.national_id,
                national_id_type: userData.national_id_type,
                bank_iban: userData.bank_iban,
                bank_name: userData.bank_name,
                mobiles: userData.mobiles,
              },
              token: token,
            })
          );
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          dispatch(logout());
          // Clear cart sync status on logout
          dispatch(resetSyncStatus());
        }
      } else if (!token) {
        // No token, mark as initialized
        dispatch(setInitialized(true));
      } else {
        // Token exists and user is already loaded, mark as initialized
        dispatch(setInitialized(true));
      }
    };

    fetchUser();
  }, [token, user, dispatch]);

  // Fetch cart from backend when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !cartSynced) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, cartSynced, dispatch]);

  // Clear local cart and reset sync status when user logs out
  useEffect(() => {
    if (!isAuthenticated && !token) {
      dispatch(resetSyncStatus());
    }
  }, [isAuthenticated, token, dispatch]);

  return null;
};

export default AuthInitializer;
