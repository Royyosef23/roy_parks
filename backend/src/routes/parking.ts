/**
 * Routes לחניות
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Parking endpoint - coming soon!' });
});

export default router;
