/**
 * Routes לבניינים
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Buildings endpoint - coming soon!' });
});

export default router;
