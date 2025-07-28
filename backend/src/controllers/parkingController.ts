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
 * הוספת חנייה חדשה
 * POST /api/v1/parking-spots
 */
export const addParkingSpot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    spotNumber,
    floor,
    size = 'REGULAR',
    type = 'GARAGE',
    description,
    hourlyRate,
    dailyRate,
    buildingId
  } = req.body;

  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהמשתמש מאומת ויכול להציע חניות
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.verified) {
    throw createError('Only verified residents can add parking spots', 403);
  }

  // בדיקה שהבניין קיים ושייך למשתמש
  const building = await prisma.building.findFirst({
    where: {
      id: buildingId,
      ownerId: userId
    }
  });

  if (!building) {
    throw createError('Building not found or not owned by user', 404);
  }

  // בדיקה שמספר החנייה לא קיים כבר בבניין
  const existingSpot = await prisma.parkingSpot.findFirst({
    where: {
      spotNumber,
      buildingId
    }
  });

  if (existingSpot) {
    throw createError('Parking spot with this number already exists in this building', 400);
  }

  // יצירת החנייה - תצטרך אישור ועד הבית
  const parkingSpot = await prisma.parkingSpot.create({
    data: {
      spotNumber,
      floor: floor ? parseInt(floor) : null,
      size,
      type,
      description,
      hourlyRate: parseFloat(hourlyRate),
      dailyRate: parseFloat(dailyRate),
      buildingId,
      available: false  // לא תופיע בחיפוש עד אישור
    },
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

  // עדכון החנייה עם הבעלים (בעדכון נפרד כי ה-TypeScript לא מכיר בשדות חדשים)
  await prisma.$executeRaw`
    UPDATE parking_spots 
    SET "ownerId" = ${userId}, "approved" = false
    WHERE id = ${parkingSpot.id}
  `;

  res.status(201).json({
    success: true,
    message: 'החנייה נשלחה לאישור ועד הבית',
    data: { parkingSpot }
  });
});

/**
 * קבלת כל החניות של המשתמש
 * GET /api/v1/parking-spots/my-spots
 */
export const getMyParkingSpots = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // קבלת החניות שבבעלות המשתמש באמצעות raw SQL
  const rawSpots = await prisma.$queryRaw`
    SELECT 
      ps.*,
      b.id as building_id,
      b.name as building_name,
      b.address as building_address
    FROM parking_spots ps
    JOIN buildings b ON ps."buildingId" = b.id
    WHERE ps."ownerId" = ${userId}
    ORDER BY ps."createdAt" DESC
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
    approved: spot.approved,
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
 * עדכון חנייה
 * PUT /api/v1/parking-spots/:id
 */
export const updateParkingSpot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const {
    spotNumber,
    floor,
    size,
    type,
    description,
    hourlyRate,
    dailyRate,
    available
  } = req.body;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהחנייה קיימת ושייכת למשתמש
  const spot = await prisma.parkingSpot.findFirst({
    where: {
      id,
      building: {
        ownerId: userId
      }
    }
  });

  if (!spot) {
    throw createError('Parking spot not found or not owned by user', 404);
  }

  // עדכון החנייה
  const updatedSpot = await prisma.parkingSpot.update({
    where: { id },
    data: {
      ...(spotNumber && { spotNumber }),
      ...(floor && { floor: parseInt(floor) }),
      ...(size && { size }),
      ...(type && { type }),
      ...(description !== undefined && { description }),
      ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
      ...(dailyRate && { dailyRate: parseFloat(dailyRate) }),
      ...(available !== undefined && { available })
    },
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
    message: 'החנייה עודכנה בהצלחה',
    data: { parkingSpot: updatedSpot }
  });
});

/**
 * מחיקת חנייה
 * DELETE /api/v1/parking-spots/:id
 */
export const deleteParkingSpot = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createError('Authentication required', 401);
  }

  // בדיקה שהחנייה קיימת ושייכת למשתמש
  const spot = await prisma.parkingSpot.findFirst({
    where: {
      id,
      building: {
        ownerId: userId
      }
    },
    include: {
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED', 'ACTIVE']
              }
            }
          }
        }
      }
    }
  });

  if (!spot) {
    throw createError('Parking spot not found or not owned by user', 404);
  }

  // בדיקה שאין הזמנות פעילות
  if (spot._count.bookings > 0) {
    throw createError('Cannot delete parking spot with active bookings', 400);
  }

  // מחיקת החנייה
  await prisma.parkingSpot.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'החנייה נמחקה בהצלחה'
  });
});

/**
 * קבלת חניות זמינות (לשוכרים) - רק מבניין פאדובה 32
 * GET /api/v1/parking-spots/available
 */
export const getAvailableParkingSpots = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, type, size } = req.query;

  // שימוש ב-raw SQL כדי לעקוף בעיות TypeScript עם השדות החדשים
  let query = `
    SELECT 
      ps.*,
      b.id as building_id,
      b.name as building_name,
      b.address as building_address,
      b.city as building_city,
      b.images as building_images,
      b.lat as building_lat,
      b.lng as building_lng
    FROM parking_spots ps
    JOIN buildings b ON ps."buildingId" = b.id
    WHERE ps.approved = true 
      AND ps.available = true 
      AND b.name = 'פאדובה 32'
  `;

  const params: any[] = [];
  
  // סינון לפי סוג חנייה
  if (type) {
    query += ` AND ps.type = $${params.length + 1}`;
    params.push(type);
  }

  // סינון לפי גודל חנייה
  if (size) {
    query += ` AND ps.size = $${params.length + 1}`;
    params.push(size);
  }

  query += ` ORDER BY ps."hourlyRate" ASC`;

  const rawSpots = await prisma.$queryRawUnsafe(query, ...params);

  // המרה לפורמט הנדרש
  const spots = (rawSpots as any[]).map(spot => ({
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
      address: spot.building_address,
      city: spot.building_city,
      images: spot.building_images,
      lat: spot.building_lat,
      lng: spot.building_lng
    }
  }));

  res.json({
    success: true,
    data: { spots }
  });
});
