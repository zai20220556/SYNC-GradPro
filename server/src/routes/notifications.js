import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json({ notifications });
});

// "read-all" must stay above "/:id/read".
router.patch('/read-all', async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  res.json({ ok: true });
});

router.patch('/:id/read', async (req, res) => {
  await prisma.notification.updateMany({ where: { id: Number(req.params.id), userId: req.user.id }, data: { isRead: true } });
  res.json({ ok: true });
});

export default router;
