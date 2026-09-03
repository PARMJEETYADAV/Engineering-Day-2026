import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaymentGatewayResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  duplicateFlag?: boolean;
}

export class PaymentService {
  /**
   * Calculates the exact fee for an event directly from the database.
   * NEVER trust fee or amount sent by the client frontend.
   */
  async getVerifiedEventFee(eventId: string): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { registrationFee: true, requiresPayment: true },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.requiresPayment) {
      return 0;
    }

    return event.registrationFee;
  }

  /**
   * Check whether a Transaction ID (UTR) has already been used in another registration.
   * Detects duplicate UTR entries.
   */
  async checkDuplicateTransactionId(transactionId: string, currentRegistrationId?: string): Promise<boolean> {
    const cleanUtr = transactionId.trim();
    if (!cleanUtr) return false;

    const existing = await prisma.payment.findFirst({
      where: {
        transactionId: {
          equals: cleanUtr,
        },
        registrationId: currentRegistrationId ? { not: currentRegistrationId } : undefined,
      },
    });

    return !!existing;
  }

  /**
   * Process manual UPI proof submission.
   */
  async processManualUpiPayment(
    registrationId: string,
    transactionId: string,
    screenshotPath: string,
    paymentDate?: Date
  ): Promise<PaymentGatewayResponse> {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return { success: false, message: 'Registration record not found' };
    }

    // Always fetch amount from DB
    const verifiedAmount = registration.event.requiresPayment ? registration.event.registrationFee : 0;

    // Check duplicate UTR
    const isDuplicateUtr = await this.checkDuplicateTransactionId(transactionId, registrationId);

    // Upsert payment record
    const payment = await prisma.payment.upsert({
      where: { registrationId },
      update: {
        amount: verifiedAmount,
        transactionId: transactionId.trim(),
        screenshotPath,
        status: 'UNDER_REVIEW',
        rejectionReason: null,
        paymentDate: paymentDate || new Date(),
      },
      create: {
        registrationId,
        amount: verifiedAmount,
        transactionId: transactionId.trim(),
        screenshotPath,
        status: 'UNDER_REVIEW',
        paymentDate: paymentDate || new Date(),
      },
    });

    // Update registration status to UNDER_REVIEW
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'UNDER_REVIEW' },
    });

    return {
      success: true,
      message: isDuplicateUtr
        ? 'Payment submitted. Note: This UTR has been flagged for admin verification due to potential duplicate usage.'
        : 'Payment submitted successfully and is under administrative review.',
      paymentId: payment.id,
      duplicateFlag: isDuplicateUtr,
    };
  }

  /**
   * Formats a unique registration number: e.g. ENG26-BGMI-000123
   */
  async generateRegistrationNumber(eventSlug: string): Promise<string> {
    const prefixSetting = await prisma.systemSetting.findUnique({
      where: { key: 'registration_id_prefix' },
    });
    const prefix = prefixSetting ? prefixSetting.value : 'ENG26';

    const count = await prisma.registration.count();
    const sequence = String(count + 1).padStart(6, '0');
    const cleanSlug = eventSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);

    return `${prefix}-${cleanSlug}-${sequence}`;
  }
}

export const paymentService = new PaymentService();
