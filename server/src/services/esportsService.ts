import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export interface TeamMemberInput {
  fullName: string;
  email: string;
  mobile: string;
  course: string;
  semester: string;
  enrollmentNumber?: string;
  ign: string;
  gameUid: string;
}

export class EsportsService {
  /**
   * Generates a unique Team ID in format ENG26-BGMI-T0001 or ENG26-FF-T0001
   */
  async generateTeamId(game: 'BGMI' | 'FREE_FIRE'): Promise<string> {
    const gamePrefix = game === 'BGMI' ? 'BGMI' : 'FF';
    const prefix = `ENG26-${gamePrefix}-T`;

    // Find the latest team for this game
    const latestTeam = await prisma.team.findFirst({
      where: {
        game,
        teamId: { startsWith: prefix },
      },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (latestTeam && latestTeam.teamId) {
      const parts = latestTeam.teamId.split('-T');
      if (parts.length === 2) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) {
          sequence = lastNum + 1;
        }
      }
    }

    let teamId = `${prefix}${String(sequence).padStart(4, '0')}`;
    let exists = await prisma.team.findUnique({ where: { teamId } });

    while (exists) {
      sequence++;
      teamId = `${prefix}${String(sequence).padStart(4, '0')}`;
      exists = await prisma.team.findUnique({ where: { teamId } });
    }

    return teamId;
  }

  /**
   * Calculates fee strictly from database
   */
  async calculateExpectedFee(game: 'BGMI' | 'FREE_FIRE', memberCount: number): Promise<{ feePerMember: number; totalAmount: number }> {
    const eventSlug = game === 'BGMI' ? 'bgmi' : 'free-fire';
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    const feePerMember = event ? event.registrationFee : 49;
    return {
      feePerMember,
      totalAmount: feePerMember * memberCount,
    };
  }

