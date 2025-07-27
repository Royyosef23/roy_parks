import { z } from 'zod';
import { UserRole } from '../constants/roles';

/**
 * סכימת הרשמה
 */
export const RegisterSchema = z.object({
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .min(1, 'אימייל הוא שדה חובה'),
  password: z.string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'סיסמה חייבת להכיל אות קטנה, גדולה ומספר'),
  firstName: z.string()
    .min(2, 'שם פרטי חייב להכיל לפחות 2 תווים')
    .max(50, 'שם פרטי לא יכול להכיל יותר מ-50 תווים'),
  lastName: z.string()
    .min(2, 'שם משפחה חייב להכיל לפחות 2 תווים')
    .max(50, 'שם משפחה לא יכול להכיל יותר מ-50 תווים'),
  phone: z.string()
    .regex(/^05\d{8}$/, 'מספר טלפון לא תקין')
    .optional(),
  buildingCode: z.string()
    .regex(/^[A-Z0-9]{1,4}$/, 'קוד בניין חייב להכיל 1-4 תווים (אותיות גדולות ומספרים)')
    .transform(val => val.toUpperCase()),
  role: z.enum([UserRole.RENTER, UserRole.OWNER])
});

/**
 * סכימת התחברות
 */
export const LoginSchema = z.object({
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .min(1, 'אימייל הוא שדה חובה'),
  password: z.string()
    .min(1, 'סיסמה היא שדה חובה')
});

/**
 * סכימת עדכון פרופיל
 */
export const UpdateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'שם פרטי חייב להכיל לפחות 2 תווים')
    .max(50, 'שם פרטי לא יכול להכיל יותר מ-50 תווים')
    .optional(),
  lastName: z.string()
    .min(2, 'שם משפחה חייב להכיל לפחות 2 תווים')
    .max(50, 'שם משפחה לא יכול להכיל יותר מ-50 תווים')
    .optional(),
  phone: z.string()
    .regex(/^05\d{8}$/, 'מספר טלפון לא תקין')
    .optional(),
  avatar: z.string().url('כתובת תמונה לא תקינה').optional()
});

// Export types inferred from schemas
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
