import 'dotenv/config';
import 'express-async-errors'; // lets Express catch errors thrown inside async routes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import profileRoutes from './routes/profile.js';
import requestRoutes from './routes/requests.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import matchRoutes from './routes/matches.js';
import uploadRoutes from './routes/uploads.js';
import verificationRoutes from './routes/verification.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const app = express();

app.set('trust proxy', 1); // the hosting service sits in front of the server

app.use(
  helmet(
    isProd
      ? {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
            },
          },
        }
      : undefined
  )
);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const api = express.Router();
api.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
api.get('/health', (req, res) => res.json({ ok: true, name: 'SYNC API' }));
api.use('/auth', authRoutes);
api.use('/listings', listingRoutes);
api.use('/profile', profileRoutes);
api.use('/requests', requestRoutes);
api.use('/requests', messageRoutes);
api.use('/notifications', notificationRoutes);
api.use('/matches', matchRoutes);
api.use('/bookings', bookingRoutes);
api.use('/admin', adminRoutes);
api.use('/uploads', uploadRoutes);
api.use('/verification', verificationRoutes);
app.use('/api', api);
app.get('/health', (req, res) => res.json({ ok: true, name: 'SYNC API' }));

// In production the server also serves the built React app, so one service runs the whole site.
if (isProd) {
  const dist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SYNC running on http://localhost:${port}`));
