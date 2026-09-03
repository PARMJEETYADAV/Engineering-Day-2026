import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { paymentService } from '../services/paymentService';

const prisma = new PrismaClient();

export class RegistrationController {
  /**
   * Create an event registration for the authenticated student
   */
  async createRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { eventId, teamName, teamMembers, notes } = req.body;

      if (!eventId) {
        res.status(400).json({ success: false, message: 'Event ID is required.' });
        return;
      }

      // Fetch event from database
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              registrations: {
                where: { status: { in: ['APPROVED', 'UNDER_REVIEW', 'PAYMENT_PENDING'] } },
              },
            },
          },
        },
      });

      if (!event) {
        res.status(404).json({ success: false, message: 'The selected event was not found.' });
        return;
      }

      if (!event.isRegistrationOpen) {
        res.status(400).json({
          success: false,
          message: `Registrations for ${event.name} are currently closed.`,
        });
        return;
      }

      if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
        res.status(400).json({
          success: false,
          message: `Registration capacity has been reached for ${event.name}.`,
        });
        return;
      }

      // Check duplicate registration for same student + same event
      const existingRegistration = await prisma.registration.findUnique({
        where: {
          studentId_eventId: {
            studentId: req.user.id,
            eventId: event.id,
          },
        },
        include: { payment: true },
      });

      if (existingRegistration) {
        res.status(409).json({
          success: false,
          message: `You have already registered for ${event.name}. Check your Student Dashboard to view or update your registration.`,
          registrationId: existingRegistration.id,
          registrationNumber: existingRegistration.registrationNumber,
          status: existingRegistration.status,
        });
        return;
      }

      // Generate unique registration number
      const registrationNumber = await paymentService.generateRegistrationNumber(event.slug);

      // Status: if event is free / requires no payment, mark as APPROVED automatically or UNDER_REVIEW
      const initialStatus = event.requiresPayment && event.registrationFee > 0 ? 'PAYMENT_PENDING' : 'APPROVED';

      const registration = await prisma.registration.create({
        data: {
          registrationNumber,
          studentId: req.user.id,
          eventId: event.id,
          status: initialStatus,
          teamName: teamName || null,
          teamMembers: teamMembers ? JSON.stringify(teamMembers) : null,
          notes: notes || null,
        },
        include: {
          event: true,
          student: {
            include: { studentProfile: true },
          },
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: `Registration Initiated: ${event.name}`,
          message:
            initialStatus === 'APPROVED'
              ? `Your registration for ${event.name} has been confirmed!`
              : `Your registration ID is ${registrationNumber}. Complete the payment step to submit for verification.`,
          type: 'INFO',
          link: `/student/registrations/${registration.id}`,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Registration initiated successfully.',
        registration,
      });
    } catch (error) {
      console.error('Create registration error:', error);
      res.status(500).json({ success: false, message: 'Failed to create event registration.' });
    }
  }

  /**
   * Get all registrations for current logged-in student
   */
  async getMyRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const registrations = await prisma.registration.findMany({
        where: { studentId: req.user.id },
        include: {
          event: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, registrations });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
    }
  }

  /**
   * Get specific registration details
   */
  async getRegistrationDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          event: true,
          payment: true,
          student: {
            include: { studentProfile: true },
          },
        },
      });

      if (!registration) {
        res.status(404).json({ success: false, message: 'Registration not found.' });
        return;
      }

      // Security check: Only the student owner or an admin can view this registration
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'EVENT_COORDINATOR'].includes(req.user.role);
      if (!isAdmin && registration.studentId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied: You do not own this registration.' });
        return;
      }

      res.status(200).json({ success: true, registration });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving registration details.' });
    }
  }
}

export const registrationController = new RegistrationController();
