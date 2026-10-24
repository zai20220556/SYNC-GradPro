import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import profileRoutes from './routes/profile.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get('/health', (req, res) => res.json({ ok: true, name: 'SYNC API' }));
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/profile', profileRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SYNC API running on http://localhost:${port}`));
