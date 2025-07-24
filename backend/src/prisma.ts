/**
 * קובץ מרכזי לחיבור למסד הנתונים
 * כאן מוגדר ה-Prisma Client שכל השרת משתמש בו
 */

import { PrismaClient } from '@prisma/client';

// יצירת instance יחיד של Prisma Client (Singleton pattern)
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // לוגים למסד הנתונים
});

// התחברות למסד הנתונים
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// ניתוק מהמסד הנתונים
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
  }
}
