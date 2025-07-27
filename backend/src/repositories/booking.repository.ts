import { Booking, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository, QueryOptions, QueryResult } from './base.repository';

/**
 * פילטרים מותאמים להזמנות
 */
export interface BookingFilters {
  userId?: string;
  spotId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Repository להזמנות
 */
export class BookingRepository implements BaseRepository<Booking> {
  
  async findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        spot: {
          include: {
            building: true
          }
        },
        payment: true
      }
    });
  }

  async findMany(filters?: BookingFilters, options?: QueryOptions): Promise<QueryResult<Booking>> {
    const where: Prisma.BookingWhereInput = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.spotId) {
      where.spotId = filters.spotId;
    }

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];
      
      if (filters.startDate) {
        where.AND.push({
          startDate: {
            gte: filters.startDate
          }
        });
      }
      
      if (filters.endDate) {
        where.AND.push({
          endDate: {
            lte: filters.endDate
          }
        });
      }
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: true,
          spot: {
            include: {
              building: true
            }
          },
          payment: true
        },
        skip: options?.skip || 0,
        take: options?.take || 50,
        orderBy: options?.orderBy || { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    return {
      data,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50
    };
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({
      data,
      include: {
        user: true,
        spot: {
          include: {
            building: true
          }
        }
      }
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking | null> {
    try {
      return await prisma.booking.update({
        where: { id },
        data,
        include: {
          user: true,
          spot: {
            include: {
              building: true
            }
          },
          payment: true
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
      await prisma.booking.delete({
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
   * קבלת הזמנות של משתמש ספציפי
   */
  async findByUser(userId: string, options?: QueryOptions): Promise<QueryResult<Booking>> {
    return this.findMany({ userId }, options);
  }

  /**
   * קבלת הזמנות לחנייה ספציפית
   */
  async findBySpot(spotId: string, options?: QueryOptions): Promise<QueryResult<Booking>> {
    return this.findMany({ spotId }, options);
  }

  /**
   * קבלת הזמנות פעילות
   */
  async findActive(options?: QueryOptions): Promise<QueryResult<Booking>> {
    return this.findMany({ status: 'ACTIVE' }, options);
  }

  /**
   * בדיקת התנגשויות בזמנים
   */
  async checkTimeConflict(spotId: string, startDate: Date, endDate: Date, excludeBookingId?: string): Promise<boolean> {
    const where: Prisma.BookingWhereInput = {
      spotId,
      status: {
        in: ['CONFIRMED', 'ACTIVE']
      },
      OR: [
        {
          // התחלה במהלך ההזמנה הקיימת
          startDate: {
            gte: startDate,
            lt: endDate
          }
        },
        {
          // סיום במהלך ההזמנה הקיימת
          endDate: {
            gt: startDate,
            lte: endDate
          }
        },
        {
          // מכסה את כל ההזמנה הקיימת
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: endDate } }
          ]
        }
      ]
    };

    if (excludeBookingId) {
      where.id = {
        not: excludeBookingId
      };
    }

    const conflicts = await prisma.booking.count({ where });
    return conflicts > 0;
  }

  /**
   * עדכון סטטוס הזמנה
   */
  async updateStatus(id: string, status: string): Promise<Booking | null> {
    return this.update(id, { status: status as any });
  }

  /**
   * קבלת הזמנות שהסתיימו אבל לא סומנו כהושלמו
   */
  async findExpiredActive(): Promise<Booking[]> {
    const now = new Date();
    return prisma.booking.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: now
        }
      },
      include: {
        user: true,
        spot: {
          include: {
            building: true
          }
        }
      }
    });
  }

  /**
   * סימון הזמנות שהסתיימו כהושלמו
   */
  async markExpiredAsCompleted(): Promise<number> {
    const result = await prisma.booking.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date()
        }
      },
      data: {
        status: 'COMPLETED'
      }
    });

    return result.count;
  }
}
