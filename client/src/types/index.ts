export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'EVENT_COORDINATOR';
  isActive: boolean;
  mustChangePassword?: boolean;
  fullName: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  course: string;
  semester: string;
  enrollmentNumber?: string | null;
  department?: string | null;
  college?: string | null;
}

export interface EventItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  day: 'DAY_1' | 'DAY_2';
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  registrationFee: number;
  maxParticipants?: number | null;
  isRegistrationOpen: boolean;
  requiresPayment: boolean;
  rules?: string | null;
  isTeamEvent: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  registeredCount?: number;
  isFull?: boolean;
}

export type RegistrationStatusType =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PaymentItem {
  id: string;
  registrationId: string;
  amount: number;
  transactionId: string;
  screenshotPath?: string | null;
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMIT_REQUESTED';
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  paymentDate?: string | null;
  createdAt: string;
}

export interface RegistrationItem {
  id: string;
  registrationNumber: string;
  studentId: string;
  eventId: string;
  status: RegistrationStatusType;
  teamName?: string | null;
  teamMembers?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  event: EventItem;
  payment?: PaymentItem | null;
  student?: {
    email: string;
    studentProfile?: StudentProfile;
  };
}

export interface PaymentConfig {
  upiId: string;
  accountName: string;
  qrCodeUrl: string;
  instructions: string;
}

export interface AdminStats {
  totalStudents: number;
  totalRegistrations: number;
  pendingVerifications: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  totalCollection: number;
  totalPendingAmount: number;
  eventStats: {
    id: string;
    name: string;
    slug: string;
    category: string;
    fee: number;
    count: number;
  }[];
  statusBreakdown: Record<string, number>;
  recentRegistrations: RegistrationItem[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  studentId?: string | null;
  fullName: string;
  email: string;
  mobile: string;
  course: string;
  semester: string;
  enrollmentNumber?: string | null;
  ign: string;
  gameUid: string;
  isCaptain: boolean;
  createdAt: string;
}

export interface TeamPayment {
  id: string;
  teamId: string;
  amount: number;
  expectedAmount: number;
  transactionId: string;
  screenshotPath?: string | null;
  driveUrl?: string | null;
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED';
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  paymentDate?: string | null;
}

export interface TeamItem {
  id: string;
  teamId: string;
  teamName: string;
  game: 'BGMI' | 'FREE_FIRE';
  captainId: string;
  memberCount: number;
  status: 'PAYMENT_PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED' | 'CANCELLED';
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  captain?: {
    email: string;
    studentProfile?: StudentProfile;
  };
  members: TeamMember[];
  payment?: TeamPayment | null;
}

export interface EsportsStats {
  totalBgmiTeams: number;
  totalFreeFireTeams: number;
  totalTeams: number;
  pendingTeams: number;
  approvedTeams: number;
  rejectedTeams: number;
  totalPlayers: number;
  totalCollection: number;
}

