# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance management app (Spanish UI) built with Next.js 16, React 19, and PostgreSQL. Mobile-first responsive design for tracking transactions, budgets, and accounts.

## Commands

```bash
pnpm dev              # Start development server (Turbopack)
pnpm build            # Generate Prisma client + build for production
pnpm test             # Run Vitest in watch mode
pnpm test:run         # Run tests once
pnpm lint             # ESLint
pnpm format           # Prettier

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes (dev)
pnpm db:migrate       # Create migration
pnpm db:migrate:deploy # Apply migrations (prod)
pnpm db:studio        # Prisma Studio GUI
pnpm db:seed -- email@example.com  # Seed data for user

# Background worker
pnpm worker           # Start BullMQ worker for CSV imports
```

## Architecture

### Data Flow Pattern
```
Component → Server Action → Service → Prisma → PostgreSQL
                ↓
         Zod validation
                ↓
         revalidatePath()
```

### Directory Structure
- `src/app/(auth)/` - Public routes (login)
- `src/app/(app)/` - Protected routes (dashboard, transactions, budgets, settings, import)
- `src/server/actions/` - Server actions with `"use server"` directive
- `src/server/services/` - Business logic layer
- `src/lib/validators/` - Zod schemas (Spanish error messages)
- `src/components/ui/` - shadcn/ui components (new-york style)
- `src/workers/` - BullMQ job processors

### Authentication
- NextAuth.js v5 with JWT strategy
- Providers: Email magic link (Resend) + Google OAuth (optional)
- `requireAuth()` in `src/lib/auth.ts` for server actions
- Middleware protects all routes except `/login`, `/api/auth/*`

### Key Utilities
- `src/lib/money.ts` - Currency formatting (es-DO locale, RD$ default)
- `src/lib/dates.ts` - Date range helpers
- `src/lib/queue.ts` - BullMQ queue configuration
- `src/lib/db.ts` - Prisma singleton

### Background Jobs
CSV import runs via BullMQ + Redis. Start worker with `pnpm worker` in separate terminal.

## Database Models

Core finance models in `prisma/schema.prisma`:
- `FinanceAccount` - Cash, Bank, Credit Card accounts
- `Category` - Hierarchical (parent/subcategories), typed INCOME/EXPENSE
- `Transaction` - INCOME/EXPENSE/ADJUSTMENT with amount as Decimal(15,2)
- `Budget` - Monthly limits per category
- `ImportJob` - CSV import tracking

## Conventions

- All UI text, validation errors, and enums are in Spanish
- Amounts stored as `Decimal(15,2)` in database
- Server actions validate input with Zod before calling services
- Use `revalidatePath()` after mutations
- Path alias: `@/*` maps to `./src/*`
- Prettier: 90 char width, double quotes, trailing commas (es5)
