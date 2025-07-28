import { User, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository, QueryOptions, QueryResult } from './base.repository';

/**
 * פילטרים מותאמים למשתמשים
 */
export interface UserFilters {
  role?: string;
  verified?: boolean;
  email?: string;
}

/**
 * Repository למשתמשים
 */
export class UserRepository implements BaseRepository<User> {
  
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findMany(filters?: UserFilters, options?: QueryOptions): Promise<QueryResult<User>> {
    const where: Prisma.UserWhereInput = {};
    
    if (filters?.role) {
      where.role = filters.role as any;
    }
    
    if (filters?.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters?.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive'
      };
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
        orderBy: options?.orderBy || { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data,
      total,
      skip: options?.skip || 0,
      take: options?.take || 50
    };
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // User not found
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // User not found
      }
      throw error;
    }
  }

  /**
   * חיפוש משתמשים לפי תפקיד
   */
  async findByRole(role: string, options?: QueryOptions): Promise<QueryResult<User>> {
    return this.findMany({ role }, options);
  }

  /**
   * קבלת משתמשים עם ההזמנות שלהם
   */
  async findWithBookings(userId?: string): Promise<User[]> {
    return prisma.user.findMany({
      where: userId ? { id: userId } : undefined,
      include: {
        bookings: {
          include: {
            spot: {
              include: {
                building: true
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

  /**
   * קבלת בעלי בניינים עם הבניינים שלהם
   */
  async findOwnersWithBuildings(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: 'RESIDENT' as any
      },
      include: {
        ownedBuildings: {
          include: {
            parkingSpots: true
          }
        }
      }
    });
  }

  /**
   * אימות סיסמה
   */
  async verifyPassword(userId: string, hashedPassword: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user ? user.password === hashedPassword : false;
  }

  /**
   * עדכון סיסמה
   */
  async updatePassword(userId: string, newHashedPassword: string): Promise<User | null> {
    return this.update(userId, { password: newHashedPassword });
  }

  /**
   * סימון משתמש כמאומת
   */
  async markAsVerified(userId: string): Promise<User | null> {
    return this.update(userId, { verified: true });
  }
}
