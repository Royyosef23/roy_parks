import { ZodSchema, ZodError } from 'zod';

/**
 * ולידציה באמצעות Zod schema
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T 
} | { 
  success: false; 
  errors: string[] 
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * ולידציה אסינכרונית
 */
export async function validateDataAsync<T>(
  schema: ZodSchema<T>, 
  data: unknown
): Promise<{ 
  success: true; 
  data: T 
} | { 
  success: false; 
  errors: string[] 
}> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * יצירת מסר שגיאה מפורט מ-ZodError
 */
export function formatZodError(error: ZodError): string {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}

/**
 * בדיקה אם ערך הוא UUID תקין
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * בדיקה אם כתובת אימייל תקינה
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * בדיקה אם מספר טלפון ישראלי תקין
 */
export function isValidIsraeliPhone(phone: string): boolean {
  const phoneRegex = /^05\d{8}$/;
  return phoneRegex.test(phone);
}
