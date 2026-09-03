import { Router } from 'express';
import { esportsController } from '../controllers/esportsController';
import { authenticateJWT, requireStudent } from '../middleware/auth';
import { uploadPaymentProof } from '../middleware/upload';

const router = Router();

// Student Protected Team Operations
router.post('/teams', authenticateJWT, requireStudent, (req, res) => esportsController.createTeam(req as any, res));
router.post('/teams/:id/members', authenticateJWT, requireStudent, (req, res) => esportsController.addMember(req as any, res));
router.delete('/teams/:id/members/:memberId', authenticateJWT, requireStudent, (req, res) => esportsController.removeMember(req as any, res));
router.post('/teams/:id/payment', authenticateJWT, requireStudent, uploadPaymentProof.single('screenshot'), (req, res) => esportsController.submitTeamPayment(req as any, res));
router.get('/my-teams', authenticateJWT, requireStudent, (req, res) => esportsController.getMyTeams(req as any, res));
router.get('/teams/:id', authenticateJWT, (req, res) => esportsController.getTeamById(req as any, res));

export default router;
