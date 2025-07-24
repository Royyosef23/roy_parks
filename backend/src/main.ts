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

// פרסור JSON ו-URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// לוגים לכל בקשה
app.use(logger);

/**
 * Routes - נתיבי ה-API
 */

// נתיב בריאות - לבדיקה שהשרת עובד
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ParkBnB API is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buildings', buildingRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// נתיב לטיפול ב-404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Middleware לטיפול בשגיאות (חייב להיות אחרון!)
app.use(errorHandler);

/**
 * התחלת השרת
 */
async function startServer() {
  try {
    // בדיקת חיבור למסד הנתונים
    await prisma.$connect();
    console.log('✅ Connected to database successfully');

    // הפעלת השרת
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/health`);
      console.log(`🏗️  Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// טיפול באירועי סגירת התהליך
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// התחלת השרת
startServer();
