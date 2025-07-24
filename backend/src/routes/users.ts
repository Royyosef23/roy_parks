/**
 * Routes למשתמשים
 * 
 * כאן מטפלים בכל מה שקשור לניהול משתמשים
 */

import { Router } from 'express';
// יובא אחר כך כשניצור את הcontroller
// import { userController } from '../controllers/userController';

const router = Router();

/**
 * GET /api/v1/users/profile
 * קבלת פרופיל המשתמש
 */
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - coming soon!' });
});

/**
 * PUT /api/v1/users/profile
 * עדכון פרופיל המשתמש
 */
router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile endpoint - coming soon!' });
});

export default router;
