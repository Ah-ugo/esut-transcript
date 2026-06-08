/** @format */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  matric_number?: string;
  staff_id?: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (access, refresh) => {
        Cookies.set('access_token', access, {
          expires: 1,
          secure: true,
          sameSite: 'strict',
          path: '/',
        });
        Cookies.set('refresh_token', refresh, {
          expires: 7,
          secure: true,
          sameSite: 'strict',
          path: '/',
        });
        set({ isAuthenticated: true });
      },
      logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: 'esut-auth',
      // Persist both user AND isAuthenticated so refresh doesn't lose state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHydrated(true);
        // Validate: only keep isAuthenticated=true if we also have a cookie
        const hasToken = !!Cookies.get('access_token');
        if (!hasToken) {
          // Token expired or cleared — force unauthenticated
          state.isAuthenticated = false;
          state.user = null;
        }
      },
    },
  ),
);
