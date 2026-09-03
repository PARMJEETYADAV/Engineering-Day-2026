import { Router } from 'express';
import { registrationController } from '../controllers/registrationController';
import { authenticateJWT, requireStudent } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, (req, res) => registrationController.createRegistration(req, res));
router.get('/my', authenticateJWT, (req, res) => registrationController.getMyRegistrations(req, res));
router.get('/:id', authenticateJWT, (req, res) => registrationController.getRegistrationDetails(req, res));

export default router;
