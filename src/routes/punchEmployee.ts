import { Router } from 'express';
import { setPunchEmployee, getPunchEmployee } from '../controllers/punchEmployee.controller';


const router = Router();

router.post('/', setPunchEmployee);
router.get('/', getPunchEmployee);

export default router;
