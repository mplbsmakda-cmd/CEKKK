
import { create } from 'https://esm.sh/zustand';
import { UserProfile } from './types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: Date;
  read: boolean;
}

interface AppState {
  profile: UserProfile | null;
  notifications: Notification[];
  setProfile: (profile: UserProfile | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useStore = create<AppState>((set) => ({
  profile: null,
  notifications: [],
  setProfile: (profile) => set({ profile }),
  addNotification: (note) => set((state) => ({
    notifications: [
      { 
        ...note, 
        id: Math.random().toString(36).substr(2, 9), 
        read: false, 
        createdAt: new Date() 
      },
      ...state.notifications
    ].slice(0, 10) // Keep last 10
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
