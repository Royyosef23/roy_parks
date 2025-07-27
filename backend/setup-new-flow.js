const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupNewDatabase() {
  try {
    console.log('🗑️ מנקה את המסד נתונים...');
    
    // מחיקת כל הנתונים הקיימים
    await prisma.parkingSpot.deleteMany({});
    await prisma.building.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('👤 יוצר משתמשים בסיסיים...');
    
    // יצירת סיסמה מוצפנת
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // יצירת בעל הבניין (OWNER)
    const owner = await prisma.user.create({
      data: {
        email: 'royyosef9@gmail.com',
        password: hashedPassword,
        firstName: 'רואי',
        lastName: 'יוסף',
        phone: '050-1234567',
        role: 'OWNER',
        verified: true
      }
    });
    
    // יצירת שוכר (RENTER)
    const renter = await prisma.user.create({
      data: {
        email: 'nissoc770@gmail.com',
        password: hashedPassword,
        firstName: 'ניסים',
        lastName: 'כהן',
        phone: '052-7654321',
        role: 'RENTER',
        verified: true
      }
    });
    
    // יצירת מנהל (ADMIN) - ועד הבית
    const admin = await prisma.user.create({
      data: {
        email: 'admin@padova32.co.il',
        password: hashedPassword,
        firstName: 'ועד',
        lastName: 'הבית',
        phone: '03-1234567',
        role: 'ADMIN',
        verified: true
      }
    });
    
    console.log('🏢 יוצר בניין פאדובה 32...');
    
    // יצירת הבניין
    const building = await prisma.building.create({
      data: {
        name: 'פאדובה 32',
        address: 'רחוב פאדובה 32',
        city: 'תל אביב',
        zipCode: '6473232',
        description: 'בניין מגורים מודרני עם חניון תת קרקעי',
        images: [],
        lat: 32.0853,
        lng: 34.7818,
        openTime: '00:00',
        closeTime: '23:59',
        ownerId: owner.id,
        active: true
      }
    });
    
    console.log('✅ הגדרה הושלמה בהצלחה!');
    console.log(`👤 Owner: ${owner.email} (${owner.firstName} ${owner.lastName})`);
    console.log(`👤 Renter: ${renter.email} (${renter.firstName} ${renter.lastName})`);
    console.log(`👤 Admin: ${admin.email} (${admin.firstName} ${admin.lastName})`);
    console.log(`🏢 Building: ${building.name} (ID: ${building.id})`);
    console.log('🔐 סיסמה לכל המשתמשים: 123456');
    
    console.log('\\n🎯 זרימת הבדיקה:');
    console.log('1. Owner יכול ליצור חניות חדשות (תועברנה לאישור)');
    console.log('2. Admin יכול לאשר חניות באדמין פאנל');
    console.log('3. Owner יכול להגדיר זמינות לחניות מאושרות');
    console.log('4. Renter יכול לחפש רק חניות מאושרות וזמינות');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ שגיאה:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupNewDatabase();
