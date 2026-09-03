import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.isConfigured = true;
      console.log('📧 EmailService initialized with live SMTP credentials.');
    } else {
      console.log('📧 EmailService in mock/development mode (emails will be logged to console).');
    }
  }

  async sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
    const from = process.env.EMAIL_FROM || 'Engineering Day 2026 <no-reply@engineeringday2026.edu>';

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''),
        });
        return true;
      } catch (error) {
        console.error('Failed to send live email via SMTP:', error);
        return false;
      }
    } else {
      // Mock logger fallback
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📨 [MOCK EMAIL] TO: ${to}`);
      console.log(`📌 SUBJECT: ${subject}`);
      console.log(`📝 CONTENT:\n${text || html.replace(/<[^>]*>?/gm, '')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    }
  }

  async sendWelcomeEmail(to: string, studentName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Engineering Day 2026 Registration Portal',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #010914; color: #FFFFFF; padding: 24px; border-radius: 8px;">
          <h1 style="color: #FFC800; margin-bottom: 8px;">ENGINEERING DAY 2026</h1>
          <p style="color: #00D9FF; font-weight: bold;">14th & 15th September 2026</p>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>Your student account has been created successfully. You can now log in, explore official events, and submit your registrations.</p>
          <p>Next steps:</p>
          <ol>
            <li>Select an event (BGMI, Free Fire, Blind Coding, Quiz, Cultural Performance)</li>
            <li>Scan the official UPI QR code and complete payment</li>
            <li>Upload your payment screenshot with UTR number</li>
          </ol>
          <p style="margin-top: 24px; color: #D0D5DC;">— Engineering Day Organizing Committee</p>
        </div>
      `,
    });
  }

  async sendRegistrationSubmittedEmail(to: string, studentName: string, eventName: string, regId: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Registration Submitted: ${eventName} (${regId})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #010914; color: #FFFFFF; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00D9FF;">Registration Under Review</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>Your registration for <strong>${eventName}</strong> has been received with ID: <code style="color: #FFC800;">${regId}</code>.</p>
          <p>Your payment proof is currently <strong>UNDER REVIEW</strong> by the administration team. You will be notified once it is verified.</p>
        </div>
      `,
    });
  }

  async sendApprovalEmail(to: string, studentName: string, eventName: string, regId: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎉 Registration Approved: ${eventName} (${regId})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #010914; color: #FFFFFF; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00D9FF;">Registration Confirmed ✓</h2>
          <p>Congratulations <strong>${studentName}</strong>,</p>
          <p>Your payment has been verified and your registration for <strong>${eventName}</strong> is officially <strong>APPROVED</strong>!</p>
          <p>Registration ID: <strong style="color: #FFC800;">${regId}</strong></p>
          <p>Please log in to your Student Dashboard to download and print your official event entry card.</p>
        </div>
      `,
    });
  }

  async sendRejectionEmail(to: string, studentName: string, eventName: string, regId: string, reason: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `⚠️ Action Required: Payment Update for ${eventName} (${regId})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #010914; color: #FFFFFF; padding: 24px; border-radius: 8px;">
          <h2 style="color: #FF4444;">Payment Verification Notice</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>Your submitted payment for <strong>${eventName}</strong> (${regId}) could not be verified.</p>
          <p><strong>Reason provided by Admin:</strong></p>
          <blockquote style="background: rgba(255,255,255,0.1); padding: 12px; border-left: 4px solid #FF4444; color: #FFC800;">
            ${reason}
          </blockquote>
          <p>Please log in to your Student Dashboard to upload a clear, valid payment proof or correct the transaction UTR.</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
