const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'media');

const ALLOWED_TYPES = {
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'image/webp': 'Image',
  'audio/mpeg': 'Audio',
  'audio/wav': 'Audio',
  'audio/ogg': 'Audio',
  'audio/mp3': 'Audio',
  'video/mp4': 'Video',
  'video/webm': 'Video',
  'video/ogg': 'Video',
  'application/pdf': 'Document',
  'text/csv': 'Document',
  'text/plain': 'Document',
  'application/json': 'Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Document',
  'application/vnd.ms-excel': 'Document',
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không hỗ trợ. Chỉ chấp nhận Image, Audio, Video, PDF, CSV, TXT, JSON, Excel.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { upload, UPLOAD_DIR, ALLOWED_TYPES };
