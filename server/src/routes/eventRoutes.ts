import { Router } from 'express';
import { eventController } from '../controllers/eventController';

const router = Router();

router.get('/', (req, res) => eventController.getAllEvents(req, res));
router.get('/:slug', (req, res) => eventController.getEventBySlug(req, res));

export default router;
