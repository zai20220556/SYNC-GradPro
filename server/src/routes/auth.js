import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signToken, setAuthCookie, requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['SEEKER', 'SPONSOR']),
  name: z.string().min(2),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function publicUser(u) {
  return { id: u.id, email: u.email, role: u.role, isVerified: u.isVerified };
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, password, role, name } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'This email is already registered.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === 'SEEKER'
        ? { seekerProfile: { create: { name } } }
        : { sponsorProfile: { create: { businessName: name } } }),
    },
  });

  setAuthCookie(res, signToken(user));
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter your email and password.' });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password.' });

  setAuthCookie(res, signToken(user));
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { seekerProfile: true, sponsorProfile: true },
  });
  if (!user) return res.status(401).json({ error: 'Please log in.' });
  res.json({ user: { ...publicUser(user), seekerProfile: user.seekerProfile, sponsorProfile: user.sponsorProfile } });
});

export default router;
