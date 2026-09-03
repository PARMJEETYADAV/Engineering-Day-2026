import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../types';
import { exportService } from '../services/exportService';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * Dashboard statistics, KPI cards and chart data
   */
  async getDashboardStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Metric queries in parallel
      const [
        totalStudents,
        totalRegistrations,
        pendingVerifications,
        approvedRegistrations,
        rejectedRegistrations,
        eventsWithCounts,
        approvedPayments,
        pendingPayments,
        recentRegistrations,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.registration.count(),
        prisma.registration.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.registration.count({ where: { status: 'APPROVED' } }),
        prisma.registration.count({ where: { status: 'REJECTED' } }),
        prisma.event.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            registrationFee: true,
            _count: {
              select: { registrations: true },
            },
          },
        }),
        prisma.payment.aggregate({
          where: { status: 'APPROVED' },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { status: 'UNDER_REVIEW' },
          _sum: { amount: true },
        }),
        prisma.registration.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            student: { include: { studentProfile: true } },
            event: true,
            payment: true,
          },
        }),
      ]);

      const totalCollection = approvedPayments._sum.amount || 0;
      const totalPendingAmount = pendingPayments._sum.amount || 0;

      // Event-wise statistics breakdown
      const eventStats = eventsWithCounts.map((ev) => ({
        id: ev.id,
        name: ev.name,
        slug: ev.slug,
        category: ev.category,
        fee: ev.registrationFee,
        count: ev._count.registrations,
      }));

      // Status breakdown
      const statusBreakdown = {
        UNDER_REVIEW: pendingVerifications,
        APPROVED: approvedRegistrations,
        REJECTED: rejectedRegistrations,
        PAYMENT_PENDING: await prisma.registration.count({ where: { status: 'PAYMENT_PENDING' } }),
      };

      res.status(200).json({
        success: true,
        stats: {
          totalStudents,
          totalRegistrations,
          pendingVerifications,
          approvedRegistrations,
          rejectedRegistrations,
          totalCollection,
          totalPendingAmount,
          eventStats,
          statusBreakdown,
          recentRegistrations,
        },
      });
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ success: false, message: 'Failed to load dashboard metrics.' });
    }
  }

  /**
   * Searchable, filterable, sortable registrations list with pagination
   */
  async getRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '15', 10);
      const search = (req.query.search as string || '').trim();
      const eventId = req.query.eventId as string;
      const status = req.query.status as string;
      const course = req.query.course as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const skip = (page - 1) * limit;

      const where: any = {};

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (eventId && eventId !== 'ALL') {
        where.eventId = eventId;
      }

      if (course && course !== 'ALL') {
        where.student = {
          studentProfile: {
            course: { contains: course },
          },
        };
      }

      if (search) {
        where.OR = [
          { registrationNumber: { contains: search } },
          { student: { email: { contains: search } } },
          { student: { studentProfile: { fullName: { contains: search } } } },
          { student: { studentProfile: { mobile: { contains: search } } } },
          { payment: { transactionId: { contains: search } } },
        ];
      }

      const [registrations, totalCount] = await Promise.all([
        prisma.registration.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            student: { include: { studentProfile: true } },
            event: true,
            payment: true,
          },
        }),
        prisma.registration.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        registrations,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ success: false, message: 'Failed to load registrations.' });
    }
  }

  /**
   * Get complete details of a single registration
   */
  async getRegistrationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          student: { include: { studentProfile: true } },
          event: true,
          payment: true,
        },
      });

      if (!registration) {
        res.status(404).json({ success: false, message: 'Registration record not found.' });
        return;
      }

      // Check if UTR is duplicate across any other registration
      let duplicateUtrFound = false;
      if (registration.payment?.transactionId) {
        const dup = await prisma.payment.findFirst({
          where: {
            transactionId: registration.payment.transactionId,
            registrationId: { not: registration.id },
          },
          include: {
            registration: {
              include: {
                student: { include: { studentProfile: true } },
                event: true,
              },
            },
          },
        });
        if (dup) {
          duplicateUtrFound = true;
          (registration as any).duplicateUtrInfo = {
            otherRegistrationNumber: dup.registration.registrationNumber,
            otherStudent: dup.registration.student.studentProfile?.fullName || dup.registration.student.email,
            otherEvent: dup.registration.event.name,
          };
        }
      }

      res.status(200).json({
        success: true,
        registration,
        isDuplicateUtr: duplicateUtrFound,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving registration details.' });
    }
  }

  /**
   * Approve payment and confirm registration
   */
  async approvePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { registrationId } = req.params;

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

      // Update payment and registration status
      await prisma.$transaction(async (tx) => {
        if (registration.payment) {
          await tx.payment.update({
            where: { registrationId },
            data: {
              status: 'APPROVED',
              verifiedBy: req.user?.email,
              verifiedAt: new Date(),
              rejectionReason: null,
            },
          });
        }

        await tx.registration.update({
          where: { id: registrationId },
          data: { status: 'APPROVED' },
        });

        // Audit log
        await tx.adminActionLog.create({
          data: {
            adminId: req.user!.id,
            action: 'APPROVE_PAYMENT',
            targetType: 'REGISTRATION',
            targetId: registration.id,
            details: JSON.stringify({
              registrationNumber: registration.registrationNumber,
              eventName: registration.event.name,
              amount: registration.payment?.amount ?? registration.event.registrationFee,
              utr: registration.payment?.transactionId,
            }),
          },
        });

        // Student in-app notification
        await tx.notification.create({
          data: {
            userId: registration.studentId,
            title: `Payment Approved: ${registration.event.name}`,
            message: `Your registration (${registration.registrationNumber}) has been approved! You can now download your official entry pass.`,
            type: 'SUCCESS',
            link: `/student/registrations/${registration.id}`,
          },
        });
      });

      // Dispatch approval email
      if (registration.student.studentProfile?.fullName) {
        emailService
          .sendApprovalEmail(
            registration.student.email,
            registration.student.studentProfile.fullName,
            registration.event.name,
            registration.registrationNumber
          )
          .catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'Registration and payment successfully verified and approved.',
      });
    } catch (error) {
      console.error('Approve payment error:', error);
      res.status(500).json({ success: false, message: 'Failed to approve payment.' });
    }
  }

  /**
   * Reject payment (rejectionReason is strictly required)
   */
  async rejectPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { registrationId } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason || rejectionReason.trim().length < 4) {
        res.status(400).json({
          success: false,
          message: 'A detailed rejection reason is required so the student can rectify the issue.',
        });
        return;
      }

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

      await prisma.$transaction(async (tx) => {
        if (registration.payment) {
          await tx.payment.update({
            where: { registrationId },
            data: {
              status: 'REJECTED',
              verifiedBy: req.user?.email,
              verifiedAt: new Date(),
              rejectionReason: rejectionReason.trim(),
            },
          });
        }

        await tx.registration.update({
          where: { id: registrationId },
          data: { status: 'REJECTED' },
        });

        // Audit log
        await tx.adminActionLog.create({
          data: {
            adminId: req.user!.id,
            action: 'REJECT_PAYMENT',
            targetType: 'REGISTRATION',
            targetId: registration.id,
            details: JSON.stringify({
              registrationNumber: registration.registrationNumber,
              reason: rejectionReason.trim(),
            }),
          },
        });

        // Student notification
        await tx.notification.create({
          data: {
            userId: registration.studentId,
            title: `Payment Rejected: ${registration.event.name}`,
            message: `Payment proof for ${registration.registrationNumber} was rejected. Reason: "${rejectionReason.trim()}". Please re-upload proof.`,
            type: 'ERROR',
            link: `/student/registrations/${registration.id}`,
          },
        });
      });

      // Dispatch rejection email
      if (registration.student.studentProfile?.fullName) {
        emailService
          .sendRejectionEmail(
            registration.student.email,
            registration.student.studentProfile.fullName,
            registration.event.name,
            registration.registrationNumber,
            rejectionReason.trim()
          )
          .catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'Payment rejected. Student has been notified with the provided reason.',
      });
    } catch (error) {
      console.error('Reject payment error:', error);
      res.status(500).json({ success: false, message: 'Failed to reject payment.' });
    }
  }

  /**
   * Request resubmission of payment proof
   */
  async requestResubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { registrationId } = req.params;
      const { note } = req.body;

      const reason = note || 'Payment screenshot unclear or missing transaction reference. Please re-upload.';

      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: { event: true, payment: true },
      });

      if (!registration) {
        res.status(404).json({ success: false, message: 'Registration not found.' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        if (registration.payment) {
          await tx.payment.update({
            where: { registrationId },
            data: {
              status: 'RESUBMIT_REQUESTED',
              rejectionReason: reason,
            },
          });
        }

        await tx.registration.update({
          where: { id: registrationId },
          data: { status: 'PAYMENT_PENDING' },
        });

        await tx.adminActionLog.create({
          data: {
            adminId: req.user!.id,
            action: 'REQUEST_RESUBMISSION',
            targetType: 'REGISTRATION',
            targetId: registration.id,
            details: JSON.stringify({ reason }),
          },
        });

        await tx.notification.create({
          data: {
            userId: registration.studentId,
            title: `Re-upload Requested: ${registration.event.name}`,
            message: `Please upload a new payment proof for ${registration.registrationNumber}: ${reason}`,
            type: 'WARNING',
            link: `/student/registrations/${registration.id}`,
          },
        });
      });

      res.status(200).json({
        success: true,
        message: 'Re-submission request sent to student.',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to request resubmission.' });
    }
  }

  /**
   * Student Management: Get all students
   */
  async getStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const search = (req.query.search as string || '').trim();

      const skip = (page - 1) * limit;

      const where: any = { role: 'STUDENT' };
      if (search) {
        where.OR = [
          { email: { contains: search } },
          { studentProfile: { fullName: { contains: search } } },
          { studentProfile: { mobile: { contains: search } } },
          { studentProfile: { enrollmentNumber: { contains: search } } },
        ];
      }

      const [students, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true,
            studentProfile: true,
            _count: {
              select: { registrations: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        students,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
    }
  }

  /**
   * Toggle student account active/inactive
   */
  async toggleStudentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { studentId } = req.params;

      const user = await prisma.user.findUnique({ where: { id: studentId } });
      if (!user) {
        res.status(404).json({ success: false, message: 'Student user not found.' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: studentId },
        data: { isActive: !user.isActive },
      });

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: updated.isActive ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
          targetType: 'STUDENT',
          targetId: studentId,
          details: JSON.stringify({ email: user.email, newState: updated.isActive }),
        },
      });

      res.status(200).json({
        success: true,
        message: `Student account ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
        isActive: updated.isActive,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update student account status.' });
    }
  }

  /**
   * Event Management: Full list
   */
  async getAllEventsAdmin(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const events = await prisma.event.findMany({
        orderBy: [{ day: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      });

      res.status(200).json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch events.' });
    }
  }

  /**
   * Event Management: Create New Event with Date & Time
   */
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const {
        name,
        slug: rawSlug,
        description,
        registrationFee,
        maxParticipants,
        isRegistrationOpen = true,
        rules,
        startTime,
        endTime,
        venue = 'Apex University Auditorium, VT Road, Mansarovar',
        category = 'TECHNICAL',
        day = 'DAY_1',
        date,
        isTeamEvent = false,
        minTeamSize = 1,
        maxTeamSize = 1,
      } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Event name is required.' });
        return;
      }

      // Generate or clean slug
      let slug = (rawSlug || name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Ensure unique slug
      const existing = await prisma.event.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const eventDate = date || (day === 'DAY_2' ? '15 September 2026' : '14 September 2026');
      const fee = registrationFee !== undefined ? Math.max(0, parseInt(registrationFee, 10) || 0) : 0;

      const created = await prisma.event.create({
        data: {
          name: name.trim(),
          slug,
          description: description || `${name.trim()} event at Engineering Day 2026.`,
          category,
          day,
          date: eventDate,
          startTime: startTime || '10:00 AM',
          endTime: endTime || '01:00 PM',
          venue: venue || 'Apex University Auditorium, VT Road, Mansarovar',
          registrationFee: fee,
          requiresPayment: fee > 0,
          maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
          isRegistrationOpen: isRegistrationOpen !== undefined ? Boolean(isRegistrationOpen) : true,
          rules: rules || 'Standard university competition guidelines apply.',
          isTeamEvent: Boolean(isTeamEvent),
          minTeamSize: isTeamEvent ? Math.max(1, parseInt(minTeamSize, 10) || 1) : 1,
          maxTeamSize: isTeamEvent ? Math.max(1, parseInt(maxTeamSize, 10) || 1) : 1,
        },
      });

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'CREATE_EVENT',
          targetType: 'EVENT',
          targetId: created.id,
          details: JSON.stringify({ name: created.name, date: created.date, time: `${created.startTime} - ${created.endTime}`, fee: created.registrationFee }),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully.',
        event: created,
      });
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(500).json({ success: false, message: 'Failed to create new event.' });
    }
  }

  /**
   * Event Management: Update Event
   */
  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { id } = req.params;
      const {
        name,
        description,
        registrationFee,
        maxParticipants,
        isRegistrationOpen,
        rules,
        startTime,
        endTime,
        venue,
        category,
        day,
        date,
        isTeamEvent,
        minTeamSize,
        maxTeamSize,
      } = req.body;

      const fee = registrationFee !== undefined ? parseInt(registrationFee, 10) : undefined;

      const updated = await prisma.event.update({
        where: { id },
        data: {
          name,
          description,
          registrationFee: fee,
          requiresPayment: fee !== undefined ? fee > 0 : undefined,
          maxParticipants: maxParticipants !== undefined ? (maxParticipants ? parseInt(maxParticipants, 10) : null) : undefined,
          isRegistrationOpen,
          rules,
          startTime,
          endTime,
          venue,
          category,
          day,
          date,
          isTeamEvent: isTeamEvent !== undefined ? Boolean(isTeamEvent) : undefined,
          minTeamSize: minTeamSize !== undefined ? parseInt(minTeamSize, 10) : undefined,
          maxTeamSize: maxTeamSize !== undefined ? parseInt(maxTeamSize, 10) : undefined,
        },
      });

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'UPDATE_EVENT',
          targetType: 'EVENT',
          targetId: id,
          details: JSON.stringify({ name: updated.name, date: updated.date, time: `${updated.startTime} - ${updated.endTime}`, fee: updated.registrationFee }),
        },
      });

      res.status(200).json({
        success: true,
        message: 'Event updated successfully.',
        event: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update event details.' });
    }
  }

  /**
   * Event Management: Delete Event
   */
  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          registrations: {
            include: { payment: true },
          },
        },
      });

      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      // Safe cascade delete of registrations & payments for this event
      for (const reg of event.registrations) {
        if (reg.payment) {
          await prisma.payment.delete({ where: { id: reg.payment.id } }).catch(() => {});
        }
        await prisma.registration.delete({ where: { id: reg.id } }).catch(() => {});
      }

      // Delete the event
      await prisma.event.delete({ where: { id } });

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'DELETE_EVENT',
          targetType: 'EVENT',
          targetId: id,
          details: JSON.stringify({ name: event.name, slug: event.slug }),
        },
      });

      res.status(200).json({
        success: true,
        message: `Event "${event.name}" deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ success: false, message: 'Failed to delete event.' });
    }
  }

  /**
   * System & Payment Settings: Get settings
   */
  async getPaymentSettings(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settings = await prisma.systemSetting.findMany();
      const configMap: Record<string, string> = {};
      settings.forEach((s) => {
        configMap[s.key] = s.value;
      });

      res.status(200).json({ success: true, settings: configMap });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load system settings.' });
    }
  }

  /**
   * System & Payment Settings: Update text settings (UPI, Name, Instructions)
   */
  async updatePaymentSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      const { upiId, accountName, instructions, universityName, registrationIdPrefix, requiredFields } = req.body;

      const updates: { key: string; value: string }[] = [];
      if (upiId) updates.push({ key: 'payment_upi_id', value: upiId.trim() });
      if (accountName) updates.push({ key: 'payment_account_name', value: accountName.trim() });
      if (instructions) updates.push({ key: 'payment_instructions', value: instructions.trim() });
      if (universityName) updates.push({ key: 'university_name', value: universityName.trim() });
      if (registrationIdPrefix) updates.push({ key: 'registration_id_prefix', value: registrationIdPrefix.trim() });
      if (requiredFields) updates.push({ key: 'required_registration_fields', value: JSON.stringify(requiredFields) });

      for (const item of updates) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: item,
        });
      }

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'UPDATE_SYSTEM_SETTINGS',
          targetType: 'SYSTEM_SETTING',
          details: JSON.stringify(updates.map((u) => u.key)),
        },
      });

      res.status(200).json({ success: true, message: 'Settings updated successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update payment settings.' });
    }
  }

  /**
   * Upload / Replace QR Code Image
   */
  async uploadQrCodeImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Admin authentication required.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please upload an image file (JPG, PNG, WEBP).' });
        return;
      }

      const qrPath = `/uploads/qr_codes/${req.file.filename}`;

      await prisma.systemSetting.upsert({
        where: { key: 'payment_qr_code' },
        update: { value: qrPath },
        create: { key: 'payment_qr_code', value: qrPath },
      });

      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'REPLACE_QR_CODE',
          targetType: 'SYSTEM_SETTING',
          details: JSON.stringify({ qrPath }),
        },
      });

      res.status(200).json({
        success: true,
        message: 'UPI QR Code successfully updated and published to all payment pages.',
        qrCodeUrl: qrPath,
      });
    } catch (error) {
      console.error('QR code upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload QR code.' });
    }
  }

  /**
   * Export registrations to CSV or Excel (.xlsx)
   */
  async exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const format = (req.query.format as string || 'excel').toLowerCase();
      const status = req.query.status as string;
      const eventId = req.query.eventId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const filters = { status, eventId, startDate, endDate };

      if (format === 'csv') {
        const csvContent = await exportService.generateCsv(filters);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Engineering_Day_2026_Registrations_${Date.now()}.csv"`
        );
        res.status(200).send(csvContent);
      } else {
        const excelBuffer = await exportService.generateExcelWorkbook(filters);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Engineering_Day_2026_Registrations_${Date.now()}.xlsx"`
        );
        res.status(200).send(excelBuffer);
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate export file.' });
    }
  }

  /**
   * View Admin Audit Logs
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '25', 10);
      const skip = (page - 1) * limit;

      const [logs, totalCount] = await Promise.all([
        prisma.adminActionLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { email: true, role: true },
            },
          },
        }),
        prisma.adminActionLog.count(),
      ]);

      res.status(200).json({
        success: true,
        logs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load audit logs.' });
    }
  }

  /**
   * Reset / Clear all registration and payment data from database
   */
  async clearRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Only administrators can purge database records.' });
        return;
      }

      // Purge registrations, payments, teams, and notifications in relational order
      const delPayments = await prisma.payment.deleteMany({});
      const delRegs = await prisma.registration.deleteMany({});
      const delTeamPayments = await prisma.teamPayment.deleteMany({});
      const delTeamMembers = await prisma.teamMember.deleteMany({});
      const delTeams = await prisma.team.deleteMany({});
      const delNotifs = await prisma.notification.deleteMany({});
      const delProfiles = await prisma.studentProfile.deleteMany({});
      const delStudents = await prisma.user.deleteMany({ where: { role: 'STUDENT' } });

      // Clean uploads
      const uploadsDir = path.resolve(__dirname, '../../uploads/payment_proofs');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            try {
              fs.unlinkSync(path.join(uploadsDir, file));
            } catch {}
          }
        }
      }

      // Record audit log
      await prisma.adminActionLog.create({
        data: {
          adminId: req.user.id,
          action: 'DATABASE_REGISTRATIONS_PURGE',
          targetType: 'SYSTEM',
          targetId: 'ALL_REGISTRATIONS',
          details: `Admin purged all registration data & student accounts. Cleared: ${delRegs.count} registrations, ${delPayments.count} payments, ${delTeams.count} esports teams, ${delStudents.count} student accounts.`,
        },
      });

      res.status(200).json({
        success: true,
        message: `Database purged successfully. Cleared ${delRegs.count} registrations, ${delPayments.count} payments, ${delTeams.count} esports teams, ${delStudents.count} student accounts, and all uploaded proof files.`,
        cleared: {
          registrations: delRegs.count,
          payments: delPayments.count,
          teams: delTeams.count,
          teamMembers: delTeamMembers.count,
          students: delStudents.count,
        },
      });
    } catch (error) {
      console.error('Error purging registrations:', error);
      res.status(500).json({ success: false, message: 'Failed to purge database registration data.' });
    }
  }
}

export const adminController = new AdminController();
