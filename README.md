# Vero

Vero is Truecaller for bank accounts. It is an integrable trust layer for Nigerian bank transfers, giving users a 0 to 100 Trust Score and an AI risk explanation before they send money. This web app is its first client.

## Stack
- Backend: Node.js, Express, Prisma (PostgreSQL), Gemini API
- Frontend: React (Vite), Tailwind CSS, Framer Motion, PWA (`vite-plugin-pwa`)

## Local Setup
1. Start PostgreSQL: `docker compose up -d`
2. Install dependencies: `pnpm install:all`
3. Setup Database: `cd backend && npx prisma db push && npx prisma db seed`
4. Start development servers: `pnpm dev` from root

## Demo Accounts
- `1000000007`: Clean (1 year old, Union Bank)
- `1000000014`: New (1 day old)
- `1000000021`: Mule (3 reports)
- `1000000038`: Suspended
- `1000000045`: Flagged (1 report)

**Seed User:**
Login with `clean@vero.net` / `password123`.

## Live Deployment
- [Add live URL here]

## API-First
The core of Vero is a single integration call that can be dropped into any bank's transfer flow:
```json
POST /api/verify
{ "nuban": "1000000021", "amount": 50000 }
→ { "score": 25, "flags": ["heavily_reported"], "explanation": "Multiple users have recently reported this account for suspicious behavior." }
```
