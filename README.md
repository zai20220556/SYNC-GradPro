# SYNC: Sponsorships made simple

Graduation project, Princess Sumaya University for Technology (PSUT), Amman.

SYNC is a sponsorship marketplace for Jordan. **Seekers** (event organisers, clubs, athletes) post opportunities with sponsorship packages. **Sponsors** (companies) browse, compare and request them. An **Admin** verifies users and manages listings. The site works in English and Arabic (right-to-left).

**Live site:** https://sync-gradpro.onrender.com
The first visit can take up to a minute, because the free server goes to sleep when nobody uses it.

## What it is built with

| Part | Technology |
|---|---|
| Front end (`client/`) | React 18, Vite, React Router, i18next (English and Arabic) |
| Back end (`server/`) | Node.js, Express, Zod (input checks) |
| Database | MySQL (hosted on Aiven), accessed through Prisma |
| File uploads | Cloudinary |
| Security | bcrypt password hashing, JWT in an httpOnly cookie, Helmet, rate limiting |
| Hosting | Render (one service runs the whole site), code on GitHub |

## Project structure

- `client/` the website users see
- `server/` the API, database schema (`server/prisma/`) and business logic
- `PRODUCT.md` and `skills-lock.json` design notes from the tools used while building; safe to ignore

## Run it on your own computer

You need Node.js 20 or newer and a MySQL database (a free Aiven service works).

1. Back end, in the first Terminal tab:
```
cd server
npm install
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run db:seed           # one time: adds demo users and listings
npm run dev
```
Open http://localhost:4000/health. You should see `{"ok":true,"name":"SYNC API"}`.

2. Front end, in a second Terminal tab:
```
cd client
npm install
npm run dev
```
Open http://localhost:5173.

Demo logins (password: `password123`):
- `olive@demo.jo` (Sponsor)
- `hackathon@demo.jo` (Seeker)
- `admin@demo.jo` (Admin)

## Environment variables

Copy `server/.env.example` to `server/.env` and fill it in. Never commit the `.env` file or share it, because it holds passwords.

- `DATABASE_URL` MySQL connection string
- `JWT_SECRET` any long random text
- `CLOUDINARY_*` optional, needed only for image and document uploads
- `GROQ_API_KEY` optional; without it the built-in SYNC Assistant answers instead

## Deploy on Render

- Build command:
  `cd client && npm install --include=dev && npm run build && cd ../server && npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `cd server && node src/index.js`
- Environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
