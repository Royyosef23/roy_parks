/**
 * Routes להזמנות
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Bookings endpoint - coming soon!' });
});

export default router;
