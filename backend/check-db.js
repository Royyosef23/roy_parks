const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 בודק נתונים במסד...\n');
    
    // בדיקת משתמשים
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });
    console.log('👥 משתמשים:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });

    // בדיקת בניינים
    const buildings = await prisma.building.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        ownerId: true
      }
    });
    console.log('\n🏢 בניינים:', buildings.length);
    buildings.forEach(building => {
      console.log(`  - ${building.name} (${building.address}) - Owner: ${building.ownerId}`);
    });

    // בדיקת חניות
    const parkingSpots = await prisma.parkingSpot.findMany({
      select: {
        id: true,
        spotNumber: true,
        buildingId: true,
        available: true
      }
    });
    console.log('\n🚗 חניות (ParkingSpot):', parkingSpots.length);
    parkingSpots.forEach(spot => {
      console.log(`  - ${spot.spotNumber} - Building: ${spot.buildingId} - Available: ${spot.available}`);
    });

    // בדיקת בקשות אישור חניות
    const parkingClaims = await prisma.parkingClaim.findMany({
      select: {
        id: true,
        userId: true,
        floor: true,
        spotNumber: true,
        status: true
      }
    });
    console.log('\n📋 בקשות אישור חניות (ParkingClaim):', parkingClaims.length);
    parkingClaims.forEach(claim => {
      console.log(`  - ${claim.floor}-${claim.spotNumber} - Status: ${claim.status} - User: ${claim.userId}`);
    });

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
