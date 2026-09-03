import { Router } from 'express';
import { adminEsportsController } from '../controllers/adminEsportsController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin Protected E-Sports Operations
router.get('/stats', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.getEsportsStats(req as any, res));
router.get('/teams', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.getTeams(req as any, res));
router.get('/teams/:id', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.getTeamById(req as any, res));
router.patch('/teams/:id/approve', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.approveTeam(req as any, res));
router.patch('/teams/:id/reject', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.rejectTeam(req as any, res));
router.patch('/teams/:id/resubmission', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.requestResubmission(req as any, res));
router.get('/export', authenticateJWT, requireAdmin, (req, res) => adminEsportsController.exportTeams(req as any, res));

export default router;
