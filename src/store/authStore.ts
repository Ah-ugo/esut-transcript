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
        const isProd = process.env.NODE_ENV === 'production';
        Cookies.set('access_token', access, {
          expires: 1,
          secure: isProd,
          sameSite: 'strict',
          path: '/',
        });
        Cookies.set('refresh_token', refresh, {
          expires: 7,
          secure: isProd,
          sameSite: 'strict',
          path: '/',
        });
        // Update status immediately for synchronous UI checks
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
      partialize: (state) => ({
        user: state.user,
        // We don't strictly persist isAuthenticated as it should be verified
        // against the presence of cookies on the client side.
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        const hasToken = !!Cookies.get('access_token');
        if (state && hasToken && state.user) {
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
