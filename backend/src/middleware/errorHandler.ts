/**
 * Middleware לטיפול בשגיאות
 * 
 * הקובץ הזה אחראי על טיפול מרכזי בכל השגיאות שקורות בשרת
 * במקום לכתוב try-catch בכל מקום, נשלח שגיאות לכאן
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Interface לשגיאה מותאמת אישית
 */
interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware לטיפול בשגיאות
 * 
 * @param error - השגיאה שקרתה
 * @param req - בקשת HTTP
 * @param res - תגובת HTTP
 * @param next - הפונקציה הבאה
 */
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // לוג השגיאה לקונסול (בפרודקשן נשלח לשירות לוגים)
  console.error('🚨 Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // קביעת status code
  const statusCode = error.statusCode || 500;
  
  // הודעת שגיאה למשתמש
  const message = error.isOperational 
    ? error.message 
    : 'Something went wrong!';

  // שליחת תגובה
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.message
      })
    }
  });
};

/**
 * פונקציה ליצירת שגיאה מותאמת אישית
 * 
 * @param message - הודעת השגיאה
 * @param statusCode - קוד סטטוס HTTP
 * @returns שגיאה מותאמת אישית
 */
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Wrapper לפונקציות async - תופס שגיאות אוטומטית
 * 
 * @param fn - פונקציה async
 * @returns פונקציה שתופסת שגיאות
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
