import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { esportsService } from '../services/esportsService';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export class EsportsController {
  /**
   * POST /api/esports/teams
   * Create a new E-Sports team (Captain is logged-in student)
   */
  async createTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const captainId = req.user?.id;
      if (!captainId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { teamName, game, captainIgn, captainGameUid, members } = req.body;

      // Validate Game
      if (!game || !['BGMI', 'FREE_FIRE'].includes(game)) {
        res.status(400).json({ success: false, message: 'Valid game (BGMI or FREE_FIRE) is required.' });
        return;
      }

      // Validate Team Name
      if (!teamName || typeof teamName !== 'string' || teamName.trim().length < 3 || teamName.trim().length > 50) {
        res.status(400).json({ success: false, message: 'Team name must be between 3 and 50 characters.' });
        return;
      }

      // Validate Captain Gaming info
      if (!captainIgn || !captainIgn.trim()) {
        res.status(400).json({ success: false, message: 'Captain In-Game Name (IGN) is required.' });
        return;
      }

      if (!captainGameUid || !captainGameUid.trim()) {
        const uidLabel = game === 'BGMI' ? 'BGMI Player ID' : 'Free Fire UID';
        res.status(400).json({ success: false, message: `Captain ${uidLabel} is required.` });
        return;
      }

      // Fetch Captain Profile
      const captainUser = await prisma.user.findUnique({
        where: { id: captainId },
        include: { studentProfile: true },
      });

      if (!captainUser || !captainUser.studentProfile) {
        res.status(400).json({ success: false, message: 'Complete your student profile before registering an E-Sports team.' });
        return;
      }

      // Check if captain already has an active team for this game
      const existingCaptainTeam = await prisma.team.findFirst({
        where: {
          captainId,
          game,
          status: { notIn: ['CANCELLED'] },
        },
      });

      if (existingCaptainTeam) {
        res.status(409).json({
          success: false,
          message: `You have already registered an active team (${existingCaptainTeam.teamName}) for ${game}. A student can be captain of only one team per game.`,
        });
        return;
      }

      // Check if team name is already taken for the same game
      const existingName = await prisma.team.findFirst({
        where: {
          teamName: { equals: teamName.trim() },
          game,
          status: { notIn: ['CANCELLED'] },
        },
      });

      if (existingName) {
        res.status(409).json({
          success: false,
          message: `The team name "${teamName.trim()}" is already registered for ${game}. Please choose another team name.`,
        });
        return;
      }

      // Validate Additional Members
      const additionalMembers = Array.isArray(members) ? members : [];
      if (additionalMembers.length > 3) {
        res.status(400).json({ success: false, message: 'Maximum team size is 4 members (Captain + up to 3 members).' });
        return;
      }

      // Track uniqueness within team
      const emails = new Set<string>([captainUser.email.toLowerCase()]);
      const mobiles = new Set<string>([captainUser.studentProfile.mobile]);
      const gameUids = new Set<string>([captainGameUid.trim().toLowerCase()]);

      for (const [index, m] of additionalMembers.entries()) {
        if (!m.fullName || !m.email || !m.mobile || !m.course || !m.semester || !m.ign || !m.gameUid) {
          res.status(400).json({
            success: false,
            message: `Member ${index + 2} has missing required fields (Name, Email, Mobile, Course, Semester, IGN, and Game UID are required).`,
          });
          return;
        }

        const emailLower = m.email.toLowerCase().trim();
        const mobileTrim = m.mobile.trim();
        const uidLower = m.gameUid.trim().toLowerCase();

        if (emails.has(emailLower)) {
          res.status(400).json({ success: false, message: `Duplicate email address detected: ${m.email}` });
          return;
        }
        if (mobiles.has(mobileTrim)) {
          res.status(400).json({ success: false, message: `Duplicate mobile number detected: ${m.mobile}` });
          return;
        }
        if (gameUids.has(uidLower)) {
          res.status(400).json({ success: false, message: `Duplicate Game UID detected: ${m.gameUid}` });
          return;
        }

        emails.add(emailLower);
        mobiles.add(mobileTrim);
        gameUids.add(uidLower);
      }

      const totalMembersCount = 1 + additionalMembers.length;
      const { feePerMember, totalAmount } = await esportsService.calculateExpectedFee(game, totalMembersCount);
      const teamId = await esportsService.generateTeamId(game);

      // Create Team and Members in database
      const createdTeam = await prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: {
            teamId,
            teamName: teamName.trim(),
            game,
            captainId,
            memberCount: totalMembersCount,
            status: 'PAYMENT_PENDING',
          },
        });

        // Add Captain as Member 1
        await tx.teamMember.create({
          data: {
            teamId: team.id,
            studentId: captainId,
            fullName: captainUser.studentProfile!.fullName,
            email: captainUser.email,
            mobile: captainUser.studentProfile!.mobile,
            course: captainUser.studentProfile!.course,
            semester: captainUser.studentProfile!.semester,
            enrollmentNumber: captainUser.studentProfile!.enrollmentNumber,
            ign: captainIgn.trim(),
            gameUid: captainGameUid.trim(),
            isCaptain: true,
          },
        });

        // Add Additional Members
        for (const m of additionalMembers) {
          await tx.teamMember.create({
            data: {
              teamId: team.id,
              fullName: m.fullName.trim(),
              email: m.email.trim(),
              mobile: m.mobile.trim(),
              course: m.course.trim(),
              semester: m.semester.trim(),
              enrollmentNumber: m.enrollmentNumber ? m.enrollmentNumber.trim() : null,
              ign: m.ign.trim(),
              gameUid: m.gameUid.trim(),
              isCaptain: false,
            },
          });
        }

        return team;
      });

      const fullTeam = await prisma.team.findUnique({
        where: { id: createdTeam.id },
        include: {
          members: { orderBy: { isCaptain: 'desc' } },
          captain: { include: { studentProfile: true } },
        },
      });

      res.status(201).json({
        success: true,
        message: 'E-Sports team created successfully. Proceed to payment.',
        team: fullTeam,
        pricing: {
          feePerMember,
          memberCount: totalMembersCount,
          totalAmount,
        },
      });
    } catch (error) {
      console.error('Create Team Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error while creating team.' });
    }
  }

  /**
   * POST /api/esports/teams/:id/members
   * Dynamically add a member to an existing draft/pending team
   */
  async addMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const captainId = req.user?.id;
      const { id } = req.params;
      const { fullName, email, mobile, course, semester, enrollmentNumber, ign, gameUid } = req.body;

      const team = await prisma.team.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      if (team.captainId !== captainId) {
        res.status(403).json({ success: false, message: 'Only the team captain can modify team members.' });
        return;
      }

      if (team.isLocked || team.status === 'APPROVED') {
        res.status(400).json({
          success: false,
          message: 'Team details are locked because this team has already been approved.',
        });
        return;
      }

      if (team.members.length >= 4) {
        res.status(400).json({ success: false, message: 'Maximum team size (4 members) already reached.' });
        return;
      }

      if (!fullName || !email || !mobile || !course || !semester || !ign || !gameUid) {
        res.status(400).json({ success: false, message: 'All member fields including IGN and Game UID are required.' });
        return;
      }

      // Check duplicates within existing members
      const emailLower = email.toLowerCase().trim();
      const mobileTrim = mobile.trim();
      const uidLower = gameUid.trim().toLowerCase();

      for (const m of team.members) {
        if (m.email.toLowerCase() === emailLower) {
          res.status(400).json({ success: false, message: 'A member with this email is already on the team.' });
          return;
        }
        if (m.mobile === mobileTrim) {
          res.status(400).json({ success: false, message: 'A member with this mobile is already on the team.' });
          return;
        }
        if (m.gameUid.toLowerCase() === uidLower) {
          res.status(400).json({ success: false, message: 'A member with this Game UID is already on the team.' });
          return;
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.teamMember.create({
          data: {
            teamId: team.id,
            fullName: fullName.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            course: course.trim(),
            semester: semester.trim(),
            enrollmentNumber: enrollmentNumber ? enrollmentNumber.trim() : null,
            ign: ign.trim(),
            gameUid: gameUid.trim(),
            isCaptain: false,
          },
        });

        await tx.team.update({
          where: { id: team.id },
          data: { memberCount: team.members.length + 1 },
        });
      });

      const updatedTeam = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      const pricing = await esportsService.calculateExpectedFee(team.game as any, updatedTeam!.memberCount);

      res.status(200).json({
        success: true,
        message: 'Member added successfully.',
        team: updatedTeam,
        pricing,
      });
    } catch (error) {
      console.error('Add Member Error:', error);
      res.status(500).json({ success: false, message: 'Failed to add team member.' });
    }
  }

  /**
   * DELETE /api/esports/teams/:id/members/:memberId
   * Remove an additional member from the team
   */
  async removeMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const captainId = req.user?.id;
      const { id, memberId } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      if (team.captainId !== captainId) {
        res.status(403).json({ success: false, message: 'Only the team captain can remove members.' });
        return;
      }

      if (team.isLocked || team.status === 'APPROVED') {
        res.status(400).json({ success: false, message: 'Cannot modify members after team approval.' });
        return;
      }

      const member = team.members.find((m) => m.id === memberId);
      if (!member) {
        res.status(404).json({ success: false, message: 'Member not found on this team.' });
        return;
      }

      if (member.isCaptain) {
        res.status(400).json({ success: false, message: 'The team captain cannot be removed from the team.' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.teamMember.delete({ where: { id: memberId } });
        await tx.team.update({
          where: { id: team.id },
          data: { memberCount: Math.max(1, team.members.length - 1) },
        });
      });

      const updatedTeam = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      const pricing = await esportsService.calculateExpectedFee(team.game as any, updatedTeam!.memberCount);

      res.status(200).json({
        success: true,
        message: 'Member removed successfully.',
        team: updatedTeam,
        pricing,
      });
    } catch (error) {
      console.error('Remove Member Error:', error);
      res.status(500).json({ success: false, message: 'Failed to remove member.' });
    }
  }

  /**
   * POST /api/esports/teams/:id/payment
   * Submit payment proof and UTR for the entire team
   */
  async submitTeamPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const captainId = req.user?.id;
      const { id } = req.params;
      const { transactionId, driveUrl } = req.body;
      const file = req.file;

      if (!transactionId || transactionId.trim().length < 6) {
        res.status(400).json({ success: false, message: 'Valid 12-digit UTR/Transaction ID is required.' });
        return;
      }

      const team = await prisma.team.findUnique({
        where: { id },
        include: { members: true, payment: true },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      if (team.captainId !== captainId) {
        res.status(403).json({ success: false, message: 'Only the team captain can submit payment.' });
        return;
      }

      if (team.status === 'APPROVED') {
        res.status(400).json({ success: false, message: 'This team is already approved.' });
        return;
      }

      // Calculate backend fee strictly
      const { totalAmount } = await esportsService.calculateExpectedFee(team.game as any, team.memberCount);

      // Determine screenshot filename
      const screenshotPath = file ? file.filename : team.payment?.screenshotPath || null;
      const officialDriveUrl = driveUrl || process.env.DRIVE_STORAGE_URL || 'https://drive.google.com/drive/folders/1KR_u6xWgPn8Zns9CGV10-tDh8V-J4WCF?usp=drive_link';

      await prisma.$transaction(async (tx) => {
        await tx.teamPayment.upsert({
          where: { teamId: team.id },
          create: {
            teamId: team.id,
            amount: totalAmount,
            expectedAmount: totalAmount,
            transactionId: transactionId.trim().toUpperCase(),
            screenshotPath,
            driveUrl: officialDriveUrl,
            status: 'UNDER_REVIEW',
            paymentDate: new Date(),
          },
          update: {
            amount: totalAmount,
            expectedAmount: totalAmount,
            transactionId: transactionId.trim().toUpperCase(),
            screenshotPath: screenshotPath ?? undefined,
            driveUrl: officialDriveUrl,
            status: 'UNDER_REVIEW',
            rejectionReason: null,
            paymentDate: new Date(),
          },
        });

        await tx.team.update({
          where: { id: team.id },
          data: { status: 'UNDER_REVIEW' },
        });
      });

      res.status(200).json({
        success: true,
        message: 'Payment proof submitted successfully. Status is now UNDER REVIEW.',
        status: 'UNDER_REVIEW',
        expectedAmount: totalAmount,
      });
    } catch (error) {
      console.error('Submit Team Payment Error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit payment.' });
    }
  }

  /**
   * GET /api/student/my-teams
   * Fetch all teams where current user is captain
   */
  async getMyTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const captainId = req.user?.id;
      const teams = await prisma.team.findMany({
        where: { captainId },
        include: {
          members: { orderBy: { isCaptain: 'desc' } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, teams });
    } catch (error) {
      console.error('Get My Teams Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch teams.' });
    }
  }

  /**
   * GET /api/esports/teams/:id
   * Get single team details
   */
  async getTeamById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          members: { orderBy: { isCaptain: 'desc' } },
          payment: true,
          captain: { include: { studentProfile: true } },
        },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found.' });
        return;
      }

      // Check authorization
      const isAdmin = userRole && ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
      if (team.captainId !== userId && !isAdmin) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const pricing = await esportsService.calculateExpectedFee(team.game as any, team.memberCount);

      res.status(200).json({
        success: true,
        team,
        pricing,
        driveStorageUrl: process.env.DRIVE_STORAGE_URL || 'https://drive.google.com/drive/folders/1KR_u6xWgPn8Zns9CGV10-tDh8V-J4WCF?usp=drive_link',
      });
    } catch (error) {
      console.error('Get Team By ID Error:', error);
      res.status(500).json({ success: false, message: 'Failed to load team details.' });
    }
  }
}

export const esportsController = new EsportsController();
