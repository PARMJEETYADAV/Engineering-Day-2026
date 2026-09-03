import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload';

const router = Router();

// Public/student configuration of active payment methods
router.get('/config', (req, res) => paymentController.getPaymentConfig(req, res));

// Submit proof with file upload (restricted to authenticated students)
router.post(
  '/proof',
  authenticateJWT,
  uploadPaymentProof.single('screenshot'),
  (req, res) => paymentController.submitPaymentProof(req, res)
);

// Protected secure image viewer (only owner student or admin can access)
router.get('/screenshot/:filename', authenticateJWT, (req, res) =>
  paymentController.getPaymentScreenshot(req, res)
);

export default router;
