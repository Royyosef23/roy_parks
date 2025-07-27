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
 * הגשת בקשה לאישור חנייה
 * POST /api/v1/parking-claims
 */
export const submitParkingClaim = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { floor, spotNumber, additionalInfo } = req.body;
  const userId = req.user?.id; // מזהה המשתמש מהטוקן

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהמשתמש הוא OWNER
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.role !== 'OWNER') {
    throw createError('Only building owners can submit parking claims', 403);
  }

  // בדיקה שהמשתמש עדיין לא הגיש בקשה
  const existingClaim = await prisma.parkingClaim.findUnique({
    where: { userId }
  });

  if (existingClaim) {
    throw createError('You already have a pending claim. Only one claim per user is allowed.', 400);
  }

  // בדיקה שהחנייה הזו לא תפוסה
  const existingSpot = await prisma.parkingClaim.findUnique({
    where: { floor_spotNumber: { floor, spotNumber } }
  });

  if (existingSpot) {
    throw createError('This parking spot is already claimed', 400);
  }

  // יצירת הבקשה
  const claim = await prisma.parkingClaim.create({
    data: {
      userId,
      floor,
      spotNumber,
      additionalInfo,
      status: 'PENDING'
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Parking claim submitted successfully',
    data: { claim }
  });
});

/**
 * קבלת כל הבקשות הממתינות (לועד הבית)
 * GET /api/v1/parking-claims/pending
 */
export const getPendingClaims = asyncHandler(async (req: Request, res: Response) => {
  // כרגע כל OWNER יכול לראות - בעתיד נוסיף הרשאות לועד הבית
  const claims = await prisma.parkingClaim.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: { claims }
  });
});

/**
 * אישור בקשת חנייה
 * POST /api/v1/parking-claims/:id/approve
 */
export const approveClaim = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const approverId = req.user?.id;

  if (!approverId) {
    throw createError('Authentication required', 401);
  }

  // מציאת הבקשה
  const claim = await prisma.parkingClaim.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!claim) {
    throw createError('Parking claim not found', 404);
  }

  if (claim.status !== 'PENDING') {
    throw createError('This claim has already been processed', 400);
  }

  // יצירת בניין אם לא קיים
  let building = await prisma.building.findFirst({
    where: { 
      name: 'פאדובה 32',
      ownerId: claim.userId 
    }
  });

  if (!building) {
    building = await prisma.building.create({
      data: {
        name: 'פאדובה 32',
        address: 'פאדובה 32, תל אביב',
        city: 'תל אביב',
        zipCode: '62144',
        description: 'חניון תת-קרקעי בפאדובה 32',
        ownerId: claim.userId,
        openTime: '00:00',
        closeTime: '23:59'
      }
    });
  }

  // יצירת חנייה
  const parkingSpot = await prisma.parkingSpot.create({
    data: {
      spotNumber: `${claim.floor}-${claim.spotNumber}`,
      floor: parseInt(claim.floor.replace('-', '')),
      size: 'REGULAR',
      type: 'GARAGE',
      description: `חנייה בקומה ${claim.floor}, מקום ${claim.spotNumber}`,
      hourlyRate: 15.0, // מחיר בסיסי לשעה
      dailyRate: 80.0,  // מחיר בסיסי ליום
      buildingId: building.id,
      available: true
    }
  });

  // עדכון הבקשה לאושרה
  const updatedClaim = await prisma.parkingClaim.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: approverId,
      approvedAt: new Date()
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  // הוספת נקודות למשתמש על אישור החנייה
  await prisma.pointTransaction.create({
    data: {
      userId: claim.userId,
      amount: 100, // 100 נקודות על אישור חנייה
      reason: 'Parking spot approved',
      type: 'EARNED_PARKING_APPROVAL'
    }
  });

  // עדכון נקודות המשתמש
  await prisma.user.update({
    where: { id: claim.userId },
    data: {
      points: { increment: 100 }
    }
  });

  res.json({
    success: true,
    message: 'Parking claim approved successfully',
    data: { 
      claim: updatedClaim,
      parkingSpot,
      building
    }
  });
});

/**
 * דחיית בקשת חנייה
 * POST /api/v1/parking-claims/:id/reject
 */
export const rejectClaim = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const claim = await prisma.parkingClaim.findUnique({
    where: { id }
  });

  if (!claim) {
    throw createError('Parking claim not found', 404);
  }

  if (claim.status !== 'PENDING') {
    throw createError('This claim has already been processed', 400);
  }

  const updatedClaim = await prisma.parkingClaim.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectReason: reason || 'No reason provided'
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Parking claim rejected',
    data: { claim: updatedClaim }
  });
});

/**
 * קבלת סטטוס הבקשה שלי
 * GET /api/v1/parking-claims/my-claim
 */
export const getMyClaim = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  const claim = await prisma.parkingClaim.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!claim) {
    return res.json({
      success: true,
      data: { claim: null },
      message: 'No claim found'
    });
  }

  return res.json({
    success: true,
    data: { claim }
  });
});
