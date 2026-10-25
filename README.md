# SYNC: Sponsorships made simple

Graduation project, Princess Sumaya University for Technology.

- `server/` Node.js + Express API, Prisma, SQLite (switch to MySQL for the online version)
- `client/` React (Vite) app (added next)

## Run the server

```
cd server
npm install
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

The database is a local SQLite file, so there is nothing to install.
Open http://localhost:4000/health. You should see {"ok":true,"name":"SYNC API"}.

## Run the website

Terminal tab 1 (API):
```
cd server
npm run db:seed     # one time: adds fake demo users and listings
npm run dev
```

Terminal tab 2 (React app):
```
cd client
npm install
npm run dev
```

Open http://localhost:5173. Demo logins (password: password123):
olive@demo.jo (sponsor), hackathon@demo.jo (seeker), admin@demo.jo (admin).

## Database

The project uses MySQL (for example a free Aiven service). Put its address in `server/.env` as `DATABASE_URL`.
First time: `cd server && npm install && npx prisma migrate dev --name init && npm run db:seed`.

## Deploy on Render (one service runs the whole site)

- Build command:
  `cd client && npm install --include=dev && npm run build && cd ../server && npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `cd server && node src/index.js`
- Environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
