/**
 * נקודת כניסה מרכזית לכל הגדרות המערכת
 */

export * from './database';
export * from './jwt';
export * from './environment';

// יבוא הגדרות מרכזיות
import { ENV } from './environment';
import { prisma } from './database';

export { ENV, prisma };

/**
 * אתחול כל ההגדרות
 */
export async function initializeConfig(): Promise<void> {
  console.log(`🚀 Initializing ParkBnB in ${ENV.NODE_ENV} mode`);
  console.log(`📍 Server will run on port ${ENV.PORT}`);
  
  try {
    // בדיקת חיבור למסד הנתונים
    await prisma.$connect();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * סגירה נקיה של המערכת
 */
export async function shutdownConfig(): Promise<void> {
  console.log('🛑 Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }
}
