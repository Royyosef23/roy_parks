/**
 * Routes לחניות
 */

import { Router } from 'express';
import {
  addParkingSpot,
  getMyParkingSpots,
  updateParkingSpot,
  deleteParkingSpot,
  getAvailableParkingSpots
} from '../controllers/parkingController';
import {
  approveParkingSpot,
  getPendingApprovalSpots,
  setParkingSpotAvailability
} from '../controllers/parkingApprovalController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/v1/parking-spots/available
 * @desc    קבלת חניות זמינות (לכולם)
 * @access  Public
 */
router.get('/available', getAvailableParkingSpots);

// כל הroutes הבאים דורשים אימות
router.use(authenticate);

/**
 * @route   POST /api/v1/parking-spots
 * @desc    הוספת חנייה חדשה
 * @access  Private (OWNER only)
 */
router.post('/', 
  requireRole(['OWNER']),
  validateRequest('addParkingSpot'),
  addParkingSpot
);

/**
 * @route   GET /api/v1/parking-spots/my-spots
 * @desc    קבלת החניות שלי
 * @access  Private (OWNER only)
 */
router.get('/my-spots', 
  requireRole(['OWNER']),
  getMyParkingSpots
);

/**
 * @route   PUT /api/v1/parking-spots/:id
 * @desc    עדכון חנייה
 * @access  Private (OWNER only)
 */
router.put('/:id', 
  requireRole(['OWNER']),
  validateRequest('updateParkingSpot'),
  updateParkingSpot
);

/**
 * @route   DELETE /api/v1/parking-spots/:id
 * @desc    מחיקת חנייה
 * @access  Private (OWNER only)
 */
router.delete('/:id', 
  requireRole(['OWNER']),
  deleteParkingSpot
);

/**
 * @route   GET /api/v1/parking-spots/pending-approval
 * @desc    קבלת חניות הממתינות לאישור
 * @access  Private (ADMIN only)
 */
router.get('/pending-approval', 
  requireRole(['ADMIN']),
  getPendingApprovalSpots
);

/**
 * @route   PUT /api/v1/parking-spots/:id/approve
 * @desc    אישור חנייה ע"י ועד הבית
 * @access  Private (ADMIN only)
 */
router.put('/:id/approve', 
  requireRole(['ADMIN']),
  approveParkingSpot
);

/**
 * @route   POST /api/v1/parking-spots/:id/availability
 * @desc    הגדרת זמינות חנייה
 * @access  Private (OWNER only)
 */
router.post('/:id/availability', 
  requireRole(['OWNER']),
  setParkingSpotAvailability
);

export default router;
