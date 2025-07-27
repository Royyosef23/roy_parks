import { apiClient } from './client';
import type { 
  RegisterDTO, 
  LoginDTO, 
  UpdateProfileDTO,
  AuthResponse as SharedAuthResponse,
  AuthUser
} from '@roy-parks/shared';

// נשתמש בטיפוסים מהחבילה המשותפת
export type AuthResponse = SharedAuthResponse;
export type UserProfile = AuthUser;

/**
 * API לאימות משתמשים
 */
export const authApi = {
  /**
   * רישום משתמש חדש
   */
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    // השרת מחזיר { success, message, data: { user, token } }
    return response.data.data;
  },

  /**
   * התחברות משתמש
   */
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    // השרת מחזיר { success, message, data: { user, token } }
    return response.data.data;
  },

  /**
   * קבלת פרופיל המשתמש הנוכחי
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  /**
   * עדכון פרופיל משתמש
   */
  updateProfile: async (data: UpdateProfileDTO): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/profile', data);
    return response.data;
  },

  /**
   * התנתקות (מצד הלקוח)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * בדיקה האם המשתמש מחובר
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * קבלת הטוקן הנוכחי
   */
  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  },

  /**
   * שמירת נתוני אימות
   */
  saveAuth: (authData: AuthResponse) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  },

  /**
   * קבלת נתוני המשתמש השמורים
   */
  getSavedUser: (): UserProfile | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
};
