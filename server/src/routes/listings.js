import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const listingSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  description: z.string().min(10),
  city: z.string().min(2),
  eventDate: z.string().datetime().optional(),
  targetAudience: z.string().optional(),
  expectedReach: z.number().int().min(0).default(0),
  supportType: z.string().default('Money'),
  imageUrl: z.string().url().optional(),
  packages: z
    .array(z.object({ name: z.string().min(2), price: z.number().int().min(0), benefits: z.string().min(2) }))
    .min(1, 'Add at least one package.'),
});

// Browse and filter: GET /listings?q=&category=&city=&maxPrice=
router.get('/', async (req, res) => {
  const { q, category, city, maxPrice } = req.query;
  const listings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category ? { category: String(category) } : {}),
      ...(city ? { city: String(city) } : {}),
      ...(q ? { OR: [{ title: { contains: String(q) } }, { description: { contains: String(q) } }] } : {}),
      ...(maxPrice ? { packages: { some: { price: { lte: Number(maxPrice) } } } } : {}),
    },
    include: { packages: true, seeker: { select: { name: true, logoUrl: true, user: { select: { isVerified: true } } } } },
    orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ listings });
});

router.get('/:id', async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
    include: { packages: true, seeker: { select: { name: true, logoUrl: true, user: { select: { isVerified: true } } } } },
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found.' });
  res.json({ listing });
});

router.post('/', requireAuth, requireRole('SEEKER'), async (req, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { packages, eventDate, ...rest } = parsed.data;

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
  const listing = await prisma.listing.create({
    data: {
      ...rest,
      ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
      seekerId: profile.id,
      packages: { create: packages },
    },
    include: { packages: true },
  });
  res.status(201).json({ listing });
});

export default router;
