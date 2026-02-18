# InvoiceLite - Agent Documentation

## Project Overview

InvoiceLite is a **client-side invoice management application** built with React and TypeScript. It allows users to create, manage, and export professional invoices with support for multiple templates (modern, corporate, minimal).

**Key Characteristics:**
- **No backend API for business logic** - All data is persisted in the browser's localStorage
- **Server serves static files only** - The Express server exists only to serve the frontend in production and provide Vite HMR in development
- **PDF generation** - Uses html2canvas + jsPDF to convert invoice previews to downloadable PDFs
- **Multi-currency support** - IDR, USD, EUR, SGD, MYR

**Main Features:**
- Dashboard with revenue charts and invoice statistics (Recharts)
- Invoice builder with PDF export
- Client management (CRUD)
- Item/product catalog management (CRUD)
- Company profile settings (logo upload, tax/discount config)
- Three invoice PDF templates (modern, corporate, minimal)

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Wouter | Lightweight client-side routing |
| TanStack Query | Data fetching (minimal use, mostly localStorage) |
| Tailwind CSS | Styling |
| shadcn/ui | UI component library (New York style) |
| Radix UI | Headless UI primitives |
| react-hook-form + Zod | Form handling and validation |
| Recharts | Dashboard charts |
| html2canvas + jsPDF | PDF generation |
| date-fns | Date formatting |
| Framer Motion | Animations |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Express 5 | Static file server |
| Drizzle ORM | Database ORM (scaffolding only, not actively used) |
| PostgreSQL | Configured but not used for app data |

### Development Tools
| Tool | Purpose |
|------|---------|
| tsx | TypeScript execution |
| esbuild | Server bundling for production |

---

## Project Structure

```
Invoice-Lite-Builder/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # AppShell (sidebar + navigation)
│   │   │   ├── shared/        # InvoicePDF component
│   │   │   └── ui/            # shadcn/ui components (40+ components)
│   │   ├── hooks/             # Custom React hooks (use-toast, use-mobile)
│   │   ├── lib/               # Utility functions
│   │   │   ├── storage.ts     # localStorage hooks for data persistence
│   │   │   ├── queryClient.ts # TanStack Query client
│   │   │   └── utils.ts       # cn() and formatCurrency()
│   │   ├── pages/             # Route components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Invoices.tsx
│   │   │   ├── InvoiceBuilder.tsx
│   │   │   ├── Clients.tsx
│   │   │   ├── Items.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── not-found.tsx
│   │   ├── App.tsx            # Main app with router
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles + CSS variables
│   └── index.html
├── server/                    # Backend (static file server only)
│   ├── index.ts               # Express server entry
│   ├── routes.ts              # API routes (empty - no backend logic)
│   ├── storage.ts             # MemStorage placeholder
│   ├── db.ts                  # Drizzle database setup
│   ├── vite.ts                # Vite dev server integration
│   └── static.ts              # Static file serving for production
├── shared/                    # Shared code between client/server
│   ├── schema.ts              # Zod schemas + TypeScript types
│   └── routes.ts              # Route definitions
├── script/
│   └── build.ts               # Custom build script (Vite + esbuild)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── components.json            # shadcn/ui configuration
```

---

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

| Alias | Target |
|-------|--------|
| `@/*` | `./client/src/*` |
| `@shared/*` | `./shared/*` |
| `@assets/*` | `./attached_assets/*` |

---

## Build and Development Commands

```bash
# Development - Starts Express + Vite dev server with HMR
npm run dev

# Production build - Builds client with Vite, bundles server with esbuild
npm run build

# Start production server - Runs from dist/index.cjs
npm run start

# Type check - Runs TypeScript compiler (no emit)
npm run check

# Database schema push - Drizzle schema push (currently unused)
npm run db:push
```

### Build Process Details

The custom build script (`script/build.ts`) does:
1. Cleans `dist/` directory
2. Builds client with Vite → outputs to `dist/public/`
3. Bundles server with esbuild → outputs to `dist/index.cjs`
   - Bundles allowlisted dependencies to reduce cold start times
   - Externalizes non-allowlisted dependencies

---

## Data Architecture

### Storage Strategy

**All application data is stored in browser localStorage.** There is no server-side persistence for invoices, clients, or items.

### localStorage Keys

All keys are prefixed with `invoicelite_`:

| Key | Data Type | Description |
|-----|-----------|-------------|
| `invoicelite_company` | `CompanyProfile` | Company profile settings |
| `invoicelite_clients` | `Client[]` | Array of clients |
| `invoicelite_items` | `Item[]` | Array of products/services |
| `invoicelite_invoices` | `Invoice[]` | Array of invoices |

### Data Types (from `shared/schema.ts`)

```typescript
// CompanyProfile - Company settings
{
  id: string;
  companyName: string;
  logo?: string;        // base64 encoded image
  address?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bankAccount?: string;
  taxId?: string;
  defaultVat: number;
  taxEnabled: boolean;
  discountEnabled: boolean;
  currency: "IDR" | "USD" | "EUR" | "SGD" | "MYR";
}

// Client - Customer information
{
  id: string;
  name: string;
  company?: string;
  address?: string;
  email?: string;
  phone?: string;
  taxId?: string;
}

// Item - Product/Service catalog
{
  id: string;
  name: string;
  description?: string;
  unit?: string;
  price: number;
  tax: number;
}

// InvoiceItem - Line item in an invoice
{
  id: string;
  itemId?: string;      // Link to saved item
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

// Invoice - Main invoice document
{
  id: string;
  invoiceNumber: string;        // Format: INV-{YYYY}-{NNN}
  date: string;                 // ISO date string
  dueDate: string;              // ISO date string
  clientId: string;
  items: InvoiceItem[];
  notes?: string;
  subtotal: number;
  taxTotal: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  taxType: "exclude" | "include";
  discountCalculation: "before_tax" | "after_tax";
  grandTotal: number;
  status: "draft" | "paid" | "unpaid";
  currency: "IDR" | "USD" | "EUR" | "SGD" | "MYR";
  signature?: string;           // base64 encoded image
}
```

