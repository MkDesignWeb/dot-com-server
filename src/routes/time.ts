import { Router } from 'express';
import { getTime } from '../controllers/time.controller';

const router = Router();

router.get('/', getTime);

export default router;
