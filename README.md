# KaffeeKasse

Produktionsreife Web-App für Kühlschrank-Kiosk und Admin-Dashboard.

## Features
- Kiosk ohne Login mit Benutzer-Grid, Getränkebuchung, Offline-Queue (IndexedDB), idempotenten Buchungen per `clientUuid`.
- Admin Dashboard mit Login, RBAC (ADMIN/VIEWER), Übersicht, Benutzer/Getränke/Lager/Zahlungen/Adjustments/Audit/Export.
- Monatsrechnung: `Consumptions + Adjustments - Payments`.
- Prisma + PostgreSQL + Docker Compose.

## Quick Start (lokal)
1. `cp .env.example .env`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate deploy`
5. `npm run seed`
6. `npm run dev`

App läuft dann auf `http://localhost:3000`.

## Start mit Docker Compose
```bash
docker compose up --build
```

## Admin Login (Seed)
- E-Mail: Wert aus `SEED_ADMIN_EMAIL`
- Passwort: Wert aus `SEED_ADMIN_PASSWORD`

## Deploy Hinweise
- Managed PostgreSQL verwenden.
- `DATABASE_URL` + `JWT_SECRET` als Secret setzen.
- Beim Deploy zuerst Migrationen: `npx prisma migrate deploy`.
- Danach Seed nur initial ausführen.

## API Auszug
### Kiosk
- `GET /api/kiosk/users`
- `GET /api/kiosk/drinks`
- `POST /api/kiosk/consume`
- `GET /api/kiosk/user/:id/invoices`
- `GET /api/kiosk/drink/:id/recent`

### Admin
- `POST /api/admin/login`
- `CRUD /api/admin/users`
- `CRUD /api/admin/drinks`
- `POST /api/admin/stock`
- `CRUD /api/admin/payments`
- `CRUD /api/admin/adjustments`
- `GET /api/admin/debts`
- `GET /api/admin/audit`
