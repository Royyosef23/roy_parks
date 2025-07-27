const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test if parkingClaim exists
async function testParkingClaim() {
  console.log('Testing parkingClaim access...');
  
  // This should work if parkingClaim exists
  const claims = await prisma.parkingClaim.findMany();
  console.log('Found claims:', claims.length);
  
  console.log('parkingClaim property exists:', 'parkingClaim' in prisma);
  console.log('Available properties:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
}

testParkingClaim().catch(console.error).finally(() => process.exit());
