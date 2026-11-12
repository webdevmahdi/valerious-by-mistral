# VALERIUS — Premium Fashion E-Commerce Platform

A premium men's fashion e-commerce and brand editorial platform for Bangladesh, built to the PRD and TRD: a React SPA storefront with an editorial design language, backed by a layered Node/Express API.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, TypeScript (strict), Redux Toolkit, React Router 6, Tailwind CSS v4, Zod |
| Backend | Node, Express 4, TypeScript (strict), Mongoose 8, Zod, JWT (access + refresh), helmet, express-rate-limit |
| Media | Cloudinary-ready integration (`src/integrations/cloudinary.ts`) |
| Payments | Provider abstraction: COD, bKash, Nagad, SSLCommerz (card) |

## Structure

```
valerius/
├── client/                 # React SPA (storefront + admin back office)
│   └── src/
│       ├── components/     # ui/ primitives, product/, layout/, cart/
│       ├── pages/          # 24 storefront pages + pages/admin (back office)
│       ├── services/api.ts # Mock REST layer — swap for the real API via VITE_API_BASE_URL
│       ├── store/          # Redux slices (cart, wishlist, recently viewed, auth, ui)
│       ├── lib/            # SEO/JSON-LD, analytics abstraction, formatting, reveal
│       └── data/           # Catalogue seed data (12 products, editorial, FAQs)
└── server/                 # Express API — Route → Middleware → Controller → Service → Repository → Model
    └── src/
        ├── models/         # User, Address, Product, Category, Collection, Cart, Order, Coupon, Review, Editorial, Wishlist
        ├── repositories/   # Data access layer
        ├── services/       # Business logic (server-authoritative pricing, stock, transitions)
        ├── validators/     # Zod schemas
        ├── integrations/   # payments/ (COD, bKash, Nagad, SSLCommerz), cloudinary, email
        ├── middleware/     # authenticate, authorize, validate, rate limiter, error handler
        └── routes/         # /api/v1 router
```

## Running

### Client

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
npm run build        # typecheck + production build
```

The client ships with a swappable mock API (`src/services/api.ts`) that mirrors the REST contract exactly — paginated responses, filter/sort semantics, coupon validation, order lifecycle — so it can be replaced with the live backend without touching components.

### Server

```bash
cd server
npm install
cp .env.example .env   # set MONGODB_URI and JWT secrets
npm run dev            # http://localhost:5000/api/v1
npm run typecheck
```

Requires a MongoDB instance. On boot the API seeds an administrator account (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`).

### Admin back office

Visit `/admin` in the client. Demo credentials (shown on the sign-in screen):

- **Email:** `admin@valerius.example`
- **Password:** `valerius-admin`

Includes dashboard metrics (revenue, AOV, units, returns), product price/stock/visibility management, order status transitions with tracking numbers, coupon activation, review moderation, and homepage hero content.

## Key conventions

- **Currency** is stored as integer minor units (BDT × 100) everywhere — client, server, and database. `formatPrice()` is the only display path.
- **Server-authoritative commerce**: order totals, discounts, and stock are computed server-side; client prices are never trusted.
- **Order lifecycle** follows a guarded state machine (`server/src/constants`) with timeline events; cancellation restores stock.
- **API responses** are standardized: `{ success, data, message? , pagination? }` or `{ success: false, error: { code, message, details? } }` under `/api/v1`.
- **SEO**: per-page meta + canonical via `useSeo`, JSON-LD for Organization, WebSite, Product (with aggregateRating), BreadcrumbList, Article, and FAQPage; `robots.txt` and `sitemap.xml` included.
- **Analytics**: centralized `analytics.track()` with console/GA4/Meta/TikTok providers behind env vars.
- **Design language**: warm bone/ink palette, Fraunces + Archivo typography, no gradients, no skeleton loaders, no emoji — deliberate editorial transitions only. Reduced-motion is fully respected.

## Demo data

The client's mock layer seeds five demo orders (varied statuses and payment methods) so the admin dashboard and order tracking are demonstrable immediately, plus three coupons: `VALERIUS10`, `WELCOME200`, `MONSOON15`.
