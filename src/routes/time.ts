import { Router } from 'express';
import { getTime } from '../controllers/Time.controller';

const router = Router();

router.get('/', getTime);

export default router;
