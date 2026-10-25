import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const include = {
  listing: { select: { id: true, title: true, seekerId: true, seeker: { select: { name: true, userId: true } } } },
  package: true,
  sponsor: { select: { businessName: true, userId: true } },
  booking: true,
};

const createSchema = z.object({
  listingId: z.number().int(),
  packageId: z.number().int(),
  message: z.string().min(2, 'Write a short message.'),
});

// Sponsor sends a request for one package of a listing.
router.post('/', requireAuth, requireRole('SPONSOR'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { listingId, packageId, message } = parsed.data;

  const pkg = await prisma.package.findUnique({ where: { id: packageId }, include: { listing: { include: { seeker: true } } } });
  if (!pkg || pkg.listingId !== listingId) return res.status(400).json({ error: 'That package does not belong to this listing.' });

  const sponsor = await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } });
  const open = await prisma.sponsorshipRequest.findFirst({ where: { listingId, sponsorId: sponsor.id, status: 'PENDING' } });
  if (open) return res.status(409).json({ error: 'You already have a pending request for this listing.' });

  const request = await prisma.sponsorshipRequest.create({
    data: { listingId, packageId, sponsorId: sponsor.id, message },
    include,
  });
  await prisma.notification.create({
    data: { userId: pkg.listing.seeker.userId, type: 'request', content: `${sponsor.businessName} sent a request for "${pkg.listing.title}".` },
  });
  res.status(201).json({ request });
});

// Seekers see requests on their listings. Sponsors see the requests they sent.
router.get('/', requireAuth, async (req, res) => {
  let where;
  if (req.user.role === 'SEEKER') {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    where = { listing: { seekerId: profile.id } };
  } else if (req.user.role === 'SPONSOR') {
    const profile = await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } });
    where = { sponsorId: profile.id };
  } else {
    return res.status(403).json({ error: 'You do not have access to this.' });
  }
  const requests = await prisma.sponsorshipRequest.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  res.json({ requests });
});

// Seeker accepts or declines a pending request.
router.patch('/:id', requireAuth, requireRole('SEEKER'), async (req, res) => {
  const parsed = z.object({ status: z.enum(['ACCEPTED', 'DECLINED']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose accept or decline.' });

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
  const request = await prisma.sponsorshipRequest.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!request || request.listing.seekerId !== profile.id) return res.status(404).json({ error: 'Request not found.' });
  if (request.status !== 'PENDING') return res.status(409).json({ error: 'This request was already answered.' });

  const updated = await prisma.sponsorshipRequest.update({ where: { id: request.id }, data: { status: parsed.data.status }, include });
  await prisma.notification.create({
    data: {
      userId: request.sponsor.userId,
      type: 'request',
      content: `${request.listing.seeker.name} ${parsed.data.status === 'ACCEPTED' ? 'accepted' : 'declined'} your request for "${request.listing.title}".`,
    },
  });
  res.json({ request: updated });
});

export default router;
