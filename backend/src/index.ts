/**
 * קובץ השרת הראשי - כאן מתחיל הכל!
 * 
 * הקובץ הזה אחראי על:
 * 1. הקמת השרת Express
 * 2. חיבור למסד הנתונים  
 * 3. הגדרת middleware-ים
 * 4. הגדרת routes (נתיבים)
 * 5. טיפול בשגיאות
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// ייבוא הroutes שלנו
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import buildingRoutes from './routes/buildings';
import parkingRoutes from './routes/parking';
import bookingRoutes from './routes/bookings';

// ייבוא middleware-ים
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

// טעינת משתני סביבה מקובץ .env
dotenv.config();

// יצירת instance של Express
const app = express();

// יצירת instance של Prisma (מסד הנתונים)
export const prisma = new PrismaClient();

// הגדרת פורט השרת
const PORT = process.env.PORT || 3001;

/**
 * Middleware-ים גלובליים
 * אלה רצים על כל בקשה שמגיעה לשרת
 */

// אבטחה בסיסית
app.use(helmet());

// הגדרת CORS - מאפשר לfrontend להתחבר
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// parsing של JSON בבקשות
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// logger לכל הבקשות
app.use(logger);

/**
 * API Routes - נתיבי הAPI שלנו
 * כל נתיב מתחיל ב-/api/v1
 */

// בדיקת בריאות השרת
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ParkBnB Server is running!',
    timestamp: new Date().toISOString()
  });
});

// נתיבי האפליקציה
app.use('/api/v1/auth', authRoutes);      // אימות - הרשמה/התחברות
app.use('/api/v1/users', userRoutes);     // ניהול משתמשים
app.use('/api/v1/buildings', buildingRoutes); // ניהול בניינים
app.use('/api/v1/parking', parkingRoutes);    // ניהול חניות
app.use('/api/v1/bookings', bookingRoutes);   // ניהול הזמנות

/**
 * Error Handling
 * טיפול בשגיאות שקורות באפליקציה
 */

// 404 - נתיב לא נמצא
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Global error handler - טיפול בכל השגיאות
app.use(errorHandler);

/**
 * התחלת השרת
 * פונקציה זו מפעילה את השרת ומחברת למסד הנתונים
 */
async function startServer() {
  try {
    // בדיקת חיבור למסד הנתונים
    await prisma.$connect();
    console.log('✅ Connected to database successfully');

    // הפעלת השרת
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API docs: http://localhost:${PORT}/api/v1/docs`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 * סגירה נאותה של השרת בעת עצירה
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// התחלת השרת
startServer();

export default app;
