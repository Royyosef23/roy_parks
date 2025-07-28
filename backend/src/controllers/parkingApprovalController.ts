import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { createError } from '../middleware/errorHandler';
import { prisma } from '../config/database';

// הרחבת ממשק Request כדי לכלול user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * בדיקת יכולות משתמש דינמיות
 */
async function getUserCapabilities(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return {
      canBookParking: false,
      canOfferParking: false,
      canApproveParking: false,
      isAdmin: false
    };
  }

  return {
    // כל דייר מאומת יכול לשכור חניות ולהציע חניות
    canBookParking: user.verified,
    canOfferParking: user.verified,
    
    // רק Admin יכול לאשר חניות
    canApproveParking: user.role === 'ADMIN',
    
    // זיהוי אדמין
    isAdmin: user.role === 'ADMIN'
  };
}

/**
 * אישור חנייה ע"י ועד הבית (Admin)
 * PUT /api/v1/parking-spots/:id/approve
 */
export const approveParkingSpot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהמשתמש יכול לאשר חניות
  const capabilities = await getUserCapabilities(userId);
  
  if (!capabilities.canApproveParking) {
    throw createError('Only admins can approve parking spots', 403);
  }

  // בדיקה שהחנייה קיימת
  const spot = await prisma.parkingSpot.findUnique({
    where: { id }
  });

  if (!spot) {
    throw createError('Parking spot not found', 404);
  }

  // בדיקת סטטוס אישור באמצעות raw SQL
  const spotWithApproval = await prisma.$queryRaw`
    SELECT approved FROM parking_spots WHERE id = ${id}
  ` as any[];

  if (spotWithApproval[0]?.approved) {
    throw createError('Parking spot is already approved', 400);
  }

  // אישור החנייה
  await prisma.$executeRaw`
    UPDATE parking_spots SET approved = true WHERE id = ${id}
  `;

  // החזרת החנייה המעודכנת
  const approvedSpot = await prisma.parkingSpot.findUnique({
    where: { id },
    include: {
      building: {
        select: {
          id: true,
          name: true,
          address: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'החנייה אושרה בהצלחה',
    data: { parkingSpot: approvedSpot }
  });
});

/**
 * קבלת רשימת חניות הממתינות לאישור (Admin)
 * GET /api/v1/parking-spots/pending-approval
 */
export const getPendingApprovalSpots = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהמשתמש יכול לראות חניות ממתינות
  const capabilities = await getUserCapabilities(userId);
  
  if (!capabilities.canApproveParking) {
    throw createError('Only admins can view pending approvals', 403);
  }

  // קבלת חניות הממתינות לאישור באמצעות raw SQL
  const rawSpots = await prisma.$queryRaw`
    SELECT 
      ps.*,
      b.id as building_id,
      b.name as building_name,
      b.address as building_address
    FROM parking_spots ps
    JOIN buildings b ON ps."buildingId" = b.id
    WHERE ps.approved = false
    ORDER BY ps."createdAt" ASC
  ` as any[];

  // המרה לפורמט הנדרש
  const spots = rawSpots.map(spot => ({
    id: spot.id,
    spotNumber: spot.spotNumber,
    floor: spot.floor,
    size: spot.size,
    type: spot.type,
    description: spot.description,
    images: spot.images,
    hourlyRate: spot.hourlyRate,
    dailyRate: spot.dailyRate,
    available: spot.available,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    building: {
      id: spot.building_id,
      name: spot.building_name,
      address: spot.building_address
    }
  }));

  res.json({
    success: true,
    data: { spots }
  });
});

/**
 * הגדרת זמינות חנייה ע"י הבעלים
 * POST /api/v1/parking-spots/:id/availability
 */
export const setParkingSpotAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { available } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהחנייה קיימת ושייכת למשתמש באמצעות raw SQL
  const spotOwnership = await prisma.$queryRaw`
    SELECT ps.*, ps."ownerId", ps.approved
    FROM parking_spots ps
    WHERE ps.id = ${id} AND ps."ownerId" = ${userId}
  ` as any[];

  if (spotOwnership.length === 0) {
    throw createError('Parking spot not found or not owned by user', 404);
  }

  if (!spotOwnership[0].approved) {
    throw createError('Parking spot must be approved before setting availability', 400);
  }

  // עדכון זמינות
  await prisma.$executeRaw`
    UPDATE parking_spots SET available = ${Boolean(available)} WHERE id = ${id}
  `;

  // החזרת החנייה המעודכנת
  const updatedSpot = await prisma.parkingSpot.findUnique({
    where: { id },
    include: {
      building: {
        select: {
          id: true,
          name: true,
          address: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: `החנייה ${available ? 'זמינה' : 'לא זמינה'} עכשיו`,
    data: { parkingSpot: updatedSpot }
  });
});

/**
 * קבלת פרטי משתמש עם יכולות
 * GET /api/v1/users/:id/capabilities
 */
export const getUserCapabilitiesEndpoint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const requestingUserId = req.user?.id;

  if (!requestingUserId) {
    throw createError('Authentication required', 401);
  }

  // רק Admin או המשתמש עצמו יכולים לראות יכולות
  const requestingUserCapabilities = await getUserCapabilities(requestingUserId);
  if (!requestingUserCapabilities.isAdmin && requestingUserId !== id) {
    throw createError('Access denied', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      verified: true,
      createdAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const capabilities = await getUserCapabilities(id);

  res.json({
    success: true,
    data: {
      user,
      capabilities
    }
  });
});

/**
 * עדכון סטטוס אימות דייר (Admin בלבד)
 * PUT /api/v1/users/:id/verify-resident
 */
export const verifyResident = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { verified, apartmentNumber, floor } = req.body;
  const adminId = req.user?.id;

  if (!adminId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהמשתמש הוא Admin
  const adminCapabilities = await getUserCapabilities(adminId);
  if (!adminCapabilities.isAdmin) {
    throw createError('Only admins can verify residents', 403);
  }

  // עדכון פרטי הדייר באמצעות raw SQL
  await prisma.$executeRaw`
    UPDATE users 
    SET verified = ${Boolean(verified)}
    ${apartmentNumber ? `, "apartmentNumber" = ${apartmentNumber}` : ''}
    ${floor ? `, floor = ${parseInt(floor)}` : ''}
    WHERE id = ${id}
  `;

  // קבלת המשתמש המעודכן
  const updatedUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      verified: true
    }
  });

  res.json({
    success: true,
    message: `דייר ${verified ? 'אומת' : 'לא אומת'} בהצלחה`,
    data: { user: updatedUser }
  });
});
