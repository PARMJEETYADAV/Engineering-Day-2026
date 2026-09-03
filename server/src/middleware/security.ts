import { Request, Response, NextFunction } from 'express';

/**
 * Deep sanitization of string values to neutralize XSS, script injection, and control characters.
 */
function sanitizeString(val: string): string {
  if (!val || typeof val !== 'string') return val;

  return val
    // Strip script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Strip javascript: pseudo-protocol
    .replace(/javascript:/gi, '')
    // Strip onload, onerror, onclick inline event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Strip null byte characters that can bypass file/input checks
    .replace(/\0/g, '');
}

/**
 * Recursively sanitizes any object or array to block prototype pollution,
 * NoSQL injection ($ operators), and malicious scripts.
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Block prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      // Block NoSQL injection keys starting with $
      if (key.startsWith('$')) {
        continue;
      }
      clean[key] = sanitizeObject(obj[key]);
    }
    return clean;
  }

  return obj;
}

/**
 * Security Middleware: Sanitizes request body, query params, and route parameters.
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Security Middleware: Injects strict enterprise HTTP defense headers.
 */
export const enforceSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  // Remove Express identification
  res.removeHeader('X-Powered-By');

  next();
};
