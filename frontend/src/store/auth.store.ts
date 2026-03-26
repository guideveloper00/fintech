import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (user: User) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      // Chamado após login/register bem-sucedido
      setAuth: (user) => set({ user, isAuthenticated: true }),

      // Chamado após logout — limpa estado local (cookie é apagado pelo backend)
      logout: () => set({ user: null, isAuthenticated: false }),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'fintech-session',
      // Persiste apenas dados não-sensíveis — token nunca toca o localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);