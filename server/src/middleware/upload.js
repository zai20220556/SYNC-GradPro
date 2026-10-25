import multer from 'multer';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Keeps the file in memory, then the route sends it to Cloudinary.
export function imageUpload(field, maxMb) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, IMAGE_TYPES.includes(file.mimetype)),
  }).single(field);

  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? `The image must be under ${maxMb} MB.` : 'Upload failed. Try again.';
        return res.status(400).json({ error: msg });
      }
      if (!req.file) return res.status(400).json({ error: 'Choose a JPG, PNG, or WebP image.' });
      next();
    });
}
