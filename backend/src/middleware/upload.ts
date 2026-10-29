import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const name = crypto.randomUUID() + path.extname(file.originalname).toLowerCase();
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB each, max 5 images
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError(400, 'Only JPG, PNG or WEBP images are allowed'));
  },
});