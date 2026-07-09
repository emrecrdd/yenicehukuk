import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authStore } from './auth.store.js';
import { uiStore } from './ui.store.js';

// Combine stores
export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      ...authStore(set, get),
      
      // UI state
      ...uiStore(set, get),
      
      // Reset all stores
      resetAll: () => {
        const resetAuth = authStore(set, get).reset;
        const resetUI = uiStore(set, get).reset;
        if (resetAuth) resetAuth();
        if (resetUI) resetUI();
      },
    }),
    {
      name: 'legal-system-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        tokens: state.tokens,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Export individual stores for convenience
export { authStore } from './auth.store.js';
export { uiStore } from './ui.store.js';

// Export hooks
export const useAuthStore = () => useStore((state) => ({
  user: state.user,
  tokens: state.tokens,
  isAuthenticated: state.isAuthenticated,
  loading: state.loading,
  login: state.login,
  logout: state.logout,
  register: state.register,
  refreshToken: state.refreshToken,
  updateUser: state.updateUser,
}));

export const useUIStore = () => useStore((state) => ({
  theme: state.theme,
  language: state.language,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  toggleTheme: state.toggleTheme,
  setLanguage: state.setLanguage,
  toggleSidebar: state.toggleSidebar,
  addNotification: state.addNotification,
  markAsRead: state.markAsRead,
  clearNotifications: state.clearNotifications,
}));

export default useStore;