import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { uploadBuffer, uploadsReady, NOT_READY } from '../services/cloudinary.js';

const router = Router();

// Public image (logo or listing photo). Returns its URL.
router.post('/image', requireAuth, imageUpload('image', 3), async (req, res) => {
  if (!uploadsReady()) return res.status(503).json(NOT_READY);
  const result = await uploadBuffer(req.file.buffer, { folder: 'sync/images', resource_type: 'image' });
  res.json({ url: result.secure_url });
});

export default router;
