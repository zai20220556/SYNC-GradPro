import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { scoreListing } from '../services/matching.js';

const router = Router();

// Sponsor: match score for every published listing, best first.
router.get('/', requireAuth, requireRole('SPONSOR'), async (req, res) => {
  const sponsor = await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } });
  const listings = await prisma.listing.findMany({ where: { status: 'PUBLISHED' }, include: { packages: true } });
  const matches = listings
    .map((l) => ({ listingId: l.id, ...scoreListing(sponsor, l) }))
    .sort((a, b) => b.score - a.score);
  res.json({ matches });
});

export default router;
