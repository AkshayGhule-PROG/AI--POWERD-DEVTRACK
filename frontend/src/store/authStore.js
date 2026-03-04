import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : updates,
      })),

      logout: () => {
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      isAdmin: () => get().user?.role === 'admin',
      isScrumMaster: () => ['admin', 'scrum_master'].includes(get().user?.role),
    }),
    {
      name: 'devtrack-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
