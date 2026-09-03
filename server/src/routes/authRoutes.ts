import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authenticateJWT, (req, res) => authController.getCurrentUser(req, res));
router.post('/change-password', authenticateJWT, (req, res) => authController.changePassword(req, res));
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;
