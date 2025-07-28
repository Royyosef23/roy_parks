import { UserRole } from '../constants/roles';

/**
 * משתמש בסיסי
 */
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  buildingId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * משתמש להתחברות (ללא סיסמה)
 */
export type AuthUser = Omit<BaseUser, 'createdAt' | 'updatedAt'>;

/**
 * פרטי הרשמה
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  buildingId: string;
  role: typeof UserRole.RESIDENT; // כל המשתמשים נרשמים כדיירים, אדמין נוצר רק על ידי המערכת
}

/**
 * פרטי התחברות
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * תגובת התחברות
 */
export interface AuthResponse {
  user: AuthUser;
  token: string;
  expiresIn: string;
}
