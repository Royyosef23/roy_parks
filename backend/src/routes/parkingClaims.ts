/**
 * Routes לבקשות אישור חניות
 */

import { Router } from 'express';
import {
  submitParkingClaim,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  getMyClaim
} from '../controllers/parkingClaimController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// כל הroutes דורשים אימות
router.use(authenticate);

/**
 * @route   POST /api/v1/parking-claims
 * @desc    הגשת בקשה לאישור חנייה
 * @access  Private (OWNER only)
 */
router.post('/', 
  validateRequest('submitParkingClaim'),
  submitParkingClaim
);

/**
 * @route   GET /api/v1/parking-claims/my-claim
 * @desc    קבלת סטטוס הבקשה שלי
 * @access  Private
 */
router.get('/my-claim', getMyClaim);

/**
 * @route   GET /api/v1/parking-claims/pending
 * @desc    קבלת כל הבקשות הממתינות (לועד הבית)
 * @access  Private (Building committee only)
 */
router.get('/pending', getPendingClaims);

/**
 * @route   POST /api/v1/parking-claims/:id/approve
 * @desc    אישור בקשת חנייה
 * @access  Private (Building committee only)
 */
router.post('/:id/approve', approveClaim);

/**
 * @route   POST /api/v1/parking-claims/:id/reject
 * @desc    דחיית בקשת חנייה
 * @access  Private (Building committee only)
 */
router.post('/:id/reject',
  validateRequest('rejectClaim'),
  rejectClaim
);

export default router;
