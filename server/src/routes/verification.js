import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { uploadBuffer, uploadsReady, NOT_READY } from '../services/cloudinary.js';

const router = Router();

// My latest verification request and whether I am verified.
router.get('/mine', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { isVerified: true } });
  const latest = await prisma.verificationRequest.findFirst({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: { status: true, createdAt: true },
  });
  res.json({ isVerified: user?.isVerified ?? false, latest });
});

// Send a photo of an ID or registration for an admin to review.
router.post('/', requireAuth, requireRole('SEEKER', 'SPONSOR'), imageUpload('document', 5), async (req, res) => {
  if (!uploadsReady()) return res.status(503).json(NOT_READY);

  const pending = await prisma.verificationRequest.findFirst({ where: { userId: req.user.id, status: 'PENDING' } });
  if (pending) return res.status(409).json({ error: 'You already have a request being reviewed.' });

  const result = await uploadBuffer(req.file.buffer, { folder: 'sync/verification', type: 'authenticated', resource_type: 'image' });
  const request = await prisma.verificationRequest.create({ data: { userId: req.user.id, documentPublicId: result.public_id } });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, type: 'verification', content: 'A new verification request is waiting for review.' })),
    });
  }
  res.status(201).json({ request: { id: request.id, status: request.status } });
});

export default router;
