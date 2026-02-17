# replit.md

## Overview

InvoiceLite is a client-side invoice management application built with React and TypeScript. It allows users to create, manage, and export professional invoices with support for multiple templates (modern, corporate, minimal). All data is persisted in the browser's localStorage — there is no backend API for business logic. The server exists only to serve the static frontend in production and provide Vite HMR in development.

Key features include:
- Dashboard with revenue charts and invoice statistics
- Invoice builder with PDF export (html2canvas + jsPDF)
- Client management (CRUD)
- Item/product catalog management (CRUD)
- Company profile settings (logo upload, tax/discount config, multi-currency support)
- Three invoice PDF templates (modern, corporate, minimal)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: Custom React hooks wrapping localStorage (`client/src/lib/storage.ts`). No server API calls for invoice/client/item data.
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled via Tailwind CSS with CSS variables for theming
- **Forms**: react-hook-form with zod validation via @hookform/resolvers
- **Charts**: Recharts for dashboard revenue visualization
- **PDF Generation**: html2canvas + jsPDF for converting invoice previews to downloadable PDFs
- **Date Handling**: date-fns
- **Build Tool**: Vite with React plugin

### Layout
- `AppShell` component provides sidebar navigation + responsive mobile menu
- Pages: Dashboard, Invoices (list), InvoiceBuilder (create/edit), Clients, Items, Settings
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`

### Backend (server/)
- **Runtime**: Node.js with Express 5
- **Purpose**: Serves the Vite dev server in development and static files in production. No API routes handle business logic.
- **Database**: PostgreSQL configured via Drizzle ORM, but currently unused since all app data lives in localStorage. The DB setup (`server/db.ts`) and schema exist as scaffolding for potential future backend features.
- **Storage Layer**: `server/storage.ts` has a minimal MemStorage implementation (users only) — placeholder from the template.

### Shared (shared/)
- `shared/schema.ts`: Zod schemas defining data shapes for CompanyProfile, Client, Item, Invoice, and InvoiceItem. These are the source of truth for TypeScript types and validation, used on the client side with localStorage.
- `shared/routes.ts`: Minimal/empty — no real API routes since this is localStorage-only.

### Data Model (Zod schemas in shared/schema.ts)
- **CompanyProfile**: Company name, logo (base64), address, contact info, bank details, tax settings, currency (IDR/USD/EUR/SGD/MYR)
- **Client**: Name, company, address, email, phone, tax ID
- **Item**: Name, description, unit, price, tax rate
- **Invoice**: Invoice number, client reference, date/due date, line items, subtotal/tax/discount/grand total, status (draft/unpaid/paid), currency, template selection, notes

### localStorage Keys
All data stored under keys prefixed with `invoicelite_`:
- `invoicelite_company` — company profile
- `invoicelite_clients` — array of clients
- `invoicelite_items` — array of items
- `invoicelite_invoices` — array of invoices

### Build & Dev
- `npm run dev` — Starts Express + Vite dev server with HMR
- `npm run build` — Builds client with Vite, bundles server with esbuild into `dist/`
- `npm run start` — Runs production build from `dist/`
- `npm run db:push` — Drizzle schema push (currently unused but available)

## External Dependencies

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable — configured with Drizzle ORM (`drizzle-orm/node-postgres`) but not actively used for app data. The schema exists in `shared/schema.ts` as pgTable definitions alongside Zod schemas. Session store (`connect-pg-simple`) is available but not wired up.

### Key NPM Packages
- **UI**: shadcn/ui, Radix UI primitives, Tailwind CSS, class-variance-authority, lucide-react (icons)
- **Forms/Validation**: react-hook-form, zod, @hookform/resolvers, drizzle-zod
- **PDF**: html2canvas, jspdf
- **Charts**: recharts
- **Routing**: wouter
- **Data Fetching**: @tanstack/react-query (configured but minimal use since data is localStorage)
- **Dates**: date-fns
- **IDs**: uuid (v4)
- **Fonts**: Google Fonts (Inter, Outfit) loaded via CSS import

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)