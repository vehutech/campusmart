# CampusMart 🛒

**A Campus-Based E-Commerce Platform for Federal University Lokoja**

Built with Next.js 14, TypeScript, PostgreSQL (Neon), Prisma ORM, and NextAuth.js.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Auth | NextAuth.js (JWT) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd campusmart
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:
- `DATABASE_URL` — your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev

### 3. Set Up the Database

```bash
# Generate Prisma client (required before build/dev)
npx prisma generate

# Push schema to your Neon database
npx prisma db push

# Seed demo data
npx prisma db seed
```

### 4. Run the App

```bash
npm run dev
```

> **Note:** `postinstall` runs `prisma generate` automatically after every `npm install` / `pnpm install`. The `build` script also runs it. You only need to run it manually the very first time if you skip the install step.

Visit [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@campusmart.ng | password123 |
| Vendor | vendor@campusmart.ng | password123 |
| Admin | admin@campusmart.ng | password123 |

---

## Project Structure

```
campusmart/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth
│   │   ├── register/      # User registration
│   │   ├── products/      # Products CRUD
│   │   └── cart/          # Cart management
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── products/          # Product listing & detail
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Button, Input, Badge, Select
│   └── shared/            # Navbar, Footer, ProductCard
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
└── types/
    └── next-auth.d.ts     # Auth type extensions
```

---

## Deployment (Vercel + Neon)

1. Push your code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

---

## Features (Sprints)

- ✅ Sprint 1: Auth system (register/login), DB schema, project setup
- 🔄 Sprint 2: Product listings, categories, image upload
- ⏳ Sprint 3: Search/filter, product detail page
- ⏳ Sprint 4: Cart, orders, vendor dashboard
- ⏳ Sprint 5: Messaging, buyer dashboard
- ⏳ Sprint 6: Admin panel, polish, deployment
