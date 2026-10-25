import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const requestInclude = {
  listing: { select: { id: true, title: true, seekerId: true, seeker: { select: { name: true, userId: true } } } },
  package: true,
  sponsor: { select: { businessName: true, userId: true } },
};
const include = { request: { include: requestInclude } };

// True when this user is the seeker or the sponsor on the request.
async function isParticipant(user, request) {
  if (user.role === 'SEEKER') {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } });
    return request.listing.seekerId === profile.id;
  }
  if (user.role === 'SPONSOR') {
    const profile = await prisma.sponsorProfile.findUnique({ where: { userId: user.id } });
    return request.sponsorId === profile.id;
  }
  return false;
}

const createSchema = z.object({
  requestId: z.number().int(),
  agreedValue: z.number().int().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Either side records a deal after the request was accepted.
router.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Check the deal details.' });
  const { requestId, agreedValue, startDate, endDate } = parsed.data;

  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id: requestId },
    include: { ...requestInclude, booking: true },
  });
  if (!request || !(await isParticipant(req.user, request))) return res.status(404).json({ error: 'Request not found.' });
  if (request.status !== 'ACCEPTED') return res.status(409).json({ error: 'Only accepted requests can become a deal.' });
  if (request.booking) return res.status(409).json({ error: 'This deal is already recorded.' });

  const booking = await prisma.booking.create({
    data: {
      requestId,
      agreedValue: agreedValue ?? request.package.price,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    },
    include,
  });
  res.status(201).json({ booking });
});

router.get('/', requireAuth, async (req, res) => {
  let where;
  if (req.user.role === 'SEEKER') {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    where = { request: { listing: { seekerId: profile.id } } };
  } else if (req.user.role === 'SPONSOR') {
    const profile = await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } });
    where = { request: { sponsorId: profile.id } };
  } else {
    return res.status(403).json({ error: 'You do not have access to this.' });
  }
  const bookings = await prisma.booking.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  res.json({ bookings });
});


// Dashboard numbers for the logged-in user, using the latest report of each deal.
router.get('/summary', requireAuth, async (req, res) => {
  let where;
  if (req.user.role === 'SEEKER') {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: req.user.id } });
    where = { request: { listing: { seekerId: profile.id } } };
  } else if (req.user.role === 'SPONSOR') {
    const profile = await prisma.sponsorProfile.findUnique({ where: { userId: req.user.id } });
    where = { request: { sponsorId: profile.id } };
  } else {
    return res.status(403).json({ error: 'You do not have access to this.' });
  }
  const bookings = await prisma.booking.findMany({ where, include: { reports: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  const latest = bookings.map((b) => b.reports[0]).filter(Boolean);
  const avg = latest.length ? latest.reduce((sum, r) => sum + r.engagement, 0) / latest.length : 0;
  res.json({
    summary: {
      deals: bookings.length,
      totalValue: bookings.reduce((sum, b) => sum + b.agreedValue, 0),
      totalReach: latest.reduce((sum, r) => sum + r.reach, 0),
      avgEngagement: Math.round(avg * 10) / 10,
      totalSales: latest.reduce((sum, r) => sum + r.reportedSales, 0),
    },
  });
});

const reportSchema = z.object({
  reach: z.number().int().min(0),
  engagement: z.number().min(0).max(100),
  reportedSales: z.number().int().min(0),
  notes: z.string().max(500).optional(),
});

router.get('/:id/reports', requireAuth, async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!booking || !(await isParticipant(req.user, booking.request))) return res.status(404).json({ error: 'Deal not found.' });
  const reports = await prisma.performanceReport.findMany({ where: { bookingId: booking.id }, orderBy: { createdAt: 'desc' } });
  res.json({ reports: reports.map((r) => ({ ...r, mine: r.reportedById === req.user.id })), expectedReach: booking.request.listing.expectedReach ?? null });
});

router.post('/:id/reports', requireAuth, async (req, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Check the numbers: reach and sales are whole numbers, engagement is 0 to 100.' });
  const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!booking || !(await isParticipant(req.user, booking.request))) return res.status(404).json({ error: 'Deal not found.' });
  const report = await prisma.performanceReport.create({ data: { ...parsed.data, bookingId: booking.id, reportedById: req.user.id } });
  res.status(201).json({ report });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const parsed = z.object({ status: z.enum(['CONFIRMED', 'ACTIVE', 'COMPLETED']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose a valid status.' });

  const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!booking || !(await isParticipant(req.user, booking.request))) return res.status(404).json({ error: 'Deal not found.' });

  const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: parsed.data.status }, include });
  res.json({ booking: updated });
});

export default router;
