import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/services';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return user;
      },

      logout: async () => {
        try { await authAPI.logout(); } catch (_) {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await authAPI.me();
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch (_) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      hasRole: (...roles) => roles.includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
