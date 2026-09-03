import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import registrationRoutes from './routes/registrationRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';
import esportsRoutes from './routes/esportsRoutes';
import adminEsportsRoutes from './routes/adminEsportsRoutes';
import { sanitizeInputs, enforceSecurityHeaders } from './middleware/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Hardening: Disable information disclosure
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    noSniff: true,
    frameguard: { action: 'deny' },
  })
);

// Defense-in-depth security headers
app.use(enforceSecurityHeaders);

// CORS configuration
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during university development/preview
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Anti-XSS, Anti-Injection, and Prototype Pollution Sanitizer
app.use(sanitizeInputs);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting against scraping and DDoS
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please wait a few moments.' },
});

// Tight rate limiting on authentication to block brute-force password cracking
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

// Admin rate limiter to prevent admin panel abuse
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded for administrative operations.' },
});

app.use('/api/', globalApiLimiter);

// Serve Public QR codes statically so payment screens can display them
app.use(
  '/uploads/qr_codes',
  express.static(path.resolve(__dirname, '../uploads/qr_codes'))
);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'Engineering Day 2026 Registration Portal API',
    security: 'ACTIVE',
    timestamp: new Date().toISOString(),
    eventDates: '14th & 15th September 2026',
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/esports', esportsRoutes);
app.use('/api/admin/esports', adminLimiter, adminEsportsRoutes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Requested API endpoint not found.' });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'Uploaded file exceeds the maximum 5MB size limit.' });
      return;
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }

  if (err.message && err.message.includes('Invalid file format')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Our technical committee has been alerted.',
  });
});

import { ensureDatabaseInitialized } from './utils/initDatabase';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 Engineering Day 2026 API server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📅 Event Dates: 14th & 15th September 2026`);
    await ensureDatabaseInitialized();
  });
}

export default app;
