import { ParkingSpot, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository, QueryOptions, QueryResult } from './base.repository';

/**
 * פילטרים מותאמים לחניות
 */
export interface ParkingSpotFilters {
  buildingId?: string;
  available?: boolean;
  size?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Repository לחניות
 */
export class ParkingSpotRepository implements BaseRepository<ParkingSpot> {
  
  async findById(id: string): Promise<ParkingSpot | null> {
    return prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        building: true,
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'ACTIVE']
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  }

  async findMany(filters?: ParkingSpotFilters, options?: QueryOptions): Promise<QueryResult<ParkingSpot>> {
    const where: Prisma.ParkingSpotWhereInput = {};
    
    if (filters?.buildingId) {
      where.buildingId = filters.buildingId;
    }
    
    if (filters?.available !== undefined) {
      where.available = filters.available;
    }

    if (filters?.size) {
      where.size = filters.size as any;
    }

    if (filters?.type) {
      where.type = filters.type as any;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.hourlyRate = {};
      
      if (filters.minPrice) {
        where.hourlyRate.gte = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        where.hourlyRate.lte = filters.maxPrice;
      }
    }

    const [data, total] = await Promise.all([
      prisma.parkingSpot.findMany({
        where,
        include: {
          building: true,
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        },
        skip: options?.skip || 0,
        take: options?.take || 50,
        orderBy: options?.orderBy || { createdAt: 'desc' }
      }),
      prisma.parkingSpot.count({ where })
    ]);

    return {
      data,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50
    };
  }

  async create(data: Prisma.ParkingSpotCreateInput): Promise<ParkingSpot> {
    return prisma.parkingSpot.create({
      data,
      include: {
        building: true
      }
    });
  }

  async update(id: string, data: Prisma.ParkingSpotUpdateInput): Promise<ParkingSpot | null> {
    try {
      return await prisma.parkingSpot.update({
        where: { id },
        data,
        include: {
          building: true,
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.parkingSpot.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /**
   * קבלת חניות של בניין ספציפי
   */
  async findByBuilding(buildingId: string, options?: QueryOptions): Promise<QueryResult<ParkingSpot>> {
    return this.findMany({ buildingId }, options);
  }

  /**
   * קבלת חניות זמינות
   */
  async findAvailable(filters?: Omit<ParkingSpotFilters, 'available'>, options?: QueryOptions): Promise<QueryResult<ParkingSpot>> {
    return this.findMany({ ...filters, available: true }, options);
  }

  /**
   * חיפוש חניות לפי תאריכים זמינים
   */
  async findAvailableByDates(startDate: Date, endDate: Date, filters?: ParkingSpotFilters, options?: QueryOptions): Promise<QueryResult<ParkingSpot>> {
    const baseWhere: Prisma.ParkingSpotWhereInput = {
      available: true
    };

    // הוספת פילטרים נוספים
    if (filters?.buildingId) {
      baseWhere.buildingId = filters.buildingId;
    }
    
    if (filters?.size) {
      baseWhere.size = filters.size as any;
    }

    if (filters?.type) {
      baseWhere.type = filters.type as any;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      baseWhere.hourlyRate = {};
      
      if (filters.minPrice) {
        baseWhere.hourlyRate.gte = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        baseWhere.hourlyRate.lte = filters.maxPrice;
      }
    }

    // הוצאת חניות שכבר תפוסות בתאריכים המבוקשים
    baseWhere.NOT = {
      bookings: {
        some: {
          status: {
            in: ['CONFIRMED', 'ACTIVE']
          },
          OR: [
            {
              // התחלה במהלך התקופה המבוקשת
              startDate: {
                gte: startDate,
                lt: endDate
              }
            },
            {
              // סיום במהלך התקופה המבוקשת
              endDate: {
                gt: startDate,
                lte: endDate
              }
            },
            {
              // מכסה את כל התקופה המבוקשת
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: endDate } }
              ]
            }
          ]
        }
      }
    };

    const [data, total] = await Promise.all([
      prisma.parkingSpot.findMany({
        where: baseWhere,
        include: {
          building: true,
          _count: {
            select: {
              reviews: true
            }
          }
        },
        skip: options?.skip || 0,
        take: options?.take || 50,
        orderBy: options?.orderBy || { hourlyRate: 'asc' }
      }),
      prisma.parkingSpot.count({ where: baseWhere })
    ]);

    return {
      data,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50
    };
  }

  /**
   * עדכון זמינות חנייה
   */
  async updateAvailability(id: string, available: boolean): Promise<ParkingSpot | null> {
    return this.update(id, { available });
  }

  /**
   * קבלת חניות עם דירוג גבוה
   */
  async findTopRated(limit: number = 10): Promise<ParkingSpot[]> {
    return prisma.parkingSpot.findMany({
      where: {
        available: true,
        reviews: {
          some: {}
        }
      },
      include: {
        building: true,
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      take: limit
    }).then(spots => {
      // חישוב דירוג ממוצע ומיון
      return spots
        .map(spot => ({
          ...spot,
          averageRating: spot.reviews.length > 0 
            ? spot.reviews.reduce((sum, review) => sum + review.rating, 0) / spot.reviews.length
            : 0
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit);
    });
  }

  /**
   * קבלת סטטיסטיקות חנייה
   */
  async getSpotStatistics(id: string): Promise<{
    totalBookings: number;
    activeBookings: number;
    averageRating: number;
    totalReviews: number;
    revenue: number;
  } | null> {
    const spot = await prisma.parkingSpot.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            payment: true
          }
        },
        reviews: true
      }
    });

    if (!spot) return null;

    const totalBookings = spot.bookings.length;
    const activeBookings = spot.bookings.filter(b => b.status === 'ACTIVE').length;
    const totalReviews = spot.reviews.length;
    const averageRating = totalReviews > 0 
      ? spot.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;
    const revenue = spot.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    return {
      totalBookings,
      activeBookings,
      averageRating,
      totalReviews,
      revenue
    };
  }
}
