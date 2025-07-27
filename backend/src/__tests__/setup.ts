import { PrismaClient } from '@prisma/client';

// הגדרת Prisma למבחנים - בדרך כלל תשתמש בבסיס נתונים נפרד
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// ניקוי לפני כל מבחן
beforeEach(async () => {
  // ניקוי טבלאות (אופציונלי - תלוי במבחן)
  // await testPrisma.booking.deleteMany();
  // await testPrisma.parkingSpot.deleteMany();
  // await testPrisma.user.deleteMany();
});

// סגירת החיבור אחרי כל המבחנים
afterAll(async () => {
  await testPrisma.$disconnect();
});
