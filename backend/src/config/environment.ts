/**
 * ניהול משתני סביבה
 */

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  CORS_ORIGIN: string | string[];
  EMAIL_SERVICE?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
}

/**
 * קריאת משתני סביבה עם ברירות מחדל
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // טעינת .env אם קיים
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv not available, using process.env directly');
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/parkbnb',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_ISSUER: process.env.JWT_ISSUER || 'parkbnb',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'parkbnb-users',
    CORS_ORIGIN: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      ['http://localhost:5173', 'http://localhost:3000'],
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined
  };
}

/**
 * אימות תקינות הגדרות הסביבה
 */
export function validateEnvironment(config: EnvironmentConfig): string[] {
  const errors: string[] = [];

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  if (config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long');
  }

  // בדיקות אימייל אם הוגדרו
  if (config.EMAIL_SERVICE && !config.EMAIL_USER) {
    errors.push('EMAIL_USER is required when EMAIL_SERVICE is set');
  }

  if (config.EMAIL_SERVICE && !config.EMAIL_PASS) {
    errors.push('EMAIL_PASS is required when EMAIL_SERVICE is set');
  }

  return errors;
}

// יצוא המשתנים
export const ENV = getEnvironmentConfig();

// אימות בזמן טעינה
const validationErrors = validateEnvironment(ENV);
if (validationErrors.length > 0) {
  console.error('Environment validation errors:');
  validationErrors.forEach(error => console.error(`  - ${error}`));
  
  if (ENV.NODE_ENV === 'production') {
    process.exit(1);
  }
}
