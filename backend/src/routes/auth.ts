/**
 * Routes לאימות משתמשים
 * 
 * כאן מטפלים בכל מה שקשור להרשמה, התחברות ואימות
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateLogin, validateRegister } from '../middleware/validation';

const router = Router();

/**
 * POST /api/v1/auth/register
 * הרשמת משתמש חדש
 * 
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phone": "052-1234567",
 *   "role": "RESIDENT" | "ADMIN"
 * }
 */
router.post('/register', validateRegister, authController.register);

/**
 * POST /api/v1/auth/login
 * התחברות משתמש קיים
 * 
 * Body:
 * {
 *   "email": "user@example.com", 
 *   "password": "password123"
 * }
 */
router.post('/login', validateLogin, authController.login);

/**
 * POST /api/v1/auth/logout
 * התנתקות (מחיקת token)
 */
router.post('/logout', authController.logout);

/**
 * GET /api/v1/auth/me
 * קבלת פרטי המשתמש המחובר
 * דרוש token בheader: Authorization: Bearer <token>
 */
router.get('/me', authController.getMe);

/**
 * POST /api/v1/auth/forgot-password
 * שכחתי סיסמה - שליחת מייל איפוס
 * 
 * Body:
 * {
 *   "email": "user@example.com"
 * }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/v1/auth/reset-password
 * איפוס סיסמה עם טוקן
 * 
 * Body:
 * {
 *   "token": "reset-token-from-email",
 *   "newPassword": "newPassword123"
 * }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * POST /api/v1/auth/verify-email
 * אימות אימייל
 * 
 * Body:
 * {
 *   "token": "verification-token-from-email"
 * }
 */
router.post('/verify-email', authController.verifyEmail);

export default router;
