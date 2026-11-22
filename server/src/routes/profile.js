import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { CITIES, INDUSTRIES } from '../services/matching.js';

const router = Router();

const optionalInt = z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number().int().min(0).optional());

// Optional website: blank clears it, a missing http(s):// is added, and only http or https links are accepted.
const optionalWebsite = z.preprocess(
  (v) => {
    if (v == null) return undefined;
    const s = String(v).trim();
    if (s === '') return null;
    return /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : 'https://' + s;
  },
  z
    .string()
    .max(300, 'The website address is too long.')
    .url('Enter a valid website address.')
    .refine((u) => /^https?:\/\//i.test(u), 'The website must start with http:// or https://')
    .nullable()
    .optional()
);

const seekerSchema = z.object({
  name: z.string().min(2),
  seekerType: z.string().min(2).optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  audienceSize: optionalInt,
  website: optionalWebsite,
  logoUrl: z.string().url().max(500).optional(),
});

const sponsorSchema = z.object({
  businessName: z.string().min(2),
  industry: z.enum(INDUSTRIES, { message: 'Choose an industry from the list.' }).optional(),
  description: z.string().optional(),
  city: z.enum([...CITIES, ''], { message: 'Choose a city from the list.' }).optional(),
  phone: z.string().optional(),
  budgetMin: optionalInt,
  budgetMax: optionalInt,
  preferredAudience: z.string().optional(),
  logoUrl: z.string().url().max(500).optional(),
}).refine((p) => p.budgetMin == null || p.budgetMax == null || p.budgetMin <= p.budgetMax, {
  message: 'Budget from cannot be higher than budget up to.',
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
