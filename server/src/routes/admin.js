import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { signedUrl, uploadsReady } from '../services/cloudinary.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));


// Pending verification requests, with a signed link to each document.
router.get('/verifications', async (req, res) => {
  const items = await prisma.verificationRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { email: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({
    verifications: items.map((v) => ({
      id: v.id,
      email: v.user.email,
      role: v.user.role,
      createdAt: v.createdAt,
      documentUrl: uploadsReady() ? signedUrl(v.documentPublicId) : null,
    })),
  });
});

router.patch('/verifications/:id', async (req, res) => {
  const parsed = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose approve or reject.' });
  const v = await prisma.verificationRequest.findUnique({ where: { id: Number(req.params.id) } });
  if (!v) return res.status(404).json({ error: 'Request not found.' });
  if (v.status !== 'PENDING') return res.status(409).json({ error: 'This request was already reviewed.' });

  await prisma.verificationRequest.update({
    where: { id: v.id },
    data: { status: parsed.data.status, reviewedById: req.user.id, reviewedAt: new Date() },
  });
  if (parsed.data.status === 'APPROVED') await prisma.user.update({ where: { id: v.userId }, data: { isVerified: true } });
  await prisma.notification.create({
    data: {
      userId: v.userId,
      type: 'verification',
      content: parsed.data.status === 'APPROVED' ? 'Your account is now verified.' : 'Your verification request was rejected. You can send a new photo.',
    },
  });
  res.json({ ok: true });
});

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isVerified: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});

router.patch('/users/:id', async (req, res) => {
  const parsed = z.object({ isVerified: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Send isVerified as true or false.' });
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { isVerified: parsed.data.isVerified },
    select: { id: true, email: true, role: true, isVerified: true },
  });
  res.json({ user });
});

router.get('/listings', async (req, res) => {
  const listings = await prisma.listing.findMany({
    include: { seeker: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ listings });
});

router.delete('/listings/:id', async (req, res) => {
  await prisma.listing.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
