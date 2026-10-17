import { create } from 'zustand';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('ecommerce_mock_auth_token'),
  user: localStorage.getItem('ecommerce_mock_user') ? JSON.parse(localStorage.getItem('ecommerce_mock_user') || '{}') : null,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, password);
      localStorage.setItem('ecommerce_mock_auth_token', data.token);
      localStorage.setItem('ecommerce_mock_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false, isAuthModalOpen: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register(email, password, fullName);
      localStorage.setItem('ecommerce_mock_auth_token', data.token);
      localStorage.setItem('ecommerce_mock_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false, isAuthModalOpen: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('ecommerce_mock_auth_token');
    localStorage.removeItem('ecommerce_mock_user');
    set({ token: null, user: null, error: null });
  },

  initAuth: () => {
    const token = localStorage.getItem('ecommerce_mock_auth_token');
    const userJson = localStorage.getItem('ecommerce_mock_user');
    if (token && userJson) {
      try {
        set({ token, user: JSON.parse(userJson) });
      } catch {
        localStorage.removeItem('ecommerce_mock_user');
      }
    }
  },
}));
