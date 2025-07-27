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

// ייבוא הגדרות המערכת
import { ENV, initializeConfig, shutdownConfig } from './config';

// ייבוא הroutes שלנו
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import buildingRoutes from './routes/buildings';
import parkingRoutes from './routes/parking';
import bookingRoutes from './routes/bookings';
import parkingClaimsRoutes from './routes/parkingClaims';

// ייבוא middleware-ים
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

// יצירת instance של Express
const app = express();

/**
 * Middleware-ים גלובליים
 * אלה רצים על כל בקשה שמגיעה לשרת
 */

// אבטחה בסיסית
app.use(helmet());

// הגדרת CORS - מאפשר לfrontend להתחבר
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true
}));

// פרסור JSON ו-URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// middleware לדיבוג בקשות
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', req.body);
  }
  next();
});

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
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/buildings', buildingRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/parking-claims', parkingClaimsRoutes);

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
    // אתחול הגדרות המערכת
    await initializeConfig();

    // הפעלת השרת
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server is running on port ${ENV.PORT}`);
      console.log(`📖 API Documentation: http://localhost:${ENV.PORT}/health`);
      console.log(`🏗️  Environment: ${ENV.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// טיפול באירועי סגירת התהליך
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await shutdownConfig();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await shutdownConfig();
  process.exit(0);
});

// התחלת השרת
startServer();
