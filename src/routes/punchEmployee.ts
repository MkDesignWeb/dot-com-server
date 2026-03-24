import { Router } from 'express';
import { setPunchEmployee, getPunchEmployee, updatePunchEmployee, deletePunchEmployee, updatePunchDayStatus } from '../controllers/punchEmployee.controller';
import auth from '../middleware/auth';


const router = Router();

router.post('/', setPunchEmployee);
router.get('/', auth, getPunchEmployee);
router.put('/day-status', auth, updatePunchDayStatus);
router.put('/:punchId', auth, updatePunchEmployee);
router.delete('/:punchId', auth, deletePunchEmployee);

export default router;
