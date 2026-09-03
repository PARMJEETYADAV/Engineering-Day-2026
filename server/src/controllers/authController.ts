import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_eng26_replace_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  /**
   * Student registration with field validation
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        fullName,
        email,
        mobile,
        course,
        semester,
        password,
        confirmPassword,
        enrollmentNumber,
        department,
        college,
      } = req.body;

      // 1. Validation
      if (!fullName || fullName.trim().length < 2) {
        res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
      }

      const mobileRegex = /^[6-9]\d{9}$/;
      const cleanMobile = (mobile || '').replace(/\D/g, '');
      if (!mobileRegex.test(cleanMobile)) {
        res.status(400).json({ success: false, message: 'Mobile number must be a valid 10-digit Indian number.' });
        return;
      }

      if (!course || !course.trim()) {
        res.status(400).json({ success: false, message: 'Please select or enter your course/branch.' });
        return;
      }

      if (!semester || !semester.trim()) {
        res.status(400).json({ success: false, message: 'Please select your current semester.' });
        return;
      }

      if (!password || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ success: false, message: 'Passwords do not match.' });
        return;
      }

      // Check unique email
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.',
        });
        return;
      }

      // Check unique mobile
      const existingMobile = await prisma.studentProfile.findFirst({
        where: { mobile: cleanMobile },
      });

      if (existingMobile) {
        res.status(409).json({
          success: false,
          message: 'This mobile number is already registered with another student account.',
        });
        return;
      }

      // 2. Password hashing
      const passwordHash = await bcrypt.hash(password, 12);

      // 3. Create user & profile transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            passwordHash,
            role: 'STUDENT',
          },
        });

        await tx.studentProfile.create({
          data: {
            userId: user.id,
            fullName: fullName.trim(),
            mobile: cleanMobile,
            course: course.trim(),
            semester: semester.trim(),
            enrollmentNumber: enrollmentNumber ? enrollmentNumber.trim() : null,
            department: department ? department.trim() : null,
            college: college ? college.trim() : null,
          },
        });

        // Add welcome notification
        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to Engineering Day 2026!',
            message: 'Your portal account is active. Explore events and submit your registration early.',
            type: 'SUCCESS',
            link: '/events',
          },
        });

        return user;
      });

      // Send welcome email asynchronously
      emailService.sendWelcomeEmail(newUser.email, fullName.trim()).catch(() => {});

      // 4. Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Engineering Day 2026.',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: fullName.trim(),
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error while registering account.' });
    }
  }

  /**
   * User login (Students & Admins)
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, expectedRole } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          studentProfile: true,
        },
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact the administrator.',
        });
        return;
      }

      // If logging in through admin portal, enforce admin role
      if (expectedRole === 'ADMIN') {
        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'EVENT_COORDINATOR'];
        if (!adminRoles.includes(user.role)) {
          res.status(403).json({
            success: false,
            message: 'Access denied. You do not have administrative privileges.',
          });
          return;
        }
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: (JWT_EXPIRES_IN || '7d') as any }
      );

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          fullName: user.studentProfile?.fullName || (user.role === 'ADMIN' ? 'Administrator' : user.email),
          profile: user.studentProfile,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error while logging in.' });
    }
  }

  /**
   * Get current authenticated user session
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          studentProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          ...user,
          fullName: user.studentProfile?.fullName || (user.role === 'ADMIN' ? 'Administrator' : user.email),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to retrieve user session.' });
    }
  }

  /**
   * Change Password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'Current and new password are required.' });
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters and include uppercase, lowercase, and numeric characters.',
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        res.status(400).json({ success: false, message: 'New passwords do not match.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        res.status(400).json({ success: false, message: 'Current password does not match our records.' });
        return;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: false,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully!',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to change password.' });
    }
  }

  /**
   * Request password reset token
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email address is required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { studentProfile: true },
      });

      // Always return a generic success message to prevent user enumeration
      if (user) {
        const resetToken = jwt.sign(
          { id: user.id, purpose: 'PASSWORD_RESET' },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        emailService.sendEmail({
          to: user.email,
          subject: 'Password Reset Request - Engineering Day 2026',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #010914; color: #FFFFFF; padding: 24px; border-radius: 8px;">
              <h2 style="color: #FFC800;">Password Reset Request</h2>
              <p>Hello ${user.studentProfile?.fullName || 'Student'},</p>
              <p>We received a request to reset your password. Use the reset token below or visit the reset link:</p>
              <p style="background: rgba(255,255,255,0.1); padding: 12px; color: #00D9FF; word-break: break-all;">
                ${resetToken}
              </p>
              <p>This token is valid for 1 hour. If you did not request this, please ignore this email.</p>
            </div>
          `,
        }).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been dispatched.',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
    }
  }

  /**
   * Reset Password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ success: false, message: 'Passwords do not match.' });
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, and numeric digits.',
        });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
        return;
      }

      if (decoded.purpose !== 'PASSWORD_RESET' || !decoded.id) {
        res.status(400).json({ success: false, message: 'Invalid token purpose.' });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash },
      });

      res.status(200).json({
        success: true,
        message: 'Your password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error resetting password.' });
    }
  }
}

export const authController = new AuthController();
