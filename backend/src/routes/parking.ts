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
  setParkingSpotAvailability,
  getUserCapabilitiesEndpoint,
  verifyResident
} from '../controllers/parkingApprovalController';
import { authenticate, requireRole, requireVerified } from '../middleware/auth';
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
 * @access  Private (Verified residents only)
 */
router.post('/', 
  requireVerified,
  validateRequest('addParkingSpot'),
  addParkingSpot
);

/**
 * @route   GET /api/v1/parking-spots/my-spots
 * @desc    קבלת החניות שלי
 * @access  Private (Verified residents only)
 */
router.get('/my-spots', 
  requireVerified,
  getMyParkingSpots
);

/**
 * @route   PUT /api/v1/parking-spots/:id
 * @desc    עדכון חנייה
 * @access  Private (Verified residents only)
 */
router.put('/:id', 
  requireVerified,
  validateRequest('updateParkingSpot'),
  updateParkingSpot
);

/**
 * @route   DELETE /api/v1/parking-spots/:id
 * @desc    מחיקת חנייה
 * @access  Private (Verified residents only)
 */
router.delete('/:id', 
  requireVerified,
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
 * @access  Private (Verified residents only)
 */
router.post('/:id/availability', 
  requireVerified,
  setParkingSpotAvailability
);

/**
 * @route   GET /api/v1/users/:id/capabilities
 * @desc    קבלת יכולות משתמש
 * @access  Private (ADMIN or self)
 */
router.get('/users/:id/capabilities', 
  getUserCapabilitiesEndpoint
);

/**
 * @route   PUT /api/v1/users/:id/verify-resident
 * @desc    אימות דייר ע"י ועד הבית
 * @access  Private (ADMIN only)
 */
router.put('/users/:id/verify-resident', 
  requireRole(['ADMIN']),
  verifyResident
);

export default router;
