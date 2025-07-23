/**
 * Middleware ללוג בקשות
 * 
 * הקובץ הזה רושם לוג של כל בקשה שמגיעה לשרת
 * זה עוזר לנו לדעת מי ניגש לאיזה חלק של הAPI
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Logger middleware - רושם פרטי כל בקשה
 * 
 * @param req - בקשת HTTP
 * @param res - תגובת HTTP  
 * @param next - הפונקציה הבאה
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // כשהתגובה מסתיימת, נרשום את הפרטים
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // צבעים לקונסול לפי סטטוס
    const getStatusColor = (status: number) => {
      if (status >= 500) return '\x1b[31m'; // אדום לשגיאות שרת
      if (status >= 400) return '\x1b[33m'; // צהוב לשגיאות לקוח
      if (status >= 300) return '\x1b[36m'; // כחול לredirects
      return '\x1b[32m'; // ירוק להצלחה
    };
    
    const statusColor = getStatusColor(res.statusCode);
    const resetColor = '\x1b[0m';
    
    console.log(
      `${statusColor}${res.statusCode}${resetColor} ${req.method} ${req.originalUrl} - ${duration}ms - ${req.ip}`
    );
  });
  
  next();
};
