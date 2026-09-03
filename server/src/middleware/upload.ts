import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10)) * 1024 * 1024; // 5MB

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage for payment screenshots
const paymentProofDir = path.resolve(__dirname, '../../uploads/payment_proofs');
ensureDir(paymentProofDir);

const paymentStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, paymentProofDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

// Storage for admin QR code uploads
const qrCodeDir = path.resolve(__dirname, '../../uploads/qr_codes');
ensureDir(qrCodeDir);

const qrStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, qrCodeDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}`;
    cb(null, `upi-qr-${uniqueSuffix}${ext}`);
  },
});

// Whitelist validator for image mime types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
  }
};

export const uploadPaymentProof = multer({
  storage: paymentStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const uploadQrCode = multer({
  storage: qrStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
