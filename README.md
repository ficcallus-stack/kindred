# KindredCare US 🇺🇸

KindredCare is a premium, high-fidelity childcare marketplace designed to bridge the gap between elite caregivers and families seeking boutique-level service. Built with a focus on trust, safety, and operational excellence.

## 🚀 Quick Start

### 1. Prerequisite
- Node.js (v20+)
- Neon PostgreSQL Account
- Firebase Project
- Stripe Account
- Ably Account
- Upstash Account (Redis)
- ZeptoMail API Key

### 2. Setup
```bash
git clone <repository-url>
cd nannyUS
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in your secrets:
```bash
cp .env.example .env.local
```

### 4. Database Setup
Push the schema to your Neon database:
```bash
npm run db:push
```

### 5. Run Locally
```bash
npm run dev
```

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Database**: Drizzle ORM + Neon (PostgreSQL)
- **Auth**: Firebase Authentication (Client) + Firebase Admin (Server)
- **Realtime**: Ably (Messaging & Notifications)
- **Payments**: Stripe Connect (Escrow & Payouts)
- **Email**: ZeptoMail via REST
- **Storage**: Cloudflare R2 (Media & Documents)
- **Analytics**: PostHog

## 🛡️ Trust & Safety Features
- **Ghost Protocol**: Advanced admin impersonation for concierge support.
- **Verification Wizard**: Multi-stage vetting (ID, Video Selfie, Background Auth).
- **Escrow System**: Funds held until service completion.
- **Milestones**: Real-time care logging and photo sharing.

## 📁 Architecture
- `src/app`: Next.js App Router (Dashboard, Public Pages, API)
- `src/components`: UI Components organized by domain
- `src/db`: Drizzle Schema and Database connection
- `src/lib`: Core business logic, utilities, and provider wrappers
- `src/hooks`: Custom React hooks

## 📜 License
Internal Project - All Rights Reserved.
