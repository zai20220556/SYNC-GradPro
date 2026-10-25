import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const optionalInt = z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number().int().min(0).optional());

const seekerSchema = z.object({
  name: z.string().min(2),
  seekerType: z.string().min(2).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  audienceSize: optionalInt,
  logoUrl: z.string().url().max(500).optional(),
});

const sponsorSchema = z.object({
  businessName: z.string().min(2),
  industry: z.string().min(2).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  budgetMin: optionalInt,
  budgetMax: optionalInt,
  preferredAudience: z.string().optional(),
  logoUrl: z.string().url().max(500).optional(),
});

router.get('/', requireAuth, async (req, res) => {
  const profile =
    req.user.role === 'SEEKER'
      ? await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } })
      : req.user.role === 'SPONSOR'
        ? await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } })
        : null;
  res.json({ role: req.user.role, profile });
});

router.put('/', requireAuth, async (req, res) => {
  if (req.user.role === 'SEEKER') {
    const parsed = seekerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const profile = await prisma.seekerProfile.update({ where: { userId: req.user.id }, data: parsed.data });
    return res.json({ profile });
  }
  if (req.user.role === 'SPONSOR') {
    const parsed = sponsorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const profile = await prisma.sponsorProfile.update({ where: { userId: req.user.id }, data: parsed.data });
    return res.json({ profile });
  }
  res.status(400).json({ error: 'Admins do not have a profile.' });
});

export default router;
