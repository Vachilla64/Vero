# Vero — The Trust Layer for the African Economy

Vero is Truecaller for bank accounts. It is an integrable trust layer for Nigerian bank transfers, giving users a 0 to 100 Trust Score and an AI-driven risk explanation before they send money.

This repository contains the **Vero Core API (Backend)** and the **Vero Consumer Mobile App (Frontend PWA)**.

## 🏗 Architecture & Stack
- **Backend**: Node.js, Express, Prisma (PostgreSQL), Gemini API.
- **Frontend (Mobile App)**: React (Vite), Tailwind CSS, Framer Motion, PWA (`vite-plugin-pwa`).
- **B2B Developer Portal**: See the `VeroSite` repository for the B2B dashboard and documentation.

## 🚀 Local Setup

1. **Start PostgreSQL**: 
   ```bash
   docker compose up -d
   ```
2. **Install dependencies**: 
   ```bash
   pnpm install:all
   ```
3. **Setup Database & Seed Demo Data**: 
   ```bash
   cd backend && npx prisma db push && npx prisma db seed
   ```
4. **Start Development Servers**: 
   ```bash
   pnpm dev
   ```
   *(This starts both the backend API and the frontend mobile app concurrently).*

## 🧪 Demo Accounts (Seed Data)
The database seed script provides ready-to-use accounts for demonstrating the Trust AI:

- `1000000007`: **Clean** (1 year old, Union Bank)
- `1000000014`: **New** (1 day old)
- `1000000021`: **Mule** (3 reports)
- `1000000038`: **Suspended**
- `1000000045`: **Flagged** (1 report)
- `9876543210`: **Known Bad Actor - "Ella Stores"** (GTBank) - *Heavily reported, suspended, suspicious transaction spike.*

**Demo User Login:**
- **Email:** `clean@vero.net`
- **Password:** `password123`

## 🔌 API-First Integration
The core of Vero is a single integration call that can be dropped into any fintech or banking app's transfer flow:

```json
POST /api/verify
Header: x-api-key: <your_api_key>

{ 
  "nuban": "9876543210", 
  "bankCode": "058",
  "amount": 50000 
}
```
**Response:**
```json
{ 
  "score": 15, 
  "flags": ["heavily_reported", "suspended", "velocity_spike"], 
  "explanation": "Multiple users have recently reported this account for suspicious behavior. Furthermore, this account has a sudden, massive spike in received funds.",
  "breakdown": [...]
}
```

## 📱 Progressive Web App (PWA)
The Vero frontend is fully configured as a PWA. To test offline capabilities or install it locally, build and preview the app, or access it from a mobile device on your local network.
