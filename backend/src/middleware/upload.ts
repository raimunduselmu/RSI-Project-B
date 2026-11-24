import multer from 'multer';
import { UPLOAD } from '../config/constants.js';
import { AppError } from '../lib/AppError.js';

/** Upload ke memori lalu simpan lewat lib/storage.ts. PDF/JPG/PNG ≤ 5 MB. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD.MAX_BYTES },
  fileFilter: (_req, file, cb) =>
    (UPLOAD.MIME as readonly string[]).includes(file.mimetype) ? cb(null, true) : cb(new AppError('ERR-VAL-05')),
});
