import { create } from 'zustand';
import { User, Shop, Notification } from '@/types';

interface AppStore {
  user: User | null;
  shop: Shop | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];

  setUser: (user: User | null) => void;
  setShop: (shop: Shop | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  shop: null,
  theme: 'light',
  sidebarOpen: true,
  notifications: [],

  setUser: (user) => set({ user }),
  setShop: (shop) => set({ shop }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));
