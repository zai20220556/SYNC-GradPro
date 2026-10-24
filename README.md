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
