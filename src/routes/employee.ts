import { Router } from 'express';
import { createEmployee, listEmployees, deleteEmployee, setPunch } from '../controllers/employee.controller';
import auth from '../middleware/auth';


const router = Router();

router.post('/', auth, createEmployee);
router.get('/', listEmployees);
router.delete('/', auth, deleteEmployee);
router.post('/punch', auth, setPunch)

export default router;
