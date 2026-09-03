import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { esportsService } from '../services/esportsService';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export class AdminEsportsController {
  /**
   * GET /api/admin/esports/stats
   * Summary KPI counters for E-Sports competitions
   */
  async getEsportsStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [
        totalBgmiTeams,
        totalFreeFireTeams,
        pendingTeams,
        approvedTeams,
        rejectedTeams,
        allTeams,
        approvedPayments,
      ] = await Promise.all([
        prisma.team.count({ where: { game: 'BGMI', status: { not: 'CANCELLED' } } }),
        prisma.team.count({ where: { game: 'FREE_FIRE', status: { not: 'CANCELLED' } } }),
        prisma.team.count({ where: { status: { in: ['UNDER_REVIEW', 'PAYMENT_PENDING'] } } }),
        prisma.team.count({ where: { status: 'APPROVED' } }),
        prisma.team.count({ where: { status: 'REJECTED' } }),
        prisma.team.findMany({ select: { memberCount: true } }),
        prisma.teamPayment.findMany({
          where: { status: 'APPROVED' },
          select: { amount: true },
        }),
      ]);

      const totalPlayers = allTeams.reduce((sum, t) => sum + (t.memberCount || 1), 0);
      const totalCollection = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

      res.status(200).json({
        success: true,
        stats: {
          totalBgmiTeams,
          totalFreeFireTeams,
          totalTeams: totalBgmiTeams + totalFreeFireTeams,
          pendingTeams,
          approvedTeams,
          rejectedTeams,
          totalPlayers,
          totalCollection,
        },
      });
    } catch (error) {
      console.error('Get E-Sports Stats Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch e-sports statistics.' });
    }
  }

  /**
   * GET /api/admin/esports/teams
   * Search and filter all team registrations
   */
  async getTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = '1',
        limit = '15',
        search = '',
        game = 'ALL',
        status = 'ALL',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (game && game !== 'ALL') {
        where.game = game;
      }

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { teamName: { contains: query } },
          { teamId: { contains: query } },
          { captain: { studentProfile: { fullName: { contains: query } } } },
          { captain: { email: { contains: query } } },
          { payment: { transactionId: { contains: query } } },
        ];
      }

      const [totalCount, teams] = await Promise.all([
        prisma.team.count({ where }),
        prisma.team.findMany({
          where,
          include: {
            captain: { include: { studentProfile: true } },
            members: { orderBy: { isCaptain: 'desc' } },
            payment: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limitNum,
        }),
      ]);

      res.status(200).json({
        success: true,
        teams,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error('Get E-Sports Teams Error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve teams.' });
    }
  }

  /**
   * GET /api/admin/esports/teams/:id
   * Complete team audit dossier
   */
  async getTeamById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          captain: { include: { studentProfile: true } },
          members: { orderBy: { isCaptain: 'desc' } },
          payment: true,
        },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      // Check for duplicate UTR
      let isDuplicateUtr = false;
      let duplicateUtrInfo: any = null;

      if (team.payment?.transactionId) {
        const otherPayment = await prisma.teamPayment.findFirst({
          where: {
            transactionId: team.payment.transactionId,
            teamId: { not: team.id },
          },
          include: { team: true },
        });

        if (otherPayment) {
          isDuplicateUtr = true;
          duplicateUtrInfo = {
            otherTeamId: otherPayment.team.teamId,
            otherTeamName: otherPayment.team.teamName,
          };
        }
      }

      const pricing = await esportsService.calculateExpectedFee(team.game as any, team.memberCount);

      res.status(200).json({
        success: true,
        team,
        pricing,
        isDuplicateUtr,
        duplicateUtrInfo,
        driveStorageUrl: process.env.DRIVE_STORAGE_URL || 'https://drive.google.com/drive/folders/1KR_u6xWgPn8Zns9CGV10-tDh8V-J4WCF?usp=drive_link',
      });
    } catch (error) {
      console.error('Get Team By ID Error:', error);
      res.status(500).json({ success: false, message: 'Failed to load team audit dossier.' });
    }
  }

  /**
   * PATCH /api/admin/esports/teams/:id/approve
   * Manually approve team and lock roster
   */
  async approveTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const adminEmail = req.user?.email || 'admin';
      const adminId = req.user?.id;
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: { payment: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.team.update({
          where: { id: team.id },
          data: {
            status: 'APPROVED',
            isLocked: true, // Team details locked upon approval
          },
        });

        if (team.payment) {
          await tx.teamPayment.update({
            where: { id: team.payment.id },
            data: {
              status: 'APPROVED',
              verifiedBy: adminEmail,
              verifiedAt: new Date(),
              rejectionReason: null,
            },
          });
        }

        // Audit log
        if (adminId) {
          await tx.adminActionLog.create({
            data: {
              adminId,
              action: 'APPROVE_ESPORTS_TEAM',
              targetType: 'TEAM',
              targetId: team.id,
              details: `Approved ${team.game} team: ${team.teamName} (${team.teamId}) with ${team.memberCount} members.`,
            },
          });
        }
      });

      res.status(200).json({
        success: true,
        message: `Team "${team.teamName}" approved successfully and roster is locked.`,
      });
    } catch (error) {
      console.error('Approve Team Error:', error);
      res.status(500).json({ success: false, message: 'Failed to approve team.' });
    }
  }

  /**
   * PATCH /api/admin/esports/teams/:id/reject
   * Reject team payment with mandatory explanation
   */
  async rejectTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const adminEmail = req.user?.email || 'admin';
      const adminId = req.user?.id;
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 4) {
        res.status(400).json({
          success: false,
          message: 'A valid rejection reason (minimum 4 characters) is mandatory.',
        });
        return;
      }

      const team = await prisma.team.findUnique({
        where: { id },
        include: { payment: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.team.update({
          where: { id: team.id },
          data: {
            status: 'REJECTED',
            isLocked: false, // Allow captain to resubmit
          },
        });

        if (team.payment) {
          await tx.teamPayment.update({
            where: { id: team.payment.id },
            data: {
              status: 'REJECTED',
              rejectionReason: rejectionReason.trim(),
              verifiedBy: adminEmail,
              verifiedAt: new Date(),
            },
          });
        }

        if (adminId) {
          await tx.adminActionLog.create({
            data: {
              adminId,
              action: 'REJECT_ESPORTS_TEAM',
              targetType: 'TEAM',
              targetId: team.id,
              details: `Rejected ${team.game} team: ${team.teamName}. Reason: ${rejectionReason.trim()}`,
            },
          });
        }
      });

      res.status(200).json({
        success: true,
        message: 'Team rejected. Rejection reason dispatched to team captain.',
      });
    } catch (error) {
      console.error('Reject Team Error:', error);
      res.status(500).json({ success: false, message: 'Failed to reject team.' });
    }
  }

  /**
   * PATCH /api/admin/esports/teams/:id/resubmission
   * Request new payment proof / UTR without outright disqualification
   */
  async requestResubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const adminEmail = req.user?.email || 'admin';
      const adminId = req.user?.id;
      const { id } = req.params;
      const { reason } = req.body;

      const team = await prisma.team.findUnique({
        where: { id },
        include: { payment: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      const resubmissionNote = reason?.trim() || 'Please re-upload a clear screenshot showing the full bank transaction reference.';

      await prisma.$transaction(async (tx) => {
        await tx.team.update({
          where: { id: team.id },
          data: {
            status: 'RESUBMISSION_REQUIRED',
            isLocked: false,
          },
        });

        if (team.payment) {
          await tx.teamPayment.update({
            where: { id: team.payment.id },
            data: {
              status: 'RESUBMISSION_REQUIRED',
              rejectionReason: resubmissionNote,
              verifiedBy: adminEmail,
              verifiedAt: new Date(),
            },
          });
        }

        if (adminId) {
          await tx.adminActionLog.create({
            data: {
              adminId,
              action: 'REQUEST_ESPORTS_RESUBMISSION',
              targetType: 'TEAM',
              targetId: team.id,
              details: `Requested resubmission for ${team.teamName}: ${resubmissionNote}`,
            },
          });
        }
      });

      res.status(200).json({
        success: true,
        message: 'Resubmission requested from team captain.',
      });
    } catch (error) {
      console.error('Request Resubmission Error:', error);
      res.status(500).json({ success: false, message: 'Failed to request resubmission.' });
    }
  }

  /**
   * GET /api/admin/esports/export
   * Export complete E-Sports teams ledger (Excel & CSV)
   */
  async exportTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { format = 'excel', game = 'ALL', status = 'ALL' } = req.query as Record<string, string>;

      const where: any = {};
      if (game && game !== 'ALL') where.game = game;
      if (status && status !== 'ALL') where.status = status;

      const teams = await prisma.team.findMany({
        where,
        include: {
          captain: { include: { studentProfile: true } },
          members: { orderBy: { isCaptain: 'desc' } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'csv') {
        const csvString = await esportsService.generateTeamsCsv(teams);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=Esports_Teams_${Date.now()}.csv`);
        res.status(200).send(csvString);
      } else {
        const buffer = await esportsService.generateTeamsExcel(teams);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Esports_Teams_${Date.now()}.xlsx`);
        res.status(200).send(buffer);
      }
    } catch (error) {
      console.error('Export Teams Error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate export file.' });
    }
  }
}

export const adminEsportsController = new AdminEsportsController();
