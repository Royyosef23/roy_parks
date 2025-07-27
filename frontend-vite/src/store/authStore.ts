import { create } from 'zustand';
import { authApi, type UserProfile } from '../api/auth';
import type { LoginDTO, RegisterDTO } from '@roy-parks/shared';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDTO) => Promise<void>;
  register: (userData: RegisterDTO) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginDTO) => {
    set({ isLoading: true, error: null });
    try {
      const authData = await authApi.login(credentials);
      authApi.saveAuth(authData);
      set({ 
        user: authData.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'שגיאה בהתחברות', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData: RegisterDTO) => {
    set({ isLoading: true, error: null });
    try {
      const authData = await authApi.register(userData);
      authApi.saveAuth(authData);
      set({ 
        user: authData.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'שגיאה ברישום', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    authApi.logout();
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  checkAuth: async () => {
    const savedUser = authApi.getSavedUser();
    const isAuthenticated = authApi.isAuthenticated();
    
    if (savedUser && isAuthenticated) {
      set({ 
        user: savedUser, 
        isAuthenticated: true 
      });
    } else {
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
