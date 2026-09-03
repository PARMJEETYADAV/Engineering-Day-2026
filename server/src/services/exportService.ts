import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExportFilterOptions {
  status?: string;
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

export class ExportService {
  /**
   * Fetches filtered registrations with student and payment relations
   */
  async getFilteredRegistrations(filters: ExportFilterOptions) {
    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.eventId && filters.eventId !== 'ALL') {
      where.eventId = filters.eventId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        event: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return registrations.map((r) => ({
      registrationId: r.registrationNumber,
      studentName: r.student.studentProfile?.fullName || 'N/A',
      email: r.student.email,
      mobile: r.student.studentProfile?.mobile || 'N/A',
      course: r.student.studentProfile?.course || 'N/A',
      semester: r.student.studentProfile?.semester || 'N/A',
      enrollmentNumber: r.student.studentProfile?.enrollmentNumber || 'N/A',
      department: r.student.studentProfile?.department || 'N/A',
      college: r.student.studentProfile?.college || 'N/A',
      event: r.event.name,
      fee: r.payment?.amount ?? r.event.registrationFee,
      transactionId: r.payment?.transactionId || 'N/A',
      paymentStatus: r.payment?.status || 'NOT_SUBMITTED',
      registrationStatus: r.status,
      registrationDate: r.createdAt.toISOString().split('T')[0],
      paymentDate: r.payment?.paymentDate ? r.payment.paymentDate.toISOString().split('T')[0] : 'N/A',
    }));
  }

  /**
   * Generates a styled Excel (.xlsx) workbook buffer
   */
  async generateExcelWorkbook(filters: ExportFilterOptions): Promise<Buffer> {
    const data = await this.getFilteredRegistrations(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Engineering Day 2026 Admin Portal';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Registrations', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Registration ID', key: 'registrationId', width: 22 },
      { header: 'Student Name', key: 'studentName', width: 26 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Mobile', key: 'mobile', width: 16 },
      { header: 'Course', key: 'course', width: 18 },
      { header: 'Semester', key: 'semester', width: 12 },
      { header: 'Enrollment No', key: 'enrollmentNumber', width: 18 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Event', key: 'event', width: 26 },
      { header: 'Fee (₹)', key: 'fee', width: 12 },
      { header: 'Transaction ID / UTR', key: 'transactionId', width: 24 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'Registration Status', key: 'registrationStatus', width: 20 },
      { header: 'Registration Date', key: 'registrationDate', width: 16 },
      { header: 'Payment Date', key: 'paymentDate', width: 16 },
    ];

    // Header styling
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
        color: { argb: 'FFFFC800' }, // Yellow header text
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF00D9FF' } },
        bottom: { style: 'medium', color: { argb: 'FF00D9FF' } },
      };
    });

    // Add rows
    data.forEach((row, index) => {
      const excelRow = worksheet.addRow(row);
      excelRow.height = 22;
      excelRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 10 ? 'right' : 'left' };
        cell.font = { name: 'Segoe UI', size: 10 };
        // Alternate zebra striping
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
   * Generates CSV format string with clean column headers
   */
  async generateCsv(filters: ExportFilterOptions): Promise<string> {
    const data = await this.getFilteredRegistrations(filters);
    const headerLabels = [
      'Registration ID',
      'Student Name',
      'Email',
      'Mobile',
      'Course',
      'Semester',
      'Enrollment Number',
      'Department',
      'College',
      'Event',
      'Fee',
      'Transaction ID',
      'Payment Status',
      'Registration Status',
      'Registration Date',
      'Payment Date',
    ];

    const keys = [
      'registrationId',
      'studentName',
      'email',
      'mobile',
      'course',
      'semester',
      'enrollmentNumber',
      'department',
      'college',
      'event',
      'fee',
      'transactionId',
      'paymentStatus',
      'registrationStatus',
      'registrationDate',
      'paymentDate',
    ];

    const csvRows = [headerLabels.join(',')];

    for (const item of data) {
      const values = keys.map((key) => {
        const val = (item as any)[key] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

export const exportService = new ExportService();
