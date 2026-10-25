import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Only the seeker and the sponsor on a request can read or write its messages.
async function loadRequest(user, id) {
  const request = await prisma.sponsorshipRequest.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, seeker: { select: { name: true, userId: true } } } },
      sponsor: { select: { businessName: true, userId: true } },
    },
  });
  if (!request) return null;
  const allowed = request.sponsor.userId === user.id || request.listing.seeker.userId === user.id;
  return allowed ? request : null;
}

router.get('/:id/messages', requireAuth, async (req, res) => {
  const request = await loadRequest(req.user, Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  const messages = await prisma.message.findMany({ where: { requestId: request.id }, orderBy: { sentAt: 'asc' } });
  res.json({ messages: messages.map((m) => ({ id: m.id, content: m.content, sentAt: m.sentAt, mine: m.senderId === req.user.id })) });
});

router.post('/:id/messages', requireAuth, async (req, res) => {
  const parsed = z.object({ content: z.string().trim().min(1).max(1000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Write a message first.' });
  const request = await loadRequest(req.user, Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Request not found.' });

  const message = await prisma.message.create({ data: { requestId: request.id, senderId: req.user.id, content: parsed.data.content } });

  const iAmSponsor = request.sponsor.userId === req.user.id;
  await prisma.notification.create({
    data: {
      userId: iAmSponsor ? request.listing.seeker.userId : request.sponsor.userId,
      type: 'message',
      content: `New message from ${iAmSponsor ? request.sponsor.businessName : request.listing.seeker.name} about "${request.listing.title}".`,
    },
  });
  res.status(201).json({ message: { id: message.id, content: message.content, sentAt: message.sentAt, mine: true } });
});

export default router;
