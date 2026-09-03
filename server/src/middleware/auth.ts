import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_eng26_replace_in_prod';

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required. Please log in.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'EVENT_COORDINATOR';
    };

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The account associated with this session no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated by university administration.',
      });
      return;
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Session has expired or token is invalid. Please log in again.',
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EVENT_COORDINATOR'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrative privileges required.',
    });
    return;
  }

  next();
};

export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied: Super Admin privileges required.',
    });
    return;
  }

  next();
};

export const requireStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Access restricted to student accounts.',
    });
    return;
  }

  next();
};
