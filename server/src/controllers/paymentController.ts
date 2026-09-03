import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { paymentService } from '../services/paymentService';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

export class PaymentController {
  /**
   * Get active payment settings (UPI ID, QR code image, instructions)
   */
  async getPaymentConfig(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settings = await prisma.systemSetting.findMany({
        where: {
          key: {
            in: [
              'payment_upi_id',
              'payment_account_name',
              'payment_qr_code',
              'payment_instructions',
            ],
          },
        },
      });

      const configMap: Record<string, string> = {};
      settings.forEach((s) => {
        configMap[s.key] = s.value;
      });

      res.status(200).json({
        success: true,
        config: {
          upiId: configMap.payment_upi_id || 'engineeringday2026@upi',
          accountName: configMap.payment_account_name || 'Engineering Day 2026 Organizers',
          qrCodeUrl: configMap.payment_qr_code || '/uploads/qr_codes/default_qr.jpeg',
          instructions: configMap.payment_instructions || 'Scan QR and pay through UPI.',
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load payment configuration.' });
    }
  }

  /**
   * Submit payment proof (screenshot + transactionId / UTR)
   */
  async submitPaymentProof(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { registrationId, transactionId, paymentDate } = req.body;

      if (!registrationId) {
        res.status(400).json({ success: false, message: 'Registration ID is required.' });
        return;
      }

      if (!transactionId || transactionId.trim().length < 4) {
        res.status(400).json({
          success: false,
          message: 'A valid Transaction ID / UTR number (minimum 4 characters) is required.',
        });
        return;
      }

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Payment screenshot is required. Please upload a clear image receipt.',
        });
        return;
      }

      // Check registration ownership
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: true,
          student: { include: { studentProfile: true } },
          payment: true,
        },
      });

      if (!registration) {
        res.status(404).json({ success: false, message: 'Registration not found.' });
        return;
      }

      if (registration.studentId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized action on registration.' });
        return;
      }

      // Stored path relative to server root
      const screenshotFilename = req.file.filename;

      // Process payment proof via PaymentService
      const result = await paymentService.processManualUpiPayment(
        registrationId,
        transactionId,
        screenshotFilename,
        paymentDate ? new Date(paymentDate) : new Date()
      );

      // Notify student
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: `Payment Submitted: ${registration.event.name}`,
          message: `Your payment proof for ${registration.event.name} (UTR: ${transactionId}) has been submitted and is under review.`,
          type: 'INFO',
          link: `/student/registrations/${registration.id}`,
        },
      });

      // Send email
      if (registration.student.studentProfile?.fullName) {
        emailService
          .sendRegistrationSubmittedEmail(
            registration.student.email,
            registration.student.studentProfile.fullName,
            registration.event.name,
            registration.registrationNumber
          )
          .catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: result.message,
        duplicateFlag: result.duplicateFlag,
        registrationId: registration.id,
        status: 'UNDER_REVIEW',
      });
    } catch (error) {
      console.error('Payment submission error:', error);
      res.status(500).json({ success: false, message: 'Failed to process payment submission.' });
    }
  }

  /**
   * Securely serve payment screenshots.
   * Access is strictly restricted to the student owner or an authorized administrator.
   */
  async getPaymentScreenshot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { filename } = req.params;

      // 1. Check regular individual event payment
      const payment = await prisma.payment.findFirst({
        where: { screenshotPath: filename },
        include: { registration: true },
      });

      // 2. Check E-Sports team payment
      const teamPayment = !payment
        ? await prisma.teamPayment.findFirst({
            where: { screenshotPath: filename },
            include: { team: true },
          })
        : null;

      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'EVENT_COORDINATOR'].includes(req.user.role);
      const isOwner =
        (payment && payment.registration.studentId === req.user.id) ||
        (teamPayment && teamPayment.team.captainId === req.user.id);

      // If not tied to a DB record, but physically exists on disk and user is admin, allow viewing
      const filePath = path.resolve(__dirname, '../../uploads/payment_proofs', filename);

      if (!payment && !teamPayment) {
        if (isAdmin && fs.existsSync(filePath)) {
          res.sendFile(filePath);
          return;
        }
        res.status(404).json({ success: false, message: 'Payment receipt not found.' });
        return;
      }

      if (!isAdmin && !isOwner) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this payment proof.',
        });
        return;
      }

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ success: false, message: 'Payment image file not found on disk.' });
        return;
      }

      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving payment screenshot.' });
    }
  }
}

export const paymentController = new PaymentController();
