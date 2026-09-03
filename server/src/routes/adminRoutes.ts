import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { uploadQrCode } from '../middleware/upload';

const router = Router();

// Protect all admin endpoints
router.use(authenticateJWT);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', (req, res) => adminController.getDashboardStats(req, res));

// Registrations
router.get('/registrations', (req, res) => adminController.getRegistrations(req, res));
router.get('/registrations/:id', (req, res) => adminController.getRegistrationById(req, res));
router.patch('/registrations/:registrationId/approve', (req, res) => adminController.approvePayment(req, res));
router.patch('/registrations/:registrationId/reject', (req, res) => adminController.rejectPayment(req, res));
router.patch('/registrations/:registrationId/resubmit', (req, res) => adminController.requestResubmission(req, res));

// Student Management
router.get('/students', (req, res) => adminController.getStudents(req, res));
router.patch('/students/:studentId/toggle', (req, res) => adminController.toggleStudentStatus(req, res));

// Event Management
router.get('/events', (req, res) => adminController.getAllEventsAdmin(req, res));
router.post('/events', (req, res) => adminController.createEvent(req, res));
router.patch('/events/:id', (req, res) => adminController.updateEvent(req, res));
router.delete('/events/:id', (req, res) => adminController.deleteEvent(req, res));

// Settings & QR Management
router.get('/settings', (req, res) => adminController.getPaymentSettings(req, res));
router.patch('/settings', (req, res) => adminController.updatePaymentSettings(req, res));
router.post('/settings/qr', uploadQrCode.single('qrCode'), (req, res) => adminController.uploadQrCodeImage(req, res));

// Export Data (Excel & CSV)
router.get('/export', (req, res) => adminController.exportData(req, res));

// Audit Logs
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

// Database Maintenance / Clear Registrations
router.post('/clear-registrations', (req, res) => adminController.clearRegistrations(req, res));

export default router;
