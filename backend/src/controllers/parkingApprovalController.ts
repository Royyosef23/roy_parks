import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { createError } from '../middleware/errorHandler';

// הרחבת ממשק Request כדי לכלול user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const prisma = new PrismaClient();

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

  // בדיקה שהמשתמש הוא ADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.role !== 'ADMIN') {
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

  // בדיקה שהמשתמש הוא ADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.role !== 'ADMIN') {
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
