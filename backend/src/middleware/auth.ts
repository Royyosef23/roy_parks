import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';
import { ENV } from '../config';

const prisma = new PrismaClient();

// הרחבת ממשק Request כדי לכלול user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    verified: boolean;
  };
}

/**
 * Middleware לאימות משתמשים
 * בודק אם יש טוקן תקין ומוסיף את פרטי המשתמש ל-request
 */
export const authenticate = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // חילוץ הטוקן מה-header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token is required', 401);
    }

    const token = authHeader.substring(7); // הסרת "Bearer "

    // אימות הטוקן
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      userId: string;
      iat: number;
      exp: number;
    };

    // מציאת המשתמש במסד הנתונים
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        verified: true
      }
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    // הוספת פרטי המשתמש ל-request
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid token', 401));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expired', 401));
    }
    
    next(error);
  }
};

/**
 * Middleware לבדיקת הרשאות לפי תפקיד
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Middleware לבדיקה שהמשתמש מאומת
 */
export const requireVerified = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (!req.user.verified) {
    return next(createError('Email verification required', 403));
  }

  next();
};
