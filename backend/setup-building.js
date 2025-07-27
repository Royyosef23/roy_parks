const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupBuilding() {
  try {
    // מציאת המשתמש OWNER
    const owner = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    });

    if (!owner) {
      console.log('❌ לא נמצא משתמש OWNER');
      return;
    }

    console.log(`👤 נמצא בעלים: ${owner.firstName} ${owner.lastName}`);

    // יצירת בניין פאדובה 32
    const building = await prisma.building.create({
      data: {
        name: 'פאדובה 32',
        address: 'פאדובה 32, תל אביב',
        city: 'תל אביב',
        zipCode: '62144',
        description: 'חניון תת-קרקעי בפאדובה 32',
        ownerId: owner.id,
        openTime: '00:00',
        closeTime: '23:59'
      }
    });

    console.log(`🏢 נוצר בניין: ${building.name} (ID: ${building.id})`);

    // עכשיו בוא ניצור כמה חניות לדוגמה
    const spots = [];
    for (let floor of ['-1', '-2', '-3']) {
      for (let spotNum = 1; spotNum <= 5; spotNum++) {
        const spot = await prisma.parkingSpot.create({
          data: {
            spotNumber: `${floor}-${spotNum}`,
            floor: parseInt(floor.replace('-', '')),
            size: 'REGULAR',
            type: 'GARAGE',
            description: `חנייה בקומה ${floor}, מקום ${spotNum}`,
            hourlyRate: 15.0,
            dailyRate: 80.0,
            buildingId: building.id,
            available: true
          }
        });
        spots.push(spot);
      }
    }

    console.log(`🚗 נוצרו ${spots.length} חניות`);
    console.log('✅ הכל מוכן!');

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupBuilding();
