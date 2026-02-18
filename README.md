# InvoiceLite - Client Only

Aplikasi manajemen invoice berbasis client-side dengan React + TypeScript + Vite. Semua data disimpan di browser localStorage (tanpa backend/server).

## Fitur

- **Dashboard** - Statistik pendapatan dan chart
- **Invoice Builder** - Buat dan edit invoice dengan PDF export
- **Manajemen Klien** - CRUD data klien
- **Manajemen Produk/Jasa** - Katalog produk
- **Pengaturan** - Profil perusahaan, logo, pajak, diskon
- **Multi-currency** - IDR, USD, EUR, SGD, MYR
- **3 Template PDF** - Modern, Corporate, Minimal

## Teknologi

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Wouter (routing)
- Recharts (charts)
- html2canvas + jsPDF (PDF export)
- react-hook-form + Zod (forms & validation)

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## Data Storage

Semua data tersimpan di browser localStorage dengan prefix `invoicelite_`:
- `invoicelite_company` - Profil perusahaan
- `invoicelite_clients` - Data klien
- `invoicelite_items` - Data produk/jasa
- `invoicelite_invoices` - Data invoice

**Catatan:** Data akan hilang jika browser cache dihapus. Export invoice sebagai PDF untuk backup.

## Struktur Folder

```
client/
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── layout/       # AppShell (sidebar + navigation)
    │   ├── shared/       # InvoicePDF component
    │   └── ui/           # shadcn/ui components
    ├── hooks/            # Custom hooks (toast, mobile)
    ├── lib/
    │   ├── schema.ts     # Zod schemas & types
    │   ├── storage.ts    # localStorage hooks
    │   ├── queryClient.ts
    │   └── utils.ts
    └── pages/
        ├── Dashboard.tsx
        ├── Invoices.tsx
        ├── InvoiceBuilder.tsx
        ├── Clients.tsx
        ├── Items.tsx
        └── Settings.tsx
```
