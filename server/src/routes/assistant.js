import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { aiReady, streamAiReply } from '../services/aiAssistant.js';

const router = Router();
const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT) || 300;
let usage = { day: '', count: 0 };

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(1500),
  })).min(1).max(10),
}).refine(({ messages }) => messages.every((m, i) => m.role === (i % 2 === 0 ? 'user' : 'assistant'))
  && messages.at(-1).role === 'user'
  && messages.at(-1).content.length <= 500, 'Invalid conversation.');

const chatLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many questions.', code: 'busy' },
});

function takeDailySlot() {
  const day = new Date().toISOString().slice(0, 10);
  if (usage.day !== day) usage = { day, count: 0 };
  if (usage.count >= DAILY_LIMIT) return false;
  usage.count += 1;
  return true;
}

router.get('/status', (req, res) => res.json({ ai: aiReady() }));

router.post('/chat', chatLimit, async (req, res) => {
  if (!aiReady()) return res.status(503).json({ error: 'AI is not available.', code: 'unavailable' });
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid question.', code: 'invalid' });
  if (!takeDailySlot()) return res.status(429).json({ error: 'Daily limit reached.', code: 'busy' });

  const controller = new AbortController();
  res.on('close', () => { if (!res.writableEnded) controller.abort(); });
  const begin = () => {
    if (res.headersSent) return;
    res.status(200).set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
    res.flushHeaders();
  };

  try {
    const stream = streamAiReply(parsed.data.messages, controller.signal);
    let step = await stream.next();
    while (!step.done) {
      begin();
      res.write(JSON.stringify({ text: step.value }) + '\n');
      step = await stream.next();
    }
    if (!res.headersSent) throw Object.assign(new Error('empty'), { code: 'unavailable' });
    res.write(JSON.stringify({ done: true, stop: step.value === 'length' ? 'length' : 'ok' }) + '\n');
    res.end();
  } catch (err) {
    if (controller.signal.aborted) { if (!res.writableEnded) res.end(); return; }
    console.error('Assistant error:', err?.status ?? '', err?.code ?? err?.name ?? 'Error');
    const code = err?.code === 'busy' ? 'busy' : 'unavailable';
    if (!res.headersSent) return res.status(code === 'busy' ? 429 : 503).json({ error: 'AI could not answer.', code });
    res.write(JSON.stringify({ error: true, code }) + '\n');
    res.end();
  }
});

export default router;
