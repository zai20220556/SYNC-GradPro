import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

const ticketSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(190),
  type: z.enum(['QUESTION', 'PROBLEM', 'FEEDBACK']),
  subject: z.string().trim().min(3, 'Add a short subject.').max(150),
  message: z.string().trim().min(10, 'Write at least 10 characters.').max(2000),
});

const sendLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many messages. Please try again later.' },
});

// Anyone can contact support. A logged-in sender is linked so they can see the reply.
router.post('/', sendLimit, optionalAuth, async (req, res) => {
  const parsed = ticketSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const ticket = await prisma.supportTicket.create({
    data: { ...parsed.data, userId: req.user?.id ?? null },
    select: { id: true, status: true },
  });

  // The message is already saved, so a failed alert must not report the send as failed.
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({ userId: a.id, type: 'support', content: `New support message: "${parsed.data.subject}".` })),
      });
    }
  } catch (err) {
    console.error(err);
  }
  res.status(201).json({ ticket });
});

router.get('/mine', requireAuth, async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: req.user.id },
    select: { id: true, type: true, subject: true, message: true, status: true, adminReply: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ tickets });
});

export default router;