  /**
   * Generates Excel (.xlsx) workbook containing complete esports team rosters (all 4 members + captain)
   */
  async generateTeamsExcel(teams: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Engineering Day 2026';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('E-Sports Teams');

    worksheet.columns = [
      { header: 'Team ID', key: 'teamId', width: 20 },
      { header: 'Team Name', key: 'teamName', width: 24 },
      { header: 'Game', key: 'game', width: 14 },
      { header: 'Captain Name', key: 'captainName', width: 22 },
      { header: 'Captain Email', key: 'captainEmail', width: 26 },
      { header: 'Captain Mobile', key: 'captainMobile', width: 16 },
      { header: 'Member Count', key: 'memberCount', width: 14 },
      { header: 'Member 1 Name', key: 'm1Name', width: 20 },
      { header: 'Member 1 Email', key: 'm1Email', width: 24 },
      { header: 'Member 1 Mobile', key: 'm1Mobile', width: 16 },
      { header: 'Member 1 IGN', key: 'm1Ign', width: 18 },
      { header: 'Member 1 UID', key: 'm1Uid', width: 18 },
      { header: 'Member 2 Name', key: 'm2Name', width: 20 },
      { header: 'Member 2 Email', key: 'm2Email', width: 24 },
      { header: 'Member 2 Mobile', key: 'm2Mobile', width: 16 },
      { header: 'Member 2 IGN', key: 'm2Ign', width: 18 },
      { header: 'Member 2 UID', key: 'm2Uid', width: 18 },
      { header: 'Member 3 Name', key: 'm3Name', width: 20 },
      { header: 'Member 3 Email', key: 'm3Email', width: 24 },
      { header: 'Member 3 Mobile', key: 'm3Mobile', width: 16 },
      { header: 'Member 3 IGN', key: 'm3Ign', width: 18 },
      { header: 'Member 3 UID', key: 'm3Uid', width: 18 },
      { header: 'Member 4 Name', key: 'm4Name', width: 20 },
      { header: 'Member 4 Email', key: 'm4Email', width: 24 },
      { header: 'Member 4 Mobile', key: 'm4Mobile', width: 16 },
      { header: 'Member 4 IGN', key: 'm4Ign', width: 18 },
      { header: 'Member 4 UID', key: 'm4Uid', width: 18 },
      { header: 'Fee Per Member', key: 'feePerMember', width: 16 },
      { header: 'Total Amount', key: 'totalAmount', width: 16 },
      { header: 'UTR Number', key: 'utr', width: 22 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'Team Status', key: 'teamStatus', width: 18 },
      { header: 'Registration Date', key: 'registrationDate', width: 18 },
    ];

    // Header styling: Tech Navy with Gold text
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF010914' },
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFC800' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF00D9FF' } },
        bottom: { style: 'medium', color: { argb: 'FF00D9FF' } },
      };
    });

    teams.forEach((team, index) => {
      const m1 = team.members?.[0];
      const m2 = team.members?.[1];
      const m3 = team.members?.[2];
      const m4 = team.members?.[3];

      const row = worksheet.addRow({
        teamId: team.teamId,
        teamName: team.teamName,
        game: team.game,
        captainName: team.captain?.studentProfile?.fullName || 'N/A',
        captainEmail: team.captain?.email || 'N/A',
        captainMobile: team.captain?.studentProfile?.mobile || 'N/A',
        memberCount: team.memberCount,
        m1Name: m1?.fullName || '',
        m1Email: m1?.email || '',
        m1Mobile: m1?.mobile || '',
        m1Ign: m1?.ign || '',
        m1Uid: m1?.gameUid || '',
        m2Name: m2?.fullName || '',
        m2Email: m2?.email || '',
        m2Mobile: m2?.mobile || '',
        m2Ign: m2?.ign || '',
        m2Uid: m2?.gameUid || '',
        m3Name: m3?.fullName || '',
        m3Email: m3?.email || '',
        m3Mobile: m3?.mobile || '',
        m3Ign: m3?.ign || '',
        m3Uid: m3?.gameUid || '',
        m4Name: m4?.fullName || '',
        m4Email: m4?.email || '',
        m4Mobile: m4?.mobile || '',
        m4Ign: m4?.ign || '',
        m4Uid: m4?.gameUid || '',
        feePerMember: 49,
        totalAmount: team.payment?.amount ?? team.payment?.expectedAmount ?? team.memberCount * 49,
        utr: team.payment?.transactionId || '',
        paymentStatus: team.payment?.status || 'PENDING',
        teamStatus: team.status,
        registrationDate: team.createdAt ? new Date(team.createdAt).toISOString().split('T')[0] : '',
      });

      row.height = 22;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Segoe UI', size: 10 };
        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F8FC' },
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generates CSV format for esports team rosters
   */
  async generateTeamsCsv(teams: any[]): Promise<string> {
    const headerLabels = [
      'Team ID',
      'Team Name',
      'Game',
      'Captain Name',
      'Captain Email',
      'Captain Mobile',
      'Member Count',
      'Member 1 Name',
      'Member 1 Email',
      'Member 1 Mobile',
      'Member 1 IGN',
      'Member 1 UID',
      'Member 2 Name',
      'Member 2 Email',
      'Member 2 Mobile',
      'Member 2 IGN',
      'Member 2 UID',
      'Member 3 Name',
      'Member 3 Email',
      'Member 3 Mobile',
      'Member 3 IGN',
      'Member 3 UID',
      'Member 4 Name',
      'Member 4 Email',
      'Member 4 Mobile',
      'Member 4 IGN',
      'Member 4 UID',
      'Fee Per Member',
      'Total Amount',
      'UTR',
      'Payment Status',
      'Team Status',
      'Registration Date',
    ];

    const csvRows = [headerLabels.join(',')];

    for (const team of teams) {
      const m1 = team.members?.[0];
      const m2 = team.members?.[1];
      const m3 = team.members?.[2];
      const m4 = team.members?.[3];

      const values = [
        team.teamId,
        team.teamName,
        team.game,
        team.captain?.studentProfile?.fullName || '',
        team.captain?.email || '',
        team.captain?.studentProfile?.mobile || '',
        team.memberCount,
        m1?.fullName || '',
        m1?.email || '',
        m1?.mobile || '',
        m1?.ign || '',
        m1?.gameUid || '',
        m2?.fullName || '',
        m2?.email || '',
        m2?.mobile || '',
        m2?.ign || '',
        m2?.gameUid || '',
        m3?.fullName || '',
        m3?.email || '',
        m3?.mobile || '',
        m3?.ign || '',
        m3?.gameUid || '',
        m4?.fullName || '',
        m4?.email || '',
        m4?.mobile || '',
        m4?.ign || '',
        m4?.gameUid || '',
        49,
        team.payment?.amount ?? team.payment?.expectedAmount ?? team.memberCount * 49,
        team.payment?.transactionId || '',
        team.payment?.status || 'PENDING',
        team.status,
        team.createdAt ? new Date(team.createdAt).toISOString().split('T')[0] : '',
      ];

      const escapedValues = values.map((val) => {
        const escaped = String(val ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      });

      csvRows.push(escapedValues.join(','));
    }

    return csvRows.join('\n');
  }
}

export const esportsService = new EsportsService();
