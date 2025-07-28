import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { LoginDTO, RegisterDTO } from '@roy-parks/shared';

/**
 * Hook לניהול אימות משתמש
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    checkAuth,
    clearError
  } = useAuthStore();

  // בדיקת אימות בטעינת הדף - רק פעם אחת
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    initAuth();
  }, []); // רק בטעינה הראשונית - ללא תלויות

  const login = async (credentials: LoginDTO) => {
    try {
      await loginAction(credentials);
      // ניווט לדשבורד אחרי לוגין מוצלח
      navigate('/dashboard');
    } catch (error) {
      // השגיאה כבר נשמרה ב-store
      console.error('Login failed:', error);
    }
  };

  const register = async (userData: RegisterDTO) => {
    try {
      await registerAction(userData);
      // ניווט לדשבורד אחרי רישום מוצלח
      navigate('/dashboard');
    } catch (error) {
      // השגיאה כבר נשמרה ב-store
      console.error('Registration failed:', error);
    }
  };

  const logout = () => {
    logoutAction();
    navigate('/auth');
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    
    // Computed
    isAdmin: user?.role === 'ADMIN',
    isResident: user?.role === 'RESIDENT',
    // Backward compatibility helpers
    isOwner: user?.role === 'RESIDENT', // דייר יכול להיות גם משכיר
    isRenter: user?.role === 'RESIDENT', // דייר יכול להיות גם שוכר
    
    // User info
    userName: user ? `${user.firstName} ${user.lastName}` : '',
    userEmail: user?.email || '',
  };
};
