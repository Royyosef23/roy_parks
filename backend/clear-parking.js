const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearParking() {
  try {
    console.log('🗑️ מוחק את כל החניות הקיימות...');
    
    // מחיקת כל החניות
    const deleted = await prisma.parkingSpot.deleteMany({});
    console.log(`✅ נמחקו ${deleted.count} חניות`);
    
    console.log('🏢 משאיר את הבניין והמשתמשים');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ שגיאה:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

clearParking();
