// Test TypeScript compilation for parkingClaim
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This should compile without errors
async function testParkingClaim() {
  const claims = await prisma.parkingClaim.findMany();
  const newClaim = await prisma.parkingClaim.create({
    data: {
      userId: 'test-user-id',
      floor: '-1',
      spotNumber: '123',
      status: 'PENDING'
    }
  });
  
  console.log('Claims found:', claims.length);
  console.log('New claim created:', newClaim.id);
}

export { testParkingClaim };
