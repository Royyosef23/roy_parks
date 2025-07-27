const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupNewSystem() {
  try {
    console.log('🏗️ מקים מערכת חדשה עם זרימת אישורים...');

    // יצירת משתמש Admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@padova32.com',
        password: hashedAdminPassword,
        firstName: 'ועד',
        lastName: 'הבית',
        role: 'ADMIN',
        verified: true
      }
    });
    console.log('✅ נוצר משתמש Admin:', admin.email);

    // יצירת בעלי בניין
    const hashedOwnerPassword = await bcrypt.hash('owner123', 12);
    const owner1 = await prisma.user.create({
      data: {
        email: 'owner1@padova32.com',
        password: hashedOwnerPassword,
        firstName: 'רואי',
        lastName: 'יוסף',
        role: 'OWNER',
        verified: true
      }
    });
    console.log('✅ נוצר בעל דירה:', owner1.email);

    const owner2 = await prisma.user.create({
      data: {
        email: 'owner2@padova32.com',
        password: hashedOwnerPassword,
        firstName: 'שני',
        lastName: 'כהן',
        role: 'OWNER',
        verified: true
      }
    });
    console.log('✅ נוצר בעל דירה נוסף:', owner2.email);

    // יצירת שוכר
    const hashedRenterPassword = await bcrypt.hash('renter123', 12);
    const renter = await prisma.user.create({
      data: {
        email: 'renter@gmail.com',
        password: hashedRenterPassword,
        firstName: 'דוד',
        lastName: 'מחפש',
        role: 'RENTER',
        verified: true
      }
    });
    console.log('✅ נוצר שוכר:', renter.email);

    // יצירת הבניין
    const building = await prisma.building.create({
      data: {
        name: 'פאדובה 32',
        address: 'פאדובה 32',
        city: 'תל אביב',
        zipCode: '12345',
        description: 'בניין מגורים עם חניות תת קרקעיות',
        ownerId: admin.id, // הAdmin מנהל את הבניין
        lat: 32.0853,
        lng: 34.7818
      }
    });
    console.log('✅ נוצר בניין:', building.name);

    // יצירת חניות לא מאושרות (owner1)
    const spotsOwner1 = [];
    for (let i = 1; i <= 3; i++) {
      const spot = await prisma.parkingSpot.create({
        data: {
          spotNumber: `A-${i}`,
          floor: -1,
          size: 'REGULAR',
          type: 'GARAGE',
          description: `חנייה ${i} בקומה -1`,
          hourlyRate: 15.0,
          dailyRate: 80.0,
          buildingId: building.id,
          ownerId: owner1.id,
          approved: false,  // לא אושרה עדיין!
          available: false  // לא זמינה עד אישור
        }
      });
      spotsOwner1.push(spot);
    }
    console.log(`✅ נוצרו ${spotsOwner1.length} חניות לא מאושרות עבור ${owner1.firstName}`);

    // יצירת חניות לא מאושרות (owner2)
    const spotsOwner2 = [];
    for (let i = 1; i <= 2; i++) {
      const spot = await prisma.parkingSpot.create({
        data: {
          spotNumber: `B-${i}`,
          floor: -2,
          size: 'REGULAR',
          type: 'GARAGE',
          description: `חנייה ${i} בקומה -2`,
          hourlyRate: 12.0,
          dailyRate: 70.0,
          buildingId: building.id,
          ownerId: owner2.id,
          approved: false,  // לא אושרה עדיין!
          available: false  // לא זמינה עד אישור
        }
      });
      spotsOwner2.push(spot);
    }
    console.log(`✅ נוצרו ${spotsOwner2.length} חניות לא מאושרות עבור ${owner2.firstName}`);

    console.log('\\n🎯 המערכת מוכנה לבדיקת זרימת האישורים:');
    console.log('1. בעלי הדירות יכולים להתחבר ולראות את החניות שלהם (לא מאושרות)');
    console.log('2. Admin יכול לראות את כל החניות הממתינות לאישור');
    console.log('3. Admin יכול לאשר חניות');
    console.log('4. בעלי הדירות יכולים להגדיר זמינות רק לאחר אישור');
    console.log('5. רק חניות אושרות וזמינות יופיעו בחיפוש');

    console.log('\\n👥 פרטי התחברות:');
    console.log('Admin: admin@padova32.com / admin123');
    console.log('Owner 1: owner1@padova32.com / owner123');
    console.log('Owner 2: owner2@padova32.com / owner123');
    console.log('Renter: renter@gmail.com / renter123');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ שגיאה:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupNewSystem();
