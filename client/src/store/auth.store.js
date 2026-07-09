import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import authApi from '../features/auth/auth.api.js';
import { 
  getTokens, 
  setTokens, 
  removeTokens, 
  getUser, 
  setUser, 
  removeUser,
  isAccessTokenValid,
  clearAuthData
} from '../features/auth/auth.utils.js';

export const authStore = (set, get) => ({
  // State
  user: getUser(),
  tokens: getTokens(),
  isAuthenticated: !!getUser() && isAccessTokenValid(),
  loading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = response.data.data;
      
      setTokens({ accessToken, refreshToken });
      setUser(user);
      
      set({
        user,
        tokens: { accessToken, refreshToken },
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      
      return { success: true, user };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Giriş başarısız',
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      const refreshToken = get().tokens?.refreshToken;
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.register(userData);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || 'Kayıt başarısız',
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  refreshToken: async () => {
    const refreshToken = get().tokens?.refreshToken;
    if (!refreshToken) {
      get().logout();
      return { success: false };
    }

    set({ loading: true });
    try {
      const response = await authApi.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      setTokens({ accessToken, refreshToken: newRefreshToken });
      
      set({
        tokens: { accessToken, refreshToken: newRefreshToken },
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      get().logout();
      return { success: false };
    }
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    setUser(updatedUser);
    set({ user: updatedUser });
  },

  checkAuth: () => {
    const tokens = getTokens();
    const user = getUser();
    
    if (tokens && user && isAccessTokenValid()) {
      set({
        user,
        tokens,
        isAuthenticated: true,
      });
      return true;
    } else {
      clearAuthData();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  reset: () => {
    clearAuthData();
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },
});

export default authStore;