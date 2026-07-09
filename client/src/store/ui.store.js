import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const uiStore = (set, get) => ({
  // State
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'tr',
  sidebarOpen: window.innerWidth >= 1024,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  modalStack: [],

  // Theme Actions
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    set({ theme: newTheme });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  // Language Actions
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },

  // Sidebar Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  openSidebar: () => {
    set({ sidebarOpen: true });
  },

  closeSidebar: () => {
    set({ sidebarOpen: false });
  },

  // Notification Actions
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
      unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
    }));
  },

  // Loading Actions
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Modal Actions
  openModal: (modal) => {
    set((state) => ({
      modalStack: [...state.modalStack, modal],
    }));
  },

  closeModal: () => {
    set((state) => ({
      modalStack: state.modalStack.slice(0, -1),
    }));
  },

  closeAllModals: () => {
    set({ modalStack: [] });
  },

  // Reset
  reset: () => {
    set({
      theme: 'light',
      language: 'tr',
      sidebarOpen: true,
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      modalStack: [],
    });
  },
});

export default uiStore;