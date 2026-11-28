import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer } from '../utils/cloudinary.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Files are kept in memory, then sent to Cloudinary. 4 MB each (Vercel limits a request to about 4.5 MB).
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(400, 'Only JPG, PNG, WEBP or PDF files are allowed')),
});

const readFiles = (req, res, next) =>
  parser.array('attachments', 3)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(400, 'Each file must be 4 MB or smaller'));
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') return next(new ApiError(400, 'You can attach up to 3 files'));
    next(err);
  });

// Upload middleware: parses multipart form, uploads files, puts results in req.uploaded
export const withAttachments = [
  readFiles,
  asyncHandler(async (req, res, next) => {
    // multipart sends everything as text, so turn "true"/"false" back into booleans
    if (typeof req.body?.isInternal === 'string') req.body.isInternal = req.body.isInternal === 'true';
    req.uploaded = [];
    if (req.files?.length) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) throw new ApiError(500, 'File uploads are not configured on the server');
      req.uploaded = await Promise.all(req.files.map(uploadBuffer));
    }
    next();
  }),
];
