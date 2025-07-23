/**
 * Controller לאימות משתמשים
 * 
 * כאן מוגדרות כל הפונקציות שמטפלות בהרשמה, התחברות ואימות
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';

/**
 * יצירת JWT Token
 * @param userId - מזהה המשתמש
 * @returns JWT token
 */
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * הרשמת משתמש חדש
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // בדיקה אם המשתמש כבר קיים
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // הצפנת הסיסמה
  const hashedPassword = await bcrypt.hash(password, 12);

  // יצירת המשתמש
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'RENTER'
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      verified: true,
      createdAt: true
    }
  });

  // יצירת token
  const token = generateToken(user.id);

  // שליחת מייל אימות (אופציונלי)
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ParkBnB!',
      template: 'welcome',
      data: { firstName: user.firstName }
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

/**
 * התחברות משתמש
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // חיפוש המשתמש
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      verified: true,
      avatar: true
    }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // בדיקת סיסמה
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // יצירת token
  const token = generateToken(user.id);

  // הסרת הסיסמה מהתגובה
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

/**
 * התנתקות
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  // בגרסה פשוטה, הלקוח פשוט ימחק את הtoken
  // בגרסה מתקדמת יותר נוכל לשמור blacklist של tokens
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * קבלת פרטי המשתמש המחובר
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req: Request, res: Response) => {
  // המשתמש מגיע מה-middleware של אימות
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      verified: true,
      avatar: true,
      createdAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * שכחתי סיסמה
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // מסיבות אבטחה, נחזיר הודעה זהה גם אם המשתמש לא קיים
    return res.json({
      success: true,
      message: 'If this email exists, a reset link will be sent'
    });
  }

  // יצירת token לאיפוס סיסמה
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  // שליחת מייל עם לינק לאיפוס
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      data: { 
        firstName: user.firstName,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw createError('Failed to send reset email', 500);
  }

  res.json({
    success: true,
    message: 'Reset password email sent'
  });
});

/**
 * איפוס סיסמה
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.type !== 'password-reset') {
      throw createError('Invalid reset token', 400);
    }

    // הצפנת הסיסמה החדשה
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // עדכון הסיסמה
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    throw createError('Invalid or expired reset token', 400);
  }
});

/**
 * אימות אימייל
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.type !== 'email-verification') {
      throw createError('Invalid verification token', 400);
    }

    // עדכון סטטוס האימות
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { verified: true }
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    throw createError('Invalid or expired verification token', 400);
  }
});

// ייצוא כל הפונקציות
export const authController = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail
};