### Storage Hooks

Located in `client/src/lib/storage.ts`:

- `useCompanyProfile()` - Manage company settings
- `useClients()` - CRUD operations for clients
- `useItems()` - CRUD operations for items
- `useInvoices()` - CRUD operations + invoice number generation

All hooks include:
- Zod schema validation on load
- Automatic persistence to localStorage
- Toast notifications on changes
- Cross-tab synchronization via storage events

---

## Routing

Uses **Wouter** for client-side routing:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Overview with stats and charts |
| `/invoices` | Invoices | List all invoices |
| `/invoices/new` | InvoiceBuilder | Create new invoice |
| `/invoices/:id` | InvoiceBuilder | Edit existing invoice |
| `/clients` | Clients | Manage clients |
| `/items` | Items | Manage products/services |
| `/settings` | Settings | Company profile configuration |

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- All components use `.tsx` extension
- Types imported from `@shared/schema` for data entities
- Use `type` keyword for type imports when possible

### Component Structure
- Functional components with hooks
- Props interfaces defined inline or extracted
- Use `forwardRef` for components that need ref forwarding

### Styling
- Tailwind CSS for all styling
- Use `cn()` utility for conditional class merging
- CSS variables for theming (defined in `index.css`)
- Dark mode support via `.dark` class

### shadcn/ui Pattern
Components follow shadcn/ui conventions:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva("base-classes", {
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ComponentProps extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof componentVariants> {
  asChild?: boolean
}
```

### Form Handling
- react-hook-form for form state
- Zod schemas for validation via `@hookform/resolvers`
- Form components from shadcn/ui (`Form`, `Input`, `Select`, etc.)

### Naming Conventions
- Components: PascalCase (e.g., `InvoiceBuilder.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useInvoices`)
- Utilities: camelCase (e.g., `formatCurrency`)
- Types/Interfaces: PascalCase (e.g., `CompanyProfile`)

---

## PDF Generation

Invoices are exported as PDF using:
1. **html2canvas** - Converts React component to canvas
2. **jsPDF** - Generates PDF from canvas

The `InvoicePDF` component (`client/src/components/shared/InvoicePDF.tsx`) renders the invoice in three templates:
- `modern` - Gradient header, clean design
- `corporate` - Traditional business style
- `minimal` - Simple, no-frills layout

Invoice paper size: A4 (210mm × 297mm)

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment mode | Yes |
| `DATABASE_URL` | PostgreSQL connection (unused) | For db:push only |

---

## Testing

**No automated tests are currently configured.** The project relies on:
- TypeScript type checking (`npm run check`)
- Manual testing during development
- Zod schema validation for data integrity

---

## Security Considerations

### Current State
- **No authentication** - This is a client-side only application
- **No sensitive data on server** - All data stays in browser localStorage
- **No HTTPS enforcement** - Relies on hosting environment

### Data Safety
- Data is stored in localStorage and can be cleared by browser
- No encryption of stored data
- Users should export/backup important invoices as PDFs

### Recommendations for Production
1. Add regular backup reminders for users
2. Consider adding data export/import functionality (JSON)
3. If adding backend persistence in future:
   - Implement proper authentication
   - Use HTTPS only
   - Validate all inputs server-side
   - Sanitize user inputs to prevent XSS

---

## Adding New Features

### Adding a New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Add navigation item in `AppShell.tsx` if needed

### Adding a New Data Entity
1. Define Zod schema in `shared/schema.ts`
2. Create TypeScript type via `z.infer`
3. Add localStorage key in `client/src/lib/storage.ts`
4. Create custom hook using `useLocalStorage` pattern

### Adding a New shadcn/ui Component
```bash
# Use shadcn CLI or manually add
# Components are stored in client/src/components/ui/
```

---

## Troubleshooting

### Common Issues

**Build fails:**
- Run `npm run check` to check TypeScript errors
- Ensure all imports use correct path aliases

**localStorage data not persisting:**
- Check browser storage quotas
- Verify no private/incognito mode
- Check for localStorage clearing on page unload

**PDF generation issues:**
- Large images in logos may cause canvas errors
- Ensure CORS for any external images

**Vite HMR not working:**
- Check `vite.config.ts` for proper plugin configuration
- Verify port 5000 is not in use

---

## Deployment

The application is designed to be deployed as a Node.js application:

1. Build: `npm run build`
2. Start: `npm run start`
3. Serves on port specified by `PORT` env var (default: 5000)

The server serves static files from `dist/public/` and handles client-side routing.

---

## Language Notes

The UI uses **Indonesian language** for user-facing text:
- "Beranda" = Dashboard
- "Tagihan" = Invoices
- "Klien" = Clients
- "Produk/Jasa" = Products/Services
- "Pengaturan" = Settings
- "Buat Tagihan" = Create Invoice

Code comments and documentation should remain in English.
