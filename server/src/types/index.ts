import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'EVENT_COORDINATOR';
  isActive: boolean;
  mustChangePassword?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export enum RegistrationStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESUBMIT_REQUESTED = 'RESUBMIT_REQUESTED',
}

export enum EventCategory {
  ESPORTS = 'ESPORTS',
  TECHNICAL = 'TECHNICAL',
  CULTURAL = 'CULTURAL',
  CEREMONY = 'CEREMONY',
}

export interface StudentRegistrationInput {
  fullName: string;
  email: string;
  mobile: string;
  course: string;
  semester: string;
  password: string;
  confirmPassword: string;
  enrollmentNumber?: string;
  department?: string;
  college?: string;
}

export interface PaymentSubmissionInput {
  registrationId: string;
  transactionId: string;
  paymentDate?: string;
}
